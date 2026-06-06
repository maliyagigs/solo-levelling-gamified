/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryItem, ItemRarity, ShadowSoldier, SkillNode, Quest } from "./types";

export const FITNESS_GOALS = [
  { id: "build_muscle", label: "Build Muscle", desc: "Gain power, size, and athletic strength" },
  { id: "loose_weight", label: "Lose Weight", desc: "Burn calories and slice fat reserves" },
  { id: "look_better", label: "Look Better", desc: "Define tone, posture, and facial symmetry" },
  { id: "stay_in_shape", label: "Stay in Shape", desc: "Boost vitality, endurance, and heart health" },
];

export const SOVEREIGN_ASCENSION_GOALS = [
  { id: "build_muscle", label: "Physical Conditioning & Bodybuilding", desc: "Gain power, size, muscle density and systemic strength" },
  { id: "loose_weight", label: "Sovereign Shred & Fat Loss", desc: "Burn calories, slice fat reserves, rise with speed and stamina" },
  { id: "academics_focus", label: "Academic Excellence & Focus", desc: "Conquer cognitive domains, focus pomodoro timers & exam prep" },
  { id: "career_focus", label: "Career Ascension & Coding Guild", desc: "Forge projects, build resume score, and lock recruiter offers" },
  { id: "all_round", label: "All-Round Shadow Monarch Sovereign", desc: "Achieve parity across all physical, mental, and professional gates" },
];

export const ACADEMIC_DISCIPLINE_LIST = [
  { id: "comp_sci", label: "Computer Science & Engineering", desc: "Focuses on algorithms, system architectures & software engineering" },
  { id: "math_physics", label: "Mathematics & Physical Sciences", desc: "Focuses on numerical formulas, structural logic & theoretical limits" },
  { id: "bio_med", label: "Biological & Medical Sciences", desc: "Focuses on anatomy, physiological grids, biochemistry & cell pathing" },
  { id: "biz_finance", label: "Business, Finance & Economics", desc: "Focuses on treasury assets, market algorithms & venture capital" },
  { id: "humanities", label: "Humanities & Social Sciences", desc: "Focuses on historical context, cognitive languages & culture guilds" },
  { id: "other", label: "Other Technical Discipline", desc: "Focuses on custom syllabus grids & tailored cognitive metrics" }
];

export const ACADEMIC_SESSIONS_GOALS = [
  { id: "sessions_2", label: "2 Pomodoro Sessions / Day", desc: "Commit ~50 minutes of deep academic study" },
  { id: "sessions_4", label: "4 Pomodoro Sessions / Day", desc: "Commit ~100 minutes of standard cognitive grinds" },
  { id: "sessions_6", label: "6 Pomodoro Sessions / Day", desc: "Commit ~150 minutes of high-intensity scholar CONDITIONING" },
  { id: "sessions_8", label: "8 Pomodoro Sessions / Day", desc: "Commit ~200 minutes of legendary, S-Rank intellectual focus" }
];

export const CAREER_TARGET_ROLES = [
  { id: "software_eng", label: "Software Engineer / Web Generalist", desc: "Deploy frontend/backend portals & maintain modular code layers" },
  { id: "data_scientist", label: "Data Engineer & AI Alchemist", desc: "Train machine models & aggregate massive system metadata matrices" },
  { id: "product_manager", label: "Product Specialist / Guild Knight", desc: "Coordinate raid timelines, plan project sprints & manage players" },
  { id: "designer", label: "Creative Designer / Archer", desc: "Develop high-contrast, responsive visual assets & vector interfaces" },
  { id: "analyst", label: "Financial Analyst / Treasury Rogue", desc: "Oversee ledger trades, compute micro-risks & optimize resources" }
];

export const CAREER_PREPARATION_ACTIVITIES = [
  { id: "leetcode", label: "Leetcode & DSA Duels", desc: "Solve challenges on computer science structures, queues, arrays" },
  { id: "portfolio", label: "Portfolio & App Commits", desc: "Build functional interfaces, modular styles & deploy services" },
  { id: "outreach", label: "Resumes & Recruiter Contacts", desc: "Optimize profile score, reach out to recruiters & track job phases" },
  { id: "reading", label: "Technical and Systems Reading", desc: "Deeply study virtual memory, cache, thread schedules & system papers" }
];

