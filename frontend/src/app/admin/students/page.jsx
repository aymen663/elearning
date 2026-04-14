'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { Users, Mail, Calendar, Search, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminStudentsPage() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchStudents = async () => {
        try {
            const { data } = await adminAPI.getStudents({ search: search || undefined });
            setStudents(data.students);
        } catch { toast.error('Erreur chargement'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleDelete = async (student) => {
        if (!confirm(`Supprimer définitivement "${student.name}" (${student.email}) ? Cette action est irréversible.`)) return;
        setDeletingId(student._id);
        try {
            await adminAPI.deleteStudent(student._id);
            toast.success(`Étudiant "${student.name}" supprimé`);
            setStudents((prev) => prev.filter((s) => s._id !== student._id));
        } catch { toast.error('Erreur lors de la suppression'); }
        finally { setDeletingId(null); }
    };

    return (
        <Sidebar>
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <Users className="w-7 h-7 text-sky-400" /> Étudiants
                    </h1>
                    <p className="page-subtitle">{students.length} étudiant(s)</p>
                </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setLoading(true); fetchStudents(); }} className="flex gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input className="input pl-10" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <button type="submit" className="btn-secondary">Rechercher</button>
            </form>

            <div className="card p-0 overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Étudiant</th>
                            <th>Email</th>
                            <th>Inscription</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => <tr key={i}>{[...Array(4)].map((_, j) => <td key={j}><div className="h-4 bg-white/5 rounded animate-pulse" /></td>)}</tr>)
                        ) : students.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-12 text-slate-500">Aucun étudiant</td></tr>
                        ) : students.map((s) => (
                            <tr key={s._id} className="hover:bg-white/[0.02] transition-colors">
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                            {s.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-white text-sm">{s.name}</span>
                                    </div>
                                </td>
                                <td><span className="flex items-center gap-1.5 text-sm"><Mail className="w-3.5 h-3.5 text-slate-500" />{s.email}</span></td>
                                <td><span className="text-xs text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(s.createdAt).toLocaleDateString('fr-FR')}</span></td>
                                <td className="text-center">
                                    <button
                                        onClick={() => handleDelete(s)}
                                        disabled={deletingId === s._id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                        title="Supprimer l'étudiant"
                                    >
                                        {deletingId === s._id
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            : <Trash2 className="w-3.5 h-3.5" />
                                        }
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Sidebar>
    );
}
