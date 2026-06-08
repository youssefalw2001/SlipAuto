import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BigNumber from 'bignumber.js';
import { Navbar } from './components/Navbar';
import { ArenaGrid } from './components/ArenaGrid';
import { SwapWheel } from './components/SwapWheel';
import { CrateShop } from './components/CrateShop';
import { ToastStack } from './components/ToastStack';
import { SessionPnLPanel } from './components/SessionPnLPanel';
import { WalletCheck } from './components/WalletCheck';
import { useArena } from './hooks/useArena';
import type { SessionPnL, WalletStatus } from './types';

const MOCK_PNL: SessionPnL = {
  totalDeposited: new BigNumber(2.5),
  totalWithdrawn: new BigNumber(3.1),
  netPnL: new BigNumber(0.6),
  wins: 7,
  losses: 3,
  biggestWin: new BigNumber(1.2),
  biggestLoss: new BigNumber(0.4),
};

function App() {
  const [activeTab, setActiveTab] = useState('arena');
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('connected'); // Default to connected for demo
  const [pnlOpen, setPnlOpen] = useState(false);

  const { state, toasts, screenEffect, yoink } = useArena();

  const handleConnectWallet = useCallback(() => {
    if (walletStatus === 'connected') {
      setWalletStatus('disconnected');
      return;
    }
    setWalletStatus('connecting');
    setTimeout(() => setWalletStatus('signing'), 1500);
    setTimeout(() => setWalletStatus('confirming'), 3000);
    setTimeout(() => setWalletStatus('connected'), 4500);
  }, [walletStatus]);

  const handleSpin = useCallback(() => {
    // Placeholder for spin-triggered logic
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-white overflow-x-hidden">
      {/* Background Gradient Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[50%] bg-gradient-radial from-obsidian-radial/50 to-transparent opacity-60" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-accent/5 to-transparent opacity-40" />
        <div className="absolute top-1/4 left-0 w-1/3 h-1/3 bg-gradient-radial from-primary/5 to-transparent opacity-30" />
      </div>

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        walletConnected={walletStatus === 'connected'}
        onConnectWallet={handleConnectWallet}
      />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'arena' && (
            <motion.div
              key="arena"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WalletCheck status={walletStatus} onConnect={handleConnectWallet}>
                <ArenaGrid
                  state={state}
                  onYoink={yoink}
                  screenEffect={screenEffect}
                />
              </WalletCheck>
            </motion.div>
          )}

          {activeTab === 'wheel' && (
            <motion.div
              key="wheel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WalletCheck status={walletStatus} onConnect={handleConnectWallet}>
                <div className="flex flex-col items-center">
                  <div className="mb-8">
                    <h2 className="font-display text-4xl md:text-5xl text-white tracking-wider text-center">
                      SWAP <span className="text-gradient-fire">WHEEL</span>
                    </h2>
                    <p className="font-mono text-xs text-white/40 mt-1 text-center">
                      Deposit SOL. Spin. Yoink the pot.
                    </p>
                  </div>
                  <SwapWheel
                    wallets={state.wallets}
                    totalPool={state.totalPool}
                    countdown={state.countdown}
                    isSpinning={state.isSpinning}
                    onSpin={handleSpin}
                  />
                </div>
              </WalletCheck>
            </motion.div>
          )}

          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WalletCheck status={walletStatus} onConnect={handleConnectWallet}>
                <CrateShop />
              </WalletCheck>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast Stack (bottom-left) */}
      <ToastStack toasts={toasts} />

      {/* Session P&L Panel (slides from right) */}
      <SessionPnLPanel
        pnl={MOCK_PNL}
        isOpen={pnlOpen}
        onToggle={() => setPnlOpen(!pnlOpen)}
      />

      {/* Footer */}
      <footer className="relative z-10 mt-16 pb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-display text-lg tracking-wider text-white/20">YOINK.GG</span>
          <span className="text-[8px] font-mono text-white/10 border border-white/5 px-1 py-0.5 rounded">
            SOLANA
          </span>
        </div>
        <p className="font-mono text-[9px] text-white/10">
          Predatory by design. Play at your own risk.
        </p>
      </footer>
    </div>
  );
}

export default App;