export const BODYBUILDING_SPLITS = [
  { id: "push_pull_legs", label: "Push-Pull-Legs Split", desc: "Divide training by functional motion: Push (Chest/Tri), Pull (Back/Bi), Legs" },
  { id: "bro_split", label: "Classic Bro Split (Chest, Back, Arms/Sh, Legs)", desc: "Blitz one massive muscle fortress per day with heavy sets" },
  { id: "upper_lower", label: "Upper-Lower Action Splits", desc: "Alternate entire upper body with lower extremities for recovery speed" },
  { id: "full_body", label: "Full-Body Strength Conditioning", desc: "Combat conditioning addressing every joint & muscle chain each session" }
];

export const DIET_METABOLIC_GOALS = [
  { id: "bulk", label: "Aggressive Muscle Bulking (+Calories)", desc: "Feed muscle synthesis with caloric surplus & high amino acid density" },
  { id: "cut", label: "Sovereign Shred & Fat Slice (-Calories)", desc: "Maintain strength while forcing cardiorespiratory shred in deficit" },
  { id: "recomp", label: "Metamorphosis Recomp (Maintenance)", desc: "Shed visceral fat slowly while rebuilding myofibrils around maintenance calories" }
];

export const REFERRAL_SOURCES = [
  { id: "tiktok", label: "TikTok", icon: "Music" },
  { id: "instagram", label: "Instagram", icon: "Instagram" },
  { id: "facebook", label: "Facebook", icon: "Facebook" },
  { id: "youtube", label: "YouTube", icon: "Youtube" },
  { id: "google", label: "Google", icon: "Search" },
  { id: "friend", label: "Friend", icon: "User" },
  { id: "other", label: "Other", icon: "MoreHorizontal" },
];

export const FITNESS_MOTIVATIONS = [
  { id: "health", label: "Health & Longevity", desc: "Live longer, cleaner, and feel younger" },
  { id: "weight_loss", label: "Weight Reduction", desc: "Shed stubborn fat layers and light up stamina" },
  { id: "appearance", label: "Aesthetic Appearance", desc: "Command presence with a sharp, symmetrical form" },
  { id: "stress_relief", label: "Stress Relief", desc: "Channel frustration and anxiety into raw power" },
  { id: "social_support", label: "Social Support & Guilds", desc: "Join like-minded hunters in their journey" },
  { id: "enjoyment", label: "Pure Enjoyment", desc: "Love the grind and enjoy pushing human capacity" },
];

export const FOCUS_AREAS = [
  { id: "full_body", label: "Full Body", icon: "Activity" },
  { id: "chest", label: "Chest (Gatekeeper Plates)", icon: "Shield" },
  { id: "back", label: "Back (Demon Wings)", icon: "TrendingUp" },
  { id: "arms", label: "Arms (Ruler Gauntlets)", icon: "Hammer" },
  { id: "shoulders", label: "Shoulders (Boulder Pauldrons)", icon: "Grid" },
  { id: "abs", label: "Core & Abs (Unbreakable Fortress)", icon: "Layers" },
  { id: "legs", label: "Legs (Swift Sprinter Stems)", icon: "Zap" },
  { id: "glutes", label: "Glutes & Hips (Titan Base)", icon: "Compass" },
  { id: "brain", label: "Brain (Sovereign Intellect)", icon: "Brain" },
];

export const ARCHETYPES = [
  { id: "nerd", label: "Nerd / Analyst", desc: "Calculates maximum efficiency, relies on tactical planning" },
  { id: "introverted", label: "Introverted Shadow", desc: "Gains power in silence, executes solo dungeon grinds" },
  { id: "extroverted", label: "Extroverted Guild Leader", desc: "Thrives in loud, collaborative training raids" },
];

export const EQUIPMENTS_LIST = [
  { id: "dumbbells", label: "Dumbbells" },
  { id: "barbell", label: "Barbell & Plates" },
  { id: "resistance_bands", label: "Resistance Bands" },
  { id: "gym_access", label: "Commercial Gym Access" },
  { id: "kettlebells", label: "Kettlebells" },
  { id: "pullup_bar", label: "Pull-up Bar" },
];

