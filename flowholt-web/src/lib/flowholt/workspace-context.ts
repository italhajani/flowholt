import { cookies } from "next/headers";

import type {
  WorkspaceMembershipRecord,
  WorkspaceMembershipRole,
  WorkspaceRecord,
} from "@/lib/flowholt/types";
import { createClient } from "@/lib/supabase/server";

export const ACTIVE_WORKSPACE_COOKIE = "flowholt_active_workspace";

export type WorkspaceState = {
  schemaReady: boolean;
  workspaces: WorkspaceRecord[];
  activeWorkspace: WorkspaceRecord | null;
  currentUserId: string | null;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

function resolveActiveWorkspace(
  workspaces: WorkspaceRecord[],
  preferredWorkspaceId: string,
) {
  if (preferredWorkspaceId) {
    const preferred = workspaces.find((workspace) => workspace.id === preferredWorkspaceId);
    if (preferred) {
      return preferred;
    }
  }

  return workspaces[0] ?? null;
}

export function resolveWorkspaceRole(
  workspace: WorkspaceRecord | null,
  currentUserId: string | null,
  memberships: WorkspaceMembershipRecord[],
): WorkspaceMembershipRole | null {
  if (!workspace || !currentUserId) {
    return null;
  }

  if (workspace.owner_user_id === currentUserId) {
    return "owner";
  }

  return (
    memberships.find(
      (membership) => membership.user_id === currentUserId && membership.status === "active",
    )?.role ?? null
  );
}

export async function getWorkspaceState(): Promise<WorkspaceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const preferredWorkspaceId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value ?? "";

  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("id, owner_user_id, name, slug, description, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) {
    return {
      schemaReady: false,
      workspaces: [],
      activeWorkspace: null,
      currentUserId: user?.id ?? null,
      supabase,
    };
  }

  const workspaceList = (workspaces ?? []) as WorkspaceRecord[];

  return {
    schemaReady: true,
    workspaces: workspaceList,
    activeWorkspace: resolveActiveWorkspace(workspaceList, preferredWorkspaceId),
    currentUserId: user?.id ?? null,
    supabase,
  };
}