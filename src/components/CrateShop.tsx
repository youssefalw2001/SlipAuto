import NumberFlow from "@number-flow/react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Lock, Shield, Sparkles, X, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CRATE_TIERS, CrateReward, CrateTier,
  getLevelById, getXPProgress, spinCrate, XP_REWARDS
} from "../lib/levels";

interface Props { xp: number; levelId: number; onXPGain: (xp: number) => void; }
interface OpenResult { reward: CrateReward; crate: CrateTier; }

/* ── Jackpot confetti ── */
function fireJackpot() {
  const o = { startVelocity: 40, spread: 360, ticks: 100, zIndex: 9999 };
  confetti({ ...o, particleCount: 120, origin: { x: 0.3, y: 0.35 }, colors: ['#ff4d00','#ffd200','#00e87a','#fff'] });
  confetti({ ...o, particleCount: 100, origin: { x: 0.7, y: 0.35 }, colors: ['#7000ff','#ff0066','#00e5ff','#ffd200'] });
  confetti({ ...o, particleCount: 80,  origin: { x: 0.5, y: 0.5  }, colors: ['#ff4d00','#ffd200','#fff'] });
}

/* ── SVG crate icons per tier ── */
function CrateIcon({ color, size = 64, pulse = false }: { color: string; size?: number; pulse?: boolean }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {pulse && (
        <motion.div
          animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-2xl"
          style={{ background: `radial-gradient(circle, ${color}50, transparent)` }}
        />
      )}
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        {/* Box body */}
        <rect x="8" y="22" width="48" height="36" rx="5"
          fill={`${color}18`} stroke={color} strokeWidth="1.5" />
        {/* Box lid */}
        <rect x="5" y="16" width="54" height="10" rx="4"
          fill={`${color}28`} stroke={color} strokeWidth="1.5" />
        {/* Ribbon vertical */}
        <rect x="29" y="16" width="6" height="42" rx="1"
          fill={color} opacity="0.7" />
        {/* Ribbon horizontal */}
        <rect x="5" y="19" width="54" height="4" rx="1"
          fill={color} opacity="0.7" />
        {/* Bow left */}
        <path d="M32 16 C28 8 18 8 20 14 C22 18 30 17 32 16Z"
          fill={color} opacity="0.9" />
        {/* Bow right */}
        <path d="M32 16 C36 8 46 8 44 14 C42 18 34 17 32 16Z"
          fill={color} opacity="0.9" />
        {/* Shine */}
        <rect x="12" y="26" width="6" height="24" rx="3"
          fill="white" opacity="0.07" />
      </svg>
    </div>
  );
}

