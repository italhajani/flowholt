# Scheduler Quickstart

This adds recurring workflow runs without manual clicks or webhooks.

## 1. Run migration

In Supabase SQL editor, run:

- `supabase/migrations/20260326_0003_workflow_schedules.sql`

## 2. Configure scheduler key

In `flowholt-web/.env.local` add:

- `FLOWHOLT_SCHEDULER_KEY=your-strong-secret`

## 3. Create a schedule (API)

```bash
curl -X POST "http://localhost:3000/api/schedules" \
  -H "Content-Type: application/json" \
  -b "your-auth-cookie" \
  -d '{"workflowId":"YOUR_WORKFLOW_ID","label":"Hourly run","intervalMinutes":60}'
```

Or list schedules:

```bash
curl "http://localhost:3000/api/schedules?workflowId=YOUR_WORKFLOW_ID" -b "your-auth-cookie"
```

Update schedule:

```bash
curl -X PATCH "http://localhost:3000/api/schedules/YOUR_SCHEDULE_ID" \
  -H "Content-Type: application/json" \
  -b "your-auth-cookie" \
  -d '{"status":"active","intervalMinutes":30}'
```

## 4. Trigger scheduler tick

This endpoint is designed for cron jobs.

```bash
curl -X POST "http://localhost:3000/api/scheduler/tick" \
  -H "x-flowholt-scheduler-key: your-strong-secret"
```

## 5. Verify output

- Open `/app/runs` to confirm trigger source `schedule`
- Check run logs and outputs
- Inspect schedule state via `/api/schedules`

## Production note

Use a cron provider (or Vercel cron) to call `/api/scheduler/tick` on a regular cadence.
