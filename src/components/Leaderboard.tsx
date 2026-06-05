import { motion } from "framer-motion";
import { Crown, Ghost, RotateCcw, TrendingUp, Trophy, Zap } from "lucide-react";
import { useState } from "react";

type Period = "daily" | "weekly" | "alltime";
type GameFilter = "all" | "yoink" | "wheel";

interface Player {
  rank: number;
  wallet: string;
  stolen: number;
  attempts: number;
  winRate: number;
  game: "yoink" | "wheel" | "both";
  streak: number;
  badge?: string;
}

const DATA: Record<Period, Player[]> = {
  daily: [
    { rank:1,  wallet:"Ew7b...Ln0z", stolen:18.44, attempts:22, winRate:77, game:"yoink", streak:7,  badge:"👑" },
    { rank:2,  wallet:"Rk5h...Oc2p", stolen:12.21, attempts:31, winRate:65, game:"wheel", streak:4,  badge:"🔥" },
    { rank:3,  wallet:"7xKp...3mNq", stolen:9.83,  attempts:14, winRate:71, game:"both",  streak:3  },
    { rank:4,  wallet:"Bz9r...Wf2j", stolen:7.50,  attempts:28, winRate:57, game:"yoink", streak:2  },
    { rank:5,  wallet:"Hn6d...Yp1x", stolen:5.12,  attempts:9,  winRate:78, game:"wheel", streak:5  },
    { rank:6,  wallet:"Qm3a...Rt5u", stolen:4.87,  attempts:17, winRate:53, game:"both",  streak:1  },
    { rank:7,  wallet:"Jp8e...Ah9w", stolen:3.44,  attempts:8,  winRate:63, game:"yoink", streak:2  },
    { rank:8,  wallet:"Fs2c...Vg4k", stolen:2.91,  attempts:24, winRate:46, game:"wheel", streak:0  },
    { rank:9,  wallet:"Nt4g...Sb7i", stolen:2.30,  attempts:12, winRate:58, game:"yoink", streak:0  },
    { rank:10, wallet:"Ux1f...Dm6y", stolen:1.88,  attempts:6,  winRate:42, game:"wheel", streak:0  },
  ],
  weekly: [
    { rank:1,  wallet:"Rk5h...Oc2p", stolen:88.32, attempts:142, winRate:68, game:"wheel", streak:9,  badge:"👑" },
    { rank:2,  wallet:"Ew7b...Ln0z", stolen:71.14, attempts:89,  winRate:72, game:"yoink", streak:6,  badge:"🔥" },
    { rank:3,  wallet:"Jp8e...Ah9w", stolen:54.20, attempts:201, winRate:55, game:"both",  streak:4  },
    { rank:4,  wallet:"7xKp...3mNq", stolen:43.88, attempts:77,  winRate:62, game:"yoink", streak:2  },
    { rank:5,  wallet:"Nt4g...Sb7i", stolen:38.55, attempts:55,  winRate:67, game:"wheel", streak:6  },
    { rank:6,  wallet:"Wj9i...Ef3n", stolen:29.10, attempts:113, winRate:49, game:"both",  streak:1  },
    { rank:7,  wallet:"Bz9r...Wf2j", stolen:22.40, attempts:44,  winRate:55, game:"yoink", streak:0  },
    { rank:8,  wallet:"Qm3a...Rt5u", stolen:18.75, attempts:88,  winRate:44, game:"wheel", streak:2  },
    { rank:9,  wallet:"Hn6d...Yp1x", stolen:14.22, attempts:31,  winRate:58, game:"both",  streak:1  },
    { rank:10, wallet:"Fs2c...Vg4k", stolen:10.88, attempts:66,  winRate:41, game:"yoink", streak:0  },
  ],
  alltime: [
    { rank:1,  wallet:"Jp8e...Ah9w", stolen:441.20, attempts:1204, winRate:61, game:"both",  streak:14, badge:"👑" },
    { rank:2,  wallet:"Rk5h...Oc2p", stolen:388.44, attempts:892,  winRate:65, game:"wheel", streak:9,  badge:"💎" },
    { rank:3,  wallet:"Ew7b...Ln0z", stolen:312.80, attempts:677,  winRate:70, game:"yoink", streak:6,  badge:"🔥" },
    { rank:4,  wallet:"Nt4g...Sb7i", stolen:244.10, attempts:504,  winRate:58, game:"wheel", streak:6  },
    { rank:5,  wallet:"7xKp...3mNq", stolen:198.60, attempts:431,  winRate:55, game:"yoink", streak:3  },
    { rank:6,  wallet:"Wj9i...Ef3n", stolen:166.35, attempts:788,  winRate:47, game:"both",  streak:1  },
    { rank:7,  wallet:"Ux1f...Dm6y", stolen:133.90, attempts:302,  winRate:53, game:"wheel", streak:2  },
    { rank:8,  wallet:"Bz9r...Wf2j", stolen:112.44, attempts:244,  winRate:51, game:"yoink", streak:4  },
    { rank:9,  wallet:"Hn6d...Yp1x", stolen:88.20,  attempts:188,  winRate:49, game:"both",  streak:0  },
    { rank:10, wallet:"Qm3a...Rt5u", stolen:71.55,  attempts:411,  winRate:43, game:"wheel", streak:1  },
  ],
};

