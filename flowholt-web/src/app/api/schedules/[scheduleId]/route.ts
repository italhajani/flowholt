import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ scheduleId: string }> | { scheduleId: string };
};

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

function toISOStringOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

async function resolveSchedule(supabase: Awaited<ReturnType<typeof createClient>>, scheduleId: string) {
  const { data, error } = await supabase
    .from("workflow_schedules")
    .select(
      "id, workflow_id, workspace_id, created_by_user_id, label, status, interval_minutes, next_run_at, last_run_at, last_run_status, run_count, last_error, lock_until, created_at, updated_at",
    )
    .eq("id", scheduleId)
    .maybeSingle();

  return {
    schedule: data,
    error,
  };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { scheduleId } = await Promise.resolve(context.params);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!scheduleId) {
    return NextResponse.json({ error: "Missing schedule id." }, { status: 400 });
  }

  const { schedule, error: scheduleError } = await resolveSchedule(supabase, scheduleId);
  if (scheduleError || !schedule) {
    return NextResponse.json({ error: "Schedule not found." }, { status: 404 });
  }

  const body = asRecord(await request.json().catch(() => ({})));
  const patch: Record<string, unknown> = {};

  if (body.label !== undefined) {
    patch.label = String(body.label ?? "").trim();
  }

  if (body.status !== undefined) {
    const status = String(body.status ?? "").trim();
    if (!["active", "paused", "disabled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    patch.status = status;
  }

  if (body.intervalMinutes !== undefined) {
    patch.interval_minutes = toIntervalMinutes(body.intervalMinutes, schedule.interval_minutes);
  }

  if (body.nextRunAt !== undefined) {
    const nextRunAt = toISOStringOrNull(body.nextRunAt);
    if (!nextRunAt) {
      return NextResponse.json({ error: "Invalid nextRunAt." }, { status: 400 });
    }
    patch.next_run_at = nextRunAt;
  }

  if (patch.status === "active" && patch.next_run_at === undefined && schedule.status !== "active") {
    patch.next_run_at = new Date().toISOString();
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("workflow_schedules")
    .update(patch)
    .eq("id", scheduleId)
    .select(
      "id, workflow_id, workspace_id, created_by_user_id, label, status, interval_minutes, next_run_at, last_run_at, last_run_status, run_count, last_error, lock_until, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Unable to update schedule." }, { status: 400 });
  }

  return NextResponse.json({ schedule: data });
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { scheduleId } = await Promise.resolve(context.params);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!scheduleId) {
    return NextResponse.json({ error: "Missing schedule id." }, { status: 400 });
  }

  const { error } = await supabase
    .from("workflow_schedules")
    .delete()
    .eq("id", scheduleId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
