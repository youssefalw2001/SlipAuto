import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Eye, Ghost, Shield, Target, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Player {
  id: number;
  wallet: string;
  balance: number;
  isYou: boolean;
  isNew?: boolean;
  justStolen?: boolean;
}

interface Notification {
  id: number;
  text: string;
  type: "success" | "fail" | "info";
}

const WALLETS = [
  "7xKp...3mNq","Bz9r...Wf2j","4tLs...Ck8v","Hn6d...Yp1x",
  "Qm3a...Rt5u","Ew7b...Ln0z","Fs2c...Vg4k","Jp8e...Ah9w",
  "Ux1f...Dm6y","Nt4g...Sb7i","Rk5h...Oc2p","Wj9i...Ef3n",
  "Lp2k...Mx7t","Dv5n...Qs9b","Cy4h...Tz8r","Ab6j...Wu3o",
];

function randomWallet() { return WALLETS[Math.floor(Math.random() * WALLETS.length)]; }
function randomBal()    { return parseFloat((Math.random() * 4 + 0.1).toFixed(3)); }

let nextId = 50;

const initialPlayers: Player[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  wallet: WALLETS[i],
  balance: randomBal(),
  isYou: false,
}));

export default function YoinkGame() {
  const [players, setPlayers]         = useState<Player[]>(initialPlayers);
  const [myBalance, setMyBalance]     = useState(1.5);
  const [targeted, setTargeted]       = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState("0.1");
  const [isYoinking, setIsYoinking]   = useState(false);
  const [shakeId, setShakeId]         = useState<number | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalStolen, setTotalStolen] = useState(284.12);
  const [roundsPlayed, setRoundsPlayed] = useState(1847);
  const [joined, setJoined]           = useState(false);
  const notifId = useRef(0);

  // Add notification helper
  const addNotif = (text: string, type: Notification["type"]) => {
    notifId.current++;
    const id = notifId.current;
    setNotifications(prev => [{ id, text, type }, ...prev.slice(0, 4)]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3500);
  };

  // Simulate other players getting yoinked
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(prev => {
        const arr = [...prev];
        const fromIdx = Math.floor(Math.random() * arr.length);
        const toIdx   = Math.floor(Math.random() * arr.length);
        if (fromIdx === toIdx || arr[fromIdx].isYou || arr[toIdx].isYou) return arr;
        const stolen = parseFloat((arr[toIdx].balance * (0.2 + Math.random() * 0.4)).toFixed(3));
        arr[fromIdx] = { ...arr[fromIdx], balance: parseFloat((arr[fromIdx].balance + stolen * 0.9).toFixed(3)) };
        arr[toIdx]   = { ...arr[toIdx],   balance: parseFloat((arr[toIdx].balance - stolen).toFixed(3)), justStolen: true };
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === arr[toIdx].id ? { ...pl, justStolen: false } : pl)), 1200);
        setTotalStolen(t => parseFloat((t + stolen).toFixed(3)));
        return arr;
      });

      // Occasionally add/remove player
      if (Math.random() > 0.7) {
        nextId++;
        setPlayers(prev => {
          const arr = prev.length >= 16 ? prev.slice(1) : prev;
          return [...arr, { id: nextId, wallet: randomWallet(), balance: randomBal(), isYou: false, isNew: true }];
        });
        setTimeout(() => setPlayers(p => p.map(pl => ({ ...pl, isNew: false }))), 800);
      }
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const targetPlayer = players.find(p => p.id === targeted);

  const successChance = () => {
    if (!targetPlayer) return 50;
    const ratio = myBalance / targetPlayer.balance;
    if (ratio > 2) return 75;
    if (ratio > 1) return 60;
    if (ratio > 0.5) return 45;
    return 30;
  };

  const handleJoin = () => {
    const cost = parseFloat(stakeAmount);
    if (isNaN(cost) || cost < 0.05) return;
    setJoined(true);
    setMyBalance(cost);
    nextId++;
    setPlayers(prev => [...prev, { id: nextId, wallet: "You 😈", balance: cost, isYou: true }]);
    addNotif(`You entered the arena with ${cost} SOL`, "info");
    setRoundsPlayed(r => r + 1);
  };

  const handleYoink = () => {
    if (!targeted || !targetPlayer || isYoinking) return;
    setIsYoinking(true);

    setTimeout(() => {
      const chance = successChance();
      const roll   = Math.random() * 100;
      const fee    = parseFloat(stakeAmount) * 0.1; // 10% yoink fee
      const stolen = parseFloat((targetPlayer.balance * 0.5).toFixed(3));

      if (roll < chance) {
        // SUCCESS 😈
        setMyBalance(prev => parseFloat((prev + stolen - fee).toFixed(3)));
        setPlayers(prev => prev.map(p => {
          if (p.id === targeted) return { ...p, balance: parseFloat((p.balance - stolen).toFixed(3)), justStolen: true };
          if (p.isYou)           return { ...p, balance: parseFloat((p.balance + stolen - fee).toFixed(3)) };
          return p;
        }));
        setTimeout(() => setPlayers(p => p.map(pl => pl.id === targeted ? { ...pl, justStolen: false } : pl)), 1500);
        setTotalStolen(t => parseFloat((t + stolen).toFixed(3)));
        addNotif(`😈 YOINKED! Stole ${stolen} SOL from ${targetPlayer.wallet}`, "success");
      } else {
        // FAIL
        setShakeId(targeted);
        setTimeout(() => setShakeId(null), 600);
        const penalty = fee;
        setMyBalance(prev => parseFloat((prev - penalty).toFixed(3)));
        setPlayers(prev => prev.map(p => p.isYou ? { ...p, balance: parseFloat((p.balance - penalty).toFixed(3)) } : p));
        addNotif(`❌ YOINK failed! Lost ${penalty.toFixed(3)} SOL fee`, "fail");
      }

      setTargeted(null);
      setIsYoinking(false);
      setRoundsPlayed(r => r + 1);
    }, 1800);
  };

  const solPrice = 148;

  return (
    <div className="space-y-6">

      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`px-4 py-3 rounded-xl text-sm font-semibold border backdrop-blur-xl shadow-2xl max-w-xs ${
                n.type === "success" ? "bg-yoink-green/10 border-yoink-green/30 text-yoink-green" :
                n.type === "fail"    ? "bg-yoink-pink/10 border-yoink-pink/30 text-yoink-pink" :
                                       "bg-white/5 border-white/10 text-white"
              }`}
            >
              {n.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-yoink-pink/5 via-yoink-surface to-yoink-purple/5 p-6 sm:p-8">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-3"
            >
              <span className="text-4xl animate-float">😈</span>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                  YOINK
                </h1>
                <p className="text-yoink-muted text-sm mt-0.5">Target a wallet. Pay the fee. Steal their SOL.</p>
              </div>
            </motion.div>
            <div className="flex flex-wrap gap-3">
              <div className="stat-badge"><span className="text-yoink-pink font-bold">{totalStolen.toFixed(2)}</span><span className="text-yoink-muted"> SOL stolen all time</span></div>
              <div className="stat-badge"><span className="text-yoink-cyan font-bold">{players.length}</span><span className="text-yoink-muted"> players in arena</span></div>
              <div className="stat-badge"><span className="text-yoink-green font-bold">{roundsPlayed.toLocaleString()}</span><span className="text-yoink-muted"> rounds played</span></div>
            </div>
          </div>

          {/* My Balance */}
          {joined && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card bg-yoink-surface border-yoink-cyan/20 text-center min-w-[160px]"
            >
              <p className="text-xs font-mono text-yoink-muted mb-1">YOUR BALANCE</p>
              <p className="font-display text-3xl font-extrabold text-yoink-cyan text-glow-cyan">
                {myBalance.toFixed(3)}
              </p>
              <p className="text-xs text-yoink-muted font-mono">SOL ≈ ${(myBalance * solPrice).toFixed(0)}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { emoji: "🎯", step: "1", title: "Enter Arena",   desc: "Lock SOL to join" },
          { emoji: "👁️", step: "2", title: "Pick a Target", desc: "See everyone's balance" },
          { emoji: "😈", step: "3", title: "YOINK!",        desc: "Pay 10% fee, steal 50%" },
          { emoji: "💰", step: "4", title: "Walk Away Rich",desc: "Win big or lose fee" },
        ].map(s => (
          <motion.div
            key={s.step}
            whileHover={{ y: -3 }}
            className="card text-center py-5"
          >
            <div className="text-2xl mb-2">{s.emoji}</div>
            <p className="text-xs font-mono text-yoink-muted mb-1">STEP {s.step}</p>
            <p className="font-display font-bold text-white text-sm">{s.title}</p>
            <p className="text-xs text-yoink-muted mt-1">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Player Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-yoink-muted" />
              Live Arena
              <span className="tag tag-pink">{players.length} PLAYERS</span>
            </h2>
            <p className="text-xs text-yoink-muted">Click any wallet to target it</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {players.map(p => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: p.justStolen ? [1, 1.05, 0.95, 1] : 1,
                    x: shakeId === p.id ? [-6, 6, -4, 4, 0] : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => !p.isYou && joined && setTargeted(targeted === p.id ? null : p.id)}
                  className={`wallet-card select-none ${targeted === p.id ? "targeted" : ""} ${p.isYou ? "is-you" : ""} ${!joined || p.isYou ? "cursor-default" : "cursor-pointer"}`}
                >
                  {/* Target indicator */}
                  {targeted === p.id && (
                    <div className="absolute top-2 right-2">
                      <Target className="w-4 h-4 text-yoink-pink animate-pulse" />
                    </div>
                  )}
                  {p.isNew && (
                    <div className="absolute top-2 right-2">
                      <span className="tag tag-green text-[9px]">NEW</span>
                    </div>
                  )}
                  {p.justStolen && (
                    <div className="absolute inset-0 bg-yoink-pink/10 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">😱</span>
                    </div>
                  )}

                  <p className={`font-mono text-xs font-bold truncate mb-2 ${p.isYou ? "text-yoink-cyan" : "text-white"}`}>
                    {p.isYou ? "😈 You" : p.wallet}
                  </p>

                  <p className={`font-display text-xl font-extrabold ${
                    p.justStolen ? "text-yoink-pink" :
                    p.isYou      ? "text-yoink-cyan" :
                    p.balance > 2 ? "text-yoink-green" :
                    p.balance > 1 ? "text-white" :
                                    "text-yoink-muted"
                  }`}>
                    {p.balance.toFixed(2)}
                    <span className="text-sm ml-1 opacity-70">SOL</span>
                  </p>

                  {!p.isYou && joined && targeted !== p.id && (
                    <p className="text-[10px] text-yoink-muted mt-1">click to target</p>
                  )}
                  {targeted === p.id && (
                    <p className="text-[10px] text-yoink-pink font-bold mt-1">TARGETED 🎯</p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Action Panel */}
        <div className="space-y-4">

          {!joined ? (
            /* JOIN PANEL */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card border-yoink-pink/20 bg-gradient-to-b from-yoink-pink/5 to-transparent"
            >
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">😈</div>
                <h3 className="font-display text-xl font-extrabold text-white">Enter the Arena</h3>
                <p className="text-xs text-yoink-muted mt-1">Lock SOL to start stealing</p>
              </div>

              <p className="text-xs text-yoink-muted mb-2">Your entry amount (min 0.05 SOL)</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {["0.1","0.25","0.5","1.0","2.0"].map(v => (
                  <button
                    key={v}
                    onClick={() => setStakeAmount(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      stakeAmount === v
                        ? "bg-yoink-pink/20 border-yoink-pink text-yoink-pink"
                        : "bg-white/3 border-white/10 text-yoink-muted hover:text-white"
                    }`}
                  >
                    {v} SOL
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={stakeAmount}
                onChange={e => setStakeAmount(e.target.value)}
                className="input-yoink mb-4"
                placeholder="Custom amount..."
              />

              <div className="bg-white/3 rounded-xl p-3 mb-4 text-xs space-y-1.5 border border-white/5">
                <div className="flex justify-between"><span className="text-yoink-muted">Entry amount</span><span className="text-white font-mono">{stakeAmount} SOL</span></div>
                <div className="flex justify-between"><span className="text-yoink-muted">Yoink fee (per attempt)</span><span className="text-yoink-pink font-mono">10% of target</span></div>
                <div className="flex justify-between"><span className="text-yoink-muted">Payout on success</span><span className="text-yoink-green font-mono">50% of target balance</span></div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleJoin}
                className="btn-yoink w-full py-3.5 text-base"
              >
                <Ghost className="w-5 h-5" />
                Enter Arena — {stakeAmount} SOL
              </motion.button>
            </motion.div>

          ) : (
            /* YOINK PANEL */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-yoink-pink" />
                YOINK Attack
              </h3>

              {/* Target preview */}
              {targetPlayer ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-yoink-pink/5 border border-yoink-pink/20 rounded-xl p-4 mb-4"
                >
                  <p className="text-xs text-yoink-muted mb-1">TARGET</p>
                  <p className="font-mono font-bold text-white">{targetPlayer.wallet}</p>
                  <p className="font-display text-2xl font-extrabold text-yoink-pink mt-1">{targetPlayer.balance.toFixed(3)} SOL</p>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-yoink-muted">Steal if success</span>
                      <span className="text-yoink-green font-bold">+{(targetPlayer.balance * 0.5).toFixed(3)} SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yoink-muted">Fee paid</span>
                      <span className="text-yoink-pink font-bold">-{(targetPlayer.balance * 0.05).toFixed(3)} SOL</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1.5">
                      <span className="text-yoink-muted">Success chance</span>
                      <span className={`font-bold ${successChance() >= 60 ? "text-yoink-green" : successChance() >= 45 ? "text-yoink-yellow" : "text-yoink-pink"}`}>
                        {successChance()}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white/3 border border-dashed border-white/10 rounded-xl p-6 mb-4 text-center">
                  <Target className="w-8 h-8 text-yoink-muted mx-auto mb-2" />
                  <p className="text-sm text-yoink-muted">Click any wallet in the arena to target it</p>
                </div>
              )}

              <motion.button
                whileHover={targeted ? { scale: 1.02 } : {}}
                whileTap={targeted ? { scale: 0.96 } : {}}
                onClick={handleYoink}
                disabled={!targeted || isYoinking}
                className="btn-yoink w-full py-4 text-lg disabled:opacity-40"
              >
                {isYoinking ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Yoinking...</>
                ) : (
                  <><Ghost className="w-5 h-5" />YOINK! 😈</>
                )}
              </motion.button>

              <p className="text-[11px] text-yoink-muted text-center mt-3 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Fee charged win or lose. Higher balance = higher chance.
              </p>
            </motion.div>
          )}

          {/* Chance Breakdown */}
          <div className="card">
            <h3 className="text-xs font-mono uppercase text-yoink-muted mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-yoink-yellow" />
              Success Rates
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "2x their balance", pct: 75, color: "bg-yoink-green" },
                { label: "1x their balance", pct: 60, color: "bg-yoink-cyan" },
                { label: "0.5x their balance", pct: 45, color: "bg-yoink-yellow" },
                { label: "Under 0.5x", pct: 30, color: "bg-yoink-pink" },
              ].map(r => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-yoink-muted">You have {r.label}</span>
                    <span className="font-mono font-bold text-white">{r.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.pct}%` }}
                      transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                      className={`h-full ${r.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shield info */}
          <div className="card bg-yoink-cyan/3 border-yoink-cyan/15">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yoink-cyan flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">Provably Fair</p>
                <p className="text-xs text-yoink-muted mt-1">Every YOINK result is determined by on-chain randomness (Switchboard VRF). No server can manipulate outcomes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
