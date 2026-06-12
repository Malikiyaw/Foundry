import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

// ─── HOOKS ────────────────────────────────────────────────────────────────────

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return y;
}

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCounter(target: number, duration = 1500, enabled = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let start = 0;
    let raf: number;
    const ts = performance.now();
    const step = (now: number) => {
      const elapsed = now - ts;
      const p = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);
  return val;
}

function useWordCycle(words: string[], pauseMs = 2500) {
  const [idx, setIdx] = useState(0);
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const pause = setTimeout(() => {
      setExiting(true);
      const swap = setTimeout(() => {
        setIdx((i) => (i + 1) % words.length);
        setExiting(false);
      }, 300);
      return () => clearTimeout(swap);
    }, pauseMs);
    return () => clearTimeout(pause);
  }, [idx, exiting, words.length, pauseMs]);
  return { word: words[idx], exiting };
}

// ─── PARTICLES BACKGROUND ─────────────────────────────────────────────────────

function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const colors = ['108,92,231', '0,180,216', '253,121,168', '0,206,201', '168,85,247'];
    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string; pulse: number; pulseSpeed: number;
    }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 90; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.35 + 0.1,
        color,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.004,
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
        const o = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${o})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x; const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${a.color}, ${0.07 * (1 - dist / 130)})`;
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

// ─── TILT CARD ────────────────────────────────────────────────────────────────

function TiltCard({ children, className = '', gradient, glow }: {
  children: React.ReactNode;
  className?: string;
  gradient: string;
  glow: string;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [spotStyle, setSpotStyle] = useState<React.CSSProperties>({});

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateY = ((x - cx) / cx) * 6;
    const rotateX = ((cy - y) / cy) * 6;
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`,
    });
    setSpotStyle({
      '--card-mx': `${x}px`,
      '--card-my': `${y}px`,
    } as React.CSSProperties);
  }, []);

  const handleLeave = useCallback(() => {
    setStyle({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)' });
  }, []);

  return (
    <div ref={cardRef} className={`landing-tilt-card ${className}`} onMouseMove={handleMouse} onMouseLeave={handleLeave}>
      <div ref={innerRef} className="landing-tilt-card-inner" style={style}>
        <div className="landing-spotlight" style={spotStyle} />
        {children}
      </div>
    </div>
  );
}

// ─── MAGNETIC BUTTON ──────────────────────────────────────────────────────────

function MagneticButton({ children, className = '', href, to, ...rest }: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  to?: string;
  [key: string]: any;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const el = innerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 80;
    if (dist < maxDist) {
      const strength = 1 - dist / maxDist;
      setOffset({ x: dx * strength * 0.35, y: dy * strength * 0.35 });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, []);

  const handleLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  const inner = (
    <div ref={innerRef} className="landing-magnetic-inner" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
      {children}
    </div>
  );

  const wrap = (tag: 'a' | 'div', props: any) => (
    <div className={`landing-magnetic-wrap ${className}`} onMouseMove={handleMouse} onMouseLeave={handleLeave} {...rest}>
      {React.createElement(tag, props, inner)}
    </div>
  );

  if (to) return wrap('div' as any, { children: <Link to={to}>{inner}</Link> });
  if (href) return wrap('a' as any, { href, target: '_blank', rel: 'noopener noreferrer', children: inner });
  return wrap('div' as any, { children: inner });
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const { ref, visible } = useInView(0.3);
  const val = useCounter(target, 1500, visible);
  return <span ref={ref} className="landing-counter">{prefix}{val}{suffix}</span>;
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────

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
  },
];

