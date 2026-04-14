'use client';

import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import {
  SendHorizontal, Sparkles, User,
  Lightbulb, BookOpen, HelpCircle, RotateCcw, Copy, Check,
} from 'lucide-react';



const QUICK_REPLIES = [
  { icon: <Lightbulb className="w-3 h-3" />, label: 'Explique' },
  { icon: <BookOpen className="w-3 h-3" />, label: 'Exemple' },
  { icon: <HelpCircle className="w-3 h-3" />, label: 'Résumé' },
  { icon: <RotateCcw className="w-3 h-3" />, label: 'Reformule' },
];


function TypingDots() {
  return (
    <div className="flex gap-2 items-end">
      <div className="w-6 h-6 rounded-[8px] bg-[#6366f1]/90 flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#6366f1]/20">
        <Sparkles className="w-[11px] h-[11px] text-white" />
      </div>
      <div className="bg-[#1a1b2e] border border-[#252840] rounded-[12px] rounded-bl-[3px]
        px-[14px] py-[10px] flex items-center gap-[5px]
        shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
      >
        {[0, 130, 260].map((d) => (
          <span
            key={d}
            className="w-[5px] h-[5px] rounded-full bg-[#7c84a3]"
            style={{ animation: `wdot 1.3s cubic-bezier(.45,.05,.55,.95) ${d}ms infinite` }}
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
      className="opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0
        p-1 rounded-[5px] hover:bg-white/5 text-[#3d4266] hover:text-[#7c84a3]"
    >
      {done ? <Check className="w-[11px] h-[11px] text-[#34d399]" /> : <Copy className="w-[11px] h-[11px]" />}
    </button>
  );
}


function Bubble({ msg, idx }) {
  const isUser = msg.role === 'user';
  const time = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
      style={{
        animation: 'win .2s cubic-bezier(.22,.68,0,1.2) both',
        animationDelay: `${Math.min(idx * 18, 150)}ms`,
      }}
    >
      <div className={`w-[22px] h-[22px] rounded-[8px] flex items-center justify-center flex-shrink-0 self-end mb-[2px]
        ${isUser ? 'bg-[#3b4fd8] shadow-sm shadow-[#3b4fd8]/30' : 'bg-[#6366f1]/90 shadow-sm shadow-[#6366f1]/20'}`}
      >
        {isUser
          ? <User className="w-[10px] h-[10px] text-white" />
          : <Sparkles className="w-[10px] h-[10px] text-white" />}
      </div>

      <div className={`group flex flex-col gap-[4px] max-w-[83%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-[12px] text-[13px] leading-[1.75]
          ${isUser

            ? 'bg-[#3b4fd8] text-white rounded-br-[3px] px-[14px] py-[9px] shadow-md shadow-[#3b4fd8]/15'

            : 'bg-[#1a1b2e] border border-[#252840] text-[#e2e6f0] rounded-bl-[3px] px-[14px] py-[13px] shadow-[0_2px_14px_rgba(0,0,0,0.32)]'
          }`}
        >
          {isUser
            ? <p className="m-0">{msg.content}</p>
            : (
              <div className="flex items-start gap-1">
                <div className="flex-1 min-w-0">
                  <ReactMarkdown
                    className={`
                      prose prose-sm max-w-none
                      [&_p]:text-[#e2e6f0] [&_p]:leading-[1.8] [&_p]:my-[5px] [&_p]:text-[13px]
                      [&_h1]:text-[#a5b4fc] [&_h1]:font-semibold [&_h1]:text-[13px]
                      [&_h1]:mt-[14px] [&_h1]:mb-[6px] [&_h1]:tracking-[-0.01em]
                      [&_h2]:text-[#a5b4fc] [&_h2]:font-semibold [&_h2]:text-[12px]
                      [&_h2]:mt-[12px] [&_h2]:mb-[5px]
                      [&_h3]:text-[#a5b4fc] [&_h3]:font-medium [&_h3]:text-[12px]
                      [&_h3]:mt-[10px] [&_h3]:mb-[4px]
                      [&_strong]:text-white [&_strong]:font-semibold
                      [&_em]:text-[#c4cbe0] [&_em]:italic
                      [&_ul]:my-[6px] [&_ul]:space-y-[3px]
                      [&_ol]:my-[6px] [&_ol]:space-y-[3px]
                      [&_li]:text-[#d0d6e8] [&_li]:text-[12.5px] [&_li]:leading-[1.65]
                      [&_li::marker]:text-[#6366f1]
                      [&_code]:bg-[#0a0b11] [&_code]:text-[#6ee7d4] [&_code]:px-[5px] [&_code]:py-[1.5px]
                      [&_code]:rounded-[4px] [&_code]:text-[11px] [&_code]:font-mono
                      [&_code]:border [&_code]:border-[#1e2040]
                      [&_pre]:bg-[#0a0b11] [&_pre]:border [&_pre]:border-[#1e2040]
                      [&_pre]:rounded-[8px] [&_pre]:p-[10px] [&_pre]:my-[8px]
                      [&_pre]:overflow-x-auto [&_pre]:text-[11px]
                      [&_blockquote]:border-l-2 [&_blockquote]:border-[#6366f1]/40
                      [&_blockquote]:pl-2.5 [&_blockquote]:text-[#7c84a3] [&_blockquote]:my-2
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


export default function ChatTutor({ courseId, courseName }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Bonjour ! Je suis votre tuteur pour **${courseName}**.\nPosez-moi vos questions sur ce cours. 🎓`,
    timestamp: Date.now(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const MAX_CHARS = 400;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setMessages((p) => [...p, { role: 'user', content, timestamp: Date.now() }]);
    setInput('');
    setLoading(true);
    try {
      const history = messages.slice(-10);
      const { data } = await chatAPI.ask(courseId, content, history);
      setMessages((p) => [...p, { role: 'assistant', content: data.answer, timestamp: Date.now() }]);
    } catch {
      setMessages((p) => [...p, { role: 'assistant', content: "Désolé, une erreur s'est produite. Réessayez.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const onSubmit = (e) => { e.preventDefault(); send(); };
  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const charPct = input.length / MAX_CHARS;

  return (
    <>
      <style>{`
        @keyframes win {
          from { opacity:0; transform:translateY(7px) scale(.98); }
          to   { opacity:1; transform:translateY(0)   scale(1);   }
        }
        @keyframes wdot {
          0%,60%,100%{ transform:translateY(0);    opacity:.3; }
          30%        { transform:translateY(-4px); opacity:1;  }
        }
        /* Ghost scrollbar — appears only on hover */
        .ws {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .ws:hover { scrollbar-color: #252840 transparent; }
        .ws::-webkit-scrollbar { width: 3px; }
        .ws::-webkit-scrollbar-thumb { background: transparent; border-radius: 99px; }
        .ws:hover::-webkit-scrollbar-thumb { background: #252840; }
        /* Send glow */
        .wsend:not(:disabled):hover { box-shadow: 0 0 12px rgba(99,102,241,.4); }
      `}</style>

      <div className="flex flex-col h-[580px] bg-[#0f1019] rounded-2xl border border-[#252840] shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">

        <div className="flex items-center gap-2.5 px-4 py-[11px] bg-[#0c0d15] border-b border-[#252840] flex-shrink-0">
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 rounded-[9px] bg-[#6366f1] flex items-center justify-center shadow-sm shadow-[#6366f1]/30">
              <Sparkles className="w-[13px] h-[13px] text-white" />
            </div>
            <span className="absolute -bottom-[1.5px] -right-[1.5px] w-[8px] h-[8px] bg-[#34d399] rounded-full border border-[#0c0d15]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-[13px] leading-tight">Tuteur IA</p>
            <p className="text-[10px] text-[#34d399] font-medium">En ligne</p>
          </div>
          {messages.length > 1 && (
            <button
              onClick={() => setMessages([messages[0]])}
              title="Réinitialiser"
              className="p-1.5 rounded-[8px] hover:bg-[#1a1b2e] text-[#3d4266] hover:text-[#7c84a3] transition-all duration-200"
            >
              <RotateCcw className="w-[13px] h-[13px]" />
            </button>
          )}
        </div>

        <div className="ws flex-1 overflow-y-auto min-h-0 px-4">
          <div className="flex flex-col gap-[14px] py-4">
            {messages.map((m, i) => <Bubble key={i} msg={m} idx={i} />)}
            {loading && <TypingDots />}
            <div ref={bottomRef} />
          </div>
        </div>

        {messages.length > 1 && !loading && (
          <div className="flex gap-[6px] overflow-x-auto px-4 py-[8px] flex-shrink-0 scrollbar-none border-t border-[#1a1b2e]">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.label}
                onClick={() => send(qr.label)}
                className="flex items-center gap-[5px] text-[10.5px] font-medium whitespace-nowrap flex-shrink-0
                  px-[9px] py-[4px] rounded-[6px]
                  bg-transparent border border-[#252840]
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

        <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-[#1a1b2e]">
          <form
            onSubmit={onSubmit}
            className="flex items-end gap-2
              bg-[#13141f] border border-[#252840] rounded-[11px]
              px-[12px] py-[8px]
              focus-within:border-[#6366f1]/45
              focus-within:shadow-[0_0_0_3px_rgba(99,102,241,.07)]
              transition-all duration-200"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 84) + 'px';
              }}
              onKeyDown={onKey}
              placeholder="Votre question…"
              disabled={loading}
              className="flex-1 bg-transparent text-[13px] text-[#e2e6f0] placeholder-[#3d4266]
                resize-none focus:outline-none leading-[1.6] max-h-[84px]"
              style={{ height: '20px' }}
            />
            <div className="flex items-center gap-[6px] self-end">
              {charPct > 0.75 && (
                <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="#252840" strokeWidth="2" />
                  <circle
                    cx="8" cy="8" r="6" fill="none"
                    stroke={charPct > 0.9 ? '#f59e0b' : '#6366f1'}
                    strokeWidth="2"
                    strokeDasharray={`${charPct * 37.7} 37.7`}
                    strokeLinecap="round"
                    transform="rotate(-90 8 8)"
                  />
                </svg>
              )}
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="wsend w-[30px] h-[30px] rounded-[9px]
                  bg-[#6366f1] hover:bg-[#7577f3]
                  disabled:opacity-25 disabled:cursor-not-allowed
                  flex items-center justify-center
                  transition-all duration-200
                  hover:scale-[1.05] active:scale-[.95]"
              >
                <SendHorizontal className="w-[13px] h-[13px] text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
