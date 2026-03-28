import type { SupabaseClient } from "@supabase/supabase-js";

import { drainWorkflowRunJobs, enqueueWorkflowRunJob } from "@/lib/flowholt/run-queue";
import type { WorkflowRecord, WorkflowRunJobRecord } from "@/lib/flowholt/types";

type CancelRunResult =
  | {
      ok: true;
      run_id: string;
      status: "cancelled";
      previous_status: "queued" | "running";
    }
  | {
      ok: false;
      reason: "not_found" | "already_finished" | "update_failed";
      run_id: string;
      status?: string;
      message: string;
    };

type RetryWorkflowRunResult =
  | {
      ok: true;
      original_run_id: string;
      workflow_id: string;
      job_id: string;
      status: "queued" | "succeeded" | "failed" | "cancelled" | "skipped";
      new_run_id?: string;
      message: string;
    }
  | {
      ok: false;
      original_run_id: string;
      workflow_id?: string;
      reason: "not_found" | "not_retryable" | "workflow_not_found" | "context_missing" | "enqueue_failed";
      message: string;
    };

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asJobRow(value: unknown): WorkflowRunJobRecord | null {
  return value && typeof value === "object" ? (value as WorkflowRunJobRecord) : null;
}

async function loadWorkflowRecord(supabase: SupabaseClient, workflowId: string) {
  const { data, error } = await supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .eq("id", workflowId)
    .maybeSingle();

  return error || !data ? null : (data as WorkflowRecord);
}

async function loadLatestRunJob(supabase: SupabaseClient, runId: string) {
  const { data } = await supabase
    .from("workflow_run_jobs")
    .select(
      "id, workflow_id, workspace_id, created_by_user_id, status, trigger_source, trigger_payload, trigger_meta, attempt_count, max_attempts, available_at, claimed_at, finished_at, lock_until, run_id, request_correlation_id, error_message, last_error_class, created_at, updated_at",
    )
    .eq("run_id", runId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return asJobRow(data);
}

export async function cancelWorkflowRun(
  supabase: SupabaseClient,
  input: {
    runId: string;
    reason?: string;
  },
): Promise<CancelRunResult> {
  const runId = input.runId.trim();
  const cancelReason = input.reason?.trim() || "Run cancelled by user.";

  if (!runId) {
    return {
      ok: false,
      reason: "not_found",
      run_id: "",
      message: "Missing run id.",
    };
  }

  const { data: runRow, error: runError } = await supabase
    .from("workflow_runs")
    .select("id, workflow_id, workspace_id, status")
    .eq("id", runId)
    .maybeSingle();

  if (runError || !runRow) {
    return {
      ok: false,
      reason: "not_found",
      run_id: runId,
      message: "Run not found.",
    };
  }

  const status = String(runRow.status);
  if (!["queued", "running"].includes(status)) {
    return {
      ok: false,
      reason: "already_finished",
      run_id: runId,
      status,
      message: `Run is already ${status}.`,
    };
  }

  const { data: updatedRow, error: updateError } = await supabase
    .from("workflow_runs")
    .update({
      status: "cancelled",
      error_message: cancelReason,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId)
    .in("status", ["queued", "running"])
    .select("id")
    .maybeSingle();

  if (updateError || !updatedRow) {
    return {
      ok: false,
      reason: "update_failed",
      run_id: runId,
      message: updateError?.message ?? "Unable to cancel run.",
    };
  }

  await supabase.from("run_logs").insert({
    run_id: runId,
    workflow_id: runRow.workflow_id,
    workspace_id: runRow.workspace_id,
    node_id: null,
    level: "warn",
    message: "Run cancelled by user request.",
    payload: {
      reason: cancelReason,
      previous_status: status,
    },
  });

  return {
    ok: true,
    run_id: runId,
    status: "cancelled",
    previous_status: status as "queued" | "running",
  };
}

export async function retryWorkflowRun(
  supabase: SupabaseClient,
  input: {
    runId: string;
    requestedByUserId?: string | null;
    reason?: string;
  },
): Promise<RetryWorkflowRunResult> {
  const runId = input.runId.trim();

  if (!runId) {
    return {
      ok: false,
      original_run_id: "",
      reason: "not_found",
      message: "Missing run id.",
    };
  }

  const { data: runRow, error: runError } = await supabase
    .from("workflow_runs")
    .select("id, workflow_id, workspace_id, status, trigger_source")
    .eq("id", runId)
    .maybeSingle();

  if (runError || !runRow) {
    return {
      ok: false,
      original_run_id: runId,
      reason: "not_found",
      message: "Run not found.",
    };
  }

  const status = String(runRow.status);
  if (["queued", "running"].includes(status)) {
    return {
      ok: false,
      original_run_id: runId,
      workflow_id: String(runRow.workflow_id),
      reason: "not_retryable",
      message: `Run is currently ${status}. Wait for it to finish before retrying.`,
    };
  }

  const workflow = await loadWorkflowRecord(supabase, String(runRow.workflow_id));
  if (!workflow) {
    return {
      ok: false,
      original_run_id: runId,
      workflow_id: String(runRow.workflow_id),
      reason: "workflow_not_found",
      message: "Workflow not found for this run.",
    };
  }

  const latestJob = await loadLatestRunJob(supabase, runId);
  const originalTriggerSource = latestJob?.trigger_source?.trim() || String(runRow.trigger_source || "manual").trim() || "manual";

  if (!latestJob && originalTriggerSource !== "manual") {
    return {
      ok: false,
      original_run_id: runId,
      workflow_id: workflow.id,
      reason: "context_missing",
      message: "Original trigger payload is no longer available for this run.",
    };
  }

  const retryMeta = {
    ...asRecord(latestJob?.trigger_meta),
    retry_of_run_id: runId,
    retry_reason: input.reason?.trim() || "Retry requested from the runs UI.",
    retried_at: new Date().toISOString(),
    retried_from_status: status,
    initiated_by: "runs",
    queued_from: "run_retry",
  };

  try {
    const job = await enqueueWorkflowRunJob({
      supabase,
      workflow,
      triggerSource: originalTriggerSource,
      triggerPayload: latestJob?.trigger_payload,
      triggerMeta: retryMeta,
      createdByUserId: input.requestedByUserId ?? latestJob?.created_by_user_id ?? workflow.created_by_user_id,
    });

    const [result] = await drainWorkflowRunJobs({
      supabase,
      limit: 1,
      jobIds: [job.id],
    });

    if (result?.runId) {
      return {
        ok: true,
        original_run_id: runId,
        workflow_id: workflow.id,
        job_id: job.id,
        status: result.status,
        new_run_id: result.runId,
        message: status === "succeeded" ? "Run started again." : "Run retried successfully.",
      };
    }

    if (result?.error) {
      return {
        ok: false,
        original_run_id: runId,
        workflow_id: workflow.id,
        reason: "enqueue_failed",
        message: result.error,
      };
    }

    return {
      ok: true,
      original_run_id: runId,
      workflow_id: workflow.id,
      job_id: job.id,
      status: result?.status ?? "queued",
      message: "Run queued successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      original_run_id: runId,
      workflow_id: workflow.id,
      reason: "enqueue_failed",
      message: error instanceof Error ? error.message : "Unable to retry this run.",
    };
  }
}

