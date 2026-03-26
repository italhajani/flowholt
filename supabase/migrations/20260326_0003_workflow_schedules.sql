create table if not exists public.workflow_schedules (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '',
  status text not null default 'active' check (status in ('active', 'paused', 'disabled')),
  interval_minutes integer not null default 60 check (interval_minutes >= 1 and interval_minutes <= 10080),
  next_run_at timestamptz not null default now(),
  last_run_at timestamptz,
  last_run_status text check (last_run_status in ('succeeded', 'failed')),
  run_count integer not null default 0,
  last_error text not null default '',
  lock_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workflow_schedules_workflow_id_idx
  on public.workflow_schedules (workflow_id);

create index if not exists workflow_schedules_workspace_id_idx
  on public.workflow_schedules (workspace_id);

create index if not exists workflow_schedules_status_next_run_at_idx
  on public.workflow_schedules (status, next_run_at);

alter table public.workflow_schedules enable row level security;

drop policy if exists "Workspace owners can view schedules" on public.workflow_schedules;
create policy "Workspace owners can view schedules"
  on public.workflow_schedules
  for select
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can create schedules" on public.workflow_schedules;
create policy "Workspace owners can create schedules"
  on public.workflow_schedules
  for insert
  with check (
    public.user_owns_workspace(workspace_id)
    and created_by_user_id = auth.uid()
  );

drop policy if exists "Workspace owners can update schedules" on public.workflow_schedules;
create policy "Workspace owners can update schedules"
  on public.workflow_schedules
  for update
  using (public.user_owns_workspace(workspace_id))
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can delete schedules" on public.workflow_schedules;
create policy "Workspace owners can delete schedules"
  on public.workflow_schedules
  for delete
  using (public.user_owns_workspace(workspace_id));

drop trigger if exists workflow_schedules_set_updated_at on public.workflow_schedules;
create trigger workflow_schedules_set_updated_at
before update on public.workflow_schedules
for each row
execute procedure public.set_current_timestamp_updated_at();
