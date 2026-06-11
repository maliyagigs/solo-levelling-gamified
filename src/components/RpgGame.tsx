/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Dumbbell, 
  Home,
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
  Crown,
  BookOpen,
  Briefcase,
  Clock,
  Timer,
  ChevronRight,
  Trash2,
  Pause,
  Target,
  Trophy,
  Bell,
  Radio,
  TrendingUp,
  Terminal
} from "lucide-react";
import { OnboardingData, GameState, InventoryItem, ShadowSoldier, SkillNode, Quest, ItemRarity } from "../types";
import { SHADOWS_LIST, WEAPONS_DATABASE, SKILLS_LIST, DUNGEONS_CATALOG, generatePlan } from "../data";
import { ANDROID_CLONE_PROMPT } from "../utils/cloner_prompt";
import { AnimeTierBadge } from "./AnimeTierBadge";
import { AvatarWithFrame } from "./AvatarWithFrame";
import { Smartphone, Copy, Check, Camera, Upload, MessageSquare, Users, Map } from "lucide-react";
import { saveToLeaderboard, fetchLeaderboard, db, auth, handleFirestoreError, OperationType } from "../utils/firebase";
import { onSnapshot, collection, doc, setDoc, query, limit } from "firebase/firestore";
import { 
  playSelectSound, 
  playDaggerSwipe, 
  playLevelUpSound, 
  playAriseSound, 
  playLootSound, 
  playHurtSound 
} from "../utils/audio";
import { safeLocalStorage as localStorage } from "../utils/storage";

import { getWeaponColorClasses, CircularProgress, VerticalBar } from "./gameHelpers";
import { SocialHub } from "./SocialHub";
import { listenToFriendships } from "../utils/social";

interface RpgGameProps {
  playerName: string;
  onboardProfile: OnboardingData;
  onLogout: () => void;
}

