import type { SupabaseClient } from "@supabase/supabase-js";

import { createCorrelationId, readCorrelationId } from "@/lib/flowholt/correlation";
import {
  runWorkflowWithEngine,
  type EngineNodeExecution,
  type EngineRunResponse,
} from "@/lib/flowholt/engine";
import {
  asRecord,
  expectedConnectionProviderForNode,
  readNodeConnectionId,
  requiresConnectionForNode,
  resolveNodeConfigWithConnection,
  type IntegrationConnectionRuntime,
} from "@/lib/flowholt/integration-runtime";
import {
  validateWorkflowGraph,
  validationFailureMessage,
} from "@/lib/flowholt/graph-validator";
import type { WorkflowGraph, WorkflowRecord } from "@/lib/flowholt/types";

export class WorkflowExecutionError extends Error {
  runId: string;

  constructor(message: string, runId = "") {
    super(message);
    this.name = "WorkflowExecutionError";
    this.runId = runId;
  }
}

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
  requestCorrelationId: string;
};

function listConnectionIds(graph: WorkflowGraph) {
  return [...new Set(graph.nodes.map((node) => readNodeConnectionId(asRecord(node.config))).filter(Boolean))];
}

function resolveRequestCorrelationId(triggerMeta?: Record<string, unknown>) {
  return readCorrelationId(triggerMeta?.request_correlation_id, "fh_run");
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
    .select("id, provider, label, status, config, secrets")
    .eq("workspace_id", workspaceId)
    .in("id", connectionIds)
    .eq("status", "active");

  if (error) {
    throw new Error(`Unable to load integration connections: ${error.message}`);
  }

  const rows = (data ?? []) as Array<{
    id: string;
    provider: string;
    label: string | null;
    config: Record<string, unknown> | null;
    secrets: Record<string, unknown> | null;
  }>;

  return new Map<string, IntegrationConnectionRuntime>(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        provider: row.provider,
        label: row.label ?? undefined,
        config: row.config ?? {},
        secrets: row.secrets ?? {},
      },
    ]),
  );
}

