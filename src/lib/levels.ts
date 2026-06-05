// ============================================================
// YOINK.GG — Level System
// ============================================================

export interface Level {
  id: number;
  name: string;
  xpRequired: number;
  maxEntrySOL: number;
  maxStealSOL: number;
  successBonus: number;   // % added to base chance
  arenaColor: string;
  badgeColor: string;
  badgeBg: string;
  unlocks: string[];
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "ROOKIE",
    xpRequired: 0,
    maxEntrySOL: 0.5,
    maxStealSOL: 0.25,
    successBonus: 0,
    arenaColor: "#a0a0b0",
    badgeColor: "#a0a0b0",
    badgeBg: "rgba(160,160,176,0.12)",
    unlocks: ["Basic arena access", "Common Crates"],
  },
  {
    id: 2,
    name: "HUSTLER",
    xpRequired: 500,
    maxEntrySOL: 2,
    maxStealSOL: 1,
    successBonus: 5,
    arenaColor: "#00d470",
    badgeColor: "#00d470",
    badgeBg: "rgba(0,212,112,0.12)",
    unlocks: ["2 SOL max entry", "+5% success rate", "Rare Crates"],
  },
  {
    id: 3,
    name: "PREDATOR",
    xpRequired: 1500,
    maxEntrySOL: 10,
    maxStealSOL: 5,
    successBonus: 10,
    arenaColor: "#a060ff",
    badgeColor: "#a060ff",
    badgeBg: "rgba(160,96,255,0.12)",
    unlocks: ["10 SOL max entry", "+10% success rate", "Epic Crates", "Bounty target visibility"],
  },
  {
    id: 4,
    name: "APEX",
    xpRequired: 5000,
    maxEntrySOL: Infinity,
    maxStealSOL: Infinity,
    successBonus: 15,
    arenaColor: "#ff4d00",
    badgeColor: "#ff4d00",
    badgeBg: "rgba(255,77,0,0.12)",
    unlocks: ["Unlimited entry", "+15% success rate", "All Crates", "APEX crown", "Weekly prize pool"],
  },
];

export function getLevelById(id: number): Level {
  return LEVELS.find(l => l.id === id) ?? LEVELS[0];
}

export function getLevelByXP(xp: number): Level {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) current = level;
  }
  return current;
}

export function getNextLevel(currentLevelId: number): Level | null {
  return LEVELS.find(l => l.id === currentLevelId + 1) ?? null;
}

export function getXPProgress(xp: number): {
  current: Level;
  next: Level | null;
  progressPct: number;
  xpIntoLevel: number;
  xpNeeded: number;
} {
  const current = getLevelByXP(xp);
  const next = getNextLevel(current.id);
  if (!next) return { current, next: null, progressPct: 100, xpIntoLevel: xp - current.xpRequired, xpNeeded: 0 };
  const xpIntoLevel = xp - current.xpRequired;
  const xpNeeded = next.xpRequired - current.xpRequired;
  const progressPct = Math.min(100, (xpIntoLevel / xpNeeded) * 100);
  return { current, next, progressPct, xpIntoLevel, xpNeeded };
}

// XP rewards
export const XP_REWARDS = {
  ENTER_ARENA:       10,
  YOINK_ATTEMPT:     25,
  YOINK_SUCCESS:     50,
  WHEEL_WIN:         75,
  DAILY_LOGIN:       20,
  REFER_PLAYER:      200,
  OPEN_CRATE:        15,
};

// ============================================================
// CRATE SYSTEM
// ============================================================

export interface CrateReward {
  label: string;
  type: "xp" | "sol" | "cosmetic" | "boost";
  value: number | string;
  chance: number;      // 0-100
  color: string;
  rare?: boolean;
}

export interface CrateTier {
  id: "common" | "rare" | "epic" | "legendary";
  name: string;
  price: number;        // in SOL
  color: string;
  glowColor: string;
  bgGradient: string;
  minLevel: number;
  dailyLimit: number;
  rewards: CrateReward[];
  houseEdge: number;   // percentage house keeps
}

