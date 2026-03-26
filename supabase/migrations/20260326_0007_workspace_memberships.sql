create table if not exists public.workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index if not exists workspace_memberships_workspace_id_idx
  on public.workspace_memberships (workspace_id);

create index if not exists workspace_memberships_user_id_idx
  on public.workspace_memberships (user_id);

create index if not exists workspace_memberships_role_idx
  on public.workspace_memberships (role);

create or replace function public.workspace_role_rank(target_role text)
returns integer
language sql
immutable
as $$
  select case target_role
    when 'owner' then 3
    when 'admin' then 2
    when 'member' then 1
    else 0
  end;
$$;

create or replace function public.user_has_workspace_role(
  target_workspace_id uuid,
  minimum_role text default 'member'
)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.workspace_memberships
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and status = 'active'
      and public.workspace_role_rank(role) >= public.workspace_role_rank(minimum_role)
  );
$$;

create or replace function public.user_is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
as $$
  select public.user_has_workspace_role(target_workspace_id, 'member');
$$;

create or replace function public.user_owns_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
as $$
  select public.user_has_workspace_role(target_workspace_id, 'owner');
$$;

create or replace function public.sync_workspace_owner_membership()
returns trigger
language plpgsql
as $$
begin
  insert into public.workspace_memberships (workspace_id, user_id, role, status)
  values (new.id, new.owner_user_id, 'owner', 'active')
  on conflict (workspace_id, user_id)
  do update set
    role = 'owner',
    status = 'active',
    updated_at = now();

  if tg_op = 'UPDATE' and old.owner_user_id is distinct from new.owner_user_id then
    update public.workspace_memberships
    set role = 'admin',
        updated_at = now()
    where workspace_id = new.id
      and user_id = old.owner_user_id
      and role = 'owner';
  end if;

  return new;
end;
$$;

insert into public.workspace_memberships (workspace_id, user_id, role, status)
select id, owner_user_id, 'owner', 'active'
from public.workspaces
on conflict (workspace_id, user_id)
do update set
  role = 'owner',
  status = 'active',
  updated_at = now();

alter table public.workspace_memberships enable row level security;

drop policy if exists "Workspace members can view workspaces" on public.workspaces;
create policy "Workspace members can view workspaces"
  on public.workspaces
  for select
  using (public.user_is_workspace_member(id));

drop policy if exists "Owners can view their workspaces" on public.workspaces;

drop policy if exists "Owners can create their workspaces" on public.workspaces;
create policy "Owners can create their workspaces"
  on public.workspaces
  for insert
  with check (owner_user_id = auth.uid());

drop policy if exists "Owners can update their workspaces" on public.workspaces;
create policy "Owners can update their workspaces"
  on public.workspaces
  for update
  using (public.user_has_workspace_role(id, 'owner'))
  with check (public.user_has_workspace_role(id, 'owner'));

drop policy if exists "Owners can delete their workspaces" on public.workspaces;
create policy "Owners can delete their workspaces"
  on public.workspaces
  for delete
  using (public.user_has_workspace_role(id, 'owner'));

drop policy if exists "Workspace members can view memberships" on public.workspace_memberships;
create policy "Workspace members can view memberships"
  on public.workspace_memberships
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace admins can create memberships" on public.workspace_memberships;
create policy "Workspace admins can create memberships"
  on public.workspace_memberships
  for insert
  with check (
    public.user_has_workspace_role(workspace_id, 'admin')
    and status = 'active'
    and (
      role in ('member', 'admin')
      or public.user_has_workspace_role(workspace_id, 'owner')
    )
  );

drop policy if exists "Workspace admins can update memberships" on public.workspace_memberships;
create policy "Workspace admins can update memberships"
  on public.workspace_memberships
  for update
  using (public.user_has_workspace_role(workspace_id, 'admin'))
  with check (
    public.user_has_workspace_role(workspace_id, 'admin')
    and (
      role in ('member', 'admin')
      or public.user_has_workspace_role(workspace_id, 'owner')
    )
  );

drop policy if exists "Workspace admins can delete memberships" on public.workspace_memberships;
create policy "Workspace admins can delete memberships"
  on public.workspace_memberships
  for delete
  using (
    public.user_has_workspace_role(workspace_id, 'admin')
    and role <> 'owner'
  );

drop policy if exists "Workspace members can view workflows" on public.workflows;
create policy "Workspace members can view workflows"
  on public.workflows
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace owners can view workflows" on public.workflows;

drop policy if exists "Workspace members can create workflows" on public.workflows;
create policy "Workspace members can create workflows"
  on public.workflows
  for insert
  with check (
    public.user_has_workspace_role(workspace_id, 'member')
    and created_by_user_id = auth.uid()
  );

drop policy if exists "Workspace owners can create workflows" on public.workflows;

drop policy if exists "Workspace members can update workflows" on public.workflows;
create policy "Workspace members can update workflows"
  on public.workflows
  for update
  using (public.user_has_workspace_role(workspace_id, 'member'))
  with check (public.user_has_workspace_role(workspace_id, 'member'));

