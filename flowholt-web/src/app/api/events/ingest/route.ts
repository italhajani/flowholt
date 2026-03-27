import { NextRequest, NextResponse } from "next/server";

import { createCorrelationId, readCorrelationId } from "@/lib/flowholt/correlation";
import {
  buildEventTriggerMeta,
  findMatchingEventTriggers,
  type WorkspaceEventInput,
} from "@/lib/flowholt/event-trigger-logic";
import { consumeRateLimit, getRequestIdentifier, isRateLimitError } from "@/lib/flowholt/rate-limit";
import { enqueueWorkflowRunJob } from "@/lib/flowholt/run-queue";
import {
  getWorkspaceUsageErrorMessage,
  isWorkspaceUsageLimitError,
} from "@/lib/flowholt/usage-limits";
import type { WorkflowRecord } from "@/lib/flowholt/types";
import { createAdminClient } from "@/lib/supabase/admin";

const EVENT_RATE_LIMIT = {
  maxRequests: 60,
  windowSeconds: 60,
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readEventKey(request: NextRequest) {
  return (
    request.headers.get("x-flowholt-event-key") ?? request.nextUrl.searchParams.get("key") ?? ""
  ).trim();
}

function readIncomingCorrelationId(request: NextRequest) {
  return readCorrelationId(
    request.headers.get("x-flowholt-correlation-id") ?? request.nextUrl.searchParams.get("correlation_id"),
    "fh_event",
  );
}

function readEventInput(body: unknown): WorkspaceEventInput {
  const record = asRecord(body);
  return {
    workspaceId: asString(record.workspaceId ?? record.workspace_id),
    eventName: asString(record.eventName ?? record.event_name),
    eventSource: asString(record.eventSource ?? record.event_source),
    payload: record.payload,
    metadata: asRecord(record.metadata),
  };
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const requestCorrelationId = readIncomingCorrelationId(request) || createCorrelationId("fh_event");
  const configuredKey = (process.env.FLOWHOLT_EVENT_KEY ?? "").trim();

  if (!configuredKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "FLOWHOLT_EVENT_KEY is not configured.",
        request_correlation_id: requestCorrelationId,
      },
      { status: 500, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  if (readEventKey(request) !== configuredKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Event authentication failed.",
        request_correlation_id: requestCorrelationId,
      },
      { status: 401, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Event body must be valid JSON.",
        request_correlation_id: requestCorrelationId,
      },
      { status: 400, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  const event = readEventInput(body);
  if (!event.workspaceId || !event.eventName) {
    return NextResponse.json(
      {
        ok: false,
        error: "workspaceId and eventName are required.",
        request_correlation_id: requestCorrelationId,
      },
      { status: 400, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  try {
    await consumeRateLimit({
      supabase,
      scope: "workspace.event",
      identifier: `${event.workspaceId}:${getRequestIdentifier(request)}`,
      maxRequests: EVENT_RATE_LIMIT.maxRequests,
      windowSeconds: EVENT_RATE_LIMIT.windowSeconds,
    });
  } catch (error) {
    if (isRateLimitError(error)) {
      return NextResponse.json(
        {
          ok: false,
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
        ok: false,
        error: error instanceof Error ? error.message : "Event rate-limit check failed.",
        request_correlation_id: requestCorrelationId,
      },
      { status: 500, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  const { data: workflowRows, error: workflowError } = await supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .eq("workspace_id", event.workspaceId)
    .neq("status", "archived")
    .order("created_at", { ascending: true });

  if (workflowError) {
    return NextResponse.json(
      {
        ok: false,
        error: workflowError.message,
        request_correlation_id: requestCorrelationId,
      },
      { status: 500, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  const workflows = (workflowRows ?? []) as WorkflowRecord[];
  const results: Array<Record<string, unknown>> = [];
  let queuedRuns = 0;

  for (const workflow of workflows) {
    const matches = findMatchingEventTriggers(workflow, event);
    if (!matches.length) {
      continue;
    }

    try {
      const job = await enqueueWorkflowRunJob({
        supabase,
        workflow,
        triggerSource: "event",
        triggerPayload: event.payload,
        triggerMeta: {
          ...buildEventTriggerMeta(event, matches),
          received_at: new Date().toISOString(),
          request_correlation_id: requestCorrelationId,
        },
        createdByUserId: null,
      });

      queuedRuns += 1;
      results.push({
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        status: "queued",
        job_id: job.id,
        matched_trigger_ids: matches.map((match) => match.nodeId),
        matched_trigger_labels: matches.map((match) => match.nodeLabel),
      });
    } catch (error) {
      const status = isWorkspaceUsageLimitError(error) ? "blocked" : "failed";
      const message = getWorkspaceUsageErrorMessage(error, "Unable to queue event workflow run.");

      results.push({
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        status,
        error: message,
        matched_trigger_ids: matches.map((match) => match.nodeId),
        matched_trigger_labels: matches.map((match) => match.nodeLabel),
      });
    }
  }

  return NextResponse.json(
    {
      ok: true,
      event_name: event.eventName,
      event_source: event.eventSource ?? "",
      matched_workflows: results.length,
      queued_runs: queuedRuns,
      results,
      request_correlation_id: requestCorrelationId,
    },
    {
      status: 202,
      headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId },
    },
  );
}
