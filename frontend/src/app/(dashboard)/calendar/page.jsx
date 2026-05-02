'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, addMinutes, format, isSameDay, isToday, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import {
  ArrowLeft, ArrowRight, BellRing, CalendarDays, CalendarPlus,
  CalendarRange, Check, Clock3, Plus, Trash2, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  usePlannerStore, getWeekDays, isEventNear, isTaskForTab
} from '@/lib/calendar/planner-store';
import CubeLoader from '@/components/ui/CubeLoader';

const T = {
  card: {
    bg: 'var(--bg-card)', border: '1.5px solid var(--border-strong)', radius: '14px',
    shadow: '0 2px 10px rgba(0,0,0,0.12),0 4px 24px rgba(0,0,0,0.10)'
  },
  text: {
    primary: 'var(--text-primary)', secondary: 'var(--text-secondary)',
    muted: 'var(--text-muted)', accent: 'var(--accent)'
  },
};

const TYPE_LABEL = { course: 'Courses', task: 'Tasks', exam: 'Exams', personal: 'Personal' };
const TYPE_COLORS = {
  course: '#22c55e', task: '#3b82f6', exam: '#a855f7', personal: '#f97316'
};
const TYPE_BG = {
  course: 'rgba(34,197,94,0.12)', task: 'rgba(59,130,246,0.12)',
  exam: 'rgba(168,85,247,0.12)', personal: 'rgba(249,115,22,0.12)'
};
const PRIO_COLORS = { high: '#ef4444', medium: '#f97316', low: '#22c55e' };

const START_HOUR = 8, END_HOUR = 21, CELL_H = 56;

