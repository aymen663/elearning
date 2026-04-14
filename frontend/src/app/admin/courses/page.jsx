'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { BookOpen, Eye, EyeOff, Trash2, Search, Loader2, CheckCircle, XCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        adminAPI.getAdminCourses()
            .then(({ data }) => setCourses(data.courses || []))
            .catch(() => toast.error('Erreur chargement'))
            .finally(() => setLoading(false));
    }, []);

    const togglePublish = async (id, current) => {
        try {
            await adminAPI.togglePublish(id);
            setCourses((prev) => prev.map((c) => c._id === id ? { ...c, isPublished: !current } : c));
            toast.success(current ? 'Cours dépublié' : 'Cours publié');
        } catch { toast.error('Erreur'); }
    };

    const filtered = courses.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Sidebar>
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-400" /> Gestion des cours
                    </h1>
                    <p className="page-subtitle">{courses.length} cours au total</p>
                </div>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input className="input pl-10" placeholder="Rechercher un cours ou instructeur..." value={search}
                    onChange={(e) => setSearch(e.target.value)} />
            </div>

            {loading ? (
                <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin" /></div>
            ) : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06] text-slate-400 text-xs uppercase tracking-wider">
                                <th className="text-left p-4">Cours</th>
                                <th className="text-left p-4 hidden md:table-cell">Instructeur</th>
                                <th className="text-left p-4 hidden md:table-cell">Catégorie</th>
                                <th className="text-center p-4">Étudiants</th>
                                <th className="text-center p-4">Statut</th>
                                <th className="text-center p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((course) => (
                                <tr key={course._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <p className="font-medium text-white line-clamp-1">{course.title}</p>
                                        <p className="text-xs text-slate-500 capitalize">{course.level}</p>
                                    </td>
                                    <td className="p-4 hidden md:table-cell text-slate-300">{course.instructor?.name || '—'}</td>
                                    <td className="p-4 hidden md:table-cell">
                                        <span className="badge badge-blue capitalize">{course.category}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="flex items-center justify-center gap-1 text-slate-300">
                                            <Users className="w-3.5 h-3.5" /> {course.enrolledCount || 0}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {course.isPublished
                                            ? <span className="badge badge-green flex items-center gap-1 justify-center w-fit mx-auto"><CheckCircle className="w-3 h-3" /> Publié</span>
                                            : <span className="badge badge-red flex items-center gap-1 justify-center w-fit mx-auto"><XCircle className="w-3 h-3" /> Brouillon</span>
                                        }
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => togglePublish(course._id, course.isPublished)}
                                            className={`p-2 rounded-lg transition-colors ${course.isPublished
                                                ? 'text-amber-400 hover:bg-amber-500/10'
                                                : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                                            title={course.isPublished ? 'Dépublier' : 'Publier'}
                                        >
                                            {course.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-slate-500">Aucun cours trouvé</div>
                    )}
                </div>
            )}
        </Sidebar>
    );
}
