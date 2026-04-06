'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Star, ArrowRight, Shield, Zap, MapPin, ChevronRight,
  Calendar, Users, TrendingUp, CheckCircle, UserPlus, MessageCircle
} from 'lucide-react';

/* ── Static data ── */
const categories = [
  {
    name: 'Photography', count: '1,240+',
    bg: '#DBEAFE', color: '#1D4ED8',
    img: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=300&q=80&fit=crop&crop=top',
  },
  {
    name: 'Videography', count: '890+',
    bg: '#EDE9FE', color: '#6D28D9',
    img: 'https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?w=300&q=80&fit=crop&crop=top',
  },
  {
    name: 'DJs & Music', count: '560+',
    bg: '#FEF3C7', color: '#B45309',
    img: 'https://images.unsplash.com/photo-1571935454832-be1e5f97fa3e?w=300&q=80&fit=crop&crop=top',
  },
  {
    name: 'Decoration', count: '780+',
    bg: '#D1FAE5', color: '#065F46',
    img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&q=80&fit=crop&crop=top',
  },
  {
    name: 'Catering', count: '920+',
    bg: '#FEE2E2', color: '#991B1B',
    img: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=300&q=80&fit=crop&crop=top',
  },
  {
    name: 'Makeup', count: '650+',
    bg: '#FCE7F3', color: '#9D174D',
    img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300&q=80&fit=crop&crop=top',
  },
  {
    name: 'Lighting', count: '340+',
    bg: '#FFEDD5', color: '#C2410C',
    img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&q=80&fit=crop&crop=top',
  },
  {
    name: 'Anchors & MC', count: '280+',
    bg: '#CFFAFE', color: '#0E7490',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80&fit=crop&crop=top',
  },
];


const trendingEvents = [
  {
    id: 1, type: 'Wedding', title: 'Royal Wedding — Photography Team Needed',
    org: 'Sharma Events', city: 'Mumbai', date: 'Apr 18, 2026',
    budget: 25000, workers: 5, urgent: true,
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
  },
  {
    id: 2, type: 'Concert', title: 'Live Music Festival — Stage Crew & AV',
    org: 'SoundBox Productions', city: 'Delhi', date: 'Apr 22, 2026',
    budget: 45000, workers: 20, urgent: false,
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  },
  {
    id: 3, type: 'Corporate', title: 'Tech Summit 2026 — Event Coordinators',
    org: 'TechWorld Inc.', city: 'Bangalore', date: 'May 3, 2026',
    budget: 35000, workers: 10, urgent: false,
    img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80',
  },
];

const topVendors = [
  { name: 'Rahul Sharma', skill: 'Photographer', city: 'Mumbai', rating: 4.9, reviews: 127, rate: 5000, verified: true, initials: 'RS', color: '#2563EB' },
  { name: 'Priya Patel', skill: 'Videographer', city: 'Delhi', rating: 4.8, reviews: 94, rate: 4500, verified: true, initials: 'PP', color: '#7C3AED' },
  { name: 'Meera Singh', skill: 'Decorator', city: 'Jaipur', rating: 4.8, reviews: 68, rate: 3500, verified: true, initials: 'MS', color: '#10B981' },
  { name: 'Arjun Reddy', skill: 'DJ', city: 'Hyderabad', rating: 4.7, reviews: 156, rate: 8000, verified: false, initials: 'AR', color: '#F59E0B' },
  { name: 'Kavya Nair', skill: 'Makeup Artist', city: 'Chennai', rating: 4.9, reviews: 211, rate: 3000, verified: true, initials: 'KN', color: '#EC4899' },
];

const steps = [
  { num: '01', title: 'Create Your Profile', desc: 'Sign up in 2 minutes. Add your skills, portfolio, and availability.', icon: UserPlus, color: '#2563EB', bg: '#EFF6FF' },
  { num: '02', title: 'Browse & Apply', desc: 'Find events matching your skills or post jobs to hire professionals.', icon: Search, color: '#7C3AED', bg: '#F5F3FF' },
  { num: '03', title: 'Connect Directly', desc: 'Message, negotiate, and confirm your team — no middlemen.', icon: MessageCircle, color: '#10B981', bg: '#ECFDF5' },
  { num: '04', title: 'Work & Grow', desc: 'Complete events, earn reviews, and build your reputation.', icon: Star, color: '#F59E0B', bg: '#FFFBEB' },
];

