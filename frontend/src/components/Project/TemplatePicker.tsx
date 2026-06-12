import React from 'react';

const TEMPLATES = [
  { id: 'platformer', label: 'Platformer', desc: 'Side-scrolling jump and run' },
  { id: 'rpg', label: 'Top-Down RPG', desc: 'Character movement, NPCs, inventory' },
  { id: 'runner', label: 'Endless Runner', desc: 'Auto-scrolling obstacle game' },
  { id: 'match3', label: 'Match-3 Puzzle', desc: 'Grid swapping puzzle game' },
  { id: 'visualnovel', label: 'Visual Novel', desc: 'Dialogue choices and branching' },
  { id: 'card', label: 'Card Battler', desc: 'Deck-building turn-based game' },
  { id: 'blank', label: 'Blank', desc: 'Start from scratch' },
];

interface Props {
  onSelect: (template: string) => void;
  onClose: () => void;
}

export default function TemplatePicker({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-2xl rounded-lg border p-6" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Choose a Template</h2>
          <button onClick={onClose} className="icon-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="rounded p-4 text-left transition-colors"
              style={{
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            >
              <div className="font-medium text-sm">{t.label}</div>
              <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
