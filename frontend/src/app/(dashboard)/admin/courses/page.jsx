'use client';
import { useEffect, useState, useMemo } from 'react';
import { adminAPI, coursesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import {
    Search, BookOpen, Users, ChevronDown,
    Loader2, Eye, Trash2, ToggleLeft, ToggleRight,
    Plus, Filter, AlertTriangle
} from 'lucide-react';
import CardLoader from '@/components/ui/CardLoader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/* ── Design tokens ─────────────────────────────────────────────────────── */
const T = {
    card: {
        bg:     'var(--bg-card)',
        border: '1px solid var(--border)',
        radius: '14px',
        shadow: 'var(--card-shadow)',
    },
    text: {
        primary:   'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted:     'var(--text-muted)',
        accent:    'var(--accent)',
    },
};

/* ── Badge helpers ─────────────────────────────────────────────────────── */
const BADGE_PALETTE = [
    { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' }, // Blue
    { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: 'rgba(139,92,246,0.3)' }, // Purple
    { bg: 'rgba(236,72,153,0.12)', color: '#ec4899', border: 'rgba(236,72,153,0.3)' }, // Pink
    { bg: 'rgba(249,115,22,0.12)', color: '#f97316', border: 'rgba(249,115,22,0.3)' }, // Orange
    { bg: 'rgba(14,165,233,0.12)', color: '#0ea5e9', border: 'rgba(14,165,233,0.3)' }, // Sky
    { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' }, // Red
    { bg: 'rgba(6,182,212,0.12)', color: '#06b6d4', border: 'rgba(6,182,212,0.3)' }, // Cyan
    { bg: 'rgba(234,179,8,0.12)', color: '#eab308', border: 'rgba(234,179,8,0.3)' }, // Yellow
];

function getCategoryBadge(category) {
    if (!category) return { bg: 'var(--bg-secondary)', color: 'var(--text-muted)', border: 'var(--border)' };
    const hash = category.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return BADGE_PALETTE[hash % BADGE_PALETTE.length];
}

const LVL_COLORS = {
    'débutant': { bg: 'rgba(168,85,247,0.12)', color: '#a855f7', border: 'rgba(168,85,247,0.3)' }, // Purple
    'intermédiaire': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' }, // Blue
    'avancé': { bg: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: 'rgba(244,63,94,0.3)' }, // Rose
};
const ICON_COLORS = [
    ['#3b82f6','#1d4ed8'], ['#8b5cf6','#6d28d9'], ['#ec4899','#be185d'],
    ['#f59e0b','#b45309'], ['#10b981','#047857'], ['#ef4444','#b91c1c'],
    ['#06b6d4','#0e7490'], ['#84cc16','#4d7c0f'],
];

function Badge({ label, bg, color, border }) {
    return (
        <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 6,
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
            background: bg, color, border: `1px solid ${border}`,
        }}>{label}</span>
    );
}



/* ── Delete Confirm Modal ───────────────────────────────────────────────── */
function DeleteModal({ course, onConfirm, onCancel, loading }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                background: T.card.bg, border: T.card.border, borderRadius: 16,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: 28, maxWidth: 400, width: '90%',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <AlertTriangle style={{ width: 18, height: 18, color: '#ef4444' }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text.primary }}>Supprimer le cours ?</h3>
                        <p style={{ fontSize: 12, color: T.text.muted, marginTop: 2 }}>Cette action est irréversible</p>
                    </div>
                </div>
                <p style={{ fontSize: 13, color: T.text.secondary, marginBottom: 20, padding: '12px 14px', background: 'rgba(239,68,68,0.05)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.1)' }}>
                    <strong style={{ color: T.text.primary }}>{course?.title}</strong> sera définitivement supprimé avec toutes ses leçons et progressions.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={onCancel} style={{
                        padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        background: T.card.bg, border: T.card.border, color: T.text.secondary, cursor: 'pointer',
                    }}>Annuler</button>
                    <button onClick={onConfirm} disabled={loading} style={{
                        padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        background: '#ef4444', color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Course Row ─────────────────────────────────────────────────────────── */
function CourseRow({ course, index, onToggle, onDelete, togglingId, deletingId }) {
    const [hover, setHover] = useState(false);
    const cat = course.category;
    const lvl = course.level?.toLowerCase();
    const cBdg = getCategoryBadge(cat);
    const lBdg = LVL_COLORS[lvl]  || { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: 'rgba(156,163,175,0.2)' };
    const students = course.enrolledStudents?.length ?? 0;
    const date = course.createdAt
        ? new Date(course.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '2.5fr 150px 130px 90px 110px 110px',
                alignItems: 'center',
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                background: hover ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                transition: 'background 0.12s',
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* COURS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {course.title}
                    </p>
                    <p style={{ fontSize: 11, color: T.text.muted }}>
                        {course.instructor?.name || course.instructor?.firstName || '—'}
                    </p>
                </div>
            </div>

            {/* CATÉGORIE */}
            <div><Badge label={course.category || '—'} {...cBdg} /></div>

            {/* NIVEAU */}
            <div>
                {course.level
                    ? <Badge label={course.level.charAt(0).toUpperCase() + course.level.slice(1)} {...lBdg} />
                    : <span style={{ color: T.text.muted, fontSize: 12 }}>—</span>
                }
            </div>

            {/* ÉTUDIANTS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: T.text.secondary }}>
                <Users size={13} style={{ color: T.text.muted }} />{students}
            </div>

            {/* STATUT */}
            <div>
                {course.isPublished
                    ? <Badge label="● Publié"    bg="rgba(34,197,94,0.1)"  color="#22c55e" border="rgba(34,197,94,0.25)" />
                    : <Badge label="● Brouillon" bg="rgba(251,191,36,0.1)" color="#fbbf24" border="rgba(251,191,36,0.25)" />
                }
            </div>

            {/* CRÉÉ LE */}
            <div style={{ fontSize: 12, color: T.text.muted }}>{date}</div>
        </div>
    );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function AdminCoursesPage() {
    const { user } = useAuthStore();
    const router   = useRouter();
    const [courses, setCourses]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [filterCat, setFilterCat]   = useState('');
    const [filterLvl, setFilterLvl]   = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [togglingId, setTogglingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (user && user.role !== 'admin') router.replace('/dashboard');
    }, [user, router]);

    const load = () => {
        setLoading(true);
        adminAPI.getAdminCourses()
            .then(({ data }) => setCourses(Array.isArray(data) ? data : (data.courses || [])))
            .catch(() => toast.error('Erreur chargement des cours'))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const categories = useMemo(() => [...new Set(courses.map(c => c.category).filter(Boolean))], [courses]);
    const levels     = useMemo(() => [...new Set(courses.map(c => c.level).filter(Boolean))],    [courses]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return courses.filter(c => {
            if (q && !c.title?.toLowerCase().includes(q) && !c.instructor?.name?.toLowerCase().includes(q)) return false;
            if (filterCat && c.category !== filterCat) return false;
            if (filterLvl && c.level     !== filterLvl) return false;
            if (filterStatus === 'published' && !c.isPublished) return false;
            if (filterStatus === 'draft'     &&  c.isPublished) return false;
            return true;
        });
    }, [courses, search, filterCat, filterLvl, filterStatus]);

    const handleToggle = async (id, isPublished) => {
        setTogglingId(id);
        try {
            await adminAPI.togglePublish(id);
            setCourses(prev => prev.map(c => c._id === id ? { ...c, isPublished: !c.isPublished } : c));
            toast.success(isPublished ? 'Cours dépublié' : 'Cours publié ✅');
        } catch {
            toast.error('Erreur lors du changement de statut');
        } finally { setTogglingId(null); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget._id);
        try {
            await coursesAPI.delete(deleteTarget._id);
            setCourses(prev => prev.filter(c => c._id !== deleteTarget._id));
            toast.success('Cours supprimé');
            setDeleteTarget(null);
        } catch {
            toast.error('Erreur lors de la suppression');
        } finally { setDeletingId(null); }
    };

    const published = courses.filter(c => c.isPublished).length;
    const drafts    = courses.length - published;

    const inputStyle = {
        background: T.card.bg, border: '1px solid var(--border)',
        color: T.text.primary, borderRadius: 8, fontSize: 13, outline: 'none',
    };
    const selStyle = {
        ...inputStyle, padding: '8px 30px 8px 12px', cursor: 'pointer',
        appearance: 'none', color: T.text.secondary,
    };

    return (
        <Sidebar>
            <div style={{ maxWidth: 1150, margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text.primary, letterSpacing: '-0.02em' }}>
                            Gestion des cours
                        </h1>
                        <p style={{ fontSize: 13, color: T.text.muted, marginTop: 3 }}>
                            {loading ? '…' : `${courses.length} cours — ${published} publiés, ${drafts} brouillons`}
                        </p>
                    </div>
                    <Link href="/instructor/courses/new" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                        borderRadius: 9, fontSize: 13, fontWeight: 600,
                        background: 'var(--btn-primary-bg)', color: '#fff',
                        textDecoration: 'none', boxShadow: '0 4px 12px rgba(34,197,94,0.25)',
                    }}>
                        <Plus style={{ width: 15, height: 15 }} /> Nouveau cours
                    </Link>
                </div>


                {/* ── Filters ── */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
                        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.text.muted, pointerEvents: 'none' }} />
                        <input type="text" placeholder="Rechercher cours, instructeur…" value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ ...inputStyle, width: '100%', padding: '8px 12px 8px 33px' }}
                        />
                    </div>
                    {[
                        { val: filterCat, set: setFilterCat, placeholder: 'Toutes catégories', items: categories },
                        { val: filterLvl, set: setFilterLvl, placeholder: 'Tous niveaux',     items: levels },
                    ].map(({ val, set, placeholder, items }, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                            <select value={val} onChange={e => set(e.target.value)} style={{ ...selStyle, minWidth: 155 }}>
                                <option value="">{placeholder}</option>
                                {items.map(it => <option key={it} value={it}>{it}</option>)}
                            </select>
                            <ChevronDown size={12} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: T.text.muted, pointerEvents: 'none' }} />
                        </div>
                    ))}
                    <div style={{ position: 'relative' }}>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...selStyle, minWidth: 140 }}>
                            <option value="">Tous statuts</option>
                            <option value="published">Publié</option>
                            <option value="draft">Brouillon</option>
                        </select>
                        <ChevronDown size={12} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: T.text.muted, pointerEvents: 'none' }} />
                    </div>
                    {(search || filterCat || filterLvl || filterStatus) && (
                        <button onClick={() => { setSearch(''); setFilterCat(''); setFilterLvl(''); setFilterStatus(''); }}
                            style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>
                            Réinitialiser
                        </button>
                    )}
                </div>

                {/* ── Table ── */}
                <div style={{ background: T.card.bg, border: '1px solid var(--border-strong)', borderRadius: T.card.radius, overflow: 'hidden', boxShadow: T.card.shadow }}>

                    {/* Header */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '2.5fr 150px 130px 90px 110px 110px',
                        padding: '10px 20px', background: 'var(--bg-secondary)',
                        borderBottom: '1px solid var(--border-strong)',
                    }}>
                        {['COURS','CATÉGORIE','NIVEAU','ÉTUDIANTS','STATUT','CRÉÉ LE'].map(h => (
                            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</span>
                        ))}
                    </div>

                    {/* Body */}
                    {loading ? (
                        <div style={{ padding: '40px 0' }}>
                            <CardLoader />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                            <BookOpen size={36} style={{ color: T.text.muted, margin: '0 auto 12px', display: 'block' }} />
                            <p style={{ fontSize: 14, fontWeight: 600, color: T.text.primary, marginBottom: 4 }}>Aucun cours trouvé</p>
                            <p style={{ fontSize: 13, color: T.text.muted }}>Modifiez vos filtres ou créez un premier cours</p>
                        </div>
                    ) : (
                        filtered.map((course, i) => (
                            <CourseRow key={course._id} course={course} index={i}
                                onToggle={handleToggle} onDelete={setDeleteTarget}
                                togglingId={togglingId} deletingId={deletingId}
                            />
                        ))
                    )}
                </div>

                {/* Result count */}
                {!loading && filtered.length > 0 && (
                    <p style={{ fontSize: 12, color: T.text.muted, marginTop: 12, textAlign: 'right' }}>
                        {filtered.length} cours affichés sur {courses.length}
                    </p>
                )}
            </div>

            {/* ── Delete Modal ── */}
            {deleteTarget && (
                <DeleteModal
                    course={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deletingId === deleteTarget._id}
                />
            )}
        </Sidebar>
    );
}
