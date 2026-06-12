import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const colors = ['108,92,231', '0,180,216', '253,121,168', '0,206,201'];
    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string; pulse: number; pulseSpeed: number;
    }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 80; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        color,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        p.pulse += p.pulseSpeed;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
        const pulsedOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${pulsedOpacity})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x; const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${a.color}, ${0.08 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" style={{ opacity: 0.7 }} />;
}

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Multi-Agent AI Pipeline',
    desc: 'Five specialized AI agents orchestrate your game build — from design doc to polished code, assets, and QA.',
    gradient: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
    glow: 'rgba(108, 92, 231, 0.15)',
    gradientVar: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'VS Code Workspace',
    desc: 'Full Monaco editor with IntelliSense, multi-tab editing, integrated terminal, and file explorer.',
    gradient: 'linear-gradient(135deg, #00b4d8, #06b6d4)',
    glow: 'rgba(0, 180, 216, 0.15)',
    gradientVar: 'linear-gradient(135deg, #00b4d8, #06b6d4)',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    title: 'Live Preview',
    desc: 'See your game running in real-time with hot reload. Saved state and live preview side by side.',
    gradient: 'linear-gradient(135deg, #06b6d4, #14b8a6)',
    glow: 'rgba(6, 182, 212, 0.15)',
    gradientVar: 'linear-gradient(135deg, #06b6d4, #14b8a6)',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'BYOK — Your Keys',
    desc: 'Bring your own API keys. AES-256-GCM encrypted at rest. You control costs and data.',
    gradient: 'linear-gradient(135deg, #14b8a6, #22c55e)',
    glow: 'rgba(20, 184, 166, 0.15)',
    gradientVar: 'linear-gradient(135deg, #14b8a6, #22c55e)',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
    title: 'Instant Deploy',
    desc: 'Export as ZIP, deploy to a subdomain, or publish to itch.io with one click.',
    gradient: 'linear-gradient(135deg, #22c55e, #eab308)',
    glow: 'rgba(34, 197, 94, 0.15)',
    gradientVar: 'linear-gradient(135deg, #22c55e, #eab308)',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Real-time Collaboration',
    desc: 'Work with your team in real-time. Cursor sync, shared edits, and live presence indicators.',
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    glow: 'rgba(236, 72, 153, 0.15)',
    gradientVar: 'linear-gradient(135deg, #ec4899, #f43f5e)',
  },
];

const PIPELINE_STEPS = [
  { label: 'Design', color: '#6c5ce7', icon: '✦' },
  { label: 'Code', color: '#00b4d8', icon: '⟨/⟩' },
  { label: 'Assets', color: '#06b6d4', icon: '◈' },
  { label: 'Sound', color: '#14b8a6', icon: '♫' },
  { label: 'QA', color: '#ec4899', icon: '✓' },
];

const PROVIDERS = [
  { name: 'OpenAI', color: '#10a37f' },
  { name: 'Anthropic', color: '#d97706' },
  { name: 'Google', color: '#4285f4' },
  { name: 'Replicate', color: '#ffffff' },
  { name: 'Stability', color: '#a855f7' },
  { name: 'ElevenLabs', color: '#6c5ce7' },
  { name: 'OpenRouter', color: '#00b4d8' },
];

const TESTIMONIALS = [
  { text: 'I described a platformer and got a fully playable game in 90 seconds. The code quality is shockingly good.', author: 'Game Dev', role: 'Indie Developer' },
  { text: 'Finally, an AI tool that respects my keys and my wallet. No subscription, no vendor lock-in. Just Ship.', author: 'Sarah K.', role: 'Solo Founder' },
  { text: 'The multi-agent pipeline is genius. Each AI specializes in what it does best — design, code, assets, QA.', author: 'Alex M.', role: 'Creative Technologist' },
];

