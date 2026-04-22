'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) return;
        if (user.role === 'admin') router.replace('/admin');
        else if (user.role === 'instructor') router.replace('/instructor');
        else router.replace('/dashboard');
    }, [user, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
                <p className="text-slate-400 text-sm">Redirection en cours...</p>
            </div>
        </div>
    );
}
