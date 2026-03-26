import type { SupabaseClient } from "@supabase/supabase-js";

import { runWorkflowWithEngine, type EngineRunResponse } from "@/lib/flowholt/engine";
import {
  validateWorkflowGraph,
  validationFailureMessage,
} from "@/lib/flowholt/graph-validator";
import type { WorkflowGraph, WorkflowNode, WorkflowRecord } from "@/lib/flowholt/types";

type IntegrationConnectionRuntime = {
  id: string;
  provider: string;
  config: Record<string, unknown>;
  secrets: Record<string, unknown>;
};

export type ExecuteWorkflowRunInput = {
  supabase: SupabaseClient;
  workflow: WorkflowRecord;
  triggerSource: string;
  triggerPayload?: unknown;
  triggerMeta?: Record<string, unknown>;
};

export type ExecuteWorkflowRunResult = {
  runId: string;
  result: EngineRunResponse;
  runErrorMessage: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readConnectionId(node: WorkflowNode): string {
  const config = asRecord(node.config);
  const value = config.connection_id;
  return typeof value === "string" ? value.trim() : "";
}

function listConnectionIds(graph: WorkflowGraph) {
  return [...new Set(graph.nodes.map(readConnectionId).filter(Boolean))];
}

async function loadIntegrationConnections(
  supabase: SupabaseClient,
  workspaceId: string,
  connectionIds: string[],
) {
  if (!connectionIds.length) {
    return new Map<string, IntegrationConnectionRuntime>();
  }

  const { data, error } = await supabase
    .from("integration_connections")
    .select("id, provider, status, config, secrets")
    .eq("workspace_id", workspaceId)
    .in("id", connectionIds)
    .eq("status", "active");

  if (error) {
    throw new Error(`Unable to load integration connections: ${error.message}`);
  }

  const rows = (data ?? []) as Array<{
    id: string;
    provider: string;
    config: Record<string, unknown> | null;
    secrets: Record<string, unknown> | null;
  }>;

  return new Map<string, IntegrationConnectionRuntime>(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        provider: row.provider,
        config: row.config ?? {},
        secrets: row.secrets ?? {},
      },
    ]),
  );
}

function expectedConnectionProvider(nodeType: WorkflowNode["type"]): string | null {
  switch (nodeType) {
    case "agent":
      return "groq";
    case "tool":
      return "http";
    case "trigger":
      return "webhook";
    default:
      return null;
  }
}

function resolveGraphWithConnections(
  graph: WorkflowGraph,
  connectionsById: Map<string, IntegrationConnectionRuntime>,
): WorkflowGraph {
  const missingConnections = new Set<string>();
  const providerMismatches: string[] = [];

  const nodes = graph.nodes.map((node) => {
    const config = asRecord(node.config);
    const connectionId = readConnectionId(node);

    if (!connectionId) {
      return {
        ...node,
        config,
      };
    }

    const connection = connectionsById.get(connectionId);

    if (!connection) {
      missingConnections.add(connectionId);
      return {
        ...node,
        config,
      };
    }

    const expectedProvider = expectedConnectionProvider(node.type);
    if (expectedProvider && connection.provider !== expectedProvider) {
      providerMismatches.push(
        `${node.label} expects ${expectedProvider} but received ${connection.provider}`,
      );
      return {
        ...node,
        config,
      };
    }

    return {
      ...node,
      config: {
        ...connection.config,
        ...config,
        ...connection.secrets,
        connection_id: connection.id,
        connection_provider: connection.provider,
      },
    };
  });

  if (missingConnections.size) {
    throw new Error(
      `Missing or inactive integration connection(s): ${Array.from(missingConnections).join(", ")}`,
    );
  }

  if (providerMismatches.length) {
    throw new Error(`Connection provider mismatch: ${providerMismatches.join("; ")}`);
  }

  return {
    ...graph,
    nodes,
  };
}

function readOutputErrorMessage(output: Record<string, unknown>) {
  const value = output.error;
  return typeof value === "string" ? value : "";
}

function buildRuntimeSettings(
  settings: Record<string, unknown>,
  triggerPayload?: unknown,
  triggerMeta?: Record<string, unknown>,
) {
  const baseSettings = asRecord(settings);

  if (triggerPayload === undefined && !triggerMeta) {
    return baseSettings;
  }

  return {
    ...baseSettings,
    runtime_trigger_payload: triggerPayload ?? null,
    runtime_trigger_meta: triggerMeta ?? {},
  };
}

