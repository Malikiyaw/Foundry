import React from 'react';
import Explorer from './Explorer';

interface Props { projectId: string }

export default function Sidebar({ projectId }: Props) {
  return (
    <div className="flex h-full flex-col bg-[#252526]">
      <div className="flex items-center justify-between border-b border-[#3c3c3c] px-4 py-2 shrink-0">
        <span className="text-[11px] font-semibold uppercase text-[#858585] tracking-widest">Explorer</span>
        <span className="text-[10px] text-[#858585]">•</span>
      </div>
      <div className="flex-1 overflow-auto">
        <Explorer projectId={projectId} />
      </div>
      <div className="border-t border-[#3c3c3c] px-4 py-1.5 text-[10px] text-[#858585] shrink-0">
        Drag files to upload
      </div>
    </div>
  );
}
