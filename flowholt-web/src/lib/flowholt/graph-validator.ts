import type { WorkflowEdge, WorkflowGraph, WorkflowNode } from "@/lib/flowholt/types";

export type ValidationSeverity = "error" | "warn" | "info";

export type WorkflowValidationIssue = {
  code: string;
  severity: ValidationSeverity;
  message: string;
  node_id?: string;
  edge?: {
    source: string;
    target: string;
    label?: string;
    branch?: string;
  };
};

export type WorkflowValidationReport = {
  valid: boolean;
  score: number;
  issues: WorkflowValidationIssue[];
  summary: {
    node_count: number;
    edge_count: number;
    root_nodes: string[];
    reachable_nodes: string[];
    unreachable_nodes: string[];
    has_cycle: boolean;
    trigger_count: number;
    output_count: number;
    error_count: number;
    warn_count: number;
    info_count: number;
  };
};

function issue(
  code: string,
  severity: ValidationSeverity,
  message: string,
  extras: Partial<WorkflowValidationIssue> = {},
): WorkflowValidationIssue {
  return {
    code,
    severity,
    message,
    ...extras,
  };
}

function makeAdjacency(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    indegree.set(node.id, 0);
  }

  for (const edge of edges) {
    if (!adjacency.has(edge.source) || !indegree.has(edge.target)) {
      continue;
    }
    adjacency.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  return { adjacency, indegree };
}

function findRoots(nodes: WorkflowNode[], indegree: Map<string, number>) {
  return nodes
    .filter((node) => (indegree.get(node.id) ?? 0) === 0)
    .map((node) => node.id);
}

function walkReachable(adjacency: Map<string, string[]>, roots: string[]) {
  const visited = new Set<string>();
  const queue = [...roots];

  while (queue.length) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }
    visited.add(current);
    for (const target of adjacency.get(current) ?? []) {
      if (!visited.has(target)) {
        queue.push(target);
      }
    }
  }

  return visited;
}

function detectCycle(adjacency: Map<string, string[]>) {
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (inStack.has(nodeId)) {
      return true;
    }
    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    inStack.add(nodeId);
    for (const next of adjacency.get(nodeId) ?? []) {
      if (dfs(next)) {
        return true;
      }
    }
    inStack.delete(nodeId);
    return false;
  }

  for (const nodeId of adjacency.keys()) {
    if (dfs(nodeId)) {
      return true;
    }
  }

  return false;
}

function conditionNodeIssues(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const issues: WorkflowValidationIssue[] = [];

  for (const node of nodes) {
    if (node.type !== "condition") {
      continue;
    }

    const outgoing = edges.filter((edge) => edge.source === node.id);
    if (!outgoing.length) {
      issues.push(
        issue(
          "condition_no_outgoing",
          "warn",
          `Condition node "${node.label}" has no outgoing branch.`,
          { node_id: node.id },
        ),
      );
      continue;
    }

    if (outgoing.length === 1) {
      issues.push(
        issue(
          "condition_single_branch",
          "warn",
          `Condition node "${node.label}" has only one outgoing path.`,
          { node_id: node.id },
        ),
      );
    }

    const keys = outgoing.map((edge) => (edge.branch || edge.label || "").trim().toLowerCase());
    const emptyKeyCount = keys.filter((key) => !key).length;
    if (emptyKeyCount > 0) {
      issues.push(
        issue(
          "condition_missing_branch_labels",
          "warn",
          `Condition node "${node.label}" has ${emptyKeyCount} unlabeled branch edge(s).`,
          { node_id: node.id },
        ),
      );
    }

    const nonEmptyKeys = keys.filter(Boolean);
    const unique = new Set(nonEmptyKeys);
    if (unique.size !== nonEmptyKeys.length) {
      issues.push(
        issue(
          "condition_duplicate_branch_labels",
          "warn",
          `Condition node "${node.label}" has duplicate branch labels.`,
          { node_id: node.id },
        ),
      );
    }
  }

  return issues;
}

function countBySeverity(issues: WorkflowValidationIssue[], severity: ValidationSeverity) {
  return issues.filter((issueItem) => issueItem.severity === severity).length;
}

