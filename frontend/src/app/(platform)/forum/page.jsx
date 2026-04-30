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
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                transition: 'all 0.2s', border: '1px solid',
                background: active ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                borderColor: active ? 'var(--accent)' : 'var(--border)',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
            }}
        >
            <Tag style={{ width: 10, height: 10 }} />{tag}
        </button>
    );
}


function VoteCluster({ votes, onUp, onDown }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.preventDefault(); onUp?.(); }}
                style={{ padding: 4, borderRadius: 8, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                <ChevronUp style={{ width: 16, height: 16 }} />
            </motion.button>
            <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: votes > 0 ? 'var(--accent)' : votes < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {votes}
            </span>
            <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.preventDefault(); onDown?.(); }}
                style={{ padding: 4, borderRadius: 8, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                <ChevronDown style={{ width: 16, height: 16 }} />
            </motion.button>
        </div>
    );
}


function Badge({ type }) {
    const cfg = {
        solved: { text: 'Résolu', bg: '#ECFDF5', color: '#047857', border: '#86EFAC', icon: CheckCircle2 },
        hot:    { text: 'Populaire', bg: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: 'var(--border)', icon: Flame },
        new_:   { text: 'Nouveau', bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE', icon: Star },
    }[type];
    if (!cfg) return null;
    const Icon = cfg.icon;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
        }}>
            <Icon style={{ width: 10, height: 10 }} />{cfg.text}
        </span>
    );
}


