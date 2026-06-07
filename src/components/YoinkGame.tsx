import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Crosshair, Shield, Target, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getLevelByXP, getXPProgress, XP_REWARDS } from "../lib/levels";
import RoomSystem from "./RoomSystem";

interface Player {
  id: number;
  wallet: string;
  balance: number;
  isYou: boolean;
  hit?: boolean;
  levelId: number;
  isBounty?: boolean;
}

const W = [
  "7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x",
  "Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w",
  "Ux1f...Dm6y","Nt4g...Sb7i","Rk5h...Oc2p","Wj9i...Ef3n",
  "Lp2k...Mx7t","Dv5n...Qs9b","Cy4h...Tz8r","Ab6j...Wu3o",
];

const LEVEL_COLORS = ["#a0a0b0","#00d470","#a060ff","#ff4d00"];
const LEVEL_NAMES  = ["ROOKIE","HUSTLER","PREDATOR","APEX"];
const BOUNTY_THRESHOLD = 3.0;

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
  confetti({ ...o, particleCount: 60, origin: { x: 0.35, y: 0.4 }, colors: ['#ff4d00','#ffd200','#00e87a'] });
  confetti({ ...o, particleCount: 50, origin: { x: 0.65, y: 0.4 }, colors: ['#7000ff','#ff0066','#ffd200'] });
}

interface Props { xp: number; onXPGain: (xp: number, reason?: string) => void; levelId: number; wallet: string | null; }