/* ── Individual crate card ── */
function CrateCard({
  crate, userLevel, dailyOpened, onOpen, opening,
}: {
  crate: CrateTier;
  userLevel: number;
  dailyOpened: Record<string, number>;
  onOpen: (c: CrateTier) => void;
  opening: string | null;
}) {
  const [showOdds, setShowOdds] = useState(false);
  const locked    = userLevel < crate.minLevel;
  const opened    = dailyOpened[crate.id] ?? 0;
  const atLimit   = opened >= crate.dailyLimit;
  const isOpening = opening === crate.id;
  const solRewards = crate.rewards.filter(r => r.type === "sol");
  const maxWin     = Math.max(...solRewards.map(r => r.value as number));
  const reqLevel   = getLevelById(crate.minLevel);

  /* Shimmer animation when not locked */
  const shimmerStyle = !locked ? {
    backgroundImage: `linear-gradient(105deg, transparent 40%, ${crate.color}15 50%, transparent 60%)`,
    backgroundSize: '200% 100%',
  } : {};

  return (
    <motion.div
      whileHover={!locked ? { y: -6, scale: 1.015 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: locked
          ? '#0c0c1a'
          : `linear-gradient(160deg, ${crate.color}0d 0%, #0c0c1a 50%, ${crate.color}06 100%)`,
        border: `1px solid ${locked ? 'rgba(255,255,255,0.06)' : crate.color + '35'}`,
        borderTop: `2px solid ${locked ? 'rgba(255,255,255,0.06)' : crate.color}`,
        boxShadow: locked ? 'none' : `0 8px 40px ${crate.glowColor}, 0 2px 0 ${crate.color}20 inset`,
        opacity: locked ? 0.55 : 1,
      }}
    >
      {/* Shimmer sweep on hover */}
      {!locked && (
        <motion.div
          initial={{ x: '-100%' }}
          whileHover={{ x: '200%' }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(105deg, transparent, ${crate.color}18, transparent)`,
          }}
        />
      )}

      {/* ── Top section ── */}
      <div className="relative p-5 flex-1">

        {/* Tier name + badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {locked
              ? <Lock className="w-3.5 h-3.5" style={{ color: '#6060a0' }} />
              : <div className="w-1.5 h-1.5 rounded-full blink" style={{ background: crate.color }} />
            }
            <span className="font-mono text-[11px] font-bold tracking-[0.14em]"
              style={{ color: locked ? '#6060a0' : crate.color }}>
              {crate.name}
            </span>
          </div>
          {crate.id === "legendary" && !locked && (
            <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${crate.color}20`, color: crate.color, border: `1px solid ${crate.color}40` }}>
              BEST VALUE
            </span>
          )}
        </div>

        {/* Crate icon + price side by side */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <CrateIcon color={locked ? '#40406a' : crate.color} size={60} pulse={!locked && !isOpening} />
            {isOpening && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-2xl border-2 border-t-transparent"
                style={{ borderColor: `${crate.color}60`, borderTopColor: 'transparent' }}
              />
            )}
          </div>
          <div>
            <div className="font-display leading-none mb-0.5"
              style={{ fontSize: 40, color: locked ? '#40406a' : 'white' }}>
              {crate.price}
            </div>
            <div className="text-[11px] font-mono" style={{ color: '#6060a0' }}>SOL per open</div>
            {!locked && (
              <div className="flex items-center gap-1 mt-1.5">
                <Sparkles className="w-3 h-3" style={{ color: '#ffd200' }} />
                <span className="text-[10px] font-mono" style={{ color: '#ffd200' }}>
                  max +{maxWin} SOL
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Locked message */}
        {locked && (
          <div className="rounded-xl px-3 py-2 mb-4 text-[11px] text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            Reach <span className="font-bold" style={{ color: reqLevel.badgeColor }}>{reqLevel.name}</span> to unlock
          </div>
        )}

        {/* Daily dots */}
        {!locked && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono" style={{ color: '#6060a0' }}>Daily opens</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: crate.dailyLimit }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    background: i < opened ? crate.color : 'rgba(255,255,255,0.08)',
                    scale: i < opened ? [1, 1.3, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-2 h-2 rounded-full"
                />
              ))}
              <span className="font-mono text-[10px] ml-1"
                style={{ color: atLimit ? '#ff7040' : '#6060a0' }}>
                {opened}/{crate.dailyLimit}
              </span>
            </div>
          </div>
        )}

        {/* Open button */}
        <motion.button
          whileHover={!locked && !atLimit ? { scale: 1.03 } : {}}
          whileTap={!locked && !atLimit ? { scale: 0.96 } : {}}
          onClick={() => !locked && !atLimit && !isOpening && onOpen(crate)}
          disabled={locked || atLimit || isOpening}
          className="w-full py-3.5 rounded-xl font-display tracking-[0.1em] transition-all disabled:cursor-not-allowed"
          style={{
            fontSize: 17,
            background: locked || atLimit
              ? 'rgba(255,255,255,0.04)'
              : `linear-gradient(135deg, ${crate.color} 0%, ${crate.color}cc 100%)`,
            color: locked || atLimit ? '#40406a' : 'white',
            boxShadow: !locked && !atLimit ? `0 4px 24px ${crate.glowColor}, inset 0 1px 0 rgba(255,255,255,0.15)` : 'none',
            border: locked || atLimit ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}
        >
          {isOpening ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              OPENING...
            </span>
          ) : atLimit ? (
            "LIMIT REACHED"
          ) : locked ? (
            "LOCKED"
          ) : (
            `OPEN — ${crate.price} SOL`
          )}
        </motion.button>
      </div>

      {/* ── Odds accordion ── */}
      <div style={{ borderTop: `1px solid ${locked ? 'rgba(255,255,255,0.04)' : crate.color + '20'}` }}>
        <button
          onClick={() => setShowOdds(!showOdds)}
          className="w-full flex items-center justify-between px-5 py-3 text-[10px] font-mono uppercase tracking-[0.1em] transition-colors hover:bg-white/2"
          style={{ color: locked ? '#30304a' : '#6060a0' }}
        >
          <span>View odds</span>
          <motion.div animate={{ rotate: showOdds ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showOdds && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 space-y-2">
                {crate.rewards.map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {r.rare && <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: '#ffd200' }} />}
                      <span className="text-[11px]" style={{ color: r.rare ? '#ffd200' : r.color }}>
                        {r.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Mini probability bar */}
                      <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${r.chance}%`, background: r.rare ? '#ffd200' : r.color }} />
                      </div>
                      <span className="text-[10px] font-mono w-8 text-right" style={{ color: '#6060a0' }}>
                        {r.chance}%
                      </span>
                    </div>
                  </div>
                ))}
                <p className="text-[9px] font-mono pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#30304a' }}>
                  Provably fair · verified on-chain
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Result reveal modal ── */
function ResultModal({ result, onClose }: { result: OpenResult; onClose: () => void }) {
  const isSol     = result.reward.type === "sol";
  const isJackpot = isSol && (result.reward.value as number) >= 1.0;
  const isBoost   = result.reward.type === "boost";
  const isXP      = result.reward.type === "xp";

  const rewardIcon = () => {
    if (isSol) return (
      <div className="font-display text-[52px] leading-none" style={{ color: result.reward.color }}>◎</div>
    );
    if (isXP) return <Zap className="w-14 h-14" style={{ color: result.reward.color }} />;
    if (isBoost) return <Zap className="w-14 h-14" style={{ color: result.reward.color }} />;
    return <Sparkles className="w-14 h-14" style={{ color: result.reward.color }} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(3,3,8,0.94)', backdropFilter: 'blur(24px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.75, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden relative"
        style={{
          background: `linear-gradient(160deg, ${result.crate.color}12 0%, #0c0c1a 50%)`,
          border: `1px solid ${result.crate.color}40`,
          borderTop: `2px solid ${result.crate.color}`,
          boxShadow: `0 0 80px ${result.crate.glowColor}, 0 0 120px ${result.crate.glowColor}`,
        }}
      >
        {/* Rainbow top line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${result.crate.color}, #ffd200, ${result.crate.color}, transparent)` }} />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-white/8 transition-colors"
          style={{ color: '#6060a0' }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 text-center">
          {/* Crate label */}
          <p className="text-[10px] font-mono tracking-[0.16em] mb-5"
            style={{ color: result.crate.color }}>
            {result.crate.name} CRATE OPENED
          </p>

          {/* Animated reward icon */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 18 }}
            className="w-28 h-28 rounded-3xl mx-auto mb-6 flex items-center justify-center relative"
            style={{
              background: `radial-gradient(circle, ${result.reward.color}20 0%, ${result.reward.color}06 100%)`,
              border: `2px solid ${result.reward.color}40`,
              boxShadow: `0 0 50px ${result.reward.color}30`,
            }}
          >
            {/* Pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl border"
              style={{ borderColor: result.reward.color }}
            />
            {rewardIcon()}
          </motion.div>

          {/* Jackpot label */}
          {isJackpot && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="font-display text-[14px] tracking-[0.1em] mb-2"
              style={{ color: '#ffd200' }}
            >
              JACKPOT
            </motion.div>
          )}

          {/* Reward name */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="font-display text-[34px] leading-none text-white tracking-[0.04em] mb-2"
          >
            {result.reward.label}
          </motion.p>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
            className="text-[12px] font-mono"
            style={{ color: '#6060a0' }}
          >
            {isSol    ? `≈ $${((result.reward.value as number) * 148).toFixed(0)} USD`  : ""}
            {isXP     ? "Added to your XP balance"   : ""}
            {isBoost  ? "Boost applied to your account" : ""}
            {result.reward.type === "cosmetic" ? "Added to your collection" : ""}
          </motion.p>

          {/* XP earned */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-[11px] font-mono"
            style={{ background: 'rgba(255,210,0,0.08)', border: '1px solid rgba(255,210,0,0.2)', color: '#ffd200' }}
          >
            <Zap className="w-3 h-3" />
            +{XP_REWARDS.OPEN_CRATE} XP earned
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="btn-yoink w-full mt-6"
            style={{
              background: `linear-gradient(135deg, ${result.crate.color}, ${result.crate.color}cc)`,
              boxShadow: `0 4px 28px ${result.crate.glowColor}`,
            }}
          >
            Collect Reward
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main CrateShop page ── */
export default function CrateShop({ xp, levelId, onXPGain }: Props) {
  const [dailyOpened, setDailyOpened] = useState<Record<string, number>>({});
  const [opening, setOpening]         = useState<string | null>(null);
  const [result, setResult]           = useState<OpenResult | null>(null);
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
        toast.success(`JACKPOT! ${reward.label}!`, { duration: 6000 });
      } else if (reward.type === "sol") {
        toast.success(`Won ${reward.label} from ${crate.name} crate!`);
      } else {
        toast(`${reward.label} from ${crate.name} crate`);
      }

      setResult({ reward, crate });
      setOpening(null);
    }, 1400);
  };

  return (
    <div className="space-y-7">

      {/* ── Hero ── */}
      <div className="card-hero">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="font-display text-[52px] leading-none text-white tracking-[0.06em] mb-1">
              CRATE SHOP
            </h1>
            <p className="text-[13px]" style={{ color: '#6060a0' }}>
              Open crates to win SOL, XP boosts and exclusive cosmetics
            </p>
          </div>

          {/* Level + XP bar */}
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="px-3 py-1.5 rounded-lg font-display text-[14px] tracking-[0.06em]"
                  style={{ background: level.badgeBg, color: level.badgeColor, border: `1px solid ${level.badgeColor}40` }}>
                  {level.name}
                </div>
                <span className="text-[11px] font-mono" style={{ color: '#6060a0' }}>Lv.{level.id}</span>
              </div>
              {next && (
                <span className="text-[11px] font-mono" style={{ color: '#6060a0' }}>
                  <NumberFlow value={xpIntoLevel} /> / {xpNeeded} XP
                </span>
              )}
            </div>

            {/* XP bar */}
            <div className="h-2.5 rounded-full overflow-hidden relative"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${level.badgeColor}, ${level.badgeColor}88)` }}
              />
              {/* Shimmer on bar */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                className="absolute inset-y-0 w-1/3 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
              />
            </div>

            {next ? (
              <p className="text-[10px] font-mono" style={{ color: '#6060a0' }}>
                Next: <span style={{ color: next.badgeColor }}>{next.name}</span> — unlocks {next.maxEntrySOL === Infinity ? "unlimited" : next.maxEntrySOL + " SOL"} entry
              </p>
            ) : (
              <p className="text-[10px] font-mono" style={{ color: '#ff4d00' }}>MAX LEVEL REACHED</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Info bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
          style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.12)' }}>
          <Shield className="w-4 h-4 flex-shrink-0" style={{ color: '#40d8f0' }} />
          <p className="text-[12px]" style={{ color: '#6060a0' }}>
            <span className="font-semibold text-white">Provably fair.</span> All odds shown openly. 5 opens/tier/day.
          </p>
        </div>
      </div>

      {/* ── Crate grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CRATE_TIERS.map((crate, i) => (
          <motion.div
            key={crate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <CrateCard
              crate={crate}
              userLevel={levelId}
              dailyOpened={dailyOpened}
              onOpen={handleOpen}
              opening={opening}
            />
          </motion.div>
        ))}
      </div>

      {/* ── How it works ── */}
      <div className="card-flat">
        <h3 className="font-display text-[22px] text-white tracking-[0.06em] mb-4">HOW CRATES WORK</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { n:"01", t:"Buy a Crate",  d:"Pay SOL to open. Every crate holds a random reward — SOL, XP, or a gameplay boost.", c:"#ff4d00" },
            { n:"02", t:"All Odds Shown", d:"Every reward's % chance is displayed before you buy. No hidden odds. Verified on-chain.", c:"#a060ff" },
            { n:"03", t:"Win SOL Back",  d:"Every tier has real SOL rewards. Hit the jackpot and win back 10x your buy-in. Limits keep it fair.", c:"#00d470" },
          ].map(s => (
            <div key={s.n} className="card-sm">
              <p className="text-[10px] font-mono tracking-[0.1em] mb-1.5" style={{ color: '#30304a' }}>{s.n}</p>
              <p className="text-[13px] font-bold text-white mb-1.5">{s.t}</p>
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
