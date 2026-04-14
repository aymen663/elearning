'use client';
import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, MessageSquare, Send, ArrowLeft, MapPin, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1200));
        setSent(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-200 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
                <div className="mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'accueil
                    </Link>

                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-[#0f0f1a] border border-white/5 flex items-center justify-center shadow-xl">
                            <MessageSquare className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-1">EduAI</p>
                            <h1 className="text-3xl font-bold text-white">Contactez-nous</h1>
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm ml-16">Nous sommes là pour vous aider.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Info cards */}
                    <div className="space-y-4">
                        <div className="backdrop-blur-xl bg-[#0f0f1a]/70 border border-white/5 rounded-2xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                                <Mail className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-1">Email</h3>
                            <p className="text-slate-500 text-sm mb-3">Réponse sous 24h.</p>
                            <a
                                href="mailto:contact@eduai.com"
                                className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors"
                            >
                                contact@eduai.com
                            </a>
                        </div>

                        <div className="backdrop-blur-xl bg-[#0f0f1a]/70 border border-white/5 rounded-2xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                                <MapPin className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-1">Localisation</h3>
                            <p className="text-slate-500 text-sm">Tunisie</p>
                        </div>

                        <div className="backdrop-blur-xl bg-[#0f0f1a]/70 border border-white/5 rounded-2xl p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Vos données de contact sont utilisées uniquement pour répondre à votre demande.{' '}
                                <Link href="/privacy" className="text-indigo-400 hover:underline">Politique de confidentialité</Link>
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="md:col-span-2">
                        <div className="backdrop-blur-xl bg-[#0f0f1a]/70 border border-white/5 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-8">
                            {sent ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Message envoyé !</h3>
                                    <p className="text-slate-400 text-sm max-w-xs">
                                        Merci de nous avoir contactés. Nous vous répondrons dans les 24 heures.
                                    </p>
                                    <button
                                        onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                                        className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        Envoyer un autre message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-2">Nom complet</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Votre nom"
                                                className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-2">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="email@exemple.com"
                                                className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Sujet</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={form.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder="De quoi s'agit-il ?"
                                            className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Message</label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            placeholder="Décrivez votre demande..."
                                            className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-all duration-200 shadow-[0_4px_20px_-5px_rgba(79,70,229,0.4)]"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Envoi en cours...
                                            </span>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Envoyer le message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                    <span className="text-slate-500 text-sm">© 2026 EduAI. Tous droits réservés.</span>
                </div>
            </div>
        </div>
    );
}