function QuestionCard({ post, onVote }) {
    const [hover, setHover] = useState(false);
    return (
        <motion.div variants={cardVariants} layout>
            <Link
                href={`/forum/${post._id}`}
                style={{ display: 'block', textDecoration: 'none' }}
            >
                <div
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    style={{
                        position: 'relative', overflow: 'hidden', borderRadius: 14,
                        border: `1.5px solid ${hover ? 'var(--accent)' : 'var(--border-strong)'}`,
                        background: 'var(--bg-card)',
                        boxShadow: hover ? 'var(--card-shadow-hover)' : 'var(--card-shadow)',
                        transition: 'all 0.25s ease',
                        transform: hover ? 'translateY(-2px)' : 'none',
                    }}
                >
                    {post.isSolved && (
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--accent)', borderRadius: '14px 0 0 14px' }} />
                    )}

                    <div style={{ display: 'flex', gap: 16, padding: '20px 20px 20px 24px' }}>
                        <VoteCluster
                            votes={post.votes}
                            onUp={() => onVote(post._id, 'up')}
                            onDown={() => onVote(post._id, 'down')}
                        />

                        {/* Reply count + views */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, flexShrink: 0, width: 64, textAlign: 'center' }}>
                            <div style={{
                                textAlign: 'center', padding: '6px 8px', borderRadius: 12,
                                border: `1px solid ${post.replyCount > 0 ? 'var(--border-strong)' : 'var(--border)'}`,
                                background: post.replyCount > 0 ? 'var(--bg-secondary)' : 'transparent',
                            }}>
                                <p style={{ fontSize: 14, fontWeight: 700, color: post.replyCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{post.replyCount}</p>
                                <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>réponses</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{post.views}</p>
                                <p style={{ fontSize: 9, color: 'var(--text-muted)' }}>vues</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                                {post.isSolved && <Badge type="solved" />}
                                {isHot(post) && <Badge type="hot" />}
                                {isNew(post.createdAt) && <Badge type="new_" />}
                            </div>

                            <h3 style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {post.title}
                            </h3>

                            <p style={{ fontSize: 12, color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6, marginBottom: 12 }}>
                                {post.content}
                            </p>

                            {post.tags?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                    {post.tags.map(t => <TagPill key={t} tag={t} />)}
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <UserAvatar user={post.author} size="xs" />
                                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{post.author?.name}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {timeAgo(post.createdAt)}</span>
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
            <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-br from-slate-700/40 to-slate-800/60 border border-slate-700/70 flex items-center justify-center">
                <MessagesSquare className="w-12 h-12 text-slate-300" />
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
    const sideCard = { background: 'var(--bg-card)', border: '1.5px solid var(--border-strong)', borderRadius: 14, padding: 20, boxShadow: 'var(--card-shadow)' };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {stats.hotPosts?.length > 0 && (
                <div style={sideCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Flame style={{ width: 16, height: 16, color: '#F59E0B' }} />
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Questions populaires</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {stats.hotPosts.map((p) => (
                            <Link key={p._id} href={`/forum/${p._id}`} style={{ textDecoration: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                    {p.isSolved
                                        ? <CheckCircle2 style={{ width: 14, height: 14, color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                                        : <MessageCircle style={{ width: 14, height: 14, color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
                                    }
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {p.title}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, marginLeft: 22, fontSize: 10, color: 'var(--text-muted)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Eye style={{ width: 10, height: 10 }} />{p.views}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><ChevronUp style={{ width: 10, height: 10 }} />{p.votes}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {stats.topUsers?.length > 0 && (
                <div style={sideCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Award style={{ width: 16, height: 16, color: '#F59E0B' }} />
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Top contributeurs</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {stats.topUsers.map((u, i) => (
                            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, width: 20, textAlign: 'center', flexShrink: 0, color: i === 0 ? '#F59E0B' : i === 1 ? 'var(--text-secondary)' : i === 2 ? '#EA580C' : 'var(--text-muted)' }}>
                                    #{i + 1}
                                </span>
                                <UserAvatar user={u.user} size="xs" />
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.user?.name}</p>
                                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.posts} question{u.posts !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {stats.popularTags?.length > 0 && (
                <div style={sideCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Tag style={{ width: 16, height: 16, color: 'var(--text-secondary)' }} />
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Tags populaires</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {stats.popularTags.map(({ _id: tag, count }) => (
                            <span key={tag}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '2px 8px', borderRadius: 8, fontSize: 11,
                                    background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                                    border: '1px solid var(--border)',
                                }}>
                                {tag}
                                <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{count}</span>
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
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                <div>
                    <h1 className="page-title">Forum de discussion</h1>
                    <p className="page-subtitle">
                        {total.toLocaleString()} question{total !== 1 ? 's' : ''} — entraidez-vous !
                    </p>
                </div>
                <Link href="/forum/new" className="btn-primary" style={{ flexShrink: 0 }}>
                    <Plus style={{ width: 16, height: 16 }} /> Poser une question
                </Link>
            </div>

            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            className="input"
                            style={{ paddingLeft: 40, paddingRight: 40 }}
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
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <X style={{ width: 16, height: 16 }} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sort buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Filter style={{ width: 14, height: 14, color: 'var(--text-muted)', flexShrink: 0 }} />
                        {SORTS.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setSort(value)}
                                style={{
                                    position: 'relative', padding: '6px 12px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                                    display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', cursor: 'pointer',
                                    border: `1px solid ${sort === value ? 'var(--accent)' : 'var(--border)'}`,
                                    background: sort === value ? 'var(--accent)' : 'transparent',
                                    color: sort === value ? '#fff' : 'var(--text-secondary)',
                                    boxShadow: sort === value ? 'var(--shadow-accent)' : 'none',
                                }}
                            >
                                <Icon style={{ width: 14, height: 14 }} />
                                {label}
                            </button>
                        ))}
                        {activeTag && (
                            <button
                                onClick={() => setActiveTag('')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 12px', borderRadius: 12, fontSize: 12,
                                    background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)',
                                    color: 'var(--text-primary)', cursor: 'pointer',
                                }}
                            >
                                <Tag style={{ width: 12, height: 12 }} />{activeTag}
                                <X style={{ width: 12, height: 12 }} />
                            </button>
                        )}
                    </div>

                    {/* Posts list */}
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '96px 0' }}>
                            <Loader2 style={{ width: 40, height: 40, color: 'var(--text-muted)' }} className="animate-spin" />
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
                                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                            >
                                {posts.map(post => (
                                    <QuestionCard key={post._id} post={post} onVote={handleVote} />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 8 }}>
                            <button
                                onClick={() => loadPosts(page - 1)}
                                disabled={page <= 1}
                                style={{
                                    padding: '6px 12px', borderRadius: 12, fontSize: 12,
                                    border: '1px solid var(--border)', color: 'var(--text-secondary)',
                                    background: 'transparent', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                    opacity: page <= 1 ? 0.3 : 1, transition: 'all 0.2s',
                                }}
                            >
                                ← Précédent
                            </button>
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
                                <button
                                    key={pg}
                                    onClick={() => loadPosts(pg)}
                                    style={{
                                        width: 32, height: 32, borderRadius: 12, fontSize: 12, fontWeight: 500,
                                        transition: 'all 0.2s', cursor: 'pointer',
                                        border: `1px solid ${pg === page ? 'var(--accent)' : 'var(--border)'}`,
                                        background: pg === page ? 'var(--accent)' : 'transparent',
                                        color: pg === page ? '#fff' : 'var(--text-secondary)',
                                    }}
                                >
                                    {pg}
                                </button>
                            ))}
                            <button
                                onClick={() => loadPosts(page + 1)}
                                disabled={page >= totalPages}
                                style={{
                                    padding: '6px 12px', borderRadius: 12, fontSize: 12,
                                    border: '1px solid var(--border)', color: 'var(--text-secondary)',
                                    background: 'transparent', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                                    opacity: page >= totalPages ? 0.3 : 1, transition: 'all 0.2s',
                                }}
                            >
                                Suivant →
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'none', width: 288, flexShrink: 0, position: 'sticky', top: 24 }} className="xl:!block">
                    <ForumSidebar stats={stats} />
                </div>
            </div>
        </Sidebar>
    );
}
