import {
  MIN_ENDPOINT_SECRET_LENGTH,
  buildSecurityChecks,
  inspectSecretStrength,
  summarizeSecurityChecks,
} from "@/lib/flowholt/security";
import { DEFAULT_SECURITY_HEADERS } from "@/lib/flowholt/security-headers";
import { getWorkspaceState, resolveWorkspaceRole } from "@/lib/flowholt/workspace-context";
import { getWorkspaceUsageStatus } from "@/lib/flowholt/usage-limits";
import { getWorkspaceBillingSnapshot } from "@/lib/flowholt/billing";
import { createClient } from "@/lib/supabase/server";
import type {
  DashboardSnapshot,
  IntegrationConnectionRecord,
  IntegrationsSnapshot,
  MonitoringSnapshot,
  RunLogRecord,
  RunsSnapshot,
  SecurityCheckItem,
  WorkflowGraph,
  WorkflowLibrarySnapshot,
  WorkflowRecord,
  WorkflowRunListItem,
  WorkflowRunRecord,
  WorkflowScheduleRecord,
  WorkspaceMembershipRecord,
  WorkspaceSettingsSnapshot,
} from "@/lib/flowholt/types";

export const starterGraph: WorkflowGraph = {
  nodes: [
    { id: "trigger", type: "trigger", label: "Webhook trigger" },
    { id: "research", type: "agent", label: "Research agent" },
    { id: "qualify", type: "condition", label: "Qualification branch" },
    { id: "email", type: "agent", label: "Email agent" },
    { id: "crm", type: "tool", label: "CRM writeback" },
    { id: "output", type: "output", label: "Report output" },
  ],
  edges: [
    { source: "trigger", target: "research" },
    { source: "research", target: "qualify" },
    { source: "qualify", target: "email", branch: "true", label: "True" },
    { source: "qualify", target: "output", branch: "false", label: "False" },
    { source: "email", target: "crm" },
    { source: "crm", target: "output" },
  ],
};

