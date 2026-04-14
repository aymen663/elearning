'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesAPI, progressAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import {
    BookOpen, Users, Clock, CheckCircle, MessageSquare, Brain,
    Play, ArrowRight, Loader2, ArrowLeft, Star, Award, Mail
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const LEVEL_COLOR = {
    débutant: 'badge-green',
    intermédiaire: 'badge-indigo',
    avancé: 'badge-purple',
};

export default function CourseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    const load = useCallback(() => {
        coursesAPI.getById(id)
            .then(({ data }) => setData(data))
            .catch(() => toast.error('Cours introuvable'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            await coursesAPI.enroll(id);
            toast.success('Inscription réussie !');
            router.push(`/courses/${id}/learn`);
        } catch (err) {
            const msg = err.response?.data?.message;
            if (msg === 'Déjà inscrit') router.push(`/courses/${id}/learn`);
            else toast.error(msg || 'Erreur inscription');
        } finally { setEnrolling(false); }
    };

    if (loading) return (
        <Sidebar><div className="flex justify-center py-24"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin" /></div></Sidebar>
    );

    if (!data) return <Sidebar><p className="text-slate-400">Cours introuvable</p></Sidebar>;

    const { course, progress, isEnrolled } = data;
    const totalDuration = course.lessons?.reduce((s, l) => s + (l.duration || 0), 0) || 0;
    const completionPct = progress?.completionPercentage || 0;

    return (
        <Sidebar>
            <div className="max-w-4xl">
                <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Retour au catalogue
                </Link>

                <div className="card mb-6 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-transparent border-indigo-500/20 overflow-hidden relative">
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #6366f1 0%, transparent 60%)' }} />

                    <div className="relative z-10">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="badge-indigo">{course.category}</span>
                            <span className={`${LEVEL_COLOR[course.level] || 'badge-slate'} capitalize`}>{course.level}</span>
                            {!course.isPublished && <span className="badge-slate">Brouillon</span>}
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{course.title}</h1>
                        <p className="text-slate-300 mb-5 leading-relaxed">{course.description}</p>

                        <div className="flex flex-wrap gap-5 text-sm text-slate-400 mb-6">
                            <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-indigo-400" />
                                {course.enrolledStudents?.length ?? 0} inscrits
                            </span>
                            <span className="flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 text-indigo-400" />
                                {course.lessons?.length ?? 0} leçons
                            </span>
                            {totalDuration > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-indigo-400" />
                                    {totalDuration} min
                                </span>
                            )}
                            {course.instructor && (
                                <span>
                                    Par <strong className="text-white">{course.instructor.name}</strong>
                                    {course.instructor.speciality && (
                                        <span className="text-slate-500"> · {course.instructor.speciality}</span>
                                    )}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {isEnrolled ? (
                                <>
                                    <Link href={`/courses/${id}/learn`} className="btn-primary">
                                        <Play className="w-4 h-4" /> Continuer le cours
                                    </Link>
                                    <Link href={`/courses/${id}/chat`} className="btn-secondary">
                                        <MessageSquare className="w-4 h-4" /> Tuteur IA
                                    </Link>
                                    <Link href={`/courses/${id}/quiz`} className="btn-secondary">
                                        <Brain className="w-4 h-4" /> Quiz adaptatif
                                    </Link>
                                    {course.instructor && user?.role === 'student' && (
                                        <Link href={`/messages/${course.instructor._id}`} className="btn-secondary">
                                            <Mail className="w-4 h-4" /> Contacter l&apos;instructeur
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <button onClick={handleEnroll} disabled={enrolling} className="btn-primary">
                                    {enrolling && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {enrolling ? 'Inscription...' : "S'inscrire gratuitement"}
                                    {!enrolling && <ArrowRight className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {isEnrolled && (
                    <div className="card mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-400" />
                                <span className="text-sm font-semibold text-white">Votre progression</span>
                            </div>
                            <span className="text-indigo-400 font-bold">{completionPct}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2.5 mb-2">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-700"
                                style={{ width: `${completionPct}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            {progress?.completedLessons?.length ?? 0} / {course.lessons?.length ?? 0} leçons complétées
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="card">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-400" /> Programme ({course.lessons?.length ?? 0} leçons)
                            </h2>
                            {!course.lessons?.length ? (
                                <p className="text-slate-500 text-sm">Aucune leçon disponible</p>
                            ) : (
                                <div className="space-y-2">
                                    {course.lessons.map((lesson, i) => {
                                        const done = progress?.completedLessons?.includes(lesson._id);
                                        return (
                                            <div key={lesson._id}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                          ${done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>
                                                    {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{lesson.title}</p>
                                                    {lesson.duration > 0 && (
                                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {lesson.duration} min
                                                        </p>
                                                    )}
                                                </div>
                                                {!isEnrolled && <span className="text-slate-600 text-xs">🔒</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {course.instructor && (
                            <div className="card">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Instructeur</h3>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                        {course.instructor.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{course.instructor.name}</p>
                                        {course.instructor.speciality && (
                                            <p className="text-xs text-slate-400">{course.instructor.speciality}</p>
                                        )}
                                    </div>
                                </div>
                                {course.instructor.bio && (
                                    <p className="text-xs text-slate-400 leading-relaxed">{course.instructor.bio}</p>
                                )}
                            </div>
                        )}

                        <div className="card space-y-3">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Ce cours inclut</h3>
                            <div className="space-y-2 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-400" />
                                    {course.lessons?.length ?? 0} leçons
                                </div>
                                {totalDuration > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-indigo-400" />
                                        {totalDuration} min de contenu
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Brain className="w-4 h-4 text-purple-400" />
                                    Quiz adaptatif IA
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-amber-400" />
                                    Tuteur IA disponible
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-emerald-400" />
                                    Accès à vie
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}
