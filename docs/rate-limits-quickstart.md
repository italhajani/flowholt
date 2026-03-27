# Rate Limits Quickstart

FlowHolt now has a first abuse-protection layer for key endpoints.

## What is protected now

- public workflow webhooks
- scheduler tick endpoint
- worker endpoint

## What to run in Supabase

Open Supabase SQL editor and run this as a **new query**:

- `supabase/migrations/20260327_0012_request_rate_limits.sql`

Do not replace older SQL. This is one more migration on top.

## What happens after this

If one client sends too many requests too quickly, FlowHolt now returns:

- HTTP `429`
- a simple error message
- a `Retry-After` response header

## Easy way to understand it

- webhook limit = stops one source from spamming a workflow
- scheduler limit = stops accidental rapid scheduler loops
- worker limit = stops runaway worker polling

## Where this is implemented

- `src/lib/flowholt/rate-limit.ts`
- `src/app/api/webhooks/[workflowId]/route.ts`
- `src/app/api/scheduler/tick/route.ts`
- `src/app/api/queue/worker/route.ts`
