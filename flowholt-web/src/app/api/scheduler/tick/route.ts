import { NextRequest, NextResponse } from "next/server";

import { createCorrelationId } from "@/lib/flowholt/correlation";
import { enqueueWorkflowRunJob } from "@/lib/flowholt/run-queue";
import { consumeRateLimit, getRequestIdentifier, isRateLimitError } from "@/lib/flowholt/rate-limit";
import { compareSecretsConstantTime, validateProtectedEndpointSecret } from "@/lib/flowholt/security";
import {
  buildScheduleClaimPlan,
  buildScheduleCompletionUpdate,
  buildScheduleLeaseRenewal,
  isScheduleClaimable,
  shouldInspectScheduleNow,
  shouldRenewScheduleLease,
  toIntervalMinutes,
} from "@/lib/flowholt/scheduler-logic";
import type { WorkflowRecord } from "@/lib/flowholt/types";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BATCH = 25;
const LOCK_MINUTES = 5;
const LEASE_RENEW_WINDOW_SECONDS = 60;
const SCHEDULER_RATE_LIMIT = {
  maxRequests: 60,
  windowSeconds: 60,
};

type ScheduleRow = {
  id: string;
  workflow_id: string;
  workspace_id: string;
  label: string;
  status: "active" | "paused" | "disabled";
  interval_minutes: number;
  pattern: Record<string, unknown>;
  next_run_at: string;
  claim_due_at: string | null;
  run_count: number;
  lock_until: string | null;
  lock_token: string | null;
};

function schedulerSecret() {
  return process.env.FLOWHOLT_SCHEDULER_KEY ?? "";
}

function readSchedulerKey(request: NextRequest) {
  return (
    request.headers.get("x-flowholt-scheduler-key") ??
    request.nextUrl.searchParams.get("key") ??
    ""
  ).trim();
}

function scheduleFields() {
  return [
    "id",
    "workflow_id",
    "workspace_id",
    "label",
    "status",
    "interval_minutes",
    "pattern",
    "next_run_at",
    "claim_due_at",
    "run_count",
    "lock_until",
    "lock_token",
  ].join(", ");
}

async function loadScheduleCandidates(
  supabase: ReturnType<typeof createAdminClient>,
  nowIso: string,
) {
  const fields = scheduleFields();
  const [dueResult, staleResult] = await Promise.all([
    supabase
      .from("workflow_schedules")
      .select(fields)
      .eq("status", "active")
      .lte("next_run_at", nowIso)
      .order("next_run_at", { ascending: true })
      .limit(MAX_BATCH),
    supabase
      .from("workflow_schedules")
      .select(fields)
      .eq("status", "active")
      .not("claim_due_at", "is", null)
      .lte("lock_until", nowIso)
      .order("lock_until", { ascending: true })
      .limit(MAX_BATCH),
  ]);

  return {
    dueRows: ((dueResult.data ?? []) as unknown as ScheduleRow[]),
    staleRows: ((staleResult.data ?? []) as unknown as ScheduleRow[]),
    error: dueResult.error?.message || staleResult.error?.message || "",
  };
}

async function renewScheduleLease(
  supabase: ReturnType<typeof createAdminClient>,
  schedule: ScheduleRow,
  now: Date,
) {
  const renewal = buildScheduleLeaseRenewal({
    now,
    lockMinutes: LOCK_MINUTES,
  });

  let query = supabase
    .from("workflow_schedules")
    .update(renewal.update)
    .eq("id", schedule.id)
    .eq("status", "active")
    .eq("lock_token", schedule.lock_token ?? "")
    .eq("next_run_at", schedule.next_run_at);

  if (schedule.lock_until) {
    query = query.eq("lock_until", schedule.lock_until);
  } else {
    query = query.is("lock_until", null);
  }

  const { data, error } = await query
    .select("lock_until")
    .maybeSingle();

  if (error || !data?.lock_until) {
    return { ok: false, lockUntil: schedule.lock_until };
  }

  return {
    ok: true,
    lockUntil: String(data.lock_until),
  };
}

