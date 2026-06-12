import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/index';
import { setupPassphrase, unlock, clearError, enterDemoMode } from '../store/authSlice';
import { db, generateId, nowISO } from '../services/db';

const DEMO_PROJECT = {
  id: 'demo',
  name: 'Demo Platformer',
  description: 'A sample platformer game to explore the workspace',
  gameType: 'platformer',
  tags: ['demo'],
  isPublic: false,
  createdAt: nowISO(),
  updatedAt: nowISO(),
};

const DEMO_FILES = [
  { path: 'index.html', content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo Platformer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif; overflow: hidden; }
    #game {
      width: 800px; height: 600px;
      background: linear-gradient(180deg, #0f0f2a 0%, #1a1a3e 50%, #2a1a2e 100%);
      border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
      position: relative; overflow: hidden;
    }
    .platform { position: absolute; bottom: 0; height: 24px; width: 100%; background: linear-gradient(90deg, #6c5ce7, #7c6df7); border-radius: 4px 4px 0 0; }
    .platform-1 { bottom: 120px; left: 80px; width: 160px; }
    .platform-2 { bottom: 240px; left: 300px; width: 200px; }
    .platform-3 { bottom: 360px; left: 500px; width: 140px; }
    .player {
      position: absolute; bottom: 24px; left: 60px; width: 32px; height: 40px;
      background: #00b4d8; border-radius: 6px 6px 2px 2px; transition: bottom 0.3s, left 0.3s;
      z-index: 10;
    }
    .player::after {
      content: ''; position: absolute; top: -8px; left: 4px; width: 24px; height: 8px;
      background: #00b4d8; border-radius: 12px 12px 0 0;
    }
    .coin {
      position: absolute; width: 18px; height: 18px; border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #ffd700, #ffa500);
      z-index: 5; box-shadow: 0 0 8px rgba(255,215,0,0.5);
      animation: float 1.5s ease-in-out infinite;
    }
    .coin-1 { bottom: 160px; left: 140px; animation-delay: 0s; }
    .coin-2 { bottom: 280px; left: 360px; animation-delay: 0.5s; }
    .coin-3 { bottom: 400px; left: 540px; animation-delay: 1s; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    .info { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.3); font-size: 13px; letter-spacing: 0.05em; }
  </style>
</head>
<body>
  <div id="game">
    <div class="info">ARROW KEYS &mdash; MOVE &middot; SPACE &mdash; JUMP</div>
    <div class="platform"></div>
    <div class="platform platform-1"></div>
    <div class="platform platform-2"></div>
    <div class="platform platform-3"></div>
    <div class="player" id="player"></div>
    <div class="coin coin-1"></div>
    <div class="coin coin-2"></div>
    <div class="coin coin-3"></div>
  </div>
  <script>
    const player = document.getElementById('player');
    let x = 60, y = 24;
    let vx = 0, vy = 0;
    let grounded = true;
    const GRAVITY = -0.6;
    const SPEED = 4;
    const JUMP = 10;

    const platforms = [
      { x: 0, y: 0, w: 800, h: 24 },
      { x: 80, y: 120, w: 160, h: 16 },
      { x: 300, y: 240, w: 200, h: 16 },
      { x: 500, y: 360, w: 140, h: 16 },
    ];

    function rectsOverlap(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x &&
             a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function update() {
      if (keys['ArrowLeft']) vx = -SPEED;
      else if (keys['ArrowRight']) vx = SPEED;
      else vx *= 0.8;

      if (keys[' '] && grounded) { vy = JUMP; grounded = false; }

      vy += GRAVITY;
      x += vx;
      y -= vy;

      grounded = false;
      const pw = 32, ph = 40;
      for (const p of platforms) {
        if (rectsOverlap({x, y, w: pw, h: ph}, p)) {
          if (vy < 0 && y + ph > p.y && y < p.y) {
            y = p.y - ph; vy = 0; grounded = true;
          }
        }
      }

      if (x < 0) x = 0;
      if (x > 800 - pw) x = 800 - pw;
      if (y > 600) { x = 60; y = 24; vy = 0; }

      player.style.bottom = y + 'px';
      player.style.left = x + 'px';
      requestAnimationFrame(update);
    }

    const keys = {};
    window.addEventListener('keydown', e => { keys[e.key] = true; if (e.key === ' ') e.preventDefault(); });
    window.addEventListener('keyup', e => keys[e.key] = false);
    update();
  </script>
</body>
</html>`, fileType: 'code' },
  { path: 'game.js', content: `// Game logic file (placeholder)
// The actual game runs from index.html
// Edit index.html to modify the demo game

console.log('Foundry Demo Platformer loaded');
`, fileType: 'code' },
  { path: 'style.css', content: `/* Styles — see inline in index.html for this demo */
`, fileType: 'code' },
];

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
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase !== confirm) { dispatch({ type: 'auth/setError', payload: 'Passphrases do not match' } as any); return; }
    dispatch(setupPassphrase({ passphrase })).unwrap().then(() => navigate('/projects')).catch(() => {});
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    const existing = await db.settings.get('main');
    if (!existing) {
      await db.settings.put({ id: 'main', passphraseHash: '', salt: '', encryptionIv: '', encryptedData: '' });
    }
    const hasDemo = await db.projects.get('demo');
    if (!hasDemo) {
      await db.projects.add(DEMO_PROJECT);
      for (const f of DEMO_FILES) {
        await db.files.add({ id: generateId(), projectId: 'demo', path: f.path, content: f.content, fileType: f.fileType, isGenerated: false, createdAt: nowISO(), updatedAt: nowISO() });
      }
    }
    dispatch(enterDemoMode());
    navigate('/projects');
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--border-primary)' }} /></div>
        <div className="relative flex justify-center text-xs" style={{ color: 'var(--text-muted)' }}><span className="px-3" style={{ background: 'var(--bg-primary)' }}>or</span></div>
      </div>

      <button disabled={demoLoading} className="btn-ghost w-full flex items-center justify-center gap-2" onClick={handleDemo} style={{ border: '1px solid var(--border-primary)' }}>
        {demoLoading ? 'Setting up demo...' : 'Try Demo — no passphrase needed'}
      </button>

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
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(unlock({ passphrase })).unwrap().then(() => navigate('/projects')).catch(() => {});
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    const hasDemo = await db.projects.get('demo');
    if (!hasDemo) {
      await db.projects.add(DEMO_PROJECT);
      for (const f of DEMO_FILES) {
        await db.files.add({ id: generateId(), projectId: 'demo', path: f.path, content: f.content, fileType: f.fileType, isGenerated: false, createdAt: nowISO(), updatedAt: nowISO() });
      }
    }
    dispatch(enterDemoMode());
    navigate('/projects');
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--border-primary)' }} /></div>
        <div className="relative flex justify-center text-xs" style={{ color: 'var(--text-muted)' }}><span className="px-3" style={{ background: 'var(--bg-primary)' }}>or</span></div>
      </div>

      <button disabled={demoLoading} className="btn-ghost w-full flex items-center justify-center gap-2" onClick={handleDemo} style={{ border: '1px solid var(--border-primary)' }}>
        {demoLoading ? 'Setting up demo...' : 'Try Demo — no passphrase needed'}
      </button>

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
