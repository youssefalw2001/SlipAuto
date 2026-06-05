import { motion } from "framer-motion";
import { Crosshair, Crown, RotateCcw, Trophy } from "lucide-react";
import { useState } from "react";

type Period = "daily" | "weekly" | "alltime";

interface Player {
  rank: number;
  wallet: string;
  stolen: number;
  games: number;
  winRate: number;
  game: "yoink" | "wheel" | "both";
  streak: number;
}

const DATA: Record<Period, Player[]> = {
  daily: [
    { rank:1,  wallet:"Ew7b...Ln0z", stolen:18.44, games:22, winRate:77, game:"yoink", streak:7 },
    { rank:2,  wallet:"Rk5h...Oc2p", stolen:12.21, games:31, winRate:65, game:"wheel", streak:4 },
    { rank:3,  wallet:"7xKp...3mNq", stolen:9.83,  games:14, winRate:71, game:"both",  streak:3 },
    { rank:4,  wallet:"Bz9r...Wf2j", stolen:7.50,  games:28, winRate:57, game:"yoink", streak:2 },
    { rank:5,  wallet:"Hn6d...Yp1x", stolen:5.12,  games:9,  winRate:78, game:"wheel", streak:5 },
    { rank:6,  wallet:"Qm3a...Rt5u", stolen:4.87,  games:17, winRate:53, game:"both",  streak:1 },
    { rank:7,  wallet:"Jp8e...Ah9w", stolen:3.44,  games:8,  winRate:63, game:"yoink", streak:2 },
    { rank:8,  wallet:"Fs2c...Vg4k", stolen:2.91,  games:24, winRate:46, game:"wheel", streak:0 },
    { rank:9,  wallet:"Nt4g...Sb7i", stolen:2.30,  games:12, winRate:58, game:"yoink", streak:0 },
    { rank:10, wallet:"Ux1f...Dm6y", stolen:1.88,  games:6,  winRate:42, game:"wheel", streak:0 },
  ],
  weekly: [
    { rank:1,  wallet:"Rk5h...Oc2p", stolen:88.32, games:142, winRate:68, game:"wheel", streak:9 },
    { rank:2,  wallet:"Ew7b...Ln0z", stolen:71.14, games:89,  winRate:72, game:"yoink", streak:6 },
    { rank:3,  wallet:"Jp8e...Ah9w", stolen:54.20, games:201, winRate:55, game:"both",  streak:4 },
    { rank:4,  wallet:"7xKp...3mNq", stolen:43.88, games:77,  winRate:62, game:"yoink", streak:2 },
    { rank:5,  wallet:"Nt4g...Sb7i", stolen:38.55, games:55,  winRate:67, game:"wheel", streak:6 },
    { rank:6,  wallet:"Wj9i...Ef3n", stolen:29.10, games:113, winRate:49, game:"both",  streak:1 },
    { rank:7,  wallet:"Bz9r...Wf2j", stolen:22.40, games:44,  winRate:55, game:"yoink", streak:0 },
    { rank:8,  wallet:"Qm3a...Rt5u", stolen:18.75, games:88,  winRate:44, game:"wheel", streak:2 },
    { rank:9,  wallet:"Hn6d...Yp1x", stolen:14.22, games:31,  winRate:58, game:"both",  streak:1 },
    { rank:10, wallet:"Fs2c...Vg4k", stolen:10.88, games:66,  winRate:41, game:"yoink", streak:0 },
  ],
  alltime: [
    { rank:1,  wallet:"Jp8e...Ah9w", stolen:441.20, games:1204, winRate:61, game:"both",  streak:14 },
    { rank:2,  wallet:"Rk5h...Oc2p", stolen:388.44, games:892,  winRate:65, game:"wheel", streak:9 },
    { rank:3,  wallet:"Ew7b...Ln0z", stolen:312.80, games:677,  winRate:70, game:"yoink", streak:6 },
    { rank:4,  wallet:"Nt4g...Sb7i", stolen:244.10, games:504,  winRate:58, game:"wheel", streak:6 },
    { rank:5,  wallet:"7xKp...3mNq", stolen:198.60, games:431,  winRate:55, game:"yoink", streak:3 },
    { rank:6,  wallet:"Wj9i...Ef3n", stolen:166.35, games:788,  winRate:47, game:"both",  streak:1 },
    { rank:7,  wallet:"Ux1f...Dm6y", stolen:133.90, games:302,  winRate:53, game:"wheel", streak:2 },
    { rank:8,  wallet:"Bz9r...Wf2j", stolen:112.44, games:244,  winRate:51, game:"yoink", streak:4 },
    { rank:9,  wallet:"Hn6d...Yp1x", stolen:88.20,  games:188,  winRate:49, game:"both",  streak:0 },
    { rank:10, wallet:"Qm3a...Rt5u", stolen:71.55,  games:411,  winRate:43, game:"wheel", streak:1 },
  ],
};

