'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { coursesAPI } from '@/lib/api';
import { Search, BookOpen, FileText, X, Loader2, Command } from 'lucide-react';


export default function SearchModal({ open, onClose }) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(0);
    const inputRef = useRef(null);
    const timer = useRef(null);


    useEffect(() => {
        if (open) {
            setQuery('');
            setResults([]);
            setSelected(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);


    const search = useCallback(async (q) => {
        if (!q.trim()) { setResults([]); return; }
        setLoading(true);
        try {
            const { data } = await coursesAPI.search(q);
            setResults(data.results || []);
            setSelected(0);
        } catch { setResults([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        clearTimeout(timer.current);
        if (query.length > 1) {
            timer.current = setTimeout(() => search(query), 350);
        } else {
            setResults([]);
        }
        return () => clearTimeout(timer.current);
    }, [query, search]);


    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
            if (e.key === 'Enter' && results[selected]) { navigate(results[selected]); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, results, selected]);

    const navigate = (result) => {
        onClose();
        if (result.type === 'course') {
            router.push(`/courses/${result.courseId}`);
        } else {
            router.push(`/courses/${result.courseId}/learn`);
        }
    };


    const highlight = (text, q) => {
        if (!q || !text) return text;
        const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part)
                ? <mark key={i} className="bg-indigo-500/30 text-indigo-300 rounded px-0.5">{part}</mark>
                : part
        );
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -12 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="fixed top-[80px] inset-x-0 mx-auto z-50 w-full max-w-2xl px-4"
                    >
                        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
                            style={{ background: 'var(--bg-card)' }}>

                            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07]">
                                {loading
                                    ? <Loader2 className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
                                    : <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                }
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Rechercher un cours, une leçon, un concept..."
                                    className="flex-1 bg-transparent outline-none text-white placeholder-slate-500 text-sm"
                                />
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {query && (
                                        <button onClick={() => setQuery('')} className="text-slate-600 hover:text-slate-400">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 text-[10px] text-slate-600">
                                        ESC
                                    </kbd>
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {query.length < 2 ? (
                                    <div className="px-5 py-10 text-center">
                                        <Search className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500">Tapez au moins 2 caractères pour commencer</p>
                                        <p className="text-xs text-slate-700 mt-1">Recherche dans les titres, descriptions et contenus des leçons</p>
                                    </div>
                                ) : results.length === 0 && !loading ? (
                                    <div className="px-5 py-10 text-center">
                                        <p className="text-sm text-slate-500">Aucun résultat pour <span className="text-slate-300">"{query}"</span></p>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        {results.map((result, i) => (
                                            <button
                                                key={`${result.courseId}-${result.lessonId || 'c'}`}
                                                onClick={() => navigate(result)}
                                                onMouseEnter={() => setSelected(i)}
                                                className={`w-full flex items-start gap-3 px-5 py-3 text-left transition-colors ${selected === i ? 'bg-indigo-600/15' : 'hover:bg-white/[0.04]'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${result.type === 'course' ? 'bg-indigo-600/20' : 'bg-purple-600/20'}`}>
                                                    {result.type === 'course'
                                                        ? <BookOpen className="w-4 h-4 text-indigo-400" />
                                                        : <FileText className="w-4 h-4 text-purple-400" />
                                                    }
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {highlight(result.title, query)}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                                                    {result.excerpt && (
                                                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                                                            {highlight(result.excerpt, query)}
                                                        </p>
                                                    )}
                                                </div>

                                                <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1 ${result.type === 'course'
                                                    ? 'bg-indigo-500/20 text-indigo-400'
                                                    : 'bg-purple-500/20 text-purple-400'
                                                    }`}>
                                                    {result.type === 'course' ? 'Cours' : 'Leçon'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {results.length > 0 && (
                                <div className="px-5 py-2.5 border-t border-white/[0.06] flex items-center gap-4 text-[10px] text-slate-600">
                                    <span className="flex items-center gap-1"><kbd className="border border-white/10 px-1 rounded">↑↓</kbd> Naviguer</span>
                                    <span className="flex items-center gap-1"><kbd className="border border-white/10 px-1 rounded">↵</kbd> Ouvrir</span>
                                    <span className="flex items-center gap-1"><kbd className="border border-white/10 px-1 rounded">ESC</kbd> Fermer</span>
                                    <span className="ml-auto">{results.length} résultat{results.length !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
