import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from "./firebase";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  where, 
  setDoc, 
  doc, 
  getDocs,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  channel: string;
}

export interface Friendship {
  id: string;
  userUids: string[];
  status: 'pending' | 'accepted';
  requestedBy: string;
  createdAt: any;
}

/**
 * Generates a unique channel ID for a private chat between two users
 */
export function getPrivateChannelId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("::");
}

/**
 * Sends a message to a channel (global or private)
 */
export async function sendChatMessage(senderId: string, senderName: string, text: string, channel: string) {
  try {
    await addDoc(collection(db, "messages"), {
      senderId,
      senderName,
      text,
      channel,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "messages");
  }
}

/**
 * Listens to messages in a specific channel
 */
export function listenToMessages(channel: string, callback: (msgs: ChatMessage[]) => void) {
  const q = query(
    collection(db, "messages"),
    where("channel", "==", channel),
    orderBy("timestamp", "desc"),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const msgs: ChatMessage[] = [];
    snapshot.forEach(doc => {
      msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    callback(msgs.reverse());
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "messages");
  });
}

/**
 * Sends a friend request
 */
export async function sendFriendRequest(fromId: string, toId: string) {
  const friendshipId = [fromId, toId].sort().join("_");
  try {
    await setDoc(doc(db, "friendships", friendshipId), {
      userUids: [fromId, toId],
      status: 'pending',
      requestedBy: fromId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `friendships/${friendshipId}`);
  }
}

/**
 * Accepts a friend request
 */
export async function acceptFriendRequest(friendshipId: string) {
  try {
    await setDoc(doc(db, "friendships", friendshipId), {
      status: 'accepted'
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `friendships/${friendshipId}`);
  }
}

/**
 * Listens to a user's friendships (requests and accepted)
 */
export function listenToFriendships(userId: string, callback: (friends: Friendship[]) => void) {
  const q = query(
    collection(db, "friendships"),
    where("userUids", "array-contains", userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const list: Friendship[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as Friendship);
    });
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "friendships");
  });
}
