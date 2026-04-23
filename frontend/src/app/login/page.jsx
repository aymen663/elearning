'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { getKeycloak, kcReady } from '@/lib/keycloak';
import { GraduationCap, LogIn, ArrowRight, BookOpen, Brain, Award, Shield } from 'lucide-react';
import Link from 'next/link';

const Y = '#D4E157', G = '#0B3D2E';

export default function LoginPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    // Redirect authenticated users to their dashboard
    useEffect(() => {
        if (user) {
            router.replace(
                user.role === 'admin' ? '/admin' :
                user.role === 'instructor' ? '/instructor' :
                '/dashboard'
            );
        }
    }, [user, router]);

    // Wait for Keycloak to be ready
    useEffect(() => {
        kcReady.then(() => setReady(true));
    }, []);

    const handleLogin = () => {
        const kc = getKeycloak();
        if (!kc) return;
        setLoading(true);
        kc.login({
            redirectUri: window.location.origin + '/auth/callback',
        });
    };

    // Don't render login UI if user is already logged in
    if (user) return null;

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#060e0a' }}>

            {/* Animated Background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', width: 600, height: 600, top: '-15%', left: '-10%', background: '#0d4a30', borderRadius: '50%', filter: 'blur(140px)', opacity: 0.4, animation: 'drift 20s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', width: 500, height: 500, bottom: '-10%', right: '-10%', background: '#1a6b42', borderRadius: '50%', filter: 'blur(140px)', opacity: 0.25, animation: 'drift 25s ease-in-out infinite reverse' }} />
                <div style={{ position: 'absolute', width: 300, height: 300, top: '40%', left: '55%', background: Y, borderRadius: '50%', filter: 'blur(150px)', opacity: 0.04, animation: 'drift 18s ease-in-out infinite 5s' }} />
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(212,225,87,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,225,87,.03) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)' }} />
            </div>
            <style>{`@keyframes drift{0%,100%{transform:translate(0,0)}25%{transform:translate(30px,-20px)}50%{transform:translate(-20px,30px)}75%{transform:translate(20px,20px)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes pulse-glow{0%,100%{opacity:0.4}50%{opacity:0.8}}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md mx-4">

                {/* Card */}
                <div className="rounded-3xl border overflow-hidden" style={{
                    background: 'rgba(13, 26, 20, 0.85)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 100px rgba(34,197,94,0.05)'
                }}>

                    {/* Top Section */}
                    <div className="px-8 pt-10 pb-8 text-center">
                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl" style={{
                                    background: `linear-gradient(135deg, ${Y}, #C0CA33)`,
                                    boxShadow: `0 8px 30px rgba(212,225,87,0.25)`
                                }}>
                                    <GraduationCap className="w-8 h-8" style={{ color: G }} />
                                </div>
                                {/* Animated ring */}
                                <div className="absolute -inset-2 rounded-2xl border-2 opacity-20" style={{
                                    borderColor: Y,
                                    animation: 'pulse-glow 3s ease-in-out infinite'
                                }} />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
                            Bienvenue sur <span style={{ color: Y }}>EduAI</span>
                        </h1>
                        <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                            Connectez-vous pour accéder à vos cours, votre tuteur IA et vos certifications.
                        </p>
                    </div>

                    {/* Login Button Section */}
                    <div className="px-8 pb-6">
                        <button
                            onClick={handleLogin}
                            disabled={!ready || loading}
                            className="w-full flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-2xl text-[15px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                            style={{
                                background: loading ? 'rgba(212,225,87,0.8)' : Y,
                                color: G,
                                boxShadow: `0 4px 20px rgba(212,225,87,0.25)`,
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) e.currentTarget.style.boxShadow = '0 8px 30px rgba(212,225,87,0.35)';
                                if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,225,87,0.25)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                    <span>Redirection en cours...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>Se connecter</span>
                                    <ArrowRight className="w-4 h-4 ml-auto transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                Connexion sécurisée SSO
                            </span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        </div>

                        {/* Features mini */}
                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { icon: BookOpen, label: 'Cours interactifs' },
                                { icon: Brain, label: 'Tuteur IA' },
                                { icon: Award, label: 'Certifications' },
                                { icon: Shield, label: 'Sécurisé' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors" style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: Y, opacity: 0.7 }} />
                                    <span className="text-[11px] text-white/40">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>
                        <Link href="/" className="text-xs font-medium transition-colors inline-flex items-center gap-1.5 hover:gap-2.5" style={{ color: 'rgba(255,255,255,0.35)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = Y}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                        >
                            ← Retour à l'accueil
                        </Link>
                    </div>
                </div>

                {/* Bottom text */}
                <p className="text-center mt-6 text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    © {new Date().getFullYear()} EduAI — Plateforme e-learning intelligente
                </p>
            </div>
        </div>
    );
}
