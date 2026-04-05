'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, Zap } from 'lucide-react';

// ─── Hardcoded admin credentials (no Firebase needed) ───────────────────────
const ADMIN_EMAIL    = 'admin@primejar.in';
const ADMIN_PASSWORD = 'Parag@3873';

export default function LoginPage() {
  const router = useRouter();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('pj-remember-email');
    const savedPass  = localStorage.getItem('pj-remember-pass');
    if (savedEmail && savedPass) {
      setEmail(savedEmail);
      setPassword(savedPass);
      setRememberMe(true);
    }
  }, []);

  // ── Main login handler ──────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();           // ✅ prevent page reload
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // ── Admin: sign in via Firebase AND set localStorage session ──────────
      if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        localStorage.setItem('pj-admin-session', 'true');
        if (rememberMe) {
          localStorage.setItem('pj-remember-email', email);
          localStorage.setItem('pj-remember-pass',  password);
        } else {
          localStorage.removeItem('pj-remember-email');
          localStorage.removeItem('pj-remember-pass');
        }
        router.push('/admin');
        return;
      }
    } catch (err: any) {
      // If admin email/password is wrong in Firebase, show helpful message
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-login-credentials') {
        setError('Admin account not found in Firebase. Please create the admin account first via Firebase Console → Authentication → Add User (admin@primejar.in / Parag@3873).');
      } else {
        setError(err.message || 'Admin login failed.');
      }
      setLoading(false);
      return;
    }
    // ── 2. Normal Firebase login ─────────────────────────────────────────────
    if (rememberMe) {
      localStorage.setItem('pj-remember-email', email);
      localStorage.setItem('pj-remember-pass',  password);
    } else {
      localStorage.removeItem('pj-remember-email');
      localStorage.removeItem('pj-remember-pass');
    }

    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // Update last login (non-blocking)
      updateDoc(doc(db, 'users', user.uid), { lastLogin: serverTimestamp() }).catch(() => {});

      if (!user.emailVerified) {
        router.push('/verify-email');
        return;
      }

      // Determine role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.exists() ? userDoc.data().role : 'user';

      if (role === 'organizer')  router.push('/dashboard/organizer');
      else                       router.push('/dashboard/user');

    } catch (err: any) {
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        setError('Invalid email or password.');
      } else if (code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (code === 'auth/user-disabled') {
        setError('Your account has been suspended. Contact support.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google login ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result   = await signInWithPopup(auth, provider);
      const { user } = result;

      // ── Admin special case for Google SignIn ────────
      if (user.email && user.email.toLowerCase() === ADMIN_EMAIL) {
        localStorage.setItem('pj-admin-session', 'true');
        router.push('/admin');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      let role = 'user';

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email:     user.email,
          name:      user.displayName,
          photoURL:  user.photoURL,
          role,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      } else {
        role = userDoc.data()?.role || role;
        updateDoc(userRef, { lastLogin: serverTimestamp() }).catch(() => {});
      }

      if (role === 'organizer') router.push('/dashboard/organizer');
      else                      router.push('/dashboard/user');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Left Panel ─────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-center p-12 lg:p-20"
        style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)' }}
      >
        {/* Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 animate-float"
            style={{ background: 'radial-gradient(circle, #F97316, transparent)', animationDuration: '8s' }} />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-20 animate-float"
            style={{ background: 'radial-gradient(circle, #EA6C0A, transparent)', animationDuration: '12s', animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 max-w-md">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-14 group">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #F97316, #EA6C0A)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl" style={{ color: '#111827' }}>
              Prime<span style={{ color: '#F97316' }}>Jar</span>
            </span>
          </Link>

          <h1 className="font-display font-extrabold text-4xl lg:text-5xl mb-5 leading-tight"
            style={{ color: '#111827', letterSpacing: '-0.03em' }}>
            Find the perfect professionals for your events.
          </h1>
          <p className="text-lg mb-10" style={{ color: '#6B7280', lineHeight: 1.7 }}>
            Join thousands of event organizers and skilled workers building
            exceptional experiences together on PrimeJar.
          </p>

          {/* Trust badge */}
          <div className="inline-flex items-center gap-4 px-5 py-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.6)' }}>
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                  <img src={`https://i.pravatar.cc/100?img=${i}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold" style={{ color: '#111827' }}>Trusted by 5,000+ top professionals</p>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20"
        style={{ background: 'var(--bg-card)' }}>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F97316, #EA6C0A)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            Prime<span style={{ color: '#F97316' }}>Jar</span>
          </span>
        </div>

        <div className="w-full max-w-[420px] mx-auto">

          {/* Tabs */}
          <div className="flex mb-10" style={{ borderBottom: '1.5px solid var(--border-default)' }}>
            <Link href="/login" className="flex-1 pb-4 text-center text-sm font-bold transition-colors"
              style={{ color: '#F97316', borderBottom: '2.5px solid #F97316', marginBottom: '-1.5px' }}>
              Sign In
            </Link>
            <Link href="/signup" className="flex-1 pb-4 text-center text-sm font-medium transition-colors"
              style={{ color: 'var(--text-muted)' }}>
              Create Account
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-extrabold text-3xl mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Enter your details to securely access your account.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl flex items-start gap-3 text-sm"
              style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#DC2626' }}>
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ── FORM ── */}
          <form onSubmit={handleLogin} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
                <input
                  type="email"
                  id="login-email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="input-field pl-11"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <Link href="/forgot-password" className="text-sm font-medium hover:underline" style={{ color: '#F97316' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-11 pr-12"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0"
                style={rememberMe
                  ? { background: '#F97316', border: '1.5px solid #F97316' }
                  : { background: 'var(--bg-card)', border: '1.5px solid var(--border-default)' }}
              >
                {rememberMe && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </button>
              <span
                className="text-sm cursor-pointer select-none"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => setRememberMe(!rememberMe)}
              >
                Remember me for 30 days
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={!email || !password || loading}
              className="btn-primary w-full py-3.5 mt-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          {/* Or divider */}
          <div className="relative mt-8 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid var(--border-default)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs font-medium uppercase tracking-wider"
                style={{ background: 'var(--bg-card)', color: 'var(--text-faint)' }}>
                Or continue with
              </span>
            </div>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-secondary w-full py-3.5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold hover:underline" style={{ color: '#F97316' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
