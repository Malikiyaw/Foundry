import React from 'react';

const TEMPLATES = [
  { id: 'platformer', label: 'Platformer', desc: 'Side-scrolling jump & run' },
  { id: 'rpg', label: 'Top-Down RPG', desc: 'Character movement, NPCs, inventory' },
  { id: 'runner', label: 'Endless Runner', desc: 'Auto-scrolling obstacle game' },
  { id: 'match3', label: 'Match-3 Puzzle', desc: 'Grid swapping puzzle game' },
  { id: 'visualnovel', label: 'Visual Novel', desc: 'Dialogue choices & branching' },
  { id: 'card', label: 'Card Battler', desc: 'Deck-building turn-based game' },
  { id: 'blank', label: 'Blank', desc: 'Start from scratch' },
];

interface Props {
  onSelect: (template: string) => void;
  onClose: () => void;
}

export default function TemplatePicker({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl rounded-lg border border-[#3c3c3c] bg-[#252526] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#cccccc]">Choose a Template</h2>
          <button onClick={onClose} className="text-[#858585] hover:text-[#cccccc]">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="rounded-lg border border-[#3c3c3c] bg-[#2d2d2d] p-4 text-left hover:border-[#0078d4] hover:bg-[#333] transition-colors"
            >
              <div className="font-medium text-[#cccccc]">{t.label}</div>
              <div className="mt-1 text-xs text-[#858585]">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
