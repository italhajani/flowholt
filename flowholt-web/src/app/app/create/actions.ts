"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { generateWorkflowDraft } from "@/lib/ai/workflow-generator";
import { createClient } from "@/lib/supabase/server";

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createWorkflowFromChat(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspaceId = getValue(formData, "workspaceId");
  const prompt = getValue(formData, "prompt");

  if (!workspaceId) {
    redirect("/app/dashboard?error=Create a workspace before using chat create");
  }

  if (!prompt) {
    redirect("/app/create?error=Please describe the task first");
  }

  const draft = await generateWorkflowDraft(prompt);

  const { data, error } = await supabase
    .from("workflows")
    .insert({
      workspace_id: workspaceId,
      created_by_user_id: user.id,
      name: draft.name,
      description: draft.description,
      status: "draft",
      graph: draft.graph,
      settings: {
        source: "chat",
        originalPrompt: prompt,
        generation: draft.generation,
      },
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/app/create?error=${encodeURIComponent(error?.message ?? "Unable to create workflow from chat")}`);
  }

  revalidatePath("/app/create");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/workflows");
  redirect(`/app/studio/${data.id}?message=Workflow draft created from chat`);
}
