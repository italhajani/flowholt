import type { SupabaseClient } from "@supabase/supabase-js";

import { readCorrelationId } from "@/lib/flowholt/correlation";
import {
  executeWorkflowRun,
  WorkflowExecutionError,
} from "@/lib/flowholt/workflow-runner";
import { assertWorkspaceCanEnqueueRun } from "@/lib/flowholt/usage-limits";
import type { WorkflowRecord, WorkflowRunJobRecord } from "@/lib/flowholt/types";

type RunJobRow = WorkflowRunJobRecord;

export type EnqueueWorkflowRunJobInput = {
  supabase: SupabaseClient;
  workflow: WorkflowRecord;
  triggerSource: string;
  triggerPayload?: unknown;
  triggerMeta?: Record<string, unknown>;
  createdByUserId?: string | null;
  maxAttempts?: number;
  availableAt?: string;
};

export type DrainWorkflowRunJobsInput = {
  supabase: SupabaseClient;
  limit?: number;
  jobIds?: string[];
};

export type DrainWorkflowRunJobResult = {
  jobId: string;
  status: "succeeded" | "failed" | "queued" | "cancelled" | "skipped";
  runId?: string;
  error?: string;
  attemptCount: number;
  nextAvailableAt?: string;
  requestCorrelationId: string;
};

const JOB_FIELDS =
  "id, workflow_id, workspace_id, created_by_user_id, status, trigger_source, trigger_payload, trigger_meta, attempt_count, max_attempts, available_at, claimed_at, finished_at, lock_until, run_id, request_correlation_id, error_message, last_error_class, created_at, updated_at";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function resolveRequestCorrelationId(value: unknown) {
  return readCorrelationId(value, "fh_job");
}

function readErrorClass(error: unknown) {
  if (error instanceof Error && error.name) {
    return error.name;
  }
  return "Error";
}

function readErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return "Workflow job failed.";
}

function retryDelaySeconds(attemptCount: number) {
  return Math.min(300, Math.max(10, attemptCount * 15));
}

