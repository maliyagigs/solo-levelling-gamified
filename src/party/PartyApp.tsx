import React, { useState, useEffect } from "react";
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
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "../utils/firebase";

interface PartyPageProps {
  playerName: string;
  onBack: () => void;
  playSelectSound: () => void;
}

export default function PartyPage({ playerName, onBack, playSelectSound }: PartyPageProps) {
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"explorer" | "active" | "stats">("explorer");

  const [joiningLobbyId, setJoiningLobbyId] = useState<string | null>(null);

  const handleJoinLobby = (lobbyId: string) => {
    try { playSelectSound(); } catch (e) {}
    setJoiningLobbyId(lobbyId);
    setTimeout(() => {
      setJoiningLobbyId(null);
      setActiveTab("active");
    }, 1500);
  };

  useEffect(() => {
    const q = query(collection(db, "party_lobbies"), orderBy("createdAt", "desc"), limit(20));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setLobbies(list);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* HUD Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-indigo-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { playSelectSound(); onBack(); }}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-[0.2em]">Party Lattice</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Hunter Signature</span>
            <span className="text-xs font-black text-indigo-400 font-mono">{playerName}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search active frequencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 w-full md:w-auto">
            {[
              { id: "explorer", label: "Lobbies", icon: Radio },
              { id: "active", label: "My Party", icon: Users },
              { id: "stats", label: "Raid Stats", icon: Shield }
            ].map(tab => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => { playSelectSound(); setActiveTab(tab.id as any); }}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    isSel ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === "explorer" && (
            <motion.div 
              key="explorer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Create Lobby Card */}
              <button 
                className="group relative flex flex-col items-center justify-center p-8 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[2.5rem] hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Initialize Party</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-1">START NEW DIMENSIONAL RAID</p>
              </button>

              {lobbies.map((lobby, i) => (
                <motion.div 
                  key={lobby.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-900/50 border border-slate-800/60 p-6 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{lobby.hostName}'s Group</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Level 40+ Recommended</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                      {lobby.status}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                     <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-500">Party Capacity</span>
                        <span className="text-slate-200">{lobby.members?.length || 0} / {lobby.maxMembers} Members</span>
                     </div>
                     <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/30">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(lobby.members?.length / lobby.maxMembers) * 100}%` }}
                           className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        />
                     </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                       {[...Array(3)].map((_, i) => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">H{i}</div>
                       ))}
                       <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-400">+1</div>
                    </div>
                    <motion.button 
                      onClick={() => handleJoinLobby(lobby.id)}
                      disabled={joiningLobbyId !== null}
                      animate={joiningLobbyId === lobby.id ? { scale: [1, 0.95, 1], opacity: [1, 0.6, 1] } : {}}
                      transition={joiningLobbyId === lobby.id ? { repeat: Infinity, duration: 1 } : {}}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-indigo-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      {joiningLobbyId === lobby.id ? (
                        <>
                          <span className="w-2.5 h-2.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                          <span>Linking...</span>
                        </>
                      ) : (
                        "Join Lobby"
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "active" && (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto py-20 text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-700">
                <Users className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-widest">Solo Hunter Detected</h3>
                <p className="text-slate-500 text-sm font-mono">You are not currently linked to any dimensional party lattice.</p>
              </div>
              <button 
                onClick={() => setActiveTab("explorer")}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95"
              >
                Scan for Lobbies
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
