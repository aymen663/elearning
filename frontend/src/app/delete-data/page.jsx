'use client';
import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Trash2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function DeleteDataPage() {
    const [form, setForm] = useState({ name: '', email: '', reason: '' });
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
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">

                {/* Header */}
                <div className="mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'accueil
                    </Link>

                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-[#0f0f1a] border border-rose-500/20 flex items-center justify-center shadow-xl">
                            <Trash2 className="w-6 h-6 text-rose-400" />
                        </div>
                        <div>
                            <p className="text-xs text-rose-400 font-semibold uppercase tracking-widest mb-1">EduAI</p>
                            <h1 className="text-3xl font-bold text-white">Suppression des données</h1>
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm ml-16">Conforme au RGPD — votre droit à l'effacement.</p>
                </div>

                {/* Info block */}
                <div className="backdrop-blur-xl bg-[#0f0f1a]/70 border border-white/5 rounded-2xl p-6 mb-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]">
                    <p className="text-slate-300 leading-relaxed text-sm">
                        Pour supprimer vos données personnelles, contactez-nous à{' '}
                        <a href="mailto:contact@eduai.com" className="text-teal-400 hover:underline font-medium">
                            contact@eduai.com
                        </a>{' '}
                        ou utilisez le formulaire ci-dessous. Nous traiterons votre demande dans un délai de{' '}
                        <strong className="text-white">30 jours</strong> conformément au RGPD.
                    </p>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { label: 'Compte supprimé', desc: 'Votre profil est effacé' },
                            { label: 'Données effacées', desc: 'Progression, quiz, logs' },
                            { label: 'Délai RGPD', desc: 'Sous 30 jours' },
                        ].map((item) => (
                            <div key={item.label} className="bg-[#0a0a0f] border border-white/5 rounded-xl px-4 py-3">
                                <p className="text-white text-xs font-semibold mb-0.5">{item.label}</p>
                                <p className="text-slate-500 text-xs">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="backdrop-blur-xl bg-[#0f0f1a]/70 border border-white/5 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-8">
                    {sent ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Demande envoyée !</h3>
                            <p className="text-slate-400 text-sm max-w-xs">
                                Nous avons bien reçu votre demande. Vos données seront supprimées dans un délai de 30 jours.
                            </p>
                            <Link href="/" className="mt-2 text-sm text-teal-400 hover:text-teal-300 transition-colors">
                                Retour à l'accueil
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <h2 className="text-white font-semibold text-base mb-1 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-teal-400" />
                                Formulaire de suppression
                            </h2>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2">Nom complet</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Votre nom"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2">Adresse email du compte</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="email@exemple.com"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2">Raison (optionnel)</label>
                                <textarea
                                    name="reason"
                                    value={form.reason}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Pourquoi souhaitez-vous supprimer vos données ?"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all resize-none"
                                />
                            </div>

                            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#0a0a0f] border border-rose-500/10">
                                <Trash2 className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Cette action est <strong className="text-slate-300">irréversible</strong>.
                                    Toutes vos données (compte, progression, certificats) seront définitivement supprimées.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-all duration-200 shadow-[0_4px_20px_-5px_rgba(225,29,72,0.4)]"
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
                                        <Trash2 className="w-4 h-4" />
                                        Envoyer la demande de suppression
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-8 flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-teal-400" />
                    <span className="text-slate-500 text-sm">© 2026 EduAI. Tous droits réservés.</span>
                </div>
            </div>
        </div>
    );
}