export const SHADOWS_LIST: ShadowSoldier[] = [
  {
    id: "infantry",
    name: "Shadow Infantry",
    tier: "Regular",
    power: 120,
    unlocked: true,
    cost: 5,
    count: 3,
    iconName: "ShieldAlert",
    description: "Reborn foot soldiers holding heavy obsidian tower shields."
  },
  {
    id: "beast",
    name: "Shadow Beast",
    tier: "Regular",
    power: 280,
    unlocked: false,
    cost: 15,
    count: 0,
    iconName: "FlameKindling",
    description: "Fierce alpha wolves extracted from the Ice Gates."
  },
  {
    id: "igris",
    name: "Elite Commander Igris",
    tier: "Elite",
    power: 2450,
    unlocked: false,
    cost: 100,
    count: 0,
    iconName: "Sword",
    description: "The Blood-Red Commander. Wields the Greatsword with absolute loyalty."
  },
  {
    id: "iron",
    name: "Tanker Iron",
    tier: "Elite",
    power: 1800,
    unlocked: false,
    cost: 80,
    count: 0,
    iconName: "Hammer",
    description: "A gigantic high-orc shieldmaster. Known for crushing shield bashes."
  },
  {
    id: "tank",
    name: "Ice Bear Tank",
    tier: "Elite",
    power: 2100,
    unlocked: false,
    cost: 95,
    count: 0,
    iconName: "Compass",
    description: "Massive ice-bear lead tank. Capable of shattering brick structures."
  },
  {
    id: "beru",
    name: "Shadow Marshal Beru",
    tier: "Named Commander",
    power: 18500,
    unlocked: false,
    cost: 500,
    count: 0,
    iconName: "Bug",
    description: "The Insatiate Ant King. Unleashes high-speed lightning strikes and healing chants."
  },
  {
    id: "bellion",
    name: "Grand Marshal Bellion",
    tier: "Named Commander",
    power: 29000,
    unlocked: false,
    cost: 1200,
    count: 0,
    iconName: "Crown",
    description: "The original commander of the Shadow Legion. Wields a giant snake whip sword."
  },
  {
    id: "ultimate_legion",
    name: "Sovereign Ultimate Legion",
    tier: "Ultimate Legion",
    power: 150000,
    unlocked: false,
    cost: 5000,
    count: 0,
    iconName: "Workflow",
    description: "An endless army of millions of shadows standing ready in absolute darkness."
  }
];

