'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useKeycloak } from '@react-keycloak/web';
import UserAvatar from '@/components/ui/UserAvatar';
import { useLangStore } from '@/lib/i18n';
import SearchModal from '@/components/ui/SearchModal';
import {
    LayoutDashboard, Users, BookOpen, GraduationCap,
    LogOut, Menu, Bell, User, Sun, Moon, MessageSquare,
    CheckCircle, BarChart2, MessagesSquare, Search,
    Calendar, ChevronLeft, ChevronRight, Gamepad2,
    Home, Book, ClipboardList, Megaphone, Bot, Sparkles, Folder, Settings
} from 'lucide-react';
import Link from 'next/link';
import { progressAPI, messagesAPI } from '@/lib/api';
import NetworkBackground from '@/components/ui/NetworkBackground';


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
                            className="text-xs text-slate-300 hover:text-white transition-colors">
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


function getAdminNav(t) {
    return [
        {
            title: t('nav.general'), items: [
                { href: '/admin', icon: LayoutDashboard, label: t('nav.board') },
                { href: '/admin/courses', icon: BookOpen, label: t('nav.courses') },
            ]
        },
        {
            title: t('nav.management'), items: [
                { href: '/admin/teachers', icon: GraduationCap, label: t('nav.teachers') },
                { href: '/admin/students', icon: Users, label: t('nav.students') },
            ]
        },
    ];
}

function getInstructorNav(t) {
    return [
        {
            title: t('nav.general'), items: [
                { href: '/instructor', icon: LayoutDashboard, label: t('nav.board') },
                { href: '/instructor/courses/new', icon: BookOpen, label: t('nav.newCourse') },
                { href: '/instructor/students', icon: Users, label: t('nav.myStudents') },
            ]
        },
        {
            title: t('nav.management'), items: [
                { href: '/instructor/requests', icon: CheckCircle, label: t('nav.requests') },
                { href: '/instructor/analytics', icon: BarChart2, label: t('nav.analytics') },
            ]
        },
        {
            title: t('nav.communication'), items: [
                { href: '/messages', icon: MessageSquare, label: t('nav.messages') },
                { href: '/forum', icon: MessagesSquare, label: t('nav.forum') },
            ]
        },
        {
            title: t('nav.other'), items: [
                { href: '/profile', icon: Settings, label: t('nav.settings') },
            ]
        },
    ];
}

function getStudentNav(t) {
    return [
        {
            title: t('nav.general'), items: [
                { href: '/dashboard', icon: Home, label: t('nav.dashboard') },
                { href: '/courses', icon: Book, label: t('nav.courses') },
            ]
        },
        {
            title: t('nav.communication'), items: [
                { href: '/messages', icon: MessageSquare, label: t('nav.messages') },
                { href: '/forum', icon: User, label: t('nav.forum') },
            ]
        },
        {
            title: t('nav.tools'), items: [
                { href: '/chat', icon: Bot, label: t('nav.tutor') },
                { href: '/calendar', icon: Calendar, label: t('nav.calendar') },
            ]
        },
        {
            title: t('nav.other'), items: [
                { href: '/games', icon: Gamepad2, label: t('nav.games') },
                { href: '/profile', icon: Settings, label: t('nav.settings') },
            ]
        },
    ];
}

