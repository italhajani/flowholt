"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cancelWorkflowRun } from "@/lib/flowholt/run-control";
import { createClient } from "@/lib/supabase/server";

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function cancelRun(formData: FormData) {
  const runId = getValue(formData, "runId");

  if (!runId) {
    redirect("/app/runs?error=Missing run id");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await cancelWorkflowRun(supabase, {
    runId,
    reason: "Cancelled from runs page.",
  });

  revalidatePath("/app/runs");

  if (!result.ok) {
    redirect(`/app/runs?error=${encodeURIComponent(result.message)}`);
  }

  redirect(`/app/runs?message=${encodeURIComponent("Run cancelled")}`);
}