function nextAvailableAt(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function lockUntil(minutes = 5) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function readScheduleId(job: WorkflowRunJobRecord) {
  const triggerMeta = asRecord(job.trigger_meta);
  const value = triggerMeta.schedule_id;
  return typeof value === "string" ? value.trim() : "";
}

async function updateScheduledRunStatus(
  supabase: SupabaseClient,
  job: WorkflowRunJobRecord,
  values: {
    last_run_status?: "succeeded" | "failed" | null;
    last_error?: string;
  },
) {
  const scheduleId = readScheduleId(job);
  if (!scheduleId) {
    return;
  }

  await supabase
    .from("workflow_schedules")
    .update({
      last_run_status:
        values.last_run_status === undefined ? null : values.last_run_status,
      last_error: values.last_error ?? "",
    })
    .eq("id", scheduleId)
    .eq("workflow_id", job.workflow_id);
}

function shouldRetryJob(errorMessage: string) {
  const normalized = errorMessage.toLowerCase();
  const nonRetryablePhrases = [
    "workflow graph is invalid",
    "workflow not found",
    "workflow is archived",
    "missing or inactive integration connection",
    "connection provider mismatch",
    "unauthorized",
    "missing workflow id",
  ];

  return !nonRetryablePhrases.some((phrase) => normalized.includes(phrase));
}

async function loadWorkflowForJob(
  supabase: SupabaseClient,
  workflowId: string,
): Promise<WorkflowRecord | null> {
  const { data, error } = await supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .eq("id", workflowId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as WorkflowRecord;
}

export async function enqueueWorkflowRunJob({
  supabase,
  workflow,
  triggerSource,
  triggerPayload,
  triggerMeta,
  createdByUserId,
  maxAttempts = 3,
  availableAt,
}: EnqueueWorkflowRunJobInput): Promise<WorkflowRunJobRecord> {
  await assertWorkspaceCanEnqueueRun(supabase, workflow.workspace_id);

  const requestCorrelationId = resolveRequestCorrelationId(triggerMeta?.request_correlation_id);
  const resolvedTriggerMeta = {
    ...(triggerMeta ?? {}),
    request_correlation_id: requestCorrelationId,
  };

  const insertPayload: Record<string, unknown> = {
    workflow_id: workflow.id,
    workspace_id: workflow.workspace_id,
    created_by_user_id: createdByUserId ?? null,
    status: "queued",
    trigger_source: triggerSource,
    trigger_meta: resolvedTriggerMeta,
    request_correlation_id: requestCorrelationId,
    max_attempts: Math.max(1, maxAttempts),
    available_at: availableAt ?? new Date().toISOString(),
  };

  if (triggerPayload !== undefined && triggerPayload !== null) {
    insertPayload.trigger_payload = triggerPayload;
  }

  const { data, error } = await supabase
    .from("workflow_run_jobs")
    .insert(insertPayload)
    .select(JOB_FIELDS)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to enqueue workflow run job.");
  }

  return {
    ...(data as RunJobRow),
    trigger_meta: asRecord(data.trigger_meta),
  };
}

async function claimWorkflowRunJobs({
  supabase,
  limit = 5,
  jobIds,
}: DrainWorkflowRunJobsInput): Promise<WorkflowRunJobRecord[]> {
  const nowIso = new Date().toISOString();

  let query = supabase
    .from("workflow_run_jobs")
    .select(JOB_FIELDS)
    .eq("status", "queued")
    .lte("available_at", nowIso)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (jobIds?.length) {
    query = query.in("id", jobIds);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const candidates = ((data ?? []) as RunJobRow[]).filter((job) => {
    if (!job.lock_until) {
      return true;
    }
    return new Date(job.lock_until).getTime() <= Date.now();
  });

  const claimed: WorkflowRunJobRecord[] = [];

  for (const candidate of candidates) {
    const { data: claimRow, error: claimError } = await supabase
      .from("workflow_run_jobs")
      .update({
        status: "processing",
        attempt_count: (candidate.attempt_count ?? 0) + 1,
        claimed_at: nowIso,
        lock_until: lockUntil(),
        finished_at: null,
      })
      .eq("id", candidate.id)
      .eq("status", "queued")
      .select(JOB_FIELDS)
      .maybeSingle();

    if (claimError || !claimRow) {
      continue;
    }

    claimed.push({
      ...(claimRow as RunJobRow),
      trigger_meta: asRecord(claimRow.trigger_meta),
    });
  }

  return claimed;
}

async function processClaimedWorkflowRunJob(
  supabase: SupabaseClient,
  job: WorkflowRunJobRecord,
): Promise<DrainWorkflowRunJobResult> {
  const requestCorrelationId = resolveRequestCorrelationId(
    job.request_correlation_id ?? asRecord(job.trigger_meta).request_correlation_id,
  );
  const workflow = await loadWorkflowForJob(supabase, job.workflow_id);

  if (!workflow) {
    await supabase
      .from("workflow_run_jobs")
      .update({
        status: "failed",
        error_message: "Workflow not found.",
        last_error_class: "NotFoundError",
        finished_at: new Date().toISOString(),
        lock_until: null,
      })
      .eq("id", job.id);

    await updateScheduledRunStatus(supabase, job, {
      last_run_status: "failed",
      last_error: "Workflow not found.",
    });

    return {
      jobId: job.id,
      status: "failed",
      error: "Workflow not found.",
      attemptCount: job.attempt_count,
      requestCorrelationId,
    };
  }

  if (workflow.status === "archived") {
    await supabase
      .from("workflow_run_jobs")
      .update({
        status: "cancelled",
        error_message: "Workflow is archived.",
        last_error_class: "ArchivedWorkflowError",
        finished_at: new Date().toISOString(),
        lock_until: null,
      })
      .eq("id", job.id);

    await updateScheduledRunStatus(supabase, job, {
      last_run_status: "failed",
      last_error: "Workflow is archived.",
    });

    return {
      jobId: job.id,
      status: "cancelled",
      error: "Workflow is archived.",
      attemptCount: job.attempt_count,
      requestCorrelationId,
    };
  }

  try {
    const execution = await executeWorkflowRun({
      supabase,
      workflow,
      triggerSource: job.trigger_source,
      triggerPayload: job.trigger_payload,
      triggerMeta: asRecord(job.trigger_meta),
    });

    const finalStatus = execution.result.status === "succeeded" ? "succeeded" : "failed";
    const finalError = execution.runErrorMessage || "";

    await supabase
      .from("workflow_run_jobs")
      .update({
        status: finalStatus,
        run_id: execution.runId,
        request_correlation_id: execution.requestCorrelationId,
        error_message: finalError,
        last_error_class: "",
        finished_at: new Date().toISOString(),
        lock_until: null,
      })
      .eq("id", job.id);

    await updateScheduledRunStatus(supabase, job, {
      last_run_status: finalStatus === "succeeded" ? "succeeded" : "failed",
      last_error: finalError,
    });

    return {
      jobId: job.id,
      status: finalStatus,
      runId: execution.runId,
      error: finalError || undefined,
      attemptCount: job.attempt_count,
      requestCorrelationId: execution.requestCorrelationId,
    };
  } catch (error) {
    const errorMessage = readErrorMessage(error);
    const errorClass = readErrorClass(error);
    const runId = error instanceof WorkflowExecutionError ? error.runId : undefined;
    const retryable = shouldRetryJob(errorMessage) && job.attempt_count < job.max_attempts;

    if (retryable) {
      const availableAt = nextAvailableAt(retryDelaySeconds(job.attempt_count));
      await supabase
        .from("workflow_run_jobs")
        .update({
          status: "queued",
          run_id: runId ?? null,
          request_correlation_id: requestCorrelationId,
          error_message: errorMessage,
          last_error_class: errorClass,
          available_at: availableAt,
          lock_until: null,
        })
        .eq("id", job.id);

      await updateScheduledRunStatus(supabase, job, {
        last_run_status: null,
        last_error: `Queued for retry: ${errorMessage}`,
      });

      return {
        jobId: job.id,
        status: "queued",
        runId,
        error: errorMessage,
        attemptCount: job.attempt_count,
        nextAvailableAt: availableAt,
        requestCorrelationId,
      };
    }

    await supabase
      .from("workflow_run_jobs")
      .update({
        status: "failed",
        run_id: runId ?? null,
        request_correlation_id: requestCorrelationId,
        error_message: errorMessage,
        last_error_class: errorClass,
        finished_at: new Date().toISOString(),
        lock_until: null,
      })
      .eq("id", job.id);

    await updateScheduledRunStatus(supabase, job, {
      last_run_status: "failed",
      last_error: errorMessage,
    });

    return {
      jobId: job.id,
      status: "failed",
      runId,
      error: errorMessage,
      attemptCount: job.attempt_count,
      requestCorrelationId,
    };
  }
}

export async function drainWorkflowRunJobs({
  supabase,
  limit = 5,
  jobIds,
}: DrainWorkflowRunJobsInput): Promise<DrainWorkflowRunJobResult[]> {
  const claimed = await claimWorkflowRunJobs({
    supabase,
    limit,
    jobIds,
  });

  const results: DrainWorkflowRunJobResult[] = [];
  for (const job of claimed) {
    results.push(await processClaimedWorkflowRunJob(supabase, job));
  }

  return results;
}
