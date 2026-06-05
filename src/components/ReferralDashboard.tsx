import React, { useState } from "react";
import { Users, Copy, Check, TrendingUp, Zap, Swords, ExternalLink, Gift } from "lucide-react";

interface Referral {
  wallet: string;
  joined: string;
  volume: number;
  earned: number;
  active: boolean;
}

const MOCK_REFERRALS: Referral[] = [
  { wallet: "Bz9r...Wf2j", joined: "2 days ago", volume: 14.4, earned: 0.144, active: true },
  { wallet: "4tLs...Ck8v", joined: "5 days ago", volume: 8.2, earned: 0.082, active: true },
  { wallet: "Hn6d...Yp1x", joined: "1 week ago", volume: 22.1, earned: 0.221, active: true },
  { wallet: "Qm3a...Rt5u", joined: "2 weeks ago", volume: 5.5, earned: 0.055, active: false },
  { wallet: "Jp8e...Ah9w", joined: "3 weeks ago", volume: 31.8, earned: 0.318, active: true },
];

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://solarena.gg/ref/7xKp3mNq";
  const totalEarned = MOCK_REFERRALS.reduce((a, r) => a + r.earned, 0);
  const totalVolume = MOCK_REFERRALS.reduce((a, r) => a + r.volume, 0);
  const activeRefs = MOCK_REFERRALS.filter((r) => r.active).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tweetText = encodeURIComponent(
    `🔥 Just won on SOL Arena — the most addictive Solana gambling platform!\n\nThe Surge + SOL Wars = pure adrenaline.\n\nJoin me: ${referralLink}\n\n#Solana #SOLArena #Crypto`
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-arena-green/10 border border-arena-green/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-arena-green" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Referral Dashboard</h1>
          <p className="text-sm text-arena-muted">Earn 1% of every bet your referrals make — forever, automatically</p>
        </div>
      </div>

      {/* How it Works Banner */}
      <div className="card bg-gradient-to-r from-arena-green/5 to-arena-blue/5 border-arena-green/20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { step: "1", icon: "🔗", title: "Share Your Link", desc: "Send it to anyone anywhere" },
            { step: "2", icon: "👥", title: "They Sign Up & Play", desc: "No extra cost to them" },
            { step: "3", icon: "💰", title: "You Earn 1% Forever", desc: "Auto-paid to your wallet" },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                {s.icon}
              </div>
              <p className="font-bold text-white text-sm">{s.title}</p>
              <p className="text-xs text-arena-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Earned", value: `${totalEarned.toFixed(3)} SOL`, sub: `≈ $${(totalEarned * 148).toFixed(2)}`, color: "text-arena-green", icon: <TrendingUp className="w-4 h-4" /> },
          { label: "Total Referrals", value: MOCK_REFERRALS.length.toString(), sub: `${activeRefs} active`, color: "text-arena-purple", icon: <Users className="w-4 h-4" /> },
          { label: "Total Volume", value: `${totalVolume.toFixed(1)} SOL`, sub: "from referrals", color: "text-arena-blue", icon: <Zap className="w-4 h-4" /> },
          { label: "This Month", value: "0.481 SOL", sub: "↑ vs last month", color: "text-yellow-400", icon: <Gift className="w-4 h-4" /> },
        ].map((stat, i) => (
          <div key={i} className="card">
            <div className={`flex items-center gap-2 mb-2 ${stat.color}`}>
              {stat.icon}
              <span className="text-xs font-mono uppercase text-arena-muted">{stat.label}</span>
            </div>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-arena-muted mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Referral Link Box */}
      <div className="card">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-arena-purple" />
          Your Referral Link
        </h3>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-arena-muted overflow-hidden text-ellipsis whitespace-nowrap">
            {referralLink}
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all border ${
              copied
                ? "bg-arena-green/10 border-arena-green/30 text-arena-green"
                : "bg-white/5 border-white/10 text-arena-muted hover:text-white hover:border-white/30"
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${tweetText}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 text-[#1DA1F2] text-sm font-bold hover:bg-[#1DA1F2]/20 transition-all"
          >
            𝕏 Share on Twitter
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("🔥 Join me on SOL Arena — win SOL playing The Surge & SOL Wars!")}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#229ED9]/10 border border-[#229ED9]/20 text-[#229ED9] text-sm font-bold hover:bg-[#229ED9]/20 transition-all"
          >
            ✈️ Share on Telegram
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-arena-muted text-sm font-bold hover:text-white hover:border-white/30 transition-all"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </button>
        </div>
      </div>

      {/* Referral Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-arena-purple" />
            Your Referrals ({MOCK_REFERRALS.length})
          </h3>
          <span className="text-xs text-arena-muted">Connect wallet to view real data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="text-left px-4 py-3 text-xs font-mono uppercase text-arena-muted">Wallet</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase text-arena-muted hidden sm:table-cell">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase text-arena-muted">Volume</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase text-arena-muted">You Earned</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase text-arena-muted hidden sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REFERRALS.map((r, i) => (
                <tr key={i} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-white text-sm">{r.wallet}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-arena-muted">{r.joined}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-mono text-sm text-arena-blue">{r.volume.toFixed(1)} SOL</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-mono font-bold text-sm text-arena-green">+{r.earned.toFixed(3)} SOL</span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      r.active
                        ? "bg-arena-green/10 text-arena-green border border-arena-green/20"
                        : "bg-white/5 text-arena-muted border border-white/10"
                    }`}>
                      {r.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-white/3 border-t border-white/10">
                <td className="px-4 py-3 font-bold text-white text-sm" colSpan={2}>Total</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-arena-blue">{totalVolume.toFixed(1)} SOL</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-arena-green">+{totalEarned.toFixed(3)} SOL</td>
                <td className="hidden sm:table-cell" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Earnings Projection */}
      <div className="card bg-gradient-to-br from-arena-purple/5 to-arena-blue/5 border-arena-purple/20">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-arena-purple" />
          Earnings Projection Calculator
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { refs: "10 referrals", dailyVol: "each plays 0.5 SOL/day", earn: "0.05 SOL/day", monthly: "~1.5 SOL/mo" },
            { refs: "50 referrals", dailyVol: "each plays 0.5 SOL/day", earn: "0.25 SOL/day", monthly: "~7.5 SOL/mo" },
            { refs: "200 referrals", dailyVol: "each plays 0.5 SOL/day", earn: "1.0 SOL/day", monthly: "~30 SOL/mo" },
          ].map((p, i) => (
            <div key={i} className="bg-white/3 rounded-xl p-4 border border-white/5">
              <p className="text-sm font-bold text-white">{p.refs}</p>
              <p className="text-xs text-arena-muted mt-1">{p.dailyVol}</p>
              <p className="text-lg font-black text-arena-green mt-2">{p.earn}</p>
              <p className="text-xs text-arena-purple">{p.monthly}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-arena-muted mt-4 text-center">
          * Estimates based on average play volume. Actual earnings depend on your referrals' activity.
        </p>
      </div>
    </div>
  );
}
