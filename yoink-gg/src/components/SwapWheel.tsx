import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BigNumber from 'bignumber.js';
import type { ArenaWallet, WheelSlice } from '../types';
import { COLORS } from '../constants';
import { calculateSlicePath, formatCountdown } from '../utils';

interface SwapWheelProps {
  wallets: ArenaWallet[];
  totalPool: BigNumber;
  countdown: number;
  isSpinning: boolean;
  onSpin: () => void;
}

const WHEEL_COLORS = [
  '#ff4d00', '#00e5ff', '#7000ff', '#00e87a',
  '#ffd700', '#ff006e', '#3a86ff', '#8338ec',
  '#06d6a0', '#ef476f', '#118ab2', '#073b4c',
  '#e63946', '#457b9d', '#2a9d8f', '#e9c46a',
];

const WHEEL_RADIUS = 160;
const WHEEL_CENTER = 180;

export function SwapWheel({ wallets, totalPool, countdown, isSpinning, onSpin }: SwapWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(isSpinning);
  const [winner, setWinner] = useState<string | null>(null);

  const isGlitchTime = countdown <= 5 && countdown > 0;

  // ─── Build Wheel Slices ─────────────────────────────────────────────────────
  const slices: WheelSlice[] = useMemo(() => {
    if (totalPool.isZero() || wallets.length === 0) return [];

    let minShare = Infinity;
    let minId = '';

    const result = wallets.map((w, i) => {
      const share = w.balanceSol.dividedBy(totalPool).toNumber();
      if (share < minShare && share > 0) {
        minShare = share;
        minId = w.id;
      }
      return {
        walletId: w.id,
        address: w.address,
        share,
        color: WHEEL_COLORS[i % WHEEL_COLORS.length],
        isAtRisk: false,
      };
    });

    // Mark smallest depositor as "at risk"
    return result.map((s) => ({ ...s, isAtRisk: s.walletId === minId }));
  }, [wallets, totalPool]);

  // ─── Spin Logic ─────────────────────────────────────────────────────────────
  const handleSpin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);

    // Random target: 5-8 full rotations + random offset
    const extraRotations = (5 + Math.random() * 3) * 360;
    const randomOffset = Math.random() * 360;
    const totalDegrees = rotation + extraRotations + randomOffset;

    setRotation(totalDegrees);

    // Determine winner after spin
    setTimeout(() => {
      const normalizedAngle = totalDegrees % 360;
      let accumAngle = 0;

      for (const slice of slices) {
        accumAngle += slice.share * 360;
        if (normalizedAngle <= accumAngle) {
          setWinner(slice.walletId);
          break;
        }
      }
      setSpinning(false);
    }, 4200);

    onSpin();
  }, [spinning, rotation, slices, onSpin]);

  // ─── Render SVG Paths ───────────────────────────────────────────────────────
  const renderSlices = useMemo(() => {
    let currentAngle = 0;
    return slices.map((slice, i) => {
      const sliceAngle = slice.share * 360;
      if (sliceAngle < 0.5) return null; // Skip negligible slices

      const path = calculateSlicePath(
        WHEEL_CENTER,
        WHEEL_CENTER,
        WHEEL_RADIUS,
        currentAngle,
        currentAngle + sliceAngle
      );
      currentAngle += sliceAngle;

      return (
        <path
          key={slice.walletId}
          d={path}
          fill={slice.color}
          stroke="#04040a"
          strokeWidth="1.5"
          opacity={slice.isAtRisk ? 0.9 : 0.75}
          className="transition-opacity duration-300 hover:opacity-100"
        />
      );
    });
  }, [slices]);

  // ─── At-Risk Indicator Position ─────────────────────────────────────────────
  const atRiskSlice = slices.find((s) => s.isAtRisk);
  const atRiskAngle = useMemo(() => {
    if (!atRiskSlice) return 0;
    let angle = 0;
    for (const s of slices) {
      if (s.walletId === atRiskSlice.walletId) {
        return angle + (s.share * 360) / 2;
      }
      angle += s.share * 360;
    }
    return 0;
  }, [slices, atRiskSlice]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Countdown */}
      <div className="text-center">
        <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.3em]">
          Spin In
        </span>
        <div
          className={`font-display text-4xl md:text-5xl tracking-wider ${
            isGlitchTime ? 'animate-glitch text-primary' : 'text-white'
          }`}
        >
          {formatCountdown(countdown)}
        </div>
      </div>

      {/* Wheel Container */}
      <div className="relative">
        {/* Outer Ring Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-xl" />

        {/* Pointer/Indicator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
        </div>

        {/* SVG Wheel */}
        <motion.svg
          width={WHEEL_CENTER * 2}
          height={WHEEL_CENTER * 2}
          viewBox={`0 0 ${WHEEL_CENTER * 2} ${WHEEL_CENTER * 2}`}
          className="relative z-10 drop-shadow-2xl"
          animate={{ rotate: rotation }}
          transition={{
            duration: spinning ? 4 : 0,
            ease: [0.17, 0.67, 0.12, 0.99], // Deceleration curve
          }}
        >
          {/* Wheel background */}
          <circle
            cx={WHEEL_CENTER}
            cy={WHEEL_CENTER}
            r={WHEEL_RADIUS + 5}
            fill="none"
            stroke="#ffffff10"
            strokeWidth="2"
          />

          {/* Slices */}
          {renderSlices}

          {/* Inner circle overlay */}
          <circle
            cx={WHEEL_CENTER}
            cy={WHEEL_CENTER}
            r={40}
            fill="#04040a"
            stroke="#ffffff15"
            strokeWidth="2"
          />

          {/* Central Y Logo */}
          <text
            x={WHEEL_CENTER}
            y={WHEEL_CENTER + 12}
            textAnchor="middle"
            fill={COLORS.accent}
            fontSize="32"
            fontFamily="Bebas Neue, sans-serif"
            className="select-none"
          >
            Y
          </text>
        </motion.svg>

        {/* Central Pulsing Violet Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-accent/10 animate-pulse pointer-events-none z-0" />

        {/* At-Risk Red Dot */}
        {atRiskSlice && (
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-primary shadow-neon-orange z-20"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              top: `${50 + 42 * Math.sin((atRiskAngle - 90) * (Math.PI / 180))}%`,
              left: `${50 + 42 * Math.cos((atRiskAngle - 90) * (Math.PI / 180))}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>

      {/* Spin Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSpin}
        disabled={spinning}
        className={`
          btn-primary px-10 py-4 text-xl
          ${spinning ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {spinning ? 'SPINNING...' : '⚡ SPIN THE WHEEL'}
      </motion.button>

      {/* Winner Announcement */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center p-4 glass-card border-success"
          >
            <span className="font-display text-2xl text-success tracking-wider">
              WINNER!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pool Info */}
      <div className="flex items-center gap-4 text-xs font-mono text-white/40">
        <span>{slices.length} players</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span>{totalPool.toFixed(2)} SOL pool</span>
        {atRiskSlice && (
          <>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-primary">
              🔴 At Risk: {(atRiskSlice.share * 100).toFixed(1)}%
            </span>
          </>
        )}
      </div>
    </div>
  );
}
