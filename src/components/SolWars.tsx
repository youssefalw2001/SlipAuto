import React, { useState, useEffect, useRef } from "react";
import { Swords, Clock, Trophy, Users, Flame, Shield, AlertCircle, ChevronUp } from "lucide-react";

interface BattleEntry {
  id: number;
  wallet: string;
  team: "red" | "blue";
  amount: number;
  time: string;
}

interface PastBattle {
  id: number;
  winner: "red" | "blue";
  redTotal: number;
  blueTotal: number;
  pot: number;
  players: number;
}

const RED_WALLETS = ["Rk5h...Oc2p", "7xKp...3mNq", "Qm3a...Rt5u", "Ew7b...Ln0z"];
const BLUE_WALLETS = ["Bz9r...Wf2j", "Hn6d...Yp1x", "Fs2c...Vg4k", "Jp8e...Ah9w"];

function formatSOL(n: number) {
  return n.toFixed(3);
}
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SolWars() {
  const [redTotal, setRedTotal] = useState(3.24);
  const [blueTotal, setBlueTotal] = useState(2.11);
  const [timeLeft, setTimeLeft] = useState(2340);
  const [selectedTeam, setSelectedTeam] = useState<"red" | "blue" | null>(null);
  const [amount, setAmount] = useState("0.1");
  const [isBetting, setIsBetting] = useState(false);
  const [entries, setEntries] = useState<BattleEntry[]>([
    { id: 1, wallet: "Rk5h...Oc2p", team: "red", amount: 0.5, time: "5s ago" },
    { id: 2, wallet: "Bz9r...Wf2j", team: "blue", amount: 0.25, time: "12s ago" },
    { id: 3, wallet: "7xKp...3mNq", team: "red", amount: 1.0, time: "28s ago" },
    { id: 4, wallet: "Hn6d...Yp1x", team: "blue", amount: 0.1, time: "45s ago" },
    { id: 5, wallet: "Qm3a...Rt5u", team: "red", amount: 0.5, time: "1m ago" },
  ]);
  const [battleNum, setBattleNum] = useState(112);
  const [pastBattles, setPastBattles] = useState<PastBattle[]>([
    { id: 111, winner: "blue", redTotal: 4.2, blueTotal: 6.8, pot: 11.0, players: 31 },
    { id: 110, winner: "red", redTotal: 7.1, blueTotal: 3.4, pot: 10.5, players: 28 },
    { id: 109, winner: "red", redTotal: 5.5, blueTotal: 2.2, pot: 7.7, players: 19 },
  ]);
  const entryIdRef = useRef(200);

  const pot = redTotal + blueTotal;
  const redPct = pot > 0 ? (redTotal / pot) * 100 : 50;
  const bluePct = 100 - redPct;

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Battle ends — determine winner
          const winner: "red" | "blue" = redTotal > blueTotal ? "red" : "blue";
          setPastBattles((pb) => [
            { id: battleNum, winner, redTotal, blueTotal, pot, players: entries.length + 20 },
            ...pb.slice(0, 4),
          ]);
          setBattleNum((n) => n + 1);
          setRedTotal(parseFloat((Math.random() * 2 + 0.5).toFixed(3)));
          setBlueTotal(parseFloat((Math.random() * 2 + 0.5).toFixed(3)));
          setEntries([]);
          return 3600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [redTotal, blueTotal, pot, battleNum, entries.length]);

  // Simulate random bets
  useEffect(() => {
    const interval = setInterval(() => {
      const team: "red" | "blue" = Math.random() > 0.5 ? "red" : "blue";
      const amt = parseFloat((Math.random() * 0.8 + 0.05).toFixed(3));
      const wallet = team === "red"
        ? RED_WALLETS[Math.floor(Math.random() * RED_WALLETS.length)]
        : BLUE_WALLETS[Math.floor(Math.random() * BLUE_WALLETS.length)];

      entryIdRef.current += 1;
      setEntries((prev) => [
        { id: entryIdRef.current, wallet, team, amount: amt, time: "just now" },
        ...prev.slice(0, 14),
      ]);

      if (team === "red") setRedTotal((p) => parseFloat((p + amt).toFixed(3)));
      else setBlueTotal((p) => parseFloat((p + amt).toFixed(3)));
    }, 4000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBet = () => {
    if (!selectedTeam) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0.01) return;
    setIsBetting(true);
    setTimeout(() => {
      entryIdRef.current += 1;
      setEntries((prev) => [
        { id: entryIdRef.current, wallet: "You", team: selectedTeam, amount: val, time: "just now" },
        ...prev.slice(0, 14),
      ]);
      if (selectedTeam === "red") setRedTotal((p) => parseFloat((p + val).toFixed(3)));
      else setBlueTotal((p) => parseFloat((p + val).toFixed(3)));
      setIsBetting(false);
    }, 1200);
  };

  const redPayout = pot > 0 && redTotal > 0 ? ((pot * 0.9) / redTotal).toFixed(2) : "0.00";
  const bluePayout = pot > 0 && blueTotal > 0 ? ((pot * 0.9) / blueTotal).toFixed(2) : "0.00";

  const urgencyColor = timeLeft < 300 ? "text-arena-red" : timeLeft < 600 ? "text-yellow-400" : "text-arena-green";

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-red/20 to-arena-blue/20 border border-white/10 flex items-center justify-center">
          <Swords className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">SOL Wars</h1>
          <p className="text-sm text-arena-muted">Pick a side — bigger team wins the pot. New battle every hour.</p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
          <span className="text-arena-muted">Battle</span>
          <span className="text-white font-bold">#{battleNum}</span>
        </div>
      </div>

      {/* War Bar */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          {/* Red Side */}
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-arena-red" />
              <span className="font-black text-arena-red text-lg">RED</span>
            </div>
            <p className="text-3xl font-black text-white">{formatSOL(redTotal)}<span className="text-sm text-arena-red ml-1">SOL</span></p>
            <p className="text-sm text-arena-muted">{redPct.toFixed(1)}% of pot</p>
            <p className="text-xs text-arena-green mt-1 font-mono">x{redPayout} payout/SOL</p>
          </div>

          {/* Center Info */}
          <div className="text-center px-4">
            <p className="text-xs text-arena-muted mb-1">Total Pot</p>
            <p className="text-2xl font-black text-white">{formatSOL(pot)}<span className="text-sm text-arena-purple ml-1">SOL</span></p>
            <div className={`flex items-center justify-center gap-1 mt-2 text-sm font-mono font-bold ${urgencyColor}`}>
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Blue Side */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <span className="font-black text-arena-blue text-lg">BLUE</span>
              <Shield className="w-5 h-5 text-arena-blue" />
            </div>
            <p className="text-3xl font-black text-white"><span className="text-sm text-arena-blue mr-1">SOL</span>{formatSOL(blueTotal)}</p>
            <p className="text-sm text-arena-muted">{bluePct.toFixed(1)}% of pot</p>
            <p className="text-xs text-arena-green mt-1 font-mono">x{bluePayout} payout/SOL</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-6 rounded-full overflow-hidden bg-white/5 border border-white/10">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-arena-red to-red-400 transition-all duration-700"
            style={{ width: `${redPct}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-arena-blue to-blue-400 transition-all duration-700"
            style={{ width: `${bluePct}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-white drop-shadow-lg">VS</span>
          </div>
        </div>

        {/* Underdog label */}
        {Math.abs(redPct - bluePct) > 20 && (
          <div className="text-center mt-3">
            <span className="text-xs font-mono text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full">
              ⚡ {redPct > bluePct ? "BLUE" : "RED"} is underdog — higher payout if they win!
            </span>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Bet Panel */}
        <div className="lg:col-span-2 space-y-4">

          {/* Team Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedTeam("red")}
              className={`card flex flex-col items-center gap-3 py-6 border-2 transition-all duration-200 cursor-pointer ${
                selectedTeam === "red"
                  ? "border-arena-red bg-arena-red/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  : "border-white/10 hover:border-arena-red/40"
              }`}
            >
              <Flame className={`w-8 h-8 ${selectedTeam === "red" ? "text-arena-red" : "text-white/40"}`} />
              <span className={`text-xl font-black ${selectedTeam === "red" ? "text-arena-red" : "text-white/60"}`}>
                RED TEAM
              </span>
              <span className="text-xs text-arena-muted">x{redPayout} per SOL if win</span>
              {selectedTeam === "red" && (
                <span className="text-xs font-bold text-arena-red bg-arena-red/20 px-3 py-1 rounded-full">SELECTED ✓</span>
              )}
            </button>

            <button
              onClick={() => setSelectedTeam("blue")}
              className={`card flex flex-col items-center gap-3 py-6 border-2 transition-all duration-200 cursor-pointer ${
                selectedTeam === "blue"
                  ? "border-arena-blue bg-arena-blue/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                  : "border-white/10 hover:border-arena-blue/40"
              }`}
            >
              <Shield className={`w-8 h-8 ${selectedTeam === "blue" ? "text-arena-blue" : "text-white/40"}`} />
              <span className={`text-xl font-black ${selectedTeam === "blue" ? "text-arena-blue" : "text-white/60"}`}>
                BLUE TEAM
              </span>
              <span className="text-xs text-arena-muted">x{bluePayout} per SOL if win</span>
              {selectedTeam === "blue" && (
                <span className="text-xs font-bold text-arena-blue bg-arena-blue/20 px-3 py-1 rounded-full">SELECTED ✓</span>
              )}
            </button>
          </div>

          {/* Amount + Bet */}
          <div className="card">
            <h3 className="text-sm font-bold text-white mb-4">Place Your Bet</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {["0.05", "0.1", "0.25", "0.5", "1.0", "2.0"].map((v) => (
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

            {selectedTeam && (
              <div className={`p-3 rounded-lg mb-4 text-sm border ${
                selectedTeam === "red" ? "bg-arena-red/5 border-arena-red/20 text-arena-red" : "bg-arena-blue/5 border-arena-blue/20 text-arena-blue"
              }`}>
                Potential win: <strong>{(parseFloat(amount || "0") * parseFloat(selectedTeam === "red" ? redPayout : bluePayout)).toFixed(3)} SOL</strong>
                {" "}if {selectedTeam.toUpperCase()} wins
              </div>
            )}

            <button
              onClick={handleBet}
              disabled={isBetting || !selectedTeam}
              className={`w-full py-3 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all disabled:opacity-40 ${
                selectedTeam === "red"
                  ? "bg-arena-red hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  : selectedTeam === "blue"
                  ? "bg-arena-blue hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              }`}
            >
              {isBetting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Confirming...</>
              ) : selectedTeam ? (
                <><Swords className="w-4 h-4" />Fight for {selectedTeam.toUpperCase()} — {amount} SOL</>
              ) : (
                "Select a team first"
              )}
            </button>

            {!selectedTeam && (
              <div className="flex items-center gap-2 mt-3 text-xs text-arena-muted">
                <AlertCircle className="w-3 h-3" />
                Pick RED or BLUE then set your amount
              </div>
            )}
          </div>

          {/* Past Battles */}
          <div className="card">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Past Battles
            </h3>
            <div className="space-y-2">
              {pastBattles.map((b) => (
                <div key={b.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-white/3 border border-white/5">
                  <span className="text-xs font-mono text-arena-muted w-12">#{b.id}</span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold text-xs ${
                    b.winner === "red" ? "bg-arena-red/20 text-arena-red" : "bg-arena-blue/20 text-arena-blue"
                  }`}>
                    {b.winner === "red" ? <Flame className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {b.winner.toUpperCase()} WON
                  </div>
                  <div className="flex-1 flex items-center gap-1 text-xs text-arena-muted">
                    <span className="text-arena-red">{b.redTotal.toFixed(2)}</span>
                    <span>vs</span>
                    <span className="text-arena-blue">{b.blueTotal.toFixed(2)}</span>
                    <span>SOL</span>
                  </div>
                  <span className="text-xs text-arena-green font-mono">{b.pot.toFixed(2)} SOL</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Live Battle Feed */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-xs font-mono uppercase text-arena-muted mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-arena-green animate-pulse" />
              Live Battle Feed
            </h3>
            <div className="space-y-1.5 max-h-96 overflow-y-auto scrollbar-hide">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className={`flex items-center justify-between py-2 px-2.5 rounded-lg border text-xs ${
                    e.wallet === "You"
                      ? "bg-arena-purple/10 border-arena-purple/30"
                      : e.team === "red"
                      ? "bg-arena-red/5 border-arena-red/10"
                      : "bg-arena-blue/5 border-arena-blue/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {e.team === "red" ? (
                      <Flame className="w-3 h-3 text-arena-red flex-shrink-0" />
                    ) : (
                      <Shield className="w-3 h-3 text-arena-blue flex-shrink-0" />
                    )}
                    <span className={`font-mono font-bold ${e.wallet === "You" ? "text-arena-purple" : "text-white"}`}>
                      {e.wallet}
                    </span>
                  </div>
                  <span className={`font-bold ${e.team === "red" ? "text-arena-red" : "text-arena-blue"}`}>
                    {e.amount} SOL
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Battle Stats */}
          <div className="card">
            <h3 className="text-xs font-mono uppercase text-arena-muted mb-3">Battle Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-arena-muted">Total Players</span>
                <span className="text-white font-bold flex items-center gap-1"><Users className="w-3.5 h-3.5 text-arena-blue" />{entries.length + 20}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-arena-muted">Red Players</span>
                <span className="text-arena-red font-bold">{entries.filter(e => e.team === "red").length + 12}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-arena-muted">Blue Players</span>
                <span className="text-arena-blue font-bold">{entries.filter(e => e.team === "blue").length + 8}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                <span className="text-arena-muted">Winner Takes</span>
                <span className="text-arena-green font-bold">{formatSOL(pot * 0.9)} SOL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
