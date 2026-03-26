import { NextRequest, NextResponse } from "next/server";

import { compareWorkflowRevision } from "@/lib/flowholt/revision-compare";
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

export async function GET(_: NextRequest, context: RouteContext) {
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

  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("id")
    .eq("id", workflowId)
    .maybeSingle();

  if (workflowError || !workflow) {
    return NextResponse.json({ error: "Workflow not found." }, { status: 404 });
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
  const comparison = compareWorkflowRevision(revision);

  return NextResponse.json({
    revision: {
      id: revision.id,
      workflow_id: revision.workflow_id,
      source: revision.source,
      message: revision.message,
      created_at: revision.created_at,
      before_name: revision.before_name,
      after_name: revision.after_name,
    },
    comparison,
    change_summary: revision.change_summary ?? {},
  });
}