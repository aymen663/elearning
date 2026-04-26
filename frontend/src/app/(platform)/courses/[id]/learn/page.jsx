'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { coursesAPI, progressAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import {
    BookOpen, CheckCircle, Clock, ChevronRight, ChevronLeft,
    Loader2, FileText, Languages, X, Focus, Maximize2, Minimize2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const LANGUAGES = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
];


function LessonContent({ text, lang }) {
    if (!text?.trim()) return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 mb-3" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">Aucun contenu texte pour cette leçon</p>
        </div>
    );

    const isRTL = lang === 'ar';


    const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-5">
            {paragraphs.map((para, i) => {

                const lines = para.split('\n');
                const firstLine = lines[0].trim();
                const isHeading = firstLine.startsWith('#') ||
                    (firstLine.length < 80 && firstLine === firstLine.toUpperCase() && firstLine.length > 3 && !/\d{2}/.test(firstLine)) ||
                    /^(chapitre|section|partie|module|leçon|lesson|chapter|unit)\s+\d/i.test(firstLine);

                if (isHeading) {
                    const headingText = firstLine.replace(/^#+\s*/, '');
                    const rest = lines.slice(1).join('\n').trim();
                    return (
                        <div key={i}>
                            <h3 className="text-base font-bold mt-8 mb-3 pb-2 border-b"
                                style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
                                {headingText}
                            </h3>
                            {rest && <p className="text-sm leading-[1.9]" style={{ color: 'var(--text-secondary)' }}>{rest}</p>}
                        </div>
                    );
                }


                if (lines.length > 1 && firstLine.length < 100 && !firstLine.endsWith('.') && !firstLine.endsWith(',')) {
                    return (
                        <div key={i} className="space-y-2">
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{firstLine}</p>
                            <p className="text-sm leading-[1.9]" style={{ color: 'var(--text-secondary)' }}>
                                {lines.slice(1).join(' ')}
                            </p>
                        </div>
                    );
                }

                return (
                    <p key={i} className="text-sm leading-[1.9]" style={{ color: 'var(--text-secondary)' }}>
                        {para.replace(/\n/g, ' ')}
                    </p>
                );
            })}
        </div>
    );
}


function ProgressRing({ pct }) {
    const r = 20, c = 2 * Math.PI * r;
    return (
        <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="4" />
                <circle cx="28" cy="28" r={r} fill="none" stroke="#6366f1" strokeWidth="4"
                    strokeDasharray={c}
                    strokeDashoffset={c - (pct / 100) * c}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold"
                style={{ color: 'var(--text-primary)' }}>{pct}%</span>
        </div>
    );
}

