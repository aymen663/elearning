'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import { getKeycloak } from '@/lib/keycloak';
import toast from 'react-hot-toast';
import {
    GraduationCap, Brain, Award, BarChart2,
    ArrowRight, Sparkles, BookOpen, Users, Zap, CheckCircle
} from 'lucide-react';

const FEATURES = [
    {
        icon: Brain,
        title: 'Tuteur IA par RAG',
        desc: 'Un assistant intelligent entraîné sur le contenu de chaque cours répond à vos questions en temps réel.',
        color: 'from-indigo-500/20 to-purple-500/20',
        iconColor: 'text-indigo-400',
    },
    {
        icon: Zap,
        title: 'Quiz adaptatifs',
        desc: 'Des quiz générés par Llama 3.3 (Groq), adaptés à votre niveau et au contenu des leçons pour maximiser l\'apprentissage.',
        color: 'from-amber-500/20 to-orange-500/20',
        iconColor: 'text-amber-400',
    },
    {
        icon: Award,
        title: 'Certifications',
        desc: 'Obtenez une certification à la fin de chaque cours complété à 100% et valorisez votre parcours.',
        color: 'from-emerald-500/20 to-teal-500/20',
        iconColor: 'text-emerald-400',
    },
    {
        icon: BarChart2,
        title: 'Suivi de progression',
        desc: 'Visualisez en temps réel votre avancement leçon par leçon et vos scores aux différents quiz.',
        color: 'from-rose-500/20 to-pink-500/20',
        iconColor: 'text-rose-400',
    },
];

const STATS = [
    { value: 'IA', label: 'Cours générés', icon: BookOpen },
    { value: '100%', label: 'Personnalisés', icon: Users },
    { value: 'Llama 3.3', label: 'Moteur IA', icon: Brain },
    { value: '100%', label: 'Gratuit pour tester', icon: CheckCircle },
];

export default function HomePage() {
    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) return;
        if (user.role === 'admin') router.replace('/admin');
        else if (user.role === 'instructor') router.replace('/instructor');
        else router.replace('/dashboard');
    }, [user, router]);

    const handleLogin = (e) => {
        if (e) e.preventDefault();
        const kc = getKeycloak();
        if (!kc) {
            toast.error("Connexion en cours d'initialisation...");
            return;
        }
        kc.login({ redirectUri: window.location.origin + '/auth/callback' });
    };

    return (
        <div className="min-h-screen bg-[#0f0f1a] text-white overflow-x-hidden">
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] backdrop-blur-xl"
                style={{ background: 'rgba(15,15,26,0.85)' }}>
                <div className="w-full px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg">EduAI</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleLogin} className="btn-ghost text-sm px-4 py-2">Se connecter</button>
                        <Link href="/register" className="btn-primary text-sm px-4 py-2">Commencer</Link>
                    </div>
                </div>
            </nav>

            <section className="relative pt-32 pb-24 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/3 right-1/5 w-[300px] h-[300px] bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

                <div className="relative w-full px-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
                        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
                        <Sparkles className="w-3.5 h-3.5" />
                        Powered by Llama 3.3
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
                        Apprenez avec un{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400">
                            tuteur IA
                        </span>
                        {' '}personnel
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-400 mx-auto mb-10 leading-relaxed max-w-3xl">
                        EduAI combine des cours de qualité avec un tuteur basé sur l&apos;IA générative
                        pour vous offrir une expérience d&apos;apprentissage unique et personnalisée.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register"
                            className="btn-primary text-base px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/20">
                            Créer un compte gratuit <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button onClick={handleLogin}
                            className="btn-secondary text-base px-8 py-3.5 rounded-xl">
                            Se connecter
                        </button>
                    </div>
                </div>
            </section>

            <section className="py-12 border-y border-white/[0.05]"
                style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="w-full px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {STATS.map(({ value, label, icon: Icon }) => (
                        <div key={label} className="text-center">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center mx-auto mb-3">
                                <Icon className="w-5 h-5 text-indigo-400" />
                            </div>
                            <p className="text-3xl font-black text-white mb-1">{value}</p>
                            <p className="text-sm text-slate-500">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="py-20">
                <div className="w-full px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                            Tout ce dont vous avez besoin
                        </h2>
                        <p className="text-slate-400 max-w-lg mx-auto">
                            Une plateforme complète pensée pour maximiser votre apprentissage grâce à l&apos;IA.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {FEATURES.map(({ icon: Icon, title, desc, color, iconColor }) => (
                            <div key={title}
                                className="rounded-2xl p-6 border border-white/[0.06] hover:border-indigo-500/20 transition-all duration-300 group"
                                style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className={`w-6 h-6 ${iconColor}`} />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="w-full px-8 text-center">
                    <div className="rounded-3xl p-10 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />
                        <div className="relative">
                            <GraduationCap className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                            <h2 className="text-3xl font-black text-white mb-3">
                                Prêt à commencer ?
                            </h2>
                            <p className="text-slate-400 mb-8">
                                Rejoignez des milliers d&apos;étudiants qui apprennent déjà avec EduAI.
                            </p>
                            <Link href="/register"
                                className="btn-primary text-base px-8 py-3.5 rounded-xl mx-auto w-fit shadow-lg shadow-indigo-500/20">
                                Commencer gratuitement <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="border-t border-white/[0.05] py-8 px-8 text-sm text-slate-600">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <GraduationCap className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span>© 2026 EduAI · Plateforme e-learning intelligente</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
                            Politique de confidentialité
                        </Link>
                        <Link href="/terms" className="hover:text-indigo-400 transition-colors">
                            Conditions de service
                        </Link>
                        <Link href="/delete-data" className="hover:text-indigo-400 transition-colors">
                            Suppression des données
                        </Link>
                        <Link href="/contact" className="hover:text-indigo-400 transition-colors">
                            Contactez-nous
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
