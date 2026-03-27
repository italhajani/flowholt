import { listWorkspaceAuditLogs } from "@/lib/flowholt/audit";
import { createClient } from "@/lib/supabase/server";

export async function getWorkspaceAuditTrail(workspaceId: string, limit = 12) {
  if (!workspaceId) {
    return { auditReady: true, logs: [] };
  }

  const supabase = await createClient();
  return listWorkspaceAuditLogs({ supabase, workspaceId, limit });
}
