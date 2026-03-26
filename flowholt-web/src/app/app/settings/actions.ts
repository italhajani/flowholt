"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACTIVE_WORKSPACE_COOKIE } from "@/lib/flowholt/workspace-context";
import {
  assertWorkspaceCanAddMember,
  getWorkspaceUsageErrorMessage,
} from "@/lib/flowholt/usage-limits";
import { createClient } from "@/lib/supabase/server";

function normalizeRole(value: FormDataEntryValue | null): "owner" | "admin" | "member" {
  return value === "owner" || value === "admin" || value === "member" ? value : "member";
}

function redirectWithMessage(kind: "message" | "error", value: string): never {
  redirect(`/app/settings?${kind}=${encodeURIComponent(value)}`);
}

function revalidateWorkspacePages() {
  revalidatePath("/app/dashboard");
  revalidatePath("/app/workflows");
  revalidatePath("/app/integrations");
  revalidatePath("/app/runs");
  revalidatePath("/app/settings");
}

export async function setActiveWorkspace(formData: FormData) {
  const workspaceIdValue = formData.get("workspaceId");
  if (typeof workspaceIdValue !== "string" || !workspaceIdValue) {
    redirectWithMessage("error", "Choose a workspace first.");
  }

  const workspaceId = workspaceIdValue;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error || !data) {
    redirectWithMessage("error", "That workspace is not available to this account.");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidateWorkspacePages();
  redirectWithMessage("message", "Active workspace updated.");
}

export async function addWorkspaceMember(formData: FormData) {
  const workspaceIdValue = formData.get("workspaceId");
  const userIdValue = formData.get("userId");
  const role = normalizeRole(formData.get("role"));

  if (typeof workspaceIdValue !== "string" || !workspaceIdValue) {
    redirectWithMessage("error", "Missing workspace id.");
  }

  if (typeof userIdValue !== "string" || !userIdValue.trim()) {
    redirectWithMessage("error", "Enter a teammate user id first.");
  }

  const workspaceId = workspaceIdValue;
  const userId = userIdValue.trim();
  const supabase = await createClient();

  try {
    await assertWorkspaceCanAddMember(supabase, workspaceId);
  } catch (error) {
    redirectWithMessage("error", getWorkspaceUsageErrorMessage(error, "Unable to add teammate."));
  }

  const { error } = await supabase.from("workspace_memberships").insert({
    workspace_id: workspaceId,
    user_id: userId,
    role,
    status: "active",
  });

  if (error) {
    redirectWithMessage("error", error.message);
  }

  revalidateWorkspacePages();
  redirectWithMessage("message", "Team member added.");
}

export async function updateWorkspaceMemberRole(formData: FormData) {
  const membershipIdValue = formData.get("membershipId");
  const role = normalizeRole(formData.get("role"));

  if (typeof membershipIdValue !== "string" || !membershipIdValue) {
    redirectWithMessage("error", "Missing membership id.");
  }

  const membershipId = membershipIdValue;
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspace_memberships")
    .update({ role })
    .eq("id", membershipId);

  if (error) {
    redirectWithMessage("error", error.message);
  }

  revalidateWorkspacePages();
  redirectWithMessage("message", "Role updated.");
}

export async function removeWorkspaceMember(formData: FormData) {
  const membershipIdValue = formData.get("membershipId");

  if (typeof membershipIdValue !== "string" || !membershipIdValue) {
    redirectWithMessage("error", "Missing membership id.");
  }

  const membershipId = membershipIdValue;
  const supabase = await createClient();
  const { data: membership, error: lookupError } = await supabase
    .from("workspace_memberships")
    .select("id, role")
    .eq("id", membershipId)
    .maybeSingle();

  if (lookupError || !membership) {
    redirectWithMessage("error", "Membership not found.");
  }

  const membershipRole = membership.role;
  if (membershipRole === "owner") {
    redirectWithMessage("error", "Owner access cannot be removed here.");
  }

  const { error } = await supabase
    .from("workspace_memberships")
    .delete()
    .eq("id", membershipId);

  if (error) {
    redirectWithMessage("error", error.message);
  }

  revalidateWorkspacePages();
  redirectWithMessage("message", "Team member removed.");
}
