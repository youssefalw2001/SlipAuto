import { createClient } from '@supabase/supabase-js';
import { getLevelByXP } from './levels';

// ── Client ──────────────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string;
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Types ────────────────────────────────────────────────────
export interface PlayerRow {
  id:            string;
  wallet:        string;
  xp:            number;
  level_id:      number;
  total_stolen:  number;
  total_rounds:  number;
  wins:          number;
  losses:        number;
  referral_code: string | null;
  referred_by:   string | null;
  created_at:    string;
  last_seen:     string;
}

export interface CrateOpenRow {
  id:           string;
  wallet:       string;
  tier:         string;
  reward:       string;
  reward_type:  string;
  reward_value: number | null;
  opened_at:    string;
}

// ── Generate a short referral code from wallet ───────────────
function makeReferralCode(wallet: string): string {
  return wallet.replace(/\./g, '').replace(/\.\.\./g, '').slice(0, 8).toUpperCase();
}

// ── Upsert player — creates on first visit, updates last_seen ──
export async function upsertPlayer(wallet: string, referredBy?: string): Promise<PlayerRow | null> {
  const code = makeReferralCode(wallet);

  // Try insert first
  const { data: existing } = await supabase
    .from('players')
    .select('*')
    .eq('wallet', wallet)
    .maybeSingle();

  if (existing) {
    // Update last_seen
    await supabase
      .from('players')
      .update({ last_seen: new Date().toISOString() })
      .eq('wallet', wallet);
    return existing as PlayerRow;
  }

  // New player
  const { data, error } = await supabase
    .from('players')
    .insert({
      wallet,
      xp:            0,
      level_id:      1,
      total_stolen:  0,
      total_rounds:  0,
      wins:          0,
      losses:        0,
      referral_code: code,
      referred_by:   referredBy ?? null,
    })
    .select()
    .single();

  if (error) { console.error('upsertPlayer:', error.message); return null; }

  // If referred, create referral row
  if (referredBy) {
    await supabase.from('referrals').insert({
      referrer:   referredBy,
      referee:    wallet,
      volume_sol: 0,
      earned_sol: 0,
    }).select();
  }

  return data as PlayerRow;
}

// ── Save XP + level + stats after a game event ──────────────
export async function saveXP(
  wallet: string,
  xpDelta: number,
  reason: string,
  stats?: { stolen?: number; rounds?: number; wins?: number; losses?: number }
): Promise<number> {
  // Fetch current XP
  const { data: player } = await supabase
    .from('players')
    .select('xp, total_stolen, total_rounds, wins, losses')
    .eq('wallet', wallet)
    .maybeSingle();

  if (!player) return 0;

  const newXP      = (player.xp ?? 0) + xpDelta;
  const newLevel   = getLevelByXP(newXP).id;
  const newStolen  = (player.total_stolen  ?? 0) + (stats?.stolen  ?? 0);
  const newRounds  = (player.total_rounds  ?? 0) + (stats?.rounds  ?? 0);
  const newWins    = (player.wins   ?? 0) + (stats?.wins   ?? 0);
  const newLosses  = (player.losses ?? 0) + (stats?.losses ?? 0);

  await supabase.from('players').update({
    xp:           newXP,
    level_id:     newLevel,
    total_stolen: newStolen,
    total_rounds: newRounds,
    wins:         newWins,
    losses:       newLosses,
    last_seen:    new Date().toISOString(),
  }).eq('wallet', wallet);

  // Log XP event
  await supabase.from('xp_events').insert({
    wallet,
    amount: xpDelta,
    reason,
  });

  return newXP;
}

// ── Crate: check how many opened today for this tier ────────
export async function getCrateOpensToday(wallet: string, tier: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('crate_opens')
    .select('id', { count: 'exact', head: true })
    .eq('wallet', wallet)
    .eq('tier', tier)
    .gte('opened_at', startOfDay.toISOString());

  return count ?? 0;
}

// ── Crate: record an open ────────────────────────────────────
export async function recordCrateOpen(
  wallet:       string,
  tier:         string,
  reward:       string,
  rewardType:   string,
  rewardValue?: number,
): Promise<void> {
  await supabase.from('crate_opens').insert({
    wallet,
    tier,
    reward,
    reward_type:  rewardType,
    reward_value: rewardValue ?? null,
  });
}

// ── Get all opens today (all tiers) for a wallet ─────────────
export async function getAllCrateOpensToday(wallet: string): Promise<Record<string, number>> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('crate_opens')
    .select('tier')
    .eq('wallet', wallet)
    .gte('opened_at', startOfDay.toISOString());

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.tier] = (counts[row.tier] ?? 0) + 1;
  }
  return counts;
}

// ── Referrals: get my referral stats ────────────────────────
export async function getMyReferrals(wallet: string) {
  const { data } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer', wallet)
    .order('created_at', { ascending: false });

  return data ?? [];
}

