create table if not exists public.workflow_revisions (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'manual' check (source in ('manual', 'compose_apply', 'restore', 'api')),
  message text not null default '',
  before_name text not null default '',
  before_description text not null default '',
  before_graph jsonb not null default '{"nodes":[],"edges":[]}'::jsonb,
  after_name text not null default '',
  after_description text not null default '',
  after_graph jsonb not null default '{"nodes":[],"edges":[]}'::jsonb,
  change_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workflow_revisions_workflow_id_idx
  on public.workflow_revisions (workflow_id);

create index if not exists workflow_revisions_workspace_id_idx
  on public.workflow_revisions (workspace_id);

create index if not exists workflow_revisions_created_at_idx
  on public.workflow_revisions (created_at desc);

alter table public.workflow_revisions enable row level security;

drop policy if exists "Workspace owners can view revisions" on public.workflow_revisions;
create policy "Workspace owners can view revisions"
  on public.workflow_revisions
  for select
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can create revisions" on public.workflow_revisions;
create policy "Workspace owners can create revisions"
  on public.workflow_revisions
  for insert
  with check (
    public.user_owns_workspace(workspace_id)
    and created_by_user_id = auth.uid()
  );

drop policy if exists "Workspace owners can delete revisions" on public.workflow_revisions;
create policy "Workspace owners can delete revisions"
  on public.workflow_revisions
  for delete
  using (public.user_owns_workspace(workspace_id));
