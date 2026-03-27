# Scheduler Lease Hardening Quickstart

This improves automatic-run safety in FlowHolt.

## What changed

- schedules now keep track of the exact due run being processed
- if the scheduler crashes after claiming a schedule, the next tick can recover that missed run
- schedule leases now use a token so release updates do not accidentally stomp another scheduler tick

## What you need to do

1. Open Supabase SQL editor.
2. Make a new query.
3. Run `supabase/migrations/20260327_0015_scheduler_claim_leases.sql`.
4. Restart `flowholt-web`.
5. Restart your daemon if you use it.

## How to see it

Normal use:

1. Run the app with `npm run dev` in `flowholt-web`.
2. In a second terminal, run `npm run daemon`.
3. Create a schedule from Studio.
4. Watch `/app/runs` for scheduled runs.

## Easy meaning

Before this, a scheduler crash could move a schedule forward and miss one due run.
Now FlowHolt remembers that claimed run and can recover it on the next scheduler tick.