export default function RpgGame({ playerName, onboardProfile, onLogout }: RpgGameProps) {
  const [activeTab, setActiveTab] = useState<"quests" | "status" | "dungeons" | "shadows" | "skills" | "backpack" | "life_forge" | "home" | "profile" | "social">("home");
  const [economyState, setEconomyState] = useState<{
    totalShares: number;
    circulatingMana: number;
    realUsersManaSum: number;
    simulatedUsers: number;
    currentManaValue: number;
    marketCap: number;
    shareCapBalance: number;
  } | null>(null);

  // Active Gates for the day
  const [activeGateIds, setActiveGateIds] = useState<string[]>([]);
  const [preparedGateIds, setPreparedGateIds] = useState<string[]>([]);
  const [preparingGateId, setPreparingGateId] = useState<string | null>(null);
  const [prepTimer, setPrepTimer] = useState<number>(0);

  useEffect(() => {
    if (prepTimer > 0) {
      const iter = setInterval(() => {
        setPrepTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(iter);
    } else if (preparingGateId) {
      setPreparedGateIds(prev => [...prev, preparingGateId]);
      setPreparingGateId(null);
      triggerSystemToast(`✅ PREPARATION COMPLETE: Dimensional sync established for ${preparingGateId}.`);
    }
  }, [prepTimer, preparingGateId]);

  const startPreparation = (gateId: string) => {
    playSelectSound();
    setPreparingGateId(gateId);
    // 30 seconds for prep as a "mini-grind" placeholder for real work session
    setPrepTimer(30); 
    triggerSystemToast(`⚙️ PREPARATION INITIATED: Focus on your ${onboardProfile.academicSubject || onboardProfile.careerTargetRole || "studies/career"} tasks now.`);
  };

  useEffect(() => {
    // Generate active gates based on current date
    const today = new Date().toDateString();
    // Deterministic seed based on date string
    let seed = 0;
    for (let i = 0; i < today.length; i++) {
      seed = (seed << 5) - seed + today.charCodeAt(i);
      seed |= 0;
    }
    
    // Logic: Always include the starter gate (dung_e) + 1 random one from the rest
    const available = DUNGEONS_CATALOG.filter(d => d.id !== "dung_e").map(d => d.id);
    
    // Deterministic pick for the bonus gate
    const bonusIdx = Math.abs(seed) % available.length;
    const bonusGateId = available[bonusIdx];
    
    // User said 1 or 2. Let's decide if we add the second one today
    const countIsTwo = (Math.abs(seed) % 10) > 3; // 60% chance for 2 gates, 40% for just the main starter
    
    if (countIsTwo) {
      setActiveGateIds(["dung_e", bonusGateId]);
    } else {
      setActiveGateIds(["dung_e"]);
    }
  }, []);

  useEffect(() => {
    const fetchEconomy = async () => {
      try {
        const res = await fetch("/api/economy/state");
        if (res.ok) {
          const data = await res.json();
          setEconomyState(data);
        }
      } catch (e) {}
    };
    fetchEconomy();
    const interval = setInterval(fetchEconomy, 30000);
    return () => clearInterval(interval);
  }, []);
  const [socialSubTab, setSocialSubTab] = useState<"chat" | "leaderboard" | "friends">("chat");
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [socialPulse, setSocialPulse] = useState<string>("SYSTEM: All dimensional gates are stabilized. Good luck, Hunter.");

  useEffect(() => {
    if (activeTab === "home") {
      const incomplete = gameState.quests.filter(q => !q.completed).length;
      if (incomplete > 0) {
        setTimeout(() => {
          triggerSystemToast(`⚠️ SYSTEM DIRECTIVE: You have ${incomplete} daily tasks remaining. Finalize logs to avoid penalties.`);
        }, 1000);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const alerts = [
      `BROADCAST: Player ${Math.floor(Math.random() * 500)} just reached Level ${Math.floor(Math.random() * 20 + 40)}!`,
      `RANKING: New Sovereign-Rank activity detected in District 7.`,
      `MARKET: Mana value fluctuated by 0.003% due to high gate activity.`,
      `MILESTONE: Community has collectively cleared 500+ D-Rank gates today.`,
      `ALERT: S-Rank Hunter 'Igris' has been spotted in the shadows.`
    ];
    const interval = setInterval(() => {
      setSocialPulse(alerts[Math.floor(Math.random() * alerts.length)]);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Social Notification Listener
  useEffect(() => {
    if (!playerName) return;
    const unsub = listenToFriendships(playerName, (list) => {
       const pending = list.filter(f => f.status === 'pending' && f.requestedBy !== playerName);
       setFriendRequests(pending);
    });
    return () => unsub();
  }, [playerName]);

  const getMobileSection = (tab: string): number => {
    if (tab === "status" || tab === "dungeons") return 0;
    if (tab === "social") return 1;
    if (tab === "home" || tab === "quests" || tab === "life_forge") return 2;
    if (tab === "shadows" || tab === "skills") return 3;
    if (tab === "backpack" || tab === "profile" || tab === "market") return 4;
    return 2;
  };

  const handleMobileSectionClick = (sectionIdx: number) => {
    try {
      playSelectSound();
    } catch (e) {}
    const currentSec = getMobileSection(activeTab);
    if (sectionIdx === 0) {
      if (currentSec !== 0) {
        setActiveTab("status");
      } else {
        if (activeTab === "status") setActiveTab("dungeons");
        else setActiveTab("status");
      }
    } else if (sectionIdx === 1) {
      setActiveTab("social");
      setSocialSubTab("chat");
    } else if (sectionIdx === 2) {
      if (currentSec !== 2) {
        setActiveTab("home");
      } else {
        if (activeTab === "quests") setActiveTab("home");
        else if (activeTab === "home") setActiveTab("life_forge");
        else setActiveTab("quests");
      }
    } else if (sectionIdx === 3) {
      if (currentSec !== 3) {
        setActiveTab("shadows");
      } else {
        if (activeTab === "shadows") setActiveTab("skills");
        else setActiveTab("shadows");
      }
    } else if (sectionIdx === 4) {
      if (currentSec !== 4) {
        setActiveTab("backpack");
      } else {
        if (activeTab === "backpack") setActiveTab("market");
        else if (activeTab === "market") setActiveTab("profile");
        else setActiveTab("backpack");
      }
    }
  };

  const getMobileSubtabs = () => {
    const sec = getMobileSection(activeTab);
    if (sec === 0) {
      return [
        { id: "status", label: "Status" },
        { id: "dungeons", label: "Gates" }
      ];
    }
    if (sec === 1) {
      return [
        { id: "social", label: "Community Hub" }
      ];
    }
    if (sec === 2) {
      return [
        { id: "quests", label: "Quests" },
        { id: "home", label: "Home" },
        { id: "life_forge", label: "Life Forge" }
      ];
    }
    if (sec === 3) {
      return [
        { id: "shadows", label: "Shadows" },
        { id: "skills", label: "Skill-Tree" }
      ];
    }
    if (sec === 4) {
      return [
        { id: "backpack", label: "Backpack" },
        { id: "market", label: "Market" },
        { id: "profile", label: "Profile" }
      ];
    }
    return [];
  };
  
  // ==========================================
  // REAL-TIME FIRESTORE ADMIN SYNC LISTENERS
  // ==========================================
  const [adminAnnouncements, setAdminAnnouncements] = useState<any[]>([]);
  const [adminQuests, setAdminQuests] = useState<any[]>([]);
  const [adminGates, setAdminGates] = useState<any[]>([]);
  const [adminMarketItems, setAdminMarketItems] = useState<any[]>([]);

  // Real-time tracking of admin quests progress inside client
  const [adminQuestProgress, setAdminQuestProgress] = useState<Record<string, { current: number; completed: boolean; claimed: boolean }>>(() => {
    const saved = localStorage.getItem(`monarch_admin_qst_progress_${playerName}`);
    try {
      if (saved) {
        const p = JSON.parse(saved);
        if (p && typeof p === 'object' && !Array.isArray(p)) return p;
      }
      return {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(`monarch_admin_qst_progress_${playerName}`, JSON.stringify(adminQuestProgress));
  }, [adminQuestProgress, playerName]);

  useEffect(() => {
    if (!playerName) return;

    // 1. Listen live to Admin Announcements
    const unsubAnn = onSnapshot(query(collection(db, "announcements"), limit(100)), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
      });
      setAdminAnnouncements(list);
    }, (err) => {
      console.error("Announcements live sync failed:", err);
      handleFirestoreError(err, OperationType.LIST, "announcements");
    });

    // 2. Listen live to Admin Custom Quests
    const unsubQuests = onSnapshot(query(collection(db, "admin_quests"), limit(100)), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
      });
      setAdminQuests(list);
    }, (err) => {
      console.error("Admin Quests live sync failed:", err);
      handleFirestoreError(err, OperationType.LIST, "admin_quests");
    });

    // 3. Listen live to Admin Custom Gates
    const unsubGates = onSnapshot(query(collection(db, "admin_gates"), limit(100)), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
      });
      setAdminGates(list);
    }, (err) => {
      console.error("Admin Gates live sync failed:", err);
      handleFirestoreError(err, OperationType.LIST, "admin_gates");
    });

    // 3.5 Listen live to Admin Market Items
    const unsubMarket = onSnapshot(query(collection(db, "admin_market_items"), limit(100)), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
      });
      setAdminMarketItems(list);
    }, (err) => {
      console.error("Admin Market Items live sync failed:", err);
    });

    // 4. Listen live to Player Leaderboard profile to merge stats (Level, Gold, Job, Rank)
    const unsubPlayer = onSnapshot(doc(db, "leaderboard", playerName), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setGameState(prev => {
          // Compare to prevent loop re-renders
          if (
            prev.level === d.level &&
            prev.gold === d.gold &&
            prev.job === d.job &&
            prev.rank === d.rank
          ) {
            return prev;
          }
          triggerSystemToast(`⚡ SYSTEM INTRUSION DETECTED: Master Overlord updated stats directly!`);
          return {
            ...prev,
            level: d.level !== undefined && d.level !== null ? Number(d.level) : prev.level,
            exp: d.exp !== undefined && d.exp !== null ? Number(d.exp) : prev.exp,
            maxExp: d.maxExp !== undefined && d.maxExp !== null ? Number(d.maxExp) : prev.maxExp,
            gold: d.gold !== undefined && d.gold !== null ? Number(d.gold) : prev.gold,
            statPoints: d.statPoints !== undefined && d.statPoints !== null ? Number(d.statPoints) : prev.statPoints,
            baseStats: d.baseStats ?? prev.baseStats,
            job: d.job ?? prev.job,
            rank: d.rank ?? prev.rank,
            inventory: d.inventory ?? prev.inventory,
            shadows: d.shadows ?? prev.shadows,
            skills: d.skills ?? prev.skills,
            quests: d.quests ?? prev.quests,
            storyStep: d.storyStep !== undefined && d.storyStep !== null ? Number(d.storyStep) : prev.storyStep,
            manaStaked: d.manaStaked !== undefined && d.manaStaked !== null ? Number(d.manaStaked) : prev.manaStaked,
            boosterMultiplier: d.boosterMultiplier !== undefined && d.boosterMultiplier !== null ? Number(d.boosterMultiplier) : prev.boosterMultiplier,
            sigils: d.sigils !== undefined && d.sigils !== null ? Number(d.sigils) : prev.sigils,
            prestigePoints: d.prestigePoints !== undefined && d.prestigePoints !== null ? Number(d.prestigePoints) : prev.prestigePoints,
            weeklyManaAccumulated: d.weeklyManaAccumulated !== undefined && d.weeklyManaAccumulated !== null ? Number(d.weeklyManaAccumulated) : prev.weeklyManaAccumulated,
            weeklyExpAccumulated: d.weeklyExpAccumulated !== undefined && d.weeklyExpAccumulated !== null ? Number(d.weeklyExpAccumulated) : prev.weeklyExpAccumulated,
            dailyManaAccumulated: d.dailyManaAccumulated !== undefined && d.dailyManaAccumulated !== null ? Number(d.dailyManaAccumulated) : prev.dailyManaAccumulated,
            weeklyCyclesCompleted: d.weeklyCyclesCompleted !== undefined && d.weeklyCyclesCompleted !== null ? Number(d.weeklyCyclesCompleted) : prev.weeklyCyclesCompleted,
            weeklyHistory: d.weeklyHistory ?? prev.weeklyHistory,
            dailyGatesCleared: d.dailyGatesCleared !== undefined && d.dailyGatesCleared !== null ? Number(d.dailyGatesCleared) : prev.dailyGatesCleared,
            dailyFocusMinutes: d.dailyFocusMinutes !== undefined && d.dailyFocusMinutes !== null ? Number(d.dailyFocusMinutes) : prev.dailyFocusMinutes
          };
        });
      }
    }, (err) => {
      console.error("Player live-sync failed:", err);
      handleFirestoreError(err, OperationType.GET, `leaderboard/${playerName}`);
    });

    return () => {
      unsubAnn();
      unsubQuests();
      unsubGates();
      unsubMarket();
      unsubPlayer();
    };
  }, [playerName]);

  // Calculate metabolic targets from profile values
  const weightKg = onboardProfile?.isMetricWeight ? onboardProfile.weight : Math.round(onboardProfile?.weight * 0.453592) || 75;
  const userPlan = generatePlan(onboardProfile?.focusGoal || "build_muscle", weightKg);
  const targetCalories = userPlan?.calorieGoal || 2800;
  const targetProtein = userPlan?.proteinG || 140;
  
  // Game States
  const [gameState, setGameState] = useState<GameState>(() => {
    // Attempt local storage load
    const key = `monarch_save_v4_reset_${playerName}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Auto-update or migrate costs/power for shadows and skills from SHADOWS_LIST and SKILLS_LIST in data.ts
        const migratedShadows = (parsed.shadows || []).map((s: any) => {
          const fresh = SHADOWS_LIST.find(f => f.id === s.id);
          return fresh ? { ...s, cost: fresh.cost, power: fresh.power } : s;
        });
        if (migratedShadows.length === 0) {
          migratedShadows.push(...SHADOWS_LIST);
        }
        
        const migratedSkills = (parsed.skills || []).map((sk: any) => {
          const fresh = SKILLS_LIST.find(f => f.id === sk.id);
          return fresh ? { ...sk, cost: fresh.cost, levelRequired: fresh.levelRequired } : sk;
        });
        if (migratedSkills.length === 0) {
          migratedSkills.push(...SKILLS_LIST);
        }

        const migratedQuests = (parsed.quests || []).map((q: any) => {
          if (q.id === "quest_physical") return { ...q, rewardGold: 1 };
          if (q.id === "quest_intellect") return { ...q, rewardGold: 2 };
          if (q.id === "quest_serenity") return { ...q, rewardGold: 2 };
          if (q.id === "quest_hydration") return { ...q, rewardGold: 1 };
          return q;
        });

        return {
          ...parsed,
          shadows: migratedShadows,
          skills: migratedSkills,
          quests: migratedQuests,
          manaStaked: parsed.manaStaked ?? 0,
          boosterMultiplier: parsed.boosterMultiplier ?? 1.0,
          sigils: parsed.sigils ?? 0,
          prestigePoints: parsed.prestigePoints ?? 0,
          weeklyManaAccumulated: parsed.weeklyManaAccumulated ?? 0,
          weeklyExpAccumulated: parsed.weeklyExpAccumulated ?? 0,
          dailyManaAccumulated: parsed.dailyManaAccumulated ?? 0,
          weeklyCyclesCompleted: parsed.weeklyCyclesCompleted ?? 0,
          weeklyHistory: parsed.weeklyHistory || [],
        };
      } catch (e) {
        // Fallback
      }
    }

    // Default starting state (No gold, base stats at 5, only rusty dagger, self development focus)
    return {
      level: 1,
      exp: 0,
      maxExp: 100,
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
      inventory: [], // Starts with 0 weapons as requested
      shadows: [...SHADOWS_LIST],
      skills: [...SKILLS_LIST],
      quests: [
        { id: "quest_physical", name: "Sovereign Physical Grind", description: "Complete physical training checks (e.g. 40 push-ups, squats, or planks)", target: 40, current: 0, rewardExp: 40, rewardGold: 1, completed: false, type: "Daily" },
        { id: "quest_intellect", name: "Sovereign Intellect Gate", description: "Study complex skills, write code, or read 15 pages of literature", target: 15, current: 0, rewardExp: 60, rewardGold: 2, completed: false, type: "Daily" },
        { id: "quest_serenity", name: "Abyssal Meditation & Breath", description: "Complete 15 minutes of uninterrupted mindful breathing/restoring", target: 15, current: 0, rewardExp: 50, rewardGold: 2, completed: false, type: "Daily" },
        { id: "quest_hydration", name: "Hydration & Vitality Calibration", description: "Consume 3 liters of water & log 7+ hours of deep, structured sleep", target: 3, current: 0, rewardExp: 30, rewardGold: 1, completed: false, type: "Daily" }
      ],
      storyStep: 1,
      manaStaked: 0,
      boosterMultiplier: 1.0,
      sigils: 0,
      prestigePoints: 0,
      weeklyManaAccumulated: 0,
      weeklyExpAccumulated: 0,
      dailyManaAccumulated: 0,
      weeklyCyclesCompleted: 0,
      weeklyHistory: [],
      dailyGatesCleared: 0,
      dailyFocusMinutes: 0
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

  // Leaderboard state hooks
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(false);

  // Dynamic Custom UI State hooks
  const [levelUpOverlay, setLevelUpOverlay] = useState<{ prevLevel: number; newLevel: number; statPointsEarned: number } | null>(null);
  const [milestoneOverlay, setMilestoneOverlay] = useState<{ title: string; subtitle: string; desc: string; icon?: string } | null>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState<boolean>(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState<boolean>(false);
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);
  const [dailyQuestReminder, setDailyQuestReminder] = useState<boolean>(() => {
    const saved = localStorage.getItem(`monarch_reminder_${playerName}`);
    if (saved !== null) {
      return saved === "true";
    }
    return onboardProfile?.workoutReminder ?? true;
  });
  const [selectedWeaponDetails, setSelectedWeaponDetails] = useState<any>(null);
  const maxSlots = 5 + gameState.level;
  const emptySlotsCount = Math.max(0, maxSlots - gameState.inventory.length);
  const [isDailyAllocationClaimed, setIsDailyAllocationClaimed] = useState<boolean>(() => {
    return localStorage.getItem(`monarch_daily_claim_${playerName}`) === new Date().toDateString();
  });
  const [shadowSpellEffect, setShadowSpellEffect] = useState<string | null>(null);
  const [systemToast, setSystemToast] = useState<string | null>(null);
  const [activeAnnouncements, setActiveAnnouncements] = useState<any[]>([]);

  // Ad Reward System
  const [adModalItem, setAdModalItem] = useState<any | null>(null);
  const [inspectMarketItem, setInspectMarketItem] = useState<any | null>(null);
  const [adTimeRemaining, setAdTimeRemaining] = useState<number>(30);
  const [adTouched, setAdTouched] = useState<boolean>(false);

  // Daily Summary Briefing
  const [showDailyBriefingModal, setShowDailyBriefingModal] = useState<boolean>(() => {
    return localStorage.getItem(`monarch_daily_briefing_${playerName}`) !== new Date().toDateString();
  });

  // Auto-remove mechanism for new announcements
  useEffect(() => {
    const newAnns = adminAnnouncements.filter(aa =>
      !activeAnnouncements.some(sa => sa.id === aa.id)
    );
    if (newAnns.length > 0) {
      setActiveAnnouncements(prev => [...prev, ...newAnns]);
      newAnns.forEach(na => {
        setTimeout(() => {
          setActiveAnnouncements(prev => prev.filter(sa => sa.id !== na.id));
        }, 4000);
      });
    }
  }, [adminAnnouncements]);

  useEffect(() => {
    let timer: any;
    if (adModalItem && adTimeRemaining > 0) {
      timer = setInterval(() => {
        setAdTimeRemaining(t => Math.max(0, t - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [adModalItem, adTimeRemaining]);

  const combatPower = useMemo(() => {
    const equippedW = gameState.inventory.find(i => i.equipped && i.type === "Weapon") || null;
    const weaponAtk = equippedW 
      ? (equippedW.statBonus.strength || 0) + (equippedW.statBonus.agility || 0) + (equippedW.statBonus.intelligence || 0)
      : 0;
    const shadowPwr = gameState.shadows
      .filter(s => s.unlocked)
      .reduce((acc, s) => acc + (s.power * s.count), 0);
    
    // Unified Combat Power Formula: Stats (Core) + Weapon (Multi) + Shadow (Synergy)
    // Strength is prime, but Intelligence scales shadow effectiveness
    const corePower = (gameState.baseStats.strength * 5) + (gameState.baseStats.agility * 3) + (gameState.baseStats.intelligence * 2);
    // Weapons amplify core power; shadows provide threshold-based support
    return Math.round(corePower * (1 + (weaponAtk / 200)) + (shadowPwr * (0.05 + (gameState.baseStats.intelligence * 0.001))));
  }, [gameState]);

  const triggerSystemToast = (msg: string) => {
    setSystemToast(msg);
    setTimeout(() => {
      setSystemToast(prev => prev === msg ? null : prev);
    }, 4000);
  };

  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return localStorage.getItem(`monarch_profile_img_${playerName}`) || null;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerSystemToast("🚨 ERROR: Profile picture must be less than 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem(`monarch_profile_img_${playerName}`, base64String);
        triggerSystemToast("⚡ SYSTEM INTEGRATION: Profile picture updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // LIFE FORGE PORTAL STATES & HOOKS
  // ==========================================

  // 1. Academic Quests
  const [academicQuests, setAcademicQuests] = useState<any[]>(() => {
    const saved = localStorage.getItem(`monarch_acad_quests_${playerName}`);
    if (saved) {
      try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) {}
    }
    return [];
  });

  // 2. Bodybuilding Exercises Log
  const [bodybuildingExercises, setBodybuildingExercises] = useState<any[]>(() => {
    const saved = localStorage.getItem(`monarch_body_lifts_${playerName}`);
    if (saved) {
      try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) {}
    }
    const split = onboardProfile?.bodybuildingSplit || "push_pull_legs";
    const weightLabel = onboardProfile?.weight ? `${Math.round(onboardProfile.weight * 0.55)}kg` : "70kg";
    const lightWeight = onboardProfile?.weight ? `${Math.round(onboardProfile.weight * 0.35)}kg` : "40kg";
    
    if (split === "push_pull_legs") {
      return [
        { id: "lift_1", name: "Incline Bench Press (Push Split)", weight: lightWeight, targetSets: 4, currentSets: 0, completed: false },
        { id: "lift_2", name: "Weighted Pull-ups (Pull Split)", weight: "Bodyweight", targetSets: 4, currentSets: 0, completed: false },
        { id: "lift_3", name: "Gatekeeper Squats (Legs Split)", weight: weightLabel, targetSets: 4, currentSets: 0, completed: false }
      ];
    } else if (split === "bro_split") {
      return [
        { id: "lift_1", name: "Classic Barbell Bench Press (Chest)", weight: weightLabel, targetSets: 4, currentSets: 0, completed: false },
        { id: "lift_2", name: "Plat Pulldowns (Back Force)", weight: lightWeight, targetSets: 4, currentSets: 0, completed: false },
        { id: "lift_3", name: "Heavy Shoulder Dumbbell Press", weight: "22kg", targetSets: 3, currentSets: 0, completed: false }
      ];
    } else if (split === "upper_lower") {
      return [
        { id: "lift_1", name: "Dumbbell Floor Press (Upper Day)", weight: lightWeight, targetSets: 4, currentSets: 0, completed: false },
        { id: "lift_2", name: "Horizontal Squat Leg Press (Lower Day)", weight: "120kg", targetSets: 4, currentSets: 0, completed: false },
        { id: "lift_3", name: "Barbell Romanian Deadlift", weight: weightLabel, targetSets: 3, currentSets: 0, completed: false }
      ];
    } else {
      return [
        { id: "lift_1", name: "Barbell Squats (Full Body)", weight: weightLabel, targetSets: 3, currentSets: 0, completed: false },
        { id: "lift_2", name: "Flat Bench Press (Full Body)", weight: lightWeight, targetSets: 4, currentSets: 0, completed: false },
        { id: "lift_3", name: "Conventional Monarch Deadlifts", weight: weightLabel, targetSets: 3, currentSets: 0, completed: false }
      ];
    }
  });

  const [intakeCalories, setIntakeCalories] = useState<number>(() => {
    const saved = localStorage.getItem(`monarch_calories_${playerName}`);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [intakeProtein, setIntakeProtein] = useState<number>(() => {
    const saved = localStorage.getItem(`monarch_protein_${playerName}`);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  // 3. Career Milestones Tracker
  const [careerMilestones, setCareerMilestones] = useState<any>(() => {
    const saved = localStorage.getItem(`monarch_career_stones_${playerName}`);
    if (saved) {
      try { 
        const p = JSON.parse(saved); 
        if (p && typeof p === 'object' && !Array.isArray(p)) return p; 
      } catch (e) {}
    }
    return {
      resumeScore: 0,       // 0 or 1
      portfolioProjects: 0, // 0 to 2
      recruiterOutreach: 0, // 0 to 5
      leetcodeGrind: 0      // 0 to 10
    };
  });

  // 4. Job Guild Applications Log
  const [jobApplications, setJobApplications] = useState<any[]>(() => {
    const saved = localStorage.getItem(`monarch_job_apps_${playerName}`);
    if (saved) {
      try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) {}
    }
    return [];
  });

  // 5. Pomodoro Focus Timer States
  const [focusSecs, setFocusSecs] = useState<number>(1500);
  const [focusTarget, setFocusTarget] = useState<number>(1500);
  const [focusIsActive, setFocusIsActive] = useState<boolean>(false);
  const [focusInterval, setFocusInterval] = useState<"Work" | "Break">("Work");
  const [focusAmbient, setFocusAmbient] = useState<string>("Abyssal Silence");
  const [pomodoroFullscreen, setPomodoroFullscreen] = useState<boolean>(false);
  const [focusLogs, setFocusLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem(`monarch_focus_logs_${playerName}`);
    if (saved) {
      try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) {}
    }
    return [];
  });

  // System Enforcement Compliance Switch & Penalty Protocol configurations
  const [forceSystemEnforcement, setForceSystemEnforcement] = useState<boolean>(() => {
    const saved = localStorage.getItem(`monarch_system_enforce_${playerName}`);
    return saved !== "false"; // Default to true for authentic push!
  });
  
  // Sovereign Mana States
  const playerMaxMp = (gameState?.baseStats?.intelligence ?? 5) * 10 + 100;
  const [playerMp, setPlayerMp] = useState<number>(() => {
    const saved = localStorage.getItem(`monarch_player_mp_${playerName}`);
    return saved ? Math.min(parseInt(saved, 10), playerMaxMp) : playerMaxMp;
  });

  const [isInPenaltyZone, setIsInPenaltyZone] = useState<boolean>(() => {
    return localStorage.getItem(`monarch_penalty_zone_${playerName}`) === "true";
  });
  const [penaltyTimeLeft, setPenaltyTimeLeft] = useState<number>(() => {
    const saved = localStorage.getItem(`monarch_penalty_time_${playerName}`);
    return saved ? parseInt(saved, 10) || 120 : 120;
  });
  const [penaltyClicks, setPenaltyClicks] = useState<number>(0);
  const [showPenaltyNotice, setShowPenaltyNotice] = useState<boolean>(false);
  const [penaltyDescription, setPenaltyDescription] = useState<string>("");

  // Local Form Input states (so we don't pollute the general scope)
  const [newAcadName, setNewAcadName] = useState("");
  const [newAcadDesc, setNewAcadDesc] = useState("");
  const [newAcadTarget, setNewAcadTarget] = useState<number>(3);

  const [newLiftName, setNewLiftName] = useState("");
  const [newLiftWeight, setNewLiftWeight] = useState("");
  const [newLiftSets, setNewLiftSets] = useState<number>(4);

  const [newJobCompany, setNewJobCompany] = useState("");
  const [newJobRole, setNewJobRole] = useState("");
  const [newJobStatus, setNewJobStatus] = useState("Applied");
  const [newJobNotes, setNewJobNotes] = useState("");

  // ==========================================
  // SYNC LIFECYCLE FOR FORGE PERSISTENCE
  // ==========================================
  useEffect(() => {
    localStorage.setItem(`monarch_acad_quests_${playerName}`, JSON.stringify(academicQuests));
  }, [academicQuests, playerName]);

  useEffect(() => {
    localStorage.setItem(`monarch_body_lifts_${playerName}`, JSON.stringify(bodybuildingExercises));
  }, [bodybuildingExercises, playerName]);

  useEffect(() => {
    localStorage.setItem(`monarch_calories_${playerName}`, intakeCalories.toString());
  }, [intakeCalories, playerName]);

  useEffect(() => {
    localStorage.setItem(`monarch_protein_${playerName}`, intakeProtein.toString());
  }, [intakeProtein, playerName]);

  useEffect(() => {
    localStorage.setItem(`monarch_career_stones_${playerName}`, JSON.stringify(careerMilestones));
  }, [careerMilestones, playerName]);

  useEffect(() => {
    localStorage.setItem(`monarch_job_apps_${playerName}`, JSON.stringify(jobApplications));
  }, [jobApplications, playerName]);

  useEffect(() => {
    localStorage.setItem(`monarch_focus_logs_${playerName}`, JSON.stringify(focusLogs));
  }, [focusLogs, playerName]);

  useEffect(() => {
    localStorage.setItem(`monarch_system_enforce_${playerName}`, forceSystemEnforcement.toString());
  }, [forceSystemEnforcement, playerName]);

  useEffect(() => {
    localStorage.setItem(`monarch_player_mp_${playerName}`, playerMp.toString());
  }, [playerMp, playerName]);

  useEffect(() => {
    localStorage.setItem(`monarch_penalty_zone_${playerName}`, isInPenaltyZone.toString());
  }, [isInPenaltyZone, playerName]);

  // Penalty Survival timer ticker
  useEffect(() => {
    let timerID: any = null;
    if (isInPenaltyZone && penaltyTimeLeft > 0) {
      timerID = setInterval(() => {
        setPenaltyTimeLeft(prev => {
          const nextVal = Math.max(0, prev - 1);
          localStorage.setItem(`monarch_penalty_time_${playerName}`, nextVal.toString());
          if (nextVal === 0) {
            // Escaped the penalty zone!
            setIsInPenaltyZone(false);
            localStorage.setItem(`monarch_penalty_zone_${playerName}`, "false");
            setPenaltyClicks(0);
            try {
              const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioCtx) {
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = "sine";
                osc.frequency.setValueAtTime(523.25, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 1);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
                osc.start();
                osc.stop(ctx.currentTime + 1);
              }
            } catch (e) {}
            triggerSystemToast("🛡️ PENALTY PROTOCOL CONCLUDED: You survived the Sentinel Desert. Gate parameters restored!");
          }
          return nextVal;
        });
      }, 1000);
    }
    return () => clearInterval(timerID);
  }, [isInPenaltyZone, penaltyTimeLeft, playerName]);

  // Calendar Day Transit Checker
  useEffect(() => {
    const handleDailyResetCheck = () => {
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem(`monarch_last_quest_check_date_${playerName}`) || today; // Init with today to prevent instant penalty on first load
      
      // Save today if not set so there is a baseline
      if (!localStorage.getItem(`monarch_last_quest_check_date_${playerName}`)) {
        localStorage.setItem(`monarch_last_quest_check_date_${playerName}`, today);
      }
      
      // Check if the saved date is not equal to today's date
      if (lastDate && lastDate !== today) {
        
        setGameState(prevGameState => {
          // Find how many of the standard daily quests were NOT completed
          const incompleteQuestsCount = prevGameState.quests.filter((q: any) => q.current < q.target).length;
          
          if (incompleteQuestsCount > 0) {
            // Enforce the Mana depletion penalty protocol with fair micro-mana parameters
            const expDeduct = incompleteQuestsCount * 15;
            const goldDeduct = incompleteQuestsCount * 3; // Swapped 50 to 3 for balanced economy
            const manaDeduct = incompleteQuestsCount * 5; // Reduced active MP reduction
            
            setPlayerMp(prevMp => Math.max(0, prevMp - manaDeduct));
            
            const nextExp = Math.max(0, prevGameState.exp - expDeduct);
            const nextGold = Math.max(0, prevGameState.gold - goldDeduct);
            
            // Refresh the daily quests for the new day
            const refreshed = prevGameState.quests.map((q: any) => ({
              ...q,
              current: 0,
              completed: false,
              claimed: false
            }));

            setIsDailyAllocationClaimed(false);
            localStorage.removeItem(`monarch_daily_claim_${playerName}`);

            // Try warning buzz
            try {
              const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioCtx) {
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(90, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 1.2);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.2);
                osc.start();
                osc.stop(ctx.currentTime + 1.2);
              }
            } catch (e) {}

            triggerSystemToast(`🚨 SYSTEM FAILURE DECREE: Missed daily grinds detected! Internals punctured: lost -${manaDeduct} Instinctual MP, -${expDeduct} XP, and -${goldDeduct} Sovereign Mana (MP) returned to pool!`);

            return {
              ...prevGameState,
              exp: nextExp,
              gold: nextGold,
              quests: refreshed,
              dailyGatesCleared: 0,
              dailyFocusMinutes: 0,
              dailyManaAccumulated: 0
            };
          } else {
            // Clean refresh of daily quests with no penalties!
            const refreshed = prevGameState.quests.map((q: any) => ({
              ...q,
              current: 0,
              completed: false,
              claimed: false
            }));
            
            setIsDailyAllocationClaimed(false);
            localStorage.removeItem(`monarch_daily_claim_${playerName}`);
            triggerSystemToast("🔄 NEW SHIFT COMMAND RECEIVED: Quests safely refreshed. All clean!");
            
            return {
              ...prevGameState,
              quests: refreshed,
              dailyGatesCleared: 0,
              dailyFocusMinutes: 0,
              dailyManaAccumulated: 0
            };
          }
        });
        
        // Save current date so it doesn't trigger again on reload same-day
        localStorage.setItem(`monarch_last_quest_check_date_${playerName}`, today);
      }
    };
    
    // Initial check on mount
    handleDailyResetCheck();
    
    // Poll every minute to handle midnight transition
    const dailyTimerId = setInterval(handleDailyResetCheck, 60000);
    return () => clearInterval(dailyTimerId);
  }, [playerName]);

  // Pomodoro interval ticker
  useEffect(() => {
    let intervalId: any = null;
    if (focusIsActive && focusSecs > 0) {
      intervalId = setInterval(() => {
        setFocusSecs(prev => prev - 1);
      }, 1000);
    } else if (focusSecs === 0 && focusIsActive) {
      setFocusIsActive(false);
      setPomodoroFullscreen(false);
      handleFocusTimerCompletion();
    }
    return () => clearInterval(intervalId);
  }, [focusIsActive, focusSecs]);

  // Audio synthethic alert chime
  const playSovereignChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.35); // G5
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.6);
      
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc2.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.25); // C6
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.5);
      }, 200);
    } catch (e) {
      // Inaudible if environment does not support AudioContext inside sandboxes
    }
  };

  // Pomodoro completion routine
  const handleFocusTimerCompletion = () => {
    playSovereignChime();
    const durationMins = Math.round(focusTarget / 60);
    const expAward = durationMins * 3;
    const goldAward = Math.max(1, Math.round(durationMins * 0.2));

    // Grant rewards
    addExp(expAward);
    setGameState(prev => {
      const actualGold = goldAward; // Ensure EXACT sync with backend without any caps

      const offeringItem = {
        id: `offering_${Date.now()}`,
        name: "Sovereign Cognitive Offering",
        description: "A supreme light condensed from your deep intellectual focus session. Grants +3 permanent Intelligence and +2 Perception.",
        type: "Accessory" as const,
        rarity: "Sovereign" as const,
        statBonus: { intelligence: 3, perception: 2 },
        equipped: false,
        iconName: "Gift"
      };
      return {
        ...prev,
        gold: prev.gold + actualGold,
        dailyFocusMinutes: (prev.dailyFocusMinutes ?? 0) + durationMins,
        inventory: [...prev.inventory, offeringItem]
      };
    });
    triggerSystemToast("🎁 COGNITIVE OFFERING GRANTED: Received 'Sovereign Cognitive Offering' into your memory matrix!");

    // Update Academic Quests
    setAcademicQuests(prev => {
      return prev.map(q => {
        if (!q.completed) {
          const nextVal = Math.min(q.target, q.current + 1);
          const comp = nextVal >= q.target;
          if (comp && !q.completed) {
            triggerSystemToast(`🏆 ACADEMIC ASCENSION: "${q.name}" completed! permanent INT +1 added!`);
            // Add permanent intelligence stat
            setGameState(p => ({
              ...p,
              baseStats: {
                ...p.baseStats,
                intelligence: p.baseStats.intelligence + 1
              }
            }));
          }
          return { ...q, current: nextVal, completed: comp };
        }
        return q;
      });
    });

    const newLog = `Completed a ${durationMins}m ${focusInterval} focus duel using ambient "${focusAmbient}". Gained +${expAward} EXP & +${goldAward} MP.`;
    setFocusLogs(prev => [newLog, ...prev.slice(0, 30)]);
    triggerSystemToast(`🔮 FOCUS MATRIX RESTORED: Gained +${expAward} EXP and +${goldAward} MP! Academic focus has sharpened!`);
  };

  const [forgeSubTab, setForgeSubTab] = useState<"academics" | "fitness" | "career">("academics");

  // Helper stats boosters
  const addStrengthPoints = (amt: number) => {
    setGameState(prev => ({
      ...prev,
      baseStats: { ...prev.baseStats, strength: prev.baseStats.strength + amt }
    }));
  };

  const addIntellectPoints = (amt: number) => {
    setGameState(prev => ({
      ...prev,
      baseStats: { ...prev.baseStats, intelligence: prev.baseStats.intelligence + amt }
    }));
  };

  const addPerceptionPoints = (amt: number) => {
    setGameState(prev => ({
      ...prev,
      baseStats: { ...prev.baseStats, perception: prev.baseStats.perception + amt }
    }));
  };

  const addAgilityPoints = (amt: number) => {
    setGameState(prev => ({
      ...prev,
      baseStats: { ...prev.baseStats, agility: prev.baseStats.agility + amt }
    }));
  };

  const addVitalityPoints = (amt: number) => {
    setGameState(prev => ({
      ...prev,
      baseStats: { ...prev.baseStats, vitality: prev.baseStats.vitality + amt }
    }));
  };

  const awardGold = (amt: number) => {
    setGameState(prev => ({
      ...prev,
      gold: prev.gold + amt
    }));
  };

  // 1. Academics Handlers
  const addAcademicQuest = () => {
    if (!newAcadName.trim() || !newAcadDesc.trim()) {
      triggerSystemToast("⚠️ Form incomplete! Enter a name and syllabus details.");
      return;
    }
    const newQuest = {
      id: `acad_custom_${Date.now()}`,
      name: newAcadName,
      desc: newAcadDesc,
      target: newAcadTarget || 3,
      current: 0,
      completed: false
    };
    setAcademicQuests(prev => [...prev, newQuest]);
    setNewAcadName("");
    setNewAcadDesc("");
    setNewAcadTarget(3);
    triggerSystemToast("📖 ACADEMIC OBJECTIVE SET: Inscribed syllabus blueprint onto your memory logs!");
  };

  const deleteAcademicQuest = (id: string) => {
    setAcademicQuests(prev => prev.filter(q => q.id !== id));
    triggerSystemToast("🗑️ OBJECTIVE DISINTEGRATED: Dissolved scholarship task.");
  };

  const incrementAcademicQuest = (id: string, amt: number) => {
    setAcademicQuests(prev => prev.map(q => {
      if (q.id === id) {
        const nextVal = Math.min(q.target, q.current + amt);
        const comp = nextVal >= q.target;
        if (comp && !q.completed) {
          playLootSound();
          addExp(25);
          awardGold(5); // Balanced reward from 50 to 5 MP
          addIntellectPoints(1);
          triggerSystemToast(`🔮 INT EXPANSION: "${q.name}" cleared! permanent Intelligence +1 point obtained! (+5 MP)`);
        } else {
          playSelectSound();
        }
        return { ...q, current: nextVal, completed: comp };
      }
      return q;
    }));
  };

  // 2. Bodybuilding Handlers
  const addLiftWorkout = () => {
    if (!newLiftName.trim() || !newLiftWeight.trim()) {
      triggerSystemToast("⚠️ Gym module incomplete! Enter target exercise & load weight.");
      return;
    }
    const newLift = {
      id: `lift_custom_${Date.now()}`,
      name: newLiftName,
      weight: newLiftWeight,
      targetSets: newLiftSets || 4,
      currentSets: 0,
      completed: false
    };
    setBodybuildingExercises(prev => [...prev, newLift]);
    setNewLiftName("");
    setNewLiftWeight("");
    setNewLiftSets(4);
    triggerSystemToast("🏋️ PHYSIQUE SPEC SET: Added specialized heavy set benchmark.");
  };

  const deleteLiftWorkout = (id: string) => {
    setBodybuildingExercises(prev => prev.filter(l => l.id !== id));
    triggerSystemToast("🗑️ EXERCISE REMOVED: Deleted training benchmark.");
  };

  const incrementLiftSet = (id: string) => {
    setBodybuildingExercises(prev => prev.map(l => {
      if (l.id === id) {
        const nextVal = Math.min(l.targetSets, l.currentSets + 1);
        const comp = nextVal >= l.targetSets;
        if (comp && !l.completed) {
          playLootSound();
          addExp(15);
          awardGold(3); // Adjusted from 45 to 3 MP to be fair and balanced
          // Randomly reward STR or VIT
          const isStr = Math.random() > 0.5;
          if (isStr) {
            addStrengthPoints(1);
            setMilestoneOverlay({
              title: "PHYSIQUE EXERCISE COMPLETED",
              subtitle: `Cleared: ${l.name}`,
              desc: "You've successfully completed the target sets! Strength has permanently increased by +1.",
              icon: "💪"
            });
          } else {
            addVitalityPoints(1);
            setMilestoneOverlay({
              title: "PHYSIQUE EXERCISE COMPLETED",
              subtitle: `Cleared: ${l.name}`,
              desc: "You've successfully completed the target sets! Vitality has permanently increased by +1.",
              icon: "❤️"
            });
          }
        } else {
          playDaggerSwipe();
          triggerSystemToast(`🔥 SET RECORDED: Set ${nextVal}/${l.targetSets} of ${l.name} logged.`);
        }
        return { ...l, currentSets: nextVal, completed: comp };
      }
      return l;
    }));
  };

  // 3. Career Handlers
  const completeResumeObjective = () => {
    if (careerMilestones.resumeScore > 0) return;
    playLootSound();
    addExp(25);
    awardGold(5); // Adjusted from 50 to 5 MP to match the micro-mana grid
    addAgilityPoints(1);
    setCareerMilestones(prev => ({ ...prev, resumeScore: 1 }));
    setMilestoneOverlay({
      title: "CAREER MILESTONE ACHEIVED",
      subtitle: "Resume Refactored",
      desc: "Your professional presentation matrix has been established.",
      icon: "💼"
    });
  };

  const incrementPortfolioProjects = () => {
    if (careerMilestones.portfolioProjects >= 2) return;
    playLootSound();
    const nextVal = careerMilestones.portfolioProjects + 1;
    addExp(35);
    awardGold(10); // Adjusted from 75 to 10 MP for balance
    addIntellectPoints(2);
    setCareerMilestones(prev => ({ ...prev, portfolioProjects: nextVal }));
    if (nextVal >= 2) {
      setMilestoneOverlay({
        title: "SYSTEM ARCHITECTURE COMPLETED",
        subtitle: "Portfolio Finalized",
        desc: "You have built the essential apps to show recruiters your power.",
        icon: "💻"
      });
    } else {
      triggerSystemToast(`💼 SYSTEM ARCHITECTURE: Portfolio project ${nextVal}/2 published! Intelligence +2!`);
    }
  };

  const incrementRecruiterOutreach = () => {
    if (careerMilestones.recruiterOutreach >= 5) return;
    playSelectSound();
    const nextVal = careerMilestones.recruiterOutreach + 1;
    awardGold(2); // Balanced step reward
    if (nextVal === 5) {
      playLootSound();
      addExp(35);
      awardGold(5); // Completion bonus
      addPerceptionPoints(2);
      setMilestoneOverlay({
        title: "NETWORKING CONQUERED",
        subtitle: "Max Outreach Reached",
        desc: "You've successfully contacted 5 recruiters and built an initial network.",
        icon: "🤝"
      });
    } else {
      triggerSystemToast(`💼 SOCIAL LINK: Recruiter outreach conversation logged (${nextVal}/5)`);
    }
    setCareerMilestones(prev => ({ ...prev, recruiterOutreach: nextVal }));
  };

  const incrementLeetcodeGrind = () => {
    if (careerMilestones.leetcodeGrind >= 10) return;
    playSelectSound();
    const nextVal = careerMilestones.leetcodeGrind + 1;
    awardGold(1); // Standard mini challenge reward
    if (nextVal === 10) {
      playLootSound();
      addExp(75);
      awardGold(5); // Decent completion bonus
      addIntellectPoints(3);
      setMilestoneOverlay({
        title: "ALGORITHMIC MARSHAL",
        subtitle: "10 LeetCode Problems Solved",
        desc: "You cleared 10 complex problem battles! Your intellect has ascended.",
        icon: "🧩"
      });
    } else {
      triggerSystemToast(`💼 PUZZLE CLEARED: Algorithmic problem solved (${nextVal}/10)`);
    }
    setCareerMilestones(prev => ({ ...prev, leetcodeGrind: nextVal }));
  };

  const addJobApplication = () => {
    if (!newJobCompany.trim() || !newJobRole.trim()) {
      triggerSystemToast("⚠️ Form incomplete! Enter recruitment company & job title.");
      return;
    }
    const newApp = {
      id: `job_custom_${Date.now()}`,
      company: newJobCompany,
      role: newJobRole,
      status: newJobStatus,
      notes: newJobNotes || "Applied via guild board recruitment channels"
    };
    setJobApplications(prev => [...prev, newApp]);
    awardGold(3); // Balanced reward from 35 to 3 MP
    addExp(5);
    setNewJobCompany("");
    setNewJobRole("");
    setNewJobNotes("");
    triggerSystemToast(`💼 REGISTRATION BOUNTY: Tracked job at ${newJobCompany}! Gained +3 Mana (MP) and +5 EXP!`);
  };

  const updateJobStatus = (id: string, nextStatus: string) => {
    setJobApplications(prev => prev.map(app => {
      if (app.id === id) {
        if (nextStatus === "Offer Unlocked" && app.status !== "Offer Unlocked") {
          playSovereignChime();
          addExp(200);
          awardGold(50); // Balanced from 1000 to 50 MP (huge milestone equivalent to 2.5x average holdings)
          triggerSystemToast("👑 SOVEREIGN OFFER SECURED! You obtained an official guild career offer! +200 EXP & +50 Mana (MP) infused!");
        } else {
          playSelectSound();
          triggerSystemToast(`💼 APPLICATION STATUS: ${app.company} status updated to [${nextStatus}].`);
        }
        return { ...app, status: nextStatus };
      }
      return app;
    }));
  };

  const deleteJobApplication = (id: string) => {
    setJobApplications(prev => prev.filter(app => app.id !== id));
    triggerSystemToast("🗑️ APPLICATION EXPUNGED: Removed job entry from databases.");
  };

  // Auto-save both locally and to Cloud Firestore (with debounce) whenever progress stats change
  const lastCloudSavedRef = useRef<string>("");
  useEffect(() => {
    localStorage.setItem(`monarch_save_v4_reset_${playerName}`, JSON.stringify(gameState));
  }, [gameState, playerName]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const dataToSave = {
      playerName,
      onboardProfile,
      gameState,
      academicQuests,
      bodybuildingExercises,
      intakeCalories,
      intakeProtein,
      careerMilestones,
      jobApplications,
      focusLogs,
      forceSystemEnforcement,
      playerMp,
      isInPenaltyZone,
      v3_reset: true,
      updatedAt: new Date().toISOString()
    };

    const serialized = JSON.stringify(dataToSave);
    if (serialized === lastCloudSavedRef.current) return;
    lastCloudSavedRef.current = serialized;

    const timer = setTimeout(async () => {
      try {
        const path = `users/${uid}`;
        await setDoc(doc(db, "users", uid), dataToSave);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    playerName,
    onboardProfile,
    gameState,
    academicQuests,
    bodybuildingExercises,
    intakeCalories,
    intakeProtein,
    careerMilestones,
    jobApplications,
    focusLogs,
    forceSystemEnforcement,
    playerMp,
    isInPenaltyZone
  ]);

  // Auto-accumulate Weekly Mana Progress on gold (MP) gains
  const prevGoldRef = useRef(gameState.gold);
  useEffect(() => {
    if (gameState.gold > prevGoldRef.current) {
      const diff = gameState.gold - prevGoldRef.current;
      prevGoldRef.current = gameState.gold;
      
      const DAILY_MANA_CAP = 6; // Maximum 6 MP can count toward the 30 MP weekly milestone per day.
      const currentDaily = gameState.dailyManaAccumulated ?? 0;
      const potentialIncrease = Math.min(diff, Math.max(0, DAILY_MANA_CAP - currentDaily));
      
      if (potentialIncrease > 0) {
        setGameState(prev => {
          const nextWeekly = Math.min(30, (prev.weeklyManaAccumulated ?? 0) + potentialIncrease);
          const nextDaily = (prev.dailyManaAccumulated ?? 0) + potentialIncrease;
          return {
            ...prev,
            weeklyManaAccumulated: nextWeekly,
            dailyManaAccumulated: nextDaily
          };
        });
        
        const remainingToday = DAILY_MANA_CAP - (currentDaily + potentialIncrease);
        if (remainingToday === 0) {
          triggerSystemToast("⚡ WEEKLY MP CAP REACHED TODAY: You gained today's maximum of +6 weekly progress Mana Points! Return tomorrow for more weekly development.");
        } else {
          triggerSystemToast(`🔮 WEEKLY DEVELOPMENT BOOST: +${potentialIncrease} MP stored in weekly milestone reserves! [${remainingToday} left today]`);
        }
      } else {
        triggerSystemToast("⚖️ DAILY ROUTINE SAFEGUARD: Weekly target contribution is capped at 6 MP per day to cultivate solid, long-term habit patterns! Standard MP (Gold) earned successfully.");
      }
    } else {
      prevGoldRef.current = gameState.gold;
    }
  }, [gameState.gold, gameState.dailyManaAccumulated]);

  // Evaluate Weekly Completion & History Logging
  useEffect(() => {
    const curExp = gameState.weeklyExpAccumulated ?? 0;
    const curMp = gameState.weeklyManaAccumulated ?? 0;
    
    // Evaluate realistic scaling bounds based on restructured XP paths
    const targetExp = gameState.level * 300 + 1500; 
    const targetMp  = 30;

    if (curExp > 0 && curMp > 0 && curExp >= targetExp && curMp >= targetMp) {
      
      setTimeout(() => {
        setMilestoneOverlay({
          title: "WEEKLY ALLOCATION COMPLETE 🏆",
          subtitle: "Absolute Sovereign Zenith",
          desc: `Masterful! You shattered your weekly targets (${targetExp} XP / ${targetMp} MP). The system has permanently inscribed this victory and unlocked +1 Prestige Sigil symbol for your arsenal.`,
          icon: "👑"
        });
        playSovereignChime();
        
        setGameState(p => {
          const newHistory = [...(p.weeklyHistory || [])];
          newHistory.unshift({
             weekStart: new Date().toLocaleDateString(),
             mp: curMp,
             exp: curExp,
             targetMp,
             targetExp
          });
          
          // Keep only history for the last 10 rounds
          if (newHistory.length > 10) newHistory.pop();
          
          return {
            ...p,
            sigils: (p.sigils ?? 0) + 1,
            weeklyManaAccumulated: 0,
            weeklyExpAccumulated: 0,
            weeklyCyclesCompleted: (p.weeklyCyclesCompleted ?? 0) + 1,
            weeklyHistory: newHistory
          };
        });
      }, 800);
    }
  }, [gameState.weeklyExpAccumulated, gameState.weeklyManaAccumulated, gameState.level]);

    // Firebase Leaderboard Synchronizer Effect
    useEffect(() => {
      let active = true;
      const syncLeaderboard = async () => {
        try {
          await saveToLeaderboard(playerName, gameState.level, gameState.gold, gameState.job, gameState.rank);
        } catch (err) {
          console.error("Leaderboard synchronization failed", err);
        }
      };
      
      // Simple debounce/timeout so we don't spam Firestore on rapid changes
      const t = setTimeout(() => {
        if (active) {
          syncLeaderboard();
        }
      }, 10000); // 10 seconds debounce for extreme scale
      
      return () => {
        active = false;
        clearTimeout(t);
      };
    }, [playerName, gameState.level, gameState.gold, gameState.job, gameState.rank]);

  // Fetch Leaderboard entries when active tab is "leaderboard"
  useEffect(() => {
    if (activeTab === "leaderboard") {
      setLoadingLeaderboard(true);
      fetchLeaderboard()
        .then(data => {
          setLeaderboardData(data);
          setLoadingLeaderboard(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingLeaderboard(false);
        });
    }
  }, [activeTab]);

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
        colorClass: "from-slate-700/35 via-zinc-800/35 to-stone-900/35 border-zinc-700/40 backdrop-blur-lg",
        auraStyle: "opacity-20 hover:opacity-30",
        effectText: "Fragile battle bandages & dimmed grey outline active.",
        desc: "Exhibits wounds and a shattered posture from survival in the hidden Temple.",
        eyes: "opacity-10 text-slate-500",
        graphics: "border-slate-800/30 bg-slate-950/20"
      };
    }
    if (lv <= 29) {
      return {
        title: "Trail Challenger",
        colorClass: "from-blue-950/35 via-slate-900/35 to-slate-950/35 border-blue-500/30 backdrop-blur-lg",
        auraStyle: "opacity-45 shadow-[shadow-blue-500/5_inset]",
        effectText: "Wounds fully healed. Glowing neon blue-tinted eyes.",
        desc: "Your energy circuit connects. Sleek physical posture and aura forms.",
        eyes: "opacity-100 text-cyan-400 animate-pulse",
        graphics: "border-blue-500/15 bg-blue-950/15"
      };
    }
    if (lv <= 47) {
      return {
        title: "Gatecrusher Specialist",
        colorClass: "from-cyan-950/35 via-slate-900/35 to-indigo-950/35 border-cyan-400/30 backdrop-blur-lg",
        auraStyle: "opacity-60 shadow-[0_0_20px_rgba(34,211,238,0.1)]",
        effectText: "Radiant deep cyan wings manifested. Pulsing circular energy rings.",
        desc: "Dimensional gravity bends around you. Capable of solo-clearing mid gates.",
        eyes: "opacity-100 text-cyan-300 animate-ping",
        graphics: "border-cyan-500/25 bg-cyan-950/15"
      };
    }
    if (lv <= 69) {
      return {
        title: "Shadow Overlord",
        colorClass: "from-indigo-950/35 via-slate-950/35 to-indigo-900/35 border-indigo-400/30 backdrop-blur-lg",
        auraStyle: "opacity-80 shadow-[0_0_30px_rgba(129,140,248,0.15)]",
        effectText: "Rich indigo shadow vapors. Horizontal crawl static discharges.",
        desc: "The darkness list obeys. Lightning sparks surge through carbon tissue armor plates.",
        eyes: "opacity-100 text-indigo-400",
        graphics: "border-indigo-400/20 bg-indigo-950/15"
      };
    }
    if (lv <= 89) {
      return {
        title: "Abyssal General",
        colorClass: "from-violet-950/35 via-cyan-950/35 to-blue-950/35 border-cyan-400/30 backdrop-blur-lg",
        auraStyle: "opacity-95 shadow-[0_0_40px_rgba(34,211,238,0.25)]",
        effectText: "High-velocity cyan lightning mesh. Dark void power shockwaves.",
        desc: "Pure shadow force bends gravity inside dungeons. Absolute command.",
        eyes: "opacity-100 text-cyan-300",
        graphics: "border-cyan-400/25 bg-cyan-950/20"
      };
    }
    return {
      title: "Sovereign Monarch",
      colorClass: "from-yellow-950/30 via-purple-950/30 to-slate-950/35 border-yellow-500/40 backdrop-blur-lg shadow-lg shadow-yellow-500/5",
      auraStyle: "opacity-100 shadow-[0_0_50px_rgba(234,179,8,0.3)]",
      effectText: "Ethereal floating gold crown with violet amethysts. Infinite auras.",
      desc: "Cosmic level presence. Command legions in the hundreds of millions.",
      eyes: "opacity-100 text-purple-400",
      graphics: "border-yellow-500/35 bg-purple-950/10"
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
      const currentWeekly = prev.weeklyExpAccumulated ?? 0;
      const allowedAmt = Math.max(0, 3000 - currentWeekly);
      if (allowedAmt <= 0) {
        // Already hit the 3000 weekly XP cap!
        return prev;
      }
      const actualAmt = Math.min(amt, allowedAmt);
      oldLevel = prev.level;
      let newExp = prev.exp + actualAmt;
      let newLevel = prev.level;
      let max = prev.maxExp;
      let statPoints = prev.statPoints;
      const newWeeklyExp = currentWeekly + actualAmt;

      while (newExp >= max) {
        newExp -= max;
        newLevel += 1;
        statPoints += 5; // Exactly 5 more stat points to allocate per level as requested
        max = Math.round(100 + Math.pow(newLevel, 1.9) * 15 + Math.pow(newLevel, 2.8) * 0.15);
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
        statPoints,
        weeklyExpAccumulated: newWeeklyExp
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
    
    // Calculate prestige halo multiplier and economic booster
    const equippedPremiumCount = gameState.inventory.filter(item => item.equipped && (item.rarity === "S" || item.rarity === "National" || item.rarity === "Sovereign")).length;
    const sigilsCount = gameState.sigils ?? 0;
    const rawBooster = gameState.boosterMultiplier ?? 1.0;
    const prestigeHaloMultiplier = 1.0 + (equippedPremiumCount * 0.15) + (sigilsCount * 0.10) + (rawBooster - 1.0);
    const finalGoldAward = Math.round(quest.rewardGold * prestigeHaloMultiplier);

    // Add reward
    addExp(quest.rewardExp);
    setPlayerMp(prev => Math.min(playerMaxMp, prev + 25)); // Completing daily quest restores 25 MP!
    setGameState(prev => {
      const list = prev.quests.map((q: any) => {
        if (q.id === quest.id) {
          return { ...q, claimed: true }; 
        }
        return q;
      });
      const actualGold = finalGoldAward; // Ensure EXACT sync with backend without any caps
      return {
        ...prev,
        gold: prev.gold + actualGold,
        quests: list
      };
    });

    // Trigger premium center level up overlay style cinematic popup
    setMilestoneOverlay({
      title: "QUEST BOUNTY CLAIMS",
      subtitle: quest.name,
      desc: `Sovereign discipline has granted +${quest.rewardExp} EXP and +${finalGoldAward} MP!`,
      icon: "⚡"
    });
  };

  // Main Daily System Allocation Bounty (2 MP and 200 XP)
  const claimDailyAllocation = () => {
    const allCompleted = gameState.quests.every((q: any) => q.current >= q.target);
    if (!allCompleted || isDailyAllocationClaimed) return;

    playLootSound();
    setIsDailyAllocationClaimed(true);
    localStorage.setItem(`monarch_daily_claim_${playerName}`, new Date().toDateString());

    const finalDailyGold = 2;

    addExp(200);
    setGameState(prev => {
      const actualGold = finalDailyGold; // Ensure EXACT sync with backend without any caps
      return {
        ...prev,
        gold: prev.gold + actualGold
      };
    });

    // Trigger premium full screen cinematic milestone overlay
    setMilestoneOverlay({
      title: "DAILY SYSTEM OVERLOAD",
      subtitle: "Absolute Sovereignty Archive Complete",
      desc: `Legendary! You cleared the entire Sovereign Grind today! Rewarded +200 EXP and +${finalDailyGold} MP. Keep leveling!`,
      icon: "👑"
    });
  };

  // Force system reset for next daily challenge sequence
  const resetDailyMatrix = () => {
    playSelectSound();
    setIsDailyAllocationClaimed(false);
    localStorage.removeItem(`monarch_daily_claim_${playerName}`);
    setPlayerMp(playerMaxMp); // Fully restore MP on resets!
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

  // Passive Yield Timer for Staked Mana (Economic Compounding)
  const [stakedYield, setStakedYield] = useState<number>(0);

  useEffect(() => {
    if (!gameState.manaStaked || gameState.manaStaked <= 0) return;
    const interval = setInterval(() => {
      const baseStaked = gameState.manaStaked || 0;
      // Diminishing returns scaling: interest drops from 1.5% to 0.4% as pool grows to simulate liquidity traps
      const rate = Math.max(0.003, 0.015 - (baseStaked / 100000) * 0.01);
      const accrued = Math.max(1, Math.round(baseStaked * rate));
      setStakedYield(prev => prev + accrued);
    }, 10000); // Accrues yield every 10 seconds of active focus!
    return () => clearInterval(interval);
  }, [gameState.manaStaked]);

  // Stake Mana into Central Sovereign Reserve
  const stakeMana = (qty: number) => {
    if (gameState.gold < qty) {
      triggerSystemToast("❌ UNSUFFICIENT LIQUIDITY: You do not possess enough active MP to complete this stake transfer.");
      return;
    }
    playSelectSound();
    setGameState(prev => ({
      ...prev,
      gold: prev.gold - qty,
      manaStaked: (prev.manaStaked ?? 0) + qty
    }));
    triggerSystemToast(`🏦 LIQUIDITY SECURED: Transferred +${qty} MP into Sovereign Bond Vault! Receiving compounded periodic interest.`);
  };

  // Unstake Mana from Reserve (Simulating Exit Friction fee)
  const unstakeMana = () => {
    const totalStaked = gameState.manaStaked ?? 0;
    if (totalStaked <= 0) return;
    playSelectSound();
    
    // Simulate transaction costs in classical business models (1% friction tax)
    const fee = Math.round(totalStaked * 0.015);
    const returnQty = totalStaked - fee;

    setGameState(prev => ({
      ...prev,
      gold: prev.gold + returnQty,
      manaStaked: 0
    }));
    setStakedYield(0);
    triggerSystemToast(`🏦 VAULT LIQUIDATED: Returned +${returnQty} MP to liquid check balance. A standard liquidity tax of -${fee} MP was retained by the core reserve.`);
  };

  // Harvest Compounded Yield Points on demand
  const claimStakedYield = () => {
    if (stakedYield <= 0) return;
    playLootSound();
    
    setGameState(prev => {
      const actualGold = stakedYield; // Ensure EXACT sync with backend without any caps
      return {
        ...prev,
        gold: prev.gold + actualGold
      };
    });
    triggerSystemToast(`🌾 HARVEST SECURED: Formally claimed +${stakedYield} MP of accumulated compound spatial interest into liquid reserves!`);
    setStakedYield(0);
  };

  // Scarcity Exchange Minting (MP to Sovereign Sigils)
  const mintSigil = () => {
    const exchangeRate = 1200; // 1200 Mana per Sigil (fixed gold standard rate)
    if (gameState.gold < exchangeRate) {
      triggerSystemToast(`❌ SCARCITY THRESHOLD BLOCKED: Minting a Sovereign Sigil requires exactly ${exchangeRate} MP (Reserve Standard).`);
      return;
    }
    playLootSound();
    setGameState(prev => ({
      ...prev,
      gold: prev.gold - exchangeRate,
      sigils: (prev.sigils ?? 0) + 1
    }));
    
    // Trigger cinematic milestone overlay to emphasize high premium status (Halo Effect)
    setMilestoneOverlay({
      title: "PRESTIGE SIGNATURE INSCRIBED",
      subtitle: "Sovereign Sigil Minted Successfully",
      desc: "By locking down a colossal bundle of standard supply MP, you have claimed a legendary Sovereign Sigil. This scarce asset permanently radiates a +10% Prestige Halo multiplier boosting all standard activities!",
      icon: "👑"
    });
  };

  // Purchase Economy Boosters
  const buyEconomyBooster = (type: "velocity" | "bond") => {
    if (type === "velocity") {
      const cost = 300;
      if (gameState.gold < cost) {
        triggerSystemToast(`❌ RESERVE BLOCK: Upgrading Velocity Contract requires ${cost} MP.`);
        return;
      }
      playLootSound();
      setGameState(prev => ({
        ...prev,
        gold: prev.gold - cost,
        boosterMultiplier: (prev.boosterMultiplier ?? 1.0) + 0.05
      }));
      triggerSystemToast("📈 BOOSTER INSTALLED: Prestige Index increased by +5% standard yield multiplier!");
    } else {
      const costSigils = 2;
      const currentSigils = gameState.sigils ?? 0;
      if (currentSigils < costSigils) {
        triggerSystemToast(`❌ SCARCITY DEFICIT: Securing a High-Yield Bond requires exactly ${costSigils} Sovereign Sigils.`);
        return;
      }
      playLootSound();
      setGameState(prev => ({
        ...prev,
        sigils: currentSigils - costSigils,
        boosterMultiplier: (prev.boosterMultiplier ?? 1.0) + 0.15
      }));
      setMilestoneOverlay({
        title: "BOND LIQUIDITY MATURED",
        subtitle: "Sovereign Gold-Sovereign Inflation Hegde",
        desc: "You signed a Sovereign Gold Reserve Contract using premium Sigils. Your multiplier on all activities experiences a massive permanent boost of +15%!",
        icon: "⚜️"
      });
    }
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
    kasaka_fang: { cost: 15, levelReq: 10 },
    igris_sword: { cost: 50, levelReq: 25 },
    demon_dagger: { cost: 120, levelReq: 50 },
    kamish_fang: { cost: 350, levelReq: 75 },
    sovereigns_wrath: { cost: 800, levelReq: 90 },
  };

  // High quality vector contour neon renderings for weapon previews (1000x Detailed)
  const renderNeonWeaponPreview = (itemId: string, animate = false, layer: "all" | "back" | "base" | "front" | "sparks" = "all") => {
    switch (itemId) {
      case "rusty_dagger":
        return (
          <svg 
            viewBox="0 0 100 100" 
            className={`w-full h-full pointer-events-none mx-auto transition-all duration-300 select-none ${animate ? "animate-pulse" : ""}`}
          >
            <defs>
              <linearGradient id="rustyBladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#452a10" />
                <stop offset="50%" stopColor="#8c5825" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
              <radialGradient id="rustyGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(234, 179, 8, 0.4)" />
                <stop offset="100%" stopColor="rgba(234, 179, 8, 0)" />
              </radialGradient>
              <filter id="yellowNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Aura */}
            {(layer === "all" || layer === "back") && (
              <>
                <circle cx="50" cy="50" r="35" fill="url(#rustyGlow)" className="opacity-60" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(234, 179, 8, 0.15)" strokeWidth="1" strokeDasharray="3,3" />
              </>
            )}

            {/* Rusty Scrap Sparks */}
            {(layer === "all" || layer === "sparks") && (
              <g className="opacity-70">
                <path d="M 25,25 L 27,27 M 70,70 L 68,68 M 30,72 L 32,70 M 75,25 L 73,27" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="45" cy="20" r="1.2" fill="#eab308" />
                <circle cx="55" cy="78" r="1.2" fill="#eab308" />
              </g>
            )}

            {/* Weapon Art */}
            {(layer === "all" || layer === "base") && (
              <g transform="translate(0, 0)">
                {/* Handle / Wooden Grip */}
                <path d="M 22,78 L 38,62" stroke="#27190c" strokeWidth="6" strokeLinecap="round" />
                {/* Crude Leather Wrapping lines */}
                <path d="M 24,76 L 27,77 M 28,72 L 31,73 M 32,68 L 35,69" stroke="#8c5825" strokeWidth="1.5" />
                
                {/* Crude Pummel */}
                <circle cx="20" cy="80" r="4" fill="#3a230c" stroke="#eab308" strokeWidth="1" />
                
                {/* Metal Guard (Rusty bronze notched block) */}
                <path d="M 30,65 L 43,52 L 40,49 L 27,62 Z" fill="#5c3a1a" stroke="#eab308" strokeWidth="1.5" />
                <circle cx="35" cy="58" r="2" fill="#eab308" />

                {/* Rusty Blade with Notches, Cracks and Wear */}
                <path 
                  d="M 38,51 L 78,11 L 74,8 L 60,18 L 47,31 L 43,46 Z" 
                  fill="url(#rustyBladeGrad)" 
                  stroke="#eab308" 
                  strokeWidth="1.2" 
                  filter="url(#yellowNeonGlow)"
                />
                {/* Jagged Chips/Notches carved in blade */}
                <path d="M 52,37 L 54,39 L 56,36" stroke="#27190c" strokeWidth="1.5" fill="none" />
                <path d="M 64,25 L 66,27 L 68,24" stroke="#27190c" strokeWidth="1.5" fill="none" />
              </g>
            )}

            {/* Glowing / Detailed details */}
            {(layer === "all" || layer === "front") && (
              <g>
                {/* Shining White Sharp Blade Edge */}
                <path d="M 40,49 L 76,13" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" className="opacity-90" />
                
                {/* Tetanus poison trace */}
                <path d="M 65,24 S 70,18 73,15 S 76,14 78,11" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" className="opacity-80 animate-pulse" />
              </g>
            )}
          </svg>
        );

      case "kasaka_fang":
        return (
          <svg 
            viewBox="0 0 100 100" 
            className={`w-full h-full pointer-events-none mx-auto transition-all duration-300 select-none ${animate ? "animate-pulse" : ""}`}
          >
            <defs>
              <linearGradient id="kasakaBladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#083344" />
                <stop offset="50%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <radialGradient id="cyanViperGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(6, 182, 212, 0.45)" />
                <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
              </radialGradient>
              <filter id="cyanGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Radiant serpent magic aura */}
            {(layer === "all" || layer === "back") && (
              <>
                <circle cx="50" cy="50" r="38" fill="url(#cyanViperGlow)" />
                <path d="M 50,15 A 35,35 0 0,1 85,50" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1.5" strokeDasharray="5,3" />
                <path d="M 15,50 A 35,35 0 0,1 50,85" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1.5" strokeDasharray="5,3" />
              </>
            )}

            {/* Snake Ribs/Vapor particles */}
            {(layer === "all" || layer === "sparks") && (
              <g className="opacity-70">
                <path d="M 33,25 Q 30,22 28,26" fill="none" stroke="#22d3ee" strokeWidth="1" />
                <path d="M 72,75 Q 75,78 77,74" fill="none" stroke="#22d3ee" strokeWidth="1" />
                <circle cx="75" cy="35" r="1.5" fill="#22d3ee" />
                <circle cx="28" cy="62" r="1.2" fill="#22d3ee" />
              </g>
            )}

            {/* Weapon Composition - Base */}
            {(layer === "all" || layer === "base") && (
              <g>
                {/* Snake Tail/Scale Wrap Handle */}
                <path d="M 18,82 L 34,66" stroke="#0f172a" strokeWidth="6.5" strokeLinecap="round" />
                {/* Wrapping snake scales */}
                <path d="M 20,80 L 22,78 M 24,76 L 26,74 M 28,72 L 30,70 M 32,68 L 34,66" stroke="#0891b2" strokeWidth="2.2" />

                {/* Snake Fang Guard (Curved skull jaws) */}
                <path d="M 28,70 C 26,65 30,58 36,60 C 42,62 44,56 42,62 Z" fill="#1e293b" stroke="#22d3ee" strokeWidth="1.2" />
                <path d="M 30,68 L 26,62 M 34,64 L 38,58" stroke="#22d3ee" strokeWidth="1" />

                {/* Translucent venom fang blade */}
                <path 
                  d="M 34,62 C 38,55 35,42 45,30 C 55,18 75,10 82,6 C 74,20 62,38 52,48 C 45,55 34,62 34,62" 
                  fill="url(#kasakaBladeGrad)" 
                  stroke="#22d3ee" 
                  strokeWidth="1.5" 
                  filter="url(#cyanGlowFilter)"
                />
              </g>
            )}

            {/* Front details / poison flows */}
            {(layer === "all" || layer === "front") && (
              <g>
                {/* Venomous glowing core energy channel */}
                <path d="M 40,55 C 45,45 52,32 68,18" fill="none" stroke="#a5f3fc" strokeWidth="1.5" strokeLinecap="round" />

                {/* Venom Droplets dripping from blade tip */}
                <circle cx="81" cy="9" r="1.5" fill="#10b981" className="animate-pulse" />
                <path d="M 81,10 Q 82,15 80,18" fill="none" stroke="#10b981" strokeWidth="1" strokeLinecap="round" />
              </g>
            )}
          </svg>
        );

      case "igris_sword":
        return (
          <svg 
            viewBox="0 0 100 100" 
            className={`w-full h-full pointer-events-none mx-auto transition-all duration-300 select-none ${animate ? "animate-pulse" : ""}`}
          >
            <defs>
              <linearGradient id="igrisBladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e050b" />
                <stop offset="50%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <radialGradient id="bloodGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(244, 63, 94, 0.45)" />
                <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
              </radialGradient>
              <filter id="crimsonLaserGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Concentric royal seal circles */}
            {(layer === "all" || layer === "back") && (
              <>
                <circle cx="50" cy="50" r="40" fill="url(#bloodGlow)" />
                <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(244, 63, 94, 0.2)" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(244, 63, 94, 0.15)" strokeWidth="1" strokeDasharray="6,4" />
              </>
            )}

            {/* Red Lightning Arcs around sword */}
            {(layer === "all" || layer === "sparks") && (
              <g className="opacity-80">
                <path d="M 30,35 L 34,31 L 30,27" fill="none" stroke="#f43f5e" strokeWidth="1" />
                <path d="M 68,75 L 72,71 L 68,67" fill="none" stroke="#f43f5e" strokeWidth="1" />
                <path d="M 58,25 L 62,18 L 57,14" fill="none" stroke="#f43f5e" strokeWidth="1" />
              </g>
            )}

            {/* Longsword Assembly - Base */}
            {(layer === "all" || layer === "base") && (
              <g>
                {/* Two Handed royal handle hilt */}
                <path d="M 15,85 L 35,65" stroke="#090d16" strokeWidth="5.5" strokeLinecap="round" />
                <path d="M 16,84 L 18,82 M 20,80 L 22,78 M 24,76 L 26,74 M 28,72 L 30,70 M 32,68 L 34,66" stroke="#4c0519" strokeWidth="2" />

                {/* Ruby Pommel */}
                <circle cx="13" cy="87" r="4.5" fill="#e11d48" stroke="#fda4af" strokeWidth="1.2" />

                {/* Winged forward-spiked gold guard */}
                <path d="M 26,69 L 40,55 L 43,58 L 29,72 Z" fill="#ca8a04" stroke="#ca8a04" strokeWidth="1" />
                <path d="M 31,61 Q 25,54 18,52 C 24,58 31,61 31,61" fill="#ca8a04" stroke="#ca8a04" strokeWidth="1" />
                <path d="M 39,69 Q 46,76 48,83 C 42,77 39,69 39,69" fill="#ca8a04" stroke="#ca8a04" strokeWidth="1" />

                {/* Royal Blood Blade with fuller and laser thunder */}
                <path 
                  d="M 34,61 L 84,11 L 81,8 L 31,58 Z" 
                  fill="url(#igrisBladeGrad)" 
                  stroke="#f43f5e" 
                  strokeWidth="1.5" 
                  filter="url(#crimsonLaserGlow)"
                />
              </g>
            )}

            {/* Front lightning/laser line */}
            {(layer === "all" || layer === "front") && (
              <g>
                {/* Shining White Fuller centerline laser */}
                <path d="M 32,59 L 82,9" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                
                {/* Embedded runic engravings along blade */}
                <g stroke="#fda4af" strokeWidth="1" fill="none" className="opacity-80">
                  <path d="M 45,46 L 47,44" />
                  <path d="M 53,38 L 55,36" />
                  <path d="M 61,30 L 63,28" />
                  <path d="M 69,22 L 71,20" />
                </g>
              </g>
            )}
          </svg>
        );

      case "demon_dagger":
        return (
          <svg 
            viewBox="0 0 100 100" 
            className={`w-full h-full pointer-events-none mx-auto transition-all duration-300 select-none ${animate ? "animate-pulse" : ""}`}
          >
            <defs>
              <linearGradient id="demonBladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="40%" stopColor="#4338ca" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
              <radialGradient id="violetDemonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.45)" />
                <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
              </radialGradient>
              <filter id="demonicPurpleGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Demonic portal circle background */}
            {(layer === "all" || layer === "back") && (
              <>
                <circle cx="50" cy="50" r="41" fill="url(#violetDemonGlow)" />
                <path d="M 50,12 A 38,38 0 1,1 12,50" fill="none" stroke="rgba(99, 102, 241, 0.22)" strokeWidth="1.2" strokeDasharray="3,1" />
                <path d="M 32,32 L 68,68 M 32,68 L 68,32" stroke="rgba(99, 102, 241, 0.12)" strokeWidth="1" />
              </>
            )}

            {/* Demonic flames */}
            {(layer === "all" || layer === "sparks") && (
              <g className="opacity-70">
                <path d="M 23,45 Q 16,36 21,30 C 26,34 23,45 23,45" fill="rgba(129, 140, 248, 0.4)" stroke="#818cf8" strokeWidth="0.8" />
                <path d="M 77,55 Q 84,64 79,70 C 74,66 77,55 77,55" fill="rgba(129, 140, 248, 0.4)" stroke="#818cf8" strokeWidth="0.8" />
              </g>
            )}

            {/* Gothic Brutalist Demon Dagger - Base */}
            {(layer === "all" || layer === "base") && (
              <g>
                {/* Spiked pummel ring handle */}
                <circle cx="16" cy="84" r="5" fill="none" stroke="#4f46e5" strokeWidth="3" />
                <path d="M 14,81 L 11,78 M 18,87 L 21,90" stroke="#818cf8" strokeWidth="1.5" />

                {/* Gothic leather bound handle */}
                <path d="M 18,82 L 36,64" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                <path d="M 21,79 L 24,76 M 26,74 L 29,71 M 31,69 L 34,66" stroke="#312e81" strokeWidth="2.2" />

                {/* Horned beast skull guards with violet eye */}
                <path d="M 28,68 Q 24,58 34,56 Q 44,54 40,64 Z" fill="#111827" stroke="#4f46e5" strokeWidth="1.5" />
                <path d="M 26,60 L 18,52 M 42,66 L 50,74" fill="none" stroke="#818cf8" strokeWidth="1.8" />

                {/* Aggressive serrated void blades */}
                <path 
                  d="M 36,60 L 46,62 L 52,48 L 47,43 L 64,28 L 61,22 L 86,6 C 72,18 64,28 66,35 L 53,40 L 58,46 L 46,50 Z" 
                  fill="url(#demonBladeGrad)" 
                  stroke="#818cf8" 
                  strokeWidth="1.5" 
                  filter="url(#demonicPurpleGlow)"
                />
              </g>
            )}

            {/* Front Details (Violet Eye & Center Energy Ridge) */}
            {(layer === "all" || layer === "front") && (
              <g>
                <circle cx="34" cy="62" r="2.5" fill="#c084fc" className="animate-pulse" />
                {/* High-intensity pure white energy ridge down center */}
                <path d="M 38,58 L 76,14" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            )}
          </svg>
        );

      case "kamish_fang":
        return (
          <svg 
            viewBox="0 0 100 100" 
            className={`w-full h-full pointer-events-none mx-auto transition-all duration-300 select-none ${animate ? "animate-pulse" : ""}`}
          >
            <defs>
              <linearGradient id="kamishBladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4c0519" />
                <stop offset="50%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
              <radialGradient id="dragonFireGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(219, 39, 119, 0.5)" />
                <stop offset="100%" stopColor="rgba(219, 39, 119, 0)" />
              </radialGradient>
              <filter id="kamishAestheticGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Epic dragon fire storm backdrop */}
            {(layer === "all" || layer === "back") && (
              <>
                <circle cx="50" cy="50" r="42" fill="url(#dragonFireGlow)" />
                <path d="M 50,8 A 42,42 0 0,1 92,50 A 42,42 0 0,1 50,92 A 42,42 0 0,1 8,50" fill="none" stroke="rgba(219, 39, 119, 0.25)" strokeWidth="1.5" strokeDasharray="8,5" />
              </>
            )}
            
            {/* Floating embers */}
            {(layer === "all" || layer === "sparks") && (
              <g className="opacity-90">
                <circle cx="45" cy="18" r="1.5" fill="#f43f5e" />
                <circle cx="78" cy="28" r="1" fill="#facc15" />
                <circle cx="30" cy="72" r="1.2" fill="#ca8a04" />
                <circle cx="68" cy="80" r="1.8" fill="#fda4af" />
              </g>
            )}

            {/* Dragon Bone Kamish Fang - Base */}
            {(layer === "all" || layer === "base") && (
              <g>
                {/* Dragon claw bound bone tail grip segment */}
                <path d="M 16,84 L 32,68" stroke="#1c1917" strokeWidth="7" strokeLinecap="round" />
                <path d="M 15,83 L 13,85 M 19,79 L 18,81 M 23,75 L 22,77 M 27,71 L 26,73" stroke="#ca8a04" strokeWidth="2.5" />
                <circle cx="13" cy="87" r="3.2" fill="#881337" />

                {/* Skull spinal dragon vertebrae guard */}
                <path d="M 26,72 C 22,66 28,58 35,62 C 41,56 46,65 38,72 Z" fill="#292524" stroke="#db2777" strokeWidth="1.5" />
                <circle cx="31" cy="65" r="2" fill="#db2777" />

                {/* Curved organic spiky bone dragon edge blade */}
                <path 
                  d="M 32,68 C 36,60 32,48 42,32 C 52,16 78,8 85,5 C 72,18 58,28 48,38 C 38,48 32,68 32,68" 
                  fill="url(#kamishBladeGrad)" 
                  stroke="#db2777" 
                  strokeWidth="1.8" 
                  filter="url(#kamishAestheticGlow)"
                />
                {/* Spine spikes jutting out the outer curve */}
                <path d="M 46,31 Q 50,22 45,26 M 55,21 Q 62,13 56,17 L 68,10" fill="none" stroke="#db2777" strokeWidth="1.5" />
              </g>
            )}

            {/* High energy front mana line */}
            {(layer === "all" || layer === "front") && (
              <g>
                {/* Mana transmission core line - glowing pure yellow/hot pink */}
                <path d="M 36,60 Q 45,46 72,15" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 36,60 Q 45,46 72,15" fill="none" stroke="#facc15" strokeWidth="3" className="opacity-45" style={{ filter: "blur(2px)" }} />
              </g>
            )}
          </svg>
        );

      case "sovereigns_wrath":
        return (
          <svg 
            viewBox="0 0 100 100" 
            className={`w-full h-full pointer-events-none mx-auto transition-all duration-300 select-none ${animate ? "animate-pulse" : ""}`}
          >
            <defs>
              <linearGradient id="sovereignBlade1" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="40%" stopColor="#581c87" />
                <stop offset="80%" stopColor="#db2777" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="sovereignBlade2" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="40%" stopColor="#31105e" />
                <stop offset="80%" stopColor="#db2777" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
              <radialGradient id="voidAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(236, 72, 153, 0.55)" />
                <stop offset="50%" stopColor="rgba(88, 28, 135, 0.3)" />
                <stop offset="100%" stopColor="rgba(2, 6, 23, 0)" />
              </radialGradient>
              <filter id="etherealAstralFilter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Sovereign crown & Void nebula backdrop */}
            {(layer === "all" || layer === "back") && (
              <>
                <circle cx="50" cy="50" r="45" fill="url(#voidAura)" />
                {/* Concentric mystical runic star map */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(244, 114, 182, 0.28)" strokeWidth="1" strokeDasharray="3,1" />
                <path d="M 50,5 L 50,95 M 5,50 L 95,50" stroke="rgba(244, 114, 182, 0.12)" strokeWidth="1.2" strokeDasharray="2,5" />
              </>
            )}
            
            {/* Floating violet-pink sparkles / Crown details */}
            {(layer === "all" || layer === "sparks") && (
              <g>
                <g className="opacity-95">
                  <circle cx="50" cy="18" r="2" fill="#ffffff" />
                  <circle cx="25" cy="35" r="1.5" fill="#f472b6" />
                  <circle cx="75" cy="35" r="1.2" fill="#db2777" />
                  <circle cx="18" cy="62" r="1.8" fill="#e879f9" />
                  <circle cx="82" cy="62" r="1.5" fill="#ffffff" />
                  <circle cx="35" cy="80" r="1.0" fill="#f472b6" />
                  <circle cx="65" cy="80" r="1.2" fill="#c084fc" />
                </g>
                {/* Floating crown insignia centered at top */}
                <g transform="translate(42, 8)" stroke="#ec4899" strokeWidth="1" fill="none" className="opacity-80">
                  <path d="M 2,12 L 14,12 L 16,5 L 11,8 L 8,2 L 5,8 L 0,5 Z" fill="rgba(236,72,153,0.15)" />
                </g>
              </g>
            )}

            {/* Twin Void blades intersecting elegantly - Base structure */}
            {(layer === "all" || layer === "base") && (
              <g>
                {/* 1. LEFT HAND SABER */}
                <g transform="translate(0, 0)">
                  <path d="M 12,88 L 32,68" stroke="#090514" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 13,87 L 15,85 M 18,82 L 20,80 M 23,77 L 25,75 M 28,72 L 30,70" stroke="#db2777" strokeWidth="1.8" />
                  <circle cx="10" cy="90" r="4" fill="#ec4899" stroke="#f472b6" strokeWidth="1" />

                  <path d="M 22,72 L 34,60 M 23,73 C 25,65 31,68 31,68" stroke="#ca8a04" strokeWidth="1.2" fill="none" />
                  
                  <path 
                    d="M 30,70 L 60,40 L 78,12 L 48,34 L 30,70" 
                    fill="url(#sovereignBlade1)" 
                    stroke="#ec4899" 
                    strokeWidth="1.5" 
                    filter="url(#etherealAstralFilter)"
                  />
                </g>

                {/* 2. RIGHT HAND SABER */}
                <g transform="translate(0, 0)">
                  <path d="M 88,88 L 68,68" stroke="#090514" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 87,87 L 85,85 M 82,82 L 80,80 M 77,77 L 75,75 M 72,72 L 70,70" stroke="#db2777" strokeWidth="1.8" />
                  <circle cx="90" cy="90" r="4" fill="#ec4899" stroke="#f472b6" strokeWidth="1" />

                  <path d="M 78,72 L 66,60 M 77,73 C 75,65 69,68 69,68" stroke="#ca8a04" strokeWidth="1.2" fill="none" />
                  
                  <path 
                    d="M 70,70 L 40,40 L 22,12 L 52,34 L 70,70" 
                    fill="url(#sovereignBlade2)" 
                    stroke="#ec4899" 
                    strokeWidth="1.5" 
                    filter="url(#etherealAstralFilter)"
                  />
                </g>
              </g>
            )}

            {/* High intensity White central beams */}
            {(layer === "all" || layer === "front") && (
              <g>
                <path d="M 32,68 L 72,18" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M 68,68 L 28,18" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            )}
          </svg>
        );

      default:
        return (
          <svg 
            viewBox="0 0 100 100" 
            className="w-16 h-16 pointer-events-none mx-auto"
          >
            <circle cx="50" cy="50" r="2" fill="#fff" />
          </svg>
        );
    }
  };

  // Rotatable 3D Weapon inspector stage utilizing layered parallax Z-axial translation offsets
  const Rotatable3DWeapon = ({ itemId }: { itemId: string }) => {
    const [rotation, setRotation] = useState({ x: -10, y: 35, z: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const currentRotationStart = useRef({ x: 0, y: 0 });
    const autoSpinActive = useRef(true);
    const animationFrameRef = useRef<number | null>(null);

    // Passive slow idle spin/wobble
    useEffect(() => {
      let lastTime = performance.now();
      const updateRef = () => {
        const now = performance.now();
        const delta = (now - lastTime) / 1000;
        lastTime = now;

        if (!isDragging && autoSpinActive.current) {
          setRotation((prev) => ({
            x: -10 + Math.sin(now * 0.001) * 8, // subtle elegant floating wobble
            y: (prev.y + delta * 25) % 360,     // slow continuous passive Y rotation (25 deg/sec)
            z: Math.cos(now * 0.0007) * 4       // micro wobble
          }));
        }
        animationFrameRef.current = requestAnimationFrame(updateRef);
      };

      animationFrameRef.current = requestAnimationFrame(updateRef);
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isDragging]);

    // Handle mouse/touch down
    const handleDragStart = (clientX: number, clientY: number) => {
      setIsDragging(true);
      autoSpinActive.current = false;
      dragStart.current = { x: clientX, y: clientY };
      currentRotationStart.current = { x: rotation.x, y: rotation.y };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      handleDragStart(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      if (e.pointerType === "mouse" || (e.touches && e.touches[0])) {
        const clientX = e.touches ? e.touches[0].clientX : (e as any).clientX;
        const clientY = e.touches ? e.touches[0].clientY : (e as any).clientY;
        handleDragStart(clientX, clientY);
      }
    };

    // Handle mouse/touch move
    const handleDragMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaX = clientX - dragStart.current.x;
      const deltaY = clientY - dragStart.current.y;

      // Sensitivity: 0.6 degrees per pixel
      const newRotationY = currentRotationStart.current.y + deltaX * 0.6;
      // Clamp X rotation to prevent flipping upside down (-60 to 60 is perfect)
      const newRotationX = Math.max(-60, Math.min(60, currentRotationStart.current.x - deltaY * 0.6));

      setRotation((prev) => ({
        ...prev,
        x: newRotationX,
        y: newRotationY,
      }));
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : (e as any).clientX;
      const clientY = e.touches ? e.touches[0].clientY : (e as any).clientY;
      handleDragMove(clientX, clientY);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      // Resume auto spin after short delay
      setTimeout(() => {
        autoSpinActive.current = true;
      }, 1500);
    };

    const resetRotation = (e: React.MouseEvent) => {
      e.stopPropagation();
      setRotation({ x: -10, y: 35, z: 0 });
      autoSpinActive.current = true;
    };

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-between pointer-events-auto">
        {/* Helper instructions overlay */}
        <div className="absolute top-2 right-2 flex items-center gap-2 z-30 select-none">
          <button 
            type="button"
            onClick={resetRotation}
            className="text-[9px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1 cursor-pointer z-40"
            title="Reset Vector Perspective"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            ALIGN VIEW
          </button>
        </div>

        {/* Outer Perspective Wrapper */}
        <div 
          className="relative w-full aspect-square flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
          style={{ perspective: "1000px" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Main 3D rotatable staging plate */}
          <div 
            className="relative w-full h-full max-w-[280px] max-h-[280px] flex items-center justify-center"
            style={{ 
              transformStyle: "preserve-3d",
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
            }}
          >
            {/* Layer 1: Radiant Back Aura Layer (Deepest Z) in Pure Blue Neon */}
            <div 
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center"
              style={{ 
                transform: "translateZ(-45px)", 
                transformStyle: "preserve-3d",
                backfaceVisibility: "visible"
              }}
            >
              <div className="w-[120%] h-[120%] opacity-90 blur-[12px] flex items-center justify-center filter sepia hue-rotate-[160deg] saturate-[5] brightness-150 contrast-125">
                {renderNeonWeaponPreview(itemId, false, "back")}
              </div>
            </div>

            {/* Layer 2: Sparks & Particle Cloud Layer */}
            <div 
              className="absolute inset-0 pointer-events-none flex items-center justify-center animate-pulse"
              style={{ 
                transform: "translateZ(-20px)",
                transformStyle: "preserve-3d",
                backfaceVisibility: "visible"
              }}
            >
              <div className="w-[110%] h-[110%] filter grayscale sepia hue-rotate-[180deg] saturate-[6] brightness-[1.8]">
                {renderNeonWeaponPreview(itemId, false, "sparks")}
              </div>
            </div>

            {/* ---- 3D VOLUMETRIC EXTRUSION (Real 3D Detailed Simulation) ---- */}
            {[-24, -18, -12, -6, 6, 12, 18, 24].map((zOffset, idx) => (
              <div 
                key={idx}
                className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30"
                style={{ 
                  transform: `translateZ(${zOffset}px)`, 
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "visible"
                }}
              >
                <div className={`w-full h-full filter grayscale sepia hue-rotate-[180deg] saturate-[4] ${Math.abs(zOffset) > 15 ? "brightness-50" : "brightness-[0.8]"}`}>
                  {renderNeonWeaponPreview(itemId, false, "base")}
                </div>
              </div>
            ))}

            {/* Layer 3: Main Armament Geometry Core Layer */}
            <div 
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              style={{ 
                transform: "translateZ(0px)", 
                transformStyle: "preserve-3d",
                backfaceVisibility: "visible",
                filter: "drop-shadow(0 0 20px rgba(6,182,212,0.8)) drop-shadow(0 0 35px rgba(6,182,212,0.4))"
              }}
            >
              <div className="w-full h-full filter grayscale sepia hue-rotate-[170deg] saturate-[8] brightness-[1.3] contrast-[1.25]">
                 {renderNeonWeaponPreview(itemId, false, "base")}
                 
                 {/* Internal Wireframe/Facet Lines overlay for "3D detailed" tech look */}
                 <div className="absolute inset-0 border border-cyan-400/30 rounded shadow-[inset_0_0_20px_rgba(6,182,212,0.2)] mix-blend-screen" />
              </div>
            </div>

            {/* Core Blueprint Tech Crosshairs */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40 mix-blend-screen" style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }}>
               <div className="w-[80%] h-[1px] bg-cyan-400/60 shadow-[0_0_8px_cyan]" />
               <div className="absolute h-[80%] w-[1px] bg-cyan-400/60 shadow-[0_0_8px_cyan]" />
               <div className="absolute w-[60%] h-[60%] border border-cyan-400/30 rounded-full" />
            </div>

            {/* Layer 4: Floating Star Edge & Laser High-Voltage Front Layer */}
            <div 
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              style={{ 
                transform: "translateZ(30px)", 
                transformStyle: "preserve-3d",
                backfaceVisibility: "visible",
                filter: "drop-shadow(0 0 20px rgba(34,211,238,1)) drop-shadow(0 0 10px #ffffff)"
              }}
            >
              <div className="w-[98%] h-[98%] filter grayscale sepia hue-rotate-[170deg] saturate-[10] brightness-[2.5] contrast-[1.5]">
                {renderNeonWeaponPreview(itemId, false, "front")}
              </div>
            </div>

            {/* Holographic Staging Grid (Floor plate to ground the 3D look) */}
            <div 
              className="absolute bottom-1 w-[80%] h-[12%] rounded-full border border-cyan-500/15 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none"
              style={{ 
                transform: "rotateX(90deg) translateZ(-65px)",
                transformStyle: "preserve-3d",
                boxShadow: "0 0 20px rgba(6,182,212,0.1), inset 0 0 10px rgba(6,182,212,0.05)"
              }}
            />
          </div>
        </div>

        {/* Interaction drag tooltip at bottom */}
        <span className="text-[9px] text-slate-500 tracking-widest uppercase mb-1 pointer-events-none select-none z-10 flex items-center gap-1.5 font-bold">
          <svg className="w-3 h-3 text-slate-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
          DRAG TO INSPECT VECTOR 3D VOLUME
        </span>
      </div>
    );
  };

  // Weapon buy function
  const buyWeapon = (itemId: string) => {
    const shopMeta = WEAPON_SHOP_DETAILS[itemId];
    if (!shopMeta) return;

    if (gameState.level < shopMeta.levelReq) {
      triggerSystemToast(`⚠️ SYSTEM GATE LOCKED: level ${shopMeta.levelReq} required to acquire this blueprint!`);
      return; 
    }

    if (gameState.gold < shopMeta.cost) {
      triggerSystemToast(`⚠️ RESOURCE ERR: Insufficient Mana! Required: ${shopMeta.cost} MP.`);
      return;
    }

    // Dynamic slot ceiling limits (starts at 0 slots for level 1, increases by +1 slot each level)
    const maxSlots = 5 + gameState.level;
    if (gameState.inventory.length >= maxSlots) {
      triggerSystemToast(`⚠️ INVENTORY SPACE CAP: Backpack is full (${gameState.inventory.length}/${maxSlots} slots). Level up to expand storage capacity!`);
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
    triggerSystemToast(`🔮 ARSENAL EXPANSION: Successfully integrated ${template.name} into your spatial compartment!`);
  };

  const handleBuyAdminMarketItem = async (item: any) => {
    try {
      playSelectSound();
      if (item.stock === 0) {
        triggerSystemToast("TRANSACTION FAILED: The system inventory for this item is depleted.");
        return;
      }
      if (item.adCodeSnippet) {
        setAdModalItem(item);
        setAdTimeRemaining(30);
        setAdTouched(false);
        return;
      }
      
      if (gameState.gold < item.price) {
        triggerSystemToast("INSUFFICIENT FUNDS: Need more gold to purchase from the black market.");
        return;
      }
      
      const leaderRef = doc(db, "leaderboard", playerName);
      await setDoc(leaderRef, { gold: gameState.gold - item.price }, { merge: true });
      
      // Decrease stock if not infinite (-1)
      if (item.stock > 0) {
         const marketItemRef = doc(db, "admin_market_items", item.id);
         await setDoc(marketItemRef, { stock: item.stock - 1 }, { merge: true });
      }

      setGameState(prev => ({
        ...prev,
        gold: prev.gold - item.price,
        inventory: [...prev.inventory, { 
          id: item.id + "_" + Date.now(),
          name: item.name,
          type: "Item",
          rarity: item.rank,
          equipped: false
        }]
      }));
      triggerSystemToast(`Successfully procured [${item.name}] from the Black Market!`);
    } catch (err) {
      console.error(err);
      triggerSystemToast("Transaction failed.");
    }
  };

  const handleClaimAdItem = async () => {
    if (!adModalItem) return;
    try {
      playSelectSound();
      const leaderRef = doc(db, "leaderboard", playerName);
      
      // Decrease stock if not infinite (-1)
      if (adModalItem.stock > 0) {
         const marketItemRef = doc(db, "admin_market_items", adModalItem.id);
         await setDoc(marketItemRef, { stock: adModalItem.stock - 1 }, { merge: true });
      }

      setGameState(prev => ({
        ...prev,
        inventory: [...prev.inventory, { 
          id: adModalItem.id + "_" + Date.now(),
          name: adModalItem.name,
          type: "Item",
          rarity: adModalItem.rank,
          equipped: false
        }]
      }));
      triggerSystemToast(`Successfully claimed [${adModalItem.name}] via System Sponsor!`);
      setAdModalItem(null);
    } catch (err) {
      console.error(err);
      triggerSystemToast("Claim failed.");
    }
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

    if (!preparedGateIds.includes(dungeon.id)) {
      triggerSystemToast(`⛔ GATE SYNC FAILED: You must prepare for this gate through professional/academic focus first.`);
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
    let playerDmg = Math.round(combatPower * 0.12 + Math.random() * 15);
    let logsToAdd: string[] = [];

    if (action === "strike") {
      playDaggerSwipe();
      logsToAdd.push(`⚔️ You execute a precision strike dealing ${playerDmg} kinetic damage.`);
    } else if (action === "skill") {
      const activeS = gameState.skills.filter(s => s.unlocked);
      if (activeS.length === 0) {
        logsToAdd.push(`⚠️ No active combat spells found in your matrix! Basic strike forced.`);
        playDaggerSwipe();
      } else {
        const randS = activeS[Math.floor(Math.random() * activeS.length)];
        // Skills scale heavily with Intelligence and Combat Power synergy
        const skillMult = 1.8 + (gameState.baseStats.intelligence * 0.05);
        playerDmg = Math.round(playerDmg * skillMult);
        playAriseSound();
        logsToAdd.push(`🔮 [${randS.name}] ENABLED! Your mana core vibrates, crushing for ${playerDmg} dimensional damage.`);
      }
    } else {
      // Shadows Charge - Restructured for massive late-game impact
      const unlockedShadows = gameState.shadows.filter(s => s.unlocked && s.count > 0);
      if (unlockedShadows.length === 0) {
        logsToAdd.push(`💀 You raised no active shadow soldiers yet! Basic strike forced.`);
        playDaggerSwipe();
      } else {
        const armySynergy = 1.5 + (gameState.baseStats.intelligence + gameState.baseStats.perception) * 0.01;
        playerDmg = Math.round(playerDmg * 2.5 * armySynergy);
        playAriseSound();
        logsToAdd.push(`🌑 "ARISE!" Your shadow legion resonance peaks! Combined vertical damage: ${playerDmg}`);
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
      
      // SCALE ENEMY DAMAGE BASED ON LEVEL GAP (Dungeon Rank vs Player Level)
      const levelGap = Math.max(0, selectedDungeon.minLevel - gameState.level);
      const gapMultiplier = 1 + (levelGap * 0.15); // 15% increase per level gap
      
      const baseEnemyDmg = selectedDungeon.enemyAttack + Math.random() * 10;
      // Increased mitigation sensitivity: vitality now blocks slightly more but the gap increases damage massively
      const mitigatedDmg = Math.max(1, baseEnemyDmg - gameState.baseStats.vitality * 0.25);
      const enemyDmg = Math.round(mitigatedDmg * gapMultiplier);
      
      const nextPlayerHp = Math.max(0, playerHp - enemyDmg);
      setPlayerHp(nextPlayerHp);

      logsToAdd.push(`💥 ${selectedDungeon.bossName} retaliates striking you for ${enemyDmg} kinetic damage.`);
      if (levelGap > 3) {
        logsToAdd.push(`⚠️ DIMENSIONAL INSTABILITY: The gap between your level and the gate's rank is causing massive trauma!`);
      }

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
      const actualGold = gold; // Ensure EXACT sync with backend without any caps
      return {
        ...prev,
        gold: prev.gold + actualGold,
        inventory: inv,
        dailyGatesCleared: (prev.dailyGatesCleared ?? 0) + 1
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
    <main role="main" id="rpg_game_container" className="min-h-[100dvh] bg-transparent text-white flex flex-col font-sans relative overflow-y-auto overflow-x-hidden">
      
      {/* 🚨 SOVEREIGN PENALTY INTERCEPT PROTOCOL OVERLAY */}
      {false && (
        <div id="penalty_sentinel_overlay" className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-4 md:p-8 font-mono select-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.12)_0%,rgba(0,0,0,0)_75%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(244,63,94,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <div className="absolute bottom-10 right-10 opacity-10 animate-pulse pointer-events-none">
            <Skull className="w-64 h-64 sm:w-96 sm:h-96 text-red-500" />
          </div>

          <div className="w-full max-w-2xl border-2 border-red-500 rounded-3xl bg-slate-950/90 p-4 sm:p-6 md:p-8 space-y-6 relative shadow-[0_0_50px_rgba(239,68,68,0.3)] backdrop-blur-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-slate-950 text-[10px] uppercase font-black tracking-widest px-6 py-1 rounded-full shadow-lg">
              SYSTEM ALARM PROTOCOL
            </div>

            <div className="text-center space-y-2">
              <span className="text-xs text-red-500 font-extrabold tracking-widest uppercase block animate-ping">WARNING: PLAYER UNCOMPLIANT DETECTED</span>
              <h2 className="text-2xl md:text-3xl font-black text-rose-500 tracking-wider text-center">🚨 PENALTY QUEST: DESERT OF SENTINELS</h2>
              <div className="h-1 w-24 bg-red-500 mx-auto rounded-full" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed text-center font-sans max-w-lg mx-auto">
              Your systemic self-development schedule was breached. The System does not tolerate stagnation. To resume structural progression, you are cast into the desert. You must survive the Sentinel timer.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-center">
              <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4">
                <span className="text-[10px] text-slate-500 uppercase block tracking-wider mb-1">Banishment Remaining</span>
                <span className="text-3xl font-bold font-mono tracking-widest text-red-400">
                  {Math.floor(penaltyTimeLeft / 60)}m {penaltyTimeLeft % 60}s
                </span>
              </div>
              <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4">
                <span className="text-[10px] text-slate-500 uppercase block tracking-wider mb-1">Hazards Cleared</span>
                <span className="text-3xl font-bold font-mono tracking-widest text-cyan-400">
                  {penaltyClicks} Slowns
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-red-500/10 bg-slate-900/60 rounded-2xl p-4 text-center">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">TARGET HARASSMENT RESISTANCE INTERFERENCE</h4>
                <p className="text-[10px] text-slate-400 max-w-md mx-auto leading-relaxed mb-4">
                  Tap the target below or swipe back to suppress sandstorm hazards. Each heavy impact slashes <strong className="text-cyan-400 font-mono">-3.0s</strong> off the banishment sentencing constraint!
                </p>

                <div className="flex justify-center my-2">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative px-6 py-4 bg-gradient-to-r from-red-600 via-rose-700 to-red-700 hover:from-red-500 hover:to-rose-600 border border-red-500 text-white rounded-2xl cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.3)] tracking-widest text-xs font-black uppercase flex items-center gap-2 group"
                    onClick={() => {
                      playDaggerSwipe();
                      setPenaltyClicks(prev => prev + 1);
                      setPenaltyTimeLeft(prev => Math.max(0, prev - 3));
                      if (Math.random() < 0.08) {
                        setGameState(p => ({
                          ...p,
                          baseStats: {
                            ...p.baseStats,
                            strength: p.baseStats.strength + 1
                          }
                        }));
                        triggerSystemToast("⚡ STRUGGLE BONUS: Your physical body hardens! Permanent STR +1!");
                      }
                    }}
                  >
                    <Flame className="w-4 h-4 text-orange-400 animate-pulse group-hover:rotate-12 transition-transform" />
                    SLASH SENTINEL CENTIPEDE
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase">
                <span>Ambient Hazard Grade: A-Rank Sandstorm</span>
                <span>Active Combat Shield: Normal</span>
              </div>
              <div className="w-full bg-slate-900 border border-slate-9gd rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 via-rose-600 to-rose-400 h-full transition-all duration-300"
                  style={{ width: `${(penaltyTimeLeft / 125) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-[10px] text-slate-500 block font-mono">
                COMPLIANCE IS UNYIELDING &middot; SOLITARITY LEVELING PROTOCOL
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SYNCED TOP HUD: MANA & LEVEL (LEFT), MESSAGES (RIGHT) */}
      <nav aria-label="System Status" className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-950/95 border-b border-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 shadow-[0_4px_20px_rgba(0,0,0,0.65)]">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-cyan-400/60 uppercase tracking-[0.2em] mb-0.5">MANA CAPACITY</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,1)]" aria-hidden="true" />
              <span className="text-lg font-black text-white font-mono tracking-tighter leading-none" aria-label={`Current Mana: ${gameState.gold}`}>{gameState.gold}</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-cyan-400/60 uppercase tracking-[0.2em] mb-0.5">STAT RANK</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-black text-cyan-300 font-mono italic leading-none" aria-label={`Current Level: ${gameState.level}`}>LV.{gameState.level}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            aria-label="Open Communication Hub"
            aria-haspopup="true"
            onClick={() => { try { playSelectSound(); } catch(e){} setActiveTab("social"); setSocialSubTab("chat"); }}
            className="p-3 relative flex items-center justify-center transition-all cursor-pointer rounded-xl bg-transparent outline-none group"
          >
            <MessageSquare 
              className="w-6 h-6 text-cyan-400 group-hover:text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.75)] hover:scale-110 transition-transform" 
              aria-hidden="true"
            />
            {friendRequests.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_red] animate-pulse">
                <span className="sr-only">New messages available</span>
              </span>
            )}
          </button>
          
          <button 
            aria-label="Open System Registry Settings"
            aria-haspopup="true"
            onClick={() => setShowProfileDrawer(true)}
            className="p-3 flex items-center justify-center transition-all cursor-pointer rounded-xl bg-transparent outline-none group"
          >
            <User 
              className="w-6 h-6 text-cyan-400 group-hover:text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.75)] hover:scale-110 transition-transform" 
            />
          </button>
        </div>
      </nav>

      {/* Main split dashboard area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 pt-24 sm:pt-28 pb-32 lg:pb-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start min-h-[100dvh]">
        
        {/* CHARACTER ILLUSTRATOR TIER CARD (LEFT PANEL - REFINED, RESPONSIVE, & COMPACT) */}
        <div className="hidden lg:block relative lg:col-span-3 xl:col-span-2 space-y-2 lg:sticky lg:top-[124px] lg:max-h-[75vh] lg:overflow-y-auto overflow-x-hidden pr-1.5 max-w-xs mx-auto lg:max-w-none w-full scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">

          
          <button 
            className="absolute top-2 right-2 p-1 bg-slate-900 rounded-full border border-slate-700 text-slate-400 hover:text-white"
            onClick={() => {/* Need a way to close this panel - maybe toggle visibility state? */}}
          >
            <span className="sr-only">Close Panel</span>
            {/* Need an icon - will use X if imported or just text for now */}
            X
          </button>


          {/* Unified Round/Circular Progresses */}
          <div className="bg-slate-950/75 p-2 rounded-2xl backdrop-blur-md grid grid-cols-3 gap-2">
            <CircularProgress
              value={gameState.exp}
              max={gameState.maxExp}
              colorFrom="#22d3ee"
              colorTo="#4f46e5"
              glowColor="rgba(34, 211, 238, 0.4)"
              label="LEVEL XP"
              subText={`${gameState.exp}/${gameState.maxExp}`}
              icon={<Activity className="w-3 h-3 text-cyan-400" />}
              id="xp-desktop"
            />
            <CircularProgress
              value={gameState.weeklyManaAccumulated ?? 0}
              max={30}
              colorFrom="#eab308"
              colorTo="#d97706"
              glowColor="rgba(234, 179, 8, 0.4)"
              label="WEEKLY MP"
              subText={`${gameState.weeklyManaAccumulated ?? 0}/30`}
              icon={<Zap className="w-3 h-3 text-yellow-400" />}
              id="wk-desktop"
            />
            <CircularProgress
              value={gameState.weeklyExpAccumulated ?? 0}
              max={gameState.level * 300 + 1500}
              colorFrom="#a855f7"
              colorTo="#6366f1"
              glowColor="rgba(168, 85, 247, 0.4)"
              label="WEEKLY XP"
              subText={`${gameState.weeklyExpAccumulated ?? 0}/${gameState.level * 300 + 1500}`}
              icon={<TrendingUp className="w-3 h-3 text-purple-400" />}
              id="wexp-desktop"
            />
            <div className="col-span-1" />
            <div className="col-span-2 flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-900/40 pt-2 mt-1 px-1 font-mono">
              <span>TIER:</span>
              <span className="text-yellow-400 font-bold uppercase">{powerScaling.label}</span>
            </div>
          </div>

          {/* DAILY PERFORMANCE BARS (VERTICAL) */}
          <div className="bg-slate-950/75 p-4 rounded-2xl backdrop-blur-md border border-slate-900/40">
            <div className="flex justify-around items-end h-32 px-2">
              <VerticalBar
                current={gameState.quests.filter(q => q.completed).length}
                total={gameState.quests.length || 5}
                label="QUESTS"
                color="#ef4444"
                icon={<Target className="w-3 h-3 text-white" />}
              />
              <VerticalBar
                current={gameState.dailyGatesCleared ?? 0}
                total={5}
                label="GATES"
                color="#06b6d4"
                icon={<Sword className="w-3 h-3 text-white" />}
              />
              <VerticalBar
                current={gameState.dailyFocusMinutes ?? 0}
                total={onboardProfile.academicSessionsGoal ? onboardProfile.academicSessionsGoal * 25 : 125}
                label="WORK"
                color="#818cf8"
                icon={<BookOpen className="w-3 h-3 text-white" />}
              />
            </div>
          </div>

          {/* Story Campaigns Indicator */}
          <div className="bg-slate-950/75 border border-slate-900 p-2 rounded-lg backdrop-blur-md font-mono text-[9px] space-y-1.5">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Campaign Milestones</h4>
            <div className="space-y-1 text-[10px]">
              
              <div className="flex justify-between items-center px-1.5 py-1 bg-slate-900 rounded border border-slate-900/50">
                <span className={gameState.level >= 1 ? "text-cyan-400" : "text-slate-500"}>1. Double Dungeon</span>
                <span className="text-cyan-400 font-bold text-[9px] tracking-wider uppercase">CLEARED</span>
              </div>

              <div className="flex justify-between items-center px-1.5 py-1 bg-slate-900 rounded border border-slate-900/50">
                <span className={gameState.level >= 25 ? "text-cyan-400" : "text-slate-600"}>2. Red Gate [B]</span>
                <span className={gameState.level >= 25 ? "text-cyan-400 font-bold text-[9px] tracking-wider uppercase" : "text-slate-600 text-[9px]"}>
                  {gameState.level >= 25 ? "AWAKENED" : `Lv 25`}
                </span>
              </div>

              <div className="flex justify-between items-center px-1.5 py-1 bg-slate-900 rounded border border-slate-900/50">
                <span className={gameState.level >= 70 ? "text-cyan-400" : "text-slate-600"}>3. Monarch [Jeju]</span>
                <span className={gameState.level >= 70 ? "text-cyan-400 font-bold text-[9px] tracking-wider uppercase" : "text-slate-600 text-[9px]"}>
                  {gameState.level >= 70 ? "SOVEREIGN" : `Lv 70`}
                </span>
              </div>

            </div>
          </div>

          {/* System Messages & Directives */}
          <div className="bg-slate-950/75 border border-amber-900/40 p-2.5 rounded-lg backdrop-blur-md font-mono text-[9px] space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-1.5 pb-1.5 border-b border-amber-900/50">
              <span className="text-amber-400/80">🔔</span>
              <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px]">System Messages</span>
            </div>
            
            <div className="space-y-2 text-[10px] leading-relaxed text-slate-300">
              <div className="bg-slate-950/50 p-1.5 rounded border border-red-900/30">
                <p className="text-red-400 font-bold uppercase mb-0.5 text-[10px]">Daily Penalty Directive</p>
                <p className="text-slate-400">Failure to complete all daily quests before midnight triggers a severe penalty to Sovereign Mana (MP), Gold, and XP.</p>
              </div>
              
              <div className="bg-slate-950/50 p-1.5 rounded border border-cyan-900/30">
                <p className="text-cyan-400 font-bold uppercase mb-0.5 text-[10px]">Growth Algorithm</p>
                <p className="text-slate-400">Complete Life Forge pomodoros to mutate intelligence and gain restorative stats.</p>
              </div>
            </div>
          </div>

          {/* Special trigger bonus button at Level 90 */}
          {gameState.level >= 90 && !gameState.inventory.some(i => i.id === "sovereigns_wrath") && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full py-1.5 bg-gradient-to-r from-yellow-500 via-purple-600 to-indigo-600 rounded-lg text-[10px] font-mono font-black tracking-widest text-white uppercase animate-pulse cursor-pointer border border-yellow-400/20"
              onClick={summonSovereignsWrath}
            >
              🌌 Claim Wrath
            </motion.button>
          )}

        </div>

        {/* TAB CONTROLLERS & DETAILED TAB CONTENT (RIGHT PANEL - EXPANDED GRIDS) */}
        <div className="lg:col-span-9 xl:col-span-10 space-y-5">
          
          {/* Top horizontal sub-tabs for each section - visible on mobile screens */}
          <div className="sticky top-[64px] z-20 py-3 bg-slate-950/98 backdrop-blur-xl border-b border-slate-900 -mx-2 sm:-mx-4 px-2 sm:px-4 mb-4 lg:hidden" id="section_sub_navigation">
            <div className="grid grid-cols-3 gap-2 w-full max-w-2xl mx-auto px-1 sm:px-4">
              {(() => {
                const tabs = getMobileSubtabs();
                return tabs.map((tab, idx) => {
                  let colClass = "col-start-2"; // Default for 1 tab
                  if (tabs.length === 3) {
                    colClass = idx === 0 ? "col-start-1" : idx === 1 ? "col-start-2" : "col-start-3";
                  } else if (tabs.length === 2) {
                    colClass = idx === 0 ? "col-start-1" : "col-start-3";
                  }
                  
                  return (
                    <div key={tab.id} className={`${colClass} flex justify-center items-center`}>
                      <button
                        className={`w-full max-w-[140px] px-2 sm:px-4 py-2.5 rounded-xl text-[10px] font-mono uppercase cursor-pointer tracking-widest transition-all font-black text-center border shadow-lg truncate ${
                          activeTab === tab.id 
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3),inset_0_0_8px_rgba(6,182,212,0.1)] ring-1 ring-cyan-400/50" 
                            : "text-slate-500 bg-slate-950/60 border-slate-900/60 hover:text-slate-300 hover:border-slate-800 hover:bg-slate-900"
                        }`}
                        onClick={() => {
                          try {
                            playSelectSound();
                          } catch (e) {}
                          setActiveTab(tab.id as any);
                        }}
                      >
                        {tab.label}
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Full tabs header row - hidden on mobile, visible on lg devices */}
          <div className="hidden lg:flex flex-wrap gap-2 border-b border-slate-900 pb-3" id="tab_navigation">
            {[
              { id: "quests", label: "Quests" },
              { id: "home", label: "Home" },
              { id: "life_forge", label: "Life Forge" },
              { id: "status", label: "Status" },
              { id: "dungeons", label: "Gates" },
              { id: "social", label: "Social" },
              { id: "shadows", label: "Shadows" },
              { id: "skills", label: "Skill-Tree" },
              { id: "backpack", label: "Backpack" },
              { id: "market", label: "Market" },
              { id: "profile", label: "Profile" }
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
          <div className="bg-slate-900/20 rounded-3xl min-h-[500px] flex flex-col w-full">
            
            {/* A0_1. HOME TAB (Now visible on all sizes for a unified dashboard experience) */}
            {activeTab === "home" && (
              <motion.div key="home-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 w-full flex-1">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Level Up details / player indicator - Main Profile Card */}
                  <div className="md:col-span-2 lg:col-span-1 bg-slate-950/75 border border-slate-900 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-center items-center text-center">
                    <AvatarWithFrame 
                      size="xl" 
                      playerName={playerName} 
                      level={gameState.level} 
                      profileImage={profileImage} 
                      onClick={() => {
                        try { playSelectSound(); } catch(e){}
                        setActiveTab("profile");
                      }}
                    />
                    <div className="mt-4">
                      <h4 className="text-2xl font-black font-mono text-cyan-400 tracking-tight">{playerName}</h4>
                      <p className="text-sm font-mono text-slate-400 uppercase tracking-widest mt-1">{gameState.rank} &middot; {gameState.job}</p>
                    </div>
                    
                    <div className="mt-6 w-full pt-6 border-t border-slate-900/50 grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Mana</span>
                        <span className="text-lg font-bold text-cyan-300 font-mono">{gameState.gold}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Level</span>
                        <span className="text-lg font-bold text-purple-400 font-mono">{gameState.level}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Middle Column: Growth Stats & Performance (Only if not already in sidebar or as a complement) */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Level Exp & Mana Circular Progress Section */}
                    <div className="bg-slate-950/70 p-5 rounded-2xl backdrop-blur-md border border-slate-900/50">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <h5 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">Growth Analytics</h5>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <CircularProgress
                          value={gameState.exp}
                          max={gameState.maxExp}
                          colorFrom="#22d3ee"
                          colorTo="#4f46e5"
                          glowColor="rgba(34, 211, 238, 0.4)"
                          label="LEVEL XP"
                          subText={`${gameState.exp}/${gameState.maxExp}`}
                          icon={<Activity className="w-4 h-4 text-cyan-400" />}
                          id="xp-home-detail"
                        />
                        <CircularProgress
                          value={gameState.weeklyManaAccumulated ?? 0}
                          max={30}
                          colorFrom="#eab308"
                          colorTo="#d97706"
                          glowColor="rgba(234, 179, 8, 0.4)"
                          label="WEEKLY MP"
                          subText={`${gameState.weeklyManaAccumulated ?? 0}/30`}
                          icon={<Zap className="w-4 h-4 text-yellow-400" />}
                          id="wk-home-detail"
                        />
                        <CircularProgress
                          value={gameState.weeklyExpAccumulated ?? 0}
                          max={gameState.level * 300 + 1500}
                          colorFrom="#a855f7"
                          colorTo="#6366f1"
                          glowColor="rgba(168, 85, 247, 0.4)"
                          label="WEEKLY XP"
                          subText={`${gameState.weeklyExpAccumulated ?? 0}/${gameState.level * 300 + 1500}`}
                          icon={<TrendingUp className="w-4 h-4 text-purple-400" />}
                          id="wexp-home-detail"
                        />
                      </div>
                    </div>

                    {/* DAILY PERFORMANCE BARS */}
                    <div className="bg-slate-950/70 p-5 rounded-2xl backdrop-blur-md border border-slate-900/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest">Daily Performance Grid</span>
                      </div>
                      <div className="flex justify-around items-end h-36">
                        <VerticalBar
                          current={gameState.quests.filter(q => q.completed).length}
                          total={gameState.quests.length || 5}
                          label="QUESTS"
                          color="#f43f5e"
                          icon={<Target className="w-4 h-4 text-white" />}
                        />
                        <VerticalBar
                          current={gameState.dailyGatesCleared ?? 0}
                          total={5}
                          label="GATES"
                          color="#22d3ee"
                          icon={<Sword className="w-4 h-4 text-white" />}
                        />
                        <VerticalBar
                          current={gameState.dailyFocusMinutes ?? 0}
                          total={onboardProfile.academicSessionsGoal ? onboardProfile.academicSessionsGoal * 25 : 125}
                          label="WORK"
                          color="#6366f1"
                          icon={<BookOpen className="w-4 h-4 text-white" />}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Story Campaigns Indicator */}
                  <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl backdrop-blur-md font-mono text-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                      <Map className="w-4 h-4 text-slate-400" />
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Campaign Milestones</h4>
                    </div>
                    <div className="space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className={gameState.level >= 1 ? "text-cyan-400 font-bold" : "text-slate-600"}>1. Double Dungeon Rescue</span>
                        <span className="text-cyan-400 font-bold text-[9px] bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 uppercase">CLEARED</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className={gameState.level >= 25 ? "text-cyan-400 font-bold" : "text-slate-600"}>2. Red Gate Assault [Rank B]</span>
                        <span className={gameState.level >= 25 ? "text-cyan-400 font-bold text-[9px] bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 uppercase" : "text-slate-500 text-[10px]"}>
                          {gameState.level >= 25 ? "AWAKENED" : `Level 25 Required`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className={gameState.level >= 70 ? "text-cyan-400 font-bold" : "text-slate-600"}>3. Monarch Battle - Jeju Island</span>
                        <span className={gameState.level >= 70 ? "text-cyan-400 font-bold text-[9px] bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 uppercase" : "text-slate-500 text-[10px]"}>
                          {gameState.level >= 70 ? "SOVEREIGN" : `Level 70 Required`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* System Messages */}
                  <div className="bg-slate-950/75 border border-amber-900/30 p-6 rounded-2xl backdrop-blur-md font-mono text-xs space-y-4 relative overflow-hidden">
                    <div className="flex items-center gap-2 pb-3 border-b border-amber-900/40">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 font-extrabold uppercase tracking-widest text-[10px]">Command Directives</span>
                    </div>
                    <div className="space-y-4 text-[11px] leading-relaxed text-slate-300">
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-red-950/30">
                        <p className="text-red-400 font-bold uppercase mb-1 text-[9px]">Penalty Protocol Active</p>
                        <p className="text-slate-400 leading-relaxed">All Daily Quests must be finalized before midnight. Incomplete logs trigger severe MP and XP drain sanctioning via the system core.</p>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-cyan-950/30">
                        <p className="text-cyan-400 font-bold uppercase mb-1 text-[9px]">Alchemical Evolution</p>
                        <p className="text-slate-400 leading-relaxed">Use Life Forge to execute focused learning runs. Gaining intellect is key to casting powerful runes and summons.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* A0_2. PROFILE TAB (Representing profile details) */}
            {activeTab === "profile" && (
              <motion.div key="profile-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-xl mx-auto w-full">
                {/* Profile Identification Grid */}
                <div className="p-5 bg-slate-950/75 rounded-2xl border border-slate-900 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left relative overflow-hidden group/profile shadow-xl">
                  <AvatarWithFrame 
                    size="lg" 
                    playerName={playerName} 
                    level={gameState.level} 
                    profileImage={profileImage} 
                    onClick={() => fileInputRef.current?.click()}
                    allowUpload={true}
                    className="shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:scale-105 transition-transform"
                  />
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase block tracking-wider font-mono">Monarch Identity</span>
                    <h4 className="text-base font-bold text-slate-100 font-mono">{playerName}</h4>
                    <span className="text-[10px] text-cyan-400 uppercase font-black tracking-wider font-mono">Level {gameState.level} &middot; {gameState.rank} {gameState.job}</span>
                  </div>

                  <div className="sm:ml-auto">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-[10px] font-mono font-bold uppercase rounded-xl tracking-wider cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change Photo</span>
                    </button>
                    {profileImage && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileImage(null);
                          localStorage.removeItem(`monarch_profile_img_${playerName}`);
                          triggerSystemToast("⚡ SYSTEM INTEGRATION: Profile picture cleared!");
                        }}
                        className="mt-2 w-full justify-center px-3 py-1 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 hover:text-red-350 text-[10px] font-mono font-bold uppercase rounded-xl tracking-wider cursor-pointer flex items-center gap-1 transition-all"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Settings Options Portfolio List */}
                <div className="bg-slate-950/75 border border-slate-900 p-5 rounded-2xl backdrop-blur-md font-mono text-xs space-y-5">
                  <span className="text-slate-400 text-xs uppercase font-extrabold tracking-widest block border-b border-slate-900 pb-2.5">System Options Matrix</span>

                  {/* OPTION 1: Player Name Registry */}
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

                  {/* OPTION 2: System Synthesizer Volume */}
                  <div className="space-y-2 border-t border-slate-900 pt-3">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider block">2. System Synthesizer Volume</span>
                    <div className="flex justify-between items-center bg-slate-900/60 p-2.5 px-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-300">Auditory sound FX core</span>
                      <span className="text-cyan-400 font-bold uppercase text-[9px] tracking-widest bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded-full animate-pulse">
                        Active [100%]
                      </span>
                    </div>
                  </div>

                  {/* OPTION 3: Regimen Difficulty standard */}
                  <div className="space-y-2 border-t border-slate-900 pt-3">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider block">3. Regimen Difficulty standard</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button className="py-2.5 px-1 border-2 border-cyan-400 bg-cyan-400/5 text-cyan-400 rounded-xl text-[9px] font-bold uppercase transition-all duration-300">
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
                      <span className="text-[10px] text-slate-350 block font-sans">Daily Quest Reminders</span>
                      <div 
                        className={`w-10 h-6 rounded-full p-0.5 cursor-pointer flex items-center transition-colors duration-200 ${dailyQuestReminder ? "bg-cyan-500 justify-end" : "bg-slate-800 justify-start"}`}
                        onClick={() => {
                          const newVal = !dailyQuestReminder;
                          setDailyQuestReminder(newVal);
                          localStorage.setItem(`monarch_reminder_${playerName}`, newVal.toString());
                          triggerSystemToast(`SYSTEM SIGNAL: Quest Reminders turned ${newVal ? "ON" : "OFF"}`);
                        }}
                      >
                        <div className="w-4 h-4 bg-slate-950 rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>

                  {/* OPTION 5: Erase registry save data */}
                  <div className="space-y-2 border-t border-slate-900 pt-3">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider block">5. Erase registry save data</span>
                    <button 
                      className="w-full py-2.5 border border-red-950 hover:bg-red-950/25 text-red-500 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer animate-pulse"
                      onClick={() => {
                        setShowPurgeModal(true);
                      }}
                    >
                      Purge Active Registry Save
                    </button>
                  </div>

                  {/* OPTION 6: Real Sign Out Action Button */}
                  <div className="border-t border-slate-900 pt-4">
                    <button 
                      className="w-full py-3 bg-red-950 hover:bg-red-900 text-red-200 hover:text-white border border-red-900 text-xs font-bold font-mono tracking-widest uppercase rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2"
                      onClick={() => {
                        setShowDisconnectModal(true);
                       }}
                    >
                      <LogOut className="w-4 h-4" />
                      DISCONNECT SESSION
                    </button>
                    <p className="text-[9px] text-slate-600 text-center font-mono uppercase mt-3">
                      COMPLIANCE SECURED &middot; VERSION 1.0.4 Awaken
                    </p>
                  </div>

                </div>
              </motion.div>
            )}
            
            {/* A. STATUS TAB: Stat allocator and character profiles */}
            {activeTab === "status" && (
              <motion.div key="status-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

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
                        <motion.div 
                          key={stat.key} 
                          whileHover={{ scale: 1.01, backgroundColor: "rgba(15, 23, 42, 0.45)" }}
                          className="flex flex-wrap justify-between items-center p-3.5 bg-slate-900/35 border border-slate-900 rounded-xl gap-4 transition-colors"
                        >
                          <div className="flex-1 min-w-[200px]">
                            <div className="text-xs font-bold font-mono text-slate-300">{stat.label}</div>
                            <div className="text-[10px] text-slate-500 mt-1 leading-snug">{stat.desc}</div>
                          </div>
                          
                          <div className="flex items-center gap-4 font-mono">
                            <span id={`val_stat_${stat.key}`} className="text-xl font-bold font-mono text-cyan-300 w-12 text-right">{val}</span>
                            
                            <motion.button
                              whileHover={{ scale: gameState.statPoints > 0 ? 1.15 : 1 }}
                              whileTap={{ scale: gameState.statPoints > 0 ? 0.9 : 1 }}
                              id={`btn_upgrade_${stat.key}`}
                              disabled={gameState.statPoints <= 0}
                              className="p-2 bg-slate-950/75 backdrop-blur-md border border-slate-800 rounded-lg hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 disabled:opacity-20 disabled:hover:shadow-none cursor-pointer text-xs font-bold"
                              onClick={() => upgradeStat(stat.key as any)}
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}

                  </div>
                </div>

                {/* PRIORITIZATION & HIGHLIGHTED LIFE FORGE INTEGRATION BLOCK */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-slate-950/50 border-2 border-indigo-500/20 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-0 right-0 p-2 opacity-50 flex items-center justify-center animate-pulse pointer-events-none">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-black block">SYSTEM INTEGRATED PRIORITY</span>
                      <h3 className="font-extrabold text-white text-lg tracking-wider">LIFE FORGE QUICK OVERVIEW</h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab("life_forge")}
                      className="px-4 py-2 bg-slate-900 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold font-mono tracking-widest rounded-lg transition-colors cursor-pointer"
                    >
                      ENTER FORGE --&gt;
                    </motion.button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                    <motion.div whileHover={{ y: -2 }} className="bg-slate-900/40 border border-indigo-500/10 p-3 rounded-xl flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase">Academics Priority</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono leading-tight">Focus: {onboardProfile.academicSubject || "Systematic Learning"}</p>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full mt-auto overflow-hidden">
                        <div className="h-full bg-purple-500/80 rounded-full w-[45%]" />
                      </div>
                    </motion.div>
                    
                    <motion.div whileHover={{ y: -2 }} className="bg-slate-900/40 border border-orange-500/10 p-3 rounded-xl flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase">Fitness Milestones</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono leading-tight">Current Target: {onboardProfile.fitnessDietGoal || "Survival"}</p>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full mt-auto overflow-hidden">
                        <div className="h-full bg-orange-500/80 rounded-full w-[15%]" />
                      </div>
                    </motion.div>
                    
                    <motion.div whileHover={{ y: -2 }} className="bg-slate-900/40 border border-cyan-500/10 p-3 rounded-xl flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase">Career & Guild</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono leading-tight">Role Prep: {onboardProfile.careerTargetRole || "Hunter"}</p>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full mt-auto overflow-hidden">
                        <div className="h-full bg-cyan-500/80 rounded-full w-[80%]" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-slate-950/75 border border-slate-900 p-5 rounded-2xl backdrop-blur-md font-mono text-xs space-y-2 relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors pointer-events-none" />
                    <div className="flex justify-between items-center relative z-10 w-full mb-3">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Fitted Arsenal Core</h4>
                      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    </div>
                    {getEquippedWeapon() ? (
                      <div 
                        className="p-4 bg-slate-900/40 rounded-xl outline-dashed outline-1 outline-cyan-500/20 shadow-[inset_0_0_20px_rgba(34,211,238,0.05)] cursor-pointer hover:bg-slate-800/40 transition-colors"
                        onClick={() => setSelectedWeaponDetails(getEquippedWeapon())}
                        title="Click to view full weapon 1000x detailed analysis"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 border border-cyan-500/30 rounded-lg bg-slate-950">
                            {renderNeonWeaponPreview(getEquippedWeapon()!.id, false)}
                          </div>
                          <div className="flex-1">
                            <div className="text-cyan-400 font-black text-sm tracking-widest uppercase truncate">{getEquippedWeapon()?.name}</div>
                            <div className="text-slate-500 text-[10px] mt-0.5 truncate">{getEquippedWeapon()?.description}</div>
                          </div>
                        </div>
                        {getEquippedWeapon()?.statBonus && (
                          <div className="text-[10px] text-cyan-300 font-bold mt-3 border-t border-cyan-500/10 pt-2 flex gap-3">
                            {getEquippedWeapon()?.statBonus?.strength && <span>STR +{getEquippedWeapon()?.statBonus?.strength}</span>}
                            {getEquippedWeapon()?.statBonus?.agility && <span>AGI +{getEquippedWeapon()?.statBonus?.agility}</span>}
                          </div>
                        )}
                        <span className="text-[9px] text-slate-600 uppercase block mt-2 text-right tracking-[0.2em]">Click to trigger detailed inspection</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 block p-4 bg-slate-900/30 rounded-xl">No weapon equipped. Fists active (+0 Attack).</span>
                    )}
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-slate-950/75 border border-slate-900 p-5 rounded-2xl backdrop-blur-md font-mono text-xs space-y-2 relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors pointer-events-none" />
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 relative z-10 w-full flex justify-between">
                      <span>Awakening Archetype Info</span>
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    </h4>
                    <div className="space-y-1.5 text-[11px] relative z-10">
                      <div className="flex justify-between p-1.5 hover:bg-slate-900/50 rounded-lg transition-colors">
                        <span className="text-slate-500">Gender Index:</span>
                        <span className="text-slate-300 uppercase font-black">{onboardProfile.gender}</span>
                      </div>
                      <div className="flex justify-between p-1.5 hover:bg-slate-900/50 rounded-lg transition-colors">
                        <span className="text-slate-500">Motivation Path:</span>
                        <span className="text-slate-300 font-bold">{onboardProfile.motivation.replace("_", " ")}</span>
                      </div>
                      <div className="flex justify-between p-1.5 hover:bg-slate-900/50 rounded-lg transition-colors">
                        <span className="text-slate-500">Workout Regime:</span>
                        <span className="text-cyan-400 font-bold">{onboardProfile.workoutFrequency} workouts / wk</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

              </motion.div>
            )}

            {/* L. LEADERBOARD TAB: Global real-time Firebase Sync */}
            {activeTab === "social" && (
              <SocialHub 
                 key="social-hub"
                 playerName={playerName} 
                 playSelectSound={playSelectSound} 
                 onOpenPartyMode={() => {}}
                 initialTab={socialSubTab}
              />
            )}

            {/* B. QUESTS TAB: Gamified Workout checklists */}
            {activeTab === "quests" && (
              <motion.div key="quests-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

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
                                className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                onClick={() => claimQuestReward(quest)}
                              >
                                Claim Reward (+{quest.rewardExp} XP, +{quest.rewardGold} MP)
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
                                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
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

                {/* ADMINISTRATIVE OVERLORD CUSTOM QUESTS */}
                {adminQuests && adminQuests.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-purple-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400 font-bold">
                        OVERLORD SYSTEM QUESTS ({adminQuests.length})
                      </h3>
                    </div>
                    {adminQuests.map((quest) => {
                      const prog = adminQuestProgress[quest.id] || { current: 0, completed: false, claimed: false };
                      const prgPercent = Math.min(100, (prog.current / quest.target) * 100);
                      
                      const incrementAdminQuest = (qty: number) => {
                        const newCurrent = Math.min(quest.target, prog.current + qty);
                        const isDone = newCurrent >= quest.target;
                        setAdminQuestProgress(prev => ({
                          ...prev,
                          [quest.id]: {
                            current: newCurrent,
                            completed: isDone,
                            claimed: prev[quest.id]?.claimed || false
                          }
                        }));
                        if (isDone && !prog.completed) {
                          try {
                            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                            if (AudioCtx) {
                              const ctx = new AudioCtx();
                              const osc = ctx.createOscillator();
                              const gain = ctx.createGain();
                              osc.connect(gain);
                              gain.connect(ctx.destination);
                              osc.type = "sine";
                              osc.frequency.setValueAtTime(880, ctx.currentTime);
                              gain.gain.setValueAtTime(0.1, ctx.currentTime);
                              osc.start();
                              osc.stop(ctx.currentTime + 0.3);
                            }
                          } catch (e) {}
                          triggerSystemToast(`🔥 SYSTEM DECREE COMPLETED: "${quest.name}" completed! Cleared for compensation claiming!`);
                        }
                      };

                      const claimAdminQuestReward = () => {
                        if (prog.claimed || !prog.completed) return;
                        playLootSound();
                        
                        // Add actual real game parameters!
                        addExp(quest.rewardExp);
                        setGameState(prev => {
                          const actualGold = quest.rewardGold; // Respect backend setting exactly
                          return {
                            ...prev,
                            gold: prev.gold + actualGold
                          };
                        });

                        setAdminQuestProgress(prev => ({
                          ...prev,
                          [quest.id]: {
                            ...prev[quest.id],
                            claimed: true
                          }
                        }));
                        triggerSystemToast(`⭐ COMPENSATION RETRIEVED: Successfully claimed +${quest.rewardExp} EXP and +${quest.rewardGold} Mana MP from Admin Protocol!`);
                      };

                      return (
                        <div key={quest.id} className="bg-gradient-to-r from-slate-950/90 to-purple-950/20 border-2 border-purple-500/10 p-5 rounded-2xl backdrop-blur-md font-mono text-xs space-y-4 animate-fade-in">
                          <div className="flex flex-wrap justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-purple-400/20 animate-pulse">
                                  ADMIN TASK
                                </span>
                                <h4 className="text-sm font-bold text-slate-100">{quest.name}</h4>
                              </div>
                              <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">{quest.description}</p>
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs font-bold text-purple-300">{prog.current} / {quest.target} reps</span>
                              
                              {prog.claimed ? (
                                <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-3 py-1.5 rounded-xl uppercase font-bold">
                                  CLAIMED ✔
                                </span>
                              ) : prog.completed ? (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.25)] font-bold"
                                  onClick={claimAdminQuestReward}
                                >
                                  Claim Reward (+{quest.rewardExp} XP, +{quest.rewardGold} MP)
                                </motion.button>
                              ) : (
                                <div className="flex gap-1.5">
                                  <button
                                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer"
                                    onClick={() => incrementAdminQuest(5)}
                                  >
                                    +5 reps
                                  </button>
                                  <button
                                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer"
                                    onClick={() => incrementAdminQuest(25)}
                                  >
                                    +25 reps
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Progress visual bar */}
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden relative border border-purple-500/5">
                            <motion.div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                              style={{ width: `${prgPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* DAILY SOVEREIGN ALLOCATION & COMPLIANCE HUD PANEL */}
                <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl relative overflow-hidden flex flex-wrap justify-between items-center gap-4 font-mono backdrop-blur-md">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.05)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] text-indigo-400 uppercase font-extrabold tracking-widest block animate-pulse">DAILY ALLOCATION PORTAL</span>
                    <h4 className="text-sm font-bold text-slate-100 uppercase">SOVEREIGN ALLOCATION BOUNTY</h4>
                    <p className="text-[10px] text-slate-400 max-w-sm font-sans leading-relaxed">
                      Completing all 4 multi-disciplinary self development grinds unlocks the daily system allocation allowance containing 2 Mana (MP) and 200 character experience points.
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

                    {/* Simulated fail trigger button */}
                    <button 
                      className="px-4 py-3 bg-red-950/20 border border-red-500/20 text-red-400 font-extrabold uppercase text-[10px] tracking-wider rounded-xl hover:bg-slate-900 hover:border-red-500/50 cursor-pointer transition-all duration-300"
                      onClick={() => {
                        const incompleteCount = gameState.quests.filter((q: any) => q.current < q.target).length || 2;
                        const goldDeduct = incompleteCount * 3; // Keep aligned to realistic penalty parameters
                        setGameState(prev => ({
                          ...prev,
                          gold: Math.max(0, prev.gold - goldDeduct)
                        }));
                        triggerSystemToast(`🚨 SYSTEM FAILURE SIMULATION: Missed daily grinds detected! Internals punctured. Lost -${goldDeduct} Sovereign Mana (MP)!`);
                      }}
                    >
                      Simulate Penalty Fail
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
                            className="bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 text-white font-black text-[10px] uppercase py-3 px-6 rounded-xl cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.2)] tracking-widest block text-center animate-pulse"
                            onClick={claimDailyAllocation}
                          >
                            CLAIM MANA ALLOCATE (+2 MP)
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
              <motion.div key="dungeons-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {forceSystemEnforcement && gameState.quests.some((q: any) => q.current < q.target) ? (
                  <div className="bg-slate-950/80 border-2 border-red-500/30 p-5 sm:p-8 rounded-3xl text-center font-mono space-y-6 shadow-[0_0_30px_rgba(239,68,68,0.15)] backdrop-blur-md">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-950/30 border border-red-500/30 flex items-center justify-center relative shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                      <Lock className="w-6 h-6 text-red-500 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-red-500 tracking-widest font-black uppercase block">DIMENSIONAL GATE ACCESS DENIED</span>
                    <h3 className="font-extrabold text-white text-lg tracking-wider">⛔ SYSTEM DIRECTIVE: INTERSECT LOCKED</h3>
                    <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                      Your physical structure has not cleared today's self-development directives. The Monarch System locks dimensional gate entrance for safety. Complete your <strong className="text-red-400">Daily Quests</strong> first!
                    </p>
                    <div className="bg-slate-900 border border-slate-950 p-4 rounded-xl divide-y divide-slate-800 max-w-sm mx-auto text-left space-y-2">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider pb-1.5 font-bold">Uncompleted Daily Tasks:</div>
                      {gameState.quests.map((q: any) => (
                        <div key={q.id} className="flex justify-between text-xs py-1.5 font-mono">
                          <span className="text-slate-350">{q.name}</span>
                          <span className={q.current >= q.target ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                            {q.current >= q.target ? "✓ CLEARED" : `${q.current}/${q.target} log`}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2">
                      <button 
                        className="px-6 py-2.5 bg-red-950/50 hover:bg-slate-900 border border-red-500/30 text-white font-bold uppercase rounded-xl text-xs transition-colors cursor-pointer"
                        onClick={() => setActiveTab("quests")}
                      >
                        DEPART TO DAILY QUESTS BOARD
                      </button>
                    </div>
                  </div>
                ) : !isFighting ? (
                  <>
                    <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl backdrop-blur-md mb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-cyan-500 uppercase block font-black tracking-[0.2em] mb-1">SYSTEM STATUS: HARMONIZED</span>
                          <h3 className="font-black text-2xl text-white uppercase italic tracking-tighter">DAILY ACTIVE GATES</h3>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-mono mt-2 max-w-md">
                            Dimensional fractures stabilized for 24h. Only 2 gates are currently accessible via the hunter network. High-rank fractures are lethal if level synchronization is mismatched.
                          </p>
                        </div>
                        <div className="bg-cyan-500/10 border border-cyan-500/20 px-3 py-2 rounded-xl text-right">
                          <span className="text-[9px] text-cyan-400 block font-bold">RESET TIMER</span>
                          <span className="text-white font-mono text-xs tabular-nums">23:59:59</span>
                        </div>
                      </div>
                    </div>

                    <div id="dungeons_grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        ...DUNGEONS_CATALOG.filter(d => activeGateIds.includes(d.id)),
                        ...adminGates.map(g => ({
                          id: g.id,
                          name: g.name,
                          rank: g.difficulty.includes("Rank") ? g.difficulty : `${g.difficulty}-Rank`,
                          minLevel: g.minLevel,
                          bossName: "Administrative Overlord Clone",
                          difficulty: `${g.difficulty} Administrative Gate`,
                          expReward: g.expReward,
                          goldReward: g.goldReward,
                          lootItem: {
                            id: "kasaka_fang",
                            name: g.lootItemName || "Monarch Twin-Blades",
                            chance: 1.00
                          },
                          enemyHealth: g.minLevel * 80 + 200,
                          enemyAttack: g.minLevel * 4 + 10,
                          desc: `An S-class administrative fracture in the dimension. Defeat the Overseer memory clone to secure S-rank items!`
                        }))
                      ].map((dung) => {
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
                                <div className="flex justify-between text-slate-400">
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
                              ) : preparedGateIds.includes(dung.id) ? (
                                <button
                                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/20 font-bold rounded-xl text-[10px] uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-cyan-900/20"
                                  onClick={() => startCombat(dung)}
                                >
                                  ENTER GATE PREFECTURE
                                </button>
                              ) : preparingGateId === dung.id ? (
                                <button className="w-full py-2.5 bg-indigo-950/60 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] uppercase tracking-widest cursor-wait flex items-center justify-center gap-2">
                                  <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                  ASYNC SYNCING ({prepTimer}s)
                                </button>
                              ) : (
                                <button
                                  className="w-full py-2.5 bg-indigo-900/40 hover:bg-indigo-600 text-indigo-100 border border-indigo-500/30 font-bold rounded-xl text-[10px] uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2"
                                  onClick={() => startPreparation(dung.id)}
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                  PREPARE: {onboardProfile.academicSubject || onboardProfile.careerTargetRole || "WORK SESSION"}
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
                    <div id="battle_fighters_arena" className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center border-b border-slate-900">
                      
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
                          <span className="text-red-500 font-bold font-mono">{enemyHp} / {enemyMaxHp} HP</span>
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
                                  <div className="text-slate-300 text-[11px]">System Mana Claimed: <span className="text-indigo-400 font-bold font-mono">+{earnedLoot.gold} MP</span></div>
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
                              <span className="text-slate-400 text-[10px] block mt-1">Losing 10% Sovereign Mana reserves back to system keys. Optimize health parameters via Vitality points.</span>
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
              <motion.div key="shadows-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
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
                    Use Sovereign Mana retrieved from successful dungeon sweeps to summon shadow soldiers. Deployed shadows assist attacks in real combat.
                  </p>
                </div>

                <div id="shadows_market" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.shadows.map(shadow => (
                    <div key={shadow.id} className="bg-slate-950/75 border border-slate-900 p-5 rounded-2xl backdrop-blur-md flex justify-between items-center font-mono text-xs">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-bold">
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
                        <div className="text-indigo-400 font-semibold text-xs">{shadow.cost} MP</div>
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
              <motion.div key="skills-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
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
                        <span className="text-indigo-400 font-black">{skill.cost} MP</span>
                        
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
              <motion.div key="backpack-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  
                  <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.05)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
                    <span className="text-[10px] font-mono text-cyan-400 uppercase block tracking-wider font-extrabold mb-1">Secure spatial luggage</span>
                    <h3 className="font-extrabold text-lg">SHADOW ARSENAL & SHOP</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono mt-2">
                      Purchase and unlock legendary armaments released via spatial leveling. Clicking on any armament displays its blue neon-bordered abilities detail sheet. Your backpack expands as you level up!
                    </p>
                  </div>

                  {/* Subsections: Owned Arsenal vs System Store */}
                  <div className="space-y-8">
                    
                    {/* PART 1: OWNED ARSENAL */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <div className="flex items-center gap-2">
                          <Sword className="w-4 h-4 text-cyan-400" />
                          <h4 className="text-xs font-bold font-mono tracking-widest text-slate-200 uppercase">ACTIVE ARSENAL ({gameState.inventory.length} / {maxSlots} Slots)</h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Level {gameState.level}: {maxSlots} Max Slots</span>
                      </div>

                      {maxSlots === 0 ? (
                        <div className="bg-slate-950/50 border border-slate-900 border-dashed rounded-3xl p-5 sm:p-8 text-center font-mono space-y-4">
                          <div className="w-12 h-12 mx-auto rounded-full bg-slate-950/80 border border-red-500/20 flex items-center justify-center relative shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <Lock className="w-5 h-5 text-red-500 animate-pulse" />
                          </div>
                          <span className="text-[9px] text-red-500 tracking-widest font-black uppercase block">DIMENSIONAL LOCKOUT</span>
                          <h4 className="font-extrabold text-white text-sm">SPATIAL BACKPACK STORAGE UNMANIFESTED</h4>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                            Your level molecular density is too sparse. Standard Level-1 Player lacks backpack boundary parameters. <strong className="text-cyan-400">Reach Level 2</strong> to expand 1 space slot (+1 slot added with every level up).
                          </p>
                        </div>
                      ) : (
                        <div id="backpack_items_list" className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                          {/* 1. Owned items */}
                          {gameState.inventory.map((item) => {
                            const colors = getWeaponColorClasses(item.id);
                            return (
                              <div 
                                key={item.id} 
                                className={`group relative aspect-square bg-slate-950/75 border border-slate-900/60 p-2 rounded-xl backdrop-blur-md flex flex-col items-center justify-center font-mono cursor-pointer transition-all duration-300 animate-fade-in hover:scale-105 ${colors.border} ${colors.bg} ${colors.glow} ${item.equipped ? 'border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-cyan-950/10' : ''}`}
                                onClick={() => setSelectedWeaponDetails(item)}
                                title={`${item.name} (${item.rarity}-Rank) \n${item.description}`}
                              >
                                {item.equipped && (
                                  <span className="absolute top-1 left-1 bg-cyan-950/80 border border-cyan-500/60 rounded text-[9px] text-cyan-300 px-1 py-0.5 font-black uppercase tracking-widest scale-90 z-10 animate-pulse">
                                    E
                                  </span>
                                )}
                                
                                <span className={`absolute top-1 right-1 font-black text-[9px] z-10 ${colors.text}`}>
                                  {item.rarity}
                                </span>

                                <div className="w-12 h-12 flex items-center justify-center select-none pointer-events-none filter drop-shadow-[0_0_6px_rgba(6,182,212,0.15)]">
                                  {renderNeonWeaponPreview(item.id, item.equipped)}
                                </div>

                                <span className="text-[10px] font-bold text-slate-350 truncate w-full text-center mt-1.5 px-1 group-hover:text-cyan-300">
                                  {item.name.replace("Sovereign's ", "S. ").replace("Commander ", "C. ").replace("Knight's ", "K. ").replace("Goblin ", "G. ")}
                                </span>
                              </div>
                            );
                          })}

                          {/* 2. Interactive Empty Slots */}
                          {emptySlotsCount > 0 && Array.from({ length: emptySlotsCount }).map((_, idx) => (
                            <div 
                              key={`empty-slot-${idx}`} 
                              className="aspect-square border border-dashed border-slate-800/40 bg-slate-950/10 p-2 rounded-xl flex flex-col items-center justify-center font-mono text-xs text-slate-500 relative group hover:border-cyan-500/20 hover:bg-slate-950/20 transition-all duration-300 h-auto cursor-default"
                              title="Vacant Space - Unused spatial storage slot"
                            >
                              <div className="w-10 h-10 rounded-lg border border-dashed border-slate-800/30 flex items-center justify-center p-1 bg-slate-950/20 group-hover:border-cyan-500/20 transition-all">
                                <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-500 group-hover:scale-110 transition-all" />
                              </div>
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1 scale-90">SLOT {gameState.inventory.length + idx + 1}</span>
                            </div>
                          ))}

                          {/* 3. Locked slots preview (shows next 2 slot benchmarks) */}
                          {Array.from({ length: 2 }).map((_, idx) => {
                            const nextLvl = gameState.level + idx + 1;
                            return (
                              <div 
                                key={`locked-benchmark-${idx}`}
                                className="aspect-square border border-dashed border-red-950/20 bg-slate-950/5 p-2 rounded-xl flex flex-col items-center justify-center font-mono text-xs text-slate-600 relative opacity-45 cursor-not-allowed"
                                title={`Locked Space - Reach Level ${nextLvl} to unlock this space slot`}
                              >
                                <div className="w-10 h-10 rounded-lg border border-dashed border-red-950/10 flex flex-col items-center justify-center p-1 bg-slate-950/30">
                                  <Lock className="w-3.5 h-3.5 text-red-500/40 mb-0.5" />
                                </div>
                                <span className="text-[9px] text-red-500 font-extrabold uppercase scale-90 mt-1">LV {nextLvl}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
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
                        const colors = getWeaponColorClasses(weaponTemplate.id);

                        return (
                          <div 
                            key={weaponTemplate.id} 
                            className={`group relative bg-slate-950/75 border border-slate-900/60 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between font-mono text-xs transition-all duration-300 ${
                              isOwned ? "opacity-65 cursor-pointer hover:bg-slate-950/90" : 
                              !isUnlocked ? "opacity-40 bg-slate-900/10 cursor-not-allowed" : 
                              `cursor-pointer ${colors.border} ${colors.bg} ${colors.glow}`
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
                                <span className={`px-2 py-0.5 rounded border ${isOwned ? "bg-slate-900 text-slate-400 border-slate-800" : colors.badge}`}>{weaponTemplate.rarity} Rarity</span>
                                <span className={isOwned ? "text-slate-500" : isUnlocked ? "text-yellow-400 font-extrabold" : "text-red-500 font-extrabold"}>
                                  {isOwned ? "ACQUIRED" : isUnlocked ? "AVAILABLE" : `UNLOCKS AT LV ${shopMeta.levelReq}`}
                                </span>
                              </div>
                              <h4 className={`text-sm font-bold text-slate-200 transition-colors group-hover:${colors.text}`}>{weaponTemplate.name}</h4>
                              
                              <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-1">{weaponTemplate.description}</p>
                              
                              {!isOwned && (
                                <div className="text-indigo-400 text-xs font-bold mt-1 flex items-center gap-1.5">
                                  Price: <span className="text-cyan-400 font-extrabold">{shopMeta.cost} MP</span>
                                </div>
                              )}
                            </div>

                            {/* Neon Outline Silhouette preview with colored shadow */}
                            <div className="w-16 h-16 rounded-xl bg-slate-900/60 p-1.5 flex items-center justify-center border border-slate-800/80 group-hover:border-slate-500/20 shadow-[0_0_15px_rgba(34,211,238,0.05)] select-none">
                              {renderNeonWeaponPreview(weaponTemplate.id, false)}
                            </div>

                            {/* Lock Icon Overlay if Locked */}
                            {!isUnlocked && !isOwned && (
                              <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center pointer-events-none">
                                <div className="bg-slate-950/90 border border-red-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                                  <Lock className="w-3.5 h-3.5 text-red-500" />
                                  <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">LOCKED (LV {shopMeta.levelReq})</span>
                                </div>
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

            {/* C_2. THE MARKET SYSTEM PORTAL */}
            {activeTab === "market" && (
              <motion.div key="market-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* Visual Header */}
                <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.08)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
                  <span className="text-[10px] font-mono text-amber-500 block tracking-widest font-extrabold uppercase mb-1"> Black Market System</span>
                  <h3 className="font-extrabold text-lg flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-500" />
                    DIMENSIONAL EXCHANGE
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono mt-2">
                    Purchase exclusive artifacts and items manifested by the System Monarch. All transactions require pure gold tokens.
                  </p>
                </div>

                <div className="space-y-4">
                  {adminMarketItems.filter(item => item.isActive).length === 0 ? (
                    <div className="text-center py-12 bg-slate-950/50 border border-slate-900 border-dashed rounded-[2rem] text-slate-500 font-mono text-xs uppercase tracking-widest shadow-inner">
                      The market is currently empty...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {adminMarketItems.filter(i => i.isActive).map(item => (
                        <div key={item.id} className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition-all flex flex-col justify-between group overflow-hidden relative shadow-lg">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl pointer-events-none rounded-full" />
                          
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-sm font-bold text-white uppercase tracking-tight">{item.name}</h4>
                              <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                                item.rank === 'S-Rank' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                item.rank === 'A-Rank' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                item.rank === 'B-Rank' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                item.rank === 'C-Rank' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                'bg-slate-800 text-slate-400'
                              }`}>{item.rank}</span>
                            </div>
                            
                            {item.imageUrl && (
                              <div 
                                className="w-full h-32 mt-2 mb-3 rounded-xl overflow-hidden border border-slate-800 relative shadow-inner cursor-pointer group-hover:border-amber-500/50 transition-colors"
                                onClick={() => { playSelectSound(); setInspectMarketItem(item); }}
                              >
                                <span className="absolute top-1 left-2 z-10 text-[8px] bg-black/60 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest text-amber-500">Preview Scan</span>
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-[2px]">
                                  <span className="text-white text-[10px] font-black uppercase tracking-widest border border-white/20 px-3 py-1 rounded-lg">Inspect Artifact</span>
                                </div>
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" referrerPolicy="no-referrer" />
                              </div>
                            )}

                            <p className="text-[10px] text-slate-400 font-mono line-clamp-3 leading-relaxed mb-4">
                              {item.description || "A mysterious item vibrating with spatial energy."}
                            </p>
                          </div>
                          
                          <div className="flex items-end justify-between mt-4">
                            <div>
                               <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{item.type}</div>
                               <div className="font-mono text-sm font-black text-amber-400">
                                 {item.adCodeSnippet ? "SYNDICATOR AD" : `${item.price.toLocaleString()} G`}
                               </div>
                            </div>
                            
                            {item.adCodeSnippet ? (
                               <button
                                 onClick={() => handleBuyAdminMarketItem(item)}
                                 disabled={item.stock === 0}
                                 className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors shadow-lg ${
                                   item.stock === 0
                                     ? "bg-slate-900 text-slate-600 cursor-not-allowed" 
                                     : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 active:scale-95 border border-emerald-400/30"
                                 }`}
                               >
                                 {item.stock === 0 ? "SOLD OUT" : "WATCH AD"}
                               </button>
                            ) : (
                               <button
                                 onClick={() => handleBuyAdminMarketItem(item)}
                                 disabled={gameState.gold < item.price || (item.stock === 0)}
                                 className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg ${
                                   gameState.gold < item.price || item.stock === 0
                                     ? "bg-slate-900 text-slate-600 cursor-not-allowed" 
                                     : "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20 active:scale-95"
                                 }`}
                               >
                                 {item.stock === 0 ? "SOLD OUT" : gameState.gold < item.price ? "NO FUNDS" : "PURCHASE"}
                               </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* D. THE LIFE FORGE SYSTEM PORTAL */}
            {activeTab === "life_forge" && (
              <motion.div key="life-forge-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* Visual Header */}
                <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(147,51,234,0.08)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
                  <span className="text-[10px] font-mono text-purple-400 block tracking-widest font-extrabold uppercase mb-1"> Imperial Sovereign Core</span>
                  <h3 className="font-extrabold text-lg">THE LIFE FORGE PORTAL</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono mt-2">
                     Gamified Self-Development directives linked to status parameters. Completing syllabus grinds, heavy physique training, and job-recruitment milestones triggers direct character attribute mutations. Compliance is unyielding!
                  </p>

                  {/* Force compliance toggle button in header for immersion */}
                  <div className="mt-4 pt-4 border-t border-slate-900/60 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${forceSystemEnforcement ? "bg-red-500 animate-ping" : "bg-slate-700"}`} />
                      <span className="text-[10px] text-slate-400 font-mono">
                        Status Directive: {forceSystemEnforcement ? "STRICT SYSTEM COMPLIANCE ACTIVE" : "MANUAL BYPASS COMMITTED"}
                      </span>
                    </div>

                    <button 
                      className={`px-3 py-1.5 rounded-lg border text-[9px] font-mono uppercase font-bold tracking-wider cursor-pointer transition-colors ${
                        forceSystemEnforcement 
                          ? "bg-red-950/20 border-red-500/30 text-red-300 hover:bg-slate-900" 
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                      onClick={() => {
                        playSelectSound();
                        setForceSystemEnforcement(prev => !prev);
                        triggerSystemToast(forceSystemEnforcement ? "⚠️ DIRECTIVE ALERT: System enforcement disabled. Dimensional Gates unlocked!" : "🔒 DIRECTIVE ALERT: Strict compliance enforced! Gates locked until daily tasks cleared!");
                      }}
                    >
                      {forceSystemEnforcement ? "DEACTIVATE EXCLUSION LOCK" : "ACTIVATE EXCLUSION LOCK"}
                    </button>
                  </div>
                </div>

                {/* Sub-tab Selection Header Bar */}
                <div className="flex border-b border-slate-910 gap-1 pb-1">
                  {[
                    { id: "academics", label: "Academics & Study", icon: BookOpen, color: "text-purple-400" },
                    { id: "fitness", label: "Fitness & Nutrition", icon: Flame, color: "text-orange-400" },
                    { id: "career", label: "Career & Job Guild", icon: Briefcase, color: "text-cyan-400" }
                  ].map(sub => {
                    const Icon = sub.icon;
                    const isActive = forgeSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-bold tracking-wider cursor-pointer transition-all ${
                          isActive 
                            ? "bg-slate-950 border border-slate-900 text-slate-100 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" 
                            : "text-slate-500 hover:text-slate-300 bg-transparent"
                        }`}
                        onClick={() => {
                          playSelectSound();
                          setForgeSubTab(sub.id as any);
                        }}
                      >
                        <Icon className={`w-3.5 h-3.5 ${sub.color}`} />
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Visual Content Panels for each sub tab */}

                {/* 1. ACADEMICS & STUDIES */}
                {forgeSubTab === "academics" && (
                  <div className="space-y-6">
                    
                    {/* Add Academic task form */}
                    <div className="bg-slate-950/45 border border-slate-900/60 p-5 rounded-2xl font-mono text-xs space-y-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-400" />
                        <h4 className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">INSCRIBE ACADEMIC SYLLABUS DIRECTIVE</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 uppercase font-black font-bold">Blueprint Target Name</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 outline-none focus:border-purple-500/50" 
                            placeholder="e.g. Master Operating Systems Exams" aria-label="e.g. Master Operating Systems Exams"
                            value={newAcadName}
                            onChange={(e) => setNewAcadName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 uppercase font-black font-bold">Chapters / Practicals count requirement</label>
                          <select 
                            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500/50 cursor-pointer text-[11px]"
                            value={newAcadTarget}
                            onChange={(e) => setNewAcadTarget(parseInt(e.target.value, 10))}
                          >
                            {[2, 3, 4, 5, 6, 8, 10].map(v => (
                              <option key={v} value={v}>{v} Sessions / Chapters Required</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 uppercase font-black font-bold">Detailed Exam/Project Focus Description</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 outline-none focus:border-purple-500/50" 
                          placeholder="e.g. Study virtual memory page faults, thread synchronizations & cache lookups" aria-label="e.g. Study virtual memory page faults, thread synchronizations & cache lookups"
                          value={newAcadDesc}
                          onChange={(e) => setNewAcadDesc(e.target.value)}
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button 
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-500/30 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-xl cursor-pointer shadow-[0_0_15px_rgba(147,51,234,0.15)] transition-all"
                          onClick={addAcademicQuest}
                        >
                          PUBLISH RESEARCH GOAL
                        </button>
                      </div>
                    </div>

                    {/* Quests Lists */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold">ACTIVE COGNITIVE EXPERIMENTS</h4>
                      
                      {academicQuests.length === 0 ? (
                        <div className="bg-slate-950/20 border border-slate-900 border-dashed rounded-2xl p-6 text-center font-mono text-slate-500 text-xs">
                          All cognitive experiments completed. Inscribe a new academic syllabus objective!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {academicQuests.map((quest: any) => {
                            const pct = Math.round((quest.current / quest.target) * 100);
                            return (
                              <div key={quest.id} className="bg-slate-950/60 border border-slate-900 p-5 rounded-2xl font-mono text-xs flex flex-col justify-between space-y-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(ellipse_at_top_right,rgba(147,51,234,0.03)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
                                
                                <div className="space-y-1 relative z-10">
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="text-[9px] font-black text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded uppercase tracking-wider">
                                      {quest.completed ? "✓ SECURED" : "INTELLIGENCE FOCUS"}
                                    </span>
                                    <button 
                                      className="text-slate-600 hover:text-red-400 transition-colors p-1 cursor-pointer"
                                      onClick={() => deleteAcademicQuest(quest.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <h5 className="font-bold text-slate-200 mt-1">{quest.name}</h5>
                                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-1">
                                    {quest.desc}
                                  </p>
                                </div>

                                <div className="space-y-3 pt-2">
                                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                                    <span>Chapters Progress:</span>
                                    <span className="font-bold text-slate-200">{quest.current} / {quest.target} Done</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                    <div className="bg-purple-500 h-full transition-all duration-303" style={{ width: `${pct}%` }} />
                                  </div>

                                  {!quest.completed ? (
                                    <div className="flex gap-2">
                                      <button 
                                        className="flex-1 py-2 bg-purple-950/35 hover:bg-purple-600 hover:text-white border border-purple-500/20 text-purple-400 font-extrabold uppercase rounded-lg text-[10px] tracking-wider cursor-pointer transition-all"
                                        onClick={() => incrementAcademicQuest(quest.id, 1)}
                                      >
                                        +1 Chapter Read
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-2.5 text-center text-purple-400 font-extrabold text-[9px] uppercase tracking-wider">
                                      🏆 STAT PERMANENT BOOST UNLOCKED (+1 INT)
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Interactive POMODORO TERMINAL */}
                    <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl font-mono text-xs space-y-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.04)_0%,rgba(0,0,0,0)_50%)] pointer-events-none" />
                      
                      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-900 pb-3">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs uppercase font-extrabold text-slate-350 tracking-wider">SYSTEM STUDY BOOST TERMINAL</h4>
                        </div>
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                          Active State: {focusIsActive ? "COMPILING MIND" : "TERMINAL IDLE"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-wrap">
                        
                        {/* Huge counter */}
                        <div className="md:col-span-5 text-center space-y-4">
                          <div className="inline-block px-4 sm:px-8 py-4 sm:py-5 rounded-3xl bg-slate-950/90 border border-indigo-500/20 text-slate-100 relative shadow-inner">
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#a5b4fc] block mb-1">
                              {focusInterval} FOCUS DUEL
                            </span>
                            <span className="text-4xl md:text-5xl font-black font-mono select-all tracking-wider text-white">
                              {Math.floor(focusSecs / 60).toString().padStart(2, "0")}:
                              {(focusSecs % 60).toString().padStart(2, "0")}
                            </span>
                          </div>

                          <div className="flex justify-center gap-2">
                            <button
                              className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                                focusIsActive 
                                  ? "bg-amber-600/10 border-amber-500/30 text-amber-400 hover:bg-slate-900" 
                                  : "bg-indigo-600 hover:bg-indigo-500 border-indigo-400/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                              }`}
                              onClick={() => {
                                playSelectSound();
                                const nextState = !focusIsActive;
                                setFocusIsActive(nextState);
                                if (nextState) {
                                  setPomodoroFullscreen(true);
                                }
                              }}
                            >
                              {focusIsActive ? "PAUSE GRIND" : "ARISEN GRIND (START)"}
                            </button>
                            <button
                              className="px-4 py-2 bg-purple-900/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 hover:text-white rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer"
                              onClick={() => {
                                playSelectSound();
                                setPomodoroFullscreen(true);
                              }}
                            >
                              FULLSCREEN
                            </button>
                            <button
                              className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer"
                              onClick={() => {
                                playDaggerSwipe();
                                setFocusIsActive(false);
                                setFocusSecs(focusTarget);
                              }}
                            >
                              RESET
                            </button>
                          </div>
                        </div>

                        {/* Setup controls */}
                        <div className="md:col-span-7 space-y-4 font-mono">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] text-slate-500 uppercase font-black">Pre-configured Rhythms</label>
                              <div className="grid grid-cols-2 gap-1.5">
                                {[
                                  { label: "15m Sprint", sec: 900 },
                                  { label: "25m Study", sec: 1500 },
                                  { label: "45m Deep", sec: 2700 },
                                  { label: "5m Break", sec: 300 }
                                ].map(t => (
                                  <button
                                    key={t.label}
                                    className={`px-2 py-1.5 rounded-lg border text-[9px] uppercase font-bold text-center cursor-pointer transition-colors ${
                                      focusTarget === t.sec 
                                        ? "bg-slate-900 border-indigo-500/50 text-indigo-300"
                                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-350"
                                    }`}
                                    onClick={() => {
                                      playSelectSound();
                                      setFocusIsActive(false);
                                      setFocusTarget(t.sec);
                                      setFocusSecs(t.sec);
                                    }}
                                  >
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] text-slate-500 uppercase font-black font-mono">Cognitive Ambient Sound</label>
                              <select
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-[10px] px-2 py-2 h-[34px] outline-none text-slate-350 cursor-pointer focus:border-indigo-500/60"
                                value={focusAmbient}
                                onChange={(e) => setFocusAmbient(e.target.value)}
                              >
                                <option value="Abyssal Silence">Abyssal Silence (No Sound)</option>
                                <option value="Synthetic Lofi Focus Pulse">Synthetic Lofi Focus Pulse</option>
                                <option value="Rain on Castle Gates">Rain on Castle Gates</option>
                                <option value="Ancient Library Binaural">Ancient Library Binaural</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase font-black">Matrix Focus Logs</label>
                            <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 h-24 overflow-y-auto divide-y divide-slate-950/30 select-text font-mono text-[9px] leading-relaxed text-indigo-300">
                              {focusLogs.map((log, i) => (
                                <div key={i} className="py-1">{log}</div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                )}

                {/* 2. BODYBUILDING & PHYSIQUE (FITNESS) */}
                {forgeSubTab === "fitness" && (
                  <div className="space-y-6">
                    
                    {/* Log bodybuilding Lift form */}
                    <div className="bg-slate-950/45 border border-slate-900/60 p-5 rounded-2xl font-mono text-xs space-y-4">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <h4 className="text-xs uppercase font-extrabold text-slate-300 tracking-wider font-mono">SPECIFY HEAVY TRAINING LOAD</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 uppercase font-black font-bold">Lifting Exercise Name</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 outline-none focus:border-orange-500/50" 
                            placeholder="e.g. Incline Bench Press" aria-label="e.g. Incline Bench Press"
                            value={newLiftName}
                            onChange={(e) => setNewLiftName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 uppercase font-black font-bold">Target Working Load (Weight)</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 outline-none focus:border-orange-500/50" 
                            placeholder="e.g. 75kg" aria-label="e.g. 75kg"
                            value={newLiftWeight}
                            onChange={(e) => setNewLiftWeight(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 uppercase font-black font-mono font-bold">Target working Sets</label>
                          <select 
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-orange-500/50 cursor-pointer text-[11px]"
                            value={newLiftSets}
                            onChange={(e) => setNewLiftSets(parseInt(e.target.value, 10))}
                          >
                            {[3, 4, 5, 6].map(v => (
                              <option key={v} value={v}>{v} working sets</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button 
                          className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 border border-orange-500/30 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-xl cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.15)] transition-all"
                          onClick={addLiftWorkout}
                        >
                          COMMENCE HEAVY CALIBRATION
                        </button>
                      </div>
                    </div>

                    {/* Exercises Lists */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold">ACTIVE PHYSIQUE OVERLOAD BLUEPRINTS</h4>
                      
                      {bodybuildingExercises.length === 0 ? (
                        <div className="bg-slate-950/20 border border-slate-900 border-dashed rounded-2xl p-6 text-center font-mono text-slate-500 text-xs">
                          Physique databases static. Initialize a bodybuilding heavyset benchmark!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {bodybuildingExercises.map((l: any) => {
                            const pct = Math.round((l.currentSets / l.targetSets) * 100);
                            return (
                              <div key={l.id} className="bg-slate-950/60 border border-slate-900 p-5 rounded-2xl font-mono text-xs flex flex-col justify-between space-y-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.03)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
                                
                                <div className="space-y-1 relative z-10">
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="text-[9px] font-black text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded uppercase tracking-wider">
                                      {l.weight} Load
                                    </span>
                                    <button 
                                      className="text-slate-600 hover:text-red-400 transition-colors p-1 cursor-pointer"
                                      onClick={() => deleteLiftWorkout(l.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <h5 className="font-bold text-slate-200 mt-1">{l.name}</h5>
                                </div>

                                <div className="space-y-3 pt-2">
                                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                                    <span>Sets log:</span>
                                    <span className="font-bold text-slate-200">{l.currentSets} / {l.targetSets} sets done</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                    <div className="bg-orange-500 h-full transition-all duration-303" style={{ width: `${pct}%` }} />
                                  </div>

                                  {!l.completed ? (
                                    <button 
                                      className="w-full py-2 bg-orange-955 hover:bg-orange-600 hover:text-white border border-orange-500/20 text-orange-400 font-extrabold uppercase rounded-lg text-[10px] tracking-wider cursor-pointer transition-all"
                                      onClick={() => incrementLiftSet(l.id)}
                                    >
                                      ✓ Complete 1 heavy set
                                    </button>
                                  ) : (
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-2.5 text-center text-orange-400 font-extrabold text-[9px] uppercase tracking-wider">
                                      🏆 PHY ATTRIBUTE EXPANDED (+1 STR/VIT Mapped)
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Caloric Intake and Nutrition Calibration */}
                    <div className="bg-slate-950/45 border border-slate-900/60 p-5 rounded-2xl font-mono text-xs space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2 flex-wrap gap-2">
                        <span className="text-[10px] text-orange-400 font-black tracking-widest uppercase">SOVEREIGN METABOLISM DATA</span>
                        <span className="text-[9px] text-slate-500">Daily calorie target: {targetCalories} kcal &bull; Daily protein target: {targetProtein}g</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Calories tracker column */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-350 font-bold uppercase">Energy Intake:</span>
                            <span className="text-orange-400 font-bold">{intakeCalories} / {targetCalories} kcal</span>
                          </div>
                          
                          <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden relative">
                            <div className="bg-orange-500 h-full transition-all duration-305" style={{ width: `${Math.min(100, (intakeCalories / targetCalories) * 100)}%` }} />
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {[
                              { label: "+100 kcal", val: 100 },
                              { label: "+350 kcal", val: 350 },
                              { label: "+500 kcal", val: 500 },
                              { label: "Wipe Log", val: -9999 }
                            ].map(btn => (
                              <button
                                key={btn.label}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[9px] font-bold text-slate-350 hover:text-white cursor-pointer"
                                onClick={() => {
                                  playSelectSound();
                                  if (btn.val < 0) setIntakeCalories(0);
                                  else setIntakeCalories(v => Math.min(6000, v + btn.val));
                                }}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Protein tracker column */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold uppercase">Synthesized Amino Acids:</span>
                            <span className="text-amber-400 font-bold">{intakeProtein} / {targetProtein} grams</span>
                          </div>

                          <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden relative">
                            <div className="bg-amber-400 h-full transition-all duration-305" style={{ width: `${Math.min(100, (intakeProtein / targetProtein) * 100)}%` }} />
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {[
                              { label: "+10g protein", val: 10 },
                              { label: "+30g protein", val: 30 },
                              { label: "+50g protein", val: 50 },
                              { label: "Wipe Log", val: -9999 }
                            ].map(btn => (
                              <button
                                key={btn.label}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white cursor-pointer"
                                onClick={() => {
                                  playSelectSound();
                                  if (btn.val < 0) setIntakeProtein(0);
                                  else setIntakeProtein(v => Math.min(300, v + btn.val));
                                }}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                )}

                {/* 3. CAREER & GUILD RECRUITMENT */}
                {forgeSubTab === "career" && (
                  <div className="space-y-6">
                    
                    {/* Career milestones dashboard */}
                    <div className="bg-slate-950/75 border border-slate-900 p-6 rounded-2xl font-mono text-xs space-y-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">CAREER SYSTEMATIC PROGRESS CONSOLE</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                        
                        {/* 1. Resume */}
                        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase font-black">Milestone 1</span>
                            <h5 className="font-bold text-slate-200 mt-0.5">Resume Refactoring</h5>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-sans">Optimize layout, action verbs & structure metrics.</p>
                          </div>
                          <div>
                            {careerMilestones.resumeScore > 0 ? (
                              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg py-1.5 text-center text-cyan-400 font-extrabold text-[9px] uppercase tracking-wider">
                                ✓ CLEARED (+1 AGIL)
                              </div>
                            ) : (
                              <button 
                                className="w-full py-1.5 bg-cyan-950/40 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-400/20 text-cyan-300 font-extrabold uppercase rounded-lg text-[9px] cursor-pointer"
                                onClick={completeResumeObjective}
                              >
                                Done & Inscribe
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 2. Portfolio Projects */}
                        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase font-black">Milestone 2</span>
                            <h5 className="font-bold text-slate-200 mt-0.5">Modular Systems</h5>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-sans">Commit and launch 2 robust production interfaces.</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                              <span>Committed:</span>
                              <span className="font-bold text-cyan-400">{careerMilestones.portfolioProjects} / 2 apps</span>
                            </div>
                            {careerMilestones.portfolioProjects >= 2 ? (
                              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg py-1.5 text-center text-cyan-400 font-extrabold text-[9px] uppercase tracking-wider">
                                ✓ CLEARED (+2 INT)
                              </div>
                            ) : (
                              <button 
                                className="w-full py-1.5 bg-cyan-950/40 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-400/20 text-cyan-300 font-extrabold uppercase rounded-lg text-[9px] cursor-pointer"
                                onClick={incrementPortfolioProjects}
                              >
                                Publish 1 App (+1)
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 3. LinkedIn connections */}
                        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase font-black">Milestone 3</span>
                            <h5 className="font-bold text-slate-200 mt-0.5">Recruiter Contacts</h5>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-sans">Reach out & engage 5 target recruitment leads.</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                              <span>Outreaches:</span>
                              <span className="font-bold text-cyan-400">{careerMilestones.recruiterOutreach} / 5 leads</span>
                            </div>
                            {careerMilestones.recruiterOutreach >= 5 ? (
                              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg py-1.5 text-center text-cyan-400 font-extrabold text-[9px] uppercase tracking-wider">
                                ✓ CLEARED (+2 PERC)
                              </div>
                            ) : (
                              <button 
                                className="w-full py-1.5 bg-cyan-950/40 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-400/20 text-cyan-300 font-extrabold uppercase rounded-lg text-[9px] cursor-pointer"
                                onClick={incrementRecruiterOutreach}
                              >
                                Register Lead (+1)
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 4. Leetcode grind */}
                        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase font-black">Milestone 4</span>
                            <h5 className="font-bold text-slate-200 mt-0.5">Algorithmic Duels</h5>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-sans">Conquer 10 data structure & algorithm battles.</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                              <span>Solved:</span>
                              <span className="font-bold text-cyan-400">{careerMilestones.leetcodeGrind} / 10 battles</span>
                            </div>
                            {careerMilestones.leetcodeGrind >= 10 ? (
                              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg py-1.5 text-center text-cyan-400 font-extrabold text-[9px] uppercase tracking-wider">
                                ✓ CLEARED (+3 INT)
                              </div>
                            ) : (
                              <button 
                                className="w-full py-1.5 bg-cyan-950/40 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-400/20 text-cyan-300 font-extrabold uppercase rounded-lg text-[9px] cursor-pointer"
                                onClick={incrementLeetcodeGrind}
                              >
                                Solve DS Grid (+1)
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Job application log board */}
                    <div className="bg-slate-950/45 border border-slate-900/60 p-5 rounded-2xl font-mono text-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-910 pb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-cyan-400" />
                          <h4 className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">GUILD RECRUITMENT APPLICATIONS</h4>
                        </div>
                        <span className="text-[9px] text-slate-500">Applications count: {jobApplications.length} listed</span>
                      </div>

                      {/* Add Application Form */}
                      <div className="bg-slate-900/30 p-4 border border-slate-905 rounded-xl space-y-3.5">
                        <span className="text-[9px] font-black uppercase text-cyan-500/80 block">TRACK NEW RECRUITMENT PROFILE</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase font-black">Guild Corp/Company</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500/50" 
                              placeholder="e.g. Hunter Corp" aria-label="e.g. Hunter Corp"
                              value={newJobCompany}
                              onChange={(e) => setNewJobCompany(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase font-black">Sovereign Role</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500/50" 
                              placeholder="e.g. Fullstack Wizard" aria-label="e.g. Fullstack Wizard"
                              value={newJobRole}
                              onChange={(e) => setNewJobRole(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase font-black">Status Phase</label>
                            <select 
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 outline-none cursor-pointer focus:border-cyan-500/50 text-[11px]"
                              value={newJobStatus}
                              onChange={(e) => setNewJobStatus(e.target.value)}
                            >
                              <option value="Applied">Applied (Initial Registry)</option>
                              <option value="Online Screening">Online Assessment Duo</option>
                              <option value="Interview Scheduled">Boss Interview scheduled</option>
                              <option value="Offer Unlocked">Offer Unlocked (Sovereign Win)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase font-black font-sans font-bold">Brief notes</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-cyan-500/50" 
                              placeholder="Salary details, timeline" aria-label="Salary details, timeline"
                              value={newJobNotes}
                              onChange={(e) => setNewJobNotes(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button 
                            className="px-4 py-2 bg-cyan-950/40 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-400/20 text-cyan-300 font-extrabold uppercase rounded-lg text-[9px] tracking-wider cursor-pointer transition-all"
                            onClick={addJobApplication}
                          >
                            Add Job Record
                          </button>
                        </div>
                      </div>

                      {/* Application List */}
                      {jobApplications.length === 0 ? (
                        <div className="bg-slate-950/20 border border-slate-900 border-dashed rounded-xl p-4 text-center font-mono text-slate-500 text-[10px]">
                          No active job applications tracked. Deploy applications to log details!
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {jobApplications.map((app: any) => (
                            <div key={app.id} className="bg-slate-902/40 border border-slate-900 p-4 rounded-xl flex flex-wrap justify-between items-center gap-3 font-mono">
                              <div className="flex-1 space-y-1 min-w-[200px]">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-slate-100">{app.company}</span>
                                  <span className="text-[10px] text-slate-550 font-sans">&bull;</span>
                                  <span className="text-[10px] text-cyan-400 font-bold">{app.role}</span>
                                </div>
                                <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed italic pr-4">"{app.notes}"</p>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="space-y-1 min-w-[120px]">
                                  <label className="text-[10px] text-slate-550 block font-bold uppercase">Update progress stage</label>
                                  <select
                                    className="bg-slate-950 border border-slate-800 text-[10px] px-2 py-1 rounded-lg outline-none cursor-pointer text-slate-350"
                                    value={app.status}
                                    onChange={(e) => updateJobStatus(app.id, e.target.value)}
                                  >
                                    <option value="Applied">Applied</option>
                                    <option value="Online Screening">Online Screening</option>
                                    <option value="Interview Scheduled">Interview Scheduled</option>
                                    <option value="Offer Unlocked">Offer Unlocked 👑</option>
                                    <option value="Declined">Rejected / Silent</option>
                                  </select>
                                </div>

                                <button
                                  className="p-1.5 bg-slate-950 rounded-lg text-slate-600 hover:text-red-400 border border-transparent hover:border-red-950 hover:bg-slate-900 transition-all cursor-pointer"
                                  onClick={() => deleteJobApplication(app.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </motion.div>
            )}



          </div>

        </div>

      </div>

      {/* MOBILE NAV BAR BOTTOM SPACER */}
      <div className="h-24 md:h-12 w-full shrink-0 block" aria-hidden="true" />

      {/* WEAPON DETAIL BLUE NEON GLOWING POPUP MODAL (1000x Detailed) */}
      <AnimatePresence>
        {selectedWeaponDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-slate-950/85 z-[90] flex items-center justify-center p-2 sm:p-6 cursor-pointer overflow-y-auto"
            onClick={() => setSelectedWeaponDetails(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50, rotateX: 20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, y: 50, opacity: 0, rotateX: -20 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className={`w-full max-w-2xl bg-slate-950/90 border p-3 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] relative text-left font-mono cursor-default max-h-[85vh] overflow-y-auto flex flex-col justify-between transition-all duration-500 ${
                selectedWeaponDetails.id === "rusty_dagger" ? "border-amber-500/50 shadow-[0_0_80px_rgba(234,179,8,0.2)]" :
                selectedWeaponDetails.id === "kasaka_fang" ? "border-cyan-500/50 shadow-[0_0_80px_rgba(6,182,212,0.2)]" :
                selectedWeaponDetails.id === "igris_sword" ? "border-rose-500/50 shadow-[0_0_80px_rgba(244,63,94,0.2)]" :
                selectedWeaponDetails.id === "demon_dagger" ? "border-indigo-400/50 shadow-[0_0_80px_rgba(99,102,241,0.2)]" :
                selectedWeaponDetails.id === "kamish_fang" ? "border-purple-500/50 shadow-[0_0_80px_rgba(168,85,247,0.2)]" :
                selectedWeaponDetails.id === "sovereigns_wrath" ? "border-pink-500/50 shadow-[0_0_90px_rgba(236,72,153,0.25)]" :
                "border-cyan-500/40 shadow-[0_0_80px_rgba(6,182,212,0.15)]"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Inner Decorative Sci-Fi Cyber Grid & Radial Aura */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.3)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-[2rem]" />
              
              {/* Dynamic Aura background based on model ID */}
              <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] pointer-events-none opacity-40 transition-all duration-500 ${
                selectedWeaponDetails.id === "rusty_dagger" ? "bg-amber-500/20" :
                selectedWeaponDetails.id === "kasaka_fang" ? "bg-cyan-500/20" :
                selectedWeaponDetails.id === "igris_sword" ? "bg-rose-500/20" :
                selectedWeaponDetails.id === "demon_dagger" ? "bg-indigo-500/20" :
                selectedWeaponDetails.id === "kamish_fang" ? "bg-purple-500/20" :
                selectedWeaponDetails.id === "sovereigns_wrath" ? "bg-pink-500/25" :
                "bg-cyan-500/10"
              }`} />
              <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-slate-900/40 rounded-full blur-[100px] pointer-events-none" />

              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6 border-b border-slate-900 pb-4 relative z-10">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] tracking-[0.25em] font-black uppercase px-2.5 py-1 rounded border ${
                      selectedWeaponDetails.id === "rusty_dagger" ? "text-amber-400 bg-amber-950/40 border-amber-500/30" :
                      selectedWeaponDetails.id === "kasaka_fang" ? "text-cyan-400 bg-cyan-950/40 border-cyan-500/30" :
                      selectedWeaponDetails.id === "igris_sword" ? "text-rose-400 bg-rose-950/40 border-rose-500/30" :
                      selectedWeaponDetails.id === "demon_dagger" ? "text-indigo-400 bg-indigo-950/40 border-indigo-500/30" :
                      selectedWeaponDetails.id === "kamish_fang" ? "text-purple-400 bg-purple-950/40 border-purple-500/30" :
                      selectedWeaponDetails.id === "sovereigns_wrath" ? "text-pink-400 bg-pink-950/40 border-pink-500/30 animate-pulse" :
                      "text-cyan-400 bg-cyan-950/40 border-cyan-500/30"
                    }`}>
                      SYSTEM VECTOR DIAGNOSIS
                    </span>
                    <span className="text-[9px] text-slate-400 tracking-widest font-black uppercase bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
                      ID: {selectedWeaponDetails.id.toUpperCase()}
                    </span>
                  </div>
                  <h3 className={`text-3xl sm:text-4xl font-extrabold uppercase mt-1.5 tracking-wider transition-colors drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] ${
                    selectedWeaponDetails.id === "rusty_dagger" ? "text-amber-300" :
                    selectedWeaponDetails.id === "kasaka_fang" ? "text-cyan-300" :
                    selectedWeaponDetails.id === "igris_sword" ? "text-rose-300" :
                    selectedWeaponDetails.id === "demon_dagger" ? "text-indigo-300" :
                    selectedWeaponDetails.id === "kamish_fang" ? "text-purple-300" :
                    selectedWeaponDetails.id === "sovereigns_wrath" ? "text-pink-300" :
                    "text-white"
                  }`}>
                    {selectedWeaponDetails.name}
                  </h3>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 flex items-center justify-center bg-slate-900/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-xl transition-colors"
                  onClick={() => setSelectedWeaponDetails(null)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </motion.button>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 flex-grow">
                
                {/* Left Column: Visual Projection */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="relative w-full aspect-square bg-slate-950/80 border-2 border-cyan-500/40 rounded-2xl flex items-center justify-center shadow-[inset_0_0_80px_rgba(6,182,212,0.15),0_0_30px_rgba(6,182,212,0.2)] overflow-hidden group transition-colors p-4">
                    <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
                    <div className="absolute top-2 left-2 text-[10px] font-black tracking-widest z-30 text-cyan-400/80 animate-pulse">
                      HOLOGRAPHIC VECTOR FIELD_
                    </div>
                    
                    {/* Immersive 3D rotatable weapon staging */}
                    <Rotatable3DWeapon itemId={selectedWeaponDetails.id} />
                  </div>

                  {/* High Level Stats Summary */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] text-slate-500 block mb-0.5 uppercase">RANK CLASSIFY</span>
                      <span className={`font-bold text-sm tracking-widest ${
                        selectedWeaponDetails.id === "rusty_dagger" ? "text-amber-400" :
                        selectedWeaponDetails.id === "kasaka_fang" ? "text-cyan-400" :
                        selectedWeaponDetails.id === "igris_sword" ? "text-rose-400" :
                        selectedWeaponDetails.id === "demon_dagger" ? "text-indigo-400" :
                        selectedWeaponDetails.id === "kamish_fang" ? "text-purple-400" :
                        selectedWeaponDetails.id === "sovereigns_wrath" ? "text-pink-400" :
                        "text-cyan-400"
                      }`}>{selectedWeaponDetails.rarity} RANK</span>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] text-slate-500 block mb-0.5 uppercase">ARMAMENT FIELD</span>
                      <span className="text-white font-bold text-sm tracking-widest">{selectedWeaponDetails.type}</span>
                    </div>
                    {selectedWeaponDetails.weaponDetails && (
                      <>
                        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 block mb-0.5 uppercase">SCALING RATE</span>
                          <span className="text-purple-400 font-bold text-sm tracking-widest">{selectedWeaponDetails.weaponDetails.scalingModifier}</span>
                        </div>
                        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 block mb-0.5 uppercase">CRITICAL FORCE</span>
                          <span className="text-rose-400 font-bold text-sm tracking-widest">{selectedWeaponDetails.weaponDetails.criticalChance}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column: In-depth analytical details */}
                <div className="lg:col-span-7 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                  
                  {/* Base Core Desc */}
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[9px] text-slate-400 tracking-wider font-extrabold uppercase">COGNITIVE DESCRIPTION STRAP</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{selectedWeaponDetails.description}</p>
                  </div>

                  {/* Weapon Details from DB */}
                  {selectedWeaponDetails.weaponDetails && (
                    <div className="space-y-4">
                      {/* Lore block */}
                      <div className={`border-l-2 pl-4 py-1.5 ${
                        selectedWeaponDetails.id === "rusty_dagger" ? "border-amber-500/50" :
                        selectedWeaponDetails.id === "kasaka_fang" ? "border-cyan-500/50" :
                        selectedWeaponDetails.id === "igris_sword" ? "border-rose-500/50" :
                        selectedWeaponDetails.id === "demon_dagger" ? "border-indigo-500/50" :
                        selectedWeaponDetails.id === "kamish_fang" ? "border-purple-500/50" :
                        selectedWeaponDetails.id === "sovereigns_wrath" ? "border-pink-500/50" :
                        "border-cyan-500/50"
                      }`}>
                        <span className="text-[9px] text-slate-400 tracking-widest uppercase block mb-1">CHRONICLE / ANCIENT LORE ARCHIVES</span>
                        <p className="text-slate-400 text-xs leading-relaxed italic">"{selectedWeaponDetails.weaponDetails.lore}"</p>
                      </div>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/80 flex justify-between">
                          <span className="text-slate-500">ATTACK SPEED</span>
                          <span className="text-white font-bold">{selectedWeaponDetails.weaponDetails.speed}</span>
                        </div>
                        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/80 flex justify-between">
                          <span className="text-slate-500">DURABILITY CAPACITY</span>
                          <span className="text-white font-bold">{selectedWeaponDetails.weaponDetails.durability}</span>
                        </div>
                        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/80 flex justify-between">
                          <span className="text-slate-500">MASS WEIGHT</span>
                          <span className="text-white font-bold">{selectedWeaponDetails.weaponDetails.weight}</span>
                        </div>
                        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/80 flex justify-between items-center overflow-hidden">
                          <span className="text-slate-500">MANA ORIGIN</span>
                          <span className={`font-bold truncate ml-2 text-[11px] ${
                            selectedWeaponDetails.id === "rusty_dagger" ? "text-amber-400" :
                            selectedWeaponDetails.id === "kasaka_fang" ? "text-cyan-400" :
                            selectedWeaponDetails.id === "igris_sword" ? "text-rose-400" :
                            selectedWeaponDetails.id === "demon_dagger" ? "text-indigo-400" :
                            selectedWeaponDetails.id === "kamish_fang" ? "text-purple-400" :
                            selectedWeaponDetails.id === "sovereigns_wrath" ? "text-pink-400" :
                            "text-cyan-400"
                          }`} title={selectedWeaponDetails.weaponDetails.origin}>{selectedWeaponDetails.weaponDetails.origin}</span>
                        </div>
                      </div>

                      {/* Passive Ability Highlight with custom match colors */}
                      <motion.div 
                        whileHover={{ scale: 1.01 }}
                        className={`p-4 rounded-xl flex items-start gap-3.5 border transition-all ${
                          selectedWeaponDetails.id === "rusty_dagger" ? "bg-amber-950/20 border-amber-500/40" :
                          selectedWeaponDetails.id === "kasaka_fang" ? "bg-cyan-950/20 border-cyan-500/40" :
                          selectedWeaponDetails.id === "igris_sword" ? "bg-rose-950/20 border-rose-500/40" :
                          selectedWeaponDetails.id === "demon_dagger" ? "bg-indigo-950/20 border-indigo-500/40" :
                          selectedWeaponDetails.id === "kamish_fang" ? "bg-purple-950/20 border-purple-500/40" :
                          selectedWeaponDetails.id === "sovereigns_wrath" ? "bg-pink-950/20 border-pink-500/50 shadow-md" :
                          "bg-cyan-950/10 border-cyan-500/30"
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border mt-0.5 ${
                          selectedWeaponDetails.id === "rusty_dagger" ? "bg-amber-500/10 border-amber-400/40 text-amber-300" :
                          selectedWeaponDetails.id === "kasaka_fang" ? "bg-cyan-500/10 border-cyan-400/40 text-cyan-300" :
                          selectedWeaponDetails.id === "igris_sword" ? "bg-rose-500/10 border-rose-400/40 text-rose-300" :
                          selectedWeaponDetails.id === "demon_dagger" ? "bg-indigo-500/10 border-indigo-400/40 text-indigo-300" :
                          selectedWeaponDetails.id === "kamish_fang" ? "bg-purple-500/10 border-purple-400/40 text-purple-300" :
                          selectedWeaponDetails.id === "sovereigns_wrath" ? "bg-pink-500/15 border-pink-400/40 text-pink-300" :
                          "bg-cyan-500/10 border-cyan-400/40 text-cyan-300"
                        }`}>
                          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                          <span className={`text-[9px] tracking-widest font-black block mb-0.5 ${
                            selectedWeaponDetails.id === "rusty_dagger" ? "text-amber-400" :
                            selectedWeaponDetails.id === "kasaka_fang" ? "text-cyan-400" :
                            selectedWeaponDetails.id === "igris_sword" ? "text-rose-400" :
                            selectedWeaponDetails.id === "demon_dagger" ? "text-indigo-400" :
                            selectedWeaponDetails.id === "kamish_fang" ? "text-purple-400" :
                            selectedWeaponDetails.id === "sovereigns_wrath" ? "text-pink-400" :
                            "text-cyan-400"
                          }`}>ACTIVE COGNITIVE PASSIVE MATRIX</span>
                          <p className="text-white text-xs sm:text-sm font-extrabold tracking-wide">{selectedWeaponDetails.weaponDetails.passiveAbility}</p>
                        </div>
                      </motion.div>

                      {/* Elements and History */}
                      <div className="flex flex-col gap-3">
                        <div>
                          <span className="text-[9px] text-slate-500 block mb-1 uppercase tracking-wider font-extrabold">Elemental Integration Core</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedWeaponDetails.weaponDetails.elements.map((el: string, idx: number) => (
                              <span key={idx} className={`px-2.5 py-1 text-[10px] rounded border uppercase tracking-wider font-extrabold ${
                                selectedWeaponDetails.id === "rusty_dagger" ? "bg-amber-950/20 text-amber-300 border-amber-500/20" :
                                selectedWeaponDetails.id === "kasaka_fang" ? "bg-cyan-950/20 text-cyan-300 border-cyan-500/20" :
                                selectedWeaponDetails.id === "igris_sword" ? "bg-rose-950/20 text-rose-300 border-rose-500/20" :
                                selectedWeaponDetails.id === "demon_dagger" ? "bg-indigo-950/20 text-indigo-300 border-indigo-500/20" :
                                selectedWeaponDetails.id === "kamish_fang" ? "bg-purple-950/20 text-purple-300 border-purple-500/20" :
                                selectedWeaponDetails.id === "sovereigns_wrath" ? "bg-pink-950/20 text-pink-300 border-pink-500/30" :
                                "bg-slate-800 text-slate-300 border-slate-700"
                              }`}>
                                ⚡ {el}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-900">
                          <span className="text-[9px] text-slate-500 block mb-1.5 uppercase tracking-wider font-extrabold">COGNITIVE CHRONOLOGY STREAKS</span>
                          <ul className="list-none space-y-1 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/60 font-mono text-[10px]">
                            {selectedWeaponDetails.weaponDetails.history.map((hist: string, idx: number) => (
                              <li key={idx} className="text-slate-400 flex items-start gap-1.5 py-0.5 border-b border-slate-900/40 last:border-0 leading-relaxed">
                                <span className={`leading-normal shrink-0 font-extrabold ${
                                  selectedWeaponDetails.id === "rusty_dagger" ? "text-amber-500" :
                                  selectedWeaponDetails.id === "kasaka_fang" ? "text-cyan-500" :
                                  selectedWeaponDetails.id === "igris_sword" ? "text-rose-500" :
                                  selectedWeaponDetails.id === "demon_dagger" ? "text-indigo-500" :
                                  selectedWeaponDetails.id === "kamish_fang" ? "text-purple-500" :
                                  selectedWeaponDetails.id === "sovereigns_wrath" ? "text-pink-500" :
                                  "text-cyan-500"
                                }`}>&gt;</span> 
                                <span className="leading-tight text-[11px]">{hist}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Raw Stat Additions */}
                  {selectedWeaponDetails.statBonus && (
                    <div className="pt-1">
                      <span className="text-[9px] text-slate-500 block mb-1.5 tracking-wider font-bold">SPATIAL ATTRIBUTE COMPLEMENT_</span>
                      <div className="flex flex-wrap gap-2 text-cyan-400 font-bold text-xs">
                        {Object.entries(selectedWeaponDetails.statBonus).map(([key, val]) => (
                          <div key={key} className={`px-3 py-1.5 rounded-lg border flex gap-2 items-center font-extrabold ${
                            selectedWeaponDetails.id === "rusty_dagger" ? "bg-amber-950/20 text-amber-300 border-amber-500/30" :
                            selectedWeaponDetails.id === "kasaka_fang" ? "bg-cyan-950/20 text-cyan-300 border-cyan-500/30" :
                            selectedWeaponDetails.id === "igris_sword" ? "bg-rose-950/20 text-rose-300 border-rose-500/30" :
                            selectedWeaponDetails.id === "demon_dagger" ? "bg-indigo-950/20 text-indigo-300 border-indigo-500/30" :
                            selectedWeaponDetails.id === "kamish_fang" ? "bg-purple-950/20 text-purple-300 border-purple-500/30" :
                            selectedWeaponDetails.id === "sovereigns_wrath" ? "bg-pink-950/20 text-pink-300 border-pink-500/35" :
                            "bg-cyan-950/30 text-cyan-400 border-cyan-500/20"
                          }`}>
                            <span className="text-slate-400 uppercase text-[9px] tracking-wider">{key.slice(0,3)} ACCRUE</span>
                            <span>+{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>

              {/* Bottom Action buttons */}
              <div className="mt-6 pt-5 border-t border-slate-900 flex justify-end gap-4 z-10 relative">
                {selectedWeaponDetails.isShopTemplate ? (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full lg:w-auto px-10 py-4 focus:outline-none text-white font-extrabold text-xs uppercase tracking-widest rounded-xl cursor-pointer shadow-lg transition-all ${
                      selectedWeaponDetails.id === "rusty_dagger" ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.25)]" :
                      selectedWeaponDetails.id === "kasaka_fang" ? "bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 shadow-[0_0_20px_rgba(6,182,212,0.25)]" :
                      selectedWeaponDetails.id === "igris_sword" ? "bg-gradient-to-r from-rose-600 to-red-650 hover:from-rose-500 hover:to-red-600 shadow-[0_0_20px_rgba(244,63,94,0.25)]" :
                      selectedWeaponDetails.id === "demon_dagger" ? "bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-600 shadow-[0_0_20px_rgba(99,102,241,0.25)]" :
                      selectedWeaponDetails.id === "kamish_fang" ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-[0_0_20px_rgba(168,85,247,0.25)]" :
                      selectedWeaponDetails.id === "sovereigns_wrath" ? "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-[0_0_30px_rgba(236,72,153,0.35)]" :
                      "bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 shadow-md"
                    }`}
                    onClick={() => {
                      buyWeapon(selectedWeaponDetails.id);
                      setSelectedWeaponDetails(null);
                    }}
                  >
                    INTEGRATE SYSTEM ARSENAL (-{selectedWeaponDetails.cost} MP)
                  </motion.button>
                ) : (
                  <>
                    {selectedWeaponDetails.equipped ? (
                      <div className={`w-full text-center font-bold text-xs py-4 border rounded-xl uppercase tracking-widest overflow-hidden relative ${
                        selectedWeaponDetails.id === "rusty_dagger" ? "text-amber-400 border-amber-500/30 bg-amber-950/20" :
                        selectedWeaponDetails.id === "kasaka_fang" ? "text-cyan-400 border-cyan-500/30 bg-cyan-950/20" :
                        selectedWeaponDetails.id === "igris_sword" ? "text-rose-400 border-rose-500/30 bg-rose-950/20" :
                        selectedWeaponDetails.id === "demon_dagger" ? "text-indigo-400 border-indigo-500/30 bg-indigo-950/20" :
                        selectedWeaponDetails.id === "kamish_fang" ? "text-purple-400 border-purple-500/30 bg-purple-950/20" :
                        selectedWeaponDetails.id === "sovereigns_wrath" ? "text-pink-400 border-pink-500/40 bg-pink-950/20" :
                        "text-cyan-400 border-cyan-500/30 bg-cyan-950/20"
                      }`}>
                        <div className={`absolute inset-0 animate-pulse pointer-events-none ${
                          selectedWeaponDetails.id === "rusty_dagger" ? "bg-amber-500/5" :
                          selectedWeaponDetails.id === "kasaka_fang" ? "bg-cyan-500/5" :
                          selectedWeaponDetails.id === "igris_sword" ? "bg-rose-500/5" :
                          selectedWeaponDetails.id === "demon_dagger" ? "bg-indigo-500/5" :
                          selectedWeaponDetails.id === "kamish_fang" ? "bg-purple-500/5" :
                          selectedWeaponDetails.id === "sovereigns_wrath" ? "bg-pink-500/10" :
                          "bg-cyan-500/5"
                        }`} />
                        ✓ ACTIVE PRIMARY ARSENAL ENGAGED IN SLOT
                      </div>
                    ) : (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full lg:w-auto px-12 py-4 bg-slate-950 border text-center text-xs tracking-widest uppercase font-extrabold rounded-xl cursor-pointer shadow-md transition-all relative overflow-hidden ${
                          selectedWeaponDetails.id === "rusty_dagger" ? "text-amber-400 border-amber-500/40 hover:text-white" :
                          selectedWeaponDetails.id === "kasaka_fang" ? "text-cyan-400 border-cyan-500/40 hover:text-white" :
                          selectedWeaponDetails.id === "igris_sword" ? "text-rose-400 border-rose-500/40 hover:text-white" :
                          selectedWeaponDetails.id === "demon_dagger" ? "text-indigo-400 border-indigo-500/40 hover:text-white" :
                          selectedWeaponDetails.id === "kamish_fang" ? "text-purple-400 border-purple-500/40 hover:text-white" :
                          selectedWeaponDetails.id === "sovereigns_wrath" ? "text-pink-400 border-pink-500/50 hover:text-white" :
                          "text-cyan-400 border-cyan-500/45 hover:text-white"
                        }`}
                        onClick={() => {
                          equipWeapon(selectedWeaponDetails.id);
                          setSelectedWeaponDetails(null);
                        }}
                      >
                        <div className={`absolute inset-0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 pointer-events-none opacity-20 bg-gradient-to-r from-transparent via-white to-transparent`} />
                        EQUIP ARSENAL UNIT
                      </motion.button>
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

      {/* MILESTONE / NOTIFICATION OVERLAY */}
      <AnimatePresence>
        {milestoneOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-4 overflow-hidden"
            onClick={() => setMilestoneOverlay(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-slate-950 to-slate-950 pointer-events-none" />
            
            {/* Massive back portal glowing aura rings */}
            <div className="absolute w-[600px] h-[600px] border border-dashed border-amber-500/10 rounded-full animate-spin pointer-events-none" style={{ animationDuration: "50s", animationDirection: "reverse" }} />
            <div className="absolute w-[450px] h-[450px] border border-dotted border-rose-500/15 rounded-full animate-spin pointer-events-none" style={{ animationDuration: "25s" }} />

            {/* Floating ascending energy particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 200, x: Math.random() * 320 - 160, opacity: 0, scale: 0.5 }}
                animate={{ y: -300, opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.2 + Math.random() * 1.5, delay: i * 0.1 }}
                className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-t from-amber-400 to-rose-500 filter blur-[1px]"
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
                <div className="h-[2px] w-12 bg-amber-500 mx-auto" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 tracking-tight uppercase">
                  {milestoneOverlay.title}
                </h2>
                <div className="text-6xl my-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-bounce font-sans">{milestoneOverlay.icon || '🔥'}</div>
                <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  {milestoneOverlay.subtitle}
                </p>
              </div>

              <div className="p-6 bg-slate-900/60 border border-amber-900/30 rounded-3xl space-y-4 text-xs font-sans">
                <p className="text-slate-300 leading-relaxed">
                  {milestoneOverlay.desc}
                </p>
              </div>

              <button 
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 hover:text-white font-extrabold text-xs cursor-pointer transition-all duration-300 uppercase block tracking-widest rounded-xl"
                onClick={() => setMilestoneOverlay(null)}
              >
                Acknowledge Reward
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISCONNECT CONFIRMATION OVERLAY */}
      <AnimatePresence>
        {showDisconnectModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
            onClick={() => setShowDisconnectModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 25 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full font-mono text-xs space-y-4 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div id="signout_title" className="flex items-center gap-2 text-amber-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-800 pb-2.5">
                <LogOut className="w-4 h-4 shrink-0 text-amber-500" />
                <span>DISCONNECT COORDINATIVE INTERFACE</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs font-sans">
                Are you absolutely sure you want to disconnect? Your current Level <strong className="text-cyan-400">{gameState.level}</strong> character stats and weapons inventory remain saved securely on your local device registrar.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  className="py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold uppercase tracking-wider cursor-pointer transition-all duration-200"
                  onClick={() => setShowDisconnectModal(false)}
                >
                  ABORT
                </button>
                <button 
                  className="py-2.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 hover:text-white rounded-xl font-bold uppercase tracking-wider cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setShowDisconnectModal(false);
                    onLogout();
                  }}
                >
                  DISCONNECT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PURGE REGISTER DATA CONFIRMATION OVERLAY */}
      <AnimatePresence>
        {showPurgeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
            onClick={() => setShowPurgeModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 25 }}
              className="bg-slate-900 border border-red-900/60 p-6 rounded-2xl max-w-sm w-full font-mono text-xs space-y-4 shadow-[0_0_30px_rgba(220,38,38,0.25)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div id="purge_title" className="flex items-center gap-2 text-red-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-800 pb-2.5">
                <Trash2 className="w-4 h-4 shrink-0 text-red-400" />
                <span>⚠️ SYSTEM PURGE DATA CONFIRMATION</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs font-sans">
                This will immediately purge your current stats, Level <strong className="text-red-400">{gameState.level}</strong> experience, custom grinds, and database-aligned items. <span className="text-red-400 font-bold block mt-1.5 font-mono uppercase text-[10px]">Warning: This action is permanent and irreversible!</span>
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  className="py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold uppercase tracking-wider cursor-pointer transition-all duration-200"
                  onClick={() => setShowPurgeModal(false)}
                >
                  CANCEL
                </button>
                <button 
                  className="py-2.5 bg-red-900/80 hover:bg-red-950 border border-red-500 text-white rounded-xl font-bold uppercase tracking-wider cursor-pointer transition-all duration-200"
                  onClick={async () => {
                    // Wipe everything from LocalStorage
                    localStorage.removeItem(`monarch_save_v4_reset_${playerName}`);
                    localStorage.removeItem(`monarch_save_v3_balanced_${playerName}`);
                    localStorage.removeItem(`monarch_save_v2_${playerName}`);
                    localStorage.removeItem(`monarch_daily_claim_${playerName}`);
                    localStorage.removeItem("monarch_active_player");
                    localStorage.removeItem("monarch_onboard_profile");
                    
                    // Force clean reset in Firestore if logged in
                    const uid = auth.currentUser?.uid;
                    if (uid) {
                      try {
                        const userDocRef = doc(db, "users", uid);
                        await setDoc(userDocRef, {
                          v3_reset: true,
                          updatedAt: new Date().toISOString()
                        });
                      } catch (err) {
                        console.error("Failed to reset firestore doc on purge:", err);
                      }
                    }
                    
                    window.location.reload();
                  }}
                >
                  PURGE DATA
                </button>
              </div>
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
                  <AvatarWithFrame 
                    size="md" 
                    playerName={playerName} 
                    level={gameState.level} 
                    profileImage={profileImage} 
                    onClick={() => fileInputRef.current?.click()}
                    allowUpload={true}
                    className="mr-1 shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                  />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Monarch Identity</span>
                    <h4 className="text-sm font-bold text-slate-100">{playerName}</h4>
                    <span className="text-[9px] text-cyan-400 uppercase font-bold tracking-wider">Level {gameState.level} &middot; {gameState.rank}</span>
                  </div>
                </div>

                {/* WEEKLY ACCOMPLISHMENTS LOG */}
                <div className="space-y-2 mt-4">
                  <label className="text-slate-500 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5"><Shield className="w-3 h-3 text-amber-500" /> WEEKLY TARGET HISTORY ARCHIVE</label>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 space-y-2">
                    {!(gameState.weeklyHistory?.length) ? (
                      <div className="text-[10px] text-slate-600 italic text-center py-2">No weekly target milestones inscribed yet.</div>
                    ) : (
                      gameState.weeklyHistory.map((hist, idx) => (
                        <div key={idx} className="flex flex-col gap-1 border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                           <div className="flex justify-between items-center w-full">
                             <span className="text-[9px] text-amber-500 font-bold tracking-wider">[ CYCLE {gameState.weeklyCyclesCompleted! - idx} &middot; {hist.weekStart} ]</span>
                           </div>
                           <div className="flex justify-between items-center w-full text-[10px] text-slate-400">
                             <span className="flex-1">XP Achieved: <span className="text-cyan-400">{hist.exp.toLocaleString()}</span> / {hist.targetExp}</span>
                             <span>MP Mined: <span className="text-cyan-400">{hist.mp.toLocaleString()}</span> / {hist.targetMp}</span>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* SETTINGS OPTIONS PORTFOLIO LIST */}
                <div className="space-y-5 text-left text-xs mt-2">
                  
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
                      <span aria-label="Volume Status: Active at 100 percent" className="text-cyan-400 font-bold uppercase text-[9px] tracking-widest bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded-full animate-pulse">
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
                      <span id="label_reminders" className="text-[10px] text-slate-300 block">Daily Quest Reminders</span>
                      <button 
                        type="button"
                        role="switch"
                        aria-checked={dailyQuestReminder}
                        aria-labelledby="label_reminders"
                        className={`w-10 h-6 rounded-full p-0.5 cursor-pointer flex items-center transition-colors duration-200 ${dailyQuestReminder ? "bg-cyan-500 justify-end" : "bg-slate-800 justify-start"}`}
                        onClick={() => {
                          const newVal = !dailyQuestReminder;
                          setDailyQuestReminder(newVal);
                          localStorage.setItem(`monarch_reminder_${playerName}`, newVal.toString());
                          triggerSystemToast(`SYSTEM SIGNAL: Quest Reminders turned ${newVal ? "ON" : "OFF"}`);
                        }}
                      >
                        <div className="w-4 h-4 bg-slate-950 rounded-full shadow-sm" />
                      </button>
                    </div>
                  </div>

                  {/* OPTION 5: Reset account data safeguards (Suggested Feature 3) */}
                  <div className="space-y-2 border-t border-slate-900 pt-3">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider block">5. Erase registry save data</span>
                    <button 
                      className="w-full py-2.5 border border-red-950 hover:bg-red-950/25 text-red-500 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        setShowProfileDrawer(false);
                        setShowPurgeModal(true);
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
                    setShowDisconnectModal(true);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  DISCONNECT SESSION
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ANDROID STYLE FLOATING NOTIFICATIONS PORT */}
      <div className="fixed top-20 right-4 z-[60] flex flex-col gap-3 w-full max-w-[340px] pointer-events-none p-1">
        <AnimatePresence>
          {systemToast && (
            <motion.div 
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              layout
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={1}
              onDragEnd={(_e, info) => {
                const isSignificant = Math.abs(info.offset.x) > 40 || Math.abs(info.offset.y) > 40 || Math.abs(info.velocity.x) > 400 || Math.abs(info.velocity.y) > 400;
                if (isSignificant) {
                  setSystemToast(null);
                }
              }}
              className="pointer-events-auto touch-none shadow-[0_4px_24px_-4px_rgba(34,211,238,0.25)] rounded-[20px] bg-slate-900 border border-slate-700/60 p-3 sm:p-4 flex gap-3 font-sans relative overflow-hidden cursor-grab active:cursor-grabbing"
            >
              <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 relative">
                 <Bell className="w-4 h-4" />
                 <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                 <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[12px] font-semibold text-slate-200">System Notification</span>
                  <span className="text-[10px] text-slate-500">now</span>
                </div>
                <div className="text-[13px] font-medium text-slate-300 leading-snug break-words">
                  {systemToast}
                </div>
              </div>
            </motion.div>
          )}

          {activeAnnouncements && activeAnnouncements.length > 0 && activeAnnouncements.slice(systemToast ? -1 : -2).map((ann, idx) => (
             <motion.div 
              key={`admin_${ann.id || idx}`}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              layout
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={1}
              onDragEnd={(_e, info) => {
                const isSignificant = Math.abs(info.offset.x) > 40 || Math.abs(info.offset.y) > 40 || Math.abs(info.velocity.x) > 400 || Math.abs(info.velocity.y) > 400;
                if (isSignificant) {
                  setAdminAnnouncements(prev => prev.filter((a, i) => (a.id || i) !== (ann.id || idx)));
                }
              }}
              className="pointer-events-auto touch-none shadow-[0_4px_24px_-4px_rgba(168,85,247,0.2)] rounded-[20px] bg-slate-900 border border-purple-500/30 p-3 sm:p-4 flex gap-3 font-sans relative overflow-hidden cursor-grab active:cursor-grabbing"
            >
              <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 relative">
                 <Radio className="w-4 h-4" />
                 <div className="absolute top-0 right-0 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                 <div className="absolute top-0 right-0 w-2 h-2 bg-purple-400 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[12px] font-semibold text-slate-200">Monarch Admin</span>
                  <span className="text-[10px] text-slate-500">{ann.createdAt ? new Date(ann.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "live"}</span>
                </div>
                <div className="text-[13px] font-medium text-slate-300 leading-snug break-words">
                  {ann.message}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR */}
      <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/98 border-t border-slate-900 backdrop-blur-md pb-safe lg:hidden flex justify-around items-center pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.65)] px-4">
        {[
          { icon: Activity, idx: 0, label: "Character Stats" },
          { icon: Users, idx: 1, label: "Social Hub" },
          { icon: Home, idx: 2, label: "Command Center" },
          { icon: Skull, idx: 3, label: "Daily Quests" },
          { icon: ShoppingBag, idx: 4, label: "Black Market" }
        ].map(item => {
          const Icon = item.icon;
          const currentSec = getMobileSection(activeTab);
          const isActive = currentSec === item.idx;
          
          if (item.idx === 2) {
            return (
              <div key={item.idx} className="relative z-10 -mt-10 flex flex-col items-center justify-center">
                <motion.button
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  animate={{ y: [0, -5, 0], rotate: [0, 1.5, -1.5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer bg-sky-400 text-white shadow-[0_5px_18px_rgba(56,189,248,0.45)] hover:bg-sky-300 active:scale-95 transition-all outline-none"
                  onClick={() => handleMobileSectionClick(item.idx)}
                >
                  <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                </motion.button>
                {isActive && (
                  <motion.div 
                    layoutId="activeMobileDot"
                    className="absolute -bottom-5 w-1.5 h-1.5 bg-transparent rounded-full shadow-none"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            );
          }

          return (
            <button
              key={item.idx}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className="p-3 relative flex flex-col items-center justify-center transition-all cursor-pointer rounded-xl bg-transparent outline-none"
              onClick={() => handleMobileSectionClick(item.idx)}
            >
              <Icon 
                aria-hidden="true"
                className={`w-5 h-5 transition-all duration-300 ${
                  isActive 
                    ? "text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,1)] drop-shadow-[0_0_4px_rgba(34,211,238,0.8)] scale-110" 
                    : "text-cyan-400/80 hover:text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.75)] drop-shadow-[0_0_3px_rgba(34,211,238,0.5)] hover:scale-105"
                }`} 
              />
              {item.idx === 1 && friendRequests.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_red] animate-pulse">
                  <span className="sr-only">Social updates available</span>
                </span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="activeMobileDot"
                  className="absolute -bottom-0.5 w-1 h-1 bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.95)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* FULLSCREEN STUDY BOOST CLOCK OVERLAY */}
      <AnimatePresence>
        {pomodoroFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 select-none font-mono"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_0%,transparent_70%)] pointer-events-none" />
            
            {/* Huge clock only */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center relative"
            >
              <div className="text-8xl md:text-[13rem] lg:text-[16rem] font-black tracking-widest text-slate-100 font-mono drop-shadow-[0_0_80px_rgba(129,140,248,0.25)] select-all tabular-nums leading-none">
                {Math.floor(focusSecs / 60).toString().padStart(2, "0")}:
                {(focusSecs % 60).toString().padStart(2, "0")}
              </div>
            </motion.div>

            {/* Exit control */}
            <div className="mt-16 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => {
                  try { playSelectSound(); } catch (e) {}
                  setFocusIsActive(!focusIsActive);
                }}
                className={`px-8 py-3.5 rounded-2xl border text-xs font-black uppercase tracking-widest cursor-pointer transition-all duration-300 ${
                  focusIsActive 
                    ? "bg-amber-600/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/15" 
                    : "bg-indigo-600 hover:bg-indigo-500 border-indigo-400/30 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                }`}
              >
                {focusIsActive ? "PAUSE GRIND" : "RESUME GRIND"}
              </button>
              
              <button
                onClick={() => {
                  try { playSelectSound(); } catch (e) {}
                  setPomodoroFullscreen(false);
                }}
                className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                EXIT FULLSCREEN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔍 ULTRA DETAILED INSPECT MODAL */}
      <AnimatePresence>
        {inspectMarketItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4 md:p-8 select-none font-mono"
            onClick={() => setInspectMarketItem(null)}
          >
            <div 
              className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(245,158,11,0.15)] flex flex-col md:flex-row relative cursor-default"
              onClick={e => e.stopPropagation()}
            >
               {/* Image Section */}
               <div className="w-full md:w-1/2 relative bg-black min-h-[300px] md:min-h-full flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 md:hidden" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900 z-10 hidden md:block" />
                  
                  {inspectMarketItem.imageUrl ? (
                     <img src={inspectMarketItem.imageUrl} alt={inspectMarketItem.name} className="absolute inset-0 w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />
                  ) : (
                     <div className="text-slate-700 flex flex-col items-center justify-center space-y-4">
                        <ShoppingBag className="w-16 h-16 opacity-50" />
                        <span className="text-xs uppercase tracking-widest font-black">No Visual Data</span>
                     </div>
                  )}

                  <div className="absolute top-4 left-4 z-20">
                     <div className={`px-3 py-1 rounded shadow-lg text-[10px] font-black uppercase tracking-widest ${
                       inspectMarketItem.rank === 'S-Rank' ? 'bg-purple-500 text-white border border-purple-400' :
                       inspectMarketItem.rank === 'A-Rank' ? 'bg-amber-500 text-white border border-amber-400' :
                       inspectMarketItem.rank === 'B-Rank' ? 'bg-blue-500 text-white border border-blue-400' :
                       inspectMarketItem.rank === 'C-Rank' ? 'bg-emerald-500 text-white border border-emerald-400' :
                       'bg-slate-700 text-white'
                     }`}>
                       {inspectMarketItem.rank} ARTIFACT
                     </div>
                  </div>
               </div>

               {/* Details Section */}
               <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto relative z-20 bg-slate-900">
                  <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-2 block">System Identification</span>
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider leading-tight mb-4 drop-shadow-md">
                     {inspectMarketItem.name}
                  </h2>
                  
                  <div className="flex gap-4 mb-4">
                     <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl flex flex-col items-center justify-center flex-1">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Classification</span>
                        <span className="text-sm font-black text-slate-300 uppercase">{inspectMarketItem.type}</span>
                     </div>
                     <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl flex flex-col items-center justify-center flex-1">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Market Stock</span>
                        <span className={`text-sm font-black uppercase ${inspectMarketItem.stock === 0 ? "text-rose-500" : "text-emerald-400"}`}>
                           {inspectMarketItem.stock < 0 ? "INFINITE" : inspectMarketItem.stock === 0 ? "DEPLETED" : `${inspectMarketItem.stock} UNITS`}
                        </span>
                     </div>
                  </div>

                  {/* ITEM STATS GRIDS */}
                  <div className="grid grid-cols-3 gap-2 mb-8 bg-slate-950/20 p-3 rounded-2xl border border-slate-800/40 shadow-inner">
                    <div className="flex flex-col items-center justify-center p-2">
                       <span className="text-[8px] text-rose-500 font-black uppercase tracking-[0.2em] mb-1">ATK</span>
                       <span className="text-sm font-bold text-rose-300 font-mono">+{inspectMarketItem.attackBoost || 0}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 border-x border-slate-800/30">
                       <span className="text-[8px] text-blue-500 font-black uppercase tracking-[0.2em] mb-1">DEF</span>
                       <span className="text-sm font-bold text-blue-300 font-mono">+{inspectMarketItem.defenseBoost || 0}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2">
                       <span className="text-[8px] text-cyan-500 font-black uppercase tracking-[0.2em] mb-1">MANA</span>
                       <span className="text-sm font-bold text-cyan-300 font-mono">+{inspectMarketItem.manaBoost || 0}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-8 flex-1">
                     <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Lore / Specifications</h3>
                     <p className="text-sm md:text-base text-slate-400 font-mono leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 shadow-inner">
                        {inspectMarketItem.description || "No further information is available for this materialization."}
                     </p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
                     <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Procurement Cost</span>
                        <span className="text-2xl font-black text-amber-400 flex items-center gap-2">
                           {inspectMarketItem.adCodeSnippet ? "SYNDICATOR AD" : `${inspectMarketItem.price.toLocaleString()} GO`}
                        </span>
                     </div>

                     <div className="flex gap-2">
                        <button aria-label="Close"
                          className="px-6 py-3 border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                          onClick={() => setInspectMarketItem(null)}
                        >
                           CLOSE
                        </button>
                        
                        {inspectMarketItem.adCodeSnippet ? (
                           <button aria-label="Watch Ad"
                             disabled={inspectMarketItem.stock === 0}
                             className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                               inspectMarketItem.stock === 0
                                 ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                                 : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                             }`}
                             onClick={() => {
                               setInspectMarketItem(null);
                               handleBuyAdminMarketItem(inspectMarketItem);
                             }}
                           >
                              {inspectMarketItem.stock === 0 ? "SOLD OUT" : "WATCH AD"}
                           </button>
                        ) : (
                           <button aria-label="Purchase"
                             disabled={gameState.gold < inspectMarketItem.price || inspectMarketItem.stock === 0}
                             className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                               gameState.gold < inspectMarketItem.price || inspectMarketItem.stock === 0
                                 ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                                 : "bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                             }`}
                             onClick={() => {
                               setInspectMarketItem(null);
                               handleBuyAdminMarketItem(inspectMarketItem);
                             }}
                           >
                              {inspectMarketItem.stock === 0 ? "SOLD OUT" : gameState.gold < inspectMarketItem.price ? "NO FUNDS" : "PROCURE"}
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📺 SYNDICATOR AD MODAL (FULLSCREEN) */}
      <AnimatePresence>
        {adModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center select-none font-mono"
          >
            {/* The Ad Embed Container (Full Screen) */}
            <div 
              className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={(e) => {
                setAdTouched(true);
                // Try to detect if adCodeSnippet is just a URL and open it
                if (adModalItem.adCodeSnippet.trim().startsWith('http')) {
                   window.open(adModalItem.adCodeSnippet.trim(), '_blank', 'noopener,noreferrer');
                }
              }}
              onTouchStart={() => setAdTouched(true)}
            >
              {adModalItem.adCodeSnippet.trim().startsWith('http') ? (
                 <iframe 
                   src={adModalItem.adCodeSnippet.trim()} 
                   className="w-full h-full border-none pointer-events-none" 
                   title="Sponsor Ad"
                 />
              ) : (
                 <div 
                   className="w-full h-full flex flex-col items-center justify-center relative pointer-events-auto"
                   dangerouslySetInnerHTML={{ __html: adModalItem.adCodeSnippet }} 
                 />
              )}
            </div>
            
            {/* Overlay UI elements on top of the ad */}
            <div className="absolute top-0 left-0 right-0 p-4 pb-12 bg-gradient-to-b from-black/90 to-transparent z-10 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col">
                  <span className="text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Radio className="w-4 h-4 animate-pulse" /> SYSTEM SPONSOR
                  </span>
                  <span className="text-white text-[10px] mt-1 shadow-black drop-shadow-md font-bold uppercase tracking-wider">
                    {adModalItem.name}
                  </span>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                    <div className="bg-black/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-xl flex items-center justify-center shadow-lg">
                      <span className={`text-xs font-black ${adTimeRemaining === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                        {adTimeRemaining > 0 ? `${adTimeRemaining}s REQUIRED` : "SYNC COMPLETE"}
                      </span>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pt-24 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10 pointer-events-none mt-auto flex flex-col items-center">
                <div className="flex flex-col items-center gap-4 pointer-events-auto w-full max-w-sm mx-auto">
                    {!adTouched && adTimeRemaining === 0 && (
                       <div className="text-rose-400 text-[10px] font-black uppercase tracking-widest animate-bounce drop-shadow-md bg-black/80 border border-rose-500/30 px-4 py-2 rounded-lg">
                         TAP SCREEN TO VERIFY INTERACTION
                       </div>
                    )}
                    
                    <div className="flex gap-3 w-full">
                      <button aria-label="Cancel Ad"
                        className="flex-1 py-3.5 bg-black/80 backdrop-blur hover:bg-slate-900 border border-slate-700 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-300 transition-colors pointer-events-auto shadow-lg"
                        onClick={() => setAdModalItem(null)}
                      >
                        CLOSE LISTING
                      </button>
                      <button aria-label="Claim Reward"
                        disabled={adTimeRemaining > 0 || !adTouched}
                        className={`flex-1 py-3.5 border rounded-xl font-black uppercase text-[10px] tracking-widest transition-all pointer-events-auto shadow-lg ${
                          adTimeRemaining === 0 && adTouched
                            ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-500/50 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] cursor-pointer"
                            : "bg-black/60 border-slate-800 text-slate-600 cursor-not-allowed"
                        }`}
                        onClick={handleClaimAdItem}
                      >
                        ACQUIRE ARTIFACT
                      </button>
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📅 DAILY TASK & ADMIN MESSAGES BRIEFING MODAL */}
      <AnimatePresence>
        {showDailyBriefingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99990] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 select-none font-mono"
          >
            <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-[0_0_60px_rgba(99,102,241,0.15)]">
               
               <div className="p-6 md:p-8 space-y-8">
                 {/* Header */}
                 <div className="text-center">
                   <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">System Awakening Sequence</span>
                   <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-1">Daily Briefing Log</h2>
                   <div className="w-16 h-1 mx-auto bg-indigo-500/30 rounded-full mt-4" />
                 </div>

                 {/* Admin Messages */}
                 {adminAnnouncements.length > 0 && (
                   <div className="space-y-3">
                     <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-amber-500" />
                        Active Monarch Directives
                     </h3>
                     <div className="space-y-2">
                       {adminAnnouncements.map((ann) => (
                         <div key={ann.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-inner">
                           <div className="hidden">{ann.severity}</div> 
                           <div className="text-[12px] font-bold text-white mb-1.5">{ann.title}</div>
                           <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{ann.message}</p>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Daily Tasks */}
                 <div className="space-y-3">
                   <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-rose-500" />
                      Required Daily Routines
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {gameState.quests.map((q: any) => {
                         const isCleared = q.current >= q.target;
                         return (
                           <div key={q.id} className={`border rounded-2xl p-4 flex flex-col justify-between ${
                             isCleared ? "bg-emerald-950/20 border-emerald-500/30" : "bg-slate-950 border-slate-800"
                           }`}>
                              <span className="text-xs font-bold text-slate-200">{q.name}</span>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 font-mono">Progress:</span>
                                <span className={`text-[10px] font-black tracking-widest ${isCleared ? "text-emerald-400" : "text-amber-500"}`}>
                                  {isCleared ? "✓ VERIFIED" : `${q.current} / ${q.target}`}
                                </span>
                              </div>
                           </div>
                         );
                      })}
                   </div>
                 </div>

               </div>

               {/* Footer Control */}
               <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-center">
                 <button aria-label="Close Briefing"
                   onClick={() => {
                     playSelectSound();
                     localStorage.setItem(`monarch_daily_briefing_${playerName}`, new Date().toDateString());
                     setShowDailyBriefingModal(false);
                   }}
                   className="px-10 py-3.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] cursor-pointer"
                 >
                   Acknowledge & Proceed
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="hidden lg:block p-4 border-t border-slate-950 bg-slate-950/80 text-center text-xs font-mono text-slate-600 mt-10">
        <div>&copy; MONARCH SELF-DEVELOPMENT SYSTEM &middot; SECURE SYSTEM EMULATOR v2.4</div>
      </footer>
    </main>
  );
}
