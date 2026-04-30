'use client';
import { useEffect, useState, useCallback } from 'react';
import { coursesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import {
    Plus, BookOpen, Users, Edit3, Trash2, ArrowRight,
    Eye, EyeOff, CheckCircle, GraduationCap, FileText, Loader2,
    Activity, ChevronDown, Sparkles, Copy, KeyRound
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS — CSS vars (Emerald Dark glassmorphism)
═══════════════════════════════════════════════════════════════════════════ */
const T = {
    card: {
        bg: 'var(--bg-card)',
        border: '1.5px solid var(--border-strong)',
        radius: '14px',
        shadow: '0 2px 10px rgba(0,0,0,0.12), 0 4px 24px rgba(0,0,0,0.10)',
        shadowHover: '0 8px 32px rgba(0,0,0,0.16), 0 2px 10px rgba(0,0,0,0.10)',
    },
    text: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        accent: 'var(--accent)',
    },
};

/* ─── Section label ──────────────────────────────────────────────────── */
function SectionLabel({ children }) {
    return (
        <p style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: T.text.muted, marginBottom: 10,
        }}>
            {children}
        </p>
    );
}

/* ─── Stat Card ──────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, iconColor, iconBg, growth }) {
    return (
        <div
            className="group cursor-default"
            style={{
                background: T.card.bg,
                border: T.card.border,
                borderRadius: T.card.radius,
                boxShadow: T.card.shadow,
                padding: '16px 18px',
                transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = T.card.shadowHover;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = T.card.shadow;
            }}
        >
            <div className="flex items-center gap-3">
                <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                        width: 38, height: 38, borderRadius: 9,
                        background: iconBg,
                        border: `1px solid ${iconColor}18`,
                    }}
                >
                    <Icon className="w-[17px] h-[17px]" style={{ color: iconColor }} />
                </div>
                <div className="min-w-0 flex-1">
                    <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, color: T.text.primary, letterSpacing: '-0.02em' }}>
                        {value ?? '—'}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 500, color: T.text.secondary, marginTop: 2 }}>{label}</p>
                </div>
                {growth && (
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#4ade80', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>↑</span> {growth} ce mois
                    </p>
                )}
                {sub && !growth && (
                    <p style={{ fontSize: 12, color: T.text.muted, marginTop: 4 }}>{sub}</p>
                )}
            </div>
        </div>
    );
}

/* ─── Mini Chart ─────────────────────────────────────────────────────── */
function MiniChart({ data }) {
    const max = 2.5;
    const w = 520, h = 170, padL = 36, padR = 16, padT = 10, padB = 30;
    const chartW = w - padL - padR, chartH = h - padT - padB;

    const pts = data.map((v, i) => ({
        x: padL + (i / (data.length - 1)) * chartW,
        y: padT + chartH - (v / max) * chartH
    }));

    function smooth(points) {
        if (points.length < 2) return '';
        const t = 0.3;
        let d = `M${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(0, i - 1)], p1 = points[i];
            const p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
            d += ` C${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t},${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
        }
        return d;
    }

    const line = smooth(pts);
    const area = line + ` L${pts[pts.length - 1].x},${padT + chartH} L${pts[0].x},${padT + chartH} Z`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet" style={{ height: 190 }}>
            <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </linearGradient>
            </defs>
            {[0, 0.5, 1, 1.5, 2, 2.5].map((v, i) => {
                const y = padT + chartH - (v / max) * chartH;
                return <g key={i}><line x1={padL} y1={y} x2={w - padR} y2={y} stroke="var(--border)" strokeWidth="1" /><text x={padL - 10} y={y + 3.5} textAnchor="end" fontSize="10" fill="var(--text-muted)">{v}</text></g>;
            })}
            {['15 Mai', '20 Mai', '25 Mai', '30 Mai', '4 Jun', '9 Jun', '14 Jun'].map((l, i) => (
                <text key={i} x={padL + (i / 6) * chartW} y={h - 6} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{l}</text>
            ))}
            <path d={area} fill="url(#cg)" />
            <path d={line} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#22c55e" stroke="rgba(34,197,94,0.3)" strokeWidth="4" />)}
        </svg>
    );
}