const PIPELINE_STEPS = [
  { label: 'Design', color: '#6c5ce7', icon: '✦', desc: 'GDD generation' },
  { label: 'Code', color: '#00b4d8', icon: '⟨/⟩', desc: 'Full source build' },
  { label: 'Assets', color: '#06b6d4', icon: '◈', desc: 'Sprite creation' },
  { label: 'Sound', color: '#14b8a6', icon: '♫', desc: 'Audio synthesis' },
  { label: 'QA', color: '#ec4899', icon: '✓', desc: 'Playtest & fix' },
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
  { text: 'I described a platformer and got a fully playable game in 90 seconds. The code quality is shockingly good.', author: 'Game Dev', role: 'Indie Developer', accent: '#6c5ce7' },
  { text: 'Finally, an AI tool that respects my keys and my wallet. No subscription, no vendor lock-in. Just Ship.', author: 'Sarah K.', role: 'Solo Founder', accent: '#00b4d8' },
  { text: 'The multi-agent pipeline is genius. Each AI specializes in what it does best — design, code, assets, QA.', author: 'Alex M.', role: 'Creative Technologist', accent: '#ec4899' },
];

const CYCLE_WORDS = ['games', 'tools', 'apps', 'experiences'];

// ─── MOCK IDE ─────────────────────────────────────────────────────────────────

