create table if not exists public.workspace_usage_limits (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  plan_name text not null default 'starter',
  monthly_run_limit integer not null default 300 check (monthly_run_limit >= 1),
  monthly_token_limit integer not null default 500000 check (monthly_token_limit >= 1),
  active_workflow_limit integer not null default 25 check (active_workflow_limit >= 1),
  member_limit integer not null default 10 check (member_limit >= 1),
  schedule_limit integer not null default 25 check (schedule_limit >= 1),
  warning_threshold_percent integer not null default 80 check (warning_threshold_percent between 1 and 100),
  enforce_hard_limits boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.sync_workspace_usage_limit_defaults()
returns trigger
language plpgsql
as $$
begin
  insert into public.workspace_usage_limits (workspace_id)
  values (new.id)
  on conflict (workspace_id) do nothing;

  return new;
end;
$$;

insert into public.workspace_usage_limits (workspace_id)
select id
from public.workspaces
on conflict (workspace_id) do nothing;

create index if not exists workspace_usage_limits_plan_name_idx
  on public.workspace_usage_limits (plan_name);

alter table public.workspace_usage_limits enable row level security;

drop policy if exists "Workspace members can view usage limits" on public.workspace_usage_limits;
create policy "Workspace members can view usage limits"
  on public.workspace_usage_limits
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace admins can create usage limits" on public.workspace_usage_limits;
create policy "Workspace admins can create usage limits"
  on public.workspace_usage_limits
  for insert
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace admins can update usage limits" on public.workspace_usage_limits;
create policy "Workspace admins can update usage limits"
  on public.workspace_usage_limits
  for update
  using (public.user_has_workspace_role(workspace_id, 'admin'))
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete usage limits" on public.workspace_usage_limits;
create policy "Workspace owners can delete usage limits"
  on public.workspace_usage_limits
  for delete
  using (public.user_has_workspace_role(workspace_id, 'owner'));

drop trigger if exists workspace_usage_limits_set_updated_at on public.workspace_usage_limits;
create trigger workspace_usage_limits_set_updated_at
before update on public.workspace_usage_limits
for each row
execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists workspaces_sync_usage_limit_defaults on public.workspaces;
create trigger workspaces_sync_usage_limit_defaults
after insert on public.workspaces
for each row
execute procedure public.sync_workspace_usage_limit_defaults();