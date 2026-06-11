import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  indexedDBLocalPersistence, 
  inMemoryPersistence 
} from "firebase/auth";
import { 
  getFirestore,
  doc,
  setDoc, 
  getDocs, 
  collection, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

let db: any;
try {
  db = getFirestore(app);
} catch (e) {
  console.error("Critical: Firestore initialization failed (using dummy fallback):", e);
  db = {} as any;
}

let auth: any;
try {
  // Safe priority persistence config avoids crashes in storage-blocked frames
  auth = initializeAuth(app, {
    persistence: [browserLocalPersistence, indexedDBLocalPersistence, inMemoryPersistence]
  });
} catch (e) {
  console.warn("initializeAuth failed, trying standard getAuth:", e);
  try {
    auth = getAuth(app);
  } catch (err) {
    console.error("Critical: Firebase Auth initialization completely failed:", err);
    auth = {
      currentUser: null,
      onAuthStateChanged: (cb: any) => {
        cb(null);
        return () => {};
      },
      signOut: async () => {}
    } as any;
  }
}

export { db, auth };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  const isPermissionDenied = errMsg.toLowerCase().includes("permission") || 
                             errMsg.toLowerCase().includes("denied") ||
                             errMsg.toLowerCase().includes("insufficient") ||
                             (error && typeof error === 'object' && ('code' in error) && (error as any).code === 'permission-denied');

  if (isPermissionDenied) {
    if (operationType === OperationType.GET || operationType === OperationType.LIST) {
      console.warn("Ignoring permission error on passive Firestore listener: ", errMsg);
    } else {
      throw new Error(JSON.stringify(errInfo));
    }
  } else {
    console.warn("Handling transient/network Firestore event without throwing: ", errMsg);
  }
}

// Removed testConnection script for production purity

// Direct Leaderboard Functions
export interface LeaderboardUser {
  playerName: string;
  level: number;
  gold: number;
  job: string;
  rank: string;
  updatedAt: any;
}

/**
 * Saves or updates a user's leaderboard entry in Firestore.
 */
export async function saveToLeaderboard(playerName: string, level: number, gold: number, job: string, rank: string) {
  if (!playerName || playerName.trim() === "") return;
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const pathForWrite = `leaderboard/${playerName}`;
  try {
    const docRef = doc(db, "leaderboard", playerName);
    await setDoc(docRef, {
      uid,
      playerName,
      level,
      gold,
      job,
      rank,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathForWrite);
  }
}

/**
 * Fetches the top 50 players sorted by Level (descending), then Gold (descending).
 */
export async function fetchLeaderboard(): Promise<LeaderboardUser[]> {
  const pathForGet = "leaderboard";
  try {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("level", "desc"),
      orderBy("gold", "desc"),
      limit(50)
    );
    const snapshot = await getDocs(q);
    const results: LeaderboardUser[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        playerName: data.playerName || doc.id,
        level: Number(data.level) || 1,
        gold: Number(data.gold) || 0,
        job: data.job || "Hunter",
        rank: data.rank || "E-Rank",
        updatedAt: data.updatedAt
      });
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, pathForGet);
    return [];
  }
}
