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
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }

    // Default starting state
    return {
      level: 1,
      exp: 0,
      maxExp: 150,
      gold: 1500, // Starts with a small reward
      statPoints: 5,
      baseStats: {
        strength: 12,
        agility: 10,
        vitality: 12,
        intelligence: 10,
        perception: 10
      },
      job: "Fledgling Player",
      rank: "E-Rank",
      inventory: [...WEAPONS_DATABASE.map(w => ({ ...w, equipped: w.id === "rusty_dagger" }))],
      shadows: [...SHADOWS_LIST],
      skills: [...SKILLS_LIST],
      quests: [
        { id: "quest_pushup", name: "Daily Push-ups", description: "Complete physical chest press sets", target: 100, current: 0, rewardExp: 50, rewardGold: 200, completed: false, type: "Daily" },
        { id: "quest_situp", name: "Daily Sit-ups", description: "Complete physical core contractions", target: 100, current: 0, rewardExp: 50, rewardGold: 200, completed: false, type: "Daily" },
        { id: "quest_squat", name: "Daily Squats", description: "Complete quad hyper-trophy contractions", target: 100, current: 0, rewardExp: 50, rewardGold: 200, completed: false, type: "Daily" },
        { id: "quest_run", name: "Daily Agility Run", description: "Execute road running cardiovascular card", target: 10, current: 0, rewardExp: 80, rewardGold: 300, completed: false, type: "Daily" }
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
        colorClass: "from-slate-700 via-zinc-800 to-stone-900 border-zinc-700",
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
        colorClass: "from-blue-950 via-slate-900 to-slate-950 border-blue-500/40",
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
        colorClass: "from-cyan-950 via-slate-900 to-indigo-950 border-cyan-400/40",
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
        colorClass: "from-indigo-950 via-slate-950 to-indigo-900 border-indigo-400",
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
        colorClass: "from-violet-950 via-cyan-950 to-blue-950 border-cyan-400",
        auraStyle: "opacity-95 shadow-[0_0_40px_rgba(34,211,238,0.4)]",
        effectText: "High-velocity cyan lightning mesh. Dark void power shockwaves.",
        desc: "Pure shadow force bends gravity inside dungeons. Absolute command.",
        eyes: "opacity-100 text-cyan-300",
        graphics: "border-cyan-450 bg-cyan-950/40"
      };
    }
    return {
      title: "Sovereign Monarch",
      colorClass: "from-yellow-950/20 via-purple-950/40 to-slate-950 border-yellow-500/85 shadow-lg shadow-yellow-500/10",
      auraStyle: "opacity-100 shadow-[0_0_50px_rgba(234,179,8,0.5)]",
      effectText: "Ethereal floating gold crown with violet amethysts. Infinite auras.",
      desc: "Cosmic level presence. Command legions in the hundreds of millions.",
      eyes: "opacity-100 text-purple-400",
      graphics: "border-yellow-500 bg-purple-950/20"
    };
  };

  const currentTier = getVisualTier(gameState.level);

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

  // Exp progression
  const addExp = (amt: number) => {
    setGameState(prev => {
      let newExp = prev.exp + amt;
      let newLevel = prev.level;
      let max = prev.maxExp;
      let statPoints = prev.statPoints;

      while (newExp >= max) {
        newExp -= max;
        newLevel += 1;
        statPoints += 5; // 5 stat points per level!
        max = newLevel * 105 + 80;
        
        // play level up sound
        setTimeout(() => {
          playLevelUpSound();
        }, 100);
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

  const claimQuestReward = (quest: Quest) => {
    if (!quest.completed) return;
    playLootSound();
    
    // Add reward
    addExp(quest.rewardExp);
    setGameState(prev => {
      const list = prev.quests.map(q => {
        if (q.id === quest.id) {
          return { ...q, current: 0, completed: false }; // reset for next day
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
      alert(`Access Restricted. Level ${dungeon.minLevel} required for this gate.`);
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
    alert("🌌 Cosmic resonance detected! Sovereign's Wrath dual ethereal blades placed in secure inventory slot.");
  };

  return (
    <div id="rpg_game_container" className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none relative overflow-y-auto">
      
      {/* Header Panel */}
      <header className="p-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-30 flex flex-wrap justify-between items-center gap-4">
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
            id="btn_logout"
            className="p-2.5 bg-slate-900 hover:bg-red-950 hover:text-red-400 rounded-xl text-slate-400 cursor-pointer transition-colors border border-slate-800"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
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

            {/* Simulated abstract visual representation wrapper */}
            {/* Visual mutations based on level */}
            <div className="my-8 flex justify-center relative">
              
              <div className={`w-40 h-40 rounded-full border flex items-center justify-center relative overflow-hidden transition-all duration-700 ${currentTier.graphics}`}>
                
                {gameState.level <= 14 && (
                  <div className="text-center">
                    <Skull className="w-16 h-16 text-slate-600 animate-bounce" />
                    <span className="text-[8px] font-mono text-slate-500 tracking-widest block uppercase mt-2">Bandaged</span>
                  </div>
                )}

                {gameState.level >= 15 && gameState.level <= 29 && (
                  <div className="text-center relative">
                    <Activity className="w-16 h-16 text-blue-400 animate-pulse" />
                    <div className="absolute top-4 left-5 w-3 h-3 bg-cyan-400 rounded-full filter blur animate-ping" />
                    <span className="text-[8px] font-mono text-cyan-400 tracking-widest block uppercase mt-2 font-bold">Awakened Glow</span>
                  </div>
                )}

                {gameState.level >= 30 && gameState.level <= 47 && (
                  <div className="text-center relative">
                    {/* Energy rings and wings representation */}
                    <div className="absolute inset-0 border border-dotted border-cyan-400 animate-spin rounded-full opacity-30" />
                    <Sparkles className="w-16 h-16 text-cyan-300" />
                    <span className="text-[8px] font-mono text-cyan-300 tracking-widest block uppercase mt-2 font-extrabold">Wings Active</span>
                  </div>
                )}

                {gameState.level >= 48 && gameState.level <= 69 && (
                  <div className="text-center relative">
                    <div className="absolute inset-2 border-2 border-dashed border-indigo-400 animate-pulse rounded-full opacity-30" />
                    <Zap className="w-16 h-16 text-indigo-400 animate-bounce" />
                    <span className="text-[8px] font-mono text-indigo-400 tracking-widest block uppercase mt-2 font-bold">Electric Overlord</span>
                  </div>
                )}

                {gameState.level >= 70 && gameState.level <= 89 && (
                  <div className="text-center relative">
                    <div className="absolute -inset-1 border border-cyan-400 animate-ping rounded-full opacity-20" />
                    <Flame className="w-16 h-16 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
                    <span className="text-[8px] font-mono text-cyan-400 tracking-widest block uppercase mt-2 font-extrabold">Aura Mesh</span>
                  </div>
                )}

                {gameState.level >= 90 && (
                  <div className="text-center relative">
                    <div className="absolute -inset-2 bg-purple-500/10 rounded-full blur animate-pulse" />
                    <Crown className="w-16 h-16 text-yellow-400 animate-bounce" />
                    <span className="text-[8px] font-mono text-yellow-400 tracking-widest block uppercase mt-2 font-black">Monarch Sovereign</span>
                  </div>
                )}

              </div>

              {/* Glowing Eyes Accent layer */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-mono ${currentTier.eyes}`}>
                🔷 🔷
              </div>
            </div>

            <div className="text-center space-y-1.5 z-10 relative">
              <h3 className="text-xl font-extrabold tracking-wide uppercase font-mono">{currentTier.title}</h3>
              <p className="text-xs text-indigo-300 font-mono font-bold leading-relaxed">{currentTier.effectText}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{currentTier.desc}</p>
            </div>

          </div>

          {/* Level Exp Progress Section */}
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl font-mono text-xs space-y-3">
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
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl font-mono text-xs space-y-3">
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
                
                <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl relative overflow-hidden">
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
                              className="p-2 bg-slate-950 border border-slate-800 rounded-lg hover:border-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-20 cursor-pointer text-xs font-bold"
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
                  <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl font-mono text-xs space-y-2">
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

                  <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl font-mono text-xs space-y-2">
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
                
                <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
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
                      <div key={quest.id} className="bg-slate-950 border border-slate-900 p-5 rounded-2xl font-mono text-xs space-y-4">
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

              </motion.div>
            )}

            {/* C. DUNGEONS TAB: Real-time interactive Dungeon battles */}
            {activeTab === "dungeons" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {!isFighting ? (
                  <>
                    <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl mb-6">
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
                            className={`bg-slate-950 border p-5 rounded-2xl flex flex-col justify-between transition-all font-mono text-xs ${
                              isLocked 
                                ? "border-slate-900/60 opacity-50" 
                                : "border-slate-800 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-950/10"
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
                  <div id="active_dungeon_panel" className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
                    
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
                    <div id="battle_narrative_display" className="p-4 h-60 bg-slate-950 font-mono text-xs space-y-2 overflow-y-auto border-b border-slate-900 text-left">
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
                                <div className="max-w-xs mx-auto p-3.5 bg-slate-950 border border-emerald-900 rounded-xl space-y-2 leading-relaxed">
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
                            className="bg-slate-950 border border-slate-800 text-slate-300 px-8 py-3 rounded-xl font-mono text-xs uppercase hover:bg-slate-900 cursor-pointer"
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
                              className="px-6 py-3 bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs uppercase rounded-xl hover:text-white cursor-pointer"
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
                
                <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
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
                    <div key={shadow.id} className="bg-slate-950 border border-slate-900 p-5 rounded-2xl flex justify-between items-center font-mono text-xs">
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
                
                <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">SPELLS & CONSCIOUSNESS MATRIX</span>
                  <h3 className="font-extrabold text-lg">SKILL TREE MATRIX</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono mt-2">
                    Unlock specific magic combat skills as your level grows. Casting skills inside dungeons exponentially shifts player damage.
                  </p>
                </div>

                <div id="skills_grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.skills.map((skill) => (
                    <div key={skill.id} className="bg-slate-950 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between font-mono text-xs">
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
                
                <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Secure spatial luggage</span>
                  <h3 className="font-extrabold text-lg">SHADOW INV-STORAGE (BACKPACK)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono mt-2">
                    View weapon armaments collected inside dungeon chests. Equipping a primary weapon updates dynamic base attack calculations instantly.
                  </p>
                </div>

                <div id="backpack_items_list" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.inventory.map((item) => (
                    <div 
                      key={item.id} 
                      className={`bg-slate-950 border p-5 rounded-2xl flex flex-col justify-between font-mono text-xs ${
                        item.equipped ? "border-cyan-400" : "border-slate-900"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center text-[10px] mb-2 font-bold uppercase text-slate-500">
                          <span>{item.type} Armament</span>
                          <span className="text-indigo-400 font-black">Rarity: {item.rarity}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 mt-1">{item.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-2">{item.description}</p>
                        
                        {item.statBonus && (
                          <div className="text-[10px] text-cyan-400 font-bold mt-3 space-x-2">
                            {item.statBonus.strength && <span>+{item.statBonus.strength} STR</span>}
                            {item.statBonus.agility && <span>+{item.statBonus.agility} AGI</span>}
                            {item.statBonus.vitality && <span>+{item.statBonus.vitality} VIT</span>}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex justify-end pt-3 border-t border-slate-900">
                        {item.equipped ? (
                          <span className="text-cyan-300 uppercase font-black tracking-widest text-[10px] py-1.5 px-3 bg-cyan-500/10 border border-cyan-400/20 rounded-lg">
                            EQUIPPED ARMAMENT
                          </span>
                        ) : (
                          <button
                            className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold uppercase text-[10px] tracking-wider rounded-xl hover:border-cyan-400 cursor-pointer"
                            onClick={() => equipWeapon(item.id)}
                          >
                            Equip Gear
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </motion.div>
            )}

          </div>

        </div>

      </div>

      <footer className="p-4 border-t border-slate-950 bg-slate-950/80 text-center text-xs font-mono text-slate-600 mt-10">
        <div>&copy; MONARCH SELF-DEVELOPMENT SYSTEM &middot; SECURE SYSTEM EMULATOR v2.4</div>
      </footer>
    </div>
  );
}
