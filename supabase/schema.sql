-- ============================================================================
-- AttoLink SaaS - Safe Migration & Schema Alignment (Fixes 42703)
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================================

create extension if not exists "uuid-ossp";

-- 1. Brands table
create table if not exists public.brands (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  company_name text not null default 'My Brand',
  custom_domain text unique,
  stripe_webhook_secret text,
  alert_email text,
  plan_tier text default 'free' check (plan_tier in ('free', 'starter', 'growth', 'agency')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Creator links table (create if not exists)
create table if not exists public.creator_links (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  brand_id uuid references public.brands(id) on delete set null,
  creator_name text not null,
  slug text not null unique,
  target_url text not null,
  promo_code text default '',
  clicks integer not null default 0 check (clicks >= 0),
  sales integer not null default 0 check (sales >= 0),
  revenue numeric(12, 2) not null default 0.00 check (revenue >= 0),
  blocked_leaks integer not null default 0 check (blocked_leaks >= 0),
  block_coupon_sites boolean not null default true,
  public_stats_token uuid default uuid_generate_v4() not null unique,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Safely add any missing columns to an already-existing creator_links table
alter table public.creator_links add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.creator_links add column if not exists brand_id uuid references public.brands(id) on delete set null;
alter table public.creator_links add column if not exists creator_name text;
alter table public.creator_links add column if not exists slug text;
alter table public.creator_links add column if not exists target_url text;
alter table public.creator_links add column if not exists promo_code text default '';
alter table public.creator_links add column if not exists clicks integer not null default 0;
alter table public.creator_links add column if not exists sales integer not null default 0;
alter table public.creator_links add column if not exists revenue numeric(12, 2) not null default 0.00;
alter table public.creator_links add column if not exists blocked_leaks integer not null default 0;
alter table public.creator_links add column if not exists block_coupon_sites boolean not null default true;
alter table public.creator_links add column if not exists public_stats_token uuid default uuid_generate_v4();
alter table public.creator_links add column if not exists is_active boolean not null default true;
alter table public.creator_links add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Backfill target_url from destination_url if destination_url existed in an older table
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'creator_links'
      and column_name = 'destination_url'
  ) then
    execute 'update public.creator_links set target_url = destination_url where target_url is null and destination_url is not null';
  end if;
end $$;

-- Backfill public_stats_token where null
update public.creator_links
set public_stats_token = uuid_generate_v4()
where public_stats_token is null;

-- 3. Attribution events table
create table if not exists public.attribution_events (
  id uuid default uuid_generate_v4() primary key,
  link_id uuid references public.creator_links(id) on delete cascade not null,
  event_type text not null check (event_type in ('click', 'blocked_leak', 'sale')),
  source_platform text default 'stripe' check (source_platform in ('link', 'shield', 'stripe', 'shopify', 'test')),
  revenue_amount numeric(12, 2) not null default 0.00 check (revenue_amount >= 0),
  currency text not null default 'USD',
  referer_domain text,
  country text,
  external_order_id text unique,
  stripe_session_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.attribution_events add column if not exists source_platform text default 'stripe';
alter table public.attribution_events add column if not exists revenue_amount numeric(12, 2) not null default 0.00;
alter table public.attribution_events add column if not exists currency text not null default 'USD';
alter table public.attribution_events add column if not exists referer_domain text;
alter table public.attribution_events add column if not exists country text;
alter table public.attribution_events add column if not exists external_order_id text;
alter table public.attribution_events add column if not exists stripe_session_id text;

-- 4. Indexes (now safe because columns exist)
create index if not exists idx_creator_links_user_id on public.creator_links(user_id);
create index if not exists idx_creator_links_slug on public.creator_links(slug);
create unique index if not exists idx_creator_links_token_unique on public.creator_links(public_stats_token);
create index if not exists idx_attribution_events_link_id on public.attribution_events(link_id);
create index if not exists idx_attribution_events_type on public.attribution_events(event_type);

-- 5. Row Level Security & Policies
alter table public.brands enable row level security;
alter table public.creator_links enable row level security;
alter table public.attribution_events enable row level security;

drop policy if exists "Users can view own brands" on public.brands;
create policy "Users can view own brands" on public.brands
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own brands" on public.brands;
create policy "Users can insert own brands" on public.brands
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own brands" on public.brands;
create policy "Users can update own brands" on public.brands
  for update using (auth.uid() = user_id);

drop policy if exists "Users manage own creator links" on public.creator_links;
create policy "Users manage own creator links" on public.creator_links
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Public can read link info via token" on public.creator_links;
drop policy if exists "Public can read active creator links for scorecards" on public.creator_links;
create policy "Public can read active creator links for scorecards" on public.creator_links
  for select using (is_active = true);

drop policy if exists "Users view own link attribution events" on public.attribution_events;
create policy "Users view own link attribution events" on public.attribution_events
  for select using (
    exists (
      select 1 from public.creator_links
      where creator_links.id = attribution_events.link_id
      and creator_links.user_id = auth.uid()
    )
  );