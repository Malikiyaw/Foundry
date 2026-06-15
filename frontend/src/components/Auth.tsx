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
    body { background: #0c0c0f; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif; overflow: hidden; }
    #game { width: 800px; height: 600px; background: #141417; border: 1px solid #2a2a30; position: relative; overflow: hidden; }
    .platform { position: absolute; bottom: 0; height: 20px; left: 0; right: 0; background: #d97706; opacity: 0.6; }
    .platform-1 { bottom: 100px; left: 60px; width: 140px; }
    .platform-2 { bottom: 200px; left: 260px; width: 180px; }
    .platform-3 { bottom: 300px; left: 460px; width: 120px; }
    .player { position: absolute; bottom: 20px; left: 60px; width: 28px; height: 36px; background: #d97706; z-index: 10; }
    .coin { position: absolute; width: 14px; height: 14px; border-radius: 50%; background: #d97706; opacity: 0.8; }
    .coin-1 { bottom: 140px; left: 120px; } .coin-2 { bottom: 240px; left: 320px; } .coin-3 { bottom: 340px; left: 500px; }
    .info { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); color: #5a5855; font-size: 11px; font-family: 'DM Mono', monospace; }
  </style>
</head>
<body>
  <div id="game">
    <div class="info">ARROW KEYS : MOVE &middot; SPACE : JUMP</div>
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
    let x = 60, y = 20, vx = 0, vy = 0, grounded = true;
    const GRAVITY = -0.5, SPEED = 4, JUMP = 9;
    const platforms = [
      { x: 0, y: 0, w: 800, h: 20 },
      { x: 60, y: 100, w: 140, h: 14 },
      { x: 260, y: 200, w: 180, h: 14 },
      { x: 460, y: 300, w: 120, h: 14 },
    ];
    function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
    function update() {
      if (keys['ArrowLeft']) vx = -SPEED; else if (keys['ArrowRight']) vx = SPEED; else vx *= 0.8;
      if (keys[' '] && grounded) { vy = JUMP; grounded = false; }
      vy += GRAVITY; x += vx; y -= vy; grounded = false;
      const pw = 28, ph = 36;
      for (const p of platforms) { if (overlap({x, y, w: pw, h: ph}, p) && vy < 0) { y = p.y - ph; vy = 0; grounded = true; } }
      if (x < 0) x = 0; if (x > 800 - pw) x = 800 - pw; if (y > 600) { x = 60; y = 20; vy = 0; }
      player.style.bottom = y + 'px'; player.style.left = x + 'px';
      requestAnimationFrame(update);
    }
    const keys = {};
    window.addEventListener('keydown', e => { keys[e.key] = true; if (e.key === ' ') e.preventDefault(); });
    window.addEventListener('keyup', e => keys[e.key] = false);
    update();
  </script>
</body>
</html>`, fileType: 'code' },
  { path: 'game.js', content: '// Game logic placeholder\nconsole.log(\'Foundry Demo Platformer loaded\');', fileType: 'code' },
  { path: 'style.css', content: '/* Styles inline in index.html for this demo */', fileType: 'code' },
];

function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="hidden w-[55%] flex-col justify-center px-16 lg:flex" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}>
        <div className="mb-6 flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span className="text-lg font-medium text-white tracking-tight">Foundry</span>
        </div>
        <h1 className="mb-3 font-normal leading-tight text-white animate-fadeInUp" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(1.75rem, 2.5vw, 2.5rem)', letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        <p className="mb-10 max-w-sm text-sm leading-relaxed animate-fadeInUp" style={{ color: 'var(--text-secondary)', animationDelay: '0.1s' }}>
          {subtitle}
        </p>
        <div className="space-y-4">
          {[
            { label: 'Local storage', desc: 'Everything stored in your browser' },
            { label: 'No server', desc: 'Works completely offline' },
            { label: 'Encrypted', desc: 'Your passphrase protects all API keys' },
            { label: 'Portable', desc: 'Export and import your data anytime' },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center gap-3 text-sm animate-fadeInUp" style={{ color: 'var(--text-secondary)', animationDelay: `${0.2 + i * 0.08}s` }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
              <div>
                <span className="font-medium text-white">{item.label}</span>
                <span className="ml-2">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-full lg:w-[45%] items-center justify-center p-8">
        <div className="w-full max-w-[380px] animate-fadeIn">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            <span className="text-base font-medium text-white">Foundry</span>
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
    <AuthLayout title="Secure your workspace" subtitle="Set a passphrase to encrypt your API keys. Everything stays on your machine.">
      <h2 className="text-xl font-normal text-white mb-1" style={{ fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: '-0.02em' }}>Create passphrase</h2>
      <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>This unlocks your workspace every time you visit.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs" style={{ color: 'var(--text-secondary)' }}>Passphrase</label>
          <div className="relative">
            <input className="input-field pr-9" type={showPassphrase ? 'text' : 'password'} placeholder="At least 4 characters" minLength={4} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} required autoComplete="new-password" />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }} onClick={() => setShowPassphrase(!showPassphrase)}>
              {showPassphrase ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs" style={{ color: 'var(--text-secondary)' }}>Confirm passphrase</label>
          <input className="input-field" type={showPassphrase ? 'text' : 'password'} placeholder="Re-enter passphrase" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
        </div>

        {error && (
          <div className="rounded px-3 py-2 text-xs animate-scaleIn" style={{ background: 'var(--danger-subtle)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? 'Setting up...' : 'Secure workspace'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--border-primary)' }} /></div>
        <div className="relative flex justify-center text-xs" style={{ color: 'var(--text-muted)' }}><span className="px-2" style={{ background: 'var(--bg-primary)' }}>or</span></div>
      </div>

      <button disabled={demoLoading} className="btn-ghost w-full justify-center" onClick={handleDemo}>
        {demoLoading ? 'Setting up demo...' : 'Explore demo (no passphrase needed)'}
      </button>
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
      <h2 className="text-xl font-normal text-white mb-1" style={{ fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: '-0.02em' }}>Unlock workspace</h2>
      <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>Enter your passphrase to continue.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs" style={{ color: 'var(--text-secondary)' }}>Passphrase</label>
          <div className="relative">
            <input className="input-field pr-9" type={showPassphrase ? 'text' : 'password'} placeholder="Enter your passphrase" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} required autoFocus />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }} onClick={() => setShowPassphrase(!showPassphrase)}>
              {showPassphrase ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded px-3 py-2 text-xs animate-scaleIn" style={{ background: 'var(--danger-subtle)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? 'Unlocking...' : 'Unlock'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--border-primary)' }} /></div>
        <div className="relative flex justify-center text-xs" style={{ color: 'var(--text-muted)' }}><span className="px-2" style={{ background: 'var(--bg-primary)' }}>or</span></div>
      </div>

      <button disabled={demoLoading} className="btn-ghost w-full justify-center" onClick={handleDemo}>
        {demoLoading ? 'Setting up demo...' : 'Explore demo (no passphrase needed)'}
      </button>

      <div className="mt-8 pt-5 border-t text-center" style={{ borderColor: 'var(--border-primary)' }}>
        <button onClick={handleReset} className="text-[10px] transition-colors" style={{ color: 'var(--text-muted)' }} onMouseOver={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'} onMouseOut={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}>
          Lost passphrase? Reset workspace
        </button>
      </div>
    </AuthLayout>
  );
}
