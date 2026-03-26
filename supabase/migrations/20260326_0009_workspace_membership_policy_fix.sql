create or replace function public.user_has_workspace_role(
  target_workspace_id uuid,
  minimum_role text default 'member'
)
returns boolean
language sql
stable
security definer
set search_path = public
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
security definer
set search_path = public
as $$
  select public.user_has_workspace_role(target_workspace_id, 'member');
$$;

create or replace function public.user_owns_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.user_has_workspace_role(target_workspace_id, 'owner');
$$;

drop policy if exists "Workspace members can view memberships" on public.workspace_memberships;
create policy "Workspace members can view memberships"
  on public.workspace_memberships
  for select
  using (
    user_id = auth.uid()
    or public.user_has_workspace_role(workspace_id, 'admin')
  );