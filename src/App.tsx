import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, RotateCcw, Trophy, Users, X, Menu } from "lucide-react";
import { useState } from "react";
import LiveFeed from "./components/LiveFeed";
import Leaderboard from "./components/Leaderboard";
import ReferralDashboard from "./components/ReferralDashboard";
import SwapWheel from "./components/SwapWheel";
import YoinkGame from "./components/YoinkGame";

export type Page = "yoink" | "wheel" | "leaderboard" | "referral";

const pageAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function App() {
  const [page, setPage] = useState<Page>("yoink");
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { id: "yoink" as const, label: "Yoink", icon: <Crosshair className="w-3.5 h-3.5" /> },
    { id: "wheel" as const, label: "Swap Wheel", icon: <RotateCcw className="w-3.5 h-3.5" /> },
    { id: "leaderboard" as const, label: "Leaderboard", icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: "referral" as const, label: "Referrals", icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-y-bg text-y-text flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-y-border bg-y-bg/90 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setPage("yoink")}
            className="flex items-center gap-2.5 group"
          >
            {/* SVG Mark */}
            <div className="w-7 h-7 rounded-lg bg-y-accent flex items-center justify-center">
              <Crosshair className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">
              yoink<span className="text-y-accent">.gg</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 pill pill-green text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-y-green blink" />
              live
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 bg-y-surface border border-y-border rounded-xl p-1">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                  page === n.id
                    ? "bg-y-accent text-white shadow-sm"
                    : "text-y-muted hover:text-white"
                }`}
              >
                {n.icon}
                {n.label}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex stat-box">
              <span className="text-y-green font-semibold">2,841</span>
              <span className="text-y-muted">SOL stolen</span>
            </div>
            <button className="btn-primary text-[12px] px-4 py-2">
              Connect Wallet
            </button>
            {/* Mobile toggle */}
            <button
              className="md:hidden p-1.5 rounded-lg text-y-muted hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-y-border bg-y-bg"
            >
              <div className="px-4 py-2 flex flex-col gap-0.5">
                {nav.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { setPage(n.id); setMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                      page === n.id ? "bg-y-accent/10 text-y-accent" : "text-y-muted hover:text-white"
                    }`}
                  >
                    {n.icon}
                    {n.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Ticker */}
      <LiveFeed />

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={page} variants={pageAnim} initial="initial" animate="animate" exit="exit">
            {page === "yoink" && <YoinkGame />}
            {page === "wheel" && <SwapWheel />}
            {page === "leaderboard" && <Leaderboard />}
            {page === "referral" && <ReferralDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-y-border py-5">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-y-muted">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white">yoink</span>
            <span className="font-semibold text-y-accent">.gg</span>
            <span className="mx-1 text-y-dim">—</span>
            <span>Provably fair on Solana</span>
          </div>
          <div className="flex items-center gap-3">
            <span>18+</span>
            <span className="text-y-dim">·</span>
            <span>Gamble responsibly</span>
            <span className="text-y-dim">·</span>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <span className="text-y-dim">·</span>
            <a href="#" className="hover:text-white transition-colors">@YoinkGG</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
