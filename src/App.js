import React, { useState, useEffect, useRef } from 'react';

const CATEGORIES = [
  { id: 'all', label: 'Todas', color: '#a78bfa' },
  { id: 'personal', label: 'Personal', color: '#34d399' },
  { id: 'trabajo', label: 'Trabajo', color: '#60a5fa' },
  { id: 'urgente', label: 'Urgente', color: '#f87171' },
];

const PRIORITIES = [
  { id: 'alta', label: 'Alta', color: '#f87171' },
  { id: 'media', label: 'Media', color: '#fbbf24' },
  { id: 'baja', label: 'Baja', color: '#34d399' },
];

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('mistareas_tasks', []);
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState('media');
  const [filter, setFilter] = useState('all');
  const [showDone, setShowDone] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [swipingId, setSwipingId] = useState(null);
  const inputRef = useRef(null);

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    const newTask = {
      id: Date.now(),
      text,
      category,
      priority,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    setInput('');
    inputRef.current?.focus();
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const saveEdit = (id) => {
    const text = editText.trim();
    if (text) setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t));
    setEditingId(null);
  };

  const filtered = tasks.filter(t => {
    const catMatch = filter === 'all' || t.category === filter;
    const doneMatch = showDone ? true : !t.done;
    return catMatch && doneMatch;
  });

  const pending = tasks.filter(t => !t.done).length;
  const done = tasks.filter(t => t.done).length;
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div style={styles.root}>
      <div style={styles.container}>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>MisTareas</h1>
              <p style={styles.subtitle}>Convergencia Tecnológica · Productividad</p>
            </div>
            <div style={styles.badge}>
              <span style={styles.badgeNum}>{pending}</span>
              <span style={styles.badgeLabel}>pendientes</span>
            </div>
          </div>

          {/* Progress */}
          {tasks.length > 0 && (
            <div style={styles.progressWrap}>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>
              <span style={styles.progressText}>{progress}% completado</span>
            </div>
          )}
        </header>

        {/* Input area */}
        <div style={styles.inputCard}>
          <div style={styles.inputRow}>
            <input
              ref={inputRef}
              style={styles.input}
              placeholder="Añadir nueva tarea..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
            />
            <button style={styles.addBtn} onClick={addTask}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <div style={styles.tagsRow}>
            <div style={styles.tagGroup}>
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <button
                  key={c.id}
                  style={{ ...styles.tag, ...(category === c.id ? { background: c.color + '30', color: c.color, borderColor: c.color + '60' } : {}) }}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div style={styles.tagGroup}>
              {PRIORITIES.map(p => (
                <button
                  key={p.id}
                  style={{ ...styles.tag, ...(priority === p.id ? { background: p.color + '25', color: p.color, borderColor: p.color + '60' } : {}) }}
                  onClick={() => setPriority(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.catFilters}>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                style={{ ...styles.filterBtn, ...(filter === c.id ? { color: c.color, borderBottomColor: c.color } : {}) }}
                onClick={() => setFilter(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <button
            style={{ ...styles.toggleDone, ...(showDone ? styles.toggleDoneActive : {}) }}
            onClick={() => setShowDone(v => !v)}
          >
            {showDone ? 'Ocultar hechas' : 'Ver hechas'}
          </button>
        </div>

        {/* Task list */}
        <div style={styles.list}>
          {filtered.length === 0 && (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>✓</div>
              <p style={styles.emptyText}>
                {tasks.length === 0 ? 'Añade tu primera tarea' : 'No hay tareas aquí'}
              </p>
            </div>
          )}

          {filtered.map(task => {
            const cat = CATEGORIES.find(c => c.id === task.category);
            const pri = PRIORITIES.find(p => p.id === task.priority);
            const isEditing = editingId === task.id;

            return (
              <div
                key={task.id}
                style={{
                  ...styles.taskCard,
                  ...(task.done ? styles.taskDone : {}),
                  borderLeftColor: cat?.color || '#a78bfa',
                }}
              >
                <button style={styles.checkBtn} onClick={() => toggleTask(task.id)}>
                  <div style={{ ...styles.check, ...(task.done ? { background: cat?.color, borderColor: cat?.color } : { borderColor: cat?.color + '80' }) }}>
                    {task.done && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>

                <div style={styles.taskBody}>
                  {isEditing ? (
                    <input
                      autoFocus
                      style={styles.editInput}
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(task.id); if (e.key === 'Escape') setEditingId(null); }}
                      onBlur={() => saveEdit(task.id)}
                    />
                  ) : (
                    <span style={{ ...styles.taskText, ...(task.done ? styles.taskTextDone : {}) }}>
                      {task.text}
                    </span>
                  )}
                  <div style={styles.taskMeta}>
                    <span style={{ ...styles.pill, color: cat?.color, borderColor: cat?.color + '40', background: cat?.color + '15' }}>
                      {cat?.label}
                    </span>
                    <span style={{ ...styles.priDot, background: pri?.color }} />
                    <span style={{ ...styles.priLabel, color: pri?.color }}>{pri?.label}</span>
                  </div>
                </div>

                <div style={styles.taskActions}>
                  {!task.done && (
                    <button style={styles.iconBtn} onClick={() => { setEditingId(task.id); setEditText(task.text); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                  <button style={{ ...styles.iconBtn, color: '#f87171' }} onClick={() => deleteTask(task.id)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats footer */}
        {tasks.length > 0 && (
          <div style={styles.stats}>
            <div style={styles.stat}><span style={styles.statNum}>{tasks.length}</span><span style={styles.statLabel}>Total</span></div>
            <div style={styles.stat}><span style={{ ...styles.statNum, color: '#60a5fa' }}>{pending}</span><span style={styles.statLabel}>Pendientes</span></div>
            <div style={styles.stat}><span style={{ ...styles.statNum, color: '#34d399' }}>{done}</span><span style={styles.statLabel}>Hechas</span></div>
            {done > 0 && (
              <button style={styles.clearBtn} onClick={() => setTasks(prev => prev.filter(t => !t.done))}>
                Limpiar hechas
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    background: '#0f0f1a',
    display: 'flex',
    justifyContent: 'center',
    padding: '0 0 40px',
    fontFamily: "'DM Sans', sans-serif",
  },
  container: {
    width: '100%',
    maxWidth: '480px',
    padding: '0 16px',
  },
  header: {
    padding: '32px 0 20px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '32px',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-1px',
    background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '12px',
    color: '#4a4a6a',
    margin: '4px 0 0',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  badge: {
    background: '#1e1e35',
    border: '1px solid #2a2a45',
    borderRadius: '12px',
    padding: '8px 14px',
    textAlign: 'center',
  },
  badgeNum: {
    display: 'block',
    fontFamily: "'Syne', sans-serif",
    fontSize: '24px',
    fontWeight: '700',
    color: '#a78bfa',
    lineHeight: 1,
  },
  badgeLabel: {
    fontSize: '10px',
    color: '#5a5a7a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  progressWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  progressBar: {
    flex: 1,
    height: '4px',
    background: '#1e1e35',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
    borderRadius: '2px',
    transition: 'width 0.4s ease',
  },
  progressText: {
    fontSize: '12px',
    color: '#5a5a7a',
    whiteSpace: 'nowrap',
  },
  inputCard: {
    background: '#1a1a2e',
    border: '1px solid #2a2a45',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '20px',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '12px',
  },
  input: {
    flex: 1,
    background: '#0f0f1a',
    border: '1px solid #2a2a45',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#e0e0ff',
    fontSize: '15px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  },
  addBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    border: 'none',
    borderRadius: '10px',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    cursor: 'pointer',
    flexShrink: 0,
  },
  tagsRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  tagGroup: {
    display: 'flex',
    gap: '6px',
  },
  tag: {
    background: 'transparent',
    border: '1px solid #2a2a45',
    borderRadius: '20px',
    padding: '5px 12px',
    fontSize: '12px',
    color: '#5a5a7a',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s',
  },
  filters: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #1e1e35',
    paddingBottom: '12px',
  },
  catFilters: {
    display: 'flex',
    gap: '4px',
  },
  filterBtn: {
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '4px 10px 8px',
    fontSize: '13px',
    color: '#4a4a6a',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s',
  },
  toggleDone: {
    background: 'transparent',
    border: '1px solid #2a2a45',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '11px',
    color: '#4a4a6a',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  toggleDoneActive: {
    color: '#a78bfa',
    borderColor: '#a78bfa40',
    background: '#a78bfa10',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  empty: {
    textAlign: 'center',
    padding: '48px 0',
  },
  emptyIcon: {
    fontSize: '36px',
    marginBottom: '12px',
    opacity: 0.15,
    color: '#a78bfa',
  },
  emptyText: {
    color: '#3a3a5a',
    fontSize: '14px',
    margin: 0,
  },
  taskCard: {
    background: '#1a1a2e',
    border: '1px solid #2a2a45',
    borderLeft: '3px solid #a78bfa',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s',
  },
  taskDone: {
    opacity: 0.5,
  },
  checkBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  },
  check: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  taskBody: {
    flex: 1,
    minWidth: 0,
  },
  taskText: {
    display: 'block',
    fontSize: '15px',
    color: '#d0d0f0',
    marginBottom: '6px',
    wordBreak: 'break-word',
  },
  taskTextDone: {
    textDecoration: 'line-through',
    color: '#3a3a5a',
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pill: {
    fontSize: '11px',
    border: '1px solid',
    borderRadius: '20px',
    padding: '2px 8px',
  },
  priDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  priLabel: {
    fontSize: '11px',
  },
  editInput: {
    width: '100%',
    background: '#0f0f1a',
    border: '1px solid #a78bfa60',
    borderRadius: '6px',
    padding: '4px 8px',
    color: '#e0e0ff',
    fontSize: '15px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    marginBottom: '6px',
  },
  taskActions: {
    display: 'flex',
    gap: '4px',
    flexShrink: 0,
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#3a3a5a',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '6px',
    transition: 'color 0.15s',
  },
  stats: {
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '16px',
    background: '#1a1a2e',
    border: '1px solid #2a2a45',
    borderRadius: '12px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statNum: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '20px',
    fontWeight: '700',
    color: '#e0e0ff',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '10px',
    color: '#4a4a6a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  clearBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    border: '1px solid #f8717130',
    borderRadius: '20px',
    padding: '5px 12px',
    fontSize: '12px',
    color: '#f87171',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
};