export default function Sidebar({ children }) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const { t } = useLangStore();
    const { initialized } = useKeycloak();
    const [open, setOpen] = useState(false);
    const [dark, setDark] = useState(() => {
        if (typeof window === 'undefined') return true;
        return !document.documentElement.classList.contains('light');
    });
    const [unreadMsgs, setUnreadMsgs] = useState(0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [sidebarPinnedExpanded, setSidebarPinnedExpanded] = useState(false);
    const [sidebarHoverExpanded, setSidebarHoverExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);




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
        // The blocking script in layout.js already set the correct class on <html>.
        // We just sync React state with what's already applied.
        const html = document.documentElement;
        const v = localStorage.getItem('theme_v');
        if (v !== '3') {
            localStorage.setItem('theme', 'dark');
            localStorage.setItem('theme_v', '3');
        }
        const saved = localStorage.getItem('theme');
        const isDark = saved !== 'light';
        setDark(isDark);
        // Ensure classes are correct (in case of client-side navigation)
        if (!html.classList.contains(isDark ? 'dark' : 'light')) {
            html.classList.add(isDark ? 'dark' : 'light');
            html.classList.remove(isDark ? 'light' : 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle('light', !next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };

    const nav =
        user?.role === 'admin' ? getAdminNav(t) :
            user?.role === 'instructor' ? getInstructorNav(t) :
                getStudentNav(t);
    const isChatPage = pathname?.startsWith('/chat');
    const isCompactPage = isChatPage || pathname?.startsWith('/calendar');
    const isDesktopCompact = isCompactPage && !sidebarPinnedExpanded && !sidebarHoverExpanded;

    useEffect(() => {
        if (!isCompactPage) {
            setSidebarPinnedExpanded(true);
            setSidebarHoverExpanded(false);
        } else {
            setSidebarPinnedExpanded(false);
            setSidebarHoverExpanded(false);
        }
    }, [isCompactPage]);

    const SidebarContent = ({ compact = false }) => (
        <div
            className="flex flex-col h-full text-slate-300"
            style={{
                background: 'var(--bg-sidebar-gradient, linear-gradient(180deg, #0A0E18 0%, #0D1220 100%))',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
            }}
        >
            {/* ── Logo ─── */}
            <div className={`py-6 flex items-center justify-between ${compact ? 'px-3' : 'px-6'}`}>
                <div className={`flex items-center ${compact ? 'justify-center w-full' : 'gap-3'}`}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center border bg-slate-800/70 text-slate-100 border-slate-700/70 shadow-[0_6px_16px_rgba(0,0,0,0.25)]">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    {!compact && <p className="font-bold text-lg tracking-tight text-[#E5E7EB]">EduAI</p>}
                </div>
                <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setOpen(false)}>
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>

            {/* ── Navigation ── */}
            <nav className={`flex-1 py-2 overflow-y-auto ${compact ? 'px-2' : 'px-4'}`}>
                {(!mounted ? getStudentNav(t) : nav).map((group, idx) => (
                    <div key={idx} className="mb-6">
                        {!compact && <p className="px-3 mb-2 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.14em]">{group.title}</p>}
                        <div className="space-y-1">
                            {group.items.map(({ href, icon: Icon, label }) => {
                                const active = pathname === href || (href !== '/admin' && href !== '/dashboard' && href !== '/instructor' && pathname.startsWith(href));
                                const isMessages = href === '/messages';
                                return (
                                    <Link key={href} href={href} onClick={() => setOpen(false)} title={compact ? label : undefined}
                                        className={`flex items-center ${compact ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 group relative overflow-hidden ${active
                                            ? 'bg-emerald-500/12 text-[#E5E7EB] border border-emerald-400/25 shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_8px_22px_rgba(16,185,129,0.16)]'
                                            : 'text-slate-400 hover:bg-slate-700/35 hover:text-slate-200 hover:translate-x-0.5'
                                            }`}
                                    >
                                        {active && (
                                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.8)]"></div>
                                        )}
                                        <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-300 ${active ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-200'}`} />
                                        {!compact && <span>{label}</span>}
                                        {!compact && isMessages && unreadMsgs > 0 && (
                                            <span className="ml-auto w-5 h-5 bg-slate-700/90 text-white rounded-full text-[10px] font-bold flex items-center justify-center border border-slate-600/70">
                                                {unreadMsgs > 9 ? '9+' : unreadMsgs}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ── Bottom section ── */}
            <div className={`mt-auto space-y-2 ${compact ? 'p-2' : 'p-4'}`}>
                {/* User card */}
                {mounted && user && (
                    <div className={`rounded-xl p-2.5 flex items-center ${compact ? 'justify-center' : 'gap-3'} border transition-all duration-300 bg-slate-900/35 border-slate-700/40 hover:bg-slate-800/45`} title={compact ? `${user.name} (${user.email})` : undefined}>
                        <div className="relative flex-shrink-0">
                            <UserAvatar user={user} size="sm" showStatus isOnline />
                        </div>
                        {!compact && <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate text-[#E5E7EB]">{user.name}</p>
                            <p className="text-xs truncate text-[#9CA3AF]">{user.email}</p>
                        </div>}
                    </div>
                )}

                {/* Logout */}
                <button onClick={logout} title={compact ? t('nav.logout') : undefined} className={`flex items-center ${compact ? 'justify-center' : 'gap-3'} px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-all duration-300 hover:translate-x-0.5 text-slate-400 hover:bg-slate-800/50 hover:text-red-300`}>
                    <LogOut className="w-5 h-5" />
                    {!compact && <span>{t('nav.logout')}</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden" style={{ position: 'relative' }}>
            <aside
                onMouseEnter={() => isCompactPage && setSidebarHoverExpanded(true)}
                onMouseLeave={() => isCompactPage && setSidebarHoverExpanded(false)}
                className="hidden lg:flex flex-col flex-shrink-0 border-r transition-[width] duration-300 ease-in-out"
                style={{
                    width: isDesktopCompact ? 76 : 256,
                    borderColor: 'rgba(148,163,184,0.2)',
                    position: 'relative', zIndex: 1
                }}>
                <SidebarContent compact={isDesktopCompact} />
            </aside>

            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-64 border-r transition-colors"
                        style={{
                            borderColor: 'rgba(255,255,255,0.05)'
                        }}>
                        <SidebarContent compact={false} />
                    </aside>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>

                <header className="h-12 border-b flex items-center gap-2.5 px-4 lg:px-5 flex-shrink-0"
                    style={{
                        background: (!mounted || dark) ? 'var(--bg-header)' : 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        borderColor: (!mounted || dark) ? 'var(--border-sidebar)' : '#e2e8f0'
                    }}>

                    {/* Mobile menu trigger */}
                    <button className="lg:hidden flex-shrink-0" style={{ color: 'var(--text-secondary)' }} onClick={() => setOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search bar */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs flex-1 max-w-sm text-left transition-all"
                        style={{ background: (!mounted || dark) ? 'rgba(255,255,255,0.06)' : '#eef2f6', border: (!mounted || dark) ? '1px solid var(--border)' : '1.5px solid var(--border-strong)', color: 'var(--text-muted)' }}
                    >
                        <Search className="w-3.5 h-3.5" />
                        <span className="flex-1">{t('topbar.search')}</span>
                        <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] border" style={{ borderColor: 'var(--border-strong)' }}>⌘K</kbd>
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
                            title={(!mounted || dark) ? t('topbar.lightMode') : t('topbar.darkMode')}
                            suppressHydrationWarning
                        >
                            {(!mounted || dark)
                                ? <Sun className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                : <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
                        </button>

                        {/* User avatar */}
                        {mounted && user && (
                            <div className="flex-shrink-0 ml-1">
                                <UserAvatar user={user} size="sm" showStatus isOnline />
                            </div>
                        )}
                    </div>
                </header>

                <main className={`flex-1 overflow-y-auto animate-fade-in ${isCompactPage ? 'p-0' : 'p-4 lg:p-5'}`}
                    style={{ background: 'transparent' }}>
                    {children}
                </main>
            </div>
            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
            <NetworkBackground mode={(!mounted || dark) ? 'dark' : 'light'} />
        </div>
    );
}
