import { readCorrelationId } from "./correlation.ts";

type BuildEnqueueRunJobPayloadInput = {
  workflowId: string;
  workspaceId: string;
  triggerSource: string;
  triggerPayload?: unknown;
  triggerMeta?: Record<string, unknown>;
  createdByUserId?: string | null;
  maxAttempts?: number;
  availableAt?: string;
};

type JobFailurePlanInput = {
  errorMessage: string;
  errorClass: string;
  attemptCount: number;
  maxAttempts: number;
  requestCorrelationId: string;
  runId?: string | null;
  baseTime?: Date;
};

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function resolveJobCorrelationId(value: unknown) {
  return readCorrelationId(value, "fh_job");
}

export function retryDelaySeconds(attemptCount: number) {
  return Math.min(300, Math.max(10, attemptCount * 15));
}

export function nextAvailableAtFrom(baseTime: Date, seconds: number) {
  return new Date(baseTime.getTime() + seconds * 1000).toISOString();
}

export function lockUntilFrom(baseTime: Date, minutes = 5) {
  return new Date(baseTime.getTime() + minutes * 60_000).toISOString();
}

export function shouldRetryJob(errorMessage: string) {
  const normalized = errorMessage.toLowerCase();
  const nonRetryablePhrases = [
    "workflow graph is invalid",
    "workflow not found",
    "workflow is archived",
    "missing or inactive integration connection",
    "connection provider mismatch",
    "unauthorized",
    "missing workflow id",
  ];

  return !nonRetryablePhrases.some((phrase) => normalized.includes(phrase));
}

export function buildEnqueueRunJobPayload({
  workflowId,
  workspaceId,
  triggerSource,
  triggerPayload,
  triggerMeta,
  createdByUserId,
  maxAttempts = 3,
  availableAt,
}: BuildEnqueueRunJobPayloadInput) {
  const requestCorrelationId = resolveJobCorrelationId(triggerMeta?.request_correlation_id);
  const resolvedTriggerMeta = {
    ...(triggerMeta ?? {}),
    request_correlation_id: requestCorrelationId,
  };

  const insertPayload: Record<string, unknown> = {
    workflow_id: workflowId,
    workspace_id: workspaceId,
    created_by_user_id: createdByUserId ?? null,
    status: "queued",
    trigger_source: triggerSource,
    trigger_meta: resolvedTriggerMeta,
    request_correlation_id: requestCorrelationId,
    max_attempts: Math.max(1, maxAttempts),
    available_at: availableAt ?? new Date().toISOString(),
  };

  if (triggerPayload !== undefined && triggerPayload !== null) {
    insertPayload.trigger_payload = triggerPayload;
  }

  return {
    insertPayload,
    requestCorrelationId,
    triggerMeta: resolvedTriggerMeta,
  };
}

export function planJobFailure({
  errorMessage,
  errorClass,
  attemptCount,
  maxAttempts,
  requestCorrelationId,
  runId,
  baseTime = new Date(),
}: JobFailurePlanInput) {
  const retryable = shouldRetryJob(errorMessage) && attemptCount < maxAttempts;

  if (retryable) {
    const availableAt = nextAvailableAtFrom(baseTime, retryDelaySeconds(attemptCount));
    return {
      shouldRetry: true,
      nextAvailableAt: availableAt,
      update: {
        status: "queued",
        run_id: runId ?? null,
        request_correlation_id: requestCorrelationId,
        error_message: errorMessage,
        last_error_class: errorClass,
        available_at: availableAt,
        lock_until: null,
      },
    };
  }

  return {
    shouldRetry: false,
    update: {
      status: "failed",
      run_id: runId ?? null,
      request_correlation_id: requestCorrelationId,
      error_message: errorMessage,
      last_error_class: errorClass,
      finished_at: baseTime.toISOString(),
      lock_until: null,
    },
  };
}

