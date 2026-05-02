'use client';
import { useEffect, useState } from 'react';
import { progressAPI, studentAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import {
    BookOpen, CheckCircle, TrendingUp, Trophy,
    ArrowRight, Zap, Brain, Activity, ChevronDown,
    GraduationCap, Star, Sparkles, Target
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import CardLoader from '@/components/ui/CardLoader';

/* ── Design tokens — same as admin ─────────────────────────────────────── */
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

/* ── Section Label ──────────────────────────────────────────────────────── */
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

/* ── Stat Card — mirrors admin exactly ─────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, iconColor, iconBg, growth }) {
    return (
        <div
            style={{
                background: T.card.bg, border: T.card.border,
                borderRadius: T.card.radius, boxShadow: T.card.shadow,
                padding: '16px 18px', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = T.card.shadowHover; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = T.card.shadow; }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: iconBg, border: `1px solid ${iconColor}25`,
                }}>
                    <Icon style={{ width: 17, height: 17, color: iconColor }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, color: T.text.primary, letterSpacing: '-0.02em' }}>
                        {value ?? '—'}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 500, color: T.text.secondary, marginTop: 2 }}>{label}</p>
                </div>
                {growth && (
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                        <span>↑</span> {growth} ce mois
                    </p>
                )}
                {sub && !growth && (
                    <p style={{ fontSize: 12, color: T.text.muted, flexShrink: 0 }}>{sub}</p>
                )}
            </div>
        </div>
    );
}

/* ── Activity Item — same as admin ─────────────────────────────────────── */
function ActivityItem({ icon: Icon, color, title, desc, time, isLast }) {
    return (
        <div
            style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 8px',
                borderBottom: isLast ? 'none' : '1px solid var(--border)',
                margin: '0 -8px', transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: color + '12', border: `1px solid ${color}20`,
            }}>
                <Icon style={{ width: 13, height: 13, color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: T.text.primary }}>{title}</p>
                <p style={{ fontSize: 11, color: T.text.muted, marginTop: 1 }}>{desc}</p>
            </div>
            <p style={{ fontSize: 10, color: T.text.muted, fontWeight: 500, flexShrink: 0, paddingTop: 2 }}>{time}</p>
        </div>
    );
}

/* ── Progress Mini Chart ────────────────────────────────────────────────── */
function ProgressChart({ data }) {
    const max = Math.max(...data, 1);
    const w = 520, h = 170, padL = 36, padR = 16, padT = 10, padB = 30;
    const chartW = w - padL - padR, chartH = h - padT - padB;
    const pts = data.map((v, i) => ({
        x: padL + (i / Math.max(data.length - 1, 1)) * chartW,
        y: padT + chartH - (v / max) * chartH,
    }));
    function smooth(points) {
        if (points.length < 2) return `M${points[0]?.x ?? 0},${points[0]?.y ?? 0}`;
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
    const area = pts.length > 1 ? line + ` L${pts[pts.length - 1].x},${padT + chartH} L${pts[0].x},${padT + chartH} Z` : '';
    const gridVals = [0, 25, 50, 75, 100];
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet" style={{ height: 190 }}>
            <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </linearGradient>
            </defs>
            {gridVals.map((v, i) => {
                const y = padT + chartH - (v / 100) * chartH;
                return <g key={i}><line x1={padL} y1={y} x2={w - padR} y2={y} stroke="var(--border)" strokeWidth="1" /><text x={padL - 10} y={y + 3.5} textAnchor="end" fontSize="10" fill="var(--text-muted)">{v}%</text></g>;
            })}
            {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7'].map((l, i) => (
                <text key={i} x={padL + (i / 6) * chartW} y={h - 6} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{l}</text>
            ))}
            {area && <path d={area} fill="url(#pg)" />}
            <path d={line} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#22c55e" stroke="rgba(34,197,94,0.3)" strokeWidth="4" />)}
        </svg>
    );
}

