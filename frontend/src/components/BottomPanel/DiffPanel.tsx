import React from 'react';

export default function DiffPanel() {
  return (
    <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="mb-3 text-3xl">⇄</div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No changes to show</p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Generate AI changes to see diffs</p>
      </div>
    </div>
  );
}
