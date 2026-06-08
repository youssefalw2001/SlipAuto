import { motion } from 'framer-motion';
import BigNumber from 'bignumber.js';
import type { Crate, CrateRarity } from '../types';
import { CRATE_COLORS } from '../constants';

// ─── Mock Crate Data ──────────────────────────────────────────────────────────
const MOCK_CRATES: Crate[] = [
  {
    id: 'crate-common',
    name: 'DUST CRATE',
    rarity: 'common',
    price: new BigNumber(0.05),
    description: 'Basic loot. Nothing fancy.',
    items: [
      { id: '1', name: 'SOL Dust', rarity: 'common', odds: 0.6, value: new BigNumber(0.01), icon: '💨' },
      { id: '2', name: 'Lucky Coin', rarity: 'common', odds: 0.3, value: new BigNumber(0.03), icon: '🪙' },
      { id: '3', name: 'Rare Shard', rarity: 'rare', odds: 0.1, value: new BigNumber(0.1), icon: '💎' },
    ],
  },
  {
    id: 'crate-rare',
    name: 'HUNTER CRATE',
    rarity: 'rare',
    price: new BigNumber(0.25),
    description: 'Better odds. Better loot.',
    items: [
      { id: '4', name: 'SOL Fragment', rarity: 'common', odds: 0.4, value: new BigNumber(0.05), icon: '✨' },
      { id: '5', name: 'Wolf Token', rarity: 'rare', odds: 0.4, value: new BigNumber(0.2), icon: '🐺' },
      { id: '6', name: 'Epic Gem', rarity: 'epic', odds: 0.2, value: new BigNumber(0.5), icon: '💜' },
    ],
  },
  {
    id: 'crate-epic',
    name: 'PREDATOR CRATE',
    rarity: 'epic',
    price: new BigNumber(1.0),
    description: 'High risk. High reward.',
    items: [
      { id: '7', name: 'Void Crystal', rarity: 'rare', odds: 0.3, value: new BigNumber(0.3), icon: '🔮' },
      { id: '8', name: 'Shadow Fang', rarity: 'epic', odds: 0.5, value: new BigNumber(1.2), icon: '🦷' },
      { id: '9', name: 'Dragon Scale', rarity: 'legendary', odds: 0.2, value: new BigNumber(3), icon: '🐉' },
    ],
  },
  {
    id: 'crate-legendary',
    name: 'KING\'S VAULT',
    rarity: 'legendary',
    price: new BigNumber(5.0),
    description: 'Only legends open this.',
    items: [
      { id: '10', name: 'Phoenix Feather', rarity: 'epic', odds: 0.3, value: new BigNumber(2), icon: '🔥' },
      { id: '11', name: 'Crown Shard', rarity: 'legendary', odds: 0.5, value: new BigNumber(8), icon: '👑' },
      { id: '12', name: 'Infinity Sol', rarity: 'legendary', odds: 0.2, value: new BigNumber(25), icon: '♾️' },
    ],
  },
];

function CrateCard({ crate }: { crate: Crate }) {
  const colors = CRATE_COLORS[crate.rarity];

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.08]
        ${colors.glow}
        group cursor-pointer
      `}
    >
      {/* God Ray Effect for Legendary */}
      {crate.rarity === 'legendary' && <GodRayEffect />}

      {/* Rarity Badge */}
      <div className="flex items-center justify-between mb-4">
        <RarityBadge rarity={crate.rarity} />
        <span className="font-mono text-[10px] text-white/30 uppercase">
          {crate.items.length} items
        </span>
      </div>

      {/* Crate Icon / 3D Effect */}
      <div className="relative flex items-center justify-center py-8 mb-4">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`
            w-24 h-24 rounded-xl flex items-center justify-center text-5xl
            bg-gradient-to-br ${colors.bg}
            border ${colors.border}
            shadow-lg
          `}
          style={{
            transform: 'perspective(400px) rotateX(5deg) rotateY(-5deg)',
          }}
        >
          {crate.rarity === 'legendary' ? '👑' : crate.rarity === 'epic' ? '💀' : crate.rarity === 'rare' ? '🎯' : '📦'}
        </motion.div>

        {/* Glow behind crate */}
        <div
          className="absolute inset-0 opacity-30 blur-2xl rounded-full"
          style={{
            background: `radial-gradient(circle, ${
              crate.rarity === 'legendary' ? '#ff4d00' :
              crate.rarity === 'epic' ? '#7000ff' :
              crate.rarity === 'rare' ? '#00e5ff' : '#666'
            }40 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Name & Description */}
      <h3 className="font-display text-xl tracking-wider text-white mb-1">
        {crate.name}
      </h3>
      <p className="font-body text-xs text-white/40 mb-4">
        {crate.description}
      </p>

      {/* Odds Table */}
      <div className="mb-4 rounded-lg overflow-hidden">
        {crate.items.map((item, i) => (
          <div
            key={item.id}
            className={`
              flex items-center justify-between px-3 py-2 text-xs
              ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.04]'}
            `}
          >
            <span className="flex items-center gap-2">
              <span>{item.icon}</span>
              <span className="font-mono text-white/70">{item.name}</span>
            </span>
            <span className="font-mono text-white/40">
              {(item.odds * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      {/* Price & Open Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`
          w-full py-3 rounded-xl font-display text-lg tracking-wider
          transition-all duration-200
          ${crate.rarity === 'legendary'
            ? 'bg-primary text-white shadow-neon-orange'
            : crate.rarity === 'epic'
            ? 'bg-accent/20 text-accent border border-accent/40'
            : crate.rarity === 'rare'
            ? 'bg-secondary/10 text-secondary border border-secondary/30'
            : 'bg-white/5 text-white/60 border border-white/10'
          }
        `}
      >
        OPEN — {crate.price.toFixed(2)} SOL
      </motion.button>
    </motion.div>
  );
}

function RarityBadge({ rarity }: { rarity: CrateRarity }) {
  const styles: Record<CrateRarity, string> = {
    common: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
    rare: 'text-secondary bg-secondary/10 border-secondary/30',
    epic: 'text-accent bg-accent/10 border-accent/30',
    legendary: 'text-primary bg-primary/10 border-primary/30',
  };

  return (
    <span className={`text-[9px] font-display tracking-[0.2em] px-2 py-0.5 rounded-sm border ${styles[rarity]}`}>
      {rarity.toUpperCase()}
    </span>
  );
}

function GodRayEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      <div
        className="absolute inset-[-50%] animate-god-ray opacity-10"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, #ff4d00 10%, transparent 20%, transparent 40%, #ffd700 50%, transparent 60%, transparent 80%, #ff4d00 90%, transparent 100%)',
        }}
      />
    </div>
  );
}

export function CrateShop() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wider">
          CRATE <span className="text-gradient-cyber">SHOP</span>
        </h2>
        <p className="font-mono text-xs text-white/40 mt-1">
          Gamble your SOL for legendary items
        </p>
      </div>

      {/* Crate Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_CRATES.map((crate, i) => (
          <motion.div
            key={crate.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
          >
            <CrateCard crate={crate} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
