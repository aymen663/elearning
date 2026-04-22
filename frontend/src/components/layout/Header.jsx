'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getKeycloak } from '@/lib/keycloak';
import { useAuthStore } from '@/lib/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Menu, X, ArrowRight } from 'lucide-react';

const Y = '#D4E157', G = '#0B3D2E';

const NAV_LINKS = [
    { label: 'Fonctionnalités', href: '/#fonctionnalités' },
    { label: 'Cours', href: '/#cours' },
    { label: 'Témoignages', href: '/#témoignages' },
    { label: 'Contact', href: '/contact' },
];

export default function Header() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const login = () => {
        const kc = getKeycloak();
        if (kc?.authenticated) return;
        kc?.login();
    };

    return (
        <>
            <motion.nav
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    background: scrolled ? 'rgba(11,61,46,0.95)' : 'rgba(11,61,46,0.85)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform" style={{ background: Y }}>
                            <GraduationCap className="w-5 h-5" style={{ color: G }} />
                        </div>
                        <span className="font-extrabold text-lg text-white tracking-tight">EduAI</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map(({ label, href }) => {
                            const isActive = pathname === href || (href.startsWith('/#') && pathname === '/');
                            return (
                                <Link key={label} href={href}
                                    className={`text-[13px] font-medium transition-colors ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                                    {label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-2">
                        {user ? (
                            <Link href={user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/dashboard'}
                                className="text-sm font-bold px-5 py-2.5 rounded-full shadow-lg inline-flex items-center gap-2"
                                style={{ background: Y, color: G }}>
                                Mon espace <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <button onClick={login} className="text-sm font-semibold text-white/70 hover:text-white px-3 py-2 transition-colors">Connexion</button>
                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                    onClick={login} className="text-sm font-bold px-5 py-2.5 rounded-full shadow-lg"
                                    style={{ background: Y, color: G }}>
                                    Rejoindre
                                </motion.button>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed top-16 left-0 right-0 z-40 border-b border-white/[0.06] md:hidden"
                        style={{ background: 'rgba(11,61,46,0.98)', backdropFilter: 'blur(16px)' }}
                    >
                        <div className="px-6 py-4 space-y-1">
                            {NAV_LINKS.map(({ label, href }) => (
                                <Link key={label} href={href} onClick={() => setMobileOpen(false)}
                                    className="block text-sm font-medium text-white/70 hover:text-white py-2.5 transition-colors">
                                    {label}
                                </Link>
                            ))}
                            <div className="pt-3 border-t border-white/[0.06] mt-2 flex flex-col gap-2">
                                {user ? (
                                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                                        className="text-sm font-bold px-5 py-2.5 rounded-full text-center"
                                        style={{ background: Y, color: G }}>Mon espace</Link>
                                ) : (
                                    <>
                                        <button onClick={() => { login(); setMobileOpen(false); }}
                                            className="text-sm font-semibold text-white/70 py-2">Connexion</button>
                                        <button onClick={() => { login(); setMobileOpen(false); }}
                                            className="text-sm font-bold px-5 py-2.5 rounded-full"
                                            style={{ background: Y, color: G }}>Rejoindre</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
