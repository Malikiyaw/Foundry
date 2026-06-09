import React from 'react';
import Explorer from './Explorer';

interface Props { projectId: string }

export default function Sidebar({ projectId }: Props) {
  return (
    <div className="flex w-[250px] min-w-[180px] flex-col border-r border-[#3c3c3c] bg-[#252526]">
      <div className="flex items-center gap-2 border-b border-[#3c3c3c] px-4 py-2">
        <span className="text-xs font-semibold uppercase text-[#858585] tracking-wider">Explorer</span>
      </div>
      <div className="flex-1 overflow-auto">
        <Explorer projectId={projectId} />
      </div>
    </div>
  );
}