export const WEAPONS_DATABASE: InventoryItem[] = [
  {
    id: "rusty_dagger",
    name: "Rusty Goblin Dagger",
    description: "A brittle weapon retrieved from an E-rank dungeon. Barely holds an edge.",
    type: "Weapon",
    rarity: ItemRarity.E,
    statBonus: { strength: 2, agility: 1 },
    equipped: true,
    iconName: "Wrench",
    weaponDetails: {
      lore: "A crude dagger fashioned from scrap iron found within the depths of a low-grade E-rank gate. Traces of goblin civilization remain in the poorly tied leather hilt constraint.",
      passiveAbility: "Tetanus Strike (1% chance to inflict slight poison)",
      criticalChance: "5%",
      scalingModifier: "STR C",
      speed: "Fast (7 hits/sec)",
      durability: "35/100 (Chipped)",
      origin: "E-Rank Goblin Caverns",
      history: ["Looted by a novice hunter from a slain goblin scout.", "Discarded in the association market before being picked up again."],
      elements: ["Physical"],
      weight: "1.2 kg"
    }
  },
  {
    id: "kasaka_fang",
    name: "Kasaka's Venom Dagger",
    description: "Crafted from the refined fangs of the Kasaka blue venom serpent. Induces paralysis.",
    type: "Weapon",
    rarity: ItemRarity.C,
    statBonus: { strength: 12, agility: 15 },
    equipped: false,
    iconName: "Dice5",
    weaponDetails: {
      lore: "A lethal blade carved from the severed fang of the Blue Venom Fang Kasaka, the boss of a hidden subway dungeon. It pulses with unresolved malice.",
      passiveAbility: "Kasaka's Venom (Paralyzes enemies on critical hit & saps 1% HP per second)",
      criticalChance: "25%",
      scalingModifier: "AGI B+",
      speed: "Very Fast (12 hits/sec)",
      durability: "800/800 (Pristine)",
      origin: "Hapjeong Station Instance Dungeon",
      history: ["Harvested after defeating the Blue Venom Fang Kasaka.", "First magic-imbued item used by the shadow monarch."],
      elements: ["Venom", "Physical"],
      weight: "0.8 kg"
    }
  },
  {
    id: "igris_sword",
    name: "Knight's Longsword (Igris Loot)",
    description: "The blood-red steel longsword wielded by Commander Igris. Emits fire sparks.",
    type: "Weapon",
    rarity: ItemRarity.B,
    statBonus: { strength: 35, vitality: 15 },
    equipped: false,
    iconName: "Sword",
    weaponDetails: {
      lore: "Once belonging to Blood-Red Commander Igris, this blade was forged in an unknown dimension to withstand the clash of immortals. Its edge never dulls and it crackles with silent red lightning.",
      passiveAbility: "Commander's Aura (Damage increases by 30% against targets with lower agility)",
      criticalChance: "15%",
      scalingModifier: "STR A",
      speed: "Moderate (4 hits/sec)",
      durability: "2400/2400 (Indestructible by mortal means)",
      origin: "Empty Throne Room, Job Change Dungeon",
      history: ["Wielded by Igris in the defensive trials of the Empty Throne.", "Claimed as spoils after an arduous near-death struggle."],
      elements: ["Lightning", "Physical"],
      weight: "15.0 kg"
    }
  },
  {
    id: "demon_dagger",
    name: "Blood-Red Demon Dagger",
    description: "Forged deep within the demon castle's high floor. High piercing speed.",
    type: "Weapon",
    rarity: ItemRarity.A,
    statBonus: { strength: 68, agility: 55, perception: 20 },
    equipped: false,
    iconName: "Zap",
    weaponDetails: {
      lore: "Crafted by the architects of the Demon Castle. The blade drinks the blood of those it slays, turning a deeper crimson as it accumulates souls.",
      passiveAbility: "Blood Harvest (Absorbs 5% of damage dealt as HP)",
      criticalChance: "40%",
      scalingModifier: "AGI S",
      speed: "Hyper Fast (25 hits/sec)",
      durability: "5000/5000",
      origin: "Demon Castle 70th Floor",
      history: ["Bought from the system shop using souls farmed in the Demon Castle.", "Bathed in the blood of high orcs and demon nobles."],
      elements: ["Demonic", "Blood"],
      weight: "0.6 kg"
    }
  },
  {
    id: "kamish_fang",
    name: "Kamish's Dragon Fang Dagger",
    description: "Humanity's ultimate weapon. Carved from the sharpest tooth of the dragon Kamish.",
    type: "Weapon",
    rarity: ItemRarity.S,
    statBonus: { strength: 180, agility: 140, perception: 70 },
    equipped: false,
    iconName: "Scissors",
    weaponDetails: {
      lore: "The pinnacle of human magic manipulation. Carved from the corpse of Kamish, the dragon who caused the first S-Rank Gate break. It is capable of transmitting mana with zero resistance.",
      passiveAbility: "Dragon's Greed (Mana cost for sword skills zeroed, ignores 80% of physical defense)",
      criticalChance: "60%",
      scalingModifier: "STR S+ / AGI S+",
      speed: "Light Speed (Mana Dependant)",
      durability: "Absolute",
      origin: "Remains of the Dragon Kamish",
      history: ["Commissioned by the USA Hunters Bureau.", "Stored for years as no hunter possessed enough mana to draw its true edge.", "Gifted to the Shadow Monarch."],
      elements: ["Dragon Fire", "Pure Mana"],
      weight: "2.1 kg"
    }
  },
  {
    id: "sovereigns_wrath",
    name: "Sovereign's Wrath (Dual Ethereal Blades)",
    description: "Dual ethereal purple-black cosmic blades made of pure Shadow Void energy.",
    type: "Weapon",
    rarity: ItemRarity.Sovereign,
    statBonus: { strength: 450, agility: 420, vitality: 200, intelligence: 200, perception: 200 },
    equipped: false,
    iconName: "Sparkles",
    weaponDetails: {
      lore: "Weapons forged strictly from the domain of the dead. These twin blades exist perfectly balanced between existence and non-existence, allowing the wearer to cut through space and concepts alike.",
      passiveAbility: "Monarch's Domain (All stats +100%. Reality rending slashes bypass all immunities. Shadow soldiers replicate wielders path.)",
      criticalChance: "100%",
      scalingModifier: "ALL STATS EX",
      speed: "Transcendent",
      durability: "Infinite",
      origin: "The Realm of Rest",
      history: ["Forged from the fragment of the Absolute Being.", "A true weapon fit for the King of the Dead."],
      elements: ["Shadow", "Void", "Ethereal"],
      weight: "Weightless"
    }
  }
];

