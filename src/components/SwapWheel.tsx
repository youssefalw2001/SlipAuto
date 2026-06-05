import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, RotateCcw, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface WheelPlayer { id: number; wallet: string; amount: number; color: string; isYou?: boolean; }
interface Result { winner: string; amount: number; loser: string; }

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

export default function SwapWheel() {
  const [players, setPlayers]   = useState<WheelPlayer[]>(INIT);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult]     = useState<Result|null>(null);
  const [history, setHistory]   = useState<Result[]>([]);
  const [joinAmt, setJoinAmt]   = useState("0.5");
  const [joined, setJoined]     = useState(false);
  const [myBal, setMyBal]       = useState(0);
  const [cd, setCd]             = useState(30);
  const lock = useRef(false);

  const total = players.reduce((s, p) => s + p.amount, 0);

  const segs = (() => {
    let a = 0;
    return players.map(p => {
      const pct = p.amount / total;
      const seg = { ...p, start: a, end: a + pct * 360, pct };
      a += pct * 360;
      return seg;
    });
  })();

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

  useEffect(() => {
    if (spinning) return;
    const iv = setInterval(() => setCd(c => {
      if (c <= 1) { spin(); return 30; }
      return c - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, [spinning]);

  const spin = () => {
    if (lock.current || players.length < 2) return;
    lock.current = true;
    setSpinning(true);
    setResult(null);

    let rand = Math.random() * total;
    let winner = players[0];
    for (const p of players) { rand -= p.amount; if (rand <= 0) { winner = p; break; } }
    const others = players.filter(p => p.id !== winner.id);
    const loser = others[Math.floor(Math.random() * others.length)];
    const seg = segs.find(s => s.id === winner.id)!;
    const mid = (seg.start + seg.end) / 2;
    setRotation(prev => prev + 1440 + (360 - mid));

    setTimeout(() => {
      const amt = parseFloat((loser.amount * 0.9).toFixed(3));
      const res: Result = {
        winner: winner.isYou ? "You" : winner.wallet,
        amount: amt,
        loser: loser.isYou ? "You" : loser.wallet,
      };
      setResult(res);
      setHistory(h => [res, ...h.slice(0, 6)]);
      if (winner.isYou) setMyBal(b => parseFloat((b + amt).toFixed(3)));
      if (loser.isYou) setMyBal(b => parseFloat((b - loser.amount).toFixed(3)));
      setPlayers(prev => {
        const next = prev.filter(p => p.id !== loser.id).map(p => p.id === winner.id ? { ...p, amount: parseFloat((p.amount + amt).toFixed(3)) } : p);
        return next.length < 2 ? INIT : next;
      });
      setSpinning(false);
      lock.current = false;
      setCd(30);
    }, 4400);
  };

  const cdColor = cd <= 5 ? "#ff4d00" : cd <= 10 ? "#ffd200" : "#00d470";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-hero">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="big-number text-[48px] leading-none text-white mb-1">SWAP WHEEL</h1>
            <p className="text-[13px]" style={{ color: '#6060a0' }}>Deposit SOL · Spin · Winner steals from loser</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="big-number text-[32px]" style={{ color: '#9b3dff' }}>{players.length}</div>
              <div className="text-[10px] font-mono" style={{ color: '#6060a0' }}>PLAYERS</div>
            </div>
            <div className="w-px h-8 self-center" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="text-center">
              <div className="big-number text-[32px]" style={{ color: '#00c8e8' }}>{total.toFixed(2)}</div>
              <div className="text-[10px] font-mono" style={{ color: '#6060a0' }}>SOL POT</div>
            </div>
            <div className="w-px h-8 self-center" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="text-center">
              <div className="big-number text-[32px]" style={{ color: cdColor }}>{cd}s</div>
              <div className="text-[10px] font-mono" style={{ color: '#6060a0' }}>TO SPIN</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Wheel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-flat flex flex-col items-center py-8 relative">
            {/* Win overlay */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-10 rounded-2xl p-5 text-center shadow-2xl"
                  style={{
                    background: 'rgba(13,13,28,0.97)',
                    border: '1px solid rgba(0,232,122,0.3)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <p className="text-[11px] font-mono tracking-widest mb-1" style={{ color: '#6060a0' }}>WINNER</p>
                  <p className="big-number text-[22px] glow-green" style={{ color: '#00d470' }}>{result.winner}</p>
                  <p className="big-number text-[40px] text-white my-1">+{result.amount}</p>
                  <p className="text-[12px] font-mono" style={{ color: '#6060a0' }}>SOL from {result.loser}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pointer */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 drop-shadow-lg">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-white/90" />
            </div>

            {/* Wheel */}
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: spinning ? 4.4 : 0, ease: [0.08, 0.82, 0.08, 1] }}
              style={{ filter: spinning ? 'drop-shadow(0 0 20px rgba(255,77,0,0.3))' : 'none' }}
            >
              <svg width="280" height="280" viewBox="0 0 280 280">
                {/* Outer ring */}
                <circle cx="140" cy="140" r="138" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                {segs.map(seg => (
                  <g key={seg.id}>
                    <path d={arc(140, 140, 130, seg.start, seg.end)} fill={seg.color} opacity={0.78} stroke="#04040a" strokeWidth="2.5" />
                    {seg.pct > 0.07 && (() => {
                      const mid = (seg.start + seg.end) / 2;
                      const pos = polar(140, 140, 85, mid);
                      return (
                        <text
                          x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                          fill="white" fontSize="10.5" fontFamily="Geist Mono, monospace" fontWeight="600"
                          transform={`rotate(${mid}, ${pos.x}, ${pos.y})`}
                        >
                          {seg.amount.toFixed(2)}
                        </text>
                      );
                    })()}
                  </g>
                ))}
                {/* Center */}
                <circle cx="140" cy="140" r="30" fill="#04040a" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                <circle cx="140" cy="140" r="22" fill="rgba(255,77,0,0.1)" stroke="rgba(255,77,0,0.3)" strokeWidth="1" />
                <text x="140" y="141" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontFamily="Bebas Neue" letterSpacing="2">SOL</text>
              </svg>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={spin}
              disabled={spinning || players.length < 2}
              className="btn-yoink mt-5 px-10"
            >
              {spinning
                ? <><RotateCcw className="w-4 h-4 animate-spin" />SPINNING...</>
                : <><RotateCcw className="w-4 h-4" />SPIN NOW</>
              }
            </motion.button>
          </div>

          {/* Player bars */}
          <div className="card-sm space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-widest" style={{ color: '#6060a0' }}>Players in Round</h3>
            {[...players].sort((a, b) => b.amount - a.amount).map(p => (
              <div key={p.id}>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="font-mono" style={{ color: p.isYou ? '#00c8e8' : '#e8e8f0' }}>{p.isYou ? "YOU" : p.wallet}</span>
                  <div className="flex gap-3">
                    <span style={{ color: '#6060a0' }}>{((p.amount / total) * 100).toFixed(1)}%</span>
                    <span className="font-mono font-semibold" style={{ color: p.color }}>{p.amount.toFixed(3)}</span>
                  </div>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div
                    animate={{ width: `${(p.amount / total) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: p.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {!joined ? (
            <div className="card-flat space-y-4">
              <div>
                <h3 className="big-number text-[22px] text-white mb-1">JOIN ROUND</h3>
                <p className="text-[12px]" style={{ color: '#6060a0' }}>Bigger deposit = higher win chance</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["0.1","0.25","0.5","1.0","2.0"].map(v => (
                  <button key={v} onClick={() => setJoinAmt(v)} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all"
                    style={{
                      background: joinAmt === v ? 'rgba(112,0,255,0.12)' : 'rgba(255,255,255,0.03)',
                      borderColor: joinAmt === v ? 'rgba(112,0,255,0.4)' : 'rgba(255,255,255,0.08)',
                      color: joinAmt === v ? '#9b3dff' : '#6060a0',
                    }}
                  >{v}</button>
                ))}
              </div>
              <input type="number" value={joinAmt} onChange={e => setJoinAmt(e.target.value)} className="input" placeholder="Custom..." />
              <div className="rounded-xl p-3 space-y-2 text-[11px]" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Win chance</span><span className="font-mono" style={{ color: '#9b3dff' }}>{((parseFloat(joinAmt||"0") / (total + parseFloat(joinAmt||"0"))) * 100).toFixed(1)}%</span></div>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Max win</span><span className="font-mono" style={{ color: '#00d470' }}>{total.toFixed(2)} SOL</span></div>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>House fee</span><span className="font-mono" style={{ color: '#ff6a2a' }}>10%</span></div>
              </div>
              <button onClick={() => { const v = parseFloat(joinAmt); if (!isNaN(v) && v >= 0.05) { nid++; setPlayers(prev => [...prev, { id: nid, wallet: "You", amount: v, color: COLORS[nid % COLORS.length], isYou: true }]); setMyBal(v); setJoined(true); }}} className="btn-yoink w-full">
                <Zap className="w-4 h-4" /> JOIN — {joinAmt} SOL
              </button>
            </div>
          ) : (
            <div className="card-sm text-center space-y-2" style={{ background: 'rgba(0,232,122,0.04)', borderColor: 'rgba(0,232,122,0.15)' }}>
              <p className="text-[13px] font-semibold" style={{ color: '#00d470' }}>You're in this round</p>
              <p className="big-number text-[20px]" style={{ color: cdColor }}>{cd}s</p>
              <p className="text-[11px] font-mono" style={{ color: '#6060a0' }}>your balance: {myBal.toFixed(3)} SOL</p>
            </div>
          )}

          {/* History */}
          <div className="card-sm space-y-2">
            <h3 className="text-[11px] font-mono uppercase tracking-widest mb-3" style={{ color: '#6060a0' }}>Recent Spins</h3>
            {history.length === 0 ? (
              <p className="text-[11px] text-center py-3" style={{ color: '#383855' }}>No spins yet this session</p>
            ) : history.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between py-2 px-3 rounded-lg text-[11px]"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div>
                  <p className="font-mono font-semibold" style={{ color: '#00d470' }}>{h.winner}</p>
                  <p style={{ color: '#383855' }}>from {h.loser}</p>
                </div>
                <span className="font-mono font-bold" style={{ color: '#00d470' }}>+{h.amount}</span>
              </motion.div>
            ))}
          </div>

          <div className="card-sm flex items-start gap-3" style={{ background: 'rgba(0,229,255,0.03)', borderColor: 'rgba(0,229,255,0.1)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#00c8e8' }} />
            <div>
              <p className="text-[12px] font-semibold text-white">How Winning Works</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#6060a0' }}>Wheel weighted by deposit size. Winner takes 90% from lowest depositor. House keeps 10%.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
