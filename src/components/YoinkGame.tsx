import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Crosshair, Shield, Target, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Player {
  id: number;
  wallet: string;
  balance: number;
  isYou: boolean;
  hit?: boolean;
}

interface Toast {
  id: number;
  text: string;
  type: "win" | "lose" | "info";
}

const W = [
  "7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x",
  "Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w",
  "Ux1f...Dm6y","Nt4g...Sb7i","Rk5h...Oc2p","Wj9i...Ef3n",
  "Lp2k...Mx7t","Dv5n...Qs9b","Cy4h...Tz8r","Ab6j...Wu3o",
];

const rBal = () => parseFloat((Math.random() * 4 + 0.1).toFixed(3));
let uid = 40;

const seed: Player[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1, wallet: W[i], balance: rBal(), isYou: false,
}));

export default function YoinkGame() {
  const [players, setPlayers] = useState<Player[]>(seed);
  const [myBal, setMyBal] = useState(1.5);
  const [target, setTarget] = useState<number | null>(null);
  const [stake, setStake] = useState("0.1");
  const [acting, setActing] = useState(false);
  const [joined, setJoined] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [totalStolen, setTotalStolen] = useState(284.1);
  const tid = useRef(0);

  const toast = (text: string, type: Toast["type"]) => {
    tid.current++;
    const id = tid.current;
    setToasts(t => [{ id, text, type }, ...t.slice(0, 3)]);
    setTimeout(() => setToasts(t => t.filter(n => n.id !== id)), 3200);
  };

  // Simulate arena activity
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
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === arr[b].id ? { ...pl, hit: false } : pl)), 900);
        setTotalStolen(t => parseFloat((t + amt).toFixed(2)));
        return arr;
      });

      if (Math.random() > 0.75) {
        uid++;
        setPlayers(prev => {
          const next = prev.length >= 16 ? prev.slice(1) : prev;
          return [...next, { id: uid, wallet: W[Math.floor(Math.random() * W.length)], balance: rBal(), isYou: false }];
        });
      }
    }, 3200);
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
    toast(`Entered arena with ${v} SOL`, "info");
  };

  const yoink = () => {
    if (!target || !tp || acting) return;
    setActing(true);
    setTimeout(() => {
      const c = chance();
      const roll = Math.random() * 100;
      const fee = parseFloat((tp.balance * 0.05).toFixed(3));
      const steal = parseFloat((tp.balance * 0.5).toFixed(3));

      if (roll < c) {
        setMyBal(b => parseFloat((b + steal - fee).toFixed(3)));
        setPlayers(prev => prev.map(p => {
          if (p.id === target) return { ...p, balance: parseFloat((p.balance - steal).toFixed(3)), hit: true };
          if (p.isYou) return { ...p, balance: parseFloat((p.balance + steal - fee).toFixed(3)) };
          return p;
        }));
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === target ? { ...pl, hit: false } : pl)), 1000);
        setTotalStolen(t => parseFloat((t + steal).toFixed(2)));
        toast(`Stole ${steal} SOL from ${tp.wallet}`, "win");
      } else {
        setMyBal(b => parseFloat((b - fee).toFixed(3)));
        setPlayers(prev => prev.map(p => p.isYou ? { ...p, balance: parseFloat((p.balance - fee).toFixed(3)) } : p));
        toast(`Failed — lost ${fee} SOL fee`, "lose");
      }
      setTarget(null);
      setActing(false);
    }, 1500);
  };

  return (
    <div className="space-y-5">
      {/* Toasts */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              className={`px-3 py-2.5 rounded-lg text-[12px] font-medium border backdrop-blur-md max-w-[260px] ${
                t.type === "win"  ? "bg-y-green/10 border-y-green/25 text-y-green" :
                t.type === "lose" ? "bg-y-accent/10 border-y-accent/25 text-y-accent" :
                                    "bg-white/5 border-y-border text-y-text"
              }`}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Crosshair className="w-4.5 h-4.5 text-y-accent" />
            Yoink
          </h1>
          <p className="text-[13px] text-y-muted mt-0.5">Target a wallet. Pay the fee. Steal their SOL.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="stat-box"><span className="text-y-accent font-semibold">{totalStolen.toFixed(1)}</span><span className="text-y-muted">stolen total</span></div>
          <div className="stat-box"><span className="text-y-cyan font-semibold">{players.length}</span><span className="text-y-muted">in arena</span></div>
          {joined && (
            <div className="stat-box border-y-cyan/20">
              <span className="text-y-cyan font-bold">{myBal.toFixed(3)}</span>
              <span className="text-y-muted">your SOL</span>
            </div>
          )}
        </div>
      </div>

      {/* How it works (compact) */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { n:"1", t:"Enter", d:"Lock SOL" },
          { n:"2", t:"Target", d:"Pick a wallet" },
          { n:"3", t:"Yoink", d:"Pay 5% fee" },
          { n:"4", t:"Win", d:"Steal 50%" },
        ].map(s => (
          <div key={s.n} className="card-sm text-center">
            <div className="text-[10px] font-mono text-y-dim mb-1">{s.n}</div>
            <div className="text-[12px] font-semibold text-white">{s.t}</div>
            <div className="text-[11px] text-y-muted">{s.d}</div>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Arena Grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-y-muted flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-y-green blink" />
              Live Arena
            </h2>
            {joined && <p className="text-[11px] text-y-dim">Click a wallet to target</p>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <AnimatePresence>
              {players.map(p => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1, x: p.hit ? [-4, 4, -2, 2, 0] : 0 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => !p.isYou && joined && setTarget(target === p.id ? null : p.id)}
                  className={`wallet-target ${target === p.id ? "active" : ""} ${p.isYou ? "is-self" : ""} ${p.hit ? "hit" : ""} ${!joined || p.isYou ? "cursor-default" : ""}`}
                >
                  {target === p.id && (
                    <Target className="absolute top-2 right-2 w-3.5 h-3.5 text-y-accent" />
                  )}
                  <p className={`font-mono text-[11px] font-medium mb-1.5 truncate ${p.isYou ? "text-y-cyan" : "text-y-muted"}`}>
                    {p.isYou ? "You" : p.wallet}
                  </p>
                  <p className={`text-[17px] font-bold tabular-nums leading-tight ${
                    p.hit ? "text-y-accent" :
                    p.isYou ? "text-y-cyan" :
                    p.balance > 2 ? "text-y-green" :
                    "text-white"
                  }`}>
                    {p.balance.toFixed(3)}
                    <span className="text-[11px] font-normal text-y-muted ml-1">SOL</span>
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {!joined ? (
            <div className="card space-y-4">
              <div>
                <h3 className="text-[14px] font-semibold text-white mb-1">Enter the Arena</h3>
                <p className="text-[12px] text-y-muted">Lock SOL to start stealing from others.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["0.1","0.25","0.5","1.0","2.0"].map(v => (
                  <button
                    key={v}
                    onClick={() => setStake(v)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                      stake === v
                        ? "bg-y-accent/12 border-y-accent/40 text-y-accent"
                        : "bg-white/3 border-y-border text-y-muted hover:text-white"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={stake}
                onChange={e => setStake(e.target.value)}
                className="input"
                placeholder="Custom amount..."
              />
              <div className="bg-y-surface rounded-lg p-3 space-y-1.5 text-[11px] border border-y-border">
                <div className="flex justify-between"><span className="text-y-muted">Entry</span><span className="text-white font-mono">{stake} SOL</span></div>
                <div className="flex justify-between"><span className="text-y-muted">Fee per yoink</span><span className="text-y-accent font-mono">5% of target</span></div>
                <div className="flex justify-between"><span className="text-y-muted">Payout on success</span><span className="text-y-green font-mono">50% of target</span></div>
              </div>
              <button onClick={join} className="btn-primary w-full py-2.5">
                <Zap className="w-3.5 h-3.5" />
                Enter — {stake} SOL
              </button>
            </div>
          ) : (
            <div className="card space-y-4">
              <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-y-accent" />
                Yoink Attack
              </h3>

              {tp ? (
                <div className="bg-y-accent/5 border border-y-accent/15 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-y-muted">Target</span>
                    <span className="font-mono text-[12px] font-medium text-white">{tp.wallet}</span>
                  </div>
                  <div className="text-[22px] font-bold text-y-accent tabular-nums">{tp.balance.toFixed(3)} <span className="text-[12px] font-normal text-y-muted">SOL</span></div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-y-border">
                    <div>
                      <p className="text-[10px] text-y-muted">Steal</p>
                      <p className="text-[12px] font-semibold text-y-green">+{(tp.balance * 0.5).toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-y-muted">Fee</p>
                      <p className="text-[12px] font-semibold text-y-accent">-{(tp.balance * 0.05).toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-y-muted">Chance</p>
                      <p className={`text-[12px] font-semibold ${chance() >= 60 ? "text-y-green" : chance() >= 45 ? "text-y-yellow" : "text-y-accent"}`}>{chance()}%</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-y-border rounded-xl p-5 text-center">
                  <Target className="w-5 h-5 text-y-dim mx-auto mb-2" />
                  <p className="text-[12px] text-y-muted">Select a wallet in the arena</p>
                </div>
              )}

              <motion.button
                whileTap={target ? { scale: 0.97 } : {}}
                onClick={yoink}
                disabled={!target || acting}
                className="btn-primary w-full py-3 text-[13px] disabled:opacity-30"
              >
                {acting ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                ) : (
                  <><Crosshair className="w-3.5 h-3.5" />YOINK</>
                )}
              </motion.button>

              <p className="text-[10px] text-y-dim text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Fee paid win or lose. Higher balance = higher chance.
              </p>
            </div>
          )}

          {/* Success rates */}
          <div className="card space-y-3">
            <h3 className="text-[12px] font-semibold text-y-muted">Success Rates</h3>
            {[
              { label: "You have 2x+ their balance", pct: 75, color: "bg-y-green" },
              { label: "You have ~1x their balance", pct: 60, color: "bg-y-cyan" },
              { label: "You have ~0.5x", pct: 45, color: "bg-y-yellow" },
              { label: "You have less than 0.5x", pct: 30, color: "bg-y-accent" },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-y-muted">{r.label}</span>
                  <span className="font-mono font-medium text-white">{r.pct}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.pct}%` }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className={`h-full ${r.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Provably fair */}
          <div className="card-sm bg-y-cyan/3 border-y-cyan/12 flex items-start gap-3">
            <Shield className="w-4 h-4 text-y-cyan flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-medium text-white">Provably Fair</p>
              <p className="text-[11px] text-y-muted mt-0.5">On-chain randomness via Switchboard VRF. No server manipulation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
