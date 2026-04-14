'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import { GraduationCap, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Lordicon icon sources (free CDN icons) ─── */
const ICONS = {
    users:    'https://cdn.lordicon.com/dxjqoygy.json',
    teacher:  'https://cdn.lordicon.com/eszyyflr.json',
    student:  'https://cdn.lordicon.com/fqrjldna.json',
    book:     'https://cdn.lordicon.com/wxnxiano.json',
    trending: 'https://cdn.lordicon.com/qhviklyi.json',
    star:     'https://cdn.lordicon.com/ulnswmkk.json',
};

/* ─── Single animated stat card ─── */
function StatCard({ src, label, value, sub, gradient }) {
    return (
        <div
            className="stat-card-lordicon relative overflow-hidden rounded-2xl border border-white/[0.07] p-5 flex items-center gap-4 cursor-default transition-all duration-300 hover:scale-[1.02] hover:border-white/[0.14] group"
        >
            {/* gradient glow blob */}
            <div
                className="absolute -top-6 -left-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-40"
                style={{ background: gradient }}
            />

            {/* Lordicon — trigger="hover" handled natively by the CDN player */}
            <div
                className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${gradient}22`, border: `1px solid ${gradient}55` }}
            >
                <lord-icon
                    src={src}
                    trigger="hover"
                    colors={`primary:${gradient},secondary:${gradient}`}
                    style={{ width: '44px', height: '44px' }}
                />
            </div>

            {/* Text */}
            <div className="relative z-10 min-w-0">
                <p className="text-2xl font-bold text-white leading-none mb-1">{value ?? '—'}</p>
                <p className="text-sm text-slate-400">{label}</p>
                {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

/* ─── Page ─── */
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

    return (
        <Sidebar>
            {/* Load Lordicon player from CDN — lazy, no impact on initial load */}
            <Script
                src="https://cdn.lordicon.com/lordicon.js"
                strategy="lazyOnload"
            />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Tableau de bord</h1>
                    <p className="page-subtitle">Vue d&apos;ensemble de la plateforme EduAI</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl h-24 animate-pulse bg-white/5 border border-white/[0.05]" />
                    ))}
                </div>
            ) : (
                <>
                    {/* ── Stat cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <StatCard src={ICONS.users}    label="Total utilisateurs" value={stats?.totalUsers}          gradient="#6366f1" />
                        <StatCard src={ICONS.teacher}  label="Professeurs"         value={stats?.totalInstructors}    gradient="#a855f7" />
                        <StatCard src={ICONS.student}  label="Étudiants"           value={stats?.totalStudents}       gradient="#0ea5e9" />
                        <StatCard src={ICONS.book}     label="Cours total"         value={stats?.totalCourses}        gradient="#10b981" sub={`${stats?.publishedCourses ?? 0} publiés`} />
                        <StatCard src={ICONS.trending} label="Inscriptions"         value={stats?.totalEnrollments}    gradient="#f59e0b" />
                        <StatCard src={ICONS.star}     label="Cours publiés"        value={stats?.publishedCourses}    gradient="#ec4899" />
                    </div>

                    {/* ── Quick links ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="card">
                            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-indigo-400" /> Gestion des professeurs
                            </h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Gérez les comptes instructeurs, suivez leurs cours et leurs statistiques d&apos;engagement.
                            </p>
                            <a href="/admin/teachers" className="btn-primary text-sm w-fit">
                                Voir les professeurs →
                            </a>
                        </div>
                        <div className="card">
                            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-emerald-400" /> Gestion des cours
                            </h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Consultez et modérez tous les cours de la plateforme, publiez ou dépubliez des cours.
                            </p>
                            <a href="/admin/courses" className="btn-secondary text-sm w-fit">
                                Voir les cours →
                            </a>
                        </div>
                    </div>
                </>
            )}
        </Sidebar>
    );
}
