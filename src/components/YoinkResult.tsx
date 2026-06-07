import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface YoinkResultData {
  type: "win" | "lose";
  amount: number;     // gross stolen (win) — display headline
  fee: number;        // fee paid
  net: number;        // net change applied to balance
  victim: string;     // target wallet
  newBalance: number; // balance after resolution
  isBounty?: boolean;
  pityNext?: number | null; // improved odds hint on loss
}

/* easeOutExpo count-up — the number "lands" hard then settles */
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

/* deterministic-ish spread of falling coins */
const COINS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 53) % 100,            // vw %
  delay: (i % 6) * 0.06,
  dur: 1.1 + (i % 5) * 0.18,
  size: 16 + (i % 4) * 6,
  rot: (i % 2 ? 1 : -1) * (180 + (i % 3) * 120),
}));

export default function YoinkResult({
  data,
  onClose,
}: {
  data: YoinkResultData | null;
  onClose: () => void;
}) {
  const win = data?.type === "win";
  const val = useCountUp(win ? (data?.amount ?? 0) : (data?.fee ?? 0), win ? 900 : 600, !!data);

  // auto-dismiss
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(onClose, win ? 3400 : 2300);
    return () => clearTimeout(t);
  }, [data, win, onClose]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key="yoink-result"
          className="fixed inset-0 z-[9998] flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            background: win
              ? "radial-gradient(ellipse 70% 70% at 50% 45%, rgba(0,229,255,0.10), rgba(2,2,8,0.86) 65%)"
              : "radial-gradient(ellipse 70% 70% at 50% 45%, rgba(255,23,68,0.10), rgba(2,2,8,0.88) 65%)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* shockwave ring */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            initial={{ width: 80, height: 80, opacity: 0.9 }}
            animate={{ width: 900, height: 900, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{
              border: `2px solid ${win ? "rgba(0,229,255,0.6)" : "rgba(255,23,68,0.6)"}`,
              boxShadow: `0 0 60px ${win ? "rgba(0,229,255,0.4)" : "rgba(255,23,68,0.4)"}`,
            }}
          />

          {/* rotating god-ray behind the card (win only) */}
          {win && (
            <div className="absolute pointer-events-none" style={{ width: 560, height: 560 }}>
              <div className="god-ray" style={{ inset: 0 }} />
            </div>
          )}

          {/* falling coins (win only) */}
          {win &&
            COINS.map((c) => (
              <motion.div
                key={c.id}
                className="absolute top-0 pointer-events-none flex items-center justify-center font-display"
                initial={{ y: "-12vh", opacity: 0, rotate: 0 }}
                animate={{ y: "112vh", opacity: [0, 1, 1, 0.8], rotate: c.rot }}
                transition={{ duration: c.dur, delay: c.delay, ease: "easeIn" }}
                style={{
                  left: `${c.x}%`,
                  width: c.size,
                  height: c.size,
                  borderRadius: "50%",
                  fontSize: c.size * 0.6,
                  color: "#1a1200",
                  background: "radial-gradient(circle at 35% 30%, #ffe680, #ffb300 55%, #cc7a00)",
                  boxShadow: "0 0 12px rgba(255,210,0,0.6), inset 0 1px 2px rgba(255,255,255,0.7)",
                }}
              >
                ◎
              </motion.div>
            ))}

          {/* main reveal card */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.4, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 18, mass: 0.7 }}
            className="relative z-10 text-center max-w-sm w-full px-8 py-9 rounded-3xl"
            style={{
              background: "rgba(8,8,18,0.92)",
              border: `1px solid ${win ? "rgba(0,229,255,0.25)" : "rgba(255,23,68,0.3)"}`,
              borderTop: `2px solid ${win ? "rgba(0,229,255,0.7)" : "rgba(255,23,68,0.8)"}`,
              boxShadow: win
                ? "0 0 0 1px rgba(0,229,255,0.1), 0 30px 90px rgba(0,0,0,0.7), 0 0 80px rgba(0,229,255,0.12), 0 0 140px rgba(255,210,0,0.06)"
                : "0 0 0 1px rgba(255,23,68,0.1), 0 30px 90px rgba(0,0,0,0.7), 0 0 80px rgba(255,23,68,0.14)",
            }}
          >
            {/* headline */}
            {win ? (
              <motion.h2
                className="shimmer-text font-display leading-none mb-1"
                style={{ fontSize: 46, letterSpacing: "0.08em" }}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                YOINKED!
              </motion.h2>
            ) : (
              <motion.h2
                className="font-display leading-none mb-1 glitch-text"
                style={{ fontSize: 44, letterSpacing: "0.08em" }}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 }}
              >
                MISSED
              </motion.h2>
            )}

            {data.isBounty && win && (
              <div className="inline-block mb-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,210,0,0.16)", color: "#ffd200", border: "1px solid rgba(255,210,0,0.4)" }}>
                  BOUNTY KILL
                </span>
              </div>
            )}

            {/* big number */}
            <div className="my-3 relative">
              <div
                className="font-display leading-none"
                style={{
                  fontSize: 76,
                  color: win ? "#fff" : "#ff5c7a",
                  textShadow: win
                    ? "0 0 30px rgba(0,229,255,0.7), 0 0 80px rgba(255,210,0,0.35)"
                    : "0 0 30px rgba(255,23,68,0.6)",
                }}
              >
                <span style={{ fontSize: 40, verticalAlign: "middle", color: win ? "#00e5ff" : "#ff5c7a" }}>
                  {win ? "+" : "−"}
                </span>
                {val.toFixed(3)}
              </div>
              <div className="font-mono text-[12px] uppercase tracking-[0.3em] mt-1"
                style={{ color: win ? "#40d8f0" : "#ff5c7a" }}>
                SOL {win ? "STOLEN" : "FEE"}
              </div>
            </div>

            {/* victim line */}
            <p className="text-[12px] mb-4" style={{ color: "#6060a0" }}>
              {win ? "ripped from" : "got away —"}{" "}
              <span className="font-mono" style={{ color: "#a0a0c8" }}>{data.victim}</span>
            </p>

            {/* stat row */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="rounded-xl py-2.5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "#6060a0" }}>
                  {win ? "Fee paid" : "Next-shot odds"}
                </p>
                <p className="font-mono text-[15px] font-bold mt-0.5"
                  style={{ color: win ? "#ff5c7a" : "#00d470" }}>
                  {win ? `−${data.fee.toFixed(3)}` : data.pityNext ? `${data.pityNext}%↑` : "—"}
                </p>
              </div>
              <div className="rounded-xl py-2.5"
                style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.12)" }}>
                <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "#6060a0" }}>New balance</p>
                <p className="font-mono text-[15px] font-bold mt-0.5" style={{ color: "#00e5ff" }}>
                  {data.newBalance.toFixed(3)}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-yoink w-full"
              style={
                win
                  ? undefined
                  : { background: "rgba(255,255,255,0.05)", boxShadow: "none", color: "#a0a0c8" }
              }
            >
              {win ? "STACK IT" : "TRY AGAIN"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
