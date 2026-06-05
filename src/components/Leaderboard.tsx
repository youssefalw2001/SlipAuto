import React, { useState } from "react";
import { Trophy, Zap, Swords, TrendingUp, Crown } from "lucide-react";

type Period = "daily" | "weekly" | "alltime";
type GameFilter = "all" | "surge" | "wars";

interface Player {
  rank: number;
  wallet: string;
  won: number;
  bets: number;
  winRate: number;
  game: "surge" | "wars" | "both";
  streak: number;
}

const LEADERBOARD_DATA: Record<Period, Player[]> = {
  daily: [
    { rank: 1, wallet: "Ew7b...Ln0z", won: 12.44, bets: 18, winRate: 72, game: "surge", streak: 5 },
    { rank: 2, wallet: "Rk5h...Oc2p", won: 9.21, bets: 24, winRate: 63, game: "wars", streak: 3 },
    { rank: 3, wallet: "7xKp...3mNq", won: 7.83, bets: 12, winRate: 58, game: "both", streak: 2 },
    { rank: 4, wallet: "Bz9r...Wf2j", won: 6.50, bets: 31, winRate: 55, game: "surge", streak: 1 },
    { rank: 5, wallet: "Hn6d...Yp1x", won: 5.12, bets: 9, winRate: 78, game: "wars", streak: 4 },
    { rank: 6, wallet: "Qm3a...Rt5u", won: 4.87, bets: 14, winRate: 50, game: "both", streak: 0 },
    { rank: 7, wallet: "Jp8e...Ah9w", won: 3.44, bets: 7, winRate: 57, game: "surge", streak: 2 },
    { rank: 8, wallet: "Fs2c...Vg4k", won: 2.91, bets: 22, winRate: 45, game: "wars", streak: 1 },
    { rank: 9, wallet: "Nt4g...Sb7i", won: 2.30, bets: 11, winRate: 64, game: "surge", streak: 0 },
    { rank: 10, wallet: "Ux1f...Dm6y", won: 1.88, bets: 5, winRate: 40, game: "wars", streak: 0 },
  ],
  weekly: [
    { rank: 1, wallet: "Rk5h...Oc2p", won: 88.32, bets: 142, winRate: 68, game: "wars", streak: 8 },
    { rank: 2, wallet: "Ew7b...Ln0z", won: 71.14, bets: 89, winRate: 71, game: "surge", streak: 5 },
    { rank: 3, wallet: "Jp8e...Ah9w", won: 54.20, bets: 201, winRate: 52, game: "both", streak: 3 },
    { rank: 4, wallet: "7xKp...3mNq", won: 43.88, bets: 77, winRate: 61, game: "surge", streak: 2 },
    { rank: 5, wallet: "Nt4g...Sb7i", won: 38.55, bets: 55, winRate: 67, game: "wars", streak: 6 },
    { rank: 6, wallet: "Wj9i...Ef3n", won: 29.10, bets: 113, winRate: 48, game: "both", streak: 1 },
    { rank: 7, wallet: "Bz9r...Wf2j", won: 22.40, bets: 44, winRate: 55, game: "surge", streak: 0 },
    { rank: 8, wallet: "Qm3a...Rt5u", won: 18.75, bets: 88, winRate: 44, game: "wars", streak: 2 },
    { rank: 9, wallet: "Hn6d...Yp1x", won: 14.22, bets: 31, winRate: 58, game: "both", streak: 1 },
    { rank: 10, wallet: "Fs2c...Vg4k", won: 10.88, bets: 66, winRate: 41, game: "surge", streak: 0 },
  ],
  alltime: [
    { rank: 1, wallet: "Jp8e...Ah9w", won: 441.20, bets: 1204, winRate: 61, game: "both", streak: 12 },
    { rank: 2, wallet: "Rk5h...Oc2p", won: 388.44, bets: 892, winRate: 65, game: "wars", streak: 8 },
    { rank: 3, wallet: "Ew7b...Ln0z", won: 312.80, bets: 677, winRate: 69, game: "surge", streak: 5 },
    { rank: 4, wallet: "Nt4g...Sb7i", won: 244.10, bets: 504, winRate: 58, game: "wars", streak: 6 },
    { rank: 5, wallet: "7xKp...3mNq", won: 198.60, bets: 431, winRate: 55, game: "surge", streak: 3 },
    { rank: 6, wallet: "Wj9i...Ef3n", won: 166.35, bets: 788, winRate: 47, game: "both", streak: 1 },
    { rank: 7, wallet: "Ux1f...Dm6y", won: 133.90, bets: 302, winRate: 53, game: "wars", streak: 2 },
    { rank: 8, wallet: "Bz9r...Wf2j", won: 112.44, bets: 244, winRate: 51, game: "surge", streak: 4 },
    { rank: 9, wallet: "Hn6d...Yp1x", won: 88.20, bets: 188, winRate: 49, game: "both", streak: 0 },
    { rank: 10, wallet: "Qm3a...Rt5u", won: 71.55, bets: 411, winRate: 43, game: "wars", streak: 1 },
  ],
};

