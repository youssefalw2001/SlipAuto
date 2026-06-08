import { AnimatePresence, motion } from 'framer-motion';
import type { ToastEvent } from '../types';

interface ToastStackProps {
  toasts: ToastEvent[];
}

const TOAST_ICONS: Record<string, string> = {
  yoink: '⚡',
  join: '🟢',
  leave: '🔴',
  win: '🏆',
  loss: '💀',
};

const TOAST_COLORS: Record<string, string> = {
  yoink: 'border-primary/40 bg-primary/5',
  join: 'border-success/40 bg-success/5',
  leave: 'border-red-500/40 bg-red-500/5',
  win: 'border-king-gold/40 bg-king-gold/5',
  loss: 'border-white/10 bg-white/5',
};

export function ToastStack({ toasts }: ToastStackProps) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-xs">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: -60, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl
              backdrop-blur-xl border
              ${TOAST_COLORS[toast.type] || TOAST_COLORS.loss}
            `}
          >
            <span className="text-lg">{TOAST_ICONS[toast.type] || '📢'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs text-white/80 truncate">
                {toast.message}
              </p>
              {toast.address && (
                <p className="font-mono text-[9px] text-white/30 truncate">
                  {toast.address}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
