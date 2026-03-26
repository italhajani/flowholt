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

export type WorkspaceRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
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
  error_message: string;
  last_error_class: string;
  created_at: string;
  updated_at: string;
};

export type WorkflowRunListItem = WorkflowRunRecord & {
  workflowName: string;
  logs: RunLogRecord[];
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
  next_run_at: string;
  last_run_at: string | null;
  last_run_status: "succeeded" | "failed" | null;
  run_count: number;
  last_error: string;
  lock_until: string | null;
  created_at: string;
  updated_at: string;
};

export type IntegrationsSnapshot = {
  schemaReady: boolean;
  workspaces: WorkspaceRecord[];
  activeWorkspace: WorkspaceRecord | null;
  integrations: IntegrationConnectionRecord[];
};
