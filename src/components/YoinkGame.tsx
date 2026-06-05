import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Crosshair, Shield, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Player { id: number; wallet: string; balance: number; isYou: boolean; hit?: boolean; }
interface Toast { id: number; text: string; type: "win"|"lose"|"info"; }

const W = [
  "7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x",
  "Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w",
  "Ux1f...Dm6y","Nt4g...Sb7i","Rk5h...Oc2p","Wj9i...Ef3n",
  "Lp2k...Mx7t","Dv5n...Qs9b","Cy4h...Tz8r","Ab6j...Wu3o",
];
const rBal = () => parseFloat((Math.random() * 4.5 + 0.1).toFixed(3));
let uid = 40;

const SEED: Player[] = Array.from({ length: 12 }, (_, i) => ({
  id: i+1, wallet: W[i], balance: rBal(), isYou: false,
}));

export default function YoinkGame() {
  const [players, setPlayers]   = useState<Player[]>(SEED);
  const [myBal, setMyBal]       = useState(1.5);
  const [target, setTarget]     = useState<number|null>(null);
  const [stake, setStake]       = useState("0.25");
  const [acting, setActing]     = useState(false);
  const [joined, setJoined]     = useState(false);
  const [toasts, setToasts]     = useState<Toast[]>([]);
  const [stolen, setStolen]     = useState(284.1);
  const [rounds, setRounds]     = useState(1847);
  const [players24, setPlayers24] = useState(312);
  const tid = useRef(0);

  const addToast = (text: string, type: Toast["type"]) => {
    tid.current++;
    const id = tid.current;
    setToasts(t => [{ id, text, type }, ...t.slice(0, 3)]);
    setTimeout(() => setToasts(t => t.filter(n => n.id !== id)), 3500);
  };

  // Arena simulation
  useEffect(() => {
    const iv = setInterval(() => {
      setPlayers(prev => {
        const arr = [...prev];
        const a = Math.floor(Math.random() * arr.length);
        const b = Math.floor(Math.random() * arr.length);
        if (a === b || arr[a].isYou || arr[b].isYou) return arr;
        const amt = parseFloat((arr[b].balance * (0.15 + Math.random() * 0.35)).toFixed(3));
        arr[a] = { ...arr[a], balance: parseFloat((arr[a].balance + amt * 0.9).toFixed(3)) };
        arr[b] = { ...arr[b], balance: Math.max(0.01, parseFloat((arr[b].balance - amt).toFixed(3))), hit: true };
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === arr[b].id ? { ...pl, hit: false } : pl)), 1000);
        setStolen(s => parseFloat((s + amt).toFixed(2)));
        return arr;
      });
      if (Math.random() > 0.72) {
        uid++;
        setPlayers(prev => {
          const next = prev.length >= 16 ? prev.slice(1) : prev;
          return [...next, { id: uid, wallet: W[Math.floor(Math.random() * W.length)], balance: rBal(), isYou: false }];
        });
      }
      setRounds(r => r + (Math.random() > 0.6 ? 1 : 0));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const tp = players.find(p => p.id === target);
  const chance = () => {
    if (!tp) return 50;
    const r = myBal / tp.balance;
    if (r > 2) return 75;
    if (r > 1) return 60;
    if (r > 0.5) return 45;
    return 30;
  };

  const join = () => {
    const v = parseFloat(stake);
    if (isNaN(v) || v < 0.05) return;
    setJoined(true);
    setMyBal(v);
    uid++;
    setPlayers(prev => [...prev, { id: uid, wallet: "You", balance: v, isYou: true }]);
    addToast(`Entered arena with ${v} SOL`, "info");
  };

  const yoink = () => {
    if (!target || !tp || acting) return;
    setActing(true);
    setTimeout(() => {
      const c = chance();
      const roll = Math.random() * 100;
      const fee = parseFloat((tp.balance * 0.05).toFixed(3));
      const gain = parseFloat((tp.balance * 0.5).toFixed(3));
      if (roll < c) {
        setMyBal(b => parseFloat((b + gain - fee).toFixed(3)));
        setPlayers(prev => prev.map(p => {
          if (p.id === target) return { ...p, balance: parseFloat((p.balance - gain).toFixed(3)), hit: true };
          if (p.isYou) return { ...p, balance: parseFloat((p.balance + gain - fee).toFixed(3)) };
          return p;
        }));
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === target ? { ...pl, hit: false } : pl)), 1000);
        setStolen(s => parseFloat((s + gain).toFixed(2)));
        setRounds(r => r + 1);
        addToast(`Stole ${gain} SOL from ${tp.wallet}`, "win");
      } else {
        setMyBal(b => parseFloat((b - fee).toFixed(3)));
        setPlayers(prev => prev.map(p => p.isYou ? { ...p, balance: parseFloat((p.balance - fee).toFixed(3)) } : p));
        setRounds(r => r + 1);
        addToast(`Failed — lost ${fee} SOL fee`, "lose");
      }
      setTarget(null);
      setActing(false);
    }, 1600);
  };

  const maxBal = Math.max(...players.map(p => p.balance));

  return (
    <div className="space-y-6">
      {/* Toasts */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="px-4 py-2.5 rounded-xl text-[12px] font-semibold border backdrop-blur-xl shadow-2xl max-w-[280px]"
              style={{
                background: t.type === "win" ? "rgba(0,212,112,0.12)" : t.type === "lose" ? "rgba(255,77,0,0.12)" : "rgba(255,255,255,0.06)",
                borderColor: t.type === "win" ? "rgba(0,212,112,0.25)" : t.type === "lose" ? "rgba(255,77,0,0.25)" : "rgba(255,255,255,0.1)",
                color: t.type === "win" ? "#00d470" : t.type === "lose" ? "#ff6a2a" : "#e8e8f0",
              }}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hero Stats */}
      <div className="card-hero">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="pill pill-live">
                <span className="w-1.5 h-1.5 rounded-full bg-y-green blink" /> LIVE
              </span>
              <span className="text-[12px] font-mono" style={{ color: '#6060a0' }}>{players.length} players in arena</span>
            </div>
            <h1 className="big-number text-[52px] text-white leading-none tracking-wide">
              YOINK
            </h1>
            <p className="text-[13px] mt-1" style={{ color: '#6060a0' }}>
              Target a wallet. Pay the fee. Steal their SOL.
            </p>
          </div>

          {/* Big numbers */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="big-number text-[40px] glow-accent" style={{ color: '#ff6a2a' }}>
                {stolen.toFixed(1)}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest mt-0.5" style={{ color: '#6060a0' }}>SOL Stolen</div>
            </div>
            <div className="w-px h-10 self-center" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="text-center">
              <div className="big-number text-[40px]" style={{ color: '#9b3dff' }}>
                {rounds.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest mt-0.5" style={{ color: '#6060a0' }}>Rounds</div>
            </div>
            <div className="w-px h-10 self-center" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="text-center">
              <div className="big-number text-[40px]" style={{ color: '#00d470' }}>
                {players24}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest mt-0.5" style={{ color: '#6060a0' }}>Players 24h</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { n:"01", icon:"◎", t:"Enter", d:"Lock SOL to join" },
          { n:"02", icon:"◉", t:"Target", d:"Pick any wallet" },
          { n:"03", icon:"⊕", t:"Yoink", d:"Pay 5% fee" },
          { n:"04", icon:"◈", t:"Collect", d:"Steal 50% if win" },
        ].map(s => (
          <div key={s.n} className="card-sm text-center">
            <div className="text-[18px] mb-2" style={{ color: '#ff4d00' }}>{s.icon}</div>
            <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: '#383855' }}>{s.n}</div>
            <div className="text-[13px] font-semibold text-white">{s.t}</div>
            <div className="text-[11px] mt-0.5" style={{ color: '#6060a0' }}>{s.d}</div>
          </div>
        ))}
      </div>

      {/* Grid + Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Arena Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-y-green blink" />
              Live Arena
            </h2>
            {joined && <span className="text-[11px] font-mono" style={{ color: '#6060a0' }}>Click a wallet to target</span>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <AnimatePresence>
              {players.map(p => {
                const pct = maxBal > 0 ? (p.balance / maxBal) * 100 : 50;
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.82 }}
                    transition={{ duration: 0.22 }}
                    onClick={() => !p.isYou && joined && setTarget(target === p.id ? null : p.id)}
                    className={`wallet-target ${target === p.id ? "targeted" : ""} ${p.isYou ? "is-you" : ""} ${p.hit ? "hit" : ""} ${!joined || p.isYou ? "!cursor-default" : ""} ${joined && !p.isYou ? "scanline-wrap" : ""}`}
                  >
                    {/* Targeted crosshair */}
                    {target === p.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2.5 right-2.5"
                      >
                        <Target className="w-3.5 h-3.5" style={{ color: '#ff4d00' }} />
                      </motion.div>
                    )}

                    {/* Wallet address */}
                    <p className="font-mono text-[10px] mb-2 truncate" style={{ color: p.isYou ? '#00c8e8' : '#6060a0' }}>
                      {p.isYou ? "YOU" : p.wallet}
                    </p>

                    {/* Balance */}
                    <p className={`big-number text-[26px] leading-none ${p.hit ? "glow-accent" : p.isYou ? "glow-cyan" : ""}`}
                      style={{ color: p.hit ? '#ff4d00' : p.isYou ? '#00e5ff' : p.balance > 2 ? '#00d470' : '#e8e8f0' }}
                    >
                      {p.balance.toFixed(3)}
                    </p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: '#383855' }}>SOL</p>

                    {/* Balance bar */}
                    <div className="mt-3 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{
                          background: p.isYou
                            ? 'linear-gradient(90deg, #00e5ff, #7000ff)'
                            : p.balance > 2
                            ? 'linear-gradient(90deg, #00e87a, #00c8e8)'
                            : 'linear-gradient(90deg, #ff4d00, #cc0044)',
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          {!joined ? (
            <div className="card-flat space-y-4">
              <div>
                <h3 className="big-number text-[24px] text-white mb-1">ENTER ARENA</h3>
                <p className="text-[12px]" style={{ color: '#6060a0' }}>Lock SOL to start stealing from others</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["0.1","0.25","0.5","1.0","2.0"].map(v => (
                  <button
                    key={v}
                    onClick={() => setStake(v)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all"
                    style={{
                      background: stake === v ? 'rgba(255,77,0,0.12)' : 'rgba(255,255,255,0.03)',
                      borderColor: stake === v ? 'rgba(255,77,0,0.4)' : 'rgba(255,255,255,0.08)',
                      color: stake === v ? '#ff6a2a' : '#6060a0',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <input type="number" value={stake} onChange={e => setStake(e.target.value)} className="input" placeholder="Custom amount..." />

              <div className="rounded-xl p-3 space-y-2 text-[11px]" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Entry amount</span><span className="font-mono text-white">{stake} SOL</span></div>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Yoink fee (per attempt)</span><span className="font-mono" style={{ color: '#ff6a2a' }}>5% of target</span></div>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Win payout</span><span className="font-mono" style={{ color: '#00d470' }}>50% of target bal</span></div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={join}
                className="btn-yoink w-full"
              >
                <Crosshair className="w-4 h-4" />
                ENTER — {stake} SOL
              </motion.button>
            </div>
          ) : (
            <div className="card-flat space-y-4">
              <h3 className="big-number text-[24px] text-white">YOINK ATTACK</h3>

              {/* Target preview */}
              {tp ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(255,77,0,0.06)', border: '1px solid rgba(255,77,0,0.2)' }}
                >
                  <p className="text-[10px] font-mono tracking-widest mb-1" style={{ color: '#6060a0' }}>TARGET LOCKED</p>
                  <p className="font-mono text-[12px] text-white mb-2">{tp.wallet}</p>
                  <p className="big-number text-[36px] leading-none" style={{ color: '#ff6a2a' }}>
                    {tp.balance.toFixed(3)} <span className="text-[16px]" style={{ color: '#6060a0' }}>SOL</span>
                  </p>
                  <div className="divider my-3" />
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div>
                      <p style={{ color: '#6060a0' }}>You steal</p>
                      <p className="font-mono font-semibold mt-0.5" style={{ color: '#00d470' }}>+{(tp.balance * 0.5).toFixed(3)}</p>
                    </div>
                    <div>
                      <p style={{ color: '#6060a0' }}>Fee paid</p>
                      <p className="font-mono font-semibold mt-0.5" style={{ color: '#ff6a2a' }}>-{(tp.balance * 0.05).toFixed(3)}</p>
                    </div>
                    <div>
                      <p style={{ color: '#6060a0' }}>Chance</p>
                      <p className="font-mono font-bold mt-0.5" style={{ color: chance() >= 60 ? '#00d470' : chance() >= 45 ? '#ffd200' : '#ff6a2a' }}>
                        {chance()}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-xl p-6 text-center border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <Crosshair className="w-8 h-8 mx-auto mb-2" style={{ color: '#383855' }} />
                  <p className="text-[12px]" style={{ color: '#6060a0' }}>Select a wallet from the arena</p>
                </div>
              )}

              <motion.button
                whileTap={target ? { scale: 0.97 } : {}}
                onClick={yoink}
                disabled={!target || acting}
                className={`btn-yoink w-full ${target && !acting ? "pulsing" : ""}`}
              >
                {acting ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />PROCESSING...</>
                ) : (
                  <><Crosshair className="w-4 h-4" />YOINK IT</>
                )}
              </motion.button>

              <p className="text-[10px] flex items-center justify-center gap-1.5" style={{ color: '#383855' }}>
                <AlertCircle className="w-3 h-3" />
                Fee charged win or lose. Higher balance = higher chance.
              </p>
            </div>
          )}

          {/* Success rates */}
          <div className="card-sm space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-widest" style={{ color: '#6060a0' }}>Success Rates</h3>
            {[
              { label: "2x+ their balance",   pct: 75, color: "#00d470" },
              { label: "~1x their balance",   pct: 60, color: "#00c8e8" },
              { label: "~0.5x their balance", pct: 45, color: "#ffd200" },
              { label: "Under 0.5x",          pct: 30, color: "#ff6a2a" },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span style={{ color: '#6060a0' }}>{r.label}</span>
                  <span className="font-mono font-bold text-white">{r.pct}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.pct}%` }}
                    transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: r.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Provably fair */}
          <div className="card-sm flex items-start gap-3" style={{ background: 'rgba(0,229,255,0.03)', borderColor: 'rgba(0,229,255,0.12)' }}>
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#00c8e8' }} />
            <div>
              <p className="text-[12px] font-semibold text-white">Provably Fair</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#6060a0' }}>On-chain via Switchboard VRF. Zero server manipulation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
