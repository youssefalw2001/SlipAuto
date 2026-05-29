-- SlipIQ / First Set Lab - Supabase Setup Script
-- Azuro / DGPredict Execution Readiness Schema
-- Run this in your Supabase SQL Editor.

BEGIN;

-- 1. Create Azuro Execution Audit Table
CREATE TABLE IF NOT EXISTS public.azuro_execution_audit_v1 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'azuro_dgpredict',
  run_id text,
  signal_id uuid,
  signal_key text,
  match_name text,
  event_date date,
  starts_at timestamptz,
  strategy_lane text,
  public_signal_name text,
  model_bucket text,
  target_scores text[] NOT NULL DEFAULT '{}',
  baseline_grouped_odds numeric,
  azuro_game_id text,
  azuro_game_title text,
  azuro_league text,
  azuro_sport text,
  azuro_condition_id text,
  azuro_market_title text,
  score_outcomes_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  azuro_grouped_odds numeric,
  edge_vs_baseline numeric,
  min_score_max_bet numeric,
  min_score_max_payout numeric,
  max_group_stake numeric,
  gas_estimate_json jsonb,
  fee_estimate_json jsonb,
  decision text NOT NULL DEFAULT 'UNTESTED',
  reason text,
  raw_match_json jsonb,
  raw_conditions_json jsonb,
  raw_calculations_json jsonb
);

-- Add indexes on azuro_execution_audit_v1
CREATE INDEX IF NOT EXISTS idx_azuro_audit_signal_id ON public.azuro_execution_audit_v1(signal_id);
CREATE INDEX IF NOT EXISTS idx_azuro_audit_created_at_desc ON public.azuro_execution_audit_v1(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_azuro_audit_decision ON public.azuro_execution_audit_v1(decision);
CREATE INDEX IF NOT EXISTS idx_azuro_audit_strategy_lane ON public.azuro_execution_audit_v1(strategy_lane);
CREATE INDEX IF NOT EXISTS idx_azuro_audit_run_id ON public.azuro_execution_audit_v1(run_id);

-- 2. Create Azuro Bet Orders Table
CREATE TABLE IF NOT EXISTS public.azuro_bet_orders_v1 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  signal_id uuid,
  audit_id uuid,
  score text NOT NULL,
  condition_id text,
  outcome_id text,
  stake numeric,
  odds numeric,
  min_odds numeric,
  max_bet numeric,
  max_payout numeric,
  order_id text,
  tx_hash text,
  status text NOT NULL DEFAULT 'PLANNED',
  payout numeric,
  wallet_address text,
  chain_id text,
  token text,
  raw_order_json jsonb,
  raw_status_json jsonb
);

-- Add index on azuro_bet_orders_v1
CREATE INDEX IF NOT EXISTS idx_azuro_orders_signal_id ON public.azuro_bet_orders_v1(signal_id);
CREATE INDEX IF NOT EXISTS idx_azuro_orders_status ON public.azuro_bet_orders_v1(status);

-- 3. Create view: Latest per-signal audits
CREATE OR REPLACE VIEW public.azuro_execution_latest_v1 AS
SELECT DISTINCT ON (signal_id) *
FROM public.azuro_execution_audit_v1
ORDER BY signal_id, created_at DESC;

