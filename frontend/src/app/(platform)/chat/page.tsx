'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { GraduationCap, FileText, Target, BookOpen, Sparkles, Paperclip, Globe, Lightbulb, Star, X, ArrowUp, MoreHorizontal, Copy, RefreshCw, ThumbsUp, ThumbsDown, ChevronDown, ChevronRight, ChevronLeft, Download, Plus } from 'lucide-react'

type Role = 'user' | 'assistant'
type ChatMode = 'rag' | 'general'
type StudioTool = 'summary' | 'quiz' | 'flashcards'
type Message = {
  id: string; role: Role; content: string
  timestamp: Date; loading?: boolean
}
interface Source {
  id: string; name: string; size: string; uploadedAt: Date; selected: boolean
}
interface Session {
  id: string; title: string; messages: Message[]
  createdAt: Date; mode: ChatMode
}

const uid = () => Math.random().toString(36).slice(2)
const fmt = (d: Date) => {
  const s = (Date.now() - d.getTime()) / 1000
  if (s < 60) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}
const dl = (text: string, name: string) => {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([text], { type: 'text/plain' })), download: name
  }); a.click()
}

function useDrag(init: number, min: number, max: number, dir: 'l' | 'r') {
  const [w, setW] = useState(init)
  const r = useRef({ on: false, x: 0, w: 0 })
  const grab = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); r.current = { on: true, x: e.clientX, w }
    document.body.style.cssText += 'cursor:col-resize;user-select:none'
    const mv = (ev: MouseEvent) => {
      if (!r.current.on) return
      const d = dir === 'l' ? ev.clientX - r.current.x : r.current.x - ev.clientX
      setW(Math.min(max, Math.max(min, r.current.w + d)))
    }
    const up = () => {
      r.current.on = false; document.body.style.cssText = ''
      window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up)
  }, [w, min, max, dir])
  return { w, grab }
}

function Dots() {
  return <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
    {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#94a3b8', display: 'inline-block', animation: 'dot 1.4s ease infinite', animationDelay: `${i * .2}s` }} />)}
  </span>
}

function MsgContent({ text }: { text: string }) {
  // Simple markdown: bold, code, bullets
  const lines = text.split('\n')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <strong key={i} style={{ fontSize: '0.9em', color: 'inherit', display: 'block', marginTop: 6 }}>{line.slice(4)}</strong>
        if (line.startsWith('## ')) return <strong key={i} style={{ fontSize: '0.95em', color: 'inherit', display: 'block', marginTop: 8 }}>{line.slice(3)}</strong>
        if (line.startsWith('# ')) return <strong key={i} style={{ fontSize: '1em', color: 'inherit', display: 'block', marginTop: 8 }}>{line.slice(2)}</strong>
        if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ paddingLeft: 12, display: 'flex', gap: 6 }}><span style={{ color: '#22c55e', flexShrink: 0 }}>•</span><span>{line.slice(2)}</span></div>
        if (line.startsWith('```')) return <div key={i} />
        if (line.match(/^\d+\./)) return <div key={i} style={{ paddingLeft: 12 }}>{line}</div>
        if (line === '') return <div key={i} style={{ height: 4 }} />
        // Inline bold
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return <div key={i}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</div>
      })}
    </div>
  )
}

