'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import {
  MapPin, Calendar, Users, Plus, Lock, Search, ArrowRight,
  Briefcase, Zap, Filter, SlidersHorizontal
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const types = ['All', 'Wedding', 'Corporate', 'Concert', 'Birthday', 'Festival', 'Conference'];

const categoryGradients: Record<string, string> = {
  Wedding:    'from-pink-500 to-rose-600',
  Corporate:  'from-blue-500 to-blue-700',
  Concert:    'from-purple-500 to-purple-700',
  Birthday:   'from-amber-500 to-orange-600',
  Festival:   'from-emerald-500 to-teal-600',
  Conference: 'from-slate-500 to-slate-700',
};

const categoryColors: Record<string, string> = {
  Wedding:    '#F43F5E',
  Corporate:  '#2563EB',
  Concert:    '#7C3AED',
  Birthday:   '#F59E0B',
  Festival:   '#10B981',
  Conference: '#64748B',
};

export default function JobsPage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  let filtered = jobs.filter(j => {
    if (selectedType !== 'All' && j.type !== selectedType) return false;
    if (searchQuery && !j.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !j.org?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !j.city?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (sortBy === 'budget') filtered.sort((a, b) => b.budget - a.budget);
  else if (sortBy === 'applicants') filtered.sort((a, b) => b.applied - a.applied);
  else filtered.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

  const isLocked = !authLoading && !user;
  const displayJobs = isLocked ? filtered.slice(0, 3) : filtered;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', paddingTop: '64px' }}>

      {/* ── Page Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #2563EB 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold text-blue-200"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Zap className="w-3 h-3 text-amber-400" />
                Live Opportunities
              </div>
              <h1 className="font-bold text-white mb-2"
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.025em' }}>
                Event Marketplace
              </h1>
              <p style={{ color: '#93C5FD', fontSize: '0.9375rem' }}>
                Browse {jobs.length || '100+'} open events and apply directly — no middlemen
              </p>
            </div>
            <Link
              href="/jobs/create"
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white text-sm flex-shrink-0"
              style={{ background: '#2563EB', fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}
            >
              <Plus className="w-4 h-4" />
              Post Your Event
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Filters ── */}
        <div className="card p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
              <input
                type="text"
                placeholder="Search by event name, organizer, city..."
                className="bg-transparent outline-none w-full text-sm"
                style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="input-field text-sm py-2.5 pr-8"
                style={{ minWidth: '160px' }}
              >
                <option value="date">Newest First</option>
                <option value="budget">Highest Budget</option>
                <option value="applicants">Most Applied</option>
              </select>
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={selectedType === type
                  ? { background: '#2563EB', color: '#fff', fontFamily: 'Poppins, sans-serif' }
                  : { background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }
                }
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        {!loading && !authLoading && (
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            {isLocked
              ? `Showing 3 of ${filtered.length} events — log in to see all`
              : `${filtered.length} event${filtered.length !== 1 ? 's' : ''} found`
            }
          </p>
        )}

        {/* ── Content ── */}
        {loading || authLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-40" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--blue-pale)' }}>
              <Briefcase className="w-8 h-8" style={{ color: 'var(--blue)' }} />
            </div>
            <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)' }}>
              No events found
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Try adjusting your filters or{' '}
              <button onClick={() => { setSelectedType('All'); setSearchQuery(''); }} className="underline" style={{ color: 'var(--blue)' }}>
                clear all filters
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayJobs.map((job) => {
                const gradClass = categoryGradients[job.type] || 'from-blue-500 to-blue-700';
                const catColor = categoryColors[job.type] || '#2563EB';
                return (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="event-card group block">
                    {/* Card visual header */}
                    <div className="relative overflow-hidden" style={{ height: '150px' }}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradClass}`} />
                      <div className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='10' cy='10' r='10'/%3E%3Ccircle cx='50' cy='50' r='5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {job.urgent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase bg-red-500">
                            Urgent
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                          style={{ background: 'rgba(255,255,255,0.20)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                          {job.type}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                          style={{ background: 'rgba(0,0,0,0.30)', backdropFilter: 'blur(4px)' }}>
                          ₹{job.budget?.toLocaleString()}/day
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm mb-2 leading-snug line-clamp-2"
                        style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)' }}>
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.city}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{job.date}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.workers} needed</span>
                      </div>
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                          {job.org || 'Private Organizer'}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--blue)' }}>
                          View Details <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Login gate */}
            {isLocked && filtered.length > 3 && (
              <div className="mt-8 rounded-2xl overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #0F172A, #1E3A8A)', padding: '3rem 2rem', textAlign: 'center' }}>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='5' cy='5' r='2'/%3E%3Ccircle cx='35' cy='35' r='2'/%3E%3C/g%3E%3C/svg%3E\")" }}
                />
                <div className="relative z-10 max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)' }}>
                    <Lock className="w-7 h-7 text-blue-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {filtered.length - 3} more events waiting
                  </h3>
                  <p className="text-blue-200 text-sm mb-6">
                    Create a free account to unlock the full marketplace, apply to events, and start earning.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Link href="/login?redirect=/jobs"
                      className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: '#2563EB', fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}
                    >
                      Log In
                    </Link>
                    <Link href="/signup?redirect=/jobs"
                      className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontFamily: 'Poppins, sans-serif' }}
                    >
                      Create Free Account
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
