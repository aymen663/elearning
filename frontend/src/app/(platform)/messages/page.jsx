'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { messagesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import UserAvatar from '@/components/ui/UserAvatar';
import { MessageSquare, Loader2, Search, ChevronRight } from 'lucide-react';
import CardLoader from '@/components/ui/CardLoader';
import Link from 'next/link';
import toast from 'react-hot-toast';

function formatTime(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export default function MessagesPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        messagesAPI.getConversations()
            .then(({ data }) => setConversations(data.conversations))
            .catch(() => toast.error('Erreur chargement des conversations'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = conversations.filter((c) =>
        c.partner?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Sidebar>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Messages</h1>
                    <p className="page-subtitle">Vos conversations</p>
                </div>
            </div>

            <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    className="input pl-10"
                    placeholder="Rechercher une conversation..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-16">
                    <CardLoader />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card text-center py-20">
                    <MessageSquare className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Aucune conversation</p>
                    <p className="text-slate-600 text-sm mt-1">
                        Contactez un instructeur depuis la page d&apos;un cours
                    </p>
                </div>
            ) : (
                <div className="card p-0 overflow-hidden divide-y divide-white/[0.05]">
                    {filtered.map(({ partner, lastMessage, unreadCount }) => (
                        <Link
                            key={partner._id}
                            href={`/messages/${partner._id}`}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors group"
                        >
                            <UserAvatar user={partner} size="md" />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <p className={`text-sm font-semibold truncate ${unreadCount > 0 ? 'text-white' : 'text-slate-300'}`}>
                                        {partner.name}
                                    </p>
                                    {lastMessage?.createdAt && (
                                        <span className="text-[11px] text-slate-500 flex-shrink-0 ml-2">
                                            {formatTime(lastMessage.createdAt)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className={`text-xs truncate ${unreadCount > 0 ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                                        {lastMessage?.content || '…'}
                                    </p>
                                    {unreadCount > 0 && (
                                        <span className="ml-2 flex-shrink-0 w-5 h-5 bg-teal-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 capitalize">{partner.role}</p>
                            </div>

                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                        </Link>
                    ))}
                </div>
            )}
        </Sidebar>
    );
}
