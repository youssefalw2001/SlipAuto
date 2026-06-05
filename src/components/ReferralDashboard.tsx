import { motion } from "framer-motion";
import { Check, Copy, ExternalLink, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

interface Ref {
  wallet: string;
  joined: string;
  volume: number;
  earned: number;
  active: boolean;
}

const REFS: Ref[] = [
  { wallet:"Bz9r...Wf2j", joined:"2d ago",  volume:14.4, earned:0.144, active:true },
  { wallet:"4tLs...Ck8v", joined:"5d ago",  volume:8.2,  earned:0.082, active:true },
  { wallet:"Hn6d...Yp1x", joined:"1w ago",  volume:22.1, earned:0.221, active:true },
  { wallet:"Qm3a...Rt5u", joined:"2w ago",  volume:5.5,  earned:0.055, active:false },
  { wallet:"Jp8e...Ah9w", joined:"3w ago",  volume:31.8, earned:0.318, active:true },
];

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);
  const link = "https://yoink.gg/ref/7xKp3mNq";
  const totalEarned = REFS.reduce((a, r) => a + r.earned, 0);
  const totalVol = REFS.reduce((a, r) => a + r.volume, 0);
  const active = REFS.filter(r => r.active).length;

  const copy = () => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const tweet = encodeURIComponent(`Just stole SOL on yoink.gg — the most addictive Solana game.\n\nJoin: ${link}`);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-4.5 h-4.5 text-y-green" />
          Referrals
        </h1>
        <p className="text-[13px] text-y-muted mt-0.5">Earn 1% of every bet your referrals make — forever</p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { n: "1", t: "Share link", d: "Send anywhere" },
          { n: "2", t: "They play", d: "No extra cost" },
          { n: "3", t: "You earn 1%", d: "Auto-paid" },
        ].map(s => (
          <div key={s.n} className="card-sm text-center">
            <div className="text-[10px] font-mono text-y-dim mb-1">Step {s.n}</div>
            <div className="text-[12px] font-semibold text-white">{s.t}</div>
            <div className="text-[11px] text-y-muted">{s.d}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Earned", val: `${totalEarned.toFixed(3)} SOL`, color: "text-y-green" },
          { label: "Referrals", val: `${REFS.length}`, color: "text-y-accent" },
          { label: "Volume", val: `${totalVol.toFixed(1)} SOL`, color: "text-y-cyan" },
          { label: "Active", val: `${active}`, color: "text-y-yellow" },
        ].map((s, i) => (
          <div key={i} className="card-sm">
            <p className="text-[10px] text-y-muted mb-1">{s.label}</p>
            <p className={`text-[17px] font-bold tabular-nums ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Link */}
      <div className="card space-y-4">
        <h3 className="text-[13px] font-semibold text-white flex items-center gap-2">
          <ExternalLink className="w-3.5 h-3.5 text-y-accent" />
          Your Referral Link
        </h3>
        <div className="flex gap-2">
          <div className="flex-1 bg-y-surface border border-y-border rounded-lg px-3 py-2.5 font-mono text-[12px] text-y-muted truncate">
            {link}
          </div>
          <button onClick={copy} className={`btn-secondary text-[12px] ${copied ? "border-y-green/30 text-y-green" : ""}`}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="flex gap-2.5">
          <a href={`https://twitter.com/intent/tweet?text=${tweet}`} target="_blank" rel="noreferrer" className="btn-secondary text-[12px]">
            Share on X
          </a>
          <a href={`https://t.me/share/url?url=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer" className="btn-secondary text-[12px]">
            Share on Telegram
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-y-border flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-white">Your Referrals</h3>
          <span className="text-[11px] text-y-dim">Connect wallet for live data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-y-border bg-y-surface/30">
                <th className="text-left px-4 py-2.5 font-medium text-y-muted">Wallet</th>
                <th className="text-left px-4 py-2.5 font-medium text-y-muted hidden sm:table-cell">Joined</th>
                <th className="text-right px-4 py-2.5 font-medium text-y-muted">Volume</th>
                <th className="text-right px-4 py-2.5 font-medium text-y-muted">Earned</th>
                <th className="text-right px-4 py-2.5 font-medium text-y-muted hidden sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {REFS.map((r, i) => (
                <tr key={i} className="border-b border-y-border/50 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-2.5 font-mono font-medium text-white">{r.wallet}</td>
                  <td className="px-4 py-2.5 text-y-muted hidden sm:table-cell">{r.joined}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-y-cyan">{r.volume.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-y-green">+{r.earned.toFixed(3)}</td>
                  <td className="px-4 py-2.5 text-right hidden sm:table-cell">
                    <span className={`pill ${r.active ? "pill-green" : "pill-dim"}`}>{r.active ? "Active" : "Inactive"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projection */}
      <div className="card space-y-3">
        <h3 className="text-[13px] font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-y-accent2" />
          Earnings Projection
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { refs: "10", daily: "0.05", monthly: "1.5" },
            { refs: "50", daily: "0.25", monthly: "7.5" },
            { refs: "200", daily: "1.0", monthly: "30" },
          ].map((p, i) => (
            <div key={i} className="bg-y-surface rounded-xl p-3 text-center border border-y-border">
              <p className="text-[11px] text-y-muted">{p.refs} refs</p>
              <p className="text-[15px] font-bold text-y-green mt-1">{p.daily}/day</p>
              <p className="text-[10px] text-y-accent2">~{p.monthly} SOL/mo</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
