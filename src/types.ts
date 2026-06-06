/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OnboardingData {
  gender: string;
  focusGoal: string;
  referredBy: string;
  motivation: string;
  focusArea: string;
  archetype: string;
  fitnessLevel: string;
  activityLevel: string;
  age: number;
  heightFeet: number;
  heightInches: number;
  isMetricHeight: boolean;
  weight: number; // in lbs or kg
  isMetricWeight: boolean;
  targetWeight: number; // in lbs or kg
  healthIssues: string;
  equipment: string[];
  workoutFrequency: number; // 1 to 7
  workoutDays: string[]; // e.g. ["Mon", "Wed", "Fri"]
  workoutReminder: boolean;
  
  // New customized profile fields for Academics, Career & Bodybuilding
  academicSubject?: string;
  academicSessionsGoal?: number;
  careerTargetRole?: string;
  careerPrepActivity?: string;
  fitnessDietGoal?: string;
  bodybuildingSplit?: string;
}

export enum ItemRarity {
  E = "E",
  D = "D",
  C = "C",
  B = "B",
  A = "A",
  S = "S",
  National = "National",
  Sovereign = "Sovereign"
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: "Weapon" | "Armor" | "Accessory" | "Key";
  rarity: ItemRarity;
  statBonus: {
    strength?: number;
    agility?: number;
    vitality?: number;
    intelligence?: number;
    perception?: number;
  };
  weaponDetails?: {
    lore: string;
    passiveAbility: string;
    criticalChance: string;
    scalingModifier: string;
    speed: string;
    durability: string;
    origin: string;
    history: string[];
    elements: string[];
    weight: string;
  };
  equipped: boolean;
  iconName: string;
}

export interface ShadowSoldier {
  id: string;
  name: string;
  tier: "Regular" | "Elite" | "Named Commander" | "Ultimate Legion";
  power: number;
  unlocked: boolean;
  cost: number;
  count: number;
  iconName: string;
  description: string;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  levelRequired: number;
  cost: number;
  unlocked: boolean;
  category: "Combat" | "Shadow" | "Passive";
  effect: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  rewardExp: number;
  rewardGold: number;
  completed: boolean;
  type: "Daily" | "Emergency" | "Story";
}

export interface GameState {
  level: number;
  exp: number;
  maxExp: number;
  gold: number;
  statPoints: number;
  baseStats: {
    strength: number;
    agility: number;
    vitality: number;
    intelligence: number;
    perception: number;
  };
  job: string;
  rank: string;
  inventory: InventoryItem[];
  shadows: ShadowSoldier[];
  skills: SkillNode[];
  quests: Quest[];
  storyStep: number; // tracks narrative progression
  manaStaked?: number;
  boosterMultiplier?: number;
  sigils?: number;
  prestigePoints?: number;
  dailyGatesCleared?: number;
  dailyFocusMinutes?: number;
}
