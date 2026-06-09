import React from 'react';
import Explorer from './Explorer';

interface Props { projectId: string }

export default function Sidebar({ projectId }: Props) {
  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-secondary)' }}>
      <div className="flex items-center justify-between border-b px-4 py-2.5 shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Explorer</span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>•</span>
      </div>
      <div className="flex-1 overflow-auto py-1">
        <Explorer projectId={projectId} />
      </div>
      <div className="border-t px-4 py-2 text-[10px] shrink-0" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
        Drag files to upload
      </div>
    </div>
  );
}
