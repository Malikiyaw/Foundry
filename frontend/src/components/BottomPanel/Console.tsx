import React, { useState, useCallback } from 'react';

interface LogEntry {
  id: number;
  source: 'saved' | 'live';
  type: 'log' | 'error' | 'warn';
  message: string;
  timestamp: Date;
  filePath?: string;
  line?: number;
}

export default function Console() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'log' | 'error' | 'warn'>('all');

  const clear = useCallback(() => setLogs([]), []);

  const filtered = logs.filter((l) => filter === 'all' || l.type === filter);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      default: return 'text-[#cccccc]';
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex items-center gap-2 border-b border-[#3c3c3c] px-3 py-1">
        <button onClick={() => setFilter('all')} className={`text-xs px-2 py-0.5 rounded ${filter === 'all' ? 'bg-[#0078d4] text-white' : 'text-[#858585] hover:bg-[#3c3c3c]'}`}>All</button>
        <button onClick={() => setFilter('log')} className={`text-xs px-2 py-0.5 rounded ${filter === 'log' ? 'bg-[#0078d4] text-white' : 'text-[#858585] hover:bg-[#3c3c3c]'}`}>Logs</button>
        <button onClick={() => setFilter('warn')} className={`text-xs px-2 py-0.5 rounded ${filter === 'warn' ? 'bg-[#0078d4] text-white' : 'text-[#858585] hover:bg-[#3c3c3c]'}`}>Warnings</button>
        <button onClick={() => setFilter('error')} className={`text-xs px-2 py-0.5 rounded ${filter === 'error' ? 'bg-[#0078d4] text-white' : 'text-[#858585] hover:bg-[#3c3c3c]'}`}>Errors</button>
        <div className="flex-1" />
        <button onClick={clear} className="text-xs text-[#858585] hover:text-[#cccccc] px-2 py-0.5">Clear</button>
      </div>

      <div className="flex-1 overflow-auto font-mono text-xs">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[#858585]">No console output</div>
        ) : (
          filtered.map((log) => (
            <div key={log.id} className={`flex gap-2 border-b border-[#2d2d2d] px-3 py-1 ${getTypeColor(log.type)}`}>
              <span className="text-[#858585] shrink-0 w-12">[{log.source}]</span>
              <span className="shrink-0">{log.type === 'error' ? '✕' : log.type === 'warn' ? '⚠' : '→'}</span>
              <span className="flex-1">{log.message}</span>
              {log.filePath && (
                <span className="text-[#3794ff] cursor-pointer hover:underline shrink-0">{log.filePath}:{log.line}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
