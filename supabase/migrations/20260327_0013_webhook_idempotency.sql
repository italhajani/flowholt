create table if not exists public.webhook_event_receipts (
  id bigint generated always as identity primary key,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  idempotency_key text not null,
  request_method text not null default 'POST',
  request_path text not null default '',
  request_fingerprint text not null default '',
  status text not null default 'received' check (status in ('received', 'queued', 'succeeded', 'failed')),
  run_job_id uuid references public.workflow_run_jobs(id) on delete set null,
  run_id uuid references public.workflow_runs(id) on delete set null,
  response_payload jsonb not null default '{}'::jsonb,
  request_count integer not null default 1 check (request_count >= 1),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_id, idempotency_key)
);

create index if not exists webhook_event_receipts_workflow_created_idx
  on public.webhook_event_receipts (workflow_id, created_at desc);

create index if not exists webhook_event_receipts_workspace_created_idx
  on public.webhook_event_receipts (workspace_id, created_at desc);

alter table public.webhook_event_receipts enable row level security;

drop policy if exists "Workspace members can view webhook receipts" on public.webhook_event_receipts;
create policy "Workspace members can view webhook receipts"
  on public.webhook_event_receipts
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace members can insert webhook receipts" on public.webhook_event_receipts;
create policy "Workspace members can insert webhook receipts"
  on public.webhook_event_receipts
  for insert
  with check (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace members can update webhook receipts" on public.webhook_event_receipts;
create policy "Workspace members can update webhook receipts"
  on public.webhook_event_receipts
  for update
  using (public.user_is_workspace_member(workspace_id))
  with check (public.user_is_workspace_member(workspace_id));

drop trigger if exists webhook_event_receipts_set_updated_at on public.webhook_event_receipts;
create trigger webhook_event_receipts_set_updated_at
before update on public.webhook_event_receipts
for each row
execute procedure public.set_current_timestamp_updated_at();

