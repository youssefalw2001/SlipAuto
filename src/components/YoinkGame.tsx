import NumberFlow from "@number-flow/react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Crosshair, Shield, Target, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Player { id: number; wallet: string; balance: number; isYou: boolean; hit?: boolean; size: "sm" | "md" | "lg" | "xl"; }

const W = [
  "7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x",
  "Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w",
  "Ux1f...Dm6y","Nt4g...Sb7i","Rk5h...Oc2p","Wj9i...Ef3n",
  "Lp2k...Mx7t","Dv5n...Qs9b","Cy4h...Tz8r","Ab6j...Wu3o",
];

function rBal() { return parseFloat((Math.random() * 5 + 0.1).toFixed(3)); }
function getSize(b: number): Player["size"] {
  if (b > 3.5) return "xl";
  if (b > 2.0) return "lg";
  if (b > 0.8) return "md";
  return "sm";
}

let uid = 40;
const SEED: Player[] = Array.from({ length: 12 }, (_, i) => {
  const b = rBal();
  return { id: i+1, wallet: W[i], balance: b, isYou: false, size: getSize(b) };
});

/* Confetti burst helper */
function fireCelebration() {
  const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 9999 };
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;
  confetti({ ...defaults, particleCount: 80, origin: { x: rand(0.3, 0.5), y: 0.4 }, colors: ['#ff4d00','#ffd200','#00e87a','#00e5ff'] });
  confetti({ ...defaults, particleCount: 60, origin: { x: rand(0.5, 0.7), y: 0.4 }, colors: ['#7000ff','#ff0066','#ffd200','#ffffff'] });
}

