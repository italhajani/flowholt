const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export interface ApiTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  estimated_time: string;
  complexity: "Simple" | "Standard" | "Complex" | string;
  color: string;
  owner: string;
  installs: string;
  outcome: string;
  tags: string[];
}

export interface ApiTemplateDetail extends ApiTemplate {
  definition: {
    steps: Array<{
      id: string;
      type: "trigger" | "transform" | "condition" | "llm" | "output" | "delay" | "human" | "callback";
      name: string;
      config: Record<string, unknown>;
    }>;
  };
}

export interface ApiVaultConnection {
  id: string;
  kind: "connection";
  name: string;
  app: string;
  subtitle: string;
  logo_url: string;
  workflows_count: number;
  people_with_access: number;
  last_modified: string;
  status: string;
}

export interface ApiVaultCredential {
  id: string;
  kind: "credential";
  name: string;
  credential_type: string;
  scope: "workspace" | "staging" | "production";
  last_used: string;
  status: string;
}

export interface ApiVaultVariable {
  id: string;
  kind: "variable";
  key: string;
  scope: "workspace" | "staging" | "production";
  access: string;
  updated_at: string;
  masked: boolean;
}

export interface ApiVaultOverview {
  connections: ApiVaultConnection[];
  credentials: ApiVaultCredential[];
  variables: ApiVaultVariable[];
}

export interface ApiWorkflow {
  id: string;
  name: string;
  status: "active" | "draft" | "paused";
  trigger_type: "webhook" | "schedule" | "manual" | "event";
  category: string;
  success_rate: number;
  created_at: string;
  last_run_at: string | null;
  template_id: string | null;
}

export interface ApiWorkflowStep {
  id: string;
  type: "trigger" | "transform" | "condition" | "llm" | "output" | "delay" | "human" | "callback";
  name: string;
  config: Record<string, unknown>;
}

export interface ApiWorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string | null;
}

export interface ApiWorkflowDetail extends ApiWorkflow {
  definition: {
    steps: ApiWorkflowStep[];
    edges: ApiWorkflowEdge[];
  };
}

export interface ApiExecutionStep {
  name: string;
  status: "success" | "failed" | "skipped" | "running" | "paused" | "cancelled";
  duration_ms: number;
  output?: Record<string, unknown> | null;
}

export interface ApiExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: "success" | "failed" | "running" | "paused" | "cancelled";
  trigger_type: "webhook" | "schedule" | "manual" | "event";
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  error_text: string | null;
  steps: ApiExecutionStep[];
}

export interface ApiTriggerDetails {
  workflow_id: string;
  trigger_type: "webhook" | "schedule" | "manual" | "event";
  webhook_path: string | null;
  webhook_url: string | null;
  schedule_hint: string | null;
}

export interface ApiScheduledRun {
  triggered_count: number;
  execution_ids: string[];
  skipped_workflow_ids: string[];
}

export interface ApiWorkflowCreatePayload {
  name: string;
  trigger_type?: "webhook" | "schedule" | "manual" | "event";
  category?: string;
  status?: "active" | "draft" | "paused";
  template_id?: string | null;
  definition: {
    steps: Array<{
      id: string;
      type: "trigger" | "transform" | "condition" | "llm" | "output" | "delay" | "human" | "callback";
      name: string;
      config: Record<string, unknown>;
    }>;
    edges?: ApiWorkflowEdge[];
  };
}

export interface ApiWorkflowUpdatePayload {
  name: string;
  trigger_type: "webhook" | "schedule" | "manual" | "event";
  category: string;
  status: "active" | "draft" | "paused";
  definition: {
    steps: ApiWorkflowStep[];
    edges: ApiWorkflowEdge[];
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") {
        message = body.detail;
      } else if (body?.detail?.message) {
        const firstIssue = Array.isArray(body.detail.issues) ? body.detail.issues[0] : null;
        message = firstIssue?.message
          ? `${body.detail.message}: ${firstIssue.message}`
          : body.detail.message;
      } else if (body?.message) {
        message = body.message;
      }
    } catch {
      // fall back to status-based error text when the response body is empty or not JSON
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  listTemplates: () => request<ApiTemplate[]>("/api/templates"),
  getTemplate: (templateId: string) => request<ApiTemplateDetail>(`/api/templates/${templateId}`),
  listWorkflows: () => request<ApiWorkflow[]>("/api/workflows"),
  getWorkflow: (workflowId: string) => request<ApiWorkflowDetail>(`/api/workflows/${workflowId}`),
  createWorkflow: (payload: ApiWorkflowCreatePayload) =>
    request<ApiWorkflow>("/api/workflows", { method: "POST", body: JSON.stringify(payload) }),
  updateWorkflow: (workflowId: string, payload: ApiWorkflowUpdatePayload) =>
    request<ApiWorkflowDetail>(`/api/workflows/${workflowId}`, { method: "PUT", body: JSON.stringify(payload) }),
  createWorkflowFromTemplate: (templateId: string, name?: string) =>
    request<ApiWorkflow>("/api/workflows/from-template", {
      method: "POST",
      body: JSON.stringify({ template_id: templateId, name }),
    }),
  generateWorkflow: (prompt: string, name?: string) =>
    request<ApiWorkflow>("/api/workflows/generate", {
      method: "POST",
      body: JSON.stringify({ prompt, name }),
    }),
  listExecutions: () => request<ApiExecution[]>("/api/executions"),
  getVaultOverview: () => request<ApiVaultOverview>("/api/vault"),
  listVaultConnections: () => request<ApiVaultConnection[]>("/api/vault/connections"),
  listVaultCredentials: () => request<ApiVaultCredential[]>("/api/vault/credentials"),
  listVaultVariables: () => request<ApiVaultVariable[]>("/api/vault/variables"),
  runWorkflow: (workflowId: string, payload: Record<string, unknown> = {}) =>
    request<ApiExecution>(`/api/workflows/${workflowId}/run`, {
      method: "POST",
      body: JSON.stringify({ payload }),
    }),
  getWorkflowTriggerDetails: (workflowId: string) =>
    request<ApiTriggerDetails>(`/api/workflows/${workflowId}/trigger-details`),
  triggerWorkflowWebhook: (workflowId: string, payload: Record<string, unknown> = {}) =>
    request<ApiExecution>(`/api/triggers/webhook/${workflowId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  runScheduledWorkflows: () =>
    request<ApiScheduledRun>("/api/system/run-scheduled", {
      method: "POST",
      body: JSON.stringify({}),
    }),
};
