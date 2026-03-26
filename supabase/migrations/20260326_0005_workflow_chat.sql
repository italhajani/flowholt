create table if not exists public.workflow_chat_threads (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New thread',
  status text not null default 'active' check (status in ('active', 'archived')),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.workflow_chat_threads(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by_user_id uuid references auth.users(id) on delete set null,
  role text not null check (role in ('user', 'assistant', 'system')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workflow_chat_threads_workflow_id_idx
  on public.workflow_chat_threads (workflow_id);

create index if not exists workflow_chat_threads_workspace_id_idx
  on public.workflow_chat_threads (workspace_id);

create index if not exists workflow_chat_threads_updated_at_idx
  on public.workflow_chat_threads (updated_at desc);

create index if not exists workflow_chat_messages_thread_id_idx
  on public.workflow_chat_messages (thread_id);

create index if not exists workflow_chat_messages_workflow_id_idx
  on public.workflow_chat_messages (workflow_id);

create index if not exists workflow_chat_messages_workspace_id_idx
  on public.workflow_chat_messages (workspace_id);

create index if not exists workflow_chat_messages_created_at_idx
  on public.workflow_chat_messages (created_at asc);

alter table public.workflow_chat_threads enable row level security;
alter table public.workflow_chat_messages enable row level security;

drop policy if exists "Workspace owners can view chat threads" on public.workflow_chat_threads;
create policy "Workspace owners can view chat threads"
  on public.workflow_chat_threads
  for select
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can create chat threads" on public.workflow_chat_threads;
create policy "Workspace owners can create chat threads"
  on public.workflow_chat_threads
  for insert
  with check (
    public.user_owns_workspace(workspace_id)
    and created_by_user_id = auth.uid()
  );

drop policy if exists "Workspace owners can update chat threads" on public.workflow_chat_threads;
create policy "Workspace owners can update chat threads"
  on public.workflow_chat_threads
  for update
  using (public.user_owns_workspace(workspace_id))
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can delete chat threads" on public.workflow_chat_threads;
create policy "Workspace owners can delete chat threads"
  on public.workflow_chat_threads
  for delete
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can view chat messages" on public.workflow_chat_messages;
create policy "Workspace owners can view chat messages"
  on public.workflow_chat_messages
  for select
  using (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can create chat messages" on public.workflow_chat_messages;
create policy "Workspace owners can create chat messages"
  on public.workflow_chat_messages
  for insert
  with check (public.user_owns_workspace(workspace_id));

drop policy if exists "Workspace owners can delete chat messages" on public.workflow_chat_messages;
create policy "Workspace owners can delete chat messages"
  on public.workflow_chat_messages
  for delete
  using (public.user_owns_workspace(workspace_id));

drop trigger if exists workflow_chat_threads_set_updated_at on public.workflow_chat_threads;
create trigger workflow_chat_threads_set_updated_at
before update on public.workflow_chat_threads
for each row
execute procedure public.set_current_timestamp_updated_at();
