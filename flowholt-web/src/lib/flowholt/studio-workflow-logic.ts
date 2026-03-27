import type { WorkflowGraph, WorkflowNode } from "./types.ts";

export function normalizeAgentNode(node: WorkflowNode): WorkflowNode {
  if (node.type !== "agent") {
    return node;
  }

  const config = node.config ?? {};
  const model = typeof config.model === "string" ? config.model.trim() : "";

  if (!model || model.toLowerCase() === "default") {
    const rest = { ...config };
    delete rest.model;
    return {
      ...node,
      config: rest,
    };
  }

  return node;
}

export function normalizeWorkflowGraph(graph: WorkflowGraph): WorkflowGraph {
  return {
    nodes: graph.nodes.map(normalizeAgentNode),
    edges: graph.edges,
  };
}

export function parseWorkflowGraphInput(rawGraph: string): WorkflowGraph {
  const parsed = JSON.parse(rawGraph) as Partial<WorkflowGraph>;

  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("Graph JSON must include nodes and edges arrays.");
  }

  return normalizeWorkflowGraph({
    nodes: parsed.nodes as WorkflowNode[],
    edges: parsed.edges,
  });
}

