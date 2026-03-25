create extension if not exists pgcrypto;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, slug)
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  graph jsonb not null default '{"nodes": [], "edges": []}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  trigger_source text not null default 'manual',
  output jsonb not null default '{}'::jsonb,
  error_message text not null default '',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.run_logs (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.workflow_runs(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  node_id text,
  level text not null default 'info' check (level in ('debug', 'info', 'warn', 'error')),
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workspaces_owner_user_id_idx
  on public.workspaces (owner_user_id);

create index if not exists workflows_workspace_id_idx
  on public.workflows (workspace_id);

create index if not exists workflows_created_by_user_id_idx
  on public.workflows (created_by_user_id);

create index if not exists workflow_runs_workflow_id_idx
  on public.workflow_runs (workflow_id);

create index if not exists workflow_runs_workspace_id_idx
  on public.workflow_runs (workspace_id);

create index if not exists workflow_runs_status_idx
  on public.workflow_runs (status);

create index if not exists run_logs_run_id_idx
  on public.run_logs (run_id);

create index if not exists run_logs_workflow_id_idx
  on public.run_logs (workflow_id);

create index if not exists run_logs_workspace_id_idx
  on public.run_logs (workspace_id);

create or replace function public.user_owns_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.workspaces
    where id = target_workspace_id
      and owner_user_id = auth.uid()
  );
$$;

alter table public.workspaces enable row level security;
alter table public.workflows enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.run_logs enable row level security;

drop policy if exists "Owners can view their workspaces" on public.workspaces;
create policy "Owners can view their workspaces"
  on public.workspaces
  for select
  using (owner_user_id = auth.uid());

drop policy if exists "Owners can create their workspaces" on public.workspaces;
create policy "Owners can create their workspaces"
  on public.workspaces
  for insert
  with check (owner_user_id = auth.uid());

drop policy if exists "Owners can update their workspaces" on public.workspaces;
create policy "Owners can update their workspaces"
  on public.workspaces
  for update
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Owners can delete their workspaces" on public.workspaces;
create policy "Owners can delete their workspaces"
  on public.workspaces
  for delete
  using (owner_user_id = auth.uid());

drop policy if exists "Workspace owners can view workflows" on public.workflows;
create policy "Workspace owners can view workflows"
  on public.workflows
  for select
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can create workflows" on public.workflows;
create policy "Workspace owners can create workflows"
  on public.workflows
  for insert
  with check (
    public.user_owns_workspace(workspace_id)
    and created_by_user_id = auth.uid()
  );

drop policy if exists "Workspace owners can update workflows" on public.workflows;
create policy "Workspace owners can update workflows"
  on public.workflows
  for update
  using (public.user_owns_workspace(workspace_id))
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can delete workflows" on public.workflows;
create policy "Workspace owners can delete workflows"
  on public.workflows
  for delete
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can view runs" on public.workflow_runs;
create policy "Workspace owners can view runs"
  on public.workflow_runs
  for select
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can create runs" on public.workflow_runs;
create policy "Workspace owners can create runs"
  on public.workflow_runs
  for insert
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can update runs" on public.workflow_runs;
create policy "Workspace owners can update runs"
  on public.workflow_runs
  for update
  using (public.user_owns_workspace(workspace_id))
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can delete runs" on public.workflow_runs;
create policy "Workspace owners can delete runs"
  on public.workflow_runs
  for delete
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can view logs" on public.run_logs;
create policy "Workspace owners can view logs"
  on public.run_logs
  for select
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can create logs" on public.run_logs;
create policy "Workspace owners can create logs"
  on public.run_logs
  for insert
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can update logs" on public.run_logs;
create policy "Workspace owners can update logs"
  on public.run_logs
  for update
  using (public.user_owns_workspace(workspace_id))
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can delete logs" on public.run_logs;
create policy "Workspace owners can delete logs"
  on public.run_logs
  for delete
  using (public.user_owns_workspace(workspace_id));

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at
before update on public.workspaces
for each row
execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists workflows_set_updated_at on public.workflows;
create trigger workflows_set_updated_at
before update on public.workflows
for each row
execute procedure public.set_current_timestamp_updated_at();
