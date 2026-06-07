import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Menu, Package, RotateCcw, Trophy, Users, Wallet, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import CrateShop from "./components/CrateShop";
import GlobalStats from "./components/GlobalStats";
import JoinToast from "./components/JoinToast";
import LiveFeed from "./components/LiveFeed";
import Leaderboard from "./components/Leaderboard";
import OnboardingModal from "./components/OnboardingModal";
import ReferralDashboard from "./components/ReferralDashboard";
import SwapWheel from "./components/SwapWheel";
import YoinkGame from "./components/YoinkGame";
import { getLevelByXP } from "./lib/levels";
import { getPlayer, upsertPlayer, saveXP, initDatabase, type PlayerRow } from "./lib/supabase";

export type Page = "yoink" | "wheel" | "crates" | "leaderboard" | "referral";

const pageAnim = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 1, 0.4, 1] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.16 } },
};

const NAV = [
  { id: "yoink"       as Page, label: "Yoink",       icon: Crosshair },
  { id: "wheel"       as Page, label: "Swap Wheel",  icon: RotateCcw },
  { id: "crates"      as Page, label: "Crates",      icon: Package   },
  { id: "leaderboard" as Page, label: "Leaderboard", icon: Trophy    },
  { id: "referral"    as Page, label: "Referrals",   icon: Users     },
];

// ── Demo wallet persisted in localStorage so XP survives refresh ──
const STORED_DEMO = localStorage.getItem("yoink_demo_wallet");
const DEMO_WALLET = STORED_DEMO ?? (() => {
  const w = "demo_" + Math.random().toString(36).slice(2, 10);
  localStorage.setItem("yoink_demo_wallet", w);
  return w;
})();

