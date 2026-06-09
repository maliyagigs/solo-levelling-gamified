import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, AlertTriangle, Play, Pause, ChevronLeft, ShieldAlert, Award, 
  Send, Volume2, VolumeX, Database, RefreshCw, BarChart2, Star, Check 
} from "lucide-react";
import { db, auth, handleFirestoreError, OperationType } from "../utils/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import { WhiteRoomState } from "../types";

// High-precision timing constants for the three daily blocks
const DEADLINES = {
  cognitive: 12,   // 12:00 PM (Noon)
  conditioning: 17, // 5:00 PM (17:00)
  stoic: 21        // 9:00 PM (21:00)
};

interface WhiteRoomChallengeProps {
  playerName: string;
  onBack: () => void;
}

interface LeaderboardEntryWR {
  subjectId: string;
  generation: string;
  streak: number;
  efficiency: number;
  responseTime: number;
  consistency: number;
  isMasterpiece: boolean;
  updatedAt: any;
}

export default function WhiteRoomChallenge({ playerName, onBack }: WhiteRoomChallengeProps) {
  // Local UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"curriculum" | "analytics" | "enforcer" | "leaderboard">("curriculum");
  const [showWarning, setShowWarning] = useState<boolean>(true);
  const [expulsionAlert, setExpulsionAlert] = useState<{ active: boolean; reason: string; dayLost: number } | null>(null);
  const [completionAlert, setCompletionAlert] = useState<boolean>(false);

  // Time Override Slider (Saves testing hours 0-23)
  const [simulatedHour, setSimulatedHour] = useState<number>(new Date().getHours());
  const [simulatedMinute, setSimulatedMinute] = useState<number>(new Date().getMinutes());
  const [useRealTime, setUseRealTime] = useState<boolean>(true);

  // Interactive Task modules
  const [cognitiveTimer, setCognitiveTimer] = useState<number>(0); // active read seconds
  const [cognitiveActive, setCognitiveActive] = useState<boolean>(false);
  const [conditioningSyncing, setConditioningSyncing] = useState<boolean>(false);
  const [conditioningType, setConditioningType] = useState<string>("");
  const [stoicTimer, setStoicTimer] = useState<number>(0); // meditation seconds
  const [stoicActive, setStoicActive] = useState<boolean>(false);

  // Enforcer Coach Chat state
  const [enforcerChat, setEnforcerChat] = useState<{ role: "coach" | "user" | "system"; text: string; timestamp: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Anonymized White Room Leaderboard state
  const [wrLeaderboard, setWrLeaderboard] = useState<LeaderboardEntryWR[]>([]);
  const [loadingWRLeaderboard, setLoadingWRLeaderboard] = useState<boolean>(false);

  // Parent player stats (Retrieved from standard users/{uid} to avoid overwriting level during global sync)
  const [parentStats, setParentStats] = useState<{ level: number; gold: number; job: string; rank: string } | null>(null);

  // The central persistent White Room state
  const [wrState, setWrState] = useState<WhiteRoomState>({
    isActive: false,
    onboarded: false,
    generation: null,
    startDay: null,
    currentStreakDay: 1,
    highestStreakDay: 1,
    dropoutCount: 0,
    efficiencyPercentage: 100,
    responseTimeScore: 95,
    consistencyScore: 98,
    pillars: {
      cognitive: { completed: false, completedAt: null, durationMinutes: 0 },
      conditioning: { completed: false, completedAt: null, workoutType: null },
      stoic: { completed: false, completedAt: null, meditationMinutes: 0 }
    },
    coachHistory: [],
    lastCheckedDate: null
  });

  // Sound Synthesizers (Oscillators)
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  };

  const playExpulsionSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch (e) {}
  };

  const playCheckmarkSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // Clock ticks logic for ambient feeling
  useEffect(() => {
    const interval = setInterval(() => {
      playTickSound();
    }, 1000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Load persistent user data
  useEffect(() => {
    const loadState = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          // Extrapolate Parent Stats
          if (data.gameState) {
            setParentStats({
              level: data.gameState.level || 1,
              gold: data.gameState.gold || 0,
              job: data.gameState.job || "Fledgling Player",
              rank: data.gameState.rank || "E-Rank"
            });
          }

          // Check if White Room has existing saved state in standard users collection
          if (data.gameState && data.gameState.whiteRoomState) {
            const savedState = data.gameState.whiteRoomState as WhiteRoomState;
            setWrState(savedState);
            if (savedState.onboarded) {
              setShowWarning(false);
            }
            if (savedState.coachHistory && savedState.coachHistory.length > 0) {
              setEnforcerChat(savedState.coachHistory);
            } else {
              initiateEnforcerOnboarding();
            }
          } else {
            initiateEnforcerOnboarding();
          }
        } else {
          initiateEnforcerOnboarding();
        }
      } catch (err) {
        console.error("Failed to load White Room State from Firestore:", err);
        initiateEnforcerOnboarding();
      } finally {
        setLoading(false);
      }
    };
    loadState();
  }, []);

  // Update Simulated or Real Time
  useEffect(() => {
    if (useRealTime) {
      const timer = setInterval(() => {
        const now = new Date();
        setSimulatedHour(now.getHours());
        setSimulatedMinute(now.getMinutes());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [useRealTime]);

  // Initialize coach chat
  const initiateEnforcerOnboarding = () => {
    const welcome = [
      {
        role: "coach" as const,
        text: `Subject established: ${playerName}. You are accessing the global White Room Beta curriculum. Accessing this tier relinquishes all standard leeway. Inform me when you are prepared to choose your protocol generation.`,
        timestamp: new Date().toISOString()
      }
    ];
    setEnforcerChat(welcome);
  };

  // Local storage save + Firestore backup sync
  const saveWhiteRoomData = async (stateToSave: WhiteRoomState, currentChat: typeof enforcerChat = enforcerChat) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      // 1. Fetch current document to merge safely without overwriting other academic or bodybuilding variables
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const docData = snap.data();
        const mergedGameState = {
          ...(docData.gameState || {}),
          whiteRoomState: {
            ...stateToSave,
            coachHistory: currentChat
          }
        };

        const updatedPayload = {
          ...docData,
          gameState: mergedGameState,
          updatedAt: new Date().toISOString()
        };

        await setDoc(docRef, updatedPayload);
        console.log("White Room State synchronized successfully.");
        
        // 2. Refresh standard active state variables locally
        setWrState(stateToSave);

        // 3. Sync to White Room Leaderboard anonymously
        syncToWhiteRoomLeaderboard(stateToSave);
      }
    } catch (e) {
      console.error("Failed to write White Room stats to Firestore user doc:", e);
    }
  };

  // Sync anonymously to Public /white_room_leaderboard collection
  const syncToWhiteRoomLeaderboard = async (state: WhiteRoomState) => {
    const uid = auth.currentUser?.uid;
    if (!uid || !state.isActive || !state.generation) return;

    // Generate clinical identifier, e.g. Subject #EF608 based on uid
    const clinicalId = `Subject #${uid.slice(0, 5).toUpperCase()}`;

    try {
      await setDoc(doc(db, "white_room_leaderboard", uid), {
        subjectId: clinicalId,
        generation: state.generation,
        streak: state.currentStreakDay,
        efficiency: Math.round(state.efficiencyPercentage),
        responseTime: Number(state.responseTimeScore.toFixed(1)),
        consistency: Math.round(state.consistencyScore),
        isMasterpiece: state.currentStreakDay >= 30 && state.generation === "4th",
        updatedAt: new Date().toISOString()
      });
      console.log("White Room Leaderboard synced anonymously.");
    } catch (err) {
      console.error("Firestore leaderboard sync blocked:", err);
    }
  };

  // Evaluate Time Locking and Expulsion/DropOut state in real-time
  // Cognitive deadline: 12 PM. Conditioning deadline: 5 PM. Stoic deadline: 9 PM.
  useEffect(() => {
    if (!wrState.isActive || !wrState.generation) return;

    // Check deadlines
    const checkDeadlines = () => {
      let failedPillar: string | null = null;

      if (simulatedHour >= DEADLINES.cognitive && !wrState.pillars.cognitive.completed) {
        failedPillar = "Mentality (Cognitive Block) - Missed 12:00 PM Deadline";
      } else if (simulatedHour >= DEADLINES.conditioning && !wrState.pillars.conditioning.completed) {
        failedPillar = "Physiology (Conditioning Block) - Missed 5:00 PM Deadline";
      } else if (simulatedHour >= DEADLINES.stoic && !wrState.pillars.stoic.completed) {
        failedPillar = "Strategy (Stoic Block) - Missed 9:00 PM Deadline";
      }

      if (failedPillar) {
        triggerExpulsionFailure(failedPillar);
      }
    };

    checkDeadlines();
  }, [simulatedHour, wrState.isActive, wrState.pillars]);

  // Handle absolute drop out or penalty reset
  const triggerExpulsionFailure = async (reason: string) => {
    playExpulsionSound();

    if (wrState.generation === "4th") {
      // High Stakes 4th Gen Beta Curriculum: EXPELL / FULL STREAK RESET TO Day 1
      const updatedState: WhiteRoomState = {
        ...wrState,
        currentStreakDay: 1,
        dropoutCount: wrState.dropoutCount + 1,
        efficiencyPercentage: Math.max(10, wrState.efficiencyPercentage - 15),
        consistencyScore: Math.max(15, wrState.consistencyScore - 20),
        pillars: {
          cognitive: { completed: false, completedAt: null, durationMinutes: 0 },
          conditioning: { completed: false, completedAt: null, workoutType: null },
          stoic: { completed: false, completedAt: null, meditationMinutes: 0 }
        }
      };

      const explanation = `[SYSTEM DEVIATION DETECTED]
Failed Pillar: ${reason}.
Subject #${auth.currentUser?.uid?.slice(0, 5).toUpperCase()} has breached the strict 4th Generation standards. Streak reset to Day 1. Total Disciplinary Dropouts increased to ${updatedState.dropoutCount}. Correct this baseline trajectory immediately.`;

      const notificationMatch: typeof enforcerChat = [
        ...enforcerChat,
        {
          role: "system" as const,
          text: `[ALARM] Biological baseline failure detected. 4th Gen Protocol breached. Actioning immediate reset.`,
          timestamp: new Date().toISOString()
        },
        {
          role: "coach" as const,
          text: `Disappointing. Subject ${playerName} lacks standard cellular resilience. Your 30-day curriculum has been reset to Day 1. Complacency is a fatal pathology. Defend your standards or leave the facility.`,
          timestamp: new Date().toISOString()
        }
      ];

      setEnforcerChat(notificationMatch);
      setExpulsionAlert({
        active: true,
        reason,
        dayLost: wrState.currentStreakDay
      });

      await saveWhiteRoomData(updatedState, notificationMatch);

    } else if (wrState.generation === "5th") {
      // Standard 5th Gen: Fails pillar, reduces global XP / points, but keeps streak!
      const updatedState: WhiteRoomState = {
        ...wrState,
        efficiencyPercentage: Math.max(30, wrState.efficiencyPercentage - 8),
        consistencyScore: Math.max(35, wrState.consistencyScore - 10),
        // Force fail pillars for today, resets tomorrow
        pillars: {
          ...wrState.pillars,
          cognitive: { ...wrState.pillars.cognitive, completed: true, completedAt: "FAILED" },
          conditioning: { ...wrState.pillars.conditioning, completed: true, completedAt: "FAILED" },
          stoic: { ...wrState.pillars.stoic, completed: true, completedAt: "FAILED" }
        }
      };

      const notificationMatch: typeof enforcerChat = [
        ...enforcerChat,
        {
          role: "system" as const,
          text: `[PENALTY ACCRUED] Baseline parameters missed. XP reduction executed. Streak retained under 5th Gen standards.`,
          timestamp: new Date().toISOString()
        }
      ];

      setEnforcerChat(notificationMatch);
      await saveWhiteRoomData(updatedState, notificationMatch);

      // Reduce standard RPG profile experience points as a penalty!
      applyStandardRpgExpPenalty();
    }
  };

  // Reduce some standard RPG XP from user if they fail standard (5th Gen)
  const applyStandardRpgExpPenalty = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.gameState) {
          const currentExp = data.gameState.exp || 0;
          const deductedExp = Math.max(0, currentExp - 40); // deduct 40 XP
          const updatedGame = {
            ...data.gameState,
            exp: deductedExp
          };
          await updateDoc(docRef, { gameState: updatedGame });
          console.log("RPG Exp adjusted.");
        }
      }
    } catch (e) {}
  };

  // Start the 30-day challenge
  const joinWhiteRoom = async (genSelected: "4th" | "5th") => {
    playCheckmarkSound();
    const systemFirstMsg = genSelected === "4th" 
      ? "Initiating 4th Generation (Beta Curriculum) protocol. All streak freezes and grace parameters disabled. Perfection is absolute."
      : "Initiating 5th Generation protocol. Standard development baseline activated.";

    const startState: WhiteRoomState = {
      isActive: true,
      onboarded: true,
      generation: genSelected,
      startDay: new Date().toISOString(),
      currentStreakDay: 1,
      highestStreakDay: wrState.highestStreakDay,
      dropoutCount: wrState.dropoutCount,
      efficiencyPercentage: 100,
      responseTimeScore: 95,
      consistencyScore: 98,
      pillars: {
        cognitive: { completed: false, completedAt: null, durationMinutes: 0 },
        conditioning: { completed: false, completedAt: null, workoutType: null },
        stoic: { completed: false, completedAt: null, meditationMinutes: 0 }
      },
      coachHistory: [],
      lastCheckedDate: new Date().toISOString().split("T")[0]
    };

    const firstChat: typeof enforcerChat = [
      ...enforcerChat,
      {
        role: "system" as const,
        text: systemFirstMsg,
        timestamp: new Date().toISOString()
      },
      {
        role: "coach" as const,
        text: genSelected === "4th"
          ? `Subject ${playerName} locked into 4th Gen Beta protocol. Do not fail a single checkpoint. I am monitoring your performance.`
          : `Subject ${playerName} registered under 5th Gen. Maintain the standards. Proceed to check off daily blocks.`,
        timestamp: new Date().toISOString()
      }
    ];

    setEnforcerChat(firstChat);
    setShowWarning(false);
    await saveWhiteRoomData(startState, firstChat);
  };

  // Day transition simulator (Advances Day streak cycle manually for graduation testing!)
  const simulateNewDayTransition = async () => {
    playCheckmarkSound();
    
    // Check if day is 30 -> Unlocks Masterpiece Badge
    if (wrState.currentStreakDay >= 30) {
      triggerWhiteRoomGraduation();
      return;
    }

    const nextDay = wrState.currentStreakDay + 1;
    const nextState: WhiteRoomState = {
      ...wrState,
      currentStreakDay: nextDay,
      highestStreakDay: Math.max(wrState.highestStreakDay, nextDay),
      pillars: {
        cognitive: { completed: false, completedAt: null, durationMinutes: 0 },
        conditioning: { completed: false, completedAt: null, workoutType: null },
        stoic: { completed: false, completedAt: null, meditationMinutes: 0 }
      }
    };

    const dayAlert: typeof enforcerChat = [
      ...enforcerChat,
      {
        role: "system" as const,
        text: `[TRANSITION] Calendar synchronized. Commencement of Day ${nextDay} of the White Room curriculum.`,
        timestamp: new Date().toISOString()
      }
    ];

    setEnforcerChat(dayAlert);
    await saveWhiteRoomData(nextState, dayAlert);
  };

  // Successfully complete 4th Gen 30-day Cycle!
  const triggerWhiteRoomGraduation = async () => {
    setCompletionAlert(true);
    playCheckmarkSound();

    const finalChat: typeof enforcerChat = [
      ...enforcerChat,
      {
        role: "system" as const,
        text: `[CYCLE ACCOMPLISHED] Subject #${auth.currentUser?.uid?.slice(0, 5).toUpperCase()} has survived 30 days of 4th Gen Beta Curriculum.`,
        timestamp: new Date().toISOString()
      },
      {
        role: "coach" as const,
        text: `Remarkable. Biological limits surpassed. Subject ${playerName} is validated as a certified 'Masterpiece' of the White Room facility. Your badge has been engraved.`,
        timestamp: new Date().toISOString()
      }
    ];

    const graduatedState: WhiteRoomState = {
      ...wrState,
      currentStreakDay: 30,
      highestStreakDay: 30,
      pillars: {
        cognitive: { completed: true, completedAt: new Date().toISOString(), durationMinutes: 15 },
        conditioning: { completed: true, completedAt: new Date().toISOString(), workoutType: "Hiit Block complete" },
        stoic: { completed: true, completedAt: new Date().toISOString(), meditationMinutes: 15 }
      }
    };

    setEnforcerChat(finalChat);
    await saveWhiteRoomData(graduatedState, finalChat);

    // Sync Masterpiece badge directly into standard global Leaderboard doc!
    syncMasterpieceBadgeToGlobalLeaderboard();
  };

  // Sync "Masterpiece" badge with the global /leaderboard documents
  const syncMasterpieceBadgeToGlobalLeaderboard = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      // Read current values first from leaderboard
      const leaderboardRef = doc(db, "leaderboard", playerName);
      await setDoc(leaderboardRef, {
        playerName,
        level: parentStats?.level || 1,
        gold: parentStats?.gold || 0,
        job: parentStats?.job || "Graduate",
        rank: parentStats?.rank || "S-Rank",
        hasMasterpieceBadge: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log("Masterpiece badge registered globally!");
    } catch (e) {
      console.error("Failed to sync masterpiece badge globally:", e);
    }
  };

  // Interactive Pillars actions
  const completeCognitiveBlock = async () => {
    playCheckmarkSound();
    
    // Calculate response time metric (earlier check off = higher score)
    const hoursRemaining = DEADLINES.cognitive - simulatedHour;
    const responseTimeScoreDelta = Math.min(100, Math.max(40, hoursRemaining * 10 + 60));

    const updatedState: WhiteRoomState = {
      ...wrState,
      responseTimeScore: (wrState.responseTimeScore + responseTimeScoreDelta) / 2,
      efficiencyPercentage: Math.min(100, wrState.efficiencyPercentage + 5),
      pillars: {
        ...wrState.pillars,
        cognitive: {
          completed: true,
          completedAt: new Date().toISOString(),
          durationMinutes: 15
        }
      }
    };

    setCognitiveActive(false);
    await saveWhiteRoomData(updatedState);
  };

  const completeConditioningSync = async () => {
    setConditioningSyncing(true);
    playTickSound();

    setTimeout(async () => {
      setConditioningSyncing(false);
      playCheckmarkSound();

      const hoursRemaining = DEADLINES.conditioning - simulatedHour;
      const responseTimeScoreDelta = Math.min(100, Math.max(40, hoursRemaining * 10 + 60));

      const updatedState: WhiteRoomState = {
        ...wrState,
        responseTimeScore: (wrState.responseTimeScore + responseTimeScoreDelta) / 2,
        efficiencyPercentage: Math.min(100, wrState.efficiencyPercentage + 5),
        pillars: {
          ...wrState.pillars,
          conditioning: {
            completed: true,
            completedAt: new Date().toISOString(),
            workoutType: conditioningType || "HIIT Block Auto Sync"
          }
        }
      };

      await saveWhiteRoomData(updatedState);
    }, 1800);
  };

  const completeStoicBlock = async () => {
    playCheckmarkSound();

    const hoursRemaining = DEADLINES.stoic - simulatedHour;
    const responseTimeScoreDelta = Math.min(100, Math.max(40, hoursRemaining * 10 + 60));

    const updatedState: WhiteRoomState = {
      ...wrState,
      responseTimeScore: (wrState.responseTimeScore + responseTimeScoreDelta) / 2,
      efficiencyPercentage: Math.min(100, wrState.efficiencyPercentage + 5),
      pillars: {
        ...wrState.pillars,
        stoic: {
          completed: true,
          completedAt: new Date().toISOString(),
          meditationMinutes: 15
        }
      }
    };

    setStoicActive(false);
    await saveWhiteRoomData(updatedState);
  };

  // Timer run loop
  useEffect(() => {
    let interval: any = null;
    if (cognitiveActive) {
      interval = setInterval(() => {
        setCognitiveTimer(prev => {
          if (prev >= 15) { // 15 seconds simulation completes block
            completeCognitiveBlock();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [cognitiveActive, simulatedHour]);

  useEffect(() => {
    let interval: any = null;
    if (stoicActive) {
      interval = setInterval(() => {
        setStoicTimer(prev => {
          if (prev >= 15) { // 15 seconds meditation completes block
            completeStoicBlock();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [stoicActive, simulatedHour]);

  // Load Leaderboard data
  const fetchWRLeaderboardData = async () => {
    setLoadingWRLeaderboard(true);
    try {
      const q = query(
        collection(db, "white_room_leaderboard"),
        orderBy("streak", "desc"),
        orderBy("efficiency", "desc"),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const results: LeaderboardEntryWR[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        results.push({
          subjectId: d.subjectId || "Anonymous",
          generation: d.generation || "4th",
          streak: d.streak || 1,
          efficiency: d.efficiency || 100,
          responseTime: d.responseTime || 95,
          consistency: d.consistency || 98,
          isMasterpiece: d.isMasterpiece || false,
          updatedAt: d.updatedAt
        });
      });
      // Fallback seed list for visual quality if database is dry of extra participants
      if (results.length === 0) {
        results.push(
          { subjectId: "Subject #E549A", generation: "4th", streak: 28, efficiency: 98, responseTime: 96.5, consistency: 99, isMasterpiece: false, updatedAt: "" },
          { subjectId: "Subject #B885C", generation: "4th", streak: 21, efficiency: 95, responseTime: 94.2, consistency: 96, isMasterpiece: false, updatedAt: "" },
          { subjectId: "Subject #F9101", generation: "5th", streak: 14, efficiency: 88, responseTime: 82.0, consistency: 89, isMasterpiece: false, updatedAt: "" }
        );
      }
      setWrLeaderboard(results);
    } catch (e) {
      console.error("Failed to load White Room Leaderboard:", e);
    } finally {
      setLoadingWRLeaderboard(false);
    }
  };

  useEffect(() => {
    if (activeTab === "leaderboard") {
      fetchWRLeaderboardData();
    }
  }, [activeTab]);

  // Enforcer coach query proxy
  const queryEnforcerAI = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatLoading(true);

    const userMessageObj = {
      role: "user" as const,
      text: userMsg,
      timestamp: new Date().toISOString()
    };
    const currentList = [...enforcerChat, userMessageObj];
    setEnforcerChat(currentList);

    try {
      const res = await fetch("/api/whiteroom/enforcer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName,
          generation: wrState.generation === "4th" ? "4th Generation (Beta)" : "5th Generation (Standard)",
          day: wrState.currentStreakDay,
          efficiency: Math.round(wrState.efficiencyPercentage),
          failures: wrState.dropoutCount,
          message: userMsg,
          history: enforcerChat.filter(c => c.role !== 'system')
        })
      });

      const data = await res.json();
      if (data.response) {
        const updatedChat = [
          ...currentList,
          {
            role: "coach" as const,
            text: data.response,
            timestamp: new Date().toISOString()
          }
        ];
        setEnforcerChat(updatedChat);
        await saveWhiteRoomData(wrState, updatedChat);
      }
    } catch (e) {
      console.error("Enforcer AI contact failed:", e);
    } finally {
      setChatLoading(false);
      // scroll coach
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Full clinical hard-reset of white room stats only
  const handleFullTelemetryReset = async () => {
    playExpulsionSound();
    
    // Wipe specific White Room metrics only, keeping standard app data intact
    const resetState: WhiteRoomState = {
      isActive: false,
      onboarded: false,
      generation: null,
      startDay: null,
      currentStreakDay: 1,
      highestStreakDay: Math.max(1, wrState.highestStreakDay),
      dropoutCount: wrState.dropoutCount + 1,
      efficiencyPercentage: 100,
      responseTimeScore: 95,
      consistencyScore: 98,
      pillars: {
        cognitive: { completed: false, completedAt: null, durationMinutes: 0 },
        conditioning: { completed: false, completedAt: null, workoutType: null },
        stoic: { completed: false, completedAt: null, meditationMinutes: 0 }
      },
      coachHistory: [],
      lastCheckedDate: null
    };

    setEnforcerChat([]);
    setShowWarning(true);
    await saveWhiteRoomData(resetState, []);
  };

  return (
    <div id="white-room-portal" className="min-h-screen bg-neutral-100 text-neutral-900 font-sans selection:bg-neutral-800 selection:text-white relative flex flex-col">
      
      {/* Dynamic Sound Ticker and Back Gateway */}
      <nav id="white-room-nav" className="bg-white border-b border-neutral-200 py-3 px-6 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <button 
          id="wr_back_button" 
          onClick={onBack} 
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-950 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Leave Laboratory</span>
        </button>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded border border-neutral-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-medium tracking-wide uppercase text-neutral-500">Facility Comm Live</span>
          </div>
          <button 
            id="audio_toggle" 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
            title={soundEnabled ? "Mute audio ticker" : "Enable audio ticker"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* Left Side: Diagnostics and Level Progress */}
        <div id="white-room-sidebar" className="w-full md:w-80 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-none border border-neutral-300 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-neutral-900 h-full" />
            <h1 className="text-xl font-bold tracking-tight uppercase text-neutral-900 mb-1">White Room</h1>
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-mono font-bold mb-4">Extremity Curricula</p>
            
            {wrState.isActive ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-neutral-200">
                  <span className="text-xs text-neutral-400 uppercase font-mono block">Active Protocol</span>
                  <span className="text-base font-bold font-mono tracking-tight uppercase">
                    {wrState.generation === "4th" ? "4th Gen (Beta)" : "5th Gen (Standard)"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 uppercase font-mono block">Streak Day</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono tracking-tighter text-neutral-900">{wrState.currentStreakDay}</span>
                    <span className="text-neutral-400 text-xs font-mono uppercase">/ 30 Days</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1 mt-2">
                    <div 
                      className="bg-neutral-800 h-full transition-all duration-500" 
                      style={{ width: `${(wrState.currentStreakDay / 30) * 100}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                    <span className="text-[10px] text-neutral-400 uppercase block font-mono">My Highest</span>
                    <span className="text-lg font-bold font-mono text-neutral-800">{wrState.highestStreakDay}d</span>
                  </div>
                  <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                    <span className="text-[10px] text-neutral-400 uppercase block font-mono">Dropouts</span>
                    <span className="text-lg font-bold font-mono text-red-600">{wrState.dropoutCount}x</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-neutral-500 text-xs font-mono py-6 space-y-4 text-center">
                <ShieldAlert className="w-8 h-8 text-neutral-300 mx-auto" />
                <p>Curriculum dormant. Complete physical/mental/stoic gates daily. Failure under 4th Generation initiates expulsion warnings.</p>
              </div>
            )}
          </div>

          {/* Clinical Visual Metrics */}
          {wrState.isActive && (
            <div className="bg-white p-6 rounded-none border border-neutral-300 shadow-sm relative">
              <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-neutral-400 mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-neutral-800" />
                <span>Subject Analytics</span>
              </h2>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-500">EFFICIENCY INDEX</span>
                    <span className="font-bold text-neutral-900">{Math.round(wrState.efficiencyPercentage)}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1">
                    <div className="bg-neutral-900 h-full" style={{ width: `${wrState.efficiencyPercentage}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-500">RESPONSE LATENCY</span>
                    <span className="font-bold text-neutral-900">{wrState.responseTimeScore.toFixed(1)}/100</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1">
                    <div className="bg-neutral-900 h-full" style={{ width: `${wrState.responseTimeScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-500">COMPLIANCE SCORE</span>
                    <span className="font-bold text-neutral-900">{Math.round(wrState.consistencyScore)}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1">
                    <div className="bg-neutral-900 h-full" style={{ width: `${wrState.consistencyScore}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Debug/Graduation Simulator Tools */}
          {wrState.isActive && (
            <div className="bg-white p-5 border border-red-200 rounded-none mt-2">
              <h3 className="text-xs font-mono font-black text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                <span>Testing calibrator</span>
              </h3>
              <p className="text-[10px] text-neutral-500 font-mono mb-4">Calibrate hours to test time-locking expulsion checkpoints or transition into subsequent consecutive days.</p>
              
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-neutral-600 font-bold">
                    <span>SIMULATED HOUR</span>
                    <span>{simulatedHour < 10 ? `0${simulatedHour}` : simulatedHour}:00 {simulatedHour >= 12 ? 'PM' : 'AM'}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="23"
                    value={simulatedHour}
                    onChange={(e) => {
                      setUseRealTime(false);
                      setSimulatedHour(Number(e.target.value));
                    }}
                    className="w-full accent-neutral-800 cursor-pointer"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setUseRealTime(true);
                      const now = new Date();
                      setSimulatedHour(now.getHours());
                      setSimulatedMinute(now.getMinutes());
                    }}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 py-1.5 rounded transition-all text-[11px] font-bold uppercase"
                  >
                    Use Real Time
                  </button>
                  <button 
                    onClick={simulateNewDayTransition}
                    className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white py-1.5 rounded transition-all text-[11px] font-bold uppercase"
                  >
                    Next Day ➔
                  </button>
                </div>

                <button 
                  onClick={handleFullTelemetryReset}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 py-2 rounded font-bold uppercase text-[10px] tracking-wide"
                >
                  Hard Reset Metrics
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Main Work Desk Panel */}
        <div id="white-room-main" className="flex-1 flex flex-col gap-6">
          
          {/* Navigation Tab selection */}
          <div className="bg-white p-2 rounded-none border border-neutral-300 flex overflow-x-auto gap-1">
            <button 
              id="tab_curriculum" 
              onClick={() => setActiveTab("curriculum")}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${activeTab === "curriculum" ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              Curriculum Core
            </button>
            <button 
              id="tab_enforcer" 
              onClick={() => {
                setActiveTab("enforcer");
                setTimeout(() => {
                  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${activeTab === "enforcer" ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              Enforcer AI Coach
            </button>
            <button 
              id="tab_leaderboard" 
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${activeTab === "leaderboard" ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              Anonymous Leaderboard
            </button>
          </div>

          <div className="flex-1">
            {showWarning && (
              <motion.div 
                id="onboarding-overlay" 
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-2 border-neutral-900 p-8 rounded-none shadow-md text-center max-w-xl mx-auto space-y-6"
              >
                <div className="flex justify-center">
                  <ShieldAlert className="w-16 h-16 text-neutral-950 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-neutral-900 tracking-tight">Accessing the White Room</h3>
                  <p className="text-xs font-mono text-red-600 font-bold uppercase mt-1">Warning: high stakes telemetry interface</p>
                </div>
                <div className="text-xs text-neutral-600 font-mono text-left space-y-3 leading-relaxed border-y border-neutral-200 py-4 max-h-56 overflow-y-auto">
                  <p>1. The **White Room** is a ruthless self-development laboratory. It is entirely separate from standard gamifications.</p>
                  <p>2. Entering this protocol **wanes standard streak freezes** and casual grace frames.</p>
                  <p>3. **4th Generation (Beta Curriculum)** enforces absolute perfection. A single missed deadline results in expulsion, resetting your streak immediately to Day 1, and logging a disciplinary dropout.</p>
                  <p>4. **5th Generation** reduces experience points and efficiency indexes on errors, but retains streak telemetry.</p>
                  <p>5. Reaching Day 30 under 4th Gen successfully unlocks the permanent, global **[MASTERPIECE]** badge on the public leaderboards.</p>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block mb-3">Authorize curriculum initiation:</span>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => joinWhiteRoom("5th")}
                      className="flex-1 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-400 font-mono font-bold py-3 text-xs uppercase cursor-pointer"
                    >
                      Initialize 5th Generation (Standard)
                    </button>
                    <button 
                      onClick={() => joinWhiteRoom("4th")}
                      className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold py-3 text-xs uppercase cursor-pointer border border-neutral-950"
                    >
                      Initialize 4th Generation (Extreme)
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {!showWarning && activeTab === "curriculum" && (
              <div className="space-y-6">
                
                {/* Active Curriculum block timeline */}
                <div className="bg-white p-6 border border-neutral-300 rounded-none relative">
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                    <div>
                      <span className="text-xs text-neutral-400 font-mono uppercase">Current Period Objective</span>
                      <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900">Three Pillars of the Curriculum</h3>
                    </div>
                    <div className="bg-neutral-100 flex items-center gap-2 px-3 py-1 border border-neutral-200 text-xs font-mono font-bold text-neutral-700">
                      <Clock className="w-4 h-4 text-neutral-800" />
                      <span>{simulatedHour < 12 ? 'AM' : 'PM'} Block Focus</span>
                    </div>
                  </div>

                  {/* Standard instructions block */}
                  <p className="text-xs text-neutral-500 font-mono leading-relaxed mb-6">
                    Each daily cycle requires completing three checks sequentially. Action must be recorded before deadline checks occur. Compliance levels affect your anonymous standing in the laboratory.
                  </p>

                  <div className="space-y-4">
                    
                    {/* 1. Cognitive Block (Mentality) */}
                    <div className="bg-white border border-neutral-300 p-5 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-neutral-500">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-neutral-950 text-white text-[10px] font-mono px-2 py-0.5 rounded-none uppercase font-bold">Pillar I</span>
                          <span className={`text-[10px] font-mono font-bold uppercase ${simulatedHour >= DEADLINES.cognitive ? 'text-red-500' : 'text-neutral-400'}`}>
                            Deadline: 12:00 PM (Noon)
                          </span>
                        </div>
                        <h4 className="text-sm font-bold uppercase text-neutral-900 leading-tight">Mental Enrichment (Cognitive Block)</h4>
                        <p className="text-xs text-neutral-400 font-mono">Advanced reading, puzzle-solving, or system programming. Trigger timer (15s simulates 15 mins).</p>
                        
                        {cognitiveActive && (
                          <div className="flex items-center gap-3 pt-2">
                            <div className="w-24 bg-neutral-100 h-2">
                              <div className="bg-neutral-900 h-full animate-pulse" style={{ width: `${(cognitiveTimer / 15) * 100}%` }} />
                            </div>
                            <span className="text-xs font-mono text-neutral-600">{15 - cognitiveTimer}s remaining...</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {wrState.pillars.cognitive.completed ? (
                          <div className="bg-neutral-50 border border-neutral-300 text-neutral-500 flex items-center gap-1 px-4 py-2 text-xs font-mono uppercase font-bold pointer-events-none">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Checked Off</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setCognitiveActive(!cognitiveActive)}
                            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all ${cognitiveActive ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-300' : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-950'}`}
                          >
                            {cognitiveActive ? 'Pause protocol' : 'Initialize (15s)'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 2. Conditioning Block (Physiology) */}
                    <div className="bg-white border border-neutral-300 p-5 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-neutral-500">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-neutral-950 text-white text-[10px] font-mono px-2 py-0.5 rounded-none uppercase font-bold">Pillar II</span>
                          <span className={`text-[10px] font-mono font-bold uppercase ${simulatedHour >= DEADLINES.conditioning ? 'text-red-500' : 'text-neutral-400'}`}>
                            Deadline: 5:00 PM
                          </span>
                        </div>
                        <h4 className="text-sm font-bold uppercase text-neutral-900 leading-tight">Physiology Calibrator (Conditioning Block)</h4>
                        <p className="text-xs text-neutral-400 font-mono">High intensity training, martial arts sequence, or endurance drills. Connect simulator sync.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {wrState.pillars.conditioning.completed ? (
                          <div className="bg-neutral-50 border border-neutral-300 text-neutral-500 flex items-center gap-1 px-4 py-2 text-xs font-mono uppercase font-bold pointer-events-none">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Sync Synced</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <select 
                              value={conditioningType}
                              onChange={(e) => setConditioningType(e.target.value)}
                              className="bg-neutral-50 border border-neutral-300 text-xs font-mono font-bold uppercase px-2 py-2 rounded focus:outline-none"
                            >
                              <option value="">HIIT Drill</option>
                              <option value="Martial Arts">Wing Chun Forms</option>
                              <option value="Kettlebell">Strength Split</option>
                            </select>
                            <button 
                              onClick={completeConditioningSync}
                              disabled={conditioningSyncing}
                              className="px-4 py-2 text-xs font-mono font-bold uppercase bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-950 transition-all disabled:bg-neutral-300"
                            >
                              {conditioningSyncing ? "Connecting health api..." : "Sync Logs"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Stoic Block (Strategy) */}
                    <div className="bg-white border border-neutral-300 p-5 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-neutral-500">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-neutral-950 text-white text-[10px] font-mono px-2 py-0.5 rounded-none uppercase font-bold">Pillar III</span>
                          <span className={`text-[10px] font-mono font-bold uppercase ${simulatedHour >= DEADLINES.stoic ? 'text-red-500' : 'text-neutral-400'}`}>
                            Deadline: 9:00 PM
                          </span>
                        </div>
                        <h4 className="text-sm font-bold uppercase text-neutral-900 leading-tight">Stoic Quarantine (Meditation / Screen Block)</h4>
                        <p className="text-xs text-neutral-400 font-mono">Restricting digital emission, mindful silence, or screen locks (15s simulates 15 mins).</p>
                        
                        {stoicActive && (
                          <div className="flex items-center gap-3 pt-2">
                            <div className="w-24 bg-neutral-100 h-2">
                              <div className="bg-neutral-900 h-full animate-ping" style={{ width: `${(stoicTimer / 15) * 100}%` }} />
                            </div>
                            <span className="text-xs font-mono text-neutral-600">{15 - stoicTimer}s until baseline complete</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {wrState.pillars.stoic.completed ? (
                          <div className="bg-neutral-50 border border-neutral-300 text-neutral-500 flex items-center gap-1 px-4 py-2 text-xs font-mono uppercase font-bold pointer-events-none">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Restored</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setStoicActive(!stoicActive)}
                            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all ${stoicActive ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-300' : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-950'}`}
                          >
                            {stoicActive ? 'Silence meditation' : 'Initialize meditation'}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* Enforcer AI chat interface */}
            {!showWarning && activeTab === "enforcer" && (
              <div className="bg-white border border-neutral-300 rounded-none flex flex-col h-[500px]">
                
                {/* Chat header */}
                <div className="bg-neutral-900 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase leading-none tracking-wide">Enforcer AI Profile</h4>
                      <span className="text-[10px] text-neutral-400 font-mono">White Room Laboratory Controller</span>
                    </div>
                  </div>
                </div>

                {/* Main conversation pane */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-xs max-h-[380px] bg-neutral-50">
                  {enforcerChat.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end animate-fadeIn' : 'mr-auto items-start animate-slideRight'}`}
                    >
                      {msg.role !== 'system' && (
                        <span className="text-[9px] text-neutral-400 uppercase mb-1">
                          {msg.role === 'coach' ? "Enforcer Coach" : "Subject"}
                        </span>
                      )}
                      
                      <div className={`p-3 border leading-relaxed ${
                        msg.role === 'system' ? 'bg-amber-50 text-amber-800 border-amber-200 text-center w-full max-w-full my-2' : 
                        msg.role === 'user' ? 'bg-neutral-900 border-neutral-900 text-white' : 
                        'bg-white border-neutral-300 text-neutral-800 shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="mr-auto max-w-[85%] items-start animate-pulse flex flex-col gap-1">
                      <span className="text-[9px] text-neutral-400 uppercase">Enforcer processing...</span>
                      <div className="p-3 border border-neutral-200 bg-white">
                        Analyzing curriculum performance variables...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input frame */}
                <div className="p-3 border-t border-neutral-300 bg-white flex items-center gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && queryEnforcerAI()}
                    placeholder="Consult enforcer..."
                    disabled={chatLoading}
                    className="flex-1 border border-neutral-300 px-3 py-2 text-xs font-mono bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                  <button 
                    onClick={queryEnforcerAI}
                    disabled={chatLoading}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-mono uppercase font-bold"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* Anonymous Leaderboard Tab */}
            {!showWarning && activeTab === "leaderboard" && (
              <div className="bg-white border border-neutral-300 rounded-none p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-black uppercase text-neutral-900 tracking-tight flex items-center gap-2">
                    <Database className="w-5 h-5 text-neutral-900" />
                    <span>Laboratory Sub-Telemetry (Anonymous Rank)</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono uppercase mt-1">Strict ranking of subjects based on streak days, response latency, and compliance scores</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border border-neutral-200 text-neutral-700">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 uppercase text-neutral-400 text-[10px]">
                        <th className="p-3">Rank</th>
                        <th className="p-3">Subject ID</th>
                        <th className="p-3">Generation</th>
                        <th className="p-3">Streak Day</th>
                        <th className="p-3">Compliance</th>
                        <th className="p-3">Efficiency</th>
                        <th className="p-3">Badge Info</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingWRLeaderboard ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-neutral-400">
                            Syncing database records...
                          </td>
                        </tr>
                      ) : (
                        wrLeaderboard.map((item, index) => (
                          <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
                            <td className="p-3 font-bold">#{index + 1}</td>
                            <td className="p-3 text-neutral-900 font-bold">{item.subjectId}</td>
                            <td className="p-3">{item.generation}th Gen</td>
                            <td className="p-3 text-neutral-900 font-bold">{item.streak} days</td>
                            <td className="p-3">{item.consistency || 100}%</td>
                            <td className="p-3">{item.efficiency}%</td>
                            <td className="p-3">
                              {item.streak >= 30 && item.generation === "4th" ? (
                                <span className="bg-neutral-950 text-white text-[9px] font-black tracking-widest px-2 py-0.5 rounded-none border border-neutral-950 uppercase animate-pulse">
                                  ★ MASTERPIECE
                                </span>
                              ) : (
                                <span className="text-neutral-300 text-[10px]">Candidate</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="text-[10px] text-neutral-400 leading-relaxed font-mono mt-4">
                  * Clinical anonymity overrides identities. Names are encoded permanently. Graduating 4th Generation cycles triggers the global Engrave verification instantly.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Expulsion Dialog */}
      <AnimatePresence>
        {expulsionAlert && (
          <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border-2 border-red-600 max-w-md w-full p-8 rounded-none text-center shadow-lg relative">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-xl font-bold uppercase text-red-600 tracking-tight">Expulsion Triggered</h4>
              <p className="text-xs font-mono text-neutral-400 uppercase mt-1">Disciplinary protocol breach detected</p>
              
              <div className="p-4 bg-red-50 text-red-800 border border-red-100 text-xs font-mono text-left space-y-2 leading-relaxed my-6">
                <p><strong>Failed Item:</strong> {expulsionAlert.reason}</p>
                <p><strong>Deducted Streak:</strong> Day {expulsionAlert.dayLost} reduced to Day 1</p>
                <p><strong>Status:</strong> Disciplinary Dropout logged in the White Room register.</p>
              </div>

              <div className="text-xs italic text-neutral-500 font-mono mb-6">
                "Biological standard decay is unacceptable. Reset your curriculum and recover control."
              </div>

              <button 
                onClick={() => setExpulsionAlert(null)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold py-3 text-xs uppercase cursor-pointer"
              >
                Acknowledge and Re-commit
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Graduation Completion Dialog */}
      <AnimatePresence>
        {completionAlert && (
          <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border-2 border-neutral-950 max-w-md w-full p-8 rounded-none text-center shadow-lg">
              <div className="w-16 h-16 rounded-full bg-neutral-950 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-black uppercase text-neutral-950 tracking-tight">Curriculum Mastered</h4>
              <p className="text-xs font-mono text-neutral-400 uppercase mt-1">Certified 'Masterpiece' status achieved</p>
              
              <div className="bg-neutral-50 p-4 border border-neutral-200 text-xs font-mono text-left space-y-2 leading-relaxed my-6">
                <p><strong>Cycle:</strong> 30 Day Endurance</p>
                <p><strong>Generation:</strong> 4th Generation Beta</p>
                <p><strong>Engraving:</strong> Star registered on standard Leaderboard badge.</p>
              </div>

              <div className="text-xs italic text-neutral-500 font-mono mb-6">
                "Subject validated. Your power and consistency exceed clinical parameters."
              </div>

              <button 
                onClick={() => setCompletionAlert(false)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold py-3 text-xs uppercase cursor-pointer"
              >
                Engrave Global Identifier
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
