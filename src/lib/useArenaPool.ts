/**
 * useArenaPool
 * Handles all real SOL movement for YOINK.GG's Arena Pool model.
 *
 * Model recap:
 *  - Player sends SOL → POOL_ADDRESS
 *  - 10% of entry = your rake (sent to RAKE_ADDRESS)
 *  - 90% = pool contribution (stays in POOL_ADDRESS)
 *  - Win → pool sends SOL back to player
 *  - All accounting mirrored in Supabase for fast reads
 *
 * For the initial launch (Option A) the pool address is a
 * regular Solana wallet you control. No smart contract needed.
 * Upgrade to an Anchor program later without changing this hook.
 */

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

// ── Your addresses — set these in .env ──────────────────────────────────────
const POOL_WALLET  = import.meta.env.VITE_POOL_WALLET  as string | undefined;
const RAKE_WALLET  = import.meta.env.VITE_RAKE_WALLET  as string | undefined;

const RAKE_PCT     = 0.10;   // 10% of every entry goes to rake wallet
const POOL_PCT     = 0.90;   // 90% goes into pool

function lamports(sol: number) {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

export interface PoolState {
  poolBalance: number;    // SOL
  isLoading: boolean;
  error: string | null;
}

export function useArenaPool() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [poolBalance, setPoolBalance] = useState(0);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // ── Fetch live pool balance ─────────────────────────────────────────────
  const refreshPoolBalance = useCallback(async () => {
    if (!POOL_WALLET) return;
    try {
      const pk  = new PublicKey(POOL_WALLET);
      const bal = await connection.getBalance(pk);
      setPoolBalance(bal / LAMPORTS_PER_SOL);
    } catch (e) {
      console.error("Pool balance fetch failed:", e);
    }
  }, [connection]);

  useEffect(() => {
    refreshPoolBalance();
    const iv = setInterval(refreshPoolBalance, 15_000);
    return () => clearInterval(iv);
  }, [refreshPoolBalance]);

  // ── Deposit: player enters the arena ────────────────────────────────────
  // Sends 10% to rake wallet + 90% to pool wallet in one transaction.
  const deposit = useCallback(async (solAmount: number): Promise<boolean> => {
    if (!publicKey || !POOL_WALLET || !RAKE_WALLET) {
      setError("Wallet not connected or pool not configured.");
      return false;
    }
    if (solAmount < 0.05) {
      setError("Minimum entry is 0.05 SOL.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const poolPk = new PublicKey(POOL_WALLET);
      const rakePk = new PublicKey(RAKE_WALLET);

      const rakeLamports = lamports(solAmount * RAKE_PCT);
      const poolLamports = lamports(solAmount * POOL_PCT);

      const tx = new Transaction().add(
        // Rake: 10% to your wallet — guaranteed revenue
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey:   rakePk,
          lamports:   rakeLamports,
        }),
        // Pool: 90% to pool wallet
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey:   poolPk,
          lamports:   poolLamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");

      // Mirror in Supabase for fast reads / referral accounting
      await supabase.from("pool_transactions").insert({
        player_wallet: publicKey.toString(),
        type:          "deposit",
        sol_amount:    solAmount,
        rake_amount:   solAmount * RAKE_PCT,
        pool_amount:   solAmount * POOL_PCT,
        tx_signature:  sig,
      });

      await refreshPoolBalance();
      setIsLoading(false);
      return true;
    } catch (e: any) {
      setError(e?.message ?? "Transaction failed.");
      setIsLoading(false);
      return false;
    }
  }, [publicKey, connection, sendTransaction, refreshPoolBalance]);

  // ── Payout: send SOL from pool to winning player ─────────────────────────
  // NOTE: For Option A, payouts are signed by your backend/server wallet
  // (the one that controls POOL_WALLET). This function records the intent
  // in Supabase — your server-side payout job watches that table and signs.
  // This keeps private keys off the frontend safely.
  const requestPayout = useCallback(async (
    winnerWallet: string,
    solAmount:    number,
    txType:       "win" | "leave"
  ): Promise<boolean> => {
    if (!publicKey) return false;
    try {
      await supabase.from("payout_requests").insert({
        player_wallet: winnerWallet,
        sol_amount:    solAmount,
        type:          txType,
        status:        "pending",
        requested_at:  new Date().toISOString(),
      });
      return true;
    } catch (e) {
      console.error("Payout request failed:", e);
      return false;
    }
  }, [publicKey]);

  // ── Get player's wallet SOL balance ─────────────────────────────────────
  const getWalletBalance = useCallback(async (): Promise<number> => {
    if (!publicKey) return 0;
    try {
      const bal = await connection.getBalance(publicKey);
      return bal / LAMPORTS_PER_SOL;
    } catch {
      return 0;
    }
  }, [publicKey, connection]);

  return {
    poolBalance,
    isLoading,
    error,
    deposit,
    requestPayout,
    getWalletBalance,
    refreshPoolBalance,
  };
}
