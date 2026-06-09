import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/index';
import { addKey, removeKey, setKeys, updateKey } from '../store/keysSlice';
import { Spinner } from './shared/Spinner';

interface ApiKey {
  id: string; provider: string; keyHint: string; isActive: boolean;
  usageCount: number; budgetLimit: number | null; createdAt: string;
}

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', color: '#00A67E', docs: 'https://platform.openai.com/api-keys' },
  { value: 'anthropic', label: 'Anthropic', color: '#D4A574', docs: 'https://console.anthropic.com/' },
  { value: 'google', label: 'Google AI', color: '#4285F4', docs: 'https://makersuite.google.com/app/apikey' },
  { value: 'replicate', label: 'Replicate', color: '#1B1918', docs: 'https://replicate.com/account/api-tokens' },
  { value: 'stability', label: 'Stability AI', color: '#8B5CF6', docs: 'https://platform.stability.ai/account/keys' },
  { value: 'elevenlabs', label: 'ElevenLabs', color: '#000000', docs: 'https://elevenlabs.io/speech-synthesis' },
  { value: 'openrouter', label: 'OpenRouter', color: '#FF6B35', docs: 'https://openrouter.ai/keys' },
];

export default function KeyManager() {
  const dispatch = useDispatch<AppDispatch>();
  const keys = useSelector((state: RootState) => state.keys.items);
  const [modalOpen, setModalOpen] = useState(false);
  const [newProvider, setNewProvider] = useState(PROVIDERS[0].value);
  const [newKey, setNewKey] = useState('');
  const [budget, setBudget] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const token = localStorage.getItem('foundry_token');

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/keys', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) dispatch(setKeys(await res.json()));
    } catch {}
  }, [dispatch, token]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleSave = async () => {
    if (!newKey.trim()) return;
    try {
      const res = await fetch('/api/keys', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ provider: newProvider, apiKey: newKey, budgetLimit: budget ? Number(budget) : null }),
      });
      if (res.ok) {
        const created = await res.json();
        dispatch(addKey(created));
        setModalOpen(false); setNewKey(''); setBudget('');
      }
    } catch {}
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) dispatch(updateKey({ id, isActive }));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) dispatch(removeKey(id));
    } catch {}
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">API Key Management</h1>
        <p className="text-sm text-[#858585]">
          Your API keys are encrypted at rest using AES-256-GCM. We never send your keys to any third party.
          All AI requests are proxied through your own keys — you control costs and data.
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-[#cccccc]">
          <span className="font-medium">{keys.length}</span> key{keys.length !== 1 ? 's' : ''} configured
        </div>
        <button
          className="flex items-center gap-1.5 rounded bg-[#0078d4] px-4 py-1.5 text-sm text-white hover:bg-[#1e8ae6] transition-colors"
          onClick={() => setModalOpen(true)}
        >
          <span>+</span> Add Key
        </button>
      </div>

      <div className="space-y-2">
        {keys.map((key) => (
          <div key={key.id} className="flex items-center justify-between rounded border border-[#3c3c3c] bg-[#252526] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: PROVIDERS.find((p) => p.value === key.provider)?.color || '#555' }}>
                {key.provider.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium capitalize">{key.provider}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${key.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {key.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#858585] mt-0.5">
                  <span>••••{key.keyHint.slice(-4)}</span>
                  <span>{key.usageCount} uses</span>
                  {key.budgetLimit && <span>${key.budgetLimit} limit</span>}
                  <span>Added {new Date(key.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`px-2 py-1 text-[10px] rounded transition-colors ${
                  key.isActive ? 'text-yellow-400 hover:bg-yellow-500/20' : 'text-green-400 hover:bg-green-500/20'
                }`}
                onClick={() => handleToggle(key.id, !key.isActive)}
              >
                {key.isActive ? 'Disable' : 'Enable'}
              </button>
              <button
                className="px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/20 rounded transition-colors"
                onClick={() => handleDelete(key.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {keys.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded border border-dashed border-[#3c3c3c] bg-[#252526] py-12">
            <div className="text-3xl mb-3">🔑</div>
            <p className="text-sm text-[#858585] mb-1">No API keys configured</p>
            <p className="text-xs text-[#858585] mb-4">Add at least one key to start generating games</p>
            <button
              className="rounded bg-[#0078d4] px-4 py-1.5 text-sm text-white hover:bg-[#1e8ae6] transition-colors"
              onClick={() => setModalOpen(true)}
            >
              Add Your First Key
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md rounded-lg border border-[#3c3c3c] bg-[#252526] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Add API Key</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#858585] mb-1">Provider</label>
                <select
                  className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-1.5 text-sm text-white outline-none focus:border-[#0078d4]"
                  value={newProvider} onChange={(e) => setNewProvider(e.target.value)}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#858585] mb-1">API Key</label>
                <input
                  className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-1.5 text-sm text-white outline-none focus:border-[#0078d4] placeholder-[#858585]"
                  type="password"
                  placeholder="sk-..."
                  value={newKey} onChange={(e) => setNewKey(e.target.value)}
                />
                <a href={PROVIDERS.find((p) => p.value === newProvider)?.docs} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline mt-1 inline-block">
                  Get your {PROVIDERS.find((p) => p.value === newProvider)?.label} API key →
                </a>
              </div>

              <div>
                <label className="block text-xs text-[#858585] mb-1">Monthly Budget (optional)</label>
                <input
                  className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-1.5 text-sm text-white outline-none focus:border-[#0078d4] placeholder-[#858585]"
                  type="number" placeholder="50"
                  value={budget} onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button className="rounded px-4 py-1.5 text-sm text-[#cccccc] hover:bg-[#3c3c3c] transition-colors" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="rounded bg-[#0078d4] px-4 py-1.5 text-sm text-white hover:bg-[#1e8ae6] transition-colors" onClick={handleSave}>
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
