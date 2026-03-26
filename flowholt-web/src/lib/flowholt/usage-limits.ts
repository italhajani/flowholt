import type { SupabaseClient } from "@supabase/supabase-js";

import type { UsageCounter, WorkspaceUsageLimitRecord, WorkspaceUsageStatus } from "@/lib/flowholt/types";

const DEFAULT_LIMITS: WorkspaceUsageLimitRecord = {
  workspace_id: "",
  plan_name: "starter",
  monthly_run_limit: 300,
  monthly_token_limit: 500000,
  active_workflow_limit: 25,
  member_limit: 10,
  schedule_limit: 25,
  warning_threshold_percent: 80,
  enforce_hard_limits: true,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

export class WorkspaceUsageLimitError extends Error {
  code: "run_limit" | "token_limit" | "workflow_limit" | "member_limit" | "schedule_limit";

  constructor(code: WorkspaceUsageLimitError["code"], message: string) {
    super(message);
    this.name = "WorkspaceUsageLimitError";
    this.code = code;
  }
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function periodLabel() {
  return startOfCurrentMonth().toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toLimitRecord(value: unknown, workspaceId: string): WorkspaceUsageLimitRecord {
  const row = asRecord(value);
  return {
    workspace_id: typeof row.workspace_id === "string" ? row.workspace_id : workspaceId,
    plan_name: typeof row.plan_name === "string" && row.plan_name.trim() ? row.plan_name.trim() : DEFAULT_LIMITS.plan_name,
    monthly_run_limit: Number(row.monthly_run_limit) > 0 ? Number(row.monthly_run_limit) : DEFAULT_LIMITS.monthly_run_limit,
    monthly_token_limit: Number(row.monthly_token_limit) > 0 ? Number(row.monthly_token_limit) : DEFAULT_LIMITS.monthly_token_limit,
    active_workflow_limit: Number(row.active_workflow_limit) > 0 ? Number(row.active_workflow_limit) : DEFAULT_LIMITS.active_workflow_limit,
    member_limit: Number(row.member_limit) > 0 ? Number(row.member_limit) : DEFAULT_LIMITS.member_limit,
    schedule_limit: Number(row.schedule_limit) > 0 ? Number(row.schedule_limit) : DEFAULT_LIMITS.schedule_limit,
    warning_threshold_percent:
      Number(row.warning_threshold_percent) > 0
        ? Math.min(100, Math.max(1, Number(row.warning_threshold_percent)))
        : DEFAULT_LIMITS.warning_threshold_percent,
    enforce_hard_limits: row.enforce_hard_limits !== false,
    created_at: typeof row.created_at === "string" ? row.created_at : DEFAULT_LIMITS.created_at,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : DEFAULT_LIMITS.updated_at,
  };
}

function summarizeCounter(used: number, limit: number, warningThresholdPercent: number): UsageCounter {
  const safeLimit = Math.max(1, limit);
  const percent = Math.min(999, Math.round((used / safeLimit) * 100));
  const remaining = Math.max(0, safeLimit - used);
  let level: UsageCounter["level"] = "ok";

  if (used >= safeLimit) {
    level = "blocked";
  } else if (percent >= warningThresholdPercent) {
    level = "warn";
  }

  return {
    used,
    limit: safeLimit,
    remaining,
    percent,
    level,
  };
}

export function isWorkspaceUsageLimitError(error: unknown): error is WorkspaceUsageLimitError {
  return error instanceof WorkspaceUsageLimitError;
}

export function getWorkspaceUsageErrorMessage(error: unknown, fallback = "Workspace usage limit reached.") {
  if (isWorkspaceUsageLimitError(error) && error.message.trim()) {
    return error.message.trim();
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}

export async function getWorkspaceUsageStatus({
  supabase,
  workspaceId,
  memberCountHint,
}: {
  supabase: SupabaseClient;
  workspaceId: string;
  memberCountHint?: number;
}): Promise<WorkspaceUsageStatus | null> {
  if (!workspaceId) {
    return null;
  }

  const monthStartIso = startOfCurrentMonth().toISOString();

  const [
    { data: limitRow },
    { count: monthlyRunCount },
    { data: tokenRows },
    { count: activeWorkflowCount },
    { count: activeScheduleCount },
    { count: membershipCount },
    { count: toolCallCount },
  ] = await Promise.all([
    supabase
      .from("workspace_usage_limits")
      .select(
        "workspace_id, plan_name, monthly_run_limit, monthly_token_limit, active_workflow_limit, member_limit, schedule_limit, warning_threshold_percent, enforce_hard_limits, created_at, updated_at",
      )
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
    supabase
      .from("workflow_runs")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .gte("created_at", monthStartIso),
    supabase
      .from("workflow_node_executions")
      .select("token_estimate")
      .eq("workspace_id", workspaceId)
      .gte("created_at", monthStartIso),
    supabase
      .from("workflows")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .neq("status", "archived"),
    supabase
      .from("workflow_schedules")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .in("status", ["active", "paused"]),
    supabase
      .from("workspace_memberships")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "active"),
    supabase
      .from("workflow_node_executions")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("node_type", "tool")
      .gte("created_at", monthStartIso),
  ]);

  const limits = toLimitRecord(limitRow, workspaceId);
  const tokensUsed = ((tokenRows ?? []) as Array<{ token_estimate?: number | null }>).reduce(
    (total, row) => total + (Number(row.token_estimate) || 0),
    0,
  );
  const membersUsed = Math.max(memberCountHint ?? 0, membershipCount ?? 0);

  return {
    planName: limits.plan_name,
    enforceHardLimits: limits.enforce_hard_limits,
    warningThresholdPercent: limits.warning_threshold_percent,
    periodLabel: periodLabel(),
    runsMonthly: summarizeCounter(monthlyRunCount ?? 0, limits.monthly_run_limit, limits.warning_threshold_percent),
    tokensMonthly: summarizeCounter(tokensUsed, limits.monthly_token_limit, limits.warning_threshold_percent),
    activeWorkflows: summarizeCounter(activeWorkflowCount ?? 0, limits.active_workflow_limit, limits.warning_threshold_percent),
    members: summarizeCounter(membersUsed, limits.member_limit, limits.warning_threshold_percent),
    schedules: summarizeCounter(activeScheduleCount ?? 0, limits.schedule_limit, limits.warning_threshold_percent),
    toolCallsMonthlyCount: toolCallCount ?? 0,
  };
}

export async function assertWorkspaceCanEnqueueRun(supabase: SupabaseClient, workspaceId: string) {
  const usage = await getWorkspaceUsageStatus({ supabase, workspaceId });
  if (!usage || !usage.enforceHardLimits) {
    return;
  }

  if (usage.runsMonthly.level === "blocked") {
    throw new WorkspaceUsageLimitError(
      "run_limit",
      `Monthly run limit reached for the ${usage.planName} plan.`,
    );
  }

  if (usage.tokensMonthly.level === "blocked") {
    throw new WorkspaceUsageLimitError(
      "token_limit",
      `Monthly token budget reached for the ${usage.planName} plan.`,
    );
  }
}

export async function assertWorkspaceCanCreateWorkflow(supabase: SupabaseClient, workspaceId: string) {
  const usage = await getWorkspaceUsageStatus({ supabase, workspaceId });
  if (!usage || !usage.enforceHardLimits) {
    return;
  }

  if (usage.activeWorkflows.level === "blocked") {
    throw new WorkspaceUsageLimitError(
      "workflow_limit",
      `Active workflow limit reached for the ${usage.planName} plan.`,
    );
  }
}

export async function assertWorkspaceCanAddMember(supabase: SupabaseClient, workspaceId: string, memberCountHint?: number) {
  const usage = await getWorkspaceUsageStatus({ supabase, workspaceId, memberCountHint });
  if (!usage || !usage.enforceHardLimits) {
    return;
  }

  if (usage.members.level === "blocked") {
    throw new WorkspaceUsageLimitError(
      "member_limit",
      `Team member limit reached for the ${usage.planName} plan.`,
    );
  }
}

export async function assertWorkspaceCanCreateSchedule(supabase: SupabaseClient, workspaceId: string) {
  const usage = await getWorkspaceUsageStatus({ supabase, workspaceId });
  if (!usage || !usage.enforceHardLimits) {
    return;
  }

  if (usage.schedules.level === "blocked") {
    throw new WorkspaceUsageLimitError(
      "schedule_limit",
      `Schedule limit reached for the ${usage.planName} plan.`,
    );
  }
}