export default function YoinkGame({ xp, onXPGain, levelId, wallet }: Props) {
  const [players, setPlayers]   = useState<Player[]>(SEED);
  const [myBal, setMyBal]       = useState(0);
  const [target, setTarget]     = useState<number | null>(null);
  const [stake, setStake]       = useState("0.25");
  const [acting, setActing]     = useState(false);
  const [joined, setJoined]     = useState(false);
  const [flash, setFlash]       = useState<"win"|"lose"|null>(null);
  const [stolen, setStolen]     = useState(284.1);
  const [rounds, setRounds]     = useState(1847);
  const [livePlayers, setLive]  = useState(14);
  const [tooltip, setTooltip]   = useState<number | null>(null);
  const [roomId, setRoomId]     = useState(() => Math.floor(Math.random() * 200) + 300);
  const globalPity              = useRef(0);
  const tooltipTimer            = useRef<ReturnType<typeof setTimeout>>();

  // ── Slower simulation — 6s interval, no layout thrashing ──
  useEffect(() => {
    const iv = setInterval(() => {
      setPlayers(prev => {
        const arr = [...prev];
        const a = Math.floor(Math.random() * arr.length);
        const b = Math.floor(Math.random() * arr.length);
        if (a === b || arr[a].isYou || arr[b].isYou) return arr;
        const amt = parseFloat((arr[b].balance * (0.15 + Math.random() * 0.3)).toFixed(3));
        const nb = Math.max(0.05, parseFloat((arr[b].balance - amt).toFixed(3)));
        const na = parseFloat((arr[a].balance + amt * 0.9).toFixed(3));
        arr[a] = { ...arr[a], balance: na, isBounty: na >= BOUNTY_THRESHOLD };
        arr[b] = { ...arr[b], balance: nb, hit: true, isBounty: nb >= BOUNTY_THRESHOLD };
        // clear hit flag after delay — separate update
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === arr[b].id ? { ...pl, hit: false } : pl)), 800);
        setStolen(s => parseFloat((s + amt).toFixed(2)));
        return arr;
      });
      // Occasionally replace a player — less frequent
      if (Math.random() > 0.85) {
        uid++;
        setPlayers(prev => {
          const n = prev.length >= 14 ? prev.slice(1) : prev;
          return [...n, makePlayer(uid, W[uid % W.length])];
        });
        setLive(l => Math.max(8, l + (Math.random() > 0.5 ? 1 : -1)));
      }
      setRounds(r => r + (Math.random() > 0.7 ? 1 : 0));
    }, 6000); // slowed from 3200ms to 6000ms
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

  const join = () => {
    const v = parseFloat(stake);
    if (isNaN(v) || v < 0.05) return;
    setJoined(true);
    setMyBal(v);
    uid++;
    setPlayers(prev => [...prev, { id: uid, wallet: "You", balance: v, isYou: true, levelId, isBounty: v >= BOUNTY_THRESHOLD }]);
    onXPGain(XP_REWARDS.ENTER_ARENA, "enter_arena");
    toast.success(`Entered arena with ${v} SOL`);
  };

  const reEnter = () => {
    setJoined(false); setTarget(null); setMyBal(0);
    globalPity.current = 0;
    setPlayers(prev => prev.filter(p => !p.isYou));
  };

  const yoink = () => {
    if (!target || !tp || acting) return;
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
        setPlayers(prev => prev.map(p => {
          if (p.id === target) { const nb = parseFloat((p.balance - gain).toFixed(3)); return { ...p, balance: nb, hit: true, isBounty: nb >= BOUNTY_THRESHOLD }; }
          if (p.isYou) { const nb = parseFloat((p.balance + gain - fee).toFixed(3)); return { ...p, balance: nb, isBounty: nb >= BOUNTY_THRESHOLD }; }
          return p;
        }));
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === target ? { ...pl, hit: false } : pl)), 800);
        onXPGain(XP_REWARDS.YOINK_SUCCESS, "yoink_win");
        setStolen(s => parseFloat((s + gain).toFixed(2)));
        setRounds(r => r + 1);
        setFlash("win"); setTimeout(() => setFlash(null), 600);
        fireCelebration();
        toast.success(`+${gain} SOL stolen from ${tp.wallet}`, { duration: 3500 });
      } else {
        globalPity.current += 1;
        setMyBal(b => parseFloat((b - fee).toFixed(3)));
        setPlayers(prev => prev.map(p => p.isYou ? { ...p, balance: parseFloat((p.balance - fee).toFixed(3)) } : p));
        setRounds(r => r + 1);
        setFlash("lose"); setTimeout(() => setFlash(null), 500);
        const pityMsg = globalPity.current >= 2 ? ` — odds improving` : "";
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

  const showTooltip = (id: number) => {
    clearTimeout(tooltipTimer.current);
    setTooltip(id);
  };
  const hideTooltip = () => {
    tooltipTimer.current = setTimeout(() => setTooltip(null), 150);
  };

  return (
    <div className="space-y-5">
      {/* Flash overlays */}
      <AnimatePresence>
        {flash && (
          <motion.div key={flash} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={flash === "win" ? "win-flash" : "lose-flash"} />
        )}
      </AnimatePresence>

      {/* Hero */}
      <div className="card-hero">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="pill pill-live"><span className="w-1.5 h-1.5 rounded-full bg-y-green blink" /> LIVE</span>
              <span className="text-[12px] font-mono" style={{ color: '#6060a0' }}>{livePlayers} in arena</span>
            </div>
            <h1 className="font-display text-[48px] leading-none text-white tracking-[0.06em] mb-1.5">
              YOINK<span style={{ color: '#ff4d00' }}>.GG</span>
            </h1>
            <p className="text-[13px]" style={{ color: '#6060a0' }}>Target a wallet. Pay the fee. Steal their SOL.</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="font-display text-[38px] leading-none" style={{ color: '#ff7040' }}>
                {stolen.toFixed(1)}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest mt-1" style={{ color: '#6060a0' }}>SOL Stolen</div>
            </div>
            <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="text-center">
              <div className="font-display text-[38px] leading-none" style={{ color: '#a060ff' }}>
                {rounds.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest mt-1" style={{ color: '#6060a0' }}>Rounds</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { n:"01", c:"#ff4d00", t:"Lock SOL",      d:"Your entry = your live balance in the arena" },
          { n:"02", c:"#a060ff", t:"Pick Target",    d:"See everyone's balance. Hover for steal odds" },
          { n:"03", c:"#40d8f0", t:"Pay Fee",        d:"5% fee. Win 50% of their balance. Lose = fee only" },
          { n:"04", c:"#00d470", t:"Compound Wins",  d:"Grow your balance. Better odds. Bigger steals" },
        ].map(s => (
          <div key={s.n} className="card-sm">
            <div className="text-[10px] font-mono tracking-widest mb-1.5" style={{ color: '#30304a' }}>{s.n}</div>
            <div className="text-[12px] font-bold text-white mb-1">{s.t}</div>
            <div className="text-[11px] leading-snug" style={{ color: '#6060a0' }}>{s.d}</div>
          </div>
        ))}
      </div>

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
            {joined && <span className="text-[11px]" style={{ color: '#6060a0' }}>Hover wallet to see odds</span>}
          </div>

          {/* Wallet grid — no AnimatePresence/layout for perf */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {players.map(p => {
              const pct       = (p.balance / maxBal) * 100;
              const isT       = target === p.id;
              const c         = chance(myBal, p.balance);
              const lvlColor  = LEVEL_COLORS[(p.levelId ?? 1) - 1];
              const isKing    = p.isBounty && !p.isYou;
              const isPred    = !isKing && p.balance >= 1.5 && !p.isYou;
              const isCommon  = !isKing && !isPred && p.balance >= 0.5 && !p.isYou;

              // Tier CSS — clean, no infinite animations on base state
              const tierClass = p.isYou ? "is-you"
                : isKing    ? "wc-king"
                : isPred    ? "wc-predator"
                : isCommon  ? "wc-common"
                : "wc-dust";

              const balColor = p.hit ? '#ff4d00'
                : p.isYou   ? '#00e5ff'
                : isKing    ? '#ffd200'
                : isPred    ? '#a060ff'
                : isCommon  ? '#00d470'
                : '#a0a0c0';

              const barColor = p.isYou   ? 'linear-gradient(90deg,#00e5ff,#7000ff)'
                : isKing    ? 'linear-gradient(90deg,#ffd200,#ff4d00)'
                : isPred    ? 'linear-gradient(90deg,#a060ff,#00e5ff)'
                : isCommon  ? 'linear-gradient(90deg,#00e87a,#00c8e8)'
                : '#30304a';

              const stealAmt = isKing
                ? parseFloat((p.balance * 0.9).toFixed(3))
                : parseFloat((p.balance * 0.5).toFixed(3));

              return (
                <div
                  key={p.id}
                  onClick={() => !p.isYou && joined && setTarget(isT ? null : p.id)}
                  onMouseEnter={() => !p.isYou && joined && showTooltip(p.id)}
                  onMouseLeave={hideTooltip}
                  className={`wallet-card relative ${tierClass} ${isT ? "targeted" : ""} ${p.hit ? "hit" : ""} ${(!joined || p.isYou) ? "!cursor-default" : ""}`}
                  style={{ marginTop: isKing ? '12px' : undefined }}
                >
                  {/* Tier particles — only on hover, CSS-only */}
                  {isPred && (
                    <>
                      <span className="spark" />
                      <span className="spark" />
                    </>
                  )}
                  {isKing && (
                    <>
                      <span className="flame" />
                      <span className="flame" />
                    </>
                  )}

                  {/* Bounty label */}
                  {isKing && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold whitespace-nowrap"
                      style={{ background: 'rgba(255,210,0,0.9)', color: '#000', boxShadow: '0 2px 10px rgba(255,210,0,0.5)' }}>
                      BOUNTY
                    </div>
                  )}

                  {/* Target icon */}
                  {isT && (
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <Target className="w-3.5 h-3.5" style={{ color: '#ff4d00' }} />
                    </div>
                  )}

                  {/* Hover tooltip — CSS transition, not motion.div */}
                  {joined && !p.isYou && tooltip === p.id && (
                    <div
                      className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold whitespace-nowrap pointer-events-none"
                      style={{
                        background: '#0c0c1a',
                        border: `1px solid ${chanceColor(c)}40`,
                        color: chanceColor(c),
                        boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                      }}
                    >
                      {c}% · steal {stealAmt} SOL{isKing ? " ×BOUNTY" : ""}
                    </div>
                  )}

                  {/* Wallet + level badge */}
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-mono text-[10px] truncate flex-1"
                      style={{ color: p.isYou ? '#40d8f0' : '#6060a0' }}>
                      {p.isYou ? "YOU" : p.wallet}
                    </p>
                    {!p.isYou && (
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1"
                        style={{ background: `${lvlColor}18`, color: lvlColor, border: `1px solid ${lvlColor}30` }}>
                        {LEVEL_NAMES[(p.levelId ?? 1) - 1][0]}
                      </span>
                    )}
                  </div>

                  {/* Balance */}
                  <p className={`font-display leading-none ${
                    isKing   ? "text-[30px]"
                    : isPred ? "text-[26px]"
                    : isCommon ? "text-[23px]"
                    : "text-[21px]"
                  }`} style={{ color: balColor }}>
                    {p.balance.toFixed(3)}
                  </p>
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: '#30304a' }}>SOL</p>

                  {/* Balance bar */}
                  <div className="wallet-bar mt-2">
                    <div className="wallet-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                  </div>

                  {/* Tier text label */}
                  {!p.isYou && (
                    <span className="absolute bottom-2 right-2.5 text-[8px] font-mono"
                      style={{ color: isKing ? '#ffd200' : isPred ? '#a060ff' : isCommon ? '#00d470' : '#40405a' }}>
                      {isKing ? "KING" : isPred ? "PRED" : isCommon ? "COM" : "DUST"}
                    </span>
                  )}

                  {/* Targeted success % */}
                  {isT && (
                    <p className="text-[10px] font-mono font-bold mt-1.5"
                      style={{ color: chanceColor(c) }}>
                      {c}% chance
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action panel */}
        <div className="space-y-3">

          {/* Level / XP bar */}
          {joined && (
            <div className="card-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg font-display text-[13px] tracking-[0.06em]"
                    style={{ background: myLevel.badgeBg, color: myLevel.badgeColor, border: `1px solid ${myLevel.badgeColor}30` }}>
                    {myLevel.name}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: '#6060a0' }}>+{myLevel.successBonus}%</span>
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
                  <p className="text-[10px] font-mono" style={{ color: '#6060a0' }}>
                    {xpIntoLevel}/{xpNeeded} XP → <span style={{ color: nextLevel.badgeColor }}>{nextLevel.name}</span>
                  </p>
                </>
              )}
            </div>
          )}

          {/* REKT */}
          {isOut && (
            <div className="card-flat text-center space-y-3"
              style={{ border: '1px solid rgba(255,77,0,0.2)', background: 'rgba(255,77,0,0.04)' }}>
              <h3 className="font-display text-[22px] text-white tracking-[0.06em]">REKT</h3>
              <p className="text-[12px]" style={{ color: '#6060a0' }}>Balance hit zero. Re-enter to keep playing.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["0.1","0.25","0.5","1.0"].map(v => (
                  <button key={v} onClick={() => setStake(v)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all"
                    style={{
                      background: stake === v ? 'rgba(255,77,0,0.14)' : 'rgba(255,255,255,0.03)',
                      borderColor: stake === v ? 'rgba(255,77,0,0.45)' : 'rgba(255,255,255,0.08)',
                      color: stake === v ? '#ff7040' : '#6060a0',
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
                <p className="text-[12px]" style={{ color: '#6060a0' }}>Lock SOL to start stealing</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["0.1","0.25","0.5","1.0","2.0"].map(v => (
                  <button key={v} onClick={() => setStake(v)}
                    className="px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all"
                    style={{
                      background: stake === v ? 'rgba(255,77,0,0.14)' : 'rgba(255,255,255,0.03)',
                      borderColor: stake === v ? 'rgba(255,77,0,0.45)' : 'rgba(255,255,255,0.08)',
                      color: stake === v ? '#ff7040' : '#6060a0',
                    }}>{v} SOL</button>
                ))}
              </div>
              <input type="number" value={stake} onChange={e => setStake(e.target.value)} className="input" placeholder="Custom..." />
              <div className="rounded-xl p-3.5 space-y-2 text-[11px]"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Entry</span><span className="font-mono text-white">{stake} SOL</span></div>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Fee per yoink</span><span className="font-mono" style={{ color: '#ff7040' }}>5% of target</span></div>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Win payout</span><span className="font-mono" style={{ color: '#00d470' }}>50% of target</span></div>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Fee charged</span><span className="font-mono" style={{ color: '#a060ff' }}>Win OR lose</span></div>
              </div>
              <button onClick={join} className="btn-yoink w-full">
                <Zap className="w-4 h-4" /> ENTER — {stake} SOL
              </button>
            </div>
          )}

          {/* ATTACK */}
          {joined && !isOut && (
            <div className="card-flat space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[22px] text-white leading-none tracking-[0.06em]">YOINK ATTACK</h3>
                <div className="text-right">
                  <p className="text-[10px] font-mono" style={{ color: '#6060a0' }}>YOUR BALANCE</p>
                  <p className="font-display text-[20px] leading-none" style={{ color: '#00e5ff' }}>{myBal.toFixed(3)}</p>
                </div>
              </div>

              {tp ? (
                <div className="rounded-xl p-4 space-y-3"
                  style={{ background: 'rgba(255,77,0,0.05)', border: '1px solid rgba(255,77,0,0.2)', borderTop: '1px solid rgba(255,77,0,0.45)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono" style={{ color: '#6060a0' }}>TARGET LOCKED</p>
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
                    {tp.balance.toFixed(3)} <span className="text-[14px]" style={{ color: '#6060a0' }}>SOL</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
                    <div className="rounded-lg p-2" style={{ background: 'rgba(0,212,112,0.07)', border: '1px solid rgba(0,212,112,0.12)' }}>
                      <p style={{ color: '#6060a0' }}>Steal</p>
                      <p className="font-mono font-bold mt-0.5" style={{ color: '#00d470' }}>+{(tp.balance*(tp.isBounty?0.9:0.5)).toFixed(3)}</p>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.12)' }}>
                      <p style={{ color: '#6060a0' }}>Fee</p>
                      <p className="font-mono font-bold mt-0.5" style={{ color: '#ff7040' }}>-{(tp.balance*0.05).toFixed(3)}</p>
                    </div>
                    <div className="rounded-lg p-2"
                      style={{ background: `${chanceColor(chance())}12`, border: `1px solid ${chanceColor(chance())}25` }}>
                      <p style={{ color: '#6060a0' }}>Chance</p>
                      <p className="font-mono font-bold mt-0.5" style={{ color: chanceColor(chance()) }}>{chance()}%</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-6 text-center border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <Target className="w-8 h-8 mx-auto mb-2" style={{ color: '#30304a' }} />
                  <p className="text-[12px]" style={{ color: '#6060a0' }}>Tap a wallet to lock your target</p>
                </div>
              )}

              <button
                onClick={yoink}
                disabled={!target || acting}
                className={`btn-yoink w-full ${target && !acting ? "pulsing" : ""}`}
                style={{ fontSize: '18px', padding: '14px' }}
              >
                {acting
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />STEALING...</>
                  : target && tp
                  ? `YOINK IT — ${chance()}%`
                  : "SELECT A TARGET"
                }
              </button>

              <p className="text-[10px] flex items-center justify-center gap-1.5" style={{ color: '#30304a' }}>
                <AlertCircle className="w-3 h-3" />
                Fee charged win or lose.
              </p>
            </div>
          )}

          {/* Success rates */}
          <div className="card-sm space-y-2.5">
            <h3 className="text-[11px] font-mono uppercase tracking-widest" style={{ color: '#6060a0' }}>Success Rates</h3>
            {[
              { l: "2x+ their balance",   pct: 75, c: "#00d470" },
              { l: "~1x their balance",   pct: 60, c: "#40d8f0" },
              { l: "~0.5x their balance", pct: 45, c: "#ffd200" },
              { l: "Under 0.5x",          pct: 30, c: "#ff7040" },
            ].map(r => (
              <div key={r.l}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span style={{ color: '#6060a0' }}>{r.l}</span>
                  <span className="font-mono font-bold text-white">{r.pct}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.c }} />
                </div>
              </div>
            ))}
          </div>

          {/* Shield */}
          <div className="card-sm flex items-start gap-3" style={{ background: 'rgba(0,229,255,0.025)', borderColor: 'rgba(0,229,255,0.08)' }}>
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#40d8f0' }} />
            <div>
              <p className="text-[12px] font-semibold text-white">Provably Fair</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#6060a0' }}>On-chain via Switchboard VRF. Zero manipulation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile attack bar */}
      {joined && !isOut && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-y-border"
          style={{ background: 'rgba(7,7,16,0.97)', backdropFilter: 'blur(20px)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              {tp ? (
                <div>
                  <p className="text-[10px] font-mono" style={{ color: '#6060a0' }}>TARGET LOCKED</p>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[20px] leading-none" style={{ color: tp.isBounty ? '#ffd200' : '#ff7040' }}>
                      {tp.balance.toFixed(3)}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${chanceColor(chance())}15`, color: chanceColor(chance()) }}>
                      {chance()}%
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[12px] font-semibold text-white">No target</p>
                  <p className="text-[10px]" style={{ color: '#6060a0' }}>Tap a wallet card above</p>
                </div>
              )}
            </div>
            <button
              onClick={yoink}
              disabled={!target || acting}
              className={`btn-yoink flex-shrink-0 ${target && !acting ? "pulsing" : ""}`}
              style={{ fontSize: '15px', padding: '11px 22px', letterSpacing: '2px' }}
            >
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
