'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useKeycloak } from '@react-keycloak/web';
import UserAvatar from '@/components/ui/UserAvatar';
import SearchModal from '@/components/ui/SearchModal';
import {
    LayoutDashboard, Users, BookOpen, GraduationCap,
    LogOut, Menu, Bell, User, Award, Sun, Moon, MessageSquare,
    CheckCircle, BarChart2, MessagesSquare, Search,
    Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { progressAPI, messagesAPI } from '@/lib/api';


function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const ref = useRef(null);

    useEffect(() => {
        progressAPI.getMyProgress().then(({ data }) => {
            const items = [];
            (data.progress || []).forEach((p) => {
                const title = p.course?.title || 'Cours';
                if (p.completionPercentage === 100) {
                    items.push({ icon: '🏆', text: `Cours terminé : ${title}`, type: 'success' });
                } else if ((p.completedLessons?.length || 0) > 0) {
                    items.push({ icon: '✅', text: `${p.completedLessons.length} leçon(s) complétée(s) — ${title}`, type: 'info' });
                }
                if (p.quizScores?.length > 0) {
                    const last = p.quizScores[p.quizScores.length - 1];
                    items.push({ icon: '🧠', text: `Score quiz : ${last.score}% — ${title}`, type: 'quiz' });
                }
            });
            setNotifications(items.slice(0, 6));
        }).catch(() => { });
    }, []);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors relative topbar-icon-btn"
                style={{ color: 'var(--text-secondary)' }}>
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                        {notifications.length}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 top-11 w-80 rounded-2xl border shadow-xl z-50 overflow-hidden"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</p>
                        {notifications.length > 0 && <span className="badge badge-blue">{notifications.length} nouvelles</span>}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Aucune activité récente</p>
                        ) : notifications.map((n, i) => (
                            <div key={i} className="flex items-start gap-3 px-4 py-3 border-b hover:bg-white/[0.02] transition-colors"
                                style={{ borderColor: 'var(--border)' }}>
                                <span className="text-base flex-shrink-0 mt-0.5">{n.icon}</span>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{n.text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="px-4 py-2.5">
                        <Link href="/dashboard" onClick={() => setOpen(false)}
                            className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                            Voir toute l'activité →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}



function CalendarDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const today = new Date();
    const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
    const firstDay = new Date(current.year, current.month, 1).getDay();
    const DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const prev = () => setCurrent(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 });
    const next = () => setCurrent(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 });
    const isToday = (d) => d === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(o => !o)}
                className="topbar-icon-btn"
                title="Agenda"
            >
                <Calendar className="w-4 h-4" />
            </button>
            {open && (
                <div className="absolute right-0 top-11 w-72 rounded-2xl border shadow-xl z-50 overflow-hidden"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                        <button onClick={prev} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {MONTHS[current.month]} {current.year}
                        </p>
                        <button onClick={next} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-3">
                        <div className="grid grid-cols-7 mb-1">
                            {DAYS.map((d, i) => (
                                <div key={i} className="text-center text-[10px] font-bold py-1" style={{ color: 'var(--text-muted)' }}>{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-0.5">
                            {cells.map((d, i) => (
                                <div key={i} className={`h-8 flex items-center justify-center text-xs rounded-lg transition-colors
                                    ${d ? 'cursor-pointer hover:bg-violet-500/15' : ''}
                                    ${isToday(d) ? 'bg-violet-600 text-white font-bold shadow-lg shadow-violet-500/30' : ''}
                                `} style={{ color: d && !isToday(d) ? 'var(--text-secondary)' : undefined }}>
                                    {d || ''}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="px-4 py-2 border-t text-center" style={{ borderColor: 'var(--border)' }}>
                        <button onClick={() => setCurrent({ year: today.getFullYear(), month: today.getMonth() })}
                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                            Aujourd'hui
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


const adminNav = [
    { href: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
    { href: '/admin/courses', icon: BookOpen, label: 'Cours' },
    { href: '/admin/teachers', icon: GraduationCap, label: 'Professeurs' },
    { href: '/admin/students', icon: Users, label: 'Étudiants' },
];

const instructorNav = [
    { href: '/instructor', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/instructor/courses/new', icon: BookOpen, label: 'Nouveau cours' },
    { href: '/instructor/analytics', icon: BarChart2, label: 'Analytics' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/forum', icon: MessagesSquare, label: 'Forum' },
];

const studentNav = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Mon espace' },
    { href: '/courses', icon: BookOpen, label: 'Liste de cours' },
    { href: '/forum', icon: MessagesSquare, label: 'Forum' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/chat', icon: MessageSquare, label: 'Tuteur IA' },
    { href: '/certificates', icon: Award, label: 'Mes certifications' },
    { href: '/profile', icon: User, label: 'Mon profil' },
];

export default function Sidebar({ children }) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const { initialized } = useKeycloak();
    const [open, setOpen] = useState(false);
    const [dark, setDark] = useState(false);
    const [unreadMsgs, setUnreadMsgs] = useState(0);
    const [searchOpen, setSearchOpen] = useState(false);




    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);


    useEffect(() => {
        if (!user) return;
        const fetchUnread = () =>
            messagesAPI.getUnreadCount().then(({ data }) => setUnreadMsgs(data.count)).catch(() => { });
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, [user]);


    useEffect(() => {
        // Force dark mode as new default — reset old 'light' saved preference
        const v = localStorage.getItem('theme_v');
        if (v !== '3') {
            localStorage.setItem('theme', 'dark');
            localStorage.setItem('theme_v', '3');
        }
        const saved = localStorage.getItem('theme');
        const isDark = saved !== 'light';
        setDark(isDark);
        document.documentElement.classList.toggle('light', !isDark);
    }, []);

    const toggleTheme = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle('light', !next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };

    const nav =
        user?.role === 'admin' ? adminNav :
            user?.role === 'instructor' ? instructorNav :
                studentNav;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* ── Logo ─── */}
            <div className="px-5 py-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm tracking-tight" style={{ color: '#ffffff' }}>EduAI</p>
                    </div>
                </div>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <Menu className="w-4 h-4" />
                </button>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Général</p>
                <div className="space-y-0.5">
                    {nav.map(({ href, icon: Icon, label }) => {
                        const active = pathname === href || (href !== '/admin' && href !== '/dashboard' && href !== '/instructor' && pathname.startsWith(href));
                        const isMessages = href === '/messages';
                        return (
                            <Link key={href} href={href} onClick={() => setOpen(false)}
                                className={`sidebar-link ${active ? 'active' : ''}`}>
                                <span className="sidebar-link-icon">
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                </span>
                                <span>{label}</span>
                                {isMessages && unreadMsgs > 0 && (
                                    <span className="ml-auto w-5 h-5 bg-teal-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                                        {unreadMsgs > 9 ? '9+' : unreadMsgs}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* ── Bottom section ── */}
            <div className="border-t px-3 py-2 space-y-0.5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="px-2 mb-1 mt-1 text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Compte</p>

                {/* User card */}
                {user && (
                    <div className="sidebar-user-card rounded-lg px-2 py-1.5 flex items-center gap-2 mb-0.5">
                        <div className="relative flex-shrink-0">
                            <UserAvatar user={user} size="sm" variant="green" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate" style={{ color: '#e2e8f0' }}>{user.name}</p>
                            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
                        </div>
                        <button className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L2 4h8L6 8z" /></svg>
                        </button>
                    </div>
                )}

                {/* Logout */}
                <button onClick={logout} className="sidebar-link sidebar-link-compact w-full sidebar-logout">
                    <span className="sidebar-link-icon sidebar-link-icon-sm">
                        <LogOut className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs">Déconnexion</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: dark ? 'linear-gradient(160deg, #0B0F19 0%, #0E1322 100%)' : '#ffffff', position: 'relative' }}>
            {/* Animated Background Orbs — only in dark mode */}
            {dark && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', width: 500, height: 500, top: '-12%', left: '-8%', background: 'radial-gradient(circle, #1a2744 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.6, animation: 'drift 20s ease-in-out infinite' }} />
                        <div style={{ position: 'absolute', width: 400, height: 400, bottom: '-8%', right: '-6%', background: 'radial-gradient(circle, #0e2038 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5, animation: 'drift 25s ease-in-out infinite reverse' }} />
                        <div style={{ position: 'absolute', width: 300, height: 300, top: '40%', left: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', opacity: 1, animation: 'drift 18s ease-in-out infinite 5s' }} />
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(34,197,94,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)' }} />
                    </div>
                    <style>{`@keyframes drift{0%,100%{transform:translate(0,0)}25%{transform:translate(30px,-20px)}50%{transform:translate(-20px,30px)}75%{transform:translate(20px,20px)}}`}</style>
                </>
            )}

            <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r"
                style={{
                    background: 'linear-gradient(180deg, #0A0E18 0%, #0D1220 100%)',
                    borderColor: 'rgba(255,255,255,0.07)',
                    position: 'relative', zIndex: 1
                }}>
                <SidebarContent />
            </aside>

            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 border-r"
                        style={{
                            background: 'linear-gradient(180deg, #0A0E18 0%, #0D1220 100%)',
                            borderColor: 'rgba(255,255,255,0.07)'
                        }}>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
                {/* Thin loading bar while Keycloak initializes */}
                {!initialized && (
                    <div className="h-0.5 w-full overflow-hidden flex-shrink-0" style={{ background: 'transparent' }}>
                        <div className="h-0.5 animate-pulse" style={{ background: dark ? 'linear-gradient(90deg, #D4E157, #4CAF50, #D4E157)' : 'linear-gradient(90deg, #22c55e, #16a34a, #22c55e)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                    </div>
                )}
                <header className="h-12 border-b flex items-center gap-2.5 px-4 lg:px-5 flex-shrink-0"
                    style={{
                        background: dark ? 'rgba(9,24,18,0.8)' : '#ffffff',
                        backdropFilter: dark ? 'blur(16px)' : 'none',
                        WebkitBackdropFilter: dark ? 'blur(16px)' : 'none',
                        borderColor: dark ? 'var(--border-sidebar)' : '#e2e8f0'
                    }}>

                    {/* Mobile menu trigger */}
                    <button className="lg:hidden flex-shrink-0" style={{ color: 'var(--text-secondary)' }} onClick={() => setOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search bar */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs flex-1 max-w-sm text-left transition-all"
                        style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#eef2f6', border: dark ? '1px solid var(--border)' : '1px solid #dde3ea', color: 'var(--text-muted)' }}
                    >
                        <Search className="w-3.5 h-3.5" />
                        <span className="flex-1">Rechercher des cours, leçons...</span>
                        <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] border" style={{ borderColor: 'var(--border)' }}>⌘K</kbd>
                    </button>

                    {/* Right-side icons */}
                    <div className="flex items-center gap-1.5 ml-auto">
                        {/* Mobile search */}
                        <button onClick={() => setSearchOpen(true)}
                            className="lg:hidden topbar-icon-btn">
                            <Search className="w-4 h-4" />
                        </button>

                        {/* Calendar */}
                        <CalendarDropdown />


                        {/* Notifications */}
                        <NotificationBell />

                        {/* Theme toggle — icon only */}
                        <button
                            onClick={toggleTheme}
                            className="topbar-icon-btn"
                            title={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
                        >
                            {dark
                                ? <Sun className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                : <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
                        </button>

                        {/* User avatar */}
                        {user && (
                            <div className="flex-shrink-0 ml-1">
                                <UserAvatar user={user} size="sm" />
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-5 animate-fade-in"
                    style={{ background: dark ? 'transparent' : '#f0f2f5' }}>
                    {children}
                </main>
            </div>
            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
