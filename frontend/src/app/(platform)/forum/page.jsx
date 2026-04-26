'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import UserAvatar from '@/components/ui/UserAvatar';
import { forumAPI } from '@/lib/api';
import {
    MessagesSquare, Search, Plus, ChevronUp, ChevronDown, MessageCircle,
    Eye, Tag, CheckCircle2, Clock, Loader2, Flame, TrendingUp,
    HelpCircle, Star, Filter, X, Award
} from 'lucide-react';
import toast from 'react-hot-toast';


function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}j`;
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function isNew(dateStr) { return Date.now() - new Date(dateStr) < 86400000; }
function isHot(post) { return post.votes >= 5 || post.views >= 50; }


const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};


const SORTS = [
    { value: 'newest', label: 'Récent', icon: Clock },
    { value: 'votes', label: 'Populaire', icon: Flame },
    { value: 'active', label: 'Actif', icon: TrendingUp },
    { value: 'unsolved', label: 'Sans réponse', icon: HelpCircle },
];


function TagPill({ tag, onClick, active }) {
    return (
        <button
            onClick={() => onClick?.(tag)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${active
                ? 'bg-teal-600 border-teal-500 text-white'
                : 'bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20'
                }`}
        >
            <Tag className="w-2.5 h-2.5" />{tag}
        </button>
    );
}


function VoteCluster({ votes, onUp, onDown }) {
    return (
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.preventDefault(); onUp?.(); }}
                className="p-1 rounded-lg text-slate-500 hover:text-teal-400 hover:bg-teal-400/10 transition-colors"
            >
                <ChevronUp className="w-4 h-4" />
            </motion.button>
            <span className={`text-sm font-bold tabular-nums ${votes > 0 ? 'text-teal-400' : votes < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                {votes}
            </span>
            <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.preventDefault(); onDown?.(); }}
                className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
                <ChevronDown className="w-4 h-4" />
            </motion.button>
        </div>
    );
}


function Badge({ type }) {
    const cfg = {
        solved: { text: 'Résolu', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
        hot: { text: 'Populaire', cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30', icon: Flame },
        new_: { text: 'Nouveau', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: Star },
    }[type];
    if (!cfg) return null;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.cls}`}>
            <Icon className="w-2.5 h-2.5" />{cfg.text}
        </span>
    );
}


function QuestionCard({ post, onVote }) {
    return (
        <motion.div variants={cardVariants} layout>
            <Link
                href={`/forum/${post._id}`}
                className="block group"
            >
                <div className="relative overflow-hidden rounded-2xl border transition-all duration-200"
                    style={{
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border)',
                    }}
                >
                    {post.isSolved && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-2xl" />
                    )}

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                        style={{ background: 'radial-gradient(600px circle at var(--mouse-x,50%) var(--mouse-y,50%), rgba(99,102,241,0.04), transparent 40%)' }}
                    />

                    <div className="flex gap-4 p-5 pl-7">
                        <VoteCluster
                            votes={post.votes}
                            onUp={() => onVote(post._id, 'up')}
                            onDown={() => onVote(post._id, 'down')}
                        />

                        <div className="hidden sm:flex flex-col items-center justify-center gap-3 flex-shrink-0 w-16 text-center">
                            <div className={`text-center px-2 py-1.5 rounded-xl border ${post.replyCount > 0 ? 'border-teal-500/20 bg-teal-500/10' : 'border-white/[0.06] bg-white/[0.03]'}`}>
                                <p className={`text-sm font-bold ${post.replyCount > 0 ? 'text-teal-400' : 'text-slate-500'}`}>{post.replyCount}</p>
                                <p className="text-[9px] text-slate-600 mt-0.5">réponses</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-500">{post.views}</p>
                                <p className="text-[9px] text-slate-600">vues</p>
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-1.5 mb-2">
                                {post.isSolved && <Badge type="solved" />}
                                {isHot(post) && <Badge type="hot" />}
                                {isNew(post.createdAt) && <Badge type="new_" />}
                            </div>

                            <h3 className="font-semibold text-sm text-white group-hover:text-teal-300 transition-colors leading-snug mb-1.5 line-clamp-2">
                                {post.title}
                            </h3>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                {post.content}
                            </p>

                            {post.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {post.tags.map(t => <TagPill key={t} tag={t} />)}
                                </div>
                            )}

                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={post.author} size="xs" />
                                    <span className="text-xs font-medium text-slate-300">{post.author?.name}</span>
                                    <span className="text-[11px] text-slate-600">· {timeAgo(post.createdAt)}</span>
                                </div>

                                <div className="flex sm:hidden items-center gap-3 text-[11px] text-slate-600">
                                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.replyCount}</span>
                                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}


function EmptyState({ search, sort, onReset }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center py-16"
        >
            <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center">
                <MessagesSquare className="w-12 h-12 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
                {search ? `Aucun résultat pour "${search}"` : 'Aucune question ici'}
            </h3>
            <p className="text-slate-500 text-sm mb-5 max-w-xs mx-auto">
                {search
                    ? 'Essayez d\'autres mots-clés ou posez la question vous-même !'
                    : 'Soyez le premier à poser une question à la communauté !'}
            </p>
            <div className="flex items-center gap-3 justify-center">
                {(search || sort !== 'newest') && (
                    <button onClick={onReset} className="btn-ghost text-sm">
                        <X className="w-3.5 h-3.5" /> Réinitialiser
                    </button>
                )}
                <Link href="/forum/new" className="btn-primary text-sm">
                    <Plus className="w-4 h-4" /> Poser une question
                </Link>
            </div>
        </motion.div>
    );
}


