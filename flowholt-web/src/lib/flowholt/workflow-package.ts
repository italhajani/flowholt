import { validateWorkflowGraph, validationFailureMessage } from "@/lib/flowholt/graph-validator";
import type { WorkflowGraph, WorkflowRecord } from "@/lib/flowholt/types";

export const WORKFLOW_PACKAGE_SCHEMA_VERSION = "flowholt.workflow-package.v1";

type WorkflowPackagePayload = {
  schema_version: string;
  exported_at: string;
  workflow: {
    name: string;
    description: string;
    status: "draft" | "active" | "archived";
    graph: WorkflowGraph;
    settings: Record<string, unknown>;
  };
  metadata: {
    source: "flowholt";
    workflow_id: string;
    workspace_id: string;
  };
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function parseGraph(value: unknown): WorkflowGraph {
  const graph = asRecord(value);
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];

  return {
    nodes: nodes as WorkflowGraph["nodes"],
    edges: edges as WorkflowGraph["edges"],
  };
}

export function buildWorkflowPackage(workflow: WorkflowRecord): WorkflowPackagePayload {
  return {
    schema_version: WORKFLOW_PACKAGE_SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    workflow: {
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,
      graph: workflow.graph,
      settings: workflow.settings,
    },
    metadata: {
      source: "flowholt",
      workflow_id: workflow.id,
      workspace_id: workflow.workspace_id,
    },
  };
}

export function parseWorkflowPackage(input: unknown): WorkflowPackagePayload {
  const root = asRecord(input);
  const schemaVersion = asString(root.schema_version);

  if (schemaVersion !== WORKFLOW_PACKAGE_SCHEMA_VERSION) {
    throw new Error("Unsupported workflow package version.");
  }

  const workflow = asRecord(root.workflow);
  const graph = parseGraph(workflow.graph);
  const validation = validateWorkflowGraph(graph);

  if (!validation.valid) {
    throw new Error(validationFailureMessage(validation));
  }

  const status = asString(workflow.status, "draft");
  const safeStatus = ["draft", "active", "archived"].includes(status) ? status : "draft";

  return {
    schema_version: schemaVersion,
    exported_at: asString(root.exported_at, new Date().toISOString()),
    workflow: {
      name: asString(workflow.name, "Imported workflow"),
      description: asString(workflow.description),
      status: safeStatus as WorkflowPackagePayload["workflow"]["status"],
      graph,
      settings: asRecord(workflow.settings),
    },
    metadata: {
      source: "flowholt",
      workflow_id: asString(asRecord(root.metadata).workflow_id),
      workspace_id: asString(asRecord(root.metadata).workspace_id),
    },
  };
}
