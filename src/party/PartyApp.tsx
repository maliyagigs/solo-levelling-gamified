import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Gamepad2, 
  Shield, 
  MessageSquare, 
  ArrowLeft, 
  Plus, 
  Trophy,
  Activity,
  Flame,
  Zap,
  Radio,
  Lock,
  Search,
  Send,
  LogOut,
  Swords,
  Skull,
  Award,
  ShieldCheck,
  Compass,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Clock,
  Skull as SkeletonIcon,
  BookOpen,
  Target,
  Heart,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove, 
  getDoc,
  setDoc,
  increment
} from "firebase/firestore";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Camera, 
  RefreshCcw, 
  X, 
  Check 
} from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../utils/firebase";
import DpsChart from "../components/DpsChart";
import studyBossImg from "../assets/images/study_phantom_boss_1780939764383.png";
import barukaBossImg from "../assets/images/baruka_boss_1780939780398.png";
import kargalganBossImg from "../assets/images/kargalgan_boss_1780939794429.png";
import igrisBossImg from "../assets/images/igris_boss_1780939807314.png";

interface PartyPageProps {
  playerName: string;
  onBack: () => void;
  playSelectSound: () => void;
}

interface ForumPost {
  id?: string;
  sender: string;
  hunterClass: string;
  guild: string;
  text: string;
  timestamp: number;
}

function VictoryLevelUpParticles() {
  const particles = Array.from({ length: 60 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50 flex items-center justify-center">
      {/* Glow Centerburst Badge */}
      <motion.div 
        initial={{ scale: 0, opacity: 0, rotate: -15 }}
        animate={{ 
          scale: [0.5, 1.25, 1],
          opacity: [0, 1, 1],
          rotate: [0, -2, 0],
          y: [40, -15, 0]
        }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="bg-slate-950/95 border-2 border-indigo-500/50 px-10 py-6 rounded-[2.5rem] shadow-[0_0_80px_rgba(99,102,241,0.55)] flex flex-col items-center justify-center gap-2 relative z-50 backdrop-blur-md max-w-sm text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, ease: "easeInOut", repeat: 3, repeatDelay: 1 }}
        >
          <Trophy className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_#f59e0b]" />
        </motion.div>
        
        <span className="text-[10px] font-mono text-cyan-400 font-extrabold tracking-[0.4em] uppercase animate-pulse">RIFT CLEARED SUCCESS</span>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-400 tracking-tighter uppercase italic leading-none my-1">
          LEVEL UP!
        </h1>
        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800/80">
          🔑 +200 MANA EXPLOITS ACQUIRED
        </div>
      </motion.div>

      {/* Explosive shockwave ring */}
      <motion.div
        initial={{ scale: 0.1, opacity: 1, borderWidth: "8px" }}
        animate={{ scale: 3, opacity: 0, borderWidth: "1px" }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="absolute w-[180px] h-[180px] rounded-full border-2 border-indigo-500/80 pointer-events-none"
      />

      {/* Explosive Sparkles & Confetti Particles */}
      {particles.map((_, idx) => {
        // Compute organic explosion physics coordinates
        const angle = Math.random() * Math.PI * 2;
        const velocity = 80 + Math.random() * 220;
        const targetX = Math.cos(angle) * velocity;
        const targetY = Math.sin(angle) * velocity;
        const randomScale = 0.4 + Math.random() * 1.3;
        const duration = 1.2 + Math.random() * 1.4;
        const delay = Math.random() * 0.15;
        const spin = (Math.random() - 0.5) * 540;
        
        const colors = [
          "bg-amber-400 shadow-[0_0_12px_#f59e0b]",
          "bg-cyan-400 shadow-[0_0_12px_#06b6d4]",
          "bg-indigo-400 shadow-[0_0_12px_#6366f1]",
          "bg-fuchsia-400 shadow-[0_0_12px_#d946ef]",
          "bg-emerald-400 shadow-[0_0_12px_#10b981]"
        ];
        const randomColor = colors[idx % colors.length];

        return (
          <motion.div
            key={idx}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{ 
              x: [0, targetX, targetX * 1.15],
              y: [0, targetY - 60, targetY + 200], // parabolic gravity arc
              scale: [0, randomScale, randomScale * 0.7, 0],
              opacity: [0, 1, 1, 0],
              rotate: [0, spin]
            }}
            transition={{ 
              duration: duration,
              delay: delay,
              ease: [0.1, 0.8, 0.3, 1]
            }}
            className={`absolute pointer-events-none ${
              idx % 4 === 0 
                ? "w-2.5 h-6 rounded-sm bg-gradient-to-b from-indigo-500 to-indigo-300" // confetti paper
                : idx % 4 === 1
                  ? "w-3 h-3 rounded-full" // circles
                  : "w-2.5 h-2.5 rotate-45" // diamonds
            } ${randomColor} will-change-transform`}
          />
        );
      })}
    </div>
  );
}

function AudioVoiceMemoPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onended = () => {
      setIsPlaying(false);
    };
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.warn(e));
      setIsPlaying(true);
    }
  };

  return (
    <button 
      type="button"
      onClick={togglePlayback}
      className={`px-3 py-1.5 rounded-xl border font-mono text-[9px] uppercase tracking-widest cursor-pointer flex items-center gap-2 transition-all shrink-0 ${
        isPlaying 
          ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 animate-pulse" 
          : "bg-indigo-950/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40"
      }`}
    >
      {isPlaying ? (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>PLAYING MEMO</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3 h-3 text-indigo-400" />
          <span>PLAY VOICE</span>
        </>
      )}
    </button>
  );
}

interface BossTacticalCompendiumProps {
  bossName: string;
  currentBossState: {
    hp: number;
    maxHp: number;
    shield: number;
    maxShield: number;
    level: string;
    teamShield?: number;
    timeRemaining: number;
    isStudySession?: boolean;
  };
}

