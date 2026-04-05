'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Star, MapPin, ShieldCheck, Briefcase, User, Search, Heart, Eye, SlidersHorizontal } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const SKILLS = ['All', 'Photographer', 'Videographer', 'DJ', 'Decorator', 'Caterer', 'Makeup Artist', 'Lighting', 'Sound', 'Anchor', 'Event Assistant'];

const SKILL_COLORS: Record<string, { bg: string; color: string; gradient: string }> = {
  Photographer:     { bg: '#FFF7ED', color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #FB923C)' },
  Videographer:     { bg: '#F5F3FF', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' },
  DJ:               { bg: '#FFFBEB', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)' },
  Decorator:        { bg: '#ECFDF5', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
  Caterer:          { bg: '#FEF2F2', color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #F87171)' },
  'Makeup Artist':  { bg: '#FDF2F8', color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899, #F472B6)' },
  Lighting:         { bg: '#FFF7ED', color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #FB923C)' },
  Sound:            { bg: '#ECFEFF', color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #22D3EE)' },
  Anchor:           { bg: '#F0FDF4', color: '#22C55E', gradient: 'linear-gradient(135deg, #22C55E, #4ADE80)' },
  'Event Assistant':{ bg: '#F5F3FF', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' },
};

const getColorForSkill = (skill: string) =>
  SKILL_COLORS[skill] || { bg: '#F3F4F6', color: '#6B7280', gradient: 'linear-gradient(135deg, #6B7280, #9CA3AF)' };

export default function WorkersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 pb-12 flex justify-center items-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    }>
      <WorkersContent />
    </Suspense>
  );
}

function WorkersContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((u: any) => u.role !== 'admin');
      setWorkers(data);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  let filtered = selectedSkill === 'All'
    ? workers
    : workers.filter((w) => w.skills?.includes(selectedSkill) || w.skill === selectedSkill);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(w =>
      w.name?.toLowerCase().includes(q) ||
      w.skills?.some((s: string) => s.toLowerCase().includes(q)) ||
      w.city?.toLowerCase().includes(q)
    );
  }

  if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'rate') {
    filtered = [...filtered].sort((a, b) => (b.dailyRate || 0) - (a.dailyRate || 0));
  } else if (sortBy === 'reviews') {
    filtered = [...filtered].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  }

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen" style={{ paddingTop: '80px', background: 'var(--bg-primary)' }}>

      {/* ── Dribbble-style Hero Header ── */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1
                className="font-display font-extrabold mb-2"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
              >
                Discover Professionals
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                {loading ? 'Loading...' : `${filtered.length.toLocaleString()} verified event professionals`}
              </p>
            </div>

            {/* Dribbble-style pill search */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-full max-w-sm w-full"
              style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border-default)' }}
            >
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
              <input
                type="text"
                placeholder="Search name, skill, or city..."
                className="bg-transparent outline-none w-full text-sm"
                style={{ color: 'var(--text-primary)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-faint)' }}>✕</button>
              )}
            </div>
          </div>

          {/* Dribbble-style category pills */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-1 scrollbar-hide">
            {SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className="category-pill"
                style={selectedSkill === skill ? {
                  background: 'var(--orange-pale)',
                  borderColor: 'var(--orange)',
                  color: 'var(--orange)',
                } : {}}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm font-medium bg-transparent outline-none cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <option value="rating">Top Rated</option>
              <option value="rate">Highest Rate</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          /* Dribbble-style skeleton shimmer grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-44 rounded-t-3xl" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded-full" />
                  <div className="skeleton h-3 w-1/2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'var(--orange-pale)' }}
            >
              <User className="w-9 h-9" style={{ color: 'var(--orange)' }} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
              {workers.length === 0 ? 'No professionals registered yet' : 'No results found'}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              {workers.length === 0
                ? 'Be the first to create a professional profile!'
                : 'Try different search terms or clear the filters.'}
            </p>
            {workers.length === 0 ? (
              <Link href="/signup" className="btn-primary">Join as Professional</Link>
            ) : (
              <button onClick={() => { setSearchQuery(''); setSelectedSkill('All'); }} className="btn-secondary">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Dribbble-style image-first masonry grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filtered.map((worker) => {
              const initials = worker.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'W';
              const isOrganizer = worker.role === 'organizer';
              const primarySkill = isOrganizer
                ? (worker.companyName || 'Event Organizer')
                : (worker.skills?.[0] || 'Event Professional');
              const colorConfig = getColorForSkill(primarySkill);
              const isLiked = likedIds.has(worker.id);

              return (
                <Link key={worker.id} href={`/users/${worker.id}`} className="shot-card group block">
                  {/* Dribbble-style image / gradient cover */}
                  <div className="relative overflow-hidden" style={{ height: '180px' }}>
                    {worker.photoURL ? (
                      <img
                        src={worker.photoURL}
                        alt={worker.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: colorConfig.gradient }}
                      >
                        <span className="text-5xl font-display font-black text-white/30 select-none">
                          {initials}
                        </span>
                      </div>
                    )}

                    {/* Hover overlay with like + view — Dribbble style */}
                    <div className="shot-overlay absolute inset-0 bg-black/30 flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => toggleLike(worker.id, e)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold text-white"
                        style={{ background: isLiked ? '#F43F5E' : 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                        {isLiked ? 'Liked' : 'Like'}
                      </button>
                      <div
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold text-white"
                        style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </div>
                    </div>

                    {/* Verified badge */}
                    {worker.verified && (
                      <div
                        className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-xs font-semibold"
                        style={{ background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(4px)' }}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </div>
                    )}

                    {/* Skill pill */}
                    <div
                      className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#fff' }}
                    >
                      {isOrganizer ? '🏢 Organizer' : `⚡ ${primarySkill}`}
                    </div>
                  </div>

                  {/* Dribbble card meta — name, rating, location, rate */}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Small avatar circle */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                          style={{ background: colorConfig.gradient }}
                        >
                          {worker.photoURL
                            ? <img src={worker.photoURL} alt="" className="w-full h-full object-cover" />
                            : initials
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                            {worker.name || 'Professional'}
                          </p>
                          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-faint)' }}>
                            <MapPin className="w-3 h-3" />
                            {worker.city || 'India'}
                          </p>
                        </div>
                      </div>

                      {/* Rating + Price */}
                      <div className="text-right flex-shrink-0">
                        {worker.rating > 0 && (
                          <div className="flex items-center justify-end gap-1 text-xs font-semibold mb-0.5" style={{ color: '#F59E0B' }}>
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {worker.rating.toFixed(1)}
                            <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>({worker.reviewCount || 0})</span>
                          </div>
                        )}
                        {worker.dailyRate > 0 && (
                          <p className="text-xs font-bold" style={{ color: 'var(--orange)' }}>
                            ₹{Number(worker.dailyRate).toLocaleString()}<span className="font-normal" style={{ color: 'var(--text-faint)' }}>/day</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
