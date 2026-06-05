import React, { useState } from "react";
import { Zap, Swords, Trophy, Users, TrendingUp, Menu, X } from "lucide-react";
import SurgeGame from "./components/SurgeGame";
import SolWars from "./components/SolWars";
import LiveWinFeed from "./components/LiveWinFeed";
import Leaderboard from "./components/Leaderboard";
import ReferralDashboard from "./components/ReferralDashboard";

export type Page = "surge" | "wars" | "leaderboard" | "referral";

export default function App() {
  const [page, setPage] = useState<Page>("surge");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const nav = [
    { id: "surge", label: "The Surge", icon: <Zap className="w-4 h-4" /> },
    { id: "wars", label: "SOL Wars", icon: <Swords className="w-4 h-4" /> },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4" /> },
    { id: "referral", label: "Referrals", icon: <Users className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-arena-bg text-arena-text font-sans flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-arena-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-arena-red/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-arena-blue/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arena-purple to-arena-blue flex items-center justify-center shadow-glow-purple">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white">SOL</span>
              <span className="font-black text-lg tracking-tight text-arena-purple">ARENA</span>
            </div>
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono bg-arena-green/10 text-arena-green border border-arena-green/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-arena-green animate-pulse inline-block" />
              LIVE
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  page === item.id
                    ? "bg-arena-purple/20 text-arena-purple border border-arena-purple/30"
                    : "text-arena-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Wallet Button */}
          <div className="hidden md:flex items-center gap-3">
            <button className="btn-primary text-sm">
              Connect Wallet
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-arena-muted hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-black/60 backdrop-blur-md px-4 py-3 flex flex-col gap-1">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  page === item.id
                    ? "bg-arena-purple/20 text-arena-purple"
                    : "text-arena-muted hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button className="btn-primary text-sm mt-2">Connect Wallet</button>
          </div>
        )}
      </header>

      {/* Live Win Feed Ticker */}
      <LiveWinFeed />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {page === "surge" && <SurgeGame />}
        {page === "wars" && <SolWars />}
        {page === "leaderboard" && <Leaderboard />}
        {page === "referral" && <ReferralDashboard />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/20 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-arena-muted">
          <div className="flex items-center gap-2">
            <span className="font-black text-white">SOL</span>
            <span className="font-black text-arena-purple">ARENA</span>
            <span>— Provably Fair on Solana</span>
          </div>
          <div className="flex items-center gap-4">
            <span>18+ Only</span>
            <span>•</span>
            <span>Gamble Responsibly</span>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
