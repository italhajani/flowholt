"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { starterGraph } from "@/lib/flowholt/data";
import { createClient } from "@/lib/supabase/server";

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function makeWorkflowName(prompt: string) {
  const cleaned = prompt.replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "New workflow";
  }

  const words = cleaned.split(" ").slice(0, 6);
  const shortName = words.join(" ");
  return shortName.length > 60 ? `${shortName.slice(0, 57)}...` : shortName;
}

function makeStarterDescription(prompt: string) {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  return cleaned.length > 220 ? `${cleaned.slice(0, 217)}...` : cleaned;
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

  const { data, error } = await supabase
    .from("workflows")
    .insert({
      workspace_id: workspaceId,
      created_by_user_id: user.id,
      name: makeWorkflowName(prompt),
      description: makeStarterDescription(prompt),
      status: "draft",
      graph: starterGraph,
      settings: {
        source: "chat",
        originalPrompt: prompt,
        model: "groq/llama",
        retries: 2,
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
