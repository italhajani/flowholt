import { NextRequest, NextResponse } from "next/server";

import { createWorkflowChatThread } from "@/lib/flowholt/chat-store";
import type { WorkflowRecord } from "@/lib/flowholt/types";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ workflowId: string }> | { workflowId: string };
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 20;
  }

  return Math.min(100, Math.max(1, Math.floor(parsed)));
}

async function loadWorkflow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workflowId: string,
) {
  const { data, error } = await supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .eq("id", workflowId)
    .maybeSingle();

  return {
    workflow: error || !data ? null : (data as WorkflowRecord),
    error,
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { workflowId } = await Promise.resolve(context.params);

  if (!workflowId) {
    return NextResponse.json({ error: "Missing workflow id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workflow } = await loadWorkflow(supabase, workflowId);
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));

  const { data, error } = await supabase
    .from("workflow_chat_threads")
    .select(
      "id, workflow_id, workspace_id, created_by_user_id, title, status, last_message_at, created_at, updated_at",
    )
    .eq("workflow_id", workflowId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    workflow: {
      id: workflow.id,
      name: workflow.name,
      status: workflow.status,
    },
    threads: data ?? [],
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { workflowId } = await Promise.resolve(context.params);

  if (!workflowId) {
    return NextResponse.json({ error: "Missing workflow id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workflow } = await loadWorkflow(supabase, workflowId);
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
  }

  const body = asRecord(await request.json().catch(() => ({})));
  const title = asString(body.title, `${workflow.name} thread`);

  const creation = await createWorkflowChatThread(supabase, {
    workflowId: workflow.id,
    workspaceId: workflow.workspace_id,
    userId: user.id,
    title,
  });

  if (creation.error || !creation.thread) {
    return NextResponse.json(
      { error: creation.error?.message ?? "Unable to create thread." },
      { status: 400 },
    );
  }

  return NextResponse.json({ thread: creation.thread }, { status: 201 });
}
