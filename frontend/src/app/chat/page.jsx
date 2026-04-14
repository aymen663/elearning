'use client';
import { useEffect, useState } from 'react';
import { progressAPI, coursesAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import {
    MessageSquare, Sparkles, BookOpen, ArrowRight,
    Loader2, Search, Zap
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ChatHubPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        progressAPI.getMyProgress()
            .then(({ data }) => {
                const enrolled = (data.progress || []).map((p) => ({
                    ...p.course,
                    completionPercentage: p.completionPercentage,
                }));
                setCourses(enrolled);
            })
            .catch(() => toast.error('Erreur chargement'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = courses.filter((c) =>
        c.title?.toLowerCase().includes(query.toLowerCase()) ||
        c.category?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <Sidebar>
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Sparkles className="w-7 h-7 text-indigo-400" />
                        Tuteur IA
                    </h1>
                    <p className="page-subtitle">
                        Posez vos questions sur n&apos;importe lequel de vos cours
                    </p>
                </div>
            </div>

            <div className="rounded-2xl p-4 mb-6 flex items-start gap-3"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Zap className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300">
                    Le tuteur IA utilise le contenu de chaque cours pour répondre précisément à vos questions.
                    Sélectionnez un cours ci-dessous pour commencer une session.
                </p>
            </div>

            {courses.length > 0 && (
                <div className="relative mb-6 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        className="input pl-10"
                        placeholder="Rechercher un cours..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                </div>
            ) : courses.length === 0 ? (
                <div className="card text-center py-20 max-w-lg mx-auto">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-600/10 flex items-center justify-center mx-auto mb-5">
                        <MessageSquare className="w-10 h-10 text-indigo-400/40" />
                    </div>
                    <h2 className="text-white font-semibold text-lg mb-2">Aucun cours disponible</h2>
                    <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                        Inscrivez-vous à un cours pour pouvoir utiliser le tuteur IA.
                    </p>
                    <Link href="/courses" className="btn-primary mx-auto w-fit">
                        <BookOpen className="w-4 h-4" /> Explorer les cours
                    </Link>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-slate-400">Aucun cours ne correspond à &quot;{query}&quot;</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((course) => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            )}
        </Sidebar>
    );
}

function CourseCard({ course }) {
    const pct = course.completionPercentage || 0;

    return (
        <div className="card group flex flex-col gap-4 hover:border-indigo-500/30 transition-all duration-200">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                        {course.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        {course.category && (
                            <span className="badge-slate text-xs capitalize">{course.category}</span>
                        )}
                        {course.level && (
                            <span className="badge-slate text-xs capitalize">{course.level}</span>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progression</span>
                    <span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            <Link
                href={`/courses/${course._id}/chat`}
                className="btn-primary justify-center mt-auto"
            >
                <Sparkles className="w-4 h-4" />
                Ouvrir le tuteur IA
                <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
        </div>
    );
}
