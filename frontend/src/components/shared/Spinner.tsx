import React from 'react';

interface Props { size?: 'sm' | 'md' | 'lg'; text?: string; className?: string }

export function Spinner({ size = 'md', text, className = '' }: Props) {
  const dims = { sm: 'h-3 w-3', md: 'h-5 w-5', lg: 'h-8 w-8' };
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div className={`${dims[size]} animate-spin rounded-full border-2 border-blue-400 border-t-transparent`} />
      {text && <span className="text-[11px] text-[#858585]">{text}</span>}
    </div>
  );
}

interface EmptyStateProps { icon?: string; title: string; description?: string; action?: { label: string; onClick: () => void } }

export function EmptyState({ icon = '📂', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-sm text-[#cccccc] font-medium mb-1">{title}</h3>
      {description && <p className="text-[11px] text-[#858585] max-w-[250px]">{description}</p>}
      {action && (
        <button className="mt-3 rounded bg-[#0078d4] px-3 py-1 text-xs text-white hover:bg-[#1e8ae6] transition-colors" onClick={action}>
          {action.label}
        </button>
      )}
    </div>
  );
}
