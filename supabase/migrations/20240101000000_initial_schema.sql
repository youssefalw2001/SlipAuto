-- ============================================================
-- YOINK.GG — Supabase Schema
-- Run this in Supabase SQL Editor → New Query → Run
-- ============================================================

-- Players table
create table if not exists public.players (
  id            uuid primary key default gen_random_uuid(),
  wallet        text unique not null,
  xp            integer not null default 0,
  level_id      integer not null default 1,
  total_stolen  numeric(12,4) not null default 0,
  total_rounds  integer not null default 0,
  wins          integer not null default 0,
  losses        integer not null default 0,
  referral_code text unique,
  referred_by   text,
  created_at    timestamptz not null default now(),
  last_seen     timestamptz not null default now()
);

-- Crate opens table (for daily limit tracking)
create table if not exists public.crate_opens (
  id         uuid primary key default gen_random_uuid(),
  wallet     text not null references public.players(wallet) on delete cascade,
  tier       text not null,  -- common | rare | epic | legendary
  reward     text not null,
  reward_type text not null, -- sol | xp | boost | cosmetic
  reward_value numeric(12,4),
  opened_at  timestamptz not null default now()
);

-- Referrals table
create table if not exists public.referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer      text not null,
  referee       text not null unique,
  volume_sol    numeric(12,4) not null default 0,
  earned_sol    numeric(12,4) not null default 0,
  created_at    timestamptz not null default now()
);

-- XP history (optional — useful for auditing)
create table if not exists public.xp_events (
  id         uuid primary key default gen_random_uuid(),
  wallet     text not null,
  amount     integer not null,
  reason     text not null,
  created_at timestamptz not null default now()
);

-- ── Indexes ──
create index if not exists idx_players_wallet      on public.players(wallet);
create index if not exists idx_crate_opens_wallet  on public.crate_opens(wallet);
create index if not exists idx_crate_opens_date    on public.crate_opens(wallet, tier, opened_at);
create index if not exists idx_referrals_referrer  on public.referrals(referrer);
create index if not exists idx_xp_events_wallet    on public.xp_events(wallet);

-- ── Row Level Security ──
alter table public.players    enable row level security;
alter table public.crate_opens enable row level security;
alter table public.referrals   enable row level security;
alter table public.xp_events   enable row level security;

-- Allow anon read/write (wallet-based auth — no login required)
create policy "Allow all on players"     on public.players     for all using (true) with check (true);
create policy "Allow all on crate_opens" on public.crate_opens for all using (true) with check (true);
create policy "Allow all on referrals"   on public.referrals   for all using (true) with check (true);
create policy "Allow all on xp_events"   on public.xp_events   for all using (true) with check (true);
