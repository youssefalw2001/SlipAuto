import { motion, AnimatePresence } from 'framer-motion';
import BigNumber from 'bignumber.js';
import type { SessionPnL } from '../types';
import { formatSol } from '../utils';

interface SessionPnLPanelProps {
  pnl: SessionPnL;
  isOpen: boolean;
  onToggle: () => void;
}

export function SessionPnLPanel({ pnl, isOpen, onToggle }: SessionPnLPanelProps) {
  const isProfit = pnl.netPnL.gte(0);

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="fixed top-4 right-4 z-40 px-3 py-2 rounded-xl glass-card border-white/10 flex items-center gap-2"
      >
        <span className={`w-2 h-2 rounded-full ${isProfit ? 'bg-success' : 'bg-primary'} animate-pulse`} />
        <span className={`font-display text-sm tracking-wider ${isProfit ? 'text-success' : 'text-primary'}`}>
          {isProfit ? '+' : ''}{formatSol(pnl.netPnL, 3)} SOL
        </span>
      </motion.button>

      {/* Sliding Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-80 z-50 glass border-l border-white/10 p-6 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-2xl tracking-wider text-white">
                SESSION P&L
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggle}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80"
              >
                ✕
              </motion.button>
            </div>

            {/* Net P&L Display */}
            <div className="text-center mb-8 py-6 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.3em] block mb-2">
                Net P&L
              </span>
              <span
                className={`font-display text-5xl tracking-wider ${
                  isProfit ? 'text-success' : 'text-primary'
                }`}
              >
                {isProfit ? '+' : ''}{formatSol(pnl.netPnL, 4)}
              </span>
              <span className="font-mono text-xs text-white/40 ml-2">SOL</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <StatBlock label="Deposited" value={formatSol(pnl.totalDeposited)} color="text-white/70" />
              <StatBlock label="Withdrawn" value={formatSol(pnl.totalWithdrawn)} color="text-white/70" />
              <StatBlock label="Wins" value={pnl.wins.toString()} color="text-success" />
              <StatBlock label="Losses" value={pnl.losses.toString()} color="text-primary" />
              <StatBlock label="Biggest Win" value={`+${formatSol(pnl.biggestWin)}`} color="text-success" />
              <StatBlock label="Biggest Loss" value={`-${formatSol(pnl.biggestLoss)}`} color="text-primary" />
            </div>

            {/* Win Rate Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-[10px] font-mono text-white/40 mb-1">
                <span>Win Rate</span>
                <span>
                  {pnl.wins + pnl.losses > 0
                    ? ((pnl.wins / (pnl.wins + pnl.losses)) * 100).toFixed(1)
                    : '0'}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-success to-success/60 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{
                    width: `${pnl.wins + pnl.losses > 0
                      ? (pnl.wins / (pnl.wins + pnl.losses)) * 100
                      : 0}%`,
                  }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Footer */}
            <p className="font-mono text-[9px] text-white/20 text-center">
              Session data resets on disconnect
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
    </>
  );
}

function StatBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
      <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider block mb-1">
        {label}
      </span>
      <span className={`font-display text-lg tracking-wider ${color}`}>
        {value}
      </span>
    </div>
  );
}
