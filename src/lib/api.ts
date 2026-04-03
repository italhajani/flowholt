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

export interface ApiExecutionStep {
  name: string;
  status: "success" | "failed" | "skipped" | "running";
  duration_ms: number;
  output?: Record<string, unknown> | null;
}

export interface ApiExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: "success" | "failed" | "running";
  trigger_type: "webhook" | "schedule" | "manual" | "event";
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  error_text: string | null;
  steps: ApiExecutionStep[];
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
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  listTemplates: () => request<ApiTemplate[]>("/api/templates"),
  listWorkflows: () => request<ApiWorkflow[]>("/api/workflows"),
  listExecutions: () => request<ApiExecution[]>("/api/executions"),
};
