import type { WorkflowEdge, WorkflowGraph, WorkflowNode } from "@/lib/flowholt/types";

type RevisionChangeNode = {
  id: string;
  label: string;
  type: string;
};

type RevisionChangedNode = {
  id: string;
  before_label: string;
  after_label: string;
  before_type: string;
  after_type: string;
  config_changed: boolean;
};

type RevisionChangeEdge = {
  source: string;
  target: string;
  label: string;
  branch: string;
};

export type WorkflowRevisionCompareResult = {
  before: {
    name: string;
    description: string;
    node_count: number;
    edge_count: number;
  };
  after: {
    name: string;
    description: string;
    node_count: number;
    edge_count: number;
  };
  flags: {
    name_changed: boolean;
    description_changed: boolean;
  };
  added_nodes: RevisionChangeNode[];
  removed_nodes: RevisionChangeNode[];
  changed_nodes: RevisionChangedNode[];
  added_edges: RevisionChangeEdge[];
  removed_edges: RevisionChangeEdge[];
  summary_lines: string[];
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNode(value: unknown): WorkflowNode | null {
  const record = asRecord(value);
  const id = asString(record.id).trim();
  const type = asString(record.type).trim();
  const label = asString(record.label).trim();

  if (!id || !type || !label) {
    return null;
  }

  const config = asRecord(record.config);
  const positionRecord = asRecord(record.position);
  const x = typeof positionRecord.x === "number" ? positionRecord.x : undefined;
  const y = typeof positionRecord.y === "number" ? positionRecord.y : undefined;

  return {
    id,
    type: type as WorkflowNode["type"],
    label,
    config,
    position:
      typeof x === "number" && typeof y === "number"
        ? {
            x,
            y,
          }
        : undefined,
  };
}

function asEdge(value: unknown): WorkflowEdge | null {
  const record = asRecord(value);
  const source = asString(record.source).trim();
  const target = asString(record.target).trim();

  if (!source || !target) {
    return null;
  }

  return {
    source,
    target,
    label: asString(record.label),
    branch: asString(record.branch),
  };
}

function asGraph(value: unknown): WorkflowGraph {
  const record = asRecord(value);
  const nodes = Array.isArray(record.nodes)
    ? record.nodes.map((item) => asNode(item)).filter((item): item is WorkflowNode => item !== null)
    : [];
  const edges = Array.isArray(record.edges)
    ? record.edges.map((item) => asEdge(item)).filter((item): item is WorkflowEdge => item !== null)
    : [];

  return { nodes, edges };
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
      left.localeCompare(right),
    );
    return `{${entries
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function edgeKey(edge: WorkflowEdge) {
  return [edge.source, edge.target, edge.label ?? "", edge.branch ?? ""].join("::");
}

function toEdgeView(edge: WorkflowEdge): RevisionChangeEdge {
  return {
    source: edge.source,
    target: edge.target,
    label: edge.label ?? "",
    branch: edge.branch ?? "",
  };
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function compareWorkflowRevision(input: {
  before_name?: string;
  before_description?: string;
  before_graph?: unknown;
  after_name?: string;
  after_description?: string;
  after_graph?: unknown;
}): WorkflowRevisionCompareResult {
  const beforeGraph = asGraph(input.before_graph);
  const afterGraph = asGraph(input.after_graph);

  const beforeNodes = new Map(beforeGraph.nodes.map((node) => [node.id, node]));
  const afterNodes = new Map(afterGraph.nodes.map((node) => [node.id, node]));
  const beforeEdges = new Map(beforeGraph.edges.map((edge) => [edgeKey(edge), edge]));
  const afterEdges = new Map(afterGraph.edges.map((edge) => [edgeKey(edge), edge]));

  const addedNodes: RevisionChangeNode[] = [];
  const removedNodes: RevisionChangeNode[] = [];
  const changedNodes: RevisionChangedNode[] = [];

  for (const [nodeId, node] of afterNodes.entries()) {
    const previous = beforeNodes.get(nodeId);
    if (!previous) {
      addedNodes.push({ id: node.id, label: node.label, type: node.type });
      continue;
    }

    const configChanged = stableStringify(previous.config ?? {}) !== stableStringify(node.config ?? {});
    const labelChanged = previous.label !== node.label;
    const typeChanged = previous.type !== node.type;

    if (configChanged || labelChanged || typeChanged) {
      changedNodes.push({
        id: node.id,
        before_label: previous.label,
        after_label: node.label,
        before_type: previous.type,
        after_type: node.type,
        config_changed: configChanged,
      });
    }
  }

  for (const [nodeId, node] of beforeNodes.entries()) {
    if (!afterNodes.has(nodeId)) {
      removedNodes.push({ id: node.id, label: node.label, type: node.type });
    }
  }

  const addedEdges = Array.from(afterEdges.entries())
    .filter(([key]) => !beforeEdges.has(key))
    .map(([, edge]) => toEdgeView(edge));
  const removedEdges = Array.from(beforeEdges.entries())
    .filter(([key]) => !afterEdges.has(key))
    .map(([, edge]) => toEdgeView(edge));

  const beforeName = asString(input.before_name);
  const afterName = asString(input.after_name);
  const beforeDescription = asString(input.before_description);
  const afterDescription = asString(input.after_description);
  const nameChanged = beforeName !== afterName;
  const descriptionChanged = beforeDescription !== afterDescription;

  const summaryLines: string[] = [];
  summaryLines.push(
    `Graph moved from ${pluralize(beforeGraph.nodes.length, "node")} and ${pluralize(beforeGraph.edges.length, "edge")} to ${pluralize(afterGraph.nodes.length, "node")} and ${pluralize(afterGraph.edges.length, "edge")}.`,
  );

  if (addedNodes.length || removedNodes.length || changedNodes.length) {
    summaryLines.push(
      `Nodes changed: ${pluralize(addedNodes.length, "added node")}, ${pluralize(removedNodes.length, "removed node")}, ${pluralize(changedNodes.length, "updated node")}.`,
    );
  }

  if (addedEdges.length || removedEdges.length) {
    summaryLines.push(
      `Connections changed: ${pluralize(addedEdges.length, "added edge")}, ${pluralize(removedEdges.length, "removed edge")}.`,
    );
  }

  if (nameChanged) {
    summaryLines.push(`Workflow name changed from "${beforeName || "Untitled workflow"}" to "${afterName || "Untitled workflow"}".`);
  }

  if (descriptionChanged) {
    summaryLines.push("Workflow description was updated.");
  }

  if (summaryLines.length === 1 && !nameChanged && !descriptionChanged) {
    summaryLines.push("This revision mainly updates node settings inside the existing structure.");
  }

  return {
    before: {
      name: beforeName,
      description: beforeDescription,
      node_count: beforeGraph.nodes.length,
      edge_count: beforeGraph.edges.length,
    },
    after: {
      name: afterName,
      description: afterDescription,
      node_count: afterGraph.nodes.length,
      edge_count: afterGraph.edges.length,
    },
    flags: {
      name_changed: nameChanged,
      description_changed: descriptionChanged,
    },
    added_nodes: addedNodes,
    removed_nodes: removedNodes,
    changed_nodes: changedNodes,
    added_edges: addedEdges,
    removed_edges: removedEdges,
    summary_lines: summaryLines,
  };
}
