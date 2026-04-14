'use client';
import Link from 'next/link';
import { GraduationCap, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] relative overflow-hidden">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <GraduationCap className="w-8 h-8 text-white" />
                </div>

                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4 select-none">
                    404
                </h1>

                <h2 className="text-2xl font-bold text-white mb-3">Page introuvable</h2>
                <p className="text-slate-400 max-w-sm mx-auto mb-8">
                    La page que vous cherchez n&apos;existe pas ou a été déplacée.
                </p>

                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="btn-secondary"
                    >
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </button>
                    <Link href="/" className="btn-primary">
                        <Home className="w-4 h-4" /> Accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
