import { motion, AnimatePresence } from 'framer-motion';
import type { WalletStatus } from '../types';

interface WalletCheckProps {
  status: WalletStatus;
  children: React.ReactNode;
  onConnect: () => void;
}

const STATUS_CONFIG: Record<WalletStatus, { label: string; icon: string; color: string }> = {
  disconnected: { label: 'CONNECT WALLET', icon: '🔌', color: 'text-white/60' },
  connecting: { label: 'CONNECTING...', icon: '🔄', color: 'text-secondary' },
  signing: { label: 'SIGNING...', icon: '✍️', color: 'text-accent' },
  confirming: { label: 'CONFIRMING...', icon: '⏳', color: 'text-king-gold' },
  connected: { label: '', icon: '', color: '' },
};

export function WalletCheck({ status, children, onConnect }: WalletCheckProps) {
  if (status === 'connected') {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred Content Behind */}
      <div className="opacity-30 blur-[2px] pointer-events-none select-none">
        {children}
      </div>

      {/* Overlay */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center z-30"
        >
          <div className="text-center">
            {/* Status Indicator */}
            {status !== 'disconnected' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-4xl mb-4 inline-block"
              >
                {STATUS_CONFIG[status].icon}
              </motion.div>
            )}

            {/* Status Label */}
            <motion.p
              animate={status !== 'disconnected' ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`font-display text-xl tracking-[0.3em] mb-6 ${STATUS_CONFIG[status].color}`}
            >
              {STATUS_CONFIG[status].label}
            </motion.p>

            {/* Connect Button (only when disconnected) */}
            {status === 'disconnected' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConnect}
                className="btn-secondary px-8 py-4"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 12H4M4 12L10 6M4 12L10 18" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  CONNECT PHANTOM
                </span>
              </motion.button>
            )}

            {/* Subtext */}
            <p className="font-mono text-[10px] text-white/20 mt-4 max-w-xs">
              {status === 'disconnected'
                ? 'Connect your Solana wallet to enter the arena'
                : 'Please approve the transaction in your wallet'}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
