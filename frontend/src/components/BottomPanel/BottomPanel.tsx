import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { setActiveBottomTab } from '../../store/uiSlice';
import Terminal from './Terminal';
import Console from './Console';
import AIChat from './AIChat';
import DiffViewer from './DiffViewer';

interface Props { projectId: string }

const TABS = [
  { id: 'terminal' as const, label: 'Terminal', icon: '⬛' },
  { id: 'console' as const, label: 'Console', icon: '⬜' },
  { id: 'ai-chat' as const, label: 'AI Chat', icon: '🤖' },
  { id: 'diff' as const, label: 'Diff', icon: '📝' },
];

export default function BottomPanel({ projectId }: Props) {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.ui.activeBottomTab);

  return (
    <div className="flex h-[200px] min-h-[100px] flex-col border-t border-[#3c3c3c] bg-[#1e1e1e]">
      <div className="flex items-center border-b border-[#3c3c3c] bg-[#252526]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => dispatch(setActiveBottomTab(tab.id))}
            className={`flex items-center gap-1 border-r border-[#3c3c3c] px-4 py-1.5 text-[11px] ${
              activeTab === tab.id
                ? 'bg-[#1e1e1e] text-[#cccccc] border-t-2 border-t-[#0078d4]'
                : 'bg-[#2d2d2d] text-[#858585] hover:bg-[#2a2d2e]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
        <div className="flex-1" />
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'terminal' && <Terminal />}
        {activeTab === 'console' && <Console />}
        {activeTab === 'ai-chat' && <AIChat projectId={projectId} />}
        {activeTab === 'diff' && <DiffViewer />}
      </div>
    </div>
  );
}