export const SKILLS_LIST: SkillNode[] = [
  {
    id: "rulers_authority",
    name: "Ruler's Authority",
    description: "Psychokinetic reach allowing user to pull or push objects wirelessly.",
    levelRequired: 5,
    cost: 5,
    unlocked: false,
    category: "Combat",
    effect: "+15% Telekinetic Attack and Defense stats"
  },
  {
    id: "shadow_storage",
    name: "Shadow Storage",
    description: "Summons a weightless void space inside shadows to store your dynamic items.",
    levelRequired: 12,
    cost: 10,
    unlocked: false,
    category: "Passive",
    effect: "Unlocks heavy armor load suppression, and adds 20 inventory capacity"
  },
  {
    id: "shadow_extraction",
    name: "Shadow Extraction (Arise)",
    description: "Extract absolute shadow spirits from newly slain gate monsters using 'Arise!' Phrase.",
    levelRequired: 20,
    cost: 25,
    unlocked: false,
    category: "Shadow",
    effect: "+25% Extract accuracy and enables Elite summons"
  },
  {
    id: "monarchs_domain",
    name: "Monarch's Domain",
    description: "Covers the entire battlefield ground with deep indigo void shadow fog.",
    levelRequired: 40,
    cost: 40,
    unlocked: false,
    category: "Shadow",
    effect: "Boosts all recruited shadow soldier damage by +50% in dungeons"
  },
  {
    id: "dragon_fear",
    name: "Dragon Fear",
    description: "Unleashes a blood-curdling cosmic dragon roar that paralyzes weak opponents.",
    levelRequired: 60,
    cost: 50,
    unlocked: false,
    category: "Combat",
    effect: "Freezes dungeon minor enemies for first 3 moves instantly"
  },
  {
    id: "void_manipulation",
    name: "Void Portal Teleportation",
    description: "Instantly slip into user shadows and step out from any shadow soldier across the globe.",
    levelRequired: 80,
    cost: 60,
    unlocked: false,
    category: "Passive",
    effect: "Bypasses dungeon escape constraints and halves incoming energy damage"
  }
];