export function validateWorkflowGraph(graph: WorkflowGraph): WorkflowValidationReport {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];
  const issues: WorkflowValidationIssue[] = [];

  if (!nodes.length) {
    issues.push(issue("empty_graph", "error", "Workflow has no nodes."));
  }

  const nodeIdSet = new Set<string>();
  for (const node of nodes) {
    const id = (node.id || "").trim();
    if (!id) {
      issues.push(issue("missing_node_id", "error", "A node is missing an id."));
      continue;
    }

    if (nodeIdSet.has(id)) {
      issues.push(
        issue("duplicate_node_id", "error", `Duplicate node id "${id}" detected.`, {
          node_id: id,
        }),
      );
    }
    nodeIdSet.add(id);

    if (!(node.label || "").trim()) {
      issues.push(
        issue("missing_node_label", "warn", `Node "${id}" has an empty label.`, {
          node_id: id,
        }),
      );
    }
  }

  for (const edge of edges) {
    const source = (edge.source || "").trim();
    const target = (edge.target || "").trim();
    const edgeMeta = {
      source,
      target,
      label: edge.label,
      branch: edge.branch,
    };

    if (!source || !target) {
      issues.push(issue("invalid_edge", "error", "An edge has missing source or target.", { edge: edgeMeta }));
      continue;
    }

    if (!nodeIdSet.has(source) || !nodeIdSet.has(target)) {
      issues.push(
        issue(
          "edge_unknown_node",
          "error",
          `Edge ${source} -> ${target} references unknown node id.`,
          { edge: edgeMeta },
        ),
      );
    }

    if (source === target) {
      issues.push(
        issue("self_loop", "warn", `Edge ${source} -> ${target} is a self-loop.`, {
          edge: edgeMeta,
        }),
      );
    }
  }

  const triggers = nodes.filter((node) => node.type === "trigger");
  const outputs = nodes.filter((node) => node.type === "output");

  if (!triggers.length) {
    issues.push(issue("missing_trigger", "warn", "No trigger node found in workflow."));
  }
  if (!outputs.length) {
    issues.push(issue("missing_output", "error", "No output node found in workflow."));
  }

  const { adjacency, indegree } = makeAdjacency(nodes, edges);
  const roots = findRoots(nodes, indegree);

  if (!roots.length && nodes.length) {
    issues.push(
      issue("no_root_node", "error", "Workflow has no root node (all nodes have inbound edges)."),
    );
  }

  const reachableSet = walkReachable(adjacency, roots);
  const reachable = Array.from(reachableSet);
  const unreachable = nodes.filter((node) => !reachableSet.has(node.id)).map((node) => node.id);

  if (unreachable.length) {
    issues.push(
      issue(
        "unreachable_nodes",
        "warn",
        `Workflow has unreachable node(s): ${unreachable.join(", ")}`,
      ),
    );
  }

  const hasCycle = detectCycle(adjacency);
  if (hasCycle) {
    issues.push(issue("cycle_detected", "error", "Workflow contains a cycle."));
  }

  issues.push(...conditionNodeIssues(nodes, edges));

  const errorCount = countBySeverity(issues, "error");
  const warnCount = countBySeverity(issues, "warn");
  const infoCount = countBySeverity(issues, "info");

  const score = Math.max(0, 100 - errorCount * 25 - warnCount * 8 - infoCount * 2);

  return {
    valid: errorCount === 0,
    score,
    issues,
    summary: {
      node_count: nodes.length,
      edge_count: edges.length,
      root_nodes: roots,
      reachable_nodes: reachable,
      unreachable_nodes: unreachable,
      has_cycle: hasCycle,
      trigger_count: triggers.length,
      output_count: outputs.length,
      error_count: errorCount,
      warn_count: warnCount,
      info_count: infoCount,
    },
  };
}

export function validationFailureMessage(report: WorkflowValidationReport) {
  if (report.valid) {
    return "";
  }

  const firstError = report.issues.find((entry) => entry.severity === "error");
  if (firstError) {
    return `Workflow graph is invalid: ${firstError.message}`;
  }

  return "Workflow graph is invalid.";
}
