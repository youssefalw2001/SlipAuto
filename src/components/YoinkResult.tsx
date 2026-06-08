import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Share2, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface YoinkResultData {
  type: "win" | "lose";
  amount: number;
  fee: number;
  net: number;
  victim: string;
  newBalance: number;
  isBounty?: boolean;
  pityNext?: number | null;
}

/* ── Outcome tier based on win amount ── */
type WinTier = "regular" | "big" | "jackpot";
function getWinTier(amount: number): WinTier {
  if (amount >= 1.5) return "jackpot";
  if (amount >= 0.4) return "big";
  return "regular";
}

/* ── easeOutExpo count-up ── */
function useCountUp(target: number, duration: number, active: boolean) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(target * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration, active]);
  return val;
}

/* ── Tier configs ── */
const TIER_CONFIG = {
  regular: {
    headline: "YOINKED",
    headlineColor: "#00e5ff",
    glow: "rgba(0,229,255,0.3)",
    border: "rgba(0,229,255,0.35)",
    borderTop: "rgba(0,229,255,0.8)",
    bg: "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,229,255,0.08), rgba(2,2,8,0.9) 65%)",
    shockwaveColor: "rgba(0,229,255,0.6)",
    coinCount: 12,
    autoDismiss: 2800,
  },
  big: {
    headline: "BIG YOINK",
    headlineColor: "#ffd700",
    glow: "rgba(255,215,0,0.4)",
    border: "rgba(255,215,0,0.4)",
    borderTop: "rgba(255,215,0,0.9)",
    bg: "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(255,215,0,0.12), rgba(2,2,8,0.9) 65%)",
    shockwaveColor: "rgba(255,215,0,0.7)",
    coinCount: 22,
    autoDismiss: 3600,
  },
  jackpot: {
    headline: "JACKPOT",
    headlineColor: "#ffd700",
    glow: "rgba(255,215,0,0.5)",
    border: "rgba(255,215,0,0.5)",
    borderTop: "rgba(255,215,0,1)",
    bg: "radial-gradient(ellipse 90% 80% at 50% 45%, rgba(255,215,0,0.18), rgba(112,0,255,0.12) 50%, rgba(2,2,8,0.92) 75%)",
    shockwaveColor: "rgba(255,215,0,0.8)",
    coinCount: 36,
    autoDismiss: 5000,
  },
};

/* ── Falling coins spread ── */
const makeCoins = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i * 67 + 13) % 100,
    delay: (i % 8) * 0.05,
    dur: 0.9 + (i % 5) * 0.22,
    size: 14 + (i % 4) * 7,
    rot: (i % 2 ? 1 : -1) * (160 + (i % 4) * 90),
    color: i % 4 === 0 ? "#7000ff" : "#ffd700",
  }));

/* ── Second shockwave ring (delayed) ── */
function ShockwaveRings({ color }: { color: string }) {
  return (
    <>
      {[0, 0.25, 0.5].map((delay, i) => (
        <motion.div key={i}
          className="absolute rounded-full pointer-events-none"
          initial={{ width: 60, height: 60, opacity: 0.9 }}
          animate={{ width: 800 + i * 150, height: 800 + i * 150, opacity: 0 }}
          transition={{ duration: 1.0 + i * 0.15, delay, ease: "easeOut" }}
          style={{ border: `${2 - i * 0.5}px solid ${color}`, boxShadow: `0 0 30px ${color}` }}
        />
      ))}
    </>
  );
}

