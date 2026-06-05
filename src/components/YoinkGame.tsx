import NumberFlow from "@number-flow/react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Crosshair, HelpCircle, Shield, Target, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getLevelByXP, getXPProgress, XP_REWARDS } from "../lib/levels";
import RoomSystem from "./RoomSystem";

interface Player {
  id: number;
  wallet: string;
  balance: number;
  isYou: boolean;
  hit?: boolean;
  levelId: number;   // each bot has a random level
  isBounty?: boolean; // balance > 3 SOL = bounty
}
interface Tooltip { playerId: number; }

const W = [
  "7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x",
  "Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w",
  "Ux1f...Dm6y","Nt4g...Sb7i","Rk5h...Oc2p","Wj9i...Ef3n",
  "Lp2k...Mx7t","Dv5n...Qs9b","Cy4h...Tz8r","Ab6j...Wu3o",
];

const LEVEL_COLORS = ["#a0a0b0","#00d470","#a060ff","#ff4d00"];
const LEVEL_NAMES  = ["ROOKIE","HUSTLER","PREDATOR","APEX"];
const BOUNTY_THRESHOLD = 3.0; // SOL

const rBal   = () => parseFloat((Math.random() * 5 + 0.1).toFixed(3));
const rLevel = () => Math.floor(Math.random() * 3) + 1; // bots are levels 1-3
let uid = 40;

function makePlayer(id: number, wallet: string): Player {
  const bal = rBal();
  const lvl = rLevel();
  return { id, wallet, balance: bal, isYou: false, levelId: lvl, isBounty: bal >= BOUNTY_THRESHOLD };
}

const SEED: Player[] = Array.from({ length: 12 }, (_, i) => makePlayer(i + 1, W[i]));

function fireCelebration() {
  const opts = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 9999 };
  confetti({ ...opts, particleCount: 80, origin: { x: 0.35, y: 0.4 }, colors: ['#ff4d00','#ffd200','#00e87a','#00e5ff'] });
  confetti({ ...opts, particleCount: 60, origin: { x: 0.65, y: 0.4 }, colors: ['#7000ff','#ff0066','#ffd200','#ffffff'] });
}

interface Props { xp: number; onXPGain: (xp: number) => void; levelId: number; }

