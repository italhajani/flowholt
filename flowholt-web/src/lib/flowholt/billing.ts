import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  WorkspaceBillingEstimate,
  WorkspaceBillingInvoiceLineItem,
  WorkspaceBillingInvoiceRecord,
  WorkspaceBillingPlanDefinition,
  WorkspaceBillingSnapshot,
  WorkspaceBillingSubscriptionRecord,
  WorkspaceUsageStatus,
} from "./types.ts";
import { getWorkspaceUsageStatus } from "./usage-limits.ts";

export const billingPlanCatalog: WorkspaceBillingPlanDefinition[] = [
  {
    key: "starter",
    name: "Starter",
    description: "Best for one builder proving the workflow before team rollout.",
    monthlyBaseCents: 0,
    currency: "usd",
    monthlyRunLimit: 300,
    monthlyTokenLimit: 500000,
    activeWorkflowLimit: 25,
    memberLimit: 10,
    scheduleLimit: 25,
    overageRunCents: 0,
    overagePer1000TokensCents: 0,
  },
  {
    key: "pro",
    name: "Pro",
    description: "For serious builders who need more volume, more schedules, and real collaboration room.",
    monthlyBaseCents: 4900,
    currency: "usd",
    monthlyRunLimit: 2500,
    monthlyTokenLimit: 3000000,
    activeWorkflowLimit: 100,
    memberLimit: 25,
    scheduleLimit: 100,
    overageRunCents: 3,
    overagePer1000TokensCents: 2,
  },
  {
    key: "scale",
    name: "Scale",
    description: "For teams operating FlowHolt as a real automation product surface.",
    monthlyBaseCents: 19900,
    currency: "usd",
    monthlyRunLimit: 12000,
    monthlyTokenLimit: 20000000,
    activeWorkflowLimit: 500,
    memberLimit: 100,
    scheduleLimit: 500,
    overageRunCents: 2,
    overagePer1000TokensCents: 1,
  },
];

const billingPlanFallback = billingPlanCatalog[0];

