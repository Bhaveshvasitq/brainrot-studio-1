-- SpicyAPI paid generation stays disabled until the age-verification workflow,
-- service-role configuration, spend ledger, and policy controls are reviewed.
create table if not exists public.adult_access_verifications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check (status in ('pending', 'verified', 'rejected', 'expired')),
  verified_at timestamptz,
  verification_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verified_requires_timestamp check (status <> 'verified' or verified_at is not null)
);

alter table public.adult_access_verifications enable row level security;
-- Intentionally no client-facing policies. Only the service role / trusted verification
-- workflow can read or write verification records. Do not use user-editable metadata.

create table if not exists public.spicyapi_usage_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  reservation_month date not null,
  reserved_usd numeric(12,6) not null default 0 check (reserved_usd >= 0),
  actual_usd numeric(12,6) not null default 0 check (actual_usd >= 0),
  status text not null check (status in ('reserved', 'settled', 'failed')),
  feature text not null check (feature in ('chat', 'image', 'voice', 'video')),
  provider_request_id text,
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

create index if not exists spicyapi_usage_month_status_idx
  on public.spicyapi_usage_ledger (reservation_month, status);
create index if not exists spicyapi_usage_user_month_idx
  on public.spicyapi_usage_ledger (user_id, reservation_month);

alter table public.spicyapi_usage_ledger enable row level security;
-- Intentionally no client policies. Access via service-role RPC only.

create or replace function public.reserve_spicyapi_usage(
  p_user_id uuid,
  p_estimated_usd numeric,
  p_monthly_limit_usd numeric,
  p_pilot_limit_usd numeric
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_month date := date_trunc('month', now())::date;
  v_used numeric(12,6);
  v_id uuid;
begin
  if p_estimated_usd <= 0 or p_monthly_limit_usd <= 0 or p_pilot_limit_usd <= 0
     or p_monthly_limit_usd > 50 or p_pilot_limit_usd > 10
     or p_estimated_usd > p_pilot_limit_usd then
    raise exception 'invalid_spend_limits';
  end if;

  -- Serialize all reservations for the current month so concurrent requests cannot
  -- race past the monthly ceiling.
  perform pg_advisory_xact_lock(hashtext('spicyapi_usage_ledger'), hashtext(v_month::text));
  select coalesce(sum(case when status = 'reserved' then reserved_usd else actual_usd end), 0)
    into v_used
    from public.spicyapi_usage_ledger
   where reservation_month = v_month
     and status in ('reserved', 'settled');

  if v_used + p_estimated_usd > p_monthly_limit_usd
     or v_used + p_estimated_usd > p_pilot_limit_usd then
    raise exception 'spend_limit_reached';
  end if;

  insert into public.spicyapi_usage_ledger
    (user_id, reservation_month, reserved_usd, status, feature)
  values (p_user_id, v_month, p_estimated_usd, 'reserved', 'chat')
  returning id into v_id;

  return jsonb_build_object('reservation_id', v_id);
end;
$$;

create or replace function public.settle_spicyapi_usage(
  p_reservation_id uuid,
  p_actual_usd numeric,
  p_status text
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.spicyapi_usage_ledger%rowtype;
  v_monthly_limit numeric;
  v_pilot_limit numeric;
  v_used numeric(12,6);
begin
  if p_status not in ('settled', 'failed') or p_actual_usd < 0 then
    raise exception 'invalid_settlement';
  end if;

  select * into v_row from public.spicyapi_usage_ledger
   where id = p_reservation_id for update;
  if not found or v_row.status <> 'reserved' then
    raise exception 'reservation_not_open';
  end if;

  if p_status = 'settled' then
    -- Do not allow a provider settlement to push aggregate usage beyond the hard cap.
    -- Reservation estimates should be conservative; any mismatch fails closed.
    select coalesce(sum(case when status = 'reserved' then reserved_usd else actual_usd end), 0)
      into v_used from public.spicyapi_usage_ledger
     where reservation_month = v_row.reservation_month
       and status in ('reserved', 'settled') and id <> p_reservation_id;
    if v_used + p_actual_usd > 50 or v_used + p_actual_usd > 10 then
      raise exception 'settlement_exceeds_hard_cap';
    end if;
  end if;

  update public.spicyapi_usage_ledger
     set actual_usd = case when p_status = 'settled' then p_actual_usd else 0 end,
         status = p_status, settled_at = now()
   where id = p_reservation_id;
  return true;
end;
$$;

revoke all on function public.reserve_spicyapi_usage(uuid,numeric,numeric,numeric) from public, anon, authenticated;
revoke all on function public.settle_spicyapi_usage(uuid,numeric,text) from public, anon, authenticated;
grant execute on function public.reserve_spicyapi_usage(uuid,numeric,numeric,numeric) to service_role;
grant execute on function public.settle_spicyapi_usage(uuid,numeric,text) to service_role;
