import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Menu, Package, RotateCcw, Trophy, Users, Wallet, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import CrateShop from "./components/CrateShop";
import GlobalStats from "./components/GlobalStats";
import JoinToast from "./components/JoinToast";
import LandingPage from "./components/LandingPage";
import LiveFeed from "./components/LiveFeed";
import Leaderboard from "./components/Leaderboard";
import OnboardingModal from "./components/OnboardingModal";
import ReferralDashboard from "./components/ReferralDashboard";
import SwapWheel from "./components/SwapWheel";
import YoinkGame from "./components/YoinkGame";
import { getLevelByXP } from "./lib/levels";
import { getPlayer, upsertPlayer, saveXP, initDatabase, type PlayerRow } from "./lib/supabase";

export type Page = "landing" | "yoink" | "wheel" | "crates" | "leaderboard" | "referral";

const pageAnim = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 1, 0.4, 1] as [number, number, number, number] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.16 } },
};

const NAV = [
  { id: "yoink"       as Page, label: "Yoink",       icon: Crosshair },
  { id: "wheel"       as Page, label: "Swap Wheel",  icon: RotateCcw },
  { id: "crates"      as Page, label: "Crates",      icon: Package   },
  { id: "leaderboard" as Page, label: "Leaderboard", icon: Trophy    },
  { id: "referral"    as Page, label: "Referrals",   icon: Users     },
];

// ── Demo wallet (until real wallet adapter is wired) ──
// In production this becomes the user's Phantom/Backpack address
const DEMO_WALLET = "demo_" + Math.random().toString(36).slice(2, 10);

