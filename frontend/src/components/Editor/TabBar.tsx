import React from 'react';
import { Tab } from '../../store/editorSlice';

interface Props {
  tabs: Tab[];
  activeIndex: number;
  onClose: (index: number) => void;
  onSelect: (index: number) => void;
}

export default function TabBar({ tabs, activeIndex, onClose, onSelect }: Props) {
  if (tabs.length === 0) return null;

  return (
    <div className="flex h-[35px] shrink-0 items-end overflow-x-auto border-b border-[#252526] bg-[#252526] scrollbar-none">
      {tabs.map((tab, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={`${tab.fileId}-${i}`}
            className={`group flex shrink-0 items-center gap-1.5 border-r border-[#3c3c3c] px-3 py-1.5 text-xs cursor-pointer transition-colors select-none ${
              isActive
                ? 'bg-[#1e1e1e] text-white border-t-[1.5px] border-t-[#0078d4]'
                : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#333]'
            }`}
            onClick={() => onSelect(i)}
          >
            {tab.isGenerated && <span className="text-[10px] text-blue-400" title="AI Generated">◆</span>}
            <span className="whitespace-nowrap">{tab.path.split('/').pop()}</span>
            <button
              className={`ml-1 flex h-4 w-4 items-center justify-center rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ffffff1a] ${
                isActive ? 'opacity-60 hover:opacity-100' : ''
              }`}
              onClick={(e) => { e.stopPropagation(); onClose(i); }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
