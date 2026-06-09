import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 92, 231, ${p.opacity})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x; const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(108, 92, 231, ${0.06 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0.6 }} />;
}

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Multi-Agent AI Pipeline',
    desc: 'Design, code, asset, sound, and playtest agents work together to build your game from a single prompt.',
    gradient: 'from-purple-500 to-blue-500',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'VS Code Workspace',
    desc: 'Full Monaco editor with IntelliSense, multi-tab editing, integrated terminal, and file explorer.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    title: 'Live Preview',
    desc: 'See your game running in real-time with hot reload. Saved state and live preview side by side.',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'BYOK — Your Keys',
    desc: 'Bring your own API keys. AES-256-GCM encrypted at rest. You control costs and data.',
    gradient: 'from-teal-500 to-green-500',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
    title: 'Instant Deploy',
    desc: 'Export as ZIP, deploy to a subdomain, or publish to itch.io with one click.',
    gradient: 'from-green-500 to-yellow-500',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Real-time Collaboration',
    desc: 'Work with your team in real-time. Cursor sync, shared edits, and live presence indicators.',
    gradient: 'from-pink-500 to-rose-500',
  },
];

const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Replicate', 'Stability', 'ElevenLabs', 'OpenRouter'];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--gradient-1)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">Foundry</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/gallery" className="hidden sm:block px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
              Gallery
            </Link>
            <Link to="/login" className="btn-ghost !py-2 !px-4 !text-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary !py-2 !px-4 !text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center justify-center pt-20">
        <AnimatedBackground />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium glass" style={{ color: 'var(--accent)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-green)]" />
            Open Source &middot; BYOK &middot; Self-Hostable
          </div>
          <h1 className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            Build games with
            <br />
            <span className="text-gradient">AI superpowers</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--text-secondary)] leading-relaxed">
            Foundry is a VS Code-inspired game generator where you bring your own API keys.
            Multi-agent AI orchestrates design, code, assets, and sound — then deploys your game to the web.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary !py-3 !px-8 !text-base !rounded-xl flex items-center gap-2">
              Start Building Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
            <a href="https://github.com/Malikiyaw/Foundry" target="_blank" rel="noopener noreferrer" className="btn-ghost !py-3 !px-8 !text-base !rounded-xl flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              View on GitHub
            </a>
          </div>

          <div className="mt-16 mx-auto max-w-3xl rounded-2xl border overflow-hidden animate-fadeInUp" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ background: 'var(--danger)' }} />
                <div className="h-3 w-3 rounded-full" style={{ background: 'var(--warning)' }} />
                <div className="h-3 w-3 rounded-full" style={{ background: 'var(--accent-green)' }} />
              </div>
              <span className="ml-2 text-xs text-[var(--text-muted)] font-mono">Foundry Workspace</span>
            </div>
            <div className="flex h-64">
              <div className="w-48 border-r p-3 text-xs font-mono" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Explorer</div>
                {['index.html', 'game.js', 'style.css', 'scenes/', '  Boot.js', '  Main.js', 'assets/', '  player.png', '  coin.png'].map((f) => (
                  <div key={f} className="flex items-center gap-1.5 py-0.5 rounded px-1" style={{ color: f.startsWith('  ') ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                    <span className="text-[10px]">{f.endsWith('/') || f.startsWith('  ') ? '📁' : '📄'}</span>
                    <span className="truncate">{f.trim()}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 p-4 font-mono text-xs" style={{ background: 'var(--bg-primary)' }}>
                <div className="mb-2 flex gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="border-b-2 pb-1" style={{ borderColor: 'var(--accent)' }}>game.js</span>
                  <span>style.css</span>
                  <span>index.html</span>
                </div>
                <pre className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
{`<span style="color:#6c5ce7">const</span> config = {
  <span style="color:#00b4d8">type</span>: Phaser.AUTO,
  <span style="color:#00b4d8">width</span>: 800,
  <span style="color:#00b4d8">height</span>: 600,
  <span style="color:#00b4d8">physics</span>: {
    <span style="color:#00b4d8">default</span>: <span style="color:#00cec9">'arcade'</span>,
  },
  <span style="color:#00b4d8">scene</span>: [BootScene, GameScene]
};`}
                </pre>
              </div>
              <div className="w-64 border-l p-3" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-green)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Live Preview</span>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden" style={{ background: '#1a1a2e' }}>
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-1 text-2xl">🎮</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Game running...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-white">Everything you need to build games</h2>
            <p className="text-lg text-[var(--text-secondary)]">One platform, zero vendor lock-in</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card hover-lift group" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${f.gradient} text-white`}>
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-white">Works with your favorite AI providers</h2>
          <p className="mb-12 text-lg text-[var(--text-secondary)]">Plug in any combination of providers. You own the keys, you own the costs.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {PROVIDERS.map((p) => (
              <div key={p} className="card flex items-center gap-2 px-5 py-3 hover-lift !rounded-full">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="gradient-border p-12">
            <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-white">Ready to build?</h2>
            <p className="mb-8 text-lg text-[var(--text-secondary)]">Start building games with AI in under 2 minutes.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary !py-3 !px-8 !text-base !rounded-xl">
                Get Started Free
              </Link>
              <Link to="/gallery" className="btn-ghost !py-3 !px-8 !text-base !rounded-xl">
                Browse Games
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-12" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: 'var(--gradient-1)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Foundry</span>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            <a href="https://github.com/Malikiyaw/Foundry" className="hover:text-white transition-colors">GitHub</a>
            <Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Open source under MIT License</p>
        </div>
      </footer>
    </div>
  );
}
