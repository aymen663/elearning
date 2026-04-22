'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { Plus, Search, Trash2, Pencil, BookOpen, Users, CheckCircle, XCircle, GraduationCap, MailCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function TeachersPage() {
    const [teachers, setTeachers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [resending, setResending] = useState(null); // id du prof en cours de renvoi

    const fetchTeachers = async () => {
        try {
            const { data } = await adminAPI.getTeachers({ search: search || undefined });
            setTeachers(data.teachers);
        } catch {
            toast.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTeachers(); }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        fetchTeachers();
    };

    const handleDeactivate = async (id, name) => {
        if (!confirm(`Désactiver le compte de ${name} ?`)) return;
        try {
            await adminAPI.deleteTeacher(id);
            toast.success('Instructeur désactivé');
            setTeachers((prev) => prev.map((t) => (t._id === id ? { ...t, isActive: false } : t)));
        } catch {
            toast.error('Erreur lors de la désactivation');
        }
    };

    const handleResend = async (id, email) => {
        if (!confirm(`Renvoyer l'email de confirmation à ${email} ?`)) return;
        setResending(id);
        try {
            await adminAPI.resendVerification(id);
            toast.success(`Email renvoyé à ${email}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors du renvoi');
        } finally {
            setResending(null);
        }
    };

    const SkeletonCard = () => (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 animate-pulse space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-3/4" />
                </div>
                <div className="h-6 w-14 bg-white/10 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
                <div className="h-6 w-20 bg-white/10 rounded-full" />
                <div className="h-4 w-12 bg-white/5 rounded" />
                <div className="h-4 w-12 bg-white/5 rounded" />
            </div>
        </div>
    );

    return (
        <Sidebar>
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <GraduationCap className="w-7 h-7 text-teal-400" /> Professeurs
                    </h1>
                    <p className="page-subtitle">{teachers.length} instructeur(s) enregistré(s)</p>
                </div>
                <Link href="/admin/teachers/new" className="btn-primary">
                    <Plus className="w-4 h-4" /> Ajouter
                </Link>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        className="input pl-10"
                        placeholder="Rechercher par nom, email, spécialité..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn-secondary">Rechercher</button>
            </form>

            {/* ── Desktop Table (md+) ── */}
            <div className="hidden md:block card p-0 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/[0.06] text-xs text-slate-500 uppercase tracking-wide">
                            <th className="px-5 py-3.5 text-left font-medium">Professeur</th>
                            <th className="px-4 py-3.5 text-left font-medium">Spécialité</th>
                            <th className="px-4 py-3.5 text-center font-medium">Cours</th>
                            <th className="px-4 py-3.5 text-center font-medium">Étudiants</th>
                            <th className="px-4 py-3.5 text-center font-medium">Statut</th>
                            <th className="px-4 py-3.5 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {[...Array(6)].map((_, j) => (
                                        <td key={j} className="px-4 py-3.5">
                                            <div className="h-4 bg-white/5 rounded" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : teachers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-14 text-slate-500">
                                    Aucun professeur trouvé
                                </td>
                            </tr>
                        ) : (
                            teachers.map((t) => (
                                <tr key={t._id} className="hover:bg-white/[0.02] transition-colors group">
                                    {/* Name + Email */}
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                                {t.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-white text-sm truncate">{t.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{t.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Speciality */}
                                    <td className="px-4 py-3.5">
                                        {t.speciality
                                            ? <span className="badge-indigo text-xs">{t.speciality}</span>
                                            : <span className="text-slate-600 text-xs">—</span>}
                                    </td>
                                    {/* Courses */}
                                    <td className="px-4 py-3.5 text-center">
                                        <span className="inline-flex items-center gap-1 text-slate-300 text-xs">
                                            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                                            {t.courseCount ?? 0}
                                        </span>
                                    </td>
                                    {/* Students */}
                                    <td className="px-4 py-3.5 text-center">
                                        <span className="inline-flex items-center gap-1 text-slate-300 text-xs">
                                            <Users className="w-3.5 h-3.5 text-slate-500" />
                                            {t.totalStudents ?? 0}
                                        </span>
                                    </td>
                                    {/* Status */}
                                    <td className="px-4 py-3.5 text-center">
                                        {t.isActive
                                            ? <span className="badge-green inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Actif</span>
                                            : <span className="badge-red inline-flex items-center gap-1"><XCircle className="w-3 h-3" /> Inactif</span>}
                                    </td>
                                    {/* Actions */}
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            {!t.isActive && (
                                                <button
                                                    onClick={() => handleResend(t._id, t.email)}
                                                    disabled={resending === t._id}
                                                    title="Renvoyer l'email de confirmation"
                                                    className="btn-ghost py-1.5 px-3 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-400/40"
                                                >
                                                    {resending === t._id
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        : <MailCheck className="w-3.5 h-3.5" />}
                                                    Renvoyer lien
                                                </button>
                                            )}
                                            <Link href={`/admin/teachers/${t._id}`} className="btn-ghost py-1.5 px-3 text-xs">
                                                <Pencil className="w-3.5 h-3.5" /> Modifier
                                            </Link>
                                            {t.isActive && (
                                                <button
                                                    onClick={() => handleDeactivate(t._id, t.name)}
                                                    className="btn-danger py-1.5 px-3 text-xs"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile Cards (< md) ── */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                ) : teachers.length === 0 ? (
                    <div className="text-center py-14 text-slate-500 text-sm">
                        Aucun professeur trouvé
                    </div>
                ) : (
                    teachers.map((t) => (
                        <div
                            key={t._id}
                            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3"
                        >
                            {/* Top row: avatar + name + status */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                        {t.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-white text-sm truncate">{t.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{t.email}</p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    {t.isActive
                                        ? <span className="badge-green inline-flex items-center gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Actif</span>
                                        : <span className="badge-red inline-flex items-center gap-1 text-xs"><XCircle className="w-3 h-3" /> Inactif</span>}
                                </div>
                            </div>

                            {/* Middle row: speciality + stats */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                {t.speciality
                                    ? <span className="badge-indigo">{t.speciality}</span>
                                    : <span className="text-slate-600">Spécialité non définie</span>}
                                <span className="flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                                    {t.courseCount ?? 0} cours
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5 text-slate-500" />
                                    {t.totalStudents ?? 0} étudiants
                                </span>
                                <span className="text-slate-600 ml-auto">
                                    {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                            </div>

                            {/* Actions row */}
                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/[0.05]">
                                {!t.isActive && (
                                    <button
                                        onClick={() => handleResend(t._id, t.email)}
                                        disabled={resending === t._id}
                                        title="Renvoyer l'email de confirmation"
                                        className="btn-ghost py-1.5 px-3 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-400/40"
                                    >
                                        {resending === t._id
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            : <MailCheck className="w-3.5 h-3.5" />}
                                        Renvoyer lien
                                    </button>
                                )}
                                <Link href={`/admin/teachers/${t._id}`} className="btn-ghost py-1.5 px-3 text-xs">
                                    <Pencil className="w-3.5 h-3.5" /> Modifier
                                </Link>
                                {t.isActive && (
                                    <button
                                        onClick={() => handleDeactivate(t._id, t.name)}
                                        className="btn-danger py-1.5 px-3 text-xs"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Sidebar>
    );
}
