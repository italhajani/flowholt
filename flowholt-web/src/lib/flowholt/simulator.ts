import type { WorkflowEdge, WorkflowGraph, WorkflowNode } from "@/lib/flowholt/types";

type SimulationRoute = {
  from: string;
  to: string;
  branch?: string;
  label?: string;
};

export type WorkflowSimulationReport = {
  executable: boolean;
  execution_order: string[];
  root_nodes: string[];
  terminal_nodes: string[];
  visited_nodes: string[];
  skipped_nodes: string[];
  routes: SimulationRoute[];
  estimated_step_count: number;
  possible_path_count: number;
  notes: string[];
};

function buildAdjacency(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const adjacency = new Map<string, WorkflowEdge[]>();
  const indegree = new Map<string, number>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    indegree.set(node.id, 0);
  }

  for (const edge of edges) {
    if (!adjacency.has(edge.source) || !indegree.has(edge.target)) {
      continue;
    }
    adjacency.get(edge.source)?.push(edge);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  return {
    adjacency,
    indegree,
  };
}

function listRoots(nodes: WorkflowNode[], indegree: Map<string, number>) {
  const roots = nodes
    .filter((node) => (indegree.get(node.id) ?? 0) === 0)
    .map((node) => node.id);

  if (roots.length) {
    return roots;
  }

  return nodes[0] ? [nodes[0].id] : [];
}

function listTerminalNodes(nodes: WorkflowNode[], adjacency: Map<string, WorkflowEdge[]>) {
  return nodes
    .filter((node) => (adjacency.get(node.id)?.length ?? 0) === 0)
    .map((node) => node.id);
}

function countPossiblePaths(
  roots: string[],
  terminals: Set<string>,
  adjacency: Map<string, WorkflowEdge[]>,
  maxDepth = 100,
  maxPaths = 1000,
) {
  let pathCount = 0;

  function walk(nodeId: string, depth: number, seen: Set<string>) {
    if (pathCount >= maxPaths) {
      return;
    }
    if (depth > maxDepth) {
      return;
    }
    if (terminals.has(nodeId)) {
      pathCount += 1;
      return;
    }

    const outgoing = adjacency.get(nodeId) ?? [];
    if (!outgoing.length) {
      pathCount += 1;
      return;
    }

    for (const edge of outgoing) {
      if (seen.has(edge.target)) {
        continue;
      }
      const nextSeen = new Set(seen);
      nextSeen.add(edge.target);
      walk(edge.target, depth + 1, nextSeen);
    }
  }

  for (const root of roots) {
    walk(root, 0, new Set([root]));
    if (pathCount >= maxPaths) {
      break;
    }
  }

  return pathCount;
}

export function simulateWorkflowGraph(graph: WorkflowGraph): WorkflowSimulationReport {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];
  const nodeIdSet = new Set(nodes.map((node) => node.id));
  const { adjacency, indegree } = buildAdjacency(nodes, edges);

  const root_nodes = listRoots(nodes, indegree);
  const terminal_nodes = listTerminalNodes(nodes, adjacency);
  const execution_order: string[] = [];
  const visited = new Set<string>();
  const routes: SimulationRoute[] = [];
  const notes: string[] = [];

  const queue = [...root_nodes];
  while (queue.length) {
    const nodeId = queue.shift();
    if (!nodeId || visited.has(nodeId) || !nodeIdSet.has(nodeId)) {
      continue;
    }

    visited.add(nodeId);
    execution_order.push(nodeId);

    const node = nodes.find((entry) => entry.id === nodeId);
    const outgoing = adjacency.get(nodeId) ?? [];

    if (node?.type === "condition" && !outgoing.length) {
      notes.push(`Condition node ${nodeId} has no outgoing branches.`);
    }

    for (const edge of outgoing) {
      routes.push({
        from: edge.source,
        to: edge.target,
        branch: edge.branch,
        label: edge.label,
      });
      if (!visited.has(edge.target)) {
        queue.push(edge.target);
      }
    }
  }

  const visited_nodes = Array.from(visited);
  const skipped_nodes = nodes.filter((node) => !visited.has(node.id)).map((node) => node.id);
  if (skipped_nodes.length) {
    notes.push(`Unreachable nodes: ${skipped_nodes.join(", ")}`);
  }

  const terminalSet = new Set(terminal_nodes);
  const possible_path_count = countPossiblePaths(root_nodes, terminalSet, adjacency);

  return {
    executable: nodes.length > 0 && root_nodes.length > 0,
    execution_order,
    root_nodes,
    terminal_nodes,
    visited_nodes,
    skipped_nodes,
    routes,
    estimated_step_count: execution_order.length,
    possible_path_count,
    notes,
  };
}
