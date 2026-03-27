alter table public.integration_connections
  add column if not exists secret_version integer not null default 1,
  add column if not exists last_secret_rotation_at timestamptz;

create table if not exists public.workspace_audit_logs (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text not null,
  summary text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workspace_audit_logs_workspace_created_idx
  on public.workspace_audit_logs (workspace_id, created_at desc);

create index if not exists workspace_audit_logs_action_idx
  on public.workspace_audit_logs (action);

alter table public.workspace_audit_logs enable row level security;

drop policy if exists "Workspace members can view audit logs" on public.workspace_audit_logs;
create policy "Workspace members can view audit logs"
  on public.workspace_audit_logs
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace members can insert audit logs" on public.workspace_audit_logs;
create policy "Workspace members can insert audit logs"
  on public.workspace_audit_logs
  for insert
  with check (
    public.user_is_workspace_member(workspace_id)
    and (
      actor_user_id is null
      or actor_user_id = auth.uid()
    )
  );
