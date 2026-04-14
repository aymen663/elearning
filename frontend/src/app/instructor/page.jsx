'use client';
import { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';
import { coursesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import {
    Plus, BookOpen, Users, Edit3, Trash2, ArrowRight,
    Eye, EyeOff
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

/* ─── Lordicon URLs ─── */
const ICONS = {
    courses:  'https://cdn.lordicon.com/wxnxiano.json',
    published:'https://cdn.lordicon.com/ulnswmkk.json',
    students: 'https://cdn.lordicon.com/dxjqoygy.json',
    lessons:  'https://cdn.lordicon.com/nocovwne.json',
};

/* ─── Stat card with Lordicon ─── */
function StatCard({ src, label, value, gradient }) {
    return (
        <div className="stat-card-lordicon relative overflow-hidden rounded-2xl border border-white/[0.07] p-5 flex items-center gap-4 cursor-default group">
            <div
                className="absolute -top-6 -left-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-40"
                style={{ background: gradient }}
            />
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
            <div className="relative z-10 min-w-0">
                <p className="text-2xl font-bold text-white leading-none mb-1">{value ?? '—'}</p>
                <p className="text-sm text-slate-400">{label}</p>
            </div>
        </div>
    );
}

/* ─── Skeleton ─── */
function InstructorSkeleton() {
    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-white/[0.07] p-5 flex items-center gap-4 animate-pulse">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-6 w-10 rounded bg-white/[0.07]" />
                            <div className="h-3 w-16 rounded bg-white/[0.04]" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="card animate-pulse space-y-3">
                        <div className="flex justify-between">
                            <div className="h-5 w-20 rounded-full bg-white/[0.07]" />
                            <div className="h-5 w-16 rounded-full bg-white/[0.05]" />
                        </div>
                        <div className="h-4 w-3/4 rounded bg-white/[0.07]" />
                        <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
                        <div className="flex gap-2 pt-2">
                            <div className="h-8 flex-1 rounded-lg bg-white/[0.05]" />
                            <div className="h-8 flex-1 rounded-lg bg-white/[0.05]" />
                            <div className="h-8 w-8 rounded-lg bg-white/[0.04]" />
                        </div>
                    </div>
                ))}
            </div>
        </>
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

    const togglePublish = async (course) => {
        try {
            await coursesAPI.update(course._id, { isPublished: !course.isPublished });
            toast.success(course.isPublished ? 'Cours dépublié' : 'Cours publié !');
            load();
        } catch { toast.error('Erreur'); }
    };

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

    return (
        <Sidebar>
            <Script src="https://cdn.lordicon.com/lordicon.js" strategy="lazyOnload" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Espace Instructeur</h1>
                    <p className="page-subtitle">Gérez vos cours et suivez vos étudiants</p>
                </div>
                <Link href="/instructor/courses/new" className="btn-primary">
                    <Plus className="w-4 h-4" /> Nouveau cours
                </Link>
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard src={ICONS.courses}   label="Mes cours"  value={stats.totalCourses}     gradient="#6366f1" />
                    <StatCard src={ICONS.published} label="Publiés"    value={stats.publishedCourses} gradient="#10b981" />
                    <StatCard src={ICONS.students}  label="Étudiants"  value={stats.totalStudents}    gradient="#f59e0b" />
                    <StatCard src={ICONS.lessons}   label="Leçons"     value={stats.totalLessons}     gradient="#a855f7" />
                </div>
            )}

            {loading ? (
                <InstructorSkeleton />
            ) : courses.length === 0 ? (
                <div className="card text-center py-16">
                    <BookOpen className="w-14 h-14 text-slate-700 mx-auto mb-4" />
                    <h2 className="text-white font-semibold text-lg mb-2">Aucun cours créé</h2>
                    <p className="text-slate-400 mb-6">Créez votre premier cours et commencez à partager vos connaissances.</p>
                    <Link href="/instructor/courses/new" className="btn-primary mx-auto w-fit">
                        <Plus className="w-4 h-4" /> Créer mon premier cours
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((c) => (
                        <div key={c._id} className="card flex flex-col group">
                            <div className="flex items-start justify-between mb-3">
                                <span className="badge-indigo text-[10px]">{c.category}</span>
                                <div className="flex items-center gap-1.5">
                                    {c.isPublished
                                        ? <span className="badge-green text-[10px] flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> Publié</span>
                                        : <span className="badge-amber text-[10px] flex items-center gap-1"><EyeOff className="w-2.5 h-2.5" /> Brouillon</span>}
                                </div>
                            </div>

                            <h3 className="font-semibold text-white text-sm mb-2 flex-1 line-clamp-2">{c.title}</h3>

                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.enrolledStudents?.length ?? 0} étudiants</span>
                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {c.lessons?.length ?? 0} leçons</span>
                            </div>

                            <div className="flex gap-2 mt-auto flex-wrap">
                                <Link href={`/instructor/courses/${c._id}/edit`} className="btn-secondary flex-1 justify-center text-xs py-2">
                                    <Edit3 className="w-3.5 h-3.5" /> Éditer
                                </Link>
                                <Link href={`/instructor/courses/${c._id}/students`} className="btn-secondary flex-1 justify-center text-xs py-2" title="Voir les étudiants">
                                    <Users className="w-3.5 h-3.5" /> Étudiants
                                </Link>
                                <button onClick={() => togglePublish(c)} className="btn-ghost px-3 py-2" title={c.isPublished ? 'Dépublier' : 'Publier'}>
                                    {c.isPublished ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                                </button>
                                <button onClick={() => deleteCourse(c._id)} disabled={deletingId === c._id} className="btn-ghost px-3 py-2" title="Supprimer">
                                    {deletingId === c._id
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                                        : <Trash2 className="w-3.5 h-3.5 text-red-400" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Sidebar>
    );
}
