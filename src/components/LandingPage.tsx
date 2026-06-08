import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Crosshair, Target, TrendingUp, Wallet, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import PremiumIcon from "./ui/PremiumIcon";

interface Props {
  onEnter: () => void;
  onConnect: () => void;
  connecting: boolean;
  wallet: string | null;
  onHowto: () => void;
}

/* ── Floating particle field — pure CSS, GPU-composited ── */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  size: 1 + (i % 3),
  dur: 6 + (i % 5) * 1.8,
  delay: (i % 7) * -0.9,
  color: i % 5 === 0 ? "#ffd700" : i % 5 === 1 ? "#7000ff" : i % 5 === 2 ? "#00f5ff" : "rgba(255,255,255,0.4)",
}));

/* ── Live yoink feed ticker (landing version — concise) ── */
const TICKER_EVENTS = [
  { wallet: "7xKp...3mNq", amount: "3.21", win: true },
  { wallet: "Bz9r...Wf2j", amount: "8.44", win: true },
  { wallet: "Hn6d...Yp1x", amount: "1.07", win: false },
  { wallet: "Qm3a...Rt5u", amount: "12.5", win: true },
  { wallet: "Ew7b...Ln0z", amount: "0.88", win: true },
  { wallet: "Fs2c...Vg4k", amount: "5.32", win: true },
  { wallet: "Jp8e...Ah9w", amount: "2.14", win: false },
  { wallet: "Rk5h...Oc2p", amount: "19.7", win: true },
];

/* ── Magnetic CTA button ── */
function MagneticButton({ onClick, children, className, style }: {
  onClick: () => void; children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 400, damping: 28 });
  const sy = useSpring(y, { stiffness: 400, damping: 28 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy, ...style }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}

