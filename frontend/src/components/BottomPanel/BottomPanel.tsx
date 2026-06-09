import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
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
  const showAIChatPanel = useSelector((state: RootState) => state.ui.showAIChat);

  const finalTabs = showAIChatPanel || activeTab !== 'ai-chat'
    ? TABS
    : TABS.filter((t) => t.id !== 'ai-chat');

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex shrink-0 items-center border-b border-[#3c3c3c] bg-[#252526]">
        {finalTabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-1.5 border-r border-[#3c3c3c] px-3 py-1.5 text-[11px] transition-colors ${
              activeTab === tab.id
                ? 'bg-[#1e1e1e] text-white border-t-[1.5px] border-t-[#0078d4]'
                : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#333] hover:text-[#cccccc]'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="text-[10px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <span className="pr-3 text-[10px] text-[#858585]">Problems 0 ⚡ 0</span>
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
