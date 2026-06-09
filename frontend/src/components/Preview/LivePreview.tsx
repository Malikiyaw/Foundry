import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';

interface Props { projectId: string }

export default function LivePreview({ projectId }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [fps, setFps] = useState(0);
  const [showPerf, setShowPerf] = useState(false);
  const files = useSelector((state: RootState) => state.files.items);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const liveContent = useMemo(() => {
    const indexFile = files.find((f) => f.path === 'index.html');
    if (!indexFile) return null;

    const scripts = files
      .filter((f) => f.path.endsWith('.js') && f.path !== 'index.html')
      .map((f) => `<script>${f.content}</script>`)
      .join('\n');

    return indexFile.content.replace('</body>', `${scripts}\n</body>`);
  }, [files, updateTrigger]);

  useEffect(() => {
    const timer = setTimeout(() => setUpdateTrigger((t) => t + 1), 300);
    return () => clearTimeout(timer);
  }, [files]);

  useEffect(() => {
    let frame: number;
    let lastTime = performance.now();
    const measure = (time: number) => {
      setFps(Math.round(1000 / (time - lastTime)));
      lastTime = time;
      frame = requestAnimationFrame(measure);
    };
    if (showPerf) frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [showPerf]);

  return (
    <div className="relative flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-[#3c3c3c] px-3 py-1">
        <span className="text-[11px] font-medium text-[#858585] uppercase tracking-wider">
          Live Preview
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => iframeRef.current?.contentWindow?.location.reload()}
            className="rounded px-1.5 py-0.5 text-[11px] text-[#858585] hover:bg-[#3c3c3c]"
            title="Refresh"
          >
            ↻
          </button>
          <button
            onClick={() => setShowPerf(!showPerf)}
            className={`rounded px-1.5 py-0.5 text-[11px] ${showPerf ? 'text-[#4ecdc4]' : 'text-[#858585]'} hover:bg-[#3c3c3c]`}
            title="Performance Overlay"
          >
            📊
          </button>
        </div>
      </div>

      <div className="relative flex-1">
        {liveContent ? (
          <iframe
            ref={iframeRef}
            srcDoc={liveContent}
            className="h-full w-full border-0 bg-white"
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[#858585]">Generate a game to see live preview</p>
          </div>
        )}
        {showPerf && (
          <div className="absolute right-2 top-2 rounded bg-black/80 px-2 py-1 text-xs text-[#4ecdc4]">
            FPS: {fps}
          </div>
        )}
      </div>
    </div>
  );
}
