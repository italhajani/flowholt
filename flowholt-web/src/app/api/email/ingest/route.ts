import { NextRequest, NextResponse } from "next/server";

import { createCorrelationId, readCorrelationId } from "@/lib/flowholt/correlation";
import {
  buildEmailTriggerMeta,
  findMatchingEmailTriggers,
  type WorkspaceEmailInput,
} from "@/lib/flowholt/email-trigger-logic";
import { consumeRateLimit, getRequestIdentifier, isRateLimitError } from "@/lib/flowholt/rate-limit";
import { compareSecretsConstantTime, validateProtectedEndpointSecret } from "@/lib/flowholt/security";
import { enqueueWorkflowRunJob } from "@/lib/flowholt/run-queue";
import {
  getWorkspaceUsageErrorMessage,
  isWorkspaceUsageLimitError,
} from "@/lib/flowholt/usage-limits";
import type { WorkflowRecord } from "@/lib/flowholt/types";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RATE_LIMIT = {
  maxRequests: 30,
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

function readEmailKey(request: NextRequest) {
  return (
    request.headers.get("x-flowholt-email-key") ?? request.nextUrl.searchParams.get("key") ?? ""
  ).trim();
}

function readIncomingCorrelationId(request: NextRequest) {
  return readCorrelationId(
    request.headers.get("x-flowholt-correlation-id") ?? request.nextUrl.searchParams.get("correlation_id"),
    "fh_email",
  );
}

function readEmailInput(body: unknown): WorkspaceEmailInput {
  const record = asRecord(body);
  return {
    workspaceId: asString(record.workspaceId ?? record.workspace_id),
    to: asString(record.to),
    from: asString(record.from),
    subject: asString(record.subject),
    text: asString(record.text),
    html: asString(record.html),
    headers: asRecord(record.headers),
    metadata: asRecord(record.metadata),
    providerMessageId: asString(record.providerMessageId ?? record.provider_message_id),
  };
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const requestCorrelationId = readIncomingCorrelationId(request) || createCorrelationId("fh_email");
  const configuredSecret = validateProtectedEndpointSecret(process.env.FLOWHOLT_EMAIL_KEY ?? "", "FLOWHOLT_EMAIL_KEY");

  if (!configuredSecret.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: configuredSecret.message,
        request_correlation_id: requestCorrelationId,
      },
      { status: 500, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  if (!compareSecretsConstantTime(readEmailKey(request), configuredSecret.value)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Email authentication failed.",
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
        error: "Email body must be valid JSON.",
        request_correlation_id: requestCorrelationId,
      },
      { status: 400, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  const email = readEmailInput(body);
  if (!email.workspaceId || !email.to) {
    return NextResponse.json(
      {
        ok: false,
        error: "workspaceId and to are required.",
        request_correlation_id: requestCorrelationId,
      },
      { status: 400, headers: { "X-FlowHolt-Correlation-Id": requestCorrelationId } },
    );
  }

  try {
    await consumeRateLimit({
      supabase,
      scope: "workspace.email",
      identifier: `${email.workspaceId}:${getRequestIdentifier(request)}`,
      maxRequests: EMAIL_RATE_LIMIT.maxRequests,
      windowSeconds: EMAIL_RATE_LIMIT.windowSeconds,
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
        error: error instanceof Error ? error.message : "Email rate-limit check failed.",
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
    .eq("workspace_id", email.workspaceId)
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
    const matches = findMatchingEmailTriggers(workflow, email);
    if (!matches.length) {
      continue;
    }

    try {
      const job = await enqueueWorkflowRunJob({
        supabase,
        workflow,
        triggerSource: "email",
        triggerPayload: {
          to: email.to,
          from: email.from,
          subject: email.subject,
          text: email.text,
          html: email.html,
          headers: email.headers,
        },
        triggerMeta: {
          ...buildEmailTriggerMeta(email, matches),
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
      const message = getWorkspaceUsageErrorMessage(error, "Unable to queue email workflow run.");

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
      email_to: email.to,
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

