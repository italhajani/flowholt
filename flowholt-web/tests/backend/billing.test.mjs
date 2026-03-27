import test from "node:test";
import assert from "node:assert/strict";

import {
  billingPlanCatalog,
  buildBillingInvoiceEstimate,
  buildDefaultWorkspaceBillingSubscription,
  buildUsageLimitPatchFromPlan,
  getBillingPlanByKey,
} from "../../src/lib/flowholt/billing.ts";

test("billing plan catalog exposes the main workspace plans", () => {
  assert.equal(billingPlanCatalog.length, 3);
  assert.equal(getBillingPlanByKey("pro")?.name, "Pro");
  assert.equal(getBillingPlanByKey("missing"), null);
});

test("buildUsageLimitPatchFromPlan maps plan limits into workspace usage fields", () => {
  const scalePlan = getBillingPlanByKey("scale");
  assert.ok(scalePlan);
  const patch = buildUsageLimitPatchFromPlan(scalePlan);

  assert.equal(patch.plan_name, "scale");
  assert.equal(patch.monthly_run_limit, scalePlan.monthlyRunLimit);
  assert.equal(patch.schedule_limit, scalePlan.scheduleLimit);
  assert.equal(patch.enforce_hard_limits, true);
});

test("buildBillingInvoiceEstimate keeps starter at zero with no overage", () => {
  const plan = getBillingPlanByKey("starter");
  assert.ok(plan);
  const subscription = buildDefaultWorkspaceBillingSubscription("workspace-1");
  const estimate = buildBillingInvoiceEstimate({
    plan,
    subscription,
    usage: {
      planName: "starter",
      enforceHardLimits: true,
      warningThresholdPercent: 80,
      periodLabel: "March 2026",
      runsMonthly: { used: 40, limit: 300, remaining: 260, percent: 13, level: "ok" },
      tokensMonthly: { used: 20000, limit: 500000, remaining: 480000, percent: 4, level: "ok" },
      activeWorkflows: { used: 4, limit: 25, remaining: 21, percent: 16, level: "ok" },
      members: { used: 2, limit: 10, remaining: 8, percent: 20, level: "ok" },
      schedules: { used: 3, limit: 25, remaining: 22, percent: 12, level: "ok" },
      toolCallsMonthlyCount: 10,
    },
  });

  assert.equal(estimate.totalAmountCents, 0);
  assert.equal(estimate.overageAmountCents, 0);
  assert.equal(estimate.lineItems.length, 1);
});

test("buildBillingInvoiceEstimate adds run and token overage for paid plans", () => {
  const plan = getBillingPlanByKey("pro");
  assert.ok(plan);
  const subscription = {
    ...buildDefaultWorkspaceBillingSubscription("workspace-2"),
    plan_key: plan.key,
    plan_name: plan.name,
    monthly_base_cents: plan.monthlyBaseCents,
    overage_run_cents: plan.overageRunCents,
    overage_per_1000_tokens_cents: plan.overagePer1000TokensCents,
  };

  const estimate = buildBillingInvoiceEstimate({
    plan,
    subscription,
    usage: {
      planName: "pro",
      enforceHardLimits: true,
      warningThresholdPercent: 80,
      periodLabel: "March 2026",
      runsMonthly: { used: 2605, limit: 2500, remaining: 0, percent: 104, level: "blocked" },
      tokensMonthly: { used: 3004500, limit: 3000000, remaining: 0, percent: 100, level: "blocked" },
      activeWorkflows: { used: 80, limit: 100, remaining: 20, percent: 80, level: "warn" },
      members: { used: 15, limit: 25, remaining: 10, percent: 60, level: "ok" },
      schedules: { used: 30, limit: 100, remaining: 70, percent: 30, level: "ok" },
      toolCallsMonthlyCount: 900,
    },
  });

  assert.equal(estimate.baseAmountCents, plan.monthlyBaseCents);
  assert.equal(estimate.overageAmountCents, 325);
  assert.equal(estimate.totalAmountCents, plan.monthlyBaseCents + 325);
  assert.equal(estimate.lineItems.length, 3);
  assert.equal(estimate.lineItems[1].quantity, 105);
  assert.equal(estimate.lineItems[2].quantity, 5);
});
