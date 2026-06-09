import React from 'react';
import { Tab } from '../../store/editorSlice';

interface Props {
  tabs: Tab[];
  activeIndex: number;
  onClose: (index: number) => void;
  onSelect: (index: number) => void;
}

const FILE_DOT_COLORS: Record<string, string> = {
  js: '#f7df1e', ts: '#3178c6', jsx: '#61dafb', tsx: '#3178c6',
  html: '#e34c26', css: '#264de4', json: '#5b5b5b', py: '#3776ab',
  md: '#083fa1', scss: '#cc6699', svg: '#ffb13b',
};

export default function TabBar({ tabs, activeIndex, onClose, onSelect }: Props) {
  if (tabs.length === 0) return null;

  return (
    <div className="flex h-[36px] shrink-0 items-end overflow-x-auto" style={{ background: 'var(--bg-secondary)' }}>
      {tabs.map((tab, i) => {
        const isActive = i === activeIndex;
        const ext = tab.path.split('.').pop()?.toLowerCase() || '';
        const dotColor = FILE_DOT_COLORS[ext] || 'var(--text-muted)';
        return (
          <div
            key={`${tab.fileId}-${i}`}
            className="group flex shrink-0 items-center gap-2 px-4 py-2 text-xs cursor-pointer transition-all relative select-none"
            style={{
              background: isActive ? 'var(--bg-primary)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              borderRight: '1px solid var(--border-primary)',
            }}
            onClick={() => onSelect(i)}
          >
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'var(--gradient-1)' }} />
            )}
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: dotColor }} />
            <span className="whitespace-nowrap">{tab.path.split('/').pop()}</span>
            {tab.isDirty && (
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'var(--accent-orange)' }} title="Unsaved changes" />
            )}
            <button
              className="ml-1 flex h-4 w-4 items-center justify-center rounded transition-all shrink-0"
              style={{
                opacity: isActive ? 0.6 : 0,
                color: 'var(--text-muted)',
              }}
              onClick={(e) => { e.stopPropagation(); onClose(i); }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = isActive ? '0.6' : '0'; e.currentTarget.style.background = 'transparent'; }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
