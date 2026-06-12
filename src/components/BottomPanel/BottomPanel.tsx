import React, { useState } from 'react';
import AIChat from './AIChat';
import Terminal from './Terminal';
import Console from './Console';
import DiffPanel from './DiffPanel';

interface Props { projectId: string }

const TABS = [
  { id: 'terminal', label: 'Terminal', icon: '⊞' },
  { id: 'console', label: 'Console', icon: '⬚' },
  { id: 'ai-chat', label: 'AI Chat', icon: '✦' },
  { id: 'diff', label: 'Diff', icon: '⇄' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function BottomPanel({ projectId }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('terminal');

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex shrink-0 items-center border-b" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] transition-all relative"
            style={{
              background: activeTab === tab.id ? 'var(--bg-primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {activeTab === tab.id && (
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'var(--gradient-1)' }} />
            )}
            <span className="text-[10px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <span className="pr-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>Problems 0</span>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'terminal' && <Terminal projectId={projectId} />}
        {activeTab === 'console' && <Console projectId={projectId} />}
        {activeTab === 'ai-chat' && <AIChat projectId={projectId} />}
        {activeTab === 'diff' && <DiffPanel />}
      </div>
    </div>
  );
}
