import type { SupabaseClient } from "@supabase/supabase-js";

type ChatThreadRecord = {
  id: string;
  workflow_id: string;
  workspace_id: string;
  created_by_user_id: string;
  title: string;
  status: "active" | "archived";
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

type ChatMessageInsert = {
  thread_id: string;
  workflow_id: string;
  workspace_id: string;
  created_by_user_id: string | null;
  role: "user" | "assistant" | "system";
  message: string;
  metadata?: Record<string, unknown>;
};

export async function getWorkflowChatThread(
  supabase: SupabaseClient,
  workflowId: string,
  threadId: string,
) {
  const { data, error } = await supabase
    .from("workflow_chat_threads")
    .select(
      "id, workflow_id, workspace_id, created_by_user_id, title, status, last_message_at, created_at, updated_at",
    )
    .eq("workflow_id", workflowId)
    .eq("id", threadId)
    .maybeSingle();

  return {
    thread: error || !data ? null : (data as ChatThreadRecord),
    error,
  };
}

export async function createWorkflowChatThread(
  supabase: SupabaseClient,
  input: {
    workflowId: string;
    workspaceId: string;
    userId: string;
    title: string;
  },
) {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("workflow_chat_threads")
    .insert({
      workflow_id: input.workflowId,
      workspace_id: input.workspaceId,
      created_by_user_id: input.userId,
      title: input.title,
      status: "active",
      last_message_at: nowIso,
    })
    .select(
      "id, workflow_id, workspace_id, created_by_user_id, title, status, last_message_at, created_at, updated_at",
    )
    .single();

  return {
    thread: error || !data ? null : (data as ChatThreadRecord),
    error,
  };
}

export async function appendWorkflowChatMessage(
  supabase: SupabaseClient,
  input: ChatMessageInsert,
) {
  const { data, error } = await supabase
    .from("workflow_chat_messages")
    .insert({
      thread_id: input.thread_id,
      workflow_id: input.workflow_id,
      workspace_id: input.workspace_id,
      created_by_user_id: input.created_by_user_id,
      role: input.role,
      message: input.message,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .maybeSingle();

  if (!error) {
    await supabase
      .from("workflow_chat_threads")
      .update({
        last_message_at: new Date().toISOString(),
      })
      .eq("id", input.thread_id);
  }

  return {
    messageId: data?.id ? String(data.id) : "",
    error,
  };
}
