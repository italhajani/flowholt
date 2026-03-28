import type { SupabaseClient } from "@supabase/supabase-js";

export type WorkflowNodeType =
  | "trigger"
  | "agent"
  | "tool"
  | "condition"
  | "loop"
  | "memory"
  | "retriever"
  | "output";

export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  label: string;
  config?: Record<string, unknown>;
  position?: {
    x: number;
    y: number;
  };
};

export type WorkflowEdge = {
  source: string;
  target: string;
  label?: string;
  branch?: string;
};

export type WorkflowGraph = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type WorkspaceMembershipRole = "owner" | "admin" | "member";

export type WorkspaceRecord = {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMembershipRecord = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceMembershipRole;
  status: "active" | "revoked";
  created_at: string;
  updated_at: string;
};

export type WorkspaceAuditLogRecord = {
  id: number;
  workspace_id: string;
  actor_user_id: string | null;
  action: string;
  target_type: string;
  target_id: string;
  summary: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type WorkspaceUsageLimitRecord = {
  workspace_id: string;
  plan_name: string;
  monthly_run_limit: number;
  monthly_token_limit: number;
  active_workflow_limit: number;
  member_limit: number;
  schedule_limit: number;
  warning_threshold_percent: number;
  enforce_hard_limits: boolean;
  created_at: string;
  updated_at: string;
};

export type UsageCounter = {
  used: number;
  limit: number;
  remaining: number;
  percent: number;
  level: "ok" | "warn" | "blocked";
};

export type WorkspaceUsageStatus = {
  planName: string;
  enforceHardLimits: boolean;
  warningThresholdPercent: number;
  periodLabel: string;
  runsMonthly: UsageCounter;
  tokensMonthly: UsageCounter;
  activeWorkflows: UsageCounter;
  members: UsageCounter;
  schedules: UsageCounter;
  toolCallsMonthlyCount: number;
};

export type WorkspaceBillingPlanKey = "starter" | "pro" | "scale";

export type WorkspaceBillingPlanDefinition = {
  key: WorkspaceBillingPlanKey;
  name: string;
  description: string;
  monthlyBaseCents: number;
  currency: string;
  monthlyRunLimit: number;
  monthlyTokenLimit: number;
  activeWorkflowLimit: number;
  memberLimit: number;
  scheduleLimit: number;
  overageRunCents: number;
  overagePer1000TokensCents: number;
};

export type WorkspaceBillingSubscriptionRecord = {
  workspace_id: string;
  created_by_user_id: string | null;
  plan_key: WorkspaceBillingPlanKey;
  plan_name: string;
  status: "trialing" | "active" | "past_due" | "cancelled";
  billing_email: string;
  currency: string;
  monthly_base_cents: number;
  overage_run_cents: number;
  overage_per_1000_tokens_cents: number;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkspaceBillingInvoiceLineItem = {
  key: string;
  label: string;
  quantity: number;
  unit_amount_cents: number;
  total_amount_cents: number;
  detail: string;
};

export type WorkspaceBillingInvoiceRecord = {
  id: string;
  workspace_id: string;
  created_by_user_id: string | null;
  status: "draft" | "open" | "paid" | "void";
  currency: string;
  period_start: string;
  period_end: string;
  base_amount_cents: number;
  overage_amount_cents: number;
  total_amount_cents: number;
  line_items: WorkspaceBillingInvoiceLineItem[];
  issued_at: string;
  paid_at: string | null;
  notes: string;
  created_at: string;
};

export type WorkspaceBillingEstimate = {
  currency: string;
  lineItems: WorkspaceBillingInvoiceLineItem[];
  baseAmountCents: number;
  overageAmountCents: number;
  totalAmountCents: number;
};

export type WorkspaceBillingSnapshot = {
  currentPlan: WorkspaceBillingPlanDefinition;
  subscription: WorkspaceBillingSubscriptionRecord;
  estimate: WorkspaceBillingEstimate;
  invoices: WorkspaceBillingInvoiceRecord[];
};

export type IntegrationProvider = "groq" | "http" | "webhook";

export type IntegrationConnectionRecord = {
  id: string;
  workspace_id: string;
  created_by_user_id: string;
  provider: IntegrationProvider;
  label: string;
  description: string;
  status: "draft" | "active" | "disabled";
  config: Record<string, unknown>;
  secrets: Record<string, unknown>;
  secret_version?: number;
  last_secret_rotation_at?: string | null;
  last_test_status?: "unknown" | "passed" | "warn" | "failed";
  last_test_message?: string;
  last_test_details?: Record<string, unknown>;
  last_tested_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkflowRecord = {
  id: string;
  workspace_id: string;
  created_by_user_id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  graph: WorkflowGraph;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type WorkflowRunRecord = {
  id: string;
  workflow_id: string;
  workspace_id: string;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  trigger_source: string;
  output: Record<string, unknown>;
  error_message: string;
  request_correlation_id?: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
};

export type RunLogRecord = {
  id: number;
  run_id: string;
  workflow_id: string;
  workspace_id: string;
  node_id: string | null;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type WorkflowNodeExecutionRecord = {
  id: number;
  run_id: string;
  workflow_id: string;
  workspace_id: string;
  node_id: string;
  node_label: string;
  node_type: WorkflowNodeType;
  sequence: number;
  status: "succeeded" | "failed" | "cancelled" | "skipped";
  attempt_count: number;
  duration_ms: number;
  started_at: string | null;
  finished_at: string | null;
  error_class: string;
  error_message: string;
  token_estimate: number;
  output_summary: Record<string, unknown>;
  created_at: string;
};

export type WorkflowRunJobRecord = {
  id: string;
  workflow_id: string;
  workspace_id: string;
  created_by_user_id: string | null;
  status: "queued" | "processing" | "succeeded" | "failed" | "cancelled";
  trigger_source: string;
  trigger_payload: unknown;
  trigger_meta: Record<string, unknown>;
  attempt_count: number;
  max_attempts: number;
  available_at: string;
  claimed_at: string | null;
  finished_at: string | null;
  lock_until: string | null;
  run_id: string | null;
  request_correlation_id?: string | null;
  error_message: string;
  last_error_class: string;
  created_at: string;
  updated_at: string;
};

export type WorkflowRunListItem = WorkflowRunRecord & {
  workflowName: string;
  logs: RunLogRecord[];
};

export type DashboardUsageSnapshot = {
  activeSchedules: number;
  queuedJobs: number;
  runsLast7Days: number;
  failedRunsLast7Days: number;
  tokenEstimateLast7Days: number;
  toolCallsThisMonth: number;
  planName: string;
  monthlyRunRemaining: number;
  monthlyTokenRemaining: number;
};

export type SecurityCheckStatus = "ok" | "warn" | "error";

export type SecurityCheckItem = {
  key: string;
  label: string;
  status: SecurityCheckStatus;
  detail: string;
};

export type SecurityCheckSummary = {
  ok: number;
  warn: number;
  error: number;
};

export type MonitoringSnapshot = {
  schemaReady: boolean;
  workspaces: WorkspaceRecord[];
  activeWorkspace: WorkspaceRecord | null;
  queueDepth: number;
  processingJobs: number;
  stuckRuns: number;
  stuckJobs: number;
  runSuccessRate24h: number;
  failedRuns24h: number;
  avgRunDurationMs24h: number;
  avgNodeDurationMs24h: number;
  rateLimitEvents24h: Array<{
    scope: string;
    requestCount: number;
  }>;
  topFailingNodes7d: Array<{
    nodeLabel: string;
    failures: number;
  }>;
  recentAuditActions7d: Array<{
    action: string;
    count: number;
  }>;
  securityChecks: SecurityCheckItem[];
  securitySummary: SecurityCheckSummary;
};
export type DashboardSnapshot = {
  schemaReady: boolean;
  workspaces: WorkspaceRecord[];
  activeWorkspace: WorkspaceRecord | null;
  recentWorkflows: WorkflowRecord[];
  recentRuns: WorkflowRunRecord[];
  workflowCount: number;
  runCount: number;
  successRate: number;
  usage: DashboardUsageSnapshot;
  limits: WorkspaceUsageStatus | null;
};

export type WorkflowLibrarySnapshot = {
  schemaReady: boolean;
  workspaces: WorkspaceRecord[];
  activeWorkspace: WorkspaceRecord | null;
  workflows: WorkflowRecord[];
};

export type RunsSnapshot = {
  schemaReady: boolean;
  workspaces: WorkspaceRecord[];
  activeWorkspace: WorkspaceRecord | null;
  runs: WorkflowRunListItem[];
};

export type WorkflowScheduleRecord = {
  id: string;
  workflow_id: string;
  workspace_id: string;
  created_by_user_id: string;
  label: string;
  status: "active" | "paused" | "disabled";
  interval_minutes: number;
  pattern: Record<string, unknown>;
  next_run_at: string;
  claim_due_at: string | null;
  last_run_at: string | null;
  last_run_status: "succeeded" | "failed" | null;
  run_count: number;
  last_error: string;
  lock_until: string | null;
  lock_token: string | null;
  last_claimed_at: string | null;
  last_queued_job_id: string | null;
  created_at: string;
  updated_at: string;
};

export type IntegrationsSnapshot = {
  schemaReady: boolean;
  workspaces: WorkspaceRecord[];
  activeWorkspace: WorkspaceRecord | null;
  integrations: IntegrationConnectionRecord[];
};

export type WorkspaceSettingsSnapshot = {
  schemaReady: boolean;
  rbacReady: boolean;
  billingReady: boolean;
  workspaces: WorkspaceRecord[];
  activeWorkspace: WorkspaceRecord | null;
  currentUserId: string | null;
  currentUserRole: WorkspaceMembershipRole | null;
  canManageMembers: boolean;
  members: WorkspaceMembershipRecord[];
  teamSize: number;
  limits: WorkspaceUsageStatus | null;
  billing: WorkspaceBillingSnapshot | null;
};

export type UsageLimitContext = {
  supabase: SupabaseClient;
  workspaceId: string;
};
