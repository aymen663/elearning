'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { coursesAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { ArrowLeft, Plus, Loader2, BookOpen, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const LEVELS = ['débutant', 'intermédiaire', 'avancé'];
const CATEGORIES = ['Programmation', 'Design', 'Marketing', 'IA', 'Mathématiques', 'Langue', 'Autre'];

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', category: CATEGORIES[0], level: LEVELS[0], isPublished: true, lessons: [] });
    const [newLesson, setNewLesson] = useState({ title: '', content: '', duration: 0 });
    const [expandedLesson, setExpandedLesson] = useState(null);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const addLesson = () => {
        if (!newLesson.title.trim()) return;
        set('lessons', [...form.lessons, { ...newLesson, order: form.lessons.length + 1 }]);
        setNewLesson({ title: '', content: '', duration: 0 });
    };

    const removeLesson = (i) => set('lessons', form.lessons.filter((_, idx) => idx !== i));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await coursesAPI.create(form);
            toast.success('Cours créé avec succès !');
            router.push('/instructor');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur création');
        } finally { setLoading(false); }
    };

    return (
        <Sidebar>
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <Link href="/instructor" className="btn-ghost px-3 py-2"><ArrowLeft className="w-4 h-4" /></Link>
                    <div>
                        <h1 className="page-title flex items-center gap-2"><BookOpen className="w-6 h-6 text-teal-400" /> Nouveau cours</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="card space-y-5">
                        <h3 className="font-semibold text-white">Informations générales</h3>
                        <div>
                            <label className="input-label">Titre *</label>
                            <input required className="input" placeholder="ex: Introduction à React" value={form.title} onChange={(e) => set('title', e.target.value)} />
                        </div>
                        <div>
                            <label className="input-label">Description *</label>
                            <textarea required rows={3} className="input resize-none" placeholder="Décrivez votre cours..." value={form.description} onChange={(e) => set('description', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Catégorie</label>
                                <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Niveau</label>
                                <select className="input" value={form.level} onChange={(e) => set('level', e.target.value)}>
                                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>

                    </div>

                    <div className="card space-y-4">
                        <h3 className="font-semibold text-white">Leçons ({form.lessons.length})</h3>
                        {form.lessons.map((l, i) => (
                            <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.05] overflow-hidden">
                                <div className="flex items-center gap-3 p-3">
                                    <div className="w-6 h-6 rounded-full bg-teal-600/20 flex items-center justify-center text-xs text-teal-400 flex-shrink-0 font-bold">{i + 1}</div>
                                    <span className="flex-1 text-sm text-white">{l.title}</span>
                                    {l.content && <span className="text-xs text-emerald-400">✓ Contenu</span>}
                                    {l.duration > 0 && <span className="text-xs text-slate-500">{l.duration} min</span>}
                                    <button type="button" onClick={() => setExpandedLesson(expandedLesson === i ? null : i)}
                                        className="text-slate-500 hover:text-teal-400 text-xs transition-colors px-2">
                                        {expandedLesson === i ? 'Fermer' : 'Contenu'}
                                    </button>
                                    <button type="button" onClick={() => removeLesson(i)} className="text-slate-600 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                                {expandedLesson === i && (
                                    <div className="px-3 pb-3 border-t border-white/[0.05] pt-3">
                                        <textarea
                                            rows={4}
                                            className="input resize-none text-xs"
                                            placeholder="Contenu de la leçon (utilisé par le tuteur IA)..."
                                            value={l.content || ''}
                                            onChange={(e) => {
                                                const updated = [...form.lessons];
                                                updated[i] = { ...updated[i], content: e.target.value };
                                                set('lessons', updated);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="space-y-3 border-t border-white/[0.05] pt-4">
                            <p className="text-xs text-slate-500">Ajouter une leçon</p>
                            <div className="flex gap-3">
                                <input className="input flex-1" placeholder="Titre de la leçon" value={newLesson.title}
                                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLesson())} />
                                <input type="number" min={0} className="input w-24" placeholder="min" value={newLesson.duration || ''}
                                    onChange={(e) => setNewLesson({ ...newLesson, duration: +e.target.value })} />
                                <button type="button" onClick={addLesson} className="btn-secondary px-3 py-2"><Plus className="w-4 h-4" /></button>
                            </div>
                            <textarea rows={3} className="input resize-none text-xs" placeholder="Contenu de la prochaine leçon (optionnel, enrichit le tuteur IA..."
                                value={newLesson.content}
                                onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })} />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Création...' : 'Créer le cours'}
                        </button>
                        <Link href="/instructor" className="btn-ghost">Annuler</Link>
                    </div>
                </form>
            </div>
        </Sidebar>
    );
}
