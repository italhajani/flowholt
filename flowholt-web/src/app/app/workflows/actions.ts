"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
