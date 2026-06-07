import { motion } from 'framer-motion';
import type { ArenaWallet } from '../types';
import { TIER_CONFIG, PREDATOR_ICONS, ANIMATION } from '../constants';
import { shortenAddress, formatSol } from '../utils';
import { FlameParticles } from './FlameParticles';

interface WalletCardProps {
  wallet: ArenaWallet;
  onYoink?: (walletId: string) => void;
  index: number;
}

export function WalletCard({ wallet, onYoink, index }: WalletCardProps) {
  const config = TIER_CONFIG[wallet.tier];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: ANIMATION.cardHoverScale }}
      className={`
        relative group cursor-pointer rounded-xl p-4
        bg-white/[0.03] backdrop-blur-sm
        border ${config.borderClass} ${config.opacity}
        transition-shadow duration-300
        ${wallet.tier === 'KING' ? 'shadow-neon-orange' : ''}
        ${wallet.tier === 'PREDATOR' ? 'shadow-neon-violet' : ''}
        ${wallet.tier === 'COMMON' ? 'hover:shadow-neon-green' : ''}
      `}
    >
      {/* KING: Flame Particles */}
      {wallet.tier === 'KING' && <FlameParticles />}

      {/* PREDATOR: Dual-border glow ring */}
      {wallet.tier === 'PREDATOR' && (
        <div className="absolute inset-0 rounded-xl border border-secondary/30 animate-glow-predator pointer-events-none" />
      )}

      {/* KING: Bounty Crown */}
      {wallet.tier === 'KING' && (
        <div className="absolute -top-2 -right-2 z-10">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-2xl filter drop-shadow-lg"
          >
            <div className="relative">
              <span className="text-king-gold text-2xl">👑</span>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-display text-primary tracking-wider">
                BOUNTY
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* PREDATOR: Floating animal icon */}
      {wallet.tier === 'PREDATOR' && wallet.predatorIcon && (
        <div className="absolute top-2 right-2 opacity-20 text-3xl animate-float pointer-events-none">
          {PREDATOR_ICONS[wallet.predatorIcon]}
        </div>
      )}

      {/* Card Content */}
      <div className="relative z-10 flex flex-col gap-3">
        {/* Header: Name + Tier Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Avatar Placeholder */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: `linear-gradient(135deg, ${config.color}40, ${config.color}10)`,
                border: `1px solid ${config.color}60`,
              }}
            >
              {wallet.displayName.charAt(0)}
            </div>
            <div>
              <p className="font-body text-sm font-medium text-white/90 truncate max-w-[100px]">
                {wallet.displayName}
              </p>
              <p className="font-mono text-[10px] text-white/40">
                {shortenAddress(wallet.address)}
              </p>
            </div>
          </div>

          {/* Tier Badge */}
          <span
            className="text-[9px] font-display tracking-[0.2em] px-2 py-0.5 rounded-sm uppercase"
            style={{
              background: `${config.color}20`,
              color: config.color,
              border: `1px solid ${config.color}40`,
            }}
          >
            {config.label}
          </span>
        </div>

        {/* SOL Balance */}
        <div className="flex items-baseline justify-between">
          <span className="font-display text-2xl tracking-wide" style={{ color: config.color }}>
            {formatSol(wallet.balanceSol, 3)}
          </span>
          <span className="text-xs text-white/40 font-mono">SOL</span>
        </div>

        {/* Streak & Stats */}
        <div className="flex items-center justify-between text-[10px] text-white/30 font-mono">
          <span>
            🔥 {wallet.streak} streak
          </span>
          {wallet.tier === 'KING' && (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-primary font-display tracking-wider"
            >
              HIGH VALUE
            </motion.span>
          )}
        </div>

        {/* Yoink Button */}
        {onYoink && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onYoink(wallet.id)}
            className={`
              w-full mt-1 py-2 rounded-lg font-display text-sm tracking-wider
              transition-all duration-200
              ${wallet.tier === 'KING'
                ? 'bg-primary text-white shadow-neon-orange hover:brightness-125'
                : wallet.tier === 'PREDATOR'
                ? 'bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30'
                : wallet.tier === 'COMMON'
                ? 'bg-success/10 text-success border border-success/30 hover:bg-success/20'
                : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
              }
            `}
          >
            {wallet.tier === 'KING' ? '⚡ YOINK' : wallet.tier === 'DUST' ? 'PASS' : 'YOINK'}
          </motion.button>
        )}
      </div>

      {/* Hover Glow Intensifier */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 30px ${config.color}15, 0 0 20px ${config.color}10`,
        }}
      />
    </motion.div>
  );
}