export default function YoinkResult({ data, onClose }: { data: YoinkResultData | null; onClose: () => void }) {
  const win = data?.type === "win";
  const tier = win ? getWinTier(data?.amount ?? 0) : "regular";
  const cfg = TIER_CONFIG[tier];
  const val = useCountUp(win ? (data?.amount ?? 0) : (data?.fee ?? 0), win ? (tier === "jackpot" ? 1600 : 1000) : 500, !!data);
  const [showShare, setShowShare] = useState(false);
  const coins = makeCoins(win ? cfg.coinCount : 0);

  useEffect(() => {
    if (!data) return;
    if (win && (tier === "big" || tier === "jackpot")) {
      setTimeout(() => setShowShare(true), 1200);
    }
    const t = setTimeout(onClose, win ? cfg.autoDismiss : 2200);
    return () => { clearTimeout(t); setShowShare(false); };
  }, [data, win, tier, cfg.autoDismiss, onClose]);

  const handleShare = () => {
    const text = `I just ${tier === "jackpot" ? "hit a JACKPOT" : "yoinked"} ${data?.amount.toFixed(3)} SOL on YOINK.GG 😈`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://yoink.gg`, "_blank");
  };

  return (
    <AnimatePresence>
      {data && (
        <motion.div key="yoink-result"
          className="fixed inset-0 z-[9998] flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{ background: win ? cfg.bg : "radial-gradient(ellipse 70% 70% at 50% 45%, rgba(255,23,68,0.10), rgba(2,2,8,0.9) 65%)", backdropFilter: "blur(10px)" }}
        >
          {/* Shockwave rings */}
          <ShockwaveRings color={win ? cfg.shockwaveColor : "rgba(255,23,68,0.5)"} />

          {/* Jackpot: second colour ring */}
          {win && tier === "jackpot" && (
            <motion.div className="absolute rounded-full pointer-events-none"
              initial={{ width: 80, height: 80, opacity: 0.7 }}
              animate={{ width: 600, height: 600, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              style={{ border: "2px solid rgba(112,0,255,0.8)", boxShadow: "0 0 40px rgba(112,0,255,0.4)" }}
            />
          )}

          {/* God ray — big wins only */}
          {win && (tier === "big" || tier === "jackpot") && (
            <div className="absolute pointer-events-none" style={{ width: 640, height: 640 }}>
              <div className="god-ray" style={{ inset: 0, opacity: tier === "jackpot" ? 1 : 0.65 }} />
            </div>
          )}

          {/* Falling coins */}
          {win && coins.map(c => (
            <motion.div key={c.id}
              className="absolute top-0 pointer-events-none"
              initial={{ y: "-10vh", opacity: 0, rotate: 0 }}
              animate={{ y: "110vh", opacity: [0, 1, 1, 0.6], rotate: c.rot }}
              transition={{ duration: c.dur, delay: c.delay, ease: "easeIn" }}
              style={{
                left: `${c.x}%`,
                width: c.size, height: c.size,
                borderRadius: "50%",
                background: c.color === "#7000ff"
                  ? "radial-gradient(circle at 35% 30%, #c060ff, #7000ff 55%, #4400aa)"
                  : "radial-gradient(circle at 35% 30%, #ffe680, #ffb300 55%, #cc7a00)",
                boxShadow: `0 0 10px ${c.color}80, inset 0 1px 2px rgba(255,255,255,0.6)`,
              }}
            />
          ))}

          {/* ── Main card ── */}
          <motion.div onClick={e => e.stopPropagation()}
            initial={{ scale: tier === "jackpot" ? 0.3 : 0.5, y: 40, opacity: 0, rotate: tier === "jackpot" ? -6 : 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.88, y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: tier === "jackpot" ? 350 : 280, damping: tier === "jackpot" ? 16 : 20, mass: 0.8 }}
            className="relative z-10 text-center w-full max-w-sm px-8 py-9 rounded-3xl"
            style={{
              background: "rgba(6,6,16,0.95)",
              border: `1px solid ${win ? cfg.border : "rgba(255,23,68,0.3)"}`,
              borderTop: `3px solid ${win ? cfg.borderTop : "rgba(255,23,68,0.9)"}`,
              boxShadow: win
                ? `0 0 0 1px ${cfg.border}, 0 40px 100px rgba(0,0,0,0.8), 0 0 80px ${cfg.glow}, 0 0 160px ${cfg.glow}60`
                : "0 0 0 1px rgba(255,23,68,0.1), 0 40px 100px rgba(0,0,0,0.8), 0 0 80px rgba(255,23,68,0.15)",
            }}
          >
            {/* Scanline overlay on card */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-30"
              style={{ background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)" }} />

            {/* Jackpot: orbiting dot */}
            {win && tier === "jackpot" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-20 h-20">
                  <div className="magnetic-orbit" style={{ top: "50%", left: "50%", marginTop: -3, marginLeft: -3 }} />
                </div>
              </div>
            )}

            {/* Headline */}
            {win ? (
              <motion.div
                initial={{ y: -16, opacity: 0, filter: "blur(8px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                {tier === "jackpot" ? (
                  <h2 className="font-display leading-none mb-1 neon-flicker"
                    style={{ fontSize: 52, letterSpacing: "0.08em", color: cfg.headlineColor, textShadow: `0 0 30px ${cfg.glow}, 0 0 60px ${cfg.glow}` }}>
                    {cfg.headline}
                  </h2>
                ) : (
                  <h2 className="font-display leading-none mb-1 shimmer-text"
                    style={{ fontSize: tier === "big" ? 50 : 44, letterSpacing: "0.08em" }}>
                    {cfg.headline}
                  </h2>
                )}
              </motion.div>
            ) : (
              <motion.h2 className="font-display leading-none mb-1 glitch-text"
                style={{ fontSize: 44, letterSpacing: "0.08em" }}
                initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
                MISSED
              </motion.h2>
            )}

            {/* Badges */}
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              {data?.isBounty && win && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                  className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,210,0,0.18)", color: "#ffd200", border: "1px solid rgba(255,210,0,0.4)" }}>
                  BOUNTY KILL
                </motion.span>
              )}
              {win && tier !== "regular" && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25, type: "spring" }}
                  className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${cfg.glow}20`, color: cfg.headlineColor, border: `1px solid ${cfg.border}` }}>
                  {tier === "jackpot" ? "12× MULTIPLIER" : "5× MULTIPLIER"}
                </motion.span>
              )}
            </div>

            {/* Big number */}
            <motion.div className="my-4 relative"
              initial={{ scale: 1.4, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <div className="font-display leading-none"
                style={{
                  fontSize: tier === "jackpot" ? 88 : tier === "big" ? 80 : 72,
                  color: win ? "white" : "#ff5c7a",
                  textShadow: win ? `0 0 40px ${cfg.glow}, 0 0 80px ${cfg.glow}60` : "0 0 30px rgba(255,23,68,0.6)",
                }}>
                <span style={{ fontSize: "45%", verticalAlign: "middle", color: win ? cfg.headlineColor : "#ff5c7a" }}>
                  {win ? "+" : "−"}
                </span>
                {val.toFixed(3)}
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] mt-1.5"
                style={{ color: win ? cfg.headlineColor : "#ff5c7a" }}>
                SOL {win ? "STOLEN" : "FEE PAID"}
              </div>
            </motion.div>

            {/* Victim line */}
            <p className="text-[11px] mb-4 font-mono" style={{ color: "#6a7080" }}>
              {win ? "ripped from " : "got away from "}
              <span style={{ color: "#a0a8c0" }}>{data?.victim}</span>
            </p>

            {/* Stats row */}
            <motion.div className="grid grid-cols-2 gap-2.5 mb-5"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
              <div className="rounded-2xl py-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[9px] font-mono uppercase tracking-[0.18em]" style={{ color: "#6a7080" }}>
                  {win ? "Fee paid" : "Next odds"}
                </p>
                <p className="font-mono text-[16px] font-bold mt-0.5"
                  style={{ color: win ? "#ff5c7a" : "#00d470" }}>
                  {win ? `−${data?.fee.toFixed(3)}` : data?.pityNext ? `${data.pityNext}%↑` : "—"}
                </p>
              </div>
              <div className="rounded-2xl py-3"
                style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.14)" }}>
                <p className="text-[9px] font-mono uppercase tracking-[0.18em]" style={{ color: "#6a7080" }}>New balance</p>
                <p className="font-mono text-[16px] font-bold mt-0.5" style={{ color: "#00e5ff" }}>
                  {data?.newBalance.toFixed(3)}
                </p>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div className="flex gap-2.5"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
              <button onClick={onClose}
                className="flex-1 btn-yoink"
                style={win
                  ? { background: `linear-gradient(135deg, ${cfg.headlineColor === "#ffd700" ? "#ffe266" : "#00e5ff"}, ${cfg.headlineColor})` }
                  : { background: "rgba(255,255,255,0.05)", boxShadow: "none", color: "#a0a8c0" }}>
                {win ? (tier === "jackpot" ? "LEGENDARY STACK" : tier === "big" ? "STACK IT" : "NICE") : "TRY AGAIN"}
              </button>

              {/* Share button — appears after big/jackpot wins */}
              <AnimatePresence>
                {showShare && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    onClick={handleShare}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-[12px] font-bold"
                    style={{ background: "rgba(29,161,242,0.12)", border: "1px solid rgba(29,161,242,0.3)", color: "#1DA1F2" }}>
                    <Share2 className="w-4 h-4" />
                    <ArrowUpRight className="w-3 h-3" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>

            {/* XP gain indicator */}
            {win && (
              <motion.div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] font-mono"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{ color: "#ffd700" }}>
                <Zap className="w-3 h-3" /> +XP earned
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
