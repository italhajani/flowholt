create table if not exists public.workflow_run_jobs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'processing', 'succeeded', 'failed', 'cancelled')),
  trigger_source text not null default 'manual',
  trigger_payload jsonb not null default 'null'::jsonb,
  trigger_meta jsonb not null default '{}'::jsonb,
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  available_at timestamptz not null default now(),
  claimed_at timestamptz,
  finished_at timestamptz,
  lock_until timestamptz,
  run_id uuid references public.workflow_runs(id) on delete set null,
  error_message text not null default '',
  last_error_class text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_node_executions (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.workflow_runs(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  node_id text not null,
  node_label text not null default '',
  node_type text not null,
  sequence integer not null default 0,
  status text not null default 'succeeded' check (status in ('succeeded', 'failed', 'cancelled', 'skipped')),
  attempt_count integer not null default 1,
  duration_ms integer not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  error_class text not null default '',
  error_message text not null default '',
  token_estimate integer not null default 0,
  output_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workflow_run_jobs_workspace_id_idx
  on public.workflow_run_jobs (workspace_id);

create index if not exists workflow_run_jobs_workflow_id_idx
  on public.workflow_run_jobs (workflow_id);

create index if not exists workflow_run_jobs_status_available_at_idx
  on public.workflow_run_jobs (status, available_at);

create index if not exists workflow_run_jobs_run_id_idx
  on public.workflow_run_jobs (run_id);

create index if not exists workflow_node_executions_run_id_idx
  on public.workflow_node_executions (run_id);

create index if not exists workflow_node_executions_workflow_id_idx
  on public.workflow_node_executions (workflow_id);

create index if not exists workflow_node_executions_workspace_id_idx
  on public.workflow_node_executions (workspace_id);

create index if not exists workflow_node_executions_sequence_idx
  on public.workflow_node_executions (run_id, sequence, id);

alter table public.workflow_run_jobs enable row level security;
alter table public.workflow_node_executions enable row level security;

drop policy if exists "Workspace owners can view run jobs" on public.workflow_run_jobs;
create policy "Workspace owners can view run jobs"
  on public.workflow_run_jobs
  for select
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can create run jobs" on public.workflow_run_jobs;
create policy "Workspace owners can create run jobs"
  on public.workflow_run_jobs
  for insert
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can update run jobs" on public.workflow_run_jobs;
create policy "Workspace owners can update run jobs"
  on public.workflow_run_jobs
  for update
  using (public.user_owns_workspace(workspace_id))
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can delete run jobs" on public.workflow_run_jobs;
create policy "Workspace owners can delete run jobs"
  on public.workflow_run_jobs
  for delete
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can view node executions" on public.workflow_node_executions;
create policy "Workspace owners can view node executions"
  on public.workflow_node_executions
  for select
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can create node executions" on public.workflow_node_executions;
create policy "Workspace owners can create node executions"
  on public.workflow_node_executions
  for insert
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can update node executions" on public.workflow_node_executions;
create policy "Workspace owners can update node executions"
  on public.workflow_node_executions
  for update
  using (public.user_owns_workspace(workspace_id))
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can delete node executions" on public.workflow_node_executions;
create policy "Workspace owners can delete node executions"
  on public.workflow_node_executions
  for delete
  using (public.user_owns_workspace(workspace_id));

drop trigger if exists workflow_run_jobs_set_updated_at on public.workflow_run_jobs;
create trigger workflow_run_jobs_set_updated_at
before update on public.workflow_run_jobs
for each row
execute procedure public.set_current_timestamp_updated_at();
