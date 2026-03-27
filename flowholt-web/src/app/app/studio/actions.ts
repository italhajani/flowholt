"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { drainWorkflowRunJobs, enqueueWorkflowRunJob } from "@/lib/flowholt/run-queue";
import type { WorkflowGraph, WorkflowNode, WorkflowRecord } from "@/lib/flowholt/types";
import { createClient } from "@/lib/supabase/server";

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeAgentNode(node: WorkflowNode): WorkflowNode {
  if (node.type !== "agent") {
    return node;
  }

  const config = node.config ?? {};
  const model = typeof config.model === "string" ? config.model.trim() : "";

  if (!model || model.toLowerCase() === "default") {
    const rest = { ...config };
    delete rest.model;
    return {
      ...node,
      config: rest,
    };
  }

  return node;
}

function normalizeWorkflowGraph(graph: WorkflowGraph): WorkflowGraph {
  return {
    nodes: graph.nodes.map(normalizeAgentNode),
    edges: graph.edges,
  };
}

function parseGraph(rawGraph: string): WorkflowGraph {
  const parsed = JSON.parse(rawGraph) as Partial<WorkflowGraph>;

  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("Graph JSON must include nodes and edges arrays.");
  }

  return normalizeWorkflowGraph({
    nodes: parsed.nodes as WorkflowNode[],
    edges: parsed.edges,
  });
}

async function getWorkflowRecord(workflowId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workflows")
    .select(
      "id, workspace_id, created_by_user_id, name, description, status, graph, settings, created_at, updated_at",
    )
    .eq("id", workflowId)
    .maybeSingle();

  return {
    supabase,
    workflow: error || !data ? null : (data as WorkflowRecord),
  };
}

function revalidateWorkflowPaths(workflowId: string) {
  revalidatePath("/app/dashboard");
  revalidatePath("/app/workflows");
  revalidatePath("/app/runs");
  revalidatePath(`/app/studio/${workflowId}`);
}

export async function saveWorkflow(formData: FormData) {
  const workflowId = getValue(formData, "workflowId");
  const name = getValue(formData, "name");
  const description = getValue(formData, "description");
  const status = getValue(formData, "status");
  const graphInput = getValue(formData, "graph");

  if (!workflowId) {
    redirect("/app/workflows?error=Missing workflow id");
  }

  if (!name) {
    redirect(`/app/studio/${workflowId}?error=Workflow name is required`);
  }

  let graph: WorkflowGraph;

  try {
    graph = parseGraph(graphInput);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid graph JSON";
    redirect(`/app/studio/${workflowId}?error=${encodeURIComponent(message)}`);
  }

  const { supabase } = await getWorkflowRecord(workflowId);
  const { error } = await supabase
    .from("workflows")
    .update({
      name,
      description,
      status,
      graph,
    })
    .eq("id", workflowId);

  if (error) {
    redirect(`/app/studio/${workflowId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateWorkflowPaths(workflowId);
  redirect(`/app/studio/${workflowId}?message=Workflow saved`);
}

export async function runWorkflow(formData: FormData) {
  const workflowId = getValue(formData, "workflowId");

  if (!workflowId) {
    redirect("/app/workflows?error=Missing workflow id");
  }

  const { supabase, workflow } = await getWorkflowRecord(workflowId);

  if (!workflow) {
    redirect(`/app/workflows?error=${encodeURIComponent("Workflow not found")}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const job = await enqueueWorkflowRunJob({
      supabase,
      workflow,
      triggerSource: "manual",
      triggerMeta: {
        initiated_by: "studio",
        queued_from: "studio",
      },
      createdByUserId: user?.id ?? null,
    });

    const [result] = await drainWorkflowRunJobs({
      supabase,
      limit: 1,
      jobIds: [job.id],
    });

    revalidateWorkflowPaths(workflow.id);

    if (result?.runId) {
      redirect(`/app/runs/${result.runId}`);
    }

    if (result?.status === "queued") {
      redirect(
        `/app/studio/${workflow.id}?message=${encodeURIComponent("Run queued for retry. Open Runs again shortly.")}`,
      );
    }

    if (result?.error) {
      redirect(`/app/studio/${workflow.id}?error=${encodeURIComponent(result.error)}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "The engine could not complete the run.";

    revalidateWorkflowPaths(workflow.id);
    redirect(`/app/studio/${workflow.id}?error=${encodeURIComponent(errorMessage)}`);
  }

  revalidateWorkflowPaths(workflow.id);
  redirect(`/app/studio/${workflow.id}?message=${encodeURIComponent("Run queued successfully")}`);
}


