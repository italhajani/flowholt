"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { recordWorkspaceAuditLog } from "@/lib/flowholt/audit";
import { ACTIVE_WORKSPACE_COOKIE } from "@/lib/flowholt/workspace-context";
import {
  buildUsageLimitPatchFromPlan,
  getBillingPlanByKey,
  getCurrentBillingPeriodBounds,
  getWorkspaceBillingSnapshot,
} from "@/lib/flowholt/billing";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    await assertWorkspaceCanAddMember(supabase, workspaceId);
  } catch (error) {
    redirectWithMessage("error", getWorkspaceUsageErrorMessage(error, "Unable to add teammate."));
  }

  const { data: membership, error } = await supabase
    .from("workspace_memberships")
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      role,
      status: "active",
    })
    .select("id, workspace_id, user_id, role")
    .single();

  if (error || !membership) {
    redirectWithMessage("error", error?.message ?? "Unable to add teammate.");
  }

  await recordWorkspaceAuditLog({
    supabase,
    workspaceId,
    actorUserId: user.id,
    action: "membership.added",
    targetType: "workspace_membership",
    targetId: membership.id,
    summary: `Added ${userId} as ${role}`,
    payload: {
      member_user_id: membership.user_id,
      role: membership.role,
    },
  });

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existing, error: lookupError } = await supabase
    .from("workspace_memberships")
    .select("id, workspace_id, user_id, role")
    .eq("id", membershipId)
    .maybeSingle();

  if (lookupError || !existing) {
    redirectWithMessage("error", lookupError?.message ?? "Membership not found.");
  }

  const { error } = await supabase
    .from("workspace_memberships")
    .update({ role })
    .eq("id", membershipId);

  if (error) {
    redirectWithMessage("error", error.message);
  }

  await recordWorkspaceAuditLog({
    supabase,
    workspaceId: existing.workspace_id,
    actorUserId: user.id,
    action: "membership.role_updated",
    targetType: "workspace_membership",
    targetId: existing.id,
    summary: `Changed ${existing.user_id} from ${existing.role} to ${role}`,
    payload: {
      member_user_id: existing.user_id,
      before_role: existing.role,
      after_role: role,
    },
  });

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership, error: lookupError } = await supabase
    .from("workspace_memberships")
    .select("id, workspace_id, user_id, role")
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

  await recordWorkspaceAuditLog({
    supabase,
    workspaceId: membership.workspace_id,
    actorUserId: user.id,
    action: "membership.removed",
    targetType: "workspace_membership",
    targetId: membership.id,
    summary: `Removed ${membership.user_id} from the workspace`,
    payload: {
      member_user_id: membership.user_id,
      removed_role: membership.role,
    },
  });

  revalidateWorkspacePages();
  redirectWithMessage("message", "Team member removed.");
}


export async function changeWorkspacePlan(formData: FormData) {
  const workspaceIdValue = formData.get("workspaceId");
  const planKeyValue = formData.get("planKey");
  const billingEmailValue = formData.get("billingEmail");

  if (typeof workspaceIdValue !== "string" || !workspaceIdValue) {
    redirectWithMessage("error", "Missing workspace id.");
  }

  if (typeof planKeyValue !== "string" || !planKeyValue) {
    redirectWithMessage("error", "Choose a plan first.");
  }

  const plan = getBillingPlanByKey(planKeyValue);
  if (!plan) {
    redirectWithMessage("error", "That billing plan is not available.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspaceId = workspaceIdValue;
  const billingEmail = typeof billingEmailValue === "string" ? billingEmailValue.trim() : "";
  const bounds = getCurrentBillingPeriodBounds();

  const { error: subscriptionError } = await supabase
    .from("workspace_billing_subscriptions")
    .upsert({
      workspace_id: workspaceId,
      created_by_user_id: user.id,
      plan_key: plan.key,
      plan_name: plan.name,
      status: "active",
      billing_email: billingEmail,
      currency: plan.currency,
      monthly_base_cents: plan.monthlyBaseCents,
      overage_run_cents: plan.overageRunCents,
      overage_per_1000_tokens_cents: plan.overagePer1000TokensCents,
      current_period_start: bounds.periodStart,
      current_period_end: bounds.periodEnd,
      cancel_at_period_end: false,
      trial_ends_at: null,
    });

  if (subscriptionError) {
    redirectWithMessage("error", subscriptionError.message);
  }

  const { error: limitsError } = await supabase
    .from("workspace_usage_limits")
    .upsert({
      workspace_id: workspaceId,
      ...buildUsageLimitPatchFromPlan(plan),
    });

  if (limitsError) {
    redirectWithMessage("error", limitsError.message);
  }

  await recordWorkspaceAuditLog({
    supabase,
    workspaceId,
    actorUserId: user.id,
    action: "billing.plan_changed",
    targetType: "workspace_billing_subscription",
    targetId: workspaceId,
    summary: `Changed workspace plan to ${plan.name}`,
    payload: {
      plan_key: plan.key,
      plan_name: plan.name,
      billing_email: billingEmail,
    },
  });

  revalidateWorkspacePages();
  redirectWithMessage("message", `Workspace plan changed to ${plan.name}.`);
}

export async function createWorkspaceInvoice(formData: FormData) {
  const workspaceIdValue = formData.get("workspaceId");

  if (typeof workspaceIdValue !== "string" || !workspaceIdValue) {
    redirectWithMessage("error", "Missing workspace id.");
  }

  const workspaceId = workspaceIdValue;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const billingSnapshot = await getWorkspaceBillingSnapshot({
    supabase,
    workspaceId,
  });

  if (!billingSnapshot.billingReady || !billingSnapshot.billing) {
    redirectWithMessage("error", "Billing tables are not ready in this database yet.");
  }

  const { billing } = billingSnapshot;
  const { error } = await supabase
    .from("workspace_billing_invoices")
    .insert({
      workspace_id: workspaceId,
      created_by_user_id: user.id,
      status: "draft",
      currency: billing.subscription.currency,
      period_start: billing.subscription.current_period_start,
      period_end: billing.subscription.current_period_end,
      base_amount_cents: billing.estimate.baseAmountCents,
      overage_amount_cents: billing.estimate.overageAmountCents,
      total_amount_cents: billing.estimate.totalAmountCents,
      line_items: billing.estimate.lineItems,
      notes: "Draft invoice generated from the current workspace usage snapshot.",
    });

  if (error) {
    redirectWithMessage("error", error.message);
  }

  await recordWorkspaceAuditLog({
    supabase,
    workspaceId,
    actorUserId: user.id,
    action: "billing.invoice_drafted",
    targetType: "workspace_billing_invoice",
    targetId: workspaceId,
    summary: `Created a draft invoice for ${billing.currentPlan.name}`,
    payload: {
      plan_key: billing.currentPlan.key,
      total_amount_cents: billing.estimate.totalAmountCents,
      currency: billing.subscription.currency,
    },
  });

  revalidateWorkspacePages();
  redirectWithMessage("message", "Draft invoice created.");
}
