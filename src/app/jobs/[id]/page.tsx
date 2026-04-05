'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, query, where, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { MapPin, Calendar, Users, IndianRupee, Star, Flame } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { logApplicationSubmitted } from '@/lib/activity';

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    
    // Listen to Job details
    const unsubscribeJob = onSnapshot(doc(db, 'jobs', id), (docSnap) => {
      if (docSnap.exists()) {
        setJob({ id: docSnap.id, ...docSnap.data() });
      } else {
        setJob(null);
      }
      setLoading(false);
    });

    // Listen to Applicants for this Job
    const q = query(collection(db, 'applications'), where('jobId', '==', id));
    const unsubscribeApps = onSnapshot(q, (snapshot) => {
      const apps: any[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setApplicants(apps);
      
      // Check if current user has applied
      if (user) {
        const applied = apps.find((a: any) => a.workerId === user.uid);
        if (applied) setHasApplied(true);
      }
    });

    return () => {
      unsubscribeJob();
      unsubscribeApps();
    };
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.uid === job?.createdBy || profile?.role !== 'user') return;
    
    setApplying(true);
    setError('');
    try {
      await addDoc(collection(db, 'applications'), {
        jobId: id,
        organizerId: job.createdBy,
        workerId: user.uid,
        workerName: profile.name,
        skill: profile.skills?.[0] || 'Event Worker',
        rating: profile.rating || 0,
        rate: profile.dailyRate || 0,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'jobs', id), {
        applied: increment(1)
      });

      // Notify the organizer
      await addDoc(collection(db, 'notifications'), {
        type: 'application',
        message: `🙋 ${profile.name} applied for your job: ${job.title}`,
        link: `/jobs/${id}`,
        userId: job.createdBy,
        forAll: false,
        read: false,
        createdAt: serverTimestamp(),
      });

      await logApplicationSubmitted(user.uid, profile.name, id, job.title);
      setHasApplied(true);
    } catch (err: any) {
      setError(err.message || 'Failed to apply.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-prime-500/30 border-t-prime-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
        <Link href="/jobs" className="text-prime-500 hover:underline">Back to Jobs</Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge-prime">{job.type}</span>
                {job.urgent && <span className="badge bg-accent-50 text-accent-600 border border-accent-200 dark:bg-accent-500/10 dark:text-accent-300 dark:border-accent-500/20 flex items-center gap-1"><Flame className="w-3 h-3" /> Urgent</span>}
                <span className="text-sm ml-auto" style={{ color: 'var(--text-muted)' }}>Posted {job.posted}</span>
              </div>
              <h1 className="text-3xl font-display font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{job.title}</h1>
              <p className="leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>{job.desc}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Location', value: job.city, icon: MapPin },
                  { label: 'Date', value: job.date, icon: Calendar },
                  { label: 'Workers', value: `${job.workers} needed`, icon: Users },
                  { label: 'Budget', value: `₹${job.budget.toLocaleString()}/day`, icon: IndianRupee },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl p-4 transition-all" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)' }}>
                    <span className="mb-2 block text-prime-500 dark:text-prime-400"><item.icon className="w-5 h-5" /></span>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="font-display font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Venue</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{job.venue}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-display font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills?.length > 0 ? job.skills.map((skill: string) => (
                    <span key={skill} className="badge-prime">{skill}</span>
                  )) : <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Any skills welcome</span>}
                </div>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Requirements</h3>
                  <ul className="space-y-2">
                    {job.requirements.map((req: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <svg className="w-4 h-4 text-prime-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Applicants (Only visible to post creator) */}
            {user?.uid === job.createdBy && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Applicants ({applicants.length})</h2>
                {applicants.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No applicants yet.</p>
                ) : (
                  <div className="space-y-3">
                    {applicants.map((a) => (
                      <div key={a.id} className="flex items-center gap-4 p-4 rounded-3xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)' }}>
                        <div className="w-12 h-12 rounded-full bg-prime-950 dark:bg-prime-50 flex items-center justify-center text-white dark:text-prime-950 font-semibold">
                          {a.workerName?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link href={`/users/${a.workerId}`} className="font-medium hover:text-prime-500 transition-colors truncate" style={{ color: 'var(--text-primary)' }}>{a.workerName}</Link>
                          </div>
                          <p className="text-xs flex items-center gap-1 truncate" style={{ color: 'var(--text-muted)' }}>{a.skill} · ₹{a.rate?.toLocaleString()}/day · <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {a.rating}</p>
                        </div>
                        <span className={`badge text-[10px] ${
                          a.status === 'hired' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' :
                          a.status === 'shortlisted' ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20' :
                          'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--bg-card-border)]'
                        }`}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              {error && (
                <div className="p-3 mb-2 rounded-xl text-xs" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
                  {error}
                </div>
              )}
              {(user && profile?.role === 'user') && (
                <button
                  onClick={handleApply}
                  disabled={applying || hasApplied}
                  className="gradient-btn rounded-full w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : hasApplied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Applied
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Apply for This Job
                    </>
                  )}
                </button>
              )}
              <button onClick={() => { setSaved(!saved); }} className="w-full py-3 rounded-full border transition-all flex items-center justify-center gap-2" style={{ border: saved ? '1px solid var(--text-primary)' : '1px solid var(--bg-card-border)', color: saved ? 'var(--text-primary)' : 'var(--text-secondary)', background: saved ? 'var(--bg-input)' : 'transparent' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {saved ? '✓ Saved' : 'Save Job'}
              </button>
            </div>

            {/* Organizer */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Posted By</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent-500 flex items-center justify-center text-white font-semibold">
                  {job.org?.charAt(0) || 'O'}
                </div>
                <div>
                  <p className="font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    {job.org || 'Organizer'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Organizer</p>
                </div>
              </div>
              <button onClick={() => router.push('/messages')} className="w-full py-2.5 rounded-full border border-prime-500/30 text-prime-500 dark:text-prime-400 hover:bg-prime-500/10 transition-all text-sm font-medium">
                Contact Organizer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
