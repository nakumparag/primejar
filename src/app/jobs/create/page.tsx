'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { logJobPosted } from '@/lib/activity';

const eventTypes = ['Wedding', 'Corporate', 'Festival', 'Birthday', 'Conference', 'Exhibition', 'Concert', 'Other'];
const skillOptions = ['Photographer', 'Videographer', 'DJ', 'Anchor', 'Decorator', 'Caterer', 'Lighting Technician', 'Sound Engineer', 'Makeup Artist', 'Event Assistant', 'Helper', 'Stage Manager'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Goa', 'Chandigarh'];

export default function CreateJobPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', type: '', city: '', date: '', venue: '', workers: '',
    budget: '', description: '', skills: [] as string[],
  });

  const toggleSkill = (skill: string) => {
    setForm((p) => ({ ...p, skills: p.skills.includes(skill) ? p.skills.filter((s) => s !== skill) : [...p.skills, skill] }));
  };

  useEffect(() => {
    if (user && profile && profile.role !== 'organizer' && profile.role !== 'admin') {
      router.push('/dashboard/user');
    }
  }, [user, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (profile?.role !== 'organizer' && profile?.role !== 'admin')) {
      setError('Only organizers can post event jobs.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const jobRef = await addDoc(collection(db, 'jobs'), {
        title: form.title,
        type: form.type,
        city: form.city,
        date: form.date,
        venue: form.venue,
        workers: Number(form.workers),
        budget: Number(form.budget),
        description: form.description,
        skills: form.skills,
        createdBy: user.uid,
        org: 'companyName' in profile ? (profile as any).companyName || profile.name : profile.name,
        urgent: false,
        status: 'active',
        hired: 0,
        applied: 0,
        createdAt: serverTimestamp(),
      });

      // Create a broadcast notification for all workers
      await addDoc(collection(db, 'notifications'), {
        type: 'job',
        message: `🆕 New job posted: ${form.title} in ${form.city} — ₹${Number(form.budget).toLocaleString()}/day`,
        link: `/jobs/${jobRef.id}`,
        forAll: true,
        read: false,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });

      // Log to admin activity feed
      await logJobPosted(user.uid, profile.name, jobRef.id, form.title);

      router.push('/dashboard/organizer');
    } catch (err: any) {
      setError(err.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 mesh-gradient">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="section-title mb-2">Post an Event Job</h1>
          <p className="section-subtitle">Find the right professionals for your event</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl text-sm animate-slide-up" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-300 mb-2">Event Name *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Grand Wedding Reception" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Event Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field appearance-none cursor-pointer" required>
                <option value="" className="bg-surface-800">Select type</option>
                {eventTypes.map((t) => <option key={t} value={t} className="bg-surface-800">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">City *</label>
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field appearance-none cursor-pointer" required>
                <option value="" className="bg-surface-800">Select city</option>
                {cities.map((c) => <option key={c} value={c} className="bg-surface-800">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Event Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Venue Location *</label>
              <input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Taj Palace Hotel, Colaba" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Workers Required *</label>
              <input type="number" value={form.workers} onChange={(e) => setForm({ ...form, workers: e.target.value })} placeholder="e.g. 10" className="input-field" min={1} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Budget per Worker (₹/day) *</label>
              <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. 5000" className="input-field" min={0} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-3">Skills Required *</label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    form.skills.includes(skill) ? 'bg-prime-500 text-white' : 'bg-white/5 text-surface-300 border border-white/10 hover:border-prime-500/30'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Job Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the event, responsibilities, and any special requirements..." className="input-field h-32 resize-none" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Reference Images</label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-prime-500/30 transition-colors cursor-pointer">
              <svg className="w-8 h-8 text-surface-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-surface-400 text-sm">Click to upload reference images</p>
              <p className="text-surface-500 text-xs mt-1">PNG, JPG up to 5MB each</p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="gradient-btn w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Post Event Job'}
          </button>
        </form>
      </div>
    </div>
  );
}
