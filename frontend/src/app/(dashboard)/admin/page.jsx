'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import { GraduationCap, BookOpen, Users, TrendingUp, Heart, ArrowUpRight, ArrowRight, Activity, UserPlus, FileEdit, Sparkles, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import CardLoader from '@/components/ui/CardLoader';

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS — CSS vars (Emerald Dark glassmorphism)
═══════════════════════════════════════════════════════════════════════════ */
const T = {
    card: {
        bg:          'var(--bg-card)',
        border:      '1px solid var(--border)',
        radius:      '14px',
        shadow:      'var(--card-shadow)',
        shadowHover: 'var(--card-shadow-hover)',
    },
    text: {
        primary:   'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted:     'var(--text-muted)',
        accent:    'var(--accent)',
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
                e.currentTarget.style.borderColor = 'var(--border-strong)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = T.card.shadow;
                e.currentTarget.style.borderColor = 'var(--border)';
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

/* ─── Activity Item ──────────────────────────────────────────────────── */
function ActivityItem({ icon: Icon, color, title, desc, time, isLast }) {
    return (
        <div
            className="flex items-start gap-2.5 transition-colors duration-100"
            style={{
                padding: '10px 8px',
                borderBottom: isLast ? 'none' : '1px solid var(--border)',
                margin: '0 -8px',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <div style={{
                width: 30, height: 30, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
                background: color + '12', border: `1px solid ${color}20`,
            }}>
                <Icon style={{ width: 13, height: 13, color }} />
            </div>
            <div className="flex-1 min-w-0">
                <p style={{ fontSize: 12, fontWeight: 600, color: T.text.primary }}>{title}</p>
                <p style={{ fontSize: 11, color: T.text.muted, marginTop: 1 }}>{desc}</p>
            </div>
            <p style={{ fontSize: 10, color: T.text.muted, fontWeight: 500, flexShrink: 0, paddingTop: 2 }}>{time}</p>
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

/* ═══════════════════════ Page ═══════════════════════════════════════════ */
export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) return;
        adminAPI.getStats()
            .then(({ data }) => setStats(data))
            .catch(() => toast.error('Impossible de charger les statistiques'))
            .finally(() => setLoading(false));
    }, [user]);

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
                        Tableau de bord
                    </h1>
                    <p style={{ fontSize: 13, color: T.text.muted, marginTop: 3 }}>
                        Vue d&apos;ensemble de la plateforme EduAI
                    </p>
                </div>

                {loading ? (
                    <div style={{ padding: '40px 0' }}>
                        <CardLoader />
                    </div>
                ) : (
                    <>
                        {/* ── Stats Section ── */}
                        <div style={{ marginBottom: 24 }}>
                            <SectionLabel>Statistiques clés</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                                <StatCard icon={Users}         label="Total utilisateurs" value={stats?.totalUsers}       iconColor="var(--accent)"         iconBg="var(--success-bg)"           growth="20.5%" />
                                <StatCard icon={GraduationCap} label="Professeurs"         value={stats?.totalInstructors} iconColor="var(--icon-published)"   iconBg="var(--icon-published-bg)"    growth="12.4%" />
                                <StatCard icon={UserPlus}      label="Étudiants"           value={stats?.totalStudents}    iconColor="var(--icon-students)"    iconBg="var(--icon-students-bg)"     growth="8.1%" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                <StatCard icon={BookOpen}   label="Cours total"   value={stats?.totalCourses}     iconColor="var(--icon-courses)"    iconBg="var(--icon-courses-bg)"     sub={`${stats?.publishedCourses ?? 0} publiés`} />
                                <StatCard icon={TrendingUp} label="Inscriptions"  value={stats?.totalEnrollments} iconColor="var(--icon-lessons)"    iconBg="var(--icon-lessons-bg)"     growth="15.3%" />
                                <StatCard icon={Heart}      label="Cours publiés" value={stats?.publishedCourses} iconColor="var(--icon-published)"  iconBg="var(--icon-published-bg)"   growth="100%" />
                            </div>
                        </div>

                        {/* ── Divider ── */}
                        <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: 24 }} />

                        {/* ── Analytics Section ── */}
                        <div style={{ marginBottom: 24 }}>
                            <SectionLabel>Analytics &amp; Activité</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14 }}>
                                {/* Chart */}
                                <div style={sectionCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div>
                                            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Activity style={{ width: 15, height: 15, color: T.text.accent }} />
                                                Statistiques des cours
                                            </h3>
                                            <p style={{ fontSize: 12, color: T.text.muted, marginTop: 2 }}>Évolution des cours publiés</p>
                                        </div>
                                        <PillButton>30 jours <ChevronDown style={{ width: 12, height: 12 }} /></PillButton>
                                    </div>
                                    <MiniChart data={chartData} />
                                </div>

                                {/* Activity */}
                                <div style={sectionCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                        <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <ArrowUpRight style={{ width: 15, height: 15, color: T.text.muted }} />
                                            Activité récente
                                        </h3>
                                        <PillButton>Voir tout</PillButton>
                                    </div>
                                    <div>
                                        <ActivityItem icon={UserPlus} color="#7c3aed" title="Nouveau professeur inscrit" desc="Dr. Sarah Johnson a rejoint la plateforme" time="Il y a 2h" />
                                        <ActivityItem icon={BookOpen} color="#059669" title="Nouveau cours publié" desc="Introduction à l'IA a été publié" time="Il y a 5h" />
                                        <ActivityItem icon={UserPlus} color="#2563eb" title="Nouvel étudiant inscrit" desc="Mike Wilson a rejoint la plateforme" time="Il y a 1j" />
                                        <ActivityItem icon={FileEdit} color="#db2777" title="Cours mis à jour" desc="Python Avancé a été mis à jour" time="Il y a 2j" isLast />
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
                                background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))',
                                border: '1px solid rgba(34,197,94,0.22)',
                                backdropFilter: 'blur(6px)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles style={{ width: 17, height: 17, color: '#059669' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>Bienvenue sur EduAI !</h3>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>Gérez votre plateforme éducative en toute simplicité</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Sidebar>
    );
}