// ── Referrals: update volume when referee plays ──────────────
export async function updateReferralVolume(referee: string, solAmount: number): Promise<void> {
  const earnedSol = solAmount * 0.01; // 1% for referrer

  const { data: ref } = await supabase
    .from('referrals')
    .select('volume_sol, earned_sol')
    .eq('referee', referee)
    .maybeSingle();

  if (!ref) return;

  await supabase.from('referrals').update({
    volume_sol: (ref.volume_sol ?? 0) + solAmount,
    earned_sol: (ref.earned_sol ?? 0) + earnedSol,
  }).eq('referee', referee);
}

// ── Leaderboard: top players by XP ──────────────────────────
export async function getLeaderboard(limit = 10): Promise<PlayerRow[]> {
  const { data } = await supabase
    .from('players')
    .select('*')
    .order('total_stolen', { ascending: false })
    .limit(limit);

  return (data ?? []) as PlayerRow[];
}

// ── Get player by wallet ─────────────────────────────────────
export async function getPlayer(wallet: string): Promise<PlayerRow | null> {
  const { data } = await supabase
    .from('players')
    .select('*')
    .eq('wallet', wallet)
    .maybeSingle();

  return data as PlayerRow | null;
}

// ── Get player by referral code ──────────────────────────────
export async function getPlayerByReferralCode(code: string): Promise<PlayerRow | null> {
  const { data } = await supabase
    .from('players')
    .select('*')
    .eq('referral_code', code)
    .maybeSingle();

  return data as PlayerRow | null;
}


// ── Auto-init database tables on first load ──────────────────
// Creates all tables if they don't exist yet.
// Uses supabase.rpc or falls back to individual table checks.
export async function initDatabase(): Promise<void> {
  try {
    // Check if players table exists by querying it
    const { error } = await supabase
      .from('players')
      .select('id')
      .limit(1);

    // If no error — tables already exist, nothing to do
    if (!error) return;

    // Tables don't exist yet — create them via SQL
    // Supabase anon key can run SQL via the sql endpoint on new projects
    const statements = [
      `create table if not exists public.players (
        id uuid primary key default gen_random_uuid(),
        wallet text unique not null,
        xp integer not null default 0,
        level_id integer not null default 1,
        total_stolen numeric(12,4) not null default 0,
        total_rounds integer not null default 0,
        wins integer not null default 0,
        losses integer not null default 0,
        referral_code text unique,
        referred_by text,
        created_at timestamptz not null default now(),
        last_seen timestamptz not null default now()
      )`,
      `create table if not exists public.crate_opens (
        id uuid primary key default gen_random_uuid(),
        wallet text not null,
        tier text not null,
        reward text not null,
        reward_type text not null,
        reward_value numeric(12,4),
        opened_at timestamptz not null default now()
      )`,
      `create table if not exists public.referrals (
        id uuid primary key default gen_random_uuid(),
        referrer text not null,
        referee text not null unique,
        volume_sol numeric(12,4) not null default 0,
        earned_sol numeric(12,4) not null default 0,
        created_at timestamptz not null default now()
      )`,
      `create table if not exists public.xp_events (
        id uuid primary key default gen_random_uuid(),
        wallet text not null,
        amount integer not null,
        reason text not null,
        created_at timestamptz not null default now()
      )`,
      // Indexes
      `create index if not exists idx_players_wallet on public.players(wallet)`,
      `create index if not exists idx_crate_opens_wallet on public.crate_opens(wallet)`,
      `create index if not exists idx_referrals_referrer on public.referrals(referrer)`,
      // RLS — allow anon access
      `alter table public.players enable row level security`,
      `alter table public.crate_opens enable row level security`,
      `alter table public.referrals enable row level security`,
      `alter table public.xp_events enable row level security`,
      `do $$ begin
        if not exists (select 1 from pg_policies where tablename='players' and policyname='Allow all on players') then
          create policy "Allow all on players" on public.players for all using (true) with check (true);
        end if;
      end $$`,
      `do $$ begin
        if not exists (select 1 from pg_policies where tablename='crate_opens' and policyname='Allow all on crate_opens') then
          create policy "Allow all on crate_opens" on public.crate_opens for all using (true) with check (true);
        end if;
      end $$`,
      `do $$ begin
        if not exists (select 1 from pg_policies where tablename='referrals' and policyname='Allow all on referrals') then
          create policy "Allow all on referrals" on public.referrals for all using (true) with check (true);
        end if;
      end $$`,
      `do $$ begin
        if not exists (select 1 from pg_policies where tablename='xp_events' and policyname='Allow all on xp_events') then
          create policy "Allow all on xp_events" on public.xp_events for all using (true) with check (true);
        end if;
      end $$`,
    ];

    for (const sql of statements) {
      await supabase.rpc('exec_sql', { query: sql }).catch(() => {
        // Silent — table likely already exists or rpc not available
      });
    }
  } catch {
    // Silent fail — app still works without DB, just no persistence
  }
}
