import { NextRequest, NextResponse } from "next/server";

import { drainWorkflowRunJobs } from "@/lib/flowholt/run-queue";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const body = (await request.json().catch(() => ({}))) as { maxJobs?: unknown };
  const maxJobs = parsePositiveInt(body.maxJobs, 5, 1, 25);

  const supabase = createAdminClient();
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
