import type { SupabaseClient } from "@supabase/supabase-js";

import type { WorkspaceAuditLogRecord } from "@/lib/flowholt/types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toAuditLogRecord(value: unknown): WorkspaceAuditLogRecord {
  const row = asRecord(value);
  return {
    id: Number(row.id) || 0,
    workspace_id: typeof row.workspace_id === "string" ? row.workspace_id : "",
    actor_user_id: typeof row.actor_user_id === "string" ? row.actor_user_id : null,
    action: typeof row.action === "string" ? row.action : "",
    target_type: typeof row.target_type === "string" ? row.target_type : "",
    target_id: typeof row.target_id === "string" ? row.target_id : "",
    summary: typeof row.summary === "string" ? row.summary : "",
    payload: asRecord(row.payload),
    created_at: typeof row.created_at === "string" ? row.created_at : new Date(0).toISOString(),
  };
}

export async function recordWorkspaceAuditLog({
  supabase,
  workspaceId,
  actorUserId,
  action,
  targetType,
  targetId,
  summary,
  payload,
}: {
  supabase: SupabaseClient;
  workspaceId: string;
  actorUserId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  payload?: Record<string, unknown>;
}) {
  if (!workspaceId || !action || !targetType || !targetId) {
    return;
  }

  try {
    await supabase.from("workspace_audit_logs").insert({
      workspace_id: workspaceId,
      actor_user_id: actorUserId ?? null,
      action,
      target_type: targetType,
      target_id: targetId,
      summary,
      payload: payload ?? {},
    });
  } catch {
    // Best-effort audit logging only. Main actions should still complete.
  }
}

export async function listWorkspaceAuditLogs({
  supabase,
  workspaceId,
  limit = 12,
}: {
  supabase: SupabaseClient;
  workspaceId: string;
  limit?: number;
}): Promise<{ auditReady: boolean; logs: WorkspaceAuditLogRecord[] }> {
  if (!workspaceId) {
    return { auditReady: true, logs: [] };
  }

  const { data, error } = await supabase
    .from("workspace_audit_logs")
    .select("id, workspace_id, actor_user_id, action, target_type, target_id, summary, payload, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { auditReady: false, logs: [] };
  }

  return {
    auditReady: true,
    logs: (data ?? []).map((item) => toAuditLogRecord(item)),
  };
}
