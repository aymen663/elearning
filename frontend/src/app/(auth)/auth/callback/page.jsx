'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import CubeLoader from '@/components/ui/CubeLoader';

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
                <CubeLoader />
                <p className="text-slate-400 text-sm mt-4">Redirection en cours...</p>
            </div>
        </div>
    );
}
