'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { chatAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import {
    SendHorizontal, Sparkles, User, ArrowLeft,
    MessageSquare, Lightbulb, BookOpen, HelpCircle,
    RotateCcw, Copy, Check,
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';



const QUICK_REPLIES = [
    { icon: <Lightbulb className="w-3 h-3" />, label: 'Explique' },
    { icon: <BookOpen className="w-3 h-3" />, label: 'Exemple' },
    { icon: <HelpCircle className="w-3 h-3" />, label: 'Résumé' },
    { icon: <RotateCcw className="w-3 h-3" />, label: 'Reformule' },
];


function TypingIndicator() {
    return (
        <div className="flex gap-2.5 items-end pl-0.5">
            <div className="w-6 h-6 rounded-[10px] bg-[#6366f1]/90 flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#6366f1]/20">
                <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div
                className="bg-[#1a1b2e] border border-[#252840] rounded-[14px] rounded-bl-[4px]
          px-4 py-3 flex items-center gap-[5px]
          shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
            >
                {[0, 130, 260].map((d) => (
                    <span
                        key={d}
                        className="w-[5px] h-[5px] rounded-full bg-[#7c84a3]"
                        style={{ animation: `tdot 1.3s cubic-bezier(.45,.05,.55,.95) ${d}ms infinite` }}
                    />
                ))}
            </div>
        </div>
    );
}


function CopyBtn({ text }) {
    const [done, setDone] = useState(false);
    const go = () => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); };
    return (
        <button
            onClick={go}
            title="Copier"
            className="opacity-0 group-hover:opacity-100 transition-all duration-200
        shrink-0 p-1 rounded-[6px] hover:bg-white/5
        text-[#3d4266] hover:text-[#7c84a3]"
        >
            {done
                ? <Check className="w-3 h-3 text-[#34d399]" />
                : <Copy className="w-3 h-3" />}
        </button>
    );
}


