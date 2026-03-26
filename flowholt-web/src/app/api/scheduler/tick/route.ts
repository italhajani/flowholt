import { NextRequest, NextResponse } from "next/server";

import { executeWorkflowRun } from "@/lib/flowholt/workflow-runner";
import type { WorkflowRecord } from "@/lib/flowholt/types";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BATCH = 25;
const LOCK_MINUTES = 5;

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

function toIntervalMinutes(value: unknown, fallback = 60) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const intValue = Math.floor(parsed);
  return Math.min(10080, Math.max(1, intValue));
}

function nextRunAtFrom(base: Date, intervalMinutes: number) {
  return new Date(base.getTime() + intervalMinutes * 60_000).toISOString();
}

export async function POST(request: NextRequest) {
  const secret = schedulerSecret();
  if (!secret) {
    return NextResponse.json({ error: "FLOWHOLT_SCHEDULER_KEY is not configured." }, { status: 500 });
  }

  const providedKey = readSchedulerKey(request);
  if (!providedKey || providedKey !== secret) {
    return NextResponse.json({ error: "Unauthorized scheduler request." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const lockUntilIso = new Date(now.getTime() + LOCK_MINUTES * 60_000).toISOString();

  const { data: dueRows, error: dueError } = await supabase
    .from("workflow_schedules")
    .select(
      "id, workflow_id, workspace_id, label, status, interval_minutes, next_run_at, run_count, lock_until",
    )
    .eq("status", "active")
    .lte("next_run_at", nowIso)
    .order("next_run_at", { ascending: true })
    .limit(MAX_BATCH);

  if (dueError) {
    return NextResponse.json({ error: dueError.message }, { status: 500 });
  }

  const candidates = (dueRows ?? []).filter((row) => {
    if (!row.lock_until) {
      return true;
    }
    return new Date(row.lock_until).getTime() <= now.getTime();
  });

  if (!candidates.length) {
    return NextResponse.json({ ok: true, processed: 0, message: "No due schedules." });
  }

  const claimed: Array<{
    id: string;
    workflow_id: string;
    workspace_id: string;
    label: string;
    interval_minutes: number;
    next_run_at: string;
    run_count: number;
  }> = [];

  for (const schedule of candidates) {
    const intervalMinutes = toIntervalMinutes(schedule.interval_minutes, 60);
    const claimedNextRunAt = nextRunAtFrom(now, intervalMinutes);

    const { data: claimRow, error: claimError } = await supabase
      .from("workflow_schedules")
      .update({
        next_run_at: claimedNextRunAt,
        lock_until: lockUntilIso,
      })
      .eq("id", schedule.id)
      .eq("status", "active")
      .eq("next_run_at", schedule.next_run_at)
      .select(
        "id, workflow_id, workspace_id, label, interval_minutes, next_run_at, run_count",
      )
      .maybeSingle();

    if (claimError || !claimRow) {
      continue;
    }

    claimed.push({
      id: claimRow.id,
      workflow_id: claimRow.workflow_id,
      workspace_id: claimRow.workspace_id,
      label: claimRow.label,
      interval_minutes: claimRow.interval_minutes,
      next_run_at: claimRow.next_run_at,
      run_count: claimRow.run_count ?? 0,
    });
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
    run_id?: string;
    status: "succeeded" | "failed" | "skipped";
    error?: string;
  }> = [];

  for (const schedule of claimed) {
    const workflow = workflowsById.get(schedule.workflow_id);

    if (!workflow || workflow.status === "archived") {
      await supabase
        .from("workflow_schedules")
        .update({
          lock_until: null,
          last_run_status: "failed",
          last_error: workflow ? "Workflow is archived." : "Workflow not found.",
        })
        .eq("id", schedule.id);

      results.push({
        schedule_id: schedule.id,
        workflow_id: schedule.workflow_id,
        status: "skipped",
        error: workflow ? "Workflow is archived." : "Workflow not found.",
      });
      continue;
    }

    try {
      const execution = await executeWorkflowRun({
        supabase,
        workflow,
        triggerSource: "schedule",
        triggerMeta: {
          schedule_id: schedule.id,
          schedule_label: schedule.label,
          interval_minutes: schedule.interval_minutes,
          triggered_at: nowIso,
        },
      });

      const runStatus = execution.result.status;
      const runError =
        runStatus === "succeeded"
          ? ""
          : execution.runErrorMessage || "Scheduled run failed in engine.";

      await supabase
        .from("workflow_schedules")
        .update({
          lock_until: null,
          last_run_at: new Date().toISOString(),
          last_run_status: runStatus,
          last_error: runError,
          run_count: (schedule.run_count ?? 0) + 1,
        })
        .eq("id", schedule.id);

      results.push({
        schedule_id: schedule.id,
        workflow_id: workflow.id,
        run_id: execution.runId,
        status: runStatus,
        error: runError || undefined,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Scheduled run failed.";

      await supabase
        .from("workflow_schedules")
        .update({
          lock_until: null,
          last_run_at: new Date().toISOString(),
          last_run_status: "failed",
          last_error: errorMessage,
          run_count: (schedule.run_count ?? 0) + 1,
        })
        .eq("id", schedule.id);

      results.push({
        schedule_id: schedule.id,
        workflow_id: workflow.id,
        status: "failed",
        error: errorMessage,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
  });
}
