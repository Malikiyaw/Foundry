import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { generatePreviewBlob } from '../../services/previewService';

interface Props { projectId: string }

export default function LivePreview({ projectId }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [reloadCount, setReloadCount] = useState(0);
  const files = useSelector((state: RootState) => state.files.items);

  const refreshPreview = useCallback(async () => {
    try {
      const url = await generatePreviewBlob(projectId);
      if (url) setPreviewUrl(url);
    } catch {}
  }, [projectId]);

  useEffect(() => {
    refreshPreview();
    setReloadCount((c) => c + 1);
  }, [files.length, refreshPreview]);

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between border-b px-3 py-2 shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent-green)' }} />
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>Live Preview</span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>(Auto-reload)</span>
          <span className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>×{reloadCount}</span>
        </div>
        <button onClick={refreshPreview} className="icon-btn !h-6 !w-6" title="Refresh">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {previewUrl ? (
          <iframe key={previewUrl} src={previewUrl} className="h-full w-full border-0" title="Live Preview" sandbox="allow-scripts" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Create index.html to preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
