'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Building2, MapPin, Calendar, Plus } from 'lucide-react';
import { db } from '@/lib/firebase';

const types = ['All', 'Wedding', 'Corporate', 'Concert', 'Birthday', 'Festival'];

export default function JobsPage() {
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  let filtered = selectedType === 'All' ? jobs : jobs.filter((j) => j.type === selectedType);
  
  if (sortBy === 'budget') {
    filtered.sort((a, b) => b.budget - a.budget);
  } else if (sortBy === 'applicants') {
    filtered.sort((a, b) => b.applied - a.applied);
  } else {
    filtered.sort((a, b) => {
       const dateA = a.createdAt?.toMillis() || 0;
       const dateB = b.createdAt?.toMillis() || 0;
       return dateB - dateA;
    });
  }

  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="section-title mb-2">Job Marketplace</h1>
            <p className="section-subtitle">Find event opportunities near you</p>
          </div>
          <Link href="/jobs/create" className="gradient-btn-accent rounded-full flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Post Event
          </Link>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--bg-input-border)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--text-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search events..." className="bg-transparent outline-none w-full text-sm" style={{ color: 'var(--text-primary)' }} />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field !w-auto !py-2 text-sm">
              <option value="date">Sort by Date</option>
              <option value="budget">Sort by Budget</option>
              <option value="applicants">Sort by Applicants</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                style={selectedType === type
                  ? { background: 'var(--prime-500)', color: '#fff' }
                  : { background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', color: 'var(--text-muted)' }
                }
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-prime-500/30 border-t-prime-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No jobs found</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="glass-card-hover p-6 block group">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>{job.title}</h3>
                      {job.urgent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-accent-500">URGENT</span>
                      )}
                      <span className="badge-accent text-[10px]">{job.type}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {job.org}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.city}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {job.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>₹{job.budget?.toLocaleString()}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>per day</div>
                    </div>
                    <div className="text-center">
                      <div className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>{job.workers}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>needed</div>
                    </div>
                    <div className="text-center">
                      <div className="font-display font-bold text-prime-500">{job.applied}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>applied</div>
                    </div>
                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
