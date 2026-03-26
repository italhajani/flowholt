import { NextRequest, NextResponse } from "next/server";

import {
  generateWorkflowRevision,
  type GeneratedWorkflowRevision,
} from "@/lib/ai/workflow-generator";
import type { WorkflowRecord } from "@/lib/flowholt/types";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ workflowId: string }> | { workflowId: string };
};

type ComposerHistoryItem = {
  at: string;
  mode: "preview" | "apply";
  message: string;
  proposal: {
    name: string;
    description: string;
    node_count: number;
    edge_count: number;
    provider: string;
    model: string;
  };
};

type WorkflowRevisionInsert = {
  workflow_id: string;
  workspace_id: string;
  created_by_user_id: string;
  source: "compose_apply" | "restore" | "manual" | "api";
  message: string;
  before_name: string;
  before_description: string;
  before_graph: Record<string, unknown>;
  after_name: string;
  after_description: string;
  after_graph: Record<string, unknown>;
  change_summary: Record<string, unknown>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseMode(value: unknown): "preview" | "apply" {
  if (typeof value === "string" && value.toLowerCase() === "apply") {
    return "apply";
  }

  return "preview";
}

function sanitizeHistory(value: unknown): ComposerHistoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const row = asRecord(item);
      const proposal = asRecord(row.proposal);
      const mode = parseMode(row.mode);

      return {
        at: asString(row.at, new Date(0).toISOString()),
        mode,
        message: asString(row.message),
        proposal: {
          name: asString(proposal.name, "Untitled workflow"),
          description: asString(proposal.description),
          node_count: Number(proposal.node_count) || 0,
          edge_count: Number(proposal.edge_count) || 0,
          provider: asString(proposal.provider, "fallback"),
          model: asString(proposal.model, "unknown"),
        },
      } satisfies ComposerHistoryItem;
    })
    .filter((item) => item.message)
    .slice(-25);
}

function buildProposalSummary(proposal: GeneratedWorkflowRevision) {
  return {
    name: proposal.name,
    description: proposal.description,
    graph: proposal.graph,
    reasoning: proposal.reasoning,
    changes: proposal.changes,
    generation: proposal.generation,
    summary: {
      node_count: proposal.graph.nodes.length,
      edge_count: proposal.graph.edges.length,
      condition_count: proposal.graph.nodes.filter((node) => node.type === "condition").length,
      tool_count: proposal.graph.nodes.filter((node) => node.type === "tool").length,
    },
  };
}

function buildHistoryItem(
  mode: "preview" | "apply",
  message: string,
  proposal: GeneratedWorkflowRevision,
): ComposerHistoryItem {
  return {
    at: new Date().toISOString(),
    mode,
    message,
    proposal: {
      name: proposal.name,
      description: proposal.description,
      node_count: proposal.graph.nodes.length,
      edge_count: proposal.graph.edges.length,
      provider: proposal.generation.provider,
      model: proposal.generation.model,
    },
  };
}

function withComposerSettings(
  currentSettings: unknown,
  mode: "preview" | "apply",
  message: string,
  proposal: GeneratedWorkflowRevision,
) {
  const settings = asRecord(currentSettings);
  const history = sanitizeHistory(settings.composer_history);
  const item = buildHistoryItem(mode, message, proposal);

  return {
    ...settings,
    composer: {
      last_message: message,
      last_mode: mode,
      last_updated_at: item.at,
      last_plan: {
        reasoning: proposal.reasoning,
        changes: proposal.changes,
        summary: {
          node_count: proposal.graph.nodes.length,
          edge_count: proposal.graph.edges.length,
        },
        generation: proposal.generation,
      },
    },
    composer_history: [...history, item].slice(-25),
  };
}

function buildRevisionInsert(
  workflow: WorkflowRecord,
  userId: string,
  message: string,
  proposal: GeneratedWorkflowRevision,
): WorkflowRevisionInsert {
  return {
    workflow_id: workflow.id,
    workspace_id: workflow.workspace_id,
    created_by_user_id: userId,
    source: "compose_apply",
    message,
    before_name: workflow.name,
    before_description: workflow.description,
    before_graph: workflow.graph as unknown as Record<string, unknown>,
    after_name: proposal.name,
    after_description: proposal.description,
    after_graph: proposal.graph as unknown as Record<string, unknown>,
    change_summary: {
      mode: "apply",
      reasoning: proposal.reasoning,
      changes: proposal.changes,
      generation: proposal.generation,
      summary: {
        node_count: proposal.graph.nodes.length,
        edge_count: proposal.graph.edges.length,
      },
    },
  };
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
  const history = sanitizeHistory(settings.composer_history);

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
      last_mode: parseMode(composer.last_mode),
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
  const mode = parseMode(body.mode);

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

  if (mode === "preview") {
    return NextResponse.json({
      mode,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        updated_at: workflow.updated_at,
      },
      proposal: buildProposalSummary(proposal),
    });
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

  const revisionInsert = buildRevisionInsert(workflow, user.id, message, proposal);
  const revisionWrite = await insertRevision(supabase, revisionInsert);

  return NextResponse.json({
    mode,
    applied: true,
    workflow: updated,
    proposal: buildProposalSummary(proposal),
    revision_saved: Boolean(revisionWrite.revisionId),
    revision_id: revisionWrite.revisionId || undefined,
    revision_error: revisionWrite.error || undefined,
  });
}
