alter table public.workflow_schedules
  add column if not exists claim_due_at timestamptz,
  add column if not exists lock_token text,
  add column if not exists last_claimed_at timestamptz,
  add column if not exists last_queued_job_id uuid references public.workflow_run_jobs(id) on delete set null;

create index if not exists workflow_schedules_status_lock_until_idx
  on public.workflow_schedules (status, lock_until);

create index if not exists workflow_schedules_status_claim_due_at_idx
  on public.workflow_schedules (status, claim_due_at);
