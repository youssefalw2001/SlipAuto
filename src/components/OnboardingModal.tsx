import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props { onClose: () => void; }

const STEPS = [
  {
    game: "yoink" as const,
    icon: <Crosshair className="w-7 h-7" />,
    color: "#ff4d00",
    title: "YOINK",
    subtitle: "Steal SOL from other wallets",
    steps: [
      { emoji: "◎", label: "Enter the Arena", desc: "Lock any amount of SOL to join. This is your weapon — the more you bring, the better your odds." },
      { emoji: "◉", label: "Pick a Target",   desc: "You see every player's balance live. Click any wallet to target it. Bigger targets = bigger reward." },
      { emoji: "◈", label: "YOINK IT",        desc: "Pay a 5% fee and roll the dice. Win = steal 50% of their balance. Lose = only lose the fee. Fee is charged either way." },
    ],
    tip: "Pro tip: Your success rate is higher when your balance is bigger than your target's.",
  },
  {
    game: "wheel" as const,
    icon: <RotateCcw className="w-7 h-7" />,
    color: "#7000ff",
    title: "SWAP WHEEL",
    subtitle: "Deposit SOL, spin, winner steals",
    steps: [
      { emoji: "◎", label: "Join the Round",  desc: "Deposit any amount of SOL. Your slice of the wheel = your deposit / total pot. Bigger deposit = bigger slice." },
      { emoji: "◉", label: "Wheel Spins",     desc: "Every 30 seconds the wheel auto-spins. The winner is chosen randomly — bigger slice = higher chance to win." },
      { emoji: "◈", label: "Winner Takes SOL",desc: "The winner steals 90% of the smallest depositor's amount. House keeps 10%. New round starts immediately." },
    ],
    tip: "Pro tip: The smallest depositor is most at risk. Don't be the smallest — or target rounds with big pots and small competition.",
  },
];

export default function OnboardingModal({ onClose }: Props) {
  const [step, setStep] = useState(0); // 0 = game select, 1 = yoink, 2 = wheel

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(3,3,8,0.88)", backdropFilter: "blur(16px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 12 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="w-full max-w-xl relative"
        style={{
          background: "#0c0c1a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "22px",
          overflow: "hidden",
        }}
      >
        {/* Rainbow top border */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #ff4d00, #7000ff, #00e5ff, transparent)" }} />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-white/8 transition-colors"
          style={{ color: "#6060a0" }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7">
          <AnimatePresence mode="wait">

            {/* Step 0 — Game Select */}
            {step === 0 && (
              <motion.div key="select"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              >
                <div className="text-center mb-7">
                  <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-2" style={{ color: "#6060a0" }}>Welcome to</p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <span className="font-display text-[44px] text-white tracking-[0.06em]">YOINK</span>
                    <span className="font-display text-[44px] tracking-[0.06em]" style={{ color: "#ff4d00" }}>.GG</span>
                  </div>
                  <p className="text-[14px]" style={{ color: "#6060a0" }}>The only Solana platform where you <strong className="text-white">literally steal</strong> other players' SOL.</p>
                </div>

                <p className="text-[12px] font-semibold text-white mb-4 text-center">Which game do you want to learn?</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {STEPS.map((g, i) => (
                    <motion.button
                      key={g.game}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setStep(i + 1)}
                      className="rounded-2xl p-5 text-center border transition-all"
                      style={{
                        background: `rgba(${g.color === "#ff4d00" ? "255,77,0" : "112,0,255"},0.06)`,
                        borderColor: `rgba(${g.color === "#ff4d00" ? "255,77,0" : "112,0,255"},0.2)`,
                        borderTop: `1px solid rgba(${g.color === "#ff4d00" ? "255,77,0" : "112,0,255"},0.4)`,
                      }}
                    >
                      <div className="flex justify-center mb-3" style={{ color: g.color }}>{g.icon}</div>
                      <p className="font-display text-[20px] text-white tracking-[0.06em]">{g.title}</p>
                      <p className="text-[11px] mt-1" style={{ color: "#6060a0" }}>{g.subtitle}</p>
                    </motion.button>
                  ))}
                </div>

                <button onClick={onClose} className="w-full text-[12px] py-2.5 rounded-xl transition-colors hover:text-white" style={{ color: "#6060a0" }}>
                  Skip — I'll figure it out
                </button>
              </motion.div>
            )}

            {/* Steps 1 & 2 — Game explainers */}
            {step > 0 && (
              <motion.div key={`game-${step}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              >
                {(() => {
                  const g = STEPS[step - 1];
                  return (
                    <>
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `rgba(${g.color === "#ff4d00" ? "255,77,0" : "112,0,255"},0.12)`, color: g.color, border: `1px solid rgba(${g.color === "#ff4d00" ? "255,77,0" : "112,0,255"},0.25)` }}>
                          {g.icon}
                        </div>
                        <div>
                          <h2 className="font-display text-[26px] text-white leading-none tracking-[0.06em]">{g.title}</h2>
                          <p className="text-[12px]" style={{ color: "#6060a0" }}>{g.subtitle}</p>
                        </div>
                      </div>

                      {/* Steps */}
                      <div className="space-y-3 mb-5">
                        {g.steps.map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex gap-4 p-4 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-display text-[16px]"
                              style={{ background: `rgba(${g.color === "#ff4d00" ? "255,77,0" : "112,0,255"},0.12)`, color: g.color }}>
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-white mb-0.5">{s.label}</p>
                              <p className="text-[12px] leading-relaxed" style={{ color: "#6060a0" }}>{s.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Tip */}
                      <div className="p-3.5 rounded-xl mb-5 text-[12px]"
                        style={{ background: `rgba(${g.color === "#ff4d00" ? "255,77,0" : "112,0,255"},0.06)`, border: `1px solid rgba(${g.color === "#ff4d00" ? "255,77,0" : "112,0,255"},0.15)`, color: "#a0a0c0" }}>
                        {g.tip}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button onClick={() => setStep(0)} className="btn-ghost flex-shrink-0 text-[12px]">← Back</button>
                        {step === 1 && (
                          <button onClick={() => setStep(2)} className="btn-ghost flex-1 text-[12px]">
                            Learn Swap Wheel →
                          </button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={onClose}
                          className="btn-yoink flex-1 text-[14px]"
                          style={g.color !== "#ff4d00" ? { background: "linear-gradient(135deg,#7000ff,#4400cc)" } : {}}
                        >
                          Let's Play!
                        </motion.button>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
