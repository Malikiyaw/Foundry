import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleSidebar, toggleBottomPanel, toggleRightPanel } from '../store/uiSlice';
import { toggleZenMode } from '../store/editorSlice';

interface Props { projectId: string }

const MENUS = [
  {
    label: 'File',
    items: [
      { label: 'New Project', shortcut: 'Ctrl+N', action: (n: any) => n('/projects') },
      { label: 'Save All', shortcut: 'Ctrl+S', action: () => {} },
      { label: 'Export ZIP', shortcut: '', action: async (n: any, pid: string) => { const { exportProjectAsZip } = await import('../services/previewService'); await exportProjectAsZip(pid); } },
      { label: 'Deploy to itch.io', shortcut: '', action: () => {} },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: () => {} },
      { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => {} },
      { label: 'Find', shortcut: 'Ctrl+F', action: () => {} },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: (d: any) => d(toggleSidebar()) },
      { label: 'Toggle Panel', shortcut: 'Ctrl+J', action: (d: any) => d(toggleBottomPanel()) },
      { label: 'Toggle Preview', shortcut: 'Ctrl+Shift+B', action: (d: any) => d(toggleRightPanel()) },
      { label: 'Zen Mode', shortcut: 'Ctrl+K Z', action: (d: any) => d(toggleZenMode()) },
    ],
  },
  {
    label: 'Run',
    items: [
      { label: 'Generate Game', shortcut: 'Ctrl+Enter', action: () => {} },
      { label: 'Run Playtest', shortcut: '', action: () => {} },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'API Keys', shortcut: '', action: (n: any) => n('/keys') },
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

  return (
    <div ref={ref} className="flex h-[32px] items-center border-b shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
      <div className="flex items-center gap-2 px-3 mr-1">
        <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: 'var(--accent)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
      </div>

      {MENUS.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            className="px-3 py-1 text-xs rounded-md transition-all"
            style={{
              background: openMenu === menu.label ? 'var(--accent-subtle)' : 'transparent',
              color: openMenu === menu.label ? 'var(--accent)' : 'var(--text-secondary)',
            }}
            onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
            onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
          >
            {menu.label}
          </button>
          {openMenu === menu.label && (
            <div className="absolute left-0 top-full z-50 min-w-[220px] py-1.5 animate-scaleIn rounded-lg" style={{ border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
              {menu.items.map((item, i) => (
                <button
                  key={i}
                  className="flex w-full items-center justify-between px-4 py-2 text-xs transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => { item.action(dispatch, navigate, projectId); setOpenMenu(null); }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="ml-6 text-[10px] px-1.5 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)' }}>
                      {item.shortcut}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="flex-1" />
      <span className="text-[10px] px-3" style={{ color: 'var(--text-muted)' }}>Foundry v1.0</span>
    </div>
  );
}
