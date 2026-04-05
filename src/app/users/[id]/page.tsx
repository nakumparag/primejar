'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, query, orderBy, limit, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, MapPin, ShieldCheck, Edit, MessageSquare, Lock, Eye, Briefcase, User } from 'lucide-react';
import { sendChatRequest, getChatRequestStatus } from '@/lib/chat';
import { useAuth } from '@/contexts/AuthContext';

// ── Role helpers ──────────────────────────────────────────────────────────────
function isOrganizerRole(role?: string) {
  return role === 'organizer';
}
function isWorkerRole(role?: string) {
  return role === 'user' || role === 'worker';
}

export default function WorkerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, profile } = useAuth();

  const [userData, setUserData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.uid === id;
  const viewerRole = profile?.role;
  const viewerIsOrganizer = isOrganizerRole(viewerRole);
  const viewerIsWorker = isWorkerRole(viewerRole);

  const [chatStatus, setChatStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected' | 'loading'>('loading');
  const [chatSending, setChatSending] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;

    const unsubUser = onSnapshot(doc(db, 'users', id), (snap) => {
      if (snap.exists()) {
        setUserData({ id: snap.id, ...snap.data() });
      } else {
        setUserData(null);
      }
      setLoading(false);
    }, () => setLoading(false));

    const reviewsQ = query(
      collection(db, `users/${id}/reviews`),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const unsubReviews = onSnapshot(reviewsQ, (snap) => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});

    return () => {
      unsubUser();
      unsubReviews();
    };
  }, [id]);

  useEffect(() => {
    if (!user || !id || isOwnProfile) {
      setChatStatus('none');
      return;
    }
    getChatRequestStatus(user.uid, id)
      .then(status => setChatStatus(status))
      .catch(() => setChatStatus('none'));
  }, [user, id, isOwnProfile]);

  const handleChatRequest = async () => {
    if (!user || !id) return;
    setChatSending(true);
    try {
      const myName = profile?.name || user.displayName || user.email?.split('@')[0] || 'User';
      const theirName = userData?.name || 'User';
      await sendChatRequest(user.uid, myName, id, theirName);
      setChatStatus('pending');
    } catch (err) {
      console.error(err);
    } finally {
      setChatSending(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !newReviewText.trim()) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, `users/${id}/reviews`), {
        text: newReviewText,
        rating: newReviewRating,
        reviewerName: profile?.name || user.displayName || user.email?.split('@')[0] || 'Anonymous',
        reviewerId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewReviewText('');
      setNewReviewRating(5);

      const newCount = (userData.reviewCount || 0) + 1;
      const currentTotal = (userData.rating || 0) * (userData.reviewCount || 0);
      const newAvg = (currentTotal + newReviewRating) / newCount;
      await updateDoc(doc(db, 'users', id), {
        rating: newAvg,
        reviewCount: newCount
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-prime-500/30 border-t-prime-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col justify-center items-center">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Profile Not Found</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>This user hasn't set up their profile yet.</p>
        {isOwnProfile && (
          <Link href="/dashboard/user" className="gradient-btn rounded-full px-6 py-2 text-sm">
            Complete Your Profile
          </Link>
        )}
        <Link href="/users" className="mt-4 text-prime-500 hover:underline text-sm">Browse All Professionals</Link>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const displayName = userData?.name || 'Professional';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const profileRole = userData?.role;
  const isProfileOrganizer = isOrganizerRole(profileRole);
  const primarySkill = userData?.skills?.[0] || (isProfileOrganizer ? 'Event Organizer' : 'Event Professional');
  const city = userData?.city || 'India';
  const exp = userData?.experience || 'Not specified';
  const fullBio = userData?.bio || '';
  const shortBio = fullBio.length > 120 ? fullBio.slice(0, 120) + '…' : fullBio;
  const skills = userData?.skills || [];
  const rating = userData?.rating || 0;
  const reviewCount = userData?.reviewCount || 0;
  const dailyRate = userData?.dailyRate || 0;
  const eventsCount = userData?.eventsCount || 0;
  const completionRate = userData?.completionRate || 0;
  const availability = userData?.availability || [];
  const verified = userData?.verified || false;

  // ── Visibility flags (applied when NOT own profile) ───────────────────────
  // Organizers always see full profile.
  // Workers see limited info — only unlocked when chat is accepted.
  const canSeeFullProfile = isOwnProfile || viewerIsOrganizer || chatStatus === 'accepted';
  const canSeePortfolio = isOwnProfile || viewerIsOrganizer || chatStatus === 'accepted';
  const canSeeRates = isOwnProfile || viewerIsOrganizer || chatStatus === 'accepted';
  const canSeeExperience = isOwnProfile || viewerIsOrganizer || chatStatus === 'accepted';
  // Bio: organizer sees full; worker sees snippet until connected
  const displayBio = canSeeFullProfile ? fullBio : shortBio;

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const availableDays = days.map((_, i) => availability.includes(dayNames[i]));

  // ── Chat request button ────────────────────────────────────────────────────
  const ChatRequestButton = () => {
    if (!user) {
      return (
        <button onClick={() => router.push('/login')} className="gradient-btn flex items-center gap-2 rounded-full">
          <MessageSquare className="w-4 h-4" /> Sign in to Connect
        </button>
      );
    }
    if (isOwnProfile) return null;

    if (chatStatus === 'accepted') {
      return (
        <button onClick={() => router.push('/messages')} className="gradient-btn flex items-center gap-2 rounded-full">
          <MessageSquare className="w-4 h-4" /> Open Chat
        </button>
      );
    }
    if (chatStatus === 'pending') {
      return (
        <button disabled className="gradient-btn flex items-center gap-2 rounded-full opacity-60 cursor-not-allowed">
          <MessageSquare className="w-4 h-4" /> Request Sent ⏳
        </button>
      );
    }
    if (chatStatus === 'rejected') {
      return (
        <button disabled className="btn-secondary flex items-center gap-2 rounded-full opacity-60 cursor-not-allowed">
          Request Declined
        </button>
      );
    }
    return (
      <button
        onClick={handleChatRequest}
        disabled={chatSending || chatStatus === 'loading'}
        className="gradient-btn flex items-center gap-2 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {chatSending ? (
          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          <MessageSquare className="w-4 h-4" />
        )}
        {chatSending ? 'Sending…' : 'Send Chat Request'}
      </button>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Profile Header ── */}
        <div className="glass-card p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-white font-bold text-4xl overflow-hidden"
                style={{ background: userData?.photoURL ? 'transparent' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {userData?.photoURL
                  ? <img src={userData.photoURL} alt={displayName} className="w-full h-full object-cover" />
                  : initials}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">{displayName}</h1>
                {verified && (
                  <span className="badge-success flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {/* Role badge */}
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={isProfileOrganizer
                    ? { background: 'rgba(251,146,60,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)' }
                    : { background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.25)' }
                  }
                >
                  {isProfileOrganizer ? <Briefcase className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {isProfileOrganizer ? 'Event Organizer' : 'Event Professional'}
                </span>
                {isOwnProfile && (
                  <Link
                    href="/dashboard/user"
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', color: 'var(--text-secondary)' }}
                  >
                    <Edit className="w-4 h-4" /> Edit Profile
                  </Link>
                )}
              </div>

              <p className="font-medium text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{primarySkill}</p>
              <p className="flex items-center gap-1 mb-4" style={{ color: 'var(--text-muted)' }}>
                <MapPin className="w-4 h-4" />
                {city}
                {canSeeExperience && exp !== 'Not specified' && ` · ${exp} years experience`}
              </p>

              {/* Bio — full for organizer viewer, snippet for worker viewer */}
              {displayBio && (
                <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                  {displayBio}
                  {!canSeeFullProfile && fullBio.length > 120 && (
                    <span className="ml-1 text-prime-500 text-xs font-medium">
                      [Connect to read more]
                    </span>
                  )}
                </p>
              )}

              {/* Stats — only fully visible to organizers or connected users */}
              <div className="flex flex-wrap gap-6 mt-6">
                {eventsCount > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-[var(--text-primary)]">{eventsCount}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Events Done</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-display font-bold text-[var(--text-primary)] flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    {rating > 0 ? rating.toFixed(1) : 'New'}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{reviewCount} Reviews</div>
                </div>
                {completionRate > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-accent-600 dark:text-accent-400">{completionRate}%</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Completion</div>
                  </div>
                )}
                {canSeeRates && dailyRate > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-prime-600 dark:text-prime-400">₹{Number(dailyRate).toLocaleString()}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Per Day</div>
                  </div>
                )}
                {!canSeeRates && !isOwnProfile && dailyRate > 0 && (
                  <div className="text-center opacity-50">
                    <div className="text-2xl font-display font-bold text-[var(--text-muted)] flex items-center gap-1">
                      <Lock className="w-4 h-4" /> ₹•••
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Daily Rate</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          {!isOwnProfile && (
            <div className="flex flex-wrap gap-3 mt-8 pt-6" style={{ borderTop: '1px solid var(--divider)' }}>
              <ChatRequestButton />
            </div>
          )}
        </div>

        {/* ── Restricted Info Panel — shown to worker viewers who are not yet connected ── */}
        {!isOwnProfile && !viewerIsOrganizer && !canSeeFullProfile && user && (
          <div
            className="mb-6 rounded-3xl overflow-hidden relative"
            style={{
              border: '1px solid rgba(99,102,241,0.2)',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))',
            }}
          >
            {/* Blurred mock content backdrop */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <div className="w-full h-full" style={{ backdropFilter: 'blur(0px)' }} />
            </div>
            <div className="relative z-10 p-8 flex flex-col md:flex-row items-center gap-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-display font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Full Profile Locked
                </h3>
                <p className="text-sm max-w-md" style={{ color: 'var(--text-muted)' }}>
                  Send a chat request to unlock this professional's full bio, experience, portfolio, and daily rates. They'll need to accept before you can connect.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                {/* Locked sections indicator */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { icon: <Eye className="w-3 h-3" />, label: 'Full Bio' },
                    { icon: <Briefcase className="w-3 h-3" />, label: 'Experience' },
                    { icon: <Lock className="w-3 h-3" />, label: 'Portfolio' },
                    { icon: <Lock className="w-3 h-3" />, label: 'Rates' },
                  ].map(item => (
                    <span
                      key={item.label}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                      style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
                    >
                      {item.icon} {item.label}
                    </span>
                  ))}
                </div>
                {chatStatus === 'pending' && (
                  <p className="text-xs text-amber-500 font-medium mt-1">⏳ Request sent — awaiting acceptance</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Skills — always visible */}
            {skills.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-[var(--text-primary)] text-lg mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string) => (
                    <span key={skill} className="badge-prime">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio — organizers or connected users only */}
            {canSeePortfolio && userData?.portfolioImages?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-[var(--text-primary)] text-lg mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {userData.portfolioImages.map((url: string, i: number) => (
                    <div key={i} className="aspect-square rounded-3xl overflow-hidden bg-[var(--bg-secondary)] cursor-pointer hover:opacity-90 transition-opacity">
                      <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio locked placeholder — workers not yet connected */}
            {!canSeePortfolio && !isOwnProfile && userData?.portfolioImages?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-[var(--text-primary)] text-lg mb-4 flex items-center gap-2">
                  Portfolio <Lock className="w-4 h-4 text-[var(--text-muted)]" />
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {userData.portfolioImages.slice(0, 3).map((_: string, i: number) => (
                    <div
                      key={i}
                      className="aspect-square rounded-3xl overflow-hidden flex items-center justify-center"
                      style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--divider)' }}
                    >
                      <Lock className="w-6 h-6 text-[var(--text-muted)]" />
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                  {userData.portfolioImages.length} portfolio image{userData.portfolioImages.length !== 1 ? 's' : ''} — connect to view
                </p>
              </div>
            )}

            {/* Reviews — always visible */}
            {reviews.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-[var(--text-primary)] text-lg mb-4">Reviews ({reviewCount})</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-3xl bg-[rgba(0,0,0,0.02)] dark:bg-white/5 border border-[var(--divider)]">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-[var(--text-primary)] text-sm">{review.reviewerName || 'Anonymous'}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {review.eventTitle || ''} {review.createdAt?.toDate?.().toLocaleDateString?.() || ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: review.rating || 0 }).map((_, j) => (
                            <Star key={j} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leave a Review — only when chat accepted (organizer or connected worker) */}
            {!isOwnProfile && user && chatStatus === 'accepted' && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-[var(--text-primary)] text-lg mb-4">Leave a Review</h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setNewReviewRating(star)}>
                        <Star className={`w-6 h-6 ${newReviewRating >= star ? 'fill-amber-500 text-amber-500' : 'text-[var(--divider)]'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newReviewText}
                    onChange={e => setNewReviewText(e.target.value)}
                    placeholder="Write your review here..."
                    className="input-field h-24 resize-none"
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={!newReviewText.trim() || submittingReview}
                    className="gradient-btn px-6 py-2 rounded-full text-sm disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting…' : 'Submit Review'}
                  </button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {skills.length === 0 && reviews.length === 0 && !userData?.portfolioImages?.length && (
              <div className="glass-card p-8 text-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This professional hasn't filled in their detailed info yet.</p>
                {isOwnProfile && (
                  <Link href="/dashboard/user" className="gradient-btn rounded-full px-6 py-2 inline-block mt-4 text-sm">
                    Complete Profile
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-6">

            {/* Availability — always visible */}
            {availability.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-[var(--text-primary)] text-lg mb-4">Availability</h2>
                <div className="grid grid-cols-7 gap-1.5">
                  {days.map((day, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-xl flex items-center justify-center text-xs font-medium ${
                        availableDays[i]
                          ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 border border-accent-200 dark:border-accent-500/20'
                          : 'bg-[rgba(0,0,0,0.02)] dark:bg-white/5 text-[var(--text-muted)] border border-[var(--divider)]'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                  Available: {availability.join(', ') || 'Not specified'}
                </p>
              </div>
            )}

            {/* Quick Info */}
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-display font-semibold text-[var(--text-primary)] text-lg">Quick Info</h2>
              <div className="space-y-3 text-sm">
                {userData?.createdAt && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
                    <span className="text-[var(--text-primary)]">
                      {userData.createdAt.toDate?.().toLocaleDateString?.('en-IN', { year: 'numeric', month: 'short' }) || ''}
                    </span>
                  </div>
                )}
                {canSeeExperience && exp !== 'Not specified' && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Experience</span>
                    <span className="text-[var(--text-primary)]">{exp} years</span>
                  </div>
                )}
                {!canSeeExperience && !isOwnProfile && exp !== 'Not specified' && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Experience</span>
                    <span className="text-[var(--text-muted)] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Hidden
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Location</span>
                  <span className="text-[var(--text-primary)]">{city}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Role</span>
                  <span className="text-[var(--text-primary)]">{isProfileOrganizer ? 'Organizer' : 'Event Professional'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Daily Rate</span>
                  {canSeeRates ? (
                    <span className="text-[var(--text-primary)]">
                      {dailyRate > 0 ? `₹${Number(dailyRate).toLocaleString()}` : 'Negotiable'}
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Hidden
                    </span>
                  )}
                </div>
              </div>

              {/* Organizer viewer — special callout */}
              {viewerIsOrganizer && !isOwnProfile && (
                <div
                  className="mt-4 p-3 rounded-2xl text-xs"
                  style={{
                    background: 'rgba(251,146,60,0.08)',
                    border: '1px solid rgba(249,115,22,0.2)',
                    color: '#f97316'
                  }}
                >
                  <p className="font-semibold mb-0.5">👀 Organizer View</p>
                  <p style={{ color: 'rgba(249,115,22,0.8)' }}>You can see this professional's full profile.</p>
                </div>
              )}

              {/* Worker viewer — privacy notice */}
              {viewerIsWorker && !isOwnProfile && !canSeeFullProfile && (
                <div
                  className="mt-4 p-3 rounded-2xl text-xs"
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.18)',
                    color: '#6366f1'
                  }}
                >
                  <p className="font-semibold mb-0.5">🔒 Privacy Protected</p>
                  <p style={{ color: 'rgba(99,102,241,0.8)' }}>Send a request to unlock the full profile and connect.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