export const DUNGEONS_CATALOG = [
  {
    id: "dung_e",
    name: "Double Dungeon Ruins",
    rank: "E-Rank",
    minLevel: 1,
    bossName: "Statue of God",
    difficulty: "E-Rank Survival Test",
    expReward: 120,
    goldReward: 2, // Adjusted from 5 to 2 MP
    lootItem: {
      id: "kasaka_fang",
      name: "Kasaka's Venom Dagger",
      chance: 0.45
    },
    enemyHealth: 150,
    enemyAttack: 12,
    desc: "The fated underground sanctuary where it all started. Run or obey the rules of the temple."
  },
  {
    id: "dung_d",
    name: "Sunken Temple Swamp Gate",
    rank: "D-Rank",
    minLevel: 11,
    bossName: "Kasaka Blue Serpent",
    difficulty: "D-Rank Combat Gate",
    expReward: 480,
    goldReward: 5, // Adjusted from 12 to 5 MP
    lootItem: {
      id: "kasaka_fang",
      name: "Kasaka's Venom Dagger",
      chance: 0.90
    },
    enemyHealth: 400,
    enemyAttack: 28,
    desc: "A waterlogged limestone crypt filled with toxic crawler snakes of ancient origin."
  },
  {
    id: "dung_c",
    name: "Elven Fortress Red Gate",
    rank: "C-Rank",
    minLevel: 21,
    bossName: "Baruka Ice Elf Commander",
    difficulty: "C-Rank Intense Dungeon",
    expReward: 1500,
    goldReward: 10, // Adjusted from 20 to 10 MP
    lootItem: {
      id: "igris_sword",
      name: "Knight's Longsword (Igris Loot)",
      chance: 0.50
    },
    enemyHealth: 1200,
    enemyAttack: 65,
    desc: "An isolated snowscape locked behind a dimensional rip. Ice-hyenas and frost-elves roam."
  },
  {
    id: "dung_b",
    name: "High Orc Keep Gate",
    rank: "B-Rank",
    minLevel: 36,
    bossName: "Kargalgan Shaman King",
    difficulty: "B-Rank Team Raid",
    expReward: 4500,
    goldReward: 20, // Adjusted from 32 to 20 MP
    lootItem: {
      id: "demon_dagger",
      name: "Blood-Red Demon Dagger",
      chance: 0.40
    },
    enemyHealth: 3500,
    enemyAttack: 140,
    desc: "A massive solidstone fortress occupied by armored high-orcs casting heavy magic barrier shields."
  },
  {
    id: "dung_a",
    name: "Demon Castle Pinnacle",
    rank: "A-Rank",
    minLevel: 51,
    bossName: "Baran Demon King",
    difficulty: "A-Rank Demonic Crusade",
    expReward: 12000,
    goldReward: 35, // Adjusted from 50 to 35 MP
    lootItem: {
      id: "demon_dagger",
      name: "Blood-Red Demon Dagger",
      chance: 0.85
    },
    enemyHealth: 8800,
    enemyAttack: 320,
    desc: "A burning tower that reaches high up into the pitch black lightning sky. Demonic creatures guard it."
  },
  {
    id: "dung_s",
    name: "Jeju Island Desolate Ant Nest",
    rank: "S-Rank",
    minLevel: 71,
    bossName: "Beast Mutated Ant King [Beru]",
    difficulty: "S-Rank Legendary Raid",
    expReward: 45000,
    goldReward: 60, // Adjusted from 100 to 60 MP
    lootItem: {
      id: "kamish_fang",
      name: "Kamish's Dragon Fang Dagger",
      chance: 0.35
    },
    enemyHealth: 24000,
    enemyAttack: 780,
    desc: "Humanity's biggest disaster. Swarming with millions of supersonic, bloodthirsty black ants."
  },
  {
    id: "dung_sovereign",
    name: "Monarch War Sandbox",
    rank: "Sovereign-Rank",
    minLevel: 90,
    bossName: "Antares Sovereign of Destruction",
    difficulty: "Godhood Cosmic Duel",
    expReward: 200000,
    goldReward: 150, // Adjusted from 250 to 150 MP (keeps prestigious balance with global economy)
    lootItem: {
      id: "sovereigns_wrath",
      name: "Sovereign's Wrath (Ethereal Dual Blades)",
      chance: 0.60
    },
    enemyHealth: 95000,
    enemyAttack: 2500,
    desc: "Fight against the supreme cosmic monarchs who intend to grind the human world to absolute space dust."
  }
];

export interface CustomPlan {
  calorieGoal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  waterLiters: number;
  workoutTimeMin: number;
  restTimeMin: number;
  weeklyGoalDesc: string;
  meals: { name: string; grams: number; favicon: string; type: string }[];
}

