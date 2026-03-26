import { NextRequest, NextResponse } from "next/server";

import { cancelWorkflowRun } from "@/lib/flowholt/run-control";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ runId: string }> | { runId: string };
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { runId } = await Promise.resolve(context.params);

  if (!runId) {
    return NextResponse.json({ error: "Missing run id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = asRecord(await request.json().catch(() => ({})));
  const reason = typeof body.reason === "string" ? body.reason : "";

  const result = await cancelWorkflowRun(supabase, {
    runId,
    reason,
  });

  if (result.ok) {
    return NextResponse.json(result);
  }

  if (result.reason === "not_found") {
    return NextResponse.json({ error: result.message }, { status: 404 });
  }

  if (result.reason === "already_finished") {
    return NextResponse.json({ error: result.message, status: result.status }, { status: 409 });
  }

  return NextResponse.json({ error: result.message }, { status: 400 });
}
