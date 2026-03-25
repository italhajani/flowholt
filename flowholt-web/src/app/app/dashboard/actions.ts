"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { starterGraph } from "@/lib/flowholt/data";
import { createClient } from "@/lib/supabase/server";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function createWorkspace(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const rawName = formData.get("name");
  const name = typeof rawName === "string" && rawName.trim() ? rawName.trim() : "My Workspace";
  const slugBase = slugify(name) || "workspace";
  const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;

  const { error } = await supabase.from("workspaces").insert({
    owner_user_id: user.id,
    name,
    slug,
    description: "Primary FlowHolt workspace",
  });

  if (error) {
    redirect(`/app/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/app/dashboard");
  revalidatePath("/app/workflows");
  redirect("/app/dashboard?message=Workspace created");
}

export async function createStarterWorkflow(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspaceId = formData.get("workspaceId");

  if (typeof workspaceId !== "string" || !workspaceId) {
    redirect("/app/dashboard?error=Missing workspace id");
  }

  const { data, error } = await supabase
    .from("workflows")
    .insert({
      workspace_id: workspaceId,
      created_by_user_id: user.id,
      name: "Lead intake autopilot",
      description: "Starter workflow created from the dashboard.",
      status: "draft",
      graph: starterGraph,
      settings: {
        model: "groq/llama",
        retries: 2,
      },
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/app/dashboard?error=${encodeURIComponent(error?.message ?? "Unable to create workflow")}`);
  }

  revalidatePath("/app/dashboard");
  revalidatePath("/app/workflows");
  redirect(`/app/studio/${data.id}?message=Starter workflow created`);
}