function BossTacticalCompendium({ bossName, currentBossState }: BossTacticalCompendiumProps) {
  const [activeSubTab, setActiveSubTab] = useState<"physiology" | "abilities" | "vulnerabilities" | "loot">("physiology");
  const [simulationResult, setSimulationResult] = useState<{ name: string; quantity: string; rarity: string; chance: string; color: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Parse boss details based on name
  const getBossDetails = () => {
    const isIgris = bossName?.toLowerCase().includes("igris");
    const isBaruka = bossName?.toLowerCase().includes("baruka");
    const isKargalgan = bossName?.toLowerCase().includes("kargalgan") || bossName?.toLowerCase().includes("shaman");
    const isStudySession = currentBossState?.isStudySession;

    if (isStudySession) {
      return {
        title: bossName || "Study Session Target",
        subtitle: "A High-Focus Temporal Entity",
        threatTier: "Focus-Rank Mental Anomaly",
        classSpec: "Information Weaver / Focus Manifestation",
        manaDensity: "10,000 Mental Resonance units",
        physMultiplier: "x0.0 (Immune to Distractions)",
        description: "An incredibly detailed and lifelike manifestation of deep focus requirements. This boss can only be defeated by consistent, unbroken study intervals and blocking external distractions. High-definition neural synchronization required.",
        attribute: "Continuous Neuro-Synchronization",
        stats: {
          threat: 50,
          speed: 10,
          defense: 100,
          magic: 80,
          vulnerabilities: "Deep Work (200%), Phone Isolation (150%)",
        },
        phases: [
          { phase: "Phase 1 (100% - 66% Focus)", title: "Initial Resistance", desc: "The mind wanders easily. The entity attempts to inject thoughts of social media. Needs constant Focus Bursts." },
          { phase: "Phase 2 (66% - 33% Focus)", title: "Deep Trance State", desc: "The entity summons heavy sleepiness fields. Use Energy Boost actions to maintain group vitality." },
          { phase: "Phase 3 (< 33% Focus)", title: "The Flow State / 30 Minute Alarm", desc: "The entity becomes completely synchronized. Completing the timer sets off an alarm and grants completion attendance." },
        ],
        abilities: [
          { name: "Procrastination Pulse", type: "Mental Decay", cooldown: "30s", effect: "Drains study energy from the group. Must be countered by Distraction Blocker." },
          { name: "Social Notification", type: "Sudden Distraction", cooldown: "60s", effect: "Applies a heavy debuff to focus unless silenced by a Shadow Extraction (Module Complete)." },
          { name: "Total Engagement", type: "System Event", cooldown: "Timer End", effect: "The timer ends, an alarm plays, and mana is successfully integrated based on attendance." },
        ],
        vulnerabilitiesList: [
          { type: "Pomodoro Rhythms", rating: "HIGH VULNERABILITY (+100%)", detail: "Applying structured time intervals melts the entity's defenses completely." },
          { type: "Group Accountability", rating: "VULNERABILITY (+50%)", detail: "Having party members actively using Focus Bursts increases overall damage taken." },
        ],
        loot: [
          { name: "Crystalized Focus Memory", quantity: "1x Unit", rarity: "S-Rank Mental Artifact", chance: "100%", color: "text-emerald-400 border-emerald-500/30" },
          { name: "Sovereign Gold / EXP", quantity: "Var", rarity: "Based on Contribution", chance: "100%", color: "text-amber-400 border-amber-500/30" },
        ],
        bossImage: studyBossImg
      };
    }

    if (isBaruka) {
      return {
        title: "Lord Baruka",
        subtitle: "The Master Assassin of the White Storm",
        threatTier: "S-Rank Abyssal Elite",
        classSpec: "Spectral Wind Assassin / Rogue",
        manaDensity: "11,200 QM units",
        physMultiplier: "x5.8 Glacial Scale",
        description: "A bloodthirsty Frost Elf warrior of extreme intelligence. He wields dual icy daggers with invisible swiftness. Moves undetected during blizzards and coordinates coordinated strikes designed to eliminate vulnerable healers first.",
        attribute: "Glacial Frostbite & Bleed Matrix",
        stats: {
          threat: 92,
          speed: 98,
          defense: 65,
          magic: 80,
          vulnerabilities: "Fire (140%), Piercing (115%)",
        },
        phases: [
          { phase: "Phase 1 (100% - 70% HP)", title: "Stalking Glacier Outburst", desc: "Launches surprise Frostbite Slashes that apply stacks of movement decay. Hunters should keep protective barriers primed." },
          { phase: "Phase 2 (70% - 35% HP)", title: "Absolute White-Out Storm", desc: "Baruka unleashes an extreme blizzard draining 4% vanguard shields per second. Initiate party-wide Heal Infusion matrix loops." },
          { phase: "Phase 3 (< 35% HP)", title: "Silent Step Slayers Strike", desc: "Marks the lowest HP party member and launches a critical execute that deals 90% direct damage unless shielded by Aegis Ward." },
        ],
        abilities: [
          { name: "Glacier Blade Cleave", type: "Physical Slash", cooldown: "8s", effect: "Deals heavy physical bleed damage, scaling down active recovery speed by 40%." },
          { name: "Frozen Ice Mirage", type: "Agility Avoidance", cooldown: "24s", effect: "Creates active duplicates. Evades 30% of standard hunter basic physical strikes." },
          { name: "Blizzard Cry Chant", type: "Glacial Magic Override", cooldown: "35s", effect: "Freezes target abilities, preventing use of commands for 3s unless interrupted." },
        ],
        vulnerabilitiesList: [
          { type: "Fire Essence Ignition", rating: "HIGH VULNERABILITY (+40%)", detail: "Flame element completely melts glacial protective layers, removing 50% shielding." },
          { type: "Stun Lock Counters", rating: "MODERATE RESIST (Immune to Soft Stuns)", detail: "Can only be staggered with Shadow sovereign level interruptions." },
          { type: "Armor Piercing", rating: "EASY CLEAVE", detail: "Physical heavy armor piercing strikes bypass Frost armor protections completely." },
        ],
        loot: [
          { name: "Baruka's Frost Dual Dagger", quantity: "1x Unit", rarity: "S-Rank Sovereign Weapon", chance: "1.8%", color: "text-cyan-400 border-cyan-500/30" },
          { name: "Frostwind Vanguard Iron Jerkin", quantity: "1x Unit", rarity: "S-Rank Agility Plate", chance: "4.0%", color: "text-blue-400 border-blue-500/30" },
          { name: "S-Rank Eternal Glacial Core", quantity: "2x Units", rarity: "S-Rank Crafting Catalyst", chance: "100%", color: "text-fuchsia-400 border-fuchsia-500/30" },
        ],
        bossImage: barukaBossImg
      };
    }

    if (isKargalgan) {
      return {
        title: "Kargalgan",
        subtitle: "High Priest of the High Orc Sovereign Tribe",
        threatTier: "S-Rank Calamity Prime",
        classSpec: "Spacetime Demon Chanter / Mage",
        manaDensity: "16,550 QM units",
        physMultiplier: "x7.2 Sorcerer Scale",
        description: "The supreme shaman commanding ancient spell structures. Surrounded by perpetual magic guards that absorb physical force. He directs cosmic gravity arrays, magical barriers, and high-impact meteor call loops.",
        attribute: "Gravitational Spacetime Distortion Enclaves",
        stats: {
          threat: 97,
          speed: 62,
          defense: 94,
          magic: 99,
          vulnerabilities: "Shattering Strike, Shadow Extraction Resonance",
        },
        phases: [
          { phase: "Phase 1 (100% - 65% HP)", title: "High Orc Spell Shielding", desc: "Launches with massive protective hymnals (+3,500 startup shield). Physical pierce is needed to puncture the core." },
          { phase: "Phase 2 (65% - 30% HP)", title: "Orb Gravitational Domination", desc: "Compresses space, raising team spell/ability cooldowns by 1.5s. Prepare Shadow Extraction to force interruptions." },
          { phase: "Phase 3 (< 30% HP)", title: "Ultimate Cataclysm Meteor Call", desc: "Enters an endless spellcast chant loop. If his chanting timer drops to 0, it wipes 95% total party health capacity." },
        ],
        abilities: [
          { name: "Hymn of Devouring Firestorms", type: "Arcane Ignis", cooldown: "12s", effect: "Fires high-impact fire rings exploding target areas and burning for sustained damage." },
          { name: "Gravity Compression Domain", type: "Void Magic", cooldown: "20s", effect: "Pins down the highest damage contributor, rendering them inactive for 5s." },
          { name: "Colossus Aegis Protection", type: "Spell Ward Chant", cooldown: "40s", effect: "Casts a massive defensive runic barrier, absorbing all attacks except crushing strike." },
        ],
        vulnerabilitiesList: [
          { type: "Heavy Armor Piercing / Shatter", rating: "HIGH CRITICAL (+35%)", detail: "Heavy weapon impacts stagger Kargalgan, breaking his spell casting channel instantly." },
          { type: "Mana Feedback Shock", rating: "Feedback Damage Loop", detail: "Stunning active casting triggers a spell cascade, causing 1,200 absolute feedback damage." },
          { type: "Sovereign Spell Interruption", rating: "VULNERABILITY (+15%)", detail: "Shadow extraction disrupts focus, scaling down Kargalgan's magical spellcast speed by 25%." },
        ],
        loot: [
          { name: "Orc Warlord's Sovereign Staff", quantity: "1x Unit", rarity: "S-Rank Sorcerer Artifact", chance: "1.2%", color: "text-amber-400 border-amber-500/30" },
          { name: "Ring of Spacetime Distortion", quantity: "1x Unit", rarity: "S-Rank Accessory", chance: "3.0%", color: "text-fuchsia-400 border-fuchsia-500/30" },
          { name: "Mage Core Divine Extract", quantity: "3x Units", rarity: "S-Rank Core Catalyst", chance: "100%", color: "text-cyan-400 border-cyan-500/30" },
        ],
        bossImage: kargalganBossImg
      };
    }

    // Default to Igris
    return {
      title: "Commander Igris",
      subtitle: "The Crimson Sovereign loyal vanguard",
      threatTier: "S-Rank Sovereign Knight",
      classSpec: "Shadow Lord Knight Supreme / Vanguard",
      manaDensity: "8,900 QM units",
      physMultiplier: "x4.5 Knightly Scale",
      description: "The legendary, silent blood-red armored commander who has guarded the Sovereign Throne room for centuries. Possesses high physical sword mastery, infinite martial discipline, and ultra-high mobility combat speed counters.",
      attribute: "Infinite Crimson Battle Tenacity",
      stats: {
        threat: 89,
        speed: 94,
        defense: 88,
        magic: 50,
        vulnerabilities: "Lightning Magic (125%), Disrupt Slashes",
      },
      phases: [
        { phase: "Phase 1 (100% - 60% HP)", title: "Throne Guardian sword Dance", desc: "Igris attacks with precise Crimson Slashes. Vanguard must parry or dodge to avoid stacking physical vulnerability." },
        { phase: "Phase 2 (60% - 30% HP)", title: "Dominion Spearman Sweep", desc: "Launches his greatsword into the ground and attacks with multiple crimson energy spears. Keep Aegis Shields active." },
        { phase: "Phase 3 (< 30% HP)", title: "Monarch Sovereign Desperation", desc: "Enters a bloodrage. Attacks ignore normal defenses. The party must use Extract Shadow to stun him before every slash." },
      ],
      abilities: [
        { name: "Crimson Slash Cascade", type: "Heavy Arcane Steel", cooldown: "9s", effect: "Performs an arc slash across all combatants, dealing physical vulnerability pierce." },
        { name: "Sword Toss Tombstone", type: "Impact Spear Throw", cooldown: "16s", effect: "Hurls massive blade onto target member, removing 20% health capacity." },
        { name: "Ruler's Dominant Pull", type: "Psychic Gravity Pull", cooldown: "30s", effect: "Drags all hunters near, casting shockwaves that bypass shields if caught undefended." },
      ],
      vulnerabilitiesList: [
        { type: "Lightning Magic / Charge Spark", rating: "HIGH WEAKNESS (+25%)", detail: "Electrical strikes trigger resonance, stalling Igris's active attack speed by 15%." },
        { type: "Disruptive Counter Striking", rating: "STUN WINDOW (+1.5s Duration)", detail: "Perfect counter timing during casting blocks his attack, locking him in a stagger state." },
        { type: "Sovereign Breached Criticals", rating: "ARMOR SUNDERING", detail: "When active armor shield drops to 0, takes 150% more critical damage for 8 seconds." },
      ],
      loot: [
        { name: "Crimson Great Greatsword", quantity: "1x Unit", rarity: "S-Rank Vanguard Weapon", chance: "1.5%", color: "text-rose-400 border-rose-500/30" },
        { name: "Sovereign Commander's Red Helm", quantity: "1x Unit", rarity: "S-Rank Heavy Helm", chance: "5.0%", color: "text-indigo-400 border-indigo-500/30" },
        { name: "High-Grade Knight Mana Core", quantity: "1x Unit", rarity: "S-Rank Core Catalyst", chance: "100%", color: "text-cyan-400 border-cyan-500/30" },
      ],
      bossImage: igrisBossImg
    };
  };

  const details = getBossDetails();

  const playSynthesizerRollChime = (rarity: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const playTone = (freq: number, start: number, duration: number, type: OscillatorType, gainVal = 0.08) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(gainVal, start);
        gainNode.gain.exponentialRampToValueAtTime(0.005, start + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      if (rarity.includes("Weapon")) {
        // Legendary drop chime (High arpeggio major triad)
        playTone(523.25, now, 0.2, "sine"); // C5
        playTone(659.25, now + 0.1, 0.2, "sine"); // E5
        playTone(783.99, now + 0.2, 0.2, "sine"); // G5
        playTone(1046.50, now + 0.35, 0.6, "triangle", 0.1); // C6 S-RANK BLAST!
      } else {
        // Standard materials chime
        playTone(261.63, now, 0.15, "triangle"); // C4
        playTone(392.00, now + 0.08, 0.35, "sine"); // G4
      }
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  };

  const simulateLootRoll = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationResult(null);

    // Roll after simulated decryption spin (1200ms)
    setTimeout(() => {
      const rand = Math.random() * 100;
      let selectedItem = details.loot[details.loot.length - 1]; // Fallback S-Grade Core Catalyst

      // If random roll matches rarer drop chances
      if (rand < parseFloat(details.loot[0].chance)) {
        selectedItem = details.loot[0]; // Greatsword / Weapon
      } else if (rand < parseFloat(details.loot[0].chance) + parseFloat(details.loot[1].chance)) {
        selectedItem = details.loot[1]; // Helm / Accessory
      }

      setSimulationResult(selectedItem);
      setIsSimulating(false);
      playSynthesizerRollChime(selectedItem.rarity);
    }, 1200);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] p-6 lg:p-8 space-y-6 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Hologram Core Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 border-b border-slate-800/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-[8px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest animate-pulse">
            <Sparkles className="w-3 h-3 animate-spin text-cyan-400" />
            INTELLIGENCE DECRYPTER: ONLINE
          </div>
          <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-[0.18em] italic mt-1.5 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            {details.title} Physiology Record
          </h3>
          <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5 tracking-wider">{details.subtitle}</p>
        </div>

        {/* Boss State Check Indicator */}
        <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-850 flex items-center gap-2.5 font-mono">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <div className="text-[9px] uppercase font-black text-rose-450 text-right">
            THREAT: <span className="text-white font-extrabold">{details.threatTier}</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Selector */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-850/80 relative z-10">
        {(["physiology", "abilities", "vulnerabilities", "loot"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`py-2 px-1 rounded-xl text-[8px] sm:text-[9.5px] font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === tab
                ? "bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic Sub-tab Panel Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.18 }}
          className="relative z-10 min-h-[220px]"
        >
          {/* TAB 1: PHYSIOLOGY */}
          {activeSubTab === "physiology" && (
            <div className="space-y-6">
              {/* Lore & Image Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 font-mono text-[10px] leading-relaxed text-slate-300">
                  <span className="text-indigo-400 font-black block mb-1.5 uppercase text-[9px] tracking-widest">&bull; HISTORIC BEAST COMPENDIUM LORE</span>
                  {details.description}
                </div>
                {details.bossImage && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-850 h-32 md:h-full group">
                    <div className="absolute top-2 left-2 z-20 bg-black/60 backdrop-blur-md border border-slate-800 px-2 py-0.5 rounded text-[8px] font-mono text-cyan-400 tracking-widest uppercase">
                      Tactical Visual Feed // Live
                    </div>
                    <img 
                      src={details.bossImage} 
                      alt={details.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Statistical Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Visual Radar Metrics */}
                <div className="bg-slate-950/40 p-4 rounded-3xl border border-slate-850 space-y-3">
                  <div className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest">&bull; SPECTRAL RATING METERS</div>
                  
                  {/* Threat Rating Multiplier */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[8px] uppercase tracking-wide text-rose-400">
                      <span>Destruction Threat Coeff</span>
                      <span className="font-bold">{details.stats.threat}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${details.stats.threat}%` }} />
                    </div>
                  </div>

                  {/* Agility Movement Speed */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[8px] uppercase tracking-wide text-cyan-400 font-bold">
                      <span>Physical Agility Speed</span>
                      <span>{details.stats.speed}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${details.stats.speed}%` }} />
                    </div>
                  </div>

                  {/* Def Armor Toughness */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[8px] uppercase tracking-wide text-amber-400">
                      <span>Aegis Armor Hardness</span>
                      <span className="font-bold">{details.stats.defense}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${details.stats.defense}%` }} />
                    </div>
                  </div>

                  {/* Mana magic density */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[8px] uppercase tracking-wide text-indigo-400 font-bold">
                      <span>Eldritch Magic Power</span>
                      <span>{details.stats.magic}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${details.stats.magic}%` }} />
                    </div>
                  </div>
                </div>

                {/* Sub Attributes and parameters */}
                <div className="bg-slate-950/40 p-4 rounded-3xl border border-slate-850 space-y-3 font-mono text-[9px] uppercase">
                  <div className="text-[8.5px] font-black text-slate-500 tracking-widest">&bull; MAGICAL ATTUNEMENT DATA</div>
                  
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Main Attribute:</span>
                    <span className="text-indigo-400 font-extrabold text-right">{details.attribute}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Sovereign Class:</span>
                    <span className="text-white font-bold">{details.classSpec}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Mana Density:</span>
                    <span className="text-cyan-400 font-bold">{details.manaDensity}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Physiology Scale:</span>
                    <span className="text-amber-500 font-bold">{details.physMultiplier}</span>
                  </div>
                </div>
              </div>

              {/* Threat Phase Stages Description */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-black text-indigo-400 block uppercase tracking-widest">&bull; THREAT LEVEL ENCOUNTER PHASES</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {details.phases.map((stg, index) => {
                    const hpPercent = index === 0 ? "HP > 60%" : index === 1 ? "40% - 60%" : "HP < 35%";
                    return (
                      <div key={index} className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between gap-1.5">
                        <div>
                          <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-1 mb-1.5 font-mono text-[8px] uppercase">
                            <span className="text-indigo-400 font-black">{stg.phase}</span>
                            <span className="text-rose-500 bg-rose-950/30 px-1 rounded font-bold">{hpPercent}</span>
                          </div>
                          <h4 className="text-[10px] font-black text-slate-200 uppercase font-mono tracking-tight">{stg.title}</h4>
                          <p className="text-[9px] text-slate-400 mt-1 leading-normal font-sans font-medium">{stg.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE ABILITIES */}
          {activeSubTab === "abilities" && (
            <div className="space-y-3 font-mono">
              <span className="text-[9px] font-black text-slate-500 block uppercase tracking-widest">&bull; BOSS ABILITY SKILL DECK TIMELINE</span>
              <div className="grid grid-cols-1 gap-3">
                {details.abilities.map((ability, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-indigo-500/20 flex items-center justify-center font-bold text-xs font-mono text-cyan-400 select-none">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-white uppercase">{ability.name}</h4>
                        <p className="text-[9px] text-slate-400 leading-normal mt-0.5 uppercase tracking-wide font-medium">{ability.effect}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-[8px] sm:text-[9.5px]">
                      <span className="px-2 py-1 bg-slate-900 rounded border border-slate-850 uppercase text-slate-500 font-bold">TYPE: <span className="text-slate-300 font-black">{ability.type}</span></span>
                      <span className="px-2 py-1 bg-indigo-950/30 rounded border border-indigo-900/30 text-indigo-400 font-bold">CD: {ability.cooldown}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VULNERABILITIES */}
          {activeSubTab === "vulnerabilities" && (
            <div className="space-y-3 font-mono">
              <span className="text-[9px] font-black text-slate-500 block uppercase tracking-widest">&bull; TACTICAL EXPLOIT VULNERABILITIES</span>
              <div className="grid grid-cols-1 gap-3">
                {details.vulnerabilitiesList.map((vuln, idx) => (
                  <div key={idx} className="bg-slate-950/75 p-4 rounded-2xl border border-slate-850 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <h4 className="text-[11px] font-black text-indigo-400 uppercase">{vuln.type}</h4>
                      <p className="text-[9px] text-slate-400 leading-relaxed mt-0.5 font-medium">{vuln.detail}</p>
                    </div>
                    <span className="px-3 py-1 bg-rose-950/30 border border-rose-900/30 rounded text-[8px] font-black uppercase text-rose-400 shrink-0 text-center">
                      {vuln.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LOOT TABLE DECRYPTOR (INTERACTIVE SIMULATOR) */}
          {activeSubTab === "loot" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Loot Tables List */}
              <div className="lg:col-span-7 space-y-3 font-mono">
                <span className="text-[9px] font-black text-slate-500 block uppercase tracking-widest">&bull; GUARANTEED & PROBABLE SOVEREIGN DROPS</span>
                <div className="space-y-2.5">
                  {details.loot.map((item, idx) => (
                    <div key={idx} className={`bg-slate-950/80 border p-3.5 rounded-2xl flex justify-between items-center gap-3 ${item.color}`}>
                      <div>
                        <h4 className="text-[11px] font-black uppercase">{item.name}</h4>
                        <span className="text-[7.5px] uppercase tracking-wider text-slate-500">RARITY: {item.rarity}</span>
                      </div>
                      <div className="text-right text-[8.5px] shrink-0">
                        <div className="font-extrabold uppercase">CHANCE: {item.chance}</div>
                        <div className="text-slate-550 mt-0.5">{item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decryptor Simulator Column */}
              <div className="lg:col-span-5 bg-slate-950 p-5 rounded-3xl border border-slate-850 flex flex-col justify-between items-center gap-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-550/5 via-transparent to-transparent pointer-events-none" />
                <div className="space-y-1 relative z-10">
                  <h4 className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-[0.25em] animate-pulse">MONARCH DECRYPTOR CORE</h4>
                  <p className="text-[8px] font-mono text-slate-500 uppercase">Simulate rolling loot against database ratios (No actual cost)</p>
                </div>

                {/* Display Decryption Screen */}
                <div className="w-full flex-1 min-h-[120px] flex items-center justify-center p-4 bg-slate-900 border border-slate-850 rounded-2xl relative">
                  {isSimulating ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-cyan-500 border-t-transparent animate-spin" />
                      <span className="text-[8.5px] font-mono font-black text-cyan-400 tracking-widest animate-pulse uppercase">DECRYPTING QUANTUM DATA...</span>
                    </div>
                  ) : simulationResult ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center space-y-1.5 p-3 rounded-xl max-w-full"
                    >
                      <Trophy className="w-8 h-8 text-amber-400 mx-auto animate-bounce drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
                      <span className="text-[7.5px] font-mono font-black border border-slate-800 px-2 py-0.5 rounded-full text-slate-400 tracking-widest uppercase">
                        {simulationResult.rarity}
                      </span>
                      <h4 className="text-[10px] font-black text-white uppercase truncate max-w-[160px]" title={simulationResult.name}>
                        {simulationResult.name}
                      </h4>
                      <p className="text-[8px] font-mono text-emerald-400 font-extrabold uppercase">Decryption complete! (Simulated Chance: {simulationResult.chance})</p>
                    </motion.div>
                  ) : (
                    <div className="text-center font-mono space-y-2">
                      <Target className="w-8 h-8 text-indigo-500/50 mx-auto" />
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest">Awaiting Command Link</div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={simulateLootRoll}
                  disabled={isSimulating}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer disabled:opacity-40"
                >
                  {isSimulating ? "DECRYPTING..." : "CALIBRATE DROPS"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function PartyPage({ playerName, onBack, playSelectSound }: PartyPageProps) {
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"explorer" | "active" | "communal" | "stats">("explorer");

  const [joiningLobbyId, setJoiningLobbyId] = useState<string | null>(null);
  const [currentLobbyId, setCurrentLobbyId] = useState<string | null>(null);
  const [currentLobby, setCurrentLobby] = useState<any>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLobbyData, setNewLobbyData] = useState({ target: "S-Rank Shadow Monarch Rift", maxMembers: 4, minLevel: 10 });

  const [chatInput, setChatInput] = useState("");
  const [forumInput, setForumInput] = useState("");
  const [selectedClass, setSelectedClass] = useState("Assassin");
  const [selectedGuild, setSelectedGuild] = useState("Sovereign Clan");

  // Local user profile state synced from Firestore leaderboard/playerName
  const [playerProfileData, setPlayerProfileData] = useState<any>(null);

  // Sync profiles of all members inside current active lobby in real-time
  const [memberProfiles, setMemberProfiles] = useState<{ [key: string]: any }>({});
  useEffect(() => {
    if (!currentLobby?.members || currentLobby.members.length === 0) {
      setMemberProfiles({});
      return;
    }
    const unsubscribes = currentLobby.members.map((member: string) => {
      const athleteRef = doc(db, "leaderboard", member);
      return onSnapshot(athleteRef, (snap) => {
        if (snap.exists()) {
          setMemberProfiles(prev => ({
            ...prev,
            [member]: snap.data()
          }));
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, `leaderboard/${member}`);
      });
    });
    return () => {
      unsubscribes.forEach((unsub: any) => unsub());
    };
  }, [currentLobby?.members]);

  // Voice memo recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const startVoiceRecording = async () => {
    try {
      if (typeof playSelectSound === "function") playSelectSound();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(track => track.stop());
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          
          if (!currentLobbyId) return;
          const lobbyRef = doc(db, "party_lobbies", currentLobbyId);
          await updateDoc(lobbyRef, {
            messages: arrayUnion({
              sender: playerName,
              text: "🎙️ Faction voice memo frequency synced",
              timestamp: Date.now(),
              audioUrl: base64Audio
            })
          });
          triggerLocalAlert("Voice dynamic communication successfully transmitted!");
        };
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.warn("Microphone access denied or error:", err);
      triggerLocalAlert("Microphone access blocked! Ensure permissions are granted.", "error");
    }
  };

  const stopVoiceRecording = () => {
    if (typeof playSelectSound === "function") playSelectSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  // Camera profile capture states
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const toggleCameraSetup = async () => {
    if (cameraStreamActive) {
      deactivateCamera();
      return;
    }
    if (typeof playSelectSound === "function") playSelectSound();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 } });
      streamRef.current = stream;
      setCameraStreamActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 200);
    } catch (err) {
      console.warn("Camera hardware access denied:", err);
      triggerLocalAlert("optical interface permission denied.", "error");
    }
  };

  const deactivateCamera = () => {
    if (typeof playSelectSound === "function") playSelectSound();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraStreamActive(false);
  };

  const capturePhotoFrame = async () => {
    if (videoRef.current) {
      if (typeof playSelectSound === "function") playSelectSound();
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        const minDim = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - minDim) / 2;
        const sy = (video.videoHeight - minDim) / 2;
        
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        
        try {
          const leaderRef = doc(db, "leaderboard", playerName);
          await updateDoc(leaderRef, { customAvatar: dataUrl, updatedAt: new Date().toISOString() });
          triggerLocalAlert("biometric avatar synced successfully.");
        } catch (e) {
          console.warn("Failed to update avatar photo in leaderboard:", e);
        }
      }
      deactivateCamera();
    }
  };

  // Victory chime single trigger
  const [victoryChimePlayed, setVictoryChimePlayed] = useState<string | null>(null);

  const playClearSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      // Synth Helper to play dynamic notes
      const playFreq = (freq: number, start: number, duration: number, type: OscillatorType, gainVal: number = 0.12) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(gainVal, start);
        gainNode.gain.exponentialRampToValueAtTime(0.005, start + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      // 1. Sub Bass Drop rumble (simulates spatial breach collapsing)
      const subOsc = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 1.2);
      subGain.gain.setValueAtTime(0.2, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      subOsc.connect(subGain);
      subGain.connect(audioCtx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.2);

      // 2. High Arpeggio Chime Sweep (major key alignment scale C -> E -> G -> B -> C -> E -> G)
      const chimes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 987.77, 1046.50];
      chimes.forEach((freq, idx) => {
        playFreq(freq, now + idx * 0.08, 0.9, "sine", 0.08);
        playFreq(freq, now + idx * 0.08, 0.45, "triangle", 0.03);
      });

      // 3. Perfect Major Chord Blast for impact (C4, E4, G4, C5, E5)
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25];
      chord.forEach((freq) => {
        playFreq(freq, now + 0.35, 1.5, "triangle", 0.06);
      });

    } catch (e) {
      console.warn("Audio Context blocked or failed:", e);
    }
  };

  useEffect(() => {
    if (currentLobby && currentLobby.status === "Raid Cleared" && currentLobbyId && victoryChimePlayed !== currentLobbyId) {
      setVictoryChimePlayed(currentLobbyId);
      playClearSound();
    }
  }, [currentLobby?.status, currentLobbyId, victoryChimePlayed]);

  // Cooldown objects for raid actions
  const [cooldowns, setCooldowns] = useState<{ [key: string]: number }>({
    strike: 0,
    shield: 0,
    heal: 0,
    shadows: 0
  });

  const [systemAlert, setSystemAlert] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Floating notifications timeout helper
  const triggerLocalAlert = (message: string, type: "success" | "error" | "warning" = "success") => {
    setSystemAlert({ message, type });
    setTimeout(() => {
      setSystemAlert(null);
    }, 4000); // Autoclear in exactly 4s as requested
  };

  // Sync core player profile data
  useEffect(() => {
    if (!playerName) return;
    const playerRef = doc(db, "leaderboard", playerName);
    const unsub = onSnapshot(playerRef, (snap) => {
      if (snap.exists()) {
        setPlayerProfileData(snap.data());
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `leaderboard/${playerName}`);
    });
    return () => unsub();
  }, [playerName]);

  // Sync tactical chat end scroll
  useEffect(() => {
    if (activeTab === "active" && currentLobby?.messages) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentLobby?.messages, activeTab]);

  // 1. Live Sync Party Lobbies
  useEffect(() => {
    const q = query(collection(db, "party_lobbies"), orderBy("createdAt", "desc"), limit(30));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data() }));
      setLobbies(list);

      // Check if user is actively in any lobby in the list
      let inLobby = null;
      for (const lobby of list) {
        if (lobby.members && lobby.members.includes(playerName)) {
          inLobby = lobby;
          break;
        }
      }
      
      if (inLobby) {
        setCurrentLobbyId(inLobby.id);
        setCurrentLobby(inLobby);
      } else {
        setCurrentLobbyId(null);
        setCurrentLobby(null);
        if (activeTab === "active") setActiveTab("explorer");
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "party_lobbies");
    });
    return () => unsub();
  }, [playerName, activeTab]);

  // 2. Live Sync Hunter Forums (Intel Communal Network)
  useEffect(() => {
    const q = query(collection(db, "hunter_forum"), orderBy("timestamp", "desc"), limit(40));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: ForumPost[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ForumPost);
      });
      setForumPosts(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "hunter_forum");
    });
    return () => unsub();
  }, []);

  // Cooldown tick generator
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns(prev => {
        const next = { ...prev };
        let updated = false;
        Object.keys(next).forEach(k => {
          if (next[k] > 0) {
            next[k] = Math.max(0, next[k] - 0.5);
            updated = true;
          }
        });
        return updated ? next : prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 3. Raid Authority Host Loop: Synchronizes boss attacks, ultimates, & timers
  useEffect(() => {
    if (!currentLobby || currentLobby.status !== "Raid Active" || currentLobby.hostName !== playerName || !currentLobbyId) return;

    const gameClock = setInterval(async () => {
      try {
        const lobbyRef = doc(db, "party_lobbies", currentLobbyId);
        const snap = await getDoc(lobbyRef);
        if (!snap.exists()) return;
        
        const data = snap.data();
        if (data.status !== "Raid Active" || !data.boss) {
          clearInterval(gameClock);
          return;
        }

        const bossState = { ...data.boss };

        // 1. Tick battle timer countdown
        bossState.timeRemaining = Math.max(0, bossState.timeRemaining - 1);

        // 2. Tick Boss skill cast
        if (bossState.castingTimer && bossState.castingTimer > 0) {
          bossState.castingTimer -= 1;
          
          if (bossState.castingTimer === 0) {
            // Ultimate cast completes!
            const logName = bossState.castingSkillName || "Cataclysm Shockwave";
            const currentLogs = [...(bossState.actionLogs || [])];
            
            // Check if team protection shield absorbs it
            if (bossState.teamShield > 600) {
              bossState.teamShield = Math.max(0, bossState.teamShield - 1000);
              currentLogs.push(`[BARRIER STRONGHOLD] Team shield absorbed the brunt of ${logName}!`);
            } else {
              // Liquidate HP across all members
              const nextHps = { ...bossState.playerHps };
              let someonePerished = false;
              
              Object.keys(nextHps).forEach(key => {
                nextHps[key] = Math.max(0, nextHps[key] - 45);
                if (nextHps[key] <= 0) {
                  currentLogs.push(`[DEATH RECKONING] Member [${key}] HP critically depleted!`);
                  someonePerished = true;
                }
              });

              bossState.playerHps = nextHps;
              bossState.teamShield = 0;

              if (someonePerished) {
                // Whole team fails instantly if any member perishes!
                await updateDoc(lobbyRef, {
                  status: "Defeated",
                  "boss.actionLogs": arrayUnion(...currentLogs, `[DECIMATION ENGINE] Raid collapsed. Individual hunter casualty triggered squad elimination!`),
                  messages: arrayUnion({
                    sender: "System",
                    text: `☠️ S-RANK DISASTER: Hunter casualty occurred. The Monarch has prevailed. Penalties executing!`,
                    timestamp: Date.now()
                  })
                });
                clearInterval(gameClock);
                return;
              }
            }
            bossState.castingSkillName = "";
            bossState.castingTimer = 0;
            bossState.actionLogs = currentLogs.slice(-12);
          }
        } else {
          // Normal loop: Chance of initiating an ultimate or regular swiping attacks
          const eventChance = Math.random();
          const currentLogs = [...(bossState.actionLogs || [])];
          
          if (eventChance < 0.22) {
            // Begin boss ultimate casting
            const spells = [
              { name: "Sovereign's Purgatory", casts: 5 },
              { name: "Infinite Void Gaze", casts: 4 },
              { name: "Blood-Sword Cleave", casts: 5 }
            ];
            const activeSpell = spells[Math.floor(Math.random() * spells.length)];
            bossState.castingSkillName = activeSpell.name;
            bossState.castingTimer = activeSpell.casts;
            currentLogs.push(`[WARNING] Boss ${bossState.name} is preparing ${activeSpell.name} (Releases in ${activeSpell.casts}s)! RAISE DEFENSES!`);
          } else if (eventChance < 0.45) {
            // Heavy normal claw strike
            const damage = Math.floor(Math.random() * 200) + 120;
            if (bossState.teamShield > damage) {
              bossState.teamShield -= damage;
              currentLogs.push(`[BOSS IMPACT] ${bossState.name} swiped the vanguard. Shared shield absorbed ${damage} guard.`);
            } else {
              const surplus = damage - bossState.teamShield;
              bossState.teamShield = 0;
              
              const hps = { ...bossState.playerHps };
              const target = Object.keys(hps)[Math.floor(Math.random() * Object.keys(hps).length)];
              if (target) {
                hps[target] = Math.max(0, hps[target] - Math.floor(surplus / 4));
                bossState.playerHps = hps;
                currentLogs.push(`[CAUGHT IN SHOCKWAVE] ${bossState.name} punctured guards! Teammate ${target} sustained -${Math.floor(surplus/4)} HP.`);
              }
            }
          }
          bossState.actionLogs = currentLogs.slice(-12);
        }

        // Timeout Failure / Study Success condition
        if (bossState.timeRemaining <= 0) {
          if (bossState.isStudySession) {
            await updateDoc(lobbyRef, {
              status: "Raid Cleared",
              "boss.actionLogs": arrayUnion(...bossState.actionLogs, `[⏰ ALARM] Timed study session completed! Focus verified.`),
              messages: arrayUnion({
                sender: "System",
                text: `🏆 STUDY SESSION CONQUERED: Timer completed successfully! Sign-off materialized! XP and Mana distributed based on focus.`,
                timestamp: Date.now()
              })
            });
          } else {
            await updateDoc(lobbyRef, {
              status: "Defeated",
              "boss.actionLogs": arrayUnion(...bossState.actionLogs, `[OVERTIME TERMINATION] Dimensional gate collapsed. Chrono buffer fully exhausted!`),
              messages: arrayUnion({
                sender: "System",
                text: `☠️ RAID EXPIRED: Chrono-stabilizers collapsed. Severe failure penalties active!`,
                timestamp: Date.now()
              })
            });
          }
          clearInterval(gameClock);
          return;
        }

        // Update central Firestore lobby database
        await updateDoc(lobbyRef, {
          boss: bossState
        });

      } catch (err) {
        console.warn("Raid loop error:", err);
      }
    }, 1000);

    return () => clearInterval(gameClock);
  }, [currentLobbyId, currentLobby?.status, currentLobby?.hostName, playerName]);

  // 4. Automated Team-Wide High-Stakes Penalty Engine (-5 Mana/Gold) & Victory Reward (+10 Mana/Gold, +50 EXP)
  const [processedLobbyId, setProcessedLobbyId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentLobby || !playerName || !playerProfileData) return;
    
    const isDefeated = currentLobby.status === "Defeated" || currentLobby.status?.includes("Defeated");
    const isCleared = currentLobby.status === "Raid Cleared";

    if ((isDefeated || isCleared) && processedLobbyId !== currentLobbyId) {
      setProcessedLobbyId(currentLobbyId);

      const userGold = Number(playerProfileData.gold || 0);
      const userExp = Number(playerProfileData.exp || 0);

      const leaderRef = doc(db, "leaderboard", playerName);

      if (isDefeated) {
        const penalizedGold = Math.max(0, userGold - 5);
        updateDoc(leaderRef, { gold: penalizedGold })
          .then(() => {
            triggerLocalAlert("☠️ PENALTY EXACTED: Core mana reserves reduced by -5 Sovereign Gold!", "error");
          })
          .catch(e => console.warn("Failed to apply failure penalty:", e));
      } else if (isCleared) {
        // Evaluate dynamic contributions across normal or study boss battles
        const myContribs = currentLobby.contributions?.[playerName] || { damage: 0, heals: 0, interrupts: 0 };
        const engagementScore = myContribs.damage + myContribs.heals + myContribs.interrupts;

        // Base caps
        const maxGold = 5; // Capped to 5 max mana per task/bonus as requested
        const maxExp = 100;

        let addedGold = currentLobby?.boss?.isStudySession ? Math.min(maxGold, 5 + Math.floor(engagementScore / 300)) : maxGold;
        let addedExp = currentLobby?.boss?.isStudySession ? Math.min(maxExp, 40 + Math.floor(engagementScore / 40)) : maxExp;

        let alertMsg = "";

        if (currentLobby?.boss?.isStudySession) {
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const now = audioCtx.currentTime;
            const playTone = (freq: number, start: number, duration: number, type: OscillatorType) => {
              const osc = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              osc.type = type;
              osc.frequency.setValueAtTime(freq, start);
              gainNode.gain.setValueAtTime(0.1, start);
              gainNode.gain.exponentialRampToValueAtTime(0.005, start + duration);
              osc.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              osc.start(start);
              osc.stop(start + duration);
            };
            // 30 minute alarm! (Simulated by 3 ringing notes)
            playTone(880, now, 0.4, "sine"); // A5
            playTone(880, now + 0.5, 0.4, "sine");
            playTone(1046.5, now + 1.0, 1.0, "triangle"); // C6
          } catch (e) {
            console.warn("Audio Context blocked:", e);
          }

          if (engagementScore === 0) {
            triggerLocalAlert("⚠️ STUDY CHECK-IN MISSED: You were inactive during the session. Minimal rewards distributed.", "error");
            addedGold = 1;
            addedExp = 5;
            alertMsg = "";
          } else {
            alertMsg = `🏆 ATTENDANCE VERIFIED: +${addedGold} Mana Offering, +${addedExp} EXP distributed based on your focus engagement!`;
          }
        } else {
            // Apply engagement scaling for normal bosses too, up to max
            if (engagementScore === 0) {
              addedGold = 1;
              addedExp = 5;
              alertMsg = `🏆 RAID SURVIVED: Minimal contribution detected. +${addedGold} Gold, +${addedExp} EXP.`;
            } else {
              addedGold = Math.min(maxGold, 10 + Math.floor(engagementScore / 500));
              addedExp = Math.min(maxExp, 30 + Math.floor(engagementScore / 100));
              alertMsg = `🏆 RAID CLEARED: S-Rank Loot distributed! +${addedGold} Sovereign Gold, +${addedExp} EXP!`;
            }
        }

        const rewardedGold = userGold + addedGold;
        const rewardedExp = userExp + addedExp;

        updateDoc(leaderRef, { 
          gold: rewardedGold,
          exp: rewardedExp
        })
          .then(() => {
            if (alertMsg) {
              triggerLocalAlert(alertMsg, "success");
            }
          })
          .catch(e => console.warn("Failed to apply victory reward:", e));
      }
    }
  }, [currentLobby?.status, currentLobbyId, playerName, playerProfileData, processedLobbyId]);


  // Actions - Core Lobby Interactions
  const handleCreateLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (typeof playSelectSound === "function") playSelectSound();
      const docRef = await addDoc(collection(db, "party_lobbies"), {
        hostName: playerName,
        targetNode: newLobbyData.target,
        minLevel: newLobbyData.minLevel,
        maxMembers: newLobbyData.maxMembers,
        status: "Forming",
        members: [playerName],
        messages: [{
          sender: "System",
          text: `Lobby initialized. Hunter coordinates established for S-Rank Raid.`,
          timestamp: Date.now()
        }],
        createdAt: serverTimestamp()
      });
      setShowCreateModal(false);
      setCurrentLobbyId(docRef.id);
      setActiveTab("active");
      triggerLocalAlert("Lobby Frequency stabilized! Awaiting reliable assault class hunters.");
    } catch (err) {
      console.error("Error creating lobby", err);
    }
  };

  const handleJoinLobby = async (lobbyId: string) => {
    try { 
      if (typeof playSelectSound === "function") playSelectSound(); 
      setJoiningLobbyId(lobbyId);
      
      const lobbyRef = doc(db, "party_lobbies", lobbyId);
      const snap = await getDoc(lobbyRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.members && data.members.length >= data.maxMembers) {
          triggerLocalAlert("Channel frequency is saturated! Full party capacity.", "warning");
          setJoiningLobbyId(null);
          return;
        }
        await updateDoc(lobbyRef, {
          members: arrayUnion(playerName),
          messages: arrayUnion({
            sender: "System",
            text: `Hunter ${playerName} has synchronized with the strike squad.`,
            timestamp: Date.now()
          })
        });
        setCurrentLobbyId(lobbyId);
        setActiveTab("active");
        triggerLocalAlert(`Successfully locked onto LFG signal! Welcome to the squad.`);
      }
    } catch (e) {
      console.error("Error joining lobby", e);
    } finally {
      setJoiningLobbyId(null);
    }
  };

  const handleLeaveParty = async () => {
    if (!currentLobbyId) return;
    try {
      if (typeof playSelectSound === "function") playSelectSound();
      const lobbyRef = doc(db, "party_lobbies", currentLobbyId);
      
      await updateDoc(lobbyRef, {
        members: arrayRemove(playerName),
        messages: arrayUnion({
          sender: "System",
          text: `Teammate ${playerName} decoupled their quantum interface. Link lost.`,
          timestamp: Date.now()
        })
      });
      
      setCurrentLobbyId(null);
      setCurrentLobby(null);
      setActiveTab("explorer");
      triggerLocalAlert("Linked tether successfully severed from party.", "warning");
    } catch (e) {
      console.error("Error leaving party", e);
    }
  };

  const handleResetLobby = async () => {
    if (!currentLobbyId || !currentLobby) return;
    try {
      if (typeof playSelectSound === "function") playSelectSound();
      const lobbyRef = doc(db, "party_lobbies", currentLobbyId);
      await updateDoc(lobbyRef, {
        status: "Forming",
        boss: null,
        contributions: null,
        messages: arrayUnion({
          sender: "System",
          text: `🔗 Strike force coordinates rebooted. Rift status: RESET & READY.`,
          timestamp: Date.now()
        })
      });
      triggerLocalAlert("Portal coordinates successfully recalibrated for deployment!");
    } catch (e) {
      console.error("Error resetting lobby:", e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentLobbyId) return;
    
    try {
      const lobbyRef = doc(db, "party_lobbies", currentLobbyId);
      await updateDoc(lobbyRef, {
        messages: arrayUnion({
          sender: playerName,
          text: chatInput.trim(),
          timestamp: Date.now()
        })
      });
      setChatInput("");
    } catch(err) {
      console.error("Failed to send message", err);
    }
  };

  // Broadcast Forum Feed Post to Intel Communal Network
  const handlePostForumMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumInput.trim()) return;

    try {
      if (typeof playSelectSound === "function") playSelectSound();
      await addDoc(collection(db, "hunter_forum"), {
        sender: playerName,
        hunterClass: selectedClass,
        guild: selectedGuild,
        text: forumInput.trim(),
        timestamp: Date.now()
      });
      setForumInput("");
      triggerLocalAlert("Intel bulletin successfully compiled and broadcasted.");
    } catch (err) {
      console.error("Forum broadcasting failed:", err);
      triggerLocalAlert("Quantum transmitter jam! Try resubmitting in a moment.", "error");
    }
  };


  // COMMENCE BOSS DRIFT TRANSITION (Leader authorization)
  const handleCommenceRaid = async () => {
    if (!currentLobbyId || !currentLobby) return;
    try {
      if (typeof playSelectSound === "function") playSelectSound();
      const lobbyRef = doc(db, "party_lobbies", currentLobbyId);

      // S-Rank Monarch Boss Roster
      const bosses = [
        { 
          name: "Igris the Crimson Commander", 
          hp: 7500, 
          maxHp: 7500, 
          shield: 2000, 
          maxShield: 2000, 
          level: "S-Rank Gate Threat", 
          color: "border-rose-500/50 from-rose-950/45 to-slate-900/90", 
          glow: "shadow-rose-500/10",
          accentColor: "text-rose-400"
        },
        { 
          name: "Baruka - The Lord of Frost Elves", 
          hp: 9500, 
          maxHp: 9500, 
          shield: 2500, 
          maxShield: 2500, 
          level: "Abyssal Gate Threat", 
          color: "border-cyan-500/50 from-cyan-950/45 to-slate-900/90", 
          glow: "shadow-cyan-500/10",
          accentColor: "text-cyan-400"
        },
        { 
          name: "Warlord Kargalgan the Shadow Shaman", 
          hp: 12000, 
          maxHp: 12000, 
          shield: 3500, 
          maxShield: 3500, 
          level: "Calamity Gate Threat", 
          color: "border-fuchsia-500/50 from-fuchsia-950/45 to-slate-900/90", 
          glow: "shadow-fuchsia-500/10",
          accentColor: "text-fuchsia-400"
        }
      ];

      let selectedBoss = bosses[Math.floor(Math.random() * bosses.length)];
      let isStudySession = false;
      let sessionTime = 90;

      if (currentLobby.targetNode?.includes("Timed Study")) {
        isStudySession = true;
        let timeMins = 30;
        let bName = "Study Session Phantom";
        let color = "border-indigo-500/50 from-indigo-950/45 to-slate-900/90";
        let shadow = "shadow-indigo-500/10";
        if (currentLobby.targetNode.includes("30 min")) {
          timeMins = 30;
          bName = "Ancient Scholar's Ghost";
          color = "border-emerald-500/50 from-emerald-950/45 to-slate-900/90";
          shadow = "shadow-emerald-500/10";
        } else if (currentLobby.targetNode.includes("60 min")) {
          timeMins = 60;
          bName = "Archmage's Spectral Library";
          color = "border-purple-500/50 from-purple-950/45 to-slate-900/90";
          shadow = "shadow-purple-500/10";
        } else if (currentLobby.targetNode.includes("120 min")) {
          timeMins = 120;
          bName = "Oracle of the Infinite Void";
          color = "border-amber-500/50 from-amber-950/45 to-slate-900/90";
          shadow = "shadow-amber-500/10";
        }
        sessionTime = timeMins * 60;

        selectedBoss = {
          name: bName,
          hp: timeMins * 2000, 
          maxHp: timeMins * 2000,
          shield: timeMins * 500,
          maxShield: timeMins * 500,
          level: "Study Domain Manifestation",
          color,
          glow: shadow,
          accentColor: color.split("-")[1] ? `text-${color.split("-")[1]}-400` : "text-white"
        };
      }
      
      const playerHps: { [key: string]: number } = {};
      const initialContributions: { [key: string]: { damage: number, heals: number, interrupts: number } } = {};
      currentLobby.members.forEach((m: string) => {
        playerHps[m] = 100; // All starting at 100% vital capacity
        initialContributions[m] = { damage: 0, heals: 0, interrupts: 0 };
      });

      await updateDoc(lobbyRef, {
        status: "Raid Active",
        contributions: initialContributions,
        boss: {
          name: selectedBoss.name,
          hp: selectedBoss.hp,
          maxHp: selectedBoss.maxHp,
          shield: selectedBoss.shield,
          maxShield: selectedBoss.maxShield,
          level: selectedBoss.level,
          teamShield: 600, // Shared protection field
          timeRemaining: sessionTime, 
          isStudySession,
          actionLogs: [
            isStudySession ? `[STUDY CUBE ACTIVATED] Focus synchronization started for ${sessionTime/60} minutes.` : `[GATE OPENED] Assault group has passed the gate threshold!`,
            isStudySession ? `🎯 OBJECTIVE: Maintain focus, repel distractions, and defeat [${selectedBoss.name}].` : `🎯 DECREE: Defeat [${selectedBoss.name}] before health reserves or chrono buffers expire.`,
            isStudySession ? `⚠️ NOTE: Alarm will sound upon completion. All members must sign off!` : `⚠️ ALERT: Mutual support is critical - a single teammate's critical demise collapses the layout!`
          ],
          playerHps
        },
        messages: arrayUnion({
          sender: "System",
          text: `🚨 EMERGENCY DECREE: Dimensional rift breached! RAID BOSS COMPILING!`,
          timestamp: Date.now()
        })
      });

      triggerLocalAlert("Dimensional shift initiated! Fight with extreme coordination!");
    } catch (e) {
      console.error("Error setting up raid node:", e);
    }
  };

  // CORE INTERACTIVE GAMEPLAY COMMAND OPERATIONS (Can be taken by any party member in real-time)
  const handleRaidInteractiveAction = async (actionType: "strike" | "shield" | "heal" | "shadows" | "cheat") => {
    if (!currentLobby || !currentLobbyId || currentLobby.status !== "Raid Active" || !currentLobby.boss) return;

    // Check custom cooldown state locally
    if (cooldowns[actionType] > 0) {
      triggerLocalAlert("Action matrix recalibrating! Wait for visual cooldown to complete.", "warning");
      return;
    }

    try {
      if (typeof playSelectSound === "function") playSelectSound();
      const lobbyRef = doc(db, "party_lobbies", currentLobbyId);
      const hostSnap = await getDoc(lobbyRef);
      if (!hostSnap.exists()) return;
      const latestData = hostSnap.data();
      const activeBoss = { ...latestData.boss };

      const currentLogs = [...(activeBoss.actionLogs || [])];

      // Contribution tracking variables
      let damageDone = 0;
      let healsDone = 0;
      let interruptsDone = 0;

      // Play cooldown set
      let actionCooldown = 3;
      if (actionType === "strike") {
        actionCooldown = 2.5;
        // Calculated strike based on player's stats or level
        const baseDamage = Math.floor(Math.random() * 250) + 380;
        const playerLvl = playerProfileData?.level || 15;
        const finalDmg = baseDamage + (playerLvl * 8);
        damageDone = finalDmg;

        // Deduct shield guard first, then direct HP
        if (activeBoss.shield > 0) {
          const originalShield = activeBoss.shield;
          activeBoss.shield = Math.max(0, activeBoss.shield - finalDmg);
          const deficit = finalDmg - (originalShield - activeBoss.shield);
          currentLogs.push(`[STRIKE] ${playerName} executed Assault Blade Slash! Drained -${finalDmg} Boss Shield.`);
          
          if (deficit > 0 && activeBoss.shield === 0) {
            activeBoss.hp = Math.max(0, activeBoss.hp - deficit);
            currentLogs.push(`[DIRECT PENETRATION] Strike pierced remaining guards! Sustained -${deficit} critical vital DMG!`);
          }
        } else {
          activeBoss.hp = Math.max(0, activeBoss.hp - finalDmg);
          currentLogs.push(`[DIRECT CLEAVE] ${playerName} struck with full force! Inflicted -${finalDmg} HP on the Boss!`);
        }
      } 
      else if (actionType === "shield") {
        actionCooldown = 5;
        const strength = Math.floor(Math.random() * 200) + 400;
        activeBoss.teamShield = Math.min(3000, (activeBoss.teamShield || 0) + strength);
        currentLogs.push(`[SQUAD BUFF] ${playerName} infused magical shielding! Gained +${strength} shared shield reserves.`);
      } 
      else if (actionType === "heal") {
        actionCooldown = 7.5;
        healsDone = 1;
        const recoveryPercent = 15;
        const hps = { ...activeBoss.playerHps };
        
        Object.keys(hps).forEach(key => {
          hps[key] = Math.min(100, hps[key] + recoveryPercent);
        });
        
        activeBoss.playerHps = hps;
        currentLogs.push(`[MEDIC PROTOCOL] ${playerName} cast Ether Infusion! All squad member vital systems recovered by +${recoveryPercent}%.`);
      } 
      else if (actionType === "shadows") {
        actionCooldown = 11;
        // Require Level-based unlock or let anyone cast but boost damage for high-tier
        const summonPower = Math.floor(Math.random() * 500) + 700;
        damageDone = summonPower;
        
        // Interrupt active Boss casts!
        if (activeBoss.castingTimer && activeBoss.castingTimer > 0) {
          activeBoss.castingTimer = 0;
          activeBoss.castingSkillName = "";
          interruptsDone = 1;
          currentLogs.push(`[⚔️ INTERRUPT] ${playerName} extracted custom Shadow troops! STUNNED ${activeBoss.name} and broke their catastrophic ultimate sequence!`);
        } else {
          currentLogs.push(`[SOLDIER SYNERGY] ${playerName} released shadow legionaries! Unleashed -${summonPower} coordinate impact.`);
        }
        activeBoss.hp = Math.max(0, activeBoss.hp - summonPower);
      } 
      else if (actionType === "cheat") {
        // Forbidden hack action simulating immediate player error or cheating trace
        currentLogs.push(`[🚨 MALWARE INTRUSION] Integrity breach detected from ${playerName}'s coordinate array!`);
        currentLogs.push(`[SYSTEM FIREWALL] Anti-cheat grid executed immediate particle purge on the active squad!`);
        
        await updateDoc(lobbyRef, {
          status: "Defeated (Exposed By System Security Audit)",
          "boss.actionLogs": currentLogs,
          messages: arrayUnion({
            sender: "System",
            text: `⚠️ SEC_VIOLATION: Hunter ${playerName} tried invoking external exploits. Core files locked. Whole party liquidated!`,
            timestamp: Date.now()
          })
        });
        triggerLocalAlert("SYSTEM DETECTION GRID TRIGGERED: Severe cheating breach. Entire team liquidated immediately!", "error");
        return;
      }

      // Check Victory Condition
      if (activeBoss.hp <= 0) {
        const victoryUpdate: any = {
          status: "Raid Cleared",
          "boss.actionLogs": [...currentLogs, `[CRITICAL EXECUTION] Boss collapse confirmed. Gate clearance authorized!`],
          messages: arrayUnion({
            sender: "System",
            text: `🏆 GATE CONQUERED: Boss fell to coordinate strategic teamwork. Rewards materialized!`,
            timestamp: Date.now()
          })
        };
        if (damageDone > 0) {
          victoryUpdate[`contributions.${playerName}.damage`] = increment(damageDone);
        }
        if (healsDone > 0) {
          victoryUpdate[`contributions.${playerName}.heals`] = increment(healsDone);
        }
        if (interruptsDone > 0) {
          victoryUpdate[`contributions.${playerName}.interrupts`] = increment(interruptsDone);
        }
        await updateDoc(lobbyRef, victoryUpdate);
        triggerLocalAlert("VICTORY SECURED: S-Rank Rift collapsed under S-Rank force!", "success");
        return;
      }

      // Update cooldowns locally
      setCooldowns(prev => ({
        ...prev,
        [actionType]: actionCooldown
      }));

      // Update Firebase Database sync node with live action and increment statistics
      const updateData: any = {
        boss: {
          ...activeBoss,
          actionLogs: currentLogs.slice(-12)
        }
      };
      if (damageDone > 0) {
        updateData[`contributions.${playerName}.damage`] = increment(damageDone);
      }
      if (healsDone > 0) {
        updateData[`contributions.${playerName}.heals`] = increment(healsDone);
      }
      if (interruptsDone > 0) {
        updateData[`contributions.${playerName}.interrupts`] = increment(interruptsDone);
      }

      await updateDoc(lobbyRef, updateData);

    } catch (e) {
      console.error("Action transmission failed:", e);
    }
  };

  // Helper simulated user avatars for community postings
  const hunterAvatars: { [key: string]: string } = {
    GoGunHee: "👴",
    ChaHaeIn: "👱‍♀️",
    ChoiJongIn: "👓",
    BaekYoonHo: "🦁",
    ThomasAndre: "🕶️",
    WooJinChul: "👮‍♂️",
    YooJinHo: "👦"
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Dynamic Floating Notification alert - Auto Clears in 4s */}
      <AnimatePresence>
        {systemAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-lg shadow-2xl rounded-2xl border"
          >
            <div className={`p-4 rounded-2xl flex items-center gap-3 backdrop-blur-xl ${
              systemAlert.type === "success" 
                ? "bg-slate-900/90 border-emerald-500/40 text-emerald-400" 
                : systemAlert.type === "error"
                  ? "bg-slate-900/90 border-rose-500/40 text-rose-400"
                  : "bg-slate-900/90 border-amber-500/40 text-amber-400"
            }`}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce" />
              <div className="flex-1 text-xs font-mono font-black uppercase leading-tight tracking-wider">
                {systemAlert.message}
              </div>
              <button 
                onClick={() => setSystemAlert(null)}
                className="text-[10px] bg-slate-850 px-2 py-1 rounded hover:bg-slate-800 uppercase font-black font-mono tracking-widest cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary HUD Header */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-indigo-500/15 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { if (typeof playSelectSound === "function") playSelectSound(); onBack(); }}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer hover:border-indigo-500/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xs sm:text-sm font-[1000] text-white uppercase tracking-[0.25em] italic flex items-center gap-1.5">
              <span>S-RANK EXPEDITION LATTICE</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em] font-mono">Shared Nodes Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end font-mono">
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Active Hunter Signature</span>
            <span className="text-xs font-black text-indigo-400">{playerName}</span>
          </div>
          
          <button 
            onClick={toggleCameraSetup}
            title="Calibrate Biometric Avatar"
            className="w-10 h-10 rounded-2xl bg-slate-900 border border-indigo-500/25 hover:border-indigo-500/60 overflow-hidden flex items-center justify-center text-indigo-400 font-bold font-mono group relative cursor-pointer transition-all hover:scale-105 shrink-0"
          >
            {playerProfileData?.customAvatar ? (
              <img loading="lazy" src={playerProfileData.customAvatar} alt={playerName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-xs">{playerName.substring(0, 2).toUpperCase()}</span>
            )}
            <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </button>

          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 font-bold font-mono shrink-0">
            {playerProfileData?.level ? `L${playerProfileData.level}` : "10"}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        
        {/* TAB NAVIGATION SECTION */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text"
              placeholder="Filter coordinates, targets..." aria-label="Filter coordinates, targets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
            />
          </div>

          <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-800/80 w-full md:w-auto">
            {[
              { id: "explorer", label: "Dimensional Nodes", icon: Radio },
              { id: "active", label: "My Battle party", icon: Swords },
              { id: "communal", label: "communal frequency", icon: MessageSquare },
              { id: "stats", label: "Expedition log", icon: Trophy }
            ].map(tab => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => { if (typeof playSelectSound === "function") playSelectSound(); setActiveTab(tab.id as any); }}
                  className={`flex-1 md:flex-none px-4 sm:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSel ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/15" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE TABS DISPATCH */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: LOBBY LIST */}
          {activeTab === "explorer" && (
            <motion.div 
              key="explorer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Manual Expedition Boot Interface */}
              <button 
                onClick={() => { if (typeof playSelectSound === "function") playSelectSound(); setShowCreateModal(true); }}
                className="group relative flex flex-col items-center justify-center p-8 bg-slate-900/35 border-2 border-dashed border-slate-800 rounded-[2.2rem] hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden min-h-[280px]"
              >
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-inner">
                  <Plus className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Open Strike Frequency</h3>
                <p className="text-[9px] text-slate-500 font-mono mt-1">BROADCAST NEW DIVERGENCE CHANNEL</p>
              </button>

              {lobbies
                .filter(l => l.targetNode?.toLowerCase().includes(searchQuery.toLowerCase()) || l.hostName?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((lobby, i) => {
                  const hasStarted = lobby.status === "Raid Active";
                  const hasCleared = lobby.status === "Raid Cleared";
                  return (
                    <motion.div 
                      key={lobby.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-[2.2rem] hover:border-indigo-500/20 transition-all group flex flex-col justify-between min-h-[280px]"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0 shadow-inner">
                            <Gamepad2 className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight truncate">{lobby.hostName}'s Force</h4>
                            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                              <div className={`w-1.5 h-1.5 rounded-full ${hasStarted ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`} />
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter truncate">{lobby.targetNode || "Rift"}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex-shrink-0 border ${
                          hasStarted 
                            ? "bg-rose-500/10 border-rose-500/25 text-rose-400 animate-pulse" 
                            : hasCleared 
                              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                              : "bg-amber-500/10 border-amber-500/25 text-amber-400"
                        }`}>
                          {lobby.status}
                        </div>
                      </div>

                      <div className="space-y-4 mb-4 mt-auto font-mono">
                         <div className="flex justify-between text-[9px] text-slate-400 uppercase">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" /> Min level requirements
                            </span>
                            <span className="text-white">Lv {lobby.minLevel || 10}+</span>
                         </div>
                         <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                            <span className="text-slate-500">QUANTUM MEMBERSHIP</span>
                            <span className="text-slate-200">{lobby.members?.length || 0} / {lobby.maxMembers}</span>
                         </div>
                         <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${((lobby.members?.length || 0) / lobby.maxMembers) * 100}%` }}
                               className={`h-full bg-gradient-to-r ${
                                 hasStarted ? "from-rose-500 to-purple-600" : "from-indigo-500 to-purple-600"
                               }`}
                            />
                         </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex -space-x-1.5">
                           {lobby.members?.slice(0, 3).map((member: string, idx: number) => (
                             <div 
                               key={idx} 
                               className="w-7 h-7 rounded-2xl border border-slate-950 bg-slate-800 flex items-center justify-center text-[7.5px] font-black text-slate-400 uppercase truncate px-1 shadow-md"
                               title={member}
                             >
                                {member.substring(0, 2).toUpperCase()}
                             </div>
                           ))}
                           {(lobby.members?.length || 0) > 3 && (
                             <div className="w-7 h-7 rounded-2xl border border-slate-950 bg-slate-900 flex items-center justify-center text-[7.5px] font-black text-indigo-400 shadow-md">
                               +{lobby.members.length - 3}
                             </div>
                           )}
                        </div>

                        {currentLobbyId === lobby.id ? (
                          <button 
                            onClick={() => setActiveTab("active")}
                            className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-500 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 cursor-pointer shadow-lg shadow-indigo-500/20"
                          >
                            OPEN PORTAL
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleJoinLobby(lobby.id)}
                            disabled={joiningLobbyId !== null || (lobby.members?.length >= lobby.maxMembers) || currentLobbyId !== null}
                            className={`px-5 py-2.5 ${
                              currentLobbyId !== null || (lobby.members?.length >= lobby.maxMembers) 
                                ? "bg-slate-950 text-slate-600 border border-slate-900" 
                                : "bg-slate-900 border border-slate-800 hover:border-indigo-500/30 text-white"
                            } text-[9px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5`}
                          >
                            {joiningLobbyId === lobby.id ? (
                              <div className="w-2.5 h-2.5 border border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                              (lobby.members?.length >= lobby.maxMembers) ? "INFILTRATED" : "SYNC LOBBY"
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          )}

          {/* TAB 2: ACTIVE PARTY OR BOSS FIGHT STAGE */}
          {activeTab === "active" && (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="max-w-6xl mx-auto"
            >
              {!currentLobby ? (
                <div className="py-20 text-center space-y-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-slate-900/60 border border-slate-850 flex items-center justify-center mx-auto text-slate-500">
                    <Users className="w-9 h-9" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs sm:text-base font-black text-white uppercase tracking-[0.2em]">Solo Status Confirmed</h3>
                    <p className="text-slate-500 text-[10px] uppercase font-mono tracking-widest">No active party linkage spotted in your quantum registers.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/10 cursor-pointer"
                  >
                    SCAN ACTIVE FREQUENCIES
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT SPLIT PANEL: LOBBY INFO OR ACTIVE GAME COMMENCEMENT */}
                  <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* DYNAMIC RAID STATE DEVIATION MAPPER */}
                    {currentLobby.status === "Raid Active" && currentLobby.boss ? (
                      <div className="flex flex-col gap-6">
                        {/* IMMERSIVE ACTIVE RAID ENCOUNTER HUD */}
                        <div className="bg-slate-900/40 border border-indigo-500/25 rounded-[2.5rem] p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-550/5 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Boss Identification Panel */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 relative z-10">
                          <div>
                            <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-[0.2em] font-black">Labyrinth Core Intrusion</span>
                            <h2 className="text-lg sm:text-2xl font-[1000] text-white tracking-tight uppercase italic flex items-center gap-2 mt-1">
                              <Skull className="w-6 h-6 text-rose-500 animate-pulse" />
                              {currentLobby.boss.name}
                            </h2>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">{currentLobby.boss.level}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                            <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                            <div className="font-mono text-xs font-black">
                              <span className="text-slate-400">CHRONO:</span>{" "}
                              <span className={currentLobby.boss.timeRemaining <= 15 ? "text-rose-500 animate-pulse text-sm" : "text-amber-400"}>
                                {currentLobby.boss.timeRemaining}s
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Boss Dual Gauge Health Bars */}
                        <div className="space-y-3 font-mono relative z-10">
                          
                          {/* 1. Shield Barrier Gauge */}
                          {currentLobby.boss.shield > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[8px] font-black text-cyan-400 uppercase tracking-widest">
                                 <span>Magical Core Shield</span>
                                 <span>{currentLobby.boss.shield} / {currentLobby.boss.maxShield} SHD</span>
                              </div>
                              <div className="h-3 bg-slate-950 border border-cyan-550/20 rounded-full p-[2px]">
                                 <motion.div 
                                   initial={{ width: "100%" }}
                                   animate={{ width: `${(currentLobby.boss.shield / currentLobby.boss.maxShield) * 100}%` }}
                                   className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                                 />
                              </div>
                            </div>
                          )}

                          {/* 2. Primary Vital life Gauge */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-black text-rose-400 uppercase tracking-widest">
                               <span>Primary Boss Vitality</span>
                               <span>{currentLobby.boss.hp} / {currentLobby.boss.maxHp} HP</span>
                            </div>
                            <div className="h-3.5 bg-slate-950 border border-rose-950 rounded-full p-[2px]">
                               <motion.div 
                                 animate={{ width: `${(currentLobby.boss.hp / currentLobby.boss.maxHp) * 100}%` }}
                                 className="h-full bg-gradient-to-r from-rose-600 to-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.35)]"
                               />
                            </div>
                          </div>
                          
                          {/* 3. Global Teammate Guard shield */}
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[8px] font-black text-indigo-400 uppercase tracking-widest">
                               <span>Assault Team Guard Field Strength</span>
                               <span>{currentLobby.boss.teamShield || 0} / 3000 SHD</span>
                            </div>
                            <div className="h-2 bg-slate-950 border border-slate-900 rounded-full p-[1px]">
                               <motion.div 
                                 animate={{ width: `${Math.min(100, ((currentLobby.boss.teamShield || 0) / 3000) * 100)}%` }}
                                 className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full"
                               />
                            </div>
                          </div>
                        </div>

                        {/* Boss Casting Spell Warning Area */}
                        {currentLobby.boss.castingTimer > 0 && (
                          <div className="bg-rose-950/25 border border-rose-800/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left relative z-10">
                            <div>
                               <span className="text-[7px] font-mono font-black text-rose-500 border border-rose-800/50 px-1.5 py-0.5 rounded uppercase">CRITICAL ATTEMPT</span>
                               <h4 className="text-xs font-black text-white font-mono uppercase mt-1">Boss is chanting: {currentLobby.boss.castingSkillName}</h4>
                               <p className="text-[9px] text-slate-400 uppercase mt-0.5">Failing to raise Aegis Guard or stun will wipe 45% Team HP in {currentLobby.boss.castingTimer}s!</p>
                            </div>
                            <div className="text-rose-500 font-mono text-lg font-black tracking-widest animate-ping">
                              0:0{currentLobby.boss.castingTimer}s
                            </div>
                          </div>
                        )}

                        {/* Team Battle Squad Grid of Current Health States */}
                        <div className="space-y-3 relative z-10">
                           <h3 className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">Active Teammates Vital Signatures</h3>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {Object.keys(currentLobby.boss.playerHps || {}).map((mKey: string) => {
                                const mHp = currentLobby.boss.playerHps[mKey] ?? 100;
                                return (
                                  <div key={mKey} className="bg-slate-950 border border-slate-850 p-3 rounded-2xl flex items-center justify-between gap-3 font-mono">
                                    <div className="min-w-0">
                                      <h5 className="text-[11px] font-black text-white truncate max-w-[120px] uppercase">{mKey}</h5>
                                      <span className="text-[8px] text-slate-500 uppercase tracking-wide">Hunter Class</span>
                                    </div>
                                    <div className="flex-1 w-24">
                                      <div className="flex justify-between text-[7px] text-slate-400 font-bold mb-0.5">
                                        <span>Capacity</span>
                                        <span className={mHp <= 30 ? "text-rose-400 animate-pulse font-bold" : ""}>{mHp}%</span>
                                      </div>
                                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                        <div 
                                          style={{ width: `${mHp}%` }} 
                                          className={`h-full rounded-full transition-all duration-300 ${
                                            mHp <= 30 ? "bg-rose-500" : "bg-emerald-500"
                                          }`} 
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                           </div>
                        </div>

                        {/* REAL-TIME STRATEGIC COMMAND CONSOLE */}
                        <div className="space-y-3 relative z-10">
                           <h3 className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">Tactical Spell Command Deck (Synchronized click)</h3>
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                              
                              {/* Option ⚔️ ASSAULT CLEAVE */}
                              <button 
                                onClick={() => handleRaidInteractiveAction("strike")}
                                disabled={cooldowns.strike > 0}
                                className={`p-3 rounded-2xl border text-center relative overflow-hidden transition-all group flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
                                  cooldowns.strike > 0 
                                    ? "bg-slate-950/70 border-slate-900 text-slate-600" 
                                    : "bg-indigo-950/30 border-indigo-500/35 hover:border-indigo-400 hover:bg-indigo-900/40 text-indigo-300"
                                }`}
                              >
                                {cooldowns.strike > 0 && (
                                  <div className="absolute inset-0 bg-slate-950/65 flex items-center justify-center text-[10px] font-black text-slate-450 z-20">
                                    COOLDOWN: {cooldowns.strike}s
                                  </div>
                                )}
                                <Swords className="w-5 h-5 text-indigo-400" />
                                <span className="text-[9px] font-black uppercase tracking-wider">{currentLobby.boss?.isStudySession ? "Focus Burst" : "Assault Slash"}</span>
                                <span className="text-[6.5px] text-slate-500 uppercase mt-0.5">{currentLobby.boss?.isStudySession ? "Deep Study Impact" : "High Physical Damage"}</span>
                              </button>

                              {/* Option 🛡️ AEGIS COVENANT */}
                              <button 
                                onClick={() => handleRaidInteractiveAction("shield")}
                                disabled={cooldowns.shield > 0}
                                className={`p-3 rounded-2xl border text-center relative overflow-hidden transition-all group flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
                                  cooldowns.shield > 0 
                                    ? "bg-slate-950/70 border-slate-900 text-slate-600" 
                                    : "bg-emerald-950/30 border-emerald-500/35 hover:border-emerald-400 hover:bg-emerald-900/40 text-emerald-300"
                                }`}
                              >
                                {cooldowns.shield > 0 && (
                                  <div className="absolute inset-0 bg-slate-950/65 flex items-center justify-center text-[10px] font-black text-slate-450 z-20">
                                    COOLDOWN: {cooldowns.shield}s
                                  </div>
                                )}
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                <span className="text-[9px] font-black uppercase tracking-wider">{currentLobby.boss?.isStudySession ? "Distraction Blocker" : "Aegis Ward"}</span>
                                <span className="text-[6.5px] text-slate-500 uppercase mt-0.5">{currentLobby.boss?.isStudySession ? "Blocks incoming distractions" : "Adds shared shield strength"}</span>
                              </button>

                              {/* Option 🧪 POTION MATRIX */}
                              <button 
                                onClick={() => handleRaidInteractiveAction("heal")}
                                disabled={cooldowns.heal > 0}
                                className={`p-3 rounded-2xl border text-center relative overflow-hidden transition-all group flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
                                  cooldowns.heal > 0 
                                    ? "bg-slate-950/70 border-slate-900 text-slate-600" 
                                    : "bg-amber-950/30 border-amber-500/35 hover:border-amber-400 hover:bg-amber-900/40 text-amber-300"
                                }`}
                              >
                                {cooldowns.heal > 0 && (
                                  <div className="absolute inset-0 bg-slate-950/65 flex items-center justify-center text-[10px] font-black text-slate-450 z-20">
                                    COOLDOWN: {cooldowns.heal}s
                                  </div>
                                )}
                                <Activity className="w-5 h-5 text-amber-400" />
                                <span className="text-[9px] font-black uppercase tracking-wider">{currentLobby.boss?.isStudySession ? "Energy Boost" : "Heal Infusion"}</span>
                                <span className="text-[6.5px] text-slate-500 uppercase mt-0.5">{currentLobby.boss?.isStudySession ? "Restores squad motivation" : "Recovers Team HP +15%"}</span>
                              </button>

                              {/* Option 💀 SHADOW ARMY EXTRACTION */}
                              <button 
                                onClick={() => handleRaidInteractiveAction("shadows")}
                                disabled={cooldowns.shadows > 0}
                                className={`p-3 rounded-2xl border text-center relative overflow-hidden transition-all group flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
                                  cooldowns.shadows > 0 
                                    ? "bg-slate-950/70 border-slate-900 text-slate-600" 
                                    : "bg-fuchsia-950/30 border-fuchsia-500/35 hover:border-fuchsia-400 hover:bg-fuchsia-900/40 text-fuchsia-300"
                                }`}
                              >
                                {cooldowns.shadows > 0 && (
                                  <div className="absolute inset-0 bg-slate-950/65 flex items-center justify-center text-[10px] font-black text-slate-450 z-20">
                                    COOLDOWN: {cooldowns.shadows}s
                                  </div>
                                )}
                                <Flame className="w-5 h-5 text-fuchsia-450" />
                                <span className="text-[9px] font-black uppercase tracking-wider">{currentLobby.boss?.isStudySession ? "Complete Module" : "Extract Shadow"}</span>
                                <span className="text-[6.5px] text-slate-500 uppercase mt-0.5">{currentLobby.boss?.isStudySession ? "Breaks boss concentration" : "Damage & Interrupt Ultimate"}</span>
                              </button>

                           </div>

                           {/* Forbidden Bypass Safeguards (Cheat Option to trigger Anti-Cheat fail conditions) */}
                           <div className="pt-2">
                             <button
                               onClick={() => handleRaidInteractiveAction("cheat")}
                               className="w-full py-2 bg-gradient-to-r from-rose-950/30 to-slate-950 border border-rose-900/30 hover:border-rose-700/60 rounded-xl text-[8.5px] font-mono font-black text-rose-500/80 hover:text-rose-450 uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                             >
                               <SkeletonIcon className="w-3.5 h-3.5" />
                               Bypass System Restriction Protocol (Warning: Core Anti-Cheat Enabled)
                             </button>
                           </div>
                        </div>

                        {/* LIVE EXPEDITION LOG CONSOLE */}
                        <div className="space-y-3 relative z-10">
                           <h3 className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">Raid Activity Stream Logs</h3>
                           <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 h-32 overflow-y-auto font-mono text-[9px] text-slate-300 space-y-1.5">
                              {currentLobby.boss.actionLogs?.map((log: string, idx: number) => (
                                <div key={idx} className={`${
                                  log.includes("STRIKE") 
                                    ? "text-indigo-400" 
                                    : log.includes("BOSS") || log.includes("WARNING")
                                      ? "text-rose-400 font-bold"
                                      : log.includes("BUFF") || log.includes("BARRIER")
                                        ? "text-emerald-400"
                                        : "text-slate-350"
                                }`}>
                                   {log}
                                </div>
                              ))}
                           </div>
                        </div>

                      </div>
                      
                      {/* ULTRA VERY MUCH DETAILED BOSSES VIEW */}
                      <BossTacticalCompendium bossName={currentLobby.boss.name} currentBossState={currentLobby.boss} />
                    </div>

                    ) : (currentLobby.status === "Raid Cleared" || currentLobby.status === "Defeated" || currentLobby.status?.includes("Defeated")) ? (
 
                       // SUMMARY AND CHIPS RENDERING INSTEAD OF BASE LOBBY FORMING VIEW
                       <div className="bg-slate-900/40 border border-slate-800/85 rounded-[2.5rem] p-6 sm:p-8 space-y-8 relative overflow-hidden shadow-2xl">
                         {currentLobby.status === "Raid Cleared" && <VictoryLevelUpParticles />}
                         
                         <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-transparent pointer-events-none" />
                         
                         {/* Header Badge */}
                         <div className="text-center space-y-4 relative z-10 font-mono">
                           {currentLobby.status === "Raid Cleared" ? (
                             <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full text-xs text-emerald-400 font-extrabold tracking-widest uppercase shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-pulse">
                               <Compass className="w-4 h-4 animate-spin text-emerald-400" />
                               DIMENSIONAL RIFT CONQUERED (S-RANK SUCCESS)
                             </div>
                           ) : (
                             <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-4 py-2 rounded-full text-xs text-rose-400 font-extrabold tracking-widest uppercase shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse">
                               <AlertTriangle className="w-4 h-4 text-rose-400" />
                               FORCE SQUAD ELIMINATED (DEFENSIVE BREACH)
                             </div>
                           )}
 
                           <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic text-white leading-tight mt-3">
                             {currentLobby.status === "Raid Cleared" ? "Raid Summary Report" : "Critical Mission Briefing"}
                           </h2>
                           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                             Serializing tactical battle contributions across faction hunter arrays
                           </p>
                         </div>
 
                         {/* RAID PERFORMANCE SUMMARY STATISTICS */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                           {(() => {
                             const contributions = currentLobby.contributions || {};
                             let totalDamage = 0;
                             let totalHeals = 0;
                             let totalInterrupts = 0;
 
                             Object.keys(contributions).forEach(m => {
                               totalDamage += contributions[m]?.damage || 0;
                               totalHeals += contributions[m]?.heals || 0;
                               totalInterrupts += contributions[m]?.interrupts || 0;
                             });
 
                             return (
                               <>
                                 <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl flex flex-col items-center justify-center text-center font-mono">
                                   <Swords className="w-6 h-6 text-indigo-400 mb-2" />
                                   <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Total Damage Meted</span>
                                   <span className="text-sm font-bold text-white mt-1">{totalDamage.toLocaleString()} DMG</span>
                                 </div>
                                 <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl flex flex-col items-center justify-center text-center font-mono">
                                   <Activity className="w-6 h-6 text-emerald-400 mb-2" />
                                   <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Lethal Healing Casts</span>
                                   <span className="text-sm font-bold text-white mt-1">{totalHeals} HEALS</span>
                                 </div>
                                 <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl flex flex-col items-center justify-center text-center font-mono">
                                   <Check className="w-6 h-6 text-pink-400 mb-2" />
                                   <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Ruptured Ultimates</span>
                                   <span className="text-sm font-bold text-white mt-1">{totalInterrupts} INTERRUPTS</span>
                                 </div>
                               </>
                             );
                           })()}
                         </div>
 
                         <DpsChart currentLobby={currentLobby} memberProfiles={memberProfiles} />
                         {/* HUNTER DETAILS DATAGRID */}
                         <div className="space-y-4 relative z-10">
                           <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-500 font-mono">Hunter Contributions Summary</h3>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {currentLobby.members?.map((member: string, i: number) => {
                               const contributions = currentLobby.contributions?.[member] || { damage: 0, heals: 0, interrupts: 0 };
                               const profile = memberProfiles[member] || {};
                               return (
                                 <div key={i} className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-indigo-500/20 relative z-10 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 font-mono text-sm font-bold">
                                     {profile.customAvatar ? (
                                       <img loading="lazy" 
                                         src={profile.customAvatar} 
                                         alt={member} 
                                         className="w-full h-full object-cover" 
                                         referrerPolicy="no-referrer"
                                       />
                                     ) : (
                                       member.substring(0, 2).toUpperCase()
                                     )}
                                   </div>
                                   <div className="flex-1 min-w-0 font-mono">
                                     <h4 className="text-xs font-black text-white truncate uppercase">{member}</h4>
                                     <div className="text-[9px] text-slate-500 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                                       <span>DMG: <span className="text-indigo-400 font-bold">{(contributions.damage || 0).toLocaleString()}</span></span>
                                       <span>&bull;</span>
                                       <span>HEALS: <span className="text-emerald-400 font-bold">{contributions.heals || 0}</span></span>
                                       <span>&bull;</span>
                                       <span>INT: <span className="text-pink-400 font-bold">{contributions.interrupts || 0}</span></span>
                                     </div>
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
 
                         {/* Portal Calibration Reboot Actions */}
                         <div className="pt-6 border-t border-slate-850/80 flex flex-col items-center gap-4 relative z-10">
                           {currentLobby.hostName === playerName ? (
                             <button 
                               onClick={handleResetLobby}
                               className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-103"
                             >
                               <RefreshCcw className="w-4 h-4" />
                               RECONSTRUCT DIMENSIONAL GATEWAYS (RESET LOBBY)
                             </button>
                           ) : (
                             <div className="flex items-center gap-2 bg-slate-950 p-4 border border-slate-850 rounded-2xl w-full justify-center">
                               <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
                               <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest text-center">
                                 AWAITING LOBBY HOST TO RESET PORTAL COORDINATES...
                               </span>
                             </div>
                           )}
                         </div>
 
                       </div>

                     ) : (

                       // BASE LOBBY FORMING VIEW
                       <div className="bg-slate-900/50 border border-slate-800/60 rounded-[2.2rem] p-6 sm:p-8 space-y-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                           <div>
                             <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-[0.15em] flex items-center gap-2">
                               <Shield className="w-5 h-5 text-indigo-400" />
                               {currentLobby.targetNode || "Dimensional Rift"}
                             </h2>
                             <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">Raid Commander: {currentLobby.hostName} &middot; PHASE: <span className="text-amber-400">{currentLobby.status}</span></p>
                           </div>
                           <button 
                             onClick={handleLeaveParty}
                             className="px-4 py-2 bg-red-950/20 text-red-400 hover:bg-red-900/30 hover:text-red-300 border border-red-900/40 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shrink-0"
                           >
                              <LogOut className="w-3.5 h-3.5" />
                              Decouple Channel
                           </button>
                        </div>
                        
                        <div className="space-y-4">
                           <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Linked Hunters ({currentLobby.members?.length || 0} / {currentLobby.maxMembers})</h3>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {currentLobby.members?.map((member: string, idx: number) => {
                                 const profile = memberProfiles[member] || {};
                                 return (
                                   <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-indigo-500/20">
                                       <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-400 font-bold font-mono text-[10px] overflow-hidden shrink-0">
                                          {profile.customAvatar ? (
                                            <img loading="lazy" src={profile.customAvatar} alt={member} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                          ) : (
                                            member.substring(0,2).toUpperCase()
                                          )}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate">{member}</h4>
                                          <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">{member === currentLobby.hostName ? "Raid Commander" : "Assault Vanguard"}</p>
                                       </div>
                                     {member === currentLobby.hostName && (
                                       <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-550/20 flex items-center justify-center shrink-0">
                                         <Trophy className="w-3 h-3 text-amber-550" />
                                       </div>
                                     )}
                                   </div>
                                 );
                              })}
                              {Array.from({ length: Math.max(0, currentLobby.maxMembers - (currentLobby.members?.length || 0)) }).map((_, idx) => (
                                <div key={`empty-${idx}`} className="bg-slate-950/35 border border-dashed border-slate-850 p-4 rounded-2xl flex items-center gap-4 opacity-40">
                                   <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-600">
                                      <Users className="w-4 h-4" />
                                   </div>
                                   <div>
                                      <h4 className="text-xs sm:text-sm font-bold text-slate-600">Vacant Slot</h4>
                                      <p className="text-[8px] text-slate-705 uppercase tracking-widest mt-0.5">Scanning quantum field...</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>

                        {/* COMMENCE TRANSITION ENGINE FOR COMMANDER */}
                        {currentLobby.hostName === playerName && (
                          <div className="bg-indigo-950/15 border border-indigo-550/25 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                             <div className="text-center sm:text-left">
                               <h3 className="text-[11px] font-black text-indigo-300 uppercase tracking-widest">Divergence Gate Command</h3>
                               <p className="text-[9px] text-indigo-400/70 font-mono mt-0.5 uppercase">Authorize transition mapping when the assault squad completes setup.</p>
                             </div>
                             <button 
                               onClick={handleCommenceRaid}
                               className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/40 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-103"
                             >
                                <Swords className="w-4 h-4 animate-bounce" />
                                COMMENCE ENCOUNTER
                             </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* RIGHT PANEL: SHARE CO-OP RADAR CHAT */}
                  <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800/80 rounded-[2.2rem] flex flex-col overflow-hidden h-[500px] lg:h-auto">
                     <div className="p-4 border-b border-slate-850 bg-slate-950/40 font-black text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2 shrink-0">
                        <MessageSquare className="w-4 h-4 text-slate-500" />
                        Channel Tactical Comms
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[9px] sm:text-xs">
                        {currentLobby.messages?.map((msg: any, i: number) => {
                          const isSystem = msg.sender === "System";
                          const isMe = msg.sender === playerName;
                          if (isSystem) {
                            return (
                              <div key={i} className="text-center">
                                <span className="inline-block px-3 py-1 rounded bg-slate-950 border border-slate-900 text-slate-500 text-[8px] uppercase tracking-wider">
                                  {msg.text}
                                </span>
                              </div>
                            );
                          }
                          const senderProfile = isMe ? playerProfileData : (memberProfiles[msg.sender] || {});
                          return (
                            <div key={i} className={`flex gap-2 items-start ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                               <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 font-mono text-[9px] font-bold overflow-hidden shrink-0 shadow-inner">
                                  {senderProfile?.customAvatar ? (
                                    <img loading="lazy" src={senderProfile.customAvatar} alt={msg.sender} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    msg.sender.substring(0, 2).toUpperCase()
                                  )}
                               </div>
                               <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                                  <span className={`text-[8.5px] mb-1 font-bold ${isMe ? "text-indigo-400" : "text-emerald-400"}`}>{msg.sender}</span>
                                  <div className={`px-3 py-2 rounded-xl flex flex-col gap-1 ${isMe ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-slate-850 text-slate-200 rounded-tl-sm border border-slate-800"}`}>
                                     {msg.text && <div className="leading-relaxed break-words">{msg.text}</div>}
                                     {msg.audioUrl && (
                                       <div className="mt-1 block">
                                         <AudioVoiceMemoPlayer audioUrl={msg.audioUrl} />
                                       </div>
                                     )}
                                  </div>
                               </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                     </div>
                     {isRecording ? (
                       <div className="p-3 border-t border-rose-900 bg-rose-950/20 shrink-0 flex items-center justify-between gap-3">
                         <div className="flex items-center gap-2 font-mono text-[10px] text-rose-400">
                           <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                           <span className="font-extrabold uppercase tracking-wider">AUDIO MEMO BROADCAST ACTIVE</span>
                           <span className="text-slate-400">({recordingSeconds}s)</span>
                         </div>
                         <div className="flex gap-2">
                           <button
                             type="button"
                             onClick={() => {
                               if (mediaRecorderRef.current) {
                                 mediaRecorderRef.current.onstop = null;
                                 mediaRecorderRef.current.stop();
                               }
                               setIsRecording(false);
                               if (recordingTimerRef.current) {
                                 clearInterval(recordingTimerRef.current);
                               }
                               triggerLocalAlert("Voice broadcast aborted.", "warning");
                             }}
                             className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[9px] uppercase tracking-wider font-extrabold rounded-lg cursor-pointer transition-all font-mono"
                           >
                             Abort
                           </button>
                           <button
                             type="button"
                             onClick={stopVoiceRecording}
                             className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[9px] uppercase tracking-wider font-extrabold rounded-lg shadow-lg cursor-pointer transition-all font-mono"
                           >
                             Transmit Memo
                           </button>
                         </div>
                       </div>
                     ) : (
                       <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-850 bg-slate-950/80 shrink-0 flex gap-2">
                          <button 
                             type="button" 
                             onClick={startVoiceRecording} 
                             className="px-3 bg-slate-900 border border-slate-850 hover:bg-slate-800 hover:border-slate-705 text-indigo-400 hover:text-indigo-350 rounded-xl flex items-center justify-center cursor-pointer transition-all"
                             title="Calibrate tactical voice memo frequency"
                          >
                             <Mic className="w-3.5 h-3.5" />
                          </button>
                          <input
                             type="text"
                             value={chatInput}
                             onChange={(e) => setChatInput(e.target.value)}
                             placeholder="Transmit to party..."
                             className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500/50 font-mono"
                          />
                          <button type="submit" disabled={!chatInput.trim()} className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-50 font-mono">
                             <Send className="w-3.5 h-3.5" />
                          </button>
                       </form>
                     )}
                  </div>

                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: IMMERSIVE HUNTER COMMUNAL FORUM FEED */}
          {activeTab === "communal" && (
            <motion.div 
              key="communal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              {/* Hunter Guild Dispatch Banner */}
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.2rem] flex flex-col md:flex-row items-center gap-4 relative overflow-hidden">
                <div className="w-14 h-14 bg-indigo-550/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <Compass className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-widest">📡 GENERAL HUNTER INTEL BULLETIN</h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">Decentralized network for S-Rank and A-Rank raiding guilds. Share gate coordination details safely.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Submit New Bulletin Block */}
                <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800/80 p-5 rounded-[2.2rem] space-y-4">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-2">Publish Bulletin Signal</h4>
                  <form onSubmit={handlePostForumMessage} className="space-y-4 font-mono text-xs">
                    
                    <div className="space-y-1.5">
                       <label className="text-[8.5px] font-black text-slate-500 uppercase">Personal Class Blueprint</label>
                       <select 
                         value={selectedClass} 
                         onChange={(e) => setSelectedClass(e.target.value)}
                         className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                       >
                         {["Assassin", "Mage", "Fighter", "Ranger", "Trapper", "Healer"].map(c => (
                           <option key={c} value={c}>{c} Core</option>
                         ))}
                       </select>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[8.5px] font-black text-slate-500 uppercase">Active Guild Affiliation</label>
                       <select 
                         value={selectedGuild} 
                         onChange={(e) => setSelectedGuild(e.target.value)}
                         className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                       >
                         {["Sovereign Clan", "White Tiger Guild", "Fiend Hunters", "Fame Guild", "Scavenger Squad"].map(g => (
                           <option key={g} value={g}>{g}</option>
                         ))}
                       </select>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[8.5px] font-black text-slate-500 uppercase font-mono">Message Vector Transmission</label>
                       <textarea 
                         value={forumInput}
                         onChange={(e) => setForumInput(e.target.value)}
                         placeholder="Post recruitment needs or S-Rank experiences..."
                         rows={4}
                         className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                       />
                    </div>

                    <button 
                      type="submit"
                      disabled={!forumInput.trim()}
                      className="w-full py-3 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-40"
                    >
                      BroadCast Signal
                    </button>
                  </form>
                </div>

                {/* Communal Feed Index */}
                <div className="lg:col-span-8 bg-slate-900/50 border border-slate-800/80 p-5 rounded-[2.2rem] space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Communal Bulletins Feed</h4>
                    <span className="text-[9px] font-mono text-indigo-400">Total packets: {forumPosts.length + 5}</span>
                  </div>

                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                    
                    {/* User Shared Posts list */}
                    {forumPosts.map((post) => (
                      <div key={post.id} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-2 font-mono">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-7 h-7 bg-indigo-950/20 rounded-lg flex items-center justify-center text-xs">
                               {(post.sender.includes("Jin") || post.sender.includes("Woo")) ? "⚔️" : "👤"}
                             </div>
                             <div>
                                <h5 className="text-[10.5px] font-black text-slate-200 uppercase">{post.sender}</h5>
                                <div className="flex items-center gap-1.5 text-[7.5px] text-slate-500">
                                   <span className="text-indigo-400 font-bold uppercase">{post.hunterClass}</span>
                                   <span>&middot;</span>
                                   <span className="text-slate-400">{post.guild}</span>
                                </div>
                             </div>
                          </div>
                          <span className="text-[7.5px] text-slate-600">
                            {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans pl-1 pt-1 leading-relaxed">{post.text}</p>
                      </div>
                    ))}

                    {/* Pre-seeded Authentic Monarch Characters for Context and Lore immersion */}
                    {[
                      { sender: "Go Gun-Hee", hunterClass: "S-Rank Association President", guild: "Korean Hunter Association", text: "Urgent Warning: S-rank gate coordinate variance noticed in surrounding Sector 4. Do not approach without dual tank and double class healer setup.", timestamp: Date.now() - 3600000 * 2, iconKey: "GoGunHee" },
                      { sender: "Cha Hae-In", hunterClass: "S-Rank Fighter", guild: "White Tiger Guild", text: "Completed calibration grinds. S-Rank Void Twinblade strikes are reaching the target threshold. Looking for mages for next dungeon lock.", timestamp: Date.now() - 3600000 * 4, iconKey: "ChaHaeIn" },
                      { sender: "Thomas Andre", hunterClass: "Nation-Level Commander", guild: "Scavenger Guild", text: "My shadow contracts are finalized globally. Any Hunter testing exploits or cheating the Monarch standard system gates will be automatically liquidated under immediate system compliance. Fair warning.", timestamp: Date.now() - 3600000 * 6, iconKey: "ThomasAndre" },
                      { sender: "Baek Yoon-Ho", hunterClass: "S-Rank Wild Beast Core", guild: "Fiend Hunters", text: "Successfully cleared Kargalgan yesterday. Shield resilience is crucial. The shaman has active chant guards - physical DPS units must strike in synchronization or sustain team failure.", timestamp: Date.now() - 3600000 * 8, iconKey: "BaekYoonHo" }
                    ].map((seed, idx) => (
                      <div key={`seed_${idx}`} className="bg-slate-950/60 border border-slate-900 p-4 rounded-2xl space-y-2 font-mono">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className="w-7 h-7 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-xs">
                                 {hunterAvatars[seed.iconKey] || "👤"}
                               </div>
                               <div>
                                  <h5 className="text-[10.5px] font-black text-rose-450 uppercase">{seed.sender}</h5>
                                  <div className="flex items-center gap-1.5 text-[7.5px] text-slate-500">
                                     <span className="text-rose-400 font-bold uppercase">{seed.hunterClass}</span>
                                     <span>&middot;</span>
                                     <span className="text-slate-400">{seed.guild}</span>
                                  </div>
                               </div>
                            </div>
                            <span className="text-[7.5px] text-slate-600">Simulated Sync</span>
                         </div>
                         <p className="text-[11px] text-slate-400 font-sans pl-1 pt-1 leading-relaxed">{seed.text}</p>
                      </div>
                    ))}

                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: RAID SUMMARY STATISTICS */}
          {activeTab === "stats" && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Hunter Profile & Biometric Optical Sync */}
              <div className="bg-slate-900/50 border border-slate-800/80 p-6 sm:p-8 rounded-[2.2rem] flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 font-mono text-center sm:text-left flex-col sm:flex-row">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-950/20 border-2 border-indigo-505/20 overflow-hidden flex items-center justify-center text-indigo-400 font-bold font-mono text-2xl shadow-xl">
                      {playerProfileData?.customAvatar ? (
                        <img loading="lazy" src={playerProfileData.customAvatar} alt={playerName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        playerName.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <button
                      onClick={toggleCameraSetup}
                      className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl border border-indigo-550 text-white cursor-pointer transition-transform hover:scale-110 shadow-lg"
                      title="Capture custom avatar"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.25em]">Sovereign Hunter License</span>
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight italic mt-0.5">{playerName}</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                      Status: <span className="text-emerald-400 font-bold">Authorized Fleet Commander</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleCameraSetup}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-950 border border-indigo-500/20 hover:border-indigo-505/50 text-indigo-400 font-bold rounded-xl text-[10px] font-mono tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-indigo-950/10 active:scale-98"
                >
                  <Camera className="w-4 h-4 animate-pulse" />
                  optical/biometric sync
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: "Gate Conquests", value: playerProfileData?.level ? Math.floor(playerProfileData.level * 1.5) : "24", trend: "+4 cleared", icon: Trophy, color: "text-amber-400" },
                   { label: "Sovereign Gold (Mana)", value: playerProfileData?.gold ? `${playerProfileData.gold.toLocaleString()} G` : "0 G", trend: "Tax buffer stable", icon: Zap, color: "text-indigo-400" },
                   { label: "Baseline Experience", value: playerProfileData?.exp ? `${playerProfileData.exp.toLocaleString()} XP` : "0 XP", trend: `Lv ${playerProfileData?.level || 1} tracking`, icon: Flame, color: "text-rose-400" }
                 ].map((stat, i) => (
                   <div key={i} className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-[2.2rem] flex flex-col items-center justify-center text-center">
                      <stat.icon className={`w-8 h-8 ${stat.color} mb-4`} />
                      <h4 className="text-2xl font-black text-white font-mono">{stat.value}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                      <div className="bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-0.5 rounded text-[8.5px] font-mono text-emerald-400 font-bold mt-4">
                        {stat.trend}
                      </div>
                   </div>
                 ))}
              </div>

              <div className="bg-slate-900/50 border border-slate-800/80 rounded-[2.2rem] p-6 lg:p-8">
                 <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                   Recent Operations Log Book
                 </h3>

                 <div className="space-y-3">
                   {[
                     { raid: "Subzero Frost Rift", role: "Vanguard Guard", date: "Just Now", result: "Victory Reward Claimed", score: "+15 G / +80 XP" },
                     { raid: "S-Rank Shadow Monarch Gate", role: "DPS Strike Leader", date: "30 Min Ago", result: "Failed Penalty Exacted", score: "-5 G (Mana Pool)" },
                     { raid: "Demon Castle Towers", role: "Supporter Core", date: "Yesterday", result: "Victory", score: "+15 G / +80 XP" },
                     { raid: "C-Rank Goblin Outpost", role: "Solo Infiltrator", date: "3 Days Ago", result: "Victory", score: "+10 G / +40 XP" }
                   ].map((log, i) => (
                     <div key={i} className="bg-slate-950/70 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                        <div>
                           <h4 className="text-xs sm:text-sm font-bold text-white uppercase">{log.raid}</h4>
                           <p className="text-[9.5px] text-slate-500 mt-0.5">Assault Position: {log.role} &middot; {log.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${
                             log.result.includes("Victory") 
                               ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                               : log.result.includes("Failed")
                                 ? "bg-rose-500/10 border-rose-550/20 text-rose-400 font-black animate-pulse"
                                 : "bg-slate-900 border-slate-800 text-slate-400"
                           }`}>
                             {log.result}
                           </span>
                           <span className="text-[10px] font-black uppercase text-indigo-300 w-28 text-right">{log.score}</span>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* LOBBY CREATION POPUP MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.2rem] p-6 sm:p-8 w-full max-w-md relative z-10 shadow-2xl font-mono text-xs"
            >
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
                Initialize Raid Channel
              </h2>
              <form onSubmit={handleCreateLobby} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">Target Labyrinth Node</label>
                  <select 
                    value={newLobbyData.target}
                    onChange={(e) => setNewLobbyData({...newLobbyData, target: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="S-Rank Shadow Monarch Rift">S-Rank Shadow Monarch Rift</option>
                    <option value="Abyssal Subzero Frost Gate">Abyssal Subzero Frost Gate</option>
                    <option value="A-Rank High Orc Fortress">A-Rank High Orc Fortress</option>
                    <option value="B-Rank Demon Castle Maze">B-Rank Demon Castle Maze</option>
                    <optgroup label="⏱ Timed Study Sessions">
                      <option value="Timed Study: Ancient Scholar's Ghost (30 min)">Study: Ancient Scholar's Ghost (30m)</option>
                      <option value="Timed Study: Archmage's Library (60 min)">Study: Archmage's Library (60m)</option>
                      <option value="Timed Study: Infinite Void Oracle (120 min)">Study: Infinite Void Oracle (120m)</option>
                    </optgroup>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">Assault Limit</label>
                    <select 
                      value={newLobbyData.maxMembers}
                      onChange={(e) => setNewLobbyData({...newLobbyData, maxMembers: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    >
                      {[2,3,4,5,6].map(n => <option key={n} value={n}>{n} Hunters</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">Min Level Requirement</label>
                    <input 
                      type="number"
                      min={1}
                      value={newLobbyData.minLevel}
                      onChange={(e) => setNewLobbyData({...newLobbyData, minLevel: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 font-mono text-xs">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    ABORT
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
                  >
                    TRANSMIT
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OPTICAL BIOMETRIC CAMERA SCAN MODAL */}
      <AnimatePresence>
        {cameraStreamActive && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md cursor-pointer"
              onClick={deactivateCamera}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.2rem] p-6 sm:p-8 w-full max-w-sm relative z-10 shadow-2xl font-mono text-xs text-center space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <span className="text-xs font-[1000] text-white uppercase tracking-wider">OPTICAL BIOMETRIC CALIBRATION</span>
                </div>
                <button 
                  onClick={deactivateCamera}
                  className="text-[10px] bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-400 hover:text-white px-2 py-1 rounded transition-colors cursor-pointer uppercase font-black"
                >
                  Close
                </button>
              </div>

              {/* Video Feed Component */}
              <div className="relative aspect-square w-full max-w-[240px] mx-auto rounded-3xl overflow-hidden border-2 border-indigo-500/20 bg-slate-950 flex items-center justify-center shadow-inner">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {/* Tactical scanner lines */}
                <div className="absolute inset-0 border-2 border-dashed border-indigo-500/20 rounded-3xl pointer-events-none animate-pulse" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_8px_rgba(129,140,248,0.8)] animate-[bounce_3s_infinite]" />
              </div>

              <p className="text-[9.5px] text-slate-500 uppercase tracking-widest leading-relaxed">
                Position your optical profile clearly in the frame to register a custom combat avatar.
              </p>

              <div className="flex gap-3 pt-2 font-mono text-xs">
                <button 
                  type="button"
                  onClick={deactivateCamera}
                  className="flex-1 px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                >
                  ABORT
                </button>
                <button 
                  type="button"
                  onClick={capturePhotoFrame}
                  className="flex-1 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  CAPTURE PROFILE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decorative Aura Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/5 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/5 rounded-full blur-[140px] animate-pulse" />
      </div>

    </div>
  );
}