function MessageBubble({ msg, index }) {
    const isUser = msg.role === 'user';
    const time = msg.timestamp
        ? new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : null;

    return (
        <div
            className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            style={{
                animation: 'msgIn .2s cubic-bezier(.22,.68,0,1.2) both',
                animationDelay: `${Math.min(index * 20, 180)}ms`,
            }}
        >
            <div
                className={`w-6 h-6 rounded-[10px] flex items-center justify-center flex-shrink-0 self-end mb-[3px]
          ${isUser
                        ? 'bg-[#3b4fd8] shadow-sm shadow-[#3b4fd8]/30'
                        : 'bg-[#6366f1]/90 shadow-sm shadow-[#6366f1]/20'
                    }`}
            >
                {isUser
                    ? <User className="w-3 h-3 text-white" />
                    : <Sparkles className="w-3 h-3 text-white" />}
            </div>

            <div className={`group flex flex-col gap-[5px] max-w-[74%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                    className={`rounded-[14px] text-[13px] leading-[1.75]
            ${isUser

                            ? 'bg-[#3b4fd8] text-white rounded-br-[4px] px-4 py-[10px] shadow-md shadow-[#3b4fd8]/20'

                            : 'bg-[#1a1b2e] border border-[#252840] text-[#e2e6f0] rounded-bl-[4px] px-4 py-[14px] shadow-[0_2px_16px_rgba(0,0,0,0.35)]'
                        }`}
                >
                    {isUser
                        ? <p className="m-0">{msg.content}</p>
                        : (
                            <div className="flex items-start gap-1.5">
                                <div className="flex-1 min-w-0">
                                    <ReactMarkdown
                                        className={`
                      prose prose-sm max-w-none
                      [&_p]:text-[#e2e6f0] [&_p]:leading-[1.8] [&_p]:my-[6px] [&_p]:text-[13px]
                      [&_h1]:text-[#a5b4fc] [&_h1]:font-semibold [&_h1]:text-[14px] [&_h1]:mt-[18px] [&_h1]:mb-[8px] [&_h1]:tracking-[-0.01em]
                      [&_h2]:text-[#a5b4fc] [&_h2]:font-semibold [&_h2]:text-[13px] [&_h2]:mt-[16px] [&_h2]:mb-[6px]
                      [&_h3]:text-[#a5b4fc] [&_h3]:font-medium  [&_h3]:text-[12px] [&_h3]:mt-[12px] [&_h3]:mb-[4px]
                      [&_strong]:text-white [&_strong]:font-semibold
                      [&_em]:text-[#c4cbe0] [&_em]:italic
                      [&_ul]:my-[8px] [&_ul]:space-y-[4px]
                      [&_ol]:my-[8px] [&_ol]:space-y-[4px]
                      [&_li]:text-[#d0d6e8] [&_li]:text-[13px] [&_li]:leading-[1.65]
                      [&_li::marker]:text-[#6366f1]
                      [&_code]:bg-[#0a0b11] [&_code]:text-[#6ee7d4] [&_code]:px-[6px] [&_code]:py-[2px]
                      [&_code]:rounded-[5px] [&_code]:text-[11.5px] [&_code]:font-mono
                      [&_code]:border [&_code]:border-[#1e2040]
                      [&_pre]:bg-[#0a0b11] [&_pre]:border [&_pre]:border-[#1e2040]
                      [&_pre]:rounded-[10px] [&_pre]:p-[12px] [&_pre]:my-[10px]
                      [&_pre]:overflow-x-auto [&_pre]:text-[11.5px]
                      [&_blockquote]:border-l-2 [&_blockquote]:border-[#6366f1]/50
                      [&_blockquote]:pl-3 [&_blockquote]:text-[#7c84a3] [&_blockquote]:italic [&_blockquote]:my-2
                      [&_a]:text-[#818cf8] [&_a]:no-underline hover:[&_a]:underline
                      [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                    `}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                                <CopyBtn text={msg.content} />
                            </div>
                        )
                    }
                </div>
                {time && (
                    <span className="text-[10px] text-[#3d4266] tabular-nums px-0.5 leading-none">
                        {time}
                    </span>
                )}
            </div>
        </div>
    );
}


function EmptyState({ onSuggest }) {
    const cards = [
        { emoji: '🎯', label: 'Comment fonctionne ce cours ?' },
        { emoji: '📌', label: 'Quels sont les points clés ?' },
        { emoji: '💡', label: 'Explique le premier concept' },
        { emoji: '🔗', label: 'Donne un exemple pratique' },
    ];
    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 select-none px-4">
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1a1b2e] border border-[#252840] flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.12)]">
                    <MessageSquare className="w-6 h-6 text-[#6366f1]" />
                </div>
                <div>
                    <h2 className="text-white font-semibold text-[15px] mb-1">Posez votre première question</h2>
                    <p className="text-[#7c84a3] text-[13px] leading-relaxed max-w-[260px]">
                        Votre tuteur IA analyse le contenu du cours pour vous répondre précisément.
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-[8px] w-full max-w-[360px]">
                {cards.map((c) => (
                    <button
                        key={c.label}
                        onClick={() => onSuggest(c.label)}
                        className="text-left px-3.5 py-3 rounded-[12px]
              bg-[#1a1b2e] border border-[#252840]
              hover:border-[#6366f1]/35 hover:bg-[#21233a]
              hover:shadow-[0_2px_12px_rgba(99,102,241,0.08)]
              transition-all duration-200 group"
                    >
                        <span className="text-[15px] block mb-[5px]">{c.emoji}</span>
                        <span className="text-[12px] text-[#7c84a3] group-hover:text-[#a5b4fc] transition-colors leading-snug block">
                            {c.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}


export default function ChatPage() {
    const { id } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const MAX_CHARS = 500;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async (text) => {
        const content = (text || input).trim();
        if (!content || loading) return;
        setMessages((p) => [...p, { role: 'user', content, timestamp: Date.now() }]);
        setInput('');
        setLoading(true);
        try {
            const history = messages.map((m) => ({ role: m.role, content: m.content }));
            const { data } = await chatAPI.ask(id, content, history);
            setMessages((p) => [...p, { role: 'assistant', content: data.answer, timestamp: Date.now() }]);
        } catch {
            setMessages((p) => [...p, { role: 'assistant', content: '❌ Une erreur est survenue. Veuillez réessayer.', timestamp: Date.now() }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    const onSubmit = (e) => { e.preventDefault(); sendMessage(); };
    const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
    const charPct = input.length / MAX_CHARS;

    return (
        <>
            <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes tdot {
          0%,60%,100% { transform:translateY(0);    opacity:.3; }
          30%          { transform:translateY(-5px); opacity:1;  }
        }
        /* ── Scrollbar: 3px, ghost until hover ── */
        .cs {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color .3s;
        }
        .cs:hover { scrollbar-color: #252840 transparent; }
        .cs::-webkit-scrollbar { width: 3px; }
        .cs::-webkit-scrollbar-track { background: transparent; }
        .cs::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 99px;
          transition: background .3s;
        }
        .cs:hover::-webkit-scrollbar-thumb { background: #252840; }
        /* ── Send button glow on hover ── */
        .send-btn:not(:disabled):hover {
          box-shadow: 0 0 14px rgba(99,102,241,.45);
        }
      `}</style>

            <Sidebar>
                <div className="flex flex-col h-[calc(100vh-7rem)] max-w-2xl mx-auto gap-0">

                    <div className="flex items-center gap-3 pb-4 flex-shrink-0">
                        <Link
                            href={`/courses/${id}`}
                            className="w-8 h-8 rounded-[10px] border border-[#252840] flex items-center justify-center
                hover:bg-[#1a1b2e] hover:border-[#363a5a] transition-all duration-200"
                            title="Retour au cours"
                        >
                            <ArrowLeft className="w-[14px] h-[14px] text-[#7c84a3]" />
                        </Link>

                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="relative flex-shrink-0">
                                <div className="w-8 h-8 rounded-[10px] bg-[#6366f1] flex items-center justify-center shadow-md shadow-[#6366f1]/25">
                                    <Sparkles className="w-[14px] h-[14px] text-white" />
                                </div>
                                <span className="absolute -bottom-[2px] -right-[2px] w-[9px] h-[9px] bg-[#34d399] rounded-full border-[1.5px] border-[#0c0d16]" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="font-semibold text-white text-[14px] leading-tight">Tuteur IA</h1>
                                <p className="text-[10px] text-[#34d399] font-medium">En ligne</p>
                            </div>
                        </div>

                        {messages.length > 0 && (
                            <button
                                onClick={() => setMessages([])}
                                title="Nouvelle conversation"
                                className="w-8 h-8 rounded-[10px] border border-[#252840] flex items-center justify-center
                  text-[#3d4266] hover:text-[#7c84a3] hover:bg-[#1a1b2e] hover:border-[#363a5a]
                  transition-all duration-200"
                            >
                                <RotateCcw className="w-[13px] h-[13px]" />
                            </button>
                        )}
                    </div>

                    <div className="cs flex-1 overflow-y-auto min-h-0 pr-[2px]">
                        <div className="flex flex-col gap-5 py-1">
                            {messages.length === 0
                                ? <EmptyState onSuggest={sendMessage} />
                                : messages.map((m, i) => <MessageBubble key={i} msg={m} index={i} />)
                            }
                            {loading && <TypingIndicator />}
                            <div ref={bottomRef} className="h-1" />
                        </div>
                    </div>

                    {messages.length > 0 && !loading && (
                        <div className="flex gap-[6px] overflow-x-auto pt-3 pb-1 flex-shrink-0 scrollbar-none">
                            {QUICK_REPLIES.map((qr) => (
                                <button
                                    key={qr.label}
                                    onClick={() => sendMessage(qr.label)}
                                    className="flex items-center gap-[5px] text-[11px] font-medium whitespace-nowrap flex-shrink-0
                    px-[10px] py-[5px] rounded-[6px]
                    bg-[#13141f] border border-[#252840]
                    text-[#7c84a3] hover:text-[#a5b4fc]
                    hover:bg-[#1a1b2e] hover:border-[#6366f1]/35
                    transition-all duration-150"
                                >
                                    {qr.icon}
                                    {qr.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex-shrink-0 pt-3">
                        <form
                            onSubmit={onSubmit}
                            className="flex items-end gap-2.5
                bg-[#13141f] border border-[#252840] rounded-[12px]
                px-[14px] py-[10px]
                focus-within:border-[#6366f1]/50
                focus-within:shadow-[0_0_0_3px_rgba(99,102,241,.08)]
                transition-all duration-200"
                        >
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                onChange={(e) => {
                                    if (e.target.value.length <= MAX_CHARS) setInput(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 108) + 'px';
                                }}
                                onKeyDown={onKey}
                                placeholder="Posez votre question…"
                                disabled={loading}
                                className="flex-1 bg-transparent text-[13px] text-[#e2e6f0] placeholder-[#3d4266]
                  resize-none focus:outline-none leading-[1.6] max-h-[108px]"
                                style={{ height: '22px' }}
                            />
                            <div className="flex items-center gap-2 self-end">
                                {charPct > 0.72 && (
                                    <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
                                        <circle cx="9" cy="9" r="7" fill="none" stroke="#252840" strokeWidth="2.2" />
                                        <circle
                                            cx="9" cy="9" r="7" fill="none"
                                            stroke={charPct > 0.9 ? '#f59e0b' : '#6366f1'}
                                            strokeWidth="2.2"
                                            strokeDasharray={`${charPct * 43.98} 43.98`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 9 9)"
                                        />
                                    </svg>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="send-btn w-[34px] h-[34px] rounded-[10px]
                    bg-[#6366f1] hover:bg-[#7577f3]
                    disabled:opacity-25 disabled:cursor-not-allowed
                    flex items-center justify-center
                    transition-all duration-200
                    hover:scale-[1.04] active:scale-[.96]"
                                >
                                    <SendHorizontal className="w-[15px] h-[15px] text-white" />
                                </button>
                            </div>
                        </form>
                        {messages.length === 0 && (
                            <p className="text-[10px] text-[#2e3155] mt-2 text-center">
                                Entrée pour envoyer · Maj+Entrée pour saut de ligne
                            </p>
                        )}
                    </div>

                </div>
            </Sidebar>
        </>
    );
}
