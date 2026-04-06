'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Search, Sun, Moon, Menu, X, LayoutDashboard, Users, LogOut,
  ChevronDown, Bell, Zap, Briefcase, UserPlus, MapPin
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Unread notifications */
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    // Query only this user's notifications + broadcast notifications
    // Use two separate queries to avoid compound index requirement
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const unread = snap.docs.filter(d => !d.data().read);
      setUnreadCount(unread.length);
    }, () => setUnreadCount(0));
    return unsub;
  }, [user]);

  const dashboardHref = user
    ? (profile?.role === 'organizer' ? '/dashboard/organizer' : '/dashboard/user')
    : '/login';

  const displayName = profile?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  // Hide Navbar on auth pages
  if (pathname === '/login' || pathname === '/signup') return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (locationQuery.trim()) params.set('city', locationQuery.trim());
    router.push(`/users?${params.toString()}`);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
        style={{
          background: scrolled ? 'var(--navbar-scroll-bg)' : 'var(--navbar-bg)',
          borderBottom: scrolled ? 'none' : '1px solid var(--border-default)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
              >
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)' }}>
                Prime<span style={{ color: 'var(--blue)' }}>Jar</span>
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/jobs"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: pathname === '/jobs' ? 'var(--blue)' : 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--blue)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = pathname === '/jobs' ? 'var(--blue)' : 'var(--text-muted)'}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Browse Events
              </Link>
              <Link
                href="/users"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: pathname === '/users' ? 'var(--blue)' : 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--blue)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = pathname === '/users' ? 'var(--blue)' : 'var(--text-muted)'}
              >
                <Users className="w-3.5 h-3.5" />
                Find Vendors
              </Link>
            </div>

            {/* ── Center Search Bar ── */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div
                className="flex items-center w-full rounded-xl overflow-hidden transition-shadow"
                style={{
                  border: '1.5px solid var(--border-default)',
                  background: 'var(--bg-input)',
                  boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <div className="flex items-center gap-2 flex-1 px-3">
                  <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
                  <input
                    type="text"
                    placeholder="Search events, vendors, services..."
                    className="bg-transparent outline-none w-full text-sm py-2.5"
                    style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div style={{ width: '1px', background: 'var(--border-default)', alignSelf: 'stretch', margin: '8px 0' }} />
                <div className="flex items-center gap-2 px-3">
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
                  <input
                    type="text"
                    placeholder="City"
                    className="bg-transparent outline-none text-sm py-2.5 w-24"
                    style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
                    value={locationQuery}
                    onChange={e => setLocationQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-semibold text-white transition-colors m-1.5 rounded-lg flex-shrink-0"
                  style={{ background: 'var(--blue)', fontFamily: 'Poppins, sans-serif' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--blue-dark)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--blue)'}
                >
                  Search
                </button>
              </div>
            </form>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-2 ml-auto md:ml-0">

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
                aria-label="Toggle theme"
              >
                {theme === 'dark'
                  ? <Sun className="w-4 h-4 text-amber-500" />
                  : <Moon className="w-4 h-4" />
                }
              </button>

              {/* Notifications (logged in only) */}
              {user && (
                <Link
                  href="/notifications"
                  className="w-9 h-9 rounded-lg flex items-center justify-center relative transition-all hover:scale-105"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                      style={{ background: '#EF4444' }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Auth section */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all"
                    style={{ border: '1.5px solid var(--border-default)', background: 'var(--bg-card)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
                    >
                      {profile?.photoURL
                        ? <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        : initials
                      }
                    </div>
                    <span className="hidden md:block text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                      {displayName.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl py-2 z-50 animate-scale-in"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
                    >
                      <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-default)' }}>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{user.email}</p>
                      </div>
                      <Link
                        href={dashboardHref}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--bg-secondary)]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <LayoutDashboard className="w-4 h-4" style={{ color: 'var(--blue)' }} />
                        Dashboard
                      </Link>
                      <Link
                        href={`/users/${user.uid}`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--bg-secondary)]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Users className="w-4 h-4" style={{ color: 'var(--blue)' }} />
                        My Profile
                      </Link>
                      <div className="my-1.5 mx-3" style={{ height: '1px', background: 'var(--border-default)' }} />
                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-red-50 text-red-500"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'Poppins, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--blue)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all"
                    style={{ background: 'var(--blue)', fontFamily: 'Poppins, sans-serif', boxShadow: 'var(--shadow-blue)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--blue-dark)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--blue)'}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Sign Up Free
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div
            className="md:hidden animate-slide-up"
            style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-default)' }}
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <div
                  className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
                >
                  <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="bg-transparent outline-none w-full text-sm"
                    style={{ color: 'var(--text-primary)' }}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white text-sm font-semibold flex-shrink-0"
                  style={{ background: 'var(--blue)' }}
                >
                  Go
                </button>
              </form>

              <Link href="/jobs" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
              >
                <Briefcase className="w-4 h-4" style={{ color: 'var(--blue)' }} />
                Browse Events
              </Link>
              <Link href="/users" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
              >
                <Users className="w-4 h-4" style={{ color: 'var(--blue)' }} />
                Find Vendors
              </Link>

              <div className="pt-2" style={{ borderTop: '1px solid var(--border-default)' }}>
                {user ? (
                  <>
                    <Link href={dashboardHref} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <LayoutDashboard className="w-4 h-4" style={{ color: 'var(--blue)' }} />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)}
                      className="text-center py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{ border: '1.5px solid var(--border-default)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}
                    >
                      Log In
                    </Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)}
                      className="text-center py-3 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'var(--blue)' }}
                    >
                      Sign Up Free
                    </Link>
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
