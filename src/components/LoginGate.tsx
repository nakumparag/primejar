'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

/**
 * LoginGate — shows a timed login popup on the homepage for unauthenticated users.
 * After 8 seconds of being on the page, displays a modal prompting login.
 * Dismissed by clicking outside or the X. Reappears every 60s.
 */
export default function LoginGate() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isHomepage = pathname === '/';

  useEffect(() => {
    // Only run on homepage for unauthenticated users
    if (!isHomepage || loading || user || dismissed) return;

    const timer = setTimeout(() => {
      setShow(true);
    }, 8000); // 8 seconds

    return () => clearTimeout(timer);
  }, [isHomepage, user, loading, dismissed]);

  // Auto-reset dismissed state after 60s so it can show again
  useEffect(() => {
    if (!dismissed) return;
    const t = setTimeout(() => setDismissed(false), 60_000);
    return () => clearTimeout(t);
  }, [dismissed]);

  if (!show || user || !isHomepage) return null;

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={handleDismiss}
    >
      <div
        className="glass-card rounded-3xl p-8 max-w-md w-full border border-[var(--bg-card-border)] shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-prime-500 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 className="text-2xl font-display font-bold text-center text-[var(--text-primary)] mb-2">
          Join PrimeJar
        </h2>
        <p className="text-[var(--text-muted)] text-center text-sm mb-7 leading-relaxed">
          Sign in to browse jobs, connect with workers, post events, and access the full platform.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="gradient-btn rounded-full text-center py-3 font-semibold"
            onClick={handleDismiss}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="py-3 rounded-full text-center text-sm font-medium border border-[var(--bg-card-border)] text-[var(--text-secondary)] hover:bg-[var(--bg-input)] transition-colors"
            onClick={handleDismiss}
          >
            Create Free Account
          </Link>
        </div>

        <p className="text-center text-xs text-[var(--text-faint)] mt-4">
          Free to join · No credit card required
        </p>
      </div>
    </div>
  );
}
