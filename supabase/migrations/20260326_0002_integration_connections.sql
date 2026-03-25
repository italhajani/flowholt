create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('groq', 'http', 'webhook')),
  label text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('draft', 'active', 'disabled')),
  config jsonb not null default '{}'::jsonb,
  secrets jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists integration_connections_workspace_id_idx
  on public.integration_connections (workspace_id);

create index if not exists integration_connections_provider_idx
  on public.integration_connections (provider);

create index if not exists integration_connections_status_idx
  on public.integration_connections (status);

alter table public.integration_connections enable row level security;

drop policy if exists "Workspace owners can view integrations" on public.integration_connections;
create policy "Workspace owners can view integrations"
  on public.integration_connections
  for select
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can create integrations" on public.integration_connections;
create policy "Workspace owners can create integrations"
  on public.integration_connections
  for insert
  with check (
    public.user_owns_workspace(workspace_id)
    and created_by_user_id = auth.uid()
  );

drop policy if exists "Workspace owners can update integrations" on public.integration_connections;
create policy "Workspace owners can update integrations"
  on public.integration_connections
  for update
  using (public.user_owns_workspace(workspace_id))
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can delete integrations" on public.integration_connections;
create policy "Workspace owners can delete integrations"
  on public.integration_connections
  for delete
  using (public.user_owns_workspace(workspace_id));

drop trigger if exists integration_connections_set_updated_at on public.integration_connections;
create trigger integration_connections_set_updated_at
before update on public.integration_connections
for each row
execute procedure public.set_current_timestamp_updated_at();
