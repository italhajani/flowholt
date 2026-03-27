import { NextRequest, NextResponse } from "next/server";

import {
  appendWorkflowChatMessage,
  getWorkflowChatThread,
} from "@/lib/flowholt/chat-store";
import {
  buildComposerAssistantMessage,
  buildComposerProposalSummary,
  buildWorkflowRevisionInsert,
  parseComposerMode,
  sanitizeComposerHistory,
  withComposerSettings,
  type WorkflowRevisionInsert,
} from "@/lib/flowholt/composer-logic";
import {
  generateWorkflowRevision,
  type GeneratedWorkflowRevision,
} from "@/lib/ai/workflow-generator";
import { validateWorkflowGraph } from "@/lib/flowholt/graph-validator";
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

async function insertRevision(
  supabase: Awaited<ReturnType<typeof createClient>>,
  revision: WorkflowRevisionInsert,
) {
  const { data, error } = await supabase
    .from("workflow_revisions")
    .insert(revision)
    .select("id")
    .maybeSingle();

  return {
    revisionId: data?.id ? String(data.id) : "",
    error: error?.message ?? "",
  };
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

async function persistComposeChat(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: {
    workflow: WorkflowRecord;
    userId: string;
    threadId: string;
    mode: "preview" | "apply";
    userMessage: string;
    assistantMessage: string;
    metadata: Record<string, unknown>;
  },
) {
  const userWrite = await appendWorkflowChatMessage(supabase, {
    thread_id: input.threadId,
    workflow_id: input.workflow.id,
    workspace_id: input.workflow.workspace_id,
    created_by_user_id: input.userId,
    role: "user",
    message: input.userMessage,
    metadata: {
      source: "compose",
      mode: input.mode,
    },
  });

  const assistantWrite = await appendWorkflowChatMessage(supabase, {
    thread_id: input.threadId,
    workflow_id: input.workflow.id,
    workspace_id: input.workflow.workspace_id,
    created_by_user_id: input.userId,
    role: "assistant",
    message: input.assistantMessage,
    metadata: input.metadata,
  });

  return {
    user_message_saved: Boolean(userWrite.messageId),
    assistant_message_saved: Boolean(assistantWrite.messageId),
    user_message_id: userWrite.messageId || undefined,
    assistant_message_id: assistantWrite.messageId || undefined,
    error:
      userWrite.error?.message || assistantWrite.error?.message
        ? `${userWrite.error?.message ?? ""} ${assistantWrite.error?.message ?? ""}`.trim()
        : "",
  };
}

export async function GET(_: NextRequest, context: RouteContext) {
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

  const settings = asRecord(workflow.settings);
  const composer = asRecord(settings.composer);
  const history = sanitizeComposerHistory(settings.composer_history);

  return NextResponse.json({
    workflow: {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,
      updated_at: workflow.updated_at,
    },
    composer: {
      last_message: asString(composer.last_message),
      last_mode: parseComposerMode(composer.last_mode),
      last_updated_at: asString(composer.last_updated_at),
      last_plan: asRecord(composer.last_plan),
      history,
    },
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

  const body = asRecord(await request.json().catch(() => ({})));
  const message = asString(body.message);
  const mode = parseComposerMode(body.mode);
  const threadId = asString(body.threadId);

  if (!message) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  const { workflow } = await loadWorkflow(supabase, workflowId);

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
  }

  if (workflow.status === "archived") {
    return NextResponse.json({ error: "Workflow is archived." }, { status: 409 });
  }

  let thread: { id: string } | null = null;

  if (threadId) {
    const threadLookup = await getWorkflowChatThread(supabase, workflow.id, threadId);
    if (!threadLookup.thread) {
      return NextResponse.json({ error: "threadId not found for workflow." }, { status: 404 });
    }
    thread = { id: threadLookup.thread.id };
  }

  let proposal: GeneratedWorkflowRevision;

  try {
    proposal = await generateWorkflowRevision({
      prompt: message,
      workflow,
    });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Unable to generate workflow revision.";
    return NextResponse.json({ error: messageText }, { status: 500 });
  }

  const proposalValidation = validateWorkflowGraph(proposal.graph);

  if (mode === "preview") {
    const chatWrite = thread
      ? await persistComposeChat(supabase, {
          workflow,
          userId: user.id,
          threadId: thread.id,
          mode,
          userMessage: message,
          assistantMessage: buildComposerAssistantMessage(mode, proposal, proposalValidation.valid),
          metadata: {
            source: "compose",
            mode,
            valid: proposalValidation.valid,
            proposal: buildComposerProposalSummary(proposal),
            validation: proposalValidation,
          },
        })
      : null;

    return NextResponse.json({
      mode,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        updated_at: workflow.updated_at,
      },
      proposal: buildComposerProposalSummary(proposal),
      validation: proposalValidation,
      thread_id: thread?.id,
      chat_write: chatWrite,
    });
  }

  if (!proposalValidation.valid) {
    const chatWrite = thread
      ? await persistComposeChat(supabase, {
          workflow,
          userId: user.id,
          threadId: thread.id,
          mode,
          userMessage: message,
          assistantMessage: buildComposerAssistantMessage(mode, proposal, false),
          metadata: {
            source: "compose",
            mode,
            valid: false,
            proposal: buildComposerProposalSummary(proposal),
            validation: proposalValidation,
          },
        })
      : null;

    return NextResponse.json(
      {
        error: "Proposed workflow is invalid and cannot be applied.",
        proposal: buildComposerProposalSummary(proposal),
        validation: proposalValidation,
        thread_id: thread?.id,
        chat_write: chatWrite,
      },
      { status: 422 },
    );
  }

  const nextSettings = withComposerSettings(workflow.settings, mode, message, proposal);

  const { data: updated, error: updateError } = await supabase
    .from("workflows")
    .update({
      name: proposal.name,
      description: proposal.description,
      graph: proposal.graph,
      settings: nextSettings,
    })
    .eq("id", workflow.id)
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Unable to apply workflow proposal." },
      { status: 400 },
    );
  }

  const revisionInsert = buildWorkflowRevisionInsert(
    workflow,
    user.id,
    message,
    proposal,
    proposalValidation,
  );
  const revisionWrite = await insertRevision(supabase, revisionInsert);

  const chatWrite = thread
    ? await persistComposeChat(supabase, {
        workflow,
        userId: user.id,
        threadId: thread.id,
        mode,
        userMessage: message,
        assistantMessage: buildComposerAssistantMessage(mode, proposal, true, revisionWrite.revisionId),
        metadata: {
          source: "compose",
          mode,
          valid: true,
          applied: true,
          revision_id: revisionWrite.revisionId,
          proposal: buildComposerProposalSummary(proposal),
          validation: proposalValidation,
        },
      })
    : null;

  return NextResponse.json({
    mode,
    applied: true,
    workflow: updated,
    proposal: buildComposerProposalSummary(proposal),
    validation: proposalValidation,
    revision_saved: Boolean(revisionWrite.revisionId),
    revision_id: revisionWrite.revisionId || undefined,
    revision_error: revisionWrite.error || undefined,
    thread_id: thread?.id,
    chat_write: chatWrite,
  });
}
