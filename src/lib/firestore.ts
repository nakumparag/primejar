import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

// Collection references
export const usersRef = collection(db, 'users');
export const eventsRef = collection(db, 'events');
export const applicationsRef = collection(db, 'applications');
export const groupsRef = collection(db, 'groups');
export const messagesRef = collection(db, 'messages');
export const reviewsRef = collection(db, 'reviews');
export const notificationsRef = collection(db, 'notifications');

// Generic helpers
export async function getDocument(collectionName: string, id: string) {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function queryDocuments(
  collectionName: string,
  constraints: QueryConstraint[]
) {
  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createDocument(collectionName: string, data: DocumentData) {
  return addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: DocumentData
) {
  const docRef = doc(db, collectionName, id);
  return updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteDocument(collectionName: string, id: string) {
  return deleteDoc(doc(db, collectionName, id));
}

export { where, orderBy, limit, onSnapshot, serverTimestamp, Timestamp, query };