export const CRATE_TIERS: CrateTier[] = [
  {
    id: "common",
    name: "COMMON",
    price: 0.02,
    color: "#a0a0b0",
    glowColor: "rgba(160,160,176,0.3)",
    bgGradient: "linear-gradient(135deg, rgba(160,160,176,0.08), rgba(160,160,176,0.03))",
    minLevel: 1,
    dailyLimit: 5,
    houseEdge: 80,
    rewards: [
      { label: "+100 XP",          type: "xp",       value: 100,       chance: 35, color: "#a0a0b0" },
      { label: "+200 XP",          type: "xp",       value: 200,       chance: 25, color: "#a0a0b0" },
      { label: "Common Badge",     type: "cosmetic",  value: "badge",   chance: 20, color: "#a0a0b0" },
      { label: "2x XP — 1 Hour",   type: "boost",     value: "2xp_1h",  chance: 10, color: "#ffd200" },
      { label: "+0.03 SOL",        type: "sol",       value: 0.03,      chance: 8,  color: "#00d470" },
      { label: "+0.05 SOL",        type: "sol",       value: 0.05,      chance: 2,  color: "#00d470", rare: true },
    ],
  },
  {
    id: "rare",
    name: "RARE",
    price: 0.05,
    color: "#00d470",
    glowColor: "rgba(0,212,112,0.35)",
    bgGradient: "linear-gradient(135deg, rgba(0,212,112,0.08), rgba(0,212,112,0.03))",
    minLevel: 2,
    dailyLimit: 5,
    houseEdge: 64,
    rewards: [
      { label: "+300 XP",          type: "xp",       value: 300,       chance: 30, color: "#00d470" },
      { label: "Rare Animated Badge", type: "cosmetic", value: "rare_badge", chance: 20, color: "#00d470" },
      { label: "2x XP — 24 Hours", type: "boost",     value: "2xp_24h", chance: 15, color: "#ffd200" },
      { label: "+0.03 SOL",        type: "sol",       value: 0.03,      chance: 15, color: "#00d470" },
      { label: "+0.08 SOL",        type: "sol",       value: 0.08,      chance: 10, color: "#00d470" },
      { label: "+5% Boost — 24h",  type: "boost",     value: "5pct_24h",chance: 7,  color: "#ff7040" },
      { label: "+0.20 SOL",        type: "sol",       value: 0.20,      chance: 3,  color: "#ffd200", rare: true },
    ],
  },
  {
    id: "epic",
    name: "EPIC",
    price: 0.15,
    color: "#a060ff",
    glowColor: "rgba(160,96,255,0.4)",
    bgGradient: "linear-gradient(135deg, rgba(160,96,255,0.10), rgba(160,96,255,0.03))",
    minLevel: 3,
    dailyLimit: 5,
    houseEdge: 57,
    rewards: [
      { label: "+750 XP",          type: "xp",       value: 750,       chance: 25, color: "#a060ff" },
      { label: "Epic Animated Frame", type: "cosmetic", value: "epic_frame", chance: 15, color: "#a060ff" },
      { label: "3x XP — 24 Hours", type: "boost",     value: "3xp_24h", chance: 15, color: "#ffd200" },
      { label: "+0.10 SOL",        type: "sol",       value: 0.10,      chance: 20, color: "#00d470" },
      { label: "+0.20 SOL",        type: "sol",       value: 0.20,      chance: 10, color: "#00d470" },
      { label: "+10% Boost — 48h", type: "boost",     value: "10pct_48h",chance: 8, color: "#ff7040" },
      { label: "+0.50 SOL",        type: "sol",       value: 0.50,      chance: 5,  color: "#ffd200", rare: true },
      { label: "+1.0 SOL JACKPOT", type: "sol",       value: 1.00,      chance: 2,  color: "#ff4d00", rare: true },
    ],
  },
  {
    id: "legendary",
    name: "LEGENDARY",
    price: 0.50,
    color: "#ff4d00",
    glowColor: "rgba(255,77,0,0.5)",
    bgGradient: "linear-gradient(135deg, rgba(255,77,0,0.10), rgba(255,210,0,0.05))",
    minLevel: 4,
    dailyLimit: 5,
    houseEdge: 57,
    rewards: [
      { label: "+2000 XP",         type: "xp",       value: 2000,      chance: 20, color: "#ff4d00" },
      { label: "Legendary Badge",  type: "cosmetic",  value: "leg_badge",chance: 15, color: "#ffd200" },
      { label: "+0.30 SOL",        type: "sol",       value: 0.30,      chance: 20, color: "#00d470" },
      { label: "+0.50 SOL Refund", type: "sol",       value: 0.50,      chance: 10, color: "#00d470" },
      { label: "5x XP — 48 Hours", type: "boost",     value: "5xp_48h", chance: 10, color: "#ffd200" },
      { label: "+15% Boost — 72h", type: "boost",     value: "15pct_72h",chance: 8, color: "#ff7040" },
      { label: "+1.0 SOL",         type: "sol",       value: 1.00,      chance: 10, color: "#ffd200", rare: true },
      { label: "+2.0 SOL JACKPOT", type: "sol",       value: 2.00,      chance: 5,  color: "#ff4d00", rare: true },
      { label: "+5.0 SOL JACKPOT", type: "sol",       value: 5.00,      chance: 2,  color: "#ff4d00", rare: true },
    ],
  },
];

export function spinCrate(tier: CrateTier): CrateReward {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const reward of tier.rewards) {
    cumulative += reward.chance;
    if (roll <= cumulative) return reward;
  }
  return tier.rewards[0];
}
