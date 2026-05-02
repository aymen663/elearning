'use client';
import { useEffect, useState } from 'react';
import { coursesAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { BarChart2, Users, CheckCircle, TrendingUp, BookOpen, Loader2, ArrowLeft, Activity, ChevronDown, Trophy, PieChart, Star } from 'lucide-react';
import CardLoader from '@/components/ui/CardLoader';
import Link from 'next/link';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS — CSS vars (Emerald Dark glassmorphism)
═══════════════════════════════════════════════════════════════════════════ */
const T = {
    card: {
        bg:          'var(--bg-card)',
        border:      '1.5px solid var(--border-strong)',
        radius:      '14px',
        shadow:      '0 2px 10px rgba(0,0,0,0.12), 0 4px 24px rgba(0,0,0,0.10)',
        shadowHover: '0 8px 32px rgba(0,0,0,0.16), 0 2px 10px rgba(0,0,0,0.10)',
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
                        <span>↑</span> {growth}
                    </p>
                )}
                {sub && !growth && (
                    <p style={{ fontSize: 12, color: T.text.muted, flexShrink: 0 }}>{sub}</p>
                )}
            </div>
        </div>
    );
}

/* ─── Mini Chart ─────────────────────────────────────────────────────── */
function MiniChart({ data }) {
    const max = Math.max(...data, 1);
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
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet" style={{ height: 220 }}>
            <defs>
                <linearGradient id="cgAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
            </defs>
            {[0, 0.5, 1, 1.5, 2].map((v, i) => {
                const step = max / 2;
                const val = (v * step).toFixed(1);
                const y = padT + chartH - (v / 2) * chartH;
                return <g key={i}><line x1={padL} y1={y} x2={w - padR} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" /><text x={padL - 10} y={y + 3.5} textAnchor="end" fontSize="10" fill="var(--text-muted)">{val}</text></g>;
            })}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((l, i) => (
                <text key={i} x={padL + (i / 6) * chartW} y={h - 6} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{l}</text>
            ))}
            <path d={area} fill="url(#cgAnalytics)" />
            <path d={line} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#1e1e2f" stroke="#8b5cf6" strokeWidth="2.5" />)}
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
                padding: '6px 12px', borderRadius: 20,
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                color: T.text.secondary,
                border: '1px solid var(--border)',
                background: 'var(--bg-body)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = T.text.primary; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-body)'; e.currentTarget.style.color = T.text.secondary; }}
        >
            {children}
        </button>
    );
}


