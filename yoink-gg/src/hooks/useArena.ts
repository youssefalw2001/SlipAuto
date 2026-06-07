import { useState, useCallback, useEffect, useRef } from 'react';
import BigNumber from 'bignumber.js';
import type { ArenaState, ArenaWallet, ToastEvent } from '../types';
import { generateMockWallets, generateId, calculateTier } from '../utils';
import { ARENA_CONFIG } from '../constants';

const INITIAL_COUNTDOWN = ARENA_CONFIG.roundDurationSeconds;

function createInitialState(): ArenaState {
  const wallets = generateMockWallets(12);
  const totalPool = wallets.reduce(
    (sum, w) => sum.plus(w.balanceSol),
    new BigNumber(0)
  );

  return {
    wallets,
    totalPool,
    roundId: generateId(),
    countdown: INITIAL_COUNTDOWN,
    isSpinning: false,
    lastYoinker: null,
    lastVictim: null,
  };
}

export function useArena() {
  const [state, setState] = useState<ArenaState>(createInitialState);
  const [toasts, setToasts] = useState<ToastEvent[]>([]);
  const [screenEffect, setScreenEffect] = useState<'shake' | 'green-flash' | 'red-pulse' | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Countdown Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.countdown <= 0) {
          return { ...prev, countdown: INITIAL_COUNTDOWN, roundId: generateId() };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // ─── Add Toast ────────────────────────────────────────────────────────────
  const addToast = useCallback((toast: Omit<ToastEvent, 'id' | 'timestamp'>) => {
    const newToast: ToastEvent = {
      ...toast,
      id: generateId(),
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev.slice(-4), newToast]);

    // Auto-remove after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  }, []);

  // ─── Trigger Screen Effect ────────────────────────────────────────────────
  const triggerEffect = useCallback((effect: 'shake' | 'green-flash' | 'red-pulse') => {
    setScreenEffect(effect);
    setTimeout(() => setScreenEffect(null), 500);
  }, []);

  // ─── Yoink Action ─────────────────────────────────────────────────────────
  const yoink = useCallback(
    (targetId: string) => {
      setState((prev) => {
        const targetIndex = prev.wallets.findIndex((w) => w.id === targetId);
        if (targetIndex === -1) return prev;

        const target = prev.wallets[targetIndex];
        const yoinkAmount = target.balanceSol.multipliedBy(0.1 + Math.random() * 0.3);
        const newTargetBalance = target.balanceSol.minus(yoinkAmount);

        const updatedWallets: ArenaWallet[] = prev.wallets.map((w, i) => {
          if (i === targetIndex) {
            return {
              ...w,
              balanceSol: BigNumber.max(newTargetBalance, new BigNumber(0)),
              tier: calculateTier(BigNumber.max(newTargetBalance, new BigNumber(0))),
              isYoinked: true,
            };
          }
          return w;
        });

        // Reset yoinked state after animation
        setTimeout(() => {
          setState((s) => ({
            ...s,
            wallets: s.wallets.map((w) =>
              w.id === targetId ? { ...w, isYoinked: false } : w
            ),
          }));
        }, 1000);

        return {
          ...prev,
          wallets: updatedWallets,
          lastYoinker: 'You',
          lastVictim: target.displayName,
        };
      });

      // Visual feedback
      triggerEffect('shake');
      setTimeout(() => triggerEffect('green-flash'), 100);

      addToast({
        type: 'yoink',
        message: `You YOINKED from a wallet!`,
        amount: new BigNumber(0),
      });
    },
    [addToast, triggerEffect]
  );

  // ─── Simulate Random Yoink Events ────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.wallets.length < 2) return prev;

        const attackerIdx = Math.floor(Math.random() * prev.wallets.length);
        let victimIdx = Math.floor(Math.random() * prev.wallets.length);
        while (victimIdx === attackerIdx) {
          victimIdx = Math.floor(Math.random() * prev.wallets.length);
        }

        const attacker = prev.wallets[attackerIdx];
        const victim = prev.wallets[victimIdx];
        const amount = victim.balanceSol.multipliedBy(0.05 + Math.random() * 0.15);
        const newVictimBalance = BigNumber.max(victim.balanceSol.minus(amount), new BigNumber(0));
        const newAttackerBalance = attacker.balanceSol.plus(amount);

        const updatedWallets = prev.wallets.map((w, i) => {
          if (i === victimIdx) {
            return { ...w, balanceSol: newVictimBalance, tier: calculateTier(newVictimBalance) };
          }
          if (i === attackerIdx) {
            return {
              ...w,
              balanceSol: newAttackerBalance,
              tier: calculateTier(newAttackerBalance),
              streak: w.streak + 1,
            };
          }
          return w;
        });

        const newTotal = updatedWallets.reduce(
          (sum, w) => sum.plus(w.balanceSol),
          new BigNumber(0)
        );

        return {
          ...prev,
          wallets: updatedWallets,
          totalPool: newTotal,
          lastYoinker: attacker.displayName,
          lastVictim: victim.displayName,
        };
      });

      // Random toast
      if (Math.random() > 0.6) {
        addToast({
          type: Math.random() > 0.5 ? 'yoink' : 'join',
          message: `${['DegenApe', 'SolWhale', 'RektKing', 'MoonShot'][Math.floor(Math.random() * 4)]} made a move!`,
        });
      }
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [addToast]);

  return {
    state,
    toasts,
    screenEffect,
    yoink,
    addToast,
  };
}
