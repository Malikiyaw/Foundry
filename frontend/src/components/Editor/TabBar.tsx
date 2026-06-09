import React from 'react';
import { OpenTab } from '../../types/index';

interface Props {
  tabs: OpenTab[];
  activeIndex: number;
  onClose: (index: number) => void;
  onSelect: (index: number) => void;
  onMove: (from: number, to: number) => void;
}

function getTabIcon(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const icons: Record<string, string> = {
    js: '🟨', ts: '🟦', jsx: '⚛️', tsx: '⚛️', html: '🟧', css: '🟪',
    json: '🟫', md: '⬜', py: '🐍', cpp: '🔵', csharp: '🟣',
  };
  return icons[ext || ''] || '📄';
}

export default function TabBar({ tabs, activeIndex, onClose, onSelect }: Props) {
  if (tabs.length === 0) return null;

  return (
    <div className="flex h-[35px] items-end overflow-x-auto border-b border-[#252526] bg-[#252526]">
      {tabs.map((tab, index) => (
        <div
          key={tab.fileId}
          className={`group flex cursor-pointer items-center gap-1 px-3 py-1.5 text-xs border-r border-t border-[#252526] ${
            index === activeIndex
              ? 'bg-[#1e1e1e] text-[#cccccc] border-t-[#0078d4] border-t-2'
              : 'bg-[#2d2d2d] text-[#858585] hover:bg-[#2a2d2e]'
          }`}
          onClick={() => onSelect(index)}
        >
          <span className="text-xs">{getTabIcon(tab.path)}</span>
          <span className="truncate max-w-[120px]">{tab.path.split('/').pop() || tab.path}</span>
          {tab.isDirty && <span className="text-[#ffcc00] text-xs">●</span>}
          <button
            className="ml-1 rounded p-0.5 text-[#858585] opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] hover:text-[#cccccc]"
            onClick={(e) => { e.stopPropagation(); onClose(index); }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
