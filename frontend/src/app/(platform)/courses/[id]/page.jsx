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
        <Sidebar><div style={{ display: 'flex', justifyContent: 'center', padding: '96px 0' }}><Loader2 style={{ width: 40, height: 40, color: 'var(--accent)' }} className="animate-spin" /></div></Sidebar>
    );

    if (!data) return <Sidebar><p style={{ color: 'var(--text-muted)' }}>Cours introuvable</p></Sidebar>;

    const { course, progress, isEnrolled } = data;
    const totalDuration = course.lessons?.reduce((s, l) => s + (l.duration || 0), 0) || 0;
    const completionPct = progress?.completionPercentage || 0;

    return (
        <Sidebar>
            <div style={{ maxWidth: 900 }}>
                <Link href="/courses" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14,
                    color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 24, transition: 'color 0.2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    <ArrowLeft style={{ width: 16, height: 16 }} /> Retour au catalogue
                </Link>

                {/* ── Hero Card ── */}
                <div style={{
                    background: 'var(--bg-card)', border: '1.5px solid var(--border-strong)',
                    borderRadius: 16, padding: '32px', marginBottom: 24,
                    boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                            <span style={{
                                padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE',
                            }}>{course.category}</span>
                            <span style={{
                                padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                                background: '#ECFDF5', color: '#047857', border: '1px solid #86EFAC',
                            }}>{course.level}</span>
                            {!course.isPublished && <span style={{
                                padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A',
                            }}>Brouillon</span>}
                        </div>

                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                            {course.title}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6, fontSize: 15 }}>
                            {course.description}
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Users style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                                {course.enrolledStudents?.length ?? 0} inscrits
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <BookOpen style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                                {course.lessons?.length ?? 0} leçons
                            </span>
                            {totalDuration > 0 && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Clock style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                                    {totalDuration} min
                                </span>
                            )}
                            {course.instructor && (
                                <span>
                                    Par <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{course.instructor.name}</strong>
                                    {course.instructor.speciality && (
                                        <span style={{ color: 'var(--text-muted)' }}> · {course.instructor.speciality}</span>
                                    )}
                                </span>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            {isEnrolled ? (
                                <>
                                    <Link href={`/courses/${id}/learn`} className="btn-primary">
                                        <Play style={{ width: 16, height: 16 }} /> Continuer le cours
                                    </Link>
                                    <Link href={`/courses/${id}/chat`} className="btn-secondary">
                                        <MessageSquare style={{ width: 16, height: 16 }} /> Tuteur IA
                                    </Link>
                                    <Link href={`/courses/${id}/quiz`} className="btn-secondary">
                                        <Brain style={{ width: 16, height: 16 }} /> Quiz adaptatif
                                    </Link>
                                    {course.instructor && user?.role === 'student' && (
                                        <Link href={`/messages/${course.instructor._id}`} className="btn-secondary">
                                            <Mail style={{ width: 16, height: 16 }} /> Contacter l&apos;instructeur
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <button onClick={handleEnroll} disabled={enrolling} className="btn-primary">
                                    {enrolling && <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />}
                                    {enrolling ? 'Inscription...' : "S'inscrire gratuitement"}
                                    {!enrolling && <ArrowRight style={{ width: 16, height: 16 }} />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Progress Bar ── */}
                {isEnrolled && (
                    <div style={{
                        background: 'var(--bg-card)', border: '1.5px solid var(--border-strong)',
                        borderRadius: 14, padding: '20px 24px', marginBottom: 24,
                        boxShadow: 'var(--card-shadow)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Award style={{ width: 20, height: 20, color: 'var(--accent)' }} />
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Votre progression</span>
                            </div>
                            <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>{completionPct}%</span>
                        </div>
                        <div style={{ width: '100%', background: 'var(--bg-secondary)', borderRadius: 9999, height: 10, marginBottom: 8 }}>
                            <div style={{
                                background: 'linear-gradient(90deg, var(--accent-light), var(--accent))',
                                height: 10, borderRadius: 9999, transition: 'width 0.7s ease',
                                width: `${completionPct}%`,
                            }} />
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {progress?.completedLessons?.length ?? 0} / {course.lessons?.length ?? 0} leçons complétées
                        </p>
                    </div>
                )}

                {/* ── Content Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="lg:!grid-cols-[2fr_1fr]">
                    {/* Programme */}
                    <div style={{
                        background: 'var(--bg-card)', border: '1.5px solid var(--border-strong)',
                        borderRadius: 14, padding: 24, boxShadow: 'var(--card-shadow)',
                    }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BookOpen style={{ width: 20, height: 20, color: 'var(--accent)' }} /> Programme ({course.lessons?.length ?? 0} leçons)
                        </h2>
                        {!course.lessons?.length ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Aucune leçon disponible</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {course.lessons.map((lesson, i) => {
                                    const done = progress?.completedLessons?.includes(lesson._id);
                                    return (
                                        <div key={lesson._id} style={{
                                            display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                                            borderRadius: 12, background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border)', transition: 'background 0.2s',
                                        }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 12, fontWeight: 700, flexShrink: 0,
                                                background: done ? 'rgba(16,185,129,0.15)' : 'var(--bg-card)',
                                                color: done ? 'var(--accent)' : 'var(--text-muted)',
                                                border: `1px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                                            }}>
                                                {done ? <CheckCircle style={{ width: 16, height: 16 }} /> : i + 1}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</p>
                                                {lesson.duration > 0 && (
                                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Clock style={{ width: 12, height: 12 }} /> {lesson.duration} min
                                                    </p>
                                                )}
                                            </div>
                                            {!isEnrolled && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>🔒</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {course.instructor && (
                            <div style={{
                                background: 'var(--bg-card)', border: '1.5px solid var(--border-strong)',
                                borderRadius: 14, padding: 20, boxShadow: 'var(--card-shadow)',
                            }}>
                                <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Instructeur</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 12,
                                        background: 'linear-gradient(135deg, var(--accent-light), var(--accent))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0,
                                    }}>
                                        {course.instructor.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{course.instructor.name}</p>
                                        {course.instructor.speciality && (
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{course.instructor.speciality}</p>
                                        )}
                                    </div>
                                </div>
                                {course.instructor.bio && (
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{course.instructor.bio}</p>
                                )}
                            </div>
                        )}

                        <div style={{
                            background: 'var(--bg-card)', border: '1.5px solid var(--border-strong)',
                            borderRadius: 14, padding: 20, boxShadow: 'var(--card-shadow)',
                        }}>
                            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Ce cours inclut</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BookOpen style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                                    {course.lessons?.length ?? 0} leçons
                                </div>
                                {totalDuration > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Clock style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                                        {totalDuration} min de contenu
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Brain style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                                    Quiz adaptatif IA
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <MessageSquare style={{ width: 16, height: 16, color: '#F59E0B' }} />
                                    Tuteur IA disponible
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Star style={{ width: 16, height: 16, color: 'var(--accent)' }} />
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
