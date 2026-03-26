# Usage Limits Quickstart

This is the new beginner-friendly usage and limits layer for FlowHolt.

## What this feature means

FlowHolt now keeps a simple workspace plan summary so you can see:

- how many runs this workspace used this month
- how many tokens this workspace used this month
- how many active workflows are saved
- how many team members are in the workspace
- how many schedules are active
- how many tool calls ran this month

It also blocks new actions if the workspace goes past a hard limit.

## What to run in Supabase

Open Supabase SQL editor and run this as a **new query**:

- `supabase/migrations/20260326_0010_workspace_usage_limits.sql`

Do not replace old SQL. This is one more migration on top.

## Where to see it in the app

1. Open `/app/dashboard`
2. Look at `Usage pulse`
3. Look at `Plan and limits`
4. Open `/app/settings`
5. Look at the new `Plan and usage` card

## What happens now when a limit is reached

Instead of confusing crashes, FlowHolt now gives friendly messages when a workspace cannot:

- create more workflows
- add more members
- create more schedules
- enqueue more runs

## Easy mental model

- Dashboard = quick summary
- Settings = workspace/team + plan details
- Limits = protection so one workspace does not silently overrun usage
- This is the first billing-style layer, not the final billing system yet
