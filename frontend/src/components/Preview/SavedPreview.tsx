import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { io, Socket } from 'socket.io-client';

interface Props { projectId: string }

export default function SavedPreview({ projectId }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useDom, setUseDom] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [buildStatus, setBuildStatus] = useState<string>('idle');
  const [progress, setProgress] = useState<number>(0);

  const previewUrl = `/api/projects/${projectId}/preview`;

  const refreshPreview = useCallback(() => {
    setLoading(true);
    setError(null);
    if (iframeRef.current) {
      iframeRef.current.src = previewUrl + `?t=${Date.now()}`;
    }
  }, [previewUrl]);

  useEffect(() => {
    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { token: localStorage.getItem('foundry_token') },
    });
    socketRef.current = socket;

    socket.emit('join:preview', { projectId });
    socket.on('build:start', () => { setBuildStatus('building'); setProgress(0); });
    socket.on('build:progress', ({ percent }: { percent: number }) => setProgress(percent));
    socket.on('build:complete', () => { setBuildStatus('ready'); refreshPreview(); });
    socket.on('build:error', ({ message }: { message: string }) => { setError(message); setBuildStatus('error'); });

    return () => { socket.disconnect(); };
  }, [projectId, refreshPreview]);

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-[#3c3c3c] bg-[#252526] px-3 py-1.5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-green-400">⬤</span>
          <span className="text-[11px] text-[#cccccc] font-medium">Saved State</span>
          {buildStatus === 'building' && (
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-20 rounded-full bg-[#3c3c3c] overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[9px] text-blue-400">{progress}%</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setUseDom(!useDom)}
            className={`px-1.5 py-0.5 text-[10px] rounded ${useDom ? 'bg-[#0078d4] text-white' : 'text-[#858585] hover:text-white'}`}
            title={useDom ? 'Switching to DOM mode' : 'Using iframe mode'}
          >
            {useDom ? 'DOM' : 'IFrame'}
          </button>
          <button onClick={refreshPreview} className="px-1.5 py-0.5 text-[10px] text-[#858585] hover:text-white rounded" title="Refresh Preview">
            🔄
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {useDom ? (
          <div className="h-full overflow-auto bg-white p-2" id="preview-dom-container" />
        ) : (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="h-full w-full border-0"
            title="Saved Game Preview"
            sandbox="allow-scripts allow-same-origin allow-popups"
            onLoad={() => setLoading(false)}
            onError={() => { setError('Failed to load preview'); setLoading(false); }}
          />
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]/80">
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
              <span className="text-[11px] text-[#858585]">Rendering preview...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]/80">
            <div className="text-center max-w-[300px]">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="text-xs text-red-400 mb-2">{error}</div>
              <button onClick={refreshPreview} className="text-[10px] text-blue-400 hover:underline">Retry</button>
            </div>
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/50 px-2 py-0.5 text-[10px] text-[#858585] backdrop-blur-sm">
          <span>FPS</span>
          <span className="text-green-400" id="fps-counter">60</span>
        </div>
      </div>
    </div>
  );
}