function startOfCurrentBillingPeriod() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function endOfCurrentBillingPeriod() {
  const start = startOfCurrentBillingPeriod();
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeCurrency(value: unknown, fallback = "usd") {
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : fallback;
}

function normalizePlanKey(value: unknown, fallback = billingPlanFallback.key) {
  return value === "starter" || value === "pro" || value === "scale" ? value : fallback;
}

function asPositiveInt(value: unknown, fallback: number) {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? Math.round(next) : fallback;
}

export function getCurrentBillingPeriodBounds() {
  return {
    periodStart: startOfCurrentBillingPeriod().toISOString(),
    periodEnd: endOfCurrentBillingPeriod().toISOString(),
  };
}

export function getBillingPlanByKey(key: string) {
  return billingPlanCatalog.find((plan) => plan.key === key) ?? null;
}

export function formatCurrencyCents(amountCents: number, currency = "usd") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

export function buildUsageLimitPatchFromPlan(plan: WorkspaceBillingPlanDefinition) {
  return {
    plan_name: plan.key,
    monthly_run_limit: plan.monthlyRunLimit,
    monthly_token_limit: plan.monthlyTokenLimit,
    active_workflow_limit: plan.activeWorkflowLimit,
    member_limit: plan.memberLimit,
    schedule_limit: plan.scheduleLimit,
    warning_threshold_percent: 80,
    enforce_hard_limits: true,
  };
}

export function buildDefaultWorkspaceBillingSubscription(workspaceId: string): WorkspaceBillingSubscriptionRecord {
  const bounds = getCurrentBillingPeriodBounds();

  return {
    workspace_id: workspaceId,
    created_by_user_id: null,
    plan_key: billingPlanFallback.key,
    plan_name: billingPlanFallback.name,
    status: "active",
    billing_email: "",
    currency: billingPlanFallback.currency,
    monthly_base_cents: billingPlanFallback.monthlyBaseCents,
    overage_run_cents: billingPlanFallback.overageRunCents,
    overage_per_1000_tokens_cents: billingPlanFallback.overagePer1000TokensCents,
    current_period_start: bounds.periodStart,
    current_period_end: bounds.periodEnd,
    cancel_at_period_end: false,
    trial_ends_at: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  };
}

function toWorkspaceBillingSubscriptionRecord(
  value: unknown,
  workspaceId: string,
): WorkspaceBillingSubscriptionRecord {
  const row = asRecord(value);
  const fallback = buildDefaultWorkspaceBillingSubscription(workspaceId);

  return {
    workspace_id: typeof row.workspace_id === "string" ? row.workspace_id : workspaceId,
    created_by_user_id: typeof row.created_by_user_id === "string" ? row.created_by_user_id : null,
    plan_key: normalizePlanKey(row.plan_key, fallback.plan_key),
    plan_name: typeof row.plan_name === "string" && row.plan_name.trim() ? row.plan_name.trim() : fallback.plan_name,
    status:
      row.status === "trialing" || row.status === "past_due" || row.status === "cancelled"
        ? row.status
        : "active",
    billing_email: typeof row.billing_email === "string" ? row.billing_email.trim() : "",
    currency: normalizeCurrency(row.currency, fallback.currency),
    monthly_base_cents: asPositiveInt(row.monthly_base_cents, fallback.monthly_base_cents),
    overage_run_cents: asPositiveInt(row.overage_run_cents, fallback.overage_run_cents),
    overage_per_1000_tokens_cents: asPositiveInt(
      row.overage_per_1000_tokens_cents,
      fallback.overage_per_1000_tokens_cents,
    ),
    current_period_start:
      typeof row.current_period_start === "string" ? row.current_period_start : fallback.current_period_start,
    current_period_end:
      typeof row.current_period_end === "string" ? row.current_period_end : fallback.current_period_end,
    cancel_at_period_end: row.cancel_at_period_end === true,
    trial_ends_at: typeof row.trial_ends_at === "string" ? row.trial_ends_at : null,
    created_at: typeof row.created_at === "string" ? row.created_at : fallback.created_at,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : fallback.updated_at,
  };
}

function toWorkspaceBillingInvoiceRecord(value: unknown): WorkspaceBillingInvoiceRecord {
  const row = asRecord(value);
  const lineItems = Array.isArray(row.line_items)
    ? row.line_items
        .map((item) => asRecord(item))
        .map((item) => ({
          key: typeof item.key === "string" ? item.key : crypto.randomUUID(),
          label: typeof item.label === "string" ? item.label : "Billing line item",
          quantity: asPositiveInt(item.quantity, 1),
          unit_amount_cents: asPositiveInt(item.unit_amount_cents, 0),
          total_amount_cents: asPositiveInt(item.total_amount_cents, 0),
          detail: typeof item.detail === "string" ? item.detail : "",
        }))
    : [];

  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    workspace_id: typeof row.workspace_id === "string" ? row.workspace_id : "",
    created_by_user_id: typeof row.created_by_user_id === "string" ? row.created_by_user_id : null,
    status: row.status === "open" || row.status === "paid" || row.status === "void" ? row.status : "draft",
    currency: normalizeCurrency(row.currency),
    period_start: typeof row.period_start === "string" ? row.period_start : new Date(0).toISOString(),
    period_end: typeof row.period_end === "string" ? row.period_end : new Date(0).toISOString(),
    base_amount_cents: asPositiveInt(row.base_amount_cents, 0),
    overage_amount_cents: asPositiveInt(row.overage_amount_cents, 0),
    total_amount_cents: asPositiveInt(row.total_amount_cents, 0),
    line_items: lineItems,
    issued_at: typeof row.issued_at === "string" ? row.issued_at : new Date(0).toISOString(),
    paid_at: typeof row.paid_at === "string" ? row.paid_at : null,
    notes: typeof row.notes === "string" ? row.notes : "",
    created_at: typeof row.created_at === "string" ? row.created_at : new Date(0).toISOString(),
  };
}

