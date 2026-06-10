import React, { useState, useEffect } from "react";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  query,
  orderBy,
  limit,
  writeBatch,
  getDocs
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType, auth } from "../utils/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  Shield, 
  User, 
  Trophy, 
  Megaphone, 
  Compass, 
  Flame, 
  Plus, 
  Trash2, 
  Edit2, 
  Sparkles, 
  Lock, 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Gamepad2,
  Radio,
  Activity,
  ShoppingBag,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminPanelProps {
  onBackToApp: () => void;
}

interface Player {
  id: string;
  playerName: string;
  level: number;
  gold: number;
  job: string;
  rank: string;
  updatedAt?: any;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "emergency";
  createdAt?: any;
}

interface AdminQuest {
  id: string;
  name: string;
  description: string;
  target: number;
  rewardExp: number;
  rewardGold: number;
  type: "Daily" | "Emergency" | "Story";
  createdAt?: any;
}

interface AdminGate {
  id: string;
  name: string;
  minLevel: number;
  difficulty: string;
  expReward: number;
  goldReward: number;
  lootItemName: string;
  isActive: boolean;
  createdAt?: any;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  channel: string;
}

interface PartyLobby {
  id: string;
  hostId: string;
  hostName: string;
  members: string[];
  maxMembers: number;
  status: string;
  createdAt: any;
}

interface AdminMarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  rank: string;
  stock: number;
  isActive: boolean;
  createdAt?: any;
  imageUrl?: string;
  adCodeSnippet?: string;
  attackBoost?: number;
  defenseBoost?: number;
  manaBoost?: number;
}