/* ── Pill Button ────────────────────────────────────────────────────────── */
function PillButton({ children }) {
    return (
        <button style={{
            padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
            color: T.text.secondary, border: '1px solid var(--border)', background: T.card.bg,
            display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'default',
        }}>
            {children}
        </button>
    );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
    const { user } = useAuthStore();
    const [progress, setProgress] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        Promise.all([progressAPI.getMyProgress(), studentAPI.getStats()])
            .then(([progRes, statsRes]) => {
                setProgress(progRes.data.progress || []);
                setStats(statsRes.data.stats);
            })
            .catch(() => toast.error('Erreur chargement'))
            .finally(() => setLoading(false));
    }, [user]);

    const inProgress = progress.filter(p => p.completionPercentage > 0 && p.completionPercentage < 100);
    const completed = progress.filter(p => p.completionPercentage === 100);

    /* Build chart data from progress percentages */
    const chartData = progress.length
        ? [0, ...progress.slice(-6).map(p => p.completionPercentage)]
        : [0, 0, 10, 25, 40, 55, 70];

    const sectionCard = {
        background: T.card.bg, border: T.card.border,
        borderRadius: T.card.radius, boxShadow: T.card.shadow,
        padding: '18px 20px',
    };

    return (
        <Sidebar>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text.primary, letterSpacing: '-0.02em' }}>
                        Mon espace
                    </h1>
                    <p style={{ fontSize: 13, color: T.text.muted, marginTop: 3 }}>
                        Suivez votre progression et continuez votre apprentissage
                    </p>
                </div>

                {loading ? (
                    <div style={{ padding: '40px 0' }}>
                        <CardLoader />
                    </div>
                ) : (
                    <>
                        {/* ── Statistiques Clés ── */}
                        <div style={{ marginBottom: 24 }}>
                            <SectionLabel>Statistiques clés</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                                <StatCard
                                    icon={GraduationCap} label="Cours inscrits"
                                    value={stats?.totalCourses ?? progress.length}
                                    iconColor="var(--accent)" iconBg="var(--success-bg)"
                                    growth={progress.length > 0 ? `${progress.length}` : undefined}
                                />
                                <StatCard
                                    icon={CheckCircle} label="Cours terminés"
                                    value={stats?.completedCourses ?? completed.length}
                                    iconColor="#059669" iconBg="rgba(5,150,105,0.1)"
                                    sub={completed.length > 0 ? `${completed.length} complétés` : 'En progression'}
                                />
                                <StatCard
                                    icon={TrendingUp} label="Progression moy."
                                    value={`${stats?.averageCompletion ?? 0}%`}
                                    iconColor="#f59e0b" iconBg="rgba(245,158,11,0.1)"
                                    growth={stats?.averageCompletion > 0 ? `${stats.averageCompletion}%` : undefined}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                <StatCard
                                    icon={Trophy} label="Score quiz moy."
                                    value={`${stats?.avgScore ?? 0}%`}
                                    iconColor="#a855f7" iconBg="rgba(168,85,247,0.1)"
                                    sub={`${stats?.totalQuizAttempts ?? 0} tentative(s)`}
                                />
                                <StatCard
                                    icon={Brain} label="Quiz complétés"
                                    value={stats?.totalQuizAttempts ?? 0}
                                    iconColor="#6366f1" iconBg="rgba(99,102,241,0.1)"
                                    growth={stats?.totalQuizAttempts > 0 ? `${stats.totalQuizAttempts}` : undefined}
                                />
                                <StatCard
                                    icon={Star} label="Cours en cours"
                                    value={inProgress.length}
                                    iconColor="#db2777" iconBg="rgba(219,39,119,0.1)"
                                    sub={inProgress.length > 0 ? 'continuez !' : 'Inscrivez-vous'}
                                />
                            </div>
                        </div>

                        {/* ── Divider ── */}
                        <div style={{ borderTop: '1px solid var(--border)', marginBottom: 24 }} />

                        {/* ── Analytics & Activité ── */}
                        <div style={{ marginBottom: 24 }}>
                            <SectionLabel>Analytics &amp; Activité</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14 }}>
                                {/* Chart */}
                                <div style={sectionCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div>
                                            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Activity style={{ width: 15, height: 15, color: T.text.accent }} />
                                                Progression des cours
                                            </h3>
                                            <p style={{ fontSize: 12, color: T.text.muted, marginTop: 2 }}>Évolution de votre apprentissage</p>
                                        </div>
                                        <PillButton>30 jours <ChevronDown style={{ width: 12, height: 12 }} /></PillButton>
                                    </div>
                                    <ProgressChart data={chartData} />
                                </div>

                                {/* Activity */}
                                <div style={sectionCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                        <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Zap style={{ width: 15, height: 15, color: T.text.muted }} />
                                            Activité récente
                                        </h3>
                                        <Link href="/courses" style={{ fontSize: 11, color: T.text.accent, textDecoration: 'none', fontWeight: 600 }}>
                                            Voir tout
                                        </Link>
                                    </div>
                                    {progress.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '20px 0', color: T.text.muted, fontSize: 13 }}>
                                            Aucune activité récente
                                        </div>
                                    ) : (
                                        progress.slice(0, 4).map((p, i) => (
                                            <ActivityItem
                                                key={p._id}
                                                icon={p.completionPercentage === 100 ? CheckCircle : BookOpen}
                                                color={p.completionPercentage === 100 ? '#059669' : '#6366f1'}
                                                title={p.course?.title || 'Cours'}
                                                desc={`${p.completionPercentage}% complété — ${p.completedLessons?.length ?? 0} leçon(s)`}
                                                time={`${p.completionPercentage}%`}
                                                isLast={i === Math.min(progress.length - 1, 3)}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Divider ── */}
                        <div style={{ borderTop: '1px solid var(--border)', marginBottom: 24 }} />

                        {/* ── Welcome Banner ── */}
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            padding: '16px 20px', borderRadius: T.card.radius,
                            background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))',
                            border: '1px solid rgba(34,197,94,0.22)',
                            backdropFilter: 'blur(6px)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles style={{ width: 17, height: 17, color: '#059669' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                                        {progress.length > 0 ? 'Continuez votre apprentissage !' : 'Bienvenue sur EduAI !'}
                                    </h3>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
                                        {progress.length > 0
                                            ? `${inProgress.length} cours en cours — ${completed.length} terminé(s)`
                                            : 'Inscrivez-vous à votre premier cours et commencez dès maintenant'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Sidebar>
    );
}