export function generatePlan(goal: string, weightKg: number): CustomPlan {
  let cal = 2000;
  let p = 140;
  let c = 200;
  let f = 60;
  let water = 3.0;
  let workoutT = 45;
  let restT = 60;
  let meals: { name: string; grams: number; favicon: string; type: string }[] = [];
  let weekly = "3 sessions of targeted muscle hyper-trophy";

  if (goal === "build_muscle") {
    cal = Math.round(weightKg * 33 + 400);
    p = Math.round(weightKg * 2.2);
    f = Math.round((cal * 0.25) / 9);
    c = Math.round((cal - (p * 4 + f * 9)) / 4);
    water = 4.0;
    workoutT = 60;
    restT = 90;
    weekly = "4 high-intensity strength & hyper-trophy dungeon sessions";
    meals = [
      { name: "Sirloin Beef & Brown Rice Bowl", grams: 350, favicon: "🥩", type: "Lunch" },
      { name: "Grilled Chicken Breast & Sweet Potato", grams: 400, favicon: "🍗", type: "Post-workout" },
      { name: "Double Egg White Oatmeal & Raw Honey", grams: 250, favicon: "🥣", type: "Breakfast" },
      { name: "Avocado & Low-fat Greek Yogurt Shake", grams: 300, favicon: "🥛", type: "Pre-sleep" },
    ];
  } else if (goal === "loose_weight") {
    cal = Math.round(weightKg * 24 - 300);
    p = Math.round(weightKg * 2.0);
    f = Math.round((cal * 0.22) / 9);
    c = Math.round((cal - (p * 4 + f * 9)) / 4);
    water = 3.5;
    workoutT = 45;
    restT = 45;
    weekly = "5 high-tempo calorie shred, circuit-grind shadow runs";
    meals = [
      { name: "Baked Salmon Fillet & Steamed Asparagus", grams: 280, favicon: "🐟", type: "Dinner" },
      { name: "Tender Turkey breast Scramble with Spinach", grams: 200, favicon: "🍳", type: "Breakfast" },
      { name: "Mixed Organic Green Salad with Olive Oil", grams: 180, favicon: "🥗", type: "Lunch" },
      { name: "Antarctic Shaved Protein Flakes with Berries", grams: 150, favicon: "🍓", type: "Snack" },
    ];
  } else if (goal === "look_better") {
    cal = Math.round(weightKg * 28);
    p = Math.round(weightKg * 1.8);
    f = Math.round((cal * 0.25) / 9);
    c = Math.round((cal - (p * 4 + f * 9)) / 4);
    water = 3.2;
    workoutT = 50;
    restT = 60;
    weekly = "3 visual definition and facial/postural symmetry sessions";
    meals = [
      { name: "Atlantic Cod & Lemon Quinoa Plate", grams: 300, favicon: "🐟", type: "Lunch" },
      { name: "Fluffy Egg White Omelet with Roma Tomatoes", grams: 220, favicon: "🍳", type: "Breakfast" },
      { name: "Tender Sirloin Steak with Broccoli Heads", grams: 250, favicon: "🥩", type: "Dinner" },
      { name: "Low-sugar Almond Chia Pudding cup", grams: 120, favicon: "🍮", type: "Snack" },
    ];
  } else {
    // stay in shape
    cal = Math.round(weightKg * 28);
    p = Math.round(weightKg * 1.6);
    f = Math.round((cal * 0.28) / 9);
    c = Math.round((cal - (p * 4 + f * 9)) / 4);
    water = 3.0;
    workoutT = 40;
    restT = 60;
    weekly = "3 full body endurance conditioning runs";
    meals = [
      { name: "Classic Chicken Breast Strip & Veggie Stir-fry", grams: 320, favicon: "🥗", type: "Dinner" },
      { name: "Low-fat Greek Yogurt cup with Raw Granola", grams: 180, favicon: "🥣", type: "Breakfast" },
      { name: "Mixed Canned Tuna Toast with Avocado Mash", grams: 200, favicon: "🥑", type: "Lunch" },
    ];
  }

  // Cap minimums to keep numbers reasonable
  if (p < 50) p = 80;
  if (c < 50) c = 100;
  if (f < 20) f = 40;
  if (cal < 1000) cal = 1500;

  return {
    calorieGoal: cal,
    proteinG: p,
    carbsG: c,
    fatsG: f,
    waterLiters: water,
    workoutTimeMin: workoutT,
    restTimeMin: restT,
    weeklyGoalDesc: weekly,
    meals
  };
}
