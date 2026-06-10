import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/index';
import { addKey, removeKey, fetchKeys, toggleKey } from '../store/keysSlice';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', color: '#00A67E', icon: '🟢' },
  { value: 'anthropic', label: 'Anthropic', color: '#D4A574', icon: '🟤' },
  { value: 'google', label: 'Google AI', color: '#4285F4', icon: '🔵' },
  { value: 'replicate', label: 'Replicate', color: '#1B1918', icon: '⬛' },
  { value: 'stability', label: 'Stability AI', color: '#8B5CF6', icon: '🟣' },
  { value: 'elevenlabs', label: 'ElevenLabs', color: '#FF6B35', icon: '🟠' },
  { value: 'openrouter', label: 'OpenRouter', color: '#FF6B35', icon: '🔀' },
];

export default function KeyManager() {
  const dispatch = useDispatch<AppDispatch>();
  const keys = useSelector((state: RootState) => state.keys.items);
  const [modalOpen, setModalOpen] = useState(false);
  const [newProvider, setNewProvider] = useState(PROVIDERS[0].value);
  const [newKey, setNewKey] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => { dispatch(fetchKeys()); }, [dispatch]);

  const handleSave = () => {
    if (!newKey.trim()) return;
    dispatch(addKey({ provider: newProvider, apiKey: newKey, budgetLimit: budget ? Number(budget) : null }));
    setModalOpen(false); setNewKey(''); setBudget('');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Keys are encrypted with your passphrase using AES-256-GCM and stored locally.
            AI calls go directly from your browser to the provider — no server involved.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold text-white">{keys.length}</span> key{keys.length !== 1 ? 's' : ''}
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Key
          </button>
        </div>

        <div className="space-y-3">
          {keys.map((key) => {
            const provider = PROVIDERS.find((p) => p.value === key.provider);
            return (
              <div key={key.id} className="card flex items-center justify-between hover-lift">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style={{ background: `${provider?.color || '#555'}20` }}>
                    {provider?.icon || '🔑'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white capitalize">{key.provider}</span>
                      <span className="badge" style={{ background: key.isActive ? 'var(--success-subtle)' : 'var(--danger-subtle)', color: key.isActive ? 'var(--success)' : 'var(--danger)' }}>
                        {key.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      <span className="font-mono">••••{key.keyHint}</span>
                      <span>{key.usageCount} uses</span>
                      {key.budgetLimit && <span>${key.budgetLimit}/mo</span>}
                    </div>
                    {key.budgetLimit && (
                      <div className="mt-2 h-1 w-32 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (key.usageCount / key.budgetLimit) * 100)}%`, background: 'var(--gradient-1)' }} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-ghost !py-1.5 !px-3 !text-[11px]" onClick={() => dispatch(toggleKey({ id: key.id, isActive: !key.isActive }))}>
                    {key.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button className="icon-btn !text-[var(--danger)]" onClick={() => { if (confirm('Remove this key?')) dispatch(removeKey(key.id)); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              </div>
            );
          })}

          {keys.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl py-20" style={{ border: '1px dashed var(--border-primary)' }}>
              <div className="mb-4 text-5xl">🔑</div>
              <h3 className="text-lg font-semibold text-white mb-1">No API keys</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Add a key to start generating games</p>
              <button className="btn-primary" onClick={() => setModalOpen(true)}>Add Your First Key</button>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md animate-scaleIn rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Add API Key</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Provider</label>
                <div className="grid grid-cols-4 gap-2">
                  {PROVIDERS.map((p) => (
                    <button key={p.value} type="button" className="flex flex-col items-center gap-1 rounded-lg p-2 text-[10px] transition-all" style={{ background: newProvider === p.value ? `${p.color}20` : 'var(--bg-tertiary)', border: newProvider === p.value ? `1px solid ${p.color}` : '1px solid transparent', color: newProvider === p.value ? 'var(--text-primary)' : 'var(--text-muted)' }} onClick={() => setNewProvider(p.value)}>
                      <span className="text-lg">{p.icon}</span>
                      <span className="truncate w-full text-center">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>API Key</label>
                <input className="input-field font-mono text-[11px]" type="password" placeholder="sk-..." value={newKey} onChange={(e) => setNewKey(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Monthly Budget (optional)</label>
                <input className="input-field" type="number" placeholder="50" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSave}>Save Key</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
