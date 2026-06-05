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
  winnerAmount: number;
  loser: string;
  loserAmount: number;
}

const COLORS = [
  "#ff3366","#9b5de5","#00f5ff","#00ff88","#ffe600",
  "#ff6b35","#f72585","#4cc9f0","#7bf1a8","#ffd60a",
];

const WALLETS = [
  "7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x",
  "Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w",
];

let nextPlayerId = 30;

const initialPlayers: WheelPlayer[] = [
  { id: 1, wallet: WALLETS[0], amount: 0.5,  color: COLORS[0] },
  { id: 2, wallet: WALLETS[1], amount: 1.2,  color: COLORS[1] },
  { id: 3, wallet: WALLETS[2], amount: 0.3,  color: COLORS[2] },
  { id: 4, wallet: WALLETS[3], amount: 2.0,  color: COLORS[3] },
  { id: 5, wallet: WALLETS[4], amount: 0.8,  color: COLORS[4] },
  { id: 6, wallet: WALLETS[5], amount: 1.5,  color: COLORS[5] },
];

function buildWheelSegments(players: WheelPlayer[]) {
  const total = players.reduce((s, p) => s + p.amount, 0);
  let angle = 0;
  return players.map(p => {
    const pct = p.amount / total;
    const seg = { ...p, startAngle: angle, endAngle: angle + pct * 360, pct };
    angle += pct * 360;
    return seg;
  });
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segPath(cx: number, cy: number, r: number, start: number, end: number) {
  const s  = polarToCartesian(cx, cy, r, start);
  const e  = polarToCartesian(cx, cy, r, end);
  const lg = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${lg} 1 ${e.x} ${e.y} Z`;
}

export default function SwapWheel() {
  const [players, setPlayers]       = useState<WheelPlayer[]>(initialPlayers);
  const [spinning, setSpinning]     = useState(false);
  const [rotation, setRotation]     = useState(0);
  const [result, setResult]         = useState<SpinResult | null>(null);
  const [history, setHistory]       = useState<SpinResult[]>([]);
  const [joinAmount, setJoinAmount] = useState("0.5");
  const [joined, setJoined]         = useState(false);
  const [myBalance, setMyBalance]   = useState(0);
  const [countdown, setCountdown]   = useState(30);
  const [autoSpin, setAutoSpin]     = useState(true);
  const spinRef = useRef(false);
  const countRef = useRef<ReturnType<typeof setInterval>>();

  const segments = buildWheelSegments(players);
  const total    = players.reduce((s, p) => s + p.amount, 0);

  // Auto-add players
  useEffect(() => {
    const iv = setInterval(() => {
      if (!spinning && players.length < 10) {
        nextPlayerId++;
        const colIdx = nextPlayerId % COLORS.length;
        setPlayers(prev => [
          ...prev,
          {
            id: nextPlayerId,
            wallet: WALLETS[Math.floor(Math.random() * WALLETS.length)],
            amount: parseFloat((Math.random() * 2 + 0.1).toFixed(2)),
            color: COLORS[colIdx],
          },
        ]);
      }
    }, 4000);
    return () => clearInterval(iv);
  }, [spinning, players.length]);

  // Countdown to auto-spin
  useEffect(() => {
    if (!autoSpin || spinning) return;
    countRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          triggerSpin();
          return 30;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countRef.current);
  }, [autoSpin, spinning]);

  const triggerSpin = () => {
    if (spinRef.current || players.length < 2) return;
    spinRef.current = true;
    setSpinning(true);
    setResult(null);

    // Weighted random winner
    const totalAmt = players.reduce((s, p) => s + p.amount, 0);
    let rand       = Math.random() * totalAmt;
    let winner     = players[0];
    for (const p of players) {
      rand -= p.amount;
      if (rand <= 0) { winner = p; break; }
    }

    // Pick random loser (not winner)
    const others = players.filter(p => p.id !== winner.id);
    const loser  = others[Math.floor(Math.random() * others.length)];

    // Find winner segment center angle
    const seg    = segments.find(s => s.id === winner.id)!;
    const midAng = (seg.startAngle + seg.endAngle) / 2;
    const spins  = 1440 + (360 - midAng); // 4 full rotations + land on winner
    const newRot = rotation + spins;

    setRotation(newRot);

    setTimeout(() => {
      const winAmt = parseFloat((loser.amount * 0.9).toFixed(3));
      const res: SpinResult = {
        winner: winner.isYou ? "You 😈" : winner.wallet,
        winnerAmount: winAmt,
        loser:  loser.isYou  ? "You 😭" : loser.wallet,
        loserAmount: loser.amount,
      };
      setResult(res);
      setHistory(h => [res, ...h.slice(0, 7)]);

      if (winner.isYou) setMyBalance(b => parseFloat((b + winAmt).toFixed(3)));
      if (loser.isYou)  setMyBalance(b => parseFloat((b - loser.amount).toFixed(3)));

      // Reset for next round
      setPlayers(prev => {
        const next = prev
          .filter(p => p.id !== loser.id)
          .map(p => p.id === winner.id ? { ...p, amount: parseFloat((p.amount + winAmt).toFixed(3)) } : p);
        return next.length < 2 ? initialPlayers : next;
      });

      setSpinning(false);
      spinRef.current = false;
      setCountdown(30);
    }, 4200);
  };

  const handleJoin = () => {
    const val = parseFloat(joinAmount);
    if (isNaN(val) || val < 0.05) return;
    nextPlayerId++;
    const colIdx = nextPlayerId % COLORS.length;
    setPlayers(prev => [...prev, {
      id: nextPlayerId,
      wallet: "You 😈",
      amount: val,
      color: COLORS[colIdx],
      isYou: true,
    }]);
    setMyBalance(val);
    setJoined(true);
  };

  const urgency = countdown <= 5 ? "text-yoink-pink animate-pulse" : countdown <= 10 ? "text-yoink-yellow" : "text-yoink-green";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-yoink-purple/5 via-yoink-surface to-yoink-cyan/5 p-6 sm:p-8">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl animate-float">🎡</span>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">Swap Wheel</h1>
                <p className="text-yoink-muted text-sm mt-0.5">Deposit SOL → Spin → Winner steals from loser</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="stat-badge"><span className="text-yoink-purple font-bold">{players.length}</span><span className="text-yoink-muted"> players</span></div>
              <div className="stat-badge"><span className="text-yoink-cyan font-bold">{total.toFixed(3)}</span><span className="text-yoink-muted"> SOL in pot</span></div>
              <div className={`stat-badge font-mono font-bold ${urgency}`}>⏱ {countdown}s to spin</div>
            </div>
          </div>
          {joined && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="card border-yoink-purple/20 text-center min-w-[140px]">
              <p className="text-xs font-mono text-yoink-muted mb-1">YOUR SOL</p>
              <p className="font-display text-3xl font-extrabold text-yoink-purple">{myBalance.toFixed(3)}</p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Wheel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card flex flex-col items-center py-8">

            {/* Spin result overlay */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute z-10 bg-yoink-surface/95 backdrop-blur-xl border border-yoink-green/30 rounded-2xl p-6 text-center shadow-2xl max-w-xs mx-auto"
                >
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="font-display text-xl font-extrabold text-yoink-green">{result.winner}</p>
                  <p className="text-yoink-muted text-sm">stole</p>
                  <p className="font-display text-3xl font-extrabold text-white my-1">+{result.winnerAmount} SOL</p>
                  <p className="text-xs text-yoink-muted">from {result.loser}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SVG Wheel */}
            <div className="relative">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
              </div>

              <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: spinning ? 4.2 : 0, ease: [0.17, 0.67, 0.12, 1] }}
                style={{ transformOrigin: "center" }}
              >
                <svg width="300" height="300" viewBox="0 0 300 300">
                  {/* Segments */}
                  {segments.map(seg => (
                    <g key={seg.id}>
                      <path
                        d={segPath(150, 150, 140, seg.startAngle, seg.endAngle)}
                        fill={seg.color}
                        opacity={0.85}
                        stroke="#080810"
                        strokeWidth="2"
                      />
                      {/* Label */}
                      {seg.pct > 0.06 && (() => {
                        const mid = (seg.startAngle + seg.endAngle) / 2;
                        const pos = polarToCartesian(150, 150, 95, mid);
                        return (
                          <text
                            x={pos.x} y={pos.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="9"
                            fontFamily="Space Mono, monospace"
                            fontWeight="700"
                            transform={`rotate(${mid}, ${pos.x}, ${pos.y})`}
                          >
                            {seg.amount.toFixed(2)}
                          </text>
                        );
                      })()}
                    </g>
                  ))}

                  {/* Center circle */}
                  <circle cx="150" cy="150" r="28" fill="#080810" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  <text x="150" y="150" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="18">😈</text>
                </svg>
              </motion.div>
            </div>

            {/* Manual spin */}
            <motion.button
              whileHover={!spinning ? { scale: 1.04 } : {}}
              whileTap={!spinning ? { scale: 0.96 } : {}}
              onClick={triggerSpin}
              disabled={spinning || players.length < 2}
              className="btn-yoink mt-6 px-10 py-3.5 text-base disabled:opacity-40"
            >
              {spinning ? (
                <><RotateCcw className="w-5 h-5 animate-spin" />Spinning...</>
              ) : (
                <><RotateCcw className="w-5 h-5" />Spin Now</>
              )}
            </motion.button>
          </div>

          {/* Player list with chance bars */}
          <div className="card">
            <h3 className="text-xs font-mono uppercase text-yoink-muted mb-4 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Current Round Players
            </h3>
            <div className="space-y-3">
              {[...players].sort((a, b) => b.amount - a.amount).map(p => {
                const pct = (p.amount / total) * 100;
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className={`font-mono font-bold ${p.isYou ? "text-yoink-cyan" : "text-white"}`}>
                        {p.isYou ? "😈 You" : p.wallet}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-yoink-muted">{pct.toFixed(1)}% chance</span>
                        <span className="font-bold font-mono" style={{ color: p.color }}>{p.amount.toFixed(3)} SOL</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: p.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">

          {/* Join / Balance */}
          {!joined ? (
            <div className="card border-yoink-purple/20 bg-gradient-to-b from-yoink-purple/5 to-transparent">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">🎡</div>
                <h3 className="font-display text-lg font-extrabold text-white">Join This Round</h3>
                <p className="text-xs text-yoink-muted mt-1">Bigger deposit = higher win chance</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {["0.1","0.25","0.5","1.0","2.0"].map(v => (
                  <button
                    key={v}
                    onClick={() => setJoinAmount(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      joinAmount === v
                        ? "bg-yoink-purple/20 border-yoink-purple text-yoink-purple"
                        : "bg-white/3 border-white/10 text-yoink-muted hover:text-white"
                    }`}
                  >
                    {v} SOL
                  </button>
                ))}
              </div>
              <input type="number" value={joinAmount} onChange={e => setJoinAmount(e.target.value)} className="input-yoink mb-3" placeholder="Custom..." />

              <div className="bg-white/3 rounded-xl p-3 mb-4 text-xs space-y-1.5 border border-white/5">
                <div className="flex justify-between">
                  <span className="text-yoink-muted">Win chance</span>
                  <span className="text-yoink-purple font-bold font-mono">
                    {((parseFloat(joinAmount || "0") / (total + parseFloat(joinAmount || "0"))) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yoink-muted">Potential win</span>
                  <span className="text-yoink-green font-bold font-mono">up to {total.toFixed(2)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yoink-muted">House fee</span>
                  <span className="text-yoink-pink font-bold font-mono">10%</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleJoin}
                className="btn-yoink w-full py-3 text-base"
              >
                <Zap className="w-4 h-4" /> Join — {joinAmount} SOL
              </motion.button>
            </div>
          ) : (
            <div className="card border-yoink-green/20 bg-yoink-green/3 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-display font-bold text-yoink-green">You're In!</p>
              <p className="text-sm text-yoink-muted mt-1">Waiting for the wheel to spin...</p>
              <p className={`font-mono font-bold text-lg mt-2 ${urgency}`}>{countdown}s</p>
            </div>
          )}

          {/* History */}
          <div className="card">
            <h3 className="text-xs font-mono uppercase text-yoink-muted mb-3 flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" /> Recent Results
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-yoink-muted text-center py-4">No spins yet this session</p>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/3 border border-white/5 text-xs"
                  >
                    <div>
                      <p className="font-mono font-bold text-yoink-green">{h.winner}</p>
                      <p className="text-yoink-muted">stole from {h.loser}</p>
                    </div>
                    <span className="font-display font-bold text-yoink-green">+{h.winnerAmount} SOL</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="card bg-yoink-cyan/3 border-yoink-cyan/15">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yoink-cyan flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">How Winning Works</p>
                <p className="text-xs text-yoink-muted mt-1">The wheel lands on a winner weighted by deposit size. Winner takes 90% of the lowest depositor's amount. House keeps 10%.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
