import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  PartyPopper, 
  Gamepad2, 
  Dices, 
  Zap, 
  ArrowLeft,
  Users,
  Trophy,
  Skull
} from "lucide-react";

interface PartyModeProps {
  onBack: () => void;
  playSelectSound: () => void;
}

export const PartyMode: React.FC<PartyModeProps> = ({ onBack, playSelectSound }) => {
  const [isLobbyActive, setIsLobbyActive] = useState(false);

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans">
       <header className="p-4 border-b border-indigo-500/20 bg-slate-900/60 backdrop-blur-xl flex items-center gap-4">
          <button aria-label="Go Back" onClick={() => { try { playSelectSound(); } catch(e){} onBack(); }} className="p-2.5 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95">
             <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-[900] text-white tracking-[0.1em] italic">PARTY MODE</h1>
            <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-[0.2em] font-bold">Chaos Protocol Active</p>
          </div>
       </header>

       <main className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center rotate-6 shadow-2xl border-4 border-indigo-400/30">
               <Gamepad2 className="w-20 h-20 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]" />
            </div>
          </div>

          <div className="max-w-sm space-y-3">
             <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">
                CASUAL VOID<br/>STABILIZING...
             </h2>
             <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Party Mode is a multiplayer-focused game setting designed for lighthearted fun. 
                Chaotic modifiers and rotating minigames await.
             </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
             <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl flex flex-col items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                <div className="p-3 bg-slate-800 rounded-2xl">
                  <Dices className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest leading-none">Rolling<br/>Gauntlet</span>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl flex flex-col items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                <div className="p-3 bg-slate-800 rounded-2xl">
                  <Zap className="w-6 h-6 text-yellow-500" />
                </div>
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest leading-none">Speed<br/>Fragment</span>
             </div>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <button aria-label="Interactive Button" 
                onClick={() => setIsLobbyActive(true)}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-3xl shadow-[0_10px_30px_rgba(99,102,241,0.4)] tracking-[0.2em] uppercase text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-indigo-500/20"
            >
                Initialize Lobby
            </button>
            
            <p className="text-[10px] text-slate-600 font-mono uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                <Users className="w-4 h-4 opacity-40" /> 
                {isLobbyActive ? "AWAITING HUNTERS..." : "NO ACTIVE LOBBIES"}
            </p>
          </div>

          <div className="pt-4 flex gap-6 grayscale opacity-30">
             <Skull className="w-6 h-6" />
             <Trophy className="w-6 h-6" />
             <PartyPopper className="w-6 h-6" />
          </div>
       </main>
       
       <footer className="p-6 bg-slate-900/40 border-t border-slate-800 text-[9px] text-slate-600 font-mono text-center tracking-widest">
          MODIFIER SYSTEM: RANDOMIZED &middot; PVP: DISABLED &middot; FUN: MAXIMIZED
       </footer>
    </motion.div>
  );
};
