import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCxymXQsGiD8o7R0eY_tWKKXJ7HPv82Nis",
  authDomain: "primejar-be836.firebaseapp.com",
  projectId: "primejar-be836",
  storageBucket: "primejar-be836.appspot.com",
  messagingSenderId: "458674171716",
  appId: "1:458674171716:web:e09dd946fc75e0e1a87111",
};

// 🔥 IMPORTANT FIX
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);