export default function YoinkGame() {
  const [players, setPlayers]     = useState<Player[]>(SEED);
  const [myBal, setMyBal]         = useState(0);
  const [target, setTarget]       = useState<number|null>(null);
  const [stake, setStake]         = useState("0.25");
  const [acting, setActing]       = useState(false);
  const [joined, setJoined]       = useState(false);
  const [flash, setFlash]         = useState<"win"|"lose"|null>(null);
  const [stolen, setStolen]       = useState(284.1);
  const [rounds, setRounds]       = useState(1847);
  const [livePlayers, setLive]    = useState(14);

  /* Arena bot simulation */
  useEffect(() => {
    const iv = setInterval(() => {
      setPlayers(prev => {
        const arr = [...prev];
        const a = Math.floor(Math.random() * arr.length);
        const b = Math.floor(Math.random() * arr.length);
        if (a === b || arr[a].isYou || arr[b].isYou) return arr;
        const amt = parseFloat((arr[b].balance * (0.12 + Math.random() * 0.35)).toFixed(3));
        const nb = Math.max(0.01, parseFloat((arr[b].balance - amt).toFixed(3)));
        const na = parseFloat((arr[a].balance + amt * 0.9).toFixed(3));
        arr[a] = { ...arr[a], balance: na, size: getSize(na) };
        arr[b] = { ...arr[b], balance: nb, size: getSize(nb), hit: true };
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === arr[b].id ? { ...pl, hit: false } : pl)), 900);
        setStolen(s => parseFloat((s + amt).toFixed(2)));
        return arr;
      });
      if (Math.random() > 0.7) {
        uid++;
        setPlayers(prev => {
          const n = prev.length >= 16 ? prev.slice(1) : prev;
          const b = rBal();
          return [...n, { id: uid, wallet: W[uid % W.length], balance: b, isYou: false, size: getSize(b) }];
        });
        setLive(l => l + (Math.random() > 0.5 ? 1 : -1));
      }
      setRounds(r => r + (Math.random() > 0.6 ? 1 : 0));
    }, 3200);
    return () => clearInterval(iv);
  }, []);

  const tp = players.find(p => p.id === target);
  const chance = () => {
    if (!tp) return 50;
    const r = myBal / tp.balance;
    if (r > 2)   return 75;
    if (r > 1)   return 60;
    if (r > 0.5) return 45;
    return 30;
  };

  const join = () => {
    const v = parseFloat(stake);
    if (isNaN(v) || v < 0.05) return;
    setJoined(true);
    setMyBal(v);
    uid++;
    const b = v;
    setPlayers(prev => [...prev, { id: uid, wallet: "You", balance: b, isYou: true, size: getSize(b) }]);
    toast.success(`Entered arena with ${v} SOL`);
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
        /* WIN */
        setMyBal(b => parseFloat((b + gain - fee).toFixed(3)));
        setPlayers(prev => prev.map(p => {
          if (p.id === target) { const nb = parseFloat((p.balance - gain).toFixed(3)); return { ...p, balance: nb, size: getSize(nb), hit: true }; }
          if (p.isYou) { const nb = parseFloat((p.balance + gain - fee).toFixed(3)); return { ...p, balance: nb, size: getSize(nb) }; }
          return p;
        }));
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === target ? { ...pl, hit: false } : pl)), 900);
        setStolen(s => parseFloat((s + gain).toFixed(2)));
        setRounds(r => r + 1);
        setFlash("win");
        setTimeout(() => setFlash(null), 700);
        fireCelebration();
        toast.success(`YOINKED! +${gain} SOL stolen from ${tp.wallet}`, { duration: 4000 });
      } else {
        /* LOSE */
        setMyBal(b => parseFloat((b - fee).toFixed(3)));
        setPlayers(prev => prev.map(p => {
          if (p.isYou) { const nb = parseFloat((p.balance - fee).toFixed(3)); return { ...p, balance: nb, size: getSize(nb) }; }
          return p;
        }));
        setRounds(r => r + 1);
        setFlash("lose");
        setTimeout(() => setFlash(null), 600);
        toast.error(`Yoink failed — lost ${fee} SOL fee`, { duration: 3500 });
      }
      setTarget(null);
      setActing(false);
    }, 1600);
  };

  const maxBal = Math.max(...players.map(p => p.balance), 1);
  const sizeMap = { sm: "col-span-1", md: "col-span-1", lg: "col-span-1", xl: "col-span-1" };

  return (
    <div className="space-y-6">
      {/* Win/Lose flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={flash === "win" ? "win-flash" : "lose-flash"}
          />
        )}
      </AnimatePresence>

      {/* Hero */}
      <div className="card-hero">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="pill pill-live">
                <span className="w-1.5 h-1.5 rounded-full bg-y-green blink" /> LIVE
              </span>
              <span className="text-[12px] font-mono" style={{ color: '#6060a0' }}>{livePlayers} players in arena</span>
            </div>
            <h1 className="font-display text-[56px] leading-none text-white tracking-[0.06em] mb-2">
              YOINK<span style={{ color: '#ff4d00' }}>.GG</span>
            </h1>
            <p className="text-[14px]" style={{ color: '#6060a0' }}>
              Target a wallet. Pay the fee. Steal their SOL.
            </p>
          </div>
          {/* Big stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-display text-[44px] leading-none glow-accent" style={{ color: '#ff7040' }}>
                <NumberFlow value={stolen} format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] mt-1" style={{ color: '#6060a0' }}>SOL Stolen</div>
            </div>
            <div className="w-px h-12" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="text-center">
              <div className="font-display text-[44px] leading-none" style={{ color: '#a060ff' }}>
                <NumberFlow value={rounds} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] mt-1" style={{ color: '#6060a0' }}>Rounds</div>
            </div>
            <div className="w-px h-12 hidden sm:block" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="text-center hidden sm:block">
              <div className="font-display text-[44px] leading-none" style={{ color: '#00d470' }}>
                <NumberFlow value={livePlayers} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] mt-1" style={{ color: '#6060a0' }}>Live Now</div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { n:"01", symbol:"◎", t:"Enter",   d:"Lock SOL to join",    c:"#ff4d00" },
          { n:"02", symbol:"◉", t:"Target",  d:"Pick any wallet",     c:"#a060ff" },
          { n:"03", symbol:"⊕", t:"Yoink",   d:"Pay 5% yoink fee",    c:"#00c8e8" },
          { n:"04", symbol:"◈", t:"Collect", d:"Steal 50% if you win",c:"#00d470" },
        ].map(s => (
          <motion.div key={s.n} whileHover={{ y: -3 }} className="card-sm text-center cursor-default">
            <div className="text-[22px] mb-2 leading-none" style={{ color: s.c }}>{s.symbol}</div>
            <div className="text-[10px] font-mono tracking-[0.1em] mb-1" style={{ color: '#30304a' }}>{s.n}</div>
            <div className="text-[13px] font-bold text-white">{s.t}</div>
            <div className="text-[11px] mt-0.5" style={{ color: '#6060a0' }}>{s.d}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Arena */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-y-green blink" />
              Live Arena
              <span className="pill pill-dim text-[10px]">{players.length} wallets</span>
            </h2>
            {joined && <span className="text-[11px] font-mono" style={{ color: '#6060a0' }}>Click a wallet to target it</span>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {players.map(p => {
                const pct = (p.balance / maxBal) * 100;
                const isT = target === p.id;
                const barColor = p.isYou
                  ? 'linear-gradient(90deg,#00e5ff,#7000ff)'
                  : p.balance > 3 ? 'linear-gradient(90deg,#00e87a,#00c8e8)'
                  : p.balance > 1.5 ? 'linear-gradient(90deg,#ffd200,#ff4d00)'
                  : 'linear-gradient(90deg,#ff4d00,#cc0044)';

                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.22 }}
                    onClick={() => !p.isYou && joined && setTarget(isT ? null : p.id)}
                    className={`wallet-card ${isT ? "targeted" : ""} ${p.isYou ? "is-you" : ""} ${p.hit ? "hit" : ""} ${(!joined || p.isYou) ? "!cursor-default" : ""}`}
                  >
                    {/* Target icon */}
                    {isT && (
                      <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
                        className="absolute top-2.5 right-2.5">
                        <Target className="w-3.5 h-3.5" style={{ color: '#ff4d00' }} />
                      </motion.div>
                    )}

                    {/* Wallet ID */}
                    <p className="font-mono text-[10px] leading-none mb-2.5 truncate"
                      style={{ color: p.isYou ? '#40d8f0' : '#6060a0' }}>
                      {p.isYou ? "● YOU" : p.wallet}
                    </p>

                    {/* Balance — NumberFlow for live animation */}
                    <p className={`font-display leading-none ${
                      p.balance > 3 ? "text-[30px]" : p.balance > 1.5 ? "text-[26px]" : "text-[22px]"
                    } ${p.hit ? "glow-accent" : p.isYou ? "glow-cyan" : ""}`}
                      style={{ color: p.hit ? '#ff4d00' : p.isYou ? '#00e5ff' : p.balance > 2.5 ? '#00d470' : p.balance > 1 ? '#eeeef8' : '#a0a0c0' }}
                    >
                      {p.balance.toFixed(3)}
                    </p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: '#30304a' }}>SOL</p>

                    {/* Balance bar */}
                    <div className="wallet-bar mt-3">
                      <motion.div
                        className="wallet-bar-fill"
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        style={{ background: barColor }}
                      />
                    </div>

                    {/* Chance indicator on hover if joined */}
                    {joined && !p.isYou && isT && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="mt-2 text-[10px] font-mono"
                        style={{ color: chance() >= 60 ? '#00d470' : chance() >= 45 ? '#ffd200' : '#ff7040' }}>
                        {chance()}% chance
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          {!joined ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-flat space-y-5">
              <div>
                <h3 className="font-display text-[26px] text-white leading-none mb-1">ENTER ARENA</h3>
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
                    }}
                  >{v} SOL</motion.button>
                ))}
              </div>
              <input type="number" value={stake} onChange={e => setStake(e.target.value)} className="input" placeholder="Custom..." />
              <div className="rounded-xl p-4 space-y-2.5 text-[11px]"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Entry amount</span><span className="font-mono font-semibold text-white">{stake} SOL</span></div>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Fee per yoink</span><span className="font-mono" style={{ color: '#ff7040' }}>5% of target's balance</span></div>
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Win payout</span><span className="font-mono" style={{ color: '#00d470' }}>50% of target's balance</span></div>
                <div className="divider" />
                <div className="flex justify-between"><span style={{ color: '#6060a0' }}>Fee charged</span><span className="font-mono" style={{ color: '#a060ff' }}>Win OR lose</span></div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={join} className="btn-yoink w-full">
                <Zap className="w-4 h-4" />
                ENTER — {stake} SOL
              </motion.button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-flat space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[26px] text-white leading-none">YOINK ATTACK</h3>
                <div className="text-right">
                  <p className="text-[10px] font-mono" style={{ color: '#6060a0' }}>YOUR BALANCE</p>
                  <p className="font-display text-[22px] leading-none" style={{ color: '#00e5ff' }}>
                    <NumberFlow value={myBal} format={{ minimumFractionDigits: 3, maximumFractionDigits: 3 }} />
                  </p>
                </div>
              </div>

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
                    <Target className="w-6 h-6" style={{ color: '#ff4d00' }} />
                  </div>
                  <div>
                    <p className="font-display text-[42px] leading-none glow-accent" style={{ color: '#ff7040' }}>
                      {tp.balance.toFixed(3)}
                    </p>
                    <p className="text-[12px] font-mono" style={{ color: '#6060a0' }}>SOL in target wallet</p>
                  </div>
                  <div className="divider" />
                  <div className="grid grid-cols-3 gap-3 text-center text-[11px]">
                    <div className="rounded-xl p-2.5" style={{ background: 'rgba(0,212,112,0.08)', border: '1px solid rgba(0,212,112,0.15)' }}>
                      <p style={{ color: '#6060a0' }}>You steal</p>
                      <p className="font-mono font-bold mt-1" style={{ color: '#00d470' }}>+{(tp.balance*0.5).toFixed(3)}</p>
                    </div>
                    <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.15)' }}>
                      <p style={{ color: '#6060a0' }}>Fee paid</p>
                      <p className="font-mono font-bold mt-1" style={{ color: '#ff7040' }}>-{(tp.balance*0.05).toFixed(3)}</p>
                    </div>
                    <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,210,0,0.08)', border: '1px solid rgba(255,210,0,0.15)' }}>
                      <p style={{ color: '#6060a0' }}>Chance</p>
                      <p className="font-mono font-bold mt-1" style={{ color: chance() >= 60 ? '#00d470' : chance() >= 45 ? '#ffd200' : '#ff7040' }}>
                        {chance()}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-2xl p-8 text-center border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <Crosshair className="w-10 h-10 mx-auto mb-3" style={{ color: '#30304a' }} />
                  <p className="text-[13px] font-semibold" style={{ color: '#6060a0' }}>Select a wallet from the arena</p>
                  <p className="text-[11px] mt-1" style={{ color: '#30304a' }}>Tap any card to lock your target</p>
                </div>
              )}

              <motion.button
                whileTap={target ? { scale: 0.96 } : {}}
                onClick={yoink}
                disabled={!target || acting}
                className={`btn-yoink w-full ${target && !acting ? "pulsing" : ""}`}
                style={{ fontSize: '20px', padding: '15px' }}
              >
                {acting
                  ? <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />STEALING...</>
                  : <><Crosshair className="w-5 h-5" />YOINK IT</>
                }
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
              { l: "Your balance 2x+ theirs",  pct: 75, c: "#00d470" },
              { l: "Your balance ~1x theirs",  pct: 60, c: "#00c8e8" },
              { l: "Your balance ~0.5x theirs",pct: 45, c: "#ffd200" },
              { l: "Your balance under 0.5x",  pct: 30, c: "#ff7040" },
            ].map(r => (
              <div key={r.l}>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span style={{ color: '#6060a0' }}>{r.l}</span>
                  <span className="font-mono font-bold text-white">{r.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${r.pct}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
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
              <p className="text-[11px] mt-0.5" style={{ color: '#6060a0' }}>On-chain randomness via Switchboard VRF. Zero server manipulation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
