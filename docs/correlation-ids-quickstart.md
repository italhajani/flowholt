# Correlation IDs Quickstart

This step gives each workflow run one trace id so you can follow the same request across:

- webhook or schedule trigger
- queued job
- workflow run
- engine execution
- live run monitor

## What this is for

If something fails, you no longer have to guess which trigger created which run.
One id follows the whole path.

## How to see it

1. Run the new migration file in Supabase SQL editor as a **new query**:
   - `supabase/migrations/20260327_0014_correlation_ids.sql`
2. Restart `flowholt-web`
3. Restart `flowholt-engine` if it is running
4. Trigger any workflow from Studio, webhook, or scheduler
5. Open `/app/runs`
6. Open the live monitor for that run
7. You will now see `Trace ID` near the top of the live monitor

## Extra places it now appears

- `workflow_runs.request_correlation_id`
- `workflow_run_jobs.request_correlation_id`
- webhook JSON responses
- scheduler queue results
- engine summary/output/log payloads

## Easy meaning

- one workflow event = one trace id
- same trace id = same run journey
- this helps debugging, support, and future monitoring dashboards
