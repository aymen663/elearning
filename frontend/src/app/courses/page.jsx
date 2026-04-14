'use client';
import { useEffect, useState } from 'react';
import { coursesAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { Search, Users, BookOpen, ArrowRight, Star, Layers } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const CATEGORIES = ['Toutes', 'développement', 'intelligence artificielle', 'design', 'cybersécurité', 'programmation', 'marketing', 'mathématiques', 'langue'];
const LEVELS = ['Tous', 'débutant', 'intermédiaire', 'avancé'];

/* ── Soft per-category gradients ─────────────────────────────────────────── */
const CAT_THEME = {
    'développement': { from: '#0ea5e9', to: '#6366f1', emoji: '💻' },
    'intelligence artificielle': { from: '#8b5cf6', to: '#3b82f6', emoji: '🤖' },
    'design': { from: '#ec4899', to: '#a855f7', emoji: '🎨' },
    'cybersécurité': { from: '#10b981', to: '#0ea5e9', emoji: '🔒' },
    'programmation': { from: '#f59e0b', to: '#ef4444', emoji: '⚙️' },
    'marketing': { from: '#3b82f6', to: '#06b6d4', emoji: '📊' },
    'mathématiques': { from: '#6366f1', to: '#8b5cf6', emoji: '∑' },
    'langue': { from: '#22c55e', to: '#0ea5e9', emoji: '🌍' },
    default: { from: '#6366f1', to: '#8b5cf6', emoji: '📚' },
};
const getTheme = (cat = '') => CAT_THEME[cat.toLowerCase()] || CAT_THEME.default;

const LEVEL_TAG = {
    débutant: { bg: 'rgba(34,197,94,0.15)', color: '#86efac', border: 'rgba(34,197,94,0.25)' },
    intermédiaire: { bg: 'rgba(234,179,8,0.15)', color: '#fde047', border: 'rgba(234,179,8,0.25)' },
    avancé: { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'rgba(239,68,68,0.25)' },
};
const getLvl = (l = '') => LEVEL_TAG[l.toLowerCase()] || { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' };

/* ── CourseCard ───────────────────────────────────────────────────────────── */
function CourseCard({ course }) {
    const theme = getTheme(course.category);
    const lvl = getLvl(course.level);
    const lessons = course.lessons?.length ?? 0;
    const students = course.enrolledStudents?.length ?? 0;
    const rating = course.rating ?? (4.2 + Math.random() * 0.7).toFixed(1);

    return (
        <Link href={`/courses/${course._id}`} className="cc-card group block">
            {/* Thumbnail */}
            <div className="cc-img-wrap">
                {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="cc-img" />
                ) : (
                    <div className="cc-placeholder"
                        style={{ background: `linear-gradient(135deg, ${theme.from}26 0%, ${theme.to}40 100%)` }}>
                        <div className="cc-grid-pattern"
                            style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)` }} />
                        <span className="cc-emoji">{theme.emoji}</span>
                        {/* Accent dot glow */}
                        <div className="cc-glow-dot"
                            style={{ background: `radial-gradient(circle, ${theme.from}55 0%, transparent 70%)` }} />
                    </div>
                )}
                {/* Subtle bottom fade */}
                <div className="cc-overlay" />
                {/* Badges */}
                <div className="cc-badges">
                    <span className="cc-badge-cat">{course.category}</span>
                    <span className="cc-badge-lvl" style={{ background: lvl.bg, color: lvl.color, borderColor: lvl.border }}>
                        {course.level}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="cc-body">
                {course.instructor?.name && (
                    <p className="cc-instructor">{course.instructor.name}</p>
                )}
                <h3 className="cc-title">{course.title}</h3>
                {course.description && (
                    <p className="cc-desc">{course.description}</p>
                )}

                {/* Meta row */}
                <div className="cc-meta">
                    <span className="cc-meta-item cc-rating">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {Number(rating).toFixed(1)}
                    </span>
                    <span className="cc-dot">·</span>
                    <span className="cc-meta-item">
                        <Users className="w-3 h-3" /> {students.toLocaleString()}
                    </span>
                    <span className="cc-dot">·</span>
                    <span className="cc-meta-item">
                        <BookOpen className="w-3 h-3" /> {lessons} leçons
                    </span>
                </div>

                {/* CTA */}
                <div className="cc-cta">
                    <span>Voir le cours</span>
                    <ArrowRight className="cc-arrow w-4 h-4" />
                </div>
            </div>

            {/* Hover border accent */}
            <div className="cc-accent-border"
                style={{ '--c1': theme.from, '--c2': theme.to }} />
        </Link>
    );
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
function CardSkeleton() {
    return (
        <div className="cc-skeleton">
            <div className="cc-skeleton-img" />
            <div className="cc-skeleton-body">
                {[33, 100, 75, 50].map((w, i) => (
                    <div key={i} className="cc-skeleton-line" style={{ width: `${w}%` }} />
                ))}
            </div>
        </div>
    );
}

const PAGE_SIZE = 9;

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Toutes');
    const [level, setLevel] = useState('Tous');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search && search !== '') params.search = search;
            if (category && category !== 'Toutes') params.category = category;
            if (level && level !== 'Tous') params.level = level;
            const { data } = await coursesAPI.getAll(params);
            setCourses(data.courses);
        } catch { toast.error('Erreur chargement des cours'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCourses(); setPage(1); }, [category, level]);

    const paginated = courses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = Math.ceil(courses.length / PAGE_SIZE);

    return (
        <Sidebar>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Catalogue des cours</h1>
                    <p className="page-subtitle">Découvrez votre prochain apprentissage</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--text-muted)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    {courses.length} cours
                </span>
            </div>

            {/* Search */}
            <form onSubmit={(e) => { e.preventDefault(); fetchCourses(); }} className="flex gap-2 mb-6 max-w-lg">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input className="input pl-10" placeholder="Rechercher un cours..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                </div>
                <button type="submit" className="btn-secondary px-5">Chercher</button>
            </form>

            {/* Categories */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setCategory(c)}
                        className="catalog-pill whitespace-nowrap capitalize" data-active={category === c}>
                        {c}
                    </button>
                ))}
            </div>

            {/* Levels */}
            <div className="flex gap-2 mb-8">
                {LEVELS.map((l) => (
                    <button key={l} onClick={() => setLevel(l)}
                        className="catalog-pill-sm capitalize" data-active={level === l}>
                        {l}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="cc-grid">
                    {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : courses.length === 0 ? (
                <div className="card text-center py-16">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p style={{ color: 'var(--text-muted)' }}>Aucun cours trouvé</p>
                </div>
            ) : (
                <>
                    <div className="cc-grid">
                        {paginated.map((c) => <CourseCard key={c._id} course={c} />)}
                    </div>
                    {courses.length > PAGE_SIZE && (
                        <div className="flex items-center justify-center gap-3 mt-10">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1} className="btn-secondary disabled:opacity-40">← Précédent</button>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Page <strong style={{ color: 'var(--text-primary)' }}>{page}</strong> / {totalPages}
                            </span>
                            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages} className="btn-secondary disabled:opacity-40">Suivant →</button>
                        </div>
                    )}
                </>
            )}
        </Sidebar>
    );
}
