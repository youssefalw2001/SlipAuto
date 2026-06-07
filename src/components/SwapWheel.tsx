import NumberFlow from "@number-flow/react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowDown, Info, RotateCcw, Shield, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface WheelPlayer { id: number; wallet: string; amount: number; color: string; isYou?: boolean; }
interface Result { winner: string; amount: number; loser: string; loserAmt: number; }

const COLORS = ["#ff4d00","#7000ff","#00e5ff","#00e87a","#ffd200","#ff0066","#00aaff","#ff6b35","#c026d3","#34d399"];
const W = ["7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x","Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w"];
let nid = 30;

const INIT: WheelPlayer[] = [
  { id:1, wallet:W[0], amount:0.5,  color:COLORS[0] },
  { id:2, wallet:W[1], amount:1.2,  color:COLORS[1] },
  { id:3, wallet:W[2], amount:0.3,  color:COLORS[2] },
  { id:4, wallet:W[3], amount:2.0,  color:COLORS[3] },
  { id:5, wallet:W[4], amount:0.8,  color:COLORS[4] },
  { id:6, wallet:W[5], amount:1.5,  color:COLORS[5] },
];

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arc(cx: number, cy: number, r: number, s: number, e: number) {
  const a = polar(cx, cy, r, s), b = polar(cx, cy, r, e);
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${b.x} ${b.y} Z`;
}

function fireSpin() {
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors: ['#ff4d00','#7000ff','#00e5ff','#00e87a','#ffd200'], zIndex: 9999 });
}

export default function SwapWheel() {
  const [players, setPlayers]       = useState<WheelPlayer[]>(INIT);
  const [spinning, setSpinning]     = useState(false);
  const [rotation, setRotation]     = useState(0);
  const [result, setResult]         = useState<Result | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory]       = useState<Result[]>([]);
  const [joinAmt, setJoinAmt]       = useState("0.5");
  const [joined, setJoined]         = useState(false);
  const [myBal, setMyBal]           = useState(0);
  const [myEntry, setMyEntry]       = useState(0);
  const [cd, setCd]                 = useState(30);
  const [warning, setWarning]       = useState(false);
  const [flash, setFlash]           = useState(false);
  const [sessionWins, setSessionWins]   = useState(0);
  const [sessionLosses, setSessionLosses] = useState(0);
  const lock = useRef(false);

  const total = players.reduce((s, p) => s + p.amount, 0);
  const myPlayer = players.find(p => p.isYou);
  const smallestDepositor = [...players].sort((a, b) => a.amount - b.amount)[0];
  const isSmallest = myPlayer && myPlayer.amount === smallestDepositor?.amount && players.length > 1;

  const segs = (() => {
    let a = 0;
    return players.map(p => {
      const pct = p.amount / total;
      const seg = { ...p, start: a, end: a + pct * 360, pct };
      a += pct * 360;
      return seg;
    });
  })();

  // Auto-add players
  useEffect(() => {
    const iv = setInterval(() => {
      if (!spinning && players.length < 10) {
        nid++;
        setPlayers(prev => [...prev, {
          id: nid,
          wallet: W[Math.floor(Math.random() * W.length)],
          amount: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
          color: COLORS[nid % COLORS.length],
        }]);
      }
    }, 4500);
    return () => clearInterval(iv);
  }, [spinning, players.length]);

  // Countdown
  useEffect(() => {
    if (spinning) return;
    const iv = setInterval(() => {
      setCd(c => {
        if (c === 6) setWarning(true);
        if (c <= 1) { setWarning(false); spin(); return 30; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [spinning]);

  const spin = () => {
    if (lock.current || players.length < 2) return;
    lock.current = true;
    setSpinning(true);
    setShowResult(false);
    setResult(null);

    let rand = Math.random() * total;
    let winner = players[0];
    for (const p of players) { rand -= p.amount; if (rand <= 0) { winner = p; break; } }
    const others = players.filter(p => p.id !== winner.id);
    // Loser = smallest depositor
    const loser = [...others].sort((a, b) => a.amount - b.amount)[0];

    const seg = segs.find(s => s.id === winner.id)!;
    const mid = (seg.start + seg.end) / 2;
    setRotation(prev => prev + 1440 + (360 - mid));

    setTimeout(() => {
      const amt = parseFloat((loser.amount * 0.9).toFixed(3));
      const res: Result = {
        winner: winner.isYou ? "You" : winner.wallet,
        amount: amt,
        loser: loser.isYou ? "You" : loser.wallet,
        loserAmt: loser.amount,
      };
      setResult(res);
      setShowResult(true);
      setHistory(h => [res, ...h.slice(0, 6)]);

      if (winner.isYou) {
        setMyBal(b => parseFloat((b + amt).toFixed(3)));
        setSessionWins(w => parseFloat((w + amt).toFixed(3)));
        setFlash(true); setTimeout(() => setFlash(false), 700);
        fireSpin();
        toast.success(`You won! +${amt} SOL from ${res.loser}`, { duration: 5000 });
      }
      if (loser.isYou) {
        setMyBal(b => parseFloat((b - loser.amount).toFixed(3)));
        setSessionLosses(l => parseFloat((l + loser.amount).toFixed(3)));
        toast.error(`You lost ${loser.amount} SOL this round`, { duration: 4000 });
      }

      setPlayers(prev => {
        const next = prev
          .filter(p => p.id !== loser.id)
          .map(p => p.id === winner.id ? { ...p, amount: parseFloat((p.amount + amt).toFixed(3)) } : p);
        return next.length < 2 ? INIT : next;
      });

      setSpinning(false);
      lock.current = false;
      setCd(30);
      setTimeout(() => setShowResult(false), 5000);
    }, 4500);
  };

  const cdColor = cd <= 5 ? "#ff4d00" : cd <= 10 ? "#ffd200" : "#00d470";
  const cdClass = cd <= 5 ? "glitch-text countdown-pulse" : "";
  const myChance = total > 0 ? (parseFloat(joinAmt || "0") / (total + parseFloat(joinAmt || "0"))) * 100 : 0;
  const amtVal = parseFloat(joinAmt || "0");
  const sessionPnL = sessionWins - sessionLosses;

  const handleJoin = () => {
    const v = parseFloat(joinAmt);
    if (!isNaN(v) && v >= 0.05) {
      nid++;
      setPlayers(prev => [...prev, { id: nid, wallet: "You", amount: v, color: COLORS[nid % COLORS.length], isYou: true }]);
      setMyBal(v); setMyEntry(v); setJoined(true);
      setSessionWins(0); setSessionLosses(0);
      toast.success(`Joined with ${v} SOL — wheel spins in ${cd}s`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Win flash */}
      <AnimatePresence>
        {flash && <motion.div key="flash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="win-flash" />}
      </AnimatePresence>

      {/* 5-second warning */}
      <AnimatePresence>
        {warning && !spinning && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-display text-[16px] tracking-[0.06em] text-white text-center"
            style={{ background: 'rgba(255,77,0,0.95)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 40px rgba(255,77,0,0.5)', letterSpacing: '3px' }}>
            WHEEL SPINS IN {cd}s — LAST CHANCE TO JOIN!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smallest depositor warning */}
      <AnimatePresence>
        {isSmallest && !spinning && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.25)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#ff7040' }} />
            <div>
              <p className="text-[12px] font-semibold" style={{ color: '#ff7040' }}>
                You are the smallest depositor — you are most at risk this round.
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: '#6060a0' }}>
                Add more SOL to reduce your risk, or wait for the next round.
              </p>
            </div>
            <button onClick={handleJoin} className="btn-yoink flex-shrink-0 text-[12px] py-2 px-4"
              style={{ background: 'linear-gradient(135deg,#7000ff,#4400cc)' }}>
              Add More
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <div className="card-hero">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-[48px] leading-none text-white tracking-[0.06em] mb-1">SWAP WHEEL</h1>
            <p className="text-[13px]" style={{ color: '#6060a0' }}>Deposit SOL · Wheel spins every 30s · Winner steals from the smallest depositor</p>
          </div>
          <div className="flex items-center gap-5">
            {[
              { val: players.length, label: "PLAYERS", color: "#a060ff" },
              { val: parseFloat(total.toFixed(2)), label: "SOL POT",  color: "#40d8f0",
                fmt: { minimumFractionDigits: 2, maximumFractionDigits: 2 } },
              { val: cd, label: "TO SPIN", color: cdColor, cls: cdClass },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className={`font-display text-[32px] leading-none ${(s as any).cls || ''}`} style={{ color: s.color }}>
                  <NumberFlow value={s.val} format={(s as any).fmt} />
                  {s.label === "TO SPIN" && "s"}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.1em] mt-1" style={{ color: '#6060a0' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explicit how it works — the KEY clarity piece */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: <Zap className="w-4 h-4" />,
            color: "#a060ff",
            t: "Deposit to join",
            d: "Put in any amount. Your slice of the wheel = your deposit ÷ total pot. Bigger deposit = more wheel = better odds."
          },
          {
            icon: <RotateCcw className="w-4 h-4" />,
            color: "#40d8f0",
            t: "Wheel picks a winner",
            d: "Wheel auto-spins every 30s. Winner is chosen by slice size. Bigger slice = higher chance. Winner takes 90% of what the smallest depositor put in."
          },
          {
            icon: <ArrowDown className="w-4 h-4" />,
            color: "#ff7040",
            t: "Smallest depositor loses",
            d: "The player with the smallest deposit loses 90% of their deposit to the winner. House keeps 10%. Don't be the smallest — or deposit enough to not be at the bottom."
          },
        ].map((s, i) => (
          <div key={i} className="card-sm flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
              style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
              {s.icon}
            </div>
            <div>
              <p className="text-[12px] font-bold text-white mb-1">{s.t}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: '#6060a0' }}>{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Wheel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-flat flex flex-col items-center py-10 relative overflow-visible">

            {/* Result screen */}
            <AnimatePresence>
              {showResult && result && (
                <motion.div initial={{ opacity: 0, scale: 0.85, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-4 z-20 rounded-2xl flex flex-col items-center justify-center text-center p-6"
                  style={{
                    background: 'rgba(7,7,16,0.97)',
                    border: result.winner === "You" ? '1px solid rgba(0,232,122,0.4)' : '1px solid rgba(255,77,0,0.3)',
                    backdropFilter: 'blur(24px)',
                  }}>
                  <div className="text-[10px] font-mono tracking-[0.14em] mb-3" style={{ color: '#6060a0' }}>ROUND RESULT</div>
                  <p className="font-display text-[24px] tracking-[0.06em]"
                    style={{ color: result.winner === "You" ? '#00d470' : '#eeeef8' }}>
                    {result.winner}
                  </p>
                  <p className="text-[12px] mb-1" style={{ color: '#6060a0' }}>won</p>
                  <p className="font-display text-[48px] leading-none text-white mb-1">+{result.amount}</p>
                  <p className="text-[12px] font-mono" style={{ color: '#6060a0' }}>
                    SOL — stolen from {result.loser} ({result.loserAmt.toFixed(3)} SOL lost)
                  </p>
                  <div className="mt-4 px-4 py-2 rounded-full text-[11px] font-mono"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#6060a0', border: '1px solid rgba(255,255,255,0.07)' }}>
                    New round starts in ~5s
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pointer */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
              <div className="relative">
                <div className="w-0 h-0 border-l-[11px] border-r-[11px] border-t-[20px] border-l-transparent border-r-transparent border-t-white/90"
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(255,77,0,0.5))' }} />
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ background: '#ff4d00', boxShadow: '0 0 8px #ff4d00' }} />
              </div>
            </div>

            {/* Wheel */}
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: spinning ? 4.5 : 0, ease: [0.06, 0.9, 0.07, 1] }}
              className="relative"
              style={{ filter: spinning ? 'drop-shadow(0 0 28px rgba(255,77,0,0.4)) drop-shadow(0 0 56px rgba(112,0,255,0.2))' : 'drop-shadow(0 0 16px rgba(112,0,255,0.15))' }}
            >
              {/* Outer ring glow */}
              <div className="wheel-ring-outer" />
              {/* Inner ring */}
              <div className="wheel-ring-inner" />

              <svg width="300" height="300" viewBox="0 0 300 300">
                {/* Multi-ring outer decoration */}
                <circle cx="150" cy="150" r="148" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <circle cx="150" cy="150" r="145" fill="none" stroke="rgba(112,0,255,0.12)" strokeWidth="0.5" strokeDasharray="4 8" />
                <circle cx="150" cy="150" r="142" fill="none" stroke="rgba(255,77,0,0.08)" strokeWidth="0.5" />

                {segs.map(seg => (
                  <g key={seg.id}>
                    <path d={arc(150, 150, 138, seg.start, seg.end)} fill={seg.color} opacity={0.82} stroke="#030308" strokeWidth="2.5" />
                    {seg.pct > 0.07 && (() => {
                      const mid = (seg.start + seg.end) / 2;
                      const pos = polar(150, 150, 90, mid);
                      return (
                        <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                          fill="white" fontSize="11" fontFamily="Geist Mono" fontWeight="600"
                          transform={`rotate(${mid},${pos.x},${pos.y})`}>
                          {seg.amount.toFixed(2)}
                        </text>
                      );
                    })()}
                    {/* Mark smallest with glowing ring */}
                    {seg.id === smallestDepositor?.id && !seg.isYou && (() => {
                      const mid = (seg.start + seg.end) / 2;
                      const pos = polar(150, 150, 115, mid);
                      return (
                        <g>
                          <circle cx={pos.x} cy={pos.y} r="6" fill="none" stroke="#ff4d00" strokeWidth="1.5" opacity="0.9" />
                          <circle cx={pos.x} cy={pos.y} r="3" fill="#ff4d00" opacity="0.6" />
                        </g>
                      );
                    })()}
                  </g>
                ))}
                {/* Inner circle — multi-layer center */}
                <circle cx="150" cy="150" r="38" fill="#030308" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <circle cx="150" cy="150" r="34" fill="rgba(7,7,16,0.95)" stroke="rgba(112,0,255,0.4)" strokeWidth="1.5" />
                <circle cx="150" cy="150" r="28" fill="rgba(112,0,255,0.08)" stroke="rgba(112,0,255,0.25)" strokeWidth="1" />
                <text x="150" y="152" textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="13" fontFamily="Bebas Neue" letterSpacing="3">SOL</text>
              </svg>

              {/* Violet center aura (behind wheel center) */}
              <div className="wheel-center-aura aura-pulse" />
            </motion.div>

            <p className="text-[10px] font-mono mt-3 flex items-center gap-2 justify-center" style={{ color: '#6060a0' }}>
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#ff4d00', boxShadow: '0 0 6px #ff4d00' }} />
              Glowing dot = smallest depositor (most at risk)
            </p>

            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={spin}
              disabled={spinning || players.length < 2} className="btn-yoink mt-4 px-12"
              style={{ fontSize: '17px', background: 'linear-gradient(135deg,#7000ff,#4400cc)' }}>
              {spinning ? <><RotateCcw className="w-4 h-4 animate-spin" />SPINNING...</> : <><RotateCcw className="w-4 h-4" />SPIN NOW</>}
            </motion.button>
          </div>

          {/* Player bars with at-risk indicator */}
          <div className="card-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-mono uppercase tracking-[0.12em]" style={{ color: '#6060a0' }}>Players in Round</h3>
              <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: '#ff7040' }}>
                <AlertCircle className="w-3 h-3" /> Red dot = at risk
              </span>
            </div>
            {[...players].sort((a, b) => b.amount - a.amount).map(p => {
              const atRisk = p.id === smallestDepositor?.id && players.length > 1;
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <div className="flex items-center gap-2">
                      {atRisk && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ff4d00' }} />}
                      <span className="font-mono" style={{ color: p.isYou ? '#40d8f0' : '#eeeef8' }}>{p.isYou ? "YOU" : p.wallet}</span>
                      {atRisk && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,77,0,0.12)', color: '#ff7040', border: '1px solid rgba(255,77,0,0.25)' }}>AT RISK</span>}
                    </div>
                    <div className="flex gap-3">
                      <span style={{ color: '#6060a0' }}>{((p.amount / total) * 100).toFixed(1)}% chance</span>
                      <span className="font-mono font-bold" style={{ color: p.color }}>{p.amount.toFixed(3)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div animate={{ width: `${(p.amount / total) * 100}%` }} transition={{ duration: 0.6 }}
                      className="h-full rounded-full" style={{ background: atRisk ? '#ff4d00' : p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">

          {/* Session P&L when joined */}
          {joined && (
            <div className="card-sm space-y-3">
              <h3 className="text-[11px] font-mono uppercase tracking-widest" style={{ color: '#6060a0' }}>This Session</h3>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: '#6060a0' }}>Entered</p>
                  <p className="font-mono font-bold mt-0.5 text-white">{myEntry.toFixed(3)}</p>
                </div>
                <div className="rounded-lg p-2.5"
                  style={{ background: sessionPnL >= 0 ? 'rgba(0,212,112,0.07)' : 'rgba(255,77,0,0.07)', border: `1px solid ${sessionPnL >= 0 ? 'rgba(0,212,112,0.15)' : 'rgba(255,77,0,0.15)'}` }}>
                  <p style={{ color: '#6060a0' }}>P&L</p>
                  <p className="font-mono font-bold mt-0.5" style={{ color: sessionPnL >= 0 ? '#00d470' : '#ff7040' }}>
                    {sessionPnL >= 0 ? "+" : ""}{sessionPnL.toFixed(3)}
                  </p>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.12)' }}>
                  <p style={{ color: '#6060a0' }}>Balance</p>
                  <p className="font-mono font-bold mt-0.5" style={{ color: '#00d470' }}>{myBal.toFixed(3)}</p>
                </div>
              </div>
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

          {/* Join panel */}
          {!joined ? (
            <div className="card-flat space-y-5">
              <div>
                <h3 className="font-display text-[24px] text-white leading-none tracking-[0.06em] mb-1">JOIN ROUND</h3>
                <p className="text-[12px]" style={{ color: '#6060a0' }}>Bigger deposit = bigger wheel slice = higher win chance</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["0.1","0.25","0.5","1.0","2.0"].map(v => (
                  <motion.button key={v} whileTap={{ scale: 0.93 }} onClick={() => setJoinAmt(v)}
                    className="px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all"
                    style={{
                      background: joinAmt === v ? 'rgba(112,0,255,0.14)' : 'rgba(255,255,255,0.03)',
                      borderColor: joinAmt === v ? 'rgba(112,0,255,0.45)' : 'rgba(255,255,255,0.08)',
                      color: joinAmt === v ? '#a060ff' : '#6060a0',
                    }}>{v} SOL
                  </motion.button>
                ))}
              </div>
              <input type="number" value={joinAmt} onChange={e => setJoinAmt(e.target.value)} className="input" placeholder="Custom..." />

              {/* Clear risk breakdown BEFORE joining */}
              <div className="rounded-xl p-4 space-y-2.5 text-[11px]"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[11px] font-semibold text-white mb-2">What happens when you join:</p>
                <div className="flex justify-between">
                  <span style={{ color: '#6060a0' }}>Your win chance</span>
                  <span className="font-mono font-bold" style={{ color: '#a060ff' }}>{myChance.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6060a0' }}>If you win</span>
                  <span className="font-mono" style={{ color: '#00d470' }}>up to {total.toFixed(2)} SOL</span>
                </div>
                <div className="divider" />
                <div className="flex justify-between">
                  <span style={{ color: '#6060a0' }}>Who loses each round?</span>
                  <span className="font-mono font-semibold" style={{ color: '#ff7040' }}>Smallest depositor</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6060a0' }}>Are you the smallest?</span>
                  <span className="font-mono font-semibold"
                    style={{ color: amtVal < smallestDepositor?.amount ? '#ff7040' : '#00d470' }}>
                    {amtVal < smallestDepositor?.amount ? "YES — increase deposit" : "No — you're safe"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6060a0' }}>House fee</span>
                  <span className="font-mono" style={{ color: '#6060a0' }}>10% of amount stolen</span>
                </div>
              </div>

              {/* Warning if they'd be the smallest */}
              {amtVal > 0 && amtVal <= smallestDepositor?.amount && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-[11px]"
                  style={{ background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.2)' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ff7040' }} />
                  <p style={{ color: '#ff7040' }}>
                    At {joinAmt} SOL you'd be the smallest depositor — most at risk of losing.
                    Deposit more than <strong>{smallestDepositor?.amount.toFixed(3)} SOL</strong> to avoid being the target.
                  </p>
                </div>
              )}

              <button onClick={handleJoin} className="btn-yoink w-full"
                style={{ background: 'linear-gradient(135deg,#7000ff,#4400cc)' }}>
                <Zap className="w-4 h-4" /> JOIN — {joinAmt} SOL
              </button>
            </div>
          ) : (
            <div className="card-sm space-y-3"
              style={{ background: 'rgba(0,232,122,0.04)', border: '1px solid rgba(0,232,122,0.15)' }}>
              <p className="text-[13px] font-bold" style={{ color: '#00d470' }}>You're in this round</p>
              <div>
                <p className={`font-display text-[30px] leading-none ${cdClass}`} style={{ color: cdColor }}>
                  <NumberFlow value={cd} />s
                </p>
                <p className="text-[11px] font-mono mt-1" style={{ color: '#6060a0' }}>until the wheel spins</p>
              </div>
              <div className="divider" />
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span style={{ color: '#6060a0' }}>Your balance</span>
                  <span className="font-mono font-bold" style={{ color: '#00d470' }}>{myBal.toFixed(3)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6060a0' }}>Win chance</span>
                  <span className="font-mono font-bold" style={{ color: '#a060ff' }}>
                    {((myBal / total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6060a0' }}>Your risk</span>
                  <span className="font-mono font-bold" style={{ color: isSmallest ? '#ff7040' : '#00d470' }}>
                    {isSmallest ? "HIGH — smallest depositor" : "Low — not at bottom"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* History */}
          <div className="card-sm space-y-2.5">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.12em] mb-3" style={{ color: '#6060a0' }}>Recent Spins</h3>
            {history.length === 0 ? (
              <p className="text-[11px] text-center py-4" style={{ color: '#30304a' }}>No spins yet this session</p>
            ) : history.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl text-[11px]"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p className="font-mono font-semibold" style={{ color: '#00d470' }}>{h.winner}</p>
                  <p style={{ color: '#30304a' }}>stole from {h.loser}</p>
                </div>
                <span className="font-display text-[16px]" style={{ color: '#00d470' }}>+{h.amount}</span>
              </motion.div>
            ))}
          </div>

          {/* Protections */}
          <div className="card-sm flex items-start gap-3"
            style={{ background: 'rgba(0,229,255,0.025)', borderColor: 'rgba(0,229,255,0.08)' }}>
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#40d8f0' }} />
            <div>
              <p className="text-[12px] font-semibold text-white">Fair play guarantees</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#6060a0' }}>
                Odds clearly shown before joining · Smallest depositor risk always displayed · Winner determined by provably fair on-chain randomness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
