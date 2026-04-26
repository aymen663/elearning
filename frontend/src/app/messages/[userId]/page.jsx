'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { messagesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import UserAvatar from '@/components/ui/UserAvatar';
import {
    Loader2, Send, ArrowLeft, Trash2, CheckCheck,
    Smile, Paperclip, Phone, MoreVertical, Search
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
/* ─── Helpers ────────────────────────────────────────────── */
function formatTimestamp(dateStr) {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
function formatDateLabel(dateStr) {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d) / 86400000);
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Hier';
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/* ─── Theme hook ─────────────────────────────────────────── */
function useIsDark() {
    const [isDark, setIsDark] = useState(true);
    useEffect(() => {
        const check = () => setIsDark(!document.documentElement.classList.contains('light'));
        check();
        const obs = new MutationObserver(check);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);
    return isDark;
}

/* ─── Typing indicator bubble ────────────────────────────── */
function TypingIndicator({ name, isDark }) {
    return (
        <div className="flex items-end gap-2.5 mb-2">
            <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mb-1"
                style={{ background: 'linear-gradient(135deg,#14b8a6,#6366f1)' }}
            >
                {name?.[0]?.toUpperCase()}
            </div>
            <div
                className="px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5"
                style={{
                    background: isDark ? '#1E293B' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0'}`,
                    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                }}
            >
                {[0, 1, 2].map(i => (
                    <span
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{
                            background: isDark ? '#64748b' : '#94a3b8',
                            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─── Main component ─────────────────────────────────────── */
export default function ThreadPage() {
    const { userId } = useParams();
    const { user } = useAuthStore();
    const isDark = useIsDark();

    const [messages, setMessages] = useState([]);
    const [partner, setPartner] = useState(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showTyping, setShowTyping] = useState(false);
    const [focused, setFocused] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const pollingRef = useRef(null);
    const typingTimerRef = useRef(null);

    /* ── Data fetching ── */
    const loadThread = useCallback(async (initial = false) => {
        try {
            const { data } = await messagesAPI.getThread(userId);
            setMessages(data.messages);
            if (initial) setPartner(data.partner);
        } catch {
            if (initial) toast.error('Conversation introuvable');
        } finally {
            if (initial) setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadThread(true);
        pollingRef.current = setInterval(() => loadThread(false), 5000);
        return () => clearInterval(pollingRef.current);
    }, [loadThread]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showTyping]);

    /* ── Input ── */
    const handleInput = (e) => {
        setContent(e.target.value);
    };

    /* ── Send ── */
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!content.trim() || sending) return;
        setSending(true);
        setShowTyping(false);
        try {
            const { data } = await messagesAPI.send({ receiverId: userId, content: content.trim() });
            setMessages(prev => [...prev, data.message]);
            setContent('');
            inputRef.current?.focus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur envoi');
        } finally {
            setSending(false);
        }
    };

    /* ── Delete ── */
    const deleteMessage = async (id) => {
        try {
            await messagesAPI.deleteMessage(id);
            setMessages(prev => prev.filter(m => m._id !== id));
        } catch {
            toast.error('Erreur suppression');
        }
    };

    /* ── Group by date ── */
    const grouped = [];
    let lastDate = '';
    messages.forEach(msg => {
        const day = new Date(msg.createdAt).toDateString();
        if (day !== lastDate) {
            grouped.push({ type: 'separator', label: formatDateLabel(msg.createdAt), key: `sep-${day}` });
            lastDate = day;
        }
        grouped.push({ type: 'message', msg });
    });

    /* ── Design tokens ── */
    const T = isDark ? {
        pageBg: 'transparent',
        chatBg: '#0B0F19',
        chatBorder: 'rgba(255,255,255,0.06)',
        chatShadow: '0 16px 48px rgba(0,0,0,0.4)',
        headerBg: 'rgba(14, 19, 34, 0.95)',
        headerBorder: 'rgba(255,255,255,0.06)',
        msgAreaBg: 'transparent',
        bubbleMe: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        bubbleMeText: '#ffffff',
        bubbleMeShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
        bubbleThem: '#1E293B',
        bubbleThemText: '#F8FAFC',
        bubbleThemBorder: 'rgba(255,255,255,0.05)',
        bubbleThemShadow: '0 2px 8px rgba(0,0,0,0.2)',
        footerBg: 'rgba(14, 19, 34, 0.95)',
        footerBorder: 'rgba(255,255,255,0.06)',
        inputBg: 'rgba(255,255,255,0.03)',
        inputBorder: 'rgba(255,255,255,0.08)',
        inputBorderFocus: '#10b981',
        inputText: '#F8FAFC',
        inputPlaceholder: '#64748B',
        sepLine: 'rgba(255,255,255,0.06)',
        sepPill: '#1E293B',
        sepPillBorder: 'rgba(255,255,255,0.06)',
        sepText: '#94A3B8',
        iconBtn: 'rgba(255,255,255,0.03)',
        iconBtnHover: 'rgba(255,255,255,0.08)',
        iconColor: '#94A3B8',
        muted: '#64748B',
        text: '#F8FAFC',
        onlineDot: '#10b981',
        onlineDotBorder: '#0B0F19',
        sendBtnActive: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        sendBtnInactive: 'rgba(255,255,255,0.05)',
        sendIconInactive: '#64748B',
        pillBg: 'rgba(255,255,255,0.03)',
        pillText: '#94A3B8',
    } : {
        pageBg: '#EEF2F7',
        chatBg: '#ffffff',
        chatBorder: '#CBD5E1',
        chatShadow: '0 2px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        headerBg: '#ffffff',
        headerBorder: '#E2E8F0',
        msgAreaBg: '#DAE8F5',
        bubbleMe: '#D1FAE5',
        bubbleMeText: '#064E3B',
        bubbleMeShadow: '0 1px 3px rgba(0,0,0,0.08)',
        bubbleThem: '#ffffff',
        bubbleThemText: '#1e293b',
        bubbleThemBorder: 'rgba(0,0,0,0.06)',
        bubbleThemShadow: '0 1px 3px rgba(0,0,0,0.08)',
        footerBg: '#f0f2f5',
        footerBorder: '#E2E8F0',
        inputBg: '#ffffff',
        inputBorder: '#CBD5E1',
        inputBorderFocus: '#22c55e',
        inputText: '#1e293b',
        inputPlaceholder: '#94a3b8',
        sepLine: 'rgba(0,0,0,0.10)',
        sepPill: '#ffffff',
        sepPillBorder: 'rgba(0,0,0,0.10)',
        sepText: '#64748b',
        iconBtn: '#F1F5F9',
        iconBtnHover: '#E2E8F0',
        iconColor: '#475569',
        muted: '#64748b',
        text: '#1e293b',
        onlineDot: '#22c55e',
        sendBtnActive: '#22c55e',
        sendBtnInactive: '#F1F5F9',
        sendIconInactive: '#94a3b8',
        pillBg: '#F1F5F9',
        pillText: '#94a3b8',
    };

    /* ── Loading ── */
    if (loading) return (
        <Sidebar>
            <div className="flex justify-center py-32">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        </Sidebar>
    );

    return (
        <Sidebar>
            <style>{`
                @keyframes bounce {
                    0%,80%,100%{transform:translateY(0)}
                    40%{transform:translateY(-6px)}
                }
                .msg-bubble { transition: transform 0.15s ease, box-shadow 0.15s ease; }
                .msg-bubble:hover { transform: translateY(-1px); }
                .send-btn { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
                .send-btn:hover:not(:disabled) { transform: scale(1.08); }
                .send-btn:active:not(:disabled) { transform: scale(0.94); }
                .icon-action { transition: all 0.15s ease; }
                .icon-action:hover { transform: scale(1.1); }
            `}</style>

            <div
                className="flex flex-col rounded-2xl overflow-hidden"
                style={{
                    height: 'calc(100vh - 120px)',
                    background: T.chatBg,
                    border: `1.5px solid ${T.chatBorder}`,
                    boxShadow: T.chatShadow,
                }}
            >
                {/* ══ HEADER ══════════════════════════════════════════ */}
                <div
                    className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
                    style={{
                        background: T.headerBg,
                        borderBottom: `1px solid ${T.headerBorder}`,
                    }}
                >
                    {/* Back */}
                    <Link
                        href="/messages"
                        className="icon-action w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: T.iconBtn, color: T.iconColor }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>

                    {partner && (
                        <>
                            {/* Avatar + status */}
                            <div className="relative flex-shrink-0">
                                <UserAvatar user={partner} size="sm" />
                                <span
                                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                                    style={{ background: T.onlineDot, borderColor: T.onlineDotBorder }}
                                />
                            </div>

                            {/* Name + role */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm leading-tight truncate" style={{ color: T.text }}>
                                    {partner.name}
                                </p>
                                <p className="text-[11px] flex items-center gap-1.5 mt-0.5" style={{ color: T.muted }}>
                                    <span
                                        className="inline-block w-1.5 h-1.5 rounded-full"
                                        style={{ background: T.onlineDot }}
                                    />
                                    En ligne
                                    <span style={{ color: T.sepText }}>·</span>
                                    <span className="capitalize">{partner.role === 'instructor' ? 'Instructeur' : partner.role}</span>
                                    {partner.speciality && <><span style={{ color: T.sepText }}>·</span>{partner.speciality}</>}
                                </p>
                            </div>

                        </>
                    )}
                </div>

                {/* ══ MESSAGES ════════════════════════════════════════ */}
                <div
                    className="flex-1 overflow-y-auto px-5 py-5"
                    style={{ background: T.msgAreaBg }}
                >
                    {/* Empty state */}
                    {grouped.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                style={{ background: isDark ? 'rgba(34,197,94,0.10)' : '#F0FDF4', border: `1px solid ${isDark ? 'rgba(34,197,94,0.15)' : '#BBF7D0'}` }}
                            >
                                <Send className="w-7 h-7" style={{ color: '#22c55e' }} />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-sm" style={{ color: T.text }}>
                                    Démarrez la conversation
                                </p>
                                <p className="text-xs mt-1" style={{ color: T.muted }}>
                                    Envoyez un message à {partner?.name}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {grouped.map(item => {
                        /* Date separator */
                        if (item.type === 'separator') return (
                            <div key={item.key} className="flex items-center gap-3 py-5">
                                <div className="flex-1 h-px" style={{ background: T.sepLine }} />
                                <span
                                    className="text-[11px] font-medium px-3 py-1 rounded-full capitalize flex-shrink-0"
                                    style={{
                                        background: T.sepPill,
                                        color: T.sepText,
                                        border: `1px solid ${T.sepPillBorder}`,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                    }}
                                >
                                    {item.label}
                                </span>
                                <div className="flex-1 h-px" style={{ background: T.sepLine }} />
                            </div>
                        );

                        const { msg } = item;
                        const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
                        const currentUserId = user?._id || user?.id;
                        const isMe = String(senderId) === String(currentUserId);

                        return (
                            <div
                                key={msg._id}
                                className={`flex items-end gap-2 group mb-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {/* Partner avatar */}
                                {!isMe && (
                                    <div className="flex-shrink-0 mb-5">
                                        <UserAvatar user={msg.sender} size="xs" />
                                    </div>
                                )}

                                <div className={`flex flex-col max-w-[62%] gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                    {/* Bubble */}
                                    <div
                                        className="msg-bubble px-4 py-2.5 text-sm leading-relaxed"
                                        style={isMe ? {
                                            background: T.bubbleMe,
                                            color: T.bubbleMeText,
                                            borderRadius: '18px 18px 4px 18px',
                                            boxShadow: T.bubbleMeShadow,
                                        } : {
                                            background: T.bubbleThem,
                                            color: T.bubbleThemText,
                                            border: `1px solid ${T.bubbleThemBorder}`,
                                            borderRadius: '18px 18px 18px 4px',
                                            boxShadow: T.bubbleThemShadow,
                                        }}
                                    >
                                        {msg.content}
                                    </div>

                                    {/* Timestamp + read */}
                                    <div className={`flex items-center gap-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <span className="text-[10px]" style={{ color: T.muted }}>
                                            {formatTimestamp(msg.createdAt)}
                                        </span>
                                        {isMe && (
                                            <CheckCheck
                                                className="w-3 h-3"
                                                style={{ color: msg.read ? T.onlineDot : T.muted }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Delete button (hover) */}
                                {isMe && (
                                    <button
                                        onClick={() => deleteMessage(msg._id)}
                                        className="icon-action opacity-0 group-hover:opacity-100 mb-6 flex-shrink-0 p-1.5 rounded-lg"
                                        style={{ color: T.muted }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                                        onMouseLeave={e => e.currentTarget.style.color = T.muted}
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {/* Typing indicator */}
                    {showTyping && <TypingIndicator name={partner?.name} isDark={isDark} />}

                    <div ref={bottomRef} />
                </div>

                {/* ══ INPUT BAR ═══════════════════════════════════════ */}
                <div
                    className="flex-shrink-0 px-4 py-3"
                    style={{
                        background: T.footerBg,
                        borderTop: `1px solid ${T.footerBorder}`,
                    }}
                >
                    <form onSubmit={sendMessage}>
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-200"
                            style={{
                                background: T.inputBg,
                                border: `1.5px solid ${focused ? T.inputBorderFocus : T.inputBorder}`,
                                boxShadow: focused
                                    ? `0 0 0 3px ${isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.10)'}`
                                    : '0 1px 3px rgba(0,0,0,0.05)',
                            }}
                        >
                            {/* Emoji */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="icon-action flex-shrink-0 p-1 rounded-lg"
                                    style={{ color: showEmojiPicker ? T.sendBtnActive : T.iconColor }}
                                >
                                    <Smile className="w-5 h-5" />
                                </button>

                                {showEmojiPicker && (
                                    <div className="absolute bottom-12 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden">
                                        <EmojiPicker 
                                            onEmojiClick={(emojiObject) => {
                                                setContent(prev => prev + emojiObject.emoji);
                                            }}
                                            theme={isDark ? 'dark' : 'light'}
                                            lazyLoadEmojis={true}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <input
                                ref={inputRef}
                                className="flex-1 bg-transparent outline-none text-sm"
                                style={{ color: T.inputText }}
                                placeholder="Écrire un message..."
                                value={content}
                                onChange={handleInput}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                maxLength={2000}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage(e);
                                    }
                                }}
                            />

                            {/* Char count */}
                            {content.length > 1800 && (
                                <span className="text-[10px] flex-shrink-0" style={{ color: content.length > 1950 ? '#f87171' : T.muted }}>
                                    {2000 - content.length}
                                </span>
                            )}

                            {/* Send */}
                            <button
                                type="submit"
                                disabled={sending || !content.trim()}
                                className="send-btn flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background: content.trim() ? T.sendBtnActive : T.sendBtnInactive,
                                    color: content.trim() ? '#ffffff' : T.sendIconInactive,
                                    boxShadow: content.trim()
                                        ? `0 4px 14px ${isDark ? 'rgba(34,197,94,0.35)' : 'rgba(34,197,94,0.30)'}`
                                        : 'none',
                                }}
                            >
                                {sending
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Send className="w-4 h-4" style={{ transform: 'translateX(1px)' }} />
                                }
                            </button>
                        </div>

                        <p className="text-[10px] mt-1.5 ml-2" style={{ color: T.muted }}>
                            <kbd
                                className="px-1 py-0.5 rounded text-[9px]"
                                style={{ background: T.pillBg, border: `1px solid ${T.sepLine}`, color: T.sepText }}
                            >
                                Enter
                            </kbd>
                            {' '}pour envoyer · {' '}
                            <kbd
                                className="px-1 py-0.5 rounded text-[9px]"
                                style={{ background: T.pillBg, border: `1px solid ${T.sepLine}`, color: T.sepText }}
                            >
                                Shift+Enter
                            </kbd>
                            {' '}pour saut de ligne
                        </p>
                    </form>
                </div>
            </div>
        </Sidebar>
    );
}