const demoWorkflow: WorkflowRecord = {
  id: "demo-workflow",
  workspace_id: "demo-workspace",
  created_by_user_id: "demo-user",
  name: "Lead intake autopilot",
  description: "Demo workflow until the database has real rows.",
  status: "draft",
  graph: starterGraph,
  settings: {},
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

function emptySnapshot(): DashboardSnapshot {
  return {
    schemaReady: false,
    workspaces: [],
    activeWorkspace: null,
    recentWorkflows: [],
    recentRuns: [],
    workflowCount: 0,
    runCount: 0,
    successRate: 0,
    usage: {
      activeSchedules: 0,
      queuedJobs: 0,
      runsLast7Days: 0,
      failedRunsLast7Days: 0,
      tokenEstimateLast7Days: 0,
      toolCallsThisMonth: 0,
      planName: "starter",
      monthlyRunRemaining: 0,
      monthlyTokenRemaining: 0,
    },
    limits: null,
  };
}

function emptyRunsSnapshot(): RunsSnapshot {
  return {
    schemaReady: false,
    workspaces: [],
    activeWorkspace: null,
    runs: [],
  };
}

function emptyIntegrationsSnapshot(): IntegrationsSnapshot {
  return {
    schemaReady: false,
    workspaces: [],
    activeWorkspace: null,
    integrations: [],
  };
}

function emptyWorkspaceSettingsSnapshot(): WorkspaceSettingsSnapshot {
  return {
    schemaReady: false,
    rbacReady: false,
    billingReady: false,
    workspaces: [],
    activeWorkspace: null,
    currentUserId: null,
    currentUserRole: null,
    canManageMembers: false,
    members: [],
    teamSize: 0,
    limits: null,
    billing: null,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asMembershipRole(value: unknown): WorkspaceMembershipRecord["role"] {
  return value === "owner" || value === "admin" || value === "member" ? value : "member";
}

function asMembershipStatus(value: unknown): WorkspaceMembershipRecord["status"] {
  return value === "revoked" ? "revoked" : "active";
}

function toWorkspaceMembershipRecord(value: unknown): WorkspaceMembershipRecord {
  const row = asRecord(value);
  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    workspace_id: typeof row.workspace_id === "string" ? row.workspace_id : "",
    user_id: typeof row.user_id === "string" ? row.user_id : "",
    role: asMembershipRole(row.role),
    status: asMembershipStatus(row.status),
    created_at: typeof row.created_at === "string" ? row.created_at : new Date(0).toISOString(),
    updated_at: typeof row.updated_at === "string" ? row.updated_at : new Date(0).toISOString(),
  };
}

function membershipRank(role: WorkspaceMembershipRecord["role"]) {
  if (role === "owner") {
    return 3;
  }
  if (role === "admin") {
    return 2;
  }
  return 1;
}

function ensureOwnerMembership(
  memberships: WorkspaceMembershipRecord[],
  workspaceId: string,
  ownerUserId: string,
): WorkspaceMembershipRecord[] {
  if (memberships.some((membership) => membership.user_id === ownerUserId)) {
    return memberships;
  }

  return [
    {
      id: `owner-${workspaceId}`,
      workspace_id: workspaceId,
      user_id: ownerUserId,
      role: "owner",
      status: "active",
      created_at: new Date(0).toISOString(),
      updated_at: new Date(0).toISOString(),
    },
    ...memberships,
  ];
}

function buildWebhookIntegrationSecurityChecks(
  rows: Array<{ label: string | null; secrets: Record<string, unknown> | null; config: Record<string, unknown> | null }>,
): SecurityCheckItem[] {
  const inboundRows = rows.filter((row) => {
    const config = row.config ?? {};
    const direction = typeof config.direction === "string" ? config.direction.toLowerCase() : "inbound";
    return direction === "inbound";
  });

  if (!inboundRows.length) {
    return [
      {
        key: "webhook-integrations",
        label: "Webhook integration keys",
        status: "ok",
        detail: "No active inbound webhook connections need review right now.",
      },
    ];
  }

  return inboundRows.map((row, index) => {
    const label = typeof row.label === "string" && row.label.trim() ? row.label.trim() : `Webhook ${index + 1}`;
    const inspection = inspectSecretStrength(row.secrets?.api_key, MIN_ENDPOINT_SECRET_LENGTH);

    if (!inspection.normalized) {
      return {
        key: `webhook-key-${index + 1}`,
        label: `${label} webhook key`,
        status: "warn",
        detail: `${label} has no API key, so that inbound webhook is publicly callable if someone knows the URL.`,
      };
    }

    if (inspection.issues.length) {
      return {
        key: `webhook-key-${index + 1}`,
        label: `${label} webhook key`,
        status: "warn",
        detail: `${label} uses a weak webhook key: ${inspection.issues.join(", ")}.`,
      };
    }

    return {
      key: `webhook-key-${index + 1}`,
      label: `${label} webhook key`,
      status: "ok",
      detail: `${label} uses a strong inbound webhook key.`,
    };
  });
}

function buildMonitoringSecuritySnapshot(
  webhookConnections: Array<{ label: string | null; secrets: Record<string, unknown> | null; config: Record<string, unknown> | null }> = [],
) {
  const securityChecks: SecurityCheckItem[] = [
    ...buildSecurityChecks(process.env),
    {
      key: "response-security-headers",
      label: "Response security headers",
      status: "ok",
      detail: `Next.js responses include ${DEFAULT_SECURITY_HEADERS.length} baseline security headers for deploy safety.`,
    },
    ...buildWebhookIntegrationSecurityChecks(webhookConnections),
  ];

  return {
    securityChecks,
    securitySummary: summarizeSecurityChecks(securityChecks),
  };
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const workspaceState = await getWorkspaceState();

  if (!workspaceState.schemaReady) {
    return emptySnapshot();
  }

  if (!workspaceState.activeWorkspace) {
    return {
      ...emptySnapshot(),
      schemaReady: true,
      workspaces: workspaceState.workspaces,
    };
  }

  const workspaceId = workspaceState.activeWorkspace.id;
  const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: workflows, error: workflowsError },
    { data: runs, error: runsError },
    { count: workflowTotalCount },
    { count: runTotalCount },
    { data: usageRuns },
    { data: nodeExecutions },
    { data: activeSchedules },
    { data: queuedJobs },
    limits,
  ] = await Promise.all([
    workspaceState.supabase
      .from("workflows")
      .select(
        "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
      )
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(5),
    workspaceState.supabase
      .from("workflow_runs")
      .select(
        "id, workflow_id, workspace_id, status, trigger_source, output, error_message, started_at, finished_at, created_at",
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(5),
    workspaceState.supabase
      .from("workflows")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    workspaceState.supabase
      .from("workflow_runs")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    workspaceState.supabase
      .from("workflow_runs")
      .select("id, status, created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", sevenDaysAgoIso),
    workspaceState.supabase
      .from("workflow_node_executions")
      .select("token_estimate, created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", sevenDaysAgoIso),
    workspaceState.supabase
      .from("workflow_schedules")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("status", "active"),
    workspaceState.supabase
      .from("workflow_run_jobs")
      .select("id")
      .eq("workspace_id", workspaceId)
      .in("status", ["queued", "processing"]),
    getWorkspaceUsageStatus({ supabase: workspaceState.supabase, workspaceId }),
  ]);

  if (workflowsError || runsError) {
    return {
      ...emptySnapshot(),
      schemaReady: true,
      workspaces: workspaceState.workspaces,
      activeWorkspace: workspaceState.activeWorkspace,
    };
  }

  const recentWorkflows = (workflows ?? []) as WorkflowRecord[];
  const recentRuns = (runs ?? []) as WorkflowRunRecord[];
  const succeededRuns = recentRuns.filter((run) => run.status === "succeeded").length;
  const successRate = recentRuns.length ? Math.round((succeededRuns / recentRuns.length) * 100) : 0;
  const usageRunRows = (usageRuns ?? []) as Array<{ status: string }>;
  const usageNodeRows = (nodeExecutions ?? []) as Array<{ token_estimate: number | null }>;

  return {
    schemaReady: true,
    workspaces: workspaceState.workspaces,
    activeWorkspace: workspaceState.activeWorkspace,
    recentWorkflows,
    recentRuns,
    workflowCount: workflowTotalCount ?? recentWorkflows.length,
    runCount: runTotalCount ?? recentRuns.length,
    successRate,
    usage: {
      activeSchedules: (activeSchedules ?? []).length,
      queuedJobs: (queuedJobs ?? []).length,
      runsLast7Days: usageRunRows.length,
      failedRunsLast7Days: usageRunRows.filter((run) => ["failed", "cancelled"].includes(run.status)).length,
      tokenEstimateLast7Days: usageNodeRows.reduce(
        (total, row) => total + (Number(row.token_estimate) || 0),
        0,
      ),
      toolCallsThisMonth: limits?.toolCallsMonthlyCount ?? 0,
      planName: limits?.planName ?? "starter",
      monthlyRunRemaining: limits?.runsMonthly.remaining ?? 0,
      monthlyTokenRemaining: limits?.tokensMonthly.remaining ?? 0,
    },
    limits,
  };
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

export async function getMonitoringSnapshot(): Promise<MonitoringSnapshot> {
  const workspaceState = await getWorkspaceState();

  if (!workspaceState.schemaReady) {
    const securitySnapshot = buildMonitoringSecuritySnapshot();

    return {
      schemaReady: false,
      workspaces: [],
      activeWorkspace: null,
      queueDepth: 0,
      processingJobs: 0,
      stuckRuns: 0,
      stuckJobs: 0,
      runSuccessRate24h: 0,
      failedRuns24h: 0,
      avgRunDurationMs24h: 0,
      avgNodeDurationMs24h: 0,
      rateLimitEvents24h: [],
      topFailingNodes7d: [],
      recentAuditActions7d: [],
      securityChecks: securitySnapshot.securityChecks,
      securitySummary: securitySnapshot.securitySummary,
    };
  }

  if (!workspaceState.activeWorkspace) {
    const securitySnapshot = buildMonitoringSecuritySnapshot();

    return {
      schemaReady: true,
      workspaces: workspaceState.workspaces,
      activeWorkspace: null,
      queueDepth: 0,
      processingJobs: 0,
      stuckRuns: 0,
      stuckJobs: 0,
      runSuccessRate24h: 0,
      failedRuns24h: 0,
      avgRunDurationMs24h: 0,
      avgNodeDurationMs24h: 0,
      rateLimitEvents24h: [],
      topFailingNodes7d: [],
      recentAuditActions7d: [],
      securityChecks: securitySnapshot.securityChecks,
      securitySummary: securitySnapshot.securitySummary,
    };
  }

  const workspaceId = workspaceState.activeWorkspace.id;
  const now = Date.now();
  const last24HoursIso = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const last7DaysIso = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const stuckRunThresholdIso = new Date(now - 15 * 60 * 1000).toISOString();
  const stuckJobThresholdIso = new Date(now - 10 * 60 * 1000).toISOString();

  const [
    { data: recentRuns },
    { data: nodeExecutions },
    { data: queuedAndProcessingJobs },
    { data: stuckRunsRows },
    { data: stuckJobsRows },
    { data: rateLimitRows },
    { data: failedNodeRows },
    { data: auditRows },
    { data: webhookConnectionRows },
  ] = await Promise.all([
    workspaceState.supabase
      .from("workflow_runs")
      .select("id, status, started_at, finished_at, created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", last24HoursIso),
    workspaceState.supabase
      .from("workflow_node_executions")
      .select("duration_ms, created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", last24HoursIso),
    workspaceState.supabase
      .from("workflow_run_jobs")
      .select("id, status, available_at, claimed_at, created_at")
      .eq("workspace_id", workspaceId)
      .in("status", ["queued", "processing"]),
    workspaceState.supabase
      .from("workflow_runs")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("status", "running")
      .lte("started_at", stuckRunThresholdIso),
    workspaceState.supabase
      .from("workflow_run_jobs")
      .select("id")
      .eq("workspace_id", workspaceId)
      .in("status", ["queued", "processing"])
      .lte("created_at", stuckJobThresholdIso),
    workspaceState.supabase
      .from("request_rate_limits")
      .select("scope, request_count, bucket_start")
      .gte("bucket_start", last24HoursIso),
    workspaceState.supabase
      .from("workflow_node_executions")
      .select("node_label, status, created_at")
      .eq("workspace_id", workspaceId)
      .eq("status", "failed")
      .gte("created_at", last7DaysIso)
      .limit(500),
    workspaceState.supabase
      .from("workspace_audit_logs")
      .select("action, created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", last7DaysIso)
      .limit(500),
    workspaceState.supabase
      .from("integration_connections")
      .select("label, secrets, config")
      .eq("workspace_id", workspaceId)
      .eq("provider", "webhook")
      .eq("status", "active"),
  ]);

  const runRows = (recentRuns ?? []) as Array<{
    status: string;
    started_at: string | null;
    finished_at: string | null;
  }>;
  const nodeRows = (nodeExecutions ?? []) as Array<{ duration_ms: number | null }>;
  const jobRows = (queuedAndProcessingJobs ?? []) as Array<{ status: string }>;
  const rateLimitData = (rateLimitRows ?? []) as Array<{ scope: string; request_count: number | null }>;
  const failedNodes = (failedNodeRows ?? []) as Array<{ node_label: string | null }>;
  const auditActions = (auditRows ?? []) as Array<{ action: string | null }>;
  const securitySnapshot = buildMonitoringSecuritySnapshot(
    ((webhookConnectionRows ?? []) as Array<{
      label: string | null;
      secrets: Record<string, unknown> | null;
      config: Record<string, unknown> | null;
    }>),
  );

  const completedRunDurations = runRows
    .map((run) => {
      if (!run.started_at || !run.finished_at) {
        return 0;
      }
      return Math.max(0, new Date(run.finished_at).getTime() - new Date(run.started_at).getTime());
    })
    .filter((duration) => duration > 0);

  const rateLimitSummary = new Map<string, number>();
  for (const row of rateLimitData) {
    const scope = typeof row.scope === "string" && row.scope.trim() ? row.scope : "unknown";
    rateLimitSummary.set(scope, (rateLimitSummary.get(scope) ?? 0) + (Number(row.request_count) || 0));
  }

  const failingNodesSummary = new Map<string, number>();
  for (const row of failedNodes) {
    const label = typeof row.node_label === "string" && row.node_label.trim() ? row.node_label : "Unknown node";
    failingNodesSummary.set(label, (failingNodesSummary.get(label) ?? 0) + 1);
  }

  const auditSummary = new Map<string, number>();
  for (const row of auditActions) {
    const action = typeof row.action === "string" && row.action.trim() ? row.action : "unknown";
    auditSummary.set(action, (auditSummary.get(action) ?? 0) + 1);
  }

  const failedRuns24h = runRows.filter((run) => run.status === "failed" || run.status === "cancelled").length;
  const succeededRuns24h = runRows.filter((run) => run.status === "succeeded").length;
  const finishedRuns24h = failedRuns24h + succeededRuns24h;

  return {
    schemaReady: true,
    workspaces: workspaceState.workspaces,
    activeWorkspace: workspaceState.activeWorkspace,
    queueDepth: jobRows.length,
    processingJobs: jobRows.filter((job) => job.status === "processing").length,
    stuckRuns: (stuckRunsRows ?? []).length,
    stuckJobs: (stuckJobsRows ?? []).length,
    runSuccessRate24h: finishedRuns24h ? Math.round((succeededRuns24h / finishedRuns24h) * 100) : 0,
    failedRuns24h,
    avgRunDurationMs24h: average(completedRunDurations),
    avgNodeDurationMs24h: average(nodeRows.map((row) => Number(row.duration_ms) || 0).filter((value) => value > 0)),
    rateLimitEvents24h: Array.from(rateLimitSummary.entries())
      .map(([scope, requestCount]) => ({ scope, requestCount }))
      .sort((left, right) => right.requestCount - left.requestCount)
      .slice(0, 6),
    topFailingNodes7d: Array.from(failingNodesSummary.entries())
      .map(([nodeLabel, failures]) => ({ nodeLabel, failures }))
      .sort((left, right) => right.failures - left.failures)
      .slice(0, 6),
    recentAuditActions7d: Array.from(auditSummary.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6),
    securityChecks: securitySnapshot.securityChecks,
    securitySummary: securitySnapshot.securitySummary,
  };
}

export async function getWorkflowLibrarySnapshot(): Promise<WorkflowLibrarySnapshot> {
  const workspaceState = await getWorkspaceState();

  if (!workspaceState.schemaReady) {
    return {
      schemaReady: false,
      workspaces: [],
      activeWorkspace: null,
      workflows: [],
    };
  }

  if (!workspaceState.activeWorkspace) {
    return {
      schemaReady: true,
      workspaces: workspaceState.workspaces,
      activeWorkspace: null,
      workflows: [],
    };
  }

  const { data, error } = await workspaceState.supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .eq("workspace_id", workspaceState.activeWorkspace.id)
    .order("updated_at", { ascending: false });

  return {
    schemaReady: true,
    workspaces: workspaceState.workspaces,
    activeWorkspace: workspaceState.activeWorkspace,
    workflows: error ? [] : ((data ?? []) as WorkflowRecord[]),
  };
}

export async function getRunsSnapshot(): Promise<RunsSnapshot> {
  const workspaceState = await getWorkspaceState();

  if (!workspaceState.schemaReady) {
    return emptyRunsSnapshot();
  }

  if (!workspaceState.activeWorkspace) {
    return {
      ...emptyRunsSnapshot(),
      schemaReady: true,
      workspaces: workspaceState.workspaces,
    };
  }

  const { data: runs, error: runsError } = await workspaceState.supabase
    .from("workflow_runs")
    .select(
      "id, workflow_id, workspace_id, status, trigger_source, output, error_message, started_at, finished_at, created_at",
    )
    .eq("workspace_id", workspaceState.activeWorkspace.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (runsError) {
    return {
      ...emptyRunsSnapshot(),
      schemaReady: true,
      workspaces: workspaceState.workspaces,
      activeWorkspace: workspaceState.activeWorkspace,
    };
  }

  const runList = (runs ?? []) as WorkflowRunRecord[];

  if (!runList.length) {
    return {
      schemaReady: true,
      workspaces: workspaceState.workspaces,
      activeWorkspace: workspaceState.activeWorkspace,
      runs: [],
    };
  }

  const workflowIds = [...new Set(runList.map((run) => run.workflow_id))];
  const runIds = runList.map((run) => run.id);

  const [{ data: workflows, error: workflowsError }, { data: logs, error: logsError }] =
    await Promise.all([
      workspaceState.supabase.from("workflows").select("id, name").in("id", workflowIds),
      workspaceState.supabase
        .from("run_logs")
        .select("id, run_id, workflow_id, workspace_id, node_id, level, message, payload, created_at")
        .in("run_id", runIds)
        .order("created_at", { ascending: true }),
    ]);

  const workflowNameById = new Map<string, string>(
    ((workflowsError ? [] : workflows ?? []) as Array<{ id: string; name: string }>).map((workflow) => [
      workflow.id,
      workflow.name,
    ]),
  );

  const logsByRunId = new Map<string, RunLogRecord[]>();
  if (!logsError) {
    for (const log of (logs ?? []) as RunLogRecord[]) {
      const current = logsByRunId.get(log.run_id) ?? [];
      current.push(log);
      logsByRunId.set(log.run_id, current);
    }
  }

  const runsWithDetails: WorkflowRunListItem[] = runList.map((run) => ({
    ...run,
    workflowName: workflowNameById.get(run.workflow_id) ?? "Untitled workflow",
    logs: logsByRunId.get(run.id) ?? [],
  }));

  return {
    schemaReady: true,
    workspaces: workspaceState.workspaces,
    activeWorkspace: workspaceState.activeWorkspace,
    runs: runsWithDetails,
  };
}

export async function getIntegrationsSnapshot(): Promise<IntegrationsSnapshot> {
  const workspaceState = await getWorkspaceState();

  if (!workspaceState.schemaReady) {
    return emptyIntegrationsSnapshot();
  }

  if (!workspaceState.activeWorkspace) {
    return {
      ...emptyIntegrationsSnapshot(),
      schemaReady: true,
      workspaces: workspaceState.workspaces,
    };
  }

  const { data, error } = await workspaceState.supabase
    .from("integration_connections")
    .select(
      "id, workspace_id, created_by_user_id, provider, label, description, status, config, secrets, created_at, updated_at",
    )
    .eq("workspace_id", workspaceState.activeWorkspace.id)
    .order("updated_at", { ascending: false });

  return {
    schemaReady: true,
    workspaces: workspaceState.workspaces,
    activeWorkspace: workspaceState.activeWorkspace,
    integrations: error ? [] : ((data ?? []) as IntegrationConnectionRecord[]),
  };
}

export async function getWorkspaceSettingsSnapshot(): Promise<WorkspaceSettingsSnapshot> {
  const workspaceState = await getWorkspaceState();

  if (!workspaceState.schemaReady) {
    return emptyWorkspaceSettingsSnapshot();
  }

  if (!workspaceState.activeWorkspace) {
    return {
      ...emptyWorkspaceSettingsSnapshot(),
      schemaReady: true,
      rbacReady: true,
      billingReady: true,
      workspaces: workspaceState.workspaces,
      currentUserId: workspaceState.currentUserId,
    };
  }

  const { data, error } = await workspaceState.supabase
    .from("workspace_memberships")
    .select("id, workspace_id, user_id, role, status, created_at, updated_at")
    .eq("workspace_id", workspaceState.activeWorkspace.id)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) {
    const currentUserRole: WorkspaceMembershipRecord["role"] | null =
      workspaceState.activeWorkspace.owner_user_id === workspaceState.currentUserId ? "owner" : null;

    return {
      schemaReady: true,
      rbacReady: false,
      billingReady: false,
      workspaces: workspaceState.workspaces,
      activeWorkspace: workspaceState.activeWorkspace,
      currentUserId: workspaceState.currentUserId,
      currentUserRole,
      canManageMembers: false,
      members:
        currentUserRole === "owner"
          ? ensureOwnerMembership([], workspaceState.activeWorkspace.id, workspaceState.activeWorkspace.owner_user_id)
          : [],
      teamSize: currentUserRole === "owner" ? 1 : 0,
      limits: await getWorkspaceUsageStatus({
        supabase: workspaceState.supabase,
        workspaceId: workspaceState.activeWorkspace.id,
        memberCountHint: currentUserRole === "owner" ? 1 : 0,
      }),
      billing: null,
    };
  }

  const memberships = ensureOwnerMembership(
    (data ?? [])
      .map((membership) => toWorkspaceMembershipRecord(membership))
      .filter((membership) => membership.status === "active"),
    workspaceState.activeWorkspace.id,
    workspaceState.activeWorkspace.owner_user_id,
  ).sort((left, right) => {
    const roleDiff = membershipRank(right.role) - membershipRank(left.role);
    if (roleDiff !== 0) {
      return roleDiff;
    }

    if (left.user_id === workspaceState.currentUserId) {
      return -1;
    }
    if (right.user_id === workspaceState.currentUserId) {
      return 1;
    }

    return left.created_at.localeCompare(right.created_at);
  });

  const currentUserRole = resolveWorkspaceRole(
    workspaceState.activeWorkspace,
    workspaceState.currentUserId,
    memberships,
  );
  const billingSnapshot = await getWorkspaceBillingSnapshot({
    supabase: workspaceState.supabase,
    workspaceId: workspaceState.activeWorkspace.id,
    memberCountHint: memberships.length,
  });

  return {
    schemaReady: true,
    rbacReady: true,
    billingReady: billingSnapshot.billingReady,
    workspaces: workspaceState.workspaces,
    activeWorkspace: workspaceState.activeWorkspace,
    currentUserId: workspaceState.currentUserId,
    currentUserRole,
    canManageMembers: currentUserRole === "owner" || currentUserRole === "admin",
    members: memberships,
    teamSize: memberships.length,
    limits: billingSnapshot.usage,
    billing: billingSnapshot.billing,
  };
}

export async function getWorkflowForStudio(workflowId: string) {
  if (workflowId === demoWorkflow.id) {
    return demoWorkflow;
  }

  const supabase = await createClient();
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

export async function getWorkflowSchedules(workflowId: string) {
  if (workflowId === demoWorkflow.id) {
    return [] as WorkflowScheduleRecord[];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workflow_schedules")
    .select(
      "id, workflow_id, workspace_id, created_by_user_id, label, status, interval_minutes, pattern, next_run_at, claim_due_at, last_run_at, last_run_status, run_count, last_error, lock_until, lock_token, last_claimed_at, last_queued_job_id, created_at, updated_at",
    )
    .eq("workflow_id", workflowId)
    .order("next_run_at", { ascending: true });

  return error ? [] : ((data ?? []) as WorkflowScheduleRecord[]);
}

export function getDemoWorkflow() {
  return demoWorkflow;
}





