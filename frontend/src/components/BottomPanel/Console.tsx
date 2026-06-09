import React, { useState } from 'react';

interface Props { projectId: string }

interface LogEntry { type: 'log' | 'warn' | 'error' | 'info'; message: string; timestamp: Date }

export default function Console({ projectId }: Props) {
  const [logs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.type === filter);

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between border-b px-2 py-1.5 shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-1">
          {(['all', 'log', 'warn', 'error'] as const).map((f) => (
            <button
              key={f}
              className="px-2 py-0.5 text-[10px] rounded font-medium uppercase tracking-wider transition-all"
              style={{
                background: filter === f ? 'var(--accent-subtle)' : 'transparent',
                color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
              }}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{filtered.length} entries</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-0.5">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-full text-[11px]" style={{ color: 'var(--text-muted)' }}>
            No console output
          </div>
        )}
      </div>
    </div>
  );
}
