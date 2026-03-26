import { NextRequest, NextResponse } from "next/server";

import {
  appendWorkflowChatMessage,
  getWorkflowChatThread,
} from "@/lib/flowholt/chat-store";
import type { WorkflowRecord } from "@/lib/flowholt/types";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params:
    | Promise<{ workflowId: string; threadId: string }>
    | { workflowId: string; threadId: string };
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseRole(value: unknown): "user" | "assistant" | "system" {
  if (value === "assistant" || value === "system") {
    return value;
  }

  return "user";
}

function parseLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 50;
  }

  return Math.min(200, Math.max(1, Math.floor(parsed)));
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
  const { workflowId, threadId } = await Promise.resolve(context.params);

  if (!workflowId || !threadId) {
    return NextResponse.json({ error: "Missing workflow or thread id." }, { status: 400 });
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

  const threadLookup = await getWorkflowChatThread(supabase, workflowId, threadId);
  if (!threadLookup.thread) {
    return NextResponse.json({ error: "Thread not found for workflow." }, { status: 404 });
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));

  const { data, error } = await supabase
    .from("workflow_chat_messages")
    .select(
      "id, thread_id, workflow_id, workspace_id, created_by_user_id, role, message, metadata, created_at",
    )
    .eq("workflow_id", workflowId)
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    thread: threadLookup.thread,
    messages: data ?? [],
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { workflowId, threadId } = await Promise.resolve(context.params);

  if (!workflowId || !threadId) {
    return NextResponse.json({ error: "Missing workflow or thread id." }, { status: 400 });
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

  const threadLookup = await getWorkflowChatThread(supabase, workflowId, threadId);
  if (!threadLookup.thread) {
    return NextResponse.json({ error: "Thread not found for workflow." }, { status: 404 });
  }

  const body = asRecord(await request.json().catch(() => ({})));
  const message = asString(body.message);

  if (!message) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  const role = parseRole(body.role);
  const metadata = asRecord(body.metadata);

  const messageWrite = await appendWorkflowChatMessage(supabase, {
    thread_id: threadLookup.thread.id,
    workflow_id: workflow.id,
    workspace_id: workflow.workspace_id,
    created_by_user_id: user.id,
    role,
    message,
    metadata,
  });

  if (messageWrite.error || !messageWrite.messageId) {
    return NextResponse.json(
      { error: messageWrite.error?.message ?? "Unable to append message." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    thread_id: threadLookup.thread.id,
    message_id: messageWrite.messageId,
  });
}