export default function App() {
  const [page, setPage]               = useState<Page>("landing");
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

  // ── First visit: educate on first Arena entry (not over the landing) ──
  const enterArena = useCallback(() => {
    setPage("yoink");
    if (!localStorage.getItem("yoink_onboarded")) {
      setTimeout(() => setShowOnboard(true), 450);
    }
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
      {/* Cinematic FX — vignette + scanlines + film grain */}
      <div className="fx-vignette" aria-hidden />
      <div className="fx-scanlines" aria-hidden />
      <div className="fx-grain" aria-hidden />

      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(10,10,24,0.95)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderTop: "1px solid rgba(255,255,255,0.10)",
            color: "#eeeef8",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontSize: "13px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 60px rgba(112,0,255,0.05)",
          },
        }}
      />

      <AnimatePresence>
        {showOnboard && <OnboardingModal onClose={closeOnboard} />}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40"
        style={{
          background: "rgba(3,4,9,0.88)",
          backdropFilter: "blur(28px) saturate(1.4)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 40px rgba(0,0,0,0.5), 0 0 120px rgba(112,0,255,0.04)",
        }}>
        {/* Top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.4) 20%, rgba(112,0,255,0.5) 50%, rgba(0,245,255,0.3) 80%, transparent 100%)" }} />

        <div className="max-w-6xl mx-auto px-5 h-[62px] flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <motion.button onClick={() => setPage("landing")}
            className="flex items-center gap-3 flex-shrink-0 group"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <div className="logo-mark">
              <Crosshair className="w-4 h-4 text-[#0a0a0f]" strokeWidth={2.5} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-y-green border-2 border-y-base blink" />
            </div>
            <div className="flex items-baseline gap-0">
              <span className="font-display text-[22px] text-white tracking-[0.06em]"
                style={{ textShadow: "0 0 20px rgba(255,255,255,0.15)" }}>YOINK</span>
              <span className="font-display text-[22px] tracking-[0.06em]"
                style={{ color: "#ffd700", textShadow: "0 0 20px rgba(255,215,0,0.5)" }}>.GG</span>
            </div>
          </motion.button>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => {
              const isActive = page === n.id;
              const Icon = n.icon;
              return (
                <motion.button
                  key={n.id}
                  onClick={() => setPage(n.id)}
                  className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-colors"
                  style={{
                    color: isActive ? "#fff" : "#6a7080",
                    background: isActive ? "rgba(255,215,0,0.08)" : "transparent",
                  }}
                  whileHover={{ color: "#fff", backgroundColor: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: isActive ? "#ffd700" : "currentColor" }} strokeWidth={2.2} />
                  {n.label}

                  {/* Active gold underline — animated */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: "linear-gradient(90deg, #ffd700, #f5b700)", boxShadow: "0 0 8px rgba(255,215,0,0.6)" }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* NEW badge */}
                  {n.id === "crates" && (
                    <span className="absolute -top-1.5 -right-1 text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-full leading-none"
                      style={{ background: "#ffd700", color: "#0a0a0f", boxShadow: "0 0 8px rgba(255,215,0,0.6)" }}>
                      NEW
                    </span>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* ── Right side ── */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Level badge */}
            {wallet && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 rounded-xl flex items-center gap-2"
                style={{
                  background: levelData.badgeBg,
                  border: `1px solid ${levelData.badgeColor}35`,
                  boxShadow: `0 0 16px ${levelData.badgeColor}15`,
                }}>
                <span className="font-display text-[12px] tracking-[0.06em]" style={{ color: levelData.badgeColor }}>
                  {levelData.name}
                </span>
                <span className="text-[10px] font-mono" style={{ color: "#8892a4" }}>{xp} XP</span>
              </motion.div>
            )}

            <button onClick={() => setShowOnboard(true)}
              className="btn-ghost text-[12px] py-2 px-3.5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              How to Play
            </button>

            {/* Wallet */}
            {wallet ? (
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-mono cursor-default"
                  style={{
                    background: "rgba(0,230,118,0.07)",
                    border: "1px solid rgba(0,230,118,0.28)",
                    color: "#00e676",
                    boxShadow: "0 0 20px rgba(0,230,118,0.08)",
                  }}>
                  <span className="w-2 h-2 rounded-full blink"
                    style={{ background: "#00e676", boxShadow: "0 0 6px #00e676" }} />
                  {walletShort}
                </motion.div>
                <button onClick={disconnectWallet}
                  className="btn-ghost text-[11px] py-2 px-2.5"
                  style={{ color: "#6a7080" }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={connectWallet}
                disabled={connecting}
                className="btn-yoink text-[13px] py-2.5 px-5 disabled:opacity-60">
                <Wallet className="w-4 h-4" />
                {connecting ? "Connecting..." : "Connect Wallet"}
              </motion.button>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: '#8892a4' }} onClick={() => setOpen(!open)}>
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
              className="overflow-hidden md:hidden border-t"
              style={{ background: "rgba(3,4,9,0.97)", backdropFilter: "blur(24px)", borderColor: "rgba(255,255,255,0.05)" }}
            >
              <div className="px-5 py-3 flex flex-col gap-1">
                {NAV.map(n => {
                  const Icon = n.icon;
                  const isActive = page === n.id;
                  return (
                    <motion.button key={n.id}
                      onClick={() => { setPage(n.id); setOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all"
                      style={{
                        color: isActive ? "#fff" : "#6a7080",
                        background: isActive ? "rgba(255,215,0,0.08)" : "transparent",
                        borderLeft: isActive ? "2px solid #ffd700" : "2px solid transparent",
                      }}
                      whileTap={{ scale: 0.97 }}>
                      <Icon className="w-4 h-4" style={{ color: isActive ? "#ffd700" : "currentColor" }} strokeWidth={2.2} />
                      {n.label}
                      {n.id === "crates" && (
                        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: "#ffd700", color: "#0a0a0f" }}>NEW</span>
                      )}
                    </motion.button>
                  );
                })}
                <div className="h-px my-1" style={{ background: "rgba(255,255,255,0.05)" }} />
                <button onClick={() => { setShowOnboard(true); setOpen(false); }}
                  className="btn-ghost w-full mt-1 text-[13px]">
                  How to Play
                </button>
                {wallet ? (
                  <div className="mt-1 flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "rgba(0,230,118,0.06)", border: "1px solid rgba(0,230,118,0.15)" }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full blink" style={{ background: "#00e676" }} />
                      <span className="text-[12px] font-mono" style={{ color: "#00e676" }}>{walletShort}</span>
                    </div>
                    <button onClick={disconnectWallet} className="text-[11px]" style={{ color: "#6a7080" }}>
                      Disconnect
                    </button>
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

      <AnimatePresence mode="wait">
        {page === "landing" ? (
          <motion.div key="landing" className="flex-1"
            variants={pageAnim} initial="initial" animate="animate" exit="exit">
            <LandingPage
              onEnter={enterArena}
              onConnect={connectWallet}
              connecting={connecting}
              wallet={wallet}
              onHowto={() => setShowOnboard(true)}
            />
          </motion.div>
        ) : (
          <motion.div key="app" className="flex-1 flex flex-col"
            variants={pageAnim} initial="initial" animate="animate" exit="exit">
            <LiveFeed />
            <GlobalStats />
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
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-y-border py-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(4,4,10,0.3) 0%, rgba(4,4,10,0.95) 100%)' }}>
        {/* Subtle gradient line at top */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(112,0,255,0.3), rgba(255,215,0,0.2), transparent)' }} />
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-[20px] text-white tracking-[0.02em]" style={{ textShadow: '0 0 16px rgba(255,255,255,0.1)' }}>YOINK</span>
            <span className="font-display text-[20px] tracking-[0.02em]" style={{ color: '#ffd700', textShadow: '0 0 16px rgba(255,215,0,0.4)' }}>.GG</span>
            <span className="text-[11px] ml-2 font-mono" style={{ color: '#5a5a8a' }}>Predatory by design.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]" style={{ color: '#8892a4' }}>
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
