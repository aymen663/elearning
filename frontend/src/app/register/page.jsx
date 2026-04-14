'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, UserPlus, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { getKeycloak } from '@/lib/keycloak';
import toast from 'react-hot-toast';


function Divider({ label = 'ou' }) {
    return (
        <div className="flex items-center gap-3 my-5">
            <div className="flex-1" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                backgroundSize: '6px 6px', height: '1px',
            }} />
            <span className="text-xs px-1 whitespace-nowrap" style={{ color: 'rgba(148,163,184,0.6)' }}>{label}</span>
            <div className="flex-1" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                backgroundSize: '6px 6px', height: '1px',
            }} />
        </div>
    );
}


function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
        </svg>
    );
}


function GitHubIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.111.82-.261.82-.577v-2.165c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const { user, isLoading } = useAuthStore();
    const [role, setRole] = useState('student');


    useEffect(() => {
        if (!user) return;
        if (user.role === 'admin') router.push('/admin');
        else if (user.role === 'instructor') router.push('/instructor');
        else router.push('/dashboard');
    }, [user, router]);


    const handleRegister = () => {
        const kc = getKeycloak();
        if (!kc) { toast.error('Keycloak non disponible'); return; }
        kc.register({ redirectUri: window.location.origin + '/dashboard' });
    };


    const handleLogin = () => {
        const kc = getKeycloak();
        if (!kc) { toast.error('Keycloak non disponible'); return; }
        kc.login({ redirectUri: window.location.origin + '/dashboard' });
    };


    const handleSocialLogin = (provider) => {
        const kc = getKeycloak();
        if (!kc) { toast.error('Keycloak non disponible'); return; }
        kc.login({
            idpHint: provider,
            redirectUri: window.location.origin + '/dashboard',
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f] text-slate-200">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse-slow object-delay"></div>

            <div className="relative z-10 w-full max-w-[420px] px-4">
                <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="w-16 h-16 rounded-2xl bg-[#0f0f1a] border border-white/5 mx-auto mb-6 shadow-xl flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Créer un compte</h1>
                    <p className="text-slate-400 text-sm mt-2">Rejoignez la plateforme <span className="text-indigo-400 font-semibold">EduAI</span></p>
                </div>

                <div className="backdrop-blur-xl bg-[#0f0f1a]/70 border border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl relative z-10 animate-fade-in p-8" style={{ animationDelay: '0.2s' }}>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-[#17171f] hover:bg-[#22222d] hover:border-white/20 text-white text-[15px] font-medium transition-all duration-200 cursor-pointer"
                        >
                            <GoogleIcon />
                            S&apos;inscrire avec Google
                        </button>

                        <button
                            onClick={() => handleSocialLogin('github')}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-[#17171f] hover:bg-[#22222d] hover:border-white/20 text-white text-[15px] font-medium transition-all duration-200 cursor-pointer"
                        >
                            <GitHubIcon />
                            S&apos;inscrire avec GitHub
                        </button>
                    </div>

                    <Divider label="ou avec email" />

                    <div className="space-y-5">
                        <div>
                            <p className="text-sm font-semibold text-slate-300 mb-3">Je suis…</p>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('student')}
                                    className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center gap-1.5 transition-all ${role === 'student'
                                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500'
                                        : 'border-white/10 text-slate-400 bg-[#0a0a0f] hover:border-white/20 hover:bg-white/[0.02]'
                                        }`}
                                >
                                    <GraduationCap className="w-5 h-5" /> Étudiant
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleRegister}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-[0_4px_20px_-5px_rgba(79,70,229,0.4)]"
                        >
                            {isLoading
                                ? <><Loader2 className="w-5 h-5 animate-spin" /> Redirection...</>
                                : <><UserPlus className="w-5 h-5" /> Créer mon compte</>
                            }
                        </button>
                    </div>

                    <Divider label="Déjà inscrit ?" />

                    <button
                        onClick={handleLogin}
                        className="w-full py-3.5 rounded-xl border border-white/5 bg-transparent text-indigo-400 text-sm font-semibold
                                   hover:border-indigo-500/30 hover:bg-white/[0.02]
                                   transition-all duration-200"
                    >
                        Se connecter
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">
                            Authentification sécurisée par <span className="text-indigo-400 font-semibold">Keycloak</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