const PRIZES: Record<Period, { label: string; prizes: { place: string; reward: string }[] }> = {
  daily:   { label:"Resets every 24h", prizes:[{place:"1st",reward:"2 SOL"},{place:"2nd",reward:"1 SOL"},{place:"3rd",reward:"0.5 SOL"}] },
  weekly:  { label:"Resets every Monday", prizes:[{place:"1st",reward:"10 SOL"},{place:"2nd",reward:"5 SOL"},{place:"3rd",reward:"2 SOL"}] },
  alltime: { label:"Hall of Fame", prizes:[{place:"👑 Legend",reward:"50 SOL + Badge"},{place:"💎 Elite",reward:"20 SOL + Badge"},{place:"🔥 Pro",reward:"10 SOL + Badge"}] },
};

export default function Leaderboard() {
  const [period, setPeriod]     = useState<Period>("weekly");
  const [filter, setFilter]     = useState<GameFilter>("all");

  const data = DATA[period].filter(p =>
    filter === "all" || p.game === filter || p.game === "both"
  );
  const prizes = PRIZES[period];

  const medal = (r: number, badge?: string) => {
    if (badge) return badge;
    if (r === 1) return "🥇";
    if (r === 2) return "🥈";
    if (r === 3) return "🥉";
    return `#${r}`;
  };

  const rankColor = (r: number) =>
    r === 1 ? "text-yoink-yellow" : r === 2 ? "text-slate-300" : r === 3 ? "text-amber-600" : "text-yoink-muted";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-yoink-yellow/5 via-yoink-surface to-yoink-orange/5 p-6 sm:p-8">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl animate-float">🏆</span>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">Leaderboard</h1>
              <p className="text-yoink-muted text-sm mt-0.5">Top stealers win SOL from the prize pool</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prize Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-yoink-yellow/5 to-yoink-orange/5 border-yoink-yellow/15"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-yoink-yellow" />
            <div>
              <p className="font-display font-bold text-white">{period.charAt(0).toUpperCase() + period.slice(1)} Prize Pool</p>
              <p className="text-xs text-yoink-muted">{prizes.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {prizes.prizes.map((p, i) => (
              <div key={i} className="text-center">
                <p className="text-xs text-yoink-muted">{p.place}</p>
                <p className="font-display font-extrabold text-yoink-yellow">{p.reward}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-white/3 border border-white/6 rounded-2xl p-1">
          {(["daily","weekly","alltime"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                period === p ? "bg-yoink-pink text-white shadow-[0_0_15px_rgba(255,51,102,0.3)]" : "text-yoink-muted hover:text-white"
              }`}
            >
              {p === "alltime" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white/3 border border-white/6 rounded-2xl p-1">
          {(["all","yoink","wheel"] as GameFilter[]).map(g => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                filter === g ? "bg-white/8 text-white" : "text-yoink-muted hover:text-white"
              }`}
            >
              {g === "yoink" && <Ghost className="w-3 h-3 text-yoink-pink" />}
              {g === "wheel" && <RotateCcw className="w-3 h-3 text-yoink-purple" />}
              {g === "all"   && <TrendingUp className="w-3 h-3" />}
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                {["Rank","Player","Game","SOL Stolen","Attempts","Win Rate","Streak"].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-mono uppercase text-yoink-muted ${
                    ["Attempts","Win Rate","Streak"].includes(h) ? "hidden md:table-cell" : ""
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <motion.tr
                  key={p.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`border-b border-white/3 hover:bg-white/2 transition-colors ${p.rank <= 3 ? "bg-yoink-yellow/2" : ""}`}
                >
                  <td className="px-4 py-3.5">
                    <span className={`font-display text-base font-extrabold ${rankColor(p.rank)}`}>
                      {medal(p.rank, p.badge)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-white text-sm">{p.wallet}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      {(p.game === "yoink" || p.game === "both") && (
                        <span className="tag tag-pink flex items-center gap-1"><Ghost className="w-3 h-3" />YOINK</span>
                      )}
                      {(p.game === "wheel" || p.game === "both") && (
                        <span className="tag tag-purple flex items-center gap-1"><RotateCcw className="w-3 h-3" />WHEEL</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-yoink-green">{p.stolen.toFixed(2)} SOL</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-yoink-muted text-sm">{p.attempts}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className={`font-bold text-sm ${p.winRate >= 65 ? "text-yoink-green" : p.winRate >= 50 ? "text-yoink-yellow" : "text-yoink-muted"}`}>
                      {p.winRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    {p.streak > 0
                      ? <span className="tag tag-orange">🔥 {p.streak}W</span>
                      : <span className="text-yoink-muted text-xs">—</span>
                    }
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Your Position */}
      <div className="card border-yoink-pink/15 bg-yoink-pink/3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-yoink-pink" />
          <div>
            <p className="font-bold text-white">Your Ranking</p>
            <p className="text-xs text-yoink-muted">Connect wallet to see where you stand</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-yoink text-sm">
          Connect Wallet
        </motion.button>
      </div>
    </div>
  );
}