export default function LearnPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [activeLesson, setActiveLesson] = useState(0);
    const [completing, setCompleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [focusMode, setFocusMode] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [translatedContent, setTranslatedContent] = useState(null);
    const [activeLang, setActiveLang] = useState(null);
    const [jwtToken, setJwtToken] = useState('');

    useEffect(() => {
        import('@/lib/keycloak').then(({ getKeycloak }) => {
            const kc = getKeycloak();
            if (kc?.token) {
                setJwtToken(kc.token);
            }
        });
    }, []);

    const load = useCallback(async () => {
        try {
            const { data } = await coursesAPI.getById(id);
            setData(data);
        } catch { toast.error('Cours introuvable'); }
        finally { setLoading(false); }
    }, [id]);

    useEffect(() => { load(); }, [load]);


    useEffect(() => { setTranslatedContent(null); setActiveLang(null); }, [activeLesson]);


    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape' && focusMode) setFocusMode(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [focusMode]);

    const completeLesson = async (lessonId) => {
        setCompleting(true);
        try {
            await progressAPI.completeLesson(id, lessonId);
            toast.success('Leçon complétée ! 🎉');
            const { data: fresh } = await coursesAPI.getById(id);
            setData(fresh);

            if (activeLesson < (data?.course?.lessons?.length ?? 0) - 1) {
                setTimeout(() => setActiveLesson(p => p + 1), 600);
            }
        } catch { toast.error('Erreur'); }
        finally { setCompleting(false); }
    };

    const translate = async (langCode) => {
        const lesson = data?.course?.lessons?.[activeLesson];
        if (!lesson) return;
        if (langCode === activeLang) { setTranslatedContent(null); setActiveLang(null); return; }
        if (!lesson.content?.trim()) { toast.error("Cette leçon n'a pas de contenu texte"); return; }
        setTranslating(true);
        try {
            const { data: res } = await coursesAPI.translateLesson(id, lesson._id, langCode);
            setTranslatedContent(res.translated);
            setActiveLang(langCode);
            toast.success(`Traduit en ${LANGUAGES.find(l => l.code === langCode)?.label} ✓`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur de traduction');
        } finally { setTranslating(false); }
    };

    if (loading) return (
        <Sidebar><div className="flex justify-center py-24"><Loader2 className="w-10 h-10 text-teal-400 animate-spin" /></div></Sidebar>
    );
    if (!data) return <Sidebar><p className="text-slate-400 p-8">Cours introuvable</p></Sidebar>;

    const { course, progress } = data;
    const lessons = course.lessons || [];
    const lesson = lessons[activeLesson];
    const isDone = (lessonId) => progress?.completedLessons?.map(String).includes(String(lessonId));
    const completedCount = progress?.completedLessons?.length ?? 0;
    const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
    const isFirst = activeLesson === 0;
    const isLast = activeLesson === lessons.length - 1;
    const displayContent = translatedContent || lesson?.content;

    const inner = (
        <div className={`flex gap-0 h-full ${focusMode ? 'justify-center' : ''}`}>

            {!focusMode && (
                <aside className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-r h-full overflow-hidden"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-sidebar)' }}>

                    <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                            {course.category}
                        </p>
                        <h2 className="text-sm font-bold leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                            {course.title}
                        </h2>

                        <div className="flex items-center gap-3 mt-3">
                            <ProgressRing pct={pct} />
                            <div>
                                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {completedCount}/{lessons.length} leçons
                                </p>
                                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                    {pct === 100 ? '🎉 Cours terminé !' : `${lessons.length - completedCount} restante${lessons.length - completedCount !== 1 ? 's' : ''}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-3 px-2">
                        {lessons.map((l, i) => {
                            const done = isDone(l._id);
                            const active = activeLesson === i;
                            return (
                                <button key={l._id} onClick={() => setActiveLesson(i)}
                                    className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl mb-1 transition-all group ${active ? 'ring-1 ring-teal-500/30' : 'hover:bg-white/5'
                                        }`}
                                    style={{
                                        background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    }}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold transition-all ${done ? 'bg-emerald-500/20 text-emerald-400' : active ? 'bg-teal-600 text-white' : 'bg-white/10 text-slate-500'
                                        }`}>
                                        {done ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium leading-snug ${active ? 'text-teal-300' : done ? '' : ''}`}
                                            style={{ color: active ? undefined : done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                            {l.title}
                                        </p>
                                        {l.duration > 0 && (
                                            <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                                <Clock className="w-2.5 h-2.5" />{l.duration} min
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>
            )}

            <div className="flex-1 overflow-y-auto">
                <div className={`mx-auto px-6 py-8 ${focusMode ? 'max-w-2xl' : 'max-w-3xl'}`}>

                    {lesson ? (
                        <>
                            <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                                <div>
                                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                                        Leçon {activeLesson + 1} / {lessons.length}
                                    </p>
                                    <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                                        {lesson.title}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-2">
                                        {lesson.duration > 0 && (
                                            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                                <Clock className="w-3 h-3" /> {lesson.duration} min de lecture
                                            </span>
                                        )}
                                        {isDone(lesson._id) && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                                <CheckCircle className="w-3 h-3" /> Complété
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setFocusMode(f => !f)}
                                    title={focusMode ? 'Quitter le mode focus (Échap)' : 'Mode focus'}
                                    className={`btn-nav text-xs px-3 py-1.5 ${focusMode ? 'ring-1 ring-teal-500/50' : ''}`}
                                >
                                    {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                                    {focusMode ? 'Quitter focus' : 'Mode focus'}
                                </button>
                            </div>

                            <div className="lg:hidden mb-6 p-4 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Progression</span>
                                    <span className="text-xs font-bold text-teal-400">{pct}%</span>
                                </div>
                                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.15)' }}>
                                    <div className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-500 transition-all duration-700"
                                        style={{ width: `${pct}%` }} />
                                </div>
                                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                    {completedCount}/{lessons.length} leçons complétées
                                </p>
                            </div>

                            <div className="flex items-center flex-wrap gap-2 mb-6 p-3 rounded-xl border"
                                style={{ background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.15)' }}>
                                <Languages className="w-4 h-4 text-teal-400 flex-shrink-0" />
                                <span className="text-xs mr-1" style={{ color: 'var(--text-muted)' }}>Traduire :</span>
                                {LANGUAGES.map(lang => (
                                    <button key={lang.code}
                                        onClick={() => translate(lang.code)} disabled={translating}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${activeLang === lang.code
                                            ? 'bg-teal-600 border-teal-500 text-white'
                                            : 'bg-white/[0.04] border-white/10 text-slate-400 hover:border-teal-500/40 hover:text-teal-300'
                                            }`}>
                                        {translating && activeLang === lang.code
                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                            : <span>{lang.flag}</span>}
                                        {lang.label}
                                    </button>
                                ))}
                                {activeLang && (
                                    <button onClick={() => { setTranslatedContent(null); setActiveLang(null); }}
                                        className="ml-auto flex items-center gap-1 text-xs hover:text-slate-300"
                                        style={{ color: 'var(--text-muted)' }}>
                                        <X className="w-3 h-3" /> Original
                                    </button>
                                )}
                            </div>

                            <div className="rounded-2xl border p-8 mb-6"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                {translating && !translatedContent ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                                        <span className="ml-3 text-sm" style={{ color: 'var(--text-muted)' }}>Traduction en cours...</span>
                                    </div>
                                ) : (
                                    <LessonContent text={displayContent} lang={activeLang} />
                                )}
                            </div>

                            {lesson.pdfUrl && (lesson.pdfUrl.startsWith('http') || lesson.pdfUrl.startsWith('/api/')) && (
                                <div className="mb-6">
                                    <a href={lesson.pdfUrl.startsWith('http')
                                        ? lesson.pdfUrl
                                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${lesson.pdfUrl.replace(/^\/api/, '')}?token=${jwtToken}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all"
                                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                        <FileText className="w-4 h-4" /> Ouvrir le PDF
                                    </a>
                                </div>
                            )}

                            <div className="rounded-2xl border p-4 flex items-center gap-3"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                <button onClick={() => setActiveLesson(p => Math.max(0, p - 1))}
                                    disabled={isFirst}
                                    className="btn-nav">
                                    <ChevronLeft className="w-4 h-4" /> Précédente
                                </button>

                                <div className="flex-1 flex justify-center">
                                    {!isDone(lesson._id) ? (
                                        <button onClick={() => completeLesson(lesson._id)} disabled={completing}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/25">
                                            {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            {completing ? 'Enregistrement...' : 'Marquer comme complétée'}
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                                            <CheckCircle className="w-4 h-4" /> Leçon complétée
                                        </div>
                                    )}
                                </div>

                                <button onClick={() => setActiveLesson(p => Math.min(lessons.length - 1, p + 1))}
                                    disabled={isLast}
                                    className="btn-nav">
                                    Suivante <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="card text-center py-20">
                            <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                            <p style={{ color: 'var(--text-muted)' }}>Sélectionnez une leçon</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <Sidebar>
            <div className="flex items-center gap-4 mb-0 pb-4 border-b flex-wrap"
                style={{ borderColor: 'var(--border)' }}>
                <Link href={`/courses/${id}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
                    <ChevronLeft className="w-3.5 h-3.5" /> Retour
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{course.title}</h1>
                </div>
                <div className="hidden lg:flex items-center gap-3">
                    <div className="w-40 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.15)' }}>
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-500 transition-all duration-700"
                            style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-teal-400">{pct}%</span>
                </div>
            </div>

            <div className="flex -mx-6 -mb-6" style={{ height: 'calc(100vh - 130px)' }}>
                {inner}
            </div>
        </Sidebar>
    );
}
