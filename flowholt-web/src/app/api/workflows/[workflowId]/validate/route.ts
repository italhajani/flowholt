import { NextRequest, NextResponse } from "next/server";

import { validateWorkflowGraph } from "@/lib/flowholt/graph-validator";
import type { WorkflowGraph, WorkflowRecord } from "@/lib/flowholt/types";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ workflowId: string }> | { workflowId: string };
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isGraphCandidate(value: unknown): value is WorkflowGraph {
  const record = asRecord(value);
  return Array.isArray(record.nodes) && Array.isArray(record.edges);
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

  const report = validateWorkflowGraph(workflow.graph);

  return NextResponse.json({
    workflow: {
      id: workflow.id,
      name: workflow.name,
      status: workflow.status,
      updated_at: workflow.updated_at,
    },
    report,
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
  const draftGraph = body.graph;

  if (draftGraph !== undefined && !isGraphCandidate(draftGraph)) {
    return NextResponse.json({ error: "graph must include nodes and edges arrays." }, { status: 400 });
  }

  const graphToValidate = isGraphCandidate(draftGraph) ? draftGraph : workflow.graph;
  const report = validateWorkflowGraph(graphToValidate);

  return NextResponse.json({
    workflow: {
      id: workflow.id,
      name: workflow.name,
      status: workflow.status,
      updated_at: workflow.updated_at,
    },
    report,
    source: isGraphCandidate(draftGraph) ? "draft_graph" : "saved_workflow",
  });
}
