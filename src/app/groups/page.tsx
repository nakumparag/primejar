'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const categories = ['General', 'Photography', 'Music', 'Catering', 'Beauty', 'Decoration', 'Sound & Lighting', 'Event Management'];

function formatTime(ts: any): string {
  if (!ts) return '';
  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins || 1}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch { return ''; }
}

export default function GroupsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', category: 'General', description: '' });

  // Fetch groups in real-time
  useEffect(() => {
    const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  // Fetch posts for active group
  useEffect(() => {
    if (!activeGroup) { setPosts([]); return; }
    const postsQ = query(
      collection(db, `groups/${activeGroup.id}/posts`),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(postsQ, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [activeGroup?.id]);

  const handleCreateGroup = async () => {
    if (!user) { router.push('/login'); return; }
    if (!createForm.name.trim()) return;
    setCreating(true);
    try {
      await addDoc(collection(db, 'groups'), {
        name: createForm.name.trim(),
        category: createForm.category,
        description: createForm.description.trim(),
        createdBy: user.uid,
        adminName: profile?.name || 'Unknown',
        members: [user.uid],
        membersCount: 1,
        postsCount: 0,
        createdAt: serverTimestamp(),
      });
      setCreateForm({ name: '', category: 'General', description: '' });
      setShowCreate(false);
    } catch (err) {
      console.error('Create group error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinLeave = async (group: any) => {
    if (!user) { router.push('/login'); return; }
    const isMember = group.members?.includes(user.uid);
    const groupRef = doc(db, 'groups', group.id);
    try {
      await updateDoc(groupRef, {
        members: isMember ? arrayRemove(user.uid) : arrayUnion(user.uid),
        membersCount: (group.membersCount || 0) + (isMember ? -1 : 1),
      });
    } catch (err) {
      console.error('Join/leave error:', err);
    }
  };

  const handlePost = async () => {
    if (!user || !activeGroup || !newPost.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, `groups/${activeGroup.id}/posts`), {
        content: newPost.trim(),
        authorName: profile?.name || 'Anonymous',
        authorId: user.uid,
        type: 'post',
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      });
      // Increment posts count
      await updateDoc(doc(db, 'groups', activeGroup.id), {
        postsCount: (activeGroup.postsCount || 0) + 1,
      });
      setNewPost('');
    } catch (err) {
      console.error('Post error:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (post: any) => {
    if (!user || !activeGroup) return;
    const postRef = doc(db, `groups/${activeGroup.id}/posts`, post.id);
    const likedBy = post.likedBy || [];
    const hasLiked = likedBy.includes(user.uid);
    await updateDoc(postRef, {
      likes: hasLiked ? Math.max(0, (post.likes || 0) - 1) : (post.likes || 0) + 1,
      likedBy: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="section-title mb-2">Event Groups</h1>
            <p className="section-subtitle">Join communities and find opportunities</p>
          </div>
          <button
            onClick={() => { if (!user) router.push('/login'); else setShowCreate(!showCreate); }}
            className="gradient-btn rounded-full flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Group
          </button>
        </div>

        {/* Create Group Form */}
        {showCreate && (
          <div className="glass-card p-6 mb-8 animate-slide-up rounded-3xl border border-[var(--bg-card-border)]">
            <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4">Create New Group</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Group Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Mumbai Event Photographers"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category</label>
                <select
                  className="input-field appearance-none cursor-pointer"
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                >
                  {categories.map(c => (
                    <option key={c} className="bg-[var(--bg-primary)]">{c}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Description</label>
                <textarea
                  className="input-field h-20 resize-none"
                  placeholder="What is this group about?"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateGroup}
                disabled={creating || !createForm.name.trim()}
                className="gradient-btn rounded-full flex items-center gap-2 disabled:opacity-50"
              >
                {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Create Group
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-full border border-[var(--bg-card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Group Detail View */}
        {activeGroup ? (
          <div>
            <button onClick={() => setActiveGroup(null)} className="flex items-center gap-2 text-[var(--text-primary)] hover:text-prime-500 mb-6 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Groups
            </button>

            <div className="glass-card p-6 mb-6 rounded-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-prime-500 flex items-center justify-center text-white font-bold text-xl">
                  {activeGroup.name?.slice(0, 2).toUpperCase() || 'GR'}
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">{activeGroup.name}</h2>
                  <p className="text-[var(--text-muted)] text-sm">{activeGroup.membersCount || 0} members · Created by {activeGroup.adminName || 'Admin'}</p>
                </div>
                <button
                  onClick={() => handleJoinLeave(activeGroup)}
                  className={`ml-auto px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    activeGroup.members?.includes(user?.uid)
                      ? 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--bg-card-border)]'
                      : 'gradient-btn'
                  }`}
                >
                  {activeGroup.members?.includes(user?.uid) ? 'Leave' : 'Join'}
                </button>
              </div>
              {activeGroup.description && (
                <p className="text-[var(--text-secondary)] text-sm">{activeGroup.description}</p>
              )}
            </div>

            {/* Post Input */}
            {activeGroup.members?.includes(user?.uid) && (
              <div className="glass-card p-4 mb-6 rounded-3xl">
                <textarea
                  className="input-field h-16 resize-none mb-3"
                  placeholder="Share a post or job opportunity..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handlePost}
                    disabled={posting || !newPost.trim()}
                    className="gradient-btn rounded-full !py-2 !px-4 text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {posting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    Post
                  </button>
                </div>
              </div>
            )}

            {/* Posts */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="glass-card p-8 text-center rounded-3xl">
                  <p className="text-[var(--text-muted)] text-sm">No posts yet. Be the first to post!</p>
                </div>
              ) : posts.map((post) => (
                <div key={post.id} className="glass-card p-6 rounded-3xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-prime-500 flex items-center justify-center text-white text-sm font-semibold">
                      {post.authorName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)] text-sm">{post.authorName}</p>
                      <p className="text-[var(--text-faint)] text-xs">{formatTime(post.createdAt)}</p>
                    </div>
                    {post.type === 'job' && <span className="badge-accent text-[10px] ml-auto">Job</span>}
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">{post.content}</p>
                  <div className="flex gap-6 pt-3 border-t border-[var(--divider)]">
                    <button
                      onClick={() => handleLike(post)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${post.likedBy?.includes(user?.uid) ? 'text-prime-500' : 'text-[var(--text-muted)] hover:text-prime-500'}`}
                    >
                      <svg className="w-4 h-4" fill={post.likedBy?.includes(user?.uid) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likes || 0}
                    </button>
                    <span className="flex items-center gap-1.5 text-[var(--text-muted)] text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.comments || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Browse groups */
          loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-prime-500/30 border-t-prime-500 rounded-full animate-spin" />
            </div>
          ) : groups.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-3xl">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-display font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No groups yet</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Be the first to create a community!</p>
              <button onClick={() => { if (!user) router.push('/login'); else setShowCreate(true); }} className="gradient-btn rounded-full px-6 py-2 text-sm">
                Create First Group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.map((group) => {
                const isMember = user && group.members?.includes(user.uid);
                return (
                  <div
                    key={group.id}
                    className="glass-card-hover p-6 cursor-pointer rounded-3xl"
                    onClick={() => setActiveGroup(group)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-prime-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {group.name?.slice(0, 2).toUpperCase() || 'GR'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[var(--text-primary)] truncate">{group.name}</h3>
                          <span className="badge-prime text-[10px] flex-shrink-0">{group.category || 'General'}</span>
                        </div>
                        <p className="text-[var(--text-muted)] text-sm mb-3 line-clamp-2">{group.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-[var(--text-faint)] text-xs">{group.membersCount || 0} members · {group.postsCount || 0} posts</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleJoinLeave(group); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              isMember
                                ? 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--bg-card-border)]'
                                : 'bg-prime-50 text-prime-600 border border-prime-200 hover:bg-prime-100 dark:bg-prime-500/10 dark:text-prime-400 dark:border-prime-500/20'
                            }`}
                          >
                            {isMember ? 'Joined ✓' : 'Join'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