function MockIDE() {
  const [visibleLines, setVisibleLines] = useState(0);
  const lines = [
    { indent: 0, text: 'const', color: '#c678dd', rest: ' config = {', restColor: '#e06c75' },
    { indent: 1, text: 'type', color: '#e06c75', rest: ': Phaser.AUTO,', restColor: '#98c379' },
    { indent: 1, text: 'width', color: '#e06c75', rest: ': 800,', restColor: '#d19a66' },
    { indent: 1, text: 'height', color: '#e06c75', rest: ': 600,', restColor: '#d19a66' },
    { indent: 1, text: 'physics', color: '#e06c75', rest: ': { ', restColor: '#abb2bf' },
    { indent: 2, text: 'default', color: '#e06c75', rest: ": 'arcade',", restColor: '#98c379' },
    { indent: 1, text: '}', color: '#abb2bf', rest: ',', restColor: '#abb2bf' },
    { indent: 1, text: 'scene', color: '#e06c75', rest: ': [BootScene, GameScene]', restColor: '#61afef' },
    { indent: 0, text: '};', color: '#abb2bf', rest: '', restColor: '' },
  ];

  useEffect(() => {
    const timers = lines.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), 400 + i * 200)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="landing-hero-mockup mx-auto max-w-4xl overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="h-3 w-3 rounded-full" style={{ background: '#febc2e' }} />
          <div className="h-3 w-3 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <span className="ml-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Foundry Workspace</span>
      </div>
      <div className="flex" style={{ height: '320px' }}>
        <div className="w-52 border-r p-3 font-mono text-xs" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Explorer</div>
          {['📁 src/', '  index.html', '  game.js', '  style.css', '📁 scenes/', '  Boot.js', '  Main.js', '📁 assets/', '  player.png', '  coin.png'].map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 py-0.5 rounded px-1 transition-colors hover:bg-white/5" style={{ color: f.startsWith('  ') ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
              <span className="text-[10px]">{f.includes('.') ? '📄' : '📁'}</span>
              <span className="truncate">{f.replace(/^[📁  ]+/, '')}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 p-5 font-mono text-xs" style={{ background: 'var(--bg-primary)' }}>
          <div className="mb-4 flex gap-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span className="border-b-2 pb-1" style={{ borderColor: 'var(--accent)' }}>game.js</span>
            <span className="cursor-pointer transition-colors hover:text-white/50">style.css</span>
            <span className="cursor-pointer transition-colors hover:text-white/50">index.html</span>
          </div>
          <pre className="leading-loose" style={{ color: 'var(--text-secondary)' }}>
            {lines.map((line, i) => (
              <div key={i} className={`landing-mockup-line ${i < visibleLines ? 'typing' : ''}`} style={{ paddingLeft: line.indent * 20, opacity: i < visibleLines ? 1 : 0 }}>
                <span style={{ color: line.color }}>{line.text}</span>
                <span style={{ color: line.restColor }}>{line.rest}</span>
              </div>
            ))}
            {visibleLines >= lines.length && <span className="landing-cursor" />}
          </pre>
        </div>
        <div className="w-64 border-l p-3" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: '#28c840' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#28c840' }} />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Live Preview</span>
          </div>
          <div className="aspect-video rounded-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)' }}>
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-3xl">🎮</div>
                <div className="text-[10px] font-medium" style={{ color: 'var(--accent-green)' }}>Running...</div>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#28c840' }} /> 60 FPS
            </div>
            <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#00b4d8' }} /> 3 scenes loaded
            </div>
            <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#a855f7' }} /> Hot reload active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const featuresRef = useScrollReveal();
  const pipelineRef = useScrollReveal();
  const providersRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient glow orbs */}
      <div className="landing-orb landing-orb-1" style={{ top: '-200px', left: '-100px' }} />
      <div className="landing-orb landing-orb-2" style={{ top: '200px', right: '-150px' }} />
      <div className="landing-orb landing-orb-3" style={{ bottom: '-100px', left: '30%' }} />

      {/* Grid background */}
      <div className="landing-grid-bg" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--gradient-1)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <div className="absolute inset-0 rounded-lg" style={{ background: 'var(--gradient-1)', filter: 'blur(12px)', opacity: 0.4 }} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Foundry</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/gallery" className="hidden sm:block px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
              Gallery
            </Link>
            <a href="https://github.com/Malikiyaw/Foundry" target="_blank" rel="noopener noreferrer" className="hidden sm:block px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
              GitHub
            </a>
            <Link to="/setup" className="btn-ghost !py-2 !px-5 !text-sm !rounded-full">
              Get Started
            </Link>
            <Link to="/setup" className="btn-primary !py-2 !px-5 !text-sm !rounded-full">
              Launch Foundry
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center pt-20">
        <ParticlesBackground />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="landing-hero-badge">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: '#22c55e' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#22c55e' }} />
            </span>
            Open Source &middot; BYOK &middot; Self-Hostable
          </div>

          <h1 className="landing-hero-title mt-6 mb-6 text-white">
            Build games with
            <br />
            <span className="text-gradient">AI superpowers</span>
          </h1>

          <p className="landing-hero-subtitle">
            Five specialized AI agents orchestrate your entire game build — from a single prompt to
            polished, deployable code. You own the keys, you own the costs.
          </p>

          <div className="landing-hero-cta mt-10">
            <Link to="/setup" className="btn-primary !py-3.5 !px-10 !text-base !rounded-full flex items-center gap-2.5 group" style={{ boxShadow: '0 4px 30px rgba(108, 92, 231, 0.4)' }}>
              Start Building Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a href="https://github.com/Malikiyaw/Foundry" target="_blank" rel="noopener noreferrer" className="btn-ghost !py-3.5 !px-10 !text-base !rounded-full flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </div>

          <div className="mt-16">
            <MockIDE />
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="relative py-16 border-y" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4 gap-8 px-6">
          {[
            { num: '5', label: 'AI Agents', sub: 'Specialized pipeline' },
            { num: '$0', label: 'Platform Cost', sub: 'You own the keys' },
            { num: '100%', label: 'BYOK', sub: 'Your API keys only' },
            { num: '<90s', label: 'Generation Time', sub: 'Prompt to playable' },
          ].map((s, i) => (
            <div key={i} className="landing-stat-card">
              <div className="landing-stat-number">{s.num}</div>
              <div className="mt-1 text-sm font-semibold text-white">{s.label}</div>
              <div className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-28 relative">
        <div className="mx-auto max-w-6xl px-6">
          <div ref={featuresRef} className="landing-section-reveal mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              Features
            </div>
            <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Everything you need to build games</h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">One platform, zero vendor lock-in. From idea to deployed game.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="landing-feature-card"
                style={{
                  '--card-gradient': f.gradient,
                  '--card-glow': f.glow,
                  animationDelay: `${i * 0.1}s`,
                } as React.CSSProperties}
              >
                <div className="landing-feature-icon" style={{ background: f.gradient }}>
                  <div style={{ color: 'white' }}>{f.icon}</div>
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Visualization */}
      <section className="py-28 relative" style={{ background: 'var(--bg-secondary)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div ref={pipelineRef} className="landing-section-reveal mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              How It Works
            </div>
            <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">One prompt, five AI agents</h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">Each agent specializes in one task. Together they build your entire game.</p>
          </div>
          <div ref={pipelineRef} className="landing-section-reveal flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0 mt-12">
            {PIPELINE_STEPS.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="landing-pipeline-step">
                  <div
                    className="landing-pipeline-node"
                    style={{ background: `${step.color}15`, border: `2px solid ${step.color}40` }}
                  >
                    <span style={{ color: step.color, fontSize: '24px', fontWeight: 700 }}>{step.icon}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-white">{step.label}</div>
                    <div className="text-[10px]" style={{ color: step.color }}>Agent {i + 1}</div>
                  </div>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="hidden md:block mx-2">
                    <svg width="40" height="2" viewBox="0 0 40 2">
                      <line x1="0" y1="1" x2="40" y2="1" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
                    </svg>
                  </div>
                )}
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="md:hidden my-2">
                    <svg width="2" height="30" viewBox="0 0 2 30">
                      <line x1="1" y1="0" x2="1" y2="30" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="py-28 relative">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div ref={providersRef} className="landing-section-reveal">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              Integrations
            </div>
            <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Works with your favorite AI providers</h2>
            <p className="mb-12 text-lg text-[var(--text-secondary)]">Plug in any combination. You own the keys, you own the costs.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {PROVIDERS.map((p) => (
                <div key={p.name} className="landing-provider-pill">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 relative" style={{ background: 'var(--bg-secondary)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              Testimonials
            </div>
            <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Loved by developers</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="landing-testimonial-card">
                <div className="mb-4 text-lg" style={{ color: 'var(--accent)' }}>&ldquo;</div>
                <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'var(--gradient-1)' }}>
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.author}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 relative">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div ref={ctaRef} className="landing-section-reveal landing-cta-glow rounded-2xl p-16" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
            <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Ready to build?</h2>
            <p className="mb-10 text-lg text-[var(--text-secondary)] max-w-lg mx-auto">Start building games with AI in under 2 minutes. No credit card, no subscription, no BS.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/setup" className="btn-primary !py-3.5 !px-10 !text-base !rounded-full flex items-center gap-2.5" style={{ boxShadow: '0 4px 30px rgba(108, 92, 231, 0.4)' }}>
                Get Started Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link to="/gallery" className="btn-ghost !py-3.5 !px-10 !text-base !rounded-full">
                Browse Games
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-14" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-md" style={{ background: 'var(--gradient-1)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">Foundry</span>
          </div>
          <div className="flex items-center gap-8 text-xs" style={{ color: 'var(--text-muted)' }}>
            <a href="https://github.com/Malikiyaw/Foundry" className="hover:text-white transition-colors">GitHub</a>
            <Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link>
            <Link to="/setup" className="hover:text-white transition-colors">Get Started</Link>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Open source under MIT License</p>
        </div>
      </footer>
    </div>
  );
}
