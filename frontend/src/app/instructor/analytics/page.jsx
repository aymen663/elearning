'use client';
import { useEffect, useState } from 'react';
import { coursesAPI, progressAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { BarChart2, Users, CheckCircle, Brain, TrendingUp, BookOpen, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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

    return (
        <Sidebar>
            <div className="page-header">
                <div className="flex items-center gap-3">
                    <Link href="/instructor" className="btn-ghost px-3 py-2"><ArrowLeft className="w-4 h-4" /></Link>
                    <div>
                        <h1 className="page-title flex items-center gap-2">
                            <BarChart2 className="w-6 h-6 text-indigo-400" /> Analytics instructeur
                        </h1>
                        <p className="page-subtitle">Performance de vos cours</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                    { icon: BookOpen, label: 'Cours total', value: courses.length, color: 'bg-indigo-600' },
                    { icon: CheckCircle, label: 'Publiés', value: totalPublished, color: 'bg-emerald-600' },
                    { icon: Users, label: 'Étudiants total', value: totalStudents, color: 'bg-amber-600' },
                    { icon: TrendingUp, label: 'Moy. étudiants/cours', value: avgStudents, color: 'bg-purple-600' },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="stat-card">
                        <div className={`stat-icon ${color}`}><Icon className="w-5 h-5 text-white" /></div>
                        <div>
                            <p className="text-2xl font-bold text-white">{value}</p>
                            <p className="text-xs text-slate-400">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
            ) : courses.length === 0 ? (
                <div className="card text-center py-16">
                    <p className="text-slate-400">Aucun cours créé</p>
                    <Link href="/instructor/courses/new" className="btn-primary mt-4 mx-auto w-fit">Créer un cours</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white mb-2">Performance par cours</h2>
                    {courses.map((course) => {
                        const enrolled = course.enrolledStudents?.length || 0;
                        const lessons = course.lessons?.length || 0;
                        const maxStudents = Math.max(...courses.map((c) => c.enrolledStudents?.length || 0), 1);
                        const barWidth = Math.round((enrolled / maxStudents) * 100);

                        return (
                            <div key={course._id} className="card">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white text-sm line-clamp-1">{course.title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`badge ${course.isPublished ? 'badge-green' : 'badge-red'}`}>
                                                {course.isPublished ? 'Publié' : 'Brouillon'}
                                            </span>
                                            <span className="text-xs text-slate-500 capitalize">{course.category}</span>
                                            <span className="text-xs text-slate-500">{lessons} leçons</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-2xl font-bold text-white">{enrolled}</p>
                                        <p className="text-xs text-slate-500">étudiants</p>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Inscriptions</span>
                                        <span>{barWidth}% du max</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                                            style={{ width: `${barWidth}%` }} />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link href={`/instructor/courses/${course._id}/edit`}
                                        className="btn-ghost text-xs px-3 py-1.5">Éditer</Link>
                                    <Link href={`/instructor/courses/${course._id}/students`}
                                        className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1">
                                        <Users className="w-3 h-3" /> Voir étudiants
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Sidebar>
    );
}
