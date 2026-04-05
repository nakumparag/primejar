'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera, Video, Music, Palette, Utensils, Brush, Lightbulb, Mic,
  Users, Calendar, ClipboardList, CheckCircle, UserPlus, Search,
  MessageCircle, Star, ArrowRight, Sparkles, Shield, Zap,
  MapPin, TrendingUp, Play, ChevronRight
} from 'lucide-react';

const eventImages = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=900&q=80',
];

const categories = [
  { name: 'Photographers', icon: Camera, count: 1240, color: '#F97316', bg: '#FFF7ED' },
  { name: 'Videographers', icon: Video, count: 890, color: '#8B5CF6', bg: '#F5F3FF' },
  { name: 'DJs & Music', icon: Music, count: 560, color: '#F59E0B', bg: '#FFFBEB' },
  { name: 'Decorators', icon: Palette, count: 780, color: '#10B981', bg: '#ECFDF5' },
  { name: 'Caterers', icon: Utensils, count: 920, color: '#EF4444', bg: '#FEF2F2' },
  { name: 'Makeup', icon: Brush, count: 650, color: '#EC4899', bg: '#FDF2F8' },
  { name: 'Lighting', icon: Lightbulb, count: 340, color: '#F97316', bg: '#FFF7ED' },
  { name: 'Anchors', icon: Mic, count: 280, color: '#06B6D4', bg: '#ECFEFF' },
];

const featuredWorkers = [
  { name: 'Rahul Sharma', skill: 'Photographer', city: 'Mumbai', rating: 4.9, reviews: 127, rate: 5000, verified: true, avatar: 'RS', color: '#F97316' },
  { name: 'Priya Patel', skill: 'Videographer', city: 'Delhi', rating: 4.8, reviews: 94, rate: 4500, verified: true, avatar: 'PP', color: '#8B5CF6' },
  { name: 'Meera Singh', skill: 'Decorator', city: 'Jaipur', rating: 4.8, reviews: 68, rate: 3500, verified: true, avatar: 'MS', color: '#10B981' },
  { name: 'Arjun Reddy', skill: 'DJ', city: 'Hyderabad', rating: 4.7, reviews: 156, rate: 8000, verified: false, avatar: 'AR', color: '#F59E0B' },
];

const steps = [
  { num: '01', title: 'Create Profile', desc: 'Sign up and build your professional profile with skills, portfolio, and rates.', icon: UserPlus, color: '#F97316', bg: '#FFF7ED' },
  { num: '02', title: 'Browse & Apply', desc: 'Find events that match your skills or post jobs to hire professionals.', icon: Search, color: '#8B5CF6', bg: '#F5F3FF' },
  { num: '03', title: 'Connect', desc: 'Message directly, negotiate terms, and confirm your event team.', icon: MessageCircle, color: '#10B981', bg: '#ECFDF5' },
  { num: '04', title: 'Work & Grow', desc: 'Complete events, earn reviews, and build your reputation.', icon: Star, color: '#F59E0B', bg: '#FFFBEB' },
];

