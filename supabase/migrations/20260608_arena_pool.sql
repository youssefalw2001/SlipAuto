-- ============================================================
-- YOINK.GG — Arena Pool accounting tables
-- Run this in your Supabase SQL editor
-- ============================================================

-- Pool transactions: every deposit logged here
create table if not exists pool_transactions (
  id             uuid primary key default gen_random_uuid(),
  player_wallet  text not null,
  type           text not null check (type in ('deposit', 'payout', 'rake')),
  sol_amount     numeric(12,6) not null,
  rake_amount    numeric(12,6) default 0,
  pool_amount    numeric(12,6) default 0,
  tx_signature   text,
  created_at     timestamptz default now()
);

-- Payout requests: server-side job watches this and signs payouts
create table if not exists payout_requests (
  id             uuid primary key default gen_random_uuid(),
  player_wallet  text not null,
  sol_amount     numeric(12,6) not null,
  type           text not null check (type in ('win', 'leave')),
  status         text not null default 'pending'
                   check (status in ('pending', 'processing', 'completed', 'failed')),
  tx_signature   text,
  requested_at   timestamptz default now(),
  completed_at   timestamptz
);

-- Pool state: single row tracking current pool balance
create table if not exists pool_state (
  id             int primary key default 1 check (id = 1),
  balance_sol    numeric(12,6) default 0,
  total_deposited numeric(16,6) default 0,
  total_paid_out  numeric(16,6) default 0,
  total_rake      numeric(16,6) default 0,
  updated_at     timestamptz default now()
);

-- Insert the initial row
insert into pool_state (id, balance_sol) values (1, 0)
  on conflict (id) do nothing;

-- Referral earnings: ongoing % of every referred player's fees
create table if not exists referral_earnings (
  id             uuid primary key default gen_random_uuid(),
  referrer_wallet text not null,
  referee_wallet  text not null,
  sol_earned      numeric(12,6) not null,
  pct_rate        numeric(5,4) not null,  -- 0.05 = 5%
  source_tx_id    uuid references pool_transactions(id),
  created_at      timestamptz default now()
);

-- Indexes for fast lookups
create index if not exists idx_pool_tx_wallet on pool_transactions(player_wallet);
create index if not exists idx_payout_status  on payout_requests(status);
create index if not exists idx_referral_earner on referral_earnings(referrer_wallet);

-- RLS: players can only see their own transactions
alter table pool_transactions  enable row level security;
alter table payout_requests    enable row level security;
alter table referral_earnings  enable row level security;

create policy "own transactions" on pool_transactions
  for select using (player_wallet = current_user);

create policy "own payouts" on payout_requests
  for select using (player_wallet = current_user);

create policy "own referral earnings" on referral_earnings
  for select using (referrer_wallet = current_user);

-- Service role (your backend) can read/write everything
-- (Supabase service_role key bypasses RLS automatically)