async function getRunStatus(supabase: SupabaseClient, runId: string) {
  const { data } = await supabase
    .from("workflow_runs")
    .select("status, error_message")
    .eq("id", runId)
    .maybeSingle();

  return {
    status: data?.status ? String(data.status) : "",
    errorMessage: data?.error_message ? String(data.error_message) : "",
  };
}

export async function executeWorkflowRun({
  supabase,
  workflow,
  triggerSource,
  triggerPayload,
  triggerMeta,
}: ExecuteWorkflowRunInput): Promise<ExecuteWorkflowRunResult> {
  let runId = "";

  try {
    const { data: insertedRun, error: insertError } = await supabase
      .from("workflow_runs")
      .insert({
        workflow_id: workflow.id,
        workspace_id: workflow.workspace_id,
        status: "queued",
        trigger_source: triggerSource,
      })
      .select("id")
      .single();

    if (insertError || !insertedRun) {
      throw new Error(insertError?.message ?? "Unable to create run");
    }

    runId = insertedRun.id;

    const { error: runningError } = await supabase
      .from("workflow_runs")
      .update({
        status: "running",
        started_at: new Date().toISOString(),
      })
      .eq("id", runId)
      .eq("status", "queued");

    if (runningError) {
      throw new Error(runningError.message);
    }

    const connectionIds = listConnectionIds(workflow.graph);
    const connectionsById = await loadIntegrationConnections(
      supabase,
      workflow.workspace_id,
      connectionIds,
    );
    const resolvedGraph = resolveGraphWithConnections(workflow.graph, connectionsById);
    const validationReport = validateWorkflowGraph(resolvedGraph);

    if (!validationReport.valid) {
      throw new Error(validationFailureMessage(validationReport));
    }

    const result = await runWorkflowWithEngine({
      run_id: runId,
      workflow_id: workflow.id,
      workspace_id: workflow.workspace_id,
      workflow_name: workflow.name,
      trigger_source: triggerSource,
      nodes: resolvedGraph.nodes,
      edges: resolvedGraph.edges,
      settings: buildRuntimeSettings(workflow.settings, triggerPayload, triggerMeta),
    });

    if (result.logs.length) {
      const { error: logError } = await supabase.from("run_logs").insert(
        result.logs.map((log) => ({
          run_id: runId,
          workflow_id: workflow.id,
          workspace_id: workflow.workspace_id,
          node_id: log.node_id,
          level: log.level,
          message: log.message,
          payload: log.payload,
        })),
      );

      if (logError) {
        throw new Error(logError.message);
      }
    }

    const runErrorMessage =
      result.status === "succeeded" ? "" : readOutputErrorMessage(result.output) || "Run failed in engine.";

    const { data: finalUpdate, error: updateError } = await supabase
      .from("workflow_runs")
      .update({
        status: result.status,
        output: result.output,
        error_message: runErrorMessage,
        started_at: result.started_at,
        finished_at: result.finished_at,
      })
      .eq("id", runId)
      .eq("status", "running")
      .select("id")
      .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (!finalUpdate) {
      const current = await getRunStatus(supabase, runId);
      if (current.status === "cancelled") {
        return {
          runId,
          result: {
            ...result,
            status: "failed",
            output: {
              ...result.output,
              cancelled: true,
            },
          },
          runErrorMessage: current.errorMessage || "Run was cancelled by user.",
        };
      }

      throw new Error("Unable to finalize run status.");
    }

    return {
      runId,
      result,
      runErrorMessage,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "The engine could not complete the run.";

    if (runId) {
      const current = await getRunStatus(supabase, runId);

      if (current.status !== "cancelled") {
        await supabase.from("run_logs").insert({
          run_id: runId,
          workflow_id: workflow.id,
          workspace_id: workflow.workspace_id,
          node_id: null,
          level: "error",
          message: "Run failed before completion.",
          payload: {
            error: errorMessage,
          },
        });

        await supabase
          .from("workflow_runs")
          .update({
            status: "failed",
            error_message: errorMessage,
            finished_at: new Date().toISOString(),
          })
          .eq("id", runId)
          .in("status", ["queued", "running"]);
      }
    }

    throw new Error(errorMessage);
  }
}
