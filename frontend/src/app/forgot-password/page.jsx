'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { GraduationCap, Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleRequestToken = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await authAPI.resetPassword({ email });
            if (data.resetToken) {

                setResetToken(data.resetToken);
                setStep(2);
                toast.success('Code de réinitialisation obtenu !');
            } else {
                toast.success('Vérifiez vos emails pour le lien de réinitialisation.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur serveur');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Les mots de passe ne correspondent pas');
        }
        if (newPassword.length < 6) {
            return toast.error('Minimum 6 caractères');
        }
        setLoading(true);
        try {
            await authAPI.resetPassword({ token: resetToken, newPassword });
            setDone(true);
            toast.success('Mot de passe réinitialisé !');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lien expiré ou invalide');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md px-4">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {done ? 'Mot de passe réinitialisé !' : 'Mot de passe oublié'}
                    </h1>
                    <p className="text-slate-400 text-sm mt-2">
                        {done ? 'Vous pouvez maintenant vous connecter.' : step === 1 ? 'Entrez votre email pour recevoir un lien de réinitialisation.' : 'Choisissez un nouveau mot de passe.'}
                    </p>
                </div>

                <div className="card">
                    {done ? (
                        <div className="text-center py-4">
                            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                            <p className="text-slate-300 mb-6">Votre mot de passe a été modifié avec succès.</p>
                            <Link href="/login" className="btn-primary w-full justify-center">
                                Se connecter
                            </Link>
                        </div>
                    ) : step === 1 ? (
                        <form onSubmit={handleRequestToken} className="space-y-5">
                            <div>
                                <label className="input-label">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="email"
                                        required
                                        className="input pl-10"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {loading ? 'Envoi...' : 'Envoyer le lien'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="input-label">Nouveau mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type={showPwd ? 'text' : 'password'}
                                        required
                                        className="input pl-10 pr-10"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                        onClick={() => setShowPwd(!showPwd)}>
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Confirmer le mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type={showPwd ? 'text' : 'password'}
                                        required
                                        className="input pl-10"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                            </button>
                        </form>
                    )}

                    {!done && (
                        <div className="mt-5 text-center">
                            <Link href="/login" className="text-sm text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-1">
                                <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