function ForumSidebar({ stats }) {
    if (!stats) return null;
    return (
        <div className="space-y-4">
            {stats.hotPosts?.length > 0 && (
                <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <h3 className="text-sm font-semibold text-white">Questions populaires</h3>
                    </div>
                    <div className="space-y-2.5">
                        {stats.hotPosts.map((p) => (
                            <Link key={p._id} href={`/forum/${p._id}`} className="block group">
                                <div className="flex items-start gap-2">
                                    {p.isSolved
                                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        : <MessageCircle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
                                    }
                                    <p className="text-xs text-slate-400 group-hover:text-teal-300 transition-colors line-clamp-2 leading-snug">
                                        {p.title}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mt-1 ml-5 text-[10px] text-slate-600">
                                    <Eye className="w-2.5 h-2.5" />{p.views}
                                    <ChevronUp className="w-2.5 h-2.5" />{p.votes}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {stats.topUsers?.length > 0 && (
                <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                        <Award className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-semibold text-white">Top contributeurs</h3>
                    </div>
                    <div className="space-y-2.5">
                        {stats.topUsers.map((u, i) => (
                            <div key={u._id} className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold w-5 text-center flex-shrink-0 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-600' : 'text-slate-600'}`}>
                                    #{i + 1}
                                </span>
                                <UserAvatar user={u.user} size="xs" />
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-300 truncate">{u.user?.name}</p>
                                    <p className="text-[10px] text-slate-600">{u.posts} question{u.posts !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {stats.popularTags?.length > 0 && (
                <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-teal-400" />
                        <h3 className="text-sm font-semibold text-white">Tags populaires</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {stats.popularTags.map(({ _id: tag, count }) => (
                            <span key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                {tag}
                                <span className="text-teal-600 font-bold">{count}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


const PAGE_SIZE = 15;

export default function ForumPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [activeTag, setActiveTag] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState(null);
    const searchTimer = useRef(null);


    const loadPosts = useCallback(async (pg = 1) => {
        setLoading(true);
        try {
            const { data } = await forumAPI.getPosts({
                search, sort, tag: activeTag, page: pg, limit: PAGE_SIZE,
            });
            setPosts(data.posts);
            setTotal(data.total);
            setPage(pg);
        } catch {
            toast.error('Erreur chargement du forum');
        } finally {
            setLoading(false);
        }
    }, [search, sort, activeTag]);


    useEffect(() => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => loadPosts(1), search ? 400 : 0);
        return () => clearTimeout(searchTimer.current);
    }, [search, sort, activeTag]);


    useEffect(() => {
        forumAPI.getStats().then(({ data }) => setStats(data)).catch(() => { });
    }, []);

    const handleVote = async (postId, dir) => {
        try {
            const { data } = await forumAPI.votePost(postId, dir);
            setPosts(prev => prev.map(p => p._id === postId ? { ...p, votes: data.post.votes } : p));
        } catch { toast.error('Erreur vote'); }
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <Sidebar>
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                    <h1 className="page-title">Forum de discussion</h1>
                    <p className="page-subtitle">
                        {total.toLocaleString()} question{total !== 1 ? 's' : ''} — entraidez-vous !
                    </p>
                </div>
                <Link href="/forum/new" className="btn-primary flex-shrink-0">
                    <Plus className="w-4 h-4" /> Poser une question
                </Link>
            </div>

            <div className="flex gap-6 items-start">
                <div className="flex-1 min-w-0 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                            className="input pl-10 pr-10"
                            placeholder="Rechercher une question, un tag, un mot-clé..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <AnimatePresence>
                            {search && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                        {SORTS.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setSort(value)}
                                className={`relative px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${sort === value
                                    ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/25'
                                    : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        ))}
                        {activeTag && (
                            <button
                                onClick={() => setActiveTag('')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-teal-600/20 border border-teal-500/40 text-teal-300"
                            >
                                <Tag className="w-3 h-3" />{activeTag}
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
                        </div>
                    ) : posts.length === 0 ? (
                        <EmptyState search={search} sort={sort} onReset={() => { setSearch(''); setSort('newest'); setActiveTag(''); }} />
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${sort}-${search}-${activeTag}-${page}`}
                                variants={listVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-3"
                            >
                                {posts.map(post => (
                                    <QuestionCard key={post._id} post={post} onVote={handleVote} />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                                onClick={() => loadPosts(page - 1)}
                                disabled={page <= 1}
                                className="px-3 py-1.5 rounded-xl text-xs border border-white/10 text-slate-400 disabled:opacity-30 hover:border-white/20 transition-all"
                            >
                                ← Précédent
                            </button>
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
                                <button
                                    key={pg}
                                    onClick={() => loadPosts(pg)}
                                    className={`w-8 h-8 rounded-xl text-xs font-medium transition-all border ${pg === page
                                        ? 'bg-teal-600 border-teal-600 text-white'
                                        : 'border-white/10 text-slate-400 hover:border-white/20'
                                        }`}
                                >
                                    {pg}
                                </button>
                            ))}
                            <button
                                onClick={() => loadPosts(page + 1)}
                                disabled={page >= totalPages}
                                className="px-3 py-1.5 rounded-xl text-xs border border-white/10 text-slate-400 disabled:opacity-30 hover:border-white/20 transition-all"
                            >
                                Suivant →
                            </button>
                        </div>
                    )}
                </div>

                <div className="hidden xl:block w-72 flex-shrink-0 sticky top-6">
                    <ForumSidebar stats={stats} />
                </div>
            </div>
        </Sidebar>
    );
}
