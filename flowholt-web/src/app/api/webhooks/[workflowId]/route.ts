import { NextRequest, NextResponse } from "next/server";

import { drainWorkflowRunJobs, enqueueWorkflowRunJob } from "@/lib/flowholt/run-queue";
import {
  getWorkspaceUsageErrorMessage,
  isWorkspaceUsageLimitError,
} from "@/lib/flowholt/usage-limits";
import type { WorkflowNode, WorkflowRecord } from "@/lib/flowholt/types";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ workflowId: string }> | { workflowId: string };
};

type WebhookConnectionRow = {
  id: string;
  label: string;
  config: Record<string, unknown>;
  secrets: Record<string, unknown>;
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

function normalizeMethod(value: unknown) {
  return String(value || "POST").toUpperCase();
}

function readWebhookKey(request: NextRequest) {
  return (
    request.headers.get("x-flowholt-key") ??
    request.nextUrl.searchParams.get("key") ??
    ""
  ).trim();
}

function sanitizeHeaders(headers: Headers) {
  const ignored = new Set(["authorization", "cookie", "x-flowholt-key"]);
  const output: Record<string, string> = {};

  for (const [key, value] of headers.entries()) {
    if (ignored.has(key.toLowerCase())) {
      continue;
    }
    output[key.toLowerCase()] = value;
  }

  return output;
}

async function readWebhookPayload(request: NextRequest): Promise<unknown> {
  if (request.method === "GET") {
    return Object.fromEntries(request.nextUrl.searchParams.entries());
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await request.json();
    } catch {
      return { raw: await request.text() };
    }
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    const record: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      record[key] = typeof value === "string" ? value : value.name;
    }
    return record;
  }

  const text = await request.text();
  return text ? { text } : null;
}

function findMatchingConnection(
  request: NextRequest,
  triggerNodes: WorkflowNode[],
  connectionsById: Map<string, WebhookConnectionRow>,
) {
  const requestMethod = request.method.toUpperCase();
  const providedKey = readWebhookKey(request);
  const configuredMethods = new Set<string>();

  for (const node of triggerNodes) {
    const connectionId = readConnectionId(node);
    if (!connectionId) {
      continue;
    }

    const connection = connectionsById.get(connectionId);
    if (!connection) {
      continue;
    }

    const config = asRecord(connection.config);
    const direction = String(config.direction ?? "inbound").toLowerCase();
    if (direction !== "inbound") {
      continue;
    }

    const expectedMethod = normalizeMethod(config.method);
    configuredMethods.add(expectedMethod);
    if (expectedMethod !== requestMethod) {
      continue;
    }

    const expectedKey = String(connection.secrets.api_key ?? "").trim();
    if (expectedKey && expectedKey !== providedKey) {
      continue;
    }

    return {
      matchedConnection: connection,
      configuredMethods,
    };
  }

  return {
    matchedConnection: null,
    configuredMethods,
  };
}

async function handleWebhook(request: NextRequest, context: RouteContext) {
  const { workflowId } = await Promise.resolve(context.params);

  if (!workflowId) {
    return NextResponse.json({ error: "Missing workflow id." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: workflowRow, error: workflowError } = await supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .eq("id", workflowId)
    .maybeSingle();

  if (workflowError || !workflowRow) {
    return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
  }

  const workflow = workflowRow as WorkflowRecord;

  if (workflow.status === "archived") {
    return NextResponse.json({ error: "Workflow is archived." }, { status: 409 });
  }

  const triggerNodes = workflow.graph.nodes.filter((node) => node.type === "trigger");
  if (!triggerNodes.length) {
    return NextResponse.json(
      { error: "Workflow has no trigger nodes configured." },
      { status: 400 },
    );
  }

  const connectionIds = [...new Set(triggerNodes.map(readConnectionId).filter(Boolean))];
  if (!connectionIds.length) {
    return NextResponse.json(
      { error: "No webhook trigger connection is configured on trigger nodes." },
      { status: 400 },
    );
  }

  const { data: connectionRows, error: connectionError } = await supabase
    .from("integration_connections")
    .select("id, label, config, secrets")
    .eq("workspace_id", workflow.workspace_id)
    .eq("provider", "webhook")
    .eq("status", "active")
    .in("id", connectionIds);

  if (connectionError) {
    return NextResponse.json(
      { error: `Unable to load webhook connections: ${connectionError.message}` },
      { status: 500 },
    );
  }

  const connections = (connectionRows ?? []) as Array<{
    id: string;
    label: string;
    config: Record<string, unknown> | null;
    secrets: Record<string, unknown> | null;
  }>;

  const connectionsById = new Map<string, WebhookConnectionRow>(
    connections.map((row) => [
      row.id,
      {
        id: row.id,
        label: row.label,
        config: row.config ?? {},
        secrets: row.secrets ?? {},
      },
    ]),
  );

  const { matchedConnection, configuredMethods } = findMatchingConnection(
    request,
    triggerNodes,
    connectionsById,
  );

  if (!matchedConnection) {
    if (configuredMethods.size) {
      const allow = Array.from(configuredMethods).join(", ");
      if (!configuredMethods.has(request.method.toUpperCase())) {
        return NextResponse.json(
          { error: "Webhook method does not match configured trigger method.", allow },
          { status: 405, headers: { Allow: allow } },
        );
      }
    }

    return NextResponse.json(
      { error: "Webhook authentication failed for this workflow trigger." },
      { status: 401 },
    );
  }

  const payload = await readWebhookPayload(request);
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());

  try {
    const job = await enqueueWorkflowRunJob({
      supabase,
      workflow,
      triggerSource: "webhook",
      triggerPayload: payload,
      triggerMeta: {
        request_method: request.method,
        request_path: request.nextUrl.pathname,
        query,
        headers: sanitizeHeaders(request.headers),
        webhook_connection_id: matchedConnection.id,
        webhook_connection_label: matchedConnection.label,
        received_at: new Date().toISOString(),
      },
      createdByUserId: null,
    });

    const [result] = await drainWorkflowRunJobs({
      supabase,
      limit: 1,
      jobIds: [job.id],
    });

    if (!result) {
      return NextResponse.json(
        {
          ok: true,
          accepted: true,
          job_id: job.id,
          message: "Webhook accepted and queued.",
        },
        { status: 202 },
      );
    }

    if (result.status === "queued") {
      return NextResponse.json(
        {
          ok: true,
          accepted: true,
          job_id: job.id,
          run_id: result.runId,
          message: "Webhook accepted and queued for retry.",
        },
        { status: 202 },
      );
    }

    if (result.status === "succeeded") {
      return NextResponse.json({
        ok: true,
        status: result.status,
        job_id: job.id,
        run_id: result.runId,
        message: "Webhook run completed successfully.",
      });
    }

    return NextResponse.json(
      {
        ok: false,
        status: result.status,
        job_id: job.id,
        run_id: result.runId,
        error: result.error || "Webhook run failed.",
      },
      { status: 500 },
    );
  } catch (error) {
    const status = isWorkspaceUsageLimitError(error) ? 409 : 500;
    const message = getWorkspaceUsageErrorMessage(error, "Webhook run failed.");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handleWebhook(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleWebhook(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handleWebhook(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleWebhook(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handleWebhook(request, context);
}
