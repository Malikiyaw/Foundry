import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../../services/socket';

interface Props { projectId: string }

export default function LivePreview({ projectId }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [connected, setConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [hotReloadCount, setHotReloadCount] = useState(0);

  const socket = useSocket();

  const refreshPreview = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = `/api/projects/${projectId}/preview?live=true&t=${Date.now()}`;
      setLastRefresh(new Date());
    }
  }, [projectId]);

  useEffect(() => {
    if (!socket) return;
    socket.on('hotreload', () => {
      setHotReloadCount((c) => c + 1);
      refreshPreview();
    });
    return () => { socket.off('hotreload'); };
  }, [socket, refreshPreview]);

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-[#3c3c3c] bg-[#252526] px-3 py-1.5 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] ${connected ? 'text-green-400' : 'text-yellow-500'}`}>⬤</span>
          <span className="text-[11px] text-[#cccccc] font-medium">Live Preview</span>
          <span className="text-[10px] text-[#858585]">(Hot Reload)</span>
          {hotReloadCount > 0 && (
            <span className="text-[9px] text-blue-400">⟳{hotReloadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={refreshPreview}
            className="px-1.5 py-0.5 text-[10px] text-[#858585] hover:text-white rounded"
            title="Refresh Preview"
          >
            🔄
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={`/api/projects/${projectId}/preview?live=true`}
          className="h-full w-full border-0"
          title="Live Game Preview"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />

        <div className="absolute bottom-2 right-2 flex items-center gap-2 rounded bg-black/50 px-2 py-0.5 text-[10px] backdrop-blur-sm">
          <span className="text-[#858585]">Hot Reload</span>
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-yellow-500'}`} />
        </div>

        {!connected && (
          <div className="absolute right-2 top-2 rounded bg-yellow-500/10 px-2 py-0.5 text-[9px] text-yellow-400 border border-yellow-500/20">
            Connecting...
          </div>
        )}
      </div>
    </div>
  );
}
