import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/index';
import { setupPassphrase, unlock, clearError } from '../store/authSlice';

function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="relative hidden w-[55%] lg:flex items-center justify-center overflow-hidden bg-mesh" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0f0f2a 50%, #0a0a1a 100%)' }}>
        <div className="relative z-10 max-w-lg px-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--gradient-1)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Foundry</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white">
            {title}
          </h1>
          <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
          <div className="space-y-3">
            {[
              { icon: '🔐', text: 'Everything stored locally in your browser' },
              { icon: '⚡', text: 'No server needed — works completely offline' },
              { icon: '🔑', text: 'Your passphrase encrypts all API keys' },
              { icon: '📦', text: 'Export/import your data anytime' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="text-base">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a1a] to-transparent" />
      </div>
      <div className="flex w-full lg:w-[45%] items-center justify-center p-8">
        <div className="w-full max-w-[400px] animate-fadeIn">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--gradient-1)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Foundry</span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function SetupPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s: RootState) => s.auth);
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase !== confirm) { dispatch({ type: 'auth/setError', payload: 'Passphrases do not match' } as any); return; }
    dispatch(setupPassphrase({ passphrase })).unwrap().then(() => navigate('/projects')).catch(() => {});
  };

  return (
    <AuthLayout title="Secure your workspace" subtitle="Set a passphrase to encrypt your API keys. This is stored locally — no server, no cloud.">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Create your passphrase</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>This unlocks your workspace every time you visit</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Passphrase</label>
          <div className="relative">
            <input className="input-field pr-10" type={showPassphrase ? 'text' : 'password'} placeholder="At least 4 characters" minLength={4} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} required autoComplete="new-password" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} onClick={() => setShowPassphrase(!showPassphrase)}>
              {showPassphrase ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Confirm Passphrase</label>
          <input className="input-field" type={showPassphrase ? 'text' : 'password'} placeholder="Re-enter passphrase" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg p-3 text-sm animate-slideUp" style={{ background: 'var(--danger-subtle)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? 'Setting up...' : 'Secure Workspace'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        🔒 Your passphrase never leaves this browser. If you lose it, your encrypted keys are unrecoverable.
      </p>
    </AuthLayout>
  );
}

export function UnlockPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s: RootState) => s.auth);
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(unlock({ passphrase })).unwrap().then(() => navigate('/projects')).catch(() => {});
  };

  const handleReset = () => {
    if (!confirm('Reset workspace? This will delete all local projects and keys.')) return;
    indexedDB.deleteDatabase('FoundryDB');
    window.location.reload();
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Unlock your workspace to access your projects and keys.">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Unlock workspace</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enter your passphrase to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Passphrase</label>
          <div className="relative">
            <input className="input-field pr-10" type={showPassphrase ? 'text' : 'password'} placeholder="Enter your passphrase" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} required autoFocus />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} onClick={() => setShowPassphrase(!showPassphrase)}>
              {showPassphrase ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg p-3 text-sm animate-slideUp" style={{ background: 'var(--danger-subtle)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? 'Unlocking...' : 'Unlock'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
          Lost your passphrase?{' '}
          <button onClick={handleReset} className="hover:underline" style={{ color: 'var(--danger)' }}>
            Reset workspace
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