/* ─── Pill Button ────────────────────────────────────────────────────── */
function PillButton({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-1 transition-all duration-150"
            style={{
                padding: '5px 10px', borderRadius: 6,
                fontSize: 11, fontWeight: 500,
                color: T.text.secondary,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
            {children}
        </button>
    );
}

export default function InstructorDashboard() {
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const { user } = useAuthStore();

    const load = useCallback(() => {
        if (!user) return;
        coursesAPI.getMyCourses()
            .then(({ data }) => {
                setCourses(data.courses);
                setStats(data.stats);
            })
            .catch(() => toast.error('Erreur chargement'))
            .finally(() => setLoading(false));
    }, [user]);

    useEffect(() => { load(); }, [load]);

    const deleteCourse = async (courseId) => {
        if (!confirm('Supprimer ce cours ? Cette action est irréversible.')) return;
        setDeletingId(courseId);
        try {
            await coursesAPI.delete(courseId);
            toast.success('Cours supprimé');
            load();
        } catch { toast.error('Erreur suppression'); }
        finally { setDeletingId(null); }
    };

    const chartData = [0, 0, 0, 0.8, 1.05, 1.05, 2, 2];

    const sectionCard = {
        background: T.card.bg,
        border: T.card.border,
        borderRadius: T.card.radius,
        boxShadow: T.card.shadow,
        padding: '18px 20px',
    };

    return (
        <Sidebar>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                {/* ── Header ── */}
                <div style={{ marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text.primary, letterSpacing: '-0.02em' }}>
                        Tableau de bord Instructeur
                    </h1>
                    <p style={{ fontSize: 13, color: T.text.muted, marginTop: 3 }}>
                        Vue d&apos;ensemble de vos cours et performances
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} style={{ height: 76, borderRadius: T.card.radius, background: '#e5e7eb' }} className="animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* ── Stats Section ── */}
                        <div style={{ marginBottom: 24 }}>
                            <SectionLabel>Statistiques clés</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                                <StatCard icon={BookOpen} label="Mes cours" value={stats?.totalCourses} iconColor="var(--icon-courses)" iconBg="var(--icon-courses-bg)" />
                                <StatCard icon={CheckCircle} label="Publiés" value={stats?.publishedCourses} iconColor="var(--icon-published)" iconBg="var(--icon-published-bg)" />
                                <StatCard icon={Users} label="Étudiants" value={stats?.totalStudents} iconColor="var(--icon-students)" iconBg="var(--icon-students-bg)" growth="+12" />
                                <StatCard icon={FileText} label="Leçons" value={stats?.totalLessons} iconColor="var(--icon-lessons)" iconBg="var(--icon-lessons-bg)" />
                            </div>
                        </div>

                        {/* ── Divider ── */}
                        <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: 24 }} />

                        {/* ── Analytics & Cours Section ── */}
                        <div style={{ marginBottom: 24 }}>
                            <SectionLabel>Activité &amp; Cours</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14 }}>
                                {/* Chart */}
                                <div style={sectionCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div>
                                            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Activity style={{ width: 15, height: 15, color: T.text.accent }} />
                                                Évolution des inscriptions
                                            </h3>
                                            <p style={{ fontSize: 12, color: T.text.muted, marginTop: 2 }}>Inscriptions au cours des 30 derniers jours</p>
                                        </div>
                                        <PillButton>30 jours <ChevronDown style={{ width: 12, height: 12 }} /></PillButton>
                                    </div>
                                    <MiniChart data={chartData} />
                                </div>

                                {/* Cours récents */}
                                <div style={sectionCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                        <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <BookOpen style={{ width: 15, height: 15, color: T.text.muted }} />
                                            Vos cours récents
                                        </h3>
                                        <Link href="/instructor/courses"><PillButton>Voir tout</PillButton></Link>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {courses.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '20px 0', color: T.text.muted, fontSize: 13 }}>
                                                Aucun cours créé
                                            </div>
                                        ) : courses.slice(0, 3).map((c) => (
                                            <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', background: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--icon-courses-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <BookOpen style={{ width: 18, height: 18, color: 'var(--icon-courses)' }} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h4 style={{ fontSize: 13, fontWeight: 600, color: T.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                                        <span style={{ fontSize: 11, color: T.text.muted }}>{c.enrolledStudents?.length ?? 0} étudiants</span>
                                                        <span style={{ color: T.text.muted }}>•</span>
                                                        <span style={{ fontSize: 11, color: c.isPublished ? '#10b981' : '#f59e0b' }}>
                                                            {c.isPublished ? 'Publié' : 'Brouillon'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Enrollment code badge */}
                                                {c.enrollmentCode && (
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(c.enrollmentCode);
                                                            toast.success('Code copié !');
                                                        }}
                                                        title={`Code: ${c.enrollmentCode} — Cliquez pour copier`}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                                            padding: '4px 8px', borderRadius: 6,
                                                            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                                                            fontFamily: "'SF Mono', 'Fira Code', monospace",
                                                            background: 'rgba(34,197,94,0.1)',
                                                            color: '#22c55e',
                                                            border: '1px solid rgba(34,197,94,0.25)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s',
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; }}
                                                    >
                                                        <KeyRound style={{ width: 11, height: 11 }} />
                                                        {c.enrollmentCode}
                                                        <Copy style={{ width: 10, height: 10, opacity: 0.6 }} />
                                                    </button>
                                                )}
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <Link href={`/instructor/courses/${c._id}/edit`} style={{ padding: '6px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6 }}>
                                                        <Edit3 style={{ width: 14, height: 14, color: T.text.secondary }} />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Divider ── */}
                        <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: 24 }} />

                        {/* ── Welcome Banner ── */}
                        <div
                            style={{
                                display: 'flex', alignItems: 'center',
                                padding: '16px 20px', borderRadius: T.card.radius,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderLeft: '4px solid #10b981',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles style={{ width: 17, height: 17, color: '#10b981' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>Gérez vos cours comme un pro !</h3>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>EduAI vous offre tous les outils pour réussir.</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Sidebar>
    );
}
