import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { generatePreviewBlob } from '../../services/previewService';

interface Props { projectId: string }

export default function SavedPreview({ projectId }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const files = useSelector((state: RootState) => state.files.items);

  const refreshPreview = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const url = await generatePreviewBlob(projectId);
      if (url) { setPreviewUrl(url); setLoading(false); }
      else { setError('No index.html found'); setLoading(false); }
    } catch (e: any) { setError(e.message); setLoading(false); }
  }, [projectId]);

  useEffect(() => { refreshPreview(); }, [files.length]);

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between border-b px-3 py-2 shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--success)' }} />
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>Game Preview</span>
        </div>
        <button onClick={refreshPreview} className="icon-btn !h-6 !w-6" title="Refresh">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {previewUrl ? (
          <iframe src={previewUrl} className="h-full w-full border-0" title="Game Preview" sandbox="allow-scripts" />
        ) : (
          <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            ) : (
              <div className="text-center">
                <p className="text-xs" style={{ color: error ? 'var(--danger)' : 'var(--text-muted)' }}>{error || 'No preview available'}</p>
                {error && <button onClick={refreshPreview} className="text-[10px] mt-1" style={{ color: 'var(--accent)' }}>Retry</button>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
