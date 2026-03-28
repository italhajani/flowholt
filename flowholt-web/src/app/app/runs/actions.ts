"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cancelWorkflowRun, retryWorkflowRun } from "@/lib/flowholt/run-control";
import { createClient } from "@/lib/supabase/server";

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readReturnTarget(formData: FormData) {
  const value = getValue(formData, "returnTo");
  return value.startsWith("/app/") ? value : "/app/runs";
}

function revalidateRunPaths() {
  revalidatePath("/app/runs");
  revalidatePath("/app/monitoring");
}

export async function cancelRun(formData: FormData) {
  const runId = getValue(formData, "runId");
  const returnTo = readReturnTarget(formData);

  if (!runId) {
    redirect(`${returnTo}?error=Missing run id`);
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

  revalidateRunPaths();

  if (!result.ok) {
    redirect(`${returnTo}?error=${encodeURIComponent(result.message)}`);
  }

  redirect(`${returnTo}?message=${encodeURIComponent("Run cancelled")}`);
}

export async function retryRun(formData: FormData) {
  const runId = getValue(formData, "runId");
  const returnTo = readReturnTarget(formData);

  if (!runId) {
    redirect(`${returnTo}?error=Missing run id`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await retryWorkflowRun(supabase, {
    runId,
    requestedByUserId: user.id,
    reason: "Retry requested from the runs UI.",
  });

  revalidateRunPaths();

  if (!result.ok) {
    redirect(`${returnTo}?error=${encodeURIComponent(result.message)}`);
  }

  if (result.new_run_id) {
    redirect(`/app/runs/${result.new_run_id}`);
  }

  redirect(`/app/runs?message=${encodeURIComponent(result.message)}`);
}
