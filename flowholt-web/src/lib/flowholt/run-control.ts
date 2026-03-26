import type { SupabaseClient } from "@supabase/supabase-js";

type CancelRunResult =
  | {
      ok: true;
      run_id: string;
      status: "cancelled";
      previous_status: "queued" | "running";
    }
  | {
      ok: false;
      reason: "not_found" | "already_finished" | "update_failed";
      run_id: string;
      status?: string;
      message: string;
    };

export async function cancelWorkflowRun(
  supabase: SupabaseClient,
  input: {
    runId: string;
    reason?: string;
  },
): Promise<CancelRunResult> {
  const runId = input.runId.trim();
  const cancelReason = input.reason?.trim() || "Run cancelled by user.";

  if (!runId) {
    return {
      ok: false,
      reason: "not_found",
      run_id: "",
      message: "Missing run id.",
    };
  }

  const { data: runRow, error: runError } = await supabase
    .from("workflow_runs")
    .select("id, workflow_id, workspace_id, status")
    .eq("id", runId)
    .maybeSingle();

  if (runError || !runRow) {
    return {
      ok: false,
      reason: "not_found",
      run_id: runId,
      message: "Run not found.",
    };
  }

  const status = String(runRow.status);
  if (!["queued", "running"].includes(status)) {
    return {
      ok: false,
      reason: "already_finished",
      run_id: runId,
      status,
      message: `Run is already ${status}.`,
    };
  }

  const { data: updatedRow, error: updateError } = await supabase
    .from("workflow_runs")
    .update({
      status: "cancelled",
      error_message: cancelReason,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId)
    .in("status", ["queued", "running"])
    .select("id")
    .maybeSingle();

  if (updateError || !updatedRow) {
    return {
      ok: false,
      reason: "update_failed",
      run_id: runId,
      message: updateError?.message ?? "Unable to cancel run.",
    };
  }

  await supabase.from("run_logs").insert({
    run_id: runId,
    workflow_id: runRow.workflow_id,
    workspace_id: runRow.workspace_id,
    node_id: null,
    level: "warn",
    message: "Run cancelled by user request.",
    payload: {
      reason: cancelReason,
      previous_status: status,
    },
  });

  return {
    ok: true,
    run_id: runId,
    status: "cancelled",
    previous_status: status as "queued" | "running",
  };
}
