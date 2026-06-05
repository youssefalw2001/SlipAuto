import React, { useState, useEffect, useRef } from "react";
import { Zap, Clock, Trophy, TrendingUp, Users, ChevronUp, AlertCircle } from "lucide-react";

interface Deposit {
  id: number;
  wallet: string;
  amount: number;
  time: string;
  isTop: boolean;
}

interface Winner {
  wallet: string;
  amount: number;
  rank: number;
}

const FAKE_WALLETS = [
  "7xKp...3mNq", "Bz9r...Wf2j", "4tLs...Ck8v", "Hn6d...Yp1x",
  "Qm3a...Rt5u", "Ew7b...Ln0z", "Fs2c...Vg4k", "Jp8e...Ah9w",
  "Ux1f...Dm6y", "Nt4g...Sb7i", "Rk5h...Oc2p", "Wj9i...Ef3n",
];

function randomWallet() {
  return FAKE_WALLETS[Math.floor(Math.random() * FAKE_WALLETS.length)];
}

function formatSOL(n: number) {
  return n.toFixed(3);
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SurgeGame() {
  const [pot, setPot] = useState(4.832);
  const [timeLeft, setTimeLeft] = useState(847);
  const [deposits, setDeposits] = useState<Deposit[]>([
    { id: 1, wallet: "7xKp...3mNq", amount: 0.5, time: "2s ago", isTop: true },
    { id: 2, wallet: "Bz9r...Wf2j", amount: 0.1, time: "14s ago", isTop: false },
    { id: 3, wallet: "4tLs...Ck8v", amount: 0.25, time: "31s ago", isTop: false },
    { id: 4, wallet: "Hn6d...Yp1x", amount: 0.05, time: "58s ago", isTop: false },
    { id: 5, wallet: "Qm3a...Rt5u", amount: 1.0, time: "1m ago", isTop: false },
  ]);
  const [amount, setAmount] = useState("0.1");
  const [isDepositing, setIsDepositing] = useState(false);
  const [roundNum, setRoundNum] = useState(47);
  const [lastWinners, setLastWinners] = useState<Winner[]>([
    { wallet: "Ew7b...Ln0z", amount: 3.21, rank: 1 },
    { wallet: "Fs2c...Vg4k", amount: 1.44, rank: 2 },
    { wallet: "Jp8e...Ah9w", amount: 0.82, rank: 3 },
  ]);
  const [totalPlayers, setTotalPlayers] = useState(23);
  const [pulseEffect, setPulseEffect] = useState(false);
  const depositIdRef = useRef(100);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Round over — simulate new round
          setRoundNum((r) => r + 1);
          setPot(parseFloat((Math.random() * 3 + 1).toFixed(3)));
          setTotalPlayers(Math.floor(Math.random() * 20 + 10));
          setDeposits([]);
          return 900;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate random deposits
  useEffect(() => {
    const interval = setInterval(() => {
      const amt = parseFloat((Math.random() * 0.5 + 0.05).toFixed(3));
      const wallet = randomWallet();
      depositIdRef.current += 1;

      setDeposits((prev) => {
        const newDeposit: Deposit = {
          id: depositIdRef.current,
          wallet,
          amount: amt,
          time: "just now",
          isTop: amt > 0.4,
        };
        return [newDeposit, ...prev.slice(0, 9)];
      });

      setPot((prev) => parseFloat((prev + amt).toFixed(3)));
      setTimeLeft((prev) => Math.min(prev + 30, 900));
      setTotalPlayers((prev) => prev + (Math.random() > 0.7 ? 1 : 0));
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 600);
    }, 3500 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDeposit = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0.01) return;
    setIsDepositing(true);
    setTimeout(() => {
      depositIdRef.current += 1;
      setDeposits((prev) => [
        { id: depositIdRef.current, wallet: "You", amount: val, time: "just now", isTop: val > 0.4 },
        ...prev.slice(0, 9),
      ]);
      setPot((prev) => parseFloat((prev + val).toFixed(3)));
      setTimeLeft((prev) => Math.min(prev + 30, 900));
      setIsDepositing(false);
    }, 1200);
  };

  const urgencyColor =
    timeLeft < 60 ? "text-arena-red" : timeLeft < 180 ? "text-yellow-400" : "text-arena-green";
  const timerBg =
    timeLeft < 60 ? "border-arena-red/40 bg-arena-red/5" : timeLeft < 180 ? "border-yellow-400/40 bg-yellow-400/5" : "border-arena-green/40 bg-arena-green/5";

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-arena-purple/20 border border-arena-purple/30 flex items-center justify-center">
          <Zap className="w-5 h-5 text-arena-purple" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">The Surge</h1>
          <p className="text-sm text-arena-muted">Deposit SOL → Timer resets → Last 10 depositors split the pot</p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
          <span className="text-arena-muted">Round</span>
          <span className="text-white font-bold">#{roundNum}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Pot + Timer + Deposit */}
        <div className="lg:col-span-2 space-y-4">

          {/* Pot Display */}
          <div className={`card relative overflow-hidden transition-all duration-300 ${pulseEffect ? "border-arena-purple/60" : ""}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-arena-purple/5 to-transparent pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-2">
              <div className="text-center sm:text-left">
                <p className="text-xs font-mono uppercase text-arena-muted mb-1">Current Pot</p>
                <div className={`text-5xl sm:text-6xl font-black text-white transition-all duration-300 ${pulseEffect ? "scale-105 text-arena-purple" : ""}`}>
                  {formatSOL(pot)}
                  <span className="text-2xl text-arena-purple ml-2">SOL</span>
                </div>
                <p className="text-arena-muted text-sm mt-1">
                  ≈ ${(pot * 148).toFixed(0)} USD
                </p>
              </div>

              {/* Timer */}
              <div className={`flex flex-col items-center px-8 py-4 rounded-2xl border ${timerBg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className={`w-4 h-4 ${urgencyColor}`} />
                  <span className="text-xs font-mono uppercase text-arena-muted">Time Left</span>
                </div>
                <span className={`text-4xl font-black font-mono ${urgencyColor}`}>
                  {formatTime(timeLeft)}
                </span>
                {timeLeft < 60 && (
                  <span className="text-xs text-arena-red animate-pulse mt-1 font-bold">ENDING SOON!</span>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <p className="text-xs text-arena-muted">Players</p>
                <p className="text-lg font-bold text-white flex items-center justify-center gap-1">
                  <Users className="w-4 h-4 text-arena-blue" />
                  {totalPlayers}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-arena-muted">Your Cut (Top 10)</p>
                <p className="text-lg font-bold text-arena-green">
                  {formatSOL(pot * 0.07)} SOL
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-arena-muted">Top Depositor</p>
                <p className="text-lg font-bold text-yellow-400">
                  {formatSOL(pot * 0.20)} SOL
                </p>
              </div>
            </div>
          </div>

          {/* How it Works */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "💰", label: "Top 10 depositors", value: "Split 70%", color: "text-arena-green" },
              { icon: "🏆", label: "Top single depositor", value: "Gets 20%", color: "text-yellow-400" },
              { icon: "⚡", label: "Platform fee", value: "10%", color: "text-arena-purple" },
            ].map((item, i) => (
              <div key={i} className="card text-center py-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
                <p className="text-xs text-arena-muted mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Deposit Panel */}
          <div className="card">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-arena-purple" />
              Place Your Deposit
              <span className="text-xs text-arena-muted font-normal">— adds 30s to timer</span>
            </h3>

            {/* Quick amounts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {["0.05", "0.1", "0.25", "0.5", "1.0"].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                    amount === v
                      ? "bg-arena-purple/20 border-arena-purple text-arena-purple"
                      : "bg-white/5 border-white/10 text-arena-muted hover:text-white hover:border-white/30"
                  }`}
                >
                  {v} SOL
                </button>
              ))}
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom"
                className="flex-1 min-w-[80px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-arena-purple/50"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDeposit}
                disabled={isDepositing}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50"
              >
                {isDepositing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Deposit {amount} SOL
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs text-arena-muted">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              Connect wallet to participate. Minimum deposit: 0.01 SOL
            </div>
          </div>
        </div>

        {/* RIGHT — Live Feed + Last Winners */}
        <div className="space-y-4">

          {/* Live Deposit Feed */}
          <div className="card">
            <h3 className="text-xs font-mono uppercase text-arena-muted mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-arena-green animate-pulse" />
              Live Deposits
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
              {deposits.map((d) => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg border transition-all ${
                    d.wallet === "You"
                      ? "bg-arena-purple/10 border-arena-purple/30"
                      : d.isTop
                      ? "bg-yellow-400/5 border-yellow-400/20"
                      : "bg-white/3 border-white/5"
                  }`}
                >
                  <div>
                    <p className={`text-xs font-mono font-bold ${d.wallet === "You" ? "text-arena-purple" : "text-white"}`}>
                      {d.wallet}
                      {d.isTop && <span className="ml-1 text-yellow-400">★</span>}
                    </p>
                    <p className="text-[10px] text-arena-muted">{d.time}</p>
                  </div>
                  <span className={`text-sm font-bold ${d.isTop ? "text-yellow-400" : "text-arena-green"}`}>
                    +{d.amount} SOL
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Last Round Winners */}
          <div className="card">
            <h3 className="text-xs font-mono uppercase text-arena-muted mb-3 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              Last Round Winners
            </h3>
            <div className="space-y-2">
              {lastWinners.map((w) => (
                <div key={w.rank} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/3 border border-white/5">
                  <span className={`text-lg font-black ${w.rank === 1 ? "text-yellow-400" : w.rank === 2 ? "text-slate-300" : "text-amber-600"}`}>
                    #{w.rank}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-mono text-white">{w.wallet}</p>
                  </div>
                  <span className="text-sm font-bold text-arena-green">+{w.amount} SOL</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 text-center">
              <p className="text-xs text-arena-muted">Round #{roundNum - 1} • 23 players • 6.83 SOL total</p>
            </div>
          </div>

          {/* Share / Referral Nudge */}
          <div className="card bg-gradient-to-br from-arena-purple/10 to-arena-blue/10 border-arena-purple/20">
            <p className="text-sm font-bold text-white mb-1">Earn while you sleep 💤</p>
            <p className="text-xs text-arena-muted mb-3">Share your referral link and earn 1% of every bet your friends make — forever.</p>
            <button className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-arena-purple font-bold hover:bg-white/10 transition-all">
              Get My Referral Link →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