const PERIOD_PRIZES: Record<Period, { label: string; prizes: { place: string; amount: string }[] }> = {
  daily: {
    label: "Resets every 24h",
    prizes: [
      { place: "1st", amount: "1 SOL" },
      { place: "2nd", amount: "0.5 SOL" },
      { place: "3rd", amount: "0.25 SOL" },
    ],
  },
  weekly: {
    label: "Resets every Monday",
    prizes: [
      { place: "1st", amount: "5 SOL" },
      { place: "2nd", amount: "2.5 SOL" },
      { place: "3rd", amount: "1 SOL" },
    ],
  },
  alltime: {
    label: "Hall of Fame",
    prizes: [
      { place: "👑 Legend", amount: "Badge + 20 SOL" },
      { place: "🥇 Elite", amount: "Badge + 10 SOL" },
      { place: "🥈 Pro", amount: "Badge + 5 SOL" },
    ],
  },
};

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>("weekly");
  const [gameFilter, setGameFilter] = useState<GameFilter>("all");

  const data = LEADERBOARD_DATA[period].filter(
    (p) => gameFilter === "all" || p.game === gameFilter || p.game === "both"
  );

  const prizes = PERIOD_PRIZES[period];

  const rankMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Leaderboard</h1>
          <p className="text-sm text-arena-muted">Top earners win SOL prizes from the house fee pool</p>
        </div>
      </div>

      {/* Prize Banner */}
      <div className="card bg-gradient-to-r from-yellow-400/5 to-amber-600/5 border-yellow-400/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-sm font-bold text-white">{period.charAt(0).toUpperCase() + period.slice(1)} Prizes</p>
              <p className="text-xs text-arena-muted">{prizes.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {prizes.prizes.map((p, i) => (
              <div key={i} className="text-center">
                <p className="text-xs text-arena-muted">{p.place}</p>
                <p className="text-sm font-black text-yellow-400">{p.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Period */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {(["daily", "weekly", "alltime"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                period === p
                  ? "bg-arena-purple text-white"
                  : "text-arena-muted hover:text-white"
              }`}
            >
              {p === "alltime" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Game Filter */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {(["all", "surge", "wars"] as GameFilter[]).map((g) => (
            <button
              key={g}
              onClick={() => setGameFilter(g)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                gameFilter === g
                  ? "bg-white/10 text-white"
                  : "text-arena-muted hover:text-white"
              }`}
            >
              {g === "surge" && <Zap className="w-3 h-3 text-arena-purple" />}
              {g === "wars" && <Swords className="w-3 h-3 text-arena-blue" />}
              {g === "all" && <TrendingUp className="w-3 h-3" />}
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/3">
                <th className="text-left px-4 py-3 text-xs font-mono uppercase text-arena-muted">Rank</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase text-arena-muted">Player</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase text-arena-muted hidden sm:table-cell">Game</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase text-arena-muted">Won</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase text-arena-muted hidden md:table-cell">Bets</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase text-arena-muted hidden md:table-cell">Win Rate</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase text-arena-muted hidden sm:table-cell">Streak</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr
                  key={p.rank}
                  className={`border-b border-white/3 transition-colors hover:bg-white/3 ${
                    p.rank <= 3 ? "bg-yellow-400/3" : ""
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <span className={`text-base font-black ${
                      p.rank === 1 ? "text-yellow-400" : p.rank === 2 ? "text-slate-300" : p.rank === 3 ? "text-amber-600" : "text-arena-muted"
                    }`}>
                      {rankMedal(p.rank)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-white text-sm">{p.wallet}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <div className="flex items-center gap-1">
                      {(p.game === "surge" || p.game === "both") && (
                        <span className="flex items-center gap-1 text-xs bg-arena-purple/10 text-arena-purple px-2 py-0.5 rounded border border-arena-purple/20">
                          <Zap className="w-3 h-3" /> Surge
                        </span>
                      )}
                      {(p.game === "wars" || p.game === "both") && (
                        <span className="flex items-center gap-1 text-xs bg-arena-blue/10 text-arena-blue px-2 py-0.5 rounded border border-arena-blue/20">
                          <Swords className="w-3 h-3" /> Wars
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-arena-green font-bold font-mono">{p.won.toFixed(2)} SOL</span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden md:table-cell">
                    <span className="text-arena-muted text-sm">{p.bets}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden md:table-cell">
                    <span className={`text-sm font-bold ${p.winRate >= 60 ? "text-arena-green" : p.winRate >= 50 ? "text-yellow-400" : "text-arena-muted"}`}>
                      {p.winRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                    {p.streak > 0 ? (
                      <span className="text-xs font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded">
                        🔥 {p.streak}
                      </span>
                    ) : (
                      <span className="text-arena-muted text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Your Position */}
      <div className="card bg-arena-purple/5 border-arena-purple/20 flex items-center justify-between">
        <div>
          <p className="text-xs text-arena-muted">Your Position</p>
          <p className="text-white font-bold">Connect wallet to see your rank</p>
        </div>
        <button className="btn-primary text-sm">Connect Wallet</button>
      </div>
    </div>
  );
}