drop policy if exists "Workspace owners can update workflows" on public.workflows;

drop policy if exists "Workspace admins can delete workflows" on public.workflows;
create policy "Workspace admins can delete workflows"
  on public.workflows
  for delete
  using (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete workflows" on public.workflows;

drop policy if exists "Workspace members can view runs" on public.workflow_runs;
create policy "Workspace members can view runs"
  on public.workflow_runs
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace owners can view runs" on public.workflow_runs;

drop policy if exists "Workspace members can create runs" on public.workflow_runs;
create policy "Workspace members can create runs"
  on public.workflow_runs
  for insert
  with check (public.user_has_workspace_role(workspace_id, 'member'));

drop policy if exists "Workspace owners can create runs" on public.workflow_runs;

drop policy if exists "Workspace members can update runs" on public.workflow_runs;
create policy "Workspace members can update runs"
  on public.workflow_runs
  for update
  using (public.user_has_workspace_role(workspace_id, 'member'))
  with check (public.user_has_workspace_role(workspace_id, 'member'));

drop policy if exists "Workspace owners can update runs" on public.workflow_runs;

drop policy if exists "Workspace admins can delete runs" on public.workflow_runs;
create policy "Workspace admins can delete runs"
  on public.workflow_runs
  for delete
  using (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete runs" on public.workflow_runs;

drop policy if exists "Workspace members can view logs" on public.run_logs;
create policy "Workspace members can view logs"
  on public.run_logs
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace owners can view logs" on public.run_logs;

drop policy if exists "Workspace members can create logs" on public.run_logs;
create policy "Workspace members can create logs"
  on public.run_logs
  for insert
  with check (public.user_has_workspace_role(workspace_id, 'member'));

drop policy if exists "Workspace owners can create logs" on public.run_logs;

drop policy if exists "Workspace members can update logs" on public.run_logs;
create policy "Workspace members can update logs"
  on public.run_logs
  for update
  using (public.user_has_workspace_role(workspace_id, 'member'))
  with check (public.user_has_workspace_role(workspace_id, 'member'));

drop policy if exists "Workspace owners can update logs" on public.run_logs;

drop policy if exists "Workspace admins can delete logs" on public.run_logs;
create policy "Workspace admins can delete logs"
  on public.run_logs
  for delete
  using (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete logs" on public.run_logs;

drop policy if exists "Workspace members can view integrations" on public.integration_connections;
create policy "Workspace members can view integrations"
  on public.integration_connections
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace owners can view integrations" on public.integration_connections;

drop policy if exists "Workspace admins can create integrations" on public.integration_connections;
create policy "Workspace admins can create integrations"
  on public.integration_connections
  for insert
  with check (
    public.user_has_workspace_role(workspace_id, 'admin')
    and created_by_user_id = auth.uid()
  );

drop policy if exists "Workspace owners can create integrations" on public.integration_connections;

drop policy if exists "Workspace admins can update integrations" on public.integration_connections;
create policy "Workspace admins can update integrations"
  on public.integration_connections
  for update
  using (public.user_has_workspace_role(workspace_id, 'admin'))
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can update integrations" on public.integration_connections;

drop policy if exists "Workspace admins can delete integrations" on public.integration_connections;
create policy "Workspace admins can delete integrations"
  on public.integration_connections
  for delete
  using (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete integrations" on public.integration_connections;

drop policy if exists "Workspace members can view schedules" on public.workflow_schedules;
create policy "Workspace members can view schedules"
  on public.workflow_schedules
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace owners can view schedules" on public.workflow_schedules;

drop policy if exists "Workspace admins can create schedules" on public.workflow_schedules;
create policy "Workspace admins can create schedules"
  on public.workflow_schedules
  for insert
  with check (
    public.user_has_workspace_role(workspace_id, 'admin')
    and created_by_user_id = auth.uid()
  );

drop policy if exists "Workspace owners can create schedules" on public.workflow_schedules;

drop policy if exists "Workspace admins can update schedules" on public.workflow_schedules;
create policy "Workspace admins can update schedules"
  on public.workflow_schedules
  for update
  using (public.user_has_workspace_role(workspace_id, 'admin'))
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can update schedules" on public.workflow_schedules;

drop policy if exists "Workspace admins can delete schedules" on public.workflow_schedules;
create policy "Workspace admins can delete schedules"
  on public.workflow_schedules
  for delete
  using (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete schedules" on public.workflow_schedules;

drop policy if exists "Workspace members can view revisions" on public.workflow_revisions;
create policy "Workspace members can view revisions"
  on public.workflow_revisions
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace owners can view revisions" on public.workflow_revisions;

drop policy if exists "Workspace members can create revisions" on public.workflow_revisions;
create policy "Workspace members can create revisions"
  on public.workflow_revisions
  for insert
  with check (
    public.user_has_workspace_role(workspace_id, 'member')
    and created_by_user_id = auth.uid()
  );

drop policy if exists "Workspace owners can create revisions" on public.workflow_revisions;

drop policy if exists "Workspace admins can delete revisions" on public.workflow_revisions;
create policy "Workspace admins can delete revisions"
  on public.workflow_revisions
  for delete
  using (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete revisions" on public.workflow_revisions;

drop policy if exists "Workspace members can view chat threads" on public.workflow_chat_threads;
create policy "Workspace members can view chat threads"
  on public.workflow_chat_threads
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace owners can view chat threads" on public.workflow_chat_threads;

drop policy if exists "Workspace members can create chat threads" on public.workflow_chat_threads;
create policy "Workspace members can create chat threads"
  on public.workflow_chat_threads
  for insert
  with check (
    public.user_has_workspace_role(workspace_id, 'member')
    and created_by_user_id = auth.uid()
  );

drop policy if exists "Workspace owners can create chat threads" on public.workflow_chat_threads;

drop policy if exists "Workspace members can update chat threads" on public.workflow_chat_threads;
create policy "Workspace members can update chat threads"
  on public.workflow_chat_threads
  for update
  using (public.user_has_workspace_role(workspace_id, 'member'))
  with check (public.user_has_workspace_role(workspace_id, 'member'));

drop policy if exists "Workspace owners can update chat threads" on public.workflow_chat_threads;

drop policy if exists "Workspace admins can delete chat threads" on public.workflow_chat_threads;
create policy "Workspace admins can delete chat threads"
  on public.workflow_chat_threads
  for delete
  using (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete chat threads" on public.workflow_chat_threads;

drop policy if exists "Workspace members can view chat messages" on public.workflow_chat_messages;
create policy "Workspace members can view chat messages"
  on public.workflow_chat_messages
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace owners can view chat messages" on public.workflow_chat_messages;

drop policy if exists "Workspace members can create chat messages" on public.workflow_chat_messages;
create policy "Workspace members can create chat messages"
  on public.workflow_chat_messages
  for insert
  with check (public.user_has_workspace_role(workspace_id, 'member'));

drop policy if exists "Workspace owners can create chat messages" on public.workflow_chat_messages;

drop policy if exists "Workspace admins can delete chat messages" on public.workflow_chat_messages;
create policy "Workspace admins can delete chat messages"
  on public.workflow_chat_messages
  for delete
  using (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete chat messages" on public.workflow_chat_messages;

drop policy if exists "Workspace members can view run jobs" on public.workflow_run_jobs;
create policy "Workspace members can view run jobs"
  on public.workflow_run_jobs
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace owners can view run jobs" on public.workflow_run_jobs;

drop policy if exists "Workspace members can create run jobs" on public.workflow_run_jobs;
create policy "Workspace members can create run jobs"
  on public.workflow_run_jobs
  for insert
  with check (public.user_has_workspace_role(workspace_id, 'member'));

drop policy if exists "Workspace owners can create run jobs" on public.workflow_run_jobs;

drop policy if exists "Workspace admins can update run jobs" on public.workflow_run_jobs;
create policy "Workspace admins can update run jobs"
  on public.workflow_run_jobs
  for update
  using (public.user_has_workspace_role(workspace_id, 'admin'))
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can update run jobs" on public.workflow_run_jobs;

drop policy if exists "Workspace admins can delete run jobs" on public.workflow_run_jobs;
create policy "Workspace admins can delete run jobs"
  on public.workflow_run_jobs
  for delete
  using (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete run jobs" on public.workflow_run_jobs;

drop policy if exists "Workspace members can view node executions" on public.workflow_node_executions;
create policy "Workspace members can view node executions"
  on public.workflow_node_executions
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace owners can view node executions" on public.workflow_node_executions;

drop policy if exists "Workspace admins can create node executions" on public.workflow_node_executions;
create policy "Workspace admins can create node executions"
  on public.workflow_node_executions
  for insert
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can create node executions" on public.workflow_node_executions;

drop policy if exists "Workspace admins can update node executions" on public.workflow_node_executions;
create policy "Workspace admins can update node executions"
  on public.workflow_node_executions
  for update
  using (public.user_has_workspace_role(workspace_id, 'admin'))
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can update node executions" on public.workflow_node_executions;

drop policy if exists "Workspace admins can delete node executions" on public.workflow_node_executions;
create policy "Workspace admins can delete node executions"
  on public.workflow_node_executions
  for delete
  using (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete node executions" on public.workflow_node_executions;

drop trigger if exists workspace_memberships_set_updated_at on public.workspace_memberships;
create trigger workspace_memberships_set_updated_at
before update on public.workspace_memberships
for each row
execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists workspaces_sync_owner_membership on public.workspaces;
create trigger workspaces_sync_owner_membership
after insert or update of owner_user_id on public.workspaces
for each row
execute procedure public.sync_workspace_owner_membership();