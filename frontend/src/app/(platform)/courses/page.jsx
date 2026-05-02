'use client';
import { useEffect, useState, useMemo } from 'react';
import { coursesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import { Search, BookOpen, Users, ChevronDown, Loader2, Play, KeyRound, X, ShieldCheck, SendHorizonal, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CardLoader from '@/components/ui/CardLoader';

/* ── Color-coded Badge ── */
const badgeStyles = {
    category: { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE' },
    level:    { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
    students: { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
    published:{ bg: '#ECFDF5', color: '#047857', border: '#86EFAC' },
    draft:    { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
    default:  { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: 'var(--border)' },
};
function Bdg({ label, type = 'default' }) {
    const s = badgeStyles[type] || badgeStyles.default;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', height: 28, padding: '0 12px', borderRadius: 8,
            fontSize: 12, fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap',
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            textTransform: 'capitalize',
        }}>{label}</span>
    );
}

/* ── Course Card (Professional Redesign) ─────────────────────────────── */
function CourseCard({ course, enrolledIds, onEnroll, enrollingId, requestedIds, onRequest, requestingId, router }) {
    const [hover, setHover] = useState(false);
    const isEnrolled = enrolledIds.has(course._id);
    const isEnrolling = enrollingId === course._id;
    const isRequested = requestedIds?.has(course._id);
    const isRequesting = requestingId === course._id;
    const cat = course.category;
    const lvl = course.level;
    const students = course.enrolledStudents?.length ?? 0;
    const date = course.createdAt
        ? new Date(course.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 28px',
                background: 'var(--bg-card)',
                border: hover ? '1.5px solid var(--accent)' : '1.5px solid var(--border-strong)',
                borderRadius: '14px',
                boxShadow: hover
                    ? '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)'
                    : '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-2px)' : 'none',
                gap: 24,
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* 1. LEFT: Course info */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1.2, minWidth: 0 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.01em', lineHeight: 1.4 }}>
                    {course.title}
                </h3>
                <p style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, gap: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10B981, #0D9F6E)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: '#fff',
                            boxShadow: '0 2px 6px rgba(13,159,110,0.25)',
                        }}>
                            {course.instructor?.name?.charAt(0) || '?'}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {course.instructor?.name || '—'}
                        </span>
                    </span>
                    <span style={{ color: 'var(--border-strong)' }}>·</span>
                    <span suppressHydrationWarning style={{ color: 'var(--text-muted)', fontSize: 12 }}>{date}</span>
                </p>
            </div>

            {/* 2. CENTER: Tags & metadata */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', flex: 1.5 }}>
                {cat && <Bdg label={cat} type="category" />}
                {lvl && <Bdg label={lvl} type="level" />}

                <Bdg label={`${students} étud.`} type="students" />

                {course.isPublished
                    ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 28, background: '#ECFDF5', borderRadius: 8, border: '1px solid #86EFAC' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#047857' }}>Publié</span>
                      </div>
                    : <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 28, background: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#B45309' }}>Brouillon</span>
                      </div>
                }
            </div>

            {/* 3. RIGHT: Actions */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                {isEnrolled ? (
                    <button onClick={() => router.push(`/courses/${course._id}`)} style={{
                        padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: 'linear-gradient(135deg, #10B981, #0D9F6E)', color: '#fff',
                        border: 'none', display: 'flex', alignItems: 'center', gap: 7,
                        transition: 'all 0.25s ease', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(13,159,110,0.25)',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(13,159,110,0.35)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(13,159,110,0.25)'; }}
                    >
                        <Play size={13} fill="currentColor" strokeWidth={0} /> Continuer
                    </button>
                ) : isRequested ? (
                    <span style={{
                        padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: '#F5F7FA', color: 'var(--text-muted)',
                        border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 7,
                    }}>
                        <Clock size={13} strokeWidth={2} /> En attente
                    </span>
                ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => onRequest(course._id)} disabled={isRequesting} title="Demander l'accès" style={{
                            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                            background: 'transparent', color: 'var(--text-secondary)',
                            border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 7,
                            transition: 'all 0.2s ease', cursor: isRequesting ? 'wait' : 'pointer',
                        }}
                            onMouseEnter={e => { if (!isRequesting) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-secondary)'; } }}
                            onMouseLeave={e => { if (!isRequesting) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; } }}
                        >
                            {isRequesting ? <Loader2 size={13} className="animate-spin" /> : <SendHorizonal size={13} strokeWidth={2} />}
                            Demander
                        </button>
                        <button onClick={() => onEnroll(course._id)} disabled={isEnrolling} style={{
                            padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                            background: 'linear-gradient(135deg, #10B981, #0D9F6E)', color: '#fff',
                            border: 'none', display: 'flex', alignItems: 'center', gap: 7,
                            transition: 'all 0.25s ease', cursor: isEnrolling ? 'wait' : 'pointer',
                            boxShadow: '0 2px 8px rgba(13,159,110,0.25)',
                        }}
                            onMouseEnter={e => { if (!isEnrolling) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(13,159,110,0.35)'; } }}
                            onMouseLeave={e => { if (!isEnrolling) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(13,159,110,0.25)'; } }}
                        >
                            {isEnrolling ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} strokeWidth={2} />}
                            {isEnrolling ? '…' : "S'inscrire"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


/* ── Join-by-code Modal ────────────────────────────────────────────────── */
function JoinByCodeModal({ open, onClose, onSuccess }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setLoading(true);
        setError('');
        try {
            const { data } = await coursesAPI.joinByCode(code.trim());
            toast.success(`${data.message} — ${data.courseTitle}`);
            onSuccess(data.courseId);
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Erreur';
            const instructor = err.response?.data?.instructorName;
            setError(instructor ? `${msg}` : msg);
            if (err.response?.data?.courseId) {
                onSuccess(err.response.data.courseId);
                onClose();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            }} onClick={onClose} />
            <div style={{
                position: 'relative', zIndex: 1,
                width: 420, maxWidth: '90vw',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-strong)',
                borderRadius: 16,
                boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
                padding: '28px 24px',
            }}>
                {/* Close */}
                <button onClick={onClose} style={{
                    position: 'absolute', top: 14, right: 14,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4,
                }}>
                    <X size={18} />
                </button>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'linear-gradient(135deg, #059669, #22c55e)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                    }}>
                        <KeyRound size={20} style={{ color: '#fff' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                            Rejoindre avec un code
                        </h2>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            Entrez le code fourni par votre instructeur
                        </p>
                    </div>
                </div>

                {/* Security notice */}
                <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    padding: '10px 12px', borderRadius: 10, marginBottom: 18,
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.2)',
                }}>
                    <ShieldCheck size={15} style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Pour votre sécurité, vous devez être lié à l'instructeur
                        (inscrit à l'un de ses cours ou en contact par message) avant de pouvoir rejoindre.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        placeholder="Ex: A3F2B1C9"
                        maxLength={8}
                        style={{
                            width: '100%', padding: '12px 14px',
                            fontSize: 18, fontWeight: 700, letterSpacing: '0.15em',
                            textAlign: 'center', textTransform: 'uppercase',
                            background: 'var(--bg-input)',
                            border: error ? '1.5px solid var(--danger)' : '1.5px solid var(--border-strong)',
                            borderRadius: 10, color: 'var(--text-primary)',
                            outline: 'none', transition: 'border-color 0.15s',
                            fontFamily: "'SF Mono', 'Fira Code', monospace",
                        }}
                        onFocus={e => { if (!error) e.target.style.borderColor = 'var(--accent)'; }}
                        onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border-strong)'; }}
                        autoFocus
                    />

                    {error && (
                        <p style={{
                            fontSize: 12, color: 'var(--danger)',
                            marginTop: 8, lineHeight: 1.4,
                        }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || code.trim().length < 4}
                        style={{
                            width: '100%', marginTop: 16,
                            padding: '11px 0', borderRadius: 10,
                            fontSize: 13, fontWeight: 700,
                            color: '#fff',
                            background: loading || code.trim().length < 4
                                ? 'rgba(5,150,105,0.4)'
                                : 'linear-gradient(135deg, #059669, #22c55e)',
                            border: 'none', cursor: loading ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: code.trim().length >= 4 ? '0 4px 12px rgba(34,197,94,0.3)' : 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
                        {loading ? 'Vérification…' : 'Rejoindre le cours'}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function CoursesListPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [filterLvl, setFilterLvl] = useState('');
    const [enrolledIds, setEnrolledIds] = useState(new Set());
    const [enrollingId, setEnrollingId] = useState(null);
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [requestedIds, setRequestedIds] = useState(new Set());
    const [requestingId, setRequestingId] = useState(null);

    useEffect(() => {
        if (user?.role === 'admin') router.replace('/admin');
        if (user?.role === 'instructor') router.replace('/instructor');
    }, [user, router]);

    useEffect(() => {
        coursesAPI.getAll({ published: true })
            .then(({ data }) => {
                const list = Array.isArray(data) ? data : (data.courses || []);
                setCourses(list.filter(c => c.isPublished));
            })
            .catch(() => toast.error('Erreur chargement des cours'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!user || !courses.length) return;
        const uid = user.id || user._id;
        setEnrolledIds(new Set(
            courses.filter(c => c.enrolledStudents?.some(s => (s._id || s) === uid)).map(c => c._id)
        ));
    }, [courses, user]);

    // Fetch existing access requests to show "En attente" status
    useEffect(() => {
        if (!user) return;
        coursesAPI.getMyRequests()
            .then(({ data }) => {
                const pending = (data.requests || [])
                    .filter(r => r.status === 'pending')
                    .map(r => r.course?._id)
                    .filter(Boolean);
                setRequestedIds(new Set(pending));
            })
            .catch(() => { });
    }, [user]);

    const categories = useMemo(() => [...new Set(courses.map(c => c.category).filter(Boolean))], [courses]);
    const levels = useMemo(() => [...new Set(courses.map(c => c.level).filter(Boolean))], [courses]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return courses.filter(c => {
            if (q && !c.title?.toLowerCase().includes(q) && !c.instructor?.name?.toLowerCase().includes(q)) return false;
            if (filterCat && c.category !== filterCat) return false;
            if (filterLvl && c.level !== filterLvl) return false;
            return true;
        });
    }, [courses, search, filterCat, filterLvl]);

    const handleEnroll = async (courseId) => {
        if (!user) { toast.error('Connectez-vous pour vous inscrire'); return; }
        setEnrollingId(courseId);
        try {
            await coursesAPI.enroll(courseId);
            toast.success('Inscription réussie ! 🎉');
            setEnrolledIds(prev => new Set([...prev, courseId]));
            router.push(`/courses/${courseId}`);
        } catch (err) {
            const msg = err.response?.data?.message;
            if (msg === 'Déjà inscrit') { setEnrolledIds(prev => new Set([...prev, courseId])); router.push(`/courses/${courseId}`); }
            else if (err.response?.data?.requireCode) {
                toast('Ce cours nécessite un code d\'inscription', { icon: '🔑' });
                setJoinModalOpen(true);
            }
            else toast.error(msg || "Erreur lors de l'inscription");
        } finally { setEnrollingId(null); }
    };

    const handleRequest = async (courseId) => {
        if (!user) { toast.error('Connectez-vous d\'abord'); return; }
        setRequestingId(courseId);
        try {
            await coursesAPI.requestAccess(courseId, '');
            toast.success('Demande envoyée ! L\'instructeur sera notifié.', { icon: '📩' });
            setRequestedIds(prev => new Set([...prev, courseId]));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        } finally { setRequestingId(null); }
    };

    const inputStyle = {
        background: 'var(--bg-input)', border: '1px solid var(--border)',
        color: 'var(--text-primary)', borderRadius: 10, fontSize: 13, outline: 'none',
        transition: 'all 0.2s ease',
    };
    const selStyle = {
        ...inputStyle, padding: '11px 32px 11px 14px',
        cursor: 'pointer', appearance: 'none', minWidth: 150,
        color: 'var(--text-secondary)',
    };

    return (
        <Sidebar>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.02em' }}>
                            Liste de cours
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                            {loading ? '…' : `${filtered.length} cours disponibles`}
                        </p>
                    </div>
                    <button
                        onClick={() => setJoinModalOpen(true)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '10px 20px', borderRadius: 10,
                            fontSize: 13, fontWeight: 600,
                            color: '#fff',
                            background: 'linear-gradient(135deg, #10B981, #0D9F6E)',
                            border: 'none', cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(13,159,110,0.25)',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 16px rgba(13,159,110,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(13,159,110,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <KeyRound size={15} /> Rejoindre avec un code
                    </button>
                </div>

                {/* ── Filters ── */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
                        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            type="text" placeholder="Rechercher un cours, instructeur…"
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ ...inputStyle, width: '100%', padding: '11px 14px 11px 38px' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...selStyle, minWidth: 165 }}>
                            <option value="">Toutes catégories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select value={filterLvl} onChange={e => setFilterLvl(e.target.value)} style={{ ...selStyle, minWidth: 140 }}>
                            <option value="">Tous niveaux</option>
                            {levels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                        </select>
                        <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    </div>
                    {(search || filterCat || filterLvl) && (
                        <button onClick={() => { setSearch(''); setFilterCat(''); setFilterLvl(''); }} style={{
                            padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: 'var(--danger-bg)', color: 'var(--danger)',
                            border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}>
                            Réinitialiser
                        </button>
                    )}
                </div>

                {/* ── Cards Container ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {loading ? (
                        <div style={{ padding: '40px 0' }}>
                            <CardLoader />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                            <BookOpen size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Aucun cours trouvé</p>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Modifiez vos filtres</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {filtered.map((course, i) => (
                                <CourseCard
                                    key={course._id} course={course}
                                    enrolledIds={enrolledIds} onEnroll={handleEnroll} enrollingId={enrollingId}
                                    requestedIds={requestedIds} onRequest={handleRequest} requestingId={requestingId}
                                    router={router}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Join by code modal */}
            <JoinByCodeModal
                open={joinModalOpen}
                onClose={() => setJoinModalOpen(false)}
                onSuccess={(courseId) => router.push(`/courses/${courseId}`)}
            />
        </Sidebar>
    );
}
