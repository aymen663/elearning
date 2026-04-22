'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import { getKeycloak } from '@/lib/keycloak';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { GraduationCap, Brain, Award, BarChart2, ArrowRight, Sparkles, BookOpen, Users, Zap, CheckCircle, Play, Clock, Wallet, Star, Quote, ChevronRight, Monitor, Shield, Palette, Cloud } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const fade = (d = 0) => ({ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: d * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] } } });
const slideR = { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };
const Y = '#D4E157', G = '#0B3D2E';

const FEATURES = [
    { icon: Brain, title: 'Tuteur IA', desc: 'Assistant intelligent entrainé sur chaque cours, répond en temps réel.' },
    { icon: Zap, title: 'Quiz adaptatifs', desc: 'Quiz générés par IA, adaptés à votre niveau.' },
    { icon: Award, title: 'Certifications', desc: 'Certification vérifiable à chaque cours complété.' },
    { icon: BarChart2, title: 'Suivi progression', desc: 'Avancement détaillé leçon par leçon.' },
];
const BENEFITS = [
    { icon: Clock, title: 'Planning flexible', desc: 'Apprenez à votre rythme.' },
    { icon: Wallet, title: 'Accessible à tous', desc: 'Cours gratuits et abordables.' },
    { icon: Brain, title: 'Tuteur IA expert', desc: 'Basé sur Llama 3.3 70B.' },
    { icon: Monitor, title: 'Multi-plateforme', desc: 'PC, tablette ou mobile.' },
];
const COURSES = [
    { title: 'Intelligence Artificielle & Machine Learning', cat: 'IA', students: 342, lessons: 18, icon: Brain, grad: 'from-emerald-600 to-teal-700', glow: '#10B981' },
    { title: 'Développement Web Full-Stack React & Node', cat: 'Dev', students: 521, lessons: 24, icon: Monitor, grad: 'from-blue-600 to-indigo-700', glow: '#3B82F6' },
    { title: 'Cybersécurité : Protégez vos systèmes', cat: 'Sécu', students: 198, lessons: 12, icon: Shield, grad: 'from-amber-600 to-orange-700', glow: '#F59E0B' },
    { title: 'Data Science avec Python', cat: 'Data', students: 415, lessons: 20, icon: BarChart2, grad: 'from-violet-600 to-purple-700', glow: '#8B5CF6' },
    { title: 'Design UX/UI Mobile', cat: 'Design', students: 287, lessons: 15, icon: Palette, grad: 'from-rose-600 to-pink-700', glow: '#F43F5E' },
    { title: 'Cloud Computing AWS & GCP', cat: 'Cloud', students: 156, lessons: 16, icon: Cloud, grad: 'from-sky-600 to-blue-700', glow: '#0EA5E9' },
];
const CHECKS = ['Maîtrisez les compétences qui comptent', 'Apprenez avec des tuteurs IA experts', 'Méthodes pédagogiques efficaces', 'Progressez chaque semaine'];

