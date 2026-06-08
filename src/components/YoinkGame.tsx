import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowUpRight, Crown, DoorOpen, Flame, Lock, Shield, Skull, Swords, Target, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getLevelByXP, getXPProgress, XP_REWARDS } from "../lib/levels";
import RoomSystem from "./RoomSystem";
import YoinkResult, { type YoinkResultData } from "./YoinkResult";

interface Player {
  id: number; wallet: string; balance: number;
  isYou: boolean; hit?: boolean; levelId: number; isBounty?: boolean;
}

const W = [
  "7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x",
  "Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w",
  "Ux1f...Dm6y","Nt4g...Sb7i","Rk5h...Oc2p","Wj9i...Ef3n",
  "Lp2k...Mx7t","Dv5n...Qs9b","Cy4h...Tz8r","Ab6j...Wu3o",
];

const LEVEL_COLORS = ["#a0a0b0","#00d470","#a060ff","#ffd700"];
const LEVEL_NAMES  = ["ROOKIE","HUSTLER","PREDATOR","APEX"];

// ── Deterministic predator icon mapped from wallet-address hash (no emoji) ──
const PREDATOR_ICONS = [Skull, Swords, Flame];
function hashWallet(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function predatorIcon(wallet: string) {
  return PREDATOR_ICONS[hashWallet(wallet) % PREDATOR_ICONS.length];
}

// ── Arena grid entrance — spring stagger, cards slam in ──
const arenaGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
};
const arenaCard = {
  hidden: { opacity: 0, y: 20, scale: 0.92, filter: "blur(4px)" },
  show: {
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 260, damping: 22 },
  },
};
const BOUNTY_THRESHOLD = 3.0;
const MAX_DAILY_LOSS   = 10; // SOL — protection cap
const MIN_BALANCE_PROTECTION = 0.05; // can't be yoinked below this

const rBal   = () => parseFloat((Math.random() * 5 + 0.1).toFixed(3));
const rLevel = () => Math.floor(Math.random() * 3) + 1;
let uid = 40;

function makePlayer(id: number, wallet: string): Player {
  const bal = rBal();
  return { id, wallet, balance: bal, isYou: false, levelId: rLevel(), isBounty: bal >= BOUNTY_THRESHOLD };
}

const SEED: Player[] = Array.from({ length: 12 }, (_, i) => makePlayer(i + 1, W[i]));

function fireCelebration() {
  const o = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
  confetti({ ...o, particleCount: 60, origin: { x: 0.35, y: 0.4 }, colors: ['#ffd700','#ffd200','#00e87a'] });
  confetti({ ...o, particleCount: 50, origin: { x: 0.65, y: 0.4 }, colors: ['#7000ff','#ff0066','#ffd200'] });
}

interface Props { xp: number; onXPGain: (xp: number, reason?: string) => void; levelId: number; wallet: string | null; }

