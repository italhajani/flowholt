insert into public.workspace_memberships (workspace_id, user_id, role, status)
select id, owner_user_id, 'owner', 'active'
from public.workspaces
on conflict (workspace_id, user_id)
do update set
  role = 'owner',
  status = 'active',
  updated_at = now();

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

drop policy if exists "Workspace members can view workspaces" on public.workspaces;
create policy "Workspace members can view workspaces"
  on public.workspaces
  for select
  using (public.user_is_workspace_member(id));

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