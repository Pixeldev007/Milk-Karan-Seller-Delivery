-- Delivery Schema & Policies for MyPickup (Delivery) and Seller (Daily Sell)
-- Safe to re-run: guarded with IF NOT EXISTS checks and CREATE OR REPLACE for functions/views.

-- 1) delivery_agents: add login_id, triggers, and RLS
alter table if exists public.delivery_agents add column if not exists login_id text;

create unique index if not exists delivery_agents_owner_login_idx
  on public.delivery_agents(owner_id, login_id)
  where login_id is not null;

create or replace function public.set_delivery_agents_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_delivery_agents_updated_at on public.delivery_agents;
create trigger trg_delivery_agents_updated_at
  before update on public.delivery_agents
  for each row
  execute function public.set_delivery_agents_updated_at();

alter table if exists public.delivery_agents enable row level security;

drop policy if exists "own agents select" on public.delivery_agents;
create policy "own agents select"
  on public.delivery_agents
  for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists "own agents write" on public.delivery_agents;
create policy "own agents write"
  on public.delivery_agents
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- 2) delivery_assignments: source of planned assignments used by MyPickup UI
create table if not exists public.delivery_assignments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  delivery_agent_id uuid not null references public.delivery_agents (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz
);

-- If earlier schema added planning fields, drop them to match mapping-only usage
drop view if exists public.delivery_assignments_view;
alter table if exists public.delivery_assignments drop column if exists date;
alter table if exists public.delivery_assignments drop column if exists shift;
alter table if exists public.delivery_assignments drop column if exists liters;
alter table if exists public.delivery_assignments drop column if exists delivered;

create index if not exists da_owner_agent_idx on public.delivery_assignments(owner_id, delivery_agent_id);
create index if not exists da_owner_customer_idx on public.delivery_assignments(owner_id, customer_id);

alter table if exists public.delivery_assignments enable row level security;

drop policy if exists "own assignments" on public.delivery_assignments;
create policy "own assignments"
  on public.delivery_assignments
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- 3) daily_deliveries: actual delivered status/qty read by Seller Daily Sell
create table if not exists public.daily_deliveries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  delivery_date date not null,
  delivery_agent_id uuid references public.delivery_agents (id) on delete set null,
  customer_id uuid not null references public.customers (id) on delete cascade,
  quantity numeric not null default 0,
  status text not null default 'Pending' check (status in ('Pending','Delivered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, delivery_date, customer_id)
);

create index if not exists dd_owner_date_idx on public.daily_deliveries(owner_id, delivery_date);
create index if not exists dd_owner_agent_idx on public.daily_deliveries(owner_id, delivery_agent_id);

create or replace function public.set_daily_deliveries_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_daily_deliveries_updated_at on public.daily_deliveries;
create trigger trg_daily_deliveries_updated_at
  before update on public.daily_deliveries
  for each row
  execute function public.set_daily_deliveries_updated_at();

alter table if exists public.daily_deliveries enable row level security;

drop policy if exists "own daily deliveries" on public.daily_deliveries;
create policy "own daily deliveries"
  on public.daily_deliveries
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- 4) View (compatibility) built from daily_deliveries so UI can query without failing
drop view if exists public.delivery_assignments_view;
create or replace view public.delivery_assignments_view as
select
  dd.id,
  dd.owner_id,
  dd.delivery_agent_id,
  dd.customer_id,
  dd.delivery_date as date,
  'morning'::text as shift,
  coalesce(dd.quantity, 0) as liters,
  (dd.status = 'Delivered')::bool as delivered,
  dd.created_at as assigned_at,
  null::timestamptz as unassigned_at
from public.daily_deliveries dd;

