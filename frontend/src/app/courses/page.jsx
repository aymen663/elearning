'use client';
import { useEffect, useState, useMemo } from 'react';
import { coursesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import { Search, BookOpen, Users, ChevronDown, Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/* ── Badge colors — rgba works in both dark & light ───────────────────── */
const CAT_BADGE = {
    'programmation':             { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
    'intelligence artificielle': { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
    'data science':              { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    'design':                    { bg: 'rgba(236,72,153,0.12)',  color: '#f472b6', border: 'rgba(236,72,153,0.3)' },
    'cybersécurité':             { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
    'développement web':         { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
    'développement':             { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
    'marketing':                 { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', border: 'rgba(251,146,60,0.3)' },
    'business':                  { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
};
const LVL_BADGE = {
    'débutant':      { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
    'intermédiaire': { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
    'avancé':        { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
};
const ICON_COLORS = [
    ['#3b82f6','#1d4ed8'], ['#8b5cf6','#6d28d9'], ['#ec4899','#be185d'],
    ['#f59e0b','#b45309'], ['#10b981','#047857'], ['#ef4444','#b91c1c'],
    ['#06b6d4','#0e7490'], ['#84cc16','#4d7c0f'],
];

/* ── Sub-components ────────────────────────────────────────────────────── */
function CourseIcon({ title, index }) {
    const [a, b] = ICON_COLORS[index % ICON_COLORS.length];
    return (
        <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${a}, ${b})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: '#fff',
            boxShadow: `0 3px 8px ${a}44`,
        }}>
            {title?.[0]?.toUpperCase() || '?'}
        </div>
    );
}

function Bdg({ label, bg, color, border }) {
    return (
        <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 6,
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
            background: bg, color, border: `1px solid ${border}`,
        }}>{label}</span>
    );
}

/* ── Table Row ─────────────────────────────────────────────────────────── */
function CourseRow({ course, index, enrolledIds, onEnroll, enrollingId }) {
    const [hover, setHover] = useState(false);
    const isEnrolled  = enrolledIds.has(course._id);
    const isEnrolling = enrollingId === course._id;
    const cat  = course.category?.toLowerCase();
    const lvl  = course.level?.toLowerCase();
    const cBdg = CAT_BADGE[cat]  || { bg: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', border: 'rgba(255,255,255,0.1)' };
    const lBdg = LVL_BADGE[lvl]  || { bg: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', border: 'rgba(255,255,255,0.1)' };
    const students = course.enrolledStudents?.length ?? 0;
    const date = course.createdAt
        ? new Date(course.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '2.5fr 140px 130px 90px 105px 115px 160px',
                alignItems: 'center',
                padding: '15px 20px',
                borderBottom: '1px solid var(--border)',
                background: hover ? 'var(--bg-hover)' : 'var(--bg-card)',
                transition: 'background 0.15s ease',
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* COURS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <CourseIcon title={course.title} index={index} />
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {course.title}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{course.instructor?.name || '—'}</p>
                </div>
            </div>

            {/* CATÉGORIE */}
            <div><Bdg label={course.category || '—'} {...cBdg} /></div>

            {/* NIVEAU */}
            <div>
                {course.level
                    ? <Bdg label={course.level.charAt(0).toUpperCase() + course.level.slice(1)} {...lBdg} />
                    : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                }
            </div>

            {/* ÉTUDIANTS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}>
                <Users size={14} style={{ color: 'var(--text-muted)' }} />{students}
            </div>

            {/* STATUT */}
            <div>
                {course.isPublished
                    ? <Bdg label="● Publié"    bg="var(--success-bg)" color="var(--success)" border="rgba(34,197,94,0.3)" />
                    : <Bdg label="● Brouillon" bg="var(--warning-bg)" color="var(--warning)" border="rgba(251,191,36,0.3)" />
                }
            </div>

            {/* CRÉÉ LE */}
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{date}</div>

            {/* ACTIONS */}
            <div>
                {isEnrolled ? (
                    <Link href={`/courses/${course._id}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: 'var(--accent-dim)', color: 'var(--accent)',
                        border: '1px solid var(--accent)', textDecoration: 'none',
                        whiteSpace: 'nowrap', transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    >
                        <Play size={11} /> Continuer
                    </Link>
                ) : (
                    <button onClick={() => onEnroll(course._id)} disabled={isEnrolling} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: 'var(--accent-dim)', color: 'var(--accent)',
                        border: '1px solid var(--accent)',
                        whiteSpace: 'nowrap', cursor: isEnrolling ? 'wait' : 'pointer', transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { if (!isEnrolling) { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    >
                        {isEnrolling
                            ? <><Loader2 size={11} className="animate-spin" /> Inscription…</>
                            : <><Play size={11} /> Ouvrir le cours</>
                        }
                    </button>
                )}
            </div>
        </div>
    );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function CoursesListPage() {
    const { user } = useAuthStore();
    const router   = useRouter();
    const [courses, setCourses]         = useState([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [filterCat, setFilterCat]     = useState('');
    const [filterLvl, setFilterLvl]     = useState('');
    const [enrolledIds, setEnrolledIds] = useState(new Set());
    const [enrollingId, setEnrollingId] = useState(null);

    useEffect(() => {
        if (user?.role === 'admin')      router.replace('/admin');
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

    const categories = useMemo(() => [...new Set(courses.map(c => c.category).filter(Boolean))], [courses]);
    const levels     = useMemo(() => [...new Set(courses.map(c => c.level).filter(Boolean))],    [courses]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return courses.filter(c => {
            if (q && !c.title?.toLowerCase().includes(q) && !c.instructor?.name?.toLowerCase().includes(q)) return false;
            if (filterCat && c.category !== filterCat) return false;
            if (filterLvl && c.level     !== filterLvl) return false;
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
            else toast.error(msg || "Erreur lors de l'inscription");
        } finally { setEnrollingId(null); }
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
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                        Liste de cours
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                        {loading ? '…' : `${filtered.length} cours disponibles`}
                    </p>
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

                {/* ── Table ── */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: 'var(--card-shadow)',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2.5fr 140px 130px 90px 105px 115px 160px',
                        padding: '10px 20px',
                        background: 'var(--bg-secondary)',
                        borderBottom: '1px solid var(--border-strong)',
                    }}>
                        {['COURS', 'CATÉGORIE', 'NIVEAU', 'ÉTUDIANTS', 'STATUT', 'CRÉÉ LE', 'ACTIONS'].map(h => (
                            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</span>
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
                        filtered.map((course, i) => (
                            <CourseRow
                                key={course._id} course={course} index={i}
                                enrolledIds={enrolledIds} onEnroll={handleEnroll} enrollingId={enrollingId}
                            />
                        ))
                    )}
                </div>
            </div>
        </Sidebar>
    );
}
