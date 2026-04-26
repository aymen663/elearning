'use client';
import { useEffect, useRef, useState } from 'react';
import { studentAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import UserAvatar from '@/components/ui/UserAvatar';
import { useAuthStore } from '@/lib/authStore';
import {
    Mail, BookOpen, Trophy, TrendingUp,
    Edit3, Check, X, Loader2, Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';


function compressImage(file, maxSizeKB = 200) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                const MAX_DIM = 400;
                if (width > MAX_DIM || height > MAX_DIM) {
                    if (width > height) { height = Math.round((height * MAX_DIM) / width); width = MAX_DIM; }
                    else { width = Math.round((width * MAX_DIM) / height); height = MAX_DIM; }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);

                let quality = 0.85;
                let dataUrl = canvas.toDataURL('image/jpeg', quality);

                while (dataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.2) {
                    quality -= 0.1;
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                }
                resolve(dataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

export default function ProfilePage() {
    const { user, updateUser } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [form, setForm] = useState({ name: '', bio: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        Promise.all([studentAPI.getProfile(), studentAPI.getStats()])
            .then(([profRes, statsRes]) => {
                setProfile(profRes.data.user);
                setStats(statsRes.data.stats);
                setForm({ name: profRes.data.user.name, bio: profRes.data.user.bio || '' });
            })
            .catch(() => toast.error('Erreur chargement du profil'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await studentAPI.updateProfile(form);
            setProfile(data.user);
            updateUser({ name: data.user.name, bio: data.user.bio });
            setEditing(false);
            toast.success('Profil mis à jour !');
        } catch {
            toast.error('Erreur lors de la mise à jour');
        } finally { setSaving(false); }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Veuillez sélectionner une image'); return; }

        setUploadingAvatar(true);
        try {
            const dataUrl = await compressImage(file);
            const { data } = await studentAPI.uploadAvatar(dataUrl);
            setProfile(data.user);
            updateUser({ avatar: data.user.avatar });
            toast.success('Photo de profil mise à jour !');
        } catch {
            toast.error('Erreur lors du téléchargement');
        } finally {
            setUploadingAvatar(false);
            e.target.value = '';
        }
    };

    if (loading) return (
        <Sidebar><div className="flex justify-center py-24"><Loader2 className="w-10 h-10 text-teal-400 animate-spin" /></div></Sidebar>
    );

    return (
        <Sidebar>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Mon profil</h1>
                    <p className="page-subtitle">Gérez vos informations personnelles</p>
                </div>
            </div>

            <div className="max-w-2xl space-y-6">
                <div className="card">
                    <div className="flex items-start gap-5">
                        <div className="relative flex-shrink-0 group">
                            <div className="rounded-2xl overflow-hidden w-20 h-20 shadow-lg shadow-teal-500/20">
                                <UserAvatar user={profile} size="xl" />
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                title="Changer la photo de profil"
                                className="absolute inset-0 rounded-2xl flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                                style={{ background: 'rgba(0,0,0,0.5)' }}
                            >
                                {uploadingAvatar
                                    ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    : <Camera className="w-6 h-6 text-white" />
                                }
                            </button>

                            {!uploadingAvatar && (
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal-600 border-2 border-[#1a1a2e] flex items-center justify-center cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}>
                                    <Camera className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            {editing ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="input-label">Nom complet</label>
                                        <input className="input" value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="input-label">Biographie</label>
                                        <textarea rows={3} className="input resize-none"
                                            placeholder="Parlez de vous, vos intérêts, objectifs..."
                                            value={form.bio}
                                            onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                                    </div>
                                    <div className="flex gap-3 pt-1">
                                        <button onClick={handleSave} disabled={saving} className="btn-primary">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                        <button onClick={() => { setForm({ name: profile.name, bio: profile.bio || '' }); setEditing(false); }} className="btn-ghost">
                                            <X className="w-4 h-4" /> Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
                                        <span className="badge-indigo text-[10px] capitalize">{profile?.role || 'étudiant'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                                        <Mail className="w-3.5 h-3.5" />
                                        {profile?.email}
                                    </div>
                                    {profile?.bio ? (
                                        <p className="text-sm text-slate-300 leading-relaxed mb-4">{profile.bio}</p>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic mb-4">Aucune biographie renseignée.</p>
                                    )}
                                    <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
                                        <Edit3 className="w-4 h-4" /> Modifier le profil
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-4 text-center">
                        Passez la souris sur l'avatar et cliquez pour changer votre photo · JPG, PNG, WebP
                    </p>
                </div>

                {stats && (
                    <div className="card">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Statistiques</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { icon: <BookOpen className="w-5 h-5 text-teal-400" />, bg: 'bg-teal-600/20', value: stats.totalCourses, label: 'Cours inscrits' },
                                { icon: <Check className="w-5 h-5 text-emerald-400" />, bg: 'bg-emerald-600/20', value: stats.completedCourses, label: 'Terminés' },
                                { icon: <TrendingUp className="w-5 h-5 text-amber-400" />, bg: 'bg-amber-600/20', value: `${stats.averageCompletion}%`, label: 'Progression moy.' },
                                { icon: <Trophy className="w-5 h-5 text-teal-400" />, bg: 'bg-teal-600/20', value: `${stats.avgScore}%`, label: 'Score quiz moy.' },
                            ].map(({ icon, bg, value, label }) => (
                                <div key={label} className="text-center">
                                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>{icon}</div>
                                    <p className="text-xl font-bold text-white">{value}</p>
                                    <p className="text-xs text-slate-500">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="card">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Informations du compte</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Email', value: profile?.email },
                            { label: 'Rôle', value: profile?.role },
                            { label: 'Méthode de connexion', value: profile?.provider === 'keycloak' ? '🔐 Keycloak' : profile?.provider === 'google' ? '🔵 Google' : profile?.provider === 'github' ? '⬛ GitHub' : '🔑 Email/Mot de passe' },
                            { label: 'Membre depuis', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : '—' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                                <span className="text-sm text-slate-400">{label}</span>
                                <span className="text-sm text-white capitalize">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}