export default function YoinkGame({ xp, onXPGain, levelId }: Props) {
  const [players, setPlayers]     = useState<Player[]>(SEED);
  const [myBal, setMyBal]         = useState(0);
  const [target, setTarget]       = useState<number | null>(null);
  const [stake, setStake]         = useState("0.25");
  const [acting, setActing]       = useState(false);
  const [joined, setJoined]       = useState(false);
  const [flash, setFlash]         = useState<"win" | "lose" | null>(null);
  const [stolen, setStolen]       = useState(284.1);
  const [rounds, setRounds]       = useState(1847);
  const [livePlayers, setLive]    = useState(14);

  // Room system
  const [roomId, setRoomId]       = useState(() => Math.floor(Math.random() * 1100) + 3800);

  // Pity system — tracks consecutive losses per target attempt
  const pityCounts  = useRef<Record<number, number>>({});  // targetId → consecutive losses
  const globalPity  = useRef(0); // overall consecutive losses
  const [tooltip, setTooltip]     = useState<Tooltip | null>(null);
  const tooltipTimer              = useRef<ReturnType<typeof setTimeout>>();

  // Arena simulation
  useEffect(() => {
    const iv = setInterval(() => {
      setPlayers(prev => {
        const arr = [...prev];
        const a = Math.floor(Math.random() * arr.length);
        const b = Math.floor(Math.random() * arr.length);
        if (a === b || arr[a].isYou || arr[b].isYou) return arr;
        const amt = parseFloat((arr[b].balance * (0.12 + Math.random() * 0.35)).toFixed(3));
        const newBal = Math.max(0.01, parseFloat((arr[b].balance - amt).toFixed(3)));
        arr[a] = { ...arr[a], balance: parseFloat((arr[a].balance + amt * 0.9).toFixed(3)), isBounty: (arr[a].balance + amt * 0.9) >= BOUNTY_THRESHOLD };
        arr[b] = { ...arr[b], balance: newBal, hit: true, isBounty: newBal >= BOUNTY_THRESHOLD };
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === arr[b].id ? { ...pl, hit: false } : pl)), 900);
        setStolen(s => parseFloat((s + amt).toFixed(2)));
        return arr;
      });
      if (Math.random() > 0.7) {
        uid++;
        setPlayers(prev => {
          const n = prev.length >= 16 ? prev.slice(1) : prev;
          return [...n, makePlayer(uid, W[uid % W.length])];
        });
        setLive(l => Math.max(8, l + (Math.random() > 0.5 ? 1 : -1)));
      }
      setRounds(r => r + (Math.random() > 0.6 ? 1 : 0));
    }, 3200);
    return () => clearInterval(iv);
  }, []);

  const tp = players.find(p => p.id === target);

  // Level success bonus
  const levelBonus = getLevelByXP(xp).successBonus;

  // Pity-adjusted chance calculation
  const chance = (myB = myBal, theirB?: number, targetId?: number): number => {
    const tb = theirB ?? tp?.balance ?? 1;
    const r  = myB / tb;
    let base = r > 2 ? 75 : r > 1 ? 60 : r > 0.5 ? 45 : 30;

    // Apply level bonus
    base = Math.min(92, base + levelBonus);

    // Apply pity: each consecutive loss adds 8% up to +24%
    const pity = Math.min(3, globalPity.current);
    base = Math.min(95, base + pity * 8);

    // Small wallet shield: target under 0.5 SOL gets +20% defence
    if (tb < 0.5) base = Math.max(10, base - 20);

    return Math.round(base);
  };

  const chanceColor = (c: number) =>
    c >= 60 ? "#00d470" : c >= 45 ? "#ffd200" : "#ff7040";

  const join = () => {
    const v = parseFloat(stake);
    if (isNaN(v) || v < 0.05) return;
    setJoined(true);
    setMyBal(v);
    uid++;
    const me: Player = { id: uid, wallet: "You", balance: v, isYou: true, levelId, isBounty: v >= BOUNTY_THRESHOLD };
    setPlayers(prev => [...prev, me]);
    onXPGain(XP_REWARDS.ENTER_ARENA);
    toast.success(`Entered arena with ${v} SOL`);
  };

  const reEnter = () => {
    setJoined(false);
    setTarget(null);
    setMyBal(0);
    globalPity.current = 0;
    pityCounts.current = {};
    setPlayers(prev => prev.filter(p => !p.isYou));
  };

  const yoink = () => {
    if (!target || !tp || acting) return;
    setActing(true);
    const c = chance();
    onXPGain(XP_REWARDS.YOINK_ATTEMPT);
    setTimeout(() => {
      const roll = Math.random() * 100;
      const fee  = parseFloat((tp.balance * 0.05).toFixed(3));
      // Bounty = double payout (90% instead of 50%)
      const gainPct = tp.isBounty ? 0.9 : 0.5;
      const gain = parseFloat((tp.balance * gainPct).toFixed(3));
      if (roll < c) {
        // WIN — reset pity
        globalPity.current = 0;
        pityCounts.current[target] = 0;
        setMyBal(b => parseFloat((b + gain - fee).toFixed(3)));
        const newBal = parseFloat((tp.balance - gain).toFixed(3));
        setPlayers(prev => prev.map(p => {
          if (p.id === target) return { ...p, balance: newBal, hit: true, isBounty: newBal >= BOUNTY_THRESHOLD };
          if (p.isYou) {
            const nb = parseFloat((p.balance + gain - fee).toFixed(3));
            return { ...p, balance: nb, isBounty: nb >= BOUNTY_THRESHOLD };
          }
          return p;
        }));
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === target ? { ...pl, hit: false } : pl)), 900);
        onXPGain(XP_REWARDS.YOINK_SUCCESS);
        setStolen(s => parseFloat((s + gain).toFixed(2)));
        setRounds(r => r + 1);
        setFlash("win");
        setTimeout(() => setFlash(null), 700);
        fireCelebration();
        toast.success(`YOINKED! +${gain} SOL stolen from ${tp.wallet}`, { duration: 4000 });
      } else {
        // LOSE — increment pity
        globalPity.current += 1;
        pityCounts.current[target] = (pityCounts.current[target] ?? 0) + 1;
        setMyBal(b => parseFloat((b - fee).toFixed(3)));
        setPlayers(prev => prev.map(p => p.isYou ? { ...p, balance: parseFloat((p.balance - fee).toFixed(3)) } : p));
        setRounds(r => r + 1);
        setFlash("lose");
        setTimeout(() => setFlash(null), 600);
        const pityMsg = globalPity.current >= 2 ? ` (${Math.min(95, chance() + 8)}% next attempt — pity active)` : "";
        toast.error(`Yoink failed — lost ${fee} SOL fee${pityMsg}`, { duration: 3500 });
      }
      setTarget(null);
      setActing(false);
    }, 1600);
  };

  const maxBal = Math.max(...players.map(p => p.balance), 1);
  const myPlayer = players.find(p => p.isYou);
  const isOut = joined && myPlayer && myPlayer.balance <= 0.01;
  const { current: myLevel, progressPct, xpIntoLevel, xpNeeded, next: nextLevel } = getXPProgress(xp);

  // Tooltip show/hide
  const showTooltip = (id: number) => {
    clearTimeout(tooltipTimer.current);
    setTooltip({ playerId: id });
  };
  const hideTooltip = () => {
    tooltipTimer.current = setTimeout(() => setTooltip(null), 200);
  };

  return (
    <div className="space-y-6">
      {/* Flash */}
      <AnimatePresence>
        {flash && (
          <motion.div key={flash} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={flash === "win" ? "win-flash" : "lose-flash"} />
        )}
      </AnimatePresence>

      {/* Hero */}
      <div className="card-hero">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="pill pill-live"><span className="w-1.5 h-1.5 rounded-full bg-y-green blink" /> LIVE</span>
              <span className="text-[12px] font-mono" style={{ color: '#6060a0' }}>{livePlayers} players in arena</span>
            </div>
            <h1 className="font-display text-[52px] leading-none text-white tracking-[0.06em] mb-2">
              YOINK<span style={{ color: '#ff4d00' }}>.GG</span>
            </h1>
            <p className="text-[14px]" style={{ color: '#6060a0' }}>Target a wallet. Pay the fee. Steal their SOL.</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="font-display text-[40px] leading-none glow-accent" style={{ color: '#ff7040' }}>
                <NumberFlow value={stolen} format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] mt-1" style={{ color: '#6060a0' }}>SOL Stolen</div>
            </div>
            <div className="w-px h-12" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="text-center">
              <div className="font-display text-[40px] leading-none" style={{ color: '#a060ff' }}>
                <NumberFlow value={rounds} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] mt-1" style={{ color: '#6060a0' }}>Rounds</div>
            </div>
            <div className="w-px h-12 hidden sm:block" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="text-center hidden sm:block">
              <div className="font-display text-[40px] leading-none" style={{ color: '#00d470' }}>
                <NumberFlow value={livePlayers} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] mt-1" style={{ color: '#6060a0' }}>Live Now</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works — richer cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            n:"01", c:"#ff4d00",
            t:"Lock SOL to Enter",
            d:"Your deposit becomes your live balance. Everyone in the arena can see it — and target you.",
            earn: null,
          },
          {
            n:"02", c:"#a060ff",
            t:"See Live Balances",
            d:"That number on each card? Real SOL locked in. It grows when they win steals, shrinks when they get yoinked.",
            earn:"Hover any card → see steal odds",
          },
          {
            n:"03", c:"#40d8f0",
            t:"Pay Fee, Steal SOL",
            d:"Fee = 5% of target's balance. Win = steal 50% of their locked SOL. Lose = only lose the fee. They keep everything if you miss.",
            earn:"Win: +50% of theirs  |  Lose: -5% fee only",
          },
          {
            n:"04", c:"#00d470",
            t:"Win & Compound",
            d:"Every successful yoink grows your balance. Bigger balance = better odds on your next attack. Stack wins to dominate.",
            earn:"10x your entry in one session is real",
          },
        ].map(s => (
          <motion.div key={s.n} whileHover={{ y: -3 }} className="card-sm cursor-default">
            <div className="text-[10px] font-mono tracking-[0.1em] mb-2" style={{ color: '#30304a' }}>{s.n}</div>
            <div className="text-[13px] font-bold text-white mb-1.5">{s.t}</div>
            <div className="text-[11px] leading-relaxed" style={{ color: '#6060a0' }}>{s.d}</div>
            {s.earn && (
              <div className="mt-2.5 text-[10px] font-mono px-2 py-1.5 rounded-lg"
                style={{
                  background: `rgba(${
                    s.c === "#ff4d00" ? "255,77,0"
                    : s.c === "#a060ff" ? "112,0,255"
                    : s.c === "#40d8f0" ? "0,229,255"
                    : "0,232,122"
                  },0.08)`,
                  color: s.c,
                }}>
                {s.earn}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Arena grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Room system */}
          <RoomSystem
            levelId={levelId}
            roomId={roomId}
            onRoomChange={(id) => {
              setRoomId(id);
              // Refresh players when switching rooms
              setPlayers(Array.from({ length: 12 }, (_, i) => makePlayer(uid + i + 1, W[(uid + i) % W.length])));
              toast(`Switched to Room #${id.toLocaleString()}`);
            }}
            playerCount={players.length + 847}
            potSOL={parseFloat(players.reduce((s, p) => s + p.balance, 0).toFixed(2))}
          />

          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-y-green blink" />
              Live Arena
              <span className="pill pill-dim text-[10px]">{players.length} wallets</span>
            </h2>
            {joined && (
              <span className="text-[11px] font-mono flex items-center gap-1.5" style={{ color: '#6060a0' }}>
                <HelpCircle className="w-3 h-3" /> Hover a wallet to see odds
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative">
            <AnimatePresence>
              {players.map(p => {
                const pct      = (p.balance / maxBal) * 100;
                const isT      = target === p.id;
                const c        = chance(myBal, p.balance);
                const lvlColor = LEVEL_COLORS[(p.levelId ?? 1) - 1];
                const lvlName  = LEVEL_NAMES[(p.levelId ?? 1) - 1];

                // Tier classification
                const isKing     = p.isBounty && !p.isYou;    // 3+ SOL
                const isPredator = !isKing && p.balance >= 1.5 && !p.isYou;
                const isCommon   = !isKing && !isPredator && p.balance >= 0.5 && !p.isYou;
                const isDust     = !isKing && !isPredator && !isCommon && !p.isYou;

                const tierClass = p.isYou ? "is-you"
                  : isKing     ? "wc-king"
                  : isPredator ? "wc-predator"
                  : isCommon   ? "wc-common"
                  : "wc-dust";

                const tierIcon = isKing ? "🔥" : isPredator ? "⚡" : isCommon ? "🟢" : "👻";

                const balColor = p.hit ? '#ff4d00'
                  : p.isYou    ? '#00e5ff'
                  : isKing     ? '#ffd200'
                  : isPredator ? '#a060ff'
                  : isCommon   ? '#00d470'
                  : '#a0a0c0';

                const barColor = p.isYou     ? 'linear-gradient(90deg,#00e5ff,#7000ff)'
                  : isKing     ? 'linear-gradient(90deg,#ffd200,#ff4d00)'
                  : isPredator ? 'linear-gradient(90deg,#a060ff,#00e5ff)'
                  : isCommon   ? 'linear-gradient(90deg,#00e87a,#00c8e8)'
                  : 'linear-gradient(90deg,#606080,#404060)';

                const stealAmt = isKing
                  ? parseFloat((p.balance * 0.9).toFixed(3))
                  : parseFloat((p.balance * 0.5).toFixed(3));

                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25, type: "spring", stiffness: 200, damping: 20 }}
                    onClick={() => !p.isYou && joined && setTarget(isT ? null : p.id)}
                    onMouseEnter={() => !p.isYou && joined && showTooltip(p.id)}
                    onMouseLeave={hideTooltip}
                    className={`wallet-card relative overflow-visible ${tierClass} ${isT ? "targeted" : ""} ${p.hit ? "hit" : ""} ${(!joined || p.isYou) ? "!cursor-default" : ""}`}
                  >
                    {/* Tier particle decorations */}
                    {isDust && !p.isYou && (
                      <>
                        <span className="ghost-dot" style={{ left: '20%', bottom: '30%' }} />
                        <span className="ghost-dot" style={{ left: '60%', bottom: '20%' }} />
                        <span className="ghost-dot" style={{ left: '80%', bottom: '40%' }} />
                      </>
                    )}
                    {isPredator && (
                      <>
                        <span className="spark" />
                        <span className="spark" />
                        <span className="spark" />
                      </>
                    )}
                    {isKing && (
                      <>
                        <span className="flame" />
                        <span className="flame" />
                        <span className="flame" />
                      </>
                    )}

                    {/* Bounty crown badge */}
                    {isKing && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                          className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold whitespace-nowrap"
                          style={{ background: 'rgba(255,210,0,0.92)', color: '#000', boxShadow: '0 2px 12px rgba(255,210,0,0.6)' }}
                        >
                          👑 BOUNTY
                        </motion.div>
                      </div>
                    )}

                    {/* Targeted crosshair */}
                    {isT && (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute top-2.5 right-2.5 z-10"
                      >
                        <Target className="w-3.5 h-3.5" style={{ color: '#ff4d00' }} />
                      </motion.div>
                    )}

                    {/* Hover tooltip */}
                    {joined && !p.isYou && !isT && tooltip?.playerId === p.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 px-3 py-2 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap"
                        style={{
                          background: '#0c0c1a',
                          border: `1px solid ${chanceColor(c)}40`,
                          color: chanceColor(c),
                          boxShadow: `0 4px 20px rgba(0,0,0,0.7), 0 0 12px ${chanceColor(c)}20`,
                        }}
                      >
                        {c}% · steal {stealAmt} SOL{isKing ? " 👑" : ""}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent"
                          style={{ borderTopColor: '#0c0c1a' }} />
                      </motion.div>
                    )}

                    {/* Top: wallet + level badge */}
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-[10px] truncate flex-1"
                        style={{ color: p.isYou ? '#40d8f0' : '#6060a0' }}>
                        {p.isYou ? "● YOU" : p.wallet}
                      </p>
                      {!p.isYou && (
                        <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1"
                          style={{ background: `${lvlColor}18`, color: lvlColor, border: `1px solid ${lvlColor}30` }}>
                          {lvlName[0]}
                        </span>
                      )}
                    </div>

                    {/* Balance — size scales with tier */}
                    <p className={`font-display leading-none mb-0.5 ${
                      isKing     ? "text-[32px] glow-yellow"
                      : isPredator ? "text-[28px]"
                      : isCommon   ? "text-[25px]"
                      : "text-[22px]"
                    } ${p.hit ? "glow-accent" : p.isYou ? "glow-cyan" : ""}`}
                      style={{ color: balColor }}
                    >
                      {p.balance.toFixed(3)}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: '#30304a' }}>SOL</p>

                    {/* Balance bar */}
                    <div className="wallet-bar mt-2.5">
                      <motion.div
                        className="wallet-bar-fill"
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ background: barColor }}
                      />
                    </div>

                    {/* Tier icon */}
                    {!p.isYou && (
                      <span className="tier-icon">{tierIcon}</span>
                    )}

                    {/* Targeted chance */}
                    {isT && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] font-mono font-bold mt-1.5"
                        style={{ color: chanceColor(c) }}
                      >
                        {c}% success
                      </motion.p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Action panel */}
        <div className="space-y-4">

          {/* XP / Level bar — always visible when joined */}
          {joined && (
            <div className="card-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg font-display text-[13px] tracking-[0.06em]"
                    style={{ background: myLevel.badgeBg, color: myLevel.badgeColor, border: `1px solid ${myLevel.badgeColor}30` }}>
                    {myLevel.name}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: '#6060a0' }}>+{myLevel.successBonus}% bonus</span>
                </div>
                {globalPity.current > 0 && (
                  <motion.div
                    initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(255,210,0,0.1)', color: '#ffd200', border: '1px solid rgba(255,210,0,0.2)' }}
                  >
                    🔥 PITY x{Math.min(3, globalPity.current)} (+{Math.min(24, globalPity.current * 8)}%)
                  </motion.div>
                )}
              </div>
              {nextLevel && (
                <>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${myLevel.badgeColor}, ${myLevel.badgeColor}aa)` }} />
                  </div>
                  <p className="text-[10px] font-mono" style={{ color: '#6060a0' }}>
                    {xpIntoLevel} / {xpNeeded} XP → <span style={{ color: nextLevel.badgeColor }}>{nextLevel.name}</span>
                  </p>
                </>
              )}
            </div>
          )}

          {/* OUT OF BALANCE — re-enter prompt */}
          {isOut && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="card-flat text-center space-y-4"
              style={{ border: '1px solid rgba(255,77,0,0.25)', background: 'rgba(255,77,0,0.05)' }}
            >
              <div className="text-[32px]">💀</div>
              <div>
                <h3 className="font-display text-[22px] text-white tracking-[0.06em]">REKT</h3>
                <p className="text-[12px] mt-1" style={{ color: '#6060a0' }}>Your balance hit zero. Re-enter the arena to keep playing.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {["0.1","0.25","0.5","1.0"].map(v => (
                  <button key={v} onClick={() => setStake(v)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all"
                    style={{
                      background: stake === v ? 'rgba(255,77,0,0.14)' : 'rgba(255,255,255,0.03)',
                      borderColor: stake === v ? 'rgba(255,77,0,0.45)' : 'rgba(255,255,255,0.08)',
                      color: stake === v ? '#ff7040' : '#6060a0',
                    }}
                  >{v} SOL</button>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => { reEnter(); setTimeout(join, 50); }}
                className="btn-yoink w-full">
                <Zap className="w-4 h-4" /> RE-ENTER — {stake} SOL
              </motion.button>
            </motion.div>
          )}

          {/* NOT JOINED */}
          {!joined && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-flat space-y-5">
              <div>
                <h3 className="font-display text-[26px] text-white leading-none tracking-[0.06em] mb-1">ENTER ARENA</h3>
                <p className="text-[12px]" style={{ color: '#6060a0' }}>Lock SOL to start stealing from others</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["0.1","0.25","0.5","1.0","2.0"].map(v => (
                  <motion.button key={v} whileTap={{ scale: 0.93 }} onClick={() => setStake(v)}
                    className="px-4 py-2 rounded-xl text-[12px] font-bold border transition-all"
                    style={{
                      background: stake === v ? 'rgba(255,77,0,0.14)' : 'rgba(255,255,255,0.03)',
                      borderColor: stake === v ? 'rgba(255,77,0,0.45)' : 'rgba(255,255,255,0.08)',
                      color: stake === v ? '#ff7040' : '#6060a0',
                    }}>{v} SOL
                  </motion.button>
                ))}
              </div>
              <input type="number" value={stake} onChange={e => setStake(e.target.value)} className="input" placeholder="Custom..." />
              <div className="rounded-xl p-4 space-y-2.5 text-[11px]"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Entry amount</span><span className="font-mono font-semibold text-white">{stake} SOL</span></div>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Yoink fee per attempt</span><span className="font-mono" style={{ color: '#ff7040' }}>5% of target's balance</span></div>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Win payout</span><span className="font-mono" style={{ color: '#00d470' }}>50% of target's balance</span></div>
                <div className="divider" />
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Fee charged</span><span className="font-mono" style={{ color: '#a060ff' }}>Win OR lose</span></div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={join} className="btn-yoink w-full">
                <Zap className="w-4 h-4" /> ENTER — {stake} SOL
              </motion.button>
            </motion.div>
          )}

          {/* JOINED */}
          {joined && !isOut && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-flat space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[26px] text-white leading-none tracking-[0.06em]">YOINK ATTACK</h3>
                <div className="text-right">
                  <p className="text-[10px] font-mono" style={{ color: '#6060a0' }}>YOUR BALANCE</p>
                  <p className="font-display text-[22px] leading-none" style={{ color: '#00e5ff' }}>
                    <NumberFlow value={myBal} format={{ minimumFractionDigits: 3, maximumFractionDigits: 3 }} />
                  </p>
                </div>
              </div>

              {/* Target preview */}
              {tp ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-5 space-y-4"
                  style={{ background: 'rgba(255,77,0,0.06)', border: '1px solid rgba(255,77,0,0.22)', borderTop: '1px solid rgba(255,77,0,0.5)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono tracking-[0.1em]" style={{ color: '#6060a0' }}>TARGET LOCKED</p>
                      <p className="font-mono text-[13px] text-white mt-1">{tp.wallet}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {tp.isBounty && (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,210,0,0.2)', color: '#ffd200', border: '1px solid rgba(255,210,0,0.4)' }}>
                          👑 BOUNTY
                        </span>
                      )}
                      <Target className="w-6 h-6" style={{ color: '#ff4d00' }} />
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-[42px] leading-none" style={{ color: tp.isBounty ? '#ffd200' : '#ff7040' }}>
                      {tp.balance.toFixed(3)}
                    </p>
                    <p className="text-[12px] font-mono" style={{ color: '#6060a0' }}>SOL in target wallet</p>
                    {tp.isBounty && (
                      <p className="text-[11px] font-semibold mt-1" style={{ color: '#ffd200' }}>
                        Bounty target — steal 90% instead of 50%!
                      </p>
                    )}
                  </div>
                  <div className="divider" />
                  <div className="grid grid-cols-3 gap-3 text-center text-[11px]">
                    <div className="rounded-xl p-2.5"
                      style={{ background: tp.isBounty ? 'rgba(255,210,0,0.08)' : 'rgba(0,212,112,0.08)', border: `1px solid ${tp.isBounty ? 'rgba(255,210,0,0.2)' : 'rgba(0,212,112,0.15)'}` }}>
                      <p style={{ color: '#6060a0' }}>You steal</p>
                      <p className="font-mono font-bold mt-1" style={{ color: tp.isBounty ? '#ffd200' : '#00d470' }}>
                        +{(tp.balance * (tp.isBounty ? 0.9 : 0.5)).toFixed(3)}
                      </p>
                    </div>
                    <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.15)' }}>
                      <p style={{ color: '#6060a0' }}>Fee paid</p>
                      <p className="font-mono font-bold mt-1" style={{ color: '#ff7040' }}>-{(tp.balance * 0.05).toFixed(3)}</p>
                    </div>
                    <div className="rounded-xl p-2.5"
                      style={{
                        background: `${chanceColor(chance())}15`,
                        border: `1px solid ${chanceColor(chance())}30`,
                      }}
                    >
                      <p style={{ color: '#6060a0' }}>Chance</p>
                      <p className="font-mono font-bold mt-1" style={{ color: chanceColor(chance()) }}>{chance()}%</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-2xl p-8 text-center border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <Crosshair className="w-10 h-10 mx-auto mb-3" style={{ color: '#30304a' }} />
                  <p className="text-[13px] font-semibold" style={{ color: '#6060a0' }}>Select a wallet from the arena</p>
                  <p className="text-[11px] mt-1" style={{ color: '#30304a' }}>Hover any card to preview your odds first</p>
                </div>
              )}

              {/* YOINK button — shows live odds */}
              <motion.button
                whileTap={target ? { scale: 0.96 } : {}}
                onClick={yoink}
                disabled={!target || acting}
                className={`btn-yoink w-full ${target && !acting ? "pulsing" : ""}`}
                style={{ fontSize: '18px', padding: '15px', letterSpacing: '3px' }}
              >
                {acting ? (
                  <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />STEALING...</>
                ) : target && tp ? (
                  `YOINK IT — ${chance()}% CHANCE`
                ) : (
                  <><Crosshair className="w-5 h-5" />SELECT A TARGET</>
                )}
              </motion.button>

              <p className="text-[10px] flex items-center justify-center gap-1.5" style={{ color: '#30304a' }}>
                <AlertCircle className="w-3 h-3" />
                Fee charged win or lose. Higher balance = better odds.
              </p>
            </motion.div>
          )}

          {/* Success rate card */}
          <div className="card-sm space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.12em]" style={{ color: '#6060a0' }}>Success Rates</h3>
            {[
              { l: "Your balance 2x+ theirs",   pct: 75, c: "#00d470" },
              { l: "Your balance ~1x theirs",   pct: 60, c: "#40d8f0" },
              { l: "Your balance ~0.5x theirs", pct: 45, c: "#ffd200" },
              { l: "Your balance under 0.5x",   pct: 30, c: "#ff7040" },
            ].map(r => (
              <div key={r.l}>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span style={{ color: '#6060a0' }}>{r.l}</span>
                  <span className="font-mono font-bold text-white">{r.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${r.pct}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="h-full rounded-full" style={{ background: r.c }} />
                </div>
              </div>
            ))}
          </div>

          {/* Shield */}
          <div className="card-sm flex items-start gap-3" style={{ background: 'rgba(0,229,255,0.03)', borderColor: 'rgba(0,229,255,0.10)' }}>
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#40d8f0' }} />
            <div>
              <p className="text-[12px] font-semibold text-white">Provably Fair</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#6060a0' }}>On-chain randomness via Switchboard VRF. Zero manipulation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
