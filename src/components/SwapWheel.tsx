import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, RotateCcw, Users, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface WheelPlayer {
  id: number;
  wallet: string;
  amount: number;
  color: string;
  isYou?: boolean;
}

interface SpinResult {
  winner: string;
  amount: number;
  loser: string;
}

const COLORS = ["#e63956","#9333ea","#22d3ee","#34d399","#eab308","#f97316","#ec4899","#06b6d4","#84cc16","#fbbf24"];
const W = ["7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x","Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w"];

let nid = 30;

const initPlayers: WheelPlayer[] = [
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
  const start = polar(cx, cy, r, s);
  const end = polar(cx, cy, r, e);
  const lg = e - s > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${lg} 1 ${end.x} ${end.y} Z`;
}

export default function SwapWheel() {
  const [players, setPlayers] = useState<WheelPlayer[]>(initPlayers);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [history, setHistory] = useState<SpinResult[]>([]);
  const [joinAmt, setJoinAmt] = useState("0.5");
  const [joined, setJoined] = useState(false);
  const [myBal, setMyBal] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const spinLock = useRef(false);
  const cdRef = useRef<ReturnType<typeof setInterval>>();

  const total = players.reduce((s, p) => s + p.amount, 0);

  // Build segments
  const segments = (() => {
    let angle = 0;
    return players.map(p => {
      const pct = p.amount / total;
      const seg = { ...p, start: angle, end: angle + pct * 360, pct };
      angle += pct * 360;
      return seg;
    });
  })();

  // Auto-add players
  useEffect(() => {
    const iv = setInterval(() => {
      if (!spinning && players.length < 10) {
        nid++;
        setPlayers(prev => [...prev, {
          id: nid, wallet: W[Math.floor(Math.random() * W.length)],
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
    cdRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { spin(); return 30; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(cdRef.current);
  }, [spinning]);

  const spin = () => {
    if (spinLock.current || players.length < 2) return;
    spinLock.current = true;
    setSpinning(true);
    setResult(null);

    // Weighted pick
    let rand = Math.random() * total;
    let winner = players[0];
    for (const p of players) { rand -= p.amount; if (rand <= 0) { winner = p; break; } }
    const others = players.filter(p => p.id !== winner.id);
    const loser = others[Math.floor(Math.random() * others.length)];

    const seg = segments.find(s => s.id === winner.id)!;
    const mid = (seg.start + seg.end) / 2;
    const spins = 1440 + (360 - mid);
    setRotation(prev => prev + spins);

    setTimeout(() => {
      const amt = parseFloat((loser.amount * 0.9).toFixed(3));
      const res: SpinResult = {
        winner: winner.isYou ? "You" : winner.wallet,
        amount: amt,
        loser: loser.isYou ? "You" : loser.wallet,
      };
      setResult(res);
      setHistory(h => [res, ...h.slice(0, 6)]);
      if (winner.isYou) setMyBal(b => parseFloat((b + amt).toFixed(3)));
      if (loser.isYou) setMyBal(b => parseFloat((b - loser.amount).toFixed(3)));

      setPlayers(prev => {
        const next = prev
          .filter(p => p.id !== loser.id)
          .map(p => p.id === winner.id ? { ...p, amount: parseFloat((p.amount + amt).toFixed(3)) } : p);
        return next.length < 2 ? initPlayers : next;
      });
      setSpinning(false);
      spinLock.current = false;
      setCountdown(30);
    }, 4200);
  };

  const handleJoin = () => {
    const v = parseFloat(joinAmt);
    if (isNaN(v) || v < 0.05) return;
    nid++;
    setPlayers(prev => [...prev, { id: nid, wallet: "You", amount: v, color: COLORS[nid % COLORS.length], isYou: true }]);
    setMyBal(v);
    setJoined(true);
  };

  const cdColor = countdown <= 5 ? "text-y-accent" : countdown <= 10 ? "text-y-yellow" : "text-y-green";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-4.5 h-4.5 text-y-accent2" />
            Swap Wheel
          </h1>
          <p className="text-[13px] text-y-muted mt-0.5">Deposit SOL. Spin. Winner steals from loser.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="stat-box"><span className="text-y-accent2 font-semibold">{players.length}</span><span className="text-y-muted">players</span></div>
          <div className="stat-box"><span className="text-y-cyan font-semibold">{total.toFixed(2)}</span><span className="text-y-muted">SOL pot</span></div>
          <div className={`stat-box font-semibold ${cdColor}`}>{countdown}s</div>
          {joined && <div className="stat-box border-y-accent2/20"><span className="text-y-accent2 font-bold">{myBal.toFixed(3)}</span><span className="text-y-muted">your SOL</span></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Wheel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card flex flex-col items-center py-8 relative">
            {/* Result overlay */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-10 bg-y-card/95 backdrop-blur-lg border border-y-green/20 rounded-xl p-5 text-center shadow-xl"
                >
                  <p className="text-[12px] text-y-muted mb-1">Winner</p>
                  <p className="text-[15px] font-bold text-y-green">{result.winner}</p>
                  <p className="text-[22px] font-bold text-white mt-1">+{result.amount} SOL</p>
                  <p className="text-[11px] text-y-muted mt-1">from {result.loser}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pointer */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-white/90" />
            </div>

            {/* SVG Wheel */}
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: spinning ? 4.2 : 0, ease: [0.12, 0.8, 0.1, 1] }}
              style={{ transformOrigin: "center" }}
            >
              <svg width="260" height="260" viewBox="0 0 260 260">
                {segments.map(seg => (
                  <g key={seg.id}>
                    <path d={arc(130, 130, 120, seg.start, seg.end)} fill={seg.color} opacity={0.8} stroke="#06060e" strokeWidth="2" />
                    {seg.pct > 0.07 && (() => {
                      const mid = (seg.start + seg.end) / 2;
                      const pos = polar(130, 130, 80, mid);
                      return (
                        <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
                          {seg.amount.toFixed(2)}
                        </text>
                      );
                    })()}
                  </g>
                ))}
                <circle cx="130" cy="130" r="24" fill="#06060e" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                <text x="130" y="132" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">SOL</text>
              </svg>
            </motion.div>

            <button onClick={spin} disabled={spinning || players.length < 2} className="btn-primary mt-5 px-8 disabled:opacity-30">
              {spinning ? <><RotateCcw className="w-3.5 h-3.5 animate-spin" />Spinning...</> : <><RotateCcw className="w-3.5 h-3.5" />Spin Now</>}
            </button>
          </div>

          {/* Player bars */}
          <div className="card space-y-3">
            <h3 className="text-[12px] font-semibold text-y-muted flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Players in Round
            </h3>
            {[...players].sort((a, b) => b.amount - a.amount).map(p => {
              const pct = (p.amount / total) * 100;
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={`font-mono font-medium ${p.isYou ? "text-y-cyan" : "text-white"}`}>
                      {p.isYou ? "You" : p.wallet}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-y-muted">{pct.toFixed(1)}%</span>
                      <span className="font-semibold font-mono" style={{ color: p.color }}>{p.amount.toFixed(3)}</span>
                    </div>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: p.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {!joined ? (
            <div className="card space-y-4">
              <div>
                <h3 className="text-[14px] font-semibold text-white mb-1">Join This Round</h3>
                <p className="text-[12px] text-y-muted">Bigger deposit = higher win chance</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["0.1","0.25","0.5","1.0","2.0"].map(v => (
                  <button key={v} onClick={() => setJoinAmt(v)} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                    joinAmt === v ? "bg-y-accent2/12 border-y-accent2/40 text-y-accent2" : "bg-white/3 border-y-border text-y-muted hover:text-white"
                  }`}>{v}</button>
                ))}
              </div>
              <input type="number" value={joinAmt} onChange={e => setJoinAmt(e.target.value)} className="input" placeholder="Custom..." />
              <div className="bg-y-surface rounded-lg p-3 space-y-1.5 text-[11px] border border-y-border">
                <div className="flex justify-between"><span className="text-y-muted">Win chance</span><span className="text-y-accent2 font-mono font-semibold">{((parseFloat(joinAmt || "0") / (total + parseFloat(joinAmt || "0"))) * 100).toFixed(1)}%</span></div>
                <div className="flex justify-between"><span className="text-y-muted">Potential win</span><span className="text-y-green font-mono font-semibold">up to {total.toFixed(2)} SOL</span></div>
                <div className="flex justify-between"><span className="text-y-muted">House fee</span><span className="text-y-accent font-mono font-semibold">10%</span></div>
              </div>
              <button onClick={handleJoin} className="btn-primary w-full py-2.5">
                <Zap className="w-3.5 h-3.5" /> Join — {joinAmt} SOL
              </button>
            </div>
          ) : (
            <div className="card-sm bg-y-green/3 border-y-green/12 text-center space-y-2">
              <p className="text-[13px] font-medium text-y-green">You're in this round</p>
              <p className={`font-mono font-bold text-[15px] ${cdColor}`}>{countdown}s until spin</p>
            </div>
          )}

          {/* History */}
          <div className="card space-y-2.5">
            <h3 className="text-[12px] font-semibold text-y-muted">Recent Spins</h3>
            {history.length === 0 ? (
              <p className="text-[11px] text-y-dim text-center py-3">No spins yet</p>
            ) : history.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between py-2 px-2.5 rounded-lg bg-white/2 border border-y-border text-[11px]">
                <div>
                  <p className="font-mono font-medium text-y-green">{h.winner}</p>
                  <p className="text-y-dim">from {h.loser}</p>
                </div>
                <span className="font-mono font-semibold text-y-green">+{h.amount}</span>
              </motion.div>
            ))}
          </div>

          <div className="card-sm bg-y-cyan/3 border-y-cyan/12 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-y-cyan flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-medium text-white">How it works</p>
              <p className="text-[11px] text-y-muted mt-0.5">Wheel weighted by deposit. Winner takes 90% of loser's amount. House keeps 10%.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
