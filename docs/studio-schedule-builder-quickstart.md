# Studio Schedule Builder Quickstart

This is the easy way to make a workflow run automatically.

## What it does

- Creates a repeating schedule for a workflow.
- Tells FlowHolt when the first automatic run should happen.
- Lets you choose between custom intervals, daily runs, and weekday runs.
- Lets you pause, resume, refresh, or delete schedules from Studio.

## How to see it in the UI

1. Start the app in `flowholt-web` with `npm run dev`.
2. Open any workflow in Studio at `/app/studio/{workflowId}`.
3. On the right side, open the `Schedule builder` card.
4. Pick a preset:
   `Custom interval`, `Daily`, or `Weekdays`.
5. Choose the first run time, then click `Create automatic schedule`.

## What to expect

- The schedule will appear in the same card.
- `Pause` stops future automatic runs.
- `Resume` turns them back on.
- `Run soon` moves the next run time to now so the scheduler can pick it up quickly.
- Daily and weekday presets keep using the same time after the first run.

## Important setup

The scheduler backend still needs to be configured once:

- Run the schedule migrations in Supabase if you have not done them already.
- For this preset step, run `supabase/migrations/20260327_0016_workflow_schedule_patterns.sql` as a new query.
- Set `FLOWHOLT_SCHEDULER_KEY` in `flowholt-web/.env.local`.
- Trigger your scheduler tick process the way described in `docs/scheduler-quickstart.md`.

## Simple mental model

- Studio schedule builder = where you create the automation.
- Scheduler tick endpoint = the background thing that checks which workflows are due.
- Runs page = where you watch the results.