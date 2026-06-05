import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Menu, RotateCcw, Trophy, Users, X } from "lucide-react";
import { useState } from "react";
import { Toaster } from "sonner";
import LiveFeed from "./components/LiveFeed";
import Leaderboard from "./components/Leaderboard";
import ReferralDashboard from "./components/ReferralDashboard";
import SwapWheel from "./components/SwapWheel";
import YoinkGame from "./components/YoinkGame";

export type Page = "yoink" | "wheel" | "leaderboard" | "referral";

const pageAnim = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 1, 0.4, 1] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.16 } },
};

const NAV = [
  { id: "yoink"       as Page, label: "Yoink",       icon: Crosshair  },
  { id: "wheel"       as Page, label: "Swap Wheel",  icon: RotateCcw  },
  { id: "leaderboard" as Page, label: "Leaderboard", icon: Trophy     },
  { id: "referral"    as Page, label: "Referrals",   icon: Users      },
];

export default function App() {
  const [page, setPage] = useState<Page>("yoink");
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sonner toasts */}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#0c0c1a",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#eeeef8",
            fontFamily: "'DM Sans', sans-serif",
          },
        }}
      />

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-y-border bg-y-base/88 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-5 h-[58px] flex items-center justify-between gap-6">

          {/* Logo */}
          <motion.button
            onClick={() => setPage("yoink")}
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Mark */}
            <div className="logo-mark">
              <Crosshair className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-y-green border-2 border-y-base blink" />
            </div>
            {/* Wordmark */}
            <div className="flex items-baseline gap-0">
              <span className="font-display text-[24px] text-white tracking-[0.08em]">YOINK</span>
              <span className="font-display text-[24px] tracking-[0.08em] text-y-accent">.GG</span>
            </div>
          </motion.button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} className={`nav-link ${page === n.id ? "active" : ""}`}>
                {n.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <div className="stat-box gap-2 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-y-green blink" />
              <span style={{ color: '#00d470' }} className="font-semibold">2,841 SOL</span>
              <span style={{ color: '#6060a0' }}>stolen today</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="btn-yoink text-[14px] py-2.5 px-6"
            >
              Connect Wallet
            </motion.button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
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
              className="overflow-hidden md:hidden border-t border-y-border"
              style={{ background: 'rgba(3,3,8,0.95)', backdropFilter: 'blur(20px)' }}
            >
              <div className="px-5 py-3 flex flex-col gap-0.5">
                {NAV.map(n => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => { setPage(n.id); setOpen(false); }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-semibold transition-all"
                      style={{ color: page === n.id ? '#ff7040' : '#6060a0', background: page === n.id ? 'rgba(255,77,0,0.08)' : 'transparent' }}
                    >
                      <Icon className="w-4 h-4" />
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

      {/* Ticker */}
      <LiveFeed />

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={page} variants={pageAnim} initial="initial" animate="animate" exit="exit">
            {page === "yoink"       && <YoinkGame />}
            {page === "wheel"       && <SwapWheel />}
            {page === "leaderboard" && <Leaderboard />}
            {page === "referral"    && <ReferralDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-y-border py-6">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-[18px] text-white tracking-[0.06em]">YOINK</span>
            <span className="font-display text-[18px] text-y-accent tracking-[0.06em]">.GG</span>
            <span className="text-[11px] ml-1.5" style={{ color: '#6060a0' }}>— Provably fair on Solana</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]" style={{ color: '#6060a0' }}>
            <span>18+ Only</span>
            <span style={{ color: '#30304a' }}>·</span>
            <span>Gamble Responsibly</span>
            <span style={{ color: '#30304a' }}>·</span>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <span style={{ color: '#30304a' }}>·</span>
            <a href="#" className="hover:text-white transition-colors">@YoinkGG</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
