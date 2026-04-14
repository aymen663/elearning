'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { progressAPI, studentAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Sidebar from '@/components/layout/Sidebar';
import {
  BookOpen, CheckCircle, TrendingUp, Trophy,
  ArrowRight, Zap, Brain, Target, Star
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

/* ─── Lordicon URLs ─── */
const ICONS = {
  enrolled:   'https://cdn.lordicon.com/wxnxiano.json',
  completed:  'https://cdn.lordicon.com/lznlxwtc.json',
  progress:   'https://cdn.lordicon.com/qhviklyi.json',
  trophy:     'https://cdn.lordicon.com/oqdmuxru.json',
};

/* ─── Lordicon Stat Card ─── */
function StatCard({ src, label, value, gradient, sub }) {
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
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Progress ring SVG ─── */
function ProgressRing({ percentage }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  return (
    <svg width="72" height="72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="url(#grad)" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Skeleton ─── */
function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.07] p-5 flex items-center gap-4 animate-pulse">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-12 rounded bg-white/[0.07]" />
              <div className="h-3 w-20 rounded bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 rounded bg-white/[0.07]" />
                <div className="h-2.5 w-1/2 rounded bg-white/[0.04]" />
              </div>
              <div className="w-16 h-16 rounded-full bg-white/[0.05]" />
            </div>
            <div className="h-2 rounded-full bg-white/[0.04] w-full" />
            <div className="flex gap-2">
              <div className="h-8 flex-1 rounded-lg bg-white/[0.05]" />
              <div className="h-8 w-8 rounded-lg bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Page ─── */
export default function DashboardPage() {

  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([progressAPI.getMyProgress(), studentAPI.getStats()])
      .then(([progRes, statsRes]) => {
        setProgress(progRes.data.progress || []);
        setStats(statsRes.data.stats);
      })
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false));
  }, [user]);

  const inProgress = progress.filter((p) => p.completionPercentage > 0 && p.completionPercentage < 100);
  const completed  = progress.filter((p) => p.completionPercentage === 100);
  const notStarted = progress.filter((p) => p.completionPercentage === 0);

  return (
    <Sidebar>
      <Script src="https://cdn.lordicon.com/lordicon.js" strategy="lazyOnload" />

      <div className="page-header">
        <div>
          <h1 className="page-title">Mon espace</h1>
          <p className="page-subtitle">Suivez votre progression et continuez votre apprentissage</p>
        </div>
        <Link href="/courses" className="btn-primary">
          <BookOpen className="w-4 h-4" /> Explorer les cours
        </Link>
      </div>

      {/* ── Stat cards with Lordicon ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard src={ICONS.enrolled}  label="Cours inscrits"    value={stats?.totalCourses ?? '—'}                gradient="#6366f1" />
        <StatCard src={ICONS.completed} label="Terminés"          value={stats?.completedCourses ?? '—'}            gradient="#10b981" />
        <StatCard src={ICONS.progress}  label="Progression moy."  value={`${stats?.averageCompletion ?? 0}%`}        gradient="#f59e0b" />
        <StatCard src={ICONS.trophy}    label="Score quiz moy."   value={`${stats?.avgScore ?? 0}%`}                 gradient="#a855f7"
          sub={`${stats?.totalQuizAttempts ?? 0} tentative(s)`} />
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : progress.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">Commencez à apprendre</h2>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto">Inscrivez-vous à votre premier cours et commencez votre parcours d&apos;apprentissage.</p>
          <Link href="/courses" className="btn-primary mx-auto w-fit">Explorer le catalogue</Link>
        </div>
      ) : (
        <>
          {inProgress.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">En cours</h2>
                <span className="badge-slate text-xs">{inProgress.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgress.map((p) => <CourseProgressCard key={p._id} p={p} />)}
              </div>
            </section>
          )}

          {notStarted.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-white">Pas encore commencé</h2>
                <span className="badge-slate text-xs">{notStarted.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notStarted.map((p) => <CourseProgressCard key={p._id} p={p} />)}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Terminés</h2>
                <span className="badge-slate text-xs">{completed.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map((p) => <CourseProgressCard key={p._id} p={p} />)}
              </div>
            </section>
          )}
        </>
      )}
    </Sidebar>
  );
}

function CourseProgressCard({ p }) {
  const pct = p.completionPercentage || 0;
  const totalLessons = p.course?.lessonCount ?? p.course?.lessons?.length ?? 0;
  const isComplete = pct === 100;

  return (
    <div className="card group flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
            {isComplete
              ? <CheckCircle className="w-5 h-5 text-emerald-400" />
              : <BookOpen className="w-5 h-5 text-indigo-400" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{p.course?.title || 'Cours'}</h3>
            <p className="text-xs text-slate-500 capitalize">{p.course?.category}</p>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <ProgressRing percentage={pct} />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white select-none"
            style={{ transform: 'rotate(90deg)' }}>
            {pct}%
          </span>
        </div>
      </div>

      <div className="text-xs text-slate-500 flex items-center gap-3">
        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {p.completedLessons?.length}/{totalLessons} leçons</span>
        {p.quizScores?.length > 0 && (
          <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> {p.quizScores.length} quiz</span>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        <Link href={`/courses/${p.course?._id}/learn`} className="btn-secondary flex-1 justify-center text-xs py-2">
          {isComplete ? 'Revoir' : 'Continuer'} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link href={`/courses/${p.course?._id}/quiz`} className="btn-ghost px-3 py-2" title="Quiz adaptatif">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
        </Link>
        <Link href={`/courses/${p.course?._id}/chat`} className="btn-ghost px-3 py-2" title="Tuteur IA">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </Link>
      </div>
    </div>
  );
}
