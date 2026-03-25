"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import type { WorkflowGraph } from "@/lib/flowholt/types";
import { createClient } from "@/lib/supabase/server";

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseGraph(rawGraph: string): WorkflowGraph {
  const parsed = JSON.parse(rawGraph) as Partial<WorkflowGraph>;

  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("Graph JSON must include nodes and edges arrays.");
  }

  return {
    nodes: parsed.nodes,
    edges: parsed.edges,
  };
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

  const supabase = await createClient();
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

  revalidatePath("/app/dashboard");
  revalidatePath("/app/workflows");
  revalidatePath(`/app/studio/${workflowId}`);
  redirect(`/app/studio/${workflowId}?message=Workflow saved`);
}