/* ── Animated counter ── */
function AnimCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const raf = requestAnimationFrame(function tick(t) {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

export default function LandingPage({ onEnter, onConnect, connecting, wallet, onHowto }: Props) {
  const [stolen, setStolen] = useState(28412);
  const [hunters, setHunters] = useState(1247);
  const [jackpots, setJackpots] = useState(41);
  const [tickerVisible, setTickerVisible] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setStolen(s => s + Math.floor(Math.random() * 8 + 1));
      setHunters(h => h + (Math.random() > 0.5 ? 1 : -1));
      setJackpots(j => j + (Math.random() > 0.85 ? 1 : 0));
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  const steps = [
    { icon: Target,     tone: "#ffd700", t: "Target",  d: "Pick any wallet. See live odds." },
    { icon: Crosshair,  tone: "#ff1744", t: "Yoink",   d: "One click. Steal their SOL." },
    { icon: TrendingUp, tone: "#00e676", t: "Stack",   d: "Compound wins. Climb the board." },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center text-center px-5 overflow-hidden"
      style={{ minHeight: "calc(100vh - 60px)" }}>

      {/* ── Particle field ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            }}
            animate={{
              y: [0, -18, 0, 12, 0],
              x: [0, 6, -4, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Concentric rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: 800, height: 800, background: "radial-gradient(circle, rgba(112,0,255,0.08) 0%, rgba(255,215,0,0.06) 40%, transparent 65%)" }} />
        <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 560, height: 560, border: "1px dashed rgba(255,215,0,0.12)" }}
          animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />
        <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 360, height: 360, border: "1px solid rgba(112,0,255,0.10)" }}
          animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 180, height: 180, border: "1px solid rgba(255,255,255,0.04)" }} />
      </div>

      {/* ── Main content ── */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-6 py-16">

        {/* Live badge */}
        <motion.div variants={fadeUp}>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.25)" }}>
            <span className="w-2 h-2 rounded-full blink" style={{ background: "#00e676", boxShadow: "0 0 8px #00e676" }} />
            <span className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "#00e676" }}>
              Live · {hunters.toLocaleString()} hunters in arena
            </span>
          </div>
        </motion.div>

        {/* ── WORDMARK — Orbitron, massive, animated ── */}
        <motion.div variants={fadeUp} className="relative">
          {/* Glow bloom behind text */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ filter: "blur(60px)", background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,215,0,0.2), transparent 70%)" }} />

          <h1 className="relative font-display leading-[0.88] tracking-[0.06em]"
            style={{ fontSize: "clamp(68px, 14vw, 148px)" }}>
            {/* Letter-by-letter entrance */}
            {"YOINK".split("").map((ch, i) => (
              <motion.span key={i} className="inline-block text-white"
                initial={{ opacity: 0, y: 30, rotateX: -60 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ textShadow: "0 0 40px rgba(255,255,255,0.15), 0 2px 0 rgba(0,0,0,0.5)" }}>
                {ch}
              </motion.span>
            ))}
            <motion.span
              className="inline-block gold-text-gradient"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              .GG
            </motion.span>
          </h1>

          <motion.p variants={fadeUp}
            className="mt-4 text-[16px] sm:text-[18px] max-w-md mx-auto leading-relaxed font-light"
            style={{ color: "#9aa4b8" }}>
            The arena where you{" "}
            <span className="text-white font-semibold" style={{ textShadow: "0 0 20px rgba(255,215,0,0.3)" }}>
              steal real SOL
            </span>{" "}
            from other players.
          </motion.p>
        </motion.div>

        {/* ── CTA buttons ── */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 mt-2 relative">
          {/* Magnetic orbit dot on the primary CTA */}
          <div className="relative">
            <MagneticButton onClick={onEnter}
              className="btn-yoink pulsing relative overflow-visible"
              style={{ fontSize: 17, padding: "18px 44px", letterSpacing: "2px" }}>
              <Crosshair className="w-5 h-5" strokeWidth={2.5} />
              Enter the Arena
              <ArrowRight className="w-5 h-5" />
            </MagneticButton>
          </div>

          {!wallet && (
            <motion.button onClick={onConnect} disabled={connecting}
              className="btn-ghost relative group"
              style={{ padding: "16px 28px", fontSize: 13 }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Wallet className="w-4 h-4" />
              {connecting ? "Connecting..." : "Connect Wallet"}
            </motion.button>
          )}
        </motion.div>

        {/* ── Live stat strip ── */}
        <motion.div variants={fadeUp}
          className="grid grid-cols-3 gap-px w-full max-w-lg rounded-2xl overflow-hidden mt-2"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { v: stolen, label: "SOL Stolen", color: "#ffd700", prefix: "" },
            { v: hunters, label: "Hunters Live", color: "#00e676", prefix: "" },
            { v: jackpots, label: "Jackpots Hit", color: "#7000ff", prefix: "" },
          ].map((s, i) => (
            <motion.div key={s.label}
              className="flex flex-col items-center py-5 px-2"
              style={{ background: "rgba(8,10,17,0.9)" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}>
              <div className="font-display text-[28px] leading-none tracking-[0.04em]"
                style={{ color: s.color, textShadow: `0 0 20px ${s.color}60` }}>
                <AnimCounter target={s.v} />
              </div>
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] mt-2" style={{ color: "#8892a4" }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── How it works — 3 steps ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 w-full max-w-lg mt-1">
          {steps.map((s, i) => (
            <motion.div key={s.t}
              className="flex flex-col items-center gap-2.5 p-4 rounded-2xl relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + i * 0.1 }}
              whileHover={{ y: -4, borderColor: `${s.tone}44`, boxShadow: `0 12px 40px ${s.tone}18` }}>
              {/* bg glow */}
              <div className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 0%, ${s.tone}10 0%, transparent 70%)` }} />
              <PremiumIcon icon={s.icon} tone={s.tone} size={44} rounded={14} iconSize={22} />
              <div className="font-display text-[13px] tracking-[0.06em] text-white relative">
                <span className="font-mono text-[10px] mr-1.5 opacity-50">{i + 1}.</span>{s.t}
              </div>
              <div className="text-[10.5px] leading-snug text-center relative" style={{ color: "#8892a4" }}>{s.d}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Recent yoinks micro-ticker ── */}
        <motion.div variants={fadeUp} className="w-full max-w-lg">
          <AnimatePresence>
            {tickerVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,10,17,0.7)" }}>
                <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <Zap className="w-3 h-3" style={{ color: "#ffd700" }} />
                  <span className="text-[10px] font-mono font-bold tracking-[0.16em] uppercase" style={{ color: "#ffd700" }}>
                    Recent Yoinks
                  </span>
                </div>
                <div className="ticker flex items-center gap-10 whitespace-nowrap px-4 py-2.5">
                  {[...TICKER_EVENTS, ...TICKER_EVENTS].map((e, i) => (
                    <span key={i} className="inline-flex items-center gap-2 text-[11px]">
                      <span className="font-mono" style={{ color: "#8892a4" }}>{e.wallet}</span>
                      <span className="font-bold font-mono" style={{ color: e.win ? "#00e676" : "#ff5c7a" }}>
                        {e.win ? "+" : "-"}{e.amount} SOL
                      </span>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.button variants={fadeUp} onClick={onHowto}
          className="text-[12px] font-mono hover:text-white transition-colors flex items-center gap-1.5"
          style={{ color: "#8892a4" }}
          whileHover={{ x: 4 }}>
          How it works <ArrowRight className="w-3 h-3" />
        </motion.button>
      </motion.div>
    </div>
  );
}
