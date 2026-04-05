'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  doc, updateDoc, getDoc, collection, query, where,
  onSnapshot, orderBy, DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  LayoutDashboard, Briefcase, User2, Users, Bell, LogOut,
  Star, ClipboardList, TrendingUp, Calendar, MapPin, ChevronRight,
  Camera, CheckCircle2, Clock, XCircle, Menu, X, Upload,
  Zap, ArrowRight, Target
} from 'lucide-react';
import { db, storage } from '@/lib/firebase';

const SIDEBAR_LINKS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'jobs', label: 'Applied Jobs', icon: Briefcase },
  { id: 'profile', label: 'Edit Profile', icon: User2 },
  { id: 'groups', label: 'My Groups', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
    hired:       { label: 'Hired',       bg: '#ECFDF5', color: '#059669', icon: CheckCircle2 },
    shortlisted: { label: 'Shortlisted', bg: '#FFFBEB', color: '#D97706', icon: Clock },
    rejected:    { label: 'Rejected',    bg: '#FEF2F2', color: '#DC2626', icon: XCircle },
    pending:     { label: 'Pending',     bg: '#FFF7ED', color: '#F97316', icon: Clock },
  };
  const c = config[status] || config.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.color }}
    >
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

export default function WorkerDashboard() {
  const { user, profile, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appliedJobs, setAppliedJobs]   = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: '', city: '', phone: '', bio: '', dailyRate: '', skills: [] as string[], experience: '', email: '', photoURL: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Load profile */
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setProfileData({
            name: d.name || '', city: d.city || '', phone: d.phone || '',
            bio: d.bio || '', dailyRate: d.dailyRate?.toString() || '',
            skills: d.skills || [], experience: d.experience || '',
            email: d.email || user.email || '', photoURL: d.photoURL || '',
          });
        }
      } catch {}
    })();

    /* Applications listener */
    const qApps = query(collection(db, 'applications'), where('workerId', '==', user.uid));
    const unsubApps = onSnapshot(qApps, async (snap) => {
      const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const enriched = await Promise.all(apps.map(async (app: any) => {
        let job: DocumentData = {};
        if (app.jobId) {
          try {
            const jd = await getDoc(doc(db, 'jobs', app.jobId));
            if (jd.exists()) job = jd.data();
          } catch {}
        }
        return {
          id: app.id, jobId: app.jobId,
          title: job.title || 'Unknown Job',
          org: job.org || 'Organizer',
          city: job.city || '',
          date: job.date || '',
          budget: job.budget || job.budgetMax || 0,
          status: app.status || 'pending',
          createdAt: app.createdAt,
        };
      }));
      setAppliedJobs(enriched.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
      setLoading(false);
    });

    /* Notifications listener */
    const qNotif = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubNotif = onSnapshot(qNotif, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications((all as any[]).filter(n => n.userId === user.uid || n.forAll === true).slice(0, 20));
    }, () => {});

    return () => { unsubApps(); unsubNotif(); };
  }, [user]);

  /* Save profile */
  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true); setSaveMsg('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: profileData.name, city: profileData.city, phone: profileData.phone,
        bio: profileData.bio, dailyRate: profileData.dailyRate ? Number(profileData.dailyRate) : 0,
        skills: profileData.skills, experience: profileData.experience, photoURL: profileData.photoURL || '',
      });
      setSaveMsg('Profile saved!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Error saving. Try again.');
    } finally { setSaving(false); }
  };

  /* Upload photo */
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { setSaveMsg('Select an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { setSaveMsg('Max file size is 2MB.'); return; }
    setUploading(true); setSaveMsg('');
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const storageRef = ref(storage, `profilePhotos/profile_${user.uid}_${Date.now()}.${ext}`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      setProfileData(p => ({ ...p, photoURL: url }));
      setSaveMsg('Photo updated!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch { setSaveMsg('Upload failed.'); }
    finally { setUploading(false); }
  };

  const displayName = profileData.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const stats = {
    completed: appliedJobs.filter(j => j.status === 'hired').length,
    pending: appliedJobs.filter(j => j.status === 'pending').length,
    applied: appliedJobs.length,
    rating: profile?.rating || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '64px', background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ paddingTop: '64px', background: 'var(--bg-secondary)' }}>

      {/* ── Sidebar ── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside
          className={`fixed top-16 bottom-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 lg:sticky lg:top-16 lg:translate-x-0 lg:h-[calc(100vh-64px)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-default)' }}
        >
          {/* Profile Summary */}
          <div className="p-5" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #F97316, #EA6C0A)' }}
              >
                {profileData.photoURL
                  ? <img src={profileData.photoURL} alt="" className="w-full h-full object-cover" />
                  : initials
                }
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {displayName}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {profileData.skills?.[0] || 'Professional'}
                </p>
                {profileData.city && (
                  <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    <MapPin className="w-3 h-3" /> {profileData.city}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Nav */}
          <nav className="flex-1 overflow-y-auto p-3">
            <div className="space-y-0.5">
              {SIDEBAR_LINKS.map((link) => {
                const isActive = activeSection === link.id;
                const badge = link.id === 'notifications' ? notifications.filter((n: any) => !n.read).length : 0;
                return (
                  <button
                    key={link.id}
                    onClick={() => { setActiveSection(link.id); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: isActive ? 'var(--orange-pale)' : 'transparent',
                      color: isActive ? 'var(--orange-dark)' : 'var(--text-muted)',
                    }}
                  >
                    <link.icon className="w-4 h-4 flex-shrink-0" />
                    {link.label}
                    {badge > 0 && (
                      <span
                        className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: 'var(--orange)' }}
                      >
                        {badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" style={{ color: 'var(--orange)' }} />}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--text-faint)' }}>Quick Actions</p>
              <Link
                href="/jobs"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                }}
              >
                <Briefcase className="w-4 h-4" style={{ color: 'var(--orange)' }} />
                Browse Jobs
              </Link>
              <Link
                href={`/users/${user?.uid}`}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                }}
              >
                <User2 className="w-4 h-4" style={{ color: 'var(--orange)' }} />
                View Public Profile
              </Link>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-3" style={{ borderTop: '1px solid var(--border-default)' }}>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>
      </>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 p-4 lg:p-6 xl:p-8">

        {/* Mobile header */}
        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
          >
            <Menu className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          </button>
          <h1 className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            {SIDEBAR_LINKS.find(l => l.id === activeSection)?.label || 'Dashboard'}
          </h1>
        </div>

        {/* ── Overview ── */}
        {activeSection === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Welcome header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
                  Welcome back, {displayName.split(' ')[0]}! 👋
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Here&apos;s what&apos;s happening with your freelance journey today.
                </p>
              </div>
              <Link href="/jobs" className="btn-primary flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Browse Jobs
              </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Hired', value: stats.completed, icon: CheckCircle2, iconBg: '#ECFDF5', iconColor: '#10B981', change: 'Confirmed events' },
                { label: 'Avg Rating', value: stats.rating ? stats.rating.toFixed(1) : 'New', icon: Star, iconBg: '#FFFBEB', iconColor: '#F59E0B', change: 'Based on reviews' },
                { label: 'Applications', value: stats.applied, icon: ClipboardList, iconBg: '#FFF7ED', iconColor: '#F97316', change: 'Total applied' },
                { label: 'Pending', value: stats.pending, icon: Clock, iconBg: '#F5F3FF', iconColor: '#8B5CF6', change: 'Awaiting response' },
              ].map((stat) => (
                <div key={stat.label} className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.iconBg }}>
                      <stat.icon className="w-5 h-5" style={{ color: stat.iconColor }} />
                    </div>
                  </div>
                  <div className="text-2xl font-display font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{stat.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{stat.change}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Applications */}
              <div className="lg:col-span-2 card">
                <div className="flex items-center justify-between p-5 pb-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <h2 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Applications</h2>
                  <button
                    onClick={() => setActiveSection('jobs')}
                    className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: 'var(--orange)' }}
                  >
                    View All <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
                  {appliedJobs.slice(0, 4).map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.jobId}`}
                      className="flex items-center justify-between p-4 transition-colors hover:bg-[var(--bg-secondary)]"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate mb-0.5" style={{ color: 'var(--text-primary)' }}>{job.title}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {job.org} · {job.city} {job.date && `· ${new Date(job.date).toLocaleDateString()}`}
                        </p>
                      </div>
                      <StatusBadge status={job.status} />
                    </Link>
                  ))}
                  {appliedJobs.length === 0 && (
                    <div className="p-8 text-center">
                      <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>No applications yet</p>
                      <Link href="/jobs" className="btn-primary text-xs px-4 py-2">Find Jobs</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="card">
                <div className="flex items-center justify-between p-5 pb-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <h2 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h2>
                  <Link href="/notifications" className="text-xs font-semibold" style={{ color: 'var(--orange)' }}>See all</Link>
                </div>
                <div className="divide-y overflow-y-auto max-h-72" style={{ borderColor: 'var(--border-default)' }}>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-7 h-7 mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications</p>
                    </div>
                  ) : notifications.slice(0, 5).map((n: any) => (
                    <div key={n.id} className={`p-4 ${!n.read ? 'bg-[var(--orange-pale)]' : ''}`}>
                      <div className="flex items-start gap-2">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: n.read ? 'var(--text-faint)' : 'var(--orange)' }}
                        />
                        <div>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{n.message || n.text}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                            {n.createdAt?.toDate?.().toLocaleDateString?.('en-IN') || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            {appliedJobs.filter(j => j.status === 'hired').length > 0 && (
              <div className="card">
                <div className="p-5 pb-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <h2 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Confirmed Events</h2>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
                  {appliedJobs.filter(j => j.status === 'hired').map((event) => (
                    <div key={event.id} className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ECFDF5' }}>
                        <Calendar className="w-5 h-5" style={{ color: '#10B981' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{event.title}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {event.org} · {event.city} {event.date && `· ${new Date(event.date).toLocaleDateString()}`}
                        </p>
                      </div>
                      <StatusBadge status="hired" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Applied Jobs ── */}
        {activeSection === 'jobs' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Applied Jobs</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{appliedJobs.length} total applications</p>
              </div>
              <Link href="/jobs" className="btn-primary text-sm px-4 py-2">Find More Jobs</Link>
            </div>

            {appliedJobs.length === 0 ? (
              <div className="card p-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
                <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>No applications yet</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Browse open jobs and start applying to grow your career.</p>
                <Link href="/jobs" className="btn-primary">Browse Jobs</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {appliedJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.jobId}`} className="card card-hover p-5 block">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{job.title}</h3>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                          {job.org} · {job.city} {job.date && `· ${new Date(job.date).toLocaleDateString()}`}
                        </p>
                        {job.budget > 0 && (
                          <span className="text-sm font-semibold" style={{ color: 'var(--orange)' }}>
                            ₹{job.budget.toLocaleString()}/day
                          </span>
                        )}
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Profile Edit ── */}
        {activeSection === 'profile' && (
          <div className="animate-fade-in max-w-2xl">
            <h1 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>Edit Profile</h1>

            {saveMsg && (
              <div
                className="mb-6 p-4 rounded-xl text-sm font-medium animate-slide-up"
                style={{
                  background: saveMsg.toLowerCase().includes('error') || saveMsg.toLowerCase().includes('fail') ? '#FEF2F2' : '#ECFDF5',
                  color: saveMsg.toLowerCase().includes('error') || saveMsg.toLowerCase().includes('fail') ? '#DC2626' : '#059669',
                  border: `1px solid ${saveMsg.toLowerCase().includes('error') || saveMsg.toLowerCase().includes('fail') ? '#FEE2E2' : '#D1FAE5'}`,
                }}
              >
                {saveMsg}
              </div>
            )}

            {/* Photo Upload */}
            <div className="card p-6 mb-6">
              <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Profile Photo</h2>
              <div className="flex items-center gap-5">
                <div className="relative group flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #F97316, #EA6C0A)' }}
                  >
                    {profileData.photoURL
                      ? <img src={profileData.photoURL} alt="" className="w-full h-full object-cover" />
                      : initials
                    }
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {uploading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Camera className="w-5 h-5 text-white" />
                    }
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Profile Picture</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>JPG, PNG or WebP · Max 2MB</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
                    style={{ color: 'var(--orange)' }}
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Change Photo'}
                  </button>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="card p-6 space-y-5">
              <h2 className="font-display font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Personal Information</h2>

              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '10-digit number' },
                { label: 'City', key: 'city', type: 'text', placeholder: 'Your city' },
                { label: 'Daily Rate (₹)', key: 'dailyRate', type: 'number', placeholder: 'e.g. 5000' },
                { label: 'Years of Experience', key: 'experience', type: 'text', placeholder: 'e.g. 3 years' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={(profileData as any)[field.key]}
                    onChange={e => setProfileData(p => ({ ...p, [field.key]: e.target.value }))}
                    className="input-field"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input type="email" value={profileData.email} disabled className="input-field opacity-50 cursor-not-allowed" />
                <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={e => setProfileData(p => ({ ...p, bio: e.target.value }))}
                  className="input-field h-28 resize-none"
                  placeholder="Tell us about yourself and your experience..."
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary w-full py-3 disabled:opacity-50"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Notifications ── */}
        {activeSection === 'notifications' && (
          <div className="animate-fade-in max-w-2xl">
            <h1 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>Notifications</h1>
            <div className="card overflow-hidden">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
                  <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>All caught up!</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No new notifications</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
                  {notifications.map((n: any) => (
                    <div key={n.id} className={`flex gap-3 p-4 ${!n.read ? 'bg-[var(--orange-pale)]' : ''}`}>
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: n.read ? 'var(--text-faint)' : 'var(--orange)' }}
                      />
                      <div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{n.message || n.text}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                          {n.createdAt?.toDate?.().toLocaleString?.('en-IN') || ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Groups ── */}
        {activeSection === 'groups' && (
          <div className="animate-fade-in">
            <h1 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>My Groups</h1>
            <div className="card p-12 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--orange-pale)' }}
              >
                <Users className="w-8 h-8" style={{ color: 'var(--orange)' }} />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                Join Event Communities
              </h3>
              <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                Connect with event professionals, share opportunities, and find your next gig through community groups.
              </p>
              <Link href="/groups" className="btn-primary">Browse Groups</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
