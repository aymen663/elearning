'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { coursesAPI, progressAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import {
    BookOpen, CheckCircle, Clock, ChevronRight, ChevronLeft,
    Loader2, FileText, Download, Maximize2, X, Eye
} from 'lucide-react';
import CardLoader from '@/components/ui/CardLoader';
import Link from 'next/link';
import toast from 'react-hot-toast';

/* ── Progress Ring ── */
function ProgressRing({ pct }) {
    const r = 20, c = 2 * Math.PI * r;
    const color = pct === 100 ? '#10b981' : '#6366f1';
    return (
        <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="4" />
                <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
                    strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)' }} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold"
                style={{ color: 'var(--text-primary)' }}>{pct}%</span>
        </div>
    );
}

/* ── PDF Viewer ── */
function PdfViewer({ courseId, lessonId, title }) {
    const [blobUrl, setBlobUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        let revoke = null;
        let cancelled = false;
        setLoading(true);
        setError(null);
        setBlobUrl(null);

        const fetchPdf = async () => {
            try {
                const { data } = await coursesAPI.getLessonPdf(courseId, lessonId);
                if (cancelled) return;
                const byteChars = atob(data.pdf);
                const byteArray = new Uint8Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                revoke = url;
                setBlobUrl(url);
            } catch (err) {
                if (!cancelled) setError('Impossible de charger le document');
                console.error('PDF fetch error:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchPdf();
        return () => { cancelled = true; if (revoke) URL.revokeObjectURL(revoke); };
    }, [courseId, lessonId]);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setIsFullscreen(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    /* Error state */
    if (error) return (
        <div className="rounded-2xl border p-16 flex flex-col items-center justify-center text-center"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(239,68,68,0.1)' }}>
                <FileText className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{error}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Vérifiez votre connexion et réessayez</p>
        </div>
    );

    return (
        <>
            {/* ── Fullscreen Overlay ── */}
            {isFullscreen && blobUrl && (
                <div className="fixed inset-0 z-[9999] flex flex-col"
                    style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(8px)' }}>
                    <div className="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(20,184,166,0.15)' }}>
                                <FileText className="w-4 h-4 text-teal-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{title || 'Document'}</p>
                                <p className="text-[11px] text-white/40">Mode plein écran — Échap pour fermer</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href={blobUrl} download={`${title || 'cours'}.pdf`}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <Download className="w-3.5 h-3.5" /> Télécharger
                            </a>
                            <button onClick={() => setIsFullscreen(false)}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-red-500/20"
                                style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                                <X className="w-3.5 h-3.5" /> Fermer
                            </button>
                        </div>
                    </div>
                    <iframe src={blobUrl} className="flex-1 w-full border-0" title={title || 'PDF'} />
                </div>
            )}

            {/* ── Inline Card Viewer ── */}
            <div className="card p-0 overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-5 py-3 border-b"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-sidebar)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(20,184,166,0.12)' }}>
                            <FileText className="w-3.5 h-3.5 text-teal-400" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold block" style={{ color: 'var(--text-primary)' }}>
                                Document de cours
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>PDF • Lecture en ligne</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {blobUrl && (
                            <a href={blobUrl} download={`${title || 'cours'}.pdf`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                                style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Télécharger</span>
                            </a>
                        )}
                        <button onClick={() => setIsFullscreen(true)} disabled={!blobUrl}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-40"
                            style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(99,102,241,0.15))', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.2)' }}>
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Plein écran</span>
                        </button>
                    </div>
                </div>

                {/* PDF Content */}
                <div className="relative flex-1" style={{ minHeight: '500px', height: '65vh' }}>
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                            style={{ background: 'var(--bg-card)' }}>
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ background: 'rgba(20,184,166,0.08)' }}>
                                    <Loader2 className="w-7 h-7 animate-spin text-teal-400" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>Chargement du document</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Veuillez patienter…</p>
                            </div>
                        </div>
                    ) : blobUrl ? (
                        <iframe src={blobUrl} className="w-full h-full border-0 absolute inset-0" title={title || 'PDF'} />
                    ) : null}
                </div>
            </div>
        </>
    );
}