-- 4. Create view: Overall Execution Summary
CREATE OR REPLACE VIEW public.azuro_execution_summary_v1 AS
WITH latest AS (
  SELECT * FROM public.azuro_execution_latest_v1
)
SELECT
  COUNT(*)::integer AS total_audited,
  COUNT(*) FILTER (WHERE decision = 'BETTABLE')::integer AS bettable_count,
  COUNT(*) FILTER (WHERE decision = 'MISSING_GAME')::integer AS missing_game_count,
  COUNT(*) FILTER (WHERE decision = 'MISSING_MARKET')::integer AS missing_market_count,
  COUNT(*) FILTER (WHERE decision = 'MISSING_SCORE')::integer AS missing_score_count,
  COUNT(*) FILTER (WHERE decision = 'LOW_LIMIT')::integer AS low_limit_count,
  COUNT(*) FILTER (WHERE decision = 'BAD_ODDS')::integer AS bad_odds_count,
  COUNT(*) FILTER (WHERE decision = 'API_ERROR')::integer AS api_error_count,
  CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE decision = 'BETTABLE')::numeric / COUNT(*)::numeric * 100) ELSE 0 END AS bettable_pct,
  COALESCE(AVG(azuro_grouped_odds) FILTER (WHERE decision = 'BETTABLE'), 0)::numeric AS avg_azuro_grouped_odds,
  COALESCE(AVG(baseline_grouped_odds), 0)::numeric AS avg_baseline_grouped_odds,
  COALESCE(AVG(edge_vs_baseline) FILTER (WHERE decision = 'BETTABLE'), 0)::numeric AS avg_edge_vs_baseline,
  COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY max_group_stake), 0)::numeric AS median_max_group_stake,
  COALESCE(AVG(max_group_stake), 0)::numeric AS avg_max_group_stake,
  MAX(run_id) AS latest_run_id,
  MAX(created_at) AS latest_audit_time
FROM latest;

-- 5. Create view: Execution summary grouped by strategy lane
CREATE OR REPLACE VIEW public.azuro_execution_lane_summary_v1 AS
WITH latest AS (
  SELECT * FROM public.azuro_execution_latest_v1
)
SELECT
  strategy_lane,
  public_signal_name,
  COUNT(*)::integer AS audited,
  COUNT(*) FILTER (WHERE decision = 'BETTABLE')::integer AS bettable,
  CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE decision = 'BETTABLE')::numeric / COUNT(*)::numeric * 100) ELSE 0 END AS bettable_pct,
  COALESCE(AVG(edge_vs_baseline) FILTER (WHERE decision = 'BETTABLE'), 0)::numeric AS avg_edge_vs_baseline,
  COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY max_group_stake), 0)::numeric AS median_max_group_stake,
  COALESCE(AVG(max_group_stake), 0)::numeric AS avg_max_group_stake,
  COUNT(*) FILTER (WHERE decision = 'MISSING_MARKET')::integer AS missing_market,
  COUNT(*) FILTER (WHERE decision = 'MISSING_SCORE')::integer AS missing_score,
  COUNT(*) FILTER (WHERE decision = 'LOW_LIMIT')::integer AS low_limit,
  COUNT(*) FILTER (WHERE decision = 'BAD_ODDS')::integer AS bad_odds,
  COUNT(*) FILTER (WHERE decision = 'API_ERROR')::integer AS api_error
FROM latest
GROUP BY strategy_lane, public_signal_name;

-- 6. Create view: Bettable Signals only
CREATE OR REPLACE VIEW public.azuro_execution_bettable_signals_v1 AS
SELECT
  signal_id,
  match_name,
  event_date,
  strategy_lane,
  public_signal_name,
  target_scores,
  baseline_grouped_odds,
  azuro_grouped_odds,
  edge_vs_baseline,
  max_group_stake,
  score_outcomes_json,
  azuro_game_id,
  azuro_condition_id,
  created_at,
  run_id
FROM public.azuro_execution_latest_v1
WHERE decision = 'BETTABLE';

-- 7. Grant public API select permissions in schema public
GRANT SELECT ON public.azuro_execution_audit_v1 TO anon, authenticated, service_role;
GRANT SELECT ON public.azuro_bet_orders_v1 TO anon, authenticated, service_role;
GRANT SELECT ON public.azuro_execution_latest_v1 TO anon, authenticated, service_role;
GRANT SELECT ON public.azuro_execution_summary_v1 TO anon, authenticated, service_role;
GRANT SELECT ON public.azuro_execution_lane_summary_v1 TO anon, authenticated, service_role;
GRANT SELECT ON public.azuro_execution_bettable_signals_v1 TO anon, authenticated, service_role;

COMMIT;
