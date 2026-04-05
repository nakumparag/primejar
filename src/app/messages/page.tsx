'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  acceptChatRequest,
  rejectChatRequest,
  Conversation,
  ChatMessage,
} from '@/lib/chat';

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtTime(ts: any): string {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return 'just now';
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86400_000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

function fmtMsgTime(ts: any): string {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function Avatar({ name, size = 10 }: { name: string; size?: number }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{
        width: `${size * 4}px`, height: `${size * 4}px`,
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      }}
    >
      {initials}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [loadingConvs, setLoadingConvs] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/messages');
  }, [user, loading, router]);

  // Subscribe to my conversations
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToConversations(user.uid, (convs) => {
      setConversations(convs);
      setLoadingConvs(false);
    });
    return unsub;
  }, [user]);

  // Subscribe to messages of the active conversation
  useEffect(() => {
    if (!activeConvId) return;
    const unsub = subscribeToMessages(activeConvId, (msgs) => {
      setMessages(msgs);
    });
    return unsub;
  }, [activeConvId]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const otherUid = activeConv?.participants.find(p => p !== user?.uid);
  const otherName = otherUid ? (activeConv?.participantNames?.[otherUid] || 'User') : '';

  const handleSelectConv = (convId: string) => {
    setActiveConvId(convId);
    setMessages([]);
    setShowSidebar(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = useCallback(async () => {
    if (!user || !activeConvId || !newMsg.trim()) return;
    setSending(true);
    try {
      await sendMessage(activeConvId, user.uid, newMsg);
      setNewMsg('');
    } finally {
      setSending(false);
    }
  }, [user, activeConvId, newMsg]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Separate conversations by status
  const pendingRequests = conversations.filter(
    c => c.status === 'pending' && c.requestedBy !== user?.uid
  );
  const myPendingRequests = conversations.filter(
    c => c.status === 'pending' && c.requestedBy === user?.uid
  );
  const accepted = conversations.filter(c => c.status === 'accepted');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-prime-500/30 border-t-prime-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="h-[calc(100vh-4rem)] flex">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 flex-col border-r border-[var(--divider)]`} style={{ background: 'var(--bg-secondary)' }}>
          <div className="p-5 border-b border-[var(--divider)]">
            <h1 className="text-lg font-display font-bold text-[var(--text-primary)] mb-3">Messages</h1>
            <input
              type="text"
              placeholder="Search conversations..."
              className="input-field !py-2 text-sm !rounded-full"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-prime-500/30 border-t-prime-500 rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-[var(--text-primary)] font-medium mb-1">No conversations yet</p>
                <p className="text-[var(--text-muted)] text-sm">Visit a worker's profile to send a chat request.</p>
                <Link href="/users" className="mt-4 gradient-btn rounded-full !py-2 !px-4 text-sm">Browse Professionals</Link>
              </div>
            ) : (
              <>
                {/* Incoming Requests */}
                {pendingRequests.length > 0 && (
                  <div>
                    <div className="px-4 pt-4 pb-2">
                      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                        Chat Requests ({pendingRequests.length})
                      </span>
                    </div>
                    {pendingRequests.map(conv => {
                      const from = conv.participants.find(p => p !== user?.uid);
                      const fromName = from ? (conv.participantNames?.[from] || 'User') : 'User';
                      return (
                        <div key={conv.id} className="px-4 py-3 border-b border-[var(--divider)]">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar name={fromName} size={9} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[var(--text-primary)] text-sm">{fromName}</p>
                              <p className="text-xs text-[var(--text-muted)]">Wants to chat with you</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => acceptChatRequest(conv.id)}
                              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                            >Accept</button>
                            <button
                              onClick={() => rejectChatRequest(conv.id)}
                              className="flex-1 py-2 rounded-xl text-xs font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                            >Decline</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* My pending requests */}
                {myPendingRequests.length > 0 && (
                  <div>
                    <div className="px-4 pt-4 pb-2">
                      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                        Sent Requests
                      </span>
                    </div>
                    {myPendingRequests.map(conv => {
                      const to = conv.participants.find(p => p !== user?.uid);
                      const toName = to ? (conv.participantNames?.[to] || 'User') : 'User';
                      return (
                        <div key={conv.id} className="p-4 flex items-center gap-3 opacity-70">
                          <Avatar name={toName} size={9} />
                          <div>
                            <p className="font-medium text-[var(--text-primary)] text-sm">{toName}</p>
                            <p className="text-xs text-amber-500">⏳ Awaiting response</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Active Chats */}
                {accepted.length > 0 && (
                  <div>
                    {(pendingRequests.length > 0 || myPendingRequests.length > 0) && (
                      <div className="px-4 pt-4 pb-2">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          Active Chats
                        </span>
                      </div>
                    )}
                    {accepted.map(conv => {
                      const other = conv.participants.find(p => p !== user?.uid);
                      const name = other ? (conv.participantNames?.[other] || 'User') : 'User';
                      const isActive = conv.id === activeConvId;
                      return (
                        <button
                          key={conv.id}
                          onClick={() => handleSelectConv(conv.id)}
                          className={`w-full p-4 flex items-center gap-3 transition-colors text-left ${
                            isActive
                              ? 'bg-prime-500/10 border-r-2 border-prime-500'
                              : 'hover:bg-[var(--bg-input)]'
                          }`}
                        >
                          <Avatar name={name} size={10} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-[var(--text-primary)] text-sm truncate">{name}</p>
                              <span className="text-[var(--text-faint)] text-xs flex-shrink-0 ml-1">{fmtTime(conv.lastMessageAt)}</span>
                            </div>
                            <p className="text-[var(--text-muted)] text-xs truncate mt-0.5">
                              {conv.lastMessage || 'Start a conversation'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Chat Area ─────────────────────────────────────────────────────── */}
        <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-1 flex-col`} style={{ background: 'var(--bg-primary)' }}>
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="w-20 h-20 rounded-3xl bg-prime-500/10 flex items-center justify-center text-4xl">💬</div>
              <h2 className="text-xl font-display font-semibold text-[var(--text-primary)]">Select a conversation</h2>
              <p className="text-[var(--text-muted)] text-sm max-w-xs">
                Choose a chat from the sidebar, or{' '}
                <Link href="/users" className="text-prime-500 hover:underline">browse professionals</Link>{' '}
                to send a chat request.
              </p>
            </div>
          ) : activeConv.status !== 'accepted' ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <div className="text-5xl">⏳</div>
              <p className="text-[var(--text-primary)] font-medium">Chat request pending</p>
              <p className="text-[var(--text-muted)] text-sm">Waiting for {otherName} to accept your request.</p>
              <button onClick={() => { setActiveConvId(null); setShowSidebar(true); }} className="text-prime-500 text-sm hover:underline mt-2">← Back</button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[var(--divider)] flex items-center gap-3" style={{ background: 'var(--bg-secondary)' }}>
                <button
                  onClick={() => { setShowSidebar(true); setActiveConvId(null); }}
                  className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <Avatar name={otherName} size={10} />
                <div className="flex-1">
                  <p className="font-display font-semibold text-[var(--text-primary)]">{otherName}</p>
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Chat active
                  </p>
                </div>
                {otherUid && (
                  <Link href={`/users/${otherUid}`} className="text-xs text-prime-500 hover:underline">
                    View Profile
                  </Link>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-[var(--text-muted)] text-sm py-8">
                    Say hello! This is the start of your conversation with {otherName}.
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[72%] px-4 py-2.5 text-sm leading-relaxed ${isMe
                        ? 'bg-prime-500 text-white rounded-3xl rounded-br-lg'
                        : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--bg-card-border)] rounded-3xl rounded-bl-lg'
                      }`}>
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-[var(--text-faint)]'}`}>
                          {fmtMsgTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[var(--divider)]" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex gap-3 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${otherName}...`}
                    className="input-field flex-1 !py-3 !rounded-full"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMsg.trim() || sending}
                    className="w-11 h-11 rounded-full bg-prime-500 text-white flex items-center justify-center hover:bg-prime-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