export default function InstructorAnalyticsPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        coursesAPI.getMyCourses()
            .then(({ data }) => setCourses(data.courses || []))
            .catch(() => toast.error('Erreur chargement'))
            .finally(() => setLoading(false));
    }, []);

    const totalStudents = courses.reduce((a, c) => a + (c.enrolledStudents?.length || 0), 0);
    const totalPublished = courses.filter((c) => c.isPublished).length;
    const avgStudents = courses.length ? Math.round(totalStudents / courses.length) : 0;

    const topCourse = courses.length > 0 ? [...courses].sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0))[0] : null;

    const categoryCounts = courses.reduce((acc, c) => {
        const cat = c.category || 'Non catégorisé';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});
    const categories = Object.entries(categoryCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    const engagementData = [2.1, 2.5, 3.8, 3.2, 4.5, 4.0, 5.2]; // Fake weekly engagement data

    return (
        <Sidebar>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                {/* ── Header ── */}
                <div style={{ marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/instructor" className="btn-ghost px-3 py-2" style={{ border: '1px solid var(--border)', borderRadius: 8 }}>
                        <ArrowLeft className="w-4 h-4" style={{ color: T.text.primary }} />
                    </Link>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text.primary, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart2 style={{ width: 22, height: 22, color: 'var(--icon-lessons)' }} /> Analytics instructeur
                        </h1>
                        <p style={{ fontSize: 13, color: T.text.muted, marginTop: 3 }}>
                            Performance approfondie et données démographiques
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px 0' }}>
                        <CardLoader />
                    </div>
                ) : (
                    <>
                        {/* ── Stats Section ── */}
                        <div style={{ marginBottom: 24 }}>
                            <SectionLabel>Résumé global</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                <StatCard icon={BookOpen} label="Cours total" value={courses.length} iconColor="var(--icon-courses)" iconBg="var(--icon-courses-bg)" />
                                <StatCard icon={CheckCircle} label="Publiés" value={totalPublished} iconColor="var(--icon-published)" iconBg="var(--icon-published-bg)" />
                                <StatCard icon={Users} label="Étudiants total" value={totalStudents} iconColor="var(--icon-students)" iconBg="var(--icon-students-bg)" growth="+5%" />
                                <StatCard icon={TrendingUp} label="Moy. étudiants/cours" value={avgStudents} iconColor="var(--icon-lessons)" iconBg="var(--icon-lessons-bg)" />
                            </div>
                        </div>

                        {/* ── Divider ── */}
                        <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: 24 }} />

                        {/* ── Deep Analytics Section ── */}
                        <div style={{ marginBottom: 24 }}>
                            <SectionLabel>Engagement des étudiants</SectionLabel>
                            
                            {/* Engagement Chart Full Width */}
                            <div style={{ background: T.card.bg, border: T.card.border, borderRadius: T.card.radius, boxShadow: T.card.shadow, padding: '24px', marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                    <div>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text.primary, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Activity style={{ width: 18, height: 18, color: '#8b5cf6' }} />
                                            Heures d'apprentissage
                                        </h3>
                                        <p style={{ fontSize: 13, color: T.text.muted, marginTop: 4 }}>Volume d'activité de vos étudiants sur les 7 derniers jours</p>
                                    </div>
                                    <PillButton>Cette semaine <ChevronDown style={{ width: 12, height: 12 }} /></PillButton>
                                </div>
                                <MiniChart data={engagementData} />
                            </div>

                            <SectionLabel>Répartition &amp; Tendances</SectionLabel>
                            {/* Top Course & Categories Side by Side */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                                
                                {/* Top Course */}
                                <div style={{ background: T.card.bg, border: T.card.border, borderRadius: T.card.radius, boxShadow: T.card.shadow, padding: '20px' }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text.primary, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                                        <Trophy style={{ width: 16, height: 16, color: '#f59e0b' }} />
                                        Cours le plus performant
                                    </h3>
                                    {topCourse ? (
                                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                            <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Star style={{ width: 24, height: 24, color: '#f59e0b' }} />
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <h4 style={{ fontSize: 14, fontWeight: 700, color: T.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topCourse.title}</h4>
                                                <p style={{ fontSize: 13, color: T.text.secondary, marginTop: 2 }}>{topCourse.enrolledStudents?.length || 0} étudiants inscrits</p>
                                            </div>
                                            <Link href={`/instructor/courses/${topCourse._id}/students`} style={{ padding: '8px 12px', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, fontWeight: 600, color: T.text.primary, transition: 'background 0.15s' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-body)'; }}>
                                                Voir
                                            </Link>
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: 13, color: T.text.muted }}>Pas encore de données</p>
                                    )}
                                </div>

                                {/* Categories Distribution */}
                                <div style={{ background: T.card.bg, border: T.card.border, borderRadius: T.card.radius, boxShadow: T.card.shadow, padding: '20px' }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text.primary, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                                        <PieChart style={{ width: 16, height: 16, color: 'var(--icon-published)' }} />
                                        Répartition par catégorie
                                    </h3>
                                    {categories.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {categories.slice(0, 3).map((cat, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: 13, fontWeight: 500, color: T.text.secondary, textTransform: 'capitalize' }}>{cat.name}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 80, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${(cat.count / courses.length) * 100}%`, background: 'var(--icon-published)' }} />
                                                        </div>
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: T.text.primary, width: 30, textAlign: 'right' }}>{Math.round((cat.count / courses.length) * 100)}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: 13, color: T.text.muted }}>Aucune donnée</p>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* ── Divider ── */}
                        <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: 24 }} />

                        {/* ── Courses Performance Section ── */}
                        <div style={{ marginBottom: 24 }}>
                            <SectionLabel>Détails par cours</SectionLabel>
                            
                            {courses.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', background: T.card.bg, borderRadius: T.card.radius, border: T.card.border }}>
                                    <p style={{ color: T.text.muted, marginBottom: 16 }}>Aucun cours créé</p>
                                    <Link href="/instructor/courses/new" className="btn-primary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                                        Créer un cours
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                                    {courses.map((course) => {
                                        const enrolled = course.enrolledStudents?.length || 0;
                                        const maxStudents = Math.max(...courses.map((c) => c.enrolledStudents?.length || 0), 1);
                                        const barWidth = Math.round((enrolled / maxStudents) * 100);

                                        return (
                                            <div 
                                                key={course._id} 
                                                style={{ 
                                                    background: T.card.bg, border: T.card.border, 
                                                    borderRadius: T.card.radius, boxShadow: T.card.shadow, 
                                                    padding: '20px', transition: 'all 0.15s ease',
                                                    display: 'flex', flexDirection: 'column'
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.boxShadow = T.card.shadowHover; }}
                                                onMouseLeave={e => { e.currentTarget.style.boxShadow = T.card.shadow; }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <h3 style={{ fontWeight: 600, color: T.text.primary, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</h3>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                                                            <span style={{ 
                                                                fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                                                                padding: '3px 8px', borderRadius: 'full', 
                                                                background: course.isPublished ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                                                                color: course.isPublished ? '#10b981' : '#f43f5e',
                                                            }}>
                                                                {course.isPublished ? 'Publié' : 'Brouillon'}
                                                            </span>
                                                            <span style={{ fontSize: 12, color: T.text.muted, textTransform: 'capitalize' }}>{course.category}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                        <p style={{ fontSize: 24, fontWeight: 700, color: T.text.primary, lineHeight: 1 }}>{enrolled}</p>
                                                        <p style={{ fontSize: 11, color: T.text.secondary, marginTop: 4 }}>étudiants</p>
                                                    </div>
                                                </div>

                                                <div style={{ marginBottom: 16, flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.text.muted, marginBottom: 6 }}>
                                                        <span>Inscriptions</span>
                                                        <span style={{ fontWeight: 500, color: T.text.secondary }}>{barWidth}% du max</span>
                                                    </div>
                                                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                                                        <div 
                                                            style={{ 
                                                                height: '100%', 
                                                                background: 'linear-gradient(90deg, var(--icon-lessons) 0%, #3b82f6 100%)', 
                                                                borderRadius: 4, transition: 'width 1s ease-out', width: `${barWidth}%` 
                                                            }} 
                                                        />
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                                    <Link href={`/instructor/courses/${course._id}/edit`}
                                                        style={{ flex: 1, textAlign: 'center', padding: '8px', fontSize: 12, fontWeight: 500, color: T.text.secondary, background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: 8, transition: 'all 0.15s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = T.text.primary; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-body)'; e.currentTarget.style.color = T.text.secondary; }}
                                                    >Éditer le cours</Link>
                                                    <Link href={`/instructor/courses/${course._id}/students`}
                                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', fontSize: 12, fontWeight: 500, color: T.text.secondary, background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: 8, transition: 'all 0.15s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = T.text.primary; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-body)'; e.currentTarget.style.color = T.text.secondary; }}
                                                    >
                                                        <Users style={{ width: 14, height: 14 }} /> Étudiants
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Sidebar>
    );
}
