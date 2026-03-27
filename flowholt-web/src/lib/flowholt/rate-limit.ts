import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

export class RateLimitError extends Error {
  retryAfterSeconds: number;
  scope: string;
  limit: number;
  requestCount: number;

  constructor({
    scope,
    retryAfterSeconds,
    limit,
    requestCount,
    message,
  }: {
    scope: string;
    retryAfterSeconds: number;
    limit: number;
    requestCount: number;
    message: string;
  }) {
    super(message);
    this.name = "RateLimitError";
    this.scope = scope;
    this.retryAfterSeconds = retryAfterSeconds;
    this.limit = limit;
    this.requestCount = requestCount;
  }
}

function bucketStartFor(windowSeconds: number) {
  const nowMs = Date.now();
  const safeWindowSeconds = Math.max(1, Math.floor(windowSeconds));
  const bucketMs = safeWindowSeconds * 1000;
  return new Date(Math.floor(nowMs / bucketMs) * bucketMs).toISOString();
}

function fallbackAllowedRateLimit(errorMessage: string) {
  const normalized = errorMessage.toLowerCase();
  return (
    normalized.includes("consume_rate_limit") ||
    normalized.includes("request_rate_limits") ||
    normalized.includes("does not exist")
  );
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

export function getRequestIdentifier(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const cfIp = request.headers.get("cf-connecting-ip") ?? "";
  const ip =
    forwardedFor.split(",")[0]?.trim() ||
    realIp.trim() ||
    cfIp.trim() ||
    "unknown";

  return ip.slice(0, 120) || "unknown";
}

export async function consumeRateLimit({
  supabase,
  scope,
  identifier,
  maxRequests,
  windowSeconds,
}: {
  supabase: SupabaseClient;
  scope: string;
  identifier: string;
  maxRequests: number;
  windowSeconds: number;
}) {
  const safeLimit = Math.max(1, Math.floor(maxRequests));
  const safeWindow = Math.max(1, Math.floor(windowSeconds));
  const bucketStart = bucketStartFor(safeWindow);

  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_scope: scope,
    p_identifier: identifier,
    p_bucket_start: bucketStart,
    p_max_requests: safeLimit,
  });

  if (error) {
    if (fallbackAllowedRateLimit(error.message)) {
      return {
        allowed: true,
        requestCount: 0,
        retryAfterSeconds: safeWindow,
      };
    }

    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const allowed = row?.allowed === true;
  const requestCount = Number(row?.request_count) || 0;

  if (!allowed) {
    throw new RateLimitError({
      scope,
      retryAfterSeconds: safeWindow,
      limit: safeLimit,
      requestCount,
      message: `Too many requests for ${scope}. Please wait a moment and try again.`,
    });
  }

  return {
    allowed,
    requestCount,
    retryAfterSeconds: safeWindow,
  };
}
