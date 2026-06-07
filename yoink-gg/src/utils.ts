import BigNumber from 'bignumber.js';
import type { WalletTier } from './types';
import { TIER_THRESHOLDS } from './constants';

// ─── BigNumber Helpers ────────────────────────────────────────────────────────
export function solToLamports(sol: BigNumber): BigNumber {
  return sol.multipliedBy(1_000_000_000);
}

export function lamportsToSol(lamports: BigNumber): BigNumber {
  return lamports.dividedBy(1_000_000_000);
}

export function formatSol(value: BigNumber, decimals = 4): string {
  return value.toFixed(decimals);
}

// ─── Tier Calculation ─────────────────────────────────────────────────────────
export function calculateTier(balanceSol: BigNumber): WalletTier {
  if (balanceSol.gte(TIER_THRESHOLDS.KING)) return 'KING';
  if (balanceSol.gte(TIER_THRESHOLDS.PREDATOR)) return 'PREDATOR';
  if (balanceSol.gte(TIER_THRESHOLDS.COMMON)) return 'COMMON';
  return 'DUST';
}

// ─── Address Formatting ───────────────────────────────────────────────────────
export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// ─── Random ID Generator ──────────────────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// ─── Wheel Angle Calculation ──────────────────────────────────────────────────
export function calculateSliceAngle(share: number): number {
  return share * 360;
}

export function calculateSlicePath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    'Z',
  ].join(' ');
}

// ─── Countdown Formatting ─────────────────────────────────────────────────────
export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ─── Random Helpers for Mock Data ─────────────────────────────────────────────
const MOCK_NAMES = [
  'DegenApe', 'SolWhale', 'RektKing', 'MoonShot',
  'DiamondPaws', 'PaperHands', 'YoinkGod', 'FloorSweep',
  'JeetLord', 'AlphaHunter', 'BagHolder', 'NftFlip',
  'RugPull', 'PumpKing', 'DumpQueen', 'GasWarrior',
];

const MOCK_ADDRESSES = Array.from({ length: 16 }, () =>
  Array.from({ length: 44 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
      Math.floor(Math.random() * 58)
    ]
  ).join('')
);

export function generateMockWallets(count: number = 12) {
  return Array.from({ length: count }, (_, i) => {
    const balance = new BigNumber(Math.random() * 5).decimalPlaces(4);
    const tier = calculateTier(balance);
    const predatorIcons: Array<'shark' | 'wolf' | 'bear'> = ['shark', 'wolf', 'bear'];

    return {
      id: generateId(),
      address: MOCK_ADDRESSES[i % 16],
      displayName: MOCK_NAMES[i % 16],
      balanceSol: balance,
      tier,
      joinedAt: Date.now() - Math.random() * 60000,
      isYoinked: false,
      predatorIcon: tier === 'PREDATOR' ? predatorIcons[Math.floor(Math.random() * 3)] : undefined,
      streak: Math.floor(Math.random() * 5),
    };
  });
}
