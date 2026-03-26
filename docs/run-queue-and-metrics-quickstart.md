# Run Queue And Metrics Quickstart

FlowHolt now has a durable run-job queue foundation and per-node execution metrics.

## What is new

- manual, webhook, and scheduled runs are first queued as `workflow_run_jobs`
- jobs can be drained by a protected worker endpoint
- each executed node now stores timing, attempt count, token estimate, and error details in `workflow_node_executions`
- the live monitor UI shows a node timeline, not only plain logs

## 1. Run the new Supabase migration

Run this new SQL file in a new Supabase query:

- `supabase/migrations/20260326_0006_run_queue_and_metrics.sql`

This adds:
- `workflow_run_jobs`
- `workflow_node_executions`

## 2. Recommended env key

In `flowholt-web/.env.local`, add:

```env
FLOWHOLT_WORKER_KEY=your-secret-value
```

If you already have `FLOWHOLT_SCHEDULER_KEY`, the worker can fall back to that, but a separate worker key is cleaner.

## 3. How runs behave now

Manual Studio run:
- clicking `Run workflow` now queues a job first
- FlowHolt then tries to process that queued job immediately
- if a temporary error happens, the job can stay queued for retry instead of being lost

Webhook run:
- webhook requests now create a queued job first
- if processed immediately, you get the run result
- if not, the API can return `accepted/queued`

Scheduled run:
- scheduler claims due schedules
- each claim creates a queued job
- the scheduler then tries to process that job right away

## 4. Optional worker endpoint

Protected endpoint:

- `POST /api/queue/worker`

Use header:

- `x-flowholt-worker-key: YOUR_KEY`

Example:

```bash
curl -X POST http://localhost:3000/api/queue/worker \
  -H "x-flowholt-worker-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"maxJobs":5}'
```

## 5. How to see output in the UI

1. Start the app.
2. Open Studio for a workflow.
3. Click `Run workflow`.
4. You will be taken to the live run page.
5. Watch:
   - overall run status
   - live logs
   - node timeline with durations, attempts, and token estimates

## 6. What this unlocks next

This is the backend base for the premium final platform:
- beautiful execution timeline UI
- retries and recovery instead of lost runs
- queue dashboards later
- per-node performance analytics later
- safer long-running automations
