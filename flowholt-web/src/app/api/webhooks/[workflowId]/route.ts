import { createHash } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { createCorrelationId, readCorrelationId } from "@/lib/flowholt/correlation";
import { drainWorkflowRunJobs, enqueueWorkflowRunJob } from "@/lib/flowholt/run-queue";
import { consumeRateLimit, getRequestIdentifier, isRateLimitError } from "@/lib/flowholt/rate-limit";
import {
  getWorkspaceUsageErrorMessage,
  isWorkspaceUsageLimitError,
} from "@/lib/flowholt/usage-limits";
import type { WorkflowNode, WorkflowRecord } from "@/lib/flowholt/types";
import { createAdminClient } from "@/lib/supabase/admin";

const WEBHOOK_RATE_LIMIT = {
  maxRequests: 30,
  windowSeconds: 60,
};

const RECEIPT_FIELDS =
  "id, workflow_id, workspace_id, idempotency_key, request_method, request_path, request_fingerprint, status, run_job_id, run_id, response_payload, response_status, request_count, last_seen_at, created_at, updated_at";

type RouteContext = {
  params: Promise<{ workflowId: string }> | { workflowId: string };
};

type WebhookConnectionRow = {
  id: string;
  label: string;
  config: Record<string, unknown>;
  secrets: Record<string, unknown>;
};

