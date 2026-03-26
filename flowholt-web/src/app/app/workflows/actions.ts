"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { parseWorkflowPackage } from "@/lib/flowholt/workflow-package";
import { createClient } from "@/lib/supabase/server";

export async function createBlankWorkflow(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspaceId = formData.get("workspaceId");

  if (typeof workspaceId !== "string" || !workspaceId) {
    redirect("/app/workflows?error=Missing workspace id");
  }

  const { data, error } = await supabase
    .from("workflows")
    .insert({
      workspace_id: workspaceId,
      created_by_user_id: user.id,
      name: "Untitled workflow",
      description: "New blank workflow",
      status: "draft",
      graph: { nodes: [], edges: [] },
      settings: {},
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/app/workflows?error=${encodeURIComponent(error?.message ?? "Unable to create workflow")}`);
  }

  revalidatePath("/app/dashboard");
  revalidatePath("/app/workflows");
  redirect(`/app/studio/${data.id}?message=Blank workflow created`);
}

export async function importWorkflowPackage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspaceId = formData.get("workspaceId");
  const packageJson = formData.get("packageJson");

  if (typeof workspaceId !== "string" || !workspaceId) {
    redirect("/app/workflows?error=Missing workspace id");
  }

  if (typeof packageJson !== "string" || !packageJson.trim()) {
    redirect("/app/workflows?error=Paste a workflow package JSON first");
  }

  const workflowPackage = (() => {
    try {
      return parseWorkflowPackage(JSON.parse(packageJson));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid workflow package.";
      redirect(`/app/workflows?error=${encodeURIComponent(message)}`);
    }
  })();

  const importedSettings = {
    ...workflowPackage.workflow.settings,
    imported_package: {
      source: workflowPackage.metadata.source,
      workflow_id: workflowPackage.metadata.workflow_id,
      workspace_id: workflowPackage.metadata.workspace_id,
      imported_at: new Date().toISOString(),
    },
  };

  const { data, error } = await supabase
    .from("workflows")
    .insert({
      workspace_id: workspaceId,
      created_by_user_id: user.id,
      name: `${workflowPackage.workflow.name} (Imported)`,
      description: workflowPackage.workflow.description || "Imported workflow package",
      status: workflowPackage.workflow.status === "archived" ? "draft" : workflowPackage.workflow.status,
      graph: workflowPackage.workflow.graph,
      settings: importedSettings,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/app/workflows?error=${encodeURIComponent(error?.message ?? "Unable to import workflow package")}`);
  }

  revalidatePath("/app/dashboard");
  revalidatePath("/app/workflows");
  redirect(`/app/studio/${data.id}?message=Workflow package imported`);
}
