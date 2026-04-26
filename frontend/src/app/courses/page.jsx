'use client';
import { useEffect, useState, useMemo } from 'react';
import { coursesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import { Search, BookOpen, Users, ChevronDown, Loader2, Play, KeyRound, X, ShieldCheck, SendHorizonal, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/* ── Badge colors — rgba works in both dark & light ───────────────────── */
const CAT_BADGE = {
    'programmation': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
    'intelligence artificielle': { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
    'data science': { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    'design': { bg: 'rgba(236,72,153,0.12)', color: '#f472b6', border: 'rgba(236,72,153,0.3)' },
    'cybersécurité': { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
    'développement web': { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
    'développement': { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
    'marketing': { bg: 'rgba(251,146,60,0.12)', color: '#fb923c', border: 'rgba(251,146,60,0.3)' },
    'business': { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
};
const LVL_BADGE = {
    'débutant': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
    'intermédiaire': { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
    'avancé': { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
};
const ICON_COLORS = [
    ['#3b82f6', '#1d4ed8'], ['#8b5cf6', '#6d28d9'], ['#ec4899', '#be185d'],
    ['#f59e0b', '#b45309'], ['#10b981', '#047857'], ['#ef4444', '#b91c1c'],
    ['#06b6d4', '#0e7490'], ['#84cc16', '#4d7c0f'],
];

/* ── Sub-components ────────────────────────────────────────────────────── */
function CourseIcon({ title, index }) {
    const [a, b] = ICON_COLORS[index % ICON_COLORS.length];
    return (
        <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg, ${a}, ${b})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
            boxShadow: `0 8px 16px -4px ${a}66, inset 0 2px 4px rgba(255,255,255,0.3)`,
            border: `1px solid ${a}33`,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
            {title?.[0]?.toUpperCase() || '?'}
        </div>
    );
}

function Bdg({ label, bg, color, border }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 12,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap',
            background: bg, color, border: `1px solid ${border}`,
            textTransform: 'uppercase'
        }}>{label}</span>
    );
}

/* ── Course Row (Ultra Premium List Layout) ─────────────────────────────── */
function CourseRow({ course, index, enrolledIds, onEnroll, enrollingId, requestedIds, onRequest, requestingId, router }) {
    const [hover, setHover] = useState(false);
    const isEnrolled = enrolledIds.has(course._id);
    const isEnrolling = enrollingId === course._id;
    const isRequested = requestedIds?.has(course._id);
    const isRequesting = requestingId === course._id;
    const cat = course.category?.toLowerCase();
    const lvl = course.level?.toLowerCase();
    const cBdg = CAT_BADGE[cat] || { bg: 'var(--bg-secondary)', color: 'var(--text-muted)', border: 'var(--border)' };
    const lBdg = LVL_BADGE[lvl] || { bg: 'var(--bg-secondary)', color: 'var(--text-muted)', border: 'var(--border)' };
    const students = course.enrolledStudents?.length ?? 0;
    const date = course.createdAt
        ? new Date(course.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '2.5fr 140px 120px 100px 120px 220px',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: '1px solid var(--border)',
                background: hover ? 'var(--bg-hover)' : 'transparent',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* COURS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, minWidth: 0, transition: 'transform 0.25s', transform: hover ? 'scale(1.02)' : 'none' }}>
                <div style={{ transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', transform: hover ? 'scale(1.08) rotate(3deg)' : 'none' }}>
                    <CourseIcon title={course.title} index={index} />
                </div>
                <div style={{ minWidth: 0, textAlign: 'center' }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                        {course.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 600 }}>{course.instructor?.name || '—'}</span>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-strong)' }} />
                        <span>{date}</span>
                    </div>
                </div>
            </div>

            {/* CATÉGORIE */}
            <div style={{ display: 'flex', justifyContent: 'center' }}><Bdg label={course.category || 'Général'} {...cBdg} /></div>

            {/* NIVEAU */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {course.level
                    ? <Bdg label={course.level} {...lBdg} />
                    : <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>—</span>
                }
            </div>

            {/* ÉTUDIANTS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                <Users size={16} style={{ color: 'var(--text-muted)', transition: 'color 0.2s', color: hover ? 'var(--text-primary)' : 'var(--text-muted)' }} />
                <span style={{ fontWeight: 700 }}>{students}</span>
            </div>

            {/* STATUT */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {course.isPublished
                    ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(34,197,94,0.1)', borderRadius: 20, border: '1px solid rgba(34,197,94,0.2)' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} /><span style={{ fontSize: 12, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Publié</span></div>
                    : <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(245,158,11,0.1)', borderRadius: 20, border: '1px solid rgba(245,158,11,0.2)' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} /><span style={{ fontSize: 12, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Brouillon</span></div>
                }
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', justifyContent: 'center', transition: 'opacity 0.2s', opacity: hover ? 1 : 0.6 }}>
                {isEnrolled ? (
                    <button onClick={() => router.push(`/courses/${course._id}`)} style={{
                        padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: 'var(--accent)', color: '#fff',
                        border: 'none', display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(34,197,94,0.3)'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(34,197,94,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(34,197,94,0.3)'; }}
                    >
                        <Play size={13} fill="currentColor" /> Continuer
                    </button>
                ) : isRequested ? (
                    <span style={{
                        padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: 'rgba(245,158,11,0.1)', color: '#d97706',
                        border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <Clock size={13} /> En attente
                    </span>
                ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => onEnroll(course._id)} disabled={isEnrolling} style={{
                            padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                            background: 'var(--bg-card)', color: 'var(--text-primary)',
                            border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: isEnrolling ? 'wait' : 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                        }}
                            onMouseEnter={e => { if (!isEnrolling) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(34,197,94,0.15)'; } }}
                            onMouseLeave={e => { if (!isEnrolling) { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)'; } }}
                        >
                            {isEnrolling ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                            {isEnrolling ? '…' : 'Ouvrir'}
                        </button>
                        <button onClick={() => onRequest(course._id)} disabled={isRequesting} title="Demander l'accès" style={{
                            padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                            background: 'var(--bg-card)', color: 'var(--text-primary)',
                            border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: isRequesting ? 'wait' : 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                        }}
                            onMouseEnter={e => { if (!isRequesting) { e.currentTarget.style.borderColor = '#fbbf24'; e.currentTarget.style.color = '#d97706'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,158,11,0.15)'; } }}
                            onMouseLeave={e => { if (!isRequesting) { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)'; } }}
                        >
                            {isRequesting ? <Loader2 size={13} className="animate-spin" /> : <SendHorizonal size={13} />}
                            Demander
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
        color: 'var(--text-primary)', borderRadius: 8, fontSize: 13, outline: 'none',
    };
    const selStyle = {
        ...inputStyle, padding: '9px 32px 9px 12px',
        cursor: 'pointer', appearance: 'none', minWidth: 150,
        color: 'var(--text-secondary)',
    };

    return (
        <Sidebar>
            <div style={{ maxWidth: 1150, margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
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
                            padding: '10px 20px', borderRadius: 12,
                            fontSize: 14, fontWeight: 700,
                            color: '#fff',
                            background: 'linear-gradient(135deg, #059669, #22c55e)',
                            border: 'none', cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(34,197,94,0.35)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(34,197,94,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <KeyRound size={16} /> Rejoindre avec un code
                    </button>
                </div>

                {/* ── Filters ── */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            type="text" placeholder="Rechercher un cours, instructeur…"
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ ...inputStyle, width: '100%', padding: '9px 12px 9px 36px' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...selStyle, minWidth: 165 }}>
                            <option value="">Toutes catégories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select value={filterLvl} onChange={e => setFilterLvl(e.target.value)} style={{ ...selStyle, minWidth: 140 }}>
                            <option value="">Tous niveaux</option>
                            {levels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                        </select>
                        <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    </div>
                    {(search || filterCat || filterLvl) && (
                        <button onClick={() => { setSearch(''); setFilterCat(''); setFilterLvl(''); }} style={{
                            padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                            background: 'var(--danger-bg)', color: 'var(--danger)',
                            border: '1px solid var(--danger)', cursor: 'pointer',
                        }}>
                            Réinitialiser
                        </button>
                    )}
                </div>

                {/* ── Table Container ── */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 12px 40px -12px rgba(0,0,0,0.08)',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2.5fr 140px 120px 100px 120px 220px',
                        padding: '16px 24px',
                        background: 'rgba(0,0,0,0.02)',
                        borderBottom: '1px solid var(--border-strong)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        {['COURS', 'CATÉGORIE', 'NIVEAU', 'ÉTUDIANTS', 'STATUT', 'ACTIONS'].map((h, idx) => (
                            <span key={idx} style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: '#475569',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                textAlign: 'center'
                            }}>{h}</span>
                        ))}
                    </div>

                    {/* Rows */}
                    {loading ? (
                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)', margin: '0 auto 10px', display: 'block' }} />
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Chargement…</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                            <BookOpen size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Aucun cours trouvé</p>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Modifiez vos filtres</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {filtered.map((course, i) => (
                                <CourseRow
                                    key={course._id} course={course} index={i}
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
