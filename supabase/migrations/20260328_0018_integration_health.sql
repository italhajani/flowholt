alter table public.integration_connections
  add column if not exists last_test_status text not null default 'unknown'
    check (last_test_status in ('unknown', 'passed', 'warn', 'failed')),
  add column if not exists last_test_message text not null default '',
  add column if not exists last_test_details jsonb not null default '{}'::jsonb,
  add column if not exists last_tested_at timestamptz;

create index if not exists integration_connections_last_test_status_idx
  on public.integration_connections (last_test_status);