export default function HomePage() {
    const router = useRouter();
    const { user } = useAuthStore();
    useEffect(() => { if (!user) return; router.replace(user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/dashboard'); }, [user, router]);
    const login = () => { const kc = getKeycloak(); if (!kc) return toast.error("Connexion en cours..."); kc.login({ redirectUri: window.location.origin + '/auth/callback' }); };

    return (
        <div className="min-h-screen overflow-x-hidden" style={{ background: G }}>

            <Header />

            {/* HERO */}
            <section className="relative pt-24 pb-12 min-h-[80vh] flex items-center overflow-hidden">
                <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.22, 0.12] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-1/4 right-[10%] w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, #1B5E40, transparent 70%)' }} />
                {/* Floating dots */}
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[15%] left-[5%] w-2.5 h-2.5 rounded-full" style={{ background: Y, opacity: 0.4 }} />
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute top-[25%] right-[8%] w-2 h-2 rounded-full" style={{ background: Y, opacity: 0.25 }} />
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }} className="absolute bottom-[20%] left-[12%] w-3 h-3 rounded-full" style={{ background: Y, opacity: 0.3 }} />
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className="absolute top-[60%] right-[4%] w-1.5 h-1.5 rounded-full" style={{ background: Y, opacity: 0.35 }} />
                <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} className="absolute top-[45%] left-[3%] w-2 h-2 rounded-full" style={{ background: Y, opacity: 0.2 }} />
                <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 3 }} className="absolute bottom-[30%] right-[15%] w-1.5 h-1.5 rounded-full" style={{ background: '#4CAF50', opacity: 0.3 }} />
                <motion.div animate={{ y: [0, -11, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }} className="absolute top-[10%] right-[35%] w-2 h-2 rounded-full" style={{ background: '#81C784', opacity: 0.2 }} />

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
                    <div className="max-w-lg">
                        <motion.h1 variants={fade(1)} initial="hidden" animate="visible" className="text-[3.4rem] lg:text-[4rem] font-black leading-[1.05] mb-6 text-white">
                            La meilleure plateforme <span style={{ color: Y }}>d'apprentissage</span> en ligne.
                        </motion.h1>
                        <motion.p variants={fade(2)} initial="hidden" animate="visible" className="text-white/50 text-base leading-relaxed mb-7 max-w-md">
                            Des cours créés par les meilleurs experts, un tuteur IA personnel, et des quiz adaptatifs pour transformer votre avenir.
                        </motion.p>
                        <motion.div variants={fade(3)} initial="hidden" animate="visible" className="flex items-center gap-4 mb-10">
                            <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} onClick={login} className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-full shadow-xl text-[15px]" style={{ background: Y, color: G }}><Sparkles className="w-4 h-4" /> Commencer</motion.button>
                            <button onClick={login} className="inline-flex items-center gap-2 text-white/80 font-semibold text-[15px] hover:text-white">Comment ça marche <Play className="w-5 h-5 ml-0.5" /></button>
                        </motion.div>
                        <motion.div variants={fade(4)} initial="hidden" animate="visible" className="flex items-center gap-10 pt-2 border-t border-white/[0.06]">
                            {[['260+', 'Cours'], ['5340+', 'Étudiants'], ['280+', 'Certifiés']].map(([v, l]) => <div key={l} className="pt-3"><p className="text-2xl font-black text-white">{v}</p><p className="text-[11px] text-white/40 mt-0.5">{l}</p></div>)}
                        </motion.div>
                    </div>

                    <motion.div variants={slideR} initial="hidden" animate="visible" className="hidden lg:flex items-center justify-center relative">
                        <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 5, repeat: Infinity }} className="absolute w-[440px] h-[440px] rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, #1B5E40, #0D4A35)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.7 }} className="relative z-10">
                            <div className="w-[380px] h-[380px] rounded-full overflow-hidden shadow-2xl border-4 border-white/10">
                                <img src="/images/hero-student.png" alt="Étudiant EduAI" className="w-full h-full object-cover" />
                            </div>
                        </motion.div>
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -top-2 right-8 z-20 bg-white/10 backdrop-blur-xl rounded-2xl p-3.5 border border-white/15 shadow-2xl">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: Y }}><Brain className="w-4 h-4" style={{ color: G }} /></div>
                                <div><p className="text-white text-xs font-bold">Tuteur IA</p><p className="text-white/40 text-[10px]">Llama 3.3</p></div>
                            </div>
                        </motion.div>
                        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                            className="absolute bottom-8 -left-4 z-20 bg-white/10 backdrop-blur-xl rounded-2xl p-3.5 border border-white/15 shadow-2xl">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: Y }}><Award className="w-4 h-4" style={{ color: G }} /></div>
                                <div><p className="text-white text-xs font-bold">Certifications</p><p className="text-white/40 text-[10px]">Vérifiables</p></div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
            {/* FEATURES */}
            <section id="fonctionnalités" className="py-16 relative" style={{ background: '#0E4534' }}>
                <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #D4E157, transparent 70%)' }} />
                <div className="absolute bottom-10 right-[10%] w-[300px] h-[300px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #81C784, transparent 70%)' }} />

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ background: 'rgba(212,225,87,0.12)', color: Y }}><CheckCircle className="w-3.5 h-3.5" /> Fonctionnalités</div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight max-w-lg">Tout ce dont vous avez besoin pour <span style={{ color: Y }}>réussir</span>.</h2>
                    </motion.div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-auto">
                        {/* Featured: Tuteur IA - large */}
                        <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                            whileHover={{ y: -4 }} className="lg:col-span-7 rounded-2xl p-7 border border-white/[0.08] hover:border-white/20 transition-all relative overflow-hidden group"
                            style={{ background: 'linear-gradient(135deg, rgba(212,225,87,0.08), rgba(255,255,255,0.03))' }}>
                            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" style={{ background: 'radial-gradient(circle, #D4E157, transparent)' }} />
                            <div className="relative flex items-start gap-5">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: Y }}>
                                    <Brain className="w-7 h-7" style={{ color: G }} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-lg mb-2">Tuteur IA personnel</h3>
                                    <p className="text-white/50 text-sm leading-relaxed max-w-md">Assistant intelligent entraîné sur chaque cours. Posez vos questions et obtenez des réponses contextuelles en temps réel, basé sur Llama 3.3.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Featured: Quiz adaptatifs */}
                        <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08, duration: 0.5 }}
                            whileHover={{ y: -4 }} className="lg:col-span-5 rounded-2xl p-7 border border-white/[0.08] hover:border-white/20 transition-all relative overflow-hidden group"
                            style={{ background: 'linear-gradient(135deg, rgba(129,199,132,0.06), rgba(255,255,255,0.02))' }}>
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-15 group-hover:opacity-25 transition-opacity" style={{ background: 'radial-gradient(circle, #81C784, transparent)' }} />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(212,225,87,0.12)' }}>
                                    <Zap className="w-6 h-6" style={{ color: Y }} />
                                </div>
                                <h3 className="text-white font-bold text-base mb-2">Quiz adaptatifs</h3>
                                <p className="text-white/40 text-sm leading-relaxed">Quiz générés par IA qui s'adaptent automatiquement à votre niveau de compétence.</p>
                            </div>
                        </motion.div>

                        {/* Row 2: 4 equal cards */}
                        {[
                            { icon: Award, title: 'Certifications', desc: 'Certification vérifiable à chaque cours complété.' },
                            { icon: BarChart2, title: 'Suivi progression', desc: 'Avancement détaillé leçon par leçon.' },
                            { icon: Clock, title: 'Planning flexible', desc: 'Apprenez à votre rythme, où que vous soyez.' },
                            { icon: Monitor, title: 'Multi-plateforme', desc: 'PC, tablette ou mobile.' },
                        ].map(({ icon: I, title, desc }, i) => (
                            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ delay: 0.12 + i * 0.06, duration: 0.4 }} whileHover={{ y: -3 }}
                                className="lg:col-span-3 rounded-xl p-5 border border-white/[0.06] hover:border-white/15 transition-all"
                                style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: 'rgba(212,225,87,0.1)' }}>
                                    <I className="w-5 h-5" style={{ color: Y }} />
                                </div>
                                <h4 className="text-white font-bold text-sm mb-1">{title}</h4>
                                <p className="text-white/35 text-xs leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}

                        {/* Bottom wide card: Accessible */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.5 }}
                            whileHover={{ y: -3 }} className="lg:col-span-12 rounded-2xl px-7 py-5 border border-white/[0.06] hover:border-white/15 transition-all flex items-center gap-6"
                            style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,225,87,0.1)' }}>
                                <Wallet className="w-5 h-5" style={{ color: Y }} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Accessible à tous</h4>
                                <p className="text-white/35 text-xs">Cours gratuits et abordables pour démocratiser l'éducation de qualité.</p>
                            </div>
                            <motion.button whileHover={{ scale: 1.04 }} onClick={login} className="ml-auto hidden sm:inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded-full text-xs" style={{ background: Y, color: G }}>
                                Explorer <ArrowRight className="w-3.5 h-3.5" />
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="cours" className="py-16 relative overflow-hidden" style={{ background: '#f7f9f4' }}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ background: G, color: Y }}><Sparkles className="w-3.5 h-3.5" /> Simple & efficace</div>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Comment ça marche ?</h2>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">De l'inscription à la certification, un parcours fluide en trois étapes.</p>
                    </motion.div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative mb-16">
                        {/* Animated connector line */}
                        <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                            className="hidden md:block absolute top-12 left-[16.5%] right-[16.5%] h-0.5 origin-left"
                            style={{ background: 'linear-gradient(90deg, #D4E157, #0B3D2E, #D4E157)' }} />

                        {[
                            { step: '01', icon: Users, title: 'Créez votre compte', desc: 'Inscrivez-vous gratuitement en quelques secondes avec SSO. Accédez instantanément à tous les cours.' },
                            { step: '02', icon: BookOpen, title: 'Apprenez à votre rythme', desc: 'Suivez des cours interactifs, posez des questions au tuteur IA et validez avec des quiz adaptatifs.' },
                            { step: '03', icon: Award, title: 'Obtenez vos certifications', desc: 'Complétez les cours et recevez des certifications vérifiables pour valoriser vos compétences.' },
                        ].map(({ step, icon: SIcon, title, desc }, i) => (
                            <motion.div key={step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ delay: i * 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="relative text-center px-6">
                                <motion.div whileHover={{ scale: 1.08, rotate: 3 }} transition={{ type: 'spring', stiffness: 300 }}
                                    className="relative z-10 mx-auto w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-lg border border-gray-100 cursor-pointer"
                                    style={{ background: i === 1 ? G : 'white' }}>
                                    <SIcon className="w-10 h-10" style={{ color: i === 1 ? Y : G }} />
                                    <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                                        transition={{ delay: 0.4 + i * 0.2, type: 'spring', stiffness: 400 }}
                                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shadow-md"
                                        style={{ background: Y, color: G }}>{step}</motion.div>
                                </motion.div>
                                <motion.h3 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                                    transition={{ delay: 0.3 + i * 0.2 }} className="text-gray-900 font-bold text-base mb-2">{title}</motion.h3>
                                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                                    transition={{ delay: 0.4 + i * 0.2 }} className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</motion.p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Dashboard Preview */}
                    <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 max-w-4xl mx-auto" style={{ background: G }}>
                        {/* Browser chrome */}
                        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
                            <div className="flex gap-1.5">
                                {['bg-red-400/80', 'bg-yellow-400/80', 'bg-green-400/80'].map((c, i) => (
                                    <motion.div key={i} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                                        transition={{ delay: 0.6 + i * 0.1, type: 'spring' }} className={`w-2.5 h-2.5 rounded-full ${c}`} />
                                ))}
                            </div>
                            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.9 }}
                                className="flex-1 mx-4"><div className="bg-white/10 rounded-full px-4 py-1 text-[10px] text-white/40 text-center">app.eduai.com/dashboard</div></motion.div>
                        </div>
                        {/* Dashboard content */}
                        <div className="p-6 grid grid-cols-12 gap-4">
                            {/* Sidebar */}
                            <div className="col-span-3 space-y-3">
                                <motion.div initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
                                    className="flex items-center gap-2 mb-5">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: Y }}><GraduationCap className="w-3.5 h-3.5" style={{ color: G }} /></div>
                                    <span className="text-white font-bold text-xs">EduAI</span>
                                </motion.div>
                                {['Dashboard', 'Mes cours', 'Tuteur IA', 'Quiz', 'Certifications'].map((item, i) => (
                                    <motion.div key={item} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                                        transition={{ delay: 0.6 + i * 0.06 }}
                                        className={`text-[11px] px-3 py-2 rounded-lg ${i === 0 ? 'font-bold text-white' : 'text-white/40'}`}
                                        style={i === 0 ? { background: 'rgba(212,225,87,0.15)' } : {}}>{item}</motion.div>
                                ))}
                            </div>
                            {/* Main */}
                            <div className="col-span-9 space-y-4">
                                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
                                    className="flex items-center justify-between">
                                    <div><p className="text-white font-bold text-sm">Bonjour, Ahmed 👋</p><p className="text-white/35 text-[10px]">Continuez votre apprentissage</p></div>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: Y, color: G }}>A</div>
                                </motion.div>
                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[['4', 'Cours en cours'], ['67%', 'Progression'], ['2', 'Certifications']].map(([v, l], i) => (
                                        <motion.div key={l} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                            transition={{ delay: 0.7 + i * 0.1 }}
                                            className="rounded-xl p-3 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                            <p className="text-white font-black text-lg">{v}</p><p className="text-white/30 text-[9px]">{l}</p>
                                        </motion.div>
                                    ))}
                                </div>
                                {/* Animated progress bars */}
                                <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 1 }}
                                    className="rounded-xl p-4 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <p className="text-white font-bold text-xs mb-3">Cours en cours</p>
                                    {[['Intelligence Artificielle', 78], ['React & Node.js', 45], ['Cybersécurité', 23]].map(([name, pct], i) => (
                                        <div key={name} className="mb-2.5 last:mb-0">
                                            <div className="flex justify-between text-[10px] mb-1"><span className="text-white/60">{name}</span><span className="text-white/40">{pct}%</span></div>
                                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                                <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
                                                    transition={{ delay: 1.2 + i * 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                                    className="h-full rounded-full" style={{ background: Y }} />
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
            {/* AMAZING COURSES */}
            <section className="py-12" style={{ background: G }}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative flex justify-center">
                        <div className="w-[360px] h-[360px] rounded-full overflow-hidden relative" style={{ background: 'radial-gradient(circle at 40% 40%, #1B5E40, #0D4A35)' }}>
                            <img src="/images/instructor.png" alt="Instructeur" className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute -top-2 -right-2 w-20 h-20 rounded-full border-[7px] opacity-40" style={{ borderColor: '#C0CA33', borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: Y }}>Expérience premium</p>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-8">Des cours en ligne de qualité exceptionnelle.</h2>
                        {CHECKS.map((t, i) => (
                            <motion.div key={t} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 mb-4">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: Y }}><CheckCircle className="w-3 h-3" style={{ color: G }} /></div>
                                <p className="text-white/65 text-sm">{t}</p>
                            </motion.div>
                        ))}
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={login} className="mt-6 inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-full shadow-lg text-sm" style={{ background: Y, color: G }}>Explorer les cours <ArrowRight className="w-4 h-4" /></motion.button>
                    </motion.div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section id="témoignages" className="py-16 relative" style={{ background: '#0E4534' }}>
                <div className="absolute top-20 right-[5%] w-[350px] h-[350px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #D4E157, transparent 70%)' }} />
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ background: 'rgba(212,225,87,0.12)', color: Y }}><Star className="w-3.5 h-3.5" /> Témoignages</div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Ce que disent nos <span style={{ color: Y }}>utilisateurs</span>.</h2>
                        <p className="text-white/40 text-sm max-w-md mx-auto">Étudiants et professeurs partagent leur expérience sur EduAI.</p>
                    </motion.div>

                    {/* Stats bar */}
                    <div className="flex items-center justify-center gap-10 mb-12">
                        {[['5 340+', 'Étudiants actifs'], ['99%', 'Satisfaction'], ['4.9/5', 'Note moyenne'], ['120+', 'Professeurs']].map(([v, l], i) => (
                            <motion.div key={l} initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                                transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }} className="text-center">
                                <p className="text-2xl font-black text-white">{v}</p>
                                <p className="text-white/30 text-[10px] mt-0.5">{l}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Testimonials grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { name: 'Ahmed Benali', role: 'Étudiant', badge: '🎓', initial: 'A', color: '#10B981', text: "EduAI a transformé ma façon d'apprendre. Le tuteur IA m'a permis de comprendre des concepts complexes en IA que je n'arrivais pas à saisir seul.", rating: 5 },
                            { name: 'Dr. Sarah Mansouri', role: 'Professeure', badge: '👩‍🏫', initial: 'S', color: '#8B5CF6', text: "En tant qu'enseignante, EduAI me permet de créer des cours interactifs rapidement. Les quiz adaptatifs évaluent mes étudiants de manière précise.", rating: 5 },
                            { name: 'Yassine Khelifi', role: 'Étudiant', badge: '🎓', initial: 'Y', color: '#3B82F6', text: "Les certifications EduAI m'ont aidé à décrocher mon premier stage en développement web. Le contenu est à jour et pertinent.", rating: 5 },
                            { name: 'Prof. Karim Boudjema', role: 'Professeur', badge: '👨‍🏫', initial: 'K', color: '#F59E0B', text: "La plateforme est intuitive pour créer et gérer mes cours. Le suivi de progression de mes étudiants est un vrai plus pédagogique.", rating: 5 },
                            { name: 'Amina Rahmani', role: 'Étudiante', badge: '🎓', initial: 'A', color: '#F43F5E', text: "J'apprends la cybersécurité à mon rythme grâce à EduAI. Le tuteur IA répond à mes questions à 2h du matin, c'est incroyable !", rating: 5 },
                            { name: 'Dr. Mohamed Tazi', role: 'Professeur', badge: '👨‍🏫', initial: 'M', color: '#0EA5E9', text: "La fonctionnalité de quiz adaptatifs est révolutionnaire. Chaque étudiant reçoit un parcours personnalisé basé sur ses lacunes.", rating: 4 },
                        ].map(({ name, role, badge, initial, color, text, rating }, i) => (
                            <motion.div key={name} initial={{ opacity: 0, y: 30, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.25 } }}
                                className={`rounded-2xl p-6 border border-white/[0.06] hover:border-white/15 transition-colors cursor-pointer ${i === 0 ? 'md:row-span-1' : ''}`}
                                style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <motion.div whileHover={{ scale: 1.15, rotate: 10 }} transition={{ type: 'spring', stiffness: 300 }}
                                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: color }}>{initial}</motion.div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-sm">{name}</p>
                                        <p className="text-white/35 text-[11px]">{badge} {role}</p>
                                    </div>
                                    <div className="flex gap-0.5">{[...Array(rating)].map((_, s) => (
                                        <motion.div key={s} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                                            transition={{ delay: 0.3 + i * 0.1 + s * 0.05, type: 'spring' }}>
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        </motion.div>
                                    ))}</div>
                                </div>
                                <Quote className="w-5 h-5 mb-2 opacity-15" style={{ color: Y }} />
                                <p className="text-white/55 text-sm leading-relaxed">{text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
