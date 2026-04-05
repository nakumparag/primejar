#!/usr/bin/env node
/**
 * PrimeJar – Firebase Cleanup Script
 * -----------------------------------
 * Deletes ALL documents from: users, jobs, applications, chatRequests
 * Run: node scripts/cleanup-firebase.mjs
 *
 * Requires: NEXT_PUBLIC_FIREBASE_* env vars  (or hardcodes below)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyCxymXQsGiD8o7R0eY_tWKKXJ7HPv82Nis",
  authDomain:        "primejar-be836.firebaseapp.com",
  projectId:         "primejar-be836",
  storageBucket:     "primejar-be836.appspot.com",
  messagingSenderId: "458674171716",
  appId:             "1:458674171716:web:e09dd946fc75e0e1a87111",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const COLLECTIONS_TO_CLEAR = ['users', 'jobs', 'applications', 'chatRequests', 'activity'];

async function clearCollection(name) {
  const snap = await getDocs(collection(db, name));
  if (snap.empty) {
    console.log(`  ✓ ${name}: already empty`);
    return;
  }
  const deletes = snap.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletes);
  console.log(`  🗑  ${name}: deleted ${snap.size} document(s)`);
}

(async () => {
  console.log('\n🔥 PrimeJar Firebase Cleanup\n----------------------------');
  for (const col of COLLECTIONS_TO_CLEAR) {
    await clearCollection(col);
  }
  console.log('\n✅ Database cleaned. Fresh start ready!\n');
  process.exit(0);
})();
