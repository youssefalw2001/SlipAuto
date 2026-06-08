import { motion } from "framer-motion";
import { ArrowRight, Coins, Crosshair, Target, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import PremiumIcon from "./ui/PremiumIcon";

interface Props {
  onEnter: () => void;
  onConnect: () => void;
  connecting: boolean;
  wallet: string | null;
  onHowto: () => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function LandingPage({ onEnter, onConnect, connecting, wallet, onHowto }: Props) {
  // A single, gentle live counter so the page feels alive without clutter.
  const [stolen, setStolen] = useState(28412.6);
  useEffect(() => {
    const iv = setInterval(() => setStolen(s => parseFloat((s + Math.random() * 4).toFixed(1))), 2500);
    return () => clearInterval(iv);
  }, []);

  const steps = [
    { icon: Target, tone: "#ffd700", t: "Target", d: "Pick any wallet in the arena" },
    { icon: Crosshair, tone: "#ff5c7a", t: "Yoink", d: "Pay a small fee, steal their SOL" },
    { icon: TrendingUp, tone: "#00e676", t: "Stack", d: "Compound wins, climb the ranks" },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center text-center px-5 overflow-hidden"
      style={{ minHeight: "calc(100vh - 60px)" }}>

      {/* Ambient backdrop — soft gold pool + slow rotating crosshair ring */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: 720, height: 720, background: "radial-gradient(circle, rgba(255,215,0,0.10), transparent 62%)" }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full spin-slow"
          style={{ width: 540, height: 540, border: "1px dashed rgba(255,215,0,0.10)" }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 380, height: 380, border: "1px solid rgba(255,255,255,0.04)" }} />
      </div>

      <motion.div variants={container} initial="hidden" animate="show"
        className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-7 py-20">

        {/* Live badge */}
        <motion.div variants={item}>
          <span className="trust-chip">
            <span className="w-1.5 h-1.5 rounded-full bg-y-green blink" /> Live on Solana
          </span>
        </motion.div>

        {/* Wordmark */}
        <motion.div variants={item}>
          <h1 className="font-display leading-[0.92] tracking-[0.01em]"
            style={{ fontSize: "clamp(64px, 13vw, 132px)" }}>
            <span className="text-white" style={{ textShadow: "0 0 50px rgba(255,255,255,0.12)" }}>YOINK</span>
            <span className="gold-text-gradient">.GG</span>
          </h1>
          <p className="mt-3 text-[15px] sm:text-[17px] max-w-md mx-auto leading-relaxed" style={{ color: "#aab2c2" }}>
            The arena where you <span className="text-white font-semibold">steal real SOL</span> from other players.
            Target. Yoink. Walk away richer.
          </p>
        </motion.div>

        {/* Primary actions */}
        <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-3 mt-1">
          <button onClick={onEnter} className="btn-yoink pulsing" style={{ fontSize: 17, padding: "16px 40px" }}>
            <Crosshair className="w-5 h-5" strokeWidth={2.5} /> Enter the Arena <ArrowRight className="w-4 h-4" />
          </button>
          {!wallet && (
            <button onClick={onConnect} disabled={connecting} className="btn-ghost" style={{ padding: "14px 24px", fontSize: 13 }}>
              <Wallet className="w-4 h-4" /> {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </motion.div>

        {/* Slim live-stat strip */}
        <motion.div variants={item}
          className="mt-4 grid grid-cols-3 gap-px rounded-2xl overflow-hidden w-full max-w-lg"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.05)" }}>
          {[
            { v: stolen.toLocaleString(undefined, { maximumFractionDigits: 0 }), l: "SOL stolen", c: "#ffd700" },
            { v: "1,240", l: "Hunters online", c: "#00e676" },
            { v: "41.2", l: "Biggest yoink", c: "#4da3ff" },
          ].map(s => (
            <div key={s.l} className="py-4 px-2" style={{ background: "rgba(8,10,17,0.85)" }}>
              <div className="font-display text-[26px] leading-none" style={{ color: s.c }}>{s.v}</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] mt-1.5" style={{ color: "#8892a4" }}>{s.l}</div>
            </div>
          ))}
        </motion.div>

        {/* Mini how-it-works — three beats, no walls of text */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3 w-full max-w-lg mt-2">
          {steps.map((s, i) => (
            <div key={s.t} className="flex flex-col items-center gap-2">
              <PremiumIcon icon={s.icon} tone={s.tone} size={46} rounded={14} iconSize={22} />
              <div className="text-[12px] font-bold text-white">
                <span className="font-mono mr-1" style={{ color: s.tone }}>{i + 1}.</span>{s.t}
              </div>
              <div className="text-[10.5px] leading-snug" style={{ color: "#8892a4" }}>{s.d}</div>
            </div>
          ))}
        </motion.div>

        <motion.button variants={item} onClick={onHowto}
          className="text-[12px] font-mono mt-1 hover:text-white transition-colors" style={{ color: "#8892a4" }}>
          How it works →
        </motion.button>
      </motion.div>
    </div>
  );
}
