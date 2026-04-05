'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { setAuthCookie, clearAuthCookie } from '@/lib/authCookie';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'organizer' | 'admin' | 'user' | 'worker'; // 'user' and 'worker' are equivalent (event professional)
  city: string;
  skills: string[];
  experience: string;
  bio: string;
  photoURL: string;
  portfolioImages: string[];
  dailyRate: number;
  availability: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  createdAt: any;
  disabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous profile listener
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        // Set auth cookie for middleware
        setAuthCookie(firebaseUser.uid);

        // Protect Routes Client Side
        if (!firebaseUser.emailVerified && typeof window !== 'undefined') {
           const protectedPrefixes = ['/workers', '/jobs', '/groups', /* '/admin', */ '/dashboard', '/messages', '/notifications', '/profile'];
           if (protectedPrefixes.some(p => window.location.pathname.startsWith(p))) {
               window.location.href = '/verify-email';
           }
        }
        // Live listener on user doc
        unsubProfile = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          async (userSnap) => {
            if (userSnap.exists()) {
              const userData = userSnap.data();
              let combined: any = { uid: firebaseUser.uid, ...userData };

              setProfile(combined as UserProfile);
            } else {
              // User doc doesn't exist yet — create a minimal placeholder
              setProfile({ uid: firebaseUser.uid, email: firebaseUser.email || '' } as UserProfile);
            }
            setLoading(false);
          },
          () => { setLoading(false); }
        );
      } else {
        clearAuthCookie();
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
    clearAuthCookie();
    setUser(null);
    setProfile(null);
  };

  // Force re-fetch worker doc (used after profile save)
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists()) {
        let combined: any = { uid: user.uid, ...userSnap.data() };
        setProfile(combined as UserProfile);
      }
    } catch {}
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
