alter table public.workflow_runs
  add column if not exists request_correlation_id text;

alter table public.workflow_run_jobs
  add column if not exists request_correlation_id text;

create index if not exists workflow_runs_request_correlation_id_idx
  on public.workflow_runs (request_correlation_id);

create index if not exists workflow_run_jobs_request_correlation_id_idx
  on public.workflow_run_jobs (request_correlation_id);
