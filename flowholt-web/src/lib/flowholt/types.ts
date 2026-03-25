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
