'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const typeIcons: Record<string, string> = {
  job: '📋',
  application: '🙋',
  success: '✅',
  message: '💬',
  review: '⭐',
  info: 'ℹ️',
  group: '👥',
  hired: '🎉',
};

function formatTime(ts: any): string {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Get both personal notifications and broadcast notifications
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Filter: show notifications for this user OR broadcast notifications (forAll: true)
      const mine = all.filter((n: any) => n.userId === user.uid || n.forAll === true);
      setNotifications(mine);
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [user, router]);

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifications
      .filter((n) => !n.read)
      .forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
    await batch.commit();
  };

  const markRead = async (notifId: string) => {
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="section-title mb-2">Notifications</h1>
            <p className="text-[var(--text-muted)] text-sm">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[var(--text-primary)] text-sm hover:text-prime-500 transition-colors px-4 py-2 rounded-full" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)' }}>
              Mark all read
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'unread', 'job', 'application', 'message', 'success', 'review'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f ? 'bg-prime-500 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-prime-500/30 border-t-prime-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`p-4 rounded-3xl transition-all cursor-pointer border ${
                  n.read
                    ? 'bg-[var(--bg-secondary)] border-[var(--bg-card-border)] hover:bg-[var(--bg-input)]'
                    : 'bg-prime-50 dark:bg-prime-500/5 border-prime-200 dark:border-prime-500/10 hover:bg-prime-100 dark:hover:bg-prime-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{typeIcons[n.type] || 'ℹ️'}</span>
                  <div className="flex-1">
                    <p className={`text-sm ${n.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] font-medium'}`}>
                      {n.message || n.text}
                    </p>
                    <p className="text-[var(--text-muted)] text-xs mt-1">{formatTime(n.createdAt)}</p>
                    {n.link && (
                      <Link href={n.link} className="text-prime-500 text-xs hover:underline mt-1 inline-block">
                        View Details →
                      </Link>
                    )}
                  </div>
                  {!n.read && <span className="w-2 h-2 bg-prime-500 rounded-full flex-shrink-0 mt-2"></span>}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="glass-card p-12 text-center rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-[var(--text-primary)] font-medium mb-1">No notifications</p>
                <p className="text-[var(--text-muted)] text-sm">
                  {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
