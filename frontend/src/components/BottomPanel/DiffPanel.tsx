import React from 'react';

export default function DiffPanel() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-medium text-white mb-1">No changes to show</p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Generate AI changes to see diffs</p>
      </div>
    </div>
  );
}