const testimonials = [
  { text: 'PrimeJar changed how I find work. Went from 2 events/month to 8! The platform is incredibly easy to use.', name: 'Vikram K.', role: 'Photographer, Mumbai', rating: 5, avatar: 'VK' },
  { text: 'Found the perfect team for our wedding in just 2 days. Professional profiles with reviews made decision-making so easy.', name: 'Sneha M.', role: 'Wedding Planner, Delhi', rating: 5, avatar: 'SM' },
  { text: 'No more WhatsApp chaos! PrimeJar organizes everything — from finding workers to managing the event team.', name: 'Rajesh P.', role: 'Event Company, Bangalore', rating: 5, avatar: 'RP' },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % eventImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    router.push(searchQuery.trim() ? `/users?q=${encodeURIComponent(searchQuery.trim())}` : '/users');
  };

  return (
    <div className="min-h-screen" style={{ paddingTop: '64px', background: 'var(--bg-primary)' }}>

      {/* ─── HERO SECTION ─── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--bg-card)' }}
      >
        {/* Subtle mesh background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 20% 60%, rgba(249,115,22,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.03) 0%, transparent 60%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: Text */}
            <div className="animate-fade-in">
              {/* Announcement pill */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold"
                style={{
                  background: 'var(--orange-pale)',
                  color: 'var(--orange-dark)',
                  border: '1px solid rgba(249,115,22,0.2)',
                }}
              >
                <Sparkles className="w-4 h-4" />
                India&apos;s #1 Event Manpower Marketplace
                <ChevronRight className="w-3.5 h-3.5" />
              </div>

              <h1
                className="font-display font-extrabold leading-[1.1] mb-6"
                style={{
                  fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                }}
              >
                Find Top Event{' '}
                <span className="orange-gradient-text">Professionals</span>
                {' '}Instantly
              </h1>

              <p className="text-lg mb-8 max-w-lg" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Connect with photographers, videographers, DJs, decorators, and 10,000+ verified professionals across India. No middlemen, no hassle.
              </p>

              {/* Search Bar */}
              <div
                className="flex flex-col sm:flex-row gap-2 max-w-xl p-2 rounded-2xl mb-10"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-default)',
                }}
              >
                <div className="flex items-center gap-3 flex-1 px-4 py-2 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                  <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
                  <input
                    type="text"
                    placeholder="Search photographers, DJs, decorators..."
                    className="bg-transparent outline-none w-full text-sm"
                    style={{ color: 'var(--text-primary)' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button onClick={handleSearch} className="btn-primary flex-shrink-0 px-6 py-3" style={{ borderRadius: '12px' }}>
                  Search
                </button>
              </div>

              {/* Popular searches */}
              <div className="flex flex-wrap gap-2 mb-10">
                <span className="text-sm" style={{ color: 'var(--text-faint)' }}>Popular:</span>
                {['Photographers', 'DJs', 'Decorators', 'Caterers'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setSearchQuery(tag); router.push(`/users?q=${tag}`); }}
                    className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--orange)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--orange)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {[
                  { value: '10,000+', label: 'Professionals', icon: Users },
                  { value: '25,000+', label: 'Events Completed', icon: CheckCircle },
                  { value: '50+', label: 'Cities', icon: MapPin },
                  { value: '4.8★', label: 'Avg Rating', icon: Star },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <stat.icon className="w-4 h-4" style={{ color: 'var(--orange)' }} />
                    <div>
                      <div className="font-display font-bold text-lg leading-none" style={{ color: 'var(--text-primary)' }}>
                        {stat.value}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Event Gallery */}
            <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                {eventImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Event ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-1000"
                    style={{
                      opacity: currentImage === i ? 1 : 0,
                      transform: currentImage === i ? 'scale(1)' : 'scale(1.06)',
                    }}
                  />
                ))}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

                {/* Caption */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-semibold">Live Event Moments</p>
                    <p className="text-white/60 text-xs">Captured by PrimeJar professionals</p>
                  </div>
                  <div className="flex gap-1.5">
                    {eventImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className="transition-all duration-300 rounded-full"
                        style={{
                          width: currentImage === i ? '20px' : '6px',
                          height: '6px',
                          background: currentImage === i ? '#F97316' : 'rgba(255,255,255,0.5)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating stat cards */}
              <div
                className="absolute -bottom-5 -left-5 px-4 py-3 rounded-2xl flex items-center gap-3 animate-float shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ECFDF5' }}>
                  <Shield className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none mb-0.5" style={{ color: 'var(--text-primary)' }}>Verified Pros</p>
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>10,000+ available</p>
                </div>
              </div>

              <div
                className="absolute -top-4 -right-4 px-4 py-3 rounded-2xl flex items-center gap-3 animate-float shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', animationDelay: '2s' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFF7ED' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#F97316' }} />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none mb-0.5" style={{ color: 'var(--text-primary)' }}>4.8 Avg Rating</p>
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>25,000+ events done</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── OVERVIEW STATS ─── */}
      <section className="py-12" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Professionals', value: '10,240', change: '+12%', icon: Users, iconBg: '#FFF7ED', iconColor: '#F97316' },
              { label: 'Active Jobs', value: '234', change: '+8%', icon: Calendar, iconBg: '#F5F3FF', iconColor: '#8B5CF6' },
              { label: 'Applications', value: '3,890', change: '+24%', icon: ClipboardList, iconBg: '#ECFDF5', iconColor: '#10B981' },
              { label: 'Events Completed', value: '25,100', change: '+18%', icon: CheckCircle, iconBg: '#FFFBEB', iconColor: '#F59E0B' },
            ].map((card) => (
              <div
                key={card.label}
                className="card-hover p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.iconBg }}>
                    <card.icon className="w-5 h-5" style={{ color: card.iconColor }} />
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ background: '#ECFDF5', color: '#059669' }}
                  >
                    {card.change}
                  </span>
                </div>
                <div className="text-2xl font-display font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {card.value}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-20" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-sm font-semibold" style={{ background: 'var(--orange-pale)', color: 'var(--orange-dark)' }}>
              <Zap className="w-4 h-4" />
              Browse Categories
            </div>
            <h2 className="section-title mb-3">All Event Professionals</h2>
            <p className="section-subtitle mx-auto">Find the right professionals for every aspect of your event</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href="/users"
                className="card-hover p-6 text-center group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: cat.bg }}
                >
                  <cat.icon className="w-7 h-7" style={{ color: cat.color }} />
                </div>
                <h3 className="font-display font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                  {cat.name}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {cat.count.toLocaleString()} available
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-sm font-semibold" style={{ background: 'var(--orange-pale)', color: 'var(--orange-dark)' }}>
              <Play className="w-3.5 h-3.5" fill="currentColor" />
              How It Works
            </div>
            <h2 className="section-title mb-3">Start in 4 Simple Steps</h2>
            <p className="section-subtitle mx-auto">From sign-up to your first event in under 10 minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {steps.map((step, i) => (
              <div key={step.num} className="card-hover p-6 group relative">
                {/* Step connector line */}
                {i < 3 && (
                  <div
                    className="hidden md:block absolute top-10 left-full w-full h-px z-10"
                    style={{ background: 'linear-gradient(to right, var(--border-default), transparent)', width: 'calc(100% - 3rem)', left: 'calc(100% - 3px)' }}
                  />
                )}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: step.bg }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <span className="text-xs font-bold mb-2 block" style={{ color: step.color }}>Step {step.num}</span>
                <h3 className="font-display font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROFESSIONALS ─── */}
      <section className="py-20" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-sm font-semibold" style={{ background: 'var(--orange-pale)', color: 'var(--orange-dark)' }}>
                <Star className="w-3.5 h-3.5" fill="currentColor" />
                Top Rated
              </div>
              <h2 className="section-title mb-2">Featured Professionals</h2>
              <p className="section-subtitle">Discover highly rated event professionals</p>
            </div>
            <Link
              href="/users"
              className="btn-secondary flex items-center gap-2"
              style={{ flexShrink: 0 }}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWorkers.map((worker) => (
              <Link key={worker.name} href={`/users/${encodeURIComponent(worker.name)}`} className="card-hover p-6 group">
                {/* Avatar */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${worker.color}, ${worker.color}99)` }}
                  >
                    {worker.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{worker.name}</h3>
                      {worker.verified && (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#10B981' }}>
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{worker.skill}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1" style={{ color: 'var(--text-faint)' }}>
                      <MapPin className="w-3 h-3" />
                      {worker.city}
                    </span>
                    <span className="flex items-center gap-1 font-semibold" style={{ color: '#F59E0B' }}>
                      ⭐ {worker.rating}
                      <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>({worker.reviews})</span>
                    </span>
                  </div>

                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid var(--border-default)' }}
                  >
                    <div>
                      <span className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                        ₹{worker.rate.toLocaleString()}
                      </span>
                      <span className="text-xs ml-1" style={{ color: 'var(--text-faint)' }}>/day</span>
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--orange-pale)', color: 'var(--orange-dark)' }}
                    >
                      Hire
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EVENT GALLERY ─── */}
      <section className="py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Event Gallery</h2>
            <p className="section-subtitle mx-auto">Beautiful moments from events organized through PrimeJar</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {eventImages.map((img, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer">
                <img
                  src={img}
                  alt={`Event ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div
                  className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: 'rgba(249,115,22,0.9)' }}
                >
                  View Event
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Trusted by Thousands</h2>
            <p className="section-subtitle mx-auto">See what our users have to say about PrimeJar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6 flex flex-col gap-4">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #F97316, #EA6C0A)' }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EA6C0A 50%, #C2510A 100%)',
              boxShadow: '0 20px 60px rgba(249,115,22,0.35)',
            }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)' }} />

            <div className="relative">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                <Zap className="w-4 h-4" />
                Join India&apos;s Fastest Growing Marketplace
              </div>

              <h2
                className="font-display font-extrabold text-white mb-4"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.02em' }}
              >
                Ready to Get Started?
              </h2>

              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join 10,000+ event professionals and organizers on India&apos;s fastest-growing event marketplace. Free to sign up.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-orange-600 bg-white transition-all hover:bg-gray-50 hover:shadow-xl"
                >
                  Join PrimeJar Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)' }}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
