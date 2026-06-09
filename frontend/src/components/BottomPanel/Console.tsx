import React, { useEffect, useState } from 'react';
import { useSocket } from '../../services/socket';

interface Props { projectId: string }

interface LogEntry {
  type: 'log' | 'warn' | 'error' | 'info' | 'system';
  message: string;
  timestamp: Date;
  source?: string;
}

export default function Console({ projectId }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on('console:log', (entry: LogEntry) => setLogs((prev) => [...prev, { ...entry, timestamp: new Date() }]));
    socket.on('console:clear', () => setLogs([]));
    return () => { socket.off('console:log'); socket.off('console:clear'); };
  }, [socket]);

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'log': return '📝';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      case 'system': return '⚙️';
      default: return '📝';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'system': return 'text-purple-400';
      default: return 'text-[#cccccc]';
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-[#3c3c3c] bg-[#252526] px-2 py-1 shrink-0">
        <div className="flex items-center gap-1">
          {(['all', 'log', 'warn', 'error'] as const).map((f) => (
            <button
              key={f}
              className={`px-2 py-0.5 text-[10px] rounded transition-colors uppercase tracking-wider ${
                filter === f ? 'bg-[#094771] text-white' : 'text-[#858585] hover:text-white'
              }`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#858585]">{filtered.length} entries</span>
          <button
            className={`text-[10px] px-1.5 py-0.5 rounded ${autoScroll ? 'text-blue-400' : 'text-[#858585]'}`}
            onClick={() => setAutoScroll(!autoScroll)}
          >
            AutoScroll
          </button>
          <button className="text-[10px] text-[#858585] hover:text-white" onClick={() => setLogs([])}>Clear</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-0.5">
        {filtered.slice(-500).map((log, i) => (
          <div key={i} className={`flex items-start gap-1.5 ${getColor(log.type)}`}>
            <span className="shrink-0 text-[10px]">{getIcon(log.type)}</span>
            <span className="text-[9px] text-[#858585] shrink-0">
              {log.timestamp.toLocaleTimeString()}
            </span>
            <span className="break-all">{log.message}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-full text-[#858585] text-[11px]">
            No console output yet
          </div>
        )}
      </div>
    </div>
  );
}