export async function POST(request: NextRequest) {
  const configuredSecret = validateProtectedEndpointSecret(schedulerSecret(), "FLOWHOLT_SCHEDULER_KEY");
  if (!configuredSecret.ok) {
    return NextResponse.json({ error: configuredSecret.message }, { status: 500 });
  }

  const providedKey = readSchedulerKey(request);
  if (!compareSecretsConstantTime(providedKey, configuredSecret.value)) {
    return NextResponse.json({ error: "Unauthorized scheduler request." }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    await consumeRateLimit({
      supabase,
      scope: "scheduler.tick",
      identifier: getRequestIdentifier(request),
      maxRequests: SCHEDULER_RATE_LIMIT.maxRequests,
      windowSeconds: SCHEDULER_RATE_LIMIT.windowSeconds,
    });
  } catch (error) {
    if (isRateLimitError(error)) {
      return NextResponse.json(
        { error: error.message, retry_after_seconds: error.retryAfterSeconds },
        {
          status: 429,
          headers: {
            "Retry-After": String(error.retryAfterSeconds),
          },
        },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scheduler limit check failed." },
      { status: 500 },
    );
  }

  const now = new Date();
  const nowIso = now.toISOString();

  const candidateResult = await loadScheduleCandidates(supabase, nowIso);
  if (candidateResult.error) {
    return NextResponse.json({ error: candidateResult.error }, { status: 500 });
  }

  const candidateMap = new Map<string, ScheduleRow>();
  for (const row of [...candidateResult.dueRows, ...candidateResult.staleRows]) {
    candidateMap.set(row.id, row);
  }

  const candidates = Array.from(candidateMap.values())
    .filter((row) =>
      shouldInspectScheduleNow({
        nextRunAt: row.next_run_at,
        claimDueAt: row.claim_due_at,
        lockUntil: row.lock_until,
        now,
      }),
    )
    .slice(0, MAX_BATCH)
    .filter((row) => isScheduleClaimable(row.lock_until, now));

  if (!candidates.length) {
    return NextResponse.json({ ok: true, processed: 0, message: "No due schedules." });
  }

  const claimed: ScheduleRow[] = [];

  for (const schedule of candidates) {
    const claimPlan = buildScheduleClaimPlan({
      currentNextRunAt: schedule.next_run_at,
      currentClaimDueAt: schedule.claim_due_at,
      intervalMinutes: toIntervalMinutes(schedule.interval_minutes, 60),
      pattern: schedule.pattern ?? {},
      now,
      lockMinutes: LOCK_MINUTES,
    });

    let query = supabase
      .from("workflow_schedules")
      .update(claimPlan.update)
      .eq("id", schedule.id)
      .eq("status", "active")
      .eq("next_run_at", schedule.next_run_at);

    if (schedule.claim_due_at) {
      query = query.eq("claim_due_at", schedule.claim_due_at);
    } else {
      query = query.is("claim_due_at", null);
    }

    if (schedule.lock_until) {
      query = query.eq("lock_until", schedule.lock_until);
    } else {
      query = query.is("lock_until", null);
    }

    const { data: claimRow, error: claimError } = await query
      .select(scheduleFields())
      .maybeSingle();

    if (claimError || !claimRow) {
      continue;
    }

    claimed.push(claimRow as unknown as ScheduleRow);
  }

  if (!claimed.length) {
    return NextResponse.json({ ok: true, processed: 0, message: "No schedules claimed." });
  }

  const workflowIds = [...new Set(claimed.map((item) => item.workflow_id))];
  const { data: workflowRows, error: workflowError } = await supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .in("id", workflowIds);

  if (workflowError) {
    return NextResponse.json({ error: workflowError.message }, { status: 500 });
  }

  const workflowsById = new Map<string, WorkflowRecord>(
    ((workflowRows ?? []) as WorkflowRecord[]).map((workflow) => [workflow.id, workflow]),
  );

  const results: Array<{
    schedule_id: string;
    workflow_id: string;
    job_id?: string;
    request_correlation_id?: string;
    status: "failed" | "skipped" | "queued";
    error?: string;
    recovered_stale_claim?: boolean;
  }> = [];

  for (const schedule of claimed) {
    const workflow = workflowsById.get(schedule.workflow_id);
    const requestCorrelationId = createCorrelationId("fh_sched");
    const recoveredStaleClaim = Boolean(schedule.claim_due_at && schedule.claim_due_at !== schedule.next_run_at);
    const iterationNow = new Date();

    if (shouldRenewScheduleLease(schedule.lock_until, iterationNow, LEASE_RENEW_WINDOW_SECONDS)) {
      const renewed = await renewScheduleLease(supabase, schedule, iterationNow);
      if (!renewed.ok) {
        results.push({
          schedule_id: schedule.id,
          workflow_id: schedule.workflow_id,
          request_correlation_id: requestCorrelationId,
          status: "failed",
          error: "Schedule lease could not be renewed before processing.",
          recovered_stale_claim: recoveredStaleClaim,
        });
        continue;
      }

      schedule.lock_until = renewed.lockUntil;
    }

    if (!workflow || workflow.status === "archived") {
      await supabase
        .from("workflow_schedules")
        .update(
          buildScheduleCompletionUpdate({
            result: "skipped",
            runCount: schedule.run_count ?? 0,
            finishedAt: new Date(),
            errorMessage: workflow ? "Workflow is archived." : "Workflow not found.",
          }),
        )
        .eq("id", schedule.id)
        .eq("lock_token", schedule.lock_token ?? "");

      results.push({
        schedule_id: schedule.id,
        workflow_id: schedule.workflow_id,
        request_correlation_id: requestCorrelationId,
        status: "skipped",
        error: workflow ? "Workflow is archived." : "Workflow not found.",
        recovered_stale_claim: recoveredStaleClaim,
      });
      continue;
    }

    try {
      const job = await enqueueWorkflowRunJob({
        supabase,
        workflow,
        triggerSource: "schedule",
        triggerMeta: {
          schedule_id: schedule.id,
          schedule_label: schedule.label,
          interval_minutes: schedule.interval_minutes,
          schedule_pattern: schedule.pattern ?? {},
          triggered_at: nowIso,
          scheduled_for: schedule.claim_due_at ?? schedule.next_run_at,
          recovered_stale_claim: recoveredStaleClaim,
          request_correlation_id: requestCorrelationId,
        },
        createdByUserId: workflow.created_by_user_id,
      });

      await supabase
        .from("workflow_schedules")
        .update(
          buildScheduleCompletionUpdate({
            result: "queued",
            runCount: schedule.run_count ?? 0,
            finishedAt: new Date(),
            queuedJobId: job.id,
          }),
        )
        .eq("id", schedule.id)
        .eq("workflow_id", workflow.id)
        .eq("lock_token", schedule.lock_token ?? "");

      results.push({
        schedule_id: schedule.id,
        workflow_id: workflow.id,
        job_id: job.id,
        request_correlation_id: job.request_correlation_id ?? requestCorrelationId,
        status: "queued",
        recovered_stale_claim: recoveredStaleClaim,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Scheduled run failed.";

      await supabase
        .from("workflow_schedules")
        .update(
          buildScheduleCompletionUpdate({
            result: "failed",
            runCount: schedule.run_count ?? 0,
            finishedAt: new Date(),
            errorMessage,
          }),
        )
        .eq("id", schedule.id)
        .eq("lock_token", schedule.lock_token ?? "");

      results.push({
        schedule_id: schedule.id,
        workflow_id: schedule.workflow_id,
        request_correlation_id: requestCorrelationId,
        status: "failed",
        error: errorMessage,
        recovered_stale_claim: recoveredStaleClaim,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
  });
}

