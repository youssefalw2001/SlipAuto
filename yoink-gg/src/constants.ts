import BigNumber from 'bignumber.js';

// ─── Theme Colors ─────────────────────────────────────────────────────────────
export const COLORS = {
  primary: '#ff4d00',
  secondary: '#00e5ff',
  accent: '#7000ff',
  success: '#00e87a',
  obsidian: '#04040a',
  obsidianRadial: '#000a1a',
  kingGold: '#ffd700',
  white: '#ffffff',
  dustGrey: '#666666',
} as const;

// ─── Tier Thresholds (SOL) ────────────────────────────────────────────────────
export const TIER_THRESHOLDS = {
  DUST: new BigNumber(0),
  COMMON: new BigNumber(0.5),
  PREDATOR: new BigNumber(1.5),
  KING: new BigNumber(3),
} as const;

// ─── Tier Config ──────────────────────────────────────────────────────────────
export const TIER_CONFIG = {
  DUST: {
    borderClass: 'border-dashed border-gray-600',
    glowClass: '',
    opacity: 'opacity-60',
    label: 'DUST',
    color: COLORS.dustGrey,
  },
  COMMON: {
    borderClass: 'border-solid border-success',
    glowClass: 'shadow-inner',
    opacity: 'opacity-100',
    label: 'COMMON',
    color: COLORS.success,
  },
  PREDATOR: {
    borderClass: 'border-2 border-accent',
    glowClass: 'animate-glow-predator',
    opacity: 'opacity-100',
    label: 'PREDATOR',
    color: COLORS.accent,
  },
  KING: {
    borderClass: 'border-2 border-primary animate-pulse-king',
    glowClass: 'animate-pulse-king',
    opacity: 'opacity-100',
    label: 'KING',
    color: COLORS.primary,
  },
} as const;

// ─── Predator Animal Icons ────────────────────────────────────────────────────
export const PREDATOR_ICONS = {
  shark: '🦈',
  wolf: '🐺',
  bear: '🐻',
} as const;

// ─── Crate Configs ────────────────────────────────────────────────────────────
export const CRATE_COLORS = {
  common: { bg: 'from-gray-700 to-gray-900', border: 'border-gray-500', glow: '' },
  rare: { bg: 'from-blue-700 to-blue-900', border: 'border-secondary', glow: 'shadow-neon-cyan' },
  epic: { bg: 'from-purple-700 to-purple-900', border: 'border-accent', glow: 'shadow-neon-violet' },
  legendary: { bg: 'from-orange-600 to-red-900', border: 'border-primary', glow: 'shadow-neon-orange' },
} as const;

// ─── Arena Limits ─────────────────────────────────────────────────────────────
export const ARENA_CONFIG = {
  maxPlayers: 16,
  minPlayers: 2,
  roundDurationSeconds: 30,
  minDeposit: new BigNumber(0.01),
  maxDeposit: new BigNumber(10),
} as const;

// ─── Animation Durations ──────────────────────────────────────────────────────
export const ANIMATION = {
  cardHoverScale: 1.02,
  toastDuration: 4000,
  spinDuration: 4000,
  glitchThreshold: 5, // seconds
  shakeIntensity: 4,
} as const;