/* ── No PDF Placeholder ── */
function NoPdfPlaceholder() {
    return (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))' }}>
                <FileText className="w-9 h-9 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Aucun document disponible
            </h3>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                L'instructeur n'a pas encore ajouté de document PDF pour cette leçon.
            </p>
        </div>
    );
}

/* ── Main Learn Page ── */
export default function LearnPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [activeLesson, setActiveLesson] = useState(0);
    const [completing, setCompleting] = useState(false);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const { data } = await coursesAPI.getById(id);
            setData(data);
        } catch { toast.error('Cours introuvable'); }
        finally { setLoading(false); }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const completeLesson = async (lessonId) => {
        setCompleting(true);
        try {
            await progressAPI.completeLesson(id, lessonId);
            toast.success('Leçon complétée !');
            const { data: fresh } = await coursesAPI.getById(id);
            setData(fresh);
            if (activeLesson < (data?.course?.lessons?.length ?? 0) - 1)
                setTimeout(() => setActiveLesson(p => p + 1), 600);
        } catch { toast.error('Erreur'); }
        finally { setCompleting(false); }
    };

    if (loading) return (
        <Sidebar>
            <div className="py-16">
                <CardLoader />
            </div>
        </Sidebar>
    );
    if (!data) return <Sidebar><p className="text-slate-400 p-8">Cours introuvable</p></Sidebar>;

    const { course, progress } = data;
    const lessons = course.lessons || [];
    const lesson = lessons[activeLesson];
    const isDone = (lid) => progress?.completedLessons?.map(String).includes(String(lid));
    const completedCount = progress?.completedLessons?.length ?? 0;
    const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
    const isFirst = activeLesson === 0;
    const isLast = activeLesson === lessons.length - 1;
    const hasPdf = !!lesson?.pdfUrl;

    return (
        <Sidebar>
            {/* ── Top Bar ── */}
            <div className="flex items-center gap-4 mb-0 pb-4 border-b flex-wrap"
                style={{ borderColor: 'var(--border)' }}>
                <Link href={`/courses/${id}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all border hover:scale-[1.02]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
                    <ChevronLeft className="w-3.5 h-3.5" /> Retour
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{course.title}</h1>
                </div>
                <div className="hidden lg:flex items-center gap-3">
                    <div className="w-40 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.12)' }}>
                        <div className="h-1.5 rounded-full transition-all duration-700"
                            style={{
                                width: `${pct}%`,
                                background: pct === 100
                                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                                    : 'linear-gradient(90deg, #14b8a6, #6366f1)',
                            }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: pct === 100 ? '#10b981' : '#14b8a6' }}>{pct}%</span>
                </div>
            </div>

            {/* ── Main Layout ── */}
            <div className="flex -mx-4 lg:-mx-5 -mb-4 lg:-mb-5" style={{ height: 'calc(100vh - 130px)' }}>
                <div className="flex gap-0 h-full w-full">

                    {/* ── Lesson Sidebar ── */}
                    <aside className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-r h-full overflow-hidden"
                        style={{ borderColor: 'var(--border)', background: 'var(--bg-sidebar)' }}>
                        <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"
                                style={{ color: 'var(--text-muted)' }}>
                                <Eye className="w-3 h-3" /> {course.category}
                            </p>
                            <h2 className="text-sm font-bold leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                                {course.title}
                            </h2>
                            <div className="flex items-center gap-3 mt-4">
                                <ProgressRing pct={pct} />
                                <div>
                                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {completedCount}/{lessons.length} leçons
                                    </p>
                                    <p className="text-[11px] flex items-center gap-1 font-medium mt-0.5" style={{ color: pct === 100 ? '#10b981' : 'var(--text-muted)' }}>
                                        {pct === 100 ? <><CheckCircle className="w-3.5 h-3.5" /> Cours terminé</> : `${lessons.length - completedCount} restante${lessons.length - completedCount !== 1 ? 's' : ''}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto py-3 px-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest px-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                                Contenu du cours
                            </p>
                            {lessons.map((l, i) => {
                                const done = isDone(l._id);
                                const active = activeLesson === i;
                                return (
                                    <button key={l._id} onClick={() => setActiveLesson(i)}
                                        className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl mb-1 transition-all duration-200 group`}
                                        style={{
                                            background: active ? 'rgba(20,184,166,0.1)' : 'transparent',
                                            borderLeft: active ? '3px solid #14b8a6' : '3px solid transparent',
                                        }}>
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-all ${done
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : active
                                                ? 'text-white'
                                                : 'text-slate-500'
                                            }`}
                                            style={{
                                                background: done ? undefined : active ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'var(--bg-card)',
                                                border: done || active ? 'none' : '1px solid var(--border)',
                                            }}>
                                            {done ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                                        </div>
                                        <div className="min-w-0 flex-1 pt-0.5">
                                            <p className="text-[13px] font-medium leading-snug"
                                                style={{ color: active ? '#14b8a6' : done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                                {l.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {l.duration > 0 && (
                                                    <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                                        <Clock className="w-2.5 h-2.5" />{l.duration} min
                                                    </span>
                                                )}
                                                {done && (
                                                    <span className="text-[10px] text-emerald-400">✓ Complété</span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* ── Content Area ── */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="mx-auto px-6 py-8 max-w-4xl">
                            {lesson ? (
                                <>
                                    {/* Lesson Header */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                                                style={{ color: '#14b8a6', background: 'rgba(20,184,166,0.1)' }}>
                                                Leçon {activeLesson + 1}/{lessons.length}
                                            </span>
                                            {isDone(lesson._id) && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400">
                                                    <CheckCircle className="w-3 h-3" /> Complété
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-2xl font-bold leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                                            {lesson.title}
                                        </h1>
                                        {lesson.duration > 0 && (
                                            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                                                <Clock className="w-3 h-3" /> Durée estimée : {lesson.duration} min
                                            </span>
                                        )}
                                    </div>

                                    {/* Mobile Progress */}
                                    <div className="card lg:hidden mb-6 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Progression</span>
                                            <span className="text-xs font-bold text-teal-400">{pct}%</span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.12)' }}>
                                            <div className="h-2 rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #14b8a6, #6366f1)' }} />
                                        </div>
                                    </div>

                                    {/* PDF Viewer */}
                                    <div className="mb-6">
                                        {hasPdf ? (
                                            <PdfViewer courseId={id} lessonId={lesson._id} title={lesson.title} />
                                        ) : (
                                            <NoPdfPlaceholder />
                                        )}
                                    </div>

                                    {/* Bottom Navigation */}
                                    <div className="card p-3 flex items-center gap-2">
                                        <button onClick={() => setActiveLesson(p => Math.max(0, p - 1))}
                                            disabled={isFirst}
                                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5"
                                            style={{ color: 'var(--text-primary)', border: '1px solid var(--border)', background: 'var(--bg-sidebar)' }}>
                                            <ChevronLeft className="w-3.5 h-3.5" /> Précédente
                                        </button>

                                        <div className="flex-1 flex justify-center">
                                            {!isDone(lesson._id) ? (
                                                <button onClick={() => completeLesson(lesson._id)} disabled={completing}
                                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all text-white hover:scale-[1.02] active:scale-[0.98]"
                                                    style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)', boxShadow: '0 4px 16px rgba(20,184,166,0.3)' }}>
                                                    {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                    {completing ? 'Enregistrement...' : 'Marquer comme complétée'}
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                                                    style={{ color: '#10b981', background: 'rgba(16,185,129,0.08)' }}>
                                                    <CheckCircle className="w-4 h-4" /> Leçon complétée
                                                </div>
                                            )}
                                        </div>

                                        <button onClick={() => setActiveLesson(p => Math.min(lessons.length - 1, p + 1))}
                                            disabled={isLast}
                                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5"
                                            style={{ color: 'var(--text-primary)', border: '1px solid var(--border)', background: 'var(--bg-sidebar)' }}>
                                            Suivante <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                                        style={{ background: 'rgba(99,102,241,0.08)' }}>
                                        <BookOpen className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sélectionnez une leçon</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}
