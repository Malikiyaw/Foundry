import React from 'react';

interface Props { size?: 'sm' | 'md' | 'lg'; text?: string; className?: string }

export function Spinner({ size = 'md', text, className = '' }: Props) {
  const dims = { sm: 'h-3 w-3', md: 'h-5 w-5', lg: 'h-8 w-8' };
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div className={`${dims[size]} animate-spin rounded-full border-2 border-t-transparent`} style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      {text && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{text}</span>}
    </div>
  );
}

interface EmptyStateProps { icon?: React.ReactNode; title: string; description?: string; action?: { label: string; onClick: () => void } }

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6">
      {icon && <div className="mb-3" style={{ color: 'var(--text-muted)' }}>{icon}</div>}
      <h3 className="text-sm font-medium mb-1 text-white">{title}</h3>
      {description && <p className="text-[11px] max-w-[250px]" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      {action && (
        <button className="mt-3 rounded px-3 py-1 text-xs text-white" style={{ background: 'var(--accent)' }} onClick={action}>
          {action.label}
        </button>
      )}
    </div>
  );
}
