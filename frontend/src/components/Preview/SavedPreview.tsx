import React, { useState, useRef, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Props { projectId: string }

export default function SavedPreview({ projectId }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [progress, setProgress] = useState<number>(0);

  const previewUrl = `/api/projects/${projectId}/preview`;

  const refreshPreview = useCallback(() => {
    setLoading(true); setError(null);
    if (iframeRef.current) iframeRef.current.src = previewUrl + `?t=${Date.now()}`;
  }, [previewUrl]);

  useEffect(() => {
    const socket = io({ path: '/socket.io', transports: ['websocket', 'polling'], auth: { token: localStorage.getItem('foundry_token') } });
    socket.emit('join:preview', { projectId });
    socket.on('build:progress', ({ percent }: { percent: number }) => setProgress(percent));
    socket.on('build:complete', () => { setProgress(100); refreshPreview(); });
    socket.on('build:error', ({ message }: { message: string }) => setError(message));
    return () => { socket.disconnect(); };
  }, [projectId, refreshPreview]);

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between border-b px-3 py-2 shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent-green)' }} />
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>Saved State</span>
          {progress > 0 && progress < 100 && (
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-16 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--gradient-1)' }} />
              </div>
              <span className="text-[9px]" style={{ color: 'var(--accent)' }}>{progress}%</span>
            </div>
          )}
        </div>
        <button onClick={refreshPreview} className="icon-btn !h-6 !w-6" title="Refresh">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="h-full w-full border-0"
          title="Saved Preview"
          sandbox="allow-scripts allow-same-origin allow-popups"
          onLoad={() => setLoading(false)}
          onError={() => { setError('Failed to load'); setLoading(false); }}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
            <div className="text-center">
              <p className="text-xs mb-2" style={{ color: 'var(--danger)' }}>{error}</p>
              <button onClick={refreshPreview} className="text-[10px]" style={{ color: 'var(--accent)' }}>Retry</button>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] glass" style={{ color: 'var(--text-muted)' }}>
          <span>FPS</span><span style={{ color: 'var(--accent-green)' }}>60</span>
        </div>
      </div>
    </div>
  );
}