function toMin(v) { const [h, m] = v.split(':').map(Number); return h * 60 + m; }
function evLayout(ev) {
  const off = Math.max(0, toMin(ev.startTime) - START_HOUR * 60);
  const dur = Math.max(30, toMin(ev.endTime) - toMin(ev.startTime));
  return { top: (off / 60) * CELL_H, height: (dur / 60) * CELL_H - 4 };
}

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    anchorDate, currentTime, events, tasks, selectedEventId,
    setSelectedEventId, shiftWeek, goToToday, setCurrentTime,
    moveEvent, upsertEvent, deleteEvent, addTask, toggleTask,
    deleteTask, addTaskToCalendar, activeTab, setActiveTab
  } = usePlannerStore();

  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);
  const selectedEvent = events.find(e => e.id === selectedEventId) ?? null;
  const [editForm, setEditForm] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPrio, setNewPrio] = useState('medium');
  const [newDeadline, setNewDeadline] = useState('');

  useEffect(() => {
    if (!newDeadline && mounted) setNewDeadline(addMinutes(new Date(), 240).toISOString().slice(0, 16));
  }, [newDeadline, mounted]);

  useEffect(() => {
    if (!selectedEvent) { setEditForm(null); return; }
    setEditForm(selectedEvent);
  }, [selectedEvent]);

  useEffect(() => {
    const i = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(i);
  }, [setCurrentTime]);

  // Notifications
  useEffect(() => {
    const i = setInterval(() => {
      const now = new Date();
      events.forEach(ev => {
        const id = `near-${ev.id}-${format(now, 'yyyy-MM-dd-HH-mm')}`;
        if (isEventNear(ev, now, 10) && !sessionStorage.getItem(id)) {
          toast(`⏰ Dans 10 min: ${ev.title}`);
          sessionStorage.setItem(id, '1');
        }
      });
    }, 30000);
    return () => clearInterval(i);
  }, [events]);

  function handleSave() {
    if (!editForm || !editForm.title.trim() || editForm.endTime <= editForm.startTime) return;
    upsertEvent({ ...editForm, title: editForm.title.trim() });
    toast.success('Event updated');
    setSelectedEventId(null);
  }

  function handleAddTask() {
    const clean = newTitle.trim();
    if (!clean) return;
    addTask({ title: clean, deadline: new Date(newDeadline).toISOString(), priority: newPrio });
    setNewTitle(''); toast.success('Task added');
  }

  function handleDrop(ev, day) {
    const id = ev.dataTransfer.getData('text/plain');
    if (id) moveEvent(id, format(day, 'yyyy-MM-dd'), '10:00');
  }

  const filteredTasks = useMemo(
    () => tasks.filter(t => isTaskForTab(t, activeTab, new Date())),
    [tasks, activeTab]
  );
  const completedCount = tasks.filter(t => t.completed).length;
  const weekRange = `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`;

  const sCard = { background:T.card.bg, border:T.card.border, borderRadius:T.card.radius, boxShadow:T.card.shadow };

  if (!mounted) return <Sidebar><div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CubeLoader /></div></Sidebar>;

  return (
    <Sidebar>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.15))', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarDays style={{ width: 20, height: 20, color: '#10b981' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text.primary, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Calendrier & Planning
            </h1>
            <p style={{ fontSize: 13, color: T.text.muted, marginTop: 4 }}>
              Gérez votre emploi du temps, vos cours, examens et tâches au même endroit
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          {/* LEFT: Calendar */}
          <div>
            {/* Controls */}
            <div style={{ ...sCard, padding: '14px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text.primary }}>{weekRange}</div>
                <div style={{ fontSize: 11, color: T.text.muted, marginTop: 2 }}>Weekly view • Drag events to reschedule</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => shiftWeek('prev')} style={{ ...btnStyle }}>
                  <ArrowLeft style={{ width: 14, height: 14 }} />
                </button>
                <button onClick={goToToday} style={{ ...btnStyle, padding: '6px 14px', fontSize: 12, fontWeight: 600 }}>
                  Today
                </button>
                <button onClick={() => shiftWeek('next')} style={{ ...btnStyle }}>
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {Object.entries(TYPE_LABEL).map(([k, v]) => (
                <span key={k} style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                  background: TYPE_BG[k], color: TYPE_COLORS[k]
                }}>{v}</span>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: T.text.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CalendarDays style={{ width: 12, height: 12 }} /> {completedCount}/{tasks.length} tasks done
              </span>
            </div>

            {/* Grid */}
            <div style={{ ...sCard, padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7,minmax(100px,1fr))', minWidth: 800 }}>
                  {/* Header row */}
                  <div style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: 8, background: 'var(--bg-sidebar)' }} />
                  {weekDays.map(day => (
                    <div key={day.toISOString()} style={{
                      borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                      padding: '10px 4px', textAlign: 'center', background: 'var(--bg-sidebar)'
                    }}
                      onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, day)}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.text.muted }}>
                        {format(day, 'EEE')}
                      </div>
                      <div style={{
                        width: 30, height: 30, borderRadius: 10, margin: '4px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700,
                        background: isToday(day) ? 'var(--accent)' : 'transparent',
                        color: isToday(day) ? '#fff' : T.text.primary
                      }}>
                        {format(day, 'dd')}
                      </div>
                    </div>
                  ))}

                  {/* Time rows */}
                  {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
                    <div key={i} className="contents">
                      <div style={{
                        borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                        padding: '4px 8px', fontSize: 10, color: T.text.muted, height: CELL_H, fontWeight: 500
                      }}>
                        {String(START_HOUR + i).padStart(2, '0')}:00
                      </div>
                      {weekDays.map((day, di) => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const dayEvts = events.filter(e => e.date === dayKey);
                        return (
                          <div key={`${dayKey}-${i}`} style={{
                            borderRight: '1px solid var(--border)',
                            borderBottom: '1px solid var(--border)', height: CELL_H, position: 'relative',
                            background: isToday(day) ? 'rgba(34,197,94,0.03)' : 'transparent'
                          }}
                            onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, day)}>
                            {i === 0 && dayEvts.map(ev => {
                              const lay = evLayout(ev);
                              const c = TYPE_COLORS[ev.type] || '#6b7280';
                              return (
                                <div key={ev.id} draggable
                                  onDragStart={e => e.dataTransfer.setData('text/plain', ev.id)}
                                  onClick={() => setSelectedEventId(ev.id)}
                                  style={{
                                    position: 'absolute', left: 2, right: 2, top: lay.top, height: Math.max(28, lay.height),
                                    borderRadius: 8, padding: '3px 6px', cursor: 'pointer', zIndex: 10,
                                    background: `${c}18`, border: `1px solid ${c}40`,
                                    transition: 'transform 0.15s', overflow: 'hidden'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: T.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {ev.title}
                                  </div>
                                  <div style={{ fontSize: 9, color: T.text.muted, display: 'flex', alignItems: 'center', gap: 2, marginTop: 1 }}>
                                    <Clock3 style={{ width: 9, height: 9 }} />{ev.startTime}-{ev.endTime}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Edit Event Modal */}
            {selectedEvent && editForm && (
              <div style={{ ...sCard, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text.primary }}>Edit Event</h3>
                  <button onClick={() => setSelectedEventId(null)} style={{ ...iconBtn }}>
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    style={inputStyle} placeholder="Title" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} style={inputStyle} />
                    <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} style={inputStyle}>
                      {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input type="time" value={editForm.startTime} onChange={e => setEditForm({ ...editForm, startTime: e.target.value })} style={inputStyle} />
                    <input type="time" value={editForm.endTime} onChange={e => setEditForm({ ...editForm, endTime: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button onClick={() => { deleteEvent(selectedEvent.id); toast.success('Deleted') }}
                      style={{ ...btnStyle, color: '#ef4444', flex: 1 }}>Delete</button>
                    <button onClick={() => setSelectedEventId(null)} style={{ ...btnStyle, flex: 1 }}>Cancel</button>
                    <button onClick={handleSave}
                      style={{ ...btnStyle, background: 'var(--accent)', color: '#fff', border: 'none', flex: 1, fontWeight: 600 }}>Save</button>
                  </div>
                </div>
              </div>
            )}

            {/* To-Do List */}
            <div style={{ ...sCard, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text.primary }}>📋 To-Do List</h3>
                <button onClick={handleAddTask}
                  style={{ ...btnStyle, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Plus style={{ width: 12, height: 12 }} />Add
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="New task..."
                  style={inputStyle} onKeyDown={e => { if (e.key === 'Enter') handleAddTask() }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <input type="datetime-local" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} style={inputStyle} />
                  <select value={newPrio} onChange={e => setNewPrio(e.target.value)} style={inputStyle}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
                {['all', 'today', 'upcoming', 'completed'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid var(--border)',
                      background: activeTab === tab ? 'var(--accent)' : 'var(--bg-card)',
                      color: activeTab === tab ? '#fff' : T.text.secondary, cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Task list */}
              <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredTasks.length === 0 && (
                  <p style={{ textAlign: 'center', padding: 20, fontSize: 12, color: T.text.muted }}>No tasks</p>
                )}
                {filteredTasks.map(task => (
                  <div key={task.id} style={{
                    padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)',
                    background: 'var(--bg-card)', transition: 'all 0.15s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <button onClick={() => { toggleTask(task.id); toast.success(task.completed ? 'Reactivated' : 'Done!') }}
                        style={{
                          width: 20, height: 20, borderRadius: 6, border: `2px solid ${task.completed ? '#22c55e' : 'var(--border-strong)'}`,
                          background: task.completed ? '#22c55e' : 'transparent', color: task.completed ? '#fff' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1
                        }}>
                        <Check style={{ width: 12, height: 12 }} />
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12, fontWeight: 600, color: task.completed ? T.text.muted : T.text.primary,
                          textDecoration: task.completed ? 'line-through' : 'none'
                        }}>{task.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, color: T.text.muted, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CalendarRange style={{ width: 10, height: 10 }} />
                            {format(parseISO(task.deadline), 'MMM d, HH:mm')}
                          </span>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                            background: `${PRIO_COLORS[task.priority]}18`, color: PRIO_COLORS[task.priority]
                          }}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                        <button onClick={() => { addTaskToCalendar(task.id); toast.success('Added to calendar') }}
                          disabled={!!task.linkedEventId} title={task.linkedEventId ? 'Scheduled' : 'Add to calendar'}
                          style={{ ...iconBtn, opacity: task.linkedEventId ? 0.4 : 1 }}>
                          <CalendarPlus style={{ width: 13, height: 13 }} />
                        </button>
                        <button onClick={() => { deleteTask(task.id); toast.success('Deleted') }} style={iconBtn}>
                          <Trash2 style={{ width: 13, height: 13, color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 10, color: T.text.muted, marginTop: 8 }}>
                Completed: <b style={{ color: T.text.secondary }}>{completedCount}</b> / {tasks.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

const btnStyle = {
  padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
  fontSize: 13,
};
const iconBtn = {
  width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
};
const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 12, outline: 'none',
};