function resolveGraphWithConnections(
  graph: WorkflowGraph,
  connectionsById: Map<string, IntegrationConnectionRuntime>,
): WorkflowGraph {
  const missingRequiredConnections: string[] = [];
  const providerMismatches: string[] = [];

  const nodes = graph.nodes.map((node) => {
    const config = asRecord(node.config);
    const connectionId = readNodeConnectionId(config);
    const expectedProvider = expectedConnectionProviderForNode(node.type, config);
    const connection = connectionId ? connectionsById.get(connectionId) ?? null : null;

    if (!connection && requiresConnectionForNode(node.type, config)) {
      missingRequiredConnections.push(
        `${node.label} requires ${expectedProvider ?? "a compatible"} connection`,
      );
    }

    if (connection && expectedProvider && connection.provider !== expectedProvider) {
      providerMismatches.push(
        `${node.label} expects ${expectedProvider} but received ${connection.provider}`,
      );
    }

    return {
      ...node,
      config: resolveNodeConfigWithConnection(node.type, config, connection),
    };
  });

  if (missingRequiredConnections.length) {
    throw new Error(
      `Missing required integration connection(s): ${missingRequiredConnections.join("; ")}`,
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
  triggerPayload: unknown,
  triggerMeta: Record<string, unknown> | undefined,
  requestCorrelationId: string,
) {
  const baseSettings = asRecord(settings);

  return {
    ...baseSettings,
    runtime_trigger_payload: triggerPayload ?? null,
    runtime_trigger_meta: triggerMeta ?? {},
    runtime_request_correlation_id: requestCorrelationId,
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

async function insertRunLogs(
  supabase: SupabaseClient,
  workflow: WorkflowRecord,
  runId: string,
  result: EngineRunResponse,
  requestCorrelationId: string,
) {
  if (!result.logs.length) {
    return;
  }

  const { error } = await supabase.from("run_logs").insert(
    result.logs.map((log) => ({
      run_id: runId,
      workflow_id: workflow.id,
      workspace_id: workflow.workspace_id,
      node_id: log.node_id,
      level: log.level,
      message: log.message,
      payload: {
        ...asRecord(log.payload),
        request_correlation_id: requestCorrelationId,
      },
    })),
  );

  if (error) {
    throw new Error(error.message);
  }
}

function mapNodeExecutionRow(
  workflow: WorkflowRecord,
  runId: string,
  execution: EngineNodeExecution,
) {
  return {
    run_id: runId,
    workflow_id: workflow.id,
    workspace_id: workflow.workspace_id,
    node_id: execution.node_id,
    node_label: execution.node_label,
    node_type: execution.node_type,
    sequence: execution.sequence,
    status: execution.status,
    attempt_count: execution.attempt_count,
    duration_ms: execution.duration_ms,
    started_at: execution.started_at,
    finished_at: execution.finished_at,
    error_class: execution.error_class ?? "",
    error_message: execution.error_message ?? "",
    token_estimate: execution.token_estimate ?? 0,
    output_summary: execution.output_summary ?? {},
  };
}

async function insertNodeExecutions(
  supabase: SupabaseClient,
  workflow: WorkflowRecord,
  runId: string,
  result: EngineRunResponse,
) {
  if (!Array.isArray(result.node_executions) || !result.node_executions.length) {
    return;
  }

  const { error } = await supabase.from("workflow_node_executions").insert(
    result.node_executions.map((execution) => mapNodeExecutionRow(workflow, runId, execution)),
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function executeWorkflowRun({
  supabase,
  workflow,
  triggerSource,
  triggerPayload,
  triggerMeta,
}: ExecuteWorkflowRunInput): Promise<ExecuteWorkflowRunResult> {
  let runId = "";
  const requestCorrelationId = resolveRequestCorrelationId(triggerMeta);

  try {
    const { data: insertedRun, error: insertError } = await supabase
      .from("workflow_runs")
      .insert({
        workflow_id: workflow.id,
        workspace_id: workflow.workspace_id,
        status: "queued",
        trigger_source: triggerSource,
        request_correlation_id: requestCorrelationId,
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
      request_correlation_id: requestCorrelationId,
      nodes: resolvedGraph.nodes,
      edges: resolvedGraph.edges,
      settings: buildRuntimeSettings(workflow.settings, triggerPayload, triggerMeta, requestCorrelationId),
    });

    await insertRunLogs(supabase, workflow, runId, result, requestCorrelationId);
    await insertNodeExecutions(supabase, workflow, runId, result);

    const runErrorMessage =
      result.status === "succeeded" ? "" : readOutputErrorMessage(result.output) || "Run failed in engine.";

    const { data: finalUpdate, error: updateError } = await supabase
      .from("workflow_runs")
      .update({
        status: result.status,
        output: {
          ...result.output,
          request_correlation_id: requestCorrelationId,
        },
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
              request_correlation_id: requestCorrelationId,
            },
          },
          runErrorMessage: current.errorMessage || "Run was cancelled by user.",
          requestCorrelationId,
        };
      }

      throw new Error("Unable to finalize run status.");
    }

    return {
      runId,
      result,
      runErrorMessage,
      requestCorrelationId,
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
            request_correlation_id: requestCorrelationId,
          },
        });

        await supabase
          .from("workflow_runs")
          .update({
            status: "failed",
            error_message: errorMessage,
            finished_at: new Date().toISOString(),
            output: {
              request_correlation_id: requestCorrelationId,
            },
          })
          .eq("id", runId)
          .in("status", ["queued", "running"]);
      }

      throw new WorkflowExecutionError(errorMessage, runId);
    }

    throw new Error(errorMessage || `Workflow execution failed before run creation. Trace: ${requestCorrelationId || createCorrelationId("fh_fail")}`);
  }
}

