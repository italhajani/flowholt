import { NextRequest, NextResponse } from "next/server";

import { drainWorkflowRunJobs } from "@/lib/flowholt/run-queue";
import { consumeRateLimit, getRequestIdentifier, isRateLimitError } from "@/lib/flowholt/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const WORKER_RATE_LIMIT = {
  maxRequests: 180,
  windowSeconds: 60,
};

function workerSecret() {
  return process.env.FLOWHOLT_WORKER_KEY ?? process.env.FLOWHOLT_SCHEDULER_KEY ?? "";
}

function readWorkerKey(request: NextRequest) {
  return (
    request.headers.get("x-flowholt-worker-key") ??
    request.headers.get("x-flowholt-scheduler-key") ??
    request.nextUrl.searchParams.get("key") ??
    ""
  ).trim();
}

function parsePositiveInt(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

export async function POST(request: NextRequest) {
  const secret = workerSecret();
  if (!secret) {
    return NextResponse.json({ error: "FLOWHOLT_WORKER_KEY is not configured." }, { status: 500 });
  }

  const providedKey = readWorkerKey(request);
  if (!providedKey || providedKey !== secret) {
    return NextResponse.json({ error: "Unauthorized worker request." }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    await consumeRateLimit({
      supabase,
      scope: "queue.worker",
      identifier: getRequestIdentifier(request),
      maxRequests: WORKER_RATE_LIMIT.maxRequests,
      windowSeconds: WORKER_RATE_LIMIT.windowSeconds,
    });
  } catch (error) {
    if (isRateLimitError(error)) {
      return NextResponse.json(
        { error: error.message, retry_after_seconds: error.retryAfterSeconds },
        {
          status: 429,
          headers: {
            "Retry-After": String(error.retryAfterSeconds),
          },
        },
      );
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Worker limit check failed." }, { status: 500 });
  }

  const body = (await request.json().catch(() => ({}))) as { maxJobs?: unknown };
  const maxJobs = parsePositiveInt(body.maxJobs, 5, 1, 25);

  const results = await drainWorkflowRunJobs({
    supabase,
    limit: maxJobs,
  });

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
  });
}
