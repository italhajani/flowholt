# Billing Engine Quickstart

FlowHolt now has a real billing foundation on top of workspace usage limits.

This is not the final payment system yet, but it already gives you:

- plan records
- workspace subscriptions
- draft invoice generation
- invoice history in Settings
- plan switching that also syncs usage limits

## What changed

Settings now has a real billing layer.

You can now see:

- current plan
- monthly base price
- current billing period
- draft invoice estimate
- overage estimate
- recent invoices

If you have admin or owner access, you can now:

- switch plan between `Starter`, `Pro`, and `Scale`
- set a billing email
- create a draft invoice from the current usage snapshot

## Database step

Run this migration in Supabase SQL editor as a **new query**:

- `20260328_0017_workspace_billing_engine.sql`

Do not replace old queries.

## How to see it

1. Run `20260328_0017_workspace_billing_engine.sql` in Supabase.
2. Restart `flowholt-web`.
3. Open `/app/settings`.
4. Look for the new `Billing engine` card.
5. If you are owner/admin, try changing the plan and then click `Create draft invoice`.

## What to expect

- changing the plan updates both the billing subscription and the workspace usage limits
- draft invoices use the current usage snapshot, so you can see what the workspace would be billed right now
- starter stays at zero unless you later add paid billing behavior
- paid plans can now show overage estimates for runs and token usage

## What is still left in billing

The remaining billing work is the external/payment side:

- payment provider webhooks
- invoice payment tracking
- upgrade/downgrade lifecycle rules
- overage settlement rules
- customer portal style UX
