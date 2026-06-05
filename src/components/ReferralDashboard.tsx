import { motion } from "framer-motion";
import { Check, Copy, ExternalLink, Ghost, TrendingUp, Users, Zap } from "lucide-react";
import { useState } from "react";

interface Referral {
  wallet: string;
  joined: string;
  volume: number;
  earned: number;
  active: boolean;
}

const REFS: Referral[] = [
  { wallet:"Bz9r...Wf2j", joined:"2 days ago",  volume:14.4, earned:0.144, active:true  },
  { wallet:"4tLs...Ck8v", joined:"5 days ago",  volume:8.2,  earned:0.082, active:true  },
  { wallet:"Hn6d...Yp1x", joined:"1 week ago",  volume:22.1, earned:0.221, active:true  },
  { wallet:"Qm3a...Rt5u", joined:"2 weeks ago", volume:5.5,  earned:0.055, active:false },
  { wallet:"Jp8e...Ah9w", joined:"3 weeks ago", volume:31.8, earned:0.318, active:true  },
];

const PROJECTIONS = [
  { refs:"10 referrals",  vol:"0.5 SOL/day each", daily:"0.05 SOL/day",  monthly:"~1.5 SOL/mo" },
  { refs:"50 referrals",  vol:"0.5 SOL/day each", daily:"0.25 SOL/day",  monthly:"~7.5 SOL/mo" },
  { refs:"200 referrals", vol:"0.5 SOL/day each", daily:"1.0 SOL/day",   monthly:"~30 SOL/mo"  },
];

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);
  const link = "https://yoink.gg/ref/7xKp3mNq";

  const totalEarned  = REFS.reduce((a, r) => a + r.earned, 0);
  const totalVolume  = REFS.reduce((a, r) => a + r.volume, 0);
  const activeCount  = REFS.filter(r => r.active).length;
  const solPrice     = 148;

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tweetText = encodeURIComponent(
    `😈 Just stole SOL on YOINK.gg\n\nThe most addictive crypto game on Solana — literally steal other people's SOL.\n\nJoin me: ${link}\n\n#Solana #YOINK #Crypto`
  );
  const tgText = encodeURIComponent("😈 Join me on YOINK.gg — steal SOL from other wallets. It's insane.");

  const stats = [
    { label:"Total Earned",    value:`${totalEarned.toFixed(3)} SOL`, sub:`≈ $${(totalEarned * solPrice).toFixed(0)}`, color:"text-yoink-green",  icon:<TrendingUp className="w-4 h-4" /> },
    { label:"Total Referrals", value:REFS.length.toString(),          sub:`${activeCount} active`,                     color:"text-yoink-pink",   icon:<Users className="w-4 h-4" /> },
    { label:"Volume Driven",   value:`${totalVolume.toFixed(1)} SOL`, sub:"from referrals",                            color:"text-yoink-cyan",   icon:<Zap className="w-4 h-4" /> },
    { label:"This Month",      value:"0.481 SOL",                     sub:"↑ growing",                                 color:"text-yoink-yellow", icon:<Ghost className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-yoink-green/5 via-yoink-surface to-yoink-cyan/5 p-6 sm:p-8">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex items-center gap-4">
          <span className="text-4xl animate-float">💰</span>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">Referrals</h1>
            <p className="text-yoink-muted text-sm mt-0.5">Earn 1% of every bet your referrals make — forever, automatically</p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="card border-yoink-green/15 bg-gradient-to-r from-yoink-green/3 to-yoink-cyan/3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { emoji:"🔗", step:"1", title:"Share Your Link", desc:"Send it to anyone, anywhere" },
            { emoji:"😈", step:"2", title:"They Play YOINK",  desc:"No extra cost to them" },
            { emoji:"💰", step:"3", title:"You Earn 1% Forever", desc:"Auto-paid to your wallet" },
          ].map(s => (
            <motion.div key={s.step} whileHover={{ y: -3 }} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                {s.emoji}
              </div>
              <p className="font-display font-bold text-white">{s.title}</p>
              <p className="text-xs text-yoink-muted">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card"
          >
            <div className={`flex items-center gap-2 mb-2 ${s.color}`}>
              {s.icon}
              <span className="text-xs font-mono uppercase text-yoink-muted">{s.label}</span>
            </div>
            <p className={`font-display text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-yoink-muted mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="card">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-yoink-pink" />
          Your Referral Link
        </h3>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-white/3 border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-yoink-muted overflow-hidden text-ellipsis whitespace-nowrap">
            {link}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={copy}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm border transition-all ${
              copied
                ? "bg-yoink-green/10 border-yoink-green/30 text-yoink-green"
                : "bg-white/5 border-white/10 text-yoink-muted hover:text-white hover:border-white/30"
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-3">
          <motion.a
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            href={`https://twitter.com/intent/tweet?text=${tweetText}`}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DA1F2]/8 border border-[#1DA1F2]/20 text-[#1DA1F2] text-sm font-bold hover:bg-[#1DA1F2]/15 transition-all"
          >
            𝕏 Share on Twitter
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${tgText}`}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#229ED9]/8 border border-[#229ED9]/20 text-[#229ED9] text-sm font-bold hover:bg-[#229ED9]/15 transition-all"
          >
            ✈️ Share on Telegram
          </motion.a>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={copy}
            className="btn-ghost text-sm"
          >
            <Copy className="w-4 h-4" /> Copy Link
          </motion.button>
        </div>
      </div>

      {/* Referral Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-display font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-yoink-pink" />
            Your Referrals ({REFS.length})
          </h3>
          <span className="text-xs text-yoink-muted">Connect wallet for live data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                {["Wallet","Joined","Volume","You Earned","Status"].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-mono uppercase text-yoink-muted ${
                    ["Joined","Status"].includes(h) ? "hidden sm:table-cell" : ""
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REFS.map((r, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/3 hover:bg-white/2 transition-colors"
                >
                  <td className="px-4 py-3.5"><span className="font-mono font-bold text-white text-sm">{r.wallet}</span></td>
                  <td className="px-4 py-3.5 hidden sm:table-cell"><span className="text-sm text-yoink-muted">{r.joined}</span></td>
                  <td className="px-4 py-3.5"><span className="font-mono text-sm text-yoink-cyan">{r.volume.toFixed(1)} SOL</span></td>
                  <td className="px-4 py-3.5"><span className="font-mono font-bold text-sm text-yoink-green">+{r.earned.toFixed(3)} SOL</span></td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className={`tag ${r.active ? "tag-green" : "bg-white/5 text-yoink-muted border-white/10"}`}>
                      {r.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/8 bg-white/2">
                <td className="px-4 py-3 font-display font-bold text-white" colSpan={2}>Total</td>
                <td className="px-4 py-3 font-mono font-bold text-yoink-cyan">{totalVolume.toFixed(1)} SOL</td>
                <td className="px-4 py-3 font-mono font-bold text-yoink-green">+{totalEarned.toFixed(3)} SOL</td>
                <td className="hidden sm:table-cell" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Projection */}
      <div className="card border-yoink-purple/15 bg-yoink-purple/3">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-yoink-purple" />
          Earnings Projection
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PROJECTIONS.map((p, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3 }}
              className="bg-white/3 rounded-2xl p-4 border border-white/5 text-center"
            >
              <p className="font-display font-bold text-white">{p.refs}</p>
              <p className="text-xs text-yoink-muted mt-1">{p.vol}</p>
              <p className="font-display text-xl font-extrabold text-yoink-green mt-2">{p.daily}</p>
              <p className="text-xs text-yoink-purple">{p.monthly}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-yoink-muted mt-4 text-center">
          * Based on average YOINK.gg play volume. Your referrals' actual activity may vary.
        </p>
      </div>
    </div>
  );
}
