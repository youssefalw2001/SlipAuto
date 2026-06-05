import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Menu, RotateCcw, Trophy, Users, X } from "lucide-react";
import { useState } from "react";
import LiveFeed from "./components/LiveFeed";
import Leaderboard from "./components/Leaderboard";
import ReferralDashboard from "./components/ReferralDashboard";
import SwapWheel from "./components/SwapWheel";
import YoinkGame from "./components/YoinkGame";

export type Page = "yoink" | "wheel" | "leaderboard" | "referral";

const pageAnim = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 1, 0.4, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.16 } },
};

const NAV = [
  { id: "yoink"       as Page, label: "Yoink",       icon: Crosshair  },
  { id: "wheel"       as Page, label: "Swap Wheel",  icon: RotateCcw  },
  { id: "leaderboard" as Page, label: "Leaderboard", icon: Trophy     },
  { id: "referral"    as Page, label: "Referrals",   icon: Users      },
];

export default function App() {
  const [page, setPage]     = useState<Page>("yoink");
  const [open, setOpen]     = useState(false);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-y-border bg-y-base/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-[56px] flex items-center justify-between gap-6">

          {/* Logo */}
          <button
            onClick={() => setPage("yoink")}
            className="flex items-center gap-3 group flex-shrink-0"
          >
            {/* Icon mark */}
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff4d00] to-[#cc0044] flex items-center justify-center shadow-[0_0_16px_rgba(255,77,0,0.45)]">
              <Crosshair className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-y-green blink border border-y-base" />
            </div>
            {/* Wordmark */}
            <div className="flex items-baseline gap-0.5">
              <span className="font-display text-[22px] text-white tracking-[0.06em]">YOINK</span>
              <span className="font-display text-[22px] text-y-accent tracking-[0.06em]">.GG</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`nav-link ${page === n.id ? "active" : ""}`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            <div className="stat-box text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-y-green blink" />
              <span className="text-y-green font-semibold font-mono">2,841 SOL</span>
              <span style={{ color: '#6060a0' }}>stolen today</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-yoink text-[13px] py-2 px-5"
            >
              Connect Wallet
            </motion.button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: '#6060a0' }}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden md:hidden border-t border-y-border bg-y-base/95 backdrop-blur-xl"
            >
              <div className="px-5 py-3 flex flex-col gap-1">
                {NAV.map(n => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => { setPage(n.id); setOpen(false); }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                        page === n.id
                          ? "bg-y-accent/10 text-y-accent"
                          : "hover:bg-white/4 hover:text-white"
                      }`}
                      style={{ color: page === n.id ? undefined : '#6060a0' }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {n.label}
                    </button>
                  );
                })}
                <button className="btn-yoink w-full mt-2">Connect Wallet</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Live Ticker ── */}
      <LiveFeed />

      {/* ── Main ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            variants={pageAnim}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {page === "yoink"       && <YoinkGame />}
            {page === "wheel"       && <SwapWheel />}
            {page === "leaderboard" && <Leaderboard />}
            {page === "referral"    && <ReferralDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-y-border py-6 mt-4">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-[16px] text-white tracking-[0.06em]">YOINK</span>
            <span className="font-display text-[16px] text-y-accent tracking-[0.06em]">.GG</span>
            <span className="text-[11px] ml-1" style={{ color: '#6060a0' }}>— Provably fair on Solana</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]" style={{ color: '#6060a0' }}>
            <span>18+ Only</span>
            <span style={{ color: '#383855' }}>·</span>
            <span>Gamble Responsibly</span>
            <span style={{ color: '#383855' }}>·</span>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <span style={{ color: '#383855' }}>·</span>
            <a href="#" className="hover:text-white transition-colors">@YoinkGG</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
