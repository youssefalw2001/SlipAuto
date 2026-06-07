import { AnimatePresence, motion } from 'framer-motion';
import type { ArenaState } from '../types';
import { WalletCard } from './WalletCard';
import { formatSol, formatCountdown } from '../utils';
import { ANIMATION } from '../constants';

interface ArenaGridProps {
  state: ArenaState;
  onYoink: (walletId: string) => void;
  screenEffect: 'shake' | 'green-flash' | 'red-pulse' | null;
}

export function ArenaGrid({ state, onYoink, screenEffect }: ArenaGridProps) {
  const isGlitchTime = state.countdown <= ANIMATION.glitchThreshold && state.countdown > 0;

  return (
    <div
      className={`relative ${screenEffect === 'shake' ? 'animate-screen-shake' : ''}`}
    >
      {/* Screen Flash Overlay */}
      <AnimatePresence>
        {screenEffect === 'green-flash' && (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-success/20 z-50 pointer-events-none"
          />
        )}
        {screenEffect === 'red-pulse' && (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-primary/20 z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Arena Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-4xl md:text-5xl text-white tracking-wider">
            YOINK <span className="text-gradient-fire">ARENA</span>
          </h2>
          <p className="font-mono text-xs text-white/40 mt-1">
            {state.wallets.length} players • Pool: {formatSol(state.totalPool, 2)} SOL
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="flex flex-col items-end">
          <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
            Next Round
          </span>
          <span
            className={`font-display text-3xl md:text-4xl tracking-wider ${
              isGlitchTime ? 'animate-glitch text-primary' : 'text-white'
            }`}
          >
            {formatCountdown(state.countdown)}
          </span>
        </div>
      </div>

      {/* Last Event Ticker */}
      <AnimatePresence mode="wait">
        {state.lastYoinker && state.lastVictim && (
          <motion.div
            key={`${state.lastYoinker}-${state.lastVictim}-${Date.now()}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mb-4 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] inline-flex items-center gap-2"
          >
            <span className="text-success text-sm">⚡</span>
            <span className="font-mono text-xs text-white/60">
              <span className="text-secondary font-semibold">{state.lastYoinker}</span>
              {' yoinked '}
              <span className="text-primary font-semibold">{state.lastVictim}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {state.wallets
            .sort((a, b) => b.balanceSol.minus(a.balanceSol).toNumber())
            .map((wallet, index) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onYoink={onYoink}
                index={index}
              />
            ))}
        </AnimatePresence>
      </motion.div>

      {/* Matchmaking Gate Overlay (for when PREDATOR room logic is needed) */}
      {/* 
      <div className="absolute inset-0 bg-obsidian/90 backdrop-blur-sm flex items-center justify-center z-40 rounded-2xl">
        <div className="text-center">
          <span className="font-display text-2xl text-accent tracking-widest">
            PREDATOR LEVEL REQUIRED
          </span>
          <p className="text-white/40 font-mono text-xs mt-2">
            Minimum 1.5 SOL deposit to enter this room
          </p>
        </div>
      </div>
      */}
    </div>
  );
}