-- Ensure clean redefine (avoid parameter default mismatch errors)
drop function if exists public.set_delivery_status(uuid, date, text, boolean, numeric);
create or replace function public.set_delivery_status(
  p_assignment_id uuid,
  p_date date,
  p_shift text,
  p_delivered boolean,
  p_liters numeric
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_agent uuid;
  v_customer uuid;
begin
  select owner_id, delivery_agent_id, customer_id
    into v_owner, v_agent, v_customer
  from public.delivery_assignments
  where id = p_assignment_id;

  if v_owner is null then
    raise exception 'Assignment not found';
  end if;
  if v_owner <> auth.uid() then
    raise exception 'Not allowed';
  end if;

  insert into public.daily_deliveries as dd (
    owner_id, delivery_date, delivery_agent_id, customer_id, quantity, status
  ) values (
    v_owner, p_date, v_agent, v_customer, coalesce(p_liters, 0), case when p_delivered then 'Delivered' else 'Pending' end
  )
  on conflict (owner_id, delivery_date, customer_id)
  do update set
    delivery_agent_id = excluded.delivery_agent_id,
    quantity = coalesce(p_liters, dd.quantity),
    status = case when p_delivered then 'Delivered' else 'Pending' end,
    updated_at = now();
end;
$$;

-- 6) RPCs for Delivery app (agent-scoped, SECURITY DEFINER)
-- a) Login delivery agent by login_id or name + phone
drop function if exists public.login_delivery_agent(text, text);
create or replace function public.login_delivery_agent(
  p_identifier text,
  p_phone text
) returns table (
  id uuid,
  owner_id uuid,
  name text,
  phone text,
  area text,
  login_id text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select id, owner_id, name, phone, area, login_id, created_at, updated_at
  from public.delivery_agents
  where (
    (login_id is not null and login_id = p_identifier and phone = p_phone)
    or (name = p_identifier and phone = p_phone)
  )
  limit 1;
$$;

-- b) Fetch assignments for a given agent (optionally by date range)
drop function if exists public.get_agent_assignments(uuid, date, date);
create or replace function public.get_agent_assignments(
  p_agent_id uuid,
  p_from date default null,
  p_to date default null
) returns table (
  id uuid,
  owner_id uuid,
  delivery_agent_id uuid,
  customer_id uuid,
  date date,
  shift text,
  liters numeric,
  delivered boolean,
  assigned_at timestamptz,
  unassigned_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_from date;
  v_to date;
begin
  select owner_id into v_owner from public.delivery_agents where id = p_agent_id;
  if v_owner is null then
    return;
  end if;
  v_from := coalesce(p_from, current_date);
  v_to := coalesce(p_to, v_from);

  return query
  with dates as (
    select generate_series(v_from, v_to, interval '1 day')::date as d
  )
  (
    select
      da.id,
      da.owner_id,
      da.delivery_agent_id,
      da.customer_id,
      dt.d as date,
      'morning'::text as shift,
      coalesce(dd.quantity, 0) as liters,
      coalesce(dd.status = 'Delivered', false) as delivered,
      da.assigned_at,
      da.unassigned_at
    from public.delivery_assignments da
    cross join dates dt
    left join public.daily_deliveries dd
      on dd.owner_id = da.owner_id
     and dd.customer_id = da.customer_id
     and dd.delivery_date = dt.d
    where da.delivery_agent_id = p_agent_id
      and da.owner_id = v_owner
      and da.unassigned_at is null
  )
  union all
  (
    select
      da.id,
      da.owner_id,
      da.delivery_agent_id,
      da.customer_id,
      dt.d as date,
      'evening'::text as shift,
      coalesce(dd.quantity, 0) as liters,
      coalesce(dd.status = 'Delivered', false) as delivered,
      da.assigned_at,
      da.unassigned_at
    from public.delivery_assignments da
    cross join dates dt
    left join public.daily_deliveries dd
      on dd.owner_id = da.owner_id
     and dd.customer_id = da.customer_id
     and dd.delivery_date = dt.d
    where da.delivery_agent_id = p_agent_id
      and da.owner_id = v_owner
      and da.unassigned_at is null
  )
  order by date asc, shift asc, assigned_at desc;
end;
$$;

-- c) Customers visible to the agent's owner
drop function if exists public.get_agent_customers(uuid);
create or replace function public.get_agent_customers(
  p_agent_id uuid
) returns table (
  id uuid,
  user_id uuid,
  name text,
  phone text,
  address text,
  plan text,
  plan_type text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  select owner_id into v_owner from public.delivery_agents where id = p_agent_id;
  if v_owner is null then
    return;
  end if;
  return query
  select c.id, c.user_id, c.name, c.phone, c.address, c.plan, c.plan_type, c.created_at, c.updated_at
  from public.customers c
  where c.user_id = v_owner
  order by c.name asc;
end;
$$;

-- d) Delivery agents for the same owner (for display/reference)
drop function if exists public.get_agent_delivery_agents(uuid);
create or replace function public.get_agent_delivery_agents(
  p_agent_id uuid
) returns table (
  id uuid,
  owner_id uuid,
  name text,
  phone text,
  area text,
  login_id text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  select owner_id into v_owner from public.delivery_agents where id = p_agent_id;
  if v_owner is null then
    return;
  end if;
  return query
  select id, owner_id, name, phone, area, login_id, created_at, updated_at
  from public.delivery_agents
  where owner_id = v_owner
  order by name asc;
end;
$$;