export default function YoinkGame({ xp, onXPGain, levelId, wallet }: Props) {
  const [players, setPlayers]       = useState<Player[]>(SEED);
  const [myBal, setMyBal]           = useState(0);
  const [entryAmount, setEntryAmount] = useState(0); // what they entered with
  const [target, setTarget]         = useState<number | null>(null);
  const [stake, setStake]           = useState("0.25");
  const [acting, setActing]         = useState(false);
  const [joined, setJoined]         = useState(false);
  const [flash, setFlash]           = useState<"win"|"lose"|null>(null);
  const [shaking, setShaking]       = useState(false);
  const [result, setResult]         = useState<YoinkResultData | null>(null);
  const [stolen, setStolen]         = useState(284.1);
  const [rounds, setRounds]         = useState(1847);
  const [livePlayers, setLive]      = useState(14);
  const [tooltip, setTooltip]       = useState<number | null>(null);
  const [roomId, setRoomId]         = useState(() => Math.floor(Math.random() * 200) + 300);
  // Session P&L tracking
  const [sessionWins, setSessionWins]   = useState(0);
  const [sessionLosses, setSessionLosses] = useState(0);
  const [dailyLoss, setDailyLoss]       = useState(0);
  const globalPity    = useRef(0);
  const tooltipTimer  = useRef<ReturnType<typeof setTimeout>>();

  // Simulation
  useEffect(() => {
    const iv = setInterval(() => {
      setPlayers(prev => {
        const arr = [...prev];
        const a = Math.floor(Math.random() * arr.length);
        const b = Math.floor(Math.random() * arr.length);
        if (a === b || arr[a].isYou || arr[b].isYou) return arr;
        if (arr[b].balance <= MIN_BALANCE_PROTECTION) return arr;
        const amt = parseFloat((arr[b].balance * (0.15 + Math.random() * 0.3)).toFixed(3));
        const nb = Math.max(MIN_BALANCE_PROTECTION, parseFloat((arr[b].balance - amt).toFixed(3)));
        const na = parseFloat((arr[a].balance + amt * 0.9).toFixed(3));
        arr[a] = { ...arr[a], balance: na, isBounty: na >= BOUNTY_THRESHOLD };
        arr[b] = { ...arr[b], balance: nb, hit: true, isBounty: nb >= BOUNTY_THRESHOLD };
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === arr[b].id ? { ...pl, hit: false } : pl)), 800);
        setStolen(s => parseFloat((s + amt).toFixed(2)));
        return arr;
      });
      if (Math.random() > 0.85) {
        uid++;
        setPlayers(prev => {
          const n = prev.length >= 14 ? prev.slice(1) : prev;
          return [...n, makePlayer(uid, W[uid % W.length])];
        });
        setLive(l => Math.max(8, l + (Math.random() > 0.5 ? 1 : -1)));
      }
      setRounds(r => r + (Math.random() > 0.7 ? 1 : 0));
    }, 6000);
    return () => clearInterval(iv);
  }, []);

  const tp = players.find(p => p.id === target);
  const levelBonus = getLevelByXP(xp).successBonus;

  const chance = useCallback((myB = myBal, theirB?: number): number => {
    const tb = theirB ?? tp?.balance ?? 1;
    const r  = myB / tb;
    let base = r > 2 ? 75 : r > 1 ? 60 : r > 0.5 ? 45 : 30;
    base = Math.min(92, base + levelBonus);
    const pity = Math.min(3, globalPity.current);
    base = Math.min(95, base + pity * 8);
    if (tb < 0.5) base = Math.max(10, base - 20);
    return Math.round(base);
  }, [myBal, tp?.balance, levelBonus]);

  const chanceColor = (c: number) => c >= 60 ? "#00d470" : c >= 45 ? "#ffd200" : "#ff7040";

  const sessionPnL = sessionWins - sessionLosses;
  const sessionPnLColor = sessionPnL > 0 ? "#00d470" : sessionPnL < 0 ? "#ff7040" : "#8892a4";

  const join = () => {
    const v = parseFloat(stake);
    if (isNaN(v) || v < 0.05) return;
    setJoined(true);
    setMyBal(v);
    setEntryAmount(v);
    setSessionWins(0);
    setSessionLosses(0);
    uid++;
    setPlayers(prev => [...prev, { id: uid, wallet: "You", balance: v, isYou: true, levelId, isBounty: v >= BOUNTY_THRESHOLD }]);
    onXPGain(XP_REWARDS.ENTER_ARENA, "enter_arena");
    toast.success(`Entered arena with ${v} SOL`);
  };

  const leaveArena = () => {
    const myPlayer = players.find(p => p.isYou);
    const remaining = myPlayer?.balance ?? 0;
    if (remaining > 0.01) {
      toast.success(`Left arena. ${remaining.toFixed(3)} SOL returned to your wallet.`);
    } else {
      toast(`Left arena.`);
    }
    setJoined(false);
    setTarget(null);
    setMyBal(0);
    setEntryAmount(0);
    globalPity.current = 0;
    setPlayers(prev => prev.filter(p => !p.isYou));
  };

  const reEnter = () => {
    setJoined(false); setTarget(null); setMyBal(0); setEntryAmount(0);
    globalPity.current = 0;
    setPlayers(prev => prev.filter(p => !p.isYou));
  };

  const yoink = () => {
    if (!target || !tp || acting) return;
    // Daily loss cap protection
    if (dailyLoss >= MAX_DAILY_LOSS) {
      toast.error(`Daily loss limit reached (${MAX_DAILY_LOSS} SOL). Come back tomorrow.`);
      return;
    }
    setActing(true);
    const c = chance();
    onXPGain(XP_REWARDS.YOINK_ATTEMPT, "yoink_attempt");
    setTimeout(() => {
      const roll = Math.random() * 100;
      const fee  = parseFloat((tp.balance * 0.05).toFixed(3));
      const gain = parseFloat((tp.balance * (tp.isBounty ? 0.9 : 0.5)).toFixed(3));
      if (roll < c) {
        globalPity.current = 0;
        setMyBal(b => parseFloat((b + gain - fee).toFixed(3)));
        setSessionWins(w => parseFloat((w + gain - fee).toFixed(3)));
        setPlayers(prev => prev.map(p => {
          if (p.id === target) {
            const nb = parseFloat((p.balance - gain).toFixed(3));
            return { ...p, balance: nb, hit: true, isBounty: nb >= BOUNTY_THRESHOLD };
          }
          if (p.isYou) {
            const nb = parseFloat((p.balance + gain - fee).toFixed(3));
            return { ...p, balance: nb, isBounty: nb >= BOUNTY_THRESHOLD };
          }
          return p;
        }));
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === target ? { ...pl, hit: false } : pl)), 800);
        onXPGain(XP_REWARDS.YOINK_SUCCESS, "yoink_win");
        setStolen(s => parseFloat((s + gain).toFixed(2)));
        setRounds(r => r + 1);
        setFlash("win"); setTimeout(() => setFlash(null), 600);
        setShaking(true); setTimeout(() => setShaking(false), 400);
        fireCelebration();
        setResult({
          type: "win",
          amount: gain,
          fee,
          net: parseFloat((gain - fee).toFixed(3)),
          victim: tp.wallet,
          newBalance: parseFloat((myBal + gain - fee).toFixed(3)),
          isBounty: tp.isBounty,
        });
        toast.success(`+${gain} SOL stolen from ${tp.wallet}`, { duration: 3500 });
      } else {
        globalPity.current += 1;
        setMyBal(b => parseFloat((b - fee).toFixed(3)));
        setSessionLosses(l => parseFloat((l + fee).toFixed(3)));
        setDailyLoss(d => parseFloat((d + fee).toFixed(3)));
        setPlayers(prev => prev.map(p =>
          p.isYou ? { ...p, balance: parseFloat((p.balance - fee).toFixed(3)) } : p
        ));
        setRounds(r => r + 1);
        setFlash("lose"); setTimeout(() => setFlash(null), 500);
        const pityMsg = globalPity.current >= 2 ? ` — odds improving (${Math.min(95, chance() + 8)}% next)` : "";
        setResult({
          type: "lose",
          amount: 0,
          fee,
          net: parseFloat((-fee).toFixed(3)),
          victim: tp.wallet,
          newBalance: parseFloat((myBal - fee).toFixed(3)),
          pityNext: globalPity.current >= 2 ? Math.min(95, chance() + 8) : null,
        });
        toast.error(`Yoink failed — ${fee} SOL fee${pityMsg}`, { duration: 3000 });
      }
      setTarget(null);
      setActing(false);
    }, 1400);
  };

  const maxBal = Math.max(...players.map(p => p.balance), 1);
  const myPlayer = players.find(p => p.isYou);
  const isOut = joined && myPlayer && myPlayer.balance <= 0.01;
  const { current: myLevel, progressPct, xpIntoLevel, xpNeeded, next: nextLevel } = getXPProgress(xp);
  const maxFeeThisAttempt = tp ? parseFloat((tp.balance * 0.05).toFixed(3)) : 0;

  const showTooltip = (id: number) => { clearTimeout(tooltipTimer.current); setTooltip(id); };
  const hideTooltip = () => { tooltipTimer.current = setTimeout(() => setTooltip(null), 150); };

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {flash && (
          <motion.div key={flash} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={flash === "win" ? "yoink-win-flash" : "lose-flash"} />
        )}
      </AnimatePresence>

      {/* Cinematic win/lose reveal — the dopamine payoff moment */}
      <YoinkResult data={result} onClose={() => setResult(null)} />

      {/* Arena bar — cinematic, game-first */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl flex flex-wrap items-center justify-between gap-4"
        style={{
          padding: '18px 22px',
          background: 'linear-gradient(135deg, rgba(112,0,255,0.10) 0%, rgba(8,10,17,0.9) 50%, rgba(255,215,0,0.06) 100%)',
          border: '1px solid rgba(255,215,0,0.18)',
          borderTop: '2px solid rgba(255,215,0,0.4)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(112,0,255,0.05)',
        }}>
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 100% 50%, rgba(255,215,0,0.06), transparent)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)', opacity: 0.5 }} />

        <div className="relative flex items-center gap-4">
          {/* Pulsing live indicator */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
            style={{ background: 'rgba(0,230,118,0.10)', border: '1px solid rgba(0,230,118,0.25)' }}>
            <div className="absolute inset-0 rounded-xl" style={{ animation: 'auraPulse 2s ease-in-out infinite', border: '1px solid rgba(0,230,118,0.3)' }} />
            <span className="w-3 h-3 rounded-full blink" style={{ background: '#00e676', boxShadow: '0 0 10px #00e676' }} />
          </div>
          <div>
            <div className="font-display text-[28px] leading-none text-white tracking-[0.08em]"
              style={{ textShadow: '0 0 30px rgba(255,255,255,0.1)' }}>
              THE <span style={{ color: '#ffd700', textShadow: '0 0 20px rgba(255,215,0,0.4)' }}>ARENA</span>
            </div>
            <p className="text-[11px] mt-0.5 font-mono" style={{ color: '#8892a4' }}>
              <span style={{ color: '#00e676' }}>{livePlayers}</span> hunters circling · tap a wallet to strike
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-6">
          <div className="text-center">
            <motion.div key={stolen} className="font-display text-[30px] leading-none gold-text-gradient"
              initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
              {stolen.toFixed(1)}
            </motion.div>
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] mt-1" style={{ color: '#8892a4' }}>SOL Stolen</div>
          </div>
          <div className="w-px h-10 rounded-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent)' }} />
          <div className="text-center">
            <div className="font-display text-[30px] leading-none" style={{ color: '#a060ff', textShadow: '0 0 20px rgba(112,0,255,0.4)' }}>
              {rounds.toLocaleString()}
            </div>
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] mt-1" style={{ color: '#8892a4' }}>Rounds</div>
          </div>
        </div>
      </motion.div>

      {/* Daily protection banner — only show if near limit */}
      {dailyLoss > MAX_DAILY_LOSS * 0.7 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#ff7040' }} />
          <p className="text-[12px]" style={{ color: '#ff7040' }}>
            Daily loss protection: {dailyLoss.toFixed(3)} / {MAX_DAILY_LOSS} SOL used today.
            {dailyLoss >= MAX_DAILY_LOSS ? " Limit reached — come back tomorrow." : " Getting close to your daily limit."}
          </p>
        </motion.div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Arena */}
        <div className="lg:col-span-2 space-y-3">
          <RoomSystem levelId={levelId} roomId={roomId}
            onRoomChange={(id) => {
              setRoomId(id);
              setPlayers(Array.from({ length: 12 }, (_, i) => makePlayer(uid + i + 1, W[(uid + i) % W.length])));
              toast(`Switched to Room #${id}`);
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
            <div className="flex items-center gap-3">
              {joined && <span className="text-[11px]" style={{ color: '#8892a4' }}>Hover to see steal odds</span>}
              {/* Leave Arena button */}
              {joined && (
                <button onClick={leaveArena}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all hover:bg-white/5"
                  style={{ color: '#8892a4', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <DoorOpen className="w-3.5 h-3.5" />
                  Leave Arena
                </button>
              )}
            </div>
          </div>

          {/* Wallet grid */}
          <motion.div
            variants={arenaGrid}
            initial="hidden"
            animate="show"
            className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 ${shaking ? 'screen-shake' : ''}`}
          >
            {players.map(p => {
              const pct      = (p.balance / maxBal) * 100;
              const isT      = target === p.id;
              const c        = chance(myBal, p.balance);
              const lvlColor = LEVEL_COLORS[(p.levelId ?? 1) - 1];
              const isKing   = p.isBounty && !p.isYou;
              const isPred   = !isKing && p.balance >= 1.5 && !p.isYou;
              const isCommon = !isKing && !isPred && p.balance >= 0.5 && !p.isYou;
              const tierClass = p.isYou ? "is-you" : isKing ? "wc-king" : isPred ? "wc-predator" : isCommon ? "wc-common" : "wc-dust";
              const balColor  = p.hit ? '#ffd700' : p.isYou ? '#00e5ff' : isKing ? '#ffd200' : isPred ? '#a060ff' : isCommon ? '#00d470' : '#a0a0c0';
              const barColor  = p.isYou ? 'linear-gradient(90deg,#00e5ff,#7000ff)' : isKing ? 'linear-gradient(90deg,#ffd200,#ffd700)' : isPred ? 'linear-gradient(90deg,#a060ff,#00e5ff)' : isCommon ? 'linear-gradient(90deg,#00e87a,#00c8e8)' : '#30304a';
              const stealAmt  = isKing ? parseFloat((p.balance * 0.9).toFixed(3)) : parseFloat((p.balance * 0.5).toFixed(3));
              // Protection badge
              const isProtected = !p.isYou && p.balance <= MIN_BALANCE_PROTECTION;

              return (
                <motion.div key={p.id}
                  variants={arenaCard}
                  onClick={() => !p.isYou && !isProtected && joined && setTarget(isT ? null : p.id)}
                  onMouseEnter={() => !p.isYou && joined && showTooltip(p.id)}
                  onMouseLeave={hideTooltip}
                  className={`wallet-card relative ${tierClass} ${isT ? "targeted" : ""} ${p.hit ? "hit" : ""} ${(!joined || p.isYou || isProtected) ? "!cursor-default" : ""}`}
                  style={{ marginTop: isKing ? '12px' : undefined }}
                >
                  {/* SVG tier background — GPU safe, no layout impact */}
                  {isKing && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }}>
                      <defs>
                        <linearGradient id={`kg-${p.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffd700" />
                          <stop offset="100%" stopColor="#ffd200" />
                        </linearGradient>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#kg-${p.id})`} rx="14" />
                    </svg>
                  )}
                  {isPred && (
                    <>
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.08 }}>
                        <defs>
                          <linearGradient id={`pd-${p.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7000ff" />
                            <stop offset="100%" stopColor="#00e5ff" />
                          </linearGradient>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#pd-${p.id})`} rx="14" />
                      </svg>
                      {/* Floating predator icon — mapped from wallet-address hash */}
                      {(() => {
                        const PI = predatorIcon(p.wallet);
                        return (
                          <PI className="absolute top-2 right-2 w-5 h-5 opacity-25 pointer-events-none float"
                            style={{ color: '#a060ff', filter: 'drop-shadow(0 0 4px rgba(160,96,255,0.4))' }} strokeWidth={2.2} />
                        );
                      })()}
                    </>
                  )}

                  {/* Tier particles */}
                  {isPred && <><span className="spark" /><span className="spark" /><span className="spark" /><span className="spark" /></>}
                  {isKing && <><span className="flame" /><span className="flame" /><span className="flame" /><span className="flame" /><span className="flame" /></>}

                  {/* Bounty label */}
                  {isKing && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold whitespace-nowrap flex items-center gap-1"
                      style={{ background: 'linear-gradient(135deg, rgba(255,210,0,0.95), rgba(255,140,0,0.95))', color: '#000', boxShadow: '0 2px 12px rgba(255,210,0,0.6), 0 0 20px rgba(255,215,0,0.3)' }}>
                      <Crown className="w-3 h-3" style={{ color: '#000' }} strokeWidth={2.5} /> BOUNTY
                    </div>
                  )}

                  {/* Protected badge */}
                  {isProtected && (
                    <div className="absolute top-1.5 right-1.5 z-10">
                      <Shield className="w-3 h-3" style={{ color: '#40d8f0' }} />
                    </div>
                  )}

                  {isT && (
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <Target className="w-3.5 h-3.5" style={{ color: '#ffd700' }} />
                    </div>
                  )}

                  {/* Tooltip */}
                  {joined && !p.isYou && tooltip === p.id && !isProtected && (
                    <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 px-3 py-2 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap pointer-events-none"
                      style={{ background: '#0c0c1a', border: `1px solid ${chanceColor(c)}40`, color: chanceColor(c), boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>
                      {c}% · steal {stealAmt} SOL · fee {(p.balance * 0.05).toFixed(3)}{isKing ? " ×BOUNTY" : ""}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent" style={{ borderTopColor: '#0c0c1a' }} />
                    </div>
                  )}
                  {joined && !p.isYou && tooltip === p.id && isProtected && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap pointer-events-none"
                      style={{ background: '#0c0c1a', border: '1px solid rgba(0,229,255,0.3)', color: '#40d8f0' }}>
                      Protected — balance too low to steal
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-mono text-[10px] truncate flex-1" style={{ color: p.isYou ? '#40d8f0' : '#8892a4' }}>
                      {p.isYou ? "YOU" : p.wallet}
                    </p>
                    {!p.isYou && (
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1"
                        style={{ background: `${lvlColor}18`, color: lvlColor, border: `1px solid ${lvlColor}30` }}>
                        {LEVEL_NAMES[(p.levelId ?? 1) - 1][0]}
                      </span>
                    )}
                  </div>

                  <p className={`font-display leading-none ${isKing ? "text-[30px]" : isPred ? "text-[26px]" : isCommon ? "text-[23px]" : "text-[21px]"}`}
                    style={{ color: balColor }}>
                    {p.balance.toFixed(3)}
                  </p>
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: '#30304a' }}>SOL</p>

                  <div className="wallet-bar mt-2">
                    <div className="wallet-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                  </div>

                  {!p.isYou && (
                    <span className="absolute bottom-2 right-2.5 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm"
                      style={{
                        color: isKing ? '#ffd200' : isPred ? '#a060ff' : isCommon ? '#00d470' : '#40405a',
                        background: isKing ? 'rgba(255,210,0,0.1)' : isPred ? 'rgba(160,96,255,0.1)' : isCommon ? 'rgba(0,212,112,0.08)' : 'transparent',
                        border: isKing ? '1px solid rgba(255,210,0,0.25)' : isPred ? '1px solid rgba(160,96,255,0.2)' : isCommon ? '1px solid rgba(0,212,112,0.15)' : 'none',
                        letterSpacing: '0.12em',
                      }}>
                      {isKing ? "KING" : isPred ? "PRED" : isCommon ? "COM" : "DUST"}
                    </span>
                  )}

                  {isT && (
                    <p className="text-[10px] font-mono font-bold mt-1.5" style={{ color: chanceColor(c) }}>
                      {c}% chance
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Action panel */}
        <div className="space-y-3">

          {/* Session P&L — shown when in arena */}
          {joined && (
            <div className="card-sm space-y-3">
              <h3 className="text-[11px] font-mono uppercase tracking-widest" style={{ color: '#8892a4' }}>This Session</h3>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: '#8892a4' }}>Entered</p>
                  <p className="font-mono font-bold mt-0.5 text-white">{entryAmount.toFixed(3)}</p>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: sessionPnL >= 0 ? 'rgba(0,212,112,0.07)' : 'rgba(255,215,0,0.07)', border: `1px solid ${sessionPnL >= 0 ? 'rgba(0,212,112,0.15)' : 'rgba(255,215,0,0.15)'}` }}>
                  <p style={{ color: '#8892a4' }}>P&L</p>
                  <p className="font-mono font-bold mt-0.5" style={{ color: sessionPnLColor }}>
                    {sessionPnL >= 0 ? "+" : ""}{sessionPnL.toFixed(3)}
                  </p>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.12)' }}>
                  <p style={{ color: '#8892a4' }}>Balance</p>
                  <p className="font-mono font-bold mt-0.5" style={{ color: '#00e5ff' }}>{myBal.toFixed(3)}</p>
                </div>
              </div>
              {/* Trend indicator */}
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5" style={{ color: '#00d470' }}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="font-mono">+{sessionWins.toFixed(3)} won</span>
                </div>
                <div className="flex items-center gap-1.5" style={{ color: '#ff7040' }}>
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span className="font-mono">-{sessionLosses.toFixed(3)} lost</span>
                </div>
              </div>
            </div>
          )}

          {/* Level / XP bar */}
          {joined && (
            <div className="card-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg font-display text-[13px] tracking-[0.06em]"
                    style={{ background: myLevel.badgeBg, color: myLevel.badgeColor, border: `1px solid ${myLevel.badgeColor}30` }}>
                    {myLevel.name}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: '#8892a4' }}>+{myLevel.successBonus}%</span>
                </div>
                {globalPity.current > 0 && (
                  <span className="text-[10px] font-mono px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(255,210,0,0.08)', color: '#ffd200', border: '1px solid rgba(255,210,0,0.18)' }}>
                    PITY x{Math.min(3, globalPity.current)}
                  </span>
                )}
              </div>
              {nextLevel && (
                <>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${myLevel.badgeColor}, ${myLevel.badgeColor}88)` }} />
                  </div>
                  <p className="text-[10px] font-mono" style={{ color: '#8892a4' }}>
                    {xpIntoLevel}/{xpNeeded} XP → <span style={{ color: nextLevel.badgeColor }}>{nextLevel.name}</span>
                  </p>
                </>
              )}
            </div>
          )}

          {/* REKT */}
          {isOut && (
            <div className="card-flat text-center space-y-3"
              style={{ border: '1px solid rgba(255,215,0,0.2)', background: 'rgba(255,215,0,0.04)' }}>
              <h3 className="font-display text-[22px] text-white tracking-[0.06em]">REKT</h3>
              <p className="text-[12px]" style={{ color: '#8892a4' }}>Balance hit zero. Re-enter to keep playing.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["0.1","0.25","0.5","1.0"].map(v => (
                  <button key={v} onClick={() => setStake(v)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all"
                    style={{
                      background: stake === v ? 'rgba(255,215,0,0.14)' : 'rgba(255,255,255,0.03)',
                      borderColor: stake === v ? 'rgba(255,215,0,0.45)' : 'rgba(255,255,255,0.08)',
                      color: stake === v ? '#ff7040' : '#8892a4',
                    }}>{v} SOL</button>
                ))}
              </div>
              <button onClick={() => { reEnter(); setTimeout(join, 50); }} className="btn-yoink w-full">
                <Zap className="w-4 h-4" /> RE-ENTER — {stake} SOL
              </button>
            </div>
          )}

          {/* ENTER */}
          {!joined && (
            <div className="card-flat space-y-4">
              <div>
                <h3 className="font-display text-[24px] text-white leading-none tracking-[0.06em] mb-1">ENTER ARENA</h3>
                <p className="text-[12px]" style={{ color: '#8892a4' }}>Lock SOL to start. You can leave anytime and get your remaining balance back.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["0.1","0.25","0.5","1.0","2.0"].map(v => (
                  <button key={v} onClick={() => setStake(v)}
                    className="px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all"
                    style={{
                      background: stake === v ? 'rgba(255,215,0,0.14)' : 'rgba(255,255,255,0.03)',
                      borderColor: stake === v ? 'rgba(255,215,0,0.45)' : 'rgba(255,255,255,0.08)',
                      color: stake === v ? '#ff7040' : '#8892a4',
                    }}>{v} SOL</button>
                ))}
              </div>
              <input type="number" value={stake} onChange={e => setStake(e.target.value)} className="input" placeholder="Custom..." />

              {/* Transparent risk breakdown */}
              <div className="rounded-xl p-3.5 space-y-2 text-[11px]"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[11px] font-semibold text-white mb-2">How your SOL is protected:</p>
                <div className="flex justify-between">
                  <span style={{ color: '#8892a4' }}>Your entry</span>
                  <span className="font-mono text-white">{stake} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#8892a4' }}>Max loss per yoink</span>
                  <span className="font-mono" style={{ color: '#ff7040' }}>5% of target's balance</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#8892a4' }}>Win payout</span>
                  <span className="font-mono" style={{ color: '#00d470' }}>50% of target's balance</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#8892a4' }}>Daily loss limit</span>
                  <span className="font-mono" style={{ color: '#a060ff' }}>{MAX_DAILY_LOSS} SOL max</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#8892a4' }}>Leave anytime</span>
                  <span className="font-mono" style={{ color: '#00d470' }}>Remaining SOL returned</span>
                </div>
              </div>

              <button onClick={join} className="btn-yoink w-full">
                <Zap className="w-4 h-4" /> ENTER — {stake} SOL
              </button>
              <p className="text-[10px] text-center" style={{ color: '#30304a' }}>
                You can leave the arena at any time to recover your remaining balance.
              </p>
            </div>
          )}

          {/* ATTACK */}
          {joined && !isOut && (
            <div className="card-flat space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[22px] text-white leading-none tracking-[0.06em]">YOINK ATTACK</h3>
                <div className="text-right">
                  <p className="text-[10px] font-mono" style={{ color: '#8892a4' }}>YOUR BALANCE</p>
                  <p className="font-display text-[20px] leading-none" style={{ color: '#00e5ff' }}>{myBal.toFixed(3)}</p>
                </div>
              </div>

              {tp ? (
                <div className="rounded-xl p-4 space-y-3"
                  style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderTop: '1px solid rgba(255,215,0,0.45)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono" style={{ color: '#8892a4' }}>TARGET LOCKED</p>
                      <p className="font-mono text-[12px] text-white mt-0.5">{tp.wallet}</p>
                    </div>
                    {tp.isBounty && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,210,0,0.18)', color: '#ffd200', border: '1px solid rgba(255,210,0,0.35)' }}>
                        BOUNTY
                      </span>
                    )}
                  </div>
                  <p className="font-display text-[38px] leading-none" style={{ color: tp.isBounty ? '#ffd200' : '#ff7040' }}>
                    {tp.balance.toFixed(3)} <span className="text-[14px]" style={{ color: '#8892a4' }}>SOL</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
                    <div className="rounded-lg p-2" style={{ background: 'rgba(0,212,112,0.07)', border: '1px solid rgba(0,212,112,0.12)' }}>
                      <p style={{ color: '#8892a4' }}>If you win</p>
                      <p className="font-mono font-bold mt-0.5" style={{ color: '#00d470' }}>+{(tp.balance*(tp.isBounty?0.9:0.5)).toFixed(3)}</p>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.12)' }}>
                      <p style={{ color: '#8892a4' }}>If you lose</p>
                      <p className="font-mono font-bold mt-0.5" style={{ color: '#ff7040' }}>-{maxFeeThisAttempt.toFixed(3)}</p>
                    </div>
                    <div className="rounded-lg p-2"
                      style={{ background: `${chanceColor(chance())}12`, border: `1px solid ${chanceColor(chance())}25` }}>
                      <p style={{ color: '#8892a4' }}>Your odds</p>
                      <p className="font-mono font-bold mt-0.5" style={{ color: chanceColor(chance()) }}>{chance()}%</p>
                    </div>
                  </div>
                  {/* Expected value indicator */}
                  <div className="flex items-center justify-between text-[10px] font-mono pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#8892a4' }}>Expected value this yoink</span>
                    <span style={{ color: (() => {
                      const ev = (chance() / 100) * (tp.balance*(tp.isBounty?0.9:0.5) - maxFeeThisAttempt) - ((100 - chance()) / 100) * maxFeeThisAttempt;
                      return ev >= 0 ? '#00d470' : '#ff7040';
                    })() }}>
                      {(() => {
                        const ev = (chance() / 100) * (tp.balance*(tp.isBounty?0.9:0.5) - maxFeeThisAttempt) - ((100 - chance()) / 100) * maxFeeThisAttempt;
                        return `${ev >= 0 ? '+' : ''}${ev.toFixed(3)} SOL`;
                      })()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-6 text-center border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <Target className="w-8 h-8 mx-auto mb-2" style={{ color: '#30304a' }} />
                  <p className="text-[12px]" style={{ color: '#8892a4' }}>Tap a wallet to lock your target</p>
                  <p className="text-[11px] mt-1" style={{ color: '#30304a' }}>Hover first to preview your odds</p>
                </div>
              )}

              <button onClick={yoink} disabled={!target || acting || dailyLoss >= MAX_DAILY_LOSS}
                className={`btn-yoink w-full ${target && !acting ? "pulsing" : ""}`}
                style={{ fontSize: '18px', padding: '14px' }}>
                {acting
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />STEALING...</>
                  : target && tp
                  ? `YOINK IT — ${chance()}% CHANCE`
                  : "SELECT A TARGET"
                }
              </button>

              <p className="text-[10px] flex items-center justify-center gap-1.5" style={{ color: '#30304a' }}>
                <AlertCircle className="w-3 h-3" />
                Max loss this attempt: {maxFeeThisAttempt.toFixed(3)} SOL (5% fee only).
              </p>
            </div>
          )}

          {/* Success rates */}
          <div className="card-sm space-y-2.5">
            <h3 className="text-[11px] font-mono uppercase tracking-widest" style={{ color: '#8892a4' }}>Your Odds By Balance Ratio</h3>
            {[
              { l: "You have 2x+ theirs",   pct: 75, c: "#00d470" },
              { l: "You have ~1x theirs",   pct: 60, c: "#40d8f0" },
              { l: "You have ~0.5x theirs", pct: 45, c: "#ffd200" },
              { l: "You have under 0.5x",   pct: 30, c: "#ff7040" },
            ].map(r => (
              <div key={r.l}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span style={{ color: '#8892a4' }}>{r.l}</span>
                  <span className="font-mono font-bold text-white">{r.pct}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.c }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card-sm flex items-start gap-3" style={{ background: 'rgba(0,229,255,0.025)', borderColor: 'rgba(0,229,255,0.08)' }}>
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#40d8f0' }} />
            <div>
              <p className="text-[12px] font-semibold text-white">Player Protections</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#8892a4' }}>
                Min balance shield at 0.05 SOL · Daily loss cap at {MAX_DAILY_LOSS} SOL · Leave arena anytime · Pity system improves odds after losses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile attack bar */}
      {joined && !isOut && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-y-border"
          style={{ background: 'rgba(7,7,16,0.97)', backdropFilter: 'blur(20px)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              {tp ? (
                <div>
                  <p className="text-[10px] font-mono" style={{ color: '#8892a4' }}>TARGET LOCKED</p>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[20px] leading-none" style={{ color: tp.isBounty ? '#ffd200' : '#ff7040' }}>
                      {tp.balance.toFixed(3)}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${chanceColor(chance())}15`, color: chanceColor(chance()) }}>
                      {chance()}%
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: '#ff7040' }}>
                      -{maxFeeThisAttempt.toFixed(3)} if fail
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[12px] font-semibold text-white">No target</p>
                  <p className="text-[10px]" style={{ color: '#8892a4' }}>Tap a wallet card above</p>
                </div>
              )}
            </div>
            <button onClick={yoink} disabled={!target || acting}
              className={`btn-yoink flex-shrink-0 ${target && !acting ? "pulsing" : ""}`}
              style={{ fontSize: '15px', padding: '11px 22px', letterSpacing: '2px' }}>
              {acting
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />...</>
                : target ? `YOINK — ${chance()}%` : "YOINK"
              }
            </button>
          </div>
        </motion.div>
      )}
      {joined && !isOut && <div className="lg:hidden h-20" />}
    </div>
  );
}
