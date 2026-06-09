import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store/index';
import { fetchKeys, addKey, testKey, deleteKey } from '../../store/keysSlice';

const PROVIDERS = ['openai', 'anthropic', 'google', 'replicate', 'stability', 'elevenlabs', 'openrouter', 'custom'];

export default function KeyManager() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state: RootState) => state.keys);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label: '', provider: 'openai', key: '', monthlyBudgetUsd: '' });
  const [testResults, setTestResults] = useState<Record<string, { valid: boolean; info: string }>>({});

  useEffect(() => { dispatch(fetchKeys()); }, [dispatch]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(addKey({
      label: form.label,
      provider: form.provider,
      key: form.key,
      monthlyBudgetUsd: form.monthlyBudgetUsd ? parseFloat(form.monthlyBudgetUsd) : undefined,
    }));
    if (addKey.fulfilled.match(result)) {
      setShowAdd(false);
      setForm({ label: '', provider: 'openai', key: '', monthlyBudgetUsd: '' });
    }
  };

  const handleTest = async (id: string) => {
    const result = await dispatch(testKey(id));
    if (testKey.fulfilled.match(result)) {
      setTestResults((prev) => ({ ...prev, [id]: { valid: result.payload.valid, info: result.payload.balanceInfo } }));
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#1e1e1e]">
      <header className="flex items-center justify-between border-b border-[#3c3c3c] px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-[#0078d4] cursor-pointer" onClick={() => navigate('/projects')}>Foundry</span>
          <span className="text-sm text-[#858585]">/ Key Vault</span>
        </div>
        <button onClick={() => navigate('/projects')} className="rounded px-3 py-1 text-sm text-[#0078d4] hover:bg-[#2a2d2e]">Back to Projects</button>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#cccccc]">API Key Vault</h1>
            <p className="mt-1 text-sm text-[#858585]">Your keys are encrypted at rest (AES-256-GCM). Never shared.</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded bg-[#0078d4] px-4 py-2 text-sm text-white hover:bg-[#1e8ae6]"
          >
            + Add Key
          </button>
        </div>

        {loading ? (
          <div className="text-center text-[#858585]">Loading keys...</div>
        ) : items.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-[#858585] mb-2">No API keys added yet.</p>
            <p className="text-sm text-[#858585] mb-4">Add your OpenAI, Anthropic, or other provider keys to start generating.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((key) => (
              <div key={key.id} className="flex items-center gap-4 rounded-lg border border-[#3c3c3c] bg-[#252526] p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#cccccc]">{key.label}</span>
                    <span className="rounded bg-[#2d2d2d] px-2 py-0.5 text-xs text-[#858585]">{key.provider}</span>
                    {!key.isActive && <span className="text-xs text-red-400">Inactive</span>}
                  </div>
                  <div className="mt-1 flex gap-4 text-xs text-[#858585]">
                    <span>Budget: {key.monthlyBudgetUsd ? `$${key.monthlyBudgetUsd}` : 'No limit'}</span>
                    <span>Used: ${Number(key.usedThisMonth).toFixed(2)}</span>
                    {key.lastUsed && <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>}
                  </div>
                  {testResults[key.id] && (
                    <div className={`mt-1 text-xs ${testResults[key.id].valid ? 'text-green-400' : 'text-red-400'}`}>
                      {testResults[key.id].valid ? '✓ Valid' : `✕ ${testResults[key.id].info}`}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTest(key.id)}
                    className="rounded px-3 py-1 text-xs text-[#0078d4] hover:bg-[#2a2d2e]"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => dispatch(deleteKey(key.id))}
                    className="rounded px-3 py-1 text-xs text-red-400 hover:bg-[#2a2d2e]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg border border-[#3c3c3c] bg-[#252526] p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#cccccc]">Add API Key</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-[#858585]">Label</label>
                <input
                  type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-sm text-[#cccccc] placeholder-[#858585] focus:border-[#0078d4] focus:outline-none"
                  placeholder="My OpenAI Key" required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#858585]">Provider</label>
                <select
                  value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-sm text-[#cccccc] focus:border-[#0078d4] focus:outline-none"
                >
                  {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#858585]">API Key</label>
                <input
                  type="password" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })}
                  className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-sm text-[#cccccc] placeholder-[#858585] focus:border-[#0078d4] focus:outline-none"
                  placeholder="sk-..." required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#858585]">Monthly Budget (USD, optional)</label>
                <input
                  type="number" value={form.monthlyBudgetUsd} onChange={(e) => setForm({ ...form, monthlyBudgetUsd: e.target.value })}
                  className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-sm text-[#cccccc] placeholder-[#858585] focus:border-[#0078d4] focus:outline-none"
                  placeholder="10.00" step="0.01" min="0"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAdd(false)} className="rounded px-3 py-1 text-sm text-[#858585] hover:bg-[#3c3c3c]">Cancel</button>
                <button type="submit" className="rounded bg-[#0078d4] px-4 py-2 text-sm text-white hover:bg-[#1e8ae6]">Add Key</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
