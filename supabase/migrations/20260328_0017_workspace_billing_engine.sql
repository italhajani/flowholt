create table if not exists public.workspace_billing_subscriptions (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  created_by_user_id uuid references auth.users(id) on delete set null,
  plan_key text not null default 'starter' check (plan_key in ('starter', 'pro', 'scale')),
  plan_name text not null default 'Starter',
  status text not null default 'active' check (status in ('trialing', 'active', 'past_due', 'cancelled')),
  billing_email text not null default '',
  currency text not null default 'usd',
  monthly_base_cents integer not null default 0 check (monthly_base_cents >= 0),
  overage_run_cents integer not null default 0 check (overage_run_cents >= 0),
  overage_per_1000_tokens_cents integer not null default 0 check (overage_per_1000_tokens_cents >= 0),
  current_period_start timestamptz not null default date_trunc('month', timezone('utc', now())),
  current_period_end timestamptz not null default (date_trunc('month', timezone('utc', now())) + interval '1 month'),
  cancel_at_period_end boolean not null default false,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_billing_invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'open', 'paid', 'void')),
  currency text not null default 'usd',
  period_start timestamptz not null,
  period_end timestamptz not null,
  base_amount_cents integer not null default 0 check (base_amount_cents >= 0),
  overage_amount_cents integer not null default 0 check (overage_amount_cents >= 0),
  total_amount_cents integer not null default 0 check (total_amount_cents >= 0),
  line_items jsonb not null default '[]'::jsonb,
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_billing_events (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  status text not null default 'recorded' check (status in ('recorded', 'processed', 'failed')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workspace_billing_subscriptions_plan_key_idx
  on public.workspace_billing_subscriptions (plan_key);

create index if not exists workspace_billing_invoices_workspace_id_idx
  on public.workspace_billing_invoices (workspace_id);

create index if not exists workspace_billing_invoices_status_idx
  on public.workspace_billing_invoices (status);

create index if not exists workspace_billing_events_workspace_id_idx
  on public.workspace_billing_events (workspace_id);

create or replace function public.sync_workspace_billing_defaults()
returns trigger
language plpgsql
as $$
begin
  insert into public.workspace_billing_subscriptions (
    workspace_id,
    plan_key,
    plan_name,
    status,
    billing_email,
    currency,
    monthly_base_cents,
    overage_run_cents,
    overage_per_1000_tokens_cents,
    current_period_start,
    current_period_end
  )
  values (
    new.id,
    'starter',
    'Starter',
    'active',
    '',
    'usd',
    0,
    0,
    0,
    date_trunc('month', timezone('utc', now())),
    date_trunc('month', timezone('utc', now())) + interval '1 month'
  )
  on conflict (workspace_id) do nothing;

  return new;
end;
$$;

insert into public.workspace_billing_subscriptions (
  workspace_id,
  plan_key,
  plan_name,
  status,
  billing_email,
  currency,
  monthly_base_cents,
  overage_run_cents,
  overage_per_1000_tokens_cents,
  current_period_start,
  current_period_end
)
select
  id,
  'starter',
  'Starter',
  'active',
  '',
  'usd',
  0,
  0,
  0,
  date_trunc('month', timezone('utc', now())),
  date_trunc('month', timezone('utc', now())) + interval '1 month'
from public.workspaces
on conflict (workspace_id) do nothing;

alter table public.workspace_billing_subscriptions enable row level security;
alter table public.workspace_billing_invoices enable row level security;
alter table public.workspace_billing_events enable row level security;

drop policy if exists "Workspace members can view billing subscriptions" on public.workspace_billing_subscriptions;
create policy "Workspace members can view billing subscriptions"
  on public.workspace_billing_subscriptions
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace admins can create billing subscriptions" on public.workspace_billing_subscriptions;
create policy "Workspace admins can create billing subscriptions"
  on public.workspace_billing_subscriptions
  for insert
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace admins can update billing subscriptions" on public.workspace_billing_subscriptions;
create policy "Workspace admins can update billing subscriptions"
  on public.workspace_billing_subscriptions
  for update
  using (public.user_has_workspace_role(workspace_id, 'admin'))
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete billing subscriptions" on public.workspace_billing_subscriptions;
create policy "Workspace owners can delete billing subscriptions"
  on public.workspace_billing_subscriptions
  for delete
  using (public.user_has_workspace_role(workspace_id, 'owner'));

drop policy if exists "Workspace members can view billing invoices" on public.workspace_billing_invoices;
create policy "Workspace members can view billing invoices"
  on public.workspace_billing_invoices
  for select
  using (public.user_is_workspace_member(workspace_id));

drop policy if exists "Workspace admins can create billing invoices" on public.workspace_billing_invoices;
create policy "Workspace admins can create billing invoices"
  on public.workspace_billing_invoices
  for insert
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace admins can update billing invoices" on public.workspace_billing_invoices;
create policy "Workspace admins can update billing invoices"
  on public.workspace_billing_invoices
  for update
  using (public.user_has_workspace_role(workspace_id, 'admin'))
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete billing invoices" on public.workspace_billing_invoices;
create policy "Workspace owners can delete billing invoices"
  on public.workspace_billing_invoices
  for delete
  using (public.user_has_workspace_role(workspace_id, 'owner'));

drop policy if exists "Workspace admins can view billing events" on public.workspace_billing_events;
create policy "Workspace admins can view billing events"
  on public.workspace_billing_events
  for select
  using (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace admins can create billing events" on public.workspace_billing_events;
create policy "Workspace admins can create billing events"
  on public.workspace_billing_events
  for insert
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace admins can update billing events" on public.workspace_billing_events;
create policy "Workspace admins can update billing events"
  on public.workspace_billing_events
  for update
  using (public.user_has_workspace_role(workspace_id, 'admin'))
  with check (public.user_has_workspace_role(workspace_id, 'admin'));

drop policy if exists "Workspace owners can delete billing events" on public.workspace_billing_events;
create policy "Workspace owners can delete billing events"
  on public.workspace_billing_events
  for delete
  using (public.user_has_workspace_role(workspace_id, 'owner'));

drop trigger if exists workspace_billing_subscriptions_set_updated_at on public.workspace_billing_subscriptions;
create trigger workspace_billing_subscriptions_set_updated_at
before update on public.workspace_billing_subscriptions
for each row
execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists workspaces_sync_billing_defaults on public.workspaces;
create trigger workspaces_sync_billing_defaults
after insert on public.workspaces
for each row
execute procedure public.sync_workspace_billing_defaults();