function MockIDE() {
  const [visibleLines, setVisibleLines] = useState(0);
  const lines = [
    { indent: 0, segments: [{ text: 'const', c: '#c678dd' }, { text: ' config = {', c: '#e06c75' }] },
    { indent: 1, segments: [{ text: 'type', c: '#e06c75' }, { text: ': Phaser.AUTO,', c: '#98c379' }] },
    { indent: 1, segments: [{ text: 'width', c: '#e06c75' }, { text: ': 800,', c: '#d19a66' }] },
    { indent: 1, segments: [{ text: 'height', c: '#e06c75' }, { text: ': 600,', c: '#d19a66' }] },
    { indent: 1, segments: [{ text: 'physics', c: '#e06c75' }, { text: ': { ', c: '#abb2bf' }] },
    { indent: 2, segments: [{ text: 'default', c: '#e06c75' }, { text: ": 'arcade',", c: '#98c379' }] },
    { indent: 1, segments: [{ text: '}', c: '#abb2bf' }, { text: ',', c: '#abb2bf' }] },
    { indent: 1, segments: [{ text: 'scene', c: '#e06c75' }, { text: ': [BootScene, GameScene]', c: '#61afef' }] },
    { indent: 0, segments: [{ text: '};', c: '#abb2bf' }] },
  ];

  useEffect(() => {
    const timers = lines.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), 400 + i * 180)
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
              <div key={i} className="landing-mockup-line" style={{ paddingLeft: line.indent * 20, opacity: i < visibleLines ? 1 : 0, transition: 'opacity 0.3s' }}>
                {line.segments.map((seg, j) => <span key={j} style={{ color: seg.c }}>{seg.text}</span>)}
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

// ─── PIPELINE VISUALIZATION ───────────────────────────────────────────────────

function PipelineVisualization({ visible }: { visible: boolean }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0 mt-14">
      {PIPELINE_STEPS.map((step, i) => (
        <React.Fragment key={step.label}>
          <div className="landing-pipeline-step" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s` }}>
            <div
              className="landing-pipeline-node"
              style={{
                background: `${step.color}15`,
                border: `2px solid ${step.color}${visible ? '60' : '20'}`,
                boxShadow: visible ? `0 0 30px ${step.color}20` : 'none',
                transition: 'all 0.6s ease',
              }}
            >
              <span style={{ color: step.color, fontSize: '24px', fontWeight: 700 }}>{step.icon}</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-white">{step.label}</div>
              <div className="text-[10px] mt-0.5" style={{ color: step.color }}>{step.desc}</div>
            </div>
          </div>
          {i < PIPELINE_STEPS.length - 1 && (
            <>
              <div className="hidden md:block mx-1">
                <svg width="48" height="2" viewBox="0 0 48 2">
                  <line x1="0" y1="1" x2="48" y2="1" stroke={step.color} strokeWidth="2" className={visible ? 'landing-pipeline-flow' : ''} opacity="0.4" />
                </svg>
              </div>
              <div className="md:hidden my-1">
                <svg width="2" height="32" viewBox="0 0 2 32">
                  <line x1="1" y1="0" x2="1" y2="32" stroke={step.color} strokeWidth="2" className={visible ? 'landing-pipeline-flow' : ''} opacity="0.4" />
                </svg>
              </div>
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── MAIN LANDING ─────────────────────────────────────────────────────────────

export default function Landing() {
  const scrollProgress = useScrollProgress();
  const scrollY = useScrollY();
  const heroRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const [navScrolled, setNavScrolled] = useState(false);
  const { word, exiting } = useWordCycle(CYCLE_WORDS, 2500);

  const featuresState = useInView(0.15);
  const pipelineState = useInView(0.2);
  const providersState = useInView(0.15);
  const ctaState = useInView(0.2);
  const statsState = useInView(0.3);

  // Hero mouse glow
  const handleHeroMouse = useCallback((e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: `${e.clientX - rect.left}px`,
      y: `${e.clientY - rect.top}px`,
    });
  }, []);

  // Nav scroll
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Noise overlay */}
      <div className="landing-noise" />

      {/* Scroll progress */}
      <div className="landing-scroll-progress" style={{ width: `${scrollProgress * 100}%` }} />

      {/* Ambient glow orbs */}
      <div className="landing-orb landing-parallax-orb landing-orb-1" style={{ top: '-200px', left: '-100px', transform: `translateY(${scrollY * 0.15}px)` }} />
      <div className="landing-orb landing-parallax-orb landing-orb-2" style={{ top: '200px', right: '-150px', transform: `translateY(${scrollY * -0.1}px)` }} />
      <div className="landing-orb landing-parallax-orb landing-orb-3" style={{ bottom: '-100px', left: '30%', transform: `translateY(${scrollY * 0.08}px)` }} />

      {/* Grid background */}
      <div className="landing-grid-bg" />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 glass ${navScrolled ? 'landing-nav-scrolled' : ''}`} style={{ transition: 'background 0.3s, backdrop-filter 0.3s, border-bottom 0.3s' }}>
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
            <MagneticButton>
              <Link to="/setup" className="btn-ghost !py-2 !px-5 !text-sm !rounded-full">
                Get Started
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link to="/setup" className="btn-primary !py-2 !px-5 !text-sm !rounded-full">
                Launch Foundry
              </Link>
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative flex min-h-screen items-center justify-center pt-20" onMouseMove={handleHeroMouse}>
        <ParticlesBackground />
        <div className="landing-mouse-glow" style={{ '--mx': mousePos.x, '--my': mousePos.y } as React.CSSProperties} />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="landing-hero-badge landing-float-badge">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: '#22c55e' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#22c55e' }} />
            </span>
            Open Source &middot; BYOK &middot; Self-Hostable
          </div>

          <h1 className="landing-hero-title mt-6 mb-6 text-white">
            Build{' '}
            <span className="landing-shimmer-text">
              <span className={exiting ? 'landing-cycling-word exiting' : 'landing-cycling-word'} key={word}>
                {word}
              </span>
            </span>
            <br />
            with <span className="text-gradient">AI superpowers</span>
          </h1>

          <p className="landing-hero-subtitle">
            Five specialized AI agents orchestrate your entire game build — from a single prompt to
            polished, deployable code. You own the keys, you own the costs.
          </p>

          <div className="landing-hero-cta mt-10">
            <MagneticButton>
              <Link to="/setup" className="btn-primary !py-3.5 !px-10 !text-base !rounded-full flex items-center gap-2.5 group" style={{ boxShadow: '0 4px 30px rgba(108, 92, 231, 0.4)' }}>
                Start Building Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </MagneticButton>
            <MagneticButton href="https://github.com/Malikiyaw/Foundry">
              <span className="btn-ghost !py-3.5 !px-10 !text-base !rounded-full flex items-center gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </span>
            </MagneticButton>
          </div>

          <div className="mt-16">
            <MockIDE />
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="relative py-16 border-y" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <div ref={statsState.ref} className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4 gap-8 px-6">
          {[
            { num: 5, suffix: '', label: 'AI Agents', sub: 'Specialized pipeline' },
            { num: 0, prefix: '$', suffix: '', label: 'Platform Cost', sub: 'You own the keys' },
            { num: 100, suffix: '%', label: 'BYOK', sub: 'Your API keys only' },
            { num: 90, prefix: '<', suffix: 's', label: 'Generation Time', sub: 'Prompt to playable' },
          ].map((s, i) => (
            <div key={i} className="landing-stat-card" style={{ opacity: statsState.visible ? 1 : 0, transform: statsState.visible ? 'translateY(0)' : 'translateY(20px)', transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s` }}>
              <div className="landing-stat-number">
                <AnimatedCounter target={s.num} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <div className="mt-1 text-sm font-semibold text-white">{s.label}</div>
              <div className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-28 relative">
        <div className="mx-auto max-w-6xl px-6">
          <div ref={featuresState.ref} className="mb-16 text-center" style={{ opacity: featuresState.visible ? 1 : 0, transform: featuresState.visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              Features
            </div>
            <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Everything you need</h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">One platform, zero vendor lock-in. From idea to deployed game.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <TiltCard key={f.title} gradient={f.gradient} glow={f.glow}>
                <div
                  className="landing-feature-card"
                  style={{
                    '--card-gradient': f.gradient,
                    '--card-glow': f.glow,
                    opacity: featuresState.visible ? 1 : 0,
                    transform: featuresState.visible ? 'translateY(0)' : 'translateY(30px)',
                    transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.08}s`,
                  } as React.CSSProperties}
                >
                  <div className="landing-feature-icon" style={{ background: f.gradient }}>
                    <div style={{ color: 'white' }}>{f.icon}</div>
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Visualization */}
      <section className="py-28 relative" style={{ background: 'var(--bg-secondary)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div ref={pipelineState.ref} className="mb-8 text-center" style={{ opacity: pipelineState.visible ? 1 : 0, transform: pipelineState.visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              How It Works
            </div>
            <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">One prompt, five AI agents</h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">Each agent specializes in one task. Together they build your entire game.</p>
          </div>
          <PipelineVisualization visible={pipelineState.visible} />
        </div>
      </section>

      {/* Providers Section */}
      <section className="py-28 relative">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div ref={providersState.ref} style={{ opacity: providersState.visible ? 1 : 0, transform: providersState.visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              Integrations
            </div>
            <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Works with your favorite providers</h2>
            <p className="mb-12 text-lg text-[var(--text-secondary)]">Plug in any combination. You own the keys, you own the costs.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {PROVIDERS.map((p, i) => (
                <div
                  key={p.name}
                  className="landing-provider-pill"
                  style={{
                    opacity: providersState.visible ? 1 : 0,
                    transform: providersState.visible ? 'translateY(0) scale(1)' : 'translateY(15px) scale(0.95)',
                    transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.06}s`,
                  }}
                >
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
              <TiltCard key={i} gradient={`linear-gradient(135deg, ${t.accent}, ${t.accent}88)`} glow={`${t.accent}20`}>
                <div className="landing-testimonial-card" style={{ minHeight: '200px' }}>
                  <div className="mb-4 text-3xl leading-none" style={{ color: t.accent }}>&ldquo;</div>
                  <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">{t.text}</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent}aa)` }}>
                      {t.author[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.author}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 relative">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div ref={ctaState.ref} className="landing-cta-glow rounded-2xl p-16" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', opacity: ctaState.visible ? 1 : 0, transform: ctaState.visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.98)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Ready to build?</h2>
            <p className="mb-10 text-lg text-[var(--text-secondary)] max-w-lg mx-auto">Start building games with AI in under 2 minutes. No credit card, no subscription, no BS.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton>
                <Link to="/setup" className="btn-primary !py-3.5 !px-10 !text-base !rounded-full flex items-center gap-2.5" style={{ boxShadow: '0 4px 30px rgba(108, 92, 231, 0.4)' }}>
                  Get Started Free
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/gallery" className="btn-ghost !py-3.5 !px-10 !text-base !rounded-full">
                  Browse Games
                </Link>
              </MagneticButton>
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
