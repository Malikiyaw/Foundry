import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleSidebar, toggleBottomPanel, toggleRightPanel } from '../store/uiSlice';
import { toggleZenMode } from '../store/editorSlice';

interface Props { projectId: string }

type Menu = { label: string; items: { label: string; shortcut?: string; action: () => void; divider?: boolean }[] }[];

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

  const menus: Menu = [
    {
      label: 'File',
      items: [
        { label: 'New Project', action: () => navigate('/projects') },
        { label: 'Open Project', action: () => navigate('/projects') },
        { label: 'Save All', shortcut: 'Ctrl+S', action: () => {} },
        { label: 'Export as ZIP', action: () => window.open(`/api/projects/${projectId}/export`) },
        { label: 'Publish to itch.io', action: () => {} },
        { label: 'Deploy to Foundry', action: () => {} },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => {} },
        { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => {} },
        { label: 'Find', shortcut: 'Ctrl+F', action: () => {} },
        { label: 'Replace', shortcut: 'Ctrl+H', action: () => {} },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: () => dispatch(toggleSidebar()) },
        { label: 'Toggle Bottom Panel', shortcut: 'Ctrl+J', action: () => dispatch(toggleBottomPanel()) },
        { label: 'Toggle Right Panel', shortcut: 'Ctrl+Shift+B', action: () => dispatch(toggleRightPanel()) },
        { label: 'Zen Mode', shortcut: 'Ctrl+K Z', action: () => dispatch(toggleZenMode()) },
      ],
    },
    {
      label: 'Run',
      items: [
        { label: 'Generate Game', shortcut: 'Ctrl+Enter', action: () => {} },
        { label: 'Regenerate Selected File', action: () => {} },
        { label: 'Run Playtest', action: () => {} },
      ],
    },
    {
      label: 'Deploy',
      items: [
        { label: 'Deploy to Subdomain', action: () => {} },
        { label: 'Custom Domain', action: () => {} },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'API Key Management', action: () => navigate('/keys') },
        { label: 'Documentation', action: () => window.open('https://foundry.gg/docs', '_blank') },
        { label: 'Keyboard Shortcuts', action: () => {} },
      ],
    },
  ];

  return (
    <div ref={ref} className="flex h-8 items-center border-b border-[#3c3c3c] bg-[#323233] px-1 select-none">
      <span className="mr-3 px-2 text-sm font-semibold text-[#0078d4]">Foundry</span>
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            className={`px-2 py-0.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c] rounded ${openMenu === menu.label ? 'bg-[#3c3c3c]' : ''}`}
            onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
          >
            {menu.label}
          </button>
          {openMenu === menu.label && (
            <div className="absolute left-0 top-full z-50 min-w-[200px] rounded border border-[#3c3c3c] bg-[#252526] py-1 shadow-xl">
              {menu.items.map((item, i) => (
                <React.Fragment key={i}>
                  {item.divider && <div className="my-1 border-t border-[#3c3c3c]" />}
                  <button
                    className="flex w-full items-center justify-between px-4 py-1.5 text-xs text-[#cccccc] hover:bg-[#094771]"
                    onClick={() => { item.action(); setOpenMenu(null); }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <span className="ml-8 text-[#858585]">{item.shortcut}</span>}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