export function buildBillingInvoiceEstimate({
  plan,
  subscription,
  usage,
}: {
  plan: WorkspaceBillingPlanDefinition;
  subscription: WorkspaceBillingSubscriptionRecord;
  usage: WorkspaceUsageStatus;
}): WorkspaceBillingEstimate {
  const extraRuns = Math.max(0, usage.runsMonthly.used - usage.runsMonthly.limit);
  const extraTokenUnits = Math.ceil(Math.max(0, usage.tokensMonthly.used - usage.tokensMonthly.limit) / 1000);

  const lineItems: WorkspaceBillingInvoiceLineItem[] = [
    {
      key: "base-plan",
      label: `${plan.name} monthly base`,
      quantity: 1,
      unit_amount_cents: subscription.monthly_base_cents,
      total_amount_cents: subscription.monthly_base_cents,
      detail: usage.periodLabel,
    },
  ];

  if (extraRuns > 0 && subscription.overage_run_cents > 0) {
    lineItems.push({
      key: "overage-runs",
      label: "Run overage",
      quantity: extraRuns,
      unit_amount_cents: subscription.overage_run_cents,
      total_amount_cents: extraRuns * subscription.overage_run_cents,
      detail: `${extraRuns} extra runs beyond the included monthly plan limit.`,
    });
  }

  if (extraTokenUnits > 0 && subscription.overage_per_1000_tokens_cents > 0) {
    lineItems.push({
      key: "overage-tokens",
      label: "Token overage",
      quantity: extraTokenUnits,
      unit_amount_cents: subscription.overage_per_1000_tokens_cents,
      total_amount_cents: extraTokenUnits * subscription.overage_per_1000_tokens_cents,
      detail: `${extraTokenUnits} x 1k token blocks above the monthly included budget.`,
    });
  }

  const baseAmountCents = lineItems
    .filter((item) => item.key === "base-plan")
    .reduce((total, item) => total + item.total_amount_cents, 0);
  const overageAmountCents = lineItems
    .filter((item) => item.key !== "base-plan")
    .reduce((total, item) => total + item.total_amount_cents, 0);

  return {
    currency: subscription.currency,
    lineItems,
    baseAmountCents,
    overageAmountCents,
    totalAmountCents: baseAmountCents + overageAmountCents,
  };
}

export async function getWorkspaceBillingSnapshot({
  supabase,
  workspaceId,
  memberCountHint,
}: {
  supabase: SupabaseClient;
  workspaceId: string;
  memberCountHint?: number;
}): Promise<{ billingReady: boolean; billing: WorkspaceBillingSnapshot | null; usage: WorkspaceUsageStatus | null }> {
  const usage = await getWorkspaceUsageStatus({
    supabase,
    workspaceId,
    memberCountHint,
  });

  if (!workspaceId || !usage) {
    return {
      billingReady: false,
      billing: null,
      usage,
    };
  }

  const [subscriptionResult, invoicesResult] = await Promise.all([
    supabase
      .from("workspace_billing_subscriptions")
      .select(
        "workspace_id, created_by_user_id, plan_key, plan_name, status, billing_email, currency, monthly_base_cents, overage_run_cents, overage_per_1000_tokens_cents, current_period_start, current_period_end, cancel_at_period_end, trial_ends_at, created_at, updated_at",
      )
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
    supabase
      .from("workspace_billing_invoices")
      .select(
        "id, workspace_id, created_by_user_id, status, currency, period_start, period_end, base_amount_cents, overage_amount_cents, total_amount_cents, line_items, issued_at, paid_at, notes, created_at",
      )
      .eq("workspace_id", workspaceId)
      .order("issued_at", { ascending: false })
      .limit(6),
  ]);

  if (subscriptionResult.error || invoicesResult.error) {
    return {
      billingReady: false,
      billing: null,
      usage,
    };
  }

  const subscription = toWorkspaceBillingSubscriptionRecord(subscriptionResult.data, workspaceId);
  const currentPlan = getBillingPlanByKey(subscription.plan_key) ?? billingPlanFallback;
  const estimate = buildBillingInvoiceEstimate({
    plan: currentPlan,
    subscription,
    usage,
  });

  return {
    billingReady: true,
    usage,
    billing: {
      currentPlan,
      subscription,
      estimate,
      invoices: ((invoicesResult.data ?? []) as unknown[]).map((row) => toWorkspaceBillingInvoiceRecord(row)),
    },
  };
}
