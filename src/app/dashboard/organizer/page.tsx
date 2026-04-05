'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Calendar, Users, CheckCircle2, Trophy, Star } from 'lucide-react';

const tabs = ['Overview', 'My Events', 'Applicants', 'Groups'];

export default function OrganizerDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.role !== 'organizer') {
      router.push('/login');
      return;
    }

    // Fetch organizer's jobs
    const qJobs = query(collection(db, 'jobs'), where('createdBy', '==', user.uid));
    const unsubJobs = onSnapshot(qJobs, (snap) => {
      setMyEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch organizer's applicants
    const qApps = query(collection(db, 'applications'), where('organizerId', '==', user.uid));
    const unsubApps = onSnapshot(qApps, (snap) => {
      // sort manually since we don't have compound index yet
      const apps = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setRecentApplicants(apps);
      setLoading(false);
    });

    return () => {
      unsubJobs();
      unsubApps();
    };
  }, [user, profile, authLoading, router]);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'applications', appId), {
        status: newStatus
      });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
      </div>
    );
  }

  const activeEventsCount = myEvents.filter(e => e.status !== 'completed').length;
  const totalAppsCount = recentApplicants.length;
  const hiredCount = recentApplicants.filter(a => a.status === 'hired').length;
  const completedEventsCount = myEvents.filter(e => e.status === 'completed').length;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold text-2xl uppercase">
              {profile?.name?.charAt(0) || 'O'}
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{profile?.name || 'Organizer'} Dashboard</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Event Organizer {profile?.city ? `· ${profile.city}` : ''}</p>
            </div>
          </div>
          <Link href="/jobs/create" className="gradient-btn-accent rounded-full !py-2 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post New Event
          </Link>
        </div>

        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-accent-500 text-white' : 'text-surface-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Events', value: activeEventsCount.toString(), icon: Calendar, color: 'text-accent-500' },
                { label: 'Total Applicants', value: totalAppsCount.toString(), icon: Users, color: 'text-prime-500' },
                { label: 'Workers Hired', value: hiredCount.toString(), icon: CheckCircle2, color: 'text-emerald-500' },
                { label: 'Events Completed', value: completedEventsCount.toString(), icon: Trophy, color: 'text-amber-500' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-5">
                  <div className={`mb-2 ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                  <div className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Active Events</h2>
                <div className="space-y-3">
                  {myEvents.filter((e) => e.status === 'active').map((event) => (
                    <Link key={event.id} href={`/jobs/${event.id}`} className="block p-4 rounded-3xl transition-colors hover:bg-prime-500/5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{event.title}</h3>
                        <span className="badge-accent text-[10px]">{event.applicants} applicants</span>
                      </div>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{event.city} · {new Date(event.date).toLocaleDateString()}</p>
                      <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-input-border)' }}>
                        <div className="bg-prime-500 h-2 rounded-full transition-all" style={{ width: `${(event.hired / (event.workers || 1)) * 100}%` }} />
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{event.hired || 0}/{event.workers || 0} workers hired</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Applicants</h2>
                <div className="space-y-3">
                  {recentApplicants.slice(0, 4).map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-3xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)' }}>
                      <div className="w-10 h-10 rounded-full bg-prime-950 dark:bg-prime-50 flex items-center justify-center text-white dark:text-prime-950 text-sm font-semibold">
                        {a.workerName?.charAt(0)?.toUpperCase() || 'W'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{a.workerName}</p>
                        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>{a.skill} · <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {a.rating}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {a.status === 'pending' && (
                          <>
                            <button onClick={() => handleUpdateStatus(a.id, 'hired')} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => handleUpdateStatus(a.id, 'rejected')} className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 flex items-center justify-center transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        )}
                        {a.status !== 'pending' && (
                          <span className={`badge text-[10px] ${
                            a.status === 'hired' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                            'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}>{a.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'My Events' && (
          <div className="space-y-4">
            {myEvents.map((event) => (
              <Link key={event.id} href={`/jobs/${event.id}`} className="glass-card-hover p-6 block">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{event.title}</h3>
                  <span className={`badge text-xs ${event.status === 'active' || !event.status ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' : 'bg-surface-50 text-surface-600 border border-surface-200 dark:bg-surface-500/10 dark:text-surface-300 dark:border-surface-500/20'}`}>
                    {(event.status || 'active').charAt(0).toUpperCase() + (event.status || 'active').slice(1)}
                  </span>
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{event.city} · {new Date(event.date).toLocaleDateString()}</p>
                <div className="flex gap-6 text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>{event.applied || 0} applicants</span>
                  <span className="text-emerald-500 dark:text-emerald-400">{event.hired || 0} hired</span>
                  <span style={{ color: 'var(--text-muted)' }}>{event.workers || 0} needed</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'Applicants' && (
          <div className="space-y-3">
            {recentApplicants.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-[var(--text-muted)] text-sm">No applicants yet. Post a job to get started!</p>
              </div>
            ) : recentApplicants.map((a) => (
              <div key={a.id} className="glass-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-prime-950 dark:bg-prime-50 flex items-center justify-center text-white dark:text-prime-950 font-semibold">
                  {a.workerName?.charAt(0)?.toUpperCase() || 'W'}
                </div>
                <div className="flex-1">
                  <Link href={`/users/${a.workerId}`} className="font-medium hover:text-prime-500 transition-colors" style={{ color: 'var(--text-primary)' }}>{a.workerName}</Link>
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>{a.skill} · <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {a.rating}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Status: {a.status}</p>
                </div>
                <div className="flex gap-2">
                  {a.status === 'pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(a.id, 'hired')} className="px-5 py-2 rounded-full text-xs font-medium bg-emerald-50/50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 transition-colors">Hire</button>
                      <button onClick={() => handleUpdateStatus(a.id, 'shortlisted')} className="px-5 py-2 rounded-full text-xs font-medium bg-amber-50/50 hover:bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20 transition-colors">Shortlist</button>
                    </>
                  )}
                  <Link href={`/users/${a.workerId}`} className="px-5 py-2 rounded-full text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--bg-card-border)] hover:border-[var(--text-muted)] transition-colors">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Groups' && (
          <div className="glass-card p-8 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Join Event Communities</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Connect with other organizers and professionals.</p>
            <Link href="/groups" className="gradient-btn-accent rounded-full px-6 py-2 text-sm">Browse Groups</Link>
          </div>
        )}
      </div>
    </div>
  );
}
