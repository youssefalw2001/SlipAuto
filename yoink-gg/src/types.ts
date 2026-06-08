import BigNumber from 'bignumber.js';

// ─── Wallet Tier System ───────────────────────────────────────────────────────
export type WalletTier = 'DUST' | 'COMMON' | 'PREDATOR' | 'KING';

export interface ArenaWallet {
  id: string;
  address: string;
  displayName: string;
  balanceSol: BigNumber;
  tier: WalletTier;
  avatar?: string;
  joinedAt: number;
  isYoinked: boolean;
  predatorIcon?: 'shark' | 'wolf' | 'bear';
  streak: number;
}

// ─── Arena State ──────────────────────────────────────────────────────────────
export interface ArenaState {
  wallets: ArenaWallet[];
  totalPool: BigNumber;
  roundId: string;
  countdown: number;
  isSpinning: boolean;
  lastYoinker: string | null;
  lastVictim: string | null;
}

// ─── Wheel Slice ──────────────────────────────────────────────────────────────
export interface WheelSlice {
  walletId: string;
  address: string;
  share: number; // 0-1 percentage of pool
  color: string;
  isAtRisk: boolean;
}

// ─── Crate System ─────────────────────────────────────────────────────────────
export type CrateRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface CrateItem {
  id: string;
  name: string;
  rarity: CrateRarity;
  odds: number;
  value: BigNumber;
  icon: string;
}

export interface Crate {
  id: string;
  name: string;
  rarity: CrateRarity;
  price: BigNumber;
  items: CrateItem[];
  description: string;
}

// ─── Toast / Event System ─────────────────────────────────────────────────────
export type ToastType = 'yoink' | 'join' | 'leave' | 'win' | 'loss';

export interface ToastEvent {
  id: string;
  type: ToastType;
  message: string;
  address?: string;
  amount?: BigNumber;
  timestamp: number;
}

// ─── P&L Session ──────────────────────────────────────────────────────────────
export interface SessionPnL {
  totalDeposited: BigNumber;
  totalWithdrawn: BigNumber;
  netPnL: BigNumber;
  wins: number;
  losses: number;
  biggestWin: BigNumber;
  biggestLoss: BigNumber;
}

// ─── Wallet Connection State ──────────────────────────────────────────────────
export type WalletStatus = 'disconnected' | 'connecting' | 'signing' | 'confirming' | 'connected';

export interface WalletState {
  status: WalletStatus;
  address: string | null;
  balance: BigNumber;
}
