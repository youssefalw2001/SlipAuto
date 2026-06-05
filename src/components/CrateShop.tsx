import NumberFlow from "@number-flow/react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Lock, Package, Sparkles, X, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CRATE_TIERS, CrateReward, CrateTier, getLevelById, getXPProgress, spinCrate, XP_REWARDS } from "../lib/levels";

interface Props {
  xp: number;
  levelId: number;
  onXPGain: (xp: number) => void;
}

interface OpenResult {
  reward: CrateReward;
  crate: CrateTier;
}

function fireJackpot() {
  const opts = { startVelocity: 40, spread: 360, ticks: 100, zIndex: 9999 };
  confetti({ ...opts, particleCount: 120, origin: { x: 0.3, y: 0.35 }, colors: ['#ff4d00','#ffd200','#00e87a','#ffffff'] });
  confetti({ ...opts, particleCount: 100, origin: { x: 0.7, y: 0.35 }, colors: ['#7000ff','#ff0066','#00e5ff','#ffd200'] });
  confetti({ ...opts, particleCount: 80,  origin: { x: 0.5, y: 0.5  }, colors: ['#ff4d00','#ffd200','#ffffff'] });
}

function CrateCard({
  crate, userLevel, dailyOpened, onOpen, opening,
}: {
  crate: CrateTier;
  userLevel: number;
  dailyOpened: Record<string, number>;
  onOpen: (crate: CrateTier) => void;
  opening: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const locked = userLevel < crate.minLevel;
  const opened = dailyOpened[crate.id] ?? 0;
  const atLimit = opened >= crate.dailyLimit;
  const isOpening = opening === crate.id;

  const solRewards = crate.rewards.filter(r => r.type === "sol");
  const maxWin = Math.max(...solRewards.map(r => r.value as number));

  return (
    <motion.div
      whileHover={!locked ? { y: -4 } : {}}
      className="relative rounded-2xl overflow-hidden border transition-all duration-200"
      style={{
        background: locked ? 'rgba(255,255,255,0.02)' : crate.bgGradient,
        borderColor: locked ? 'rgba(255,255,255,0.06)' : `${crate.color}30`,
        borderTop: `1px solid ${locked ? 'rgba(255,255,255,0.06)' : crate.color + '60'}`,
        opacity: locked ? 0.6 : 1,
        boxShadow: locked ? 'none' : `0 4px 32px ${crate.glowColor}`,
      }}
    >
      {/* Top bar */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {locked
                ? <Lock className="w-4 h-4" style={{ color: '#6060a0' }} />
                : <Package className="w-4 h-4" style={{ color: crate.color }} />
              }
              <span className="text-[11px] font-mono tracking-[0.14em] font-bold"
                style={{ color: locked ? '#6060a0' : crate.color }}>
                {crate.name}
              </span>
              {crate.id === "legendary" && !locked && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(255,77,0,0.15)', color: '#ff4d00', border: '1px solid rgba(255,77,0,0.3)' }}>
                  BEST VALUE
                </span>
              )}
            </div>
            <div className="font-display text-[36px] leading-none" style={{ color: locked ? '#6060a0' : 'white' }}>
              {crate.price}
            </div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: '#6060a0' }}>SOL per crate</div>
          </div>

          {/* Crate visual */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl" style={{ background: `${crate.color}15`, border: `1px solid ${crate.color}30` }} />
            {locked
              ? <Lock className="w-7 h-7" style={{ color: '#6060a0' }} />
              : (
                <motion.div animate={isOpening ? { rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.15, 0.95, 1.1, 1] } : {}}
                  transition={{ duration: 0.6 }}>
                  <Gift className="w-8 h-8" style={{ color: crate.color }} />
                </motion.div>
              )
            }
            {!locked && (
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-xl"
                style={{ background: `radial-gradient(circle, ${crate.color}20, transparent)` }}
              />
            )}
          </div>
        </div>

        {/* Max win */}
        {!locked && (
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3 h-3" style={{ color: '#ffd200' }} />
            <span className="text-[11px]" style={{ color: '#6060a0' }}>
              Max win: <span className="font-mono font-bold" style={{ color: '#ffd200' }}>+{maxWin} SOL</span>
            </span>
          </div>
        )}

        {/* Locked message */}
        {locked && (
          <div className="text-[12px] mb-3" style={{ color: '#6060a0' }}>
            Reach <span className="font-bold" style={{ color: getLevelById(crate.minLevel).badgeColor }}>
              {getLevelById(crate.minLevel).name}
            </span> to unlock
          </div>
        )}

        {/* Daily limit */}
        {!locked && (
          <div className="flex items-center justify-between text-[11px] mb-3">
            <span style={{ color: '#6060a0' }}>Daily opens</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: crate.dailyLimit }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full transition-colors"
                  style={{ background: i < opened ? crate.color : 'rgba(255,255,255,0.1)' }} />
              ))}
              <span className="font-mono ml-1" style={{ color: atLimit ? '#ff7040' : '#6060a0' }}>
                {opened}/{crate.dailyLimit}
              </span>
            </div>
          </div>
        )}

        {/* Open button */}
        <motion.button
          whileHover={!locked && !atLimit ? { scale: 1.02 } : {}}
          whileTap={!locked && !atLimit ? { scale: 0.97 } : {}}
          onClick={() => !locked && !atLimit && onOpen(crate)}
          disabled={locked || atLimit || isOpening}
          className="w-full py-3 rounded-xl font-display text-[16px] tracking-[0.06em] border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: locked || atLimit ? 'rgba(255,255,255,0.04)' : `linear-gradient(135deg, ${crate.color}, ${crate.color}cc)`,
            borderColor: locked || atLimit ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: locked || atLimit ? '#6060a0' : 'white',
            boxShadow: !locked && !atLimit ? `0 4px 20px ${crate.glowColor}` : 'none',
          }}
        >
          {isOpening ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              OPENING...
            </span>
          ) : atLimit ? "DAILY LIMIT REACHED" : locked ? "LOCKED" : `OPEN — ${crate.price} SOL`}
        </motion.button>
      </div>

      {/* Rewards accordion */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-5 py-2.5 flex items-center justify-between text-[11px] font-mono hover:bg-white/2 transition-colors"
          style={{ color: '#6060a0' }}
        >
          <span>VIEW ODDS</span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>▼</motion.span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 space-y-1.5">
                {crate.rewards.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      {r.rare && <Sparkles className="w-3 h-3" style={{ color: '#ffd200' }} />}
                      <span style={{ color: r.rare ? '#ffd200' : r.color }}>{r.label}</span>
                    </div>
                    <span className="font-mono" style={{ color: '#6060a0' }}>{r.chance}%</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 text-[10px]" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#30304a' }}>
                  All odds are provably fair and verified on-chain.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ResultModal({ result, onClose }: { result: OpenResult; onClose: () => void }) {
  const isJackpot = result.reward.type === "sol" && (result.reward.value as number) >= 1.0;
  const isSol = result.reward.type === "sol";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(3,3,8,0.92)', backdropFilter: 'blur(20px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.7, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="w-full max-w-sm relative rounded-2xl overflow-hidden"
        style={{
          background: '#0c0c1a',
          border: `1px solid ${result.crate.color}40`,
          borderTop: `1px solid ${result.crate.color}`,
          boxShadow: `0 0 60px ${result.crate.glowColor}`,
        }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/8 transition-colors" style={{ color: '#6060a0' }}>
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 text-center">
          {/* Crate name */}
          <p className="text-[10px] font-mono tracking-[0.14em] mb-4" style={{ color: result.crate.color }}>
            {result.crate.name} CRATE
          </p>

          {/* Reward icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
            className="w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{
              background: `${result.reward.color}18`,
              border: `2px solid ${result.reward.color}40`,
              boxShadow: `0 0 40px ${result.reward.color}30`,
            }}
          >
            {result.reward.type === "xp" && <Zap className="w-12 h-12" style={{ color: result.reward.color }} />}
            {result.reward.type === "sol" && <span className="font-display text-[40px]" style={{ color: result.reward.color }}>◎</span>}
            {result.reward.type === "cosmetic" && <Sparkles className="w-12 h-12" style={{ color: result.reward.color }} />}
            {result.reward.type === "boost" && <span className="text-[40px]">⚡</span>}
          </motion.div>

          {/* Reward label */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            {isJackpot && (
              <p className="font-mono text-[11px] tracking-[0.14em] mb-2 text-[#ffd200]">🎉 JACKPOT!</p>
            )}
            <p className="font-display text-[36px] leading-none text-white tracking-[0.04em] mb-1">
              {result.reward.label}
            </p>
            {isSol && (
              <p className="text-[13px] font-mono" style={{ color: result.reward.color }}>
                ≈ ${((result.reward.value as number) * 148).toFixed(0)} USD
              </p>
            )}
            {result.reward.type === "xp" && (
              <p className="text-[13px]" style={{ color: '#6060a0' }}>Added to your XP balance</p>
            )}
            {result.reward.type === "boost" && (
              <p className="text-[13px]" style={{ color: '#6060a0' }}>Boost applied to your account</p>
            )}
          </motion.div>

          {/* XP gained */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 px-3 py-2 rounded-xl text-[11px] font-mono inline-flex items-center gap-2"
            style={{ background: 'rgba(255,210,0,0.08)', border: '1px solid rgba(255,210,0,0.15)', color: '#ffd200' }}
          >
            <Zap className="w-3 h-3" />
            +{XP_REWARDS.OPEN_CRATE} XP earned for opening
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="btn-yoink w-full mt-6"
            style={{ background: `linear-gradient(135deg, ${result.crate.color}, ${result.crate.color}cc)`, boxShadow: `0 4px 24px ${result.crate.glowColor}` }}
          >
            Collect Reward
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CrateShop({ xp, levelId, onXPGain }: Props) {
  const [dailyOpened, setDailyOpened] = useState<Record<string, number>>({});
  const [opening, setOpening] = useState<string | null>(null);
  const [result, setResult] = useState<OpenResult | null>(null);
  const { current: level, next, progressPct, xpIntoLevel, xpNeeded } = getXPProgress(xp);

  const handleOpen = (crate: CrateTier) => {
    setOpening(crate.id);
    setTimeout(() => {
      const reward = spinCrate(crate);
      setDailyOpened(prev => ({ ...prev, [crate.id]: (prev[crate.id] ?? 0) + 1 }));
      onXPGain(XP_REWARDS.OPEN_CRATE);
      if (reward.type === "xp") onXPGain(reward.value as number);

      const isJackpot = reward.type === "sol" && (reward.value as number) >= 1.0;
      if (isJackpot) {
        setTimeout(fireJackpot, 300);
        toast.success(`JACKPOT! You won ${reward.label}!`, { duration: 6000 });
      } else if (reward.type === "sol") {
        toast.success(`Won ${reward.label} from ${crate.name} crate!`);
      } else {
        toast(`Got ${reward.label} from ${crate.name} crate!`);
      }

      setResult({ reward, crate });
      setOpening(null);
    }, 1400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-hero">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h1 className="font-display text-[52px] leading-none text-white tracking-[0.06em] mb-1">CRATE SHOP</h1>
            <p className="text-[13px]" style={{ color: '#6060a0' }}>Open crates to win SOL, XP boosts and exclusive cosmetics</p>
          </div>

          {/* Level + XP bar */}
          <div className="w-full sm:w-72">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-lg font-display text-[14px] tracking-[0.06em]"
                  style={{ background: level.badgeBg, color: level.badgeColor, border: `1px solid ${level.badgeColor}30` }}>
                  {level.name}
                </div>
                <span className="text-[11px] font-mono" style={{ color: '#6060a0' }}>Level {level.id}</span>
              </div>
              {next && (
                <span className="text-[11px] font-mono" style={{ color: '#6060a0' }}>
                  {xpIntoLevel} / {xpNeeded} XP
                </span>
              )}
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${level.badgeColor}, ${level.badgeColor}aa)` }}
              />
            </div>
            {next ? (
              <p className="text-[10px] font-mono mt-1.5" style={{ color: '#6060a0' }}>
                Next: <span style={{ color: next.badgeColor }}>{next.name}</span> — unlocks {next.maxEntrySOL === Infinity ? "unlimited" : next.maxEntrySOL + " SOL"} entry
              </p>
            ) : (
              <p className="text-[10px] font-mono mt-1.5" style={{ color: '#ff4d00' }}>MAX LEVEL REACHED 👑</p>
            )}
          </div>
        </div>
      </div>

      {/* Daily limit notice */}
      <div className="card-sm flex items-start gap-3" style={{ background: 'rgba(0,229,255,0.03)', borderColor: 'rgba(0,229,255,0.10)' }}>
        <Gift className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#40d8f0' }} />
        <div>
          <p className="text-[12px] font-semibold text-white">Daily limit: 5 opens per crate tier</p>
          <p className="text-[11px] mt-0.5" style={{ color: '#6060a0' }}>
            Limits reset at midnight UTC. All odds are shown openly — provably fair on Solana.
            Higher level crates require reaching that level first.
          </p>
        </div>
      </div>

      {/* Crate grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CRATE_TIERS.map(crate => (
          <CrateCard
            key={crate.id}
            crate={crate}
            userLevel={levelId}
            dailyOpened={dailyOpened}
            onOpen={handleOpen}
            opening={opening}
          />
        ))}
      </div>

      {/* How crates work */}
      <div className="card-flat space-y-4">
        <h3 className="font-display text-[22px] text-white tracking-[0.06em]">HOW CRATES WORK</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { n:"01", t:"Buy a Crate", d:"Pay SOL to open a crate. Every crate contains a random reward — XP, SOL, or a gameplay boost.", c:"#ff4d00" },
            { n:"02", t:"See All Odds", d:"Every reward's % chance is shown before you buy. No hidden odds. Provably fair results verified on-chain.", c:"#a060ff" },
            { n:"03", t:"Win SOL Back", d:"Every tier has real SOL rewards. Hit the jackpot and win back 10x what you paid. Limits keep it fair.", c:"#00d470" },
          ].map(s => (
            <div key={s.n} className="card-sm">
              <div className="text-[10px] font-mono tracking-[0.1em] mb-1.5" style={{ color: '#30304a' }}>{s.n}</div>
              <p className="text-[13px] font-bold text-white mb-1">{s.t}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: '#6060a0' }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Result modal */}
      <AnimatePresence>
        {result && <ResultModal result={result} onClose={() => setResult(null)} />}
      </AnimatePresence>
    </div>
  );
}
