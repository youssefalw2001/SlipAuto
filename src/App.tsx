import { AnimatePresence, motion } from "framer-motion";
import { Ghost, RotateCcw, Trophy, Users } from "lucide-react";
import { useState } from "react";
import LiveFeed from "./components/LiveFeed";
import Leaderboard from "./components/Leaderboard";
import ReferralDashboard from "./components/ReferralDashboard";
import SwapWheel from "./components/SwapWheel";
import YoinkGame from "./components/YoinkGame";

export type Page = "yoink" | "wheel" | "leaderboard" | "referral";

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

export default function App() {
  const [page, setPage] = useState<Page>("yoink");
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { id: "yoink",       label: "YOINK",       icon: <Ghost className="w-4 h-4" />,      tag: "HOT" },
    { id: "wheel",       label: "Swap Wheel",  icon: <RotateCcw className="w-4 h-4" />,  tag: null },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4" />,     tag: null },
    { id: "referral",    label: "Referrals",   icon: <Users className="w-4 h-4" />,      tag: "EARN" },
  ] as const;

  return (
    <div className="min-h-screen bg-yoink-bg text-yoink-text flex flex-col bg-grid">

      {/* Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-yoink-pink/8 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-yoink-purple/8 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full bg-yoink-cyan/5 blur-[120px]" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-30 border-b border-white/5 bg-yoink-bg/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setPage("yoink")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yoink-pink to-yoink-orange flex items-center justify-center text-lg shadow-[0_0_20px_rgba(255,51,102,0.5)]">
              😈
            </div>
            <div className="font-display font-extrabold text-xl tracking-tight">
              <span className="text-white">YOINK</span>
              <span className="text-yoink-pink">.gg</span>
            </div>
            <span className="hidden sm:flex items-center gap-1.5 tag tag-green ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yoink-green animate-pulse" />
              LIVE
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/3 border border-white/6 rounded-2xl p-1">
            {nav.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setPage(item.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  page === item.id
                    ? "bg-yoink-pink text-white shadow-[0_0_20px_rgba(255,51,102,0.4)]"
                    : "text-yoink-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                {item.label}
                {item.tag && (
                  <span className={`tag ${item.tag === "HOT" ? "tag-pink" : "tag-green"} text-[9px] py-0.5`}>
                    {item.tag}
                  </span>
                )}
              </motion.button>
            ))}
          </nav>

          {/* Right: Wallet + Stats */}
          <div className="hidden md:flex items-center gap-3">
            <div className="stat-badge text-yoink-muted">
              <span className="text-yoink-green font-bold">2,841</span> SOL stolen today
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn-yoink text-sm py-2.5 px-5"
            >
              Connect Wallet
            </motion.button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-yoink-muted hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-5 space-y-1.5">
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="block h-0.5 bg-current rounded"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block h-0.5 bg-current rounded"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="block h-0.5 bg-current rounded"
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-white/5 bg-yoink-bg/95 backdrop-blur-xl"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {nav.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setPage(item.id); setMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      page === item.id ? "bg-yoink-pink/10 text-yoink-pink" : "text-yoink-muted hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    {item.tag && (
                      <span className={`tag ${item.tag === "HOT" ? "tag-pink" : "tag-green"}`}>{item.tag}</span>
                    )}
                  </button>
                ))}
                <button className="btn-yoink mt-2 w-full">Connect Wallet</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Live Feed Ticker */}
      <LiveFeed />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            variants={pageVariants}
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

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 mt-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-yoink-muted">
          <div className="flex items-center gap-2 font-display font-bold">
            <span className="text-white">YOINK</span><span className="text-yoink-pink">.gg</span>
            <span className="text-yoink-muted font-normal">— Provably Fair on Solana</span>
          </div>
          <div className="flex items-center gap-4">
            <span>18+ Only</span>
            <span className="text-white/20">•</span>
            <span>Gamble Responsibly</span>
            <span className="text-white/20">•</span>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <span className="text-white/20">•</span>
            <a href="#" className="hover:text-white transition-colors">@YoinkGG</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
