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
  Swords
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { onSnapshot, collection, query, orderBy, limit, addDoc, updateDoc, doc, serverTimestamp, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
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
  const [currentLobbyId, setCurrentLobbyId] = useState<string | null>(null);
  const [currentLobby, setCurrentLobby] = useState<any>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLobbyData, setNewLobbyData] = useState({ target: "C-Rank Dungeon", maxMembers: 4, minLevel: 10 });

  const [chatInput, setChatInput] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab === "active" && currentLobby?.messages) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentLobby?.messages, activeTab]);

  useEffect(() => {
    const q = query(collection(db, "party_lobbies"), orderBy("createdAt", "desc"), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setLobbies(list);

      // Check if user is in any lobby
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
      console.warn("Firebase listener transient error: ", error);
    });
    return () => unsub();
  }, [playerName, activeTab]);

  const handleCreateLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      playSelectSound();
      const docRef = await addDoc(collection(db, "party_lobbies"), {
        hostName: playerName,
        targetNode: newLobbyData.target,
        minLevel: newLobbyData.minLevel,
        maxMembers: newLobbyData.maxMembers,
        status: "Forming",
        members: [playerName],
        messages: [{
          sender: "System",
          text: `Lobby initialized for ${newLobbyData.target}`,
          timestamp: Date.now()
        }],
        createdAt: serverTimestamp()
      });
      setShowCreateModal(false);
      setCurrentLobbyId(docRef.id);
      setActiveTab("active");
    } catch (err) {
      console.error("Error creating lobby", err);
    }
  };

  const handleJoinLobby = async (lobbyId: string) => {
    try { 
      playSelectSound(); 
      setJoiningLobbyId(lobbyId);
      
      const lobbyRef = doc(db, "party_lobbies", lobbyId);
      const snap = await getDoc(lobbyRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.members && data.members.length >= data.maxMembers) {
          alert("Lobby is full.");
          setJoiningLobbyId(null);
          return;
        }
        await updateDoc(lobbyRef, {
          members: arrayUnion(playerName),
          messages: arrayUnion({
            sender: "System",
            text: `${playerName} joined the latency field.`,
            timestamp: Date.now()
          })
        });
        setCurrentLobbyId(lobbyId);
        setActiveTab("active");
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
      playSelectSound();
      const lobbyRef = doc(db, "party_lobbies", currentLobbyId);
      
      await updateDoc(lobbyRef, {
        members: arrayRemove(playerName),
        messages: arrayUnion({
          sender: "System",
          text: `${playerName} severed their tether to the lobby.`,
          timestamp: Date.now()
        })
      });
      // Currently, we're not destroying empty lobbies, but we could if members.length === 0 server-side functionally
      setCurrentLobbyId(null);
      setCurrentLobby(null);
      setActiveTab("explorer");
    } catch (e) {
      console.error("Error leaving party", e);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* HUD Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-indigo-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { playSelectSound(); onBack(); }}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all active:scale-90 cursor-pointer"
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
        {/* Tabs & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search active frequencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
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
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
                onClick={() => { playSelectSound(); setShowCreateModal(true); }}
                className="group relative flex flex-col items-center justify-center p-8 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[2.5rem] hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden min-h-[280px]"
              >
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Initialize Party</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-1">START NEW DIMENSIONAL RAID</p>
              </button>

              {lobbies
                .filter(l => l.targetNode?.toLowerCase().includes(searchQuery.toLowerCase()) || l.hostName?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((lobby, i) => (
                <motion.div 
                  key={lobby.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-900/50 border border-slate-800/60 p-6 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group flex flex-col justify-between min-h-[280px]"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform flex-shrink-0">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-black text-white uppercase tracking-tight truncate">{lobby.hostName}'s Group</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">Target: {lobby.targetNode || "Unknown"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest flex-shrink-0">
                      {lobby.status}
                    </div>
                  </div>

                  <div className="space-y-4 mb-4 mt-auto">
                     <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono uppercase">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Min Lv: {lobby.minLevel || 10}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-500">Party Capacity</span>
                        <span className="text-slate-200">{lobby.members?.length || 0} / {lobby.maxMembers} Members</span>
                     </div>
                     <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/30">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${((lobby.members?.length || 0) / lobby.maxMembers) * 100}%` }}
                           className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        />
                     </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex -space-x-2">
                       {lobby.members?.slice(0, 3).map((member: string, idx: number) => (
                         <div key={idx} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400 truncate px-1" title={member}>
                            {member.substring(0, 2).toUpperCase()}
                         </div>
                       ))}
                       {(lobby.members?.length || 0) > 3 && (
                         <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-400">
                           +{(lobby.members?.length || 0) - 3}
                         </div>
                       )}
                    </div>
                    {currentLobbyId === lobby.id ? (
                      <button 
                        onClick={() => setActiveTab("active")}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
                      >
                        Enter
                      </button>
                    ) : (
                      <motion.button 
                        onClick={() => handleJoinLobby(lobby.id)}
                        disabled={joiningLobbyId !== null || (lobby.members?.length >= lobby.maxMembers) || currentLobbyId !== null}
                        className={`px-6 py-2 ${currentLobbyId !== null || (lobby.members?.length >= lobby.maxMembers) ? "bg-slate-800 text-slate-500" : "bg-indigo-600 hover:bg-indigo-500 text-white"} text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5`}
                      >
                        {joiningLobbyId === lobby.id ? (
                          <>
                            <span className="w-2.5 h-2.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            <span>Linking...</span>
                          </>
                        ) : (
                          (lobby.members?.length >= lobby.maxMembers) ? "Full" : "Join Lobby"
                        )}
                      </motion.button>
                    )}
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
              className="max-w-5xl mx-auto space-y-6"
            >
              {!currentLobby ? (
                <div className="py-20 text-center space-y-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-700">
                    <Users className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-widest">Solo Hunter Detected</h3>
                    <p className="text-slate-500 text-sm font-mono">You are not currently linked to any dimensional party lattice.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95 cursor-pointer"
                  >
                    Scan for Lobbies
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Party Member & Controls */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                     <div className="bg-slate-900/50 border border-slate-800/60 rounded-[2rem] p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
                           <div>
                             <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                               <Shield className="w-5 h-5 text-indigo-400" />
                               {currentLobby.targetNode || "Dimensional Rift"}
                             </h2>
                             <p className="text-[11px] text-slate-400 font-mono mt-1 uppercase">Host: {currentLobby.hostName} &middot; Status: <span className="text-emerald-400">{currentLobby.status}</span></p>
                           </div>
                           <button 
                             onClick={handleLeaveParty}
                             className="px-4 py-2 bg-red-950/30 text-red-400 hover:bg-red-900/40 hover:text-red-300 border border-red-900/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-2 shrink-0 self-start"
                           >
                              <LogOut className="w-3.5 h-3.5" />
                              Sever Lattice Link
                           </button>
                        </div>
                        
                        <div className="space-y-4">
                           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Linked Hunters ({currentLobby.members?.length || 0}/{currentLobby.maxMembers})</h3>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {currentLobby.members?.map((member: string, idx: number) => (
                                 <div key={idx} className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                                        {member.substring(0,2).toUpperCase()}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-200 truncate">{member}</h4>
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">{member === currentLobby.hostName ? "Raid Leader" : "Assault Team"}</p>
                                     </div>
                                     {member === currentLobby.hostName && (
                                       <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                         <Trophy className="w-3 h-3 text-amber-500" />
                                       </div>
                                     )}
                                 </div>
                              ))}
                              {Array.from({ length: Math.max(0, currentLobby.maxMembers - (currentLobby.members?.length || 0)) }).map((_, idx) => (
                                <div key={`empty-${idx}`} className="bg-slate-950/30 border border-dashed border-slate-800/60 p-4 rounded-2xl flex items-center gap-4 opacity-50">
                                   <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                                      <Users className="w-4 h-4" />
                                   </div>
                                   <div>
                                      <h4 className="text-sm font-bold text-slate-600">Empty Slot</h4>
                                      <p className="text-[9px] text-slate-700 uppercase tracking-widest">Waiting for signal...</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     {currentLobby.hostName === playerName && (
                       <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-[2rem] p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-black text-indigo-300 uppercase tracking-widest">Raid Leader Privileges</h3>
                            <p className="text-[10px] text-indigo-400/70 font-mono mt-1">Initiate the dimensional transition sequence.</p>
                          </div>
                          <button className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-900/50 cursor-pointer flex items-center justify-center gap-2 transition-all">
                             <Swords className="w-4 h-4" />
                             Commence Divergence
                          </button>
                       </div>
                     )}
                  </div>

                  {/* Right Column: Chat Lattice */}
                  <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800/60 rounded-[2rem] flex flex-col overflow-hidden h-[600px] lg:h-auto">
                     <div className="p-4 border-b border-slate-800 bg-slate-950/50 font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2 shrink-0">
                        <MessageSquare className="w-4 h-4 text-slate-500" />
                        Tactical Comms
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[10px] sm:text-xs">
                        {currentLobby.messages?.map((msg: any, i: number) => {
                          const isSystem = msg.sender === "System";
                          const isMe = msg.sender === playerName;
                          if (isSystem) {
                            return (
                              <div key={i} className="text-center">
                                <span className="inline-block px-3 py-1 rounded bg-slate-950 border border-slate-800 text-slate-500 text-[9px] uppercase tracking-wider">
                                  {msg.text}
                                </span>
                              </div>
                            );
                          }
                          return (
                            <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                               <span className={`text-[9px] mb-1 font-bold ${isMe ? "text-indigo-400" : "text-emerald-400"}`}>{msg.sender}</span>
                               <div className={`px-3 py-2 rounded-xl max-w-[85%] ${isMe ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-slate-800 text-slate-200 rounded-tl-sm"}`}>
                                  {msg.text}
                               </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                     </div>
                     <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/80 shrink-0 flex gap-2">
                        <input
                           type="text"
                           value={chatInput}
                           onChange={(e) => setChatInput(e.target.value)}
                           placeholder="Transmit message..."
                           className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 font-mono"
                        />
                        <button type="submit" disabled={!chatInput.trim()} className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50">
                           <Send className="w-4 h-4" />
                        </button>
                     </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: "Successful Raids", value: "14", trend: "+2", icon: Trophy, color: "text-amber-400" },
                   { label: "MVP Awards", value: "3", trend: "+1", icon: Zap, color: "text-indigo-400" },
                   { label: "Total Party EXP", value: "45,000", trend: "+4.5k", icon: Flame, color: "text-rose-400" }
                 ].map((stat, i) => (
                   <div key={i} className="bg-slate-900/50 border border-slate-800/60 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center">
                      <stat.icon className={`w-8 h-8 ${stat.color} mb-4`} />
                      <h4 className="text-3xl font-black text-white font-mono">{stat.value}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] text-emerald-400 font-bold mt-4">
                        {stat.trend} this week
                      </div>
                   </div>
                 ))}
              </div>

              <div className="bg-slate-900/50 border border-slate-800/60 rounded-[2rem] p-6 lg:p-8">
                 <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <Activity className="w-4 h-4 text-indigo-400" />
                   Recent Lattice Operations
                 </h3>

                 <div className="space-y-3">
                   {[
                     { raid: "Subzero Frost Rift", role: "DPS / Leader", date: "2 Hrs Ago", result: "Victory", score: "S-Rank" },
                     { raid: "Demon Castle Towers", role: "Support", date: "Yesterday", result: "Victory", score: "A-Rank" },
                     { raid: "Goblin Outpost", role: "DPS", date: "3 Days Ago", result: "Abandoned", score: "F-Rank" }
                   ].map((log, i) => (
                     <div key={i} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                           <h4 className="text-sm font-bold text-white">{log.raid}</h4>
                           <p className="text-[10px] text-slate-500 font-mono mt-0.5">Role: {log.role} &middot; {log.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${log.result === 'Victory' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                             {log.result}
                           </span>
                           <span className="text-[10px] font-black uppercase text-indigo-300 w-12 text-right">{log.score}</span>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal for Creating Lobby */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 lg:p-8 w-full max-w-md relative z-10 shadow-2xl"
            >
              <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                <Radio className="w-5 h-5 text-indigo-400" />
                Initialize Party Lattice
              </h2>
              <form onSubmit={handleCreateLobby} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Dimensional Node</label>
                  <input 
                    type="text" 
                    value={newLobbyData.target}
                    onChange={(e) => setNewLobbyData({...newLobbyData, target: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Members</label>
                    <select 
                      value={newLobbyData.maxMembers}
                      onChange={(e) => setNewLobbyData({...newLobbyData, maxMembers: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    >
                      {[2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} Hunters</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Level Reqt</label>
                    <input 
                      type="number"
                      min={1}
                      value={newLobbyData.minLevel}
                      onChange={(e) => setNewLobbyData({...newLobbyData, minLevel: Number(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-indigo-500/20 cursor-pointer"
                  >
                    Broadcast
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}

