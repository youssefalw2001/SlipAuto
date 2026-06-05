import { motion } from "framer-motion";
import { Check, Copy, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

interface Ref { wallet:string; joined:string; vol:number; earned:number; active:boolean; }

const REFS: Ref[] = [
  { wallet:"Bz9r...Wf2j", joined:"2d ago",  vol:14.4, earned:0.144, active:true  },
  { wallet:"4tLs...Ck8v", joined:"5d ago",  vol:8.2,  earned:0.082, active:true  },
  { wallet:"Hn6d...Yp1x", joined:"1w ago",  vol:22.1, earned:0.221, active:true  },
  { wallet:"Qm3a...Rt5u", joined:"2w ago",  vol:5.5,  earned:0.055, active:false },
  { wallet:"Jp8e...Ah9w", joined:"3w ago",  vol:31.8, earned:0.318, active:true  },
];

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);
  const link = "https://yoink.gg/ref/7xKp3mNq";
  const totalEarned = REFS.reduce((a, r) => a + r.earned, 0);
  const totalVol = REFS.reduce((a, r) => a + r.vol, 0);
  const active = REFS.filter(r => r.active).length;

  const copy = () => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const tweet = encodeURIComponent(`Just stole SOL on yoink.gg 😈\n\nThe most addictive Solana game — target wallets, steal SOL.\n\nJoin: ${link}`);

  const stats = [
    { label:"EARNED",    val:`${totalEarned.toFixed(3)}`, unit:"SOL", color:"#00d470" },
    { label:"REFERRALS", val:String(REFS.length),         unit:"total",  color:"#ff6a2a" },
    { label:"VOLUME",    val:`${totalVol.toFixed(1)}`,    unit:"SOL",    color:"#00c8e8" },
    { label:"ACTIVE",    val:String(active),               unit:"players",color:"#9b3dff" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-hero">
        <h1 className="big-number text-[48px] leading-none text-white mb-1">REFERRALS</h1>
        <p className="text-[13px]" style={{ color: '#6060a0' }}>Earn 1% of every bet your referrals make — forever, automatically to your wallet</p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { n:"01", t:"Share Link",    d:"Send it anywhere" },
          { n:"02", t:"They Play",     d:"No cost to them" },
          { n:"03", t:"You Earn 1%",   d:"Forever, auto-paid" },
        ].map(s => (
          <div key={s.n} className="card-sm text-center">
            <div className="text-[11px] font-mono tracking-widest mb-2" style={{ color: '#383855' }}>{s.n}</div>
            <div className="text-[14px] font-bold text-white mb-0.5">{s.t}</div>
            <div className="text-[11px]" style={{ color: '#6060a0' }}>{s.d}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card-sm">
            <p className="text-[10px] font-mono tracking-widest mb-2" style={{ color: '#383855' }}>{s.label}</p>
            <p className="big-number text-[30px] leading-none" style={{ color: s.color }}>{s.val}</p>
            <p className="text-[11px] font-mono mt-1" style={{ color: '#6060a0' }}>{s.unit}</p>
          </motion.div>
        ))}
      </div>

      {/* Link */}
      <div className="card-flat space-y-4">
        <h3 className="text-[14px] font-bold text-white">Your Referral Link</h3>
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl px-4 py-3 font-mono text-[12px] truncate"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#6060a0' }}>
            {link}
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copy}
            className="btn-ghost"
            style={{ color: copied ? '#00d470' : undefined, borderColor: copied ? 'rgba(0,212,112,0.3)' : undefined }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </motion.button>
        </div>
        <div className="flex flex-wrap gap-2">
          <motion.a whileHover={{ scale: 1.03 }} href={`https://twitter.com/intent/tweet?text=${tweet}`} target="_blank" rel="noreferrer"
            className="btn-ghost text-[12px]">
            Share on X
          </motion.a>
          <motion.a whileHover={{ scale: 1.03 }} href={`https://t.me/share/url?url=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer"
            className="btn-ghost text-[12px]">
            Share on Telegram
          </motion.a>
        </div>
      </div>

      {/* Table */}
      <div className="card-flat overflow-hidden p-0">
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-[13px] font-semibold text-white flex items-center gap-2">
            <Users className="w-3.5 h-3.5" style={{ color: '#ff4d00' }} />
            Your Referrals ({REFS.length})
          </h3>
          <span className="text-[11px]" style={{ color: '#383855' }}>Connect wallet for live data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {["Wallet","Joined","Volume","Earned","Status"].map(h => (
                  <th key={h}
                    className={`px-4 py-3 text-left font-mono uppercase tracking-widest ${["Joined","Status"].includes(h) ? "hidden sm:table-cell" : ""}`}
                    style={{ color: '#383855', fontSize: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REFS.map((r, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/1 transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  <td className="px-4 py-3 font-mono font-medium text-white">{r.wallet}</td>
                  <td className="px-4 py-3 hidden sm:table-cell" style={{ color: '#6060a0' }}>{r.joined}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: '#00c8e8' }}>{r.vol.toFixed(1)}</td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: '#00d470' }}>+{r.earned.toFixed(3)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`pill ${r.active ? "pill-green" : "pill-dim"}`} style={{ fontSize: '10px' }}>
                      {r.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projection */}
      <div className="card-flat space-y-4">
        <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4" style={{ color: '#7000ff' }} />
          Earnings Projection
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { refs:"10", daily:"0.05/day",  mo:"~1.5 SOL/mo" },
            { refs:"50", daily:"0.25/day",  mo:"~7.5 SOL/mo" },
            { refs:"200",daily:"1.0/day",   mo:"~30 SOL/mo" },
          ].map((p, i) => (
            <motion.div key={i} whileHover={{ y: -2 }} className="text-center rounded-xl py-4 px-3"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-[12px] font-semibold text-white">{p.refs} refs</p>
              <p className="big-number text-[24px] mt-1" style={{ color: '#00d470' }}>{p.daily}</p>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: '#7000ff' }}>{p.mo}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-[10px] text-center" style={{ color: '#383855' }}>Based on average YOINK.GG play volume. Actual earnings vary.</p>
      </div>
    </div>
  );
}
