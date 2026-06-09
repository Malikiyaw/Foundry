import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleSidebar, toggleBottomPanel, toggleRightPanel } from '../store/uiSlice';
import { toggleZenMode } from '../store/editorSlice';

interface Props { projectId: string }

const MENUS = [
  {
    label: 'File', icon: '📁',
    items: [
      { label: 'New Project', shortcut: 'Ctrl+N', action: (n: any) => n('/projects') },
      { label: 'Open Project', shortcut: 'Ctrl+O', action: (n: any) => n('/projects') },
      { label: 'Save All', shortcut: 'Ctrl+S', action: () => {} },
      { label: 'Export as ZIP', shortcut: '', action: (n: any, pid: string) => window.open(`/api/projects/${pid}/export`) },
      { label: 'Publish to itch.io', shortcut: '', action: () => {} },
      { label: 'Deploy to Foundry', shortcut: '', action: () => {} },
    ],
  },
  {
    label: 'Edit', icon: '✏️',
    items: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: () => {} },
      { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => {} },
      { label: 'Find', shortcut: 'Ctrl+F', action: () => {} },
      { label: 'Replace', shortcut: 'Ctrl+H', action: () => {} },
    ],
  },
  {
    label: 'View', icon: '👁',
    items: [
      { label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: (d: any) => d(toggleSidebar()) },
      { label: 'Toggle Panel', shortcut: 'Ctrl+J', action: (d: any) => d(toggleBottomPanel()) },
      { label: 'Toggle Preview', shortcut: 'Ctrl+Shift+B', action: (d: any) => d(toggleRightPanel()) },
      { label: 'Zen Mode', shortcut: 'Ctrl+K Z', action: (d: any) => d(toggleZenMode()) },
    ],
  },
  {
    label: 'Run', icon: '▶',
    items: [
      { label: 'Generate Game', shortcut: 'Ctrl+Enter', action: () => {} },
      { label: 'Regenerate File', shortcut: '', action: () => {} },
      { label: 'Run Playtest', shortcut: '', action: () => {} },
    ],
  },
  {
    label: 'Deploy', icon: '🚀',
    items: [
      { label: 'Deploy Subdomain', shortcut: '', action: () => {} },
      { label: 'Custom Domain', shortcut: '', action: () => {} },
    ],
  },
  {
    label: 'Help', icon: '❓',
    items: [
      { label: 'API Key Management', shortcut: '', action: (n: any) => n('/keys') },
      { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+K Ctrl+S', action: () => {} },
      { label: 'About Foundry', shortcut: '', action: () => {} },
    ],
  },
];

export default function MenuBar({ projectId }: Props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAction = (action: Function) => {
    action(dispatch, navigate, projectId);
    setOpenMenu(null);
  };

  return (
    <div ref={ref} className="flex h-[30px] items-center border-b border-[#3c3c3c] bg-[#323233] px-1 select-none shrink-0">
      <div className="flex items-center gap-1.5 mr-3 px-2">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-[#0078d4] to-[#1e8ae6]">
          <span className="text-[10px] font-bold text-white">F</span>
        </div>
      </div>
      {MENUS.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            className={`flex items-center gap-1 px-2.5 py-0.5 text-xs rounded transition-colors ${
              openMenu === menu.label
                ? 'bg-[#094771] text-white'
                : 'text-[#cccccc] hover:bg-[#3c3c3c]'
            }`}
            onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
          >
            <span className="text-[10px]">{menu.icon}</span>
            <span>{menu.label}</span>
          </button>
          {openMenu === menu.label && (
            <div className="absolute left-0 top-full z-50 min-w-[220px] rounded border border-[#3c3c3c] bg-[#252526] py-1 shadow-2xl animate-scaleIn origin-top-left">
              {menu.items.map((item, i) => (
                <button
                  key={i}
                  className="flex w-full items-center justify-between px-4 py-1.5 text-xs text-[#cccccc] hover:bg-[#094771] transition-colors"
                  onClick={() => handleAction(item.action)}
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="ml-8 text-[10px] text-[#858585]">{item.shortcut}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="flex-1" />
      <span className="text-[10px] text-[#858585] px-2">Foundry v1.0</span>
    </div>
  );
}