export default function App() {
  const [sources, setSources] = useState<Source[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadErr, setUploadErr] = useState('')
  const [dragging, setDragging] = useState(false)
  const [toolResult, setToolResult] = useState<{ title: string; content: string; tool: StudioTool } | null>(null)
  const [selectedToolSource, setSelectedToolSource] = useState<Record<string, string>>({})
  const [toolLoading, setToolLoading] = useState(false)
  const [rightOpen, setRightOpen] = useState(true)
  const [chatMode, setChatMode] = useState<ChatMode>('rag')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  const fileRef = useRef<HTMLInputElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const rp = useDrag(308, 200, 480, 'r')

  const active = sessions.find(s => s.id === activeId)
  const msgs = active?.messages ?? []
  const sel = sources.filter(s => s.selected)
  const ragReady = sel.length > 0

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        switchMode(chatMode === 'rag' ? 'general' : 'rag')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [chatMode])

  useEffect(() => {
    const html = document.documentElement
    const syncTheme = () => setIsDark(html.classList.contains('dark'))
    syncTheme()
    const obs = new MutationObserver(syncTheme)
    obs.observe(html, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, sending])
  useEffect(() => {
    if (sources.length === 1 && sessions.length === 0) newSession('rag')
  }, [sources.length])

  const lastSessionPerMode = useRef<Record<ChatMode, string | null>>({ rag: null, general: null })

  function newSession(mode: ChatMode = chatMode) {
    const id = uid()
    setSessions(p => [{ id, title: 'New conversation', messages: [], createdAt: new Date(), mode }, ...p])
    setActiveId(id)
    lastSessionPerMode.current[mode] = id
    setChatMode(mode)
    setToolResult(null)
  }

  function switchMode(mode: ChatMode) {
    if (mode === chatMode) return
    if (activeId) lastSessionPerMode.current[chatMode] = activeId
    setChatMode(mode)
    const last = lastSessionPerMode.current[mode]
    const found = sessions.find(s => s.id === last && s.mode === mode)
      ?? sessions.find(s => s.mode === mode)
    if (found) {
      setActiveId(found.id)
    } else {
      const id = uid()
      setSessions(p => [{ id, title: 'New conversation', messages: [], createdAt: new Date(), mode }, ...p])
      setActiveId(id)
      lastSessionPerMode.current[mode] = id
    }
  }

  const upload = useCallback(async (file: File) => {
    setUploadStatus('uploading'); setUploadErr('')
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await fetch('/api/tutor/upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setSources(p => [...p, { id: uid(), name: file.name, size: (file.size / 1024).toFixed(0) + ' KB', uploadedAt: new Date(), selected: true }])
      setUploadStatus('success')
    } catch (e) { setUploadStatus('error'); setUploadErr(e instanceof Error ? e.message : 'Failed') }
  }, [])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) upload(f) }
  const toggle = (id: string) => setSources(p => p.map(s => s.id === id ? { ...s, selected: !s.selected } : s))

  // ── Send message ─────────────────────────────────────────────────────────────
  async function callAI(question: string, history: Message[], mode: ChatMode): Promise<string> {
    if (mode === 'rag') {
      const r = await fetch('/api/tutor/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      return d.answer
    } else {
      const r = await fetch('/api/tutor/general-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.filter(m => !m.loading).map(m => ({ role: m.role, content: m.content })) })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      return d.answer
    }
  }

  const send = async (overrideInput?: string) => {
    const q = (overrideInput ?? input).trim()
    if (!q || sending) return
    if (chatMode === 'rag' && !ragReady) return
    if (!overrideInput) setInput('')
    if (taRef.current) taRef.current.style.height = 'auto'

    let sid = activeId
    if (!sid) {
      const id = uid()
      setSessions(p => [{ id, title: q.slice(0, 50), messages: [], createdAt: new Date(), mode: chatMode }, ...p])
      setActiveId(id); sid = id
    }

    const um: Message = { id: uid(), role: 'user', content: q, timestamp: new Date() }
    const aidId = uid()
    const aidPlaceholder: Message = { id: aidId, role: 'assistant', content: '', timestamp: new Date(), loading: true }

    setSessions(p => p.map(s => s.id === sid ? {
      ...s, messages: [...s.messages, um, aidPlaceholder],
      title: s.messages.length === 0 ? q.slice(0, 50) : s.title
    } : s))
    setSending(true)

    try {
      const currentSession = sessions.find(s => s.id === sid)
      const history = [...(currentSession?.messages ?? []), um]
      const answer = await callAI(q, history, chatMode)
      setSessions(p => p.map(s => s.id === sid
        ? { ...s, messages: s.messages.map(m => m.id === aidId ? { ...m, content: answer, loading: false } : m) }
        : s))
    } catch (e) {
      setSessions(p => p.map(s => s.id === sid
        ? { ...s, messages: s.messages.map(m => m.id === aidId ? { ...m, content: `Error: ${e instanceof Error ? e.message : 'Failed'}`, loading: false } : m) }
        : s))
    } finally { setSending(false) }
  }

  // ── Regenerate ───────────────────────────────────────────────────────────────
  const regenerate = async (msgId: string) => {
    if (sending || !active) return
    const idx = active.messages.findIndex(m => m.id === msgId)
    if (idx < 1) return
    const userMsg = active.messages[idx - 1]
    if (userMsg.role !== 'user') return

    // Remove the assistant message and re-ask
    setSessions(p => p.map(s => s.id === activeId
      ? { ...s, messages: s.messages.filter(m => m.id !== msgId) }
      : s))
    await send(userMsg.content)
  }

  // ── Copy ─────────────────────────────────────────────────────────────────────
  const copy = (text: string) => { navigator.clipboard.writeText(text).catch(() => { }) }

  const runTool = async (tool: StudioTool, srcId: string) => {
    const src = sources.find(s => s.id === srcId); if (!src) return
    const toolLabel = tool === 'summary' ? 'Summary' : tool === 'quiz' ? 'Quiz' : 'Flashcards'
    setToolResult({ title: `${toolLabel} · ${src.name}`, content: '', tool })
    setToolLoading(true)
    try {
      const r = await fetch(`/api/tutor/${tool}`, { method: 'POST' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      const content = tool === 'summary' ? d.summary : tool === 'quiz' ? d.quiz : d.flashcards
      setToolResult({ title: `${toolLabel} · ${src.name}`, content, tool })
    } catch (e) { setToolResult(p => p ? { ...p, content: `Error: ${e instanceof Error ? e.message : 'Failed'}` } : null) }
    finally { setToolLoading(false) }
  }

  const T = isDark ? {
    bg: '#111827',
    surface: '#1f2937',
    surfaceHigh: '#111827',
    border: '#374151',
    borderM: '#4b5563',
    text: '#e5e7eb',
    textMuted: '#9ca3af',
    textSub: '#cbd5e1',
    title: '#f3f4f6',
    iconCircle: '#374151',
    accent: '#22c55e',
    accentL: 'rgba(34, 197, 94, 0.12)',
    accentGlow: 'rgba(34, 197, 94, 0.35)',
    green: '#22c55e',
    shadow: '0 8px 24px rgba(0,0,0,0.25)',
    mainBg: '#111827',
    cardBg: '#1f2937',
    chipBg: '#1f2937',
    topBarBg: 'rgba(17,24,39,0.82)',
    inputWrapBg: 'rgba(31,41,55,0.82)',
    modeBadgeBg: '#374151',
    glassBg: 'rgba(17, 24, 39, 0.9)',
    glassBorder: '#374151',
    hoverBg: 'rgba(148, 163, 184, 0.12)',
    msgUser: 'rgba(55, 65, 81, 0.85)',
    msgAssistant: '#1f2937',
    uploadHoverBg: 'rgba(31,41,55,0.95)',
    pastel: {
      green: { bg: 'rgba(55, 65, 81, 0.9)', text: '#22c55e' },
    }
  } : {
    bg: '#f5f7fb',
    surface: '#ffffff',
    surfaceHigh: '#f8fafc',
    border: '#dbe3ee',
    borderM: '#c4d0dd',
    text: '#0f172a',
    textMuted: '#64748b',
    textSub: '#334155',
    title: '#0f172a',
    iconCircle: '#e2e8f0',
    accent: '#16a34a',
    accentL: 'rgba(22, 163, 74, 0.1)',
    accentGlow: 'rgba(22, 163, 74, 0.22)',
    green: '#16a34a',
    shadow: '0 6px 22px rgba(15,23,42,0.08)',
    mainBg: '#f5f7fb',
    cardBg: '#ffffff',
    chipBg: '#ffffff',
    topBarBg: 'rgba(255,255,255,0.92)',
    inputWrapBg: '#ffffff',
    modeBadgeBg: '#eef2f7',
    glassBg: 'rgba(245, 247, 251, 0.95)',
    glassBorder: '#dbe3ee',
    hoverBg: 'rgba(15, 23, 42, 0.06)',
    msgUser: '#eff6ff',
    msgAssistant: '#ffffff',
    uploadHoverBg: '#f8fafc',
    pastel: {
      green: { bg: '#ecfdf3', text: '#16a34a' },
    }
  }

  return (
    <Sidebar>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)', width: '100%', background: T.bg, color: T.text, fontFamily: '"Plus Jakarta Sans","Inter",-apple-system,sans-serif', overflow: 'hidden' } as React.CSSProperties & Record<string, string>}>
        <style dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;font-feature-settings:"cv02","cv03","cv04","cv11"}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.borderM};border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:${T.textMuted}}
        
        /* Animations */
        @keyframes dot{0%,100%{opacity:.3;transform:scale(.75)}50%{opacity:1;transform:scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        
        /* Subtle Professional Interactions */
        .hov{transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1)}
        .hov:hover:not(:disabled){filter:brightness(1.03)}
        .hov:active:not(:disabled){transform:scale(0.98)}
        
        /* Component Styles */
        .sess-row{transition:all 0.15s ease}
        .sess-row:hover{background:${T.hoverBg}!important}
        .sess-row:hover .del{opacity:1!important}
        
        .tool-btn{transition:all 0.2s ease}
        .tool-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 16px rgba(0, 0, 0, 0.2)!important}
        
        .send{transition:all 0.2s ease}
        .send:hover:not(:disabled){transform:scale(1.04);box-shadow:0 6px 16px ${T.accentGlow}}
        
        .chip{transition:all 0.2s ease}
        .chip:hover{background:${T.surfaceHigh}!important;border-color:${T.borderM}!important;transform:translateY(-2px);box-shadow:0 10px 20px rgba(0,0,0,0.22)!important}
        
        .upload-zone{transition:all 0.2s ease}
        .upload-zone:hover{border-color:${T.borderM}!important;background:${T.uploadHoverBg}!important}
        
        .action-btn{transition:all 0.2s ease}
        .action-btn:hover{background:${T.hoverBg}!important;color:${T.text}!important}
        
        .studio-card{transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px)}
        .studio-card:hover{transform:translateY(-2px);box-shadow:${T.shadow}!important;border-color:${T.borderM}!important}

        .msg-bubble{transition:all 0.2s ease}
        .msg-bubble:hover{box-shadow:${T.shadow}!important}

        .glass{background:${T.glassBg};backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);border-top:1px solid ${T.glassBorder}!important}
        
        textarea{resize:none;scrollbar-width:none}
        textarea::-webkit-scrollbar{display:none}
        textarea:focus{outline:none}
        
        .icon-float{animation: float 5s ease-in-out infinite}
      ` }} />

        <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={onFile} />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* ── CENTER ── */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: T.mainBg }}>
            {/* Top Bar inside main */}
            <div style={{ padding: '14px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: `1px solid ${T.border}`, background: T.topBarBg, backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {active?.title || (chatMode === 'rag' ? 'Nouveau résumé' : 'Nouvelle conversation')}
                  <ChevronDown size={14} color={T.textMuted} />
                </div>
              </div>
              <button
                onClick={() => newSession(chatMode)}
                className="hov"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: `1px solid ${T.borderM}`,
                  background: T.cardBg,
                  color: T.text,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} />
                New conversation
              </button>

            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 154px', display: 'flex', flexDirection: 'column', gap: 28 }}>
              {msgs.length === 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', gap: 24, animation: 'fadeUp 0.6s ease-out', marginTop: '-40px', width: '100%' }}>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div className="icon-float" style={{ width: 72, height: 72, borderRadius: '50%', background: T.pastel.green.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <GraduationCap size={36} strokeWidth={2} />
                    </div>
                    <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: T.title, marginBottom: 10, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                      Bonjour, comment puis-je<br />vous aider aujourd'hui ?
                    </h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
                    <button className="chip hov" onClick={() => { setInput('Quels sont les concepts clés ?'); taRef.current?.focus() }}
                      style={{ background: T.chipBg, border: `1px solid ${T.borderM}`, borderRadius: 14, padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', boxShadow: '0 6px 16px rgba(0,0,0,0.16)' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.iconCircle, color: T.textSub, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BookOpen size={16} />
                      </div>
                      <div style={{ flex: 1, fontSize: '0.85rem', color: T.textSub, fontWeight: 500 }}>Quels sont les concepts clés ?</div>
                      <ChevronRight size={16} color={T.textMuted} />
                    </button>
                    <button className="chip hov" onClick={() => { setInput('Résume les points principaux'); taRef.current?.focus() }}
                      style={{ background: T.chipBg, border: `1px solid ${T.borderM}`, borderRadius: 14, padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', boxShadow: '0 6px 16px rgba(0,0,0,0.16)' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.iconCircle, color: T.textSub, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={16} />
                      </div>
                      <div style={{ flex: 1, fontSize: '0.85rem', color: T.textSub, fontWeight: 500 }}>Résume les points principaux</div>
                      <ChevronRight size={16} color={T.textMuted} />
                    </button>
                    <button className="chip hov" onClick={() => { setInput('Liste les définitions importantes'); taRef.current?.focus() }}
                      style={{ background: T.chipBg, border: `1px solid ${T.borderM}`, borderRadius: 14, padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', boxShadow: '0 6px 16px rgba(0,0,0,0.16)' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.iconCircle, color: T.textSub, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Star size={16} />
                      </div>
                      <div style={{ flex: 1, fontSize: '0.85rem', color: T.textSub, fontWeight: 500 }}>Liste les définitions importantes</div>
                      <ChevronRight size={16} color={T.textMuted} />
                    </button>
                    <button className="chip hov" onClick={() => { setInput('Explique les idées de base'); taRef.current?.focus() }}
                      style={{ background: T.chipBg, border: `1px solid ${T.borderM}`, borderRadius: 14, padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', boxShadow: '0 6px 16px rgba(0,0,0,0.16)' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.iconCircle, color: T.textSub, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Lightbulb size={16} />
                      </div>
                      <div style={{ flex: 1, fontSize: '0.85rem', color: T.textSub, fontWeight: 500 }}>Explique les idées de base</div>
                      <ChevronRight size={16} color={T.textMuted} />
                    </button>
                  </div>
                </div>
              )}

              {msgs.map((msg, idx) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.3s ease', width: '100%', padding: '0 8px' }}>
                  {msg.role === 'assistant' ? (
                    <div style={{ display: 'flex', gap: 16, width: '100%' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <GraduationCap size={18} strokeWidth={2.5} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.95rem', color: T.text, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>EduAI</div>
                        <div className="msg-bubble" style={{ background: T.msgAssistant, padding: '16px 20px', borderRadius: '16px 16px 16px 4px', border: `1px solid ${T.border}`, boxShadow: T.shadow, color: T.text, fontSize: '0.95rem', lineHeight: 1.65 }}>
                          {msg.loading ? <Dots /> : <MsgContent text={msg.content} />}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <span style={{ fontSize: '0.75rem', color: T.textMuted }}>{fmt(msg.timestamp)}</span>
                          {!msg.loading && msg.content && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="action-btn hov" onClick={() => copy(msg.content)} style={{ padding: '6px', borderRadius: 6, background: 'transparent', color: T.textMuted, cursor: 'pointer', border: 'none' }}><Copy size={14} /></button>
                              <button className="action-btn hov" onClick={() => regenerate(msg.id)} disabled={sending} style={{ padding: '6px', borderRadius: 6, background: 'transparent', color: T.textMuted, cursor: sending ? 'default' : 'pointer', border: 'none', opacity: sending ? 0.5 : 1 }}><RefreshCw size={14} /></button>
                              <button className="action-btn hov" style={{ padding: '6px', borderRadius: 6, background: 'transparent', color: T.textMuted, cursor: 'pointer', border: 'none' }}><ThumbsUp size={14} /></button>
                              <button className="action-btn hov" style={{ padding: '6px', borderRadius: 6, background: 'transparent', color: T.textMuted, cursor: 'pointer', border: 'none' }}><ThumbsDown size={14} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%', justifyContent: 'flex-end' }}>
                      <div>
                        <div className="msg-bubble" style={{ padding: '14px 20px', borderRadius: '16px 16px 4px 16px', background: T.msgUser, color: T.text, fontSize: '0.95rem', lineHeight: 1.5, border: `1px solid ${T.borderM}`, boxShadow: '0 6px 14px rgba(0,0,0,0.22)' }}>
                          <MsgContent text={msg.content} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: T.textMuted, marginTop: 6, textAlign: 'right' }}>{fmt(msg.timestamp)}</div>
                      </div>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600, flexShrink: 0 }}>A</div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="glass" style={{ padding: '18px 24px 24px', flexShrink: 0, position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
              <div style={{ background: T.inputWrapBg, border: `1px solid ${T.borderM}`, borderRadius: 28, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: T.shadow, width: '100%', backdropFilter: 'blur(12px)' }}>
                <button onClick={() => fileRef.current?.click()} className="hov" title="Upload document"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: T.textMuted, padding: '0 2px' }}>
                  <Paperclip size={18} />
                </button>
                <div style={{ background: T.modeBadgeBg, padding: '4px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: T.textSub, cursor: 'pointer' }} onClick={() => switchMode(chatMode === 'rag' ? 'general' : 'rag')}>
                  <Target size={14} /> RAG
                </div>
                <button style={{ background: 'transparent', border: 'none', color: T.accent, cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center' }}>
                  <Globe size={18} />
                </button>

                <textarea ref={taRef}
                  placeholder="Envoyer un message à EduAI..."
                  value={input}
                  onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px' }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  disabled={(chatMode === 'rag' && !ragReady) || sending}
                  rows={1}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: '0.95rem', fontFamily: 'inherit', maxHeight: 180, overflowY: 'auto', resize: 'none', padding: '4px 0', alignSelf: 'center' }}
                />

                <button className="send hov" onClick={() => send()}
                  disabled={!input.trim() || sending || (chatMode === 'rag' && !ragReady)}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: input.trim() && (chatMode === 'general' || ragReady) ? T.accent : T.borderM, border: 'none', cursor: input.trim() && (chatMode === 'general' || ragReady) ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: input.trim() && (chatMode === 'general' || ragReady) ? '#fff' : T.textSub, transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)', flexShrink: 0, boxShadow: input.trim() && (chatMode === 'general' || ragReady) ? `0 4px 14px ${T.accentGlow}` : 'none' }}>
                  {sending ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : <ArrowUp size={18} strokeWidth={2.5} />}
                </button>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: T.textMuted, marginTop: 12, fontWeight: 500 }}>
                EduAI peut faire des erreurs. Vérifiez les informations importantes.
              </div>
            </div>
          </main>

          {/* ── RIGHT ── */}
          {rightOpen && <>
            <div onMouseDown={rp.grab} style={{ width: 4, flexShrink: 0, cursor: 'col-resize', borderLeft: `1px solid ${T.border}` }} />
            <aside style={{ width: rp.w, background: T.surface, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem', fontWeight: 700, color: T.text }}>
                  <Sparkles size={16} color={T.textMuted} /> Studio
                </div>
                <button className="hov" onClick={() => setRightOpen(false)} style={{ width: 22, height: 22, background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} />
                </button>
              </div>

              {toolResult ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.85rem', color: T.text, fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{toolResult.title}</div>
                    <button onClick={() => setToolResult(null)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                    {toolLoading
                      ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160, gap: 12, color: T.textMuted }}>
                        <span style={{ width: 20, height: 20, border: `2px solid ${T.accent}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                        <span style={{ fontSize: '0.8rem' }}>Génération en cours...</span>
                      </div>
                      : <div style={{ fontSize: '0.85rem', color: T.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{toolResult.content}</div>
                    }
                  </div>
                  {toolResult.content && !toolLoading && (
                    <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, flexShrink: 0 }}>
                      <button onClick={() => dl(toolResult.content, `${toolResult.tool}.txt`)}
                        style={{ flex: 1, background: T.cardBg, border: `1px solid ${T.borderM}`, borderRadius: 8, padding: '8px', color: T.text, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Download size={14} /> Télécharger
                      </button>
                      <button onClick={() => { const src = sources.find(x => toolResult.title.includes(x.name)); if (src) runTool(toolResult.tool, src.id) }}
                        style={{ background: T.cardBg, border: `1px solid ${T.borderM}`, borderRadius: 8, padding: '8px 12px', color: T.text, cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}><RefreshCw size={14} /></button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
                  {[
                    { tool: 'summary' as const, icon: <FileText size={16} />, label: 'Summary', desc: 'Résumé intelligent de vos documents', color: T.pastel.green },
                    { tool: 'quiz' as const, icon: <Target size={16} />, label: 'Quiz', desc: 'Générez des questions à choix multiple', color: T.pastel.green },
                    { tool: 'flashcards' as const, icon: <BookOpen size={16} />, label: 'Flashcards', desc: 'Créez des fiches de révision efficaces', color: T.pastel.green },
                  ].map(({ tool, icon, label, desc, color }) => {
                    const selSrcId = selectedToolSource[tool] || (sources[0]?.id ?? '')
                    return (
                      <div key={tool} className="studio-card" style={{ marginBottom: 12, background: T.cardBg, border: `1px solid ${T.borderM}`, borderRadius: 16, padding: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: color.bg, color: color.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: T.text }}>{label}</div>
                            <div style={{ fontSize: '0.75rem', color: T.textMuted, marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                          </div>
                        </div>
                        {sources.length === 0
                          ? <button onClick={() => fileRef.current?.click()} className="hov" style={{ width: '100%', padding: '10px', background: color.bg, color: color.text, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <ArrowUp size={16} /> Uploader un PDF
                          </button>
                          : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <select
                              value={selSrcId}
                              onChange={e => setSelectedToolSource(p => ({ ...p, [tool]: e.target.value }))}
                              className="hov"
                              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${T.borderM}`, background: T.surfaceHigh, color: T.text, fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', appearance: 'none', fontWeight: 500 }}>
                              {sources.map(src => (
                                <option key={src.id} value={src.id}>{src.name.replace(/\.[^.]+$/, '')} ({src.size})</option>
                              ))}
                            </select>
                            <button className="tool-btn" onClick={() => runTool(tool, selSrcId)} disabled={toolLoading || !selSrcId}
                              style={{ width: '100%', background: color.bg, color: color.text, border: 'none', borderRadius: 10, padding: '10px', cursor: (toolLoading || !selSrcId) ? 'default' : 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', opacity: toolLoading ? 0.7 : 1, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)' }}>
                              {toolLoading ? <span style={{ width: 14, height: 14, border: `2px solid ${color.text}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : <><Sparkles size={14} /> Générer</>}
                            </button>
                          </div>
                        }
                      </div>
                    )
                  })}

                  <div className="studio-card" style={{ background: T.cardBg, border: `1px solid ${T.borderM}`, borderRadius: 16, padding: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Lightbulb size={16} color={T.green} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: T.text }}>Conseil</span>
                      </div>
                      <MoreHorizontal size={14} color={T.textMuted} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: T.textSub, lineHeight: 1.5 }}>
                      Pour de meilleurs résultats, posez des questions précises sur le contenu de votre document.
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </>}

          {!rightOpen && <button onClick={() => setRightOpen(true)} className="hov" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 30, height: 56, background: T.cardBg, border: `1px solid ${T.border}`, borderRight: 'none', borderRadius: '8px 0 0 8px', cursor: 'pointer', color: T.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15 }}><ChevronLeft size={16} /></button>}
        </div>
      </div>
    </Sidebar>
  )
}