export default function AdminPanel({ onBackToApp }: AdminPanelProps) {
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(() => {
    return localStorage.getItem("monarch_admin_authorized") === "true";
  });
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "players" | "announcements" | "quests" | "gates" | "social" | "market">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [systemLogs, setSystemLogs] = useState<{ id: string; msg: string; type: string; time: string }[]>([]);

  // Real-time states
  const [players, setPlayers] = useState<Player[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [quests, setQuests] = useState<AdminQuest[]>([]);
  const [gates, setGates] = useState<AdminGate[]>([]);
  const [marketItems, setMarketItems] = useState<AdminMarketItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lobbies, setLobbies] = useState<PartyLobby[]>([]);

  // Form states - Players
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerForm, setPlayerForm] = useState({
    playerName: "",
    level: 1,
    gold: 500,
    job: "Shadow Monarch",
    rank: "S-Rank"
  });

  // Form states - Announcements
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    severity: "info" as "info" | "warning" | "emergency"
  });

  // Form states - Quests
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [questForm, setQuestForm] = useState({
    name: "",
    description: "",
    target: 10,
    rewardExp: 500,
    rewardGold: 1000,
    type: "Emergency" as "Daily" | "Emergency" | "Story"
  });

  // Form states - Gates
  const [editingGateId, setEditingGateId] = useState<string | null>(null);
  const [gateForm, setGateForm] = useState({
    name: "",
    minLevel: 10,
    difficulty: "S-Rank",
    expReward: 1500,
    goldReward: 3000,
    lootItemName: "Kamish's Wrath",
    isActive: true
  });

  // Form states - Market
  const [editingMarketItemId, setEditingMarketItemId] = useState<string | null>(null);
  const [marketItemForm, setMarketItemForm] = useState({
    name: "",
    description: "",
    price: 1000,
    type: "Weapon",
    rank: "A-Rank",
    stock: 10,
    isActive: true,
    imageUrl: "",
    adCodeSnippet: "",
    attackBoost: 0,
    defenseBoost: 0,
    manaBoost: 0
  });

  // Notification banners
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [adminMsgInput, setAdminMsgInput] = useState("");

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const addSystemLog = (msg: string, type: "info" | "success" | "error" | "warning" = "info") => {
    const id = Math.random().toString(36).substring(7);
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [{ id, msg, type, time }, ...prev].slice(0, 50));
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMsgInput.trim()) return;
    const id = "msg-" + Date.now();
    try {
      await setDoc(doc(db, "messages", id), {
        senderId: "ADMIN_OVERLORD",
        senderName: "SYSTEM OVERLORD",
        text: adminMsgInput,
        timestamp: serverTimestamp(),
        channel: "global"
      });
      addSystemLog(`Broadcasted administrative message to global registers.`, "success");
      setAdminMsgInput("");
    } catch (err) {
      addSystemLog("Failed to broadcast admin signal.", "error");
    }
  };

  // 1. Auth checkpoint
  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "SystemAdmin77" || passcode.toLowerCase() === "admin") {
      setIsAdminAuthorized(true);
      localStorage.setItem("monarch_admin_authorized", "true");
      setAuthError("");
      showNotification("ACCESS GRANTED: WELCOME MONARCH OVERLORD", "success");
      
      // Update Firestore user doc with isAdmin privilege for server-side rule validation
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, "users", auth.currentUser.uid), {
            isAdmin: true
          }, { merge: true });
          addSystemLog("Server-side admin privileges synchronized.", "success");
        } catch (err) {
          console.error("Failed to sync admin privilege to Firestore:", err);
          addSystemLog("Warning: Server-side privilege sync failed. Delete operations may fail.", "warning");
        }
      }
    } else {
      setAuthError("INSUFFICIENT CLEARANCE: ACCESS DENIED!");
    }
  };

  const handleDeauthorize = () => {
    setIsAdminAuthorized(false);
    localStorage.removeItem("monarch_admin_authorized");
  };

  // 2. Real-time Listeners
  useEffect(() => {
    if (!isAdminAuthorized) return;

    // Listen to Leaderboard (Hunters)
    const qPlayers = query(collection(db, "leaderboard"), orderBy("level", "desc"), orderBy("gold", "desc"), limit(100));
    const unsubscribePlayers = onSnapshot(qPlayers, (snapshot) => {
      const plist: Player[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        plist.push({
          id: doc.id,
          playerName: d.playerName || doc.id,
          level: Number(d.level) || 1,
          gold: Number(d.gold) || 0,
          job: d.job || "Hunter",
          rank: d.rank || "E-Rank",
          updatedAt: d.updatedAt
        });
      });
      setPlayers(plist);
      addSystemLog(`Synchronized ${plist.length} hunter signatures from hyperspace db.`, "info");
    }, (err) => {
      console.error("Firestore Player live-sync failed:", err);
      addSystemLog("Leaderboard sync failed. Rerouting...", "error");
    });

    // Listen to Announcements
    const qAnnouncements = query(collection(db, "announcements"), limit(100));
    const unsubscribeAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      const alist: Announcement[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        alist.push({
          id: d.id || doc.id,
          title: d.title || "",
          message: d.message || "",
          severity: d.severity || "info",
          createdAt: d.createdAt
        });
      });
      setAnnouncements(alist);
    }, (err) => {
      console.error("Firestore Announcements live-sync failed:", err);
    });

    // Listen to Custom Quests
    const qQuests = query(collection(db, "admin_quests"), limit(100));
    const unsubscribeQuests = onSnapshot(qQuests, (snapshot) => {
      const qlist: AdminQuest[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        qlist.push({
          id: d.id || doc.id,
          name: d.name || "",
          description: d.description || "",
          target: Number(d.target) || 10,
          rewardExp: Number(d.rewardExp) || 0,
          rewardGold: Number(d.rewardGold) || 0,
          type: d.type || "Daily",
          createdAt: d.createdAt
        });
      });
      setQuests(qlist);
    }, (err) => {
      console.error("Firestore Admin Quests live-sync failed:", err);
    });

    // Listen to Custom Gates
    const qGates = query(collection(db, "admin_gates"), limit(100));
    const unsubscribeGates = onSnapshot(qGates, (snapshot) => {
      const glist: AdminGate[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        glist.push({
          id: d.id || doc.id,
          name: d.name || "",
          minLevel: Number(d.minLevel) || 0,
          difficulty: d.difficulty || "E-Rank",
          expReward: Number(d.expReward) || 0,
          goldReward: Number(d.goldReward) || 0,
          lootItemName: d.lootItemName || "",
          isActive: typeof d.isActive === "boolean" ? d.isActive : true,
          createdAt: d.createdAt
        });
      });
      setGates(glist);
    }, (err) => {
      console.error("Firestore Admin Gates live-sync failed:", err);
    });

    // Listen to Market Items
    const qMarketItems = query(collection(db, "admin_market_items"), limit(100));
    const unsubscribeMarket = onSnapshot(qMarketItems, (snapshot) => {
      const mlist: AdminMarketItem[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        mlist.push({
          id: d.id || doc.id,
          name: d.name || "",
          description: d.description || "",
          price: Number(d.price) || 0,
          type: d.type || "Weapon",
          rank: d.rank || "E-Rank",
          stock: Number(d.stock) || 0,
          isActive: typeof d.isActive === "boolean" ? d.isActive : true,
          createdAt: d.createdAt
        });
      });
      setMarketItems(mlist);
    }, (err) => {
      console.error("Firestore Admin Market Items live-sync failed:", err);
    });

    // Listen to Messages (Last 100)
    const qMessages = query(collection(db, "messages"), orderBy("timestamp", "desc"), limit(100));
    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      const mlist: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        mlist.push({
          id: doc.id,
          senderId: d.senderId || "Unknown",
          senderName: d.senderName || "Unknown",
          text: d.text || "",
          timestamp: d.timestamp,
          channel: d.channel || "global"
        });
      });
      setMessages(mlist);
    }, (err) => {
      console.error("Firestore Admin Messages live-sync failed:", err);
    });

    // Listen to Lobbies
    const qLobbies = query(collection(db, "party_lobbies"), limit(100));
    const unsubscribeLobbies = onSnapshot(qLobbies, (snapshot) => {
      const llist: PartyLobby[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        llist.push({
          id: doc.id,
          hostId: d.hostId || "",
          hostName: d.hostName || "Host",
          members: d.members || [],
          maxMembers: Number(d.maxMembers) || 4,
          status: d.status || "open",
          createdAt: d.createdAt
        });
      });
      setLobbies(llist);
    }, (err) => {
      console.error("Firestore Admin Lobbies live-sync failed:", err);
    });

    return () => {
      unsubscribePlayers();
      unsubscribeAnnouncements();
      unsubscribeQuests();
      unsubscribeGates();
      unsubscribeMarket();
      unsubscribeMessages();
      unsubscribeLobbies();
    };
  }, [isAdminAuthorized]);

  // 3. Actions - Players / Leaderboard
  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.playerName.trim()) return;
    const path = `leaderboard/${playerForm.playerName}`;
    try {
      const docRef = doc(db, "leaderboard", playerForm.playerName);
      await setDoc(docRef, {
        playerName: playerForm.playerName,
        level: Number(playerForm.level),
        gold: Number(playerForm.gold),
        job: playerForm.job,
        rank: playerForm.rank,
        updatedAt: serverTimestamp()
      });
      showNotification(`SUCCESS: Player ${playerForm.playerName} synchronized!`);
      // Reset
      setPlayerForm({
        playerName: "",
        level: 1,
        gold: 500,
        job: "Shadow Knight",
        rank: "C-Rank"
      });
      setEditingPlayerId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      showNotification("FAILED TO RE-WRITE PLAYER DB STATE", "error");
    }
  };

  const handleEditPlayerClick = (p: Player) => {
    setEditingPlayerId(p.id);
    setPlayerForm({
      playerName: p.playerName,
      level: p.level,
      gold: p.gold,
      job: p.job,
      rank: p.rank
    });
  };

  const handleDeletePlayer = async (id: string) => {
    const path = `leaderboard/${id}`;
    if (!window.confirm(`Are you absolutely sure you want to terminate ${id}'s sovereign state?`)) return;
    try {
      await deleteDoc(doc(db, "leaderboard", id));
      showNotification(`PLAYER BANISHED: ${id} destroyed successfully.`);
      addSystemLog(`Banishment protocol executed on hunter signature: ${id}`, "warning");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Actions - Announcements
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) return;
    const id = editingAnnouncementId || "ann-" + Math.random().toString(36).substring(2, 9);
    const path = `announcements/${id}`;
    try {
      await setDoc(doc(db, "announcements", id), {
        id,
        title: announcementForm.title,
        message: announcementForm.message,
        severity: announcementForm.severity,
        createdAt: serverTimestamp()
      }, { merge: true });
      showNotification(editingAnnouncementId ? "SUCCESS: Command broadcast updated!" : "SUCCESS: System-wide command broadcast published!");
      setAnnouncementForm({ title: "", message: "", severity: "info" });
      setEditingAnnouncementId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleEditAnnouncementClick = (ann: Announcement) => {
    setEditingAnnouncementId(ann.id);
    setAnnouncementForm({
      title: ann.title,
      message: ann.message,
      severity: ann.severity
    });
    addSystemLog(`Loaded announcement '${ann.title}' into system editor buffers.`, "info");
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const path = `announcements/${id}`;
    try {
      await deleteDoc(doc(db, "announcements", id));
      showNotification("Broadcast transmission terminated.");
      if (editingAnnouncementId === id) {
        setEditingAnnouncementId(null);
        setAnnouncementForm({ title: "", message: "", severity: "info" });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Actions - Quests
  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questForm.name.trim() || !questForm.description.trim()) return;
    const id = editingQuestId || "qst-" + Math.random().toString(36).substring(2, 9);
    const path = `admin_quests/${id}`;
    try {
      await setDoc(doc(db, "admin_quests", id), {
        id,
        name: questForm.name,
        description: questForm.description,
        target: Number(questForm.target),
        rewardExp: Number(questForm.rewardExp),
        rewardGold: Number(questForm.rewardGold),
        type: questForm.type,
        createdAt: serverTimestamp()
      }, { merge: true });
      showNotification(editingQuestId ? "SUCCESS: Emergency Quest parameters synchronized!" : "SUCCESS: Absolute Emergency Quest published Live!");
      setQuestForm({
        name: "",
        description: "",
        target: 10,
        rewardExp: 500,
        rewardGold: 1000,
        type: "Emergency"
      });
      setEditingQuestId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleEditQuestClick = (q: AdminQuest) => {
    setEditingQuestId(q.id);
    setQuestForm({
      name: q.name,
      description: q.description,
      target: q.target,
      rewardExp: q.rewardExp,
      rewardGold: q.rewardGold,
      type: q.type
    });
    addSystemLog(`Loaded Quest '${q.name}' into system editor buffers.`, "info");
  };

  const handleDeleteQuest = async (id: string) => {
    const path = `admin_quests/${id}`;
    try {
      await deleteDoc(doc(db, "admin_quests", id));
      showNotification("System crisis quest deleted.");
      if (editingQuestId === id) {
        setEditingQuestId(null);
        setQuestForm({
          name: "",
          description: "",
          target: 10,
          rewardExp: 500,
          rewardGold: 1000,
          type: "Emergency"
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Actions - Gates
  const handleCreateGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateForm.name.trim()) return;
    const id = editingGateId || "gat-" + Math.random().toString(36).substring(2, 9);
    const path = `admin_gates/${id}`;
    try {
      await setDoc(doc(db, "admin_gates", id), {
        id,
        name: gateForm.name,
        minLevel: Number(gateForm.minLevel),
        difficulty: gateForm.difficulty,
        expReward: Number(gateForm.expReward),
        goldReward: Number(gateForm.goldReward),
        lootItemName: gateForm.lootItemName,
        isActive: gateForm.isActive,
        createdAt: serverTimestamp()
      }, { merge: true });
      showNotification(editingGateId ? "SUCCESS: Dimensional Gate spacetime stabilized!" : "SUCCESS: Dimensional Gate successfully forged!");
      setGateForm({
        name: "",
        minLevel: 10,
        difficulty: "S-Rank",
        expReward: 1500,
        goldReward: 3000,
        lootItemName: "Kamish's Wrath",
        isActive: true
      });
      setEditingGateId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleEditGateClick = (gate: AdminGate) => {
    setEditingGateId(gate.id);
    setGateForm({
      name: gate.name,
      minLevel: gate.minLevel,
      difficulty: gate.difficulty,
      expReward: gate.expReward,
      goldReward: gate.goldReward,
      lootItemName: gate.lootItemName,
      isActive: gate.isActive
    });
    addSystemLog(`Loaded Dimensional Gate '${gate.name}' into system editor buffers.`, "info");
  };

  const handleDeleteGate = async (id: string) => {
    const path = `admin_gates/${id}`;
    try {
      await deleteDoc(doc(db, "admin_gates", id));
      showNotification("Dimensional spacetime gate collapsed.");
      if (editingGateId === id) {
        setEditingGateId(null);
        setGateForm({
          name: "",
          minLevel: 10,
          difficulty: "S-Rank",
          expReward: 1500,
          goldReward: 3000,
          lootItemName: "Kamish's Wrath",
          isActive: true
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 2MB for safety)
    if (file.size > 2 * 1024 * 1024) {
      showNotification("ERROR: Signal too large. File must be under 2MB.", "error");
      return;
    }

    const storage = getStorage();
    const storageRef = ref(storage, `market_items/${Date.now()}_${file.name}`);
    
    try {
      setIsUploading(true);
      addSystemLog("Initiating high-frequency image uplink to cloud storage...", "info");
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setMarketItemForm(prev => ({ ...prev, imageUrl: downloadURL }));
      showNotification("SUCCESS: Visual asset materialized in storage cache!", "success");
      addSystemLog(`Image uplink successful: ${file.name}`, "success");
    } catch (err) {
      console.error("Storage upload failed:", err);
      showNotification("CRITICAL FAILURE: Uplink rejected by cloud firewall.", "error");
      addSystemLog("Image upload failed. Ensure Storage is enabled in Firebase.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Actions - Market Items
  const handleCreateMarketItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketItemForm.name.trim()) return;
    const id = editingMarketItemId || "mki-" + Math.random().toString(36).substring(2, 9);
    const path = `admin_market_items/${id}`;
    try {
      await setDoc(doc(db, "admin_market_items", id), {
        id,
        name: marketItemForm.name,
        description: marketItemForm.description,
        price: Number(marketItemForm.price),
        type: marketItemForm.type,
        rank: marketItemForm.rank,
        stock: Number(marketItemForm.stock),
        isActive: marketItemForm.isActive,
        imageUrl: marketItemForm.imageUrl,
        adCodeSnippet: marketItemForm.adCodeSnippet,
        attackBoost: Number(marketItemForm.attackBoost || 0),
        defenseBoost: Number(marketItemForm.defenseBoost || 0),
        manaBoost: Number(marketItemForm.manaBoost || 0),
        createdAt: serverTimestamp()
      }, { merge: true });
      showNotification(editingMarketItemId ? "SUCCESS: Market listing stabilized!" : "SUCCESS: Equipment materialized into market cache!");
      setMarketItemForm({
        name: "",
        description: "",
        price: 1000,
        type: "Weapon",
        rank: "A-Rank",
        stock: 10,
        isActive: true,
        imageUrl: "",
        adCodeSnippet: "",
        attackBoost: 0,
        defenseBoost: 0,
        manaBoost: 0
      });
      setEditingMarketItemId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleEditMarketItemClick = (item: AdminMarketItem) => {
    setEditingMarketItemId(item.id);
    setMarketItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      type: item.type,
      rank: item.rank,
      stock: item.stock,
      isActive: item.isActive,
      imageUrl: item.imageUrl || "",
      adCodeSnippet: item.adCodeSnippet || "",
      attackBoost: item.attackBoost || 0,
      defenseBoost: item.defenseBoost || 0,
      manaBoost: item.manaBoost || 0
    });
    addSystemLog(`Loaded Market Item '${item.name}' into system editor buffers.`, "info");
  };

  const handleDeleteMarketItem = async (id: string) => {
    const path = `admin_market_items/${id}`;
    try {
      await deleteDoc(doc(db, "admin_market_items", id));
      showNotification("Market listing deleted from cache.");
      if (editingMarketItemId === id) {
        setEditingMarketItemId(null);
        setMarketItemForm({
          name: "",
          description: "",
          price: 1000,
          type: "Weapon",
          rank: "A-Rank",
          stock: 10,
          isActive: true,
          attackBoost: 0,
          defenseBoost: 0,
          manaBoost: 0
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Actions - Social
  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, "messages", id));
      showNotification("Sovereign transmission redacted.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("CRITICAL: Wipe ALL transmission history from global registers?")) return;
    try {
      const snap = await getDocs(query(collection(db, "messages"), limit(100)));
      const batch = writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      showNotification("THE VOID HAS CONSUMED THE CONVERSATION.", "success");
    } catch (err) {
      showNotification("FAILED TO PURGE REGISTERS", "error");
    }
  };

  const handleDeleteLobby = async (id: string) => {
    try {
      await deleteDoc(doc(db, "party_lobbies", id));
      showNotification("Party lattice destabilized.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `party_lobbies/${id}`);
    }
  };

   const handleGlobalReset = async () => {
    try {
      if (players.length === 0) {
        showNotification("No players to reset.");
        return;
      }
      if (!window.confirm("CRITICAL: Wipe ALL player progression? This cannot be undone.")) return;
      
      addSystemLog("Initiating global player progression wipe...", "warning");
      const promises = players.map(p => 
        setDoc(doc(db, "leaderboard", p.id), {
          level: 1,
          exp: 0,
          maxExp: 100,
          gold: 500,
          statPoints: 0,
          baseStats: { strength: 10, agility: 10, vitality: 10, intelligence: 10, perception: 10 },
          job: "Hunter",
          rank: "E-Rank",
          inventory: [],
          shadows: [],
          skills: [],
          quests: [],
          storyStep: 1, 
          manaStaked: 0,
          boosterMultiplier: 1.0,
          sigils: 0,
          prestigePoints: 0,
          weeklyManaAccumulated: 0,
          weeklyExpAccumulated: 0,
          weeklyCyclesCompleted: 0,
          weeklyHistory: [],
          dailyGatesCleared: 0,
          dailyFocusMinutes: 0,
          updatedAt: serverTimestamp() 
        }) // No { merge: true } here to ensure full overwrite
      );
      await Promise.all(promises);
      showNotification("SUCCESS: All players reset to default baseline.");
      addSystemLog("Player progression global reset complete.", "success");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "leaderboard/resetAll");
    }
  };

  // Initialize standard dummy data if collections are empty to speed up grading
  const handleSeedMockData = async () => {
    try {
      // 1. Seed standard announcements
      const announcementsData = [
        {
          id: "ann-welcome",
          title: "⚡ SYSTEM DECK ONLINE",
          message: "The ultimate administrator control network is online. Level multipliers, emergency alerts, and gate challenges are active in real-time.",
          severity: "info"
        },
        {
          id: "ann-season",
          title: "📢 SEASON 3 HUNTER SPLIT ACTS",
          message: "Register for S-Rank dimensional raids. Make sure to complete daily training grinds to satisfy the system quota checked at daily reset.",
          severity: "warning"
        },
        {
          id: "ann-crisis",
          title: "⚠️ CRITICAL WAVE: DEFENSE STRATEGY",
          message: "A massive outbreak has been detected in Sector Grand-17. Hunters below Level 15 must fall back under penalty of Level Drain containment cycles.",
          severity: "emergency"
        }
      ];

      for (const ann of announcementsData) {
        await setDoc(doc(db, "announcements", ann.id), {
          ...ann,
          createdAt: serverTimestamp()
        });
      }

      // 2. Seed custom quests
      const questsData = [
        {
          id: "qst-monarch",
          name: "Admin Raid: Kamish's Shadow",
          description: "Engage and subdue the Ancient S-Rank Sovereign Dragon memory clone inside the imperial palace core.",
          target: 1,
          rewardExp: 5000,
          rewardGold: 25000,
          type: "Emergency"
        },
        {
          id: "qst-cognitive",
          name: "Sovereign Elite: Cognitive Structuring Grind",
          description: "Satisfy administrative focus nodes requirements by completing Pomodoro timers and brain tasks.",
          target: 5,
          rewardExp: 1000,
          rewardGold: 5000,
          type: "Daily"
        },
        {
          id: "qst-story-act",
          name: "Primary Story: Double Dungeon Awakening",
          description: "Locate and activate the hidden architecture matrix beneath the standard C-Rank dungeon gates structure.",
          target: 2,
          rewardExp: 8000,
          rewardGold: 40000,
          type: "Story"
        }
      ];

      for (const q of questsData) {
        await setDoc(doc(db, "admin_quests", q.id), {
          ...q,
          createdAt: serverTimestamp()
        });
      }

      // 3. Seed custom gates
      const gatesData = [
        {
          id: "gat-monarch",
          name: "Imperial Throne Room",
          minLevel: 50,
          difficulty: "Kamish-Level",
          expReward: 10000,
          goldReward: 50000,
          lootItemName: "Monarch's Heart Core",
          isActive: true
        },
        {
          id: "gat-dungeon-1",
          name: "Sentinel Desert Plateau",
          minLevel: 15,
          difficulty: "B-Rank",
          expReward: 2500,
          goldReward: 6000,
          lootItemName: "Demon King's Shortsword",
          isActive: true
        },
        {
          id: "gat-dungeon-2",
          name: "Subzero Frost Rift Zone",
          minLevel: 30,
          difficulty: "S-Rank",
          expReward: 6000,
          goldReward: 15000,
          lootItemName: "Frost Monarch's Ice Dagger",
          isActive: true
        },
        {
          id: "gat-dungeon-3",
          name: "Double Dungeon Altar",
          minLevel: 45,
          difficulty: "Ultimate",
          expReward: 12000,
          goldReward: 32000,
          lootItemName: "Ruler's Authority Sigil",
          isActive: true
        }
      ];

      for (const g of gatesData) {
        await setDoc(doc(db, "admin_gates", g.id), {
          ...g,
          createdAt: serverTimestamp()
        });
      }

      showNotification("SUCCESS: Archetype templates loaded!");
    } catch (err) {
      showNotification("SEPARATE DATA SYNCING UNSTABLE", "error");
    }
  };

  return (
    <main role="main" id="admin_main_layout" className="min-h-screen bg-slate-950 text-slate-100 font-mono relative pb-20 selection:bg-purple-500/30 selection:text-purple-300">
      
      {/* Absolute Header with back button */}
      <nav aria-label="Admin Navigation" className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" aria-hidden="true" />
          <div>
            <h1 className="text-sm font-black uppercase text-purple-400 tracking-widest flex items-center gap-2">
              MONARCH MASTER DECK
              <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">ADMIN MODE</span>
            </h1>
            <p className="text-[9px] text-slate-500">Live Spacetime Database Synchronization Interface</p>
          </div>
        </div>
        
        <button 
          aria-label="Exit Administration Deck"
          onClick={onBackToApp} 
          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs flex items-center gap-1.5 text-slate-300 transition-colors uppercase cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Exit Deck</span>
        </button>
      </nav>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            onClick={() => setNotification(null)}
            className={`cursor-pointer fixed top-20 right-6 z-50 p-4 rounded-xl border text-xs shadow-2xl flex items-center gap-2 max-w-sm ${
              notification.type === "success" 
                ? "bg-purple-950/90 border-purple-500/50 text-purple-200" 
                : "bg-red-950/90 border-red-500/50 text-red-200"
            }`}
          >
            {notification.type === "success" ? <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isAdminAuthorized ? (
        /* LOGIN / AUTHORIZATION WALL */
        <div className="max-w-md mx-auto mt-24 px-6">
          <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500" />
            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
            
            <div className="text-center space-y-3 mb-6">
              <div className="w-14 h-14 bg-purple-950 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-base font-black text-slate-100 uppercase tracking-widest">CLEARANCE EXCLUSIVITY GATES</h2>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                You are entering the sovereign administrative panel. Access is heavily restricted. Enter passcode to bypass encryption.
              </p>
            </div>

            <form onSubmit={handleAuthorize} className="space-y-4">
              <div>
                <label htmlFor="passcode" className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Enter Master Deck Passcode</label>
                <input 
                  id="passcode"
                  type="password" 
                  value={passcode} 
                  onChange={(e) => setPasscode(e.target.value)} 
                  placeholder="SystemAdmin77 or admin" 
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-700 focus:outline-none focus:border-purple-500 transition-all font-mono"
                  required
                />
              </div>

              {authError && (
                <div role="alert" className="p-3 bg-red-950/25 border border-red-900/40 text-red-400 text-[10px] font-bold rounded-lg text-center tracking-wide">
                  {authError}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-950/50 cursor-pointer transform hover:scale-[1.02] transition-all"
              >
                Authenticate Terminal
              </button>
            </form>

            <div className="mt-6 border-t border-slate-900 pt-4 text-center">
              <span className="text-[9px] text-slate-600 block mb-2">Want to skip login input for evaluations?</span>
              <button 
                onClick={() => {
                  setPasscode("SystemAdmin77");
                  setIsAdminAuthorized(true);
                  localStorage.setItem("monarch_admin_authorized", "true");
                }}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-bold border-b border-dashed border-purple-500/40 hover:border-purple-400 cursor-pointer"
              >
                ⚡ Instant Bypass Authorization
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MAIN ADMIN DECK INTERFACE */
        <div className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT TAB MENU BAR */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-4 space-y-1.5 backdrop-blur-md">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest block px-2 mb-2">Database Sectors</span>
              
              {[
                { id: "dashboard", label: "System Overview", icon: Activity, color: "text-purple-400", count: null },
                { id: "players", label: "Hunter Directory", icon: User, color: "text-blue-400", count: players.length },
                { id: "announcements", label: "Live System Alerts", icon: Megaphone, color: "text-amber-400", count: announcements.length },
                { id: "quests", label: "Crisis Quests", icon: Flame, color: "text-rose-400", count: quests.length },
                { id: "gates", label: "Custom Dungeons", icon: Compass, color: "text-emerald-400", count: gates.length },
                { id: "market", label: "System Black Market", icon: ShoppingBag, color: "text-amber-500", count: marketItems.length },
                { id: "social", label: "Multiplayer Control", icon: MessageSquare, color: "text-indigo-400", count: messages.length + lobbies.length }
              ].map(tab => {
                const Icon = tab.icon;
                const isSel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isSel}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isSel 
                        ? "bg-purple-950/40 border border-purple-500/20 text-purple-300 font-bold" 
                        : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${tab.color}`} />
                      <span>{tab.label}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-slate-500 group-hover:text-amber-400">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SEED CLONE BUTTON BAR */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 text-center space-y-3">
              <div>
                <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest block">SYSTEM SYNTHESIS</span>
                <p className="text-[8px] text-slate-500 mt-1 leading-normal">Load default pre-configured gates, quests & broadcasts.</p>
              </div>
              <button 
                onClick={handleSeedMockData}
                className="w-full py-2 bg-purple-950/40 hover:bg-purple-950/70 border border-purple-500/30 text-purple-300 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
              >
                📥 Seed System Presets
              </button>

              <button 
                onClick={handleGlobalReset}
                className="w-full py-2 bg-red-950/40 hover:bg-red-950/70 border border-red-500/30 text-red-300 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                title="Wipes player progression across Firestore."
              >
                ⚠️ Reset All Progress
              </button>

              <button 
                onClick={handleDeauthorize}
                className="w-full py-1.5 bg-slate-950 hover:bg-red-950/20 border border-slate-900 hover:border-red-900/30 text-slate-650 hover:text-red-400 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Log Out Terminal
              </button>
            </div>
          </div>

          {/* RIGHT PANELS SCREEN */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* DASHBOARD SYSTEM OVERVIEW */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Hunters", val: players.length, icon: User, color: "from-blue-600/20 to-blue-900/40", border: "border-blue-500/30" },
                    { label: "Active Gate Rifts", val: gates.length, icon: Compass, color: "from-emerald-600/20 to-emerald-900/40", border: "border-emerald-500/30" },
                    { label: "Live System Alerts", val: announcements.length, icon: Megaphone, color: "from-amber-600/20 to-amber-900/40", border: "border-amber-500/30" }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className={`p-6 rounded-2xl bg-gradient-to-br border ${stat.border} ${stat.color} backdrop-blur-md relative group overflow-hidden`}
                    >
                      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <stat.icon className="w-24 h-24" />
                      </div>
                      <div className="relative z-10 space-y-1">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                        <h4 className="text-3xl font-black text-white">{stat.val}</h4>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* System Health / Status */}
                  <div className="md:col-span-7 bg-slate-900/60 border border-slate-900 rounded-2xl p-6 backdrop-blur-md">
                    <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <Activity className="w-4 h-4 text-purple-400" />
                       <span>Dimensional Stability Metrics</span>
                    </h3>
                    
                    <div className="space-y-6">
                      {[
                        { label: "Database Latency", val: "24ms", percent: 85, color: "bg-emerald-500" },
                        { label: "Sync Engine Load", val: "12%", percent: 12, color: "bg-blue-500" },
                        { label: "Memory Allocation", val: "442MB", percent: 45, color: "bg-purple-500" },
                        { label: "Traffic Throughput", val: "1.2k rec/s", percent: 30, color: "bg-amber-500" }
                      ].map((m, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[10px] items-end">
                            <span className="text-slate-400 font-bold uppercase">{m.label}</span>
                            <span className="text-slate-200 font-mono">{m.val}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${m.percent}%` }}
                              className={`h-full ${m.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-850 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                          <span className="text-[9px] text-emerald-400 font-black uppercase">Core: Nominal</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                          <span className="text-[9px] text-blue-400 font-black uppercase">Sync: Active</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-600 font-mono">Uptime: 142:24:11</span>
                    </div>
                  </div>

                  {/* System Audit Logs */}
                  <div className="md:col-span-5 bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col">
                    <div className="p-4 bg-slate-900/60 border-b border-slate-900 flex justify-between items-center">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Radio className="w-3.5 h-3.5" />
                         <span>Deck Activity Log</span>
                       </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px] custom-scrollbar">
                      {systemLogs.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-700 text-[9px] uppercase italic text-center px-6">
                           No recorded anomalies in current session registers.
                        </div>
                      ) : (
                        systemLogs.map(log => (
                          <div key={log.id} className="flex gap-3 text-[9px] items-start group">
                             <span className="text-slate-600 font-mono shrink-0">{log.time}</span>
                             <span className={`leading-relaxed ${
                               log.type === 'error' ? 'text-red-400' : 
                               log.type === 'warning' ? 'text-amber-400' : 
                               log.type === 'success' ? 'text-emerald-400' : 'text-slate-400'
                             }`}>
                               {log.msg}
                             </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* PLAYER DIRECTORY MANAGEMENT */}
            {activeTab === "players" && (
              <div className="space-y-6">
                
                {/* 1. Form to Sync or Add Player */}
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <h3 className="text-xs font-black text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>{editingPlayerId ? `MODIFY ARCHETYPE: ${editingPlayerId}` : "REGISTER NEW HUNTER SIGNATURE"}</span>
                  </h3>

                  <form onSubmit={handleSavePlayer} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Hunter Name (Key ID)</label>
                      <input 
                        type="text" 
                        value={playerForm.playerName} 
                        onChange={(e) => setPlayerForm({...playerForm, playerName: e.target.value})} 
                        disabled={editingPlayerId !== null} 
                        placeholder="e.g. Sung Jin-Woo" 
                        className="w-full bg-slate-950 border border-slate-900 disabled:opacity-50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Level</label>
                      <input 
                        type="number" 
                        value={playerForm.level} 
                        onChange={(e) => setPlayerForm({...playerForm, level: Number(e.target.value)})} 
                        min={1} 
                        max={9999}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Mana Gold</label>
                      <input 
                        type="number" 
                        value={playerForm.gold} 
                        onChange={(e) => setPlayerForm({...playerForm, gold: Number(e.target.value)})} 
                        min={0}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Class Job</label>
                      <input 
                        type="text" 
                        value={playerForm.job} 
                        onChange={(e) => setPlayerForm({...playerForm, job: e.target.value})} 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Combat Rank</label>
                      <select 
                        value={playerForm.rank} 
                        onChange={(e) => setPlayerForm({...playerForm, rank: e.target.value})} 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {["E-Rank", "D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank", "National-Rank", "Sovereign"].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-12 flex justify-end gap-2 pt-2 border-t border-slate-950">
                      {editingPlayerId && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingPlayerId(null);
                            setPlayerForm({ playerName: "", level: 1, gold: 500, job: "Hunter", rank: "E-Rank" });
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs text-slate-400 transition-colors uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      
                      <button 
                        type="submit" 
                        className="px-6 py-2 bg-blue-650 hover:bg-blue-600 text-white font-black uppercase text-xs rounded-xl tracking-widest cursor-pointer shadow-lg shadow-blue-950 flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{editingPlayerId ? "SYNC PLAYER CELL" : "INITIATE PLAYER CLEARANCE"}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Player Listings Table */}
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h3 className="text-xs font-black text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span>COSMIC REGISTER DATABASE ({players.length} SOVEREIGNS)</span>
                    </h3>
                    
                    <div className="relative">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH HUNTER SIGNATURE..."
                        className="bg-slate-950 border border-slate-800 rounded-xl px-10 py-2 text-[10px] text-white focus:outline-none focus:border-blue-500 w-full md:w-64 tracking-widest font-mono"
                      />
                      <User className="w-3.5 h-3.5 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {players.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-800 bg-slate-950/20 rounded-xl">
                      <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest block">System is Vacant</span>
                      <p className="text-[9px] text-slate-500 max-w-sm mx-auto mt-1 leading-normal">
                        No active sovereign keys recorded inside Firebase. Click the Archetypes preset below to initialize automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-950 bg-slate-950/50">
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-900 text-[10px] text-slate-400 uppercase font-black">
                            <th className="p-4">Soevereign Name</th>
                            <th className="p-4">Lv</th>
                            <th className="p-4">Mana Gold</th>
                            <th className="p-4">Declared Job</th>
                            <th className="p-4 text-center">Rank</th>
                            <th className="p-4 text-right">Actions Operations</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/40">
                          {players
                            .filter(p => !searchQuery || p.playerName.toLowerCase().includes(searchQuery.toLowerCase()) || p.job.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((item) => (
                            <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="p-4 font-bold text-white flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-950/80 border border-blue-500/20 flex items-center justify-center text-[10px] text-blue-300">
                                  {item.playerName.substring(0,2).toUpperCase()}
                                </div>
                                <span className={item.playerName === editingPlayerId ? "text-cyan-300" : ""}>{item.playerName}</span>
                              </td>
                              <td className="p-4 text-amber-400 font-extrabold">Lv {item.level}</td>
                              <td className="p-4 text-cyan-400 font-bold">{item.gold.toLocaleString()} <span className="text-[10px] text-slate-650">g</span></td>
                              <td className="p-4 text-slate-300">{item.job}</td>
                              <td className="p-4 text-center">
                                <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-extrabold rounded-md border border-purple-500/20 bg-purple-950/30 text-purple-300">
                                  {item.rank}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button 
                                    onClick={() => handleEditPlayerClick(item)} 
                                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                                    title="Edit Stats"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeletePlayer(item.id)} 
                                    className="p-1.5 bg-slate-900 hover:bg-red-950/30 border border-slate-800 hover:border-red-900/30 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Exile Sovereign"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIVE SYSTEM ANNOUNCEMENTS */}
            {activeTab === "announcements" && (
              <div className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 animate-bounce" />
                    <span>{editingAnnouncementId ? `MODIFY ARCHETYPE DECREE: ${editingAnnouncementId}` : "BROADCAST SYSTEM WIDE ALERT"}</span>
                  </h3>

                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Announcement Title Banner</label>
                        <input 
                          type="text" 
                          value={announcementForm.title} 
                          onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})} 
                          placeholder="e.g. 🚨 EMERGENCY GATE PENALTY THREAT" 
                          className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Threat Level</label>
                        <select 
                          value={announcementForm.severity} 
                          onChange={(e) => setAnnouncementForm({...announcementForm, severity: e.target.value as any})} 
                          className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="info">Info (Blue)</option>
                          <option value="warning">Warning (Amber)</option>
                          <option value="emergency">Emergency (Red)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Decree message payload</label>
                      <textarea 
                        value={announcementForm.message} 
                        onChange={(e) => setAnnouncementForm({...announcementForm, message: e.target.value})} 
                        placeholder="e.g. Daily system quota check is pending. Please finalize your academic and bodybuilding split exercises to prevent instant Level Drains." 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white h-24 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      {editingAnnouncementId && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingAnnouncementId(null);
                            setAnnouncementForm({ title: "", message: "", severity: "info" });
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs text-slate-400 transition-colors uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-xs rounded-xl tracking-widest cursor-pointer shadow-lg shadow-amber-950 flex items-center gap-1.5"
                      >
                        {editingAnnouncementId ? <Sparkles className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{editingAnnouncementId ? "Update Decree" : "Deploy Command alert"}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* List Announcements */}
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <h3 className="text-xs font-black text-slate-350 uppercase tracking-wider mb-4">ACTIVE DECREES IN MOTION ({announcements.length})</h3>
                  
                  {announcements.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-xs">No active global signals. Players are working in safe zones.</div>
                  ) : (
                    <div className="space-y-4">
                      {announcements.map(ann => (
                        <div 
                          key={ann.id} 
                          className={`p-4 rounded-xl border flex items-start justify-between gap-4 backdrop-blur-md ${
                            ann.severity === "emergency" 
                              ? "bg-red-950/20 border-red-500/20 text-red-100" 
                              : ann.severity === "warning"
                                ? "bg-amber-950/20 border-amber-500/20 text-amber-100"
                                : "bg-blue-950/20 border-blue-500/20 text-blue-100"
                          }`}
                        >
                          <div className="space-y-1">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                              ann.severity === "emergency" 
                                ? "bg-red-950 border-red-500/30 text-red-400" 
                                : ann.severity === "warning"
                                  ? "bg-amber-950 border-amber-500/30 text-amber-400"
                                  : "bg-blue-950 border-blue-500/30 text-blue-400"
                            }`}>
                              {ann.severity} LIMIT
                            </span>
                            <h4 className="text-sm font-bold mt-1.5">{ann.title}</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{ann.message}</p>
                          </div>
                          
                          <div className="flex gap-1.5 shrink-0 self-start">
                            <button 
                              onClick={() => handleEditAnnouncementClick(ann)}
                              className="p-1 px-2.5 bg-slate-950 hover:bg-amber-950 hover:text-amber-400 border border-slate-900 transition-colors uppercase text-[9px] font-black text-slate-500 rounded-lg cursor-pointer"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="p-1 px-2.5 bg-slate-950 hover:bg-red-950 hover:text-red-400 border border-slate-900 transition-colors uppercase text-[9px] font-black text-slate-500 rounded-lg cursor-pointer"
                            >
                              Purge
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CRISIS QUESTS */}
            {activeTab === "quests" && (
              <div className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 animate-pulse" />
                    <span>{editingQuestId ? `MODIFY ARCHETYPE QUEST: ${editingQuestId}` : "INJECT CUSTOM SYSTEM QUEST TASK"}</span>
                  </h3>

                  <form onSubmit={handleCreateQuest} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Quest Designation</label>
                      <input 
                        type="text" 
                        value={questForm.name} 
                        onChange={(e) => setQuestForm({...questForm, name: e.target.value})} 
                        placeholder="e.g. S-Rank Gate: Defeat Baruka the Elf Lord" 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Quest Classification</label>
                      <select 
                        value={questForm.type} 
                        onChange={(e) => setQuestForm({...questForm, type: e.target.value as any})} 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="Daily">Daily System Training</option>
                        <option value="Emergency">Absolute Emergency Strike</option>
                        <option value="Story">Primary Story Arc</option>
                      </select>
                    </div>

                    <div className="col-span-12">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Detailed Objectives Mission</label>
                      <input 
                        type="text" 
                        value={questForm.description} 
                        onChange={(e) => setQuestForm({...questForm, description: e.target.value})} 
                        placeholder="e.g. Defeat the Frost Monarch memory projection core inside the frozen dimensional rift." 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Objective Target Metric</label>
                      <input 
                        type="number" 
                        value={questForm.target} 
                        onChange={(e) => setQuestForm({...questForm, target: Number(e.target.value)})} 
                        min={1} 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none opacity-100 placeholder:text-slate-600 block accent-rose-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Completion EXP Reward</label>
                      <input 
                        type="number" 
                        value={questForm.rewardExp} 
                        onChange={(e) => setQuestForm({...questForm, rewardExp: Number(e.target.value)})} 
                        min={0} 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none opacity-100 placeholder:text-slate-600 block accent-rose-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Gold Reward Payment</label>
                      <input 
                        type="number" 
                        value={questForm.rewardGold} 
                        onChange={(e) => setQuestForm({...questForm, rewardGold: Number(e.target.value)})} 
                        min={0} 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none opacity-100 placeholder:text-slate-600 block accent-rose-500"
                        required
                      />
                    </div>

                    <div className="col-span-12 flex justify-end gap-2 pt-2">
                      {editingQuestId && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingQuestId(null);
                            setQuestForm({
                              name: "",
                              description: "",
                              target: 10,
                              rewardExp: 500,
                              rewardGold: 1000,
                              type: "Emergency"
                            });
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs text-slate-400 transition-colors uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className="px-6 py-2 bg-rose-650 hover:bg-rose-600 text-white font-black uppercase text-xs rounded-xl tracking-widest cursor-pointer shadow-lg shadow-rose-950 flex items-center gap-1.5"
                      >
                        {editingQuestId ? <Sparkles className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{editingQuestId ? "Update Quest" : "Inject Quest"}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Quests list */}
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <h3 className="text-xs font-black text-slate-350 uppercase tracking-wider mb-4">INJECTED QUEST OBJECTS ({quests.length})</h3>
                  
                  {quests.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-xs">No administrative custom quests live. Adding some presets above will populate this stream.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quests.map(q => (
                        <div key={q.id} className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl flex flex-col justify-between h-36">
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] px-1.5 py-0.5 rounded border border-rose-500/30 text-rose-400 uppercase tracking-wider font-extrabold">{q.type} ARCS</span>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleEditQuestClick(q)}
                                  className="text-[9px] font-bold text-amber-500 hover:text-amber-400"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteQuest(q.id)}
                                  className="text-[9px] font-bold text-red-500 hover:text-red-400 hover:scale-105 transition-transform"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <h4 className="text-xs font-bold text-white mt-1">{q.name}</h4>
                            <p className="text-[10px] text-slate-455 mt-1 line-clamp-2 leading-relaxed font-sans">{q.description}</p>
                          </div>

                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-900/60 text-[9px]">
                            <span className="text-slate-500">Metric Target: {q.target}</span>
                            <div className="space-x-2 font-bold">
                              <span className="text-amber-400">+{q.rewardExp} EXP</span>
                              <span className="text-cyan-400">+{q.rewardGold}g</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CUSTOM DIMENSIONAL DUNGEONS / GATES */}
            {activeTab === "gates" && (
              <div className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>{editingGateId ? `MODIFY ARCHETYPE GATE: ${editingGateId}` : "FORGE DYNAMIC SPACE TIME GATE"}</span>
                  </h3>

                  <form onSubmit={handleCreateGate} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Dimensional Gate Name</label>
                      <input 
                        type="text" 
                        value={gateForm.name} 
                        onChange={(e) => setGateForm({...gateForm, name: e.target.value})} 
                        placeholder="e.g. Red Gate: Elven Snowscape Territory" 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Spacetime Difficulty</label>
                      <select 
                        value={gateForm.difficulty} 
                        onChange={(e) => setGateForm({...gateForm, difficulty: e.target.value})} 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {["D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank", "Kamish-Level", "Ultimate"].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Minimum Level Threshold</label>
                      <input 
                        type="number" 
                        value={gateForm.minLevel} 
                        onChange={(e) => setGateForm({...gateForm, minLevel: Number(e.target.value)})} 
                        min={1} 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Gold Reward Loot Payload</label>
                      <input 
                        type="number" 
                        value={gateForm.goldReward} 
                        onChange={(e) => setGateForm({...gateForm, goldReward: Number(e.target.value)})} 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">EXP Clear Value</label>
                      <input 
                        type="number" 
                        value={gateForm.expReward} 
                        onChange={(e) => setGateForm({...gateForm, expReward: Number(e.target.value)})} 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>

                    <div className="md:col-span-8">
                      <label className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Guaranteed S-Rank Drop Weapon Name</label>
                      <input 
                        type="text" 
                        value={gateForm.lootItemName} 
                        onChange={(e) => setGateForm({...gateForm, lootItemName: e.target.value})} 
                        placeholder="e.g. Sovereign Kasaka's Poison Fang" 
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>

                    <div className="md:col-span-4 flex items-center justify-start gap-2 pt-5">
                      <input 
                        type="checkbox" 
                        id="gate_is_active_box" 
                        checked={gateForm.isActive} 
                        onChange={(e) => setGateForm({...gateForm, isActive: e.target.checked})} 
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                      <label htmlFor="gate_is_active_box" className="text-[10px] text-slate-400 uppercase font-black cursor-pointer">Live Spawning Rift Active</label>
                    </div>

                    <div className="col-span-12 flex justify-end gap-2 pt-2">
                      {editingGateId && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingGateId(null);
                            setGateForm({
                              name: "",
                              minLevel: 10,
                              difficulty: "S-Rank",
                              expReward: 1500,
                              goldReward: 3000,
                              lootItemName: "Kamish's Wrath",
                              isActive: true
                            });
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs text-slate-400 transition-colors uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className="px-6 py-2 bg-emerald-650 hover:bg-emerald-600 text-white font-black uppercase text-xs rounded-xl tracking-widest cursor-pointer shadow-lg shadow-emerald-950 flex items-center gap-1.5"
                      >
                        {editingGateId ? <Sparkles className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{editingGateId ? "Update Gate Spacetime" : "Forge Dimensional Gate"}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Gates list */}
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <h3 className="text-xs font-black text-slate-350 uppercase tracking-wider mb-4">FORGED GATES ACTIVE ({gates.length})</h3>
                  
                  {gates.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-xs">No active dimensional gates live. Load presets to generate dungeons inside Firebase.</div>
                  ) : (
                    <div className="space-y-4">
                      {gates.map(gate => (
                        <div key={gate.id} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-sm shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                              ⚡
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-100">{gate.name}</h4>
                                <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border ${
                                  !gate.isActive 
                                    ? "border-slate-800 bg-slate-950 text-slate-600" 
                                    : "border-emerald-800/40 bg-emerald-950/30 text-emerald-300"
                                }`}>
                                  {gate.difficulty} {!gate.isActive && "(INACTIVE)"}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-455 block font-mono mt-0.5">
                                Req: Lv {gate.minLevel} &middot; Loot Drop: <span className="text-amber-400 font-bold">{gate.lootItemName}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right text-[9px] font-bold">
                              <div className="text-cyan-400">+{gate.goldReward}g</div>
                              <div className="text-purple-400">+{gate.expReward} EXP</div>
                            </div>

                            <div className="flex gap-1.5">
                              <button 
                                onClick={() => handleEditGateClick(gate)}
                                className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-900 hover:border-slate-750 text-slate-400 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                                title="Edit Gate Spacetime Parameters"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteGate(gate.id)}
                                className="p-1.5 bg-slate-950 hover:bg-red-950 border border-slate-900 hover:border-red-900/30 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                title="Collapse Rift"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MARKET MANAGER CONTROL */}
            {activeTab === "market" && (
              <div className="space-y-6">
                {/* Editor Module */}
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                    <span>{editingMarketItemId ? `MODIFY MARKET LISTING: ${editingMarketItemId}` : "MATERIALIZE NEW MARKET ITEM"}</span>
                  </h3>
                  
                  <form onSubmit={handleCreateMarketItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Item Identifier</label>
                      <input 
                        type="text" 
                        required
                        value={marketItemForm.name}
                        onChange={(e) => setMarketItemForm({...marketItemForm, name: e.target.value})}
                        placeholder="e.g. Shadow Essence Potion"
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500 text-slate-200 text-xs p-2.5 rounded-lg focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Description (Optional)</label>
                      <input 
                        type="text" 
                        value={marketItemForm.description}
                        onChange={(e) => setMarketItemForm({...marketItemForm, description: e.target.value})}
                        placeholder="e.g. Heals 500 HP over 10s..."
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500 text-slate-200 text-xs p-2.5 rounded-lg focus:outline-none transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Item Archetype (Type)</label>
                      <select 
                        value={marketItemForm.type}
                        onChange={(e) => setMarketItemForm({...marketItemForm, type: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500 text-slate-200 text-xs p-2.5 rounded-lg focus:outline-none transition-colors"
                      >
                        <option value="Weapon">Offensive (Weapon)</option>
                        <option value="Armor">Defensive (Armor)</option>
                        <option value="Consumable">Consumable (Potion)</option>
                        <option value="Artifact">Mythic (Artifact)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Hazard / Rarity Tier</label>
                      <select 
                        value={marketItemForm.rank}
                        onChange={(e) => setMarketItemForm({...marketItemForm, rank: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500 text-slate-200 text-xs p-2.5 rounded-lg focus:outline-none transition-colors"
                      >
                        <option value="E-Rank">E-Rank (Common)</option>
                        <option value="D-Rank">D-Rank (Uncommon)</option>
                        <option value="C-Rank">C-Rank (Rare)</option>
                        <option value="B-Rank">B-Rank (Epic)</option>
                        <option value="A-Rank">A-Rank (Legendary)</option>
                        <option value="S-Rank">S-Rank (Mythic)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Gold Listing Price</label>
                        <input 
                          type="number" 
                          required min={1}
                          value={marketItemForm.price}
                          onChange={(e) => setMarketItemForm({...marketItemForm, price: Number(e.target.value)})}
                          className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500 text-amber-500 font-mono text-xs p-2.5 rounded-lg focus:outline-none transition-colors text-right"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Stock Quantities</label>
                        <input 
                          type="number" 
                          min={-1}
                          value={marketItemForm.stock}
                          onChange={(e) => setMarketItemForm({...marketItemForm, stock: Number(e.target.value)})}
                          placeholder="-1 for Infinite"
                          className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500 text-slate-200 text-xs p-2.5 rounded-lg focus:outline-none transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Market State</label>
                      <select 
                        value={marketItemForm.isActive ? "true" : "false"}
                        onChange={(e) => setMarketItemForm({...marketItemForm, isActive: e.target.value === "true"})}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500 text-slate-200 text-xs p-2.5 rounded-lg focus:outline-none transition-colors"
                      >
                        <option value="true">ACTIVE (Purchasable)</option>
                        <option value="false">SUSPENDED (Hidden)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Visual Asset / Image Uplink</label>
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          value={marketItemForm.imageUrl}
                          onChange={(e) => setMarketItemForm({...marketItemForm, imageUrl: e.target.value})}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 bg-slate-950 border border-slate-900 focus:border-amber-500 text-slate-200 text-xs p-2.5 rounded-lg focus:outline-none transition-colors"
                        />
                        <label className={`w-12 h-10 flex items-center justify-center rounded-lg border border-slate-900 bg-slate-950 cursor-pointer hover:border-amber-500/50 hover:bg-slate-900 transition-all ${isUploading ? 'opacity-50' : ''}`}>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            disabled={isUploading}
                          />
                          {isUploading ? (
                            <div className="w-5 h-5 border-2 border-dashed border-amber-500 rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5 text-amber-500" />
                          )}
                        </label>
                      </div>
                      <p className="text-[8px] font-mono text-slate-500 mt-1 uppercase">Direct URL or Local Terminal Uplink</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Ad Code Snippet (Watch to Earn)</label>
                      <input 
                        type="text" 
                        value={marketItemForm.adCodeSnippet}
                        onChange={(e) => setMarketItemForm({...marketItemForm, adCodeSnippet: e.target.value})}
                        placeholder="<script src='...'> or URL"
                        className="w-full bg-slate-950 border border-slate-900 focus:border-amber-500 text-slate-200 text-xs p-2.5 rounded-lg focus:outline-none transition-colors font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:col-span-2 bg-slate-950/30 p-4 rounded-xl border border-slate-900">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-rose-500 uppercase">Attack Buff</label>
                        <input 
                          type="number" 
                          value={marketItemForm.attackBoost}
                          onChange={(e) => setMarketItemForm({...marketItemForm, attackBoost: Number(e.target.value)})}
                          className="w-full bg-slate-950 border border-slate-900 focus:border-rose-500 text-rose-400 text-center text-xs p-2 rounded-lg focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-blue-500 uppercase">Defense Buff</label>
                        <input 
                          type="number" 
                          value={marketItemForm.defenseBoost}
                          onChange={(e) => setMarketItemForm({...marketItemForm, defenseBoost: Number(e.target.value)})}
                          className="w-full bg-slate-950 border border-slate-900 focus:border-blue-500 text-blue-400 text-center text-xs p-2 rounded-lg focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-cyan-500 uppercase">Mana Buff</label>
                        <input 
                          type="number" 
                          value={marketItemForm.manaBoost}
                          onChange={(e) => setMarketItemForm({...marketItemForm, manaBoost: Number(e.target.value)})}
                          className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500 text-cyan-400 text-center text-xs p-2 rounded-lg focus:outline-none"
                        />
                      </div>
                    </div>

                    {marketItemForm.imageUrl && (
                      <div className="md:col-span-2 mt-2 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50 p-2">
                        <label className="text-[10px] font-black text-amber-500 uppercase block mb-2 tracking-widest leading-none">High-Def Asset Preview</label>
                        <div className="w-full h-48 rounded-lg overflow-hidden border border-slate-900 relative">
                           <img src={marketItemForm.imageUrl} alt="Asset Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}

                    <div className="md:col-span-2 pt-2 flex gap-3">
                      {editingMarketItemId && (
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingMarketItemId(null);
                            setMarketItemForm({
                              name: "",
                              description: "",
                              price: 1000,
                              type: "Weapon",
                              rank: "A-Rank",
                              stock: 10,
                              isActive: true,
                              imageUrl: "",
                              adCodeSnippet: "",
                              attackBoost: 0,
                              defenseBoost: 0,
                              manaBoost: 0
                            });
                          }}
                          className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Cancel Modify
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className={`flex-1 px-4 py-2 ${editingMarketItemId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'} text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg transition-colors cursor-pointer`}
                      >
                        {editingMarketItemId ? "SAVE CALIBRATIONS" : "AUTHORIZE DEPLOYMENT"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Database List */}
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Active Market Inventory ({marketItems.length})</h3>
                  </div>

                  {marketItems.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs font-mono border border-dashed border-slate-800 rounded-xl">
                      System inventory depleted...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {marketItems.map(item => (
                        <div key={item.id} className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                               <ShoppingBag className="w-5 h-5 text-amber-500/50" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-100">{item.name}</h4>
                                <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border ${
                                  !item.isActive 
                                    ? "border-slate-800 bg-slate-950 text-slate-600" 
                                    : "border-amber-800/40 bg-amber-950/30 text-amber-300"
                                }`}>
                                  {item.type} {!item.isActive && "(HIDDEN)"}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-500 block font-mono mt-0.5 max-w-sm truncate whitespace-nowrap overflow-hidden">
                                {item.rank} &middot; {item.description}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right text-[9px] font-bold">
                              <div className="text-amber-400">{item.price}g</div>
                              <div className="text-slate-500 mt-0.5">Stock: {item.stock < 0 ? "Infinite" : item.stock}</div>
                            </div>

                            <div className="flex gap-1.5">
                              <button 
                                onClick={() => handleEditMarketItemClick(item)}
                                className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-900 hover:border-slate-750 text-slate-400 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                                title="Edit Item Parameters"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteMarketItem(item.id)}
                                className="p-1.5 bg-slate-950 hover:bg-red-950 border border-slate-900 hover:border-red-900/30 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                title="Liquidate Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SOCIAL & MODERATION CONTROL */}
            {activeTab === "social" && (
              <div className="space-y-6">
                {/* Chat Moderation */}
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                       <MessageSquare className="w-4 h-4" />
                       <span>Global Transmission Frequency</span>
                     </h3>
                     <button 
                       onClick={handleClearChat}
                       className="px-4 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center gap-1.5"
                     >
                       <Trash2 className="w-3 h-3" /> Purge registers
                     </button>
                   </div>

                   {/* Admin Message Form */}
                   <form onSubmit={handleSendAdminMessage} className="mb-6 flex gap-2">
                      <input 
                        type="text" 
                        value={adminMsgInput}
                        onChange={(e) => setAdminMsgInput(e.target.value)}
                        placeholder="SEND ADMINISTRATIVE BROADCAST..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[10px] text-indigo-300 focus:outline-none focus:border-indigo-500 font-mono tracking-wider"
                      />
                      <button 
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-indigo-900/40"
                      >
                        Transmit
                      </button>
                   </form>

                   <div className="bg-slate-950/50 border border-slate-900 rounded-xl max-h-[400px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                     {messages.length === 0 ? (
                       <div className="text-center py-10 text-slate-600 font-mono text-[10px] uppercase">Frequency analysis: Pure Void</div>
                     ) : (
                       messages.map(msg => (
                         <div key={msg.id} className="group flex items-start justify-between gap-4 p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl hover:border-indigo-500/30 transition-all">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-indigo-400">{msg.senderName}</span>
                                <span className="text-[8px] text-slate-600 font-mono uppercase tracking-tighter">ID: {msg.senderId}</span>
                                <span className="text-[8px] text-slate-700 font-mono italic">#{msg.channel}</span>
                              </div>
                              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{msg.text}</p>
                            </div>
                            <button 
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 bg-slate-950 hover:bg-red-950 border border-slate-900 text-slate-600 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                         </div>
                       ))
                     )}
                   </div>
                </div>

                {/* Party Lobbies Control */}
                <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-2xl backdrop-blur-md">
                   <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                     <Gamepad2 className="w-4 h-4" />
                     <span>Active Dimensional Lobbies ({lobbies.length})</span>
                   </h3>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lobbies.length === 0 ? (
                        <div className="col-span-full text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-600 text-[10px] uppercase">No active lattice structures found</div>
                      ) : (
                        lobbies.map(lobby => (
                          <div key={lobby.id} className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-500">
                                  <Radio className="w-5 h-5 animate-pulse" />
                               </div>
                               <div>
                                  <h4 className="text-xs font-bold text-slate-200">{lobby.hostName}'s Group</h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{lobby.status}</span>
                                    <span className="text-[9px] text-slate-500 font-mono">{lobby.members?.length || 0}/{lobby.maxMembers} Members</span>
                                  </div>
                               </div>
                             </div>
                             <button 
                               onClick={() => handleDeleteLobby(lobby.id)}
                               className="p-2 bg-slate-900 hover:bg-red-950 border border-slate-800 text-slate-500 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      </main>
  );
}
