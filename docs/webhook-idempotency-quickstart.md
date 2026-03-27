# Webhook Idempotency Quickstart

FlowHolt now has a safer webhook layer.

## What is new

1. Webhooks can use an idempotency key.
2. If the same webhook event is sent again with the same key, FlowHolt reuses the first result instead of creating a duplicate run.
3. Scheduled runs now queue first, so the scheduler does not stay busy doing long execution work inline.

## What to run in Supabase

Open Supabase SQL editor and run this as a **new query**:

- `supabase/migrations/20260327_0013_webhook_idempotency.sql`

Do not replace older SQL. This is one more migration on top.

## How to test webhook idempotency

Send a webhook request to the same workflow twice with the same header:

- `Idempotency-Key: any-stable-value`

Example idea:

- first request creates or reuses the run result
- second request with the same key returns the stored result instead of creating a second run

## How to see it in the product

1. Restart `flowholt-web`
2. Trigger a webhook-connected workflow twice with the same idempotency key
3. Open `/app/runs`
4. You should see only one real workflow run for that event, not duplicates

## Easy mental model

- idempotency key = one external event identity
- same key again = same event, so do not run twice
- scheduler now queues work first = safer background execution and less lease risk
