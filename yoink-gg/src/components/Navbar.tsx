import { motion } from 'framer-motion';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
}

const TABS = [
  { id: 'arena', label: 'ARENA', icon: '⚔️' },
  { id: 'wheel', label: 'WHEEL', icon: '🎡' },
  { id: 'shop', label: 'SHOP', icon: '📦' },
];

export function Navbar({ activeTab, onTabChange, walletConnected, onConnectWallet }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full px-4 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl bg-obsidian/80 border-b border-white/[0.04]">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 5, scale: 1.05 }}
          className="font-display text-3xl tracking-wider"
        >
          <span className="text-primary">Y</span>
          <span className="text-white">OINK</span>
          <span className="text-secondary">.GG</span>
        </motion.div>
        <span className="hidden md:inline-block text-[8px] font-mono text-white/20 border border-white/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
          BETA
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-4 py-2 rounded-lg font-display text-sm tracking-wider
              transition-colors duration-200
              ${activeTab === tab.id
                ? 'text-white'
                : 'text-white/40 hover:text-white/70'
              }
            `}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.1]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <span className="hidden sm:inline">{tab.icon}</span>
              {tab.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Wallet Connect */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onConnectWallet}
        className={`
          px-4 py-2 rounded-xl font-display text-xs tracking-wider
          transition-all duration-200
          ${walletConnected
            ? 'bg-success/10 text-success border border-success/30'
            : 'bg-white/5 text-white/60 border border-white/10 hover:border-secondary/40 hover:text-secondary'
          }
        `}
      >
        {walletConnected ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            CONNECTED
          </span>
        ) : (
          'CONNECT'
        )}
      </motion.button>
    </nav>
  );
}
