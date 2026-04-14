'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { messagesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import UserAvatar from '@/components/ui/UserAvatar';
import { Loader2, Send, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

function formatTimestamp(dateStr) {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit',
    });
}

function formatDateLabel(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function ThreadPage() {
    const { userId } = useParams();
    const { user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [partner, setPartner] = useState(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const pollingRef = useRef(null);

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
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!content.trim() || sending) return;
        setSending(true);
        try {
            const { data } = await messagesAPI.send({ receiverId: userId, content: content.trim() });
            setMessages((prev) => [...prev, data.message]);
            setContent('');
            inputRef.current?.focus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur envoi');
        } finally {
            setSending(false);
        }
    };

    const deleteMessage = async (id) => {
        try {
            await messagesAPI.deleteMessage(id);
            setMessages((prev) => prev.filter((m) => m._id !== id));
        } catch {
            toast.error('Erreur suppression');
        }
    };


    const grouped = [];
    let lastDate = '';
    messages.forEach((msg) => {
        const day = new Date(msg.createdAt).toDateString();
        if (day !== lastDate) {
            grouped.push({ type: 'separator', label: formatDateLabel(msg.createdAt), key: `sep-${day}` });
            lastDate = day;
        }
        grouped.push({ type: 'message', msg });
    });

    if (loading) return (
        <Sidebar>
            <div className="flex justify-center py-24">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            </div>
        </Sidebar>
    );

    return (
        <Sidebar>
            <div className="flex items-center gap-4 mb-6">
                <Link href="/messages" className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(124,58,237,0.10)', color: 'var(--text-secondary)' }}>
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                {partner && (
                    <div className="flex items-center gap-3">
                        <UserAvatar user={partner} size="md" />
                        <div>
                            <p className="font-semibold text-white text-sm">{partner.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{partner.role}
                                {partner.speciality ? ` · ${partner.speciality}` : ''}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div
                className="card p-4 flex flex-col gap-1 overflow-y-auto mb-4"
                style={{ minHeight: '50vh', maxHeight: '60vh' }}
            >
                {grouped.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-16">
                        <p className="text-slate-500 text-sm">Envoyez votre premier message !</p>
                    </div>
                )}

                {grouped.map((item) => {
                    if (item.type === 'separator') {
                        return (
                            <div key={item.key} className="flex items-center gap-3 my-3">
                                <div className="flex-1 h-px bg-white/[0.06]" />
                                <span className="text-[11px] text-slate-600 capitalize">{item.label}</span>
                                <div className="flex-1 h-px bg-white/[0.06]" />
                            </div>
                        );
                    }

                    const { msg } = item;
                    const isMe = String(msg.sender?._id || msg.sender) === String(user?._id);

                    return (
                        <div key={msg._id}
                            className={`flex items-end gap-2 group ${isMe ? 'flex-row-reverse' : 'flex-row'} mb-1`}>
                            {!isMe && (
                                <UserAvatar user={msg.sender} size="xs" className="mb-0.5" />
                            )}

                            <div className={`relative max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                                ${isMe
                                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm'
                                    : 'bg-white/[0.07] text-slate-200 rounded-bl-sm'
                                }`}>
                                {msg.content}
                                <span className={`block text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                                    {formatTimestamp(msg.createdAt)}
                                    {isMe && (msg.read ? ' · Lu' : '')}
                                </span>
                            </div>

                            {isMe && (
                                <button onClick={() => deleteMessage(msg._id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-600 hover:text-red-400">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-3">
                <input
                    ref={inputRef}
                    className="input flex-1"
                    placeholder={`Écrire à ${partner?.name || ''}...`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={2000}
                />
                <button type="submit" disabled={sending || !content.trim()} className="btn-primary px-5">
                    {sending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Send className="w-4 h-4" />}
                </button>
            </form>
        </Sidebar>
    );
}
