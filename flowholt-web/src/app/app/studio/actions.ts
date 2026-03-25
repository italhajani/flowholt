"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { runWorkflowWithEngine } from "@/lib/flowholt/engine";
import type { WorkflowGraph, WorkflowRecord } from "@/lib/flowholt/types";
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

  const { data: insertedRun, error: insertError } = await supabase
    .from("workflow_runs")
    .insert({
      workflow_id: workflow.id,
      workspace_id: workflow.workspace_id,
      status: "running",
      trigger_source: "manual",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !insertedRun) {
    redirect(`/app/studio/${workflow.id}?error=${encodeURIComponent(insertError?.message ?? "Unable to create run")}`);
  }

  let successMessage = "Run completed successfully";

  try {
    const result = await runWorkflowWithEngine({
      run_id: insertedRun.id,
      workflow_id: workflow.id,
      workspace_id: workflow.workspace_id,
      workflow_name: workflow.name,
      trigger_source: "manual",
      nodes: workflow.graph.nodes,
      edges: workflow.graph.edges,
      settings: workflow.settings,
    });

    if (result.logs.length) {
      const { error: logError } = await supabase.from("run_logs").insert(
        result.logs.map((log) => ({
          run_id: insertedRun.id,
          workflow_id: workflow.id,
          workspace_id: workflow.workspace_id,
          node_id: log.node_id,
          level: log.level,
          message: log.message,
          payload: log.payload,
        })),
      );

      if (logError) {
        throw new Error(logError.message);
      }
    }

    const { error: updateError } = await supabase
      .from("workflow_runs")
      .update({
        status: result.status,
        output: result.output,
        error_message: "",
        started_at: result.started_at,
        finished_at: result.finished_at,
      })
      .eq("id", insertedRun.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (result.summary.executed_nodes.length) {
      successMessage = `Run completed: ${result.summary.executed_nodes.length} steps executed`;
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "The engine could not complete the run.";

    await supabase.from("run_logs").insert({
      run_id: insertedRun.id,
      workflow_id: workflow.id,
      workspace_id: workflow.workspace_id,
      node_id: null,
      level: "error",
      message: "Run failed before completion.",
      payload: {
        error: errorMessage,
      },
    });

    await supabase
      .from("workflow_runs")
      .update({
        status: "failed",
        error_message: errorMessage,
        finished_at: new Date().toISOString(),
      })
      .eq("id", insertedRun.id);

    revalidateWorkflowPaths(workflow.id);
    redirect(`/app/studio/${workflow.id}?error=${encodeURIComponent(errorMessage)}`);
  }

  revalidateWorkflowPaths(workflow.id);
  redirect(`/app/studio/${workflow.id}?message=${encodeURIComponent(successMessage)}`);
}