type WebhookEventReceiptRow = {
  id: number;
  workflow_id: string;
  workspace_id: string;
  idempotency_key: string;
  request_method: string;
  request_path: string;
  request_fingerprint: string;
  status: "received" | "queued" | "succeeded" | "failed";
  run_job_id: string | null;
  run_id: string | null;
  response_payload: Record<string, unknown>;
  response_status: number;
  request_count: number;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asReceiptStatus(value: unknown): WebhookEventReceiptRow["status"] {
  return value === "queued" || value === "succeeded" || value === "failed" ? value : "received";
}

function toWebhookEventReceiptRow(value: unknown): WebhookEventReceiptRow {
  const row = asRecord(value);
  return {
    id: Number(row.id) || 0,
    workflow_id: asString(row.workflow_id),
    workspace_id: asString(row.workspace_id),
    idempotency_key: asString(row.idempotency_key),
    request_method: asString(row.request_method),
    request_path: asString(row.request_path),
    request_fingerprint: asString(row.request_fingerprint),
    status: asReceiptStatus(row.status),
    run_job_id: typeof row.run_job_id === "string" ? row.run_job_id : null,
    run_id: typeof row.run_id === "string" ? row.run_id : null,
    response_payload: asRecord(row.response_payload),
    response_status: Number(row.response_status) || 202,
    request_count: Number(row.request_count) || 1,
    last_seen_at: asString(row.last_seen_at),
    created_at: asString(row.created_at),
    updated_at: asString(row.updated_at),
  };
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

function readIdempotencyKey(request: NextRequest) {
  return (
    request.headers.get("idempotency-key") ??
    request.headers.get("x-flowholt-idempotency-key") ??
    request.nextUrl.searchParams.get("idempotency_key") ??
    ""
  ).trim();
}

function readIncomingCorrelationId(request: NextRequest) {
  return readCorrelationId(
    request.headers.get("x-flowholt-correlation-id") ?? request.nextUrl.searchParams.get("correlation_id"),
    "fh_webhook",
  );
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

function createRequestFingerprint(input: {
  method: string;
  path: string;
  query: Record<string, string>;
  payload: unknown;
}) {
  return createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");
}

function isIdempotencyUnavailable(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("webhook_event_receipts") || normalized.includes("does not exist");
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

async function getExistingReceipt(
  workflowId: string,
  idempotencyKey: string,
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("webhook_event_receipts")
    .select(RECEIPT_FIELDS)
    .eq("workflow_id", workflowId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toWebhookEventReceiptRow(data);
}

async function persistReceiptOutcome(
  receiptId: number | null,
  values: {
    status: WebhookEventReceiptRow["status"];
    response_status: number;
    response_payload: Record<string, unknown>;
    run_job_id?: string | null;
    run_id?: string | null;
  },
) {
  if (!receiptId) {
    return;
  }

  const supabase = createAdminClient();
  await supabase
    .from("webhook_event_receipts")
    .update({
      status: values.status,
      response_status: values.response_status,
      response_payload: values.response_payload,
      run_job_id: values.run_job_id ?? null,
      run_id: values.run_id ?? null,
      last_seen_at: new Date().toISOString(),
    })
    .eq("id", receiptId);
}

async function createOrReuseReceipt(input: {
  workflowId: string;
  workspaceId: string;
  idempotencyKey: string;
  requestMethod: string;
  requestPath: string;
  requestFingerprint: string;
}) {
  if (!input.idempotencyKey) {
    return { enabled: false, duplicate: false, receipt: null as WebhookEventReceiptRow | null };
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("webhook_event_receipts")
    .insert({
      workflow_id: input.workflowId,
      workspace_id: input.workspaceId,
      idempotency_key: input.idempotencyKey,
      request_method: input.requestMethod,
      request_path: input.requestPath,
      request_fingerprint: input.requestFingerprint,
      status: "received",
      response_payload: {},
      response_status: 202,
      request_count: 1,
      last_seen_at: nowIso,
    })
    .select(RECEIPT_FIELDS)
    .maybeSingle();

  if (!error && data) {
    return {
      enabled: true,
      duplicate: false,
      receipt: toWebhookEventReceiptRow(data),
    };
  }

  if (error && isIdempotencyUnavailable(error.message)) {
    return { enabled: false, duplicate: false, receipt: null as WebhookEventReceiptRow | null };
  }

  if (error?.code === "23505") {
    const existing = await getExistingReceipt(input.workflowId, input.idempotencyKey);
    if (!existing) {
      return { enabled: false, duplicate: false, receipt: null as WebhookEventReceiptRow | null };
    }

    if (existing.request_fingerprint && existing.request_fingerprint !== input.requestFingerprint) {
      return {
        enabled: true,
        duplicate: true,
        receipt: existing,
        fingerprintConflict: true,
      };
    }

    await supabase
      .from("webhook_event_receipts")
      .update({
        request_count: Math.max(1, existing.request_count) + 1,
        last_seen_at: nowIso,
      })
      .eq("id", existing.id);

    return {
      enabled: true,
      duplicate: true,
      receipt: {
        ...existing,
        request_count: Math.max(1, existing.request_count) + 1,
        last_seen_at: nowIso,
      },
    };
  }

  throw new Error(error?.message ?? "Unable to create webhook receipt.");
}

function buildReplayResponse(receipt: WebhookEventReceiptRow) {
  const payload = {
    ...receipt.response_payload,
    idempotent_replay: true,
    idempotency_key: receipt.idempotency_key,
  };

  return NextResponse.json(payload, {
    status: receipt.response_status || 202,
  });
}

async function handleWebhook(request: NextRequest, context: RouteContext) {
  const { workflowId } = await Promise.resolve(context.params);

  if (!workflowId) {
    return NextResponse.json({ error: "Missing workflow id." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const requestCorrelationId = readIncomingCorrelationId(request) || createCorrelationId("fh_webhook");

  try {
    await consumeRateLimit({
      supabase,
      scope: "workflow.webhook",
      identifier: `${workflowId}:${getRequestIdentifier(request)}`,
      maxRequests: WEBHOOK_RATE_LIMIT.maxRequests,
      windowSeconds: WEBHOOK_RATE_LIMIT.windowSeconds,
    });
  } catch (error) {
    if (isRateLimitError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          retry_after_seconds: error.retryAfterSeconds,
          request_correlation_id: requestCorrelationId,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(error.retryAfterSeconds),
            "X-FlowHolt-Correlation-Id": requestCorrelationId,
          },
        },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Webhook limit check failed.",
        request_correlation_id: requestCorrelationId,
      },
      { status: 500, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  const { data: workflowRow, error: workflowError } = await supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .eq("id", workflowId)
    .maybeSingle();

  if (workflowError || !workflowRow) {
    return NextResponse.json(
      { error: "Workflow not found.", request_correlation_id: requestCorrelationId },
      { status: 404, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  const workflow = workflowRow as WorkflowRecord;

  if (workflow.status === "archived") {
    return NextResponse.json(
      { error: "Workflow is archived.", request_correlation_id: requestCorrelationId },
      { status: 409, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  const triggerNodes = workflow.graph.nodes.filter((node) => node.type === "trigger");
  if (!triggerNodes.length) {
    return NextResponse.json(
      { error: "Workflow has no trigger nodes configured.", request_correlation_id: requestCorrelationId },
      { status: 400, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  const connectionIds = [...new Set(triggerNodes.map(readConnectionId).filter(Boolean))];
  if (!connectionIds.length) {
    return NextResponse.json(
      { error: "No webhook trigger connection is configured on trigger nodes.", request_correlation_id: requestCorrelationId },
      { status: 400, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
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
      {
        error: `Unable to load webhook connections: ${connectionError.message}`,
        request_correlation_id: requestCorrelationId,
      },
      { status: 500, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
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
          {
            error: "Webhook method does not match configured trigger method.",
            allow,
            request_correlation_id: requestCorrelationId,
          },
          { status: 405, headers: { Allow: allow, "X-FlowHolt-Correlation-Id": requestCorrelationId } },
        );
      }
    }

    return NextResponse.json(
      { error: "Webhook authentication failed for this workflow trigger.", request_correlation_id: requestCorrelationId },
      { status: 401, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  const payload = await readWebhookPayload(request);
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const idempotencyKey = readIdempotencyKey(request);
  const requestFingerprint = createRequestFingerprint({
    method: request.method,
    path: request.nextUrl.pathname,
    query,
    payload,
  });

  let receiptId: number | null = null;

  try {
    const receiptState = await createOrReuseReceipt({
      workflowId,
      workspaceId: workflow.workspace_id,
      idempotencyKey,
      requestMethod: request.method,
      requestPath: request.nextUrl.pathname,
      requestFingerprint,
    });

    if (receiptState.receipt) {
      receiptId = receiptState.receipt.id;
    }

    if (receiptState.fingerprintConflict) {
      return NextResponse.json(
        {
          error: "This idempotency key was already used with a different webhook payload.",
          idempotency_key: idempotencyKey,
          request_correlation_id: requestCorrelationId,
        },
        { status: 409, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
      );
    }

    if (receiptState.duplicate && receiptState.receipt) {
      return buildReplayResponse(receiptState.receipt);
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Webhook idempotency check failed.",
        request_correlation_id: requestCorrelationId,
      },
      { status: 500, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

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
        idempotency_key: idempotencyKey || undefined,
        received_at: new Date().toISOString(),
        request_correlation_id: requestCorrelationId,
      },
      createdByUserId: null,
    });

    const [result] = await drainWorkflowRunJobs({
      supabase,
      limit: 1,
      jobIds: [job.id],
    });

    if (!result) {
      const responsePayload = {
        ok: true,
        accepted: true,
        job_id: job.id,
        request_correlation_id: job.request_correlation_id ?? requestCorrelationId,
        message: "Webhook accepted and queued.",
      };
      await persistReceiptOutcome(receiptId, {
        status: "queued",
        response_status: 202,
        response_payload: responsePayload,
        run_job_id: job.id,
      });
      return NextResponse.json(responsePayload, {
        status: 202,
        headers: { "X-FlowHolt-Correlation-Id": responsePayload.request_correlation_id },
      });
    }

    if (result.status === "queued") {
      const responsePayload = {
        ok: true,
        accepted: true,
        job_id: job.id,
        run_id: result.runId,
        request_correlation_id: result.requestCorrelationId,
        message: "Webhook accepted and queued for retry.",
      };
      await persistReceiptOutcome(receiptId, {
        status: "queued",
        response_status: 202,
        response_payload: responsePayload,
        run_job_id: job.id,
        run_id: result.runId ?? null,
      });
      return NextResponse.json(responsePayload, {
        status: 202,
        headers: { "X-FlowHolt-Correlation-Id": result.requestCorrelationId },
      });
    }

    if (result.status === "succeeded") {
      const responsePayload = {
        ok: true,
        status: result.status,
        job_id: job.id,
        run_id: result.runId,
        request_correlation_id: result.requestCorrelationId,
        message: "Webhook run completed successfully.",
      };
      await persistReceiptOutcome(receiptId, {
        status: "succeeded",
        response_status: 200,
        response_payload: responsePayload,
        run_job_id: job.id,
        run_id: result.runId ?? null,
      });
      return NextResponse.json(responsePayload, {
        headers: { "X-FlowHolt-Correlation-Id": result.requestCorrelationId },
      });
    }

    const failedPayload = {
      ok: false,
      status: result.status,
      job_id: job.id,
      run_id: result.runId,
      request_correlation_id: result.requestCorrelationId,
      error: result.error || "Webhook run failed.",
    };
    await persistReceiptOutcome(receiptId, {
      status: "failed",
      response_status: 500,
      response_payload: failedPayload,
      run_job_id: job.id,
      run_id: result.runId ?? null,
    });
    return NextResponse.json(failedPayload, {
      status: 500,
      headers: { "X-FlowHolt-Correlation-Id": result.requestCorrelationId },
    });
  } catch (error) {
    if (isRateLimitError(error)) {
      const limitedPayload = {
        ok: false,
        error: error.message,
        retry_after_seconds: error.retryAfterSeconds,
        request_correlation_id: requestCorrelationId,
      };
      await persistReceiptOutcome(receiptId, {
        status: "failed",
        response_status: 429,
        response_payload: limitedPayload,
      });
      return NextResponse.json(limitedPayload, {
        status: 429,
        headers: {
          "Retry-After": String(error.retryAfterSeconds),
          "X-FlowHolt-Correlation-Id": requestCorrelationId,
        },
      });
    }

    const status = isWorkspaceUsageLimitError(error) ? 409 : 500;
    const message = getWorkspaceUsageErrorMessage(error, "Webhook run failed.");
    const failedPayload = { ok: false, error: message, request_correlation_id: requestCorrelationId };
    await persistReceiptOutcome(receiptId, {
      status: "failed",
      response_status: status,
      response_payload: failedPayload,
    });
    return NextResponse.json(failedPayload, {
      status,
      headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId },
    });
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
