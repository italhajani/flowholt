create table if not exists public.request_rate_limits (
  id bigint generated always as identity primary key,
  scope text not null,
  identifier text not null,
  bucket_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scope, identifier, bucket_start)
);

create index if not exists request_rate_limits_scope_bucket_idx
  on public.request_rate_limits (scope, bucket_start desc);

create or replace function public.consume_rate_limit(
  p_scope text,
  p_identifier text,
  p_bucket_start timestamptz,
  p_max_requests integer
)
returns table(allowed boolean, request_count integer)
language plpgsql
security definer
as $$
declare
  v_request_count integer;
begin
  insert into public.request_rate_limits (scope, identifier, bucket_start, request_count)
  values (p_scope, p_identifier, p_bucket_start, 1)
  on conflict (scope, identifier, bucket_start)
  do update
    set request_count = public.request_rate_limits.request_count + 1,
        updated_at = now()
  returning public.request_rate_limits.request_count into v_request_count;

  return query
  select v_request_count <= greatest(1, p_max_requests), v_request_count;
end;
$$;

grant execute on function public.consume_rate_limit(text, text, timestamptz, integer) to anon, authenticated, service_role;

drop trigger if exists request_rate_limits_set_updated_at on public.request_rate_limits;
create trigger request_rate_limits_set_updated_at
before update on public.request_rate_limits
for each row
execute procedure public.set_current_timestamp_updated_at();