export default function App() {
  const [page, setPage]               = useState<Page>("yoink");
  const [open, setOpen]               = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  const [xp, setXp]                   = useState(0);
  const [wallet, setWallet]           = useState<string | null>(null);
  const [player, setPlayer]           = useState<PlayerRow | null>(null);
  const [connecting, setConnecting]   = useState(false);

  const levelData = getLevelByXP(xp);

  // ── Load player from Supabase when wallet is set ──
  useEffect(() => {
    if (!wallet) return;
    (async () => {
      // Check for referral code in URL (?ref=CODE)
      const params  = new URLSearchParams(window.location.search);
      const refCode  = params.get("ref") ?? undefined;
      const row      = await upsertPlayer(wallet, refCode);
      if (row) {
        setPlayer(row);
        setXp(row.xp);
        toast.success(`Welcome back! ${row.xp} XP · Level ${row.level_id}`);
      }
    })();
  }, [wallet]);

  // ── Init database on first load ──
  useEffect(() => {
    initDatabase();
  }, []);

  // ── First visit onboarding ──
  useEffect(() => {
    const seen = localStorage.getItem("yoink_onboarded");
    if (!seen) setTimeout(() => setShowOnboard(true), 800);
  }, []);

  // ── Add XP — saves to Supabase if wallet connected ──
  const addXP = useCallback(async (amount: number, reason = "game_action") => {
    setXp(prev => prev + amount);
    if (wallet) {
      await saveXP(wallet, amount, reason);
    }
  }, [wallet]);

  // ── Simulated wallet connect (replace with real adapter later) ──
  const connectWallet = async () => {
    setConnecting(true);
    try {
      // Try real Phantom connection if available
      const phantom = (window as any).solana;
      if (phantom?.isPhantom) {
        const resp = await phantom.connect();
        const addr = resp.publicKey.toString();
        setWallet(addr);
        toast.success("Wallet connected!");
      } else {
        // Fallback: demo wallet for testing
        setWallet(DEMO_WALLET);
        toast("Demo wallet connected — install Phantom for real play");
      }
    } catch {
      toast.error("Wallet connection cancelled");
    }
    setConnecting(false);
  };

  const disconnectWallet = () => {
    setWallet(null);
    setPlayer(null);
    setXp(0);
    toast("Wallet disconnected");
  };

  const closeOnboard = () => {
    setShowOnboard(false);
    localStorage.setItem("yoink_onboarded", "1");
  };

  const walletShort = wallet
    ? wallet.startsWith("demo_")
      ? "Demo Wallet"
      : `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#0c0c1a",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#eeeef8",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px",
          },
        }}
      />

      <AnimatePresence>
        {showOnboard && <OnboardingModal onClose={closeOnboard} />}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-y-border bg-y-base/88 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-5 h-[58px] flex items-center justify-between gap-4">

          {/* Logo */}
          <motion.button onClick={() => setPage("yoink")}
            className="flex items-center gap-3 flex-shrink-0"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <div className="logo-mark">
              <Crosshair className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-y-green border-2 border-y-base blink" />
            </div>
            <div className="flex items-baseline gap-0">
              <span className="font-display text-[24px] text-white tracking-[0.08em]">YOINK</span>
              <span className="font-display text-[24px] tracking-[0.08em]" style={{ color: '#ff4d00' }}>.GG</span>
            </div>
          </motion.button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5">
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`nav-link relative ${page === n.id ? "active" : ""}`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Level badge — only when wallet connected */}
            {wallet && (
              <div className="px-3 py-1.5 rounded-xl flex items-center gap-2"
                style={{ background: levelData.badgeBg, border: `1px solid ${levelData.badgeColor}30` }}>
                <span className="font-display text-[13px] tracking-[0.06em]" style={{ color: levelData.badgeColor }}>
                  {levelData.name}
                </span>
                <span className="text-[11px] font-mono" style={{ color: '#6060a0' }}>{xp} XP</span>
              </div>
            )}

            <button onClick={() => setShowOnboard(true)} className="btn-ghost text-[12px] py-2 px-4">
              How to Play
            </button>

            {/* Wallet button */}
            {wallet ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-mono"
                  style={{ background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.2)', color: '#00d470' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-y-green blink" />
                  {walletShort}
                </div>
                <button onClick={disconnectWallet} className="btn-ghost text-[11px] py-2 px-3"
                  style={{ color: '#6060a0' }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={connectWallet}
                disabled={connecting}
                className="btn-yoink text-[14px] py-2.5 px-6 disabled:opacity-60"
              >
                <Wallet className="w-4 h-4" />
                {connecting ? "Connecting..." : "Connect Wallet"}
              </motion.button>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: '#6060a0' }} onClick={() => setOpen(!open)}>
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
              style={{ background: 'rgba(3,3,8,0.96)', backdropFilter: 'blur(20px)' }}
            >
              <div className="px-5 py-3 flex flex-col gap-0.5">
                {NAV.map(n => {
                  const Icon = n.icon;
                  return (
                    <button key={n.id} onClick={() => { setPage(n.id); setOpen(false); }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-semibold transition-all"
                      style={{ color: page === n.id ? '#ff7040' : '#6060a0', background: page === n.id ? 'rgba(255,77,0,0.08)' : 'transparent' }}>
                      <Icon className="w-4 h-4" />{n.label}
                    </button>
                  );
                })}
                <button onClick={() => { setShowOnboard(true); setOpen(false); }} className="btn-ghost w-full mt-1 text-[13px]">How to Play</button>
                {wallet ? (
                  <div className="mt-1 flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(0,232,122,0.06)', border: '1px solid rgba(0,232,122,0.15)' }}>
                    <span className="text-[12px] font-mono" style={{ color: '#00d470' }}>{walletShort}</span>
                    <button onClick={disconnectWallet} className="text-[11px]" style={{ color: '#6060a0' }}>Disconnect</button>
                  </div>
                ) : (
                  <button onClick={connectWallet} disabled={connecting} className="btn-yoink w-full mt-1">
                    <Wallet className="w-4 h-4" />
                    {connecting ? "Connecting..." : "Connect Wallet"}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <LiveFeed />
      <GlobalStats />

      {/* Demo mode banner */}
      {wallet?.startsWith("demo_") && (
        <div className="border-b border-y-border py-2 px-5"
          style={{ background: 'rgba(255,210,0,0.04)' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <p className="text-[12px] font-mono" style={{ color: '#e8c000' }}>
              Demo mode — your progress is saved locally. Connect Phantom to play with real SOL.
            </p>
            <button
              onClick={connectWallet}
              className="text-[11px] font-semibold px-3 py-1 rounded-lg flex-shrink-0 transition-all hover:opacity-90"
              style={{ background: 'rgba(255,210,0,0.15)', color: '#e8c000', border: '1px solid rgba(255,210,0,0.25)' }}
            >
              Connect Phantom →
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={page} variants={pageAnim} initial="initial" animate="animate" exit="exit">
            {page === "yoink"       && <YoinkGame xp={xp} onXPGain={addXP} levelId={levelData.id} wallet={wallet} />}
            {page === "wheel"       && <SwapWheel />}
            {page === "crates"      && <CrateShop xp={xp} levelId={levelData.id} onXPGain={addXP} wallet={wallet} />}
            {page === "leaderboard" && <Leaderboard />}
            {page === "referral"    && <ReferralDashboard wallet={wallet} player={player} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-y-border py-6">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-[18px] text-white tracking-[0.06em]">YOINK</span>
            <span className="font-display text-[18px] tracking-[0.06em]" style={{ color: '#ff4d00' }}>.GG</span>
            <span className="text-[11px] ml-1.5" style={{ color: '#6060a0' }}>— Provably fair on Solana</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]" style={{ color: '#6060a0' }}>
            <span>18+ Only</span>
            <span style={{ color: '#30304a' }}>·</span>
            <span>Gamble Responsibly</span>
            <span style={{ color: '#30304a' }}>·</span>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <span style={{ color: '#30304a' }}>·</span>
            <button onClick={() => setShowOnboard(true)} className="hover:text-white transition-colors">How to Play</button>
          </div>
        </div>
      </footer>

      <JoinToast />
    </div>
  );
}
