import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  MessageSquare, 
  Users, 
  UserPlus, 
  Send, 
  CheckCircle, 
  XCircle,
  Gamepad2
} from "lucide-react";
import { ChatMessage, Friendship, sendChatMessage, listenToMessages, sendFriendRequest, acceptFriendRequest, listenToFriendships, deleteFriendship } from "../utils/social";
import { fetchLeaderboard, LeaderboardUser } from "../utils/firebase";

interface SocialHubProps {
  playerName: string;
  onOpenPartyMode: () => void;
  playSelectSound: () => void;
  initialTab?: "chat" | "leaderboard" | "friends";
}

interface FriendCardProps {
  friendship: Friendship;
  playerName: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onOpenDm: (name: string) => void;
  playSelectSound: () => void;
}

const FriendCard: React.FC<FriendCardProps> = ({ friendship, playerName, onAccept, onDecline, onOpenDm, playSelectSound }) => {
  const [showChatOption, setShowChatOption] = useState(false);
  const friendName = friendship.userUids.find(id => id !== playerName) || "Unknown Hunter";

  return (
    <motion.div layout className="bg-slate-950/80 border border-slate-900 overflow-hidden rounded-2xl flex flex-col group hover:border-cyan-500/30 transition-all">
       <div className="p-4 flex items-center justify-between">
         <div 
           role="button"
           tabIndex={0}
           className="flex items-center gap-3 cursor-pointer outline-none focus:ring-1 focus:ring-cyan-500 rounded-lg p-1"
           onClick={() => {
             if (friendship.status === 'accepted') {
               onOpenDm(friendName);
             } else {
               setShowChatOption(!showChatOption);
             }
           }}
           onKeyDown={(e) => {
             if (e.key === 'Enter' || e.key === ' ') {
               if (friendship.status === 'accepted') {
                 onOpenDm(friendName);
               } else {
                 setShowChatOption(!showChatOption);
               }
             }
           }}
           aria-label={`Friend: ${friendName}. Status: ${friendship.status}. Click for options.`}
         >
            <div className={`w-2.5 h-2.5 rounded-full ${friendship.status === 'accepted' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500 animate-pulse shadow-[0_0_10px_#eab308]'}`} aria-hidden="true" />
            <div>
              <p className="text-sm font-black text-white uppercase tracking-wider group-hover:text-cyan-300 transition-colors">{friendName}</p>
              <p className="text-[9px] text-slate-500 font-mono uppercase">{friendship.status === 'pending' ? 'Holographic Request' : 'Shadow Ally'}</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
          {friendship.status === 'pending' && friendship.requestedBy !== playerName && (
             <div className="flex gap-2">
                <button aria-label="Accept Request" onClick={() => onAccept(friendship.id)} className="bg-green-500/10 text-green-400 p-2 rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-all"><CheckCircle className="w-5 h-5" /></button>
                <button aria-label="Decline Request" onClick={() => onDecline(friendship.id)} className="bg-red-500/10 text-red-400 p-2 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all"><XCircle className="w-5 h-5" /></button>
             </div>
          )}
          {friendship.status === 'accepted' && (
            <button 
              aria-label={`Open chat with ${friendName}`}
              onClick={() => { try { playSelectSound(); } catch(e){} onOpenDm(friendName); }}
              className="p-2 bg-slate-900 text-cyan-400 border border-slate-800 rounded-xl hover:bg-cyan-500 hover:text-white transition-all shadow-lg"
            >
              <MessageSquare className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
         </div>
       </div>
       
       <AnimatePresence>
         {showChatOption && friendship.status === 'accepted' && (
           <motion.button
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: "auto", opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             onClick={() => { try { playSelectSound(); } catch(e){} onOpenDm(friendName); }}
             className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border-t border-cyan-500/20 py-2 text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] transition-all"
           >
             Open in Chat
           </motion.button>
         )}
       </AnimatePresence>
    </motion.div>
  );
};

export const SocialHub: React.FC<SocialHubProps> = ({ playerName, onOpenPartyMode, playSelectSound, initialTab }) => {
  const [socialTab, setSocialTab] = useState<"chat" | "leaderboard" | "friends">(initialTab || "chat");
  
  // Private DM State
  const [activeDmFriend, setActiveDmFriend] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<ChatMessage[]>([]);
  const [dmInput, setDmInput] = useState("");
  const dmEndRef = useRef<HTMLDivElement>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Friends State
  const [friendships, setFriendships] = useState<Friendship[]>([]);

  useEffect(() => {
    if (socialTab === "leaderboard") {
      const loadLeaderboard = async () => {
        setLoadingLeaderboard(true);
        const data = await fetchLeaderboard();
        setLeaderboardData(data);
        setLoadingLeaderboard(false);
      };
      loadLeaderboard();
    }
  }, [socialTab]);

  useEffect(() => {
    if (socialTab === "chat" && !activeDmFriend) {
      const unsub = listenToMessages("global", (msgs) => {
        setMessages(msgs);
      });
      return () => unsub();
    }
  }, [socialTab, activeDmFriend]);

  useEffect(() => {
    if (activeDmFriend) {
      const channel = [playerName, activeDmFriend].sort().join("::");
      const unsub = listenToMessages(channel, (msgs) => {
        setDmMessages(msgs);
      });
      return () => unsub();
    } else {
      setDmMessages([]);
    }
  }, [activeDmFriend, playerName]);

  useEffect(() => {
    const unsub = listenToFriendships(playerName, (list) => {
      setFriendships(list);
    });
    return () => unsub();
  }, [playerName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    dmEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dmMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    try { playSelectSound(); } catch (err) {}
    await sendChatMessage(playerName, playerName, msgInput, "global");
    setMsgInput("");
  };

  const handleSendDm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmInput.trim() || !activeDmFriend) return;
    const channel = [playerName, activeDmFriend].sort().join("::");
    try { playSelectSound(); } catch (err) {}
    await sendChatMessage(playerName, playerName, dmInput, channel);
    setDmInput("");
  };

  const handleAddFriend = async (targetPlayer: string) => {
    if (targetPlayer === playerName) return;
    try { playSelectSound(); } catch (err) {}
    await sendFriendRequest(playerName, targetPlayer);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 p-1">
      {/* Header with Party Mode Entry */}
      <div className="flex justify-between items-center bg-slate-950/80 border border-cyan-500/20 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-white tracking-widest flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" /> SOCIAL HUB
          </h2>
          <p className="text-[10px] text-slate-500 font-mono tracking-tighter">CROSS-DIMENSIONAL HUNTER NETWORK</p>
        </div>
        <button 
          onClick={() => { 
            try { playSelectSound(); } catch(e){} 
            window.history.pushState({}, "", "/party");
            // Dispatch a popstate event so App.tsx picks it up immediately
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform">
             <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">Party Mode</span>
        </button>
      </div>

      {/* Social Navigation Tabs */}
      <nav role="tablist" aria-label="Social Sections" className="flex bg-slate-950 border border-slate-900 rounded-xl p-1 gap-1">
        {(["chat", "leaderboard", "friends"] as const).map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={socialTab === tab}
            aria-controls={`${tab}-panel`}
            onClick={() => { 
               try { playSelectSound(); } catch(e){} 
               setSocialTab(tab); 
               if (tab !== "friends") setActiveDmFriend(null);
            }}
            className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-1.5 ${socialTab === tab ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]" : "text-slate-500 hover:text-slate-300"}`}
            aria-label={tab === "chat" ? "Community Chat" : tab === "friends" ? "Shadow Allies" : "Hunter Leaderboard"}
          >
            {tab === "chat" && <MessageSquare className="w-5 h-5" aria-hidden="true" />}
            {tab === "leaderboard" && <Trophy className="w-5 h-5" aria-hidden="true" />}
            {tab === "friends" && <Users className="w-5 h-5" aria-hidden="true" />}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {socialTab === "chat" && (
           <div id="chat-panel" role="tabpanel" aria-labelledby="chat-tab" className="flex flex-col h-[500px] bg-slate-950/60 border border-slate-900 rounded-2xl overflow-hidden backdrop-blur-sm">
             {activeDmFriend ? (
               <>
                 <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">TRANSMISSION: {activeDmFriend}</span>
                    </div>
                    <button 
                      onClick={() => { setActiveDmFriend(null); setSocialTab("friends"); }} 
                      className="text-[10px] text-slate-500 hover:text-cyan-400 font-bold uppercase transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" /> Back to Friends
                    </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                   {dmMessages.length === 0 ? (
                     <div className="h-full flex items-center justify-center text-slate-600 font-mono text-xs italic">
                       No previous transmissions. Initiate contact.
                     </div>
                   ) : (
                     dmMessages.map((m, i) => (
                       <div key={m.id || i} className={`flex flex-col ${m.senderId === playerName ? "items-end" : "items-start"}`}>
                         <div className={`px-4 py-2 rounded-2xl text-sm break-words max-w-[85%] shadow-lg ${m.senderId === playerName ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none"}`}>
                           {m.text}
                         </div>
                       </div>
                     ))
                   )}
                   <div ref={dmEndRef} />
                 </div>
                 <form onSubmit={handleSendDm} className="p-4 bg-slate-950 border-t border-slate-900 flex gap-2">
                   <input 
                     type="text" 
                     value={dmInput}
                     onChange={(e) => setDmInput(e.target.value)}
                     placeholder="Private frequency..."
                     className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                   />
                   <button type="submit" className="bg-indigo-500 text-white p-3 rounded-xl hover:bg-indigo-400 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                     <Send className="w-5 h-5" />
                   </button>
                 </form>
               </>
             ) : (
               <>
                 <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                   {messages.length === 0 ? (
                     <div className="h-full flex items-center justify-center text-slate-600 font-mono text-xs italic">
                       Transmission silent. Start the recruitment call.
                     </div>
                   ) : (
                     messages.map((m, i) => (
                       <div key={m.id || i} className={`flex flex-col ${m.senderId === playerName ? "items-end" : "items-start"}`}>
                         <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-[10px] font-bold text-slate-500 font-mono">{m.senderName}</span>
                            {m.senderId !== playerName && (
                              <button 
                                onClick={() => handleAddFriend(m.senderId)}
                                className="text-[9px] text-cyan-500/60 hover:text-cyan-400 font-bold uppercase tracking-tighter"
                              >
                                + Add Friend
                              </button>
                            )}
                         </div>
                         <div className={`px-4 py-2 rounded-2xl text-sm break-words max-w-[85%] shadow-lg ${m.senderId === playerName ? "bg-cyan-600 text-white rounded-tr-none" : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none"}`}>
                           {m.text}
                         </div>
                       </div>
                     ))
                   )}
                   <div ref={chatEndRef} />
                 </div>
                 <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-slate-900 flex gap-2">
                   <input 
                     type="text" 
                     value={msgInput}
                     onChange={(e) => setMsgInput(e.target.value)}
                     placeholder="Broadcast frequency..."
                     className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                   />
                   <button type="submit" className="bg-cyan-500 text-white p-3 rounded-xl hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                     <Send className="w-5 h-5" />
                   </button>
                 </form>
               </>
             )}
           </div>
        )}

        {socialTab === "leaderboard" && (
           <div id="leaderboard-panel" role="tabpanel" className="bg-slate-950/75 border border-slate-900 p-4 rounded-2xl backdrop-blur-md">
           {loadingLeaderboard ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
               <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Syncing rankings...</p>
             </div>
           ) : (
             <div className="overflow-x-auto rounded-xl">
               <table className="w-full text-left font-mono text-xs">
                 <thead>
                   <tr className="text-slate-500 border-b border-slate-900/50 bg-slate-950/80 px-2">
                     <th className="py-3 px-2">Rank</th>
                     <th className="py-3 px-2">Hunter</th>
                     <th className="py-3 px-2 text-center">Level</th>
                     <th className="py-3 px-2 text-right">Mana</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-900/40">
                   {leaderboardData.map((hunter, i) => (
                     <tr key={i} className={`group transition-colors ${hunter.playerName === playerName ? "bg-cyan-500/5" : "hover:bg-slate-900/40"}`}>
                       <td className="py-4 px-2 font-black text-slate-500 group-hover:text-cyan-400 transition-colors">#{i + 1}</td>
                       <td className="py-4 px-2 font-bold text-white flex items-center gap-2 flex-wrap">
                         <span className={hunter.playerName === playerName ? "text-cyan-400" : ""}>{hunter.playerName}</span>
                         {hunter.playerName !== playerName && (
                           <button 
                             onClick={() => handleAddFriend(hunter.playerName)} 
                             className="p-1.5 bg-slate-900 border border-slate-800 text-cyan-500/60 hover:text-cyan-400 hover:border-cyan-500/30 rounded-lg transition-all"
                           >
                             <UserPlus className="w-3.5 h-3.5" />
                           </button>
                         )}
                       </td>
                       <td className="py-4 px-2 text-center text-cyan-300 font-bold">{hunter.level}</td>
                       <td className="py-4 px-2 text-right text-indigo-400 font-black tracking-wider">{hunter.gold.toLocaleString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </div>
        )}

        {socialTab === "friends" && (
          <div id="friends-panel" role="tabpanel" className="space-y-4">
             <div className="flex items-center gap-2 px-2">
               <div className="w-1 h-3 bg-cyan-500 rounded-full" />
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">FRIENDS</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {friendships.map(f => (
                  <FriendCard 
                    key={f.id}
                    friendship={f}
                    playerName={playerName}
                    onAccept={acceptFriendRequest}
                    onDecline={deleteFriendship}
                    onOpenDm={(name) => { 
                      try { playSelectSound(); } catch(e){} 
                      setActiveDmFriend(name);
                      setSocialTab("chat");
                    }}
                    playSelectSound={playSelectSound}
                  />
                ))}
             </div>
             {friendships.length === 0 && (
               <div className="text-center py-20 bg-slate-950/40 border-2 border-dashed border-slate-900 rounded-3xl">
                  <Users className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">No Shadow Allies Linked</p>
                  <p className="text-[10px] text-slate-600 max-w-[200px] mx-auto mt-2 italic font-mono uppercase">Broadcast coordinates in Chat to recruit new hunters.</p>
               </div>
             )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
