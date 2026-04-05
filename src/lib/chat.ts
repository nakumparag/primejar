import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Types ────────────────────────────────────────────────────────────────────
export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantAvatars?: Record<string, string>;
  status: 'pending' | 'accepted' | 'rejected';
  requestedBy: string;
  lastMessage?: string;
  lastMessageAt?: any;
  createdAt?: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt?: any;
}

// ── Send a chat request (creates pending conversation) ───────────────────────
export async function sendChatRequest(
  fromUid: string,
  fromName: string,
  toUid: string,
  toName: string,
  fromAvatar?: string,
  toAvatar?: string,
): Promise<string> {
  // Check if conversation already exists
  const existing = await getDocs(
    query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', fromUid)
    )
  );
  const alreadyExists = existing.docs.find((d) => {
    const parts = d.data().participants as string[];
    return parts.includes(toUid);
  });
  if (alreadyExists) return alreadyExists.id;

  const ref = await addDoc(collection(db, 'conversations'), {
    participants: [fromUid, toUid],
    participantNames: { [fromUid]: fromName, [toUid]: toName },
    participantAvatars: { [fromUid]: fromAvatar || '', [toUid]: toAvatar || '' },
    status: 'pending',
    requestedBy: fromUid,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ── Accept / Reject ───────────────────────────────────────────────────────────
export async function acceptChatRequest(convId: string): Promise<void> {
  await updateDoc(doc(db, 'conversations', convId), { status: 'accepted' });
}

export async function rejectChatRequest(convId: string): Promise<void> {
  await updateDoc(doc(db, 'conversations', convId), { status: 'rejected' });
}

// ── Send a message (only works for accepted conversations) ───────────────────
export async function sendMessage(
  convId: string,
  senderId: string,
  text: string,
): Promise<void> {
  if (!text.trim()) return;
  await addDoc(collection(db, 'conversations', convId, 'messages'), {
    senderId,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage: text.trim(),
    lastMessageAt: serverTimestamp(),
  });
}

// ── Real-time subscriptions ───────────────────────────────────────────────────
export function subscribeToConversations(
  uid: string,
  callback: (convs: Conversation[]) => void,
): Unsubscribe {
  return onSnapshot(
    query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', uid)
    ),
    (snap) => {
      const convs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
      convs.sort((a, b) => {
        const tA = a.lastMessageAt?.toMillis?.() || 0;
        const tB = b.lastMessageAt?.toMillis?.() || 0;
        return tB - tA;
      });
      callback(convs);
    },
    (error) => {
      console.error('subscribeToConversations error:', error);
      callback([]);
    }
  );
}

export function subscribeToMessages(
  convId: string,
  callback: (msgs: ChatMessage[]) => void,
): Unsubscribe {
  return onSnapshot(
    query(
      collection(db, 'conversations', convId, 'messages'),
      orderBy('createdAt', 'asc')
    ),
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage)));
    },
    () => callback([])
  );
}

// ── Check if chat request already sent ───────────────────────────────────────
export async function getChatRequestStatus(
  fromUid: string,
  toUid: string,
): Promise<'none' | 'pending' | 'accepted' | 'rejected'> {
  const snap = await getDocs(
    query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', fromUid)
    )
  );
  const conv = snap.docs.find((d) => {
    return (d.data().participants as string[]).includes(toUid);
  });
  if (!conv) return 'none';
  return conv.data().status as 'pending' | 'accepted' | 'rejected';
}
