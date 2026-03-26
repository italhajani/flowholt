import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toIntervalMinutes(value: unknown, fallback = 60) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const intValue = Math.floor(parsed);
  return Math.min(10080, Math.max(1, intValue));
}

function toISOStringOrDefault(value: unknown, fallback: string) {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString();
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workflowId = request.nextUrl.searchParams.get("workflowId")?.trim() ?? "";
  const workspaceId = request.nextUrl.searchParams.get("workspaceId")?.trim() ?? "";

  if (!workflowId && !workspaceId) {
    return NextResponse.json(
      { error: "Provide workflowId or workspaceId." },
      { status: 400 },
    );
  }

  let query = supabase
    .from("workflow_schedules")
    .select(
      "id, workflow_id, workspace_id, created_by_user_id, label, status, interval_minutes, next_run_at, last_run_at, last_run_status, run_count, last_error, lock_until, created_at, updated_at",
    )
    .order("next_run_at", { ascending: true });

  if (workflowId) {
    query = query.eq("workflow_id", workflowId);
  }
  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ schedules: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = asRecord(await request.json().catch(() => ({})));
  const workflowId = String(body.workflowId ?? "").trim();

  if (!workflowId) {
    return NextResponse.json({ error: "workflowId is required." }, { status: 400 });
  }

  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("id, workspace_id, name")
    .eq("id", workflowId)
    .maybeSingle();

  if (workflowError || !workflow) {
    return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
  }

  const nowIso = new Date().toISOString();
  const intervalMinutes = toIntervalMinutes(body.intervalMinutes, 60);
  const label = String(body.label ?? `${workflow.name} schedule`).trim() || `${workflow.name} schedule`;
  const nextRunAt = toISOStringOrDefault(body.nextRunAt, nowIso);

  const { data, error } = await supabase
    .from("workflow_schedules")
    .insert({
      workflow_id: workflow.id,
      workspace_id: workflow.workspace_id,
      created_by_user_id: user.id,
      label,
      status: "active",
      interval_minutes: intervalMinutes,
      next_run_at: nextRunAt,
      run_count: 0,
      last_error: "",
    })
    .select(
      "id, workflow_id, workspace_id, created_by_user_id, label, status, interval_minutes, next_run_at, last_run_at, last_run_status, run_count, last_error, lock_until, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Unable to create schedule." }, { status: 400 });
  }

  return NextResponse.json({ schedule: data }, { status: 201 });
}
