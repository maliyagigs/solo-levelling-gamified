/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Dumbbell, 
  Sword, 
  Sparkles, 
  Shield, 
  Heart, 
  Zap, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle, 
  Activity, 
  Compass, 
  LogOut, 
  Play, 
  Crosshair, 
  Lock, 
  User, 
  HelpCircle, 
  Skull,
  Flame,
  Award,
  Crown
} from "lucide-react";
import { OnboardingData, GameState, InventoryItem, ShadowSoldier, SkillNode, Quest, ItemRarity } from "../types";
import { SHADOWS_LIST, WEAPONS_DATABASE, SKILLS_LIST, DUNGEONS_CATALOG } from "../data";
import { 
  playSelectSound, 
  playDaggerSwipe, 
  playLevelUpSound, 
  playAriseSound, 
  playLootSound, 
  playHurtSound 
} from "../utils/audio";

interface RpgGameProps {
  playerName: string;
  onboardProfile: OnboardingData;
  onLogout: () => void;
}

export default function RpgGame({ playerName, onboardProfile, onLogout }: RpgGameProps) {
  const [activeTab, setActiveTab] = useState<"status" | "quests" | "dungeons" | "shadows" | "skills" | "backpack">("status");
  
  // Game States
  const [gameState, setGameState] = useState<GameState>(() => {
    // Attempt local storage load
    const key = `monarch_save_${playerName}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure starting user has zero gold if save in bad state or enforce started users
        return parsed;
      } catch (e) {
        // Fallback
      }
    }

    // Default starting state (No gold, base stats at 5, only rusty dagger, self development focus)
    return {
      level: 1,
      exp: 0,
      maxExp: 150,
      gold: 0, // Starts at zero as requested
      statPoints: 5, // Exactly 5 starting points to allocate as requested
      baseStats: {
        strength: 5,
        agility: 5,
        vitality: 5,
        intelligence: 5,
        perception: 5
      },
      job: "Fledgling Player",
      rank: "E-Rank",
      inventory: [{ ...WEAPONS_DATABASE[0], equipped: true }], // Only start with rusty dagger
      shadows: [...SHADOWS_LIST],
      skills: [...SKILLS_LIST],
      quests: [
        { id: "quest_physical", name: "Sovereign Physical Grind", description: "Complete physical training checks (e.g. 40 push-ups, squats, or planks)", target: 40, current: 0, rewardExp: 40, rewardGold: 100, completed: false, type: "Daily" },
        { id: "quest_intellect", name: "Sovereign Intellect Gate", description: "Study complex skills, write code, or read 15 pages of literature", target: 15, current: 0, rewardExp: 60, rewardGold: 150, completed: false, type: "Daily" },
        { id: "quest_serenity", name: "Abyssal Meditation & Breath", description: "Complete 15 minutes of uninterrupted mindful breathing/restoring", target: 15, current: 0, rewardExp: 50, rewardGold: 120, completed: false, type: "Daily" },
        { id: "quest_hydration", name: "Hydration & Vitality Calibration", description: "Consume 3 liters of water & log 7+ hours of deep, structured sleep", target: 3, current: 0, rewardExp: 30, rewardGold: 80, completed: false, type: "Daily" }
      ],
      storyStep: 1
    };
  });

  // Combat Simulation States
  const [selectedDungeon, setSelectedDungeon] = useState<any>(null);
  const [isFighting, setIsFighting] = useState<boolean>(false);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [playerMaxHp, setPlayerMaxHp] = useState<number>(100);
  const [enemyHp, setEnemyHp] = useState<number>(100);
  const [enemyMaxHp, setEnemyMaxHp] = useState<number>(100);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [battleOutcome, setBattleOutcome] = useState<"victory" | "defeat" | null>(null);
  const [earnedLoot, setEarnedLoot] = useState<any>(null);

  const battleLogEndRef = useRef<HTMLDivElement>(null);

  // Dynamic Custom UI State hooks
  const [levelUpOverlay, setLevelUpOverlay] = useState<{ prevLevel: number; newLevel: number; statPointsEarned: number } | null>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState<boolean>(false);
  const [selectedWeaponDetails, setSelectedWeaponDetails] = useState<any>(null);
  const [isDailyAllocationClaimed, setIsDailyAllocationClaimed] = useState<boolean>(() => {
    return localStorage.getItem(`monarch_daily_claim_${playerName}`) === new Date().toDateString();
  });
  const [shadowSpellEffect, setShadowSpellEffect] = useState<string | null>(null);
  const [systemToast, setSystemToast] = useState<string | null>(null);

  const triggerSystemToast = (msg: string) => {
    setSystemToast(msg);
    setTimeout(() => {
      setSystemToast(prev => prev === msg ? null : prev);
    }, 4500);
  };

  // Auto-save whenever gameState changes
  useEffect(() => {
    localStorage.setItem(`monarch_save_${playerName}`, JSON.stringify(gameState));
  }, [gameState, playerName]);

  // Adjust rank and job based on Level
  useEffect(() => {
    let rank = "E-Rank";
    const lv = gameState.level;
    if (lv >= 86) rank = "National Level";
    else if (lv >= 66) rank = "S-Rank";
    else if (lv >= 51) rank = "A-Rank";
    else if (lv >= 36) rank = "B-Rank";
    else if (lv >= 21) rank = "C-Rank";
    else if (lv >= 11) rank = "D-Rank";

    let job = "Necromancer";
    if (lv >= 70) {
      job = "Shadow Monarch";
    }

    if (gameState.rank !== rank || gameState.job !== job) {
      setGameState(prev => ({
        ...prev,
        rank,
        job
      }));
    }
  }, [gameState.level]);

  // Scroll to bottom of combat log
  useEffect(() => {
    if (battleLogs.length > 0) {
      battleLogEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [battleLogs]);

  // Player Visual Tier Calculation
  const getVisualTier = (lv: number) => {
    if (lv <= 14) {
      return {
        title: "Battered Survivor",
        colorClass: "from-slate-700/75 via-zinc-800/75 to-stone-900/75 border-zinc-700 backdrop-blur-md",
        auraStyle: "opacity-20 hover:opacity-30",
        effectText: "Fragile battle bandages & dimmed grey outline active.",
        desc: "Exhibits wounds and a shattered posture from survival in the hidden Temple.",
        eyes: "opacity-10 text-slate-500",
        graphics: "border-slate-800 bg-slate-950/40"
      };
    }
    if (lv <= 29) {
      return {
        title: "Trail Challenger",
        colorClass: "from-blue-950/75 via-slate-900/75 to-slate-950/75 border-blue-500/40 backdrop-blur-md",
        auraStyle: "opacity-45 shadow-[shadow-blue-500/10_inset]",
        effectText: "Wounds fully healed. Glowing neon blue-tinted eyes.",
        desc: "Your energy circuit connects. Sleek physical posture and aura forms.",
        eyes: "opacity-100 text-cyan-400 animate-pulse",
        graphics: "border-blue-500/20 bg-blue-950/20"
      };
    }
    if (lv <= 47) {
      return {
        title: "Gatecrusher Specialist",
        colorClass: "from-cyan-950/75 via-slate-900/75 to-indigo-950/75 border-cyan-400/40 backdrop-blur-md",
        auraStyle: "opacity-60 shadow-[0_0_20px_rgba(34,211,238,0.15)]",
        effectText: "Radiant deep cyan wings manifested. Pulsing circular energy rings.",
        desc: "Dimensional gravity bends around you. Capable of solo-clearing mid gates.",
        eyes: "opacity-100 text-cyan-300 animate-ping",
        graphics: "border-cyan-500/40 bg-cyan-950/30"
      };
    }
    if (lv <= 69) {
      return {
        title: "Shadow Overlord",
        colorClass: "from-indigo-950/75 via-slate-950/75 to-indigo-900/75 border-indigo-400 backdrop-blur-md",
        auraStyle: "opacity-80 shadow-[0_0_30px_rgba(129,140,248,0.25)]",
        effectText: "Rich indigo shadow vapors. Horizontal crawl static discharges.",
        desc: "The darkness list obeys. Lightning sparks surge through carbon tissue armor plates.",
        eyes: "opacity-100 text-indigo-400",
        graphics: "border-indigo-400 bg-indigo-950/30"
      };
    }
    if (lv <= 89) {
      return {
        title: "Abyssal General",
        colorClass: "from-violet-950/75 via-cyan-950/75 to-blue-950/75 border-cyan-400 backdrop-blur-md",
        auraStyle: "opacity-95 shadow-[0_0_40px_rgba(34,211,238,0.4)]",
        effectText: "High-velocity cyan lightning mesh. Dark void power shockwaves.",
        desc: "Pure shadow force bends gravity inside dungeons. Absolute command.",
        eyes: "opacity-100 text-cyan-300",
        graphics: "border-cyan-450 bg-cyan-950/40"
      };
    }
    return {
      title: "Sovereign Monarch",
      colorClass: "from-yellow-950/70 via-purple-950/70 to-slate-950/75 border-yellow-500/85 backdrop-blur-md shadow-lg shadow-yellow-500/10",
      auraStyle: "opacity-100 shadow-[0_0_50px_rgba(234,179,8,0.5)]",
      effectText: "Ethereal floating gold crown with violet amethysts. Infinite auras.",
      desc: "Cosmic level presence. Command legions in the hundreds of millions.",
      eyes: "opacity-100 text-purple-400",
      graphics: "border-yellow-500 bg-purple-950/20"
    };
  };

  const currentTier = getVisualTier(gameState.level);

  const neonStyle = (() => {
    const lv = gameState.level;
    if (lv <= 14) return { border: "rgba(234, 179, 8, 1)", glow: "rgba(234, 179, 8, 0.4)", text: "from-yellow-400 to-amber-500", label: "YELLOW NEON SIGNAL" };
    if (lv <= 29) return { border: "rgba(249, 115, 22, 1)", glow: "rgba(249, 115, 22, 0.45)", text: "from-orange-400 to-orange-600", label: "ORANGE FLUX" };
    if (lv <= 47) return { border: "rgba(6, 182, 212, 1)", glow: "rgba(6, 182, 212, 0.5)", text: "from-cyan-400 to-blue-600", label: "ICE CYAN RESONANCE" };
    if (lv <= 69) return { border: "rgba(99, 102, 241, 1)", glow: "rgba(99, 102, 241, 0.55)", text: "from-blue-400 to-indigo-600", label: "INDIGO PULSAR" };
    if (lv <= 89) return { border: "rgba(139, 92, 246, 1)", glow: "rgba(139, 92, 246, 0.6)", text: "from-indigo-400 to-violet-600", label: "VIOLET ECLIPSE" };
    return { border: "rgba(236, 72, 153, 1)", glow: "rgba(236, 72, 153, 0.7)", text: "from-purple-400 via-fuchsia-500 to-cyan-500", label: "SOVEREIGN SINGULARITY" };
  })();

  // Power Scaling calculation
  const getPowerScaling = (lv: number) => {
    if (lv <= 20) return { label: "Building Level", desc: "Can shatter small concrete structure pillars." };
    if (lv <= 50) return { label: "City Level", desc: "Can level multi-block layouts with aura output." };
    if (lv <= 75) return { label: "Country Level", desc: "A walking natural disaster. Holds national military level force." };
    if (lv <= 90) return { label: "Continent Level", desc: "Can flatten tectonic boundaries with gravity spells." };
    if (lv <= 95) return { label: "Planetary Level", desc: "Directly capable of cracking orbital matrices." };
    return { label: "Higher Dimensional / Cosmic Level", desc: "Transcends time-space limitations completely." };
  };

  const powerScaling = getPowerScaling(gameState.level);

  // Exp progression with dynamic high impact Level Up cinematic triggers
  const addExp = (amt: number) => {
    let leveledUp = false;
    let oldLevel = 1;
    let finalNewLevel = 1;

    setGameState(prev => {
      oldLevel = prev.level;
      let newExp = prev.exp + amt;
      let newLevel = prev.level;
      let max = prev.maxExp;
      let statPoints = prev.statPoints;

      while (newExp >= max) {
        newExp -= max;
        newLevel += 1;
        statPoints += 5; // Exactly 5 more stat points to allocate per level as requested
        max = newLevel * 105 + 80;
        leveledUp = true;
      }
      finalNewLevel = newLevel;

      if (leveledUp) {
        setTimeout(() => {
          playLevelUpSound();
          setLevelUpOverlay({
            prevLevel: oldLevel,
            newLevel: finalNewLevel,
            statPointsEarned: (finalNewLevel - oldLevel) * 5
          });
        }, 120);
      }

      return {
        ...prev,
        level: newLevel,
        exp: newExp,
        maxExp: Math.round(max),
        statPoints
      };
    });
  };

  // Quests Interaction
  const incrementQuest = (questId: string, amount: number) => {
    playSelectSound();
    setGameState(prev => {
      const idx = prev.quests.findIndex(q => q.id === questId);
      if (idx === -1) return prev;
      
      const list = [...prev.quests];
      const q = { ...list[idx] };
      
      q.current = Math.min(q.target, q.current + amount);
      if (q.current >= q.target) {
        q.completed = true;
      }
      
      list[idx] = q;
      return { ...prev, quests: list };
    });
  };

  const claimQuestReward = (quest: any) => {
    if (!quest.completed || quest.claimed) return;
    playLootSound();
    
    // Add reward
    addExp(quest.rewardExp);
    setGameState(prev => {
      const list = prev.quests.map((q: any) => {
        if (q.id === quest.id) {
          return { ...q, claimed: true }; 
        }
        return q;
      });
      return {
        ...prev,
        gold: prev.gold + quest.rewardGold,
        quests: list
      };
    });
  };

  // Main Daily System Allocation Bounty (500 CG and 200 XP)
  const claimDailyAllocation = () => {
    const allCompleted = gameState.quests.every((q: any) => q.current >= q.target);
    if (!allCompleted || isDailyAllocationClaimed) return;

    playLootSound();
    setIsDailyAllocationClaimed(true);
    localStorage.setItem(`monarch_daily_claim_${playerName}`, new Date().toDateString());

    addExp(200);
    setGameState(prev => ({
      ...prev,
      gold: prev.gold + 500
    }));
  };

  // Force system reset for next daily challenge sequence
  const resetDailyMatrix = () => {
    playSelectSound();
    setIsDailyAllocationClaimed(false);
    localStorage.removeItem(`monarch_daily_claim_${playerName}`);
    setGameState(prev => {
      const refreshedQuests = prev.quests.map((q: any) => ({
        ...q,
        current: 0,
        completed: false,
        claimed: false
      }));
      return {
        ...prev,
        quests: refreshedQuests
      };
    });
  };

  // Spent stat points
  const upgradeStat = (statName: "strength" | "agility" | "vitality" | "intelligence" | "perception") => {
    if (gameState.statPoints <= 0) return;
    playSelectSound();
    setGameState(prev => ({
      ...prev,
      statPoints: prev.statPoints - 1,
      baseStats: {
        ...prev.baseStats,
        [statName]: prev.baseStats[statName] + 1
      }
    }));
  };

  // Skill purchase / activation
  const buySkill = (skillId: string) => {
    const sIdx = gameState.skills.findIndex(sk => sk.id === skillId);
    if (sIdx === -1) return;
    const skill = gameState.skills[sIdx];
    
    if (gameState.gold < skill.cost || gameState.level < skill.levelRequired) {
      return; // constraints not met
    }

    playAriseSound();
    setGameState(prev => {
      const updatedS = prev.skills.map(s => {
        if (s.id === skillId) return { ...s, unlocked: true };
        return s;
      });
      return {
        ...prev,
        gold: prev.gold - skill.cost,
        skills: updatedS
      };
    });
  };

  // System weapon store parameters with costs and level gateways
  const WEAPON_SHOP_DETAILS: Record<string, { cost: number, levelReq: number }> = {
    rusty_dagger: { cost: 0, levelReq: 1 },
    kasaka_fang: { cost: 1500, levelReq: 10 },
    igris_sword: { cost: 4800, levelReq: 25 },
    demon_dagger: { cost: 12000, levelReq: 50 },
    kamish_fang: { cost: 35000, levelReq: 75 },
    sovereigns_wrath: { cost: 80000, levelReq: 90 },
  };

  // High quality vector contour neon renderings for weapon previews
  const renderNeonWeaponPreview = (itemId: string, animate = false) => {
    let paths = "";
    let glowColor = "rgb(34, 211, 238)"; // cyan neon
    
    switch (itemId) {
      case "rusty_dagger":
        // Jagged primitive outline glowing warm yellow
        paths = "M 15,65 L 40,40 L 45,35 L 43,28 L 52,18 L 58,24 L 48,34 L 68,14 L 72,18 L 52,38 L 56,44 L 46,48 Z";
        glowColor = "rgb(234, 179, 8)";
        break;
      case "kasaka_fang":
        // Curved sleek venom fangs glowing cyan
        paths = "M 15,65 L 26,54 M 26,54 S 32,41 36,28 S 54,11 76,5 C 66,25 46,44 38,48 C 30,51 26,54 26,54";
        glowColor = "rgb(6, 182, 212)";
        break;
      case "igris_sword":
        // Straight double-sided royal steel glowing deep crimson
        paths = "M 15,65 L 28,52 M 22,48 L 32,58 M 28,52 L 72,8";
        glowColor = "rgb(244, 63, 94)";
        break;
      case "demon_dagger":
        // Brutalist spiked dual daggers glowing electric violet
        paths = "M 12,68 L 24,56 M 24,56 L 34,58 L 48,36 L 45,28 L 68,10 C 58,20 44,30 36,33 L 34,45 Z";
        glowColor = "rgb(99, 102, 241)";
        break;
      case "kamish_fang":
        // Spiked bone fragment curved dragon weapon glowing fuchsia
        paths = "M 12,68 L 24,56 M 24,56 C 29,51 28,36 36,24 C 44,12 70,4 76,2 C 66,14 54,24 44,31 C 34,38 24,56 24,56";
        glowColor = "rgb(168, 85, 247)";
        break;
      case "sovereigns_wrath":
        // Ethereal Monarch dual celestial sabers radiating pink astral aura
        paths = "M 5,65 L 18,52 L 50,20 L 55,25 L 22,58 Z M 25,75 L 38,62 L 70,30 L 75,35 L 42,68 Z";
        glowColor = "rgb(236, 72, 153)";
        break;
      default:
        paths = "M 15,65 L 65,15";
    }

    return (
      <svg 
        viewBox="0 0 80 80" 
        className={`w-16 h-16 pointer-events-none mx-auto opacity-90 transition-all duration-300 ${animate ? "animate-pulse" : ""}`}
      >
        <g stroke={glowColor} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0px 0px 5px " + glowColor + ")" }}>
          <path d={paths} />
        </g>
      </svg>
    );
  };

  // Weapon buy function
  const buyWeapon = (itemId: string) => {
    const shopMeta = WEAPON_SHOP_DETAILS[itemId];
    if (!shopMeta) return;

    if (gameState.level < shopMeta.levelReq || gameState.gold < shopMeta.cost) {
      return; 
    }

    const template = WEAPONS_DATABASE.find(w => w.id === itemId);
    if (!template) return;

    playSelectSound();
    setGameState(prev => {
      if (prev.inventory.some(i => i.id === itemId)) {
        return prev;
      }
      return {
        ...prev,
        gold: prev.gold - shopMeta.cost,
        inventory: [...prev.inventory, { ...template, equipped: false }]
      };
    });
  };

  // Equipment selection
  const equipWeapon = (itemId: string) => {
    playSelectSound();
    setGameState(prev => {
      const updatedInv = prev.inventory.map(item => {
        if (item.id === itemId) return { ...item, equipped: true };
        if (item.type === "Weapon") return { ...item, equipped: false };
        return item;
      });
      return { ...prev, inventory: updatedInv };
    });
  };

  const getEquippedWeapon = () => {
    return gameState.inventory.find(i => i.equipped && i.type === "Weapon") || null;
  };

  // Shadow extraction using gold
  const summonShadow = (shadowId: string) => {
    const shadow = gameState.shadows.find(s => s.id === shadowId);
    if (!shadow || gameState.gold < shadow.cost) return;

    playAriseSound();
    setGameState(prev => {
      const updatedShadows = prev.shadows.map(s => {
        if (s.id === shadowId) {
          return { ...s, unlocked: true, count: s.count + 1 };
        }
        return s;
      });
      return {
        ...prev,
        gold: prev.gold - shadow.cost,
        shadows: updatedShadows
      };
    });
  };

  // Dungeons & Combat Loops
  const startCombat = (dungeon: any) => {
    playSelectSound();
    if (gameState.level < dungeon.minLevel) {
      triggerSystemToast(`⚠️ SYSTEM RESTRICTION: Level ${dungeon.minLevel} required for this dimensional gate.`);
      return;
    }

    const equippedW = getEquippedWeapon();
    const weaponAtk = equippedW 
      ? (equippedW.statBonus.strength || 0) + (equippedW.statBonus.agility || 0) 
      : 0;

    const maxHp = gameState.baseStats.vitality * 12 + 100;
    setPlayerMaxHp(maxHp);
    setPlayerHp(maxHp);
    
    setEnemyMaxHp(dungeon.enemyHealth);
    setEnemyHp(dungeon.enemyHealth);
    
    setSelectedDungeon(dungeon);
    setIsFighting(true);
    setBattleOutcome(null);
    setEarnedLoot(null);
    setBattleLogs([
      `⚡ Gate rip detected: entering ${dungeon.name} [${dungeon.rank}]`,
      `👾 Boss identified: ${dungeon.bossName}. Prepare your weaponry.`
    ]);
  };

  const executeCombatTurn = (action: "strike" | "skill" | "shadows") => {
    if (enemyHp <= 0 || playerHp <= 0 || battleOutcome) return;

    const equippedW = getEquippedWeapon();
    const weaponAtk = equippedW 
      ? (equippedW.statBonus.strength || 0) + (equippedW.statBonus.agility || 0) 
      : 0;

    // A. Player Attack
    let playerDmg = Math.round(gameState.baseStats.strength * 2.2 + weaponAtk + Math.random() * 8);
    let logsToAdd: string[] = [];

    if (action === "strike") {
      playDaggerSwipe();
      logsToAdd.push(`⚔️ You swing ${equippedW?.name || "fists"} dealing ${playerDmg} attack damage.`);
    } else if (action === "skill") {
      const activeS = gameState.skills.filter(s => s.unlocked);
      if (activeS.length === 0) {
        logsToAdd.push(`⚠️ No active combat spells found in your matrix! Forced basic strike.`);
        playDaggerSwipe();
      } else {
        const randS = activeS[Math.floor(Math.random() * activeS.length)];
        playerDmg = Math.round(playerDmg * 1.8);
        playAriseSound();
        logsToAdd.push(`🔮 You cast [${randS.name}]! Spell effect activates. Wrecks ${playerDmg} core damage.`);
      }
    } else {
      // Shadows Charge
      const unlockedShadows = gameState.shadows.filter(s => s.unlocked && s.count > 0);
      if (unlockedShadows.length === 0) {
        logsToAdd.push(`💀 You raised no active shadow soldiers yet! Basic strike forced.`);
        playDaggerSwipe();
      } else {
        let totalShadowAtk = 0;
        unlockedShadows.forEach(s => {
          totalShadowAtk += s.power * 0.1 * s.count;
        });
        playerDmg = Math.round(playerDmg + totalShadowAtk + 15);
        playAriseSound();
        logsToAdd.push(`🌑 "ARISE!" Your shadow legion strikes! Total army damage added: ${playerDmg}`);
      }
    }

    // Critical strike chance based on Perception
    const isCrit = Math.random() * 100 < gameState.baseStats.perception * 0.8;
    if (isCrit) {
      playerDmg = Math.round(playerDmg * 1.5);
      logsToAdd.push(`🌟 CRITICAL PIERCE SPARK! High pierce damage calculated.`);
    }

    const nextEnemyHp = Math.max(0, enemyHp - playerDmg);
    setEnemyHp(nextEnemyHp);

    if (nextEnemyHp <= 0) {
      // Victory condition
      logsToAdd.push(`🏆 VICTORY! Slayed ${selectedDungeon.bossName}.`);
      setBattleLogs(prev => [...prev, ...logsToAdd]);
      handleDungeonVictory();
      return;
    }

    // B. Enemy Counter retaliation
    // Dodge chance based on Agility
    const isDodged = Math.random() * 100 < gameState.baseStats.agility * 0.8;
    if (isDodged) {
      logsToAdd.push(`💨 You seamlessly slip through ${selectedDungeon.bossName}'s heavy swings.`);
    } else {
      playHurtSound();
      const enemyDmg = Math.round(selectedDungeon.enemyAttack + Math.random() * 10 - gameState.baseStats.vitality * 0.2);
      const nextPlayerHp = Math.max(0, playerHp - Math.max(1, enemyDmg));
      setPlayerHp(nextPlayerHp);

      logsToAdd.push(`💥 ${selectedDungeon.bossName} retaliates striking you for ${enemyDmg} kinetic damage.`);

      if (nextPlayerHp <= 0) {
        // Defeat condition
        logsToAdd.push(`💀 DEFEATED! The System has initiated auto-revival sequence.`);
        setBattleLogs(prev => [...prev, ...logsToAdd]);
        handleDungeonDefeat();
        return;
      }
    }

    setBattleLogs(prev => [...prev, ...logsToAdd]);
  };

  const handleDungeonVictory = () => {
    setBattleOutcome("victory");
    playLootSound();

    // Reward math
    const xp = selectedDungeon.expReward;
    const gold = selectedDungeon.goldReward;
    
    addExp(xp);
    
    // Rarity loot drop based on chance
    let lootDropped: InventoryItem | null = null;
    const isDrop = Math.random() < selectedDungeon.lootItem.chance;
    if (isDrop) {
      const weaponTemplate = WEAPONS_DATABASE.find(w => w.id === selectedDungeon.lootItem.id);
      if (weaponTemplate) {
        lootDropped = { ...weaponTemplate, equipped: false };
      }
    }

    setEarnedLoot({ xp, gold, weapon: lootDropped });

    setGameState(prev => {
      const inv = [...prev.inventory];
      if (lootDropped && !inv.some(item => item.id === lootDropped?.id)) {
        inv.push(lootDropped);
      }
      return {
        ...prev,
        gold: prev.gold + gold,
        inventory: inv
      };
    });
  };

  const handleDungeonDefeat = () => {
    setBattleOutcome("defeat");
    // Lose some penalty gold
    setGameState(prev => ({
      ...prev,
      gold: Math.max(0, prev.gold - Math.round(prev.gold * 0.1))
    }));
  };

  const leaveDungeon = () => {
    setIsFighting(false);
    setSelectedDungeon(null);
    setBattleOutcome(null);
    setEarnedLoot(null);
  };

  // Special Sovereign Unleash Code
  const summonSovereignsWrath = () => {
    if (gameState.level < 90) return;
    const exist = gameState.inventory.some(i => i.id === "sovereigns_wrath");
    if (exist) return;

    playAriseSound();
    setGameState(prev => {
      const wrath = WEAPONS_DATABASE.find(w => w.id === "sovereigns_wrath");
      if (!wrath) return prev;
      return {
        ...prev,
        inventory: [...prev.inventory, wrath]
      };
    });
    triggerSystemToast("🌌 COSMIC RESONANCE DETECTED! Ethereal twin-blades 'Sovereign's Wrath' integrated into Backpack Arsenal!");
  };

  return (
    <div id="rpg_game_container" className="min-h-screen bg-transparent text-white flex flex-col font-sans select-none relative overflow-y-auto">
      
      {/* Header Panel */}
      <header className="p-4 border-b border-slate-900/60 bg-slate-950/75 backdrop-blur-md sticky top-0 z-30 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div id="glow_brand_badge" className="p-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl">
            <Crown className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono tracking-widest block uppercase">WARRIOR REGISTRY</span>
            <div id="player_info_title" className="text-base font-extrabold text-cyan-400 font-mono">
              {playerName} &middot; <span className="text-white font-sans text-xs">{gameState.rank} {gameState.job}</span>
            </div>
          </div>
        </div>

        {/* Currency displays */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 mr-2 uppercase">GOLD:</span>
            <span className="text-yellow-400 font-bold">{gameState.gold} CG</span>
          </div>

          <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 mr-2 uppercase">LEVEL:</span>
            <span className="text-cyan-400 font-bold">{gameState.level}</span>
          </div>

          <button 
            id="btn_profile_trigger"
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-xl cursor-pointer transition-colors border border-slate-800 flex items-center gap-1.5 font-mono text-xs font-bold"
            onClick={() => setShowProfileDrawer(true)}
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">PROFILE</span>
          </button>
        </div>
      </header>

      {/* Main split dashboard area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CHARACTER ILLUSTRATOR TIER CARD (LEFT PANEL) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className={`rounded-3xl border p-6 relative overflow-hidden transition-all duration-700 bg-gradient-to-b ${currentTier.colorClass}`}>
            
            {/* Realtime aura ripple effect depending on tier level */}
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,rgba(0,0,0,0)_60%)] animate-pulse pointer-events-none ${currentTier.auraStyle}`} />
            
            <div className="flex justify-between items-start z-10 relative">
              <span className="text-[10px] bg-slate-950/60 font-mono font-bold text-slate-400 px-2.5 py-1 rounded-full uppercase">
                TIER EVOLUTION
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                RANK {gameState.rank.substring(0, 8)}
              </span>
            </div>

            {/* Animated High Impact Neon Color Level Based Animation */}
            <div className="my-8 flex justify-center relative">
              <div className={`w-40 h-40 rounded-full border border-slate-900/60 flex items-center justify-center relative overflow-visible transition-all duration-700 bg-slate-950/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]`}>
                
                {/* Embedded animated holographic elements */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Rotating portal circles behind */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/10 animate-spin" style={{ animationDuration: "35s" }} />
                  <div className="absolute inset-2 rounded-full border border-dotted border-purple-500/10 animate-spin" style={{ animationDuration: "12s" }} />

                  {/* Concentric Neon Rings & Waves Level Animation */}
                  <div className="absolute inset-0 flex items-center justify-center p-2 rounded-full overflow-hidden">
                    {/* Pulsing neon center aura */}
                    <div 
                      className="absolute w-24 h-24 rounded-full transition-all duration-500 opacity-25 filter blur-xl animate-pulse"
                      style={{ backgroundColor: neonStyle.border }}
                    />
                    
                    {/* Ring 1 - Outer slow neon circle */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                      className="absolute w-32 h-32 rounded-full border border-dashed transition-all duration-500 opacity-40" 
                      style={{ borderColor: neonStyle.border, boxShadow: `0 0 10px ${neonStyle.glow}` }}
                    />

                    {/* Ring 2 - Inner fast neon circle with a cut-out border style */}
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      className="absolute w-24 h-24 rounded-full border-2 border-dotted transition-all duration-500 opacity-70" 
                      style={{ borderColor: neonStyle.border, boxShadow: `inset 0 0 15px ${neonStyle.glow}, 0 0 15px ${neonStyle.glow}` }}
                    />

                    {/* Shockwave Active Pulse Rings expanding outward */}
                    {[...Array(3)].map((_, idx) => (
                      <motion.div
                        key={idx}
                        className="absolute rounded-full border transition-all duration-500"
                        style={{ borderColor: neonStyle.border }}
                        initial={{ scale: 0.6, opacity: 0.8 }}
                        animate={{ 
                          scale: [0.6, 1.5],
                          opacity: [0.8, 0],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2.5,
                          delay: idx * 0.8,
                          ease: "easeOut"
                        }}
                      />
                    ))}

                    {/* Orbiting Tech Coordinates (Neon points) */}
                    {[...Array(4)].map((_, idx) => {
                      const angle = (idx * Math.PI) / 2;
                      const radius = 48;
                      return (
                        <motion.div
                          key={`coord-${idx}`}
                          className="absolute w-1.5 h-1.5 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: neonStyle.border,
                            boxShadow: `0 0 10px ${neonStyle.glow}`,
                            x: radius * Math.cos(angle),
                            y: radius * Math.sin(angle),
                          }}
                          animate={{ 
                            scale: [0.8, 1.4, 0.8]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            delay: idx * 0.5
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Central Rank Badge Emblem in the middle of neon matrix */}
                  <div className="absolute z-10 flex flex-col items-center justify-center text-center select-none bg-slate-950/95 p-2 rounded-xl border transition-all duration-500 backdrop-blur-md shadow-2xl" style={{ borderColor: `${neonStyle.border}40`, boxShadow: `0 0 20px ${neonStyle.glow}` }}>
                    <Crown className="w-4 h-4 animate-pulse" style={{ color: neonStyle.border }} />
                  </div>
                </div>

              </div>

              {/* Glowing Eyes Accent layer */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-mono ${currentTier.eyes}`}>
                🔷 🔷
              </div>
            </div>


            {/* Titles removed as requested */}

          </div>

          {/* Level Exp Progress Section */}
          <div className="bg-slate-950/75 border border-slate-900 p-5 rounded-2xl backdrop-blur-md font-mono text-xs space-y-3">
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>PROGRESS TILL NEXT EVOLUTION</span>
              <span className="text-cyan-400 font-bold">{gameState.exp} / {gameState.maxExp} XP</span>
            </div>
            
            <div id="player_lvl_xp_meter" className="h-3 bg-slate-900 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-indigo-600 rounded-full"
                animate={{ width: `${(gameState.exp / gameState.maxExp) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-3">
              <span>POWERSCALING TIER:</span>
              <span className="text-yellow-400 font-bold uppercase">{powerScaling.label}</span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase leading-relaxed">{powerScaling.desc}</p>
          </div>

          {/* Story Campaigns Indicator */}
          <div className="bg-slate-950/75 border border-slate-900 p-5 rounded-2xl backdrop-blur-md font-mono text-xs space-y-3">
            <h4 className="text-[11px] uppercase font-bold text-slate-400">Campaign Story Milestones</h4>
            <div className="space-y-2 text-[11px]">
              
              <div className="flex justify-between items-center p-2.5 bg-slate-905 rounded-lg">
                <span className={gameState.level >= 1 ? "text-cyan-400" : "text-slate-600"}>1. Double Dungeon Survival</span>
                <span className="text-cyan-400 font-bold">COMPLETED</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-905 rounded-lg">
                <span className={gameState.level >= 25 ? "text-cyan-400" : "text-slate-600"}>2. Red Gate Siege [B-Rank Equivalent]</span>
                <span className={gameState.level >= 25 ? "text-cyan-400 font-bold" : "text-slate-600"}>
                  {gameState.level >= 25 ? "AWAKENED" : `Lv 25 Required`}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-905 rounded-lg">
                <span className={gameState.level >= 70 ? "text-cyan-400" : "text-slate-600"}>3. Shadow Monarch Awakening [Jeju Arc]</span>
                <span className={gameState.level >= 70 ? "text-cyan-400 font-bold" : "text-slate-600"}>
                  {gameState.level >= 70 ? "SOVEREIGN CLASS" : `Lv 70 Required`}
                </span>
              </div>

            </div>
          </div>

          {/* Special trigger bonus button at Level 90 */}
          {gameState.level >= 90 && !gameState.inventory.some(i => i.id === "sovereigns_wrath") && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 via-purple-600 to-indigo-600 rounded-xl text-xs font-mono font-black tracking-widest text-white uppercase animate-bounce cursor-pointer border border-yellow-400/20"
              onClick={summonSovereignsWrath}
            >
              🌌 Claim Ethereal "Sovereign's Wrath"
            </motion.button>
          )}

        </div>

        {/* TAB CONTROLLERS & DETAILED TAB CONTENT (RIGHT PANEL) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs header row */}
          <div className="flex flex-wrap gap-2 border-b border-slate-900 pb-3" id="tab_navigation">
            {[
              { id: "status", label: "Status" },
              { id: "quests", label: "Quests" },
              { id: "dungeons", label: "Gates" },
              { id: "shadows", label: "Shadows" },
              { id: "skills", label: "Skill-Tree" },
              { id: "backpack", label: "Backpack" }
            ].map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-2 rounded-xl text-xs font-mono uppercase cursor-pointer tracking-wider transition-colors font-bold ${
                  activeTab === tab.id 
                    ? "bg-slate-900 border border-slate-800 text-cyan-300" 
                    : "text-slate-500 bg-transparent hover:text-slate-300"
                }`}
                onClick={() => {
                  playSelectSound();
                  setActiveTab(tab.id as any);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Render Active Tab Screen details */}
          <div className="bg-slate-900/20 rounded-3xl min-h-[400px]">
            
            {/* A. STATUS TAB: Stat allocator and character profiles */}
            {activeTab === "status" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Character stats matrices</span>
                      <h3 className="font-extrabold text-lg">PHYSIQUE ALLOCATION INDEX</h3>
                    </div>
                    {gameState.statPoints > 0 && (
                      <motion.span 
                        animate={{ scale: [1, 1.1, 1] }} 
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="text-xs font-mono font-black text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20"
                      >
                         +{gameState.statPoints} Stat Points Unspent
                      </motion.span>
                    )}
                  </div>

                  {/* Character attributes spending tree */}
                  <div id="stat_adjust_lines" className="space-y-4 mt-6">
                    
                    {[
                      { key: "strength", label: "Strength (STR)", desc: "Amplifies physical strike force & weapon multipliers inside gates" },
                      { key: "agility", label: "Agility (AGI)", desc: "Accelerates evasion ratios, parries index, and dynamic dodge speed" },
                      { key: "vitality", label: "Vitality (VIT)", desc: "Extends physical health boundary points density and parried buffers" },
                      { key: "intelligence", label: "Intelligence (INT)", desc: "Triggers higher spell casts damage multipliers & skill accuracy" },
                      { key: "perception", label: "Perception (PER)", desc: "Spikes critical chance rates and legendary weapon drop indices" }
                    ].map(stat => {
                      const val = gameState.baseStats[stat.key as keyof typeof gameState.baseStats];
                      return (
                        <div key={stat.key} className="flex flex-wrap justify-between items-center p-3.5 bg-slate-900/35 border border-slate-900 rounded-xl gap-4">
                          <div className="flex-1 min-w-[200px]">
                            <div className="text-xs font-bold font-mono text-slate-300">{stat.label}</div>
                            <div className="text-[10px] text-slate-500 mt-1 leading-snug">{stat.desc}</div>
                          </div>
                          
                          <div className="flex items-center gap-4 font-mono">
                            <span id={`val_stat_${stat.key}`} className="text-xl font-bold font-mono text-cyan-300 w-12 text-right">{val}</span>
                            
                            <button
                              id={`btn_upgrade_${stat.key}`}
                              disabled={gameState.statPoints <= 0}
                              className="p-2 bg-slate-950/75 backdrop-blur-md border border-slate-800 rounded-lg hover:border-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-20 cursor-pointer text-xs font-bold"
                              onClick={() => upgradeStat(stat.key as any)}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/75 border border-slate-900 p-5 rounded-2xl backdrop-blur-md font-mono text-xs space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase">Fitted Equipment parameters</h4>
                    {getEquippedWeapon() ? (
                      <div className="p-3 bg-slate-900/40 rounded-xl outline-dashed outline-1 outline-cyan-500/10">
                        <div className="text-cyan-300 font-bold">{getEquippedWeapon()?.name}</div>
                        <div className="text-slate-500 text-[10px] mt-1">{getEquippedWeapon()?.description}</div>
                        {getEquippedWeapon()?.statBonus && (
                          <div className="text-[10px] text-indigo-400 font-bold mt-2">
                            +{getEquippedWeapon()?.statBonus.strength || 0} Strength &middot; +{getEquippedWeapon()?.statBonus.agility || 0} Agility
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 block">No weapon equipped. Fists active (+0 Attack).</span>
                    )}
                  </div>

                  <div className="bg-slate-950/75 border border-slate-900 p-5 rounded-2xl backdrop-blur-md font-mono text-xs space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase">Awakening Archetype Info</h4>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Gender Index:</span>
                        <span className="text-slate-300 uppercase font-black">{onboardProfile.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Motivation Path:</span>
                        <span className="text-slate-300 font-bold">{onboardProfile.motivation.replace("_", " ")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Workout Regime:</span>
                        <span className="text-cyan-400 font-bold">{onboardProfile.workoutFrequency} workouts / wk</span>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* B. QUESTS TAB: Gamified Workout checklists */}
            {activeTab === "quests" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Daily System Tasks</span>
                      <h3 className="font-extrabold text-lg">DAILY PHYSICAL PENALTY CHECKS</h3>
                    </div>
                    {gameState.quests.every(q => q.current === 0) && (
                      <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest animate-pulse border border-red-900 bg-red-950/10 px-3 py-1.5 rounded-full font-bold">
                        ⚠️ Active Penalty warning triggers
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    Perform physical training repetitions inside your bedroom or local gym floor. Clicking the counts logs physical tasks onto the system module. Fill them to earn massive EXP.
                  </p>
                </div>

                <div id="quests_checklists" className="space-y-4">
                  {gameState.quests.map((quest) => {
                    const prgPercent = (quest.current / quest.target) * 100;
                    return (
                      <div key={quest.id} className="bg-slate-950/75 border border-slate-900 p-5 rounded-2xl backdrop-blur-md font-mono text-xs space-y-4">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-200">{quest.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">{quest.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400">{quest.current} / {quest.target} {quest.id === "quest_run" ? "km" : "reps"}</span>
                            
                            {quest.completed ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                className="bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer border border-yellow-300/20"
                                onClick={() => claimQuestReward(quest)}
                              >
                                Claim Reward (+{quest.rewardExp} XP)
                              </motion.button>
                            ) : (
                              <div className="flex gap-1.5">
                                <button
                                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
                                  onClick={() => incrementQuest(quest.id, quest.id === "quest_run" ? 1 : 10)}
                                >
                                  +{quest.id === "quest_run" ? "1km" : "10 reps"}
                                </button>
                                <button
                                  className="px-2.5 py-1.5 bg-slate-905 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
                                  onClick={() => incrementQuest(quest.id, quest.id === "quest_run" ? 3 : 25)}
                                >
                                  +{quest.id === "quest_run" ? "3km" : "25 reps"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress visual bar */}
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden relative">
                          <motion.div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                            style={{ width: `${prgPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DAILY SOVEREIGN ALLOCATION & COMPLIANCE HUD PANEL */}
                <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl relative overflow-hidden flex flex-wrap justify-between items-center gap-4 font-mono backdrop-blur-md">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(234,179,8,0.05)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] text-yellow-500 uppercase font-extrabold tracking-widest block animate-pulse">DAILY ALLOCATION PORTAL</span>
                    <h4 className="text-sm font-bold text-slate-100 uppercase">SOVEREIGN ALLOCATION BOUNTY</h4>
                    <p className="text-[10px] text-slate-400 max-w-sm font-sans leading-relaxed">
                      Completing all 4 multi-disciplinary self development grinds unlocks the daily system allocation allowance containing 500 gold and 200 character experience points.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Reset Daily Quests Matrix button */}
                    <button 
                      className="px-4 py-3 bg-slate-900 border border-slate-800 text-slate-350 font-bold uppercase text-[10px] tracking-wider rounded-xl hover:border-slate-750 hover:text-white cursor-pointer transition-all duration-300"
                      onClick={resetDailyMatrix}
                    >
                      Reset Daily Grinds
                    </button>

                    {isDailyAllocationClaimed ? (
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase py-3 px-5 rounded-xl block tracking-widest text-center">
                        ✓ ALLOCATION COLLECTED
                      </span>
                    ) : (
                      <>
                        {gameState.quests.every((q: any) => q.current >= q.target) ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] uppercase py-3 px-6 rounded-xl cursor-pointer shadow-[0_0_20px_rgba(234,179,8,0.2)] tracking-widest block text-center"
                            onClick={claimDailyAllocation}
                          >
                            CLAIM GOLD ALLOCATION (+500 CG)
                          </motion.button>
                        ) : (
                          <span className="bg-slate-900 border border-slate-800 text-slate-550 font-extrabold text-[10px] uppercase py-3 px-5 rounded-xl block tracking-widest text-center">
                            LOCK: SYSTEM GRINDS PENDING
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

              </motion.div>
            )}

            {/* C. DUNGEONS TAB: Real-time interactive Dungeon battles */}
            {activeTab === "dungeons" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {!isFighting ? (
                  <>
                    <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl backdrop-blur-md mb-6">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Gate Entry Matrix</span>
                      <h3 className="font-extrabold text-lg">OPEN GATE RAIDS</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-mono mt-2">
                        Step through dimensional fractures to challenge bosses. Your physical STR and equipped weapon stat bonuses directly dictate hit damage calculations.
                      </p>
                    </div>

                    <div id="dungeons_grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {DUNGEONS_CATALOG.map((dung) => {
                        const isLocked = gameState.level < dung.minLevel;
                        return (
                          <div 
                            key={dung.id} 
                            className={`bg-slate-950/75 border border-slate-900/60 backdrop-blur-md p-5 rounded-2xl flex flex-col justify-between transition-all font-mono text-xs ${
                              isLocked 
                                ? "opacity-50" 
                                : "hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-950/10"
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                  isLocked ? "bg-slate-900 text-slate-500" : "bg-cyan-500/10 text-cyan-400"
                                }`}>
                                  {dung.rank}
                                </span>
                                <span className="text-[9px] text-slate-500">Min Lv: {dung.minLevel}</span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-200 mt-1">{dung.name}</h4>
                              <p className="text-[10px] text-slate-500 leading-relaxed mt-2">{dung.desc}</p>
                              
                              <div className="mt-4 space-y-1.5 border-t border-slate-900 pt-3 text-[10px]">
                                <div className="flex justify-between text-slate-400">
                                  <span>Raid Boss:</span>
                                  <span className="text-slate-300 font-bold">{dung.bossName}</span>
                                </div>
                                <div className="flex justify-between text-slate-450">
                                  <span>Weapon Loot Reward:</span>
                                  <span className="text-indigo-400 font-bold">Chance of {dung.lootItem.name.replace("Loot)", "")}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 pt-3">
                              {isLocked ? (
                                <button className="w-full py-2.5 bg-slate-900 border border-slate-900 rounded-xl text-[10px] text-slate-500 uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-1">
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>GATE CELL LOCKED</span>
                                </button>
                              ) : (
                                <button
                                  className="w-full py-2.5 bg-cyan-950/40 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-400/20 text-cyan-300 font-bold rounded-xl text-[10px] uppercase tracking-widest cursor-pointer transition-all"
                                  onClick={() => startCombat(dung)}
                                >
                                  ENTER GATE PREFECTURE
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  // COMBAT PANEL INTERACTIVE
                  <div id="active_dungeon_panel" className="bg-slate-950/75 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl relative backdrop-blur-md">
                    
                    <div className="p-4 bg-slate-900 border-b border-slate-900 flex justify-between items-center font-mono text-xs">
                      <span className="text-cyan-400 font-bold tracking-widest uppercase">ACTIVE GATE COMBAT ENGINE</span>
                      <button 
                        className="text-slate-500 hover:text-red-400 cursor-pointer"
                        onClick={leaveDungeon}
                      >
                        Escape Gate
                      </button>
                    </div>

                    {/* Battle health boards */}
                    <div id="battle_fighters_arena" className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center border-b border-slate-900">
                      
                      {/* Left side: Player HP details */}
                      <div className="space-y-3 font-mono text-xs text-left">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-slate-500 text-[10px] uppercase">CHALLENGER</span>
                            <span className="text-slate-200 text-sm font-extrabold block">{playerName} (Lv {gameState.level})</span>
                          </div>
                          <span className="text-cyan-400 font-bold">{playerHp} / {playerMaxHp} HP</span>
                        </div>
                        {/* HP bar element */}
                        <div className="h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden relative">
                          <motion.div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-indigo-600 rounded-full"
                            animate={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      </div>

                      {/* Right side: Boss HP details */}
                      <div className="space-y-3 font-mono text-xs text-left md:text-right">
                        <div className="flex justify-between items-end md:flex-row-reverse">
                          <div className="text-left md:text-right">
                            <span className="text-red-500 text-[10px] uppercase block">DUNGEON BOSS</span>
                            <span className="text-slate-200 text-sm font-extrabold">{selectedDungeon.bossName}</span>
                          </div>
                          <span className="text-red-450 font-bold font-mono">{enemyHp} / {enemyMaxHp} HP</span>
                        </div>
                        {/* HP bar element */}
                        <div className="h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden relative">
                          <motion.div 
                            className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-500 to-rose-600 rounded-full"
                            animate={{ width: `${(enemyHp / enemyMaxHp) * 100}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      </div>

                    </div>

                    {/* Combat Log Screen scrollable */}
                    <div id="battle_narrative_display" className="p-4 h-60 bg-slate-950/75 backdrop-blur-md font-mono text-xs space-y-2 overflow-y-auto border-b border-slate-900 text-left">
                      {battleLogs.map((log, index) => (
                        <div key={index} className="leading-relaxed text-slate-300">
                          <span className="text-indigo-400">&gt;</span> {log}
                        </div>
                      ))}
                      <div ref={battleLogEndRef} />
                    </div>

                    {/* Action Panel controller */}
                    <div id="battle_actions_row" className="p-6 bg-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                      
                      {battleOutcome ? (
                        <div className="w-full space-y-4 text-center">
                          {battleOutcome === "victory" ? (
                            <div className="space-y-3 font-mono text-xs">
                              <span className="text-emerald-400 font-extrabold text-sm block tracking-widest">🏆 GATE CLEARED SUCCESSFULLY</span>
                              {earnedLoot && (
                                <div className="max-w-xs mx-auto p-3.5 bg-slate-950/75 border border-emerald-900/60 rounded-xl space-y-2 leading-relaxed backdrop-blur-md">
                                  <div className="text-slate-300 text-[11px]">System Gold Claimed: <span className="text-yellow-400 font-bold font-mono">+{earnedLoot.gold} CG</span></div>
                                  <div className="text-slate-300 text-[11px]">Experience Gained: <span className="text-cyan-400 font-bold font-mono">+{earnedLoot.xp} XP</span></div>
                                  
                                  {earnedLoot.weapon && (
                                    <div className="text-yellow-400 text-[10px] font-black uppercase mt-2 pt-2 border-t border-dotted border-slate-900 animate-pulse">
                                      ⚔️ DEPOSIT LUCK DROP: Unlocked {earnedLoot.weapon.name}!
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="font-mono text-xs">
                              <span className="text-red-500 font-bold text-sm block uppercase tracking-wider">☠️ YOU SUSTAINED MASSIVE CELL DEATH</span>
                              <span className="text-slate-400 text-[10px] block mt-1">Losing 10% Gold reserves back to system keys. Optimize health parameters via Vitality points.</span>
                            </div>
                          )}

                          <button
                            className="bg-slate-950/75 border border-slate-800/80 text-slate-300 px-8 py-3 rounded-xl font-mono text-xs uppercase hover:bg-slate-900/80 backdrop-blur-md cursor-pointer"
                            onClick={leaveDungeon}
                          >
                            Return to Gates Sanctuary
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-slate-500 font-mono text-xs">Select active combat strategy:</span>
                          
                          <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
                            <button
                              id="btn_battle_strike"
                              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-extrabold text-xs uppercase rounded-xl cursor-pointer"
                              onClick={() => executeCombatTurn("strike")}
                            >
                              Weapon Strike
                            </button>
                            <button
                              id="btn_battle_spell"
                              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs uppercase rounded-xl cursor-pointer"
                              onClick={() => executeCombatTurn("skill")}
                            >
                              Cast Skill
                            </button>
                            <button
                              id="btn_battle_shadows"
                              className="px-6 py-3 bg-slate-950/75 border border-slate-800/80 text-slate-300 font-mono text-xs uppercase rounded-xl hover:text-white backdrop-blur-md cursor-pointer"
                              onClick={() => executeCombatTurn("shadows")}
                            >
                              Shadow Army Support
                            </button>
                          </div>
                        </>
                      )}

                    </div>

                  </div>
                )}

              </motion.div>
            )}

            {/* D. SHADOWS LEGION TAB: Raise dead entities */}
            {activeTab === "shadows" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Shadow spirits extraction system</span>
                      <h3 className="font-extrabold text-lg">RECRUITED SHADOW ARMY</h3>
                    </div>
                    {/* Calculate total military force index */}
                    <div className="bg-indigo-950/20 border border-indigo-900 px-4 py-2 rounded-xl text-xs font-mono text-indigo-300">
                      MILITARY FORCE:{" "}
                      <span className="text-cyan-400 font-extrabold">
                        {gameState.shadows
                          .filter(s => s.unlocked)
                          .reduce((sum, s) => sum + s.power * s.count, 0)
                          .toLocaleString()}{" "}
                        points
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono mt-2">
                    Use gold retrieved from successful dungeon sweeps to summon shadow soldiers. Deployed shadows assist attacks in real combat.
                  </p>
                </div>

                <div id="shadows_market" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.shadows.map(shadow => (
                    <div key={shadow.id} className="bg-slate-950/75 border border-slate-900 p-5 rounded-2xl backdrop-blur-md flex justify-between items-center font-mono text-xs">
                      <div className="space-y-1 text-left">
                        <span className="text-[8px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-bold">
                          {shadow.tier}
                        </span>
                        <h4 className="text-sm font-bold text-slate-200 mt-1">{shadow.name}</h4>
                        <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{shadow.description}</p>
                        
                        <div className="text-[10px] text-indigo-300 pt-2">
                          Core Power: {shadow.power} &middot; Owned:{" "}
                          <span className="text-cyan-400 font-bold">{shadow.count}</span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-between h-full gap-2 pl-3">
                        <div className="text-yellow-400 font-semibold text-xs">{shadow.cost} CG</div>
                        <button
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[10px] text-slate-300 uppercase font-black cursor-pointer disabled:opacity-20"
                          disabled={gameState.gold < shadow.cost}
                          onClick={() => summonShadow(shadow.id)}
                        >
                          Arise! (+1)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </motion.div>
            )}

            {/* E. SKILL-TREE TAB: Special fighting actions */}
            {activeTab === "skills" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">SPELLS & CONSCIOUSNESS MATRIX</span>
                  <h3 className="font-extrabold text-lg">SKILL TREE MATRIX</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono mt-2">
                    Unlock specific magic combat skills as your level grows. Casting skills inside dungeons exponentially shifts player damage.
                  </p>
                </div>

                <div id="skills_grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.skills.map((skill) => (
                    <div key={skill.id} className="bg-slate-950/75 border border-slate-900 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between font-mono text-xs">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-2 font-semibold">
                          <span className="uppercase">{skill.category} Spell</span>
                          <span>Lv Required: {skill.levelRequired}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200">{skill.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{skill.description}</p>
                        <div className="text-[10px] text-indigo-400 font-semibold mt-3 p-2 bg-indigo-950/15 border border-indigo-900/10 rounded-lg">
                          Effect: {skill.effect}
                        </div>
                      </div>

                      <div className="mt-5 flex justify-between items-center pt-3 border-t border-slate-900">
                        <span className="text-yellow-400 font-black">{skill.cost} CG</span>
                        
                        {skill.unlocked ? (
                          <span className="text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Unlocked Matrix</span>
                          </span>
                        ) : (
                          <button
                            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-400 uppercase text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer disabled:opacity-30"
                            disabled={gameState.gold < skill.cost || gameState.level < skill.levelRequired}
                            onClick={() => buySkill(skill.id)}
                          >
                            Integrate Spell
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </motion.div>
            )}

            {/* F. BACKPACK TAB: Armour weapon repository */}
            {activeTab === "backpack" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.05)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
                  <span className="text-[10px] font-mono text-cyan-400 uppercase block tracking-wider font-extrabold mb-1">Secure spatial luggage</span>
                  <h3 className="font-extrabold text-lg">SHADOW ARSENAL & SHOP</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono mt-2">
                    Purchase and unlock legendary armaments released via spatial leveling. Clicking on any armament displays its blue neon-bordered abilities detail sheet.
                  </p>
                </div>

                {/* Subsections: Owned Arsenal vs System Store */}
                <div className="space-y-8">
                  
                  {/* PART 1: OWNED ARSENAL */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                      <Sword className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold font-mono tracking-widest text-slate-300 uppercase">ACTIVE ARSENAL ({gameState.inventory.length})</h4>
                    </div>

                    <div id="backpack_items_list" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {gameState.inventory.map((item) => (
                        <div 
                          key={item.id} 
                          className="group relative bg-slate-950/75 border border-slate-900 p-5 rounded-2xl backdrop-blur-md flex items-center justify-between font-mono text-xs hover:border-cyan-400 cursor-pointer transition-all duration-300"
                          onClick={() => setSelectedWeaponDetails(item)}
                        >
                          {/* Inner soft glow if equipped */}
                          {item.equipped && (
                            <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl pointer-events-none" />
                          )}
                          
                          <div className="flex-1 space-y-2 pr-4">
                            <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-500">
                              <span>Rank: {item.rarity}</span>
                              {item.equipped && <span className="text-cyan-400">EQUIPPED</span>}
                            </div>
                            <h4 className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">{item.name}</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-1">{item.description}</p>
                            
                            {item.statBonus && (
                              <div className="text-[9px] text-cyan-400 font-bold space-x-2">
                                {item.statBonus.strength && <span>+{item.statBonus.strength} STR</span>}
                                {item.statBonus.agility && <span>+{item.statBonus.agility} AGI</span>}
                                {item.statBonus.vitality && <span>+{item.statBonus.vitality} VIT</span>}
                              </div>
                            )}
                          </div>

                          {/* Neon Blue Weapon Preview */}
                          <div className="w-16 h-16 rounded-xl bg-slate-900/60 p-1.5 flex items-center justify-center border border-slate-800/80 group-hover:border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.05)] select-none">
                            {renderNeonWeaponPreview(item.id, item.equipped)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PART 2: SYSTEM SHOP */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                      <ShoppingBag className="w-4 h-4 text-yellow-400" />
                      <h4 className="text-xs font-bold font-mono tracking-widest text-slate-300 uppercase">SYSTEM WEAPONS REGISTRY (Level Releases)</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {WEAPONS_DATABASE.map((weaponTemplate) => {
                        const isOwned = gameState.inventory.some(i => i.id === weaponTemplate.id);
                        const shopMeta = WEAPON_SHOP_DETAILS[weaponTemplate.id] || { cost: 0, levelReq: 1 };
                        const isUnlocked = gameState.level >= shopMeta.levelReq;

                        return (
                          <div 
                            key={weaponTemplate.id} 
                            className={`relative bg-slate-950/75 border border-slate-900/60 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between font-mono text-xs transition-all duration-300 ${
                              isOwned ? "opacity-65" : 
                              !isUnlocked ? "opacity-40 bg-slate-900/10" : 
                              "hover:border-yellow-500/50 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!isOwned && isUnlocked) {
                                setSelectedWeaponDetails({ ...weaponTemplate, isShopTemplate: true, cost: shopMeta.cost, levelReq: shopMeta.levelReq });
                              } else if (isOwned) {
                                const ownedW = gameState.inventory.find(i => i.id === weaponTemplate.id);
                                if (ownedW) setSelectedWeaponDetails(ownedW);
                              }
                            }}
                          >
                            <div className="flex-1 space-y-2 pr-4">
                              <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-500">
                                <span>{weaponTemplate.rarity} Rarity</span>
                                <span className={isOwned ? "text-slate-500" : isUnlocked ? "text-yellow-400" : "text-red-500"}>
                                  {isOwned ? "ACQUIRED" : isUnlocked ? "AVAILABLE" : `UNLOCKS AT LV ${shopMeta.levelReq}`}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-200">{weaponTemplate.name}</h4>
                              
                              <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-1">{weaponTemplate.description}</p>
                              
                              {!isOwned && (
                                <div className="text-yellow-400 text-xs font-bold mt-1">
                                  Price: {shopMeta.cost} CG
                                </div>
                              )}
                            </div>

                            {/* Neon Outline Silhouette preview */}
                            <div className="w-16 h-16 rounded-xl bg-slate-900/60 p-1.5 flex items-center justify-center border border-slate-800/80">
                              {renderNeonWeaponPreview(weaponTemplate.id, false)}
                            </div>

                            {/* Lock Icon Overlay if Locked */}
                            {!isUnlocked && !isOwned && (
                              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center pointer-events-none">
                                <Lock className="w-5 h-5 text-slate-600" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

          </div>

        </div>

      </div>

      {/* WEAPON DETAIL BLUE NEON GLOWING POPUP MODAL */}
      <AnimatePresence>
        {selectedWeaponDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedWeaponDetails(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="w-full max-w-md bg-slate-950/75 border-2 border-cyan-400 p-6 rounded-3xl relative overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.45)] text-left font-mono cursor-default backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cyber Matrix decorative grid inside modal */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.15)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-start mb-6 border-b border-slate-900 pb-3 relative z-10">
                <div>
                  <span className="text-[10px] text-cyan-400 tracking-widest font-black uppercase">SYSTEM ANALYSIS</span>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">{selectedWeaponDetails.name}</h3>
                </div>
                <button 
                  className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                  onClick={() => setSelectedWeaponDetails(null)}
                >
                  CLOSE [X]
                </button>
              </div>

              {/* Big Neon Blue Silhouette Preview */}
              <div className="my-6 py-8 bg-slate-900/40 border border-slate-900/80 rounded-2xl flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 bg-cyan-500/5 rounded-full filter blur-xl animate-pulse" />
                </div>
                {renderNeonWeaponPreview(selectedWeaponDetails.id, true)}
              </div>

              <div className="space-y-4 text-xs leading-relaxed relative z-10 uppercase">
                <div>
                  <span className="text-slate-500 text-[10px] block">CLASSIFICATION RANK</span>
                  <span className="text-white font-extrabold">{selectedWeaponDetails.rarity} armament</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">CORE DESCRIPTION</span>
                  <p className="text-slate-350 normal-case leading-relaxed select-text mt-1 text-[11px]">
                    {selectedWeaponDetails.description}
                  </p>
                </div>

                {/* Weapon abilities */}
                <div>
                  <span className="text-slate-500 text-[10px] block mb-1">PERFORMANCE ABILITY SKILLS</span>
                  <div className="bg-slate-900/60 border border-slate-900 px-3 py-2.5 rounded-xl space-y-1.5 font-sans lowercase text-slate-400 text-[11px]">
                    {selectedWeaponDetails.id === "rusty_dagger" && (
                      <p><span className="text-yellow-400 font-bold font-mono uppercase">[Rusty edge]</span> Increases physical base hit by 5 points. Deals rugged laceration damage to goblin scouts.</p>
                    )}
                    {selectedWeaponDetails.id === "kasaka_fang" && (
                      <p><span className="text-cyan-400 font-bold font-mono uppercase">[Paralysis Venom]</span> 20% hit chance to paralyze enemy scouts. Afflicts intense venom poison tick drains.</p>
                    )}
                    {selectedWeaponDetails.id === "igris_sword" && (
                      <p><span className="text-rose-400 font-bold font-mono uppercase">[Commander Pierce]</span> Overrides 25% of opponent vital defense parameters. Radiates majestic crimson shockwave arcs.</p>
                    )}
                    {selectedWeaponDetails.id === "demon_dagger" && (
                      <p><span className="text-indigo-400 font-bold font-mono uppercase">[Black Inferno]</span> Ignites black hellfire trails doing substantial double scaling shadow burn damage.</p>
                    )}
                    {selectedWeaponDetails.id === "kamish_fang" && (
                      <p><span className="text-purple-400 font-bold font-mono uppercase">[Dragon Scale Wrath]</span> Infuses structural +40% physical critical accuracy rate parameters upon physical trigger.</p>
                    )}
                    {selectedWeaponDetails.id === "sovereigns_wrath" && (
                      <p><span className="text-pink-400 font-bold font-mono uppercase">[Twin Sovereign Abyss]</span> Pierces local space-time fabric to materialize void marks which detonate for supreme cosmic force damage.</p>
                    )}
                  </div>
                </div>

                {selectedWeaponDetails.statBonus && (
                  <div>
                    <span className="text-slate-500 text-[10px] block">STAT POINT ATTRIBUTES INTEGRATION</span>
                    <div className="flex gap-3 text-cyan-400 font-bold text-xs mt-1">
                      {selectedWeaponDetails.statBonus.strength && <span>STR +{selectedWeaponDetails.statBonus.strength}</span>}
                      {selectedWeaponDetails.statBonus.agility && <span>AGI +{selectedWeaponDetails.statBonus.agility}</span>}
                      {selectedWeaponDetails.statBonus.vitality && <span>VIT +{selectedWeaponDetails.statBonus.vitality}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action buttons */}
              <div className="mt-6 pt-4 border-t border-slate-900 flex justify-end gap-3 z-10 relative">
                {selectedWeaponDetails.isShopTemplate ? (
                  <button 
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 hover:text-white font-extrabold text-xs uppercase rounded-xl cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300"
                    onClick={() => {
                      buyWeapon(selectedWeaponDetails.id);
                      setSelectedWeaponDetails(null);
                    }}
                  >
                    INTEGRATE WEAPON (-{selectedWeaponDetails.cost} CG)
                  </button>
                ) : (
                  <>
                    {selectedWeaponDetails.equipped ? (
                      <div className="w-full text-center text-cyan-400 font-bold text-xs py-2.5 border border-cyan-500/20 bg-cyan-500/5 rounded-xl uppercase">
                        ACTIVE PRIMARY EQUIPMENT IN SLOT
                      </div>
                    ) : (
                      <button 
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-white font-extrabold text-xs uppercase rounded-xl cursor-pointer border border-cyan-500/30 transition-all duration-300 text-center uppercase"
                        onClick={() => {
                          equipWeapon(selectedWeaponDetails.id);
                          setSelectedWeaponDetails(null);
                        }}
                      >
                        EQUIP ARSENAL UNIT
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CINEMATIC LEVEL UP HERO OVERLAY PANEL */}
      <AnimatePresence>
        {levelUpOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-4 overflow-hidden"
            onClick={() => setLevelUpOverlay(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none" />
            
            {/* Massive back portal glowing aura rings */}
            <div className="absolute w-[600px] h-[600px] border border-dashed border-cyan-500/10 rounded-full animate-spin pointer-events-none" style={{ animationDuration: "50s" }} />
            <div className="absolute w-[450px] h-[450px] border border-dotted border-purple-500/15 rounded-full animate-spin pointer-events-none" style={{ animationDuration: "25s" }} />

            {/* Floating ascending energy particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 200, x: Math.random() * 320 - 160, opacity: 0, scale: 0.5 }}
                animate={{ y: -300, opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.2 + Math.random() * 1.5, delay: i * 0.1 }}
                className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-t from-cyan-400 to-indigo-500 filter blur-[1px]"
              />
            ))}

            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center space-y-6 max-w-sm w-full font-mono relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Systems Prompt headers */}
              <div className="space-y-1.5 uppercase font-extrabold text-[10px] tracking-widest text-slate-500">
                <span>SYSTEM NOTIFICATION GRANTED</span>
                <div className="h-[2px] w-12 bg-cyan-500 mx-auto" />
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 tracking-tight animate-pulse uppercase">
                  LEVEL UP!
                  {/* Play Level Up Audio automatically in background */}
                  {(() => { playLevelUpSound(); return null; })()}
                </h2>
                <p className="text-xs text-slate-400">
                  The Monarchy core regulator has unlocked structural stat allocations.
                </p>
              </div>

              <div className="p-6 bg-slate-900/60 border border-slate-900 rounded-3xl space-y-4 uppercase text-xs">
                <div className="flex justify-between items-center text-slate-400 font-bold">
                  <span>WARRIOR LEVEL</span>
                  <span className="text-white font-black text-base">
                    {levelUpOverlay.prevLevel} &rarr; <span className="text-cyan-400">{levelUpOverlay.newLevel}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400 font-bold pt-3 border-t border-slate-950/80">
                  <span>STAT POINTS GRANTED</span>
                  <span className="text-emerald-400 font-black text-base">
                    +{levelUpOverlay.statPointsEarned} POINTS
                  </span>
                </div>
              </div>

              <div className="text-xs text-indigo-300 leading-relaxed max-w-xs mx-auto animate-pulse font-sans">
                "Your shadow potential has aligned to higher spatial realms. Base strength capability upgraded."
              </div>

              <button 
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 hover:text-white font-extrabold text-xs uppercase rounded-xl cursor-pointer transition-all duration-300 uppercase block tracking-widest"
                onClick={() => setLevelUpOverlay(null)}
              >
                Confirm Evolution [Accept]
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE ROBUST PROFILE DRAWER / SIDE SHEET (MOBILE COGNITIVE DRAWER) */}
      <AnimatePresence>
        {showProfileDrawer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex justify-end cursor-pointer"
            onClick={() => setShowProfileDrawer(false)}
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-sm bg-slate-950/75 border-l border-slate-900 h-full flex flex-col justify-between overflow-y-auto z-50 p-6 relative cursor-default text-left font-mono backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header panel inside Drawer */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-indigo-950/40 pb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-200">WARRIOR REGISTRY</h3>
                  </div>
                  <button 
                    className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs lowercase"
                    onClick={() => setShowProfileDrawer(false)}
                  >
                    CLOSE [X]
                  </button>
                </div>

                {/* Profile Identification Grid */}
                <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    {playerName.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Monarch Identity</span>
                    <h4 className="text-sm font-bold text-slate-100">{playerName}</h4>
                    <span className="text-[9px] text-cyan-400 uppercase font-bold tracking-wider">Level {gameState.level} &middot; {gameState.rank}</span>
                  </div>
                </div>

                {/* SETTINGS OPTIONS PORTFOLIO LIST */}
                <div className="space-y-5 text-left text-xs">
                  
                  {/* OPTION 1: Player Name Updating */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">1. Player Name registry</label>
                    <input 
                      type="text"
                      value={playerName}
                      disabled
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-slate-400 font-bold select-none cursor-default text-xs"
                    />
                    <span className="text-[9px] text-slate-600 block lowercase leading-relaxed">Identity locks are established during regional awakening selection.</span>
                  </div>

                  {/* OPTION 2: System SFX Controller Toggle (Suggested Feature 1) */}
                  <div className="space-y-2 border-t border-slate-900 pt-3">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider block">2. System Synthesizer Volume</span>
                    <div className="flex justify-between items-center bg-slate-900/60 p-2.5 px-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-300">Auditory sound FX core</span>
                      <span className="text-cyan-400 font-bold uppercase text-[9px] tracking-widest bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded-full animate-pulse">
                        Active [100%]
                      </span>
                    </div>
                  </div>

                  {/* OPTION 3: Difficulty / Hardcore Regime (Suggested Feature 2) */}
                  <div className="space-y-2 border-t border-slate-900 pt-3">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider block">3. Regimen Difficulty standard</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button className="py-2 px-1 border-2 border-cyan-400 bg-cyan-400/5 text-cyan-400 rounded-xl text-[9px] font-bold uppercase transition-all duration-300">
                        RECRUIT COMPLIANCE
                      </button>
                      <button 
                        className="py-2 px-1 border border-slate-800 text-slate-500 rounded-xl text-[9px] font-bold uppercase hover:border-slate-700 hover:text-slate-300 transition-all duration-300 cursor-pointer"
                        onClick={() => triggerSystemToast("SYSTEM NOTIFICATION: S-Rank Grind forces intense Penalty sequences upon daily quest neglect!")}
                      >
                        S-RANK GRIND
                      </button>
                    </div>
                  </div>

                  {/* OPTION 4: Notification Settings Toggle */}
                  <div className="space-y-2 border-t border-slate-900 pt-3">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider block">4. System Sound Signals</span>
                    <div className="flex justify-between items-center bg-slate-900/60 p-2 px-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-300">Daily Quest Reminders</span>
                      <div className="w-10 h-6 bg-cyan-500 rounded-full p-1 cursor-pointer flex justify-end">
                        <div className="w-4 h-4 bg-slate-950 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* OPTION 5: Reset account data safeguards (Suggested Feature 3) */}
                  <div className="space-y-2 border-t border-slate-900 pt-3">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider block">5. Erase registry save data</span>
                    <button 
                      className="w-full py-2.5 border border-red-950 hover:bg-red-950/25 text-red-500 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        if (confirm("⚠️ SYSTEM DATA DESTRUCT DIALOG:\n\nThis will immediately purge player level, stats allocation index, acquired shadow soldiers, and system weapons. Confirm player rollback restart?")) {
                          localStorage.removeItem(`monarch_save_${playerName}`);
                          localStorage.removeItem(`monarch_daily_claim_${playerName}`);
                          window.location.reload();
                        }
                      }}
                    >
                      Purge Active Registry Save
                    </button>
                  </div>

                </div>
              </div>

              {/* OPTION 6: Real Sign Out Action Button */}
              <div className="border-t border-slate-900 pt-6">
                <button 
                  className="w-full py-3 bg-red-950 hover:bg-red-900 text-red-200 hover:text-white border border-red-900 text-xs font-bold font-mono tracking-widest uppercase rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                    setShowProfileDrawer(false);
                    onLogout();
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  DISCONNECT SESSION
                </button>
                <p className="text-[9px] text-slate-600 text-center font-mono uppercase mt-3">
                  SYSTEM TELEMETRY GATEWAY - PORT RE-BOUND [3000]
                </p>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD SYSTEM TOAST VIEWER NOTIFICATION PORT */}
      <AnimatePresence>
        {systemToast && (
          <motion.div 
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none"
          >
            <div className="bg-slate-950/90 border border-cyan-400 px-4 py-3.5 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur text-left pointer-events-auto flex items-center gap-3 font-mono">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping shrink-0" />
              <div className="text-[10px] font-semibold text-slate-200 uppercase leading-relaxed text-slate-300">
                {systemToast}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="p-4 border-t border-slate-950 bg-slate-950/80 text-center text-xs font-mono text-slate-600 mt-10">
        <div>&copy; MONARCH SELF-DEVELOPMENT SYSTEM &middot; SECURE SYSTEM EMULATOR v2.4</div>
      </footer>
    </div>
  );
}