const PRIZES: Record<Period, string[]> = {
  daily:   ["2 SOL", "1 SOL", "0.5 SOL"],
  weekly:  ["10 SOL", "5 SOL", "2 SOL"],
  alltime: ["50 SOL", "20 SOL", "10 SOL"],
};

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>("weekly");
  const data = DATA[period];
  const prizes = PRIZES[period];

  const rankStyle = (r: number) =>
    r === 1 ? "text-y-yellow font-bold" : r === 2 ? "text-slate-300 font-bold" : r === 3 ? "text-amber-500 font-bold" : "text-y-muted";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-4.5 h-4.5 text-y-yellow" />
            Leaderboard
          </h1>
          <p className="text-[13px] text-y-muted mt-0.5">Top stealers win SOL from the prize pool</p>
        </div>
      </div>

      {/* Prize row */}
      <div className="card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-y-yellow" />
          <span className="text-[13px] font-medium text-white">{period === "alltime" ? "All-Time" : period.charAt(0).toUpperCase() + period.slice(1)} Prizes</span>
        </div>
        <div className="flex items-center gap-5">
          {prizes.map((p, i) => (
            <div key={i} className="text-center">
              <p className="text-[10px] text-y-muted">{i === 0 ? "1st" : i === 1 ? "2nd" : "3rd"}</p>
              <p className="text-[13px] font-bold text-y-yellow">{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-y-surface border border-y-border rounded-xl p-1 w-fit">
        {(["daily","weekly","alltime"] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              period === p ? "bg-y-accent text-white" : "text-y-muted hover:text-white"
            }`}
          >
            {p === "alltime" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-y-border bg-y-surface/50">
                <th className="text-left px-4 py-2.5 font-medium text-y-muted">#</th>
                <th className="text-left px-4 py-2.5 font-medium text-y-muted">Player</th>
                <th className="text-left px-4 py-2.5 font-medium text-y-muted hidden sm:table-cell">Game</th>
                <th className="text-right px-4 py-2.5 font-medium text-y-muted">Stolen</th>
                <th className="text-right px-4 py-2.5 font-medium text-y-muted hidden md:table-cell">Games</th>
                <th className="text-right px-4 py-2.5 font-medium text-y-muted hidden md:table-cell">Win%</th>
                <th className="text-right px-4 py-2.5 font-medium text-y-muted hidden sm:table-cell">Streak</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <motion.tr
                  key={p.rank}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-b border-y-border/50 hover:bg-white/2 transition-colors ${p.rank <= 3 ? "bg-y-yellow/2" : ""}`}
                >
                  <td className="px-4 py-2.5"><span className={`text-[13px] ${rankStyle(p.rank)}`}>{p.rank}</span></td>
                  <td className="px-4 py-2.5"><span className="font-mono font-medium text-white">{p.wallet}</span></td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <div className="flex gap-1">
                      {(p.game === "yoink" || p.game === "both") && <span className="pill pill-accent"><Crosshair className="w-2.5 h-2.5" />Y</span>}
                      {(p.game === "wheel" || p.game === "both") && <span className="pill pill-purple"><RotateCcw className="w-2.5 h-2.5" />W</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right"><span className="font-mono font-semibold text-y-green">{p.stolen.toFixed(2)}</span></td>
                  <td className="px-4 py-2.5 text-right hidden md:table-cell text-y-muted">{p.games}</td>
                  <td className="px-4 py-2.5 text-right hidden md:table-cell">
                    <span className={`font-medium ${p.winRate >= 65 ? "text-y-green" : p.winRate >= 50 ? "text-y-yellow" : "text-y-muted"}`}>{p.winRate}%</span>
                  </td>
                  <td className="px-4 py-2.5 text-right hidden sm:table-cell">
                    {p.streak > 0 ? <span className="pill pill-orange">{p.streak}W</span> : <span className="text-y-dim">—</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Your rank */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-white">Your Ranking</p>
          <p className="text-[11px] text-y-muted">Connect wallet to see your position</p>
        </div>
        <button className="btn-primary text-[12px]">Connect Wallet</button>
      </div>
    </div>
  );
}