const testimonials = [
  { text: 'PrimeJar changed how I find work. Went from 2 events/month to 8! The platform is incredibly easy to use.', name: 'Vikram K.', role: 'Photographer, Mumbai', rating: 5, initials: 'VK', color: '#2563EB' },
  { text: 'Found the perfect team for our wedding in just 2 days. Verified profiles with reviews made it so easy.', name: 'Sneha M.', role: 'Wedding Planner, Delhi', rating: 5, initials: 'SM', color: '#7C3AED' },
  { text: 'No more WhatsApp chaos! PrimeJar organizes everything — from finding workers to managing the event.', name: 'Rajesh P.', role: 'Event Company, Bangalore', rating: 5, initials: 'RP', color: '#10B981' },
];

const stats = [
  { value: '10,000+', label: 'Verified Vendors', icon: Users, color: '#2563EB' },
  { value: '25,000+', label: 'Events Completed', icon: Calendar, color: '#7C3AED' },
  { value: '98%', label: 'Satisfaction Rate', icon: Star, color: '#F59E0B' },
  { value: '50+', label: 'Cities Covered', icon: MapPin, color: '#10B981' },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (locationQuery.trim()) params.set('city', locationQuery.trim());
    router.push(`/users?${params.toString()}`);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', paddingTop: '64px' }}>

      {/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1D4ED8 100%)',
          minHeight: '520px',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #60A5FA, transparent)' }} />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #93C5FD, transparent)' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold text-blue-200"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            India&apos;s #1 Event Marketplace
            <ChevronRight className="w-3.5 h-3.5" />
          </div>

          {/* Main Headline */}
          <h1
            className="font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.25rem)', letterSpacing: '-0.025em' }}
          >
            Discover Events, Vendors &{' '}
            <span style={{ color: '#60A5FA' }}>Services</span> Near You
          </h1>

          <p className="text-blue-200 mb-10 mx-auto" style={{ fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '600px' }}>
            Connect with photographers, DJs, decorators & 10,000+ verified professionals. 
            Find the perfect team for any event — weddings, concerts, corporate & more.
          </p>

          {/* Hero Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="hero-search-container">
              <div className="flex items-center gap-2 flex-1 pl-5">
                <Search className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <input
                  type="text"
                  placeholder="Photographers, DJs, Decorators..."
                  className="hero-search-input"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="hero-search-divider" />
              <div className="flex items-center gap-2 pl-4">
                <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <input
                  type="text"
                  placeholder="City or location"
                  className="hero-search-input"
                  style={{ maxWidth: '160px' }}
                  value={locationQuery}
                  onChange={e => setLocationQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="hero-search-btn m-1.5 rounded-xl">
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </form>

          {/* Popular tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <span className="text-sm text-blue-300">Popular:</span>
            {['Photographers', 'Wedding DJs', 'Decorators', 'Caterers', 'Makeup Artists'].map(tag => (
              <button
                key={tag}
                onClick={() => { setSearchQuery(tag); router.push(`/users?q=${tag}`); }}
                className="text-xs font-medium px-3 py-1.5 rounded-full transition-all text-blue-200"
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.20)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/jobs"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all text-sm"
              style={{ background: '#2563EB', fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1D4ED8'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#2563EB'}
            >
              <Calendar className="w-4 h-4" />
              Browse Events
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold transition-all text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}
            >
              <UserPlus className="w-4 h-4" />
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  <p className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)' }}>{stat.value}</p>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--blue)' }}>Browse by Category</p>
              <h2 className="section-title">Explore Services</h2>
            </div>
            <Link href="/users"
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold transition-colors"
              style={{ color: 'var(--blue)' }}
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* AllEvents.in-style category cards: text left + person image right */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/users?q=${cat.name}`}
                className="group relative overflow-hidden rounded-2xl flex items-end justify-between transition-all cursor-pointer"
                style={{
                  background: cat.bg,
                  minHeight: '100px',
                  border: `1.5px solid ${cat.color}22`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  padding: '16px 0 16px 16px',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 28px ${cat.color}30`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }}
              >
                {/* Text label */}
                <div className="relative z-10 flex flex-col justify-between h-full" style={{ maxWidth: '55%' }}>
                  <p
                    className="font-bold text-sm leading-tight"
                    style={{ color: cat.color, fontFamily: 'Poppins, sans-serif' }}
                  >
                    {cat.name}
                  </p>
                  <p className="text-xs mt-auto pt-6" style={{ color: cat.color, opacity: 0.7 }}>
                    {cat.count}
                  </p>
                </div>

                {/* Person image — right side, clipped at bottom */}
                <div
                  className="absolute right-0 bottom-0 overflow-hidden transition-transform duration-300 group-hover:scale-105"
                  style={{ width: '52%', height: '110%' }}
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover object-top"
                    style={{ borderRadius: '0 18px 18px 0' }}
                  />
                </div>
              </Link>
            ))}

            {/* View All card — matches AllEvents.in */}
            <Link
              href="/users"
              className="group relative overflow-hidden rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer"
              style={{
                background: '#F1F5F9',
                minHeight: '100px',
                border: '1.5px solid #CBD5E1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '16px',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#E2E8F0';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = '#F1F5F9';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110" style={{ background: '#E2E8F0' }}>
                <ChevronRight className="w-5 h-5" style={{ color: '#475569' }} />
              </div>
              <p className="font-bold text-xs text-center" style={{ color: '#334155', fontFamily: 'Poppins, sans-serif' }}>View All</p>
              <p className="text-xs" style={{ color: '#64748B' }}>Categories</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TRENDING EVENTS
      ═══════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--blue)' }}>Live Opportunities</p>
              <h2 className="section-title">Trending Events</h2>
            </div>
            <Link href="/jobs"
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: 'var(--blue)' }}
            >
              View all events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingEvents.map((event) => (
              <Link key={event.id} href={`/jobs`} className="event-card group block">
                {/* Card image */}
                <div className="relative overflow-hidden" style={{ height: '180px' }}>
                  <img
                    src={event.img}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {event.urgent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wide"
                        style={{ background: '#EF4444' }}>
                        Urgent
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: 'rgba(255,255,255,0.20)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                      {event.type}
                    </span>
                  </div>
                  {/* Budget chip */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: 'var(--blue)', backdropFilter: 'blur(4px)' }}>
                      ₹{event.budget.toLocaleString()}/day
                    </span>
                  </div>
                </div>

                {/* Card meta */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 leading-snug" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)' }}>
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.city}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.workers} needed</span>
                  </div>
                  <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-default)' }}>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>by {event.org}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--blue)' }}>
                      Apply Now <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center md:hidden">
            <Link href="/jobs" className="btn-primary text-sm">
              View All Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TOP VENDORS (Horizontal scroll)
      ═══════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--blue)' }}>Featured Talent</p>
              <h2 className="section-title">Top Verified Vendors</h2>
            </div>
            <Link href="/users"
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: 'var(--blue)' }}
            >
              View all vendors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
            {topVendors.map((vendor) => (
              <Link
                key={vendor.name}
                href="/users"
                className="flex-shrink-0 w-56 rounded-2xl p-5 transition-all group"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = vendor.color + '40';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold mb-3 mx-auto"
                  style={{ background: `linear-gradient(135deg, ${vendor.color}, ${vendor.color}cc)` }}
                >
                  {vendor.initials}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <p className="font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)' }}>
                      {vendor.name}
                    </p>
                    {vendor.verified && <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#10B981' }} />}
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--blue)' }}>{vendor.skill}</p>
                  <p className="text-xs flex items-center justify-center gap-1 mb-3" style={{ color: 'var(--text-faint)' }}>
                    <MapPin className="w-3 h-3" />{vendor.city}
                  </p>
                  <div className="flex items-center justify-between text-xs pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                    <span className="flex items-center gap-1 font-semibold" style={{ color: '#F59E0B' }}>
                      <Star className="w-3 h-3 fill-amber-400" />{vendor.rating}
                      <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>({vendor.reviews})</span>
                    </span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>₹{vendor.rate.toLocaleString()}<span className="font-normal text-[10px]" style={{ color: 'var(--text-faint)' }}>/day</span></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--blue)' }}>Simple Process</p>
            <h2 className="section-title mb-3">How PrimeJar Works</h2>
            <p className="section-subtitle mx-auto text-center">Get started in minutes. Find the perfect event team or land your next big gig.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(100%-8px)] w-full h-px z-10"
                    style={{ background: `linear-gradient(to right, ${step.color}40, transparent)` }} />
                )}
                <div className="card p-6 text-center h-full">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: step.bg }}>
                    <step.icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>
                  <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: step.color }}>{step.num}</div>
                  <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)' }}>{step.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--blue)' }}>What People Say</p>
            <h2 className="section-title">Loved by Event Professionals</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6 flex flex-col gap-4">
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1D4ED8 100%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="font-bold text-white mb-4"
            style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-0.02em' }}
          >
            Ready to Get Started?
          </h2>
          <p className="text-blue-200 mb-10" style={{ fontSize: '1rem', lineHeight: 1.7 }}>
            Join thousands of event professionals and organizers already on PrimeJar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all text-sm"
              style={{ background: '#2563EB', boxShadow: '0 4px 14px rgba(37,99,235,0.4)', fontFamily: 'Poppins, sans-serif' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1D4ED8'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#2563EB'}
            >
              <UserPlus className="w-4 h-4" />
              Create Free Account
            </Link>
            <Link href="/jobs"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold transition-all text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', fontFamily: 'Poppins, sans-serif' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'}
            >
              <Calendar className="w-4 h-4" />
              Browse Events
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm text-blue-300">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Free to join</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> Verified vendors</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Instant connections</span>
          </div>
        </div>
      </section>
    </div>
  );
}
