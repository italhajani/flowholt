import type { WorkflowGraph, WorkflowNodeType } from "@/lib/flowholt/types";

export type EngineRunRequest = {
  run_id: string;
  workflow_id: string;
  workspace_id: string;
  workflow_name: string;
  trigger_source: string;
  nodes: Array<{
    id: string;
    type: WorkflowNodeType;
    label: string;
    config?: Record<string, unknown>;
    position?: { x: number; y: number };
  }>;
  edges: WorkflowGraph["edges"];
  settings: Record<string, unknown>;
};

export type EngineRunResponse = {
  status: "succeeded" | "failed";
  started_at: string;
  finished_at: string;
  summary: {
    workflow_id: string;
    run_id: string | null;
    workflow_name: string;
    node_count: number;
    edge_count: number;
    executed_nodes: string[];
    trigger_source: string;
  };
  output: Record<string, unknown>;
  logs: Array<{
    level: "debug" | "info" | "warn" | "error";
    message: string;
    node_id: string | null;
    payload: Record<string, unknown>;
  }>;
};

export function getEngineUrl() {
  return process.env.FLOWHOLT_ENGINE_URL ?? process.env.NEXT_PUBLIC_ENGINE_URL ?? "http://localhost:8000";
}

export async function runWorkflowWithEngine(payload: EngineRunRequest): Promise<EngineRunResponse> {
  const response = await fetch(`${getEngineUrl()}/api/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Engine returned ${response.status}`);
  }

  return (await response.json()) as EngineRunResponse;
}
