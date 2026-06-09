import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../../services/socket';

interface Props { projectId: string }

export default function LivePreview({ projectId }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [connected, setConnected] = useState(false);
  const [hotReloadCount, setHotReloadCount] = useState(0);
  const socket = useSocket();

  const refreshPreview = useCallback(() => {
    if (iframeRef.current) iframeRef.current.src = `/api/projects/${projectId}/preview?live=true&t=${Date.now()}`;
  }, [projectId]);

  useEffect(() => {
    if (!socket) return;
    setConnected(true);
    socket.on('hotreload', () => { setHotReloadCount((c) => c + 1); refreshPreview(); });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect', () => setConnected(true));
    return () => { socket.off('hotreload'); socket.off('disconnect'); socket.off('connect'); };
  }, [socket, refreshPreview]);

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between border-b px-3 py-2 shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: connected ? 'var(--accent-green)' : 'var(--warning)' }} />
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>Live Preview</span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>(Hot Reload)</span>
          {hotReloadCount > 0 && (
            <span className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              ×{hotReloadCount}
            </span>
          )}
        </div>
        <button onClick={refreshPreview} className="icon-btn !h-6 !w-6" title="Refresh">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={`/api/projects/${projectId}/preview?live=true`}
          className="h-full w-full border-0"
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </div>
  );
}
