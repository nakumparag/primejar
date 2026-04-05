'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  collection, onSnapshot, query, orderBy, limit,
  deleteDoc, doc, updateDoc, addDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Briefcase, ClipboardList, LayoutDashboard,
  Search, Trash2, Shield, ShieldCheck, LogOut, Activity,
  ChevronDown, X, CheckCircle, Ban
} from 'lucide-react';


const ADMIN_EMAIL = 'admin@primejar.in';

// ── tiny helpers ────────────────────────────────────────────────────────────

function fmtDate(ts: any) {
  if (!ts) return '—';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

function fmtMoney(n: any) {
  if (!n) return '—';
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

function Avatar({ name, photo, size = 8 }: { name: string; photo?: string; size?: number }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 overflow-hidden`}
      style={{ background: 'linear-gradient(135deg, #F97316, #EA6C0A)', width: `${size * 4}px`, height: `${size * 4}px` }}
    >
      {photo ? <img src={photo} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
}

function Spinner() {
  return <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />;
}

function StatCard({ label, value, color, loading, subtitle }: any) {
  const trendColor = color.includes('emerald') || color.includes('success') ? 'bg-teal-500' :
                     color.includes('amber') || color.includes('warn') ? 'bg-orange-500' :
                     color.includes('red') || color.includes('danger') ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
      <div className="text-gray-500 font-medium mb-4">{label}</div>
      {loading ? (
        <div className="h-10 w-24 rounded-xl bg-gray-100 animate-pulse mb-2" />
      ) : (
        <div className="flex items-center gap-4 mb-3">
          <div className="text-3xl font-display font-bold text-gray-900">{value}</div>
          <div className={`w-4 h-1 rounded-full ${trendColor}`}></div>
        </div>
      )}
      <div className="text-sm text-gray-400">{subtitle || `${label} last 365 days`}</div>
    </div>
  );
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg text-gray-400 border border-gray-200 hover:text-red-600 hover:border-red-200 transition-all bg-white shadow-sm"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

function Badge({ text, variant = 'default' }: { text: string; variant?: 'success' | 'warn' | 'danger' | 'prime' | 'accent' | 'default' }) {
  const cls: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    warn:    'bg-amber-50 text-amber-600 border border-amber-100',
    danger:  'bg-red-50 text-red-600 border border-red-100',
    prime:   'bg-orange-50 text-orange-600 border border-orange-100',
    accent:  'bg-purple-50 text-purple-600 border border-purple-100',
    default: 'bg-gray-50 text-gray-600 border border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls[variant]}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {text}
    </span>
  );
}

// ── Section: Users ──────────────────────────────────────────────────────────

function UsersSection({ users, onDelete, onBlock }: { users: any[]; onDelete: (id: string) => void; onBlock: (id: string, disabled: boolean) => void }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter);
    return list;
  }, [users, search, roleFilter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="bg-transparent outline-none text-sm font-medium flex-1 text-gray-900 placeholder:text-gray-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>}
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
        >
          <option value="all">All Roles</option>
          <option value="worker">Workers</option>
          <option value="organizer">Organizers</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500 font-medium text-sm">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar name={u.name || u.email || '?'} photo={u.photoURL} size={10} />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{u.name || 'Unnamed'}</p>
                        <p className="text-xs font-medium text-gray-500 truncate md:hidden">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600 hidden md:table-cell truncate max-w-[200px]">{u.email}</td>
                  <td className="px-6 py-4">
                    <Badge text={u.role || 'user'} variant={u.role === 'organizer' ? 'accent' : 'prime'} />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-500 hidden lg:table-cell">{fmtDate(u.createdAt)}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {u.verified
                      ? <Badge text="Verified" variant="success" />
                      : <Badge text="Pending" variant="warn" />}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {!u.verified && (
                        <button
                          onClick={() => updateDoc(doc(db, 'users', u.id), { verified: true })}
                          className="p-2 rounded-lg text-gray-400 hover:text-teal-600 border border-transparent hover:border-teal-200 hover:bg-teal-50 transition-all bg-white shadow-sm hover:shadow-none"
                          title="Verify"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onBlock(u.id, !!u.disabled)}
                        className={`p-2 rounded-lg border border-transparent shadow-sm hover:shadow-none transition-all bg-white ${u.disabled ? 'text-gray-400 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50' : 'text-gray-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50'}`}
                        title={u.disabled ? 'Unblock User' : 'Block User'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <DeleteBtn onClick={() => onDelete(u.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
          Showing {filtered.length} of {users.length} users
        </div>
      </div>
    </div>
  );
}

// ── Section: Workers ─────────────────────────────────────────────────────────

function WorkersSection({ workers, onDelete }: { workers: any[]; onDelete: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');

  const allSkills = useMemo(() => {
    const s = new Set<string>();
    workers.forEach(w => w.skills?.forEach((sk: string) => s.add(sk)));
    return Array.from(s).sort();
  }, [workers]);

  const filtered = useMemo(() => {
    let list = workers;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(w => w.name?.toLowerCase().includes(q) || w.city?.toLowerCase().includes(q));
    }
    if (skillFilter !== 'all') list = list.filter(w => w.skills?.includes(skillFilter) || w.skill === skillFilter);
    return list;
  }, [workers, search, skillFilter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name or city..."
            className="bg-transparent outline-none text-sm font-medium flex-1 text-gray-900 placeholder:text-gray-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>}
        </div>
        <select
          value={skillFilter}
          onChange={e => setSkillFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
        >
          <option value="all">All Skills</option>
          {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Skills</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">City</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Rate/Day</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Rating</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500 font-medium text-sm">No professionals found</td></tr>
              ) : filtered.map(w => (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar name={w.name || '?'} photo={w.photoURL} size={10} />
                      <div>
                        <Link href={`/users/${w.id}`} className="font-bold text-gray-900 hover:text-teal-600 transition-colors">{w.name || 'Unnamed Professional'}</Link>
                        <p className="text-xs font-medium text-gray-500 lg:hidden">{w.city || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {w.skills?.slice(0, 2).map((s: string) => (
                        <Badge key={s} text={s} variant="prime" />
                      ))}
                      {w.skills?.length > 2 && <Badge text={`+${w.skills.length - 2}`} variant="default" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600 hidden lg:table-cell">{w.city || '—'}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 hidden md:table-cell">{fmtMoney(w.dailyRate)}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    {w.rating > 0 ? (
                      <span className="flex items-center gap-1.5 font-bold text-gray-900"><div className="text-orange-500">⭐</div> {w.rating?.toFixed(1)}</span>
                    ) : <span className="font-semibold text-gray-400">New</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DeleteBtn onClick={() => onDelete(w.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
          Showing {filtered.length} of {workers.length} workers
        </div>
      </div>
    </div>
  );
}

// ── Section: Jobs ─────────────────────────────────────────────────────────

function JobsSection({ jobs, onDelete }: { jobs: any[]; onDelete: (id: string) => void }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.toLowerCase();
    return jobs.filter(j => j.title?.toLowerCase().includes(q) || j.city?.toLowerCase().includes(q) || j.org?.toLowerCase().includes(q));
  }, [jobs, search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm max-w-sm">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="bg-transparent outline-none text-sm font-medium flex-1 text-gray-900 placeholder:text-gray-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Job</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Organizer</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">City</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Budget</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Applicants</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500 font-medium text-sm">No jobs found</td></tr>
              ) : filtered.map(j => (
                <tr key={j.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <Link href={`/jobs/${j.id}`} className="font-bold text-gray-900 hover:text-teal-600 transition-colors line-clamp-1">{j.title || 'Untitled Job'}</Link>
                      <p className="text-xs font-medium text-gray-500 md:hidden">{j.org}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600 hidden md:table-cell">{j.org || '—'}</td>
                  <td className="px-6 py-4 font-medium text-gray-600 hidden lg:table-cell">{j.city || '—'}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 hidden md:table-cell">{fmtMoney(j.budget)}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="font-semibold text-gray-600">{j.applied || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      text={j.status || 'active'}
                      variant={j.status === 'completed' ? 'default' : j.status === 'flagged' ? 'danger' : 'success'}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DeleteBtn onClick={() => onDelete(j.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
          Showing {filtered.length} of {jobs.length} jobs
        </div>
      </div>
    </div>
  );
}

// ── Section: Applications ────────────────────────────────────────────────────

function ApplicationsSection({ applications, jobs, users }: { applications: any[]; jobs: any[]; users: any[] }) {
  const [statusFilter, setStatusFilter] = useState('all');

  const jobsMap = useMemo(() => {
    const m: Record<string, any> = {};
    jobs.forEach(j => { m[j.id] = j; });
    return m;
  }, [jobs]);

  const usersMap = useMemo(() => {
    const m: Record<string, any> = {};
    users.forEach(u => { m[u.id] = u; });
    return m;
  }, [users]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return applications;
    return applications.filter(a => a.status === statusFilter);
  }, [applications, statusFilter]);

  const statusVariant: Record<string, any> = {
    hired: 'success', shortlisted: 'warn', rejected: 'danger', pending: 'prime',
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try { await updateDoc(doc(db, 'applications', appId), { status: newStatus }); }
    catch (err) { console.error(err); }
  };

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'pending', 'shortlisted', 'hired', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
              statusFilter === s ? 'bg-teal-600 text-white border border-teal-600 hover:bg-teal-700' : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className={`ml-2 px-2 py-0.5 rounded-md text-xs font-bold ${statusFilter === s ? 'bg-teal-500/30 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {s === 'all' ? applications.length : applications.filter(a => a.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Worker</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Job</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Skill</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Applied On</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500 font-medium text-sm">No applications found</td></tr>
              ) : filtered.map(a => {
                const job = jobsMap[a.jobId];
                const worker = usersMap[a.workerId];
                return (
                 <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={a.workerName || worker?.name || '?'} photo={worker?.photoURL} size={10} />
                        <div>
                          <Link href={`/users/${a.workerId}`} className="font-bold text-gray-900 hover:text-teal-600 transition-colors">
                            {a.workerName || worker?.name || 'Unknown'}
                          </Link>
                          <p className="text-xs font-medium text-gray-500 md:hidden">{job?.title || a.jobId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {job ? (
                        <Link href={`/jobs/${a.jobId}`} className="font-medium text-gray-600 hover:text-teal-600 transition-colors line-clamp-1">
                          {job.title}
                        </Link>
                      ) : <span className="font-medium text-gray-400 font-mono text-xs">{a.jobId}</span>}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600 hidden lg:table-cell">{a.skill || '—'}</td>
                    <td className="px-6 py-4">
                      <Badge text={a.status || 'pending'} variant={statusVariant[a.status] || 'default'} />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-500 hidden lg:table-cell">{fmtDate(a.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      {a.status === 'pending' && (
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'hired')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm"
                          >Hire</button>
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'shortlisted')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors shadow-sm"
                          >Shortlist</button>
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'rejected')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                          >Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
          Showing {filtered.length} of {applications.length} applications
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

const navGroups = [
  {
    title: 'Main Menu',
    items: [
      { id: 'overview', label: 'Home', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Platform',
    items: [
      { id: 'users', label: 'Users', icon: Users },
      { id: 'workers', label: 'Professionals', icon: Shield },
      { id: 'jobs', label: 'Jobs', icon: Briefcase },
      { id: 'applications', label: 'Applications', icon: ClipboardList },
    ]
  }
];

export default function AdminDashboard() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const workers = useMemo(() => users.filter(u => u.role === 'user'), [users]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);

  // ── Auth guard: hardcoded admin session via localStorage ──────────────────
  const [adminAuthed, setAdminAuthed] = useState(false);
  useEffect(() => {
    const isAdmin = typeof window !== 'undefined' &&
      localStorage.getItem('pj-admin-session') === 'true';
    if (!isAdmin) {
      router.replace('/login');
    } else {
      setAdminAuthed(true);
    }
  }, [router]);

  // ── Real-time data
  useEffect(() => {
    const unsubs = [
      onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), snap => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, () => setLoading(false)),



      onSnapshot(query(collection(db, 'jobs'), orderBy('createdAt', 'desc')), snap => {
        setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, () => {}),

      onSnapshot(collection(db, 'applications'), snap => {
        const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setApplications(apps);
      }, () => {}),

      onSnapshot(query(collection(db, 'activity'), orderBy('createdAt', 'desc'), limit(20)), snap => {
        setActivityFeed(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, () => {}),
    ];

    return () => unsubs.forEach(u => u());
  }, []);

  // ── Delete handler
  const requestDelete = (type: string, id: string, name: string) => {
    setDeleteConfirm({ type, id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    try {
      await deleteDoc(doc(db, type, id));
    } catch (err) {
      console.error('Delete error:', err);
    }
    setDeleteConfirm(null);
  };

  // ── Block / unblock user
  const toggleBlock = async (userId: string, currentlyDisabled: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { disabled: !currentlyDisabled });
    } catch (err) { console.error(err); }
  };

  // ── Activity helpers
  const activityIcon: Record<string, string> = {
    user_signup: '👤',
    job_posted: '📋',
    application_submitted: '🙋',
    application_status_changed: '✅',
    group_created: '👥',
    user_verified: '🛡️',
    user_deleted: '🗑️',
    job_deleted: '🗑️',
  };

  const activityLabel = (a: any): string => {
    switch (a.type) {
      case 'user_signup': return `${a.actorName || 'A user'} joined as ${a.meta?.role || 'user'}`;
      case 'job_posted': return `${a.actorName || 'Organizer'} posted "${a.targetName || 'a job'}"`;
      case 'application_submitted': return `${a.actorName || 'Worker'} applied to "${a.targetName || 'a job'}"`;
      case 'application_status_changed': return `Application for ${a.targetName || 'a job'} → ${a.meta?.status}`;
      case 'group_created': return `${a.actorName || 'Someone'} created group "${a.targetName}"`;
      default: return a.type?.replace(/_/g, ' ') || 'Activity';
    }
  };


  // ── Access denied guard (uses localStorage session, not Firebase) ──────────
  if (!adminAuthed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Verifying admin session…</p>
      </div>
    );
  }

  const activeJobsCount = jobs.filter(j => !j.status || j.status === 'active').length;
  const activeItem = navGroups.flatMap(g => g.items).find(n => n.id === activeSection);

  return (
    <div className="min-h-screen pb-12 font-sans" style={{ paddingTop: '80px', background: 'var(--bg-secondary)' }}>
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full border border-gray-100 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-500 text-center text-sm mb-8">
              Are you sure you want to delete <strong className="text-gray-900">"{deleteConfirm.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-semibold"
              >Cancel</button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-semibold shadow-sm"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:w-64 flex-shrink-0 lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl shadow-sm p-4 h-full min-h-[500px] flex flex-col" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <div className="flex items-center gap-3 mb-8 px-2 mt-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F97316, #EA6C0A)' }}>
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>PrimeAdmin</span>
            </div>

            {/* Mobile nav toggle */}
            <button
              className="lg:hidden w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-4"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <div className="flex items-center gap-2">
                {activeItem && <activeItem.icon className="w-4 h-4" style={{ color: 'var(--orange)' }} />}
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{activeItem?.label}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileNavOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-faint)' }} />
            </button>

            <nav className={`lg:flex flex-col flex-1 ${mobileNavOpen ? 'flex' : 'hidden'}`}>
              <div className="space-y-6">
                {navGroups.map((group, idx) => (
                  <div key={idx}>
                    <h4 className="text-[11px] font-bold tracking-wider uppercase mb-2 px-3" style={{ color: 'var(--text-faint)' }}>{group.title}</h4>
                    <div className="space-y-0.5">
                      {group.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => { setActiveSection(item.id); setMobileNavOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                          style={{
                            background: activeSection === item.id ? 'var(--orange-pale)' : 'transparent',
                            color: activeSection === item.id ? 'var(--orange-dark)' : 'var(--text-muted)',
                          }}
                        >
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          {item.label}
                          <span
                            className="ml-auto text-xs font-bold rounded-lg px-2 py-0.5 min-w-[1.75rem] text-center"
                            style={{
                              background: activeSection === item.id ? 'rgba(249,115,22,0.15)' : 'var(--bg-secondary)',
                              color: activeSection === item.id ? 'var(--orange)' : 'var(--text-faint)',
                            }}
                          >
                            {item.id === 'users' ? users.length
                              : item.id === 'workers' ? workers.length
                              : item.id === 'jobs' ? jobs.length
                              : item.id === 'applications' ? applications.length : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name="Admin" size={8} />
                    <div className="truncate min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>Admin</p>
                      <p className="text-[10px] truncate" style={{ color: 'var(--text-faint)' }}>admin@primejar.in</p>
                    </div>
                  </div>
                  <button onClick={() => {
                    localStorage.removeItem('pj-admin-session');
                    router.push('/login');
                  }} className="p-1.5 rounded-lg transition-colors hover:bg-red-50 text-red-400 hover:text-red-600">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <Spinner />
              </div>
            ) : (
              <>
                {/* Overview */}
                {activeSection === 'overview' && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                       <h2 className="text-2xl font-display font-bold text-gray-900">Dashboard Overview</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard label="Total Users" value={users.length} color="bg-prime-500" subtitle="Total registered users" />
                      <StatCard label="Total Workers" value={workers.length} color="bg-accent-500" subtitle="Platform workforce" />
                      <StatCard label="Active Jobs" value={activeJobsCount} color="bg-emerald-500" subtitle="Jobs seeking applicants" />
                      <StatCard label="Applications" value={applications.length} color="bg-amber-500" subtitle="All-time applications" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      {/* Recent Users */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="font-display font-bold text-gray-900">Recent Users</h2>
                          <button onClick={() => setActiveSection('users')} className="text-teal-600 text-xs font-semibold hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                          {users.slice(0, 5).map(u => (
                            <div key={u.id} className="flex items-center gap-4">
                              <Avatar name={u.name || u.email || '?'} photo={u.photoURL} size={10} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{u.name || 'Unnamed User'}</p>
                                <p className="text-xs font-medium text-gray-500 truncate">{u.email}</p>
                              </div>
                              <Badge text={u.role || 'user'} variant={u.role === 'organizer' ? 'accent' : 'prime'} />
                            </div>
                          ))}
                          {users.length === 0 && <p className="text-center py-6 text-gray-500 text-sm font-medium">No users yet</p>}
                        </div>
                      </div>

                      {/* Recent Jobs */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="font-display font-bold text-gray-900">Recent Jobs</h2>
                          <button onClick={() => setActiveSection('jobs')} className="text-teal-600 text-xs font-semibold hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                          {jobs.slice(0, 5).map(j => (
                            <div key={j.id} className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-5 h-5 text-orange-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{j.title}</p>
                                <p className="text-xs font-medium text-gray-500">{j.city || 'Remote'} · {fmtMoney(j.budget)}</p>
                              </div>
                              <Badge text={`${j.applied || 0} applicants`} variant="default" />
                            </div>
                          ))}
                          {jobs.length === 0 && <p className="text-center py-6 text-gray-500 text-sm font-medium">No jobs posted yet</p>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      {/* Stats row */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="font-display font-bold text-gray-900 mb-6">Platform Breakdown</h2>
                        <div className="grid grid-cols-2 gap-6 text-center">
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-3xl font-bold text-teal-600 mb-1">{users.filter(u => u.role === 'worker').length}</div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Workers</div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-3xl font-bold text-purple-600 mb-1">{users.filter(u => u.role === 'organizer').length}</div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Organizers</div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-3xl font-bold text-green-600 mb-1">{applications.filter(a => a.status === 'hired').length}</div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hired Apps</div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-3xl font-bold text-orange-600 mb-1">{applications.filter(a => a.status === 'pending').length}</div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Apps</div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity Feed */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="font-display font-bold text-gray-900">Recent Activity</h2>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-100">
                            <Activity className="w-3 h-3 mr-1" /> Live
                          </span>
                        </div>
                        {activityFeed.length === 0 ? (
                          <div className="text-center py-10 flex-1 flex flex-col justify-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Activity className="w-5 h-5 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm font-medium">No recent activity detected.</p>
                          </div>
                        ) : (
                          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                            {activityFeed.map((a: any) => (
                              <div key={a.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm text-sm">
                                  {activityIcon[a.type] || '📌'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">{activityLabel(a)}</p>
                                  <p className="text-xs font-medium text-gray-400">{fmtDate(a.createdAt)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {activeSection === 'users' && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-display font-bold text-gray-900">All Users <span className="text-gray-500 font-medium text-base">({users.length})</span></h2>
                    </div>
                    <UsersSection
                      users={users}
                      onDelete={(id) => {
                        const u = users.find(x => x.id === id);
                        requestDelete('users', id, u?.name || u?.email || id);
                      }}
                      onBlock={toggleBlock}
                    />
                  </>
                )}

                {activeSection === 'workers' && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-display font-bold text-gray-900">All Workers <span className="text-gray-500 font-medium text-base">({workers.length})</span></h2>
                    </div>
                    <WorkersSection workers={workers} onDelete={(id) => {
                      const w = workers.find(x => x.id === id);
                      requestDelete('workers', id, w?.name || id);
                    }} />
                  </>
                )}

                {activeSection === 'jobs' && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-display font-bold text-gray-900">All Jobs <span className="text-gray-500 font-medium text-base">({jobs.length})</span></h2>
                    </div>
                    <JobsSection jobs={jobs} onDelete={(id) => {
                      const j = jobs.find(x => x.id === id);
                      requestDelete('jobs', id, j?.title || id);
                    }} />
                  </>
                )}

                {activeSection === 'applications' && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-display font-bold text-gray-900">All Applications <span className="text-gray-500 font-medium text-base">({applications.length})</span></h2>
                    </div>
                    <ApplicationsSection applications={applications} jobs={jobs} users={users} />
                  </>
                )}
              </>
            )}
          </main>
      </div>
    </div>
  );
}
