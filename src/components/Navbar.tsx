'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bell, Search, Sun, Moon, Menu, X, Zap, LayoutDashboard, Briefcase, Users, MessageCircle, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Real-time unread notification count */
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => d.data());
      const unread = all.filter((n: any) => !n.read && (n.userId === user.uid || n.forAll === true));
      setUnreadCount(unread.length);
    }, () => setUnreadCount(0));
    return unsub;
  }, [user]);

  const dashboardHref = user
    ? (profile?.role === 'organizer' ? '/dashboard/organizer' : '/dashboard/user')
    : '/login';

  const displayName = profile?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const navLinks = [
    { label: 'Browse Jobs', href: '/jobs', icon: Briefcase },
    { label: 'Professionals', href: '/users', icon: Users },
    { label: 'Dashboard', href: dashboardHref, icon: LayoutDashboard },
    ...(user ? [{ label: 'Messages', href: '/messages', icon: MessageCircle }] : []),
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-xl'
            : ''
        }`}
        style={{
          /* ✅ FIX: Use CSS variable so dark mode gets correct backdrop color */
          background: scrolled
            ? 'var(--navbar-scroll-bg, rgba(255,255,255,0.95))'
            : 'var(--bg-card)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #F97316, #EA6C0A)' }}
              >
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                Prime<span style={{ color: 'var(--orange)' }}>Jar</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--orange)';
                    (e.currentTarget as HTMLElement).style.background = 'var(--orange-pale)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">

              {/* Search — desktop only */}
              <div
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-default)',
                }}
              >
                <Search className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                <Link href="/users" className="text-sm" style={{ color: 'var(--text-faint)' }}>
                  Search professionals...
                </Link>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border-default)', color: 'var(--text-muted)' }}
                aria-label="Toggle theme"
              >
                {theme === 'dark'
                  ? <Sun className="w-4 h-4 text-amber-500" />
                  : <Moon className="w-4 h-4" />
                }
              </button>

              {/* Notifications */}
              {user && (
                <Link
                  href="/notifications"
                  className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border-default)', color: 'var(--text-muted)' }}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse-soft"
                      style={{ background: 'var(--orange)' }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Auth */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all hover:bg-[var(--bg-secondary)]"
                    style={{ border: '1.5px solid var(--border-default)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #F97316, #EA6C0A)' }}
                    >
                      {profile?.photoURL
                        ? <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        : initials
                      }
                    </div>
                    <span className="hidden md:block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {displayName.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 hidden md:block" style={{ color: 'var(--text-faint)' }} />
                  </button>

                  {/* Profile dropdown */}
                  {profileOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 rounded-2xl py-2 z-50 animate-scale-in"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                    >
                      <Link
                        href={dashboardHref}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--bg-secondary)]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <LayoutDashboard className="w-4 h-4" style={{ color: 'var(--orange)' }} />
                        Dashboard
                      </Link>
                      <Link
                        href={`/users/${user.uid}`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--bg-secondary)]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Users className="w-4 h-4" style={{ color: 'var(--orange)' }} />
                        My Profile
                      </Link>
                      <div className="my-1.5 mx-3" style={{ height: '1px', background: 'var(--border-default)' }} />
                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-red-50 text-red-500"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" className="text-sm font-semibold px-5 py-2 rounded-full transition-all" style={{ color: 'var(--text-secondary)', border: '1.5px solid var(--border-default)', background: 'var(--bg-card)' }}>Sign In</Link>
                  <Link
                    href="/signup"
                    className="btn-primary text-sm px-5 py-2"
                    style={{ borderRadius: '9999px' }}
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="md:hidden animate-slide-up"
            style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-default)' }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <link.icon className="w-4 h-4" style={{ color: 'var(--orange)' }} />
                  {link.label}
                  {link.href === '/notifications' && unreadCount > 0 && (
                    <span
                      className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: 'var(--orange)' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}

              <div className="pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                {user ? (
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-center">Sign In</Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)} className="btn-primary text-center">Get Started Free</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop for profile dropdown */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </>
  );
}
