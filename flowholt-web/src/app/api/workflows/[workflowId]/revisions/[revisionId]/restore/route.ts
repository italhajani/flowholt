import { NextRequest, NextResponse } from "next/server";

import { recordWorkspaceAuditLog } from "@/lib/flowholt/audit";
import type { WorkflowRecord } from "@/lib/flowholt/types";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params:
    | Promise<{ workflowId: string; revisionId: string }>
    | { workflowId: string; revisionId: string };
};

type WorkflowRevisionRow = {
  id: string;
  workflow_id: string;
  workspace_id: string;
  source: string;
  message: string;
  before_name: string;
  before_description: string;
  before_graph: Record<string, unknown>;
  after_name: string;
  after_description: string;
  after_graph: Record<string, unknown>;
  change_summary: Record<string, unknown>;
  created_at: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export async function POST(_: NextRequest, context: RouteContext) {
  const { workflowId, revisionId } = await Promise.resolve(context.params);

  if (!workflowId || !revisionId) {
    return NextResponse.json({ error: "Missing workflow or revision id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: workflowRow, error: workflowError } = await supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .eq("id", workflowId)
    .maybeSingle();

  if (workflowError || !workflowRow) {
    return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
  }

  const workflow = workflowRow as WorkflowRecord;

  if (workflow.status === "archived") {
    return NextResponse.json({ error: "Workflow is archived." }, { status: 409 });
  }

  const { data: revisionRow, error: revisionError } = await supabase
    .from("workflow_revisions")
    .select(
      "id, workflow_id, workspace_id, source, message, before_name, before_description, before_graph, after_name, after_description, after_graph, change_summary, created_at",
    )
    .eq("id", revisionId)
    .eq("workflow_id", workflowId)
    .maybeSingle();

  if (revisionError || !revisionRow) {
    return NextResponse.json({ error: "Revision not found for workflow." }, { status: 404 });
  }

  const revision = revisionRow as WorkflowRevisionRow;

  const restoredName = asString(revision.before_name, workflow.name) || workflow.name;
  const restoredDescription = asString(revision.before_description, workflow.description);
  const restoredGraph = asRecord(revision.before_graph);

  const { data: updated, error: updateError } = await supabase
    .from("workflows")
    .update({
      name: restoredName,
      description: restoredDescription,
      graph: restoredGraph,
    })
    .eq("id", workflow.id)
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Unable to restore workflow revision." },
      { status: 400 },
    );
  }

  const restoreMessage = `Restored revision ${revision.id}`;

  const { data: restoreLog, error: restoreLogError } = await supabase
    .from("workflow_revisions")
    .insert({
      workflow_id: workflow.id,
      workspace_id: workflow.workspace_id,
      created_by_user_id: user.id,
      source: "restore",
      message: restoreMessage,
      before_name: workflow.name,
      before_description: workflow.description,
      before_graph: workflow.graph,
      after_name: restoredName,
      after_description: restoredDescription,
      after_graph: restoredGraph,
      change_summary: {
        restored_from_revision_id: revision.id,
        restored_from_source: revision.source,
        restored_from_created_at: revision.created_at,
      },
    })
    .select("id")
    .maybeSingle();

  await recordWorkspaceAuditLog({
    supabase,
    workspaceId: workflow.workspace_id,
    actorUserId: user.id,
    action: "workflow.revision_restored",
    targetType: "workflow",
    targetId: workflow.id,
    summary: `Restored workflow ${workflow.name} from revision ${revision.id}`,
    payload: {
      restored_from_revision_id: revision.id,
      restored_from_source: revision.source,
      restore_revision_log_id: restoreLog?.id ? String(restoreLog.id) : null,
    },
  });

  return NextResponse.json({
    ok: true,
    workflow: updated,
    restored_from_revision_id: revision.id,
    restore_revision_logged: Boolean(restoreLog?.id),
    restore_revision_log_id: restoreLog?.id ? String(restoreLog.id) : undefined,
    restore_revision_log_error: restoreLogError?.message ?? undefined,
  });
}
