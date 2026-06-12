import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function useOnScreen(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShow(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, show };
}

const STEPS = [
  { icon: '1', title: 'Describe your game', desc: 'Pick a template or write a prompt. Tell Foundry what kind of game you want to build — genre, style, mechanics.' },
  { icon: '2', title: 'AI builds it', desc: 'Five specialized agents design the architecture, write the code, generate SVG sprites, and playtest for bugs. No backend needed.' },
  { icon: '3', title: 'Ship it', desc: 'Edit in the Monaco-powered workspace, preview live, and export as a zip or deploy to a subdomain. Your keys, your costs.' },
];

const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
    title: 'Multi-agent pipeline',
    desc: 'Design, code, asset, sound, and QA agents orchestrate your entire build from one prompt.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
    title: 'Full workspace',
    desc: 'Monaco editor with IntelliSense, multi-tab editing, file explorer, and an integrated terminal.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>,
    title: 'Live preview',
    desc: 'Run your game in a sandboxed iframe beside the editor. See changes instantly with hot reload.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    title: 'Your API keys',
    desc: 'Bring your own keys from OpenAI, Anthropic, Google, Replicate, and more. AES-256 encrypted locally.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>,
    title: 'One-click export',
    desc: 'Download as a zip, deploy to any static host, or publish to itch.io. No build step required.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    title: 'Real-time collab',
    desc: 'Cursor sync, shared file editing, and presence indicators for team-based game jams.',
  },
];

const USES = [
  {
    title: '2D Platformer',
    desc: 'Describe a pixel-art platformer with 3 levels, power-ups, and a boss fight. Foundry generates Phaser code, tile maps, and sprite sheets.',
    tag: 'Phaser.js',
  },
  {
    title: 'Top-Down RPG',
    desc: 'Build an RPG with dialogue trees, inventory, and turn-based combat. The pipeline writes game logic, scene management, and UI components.',
    tag: 'JS + Canvas',
  },
  {
    title: 'Endless Runner',
    desc: 'Generate a procedural runner with parallax backgrounds, score tracking, and mobile touch controls. No code required.',
    tag: 'HTML5 Canvas',
  },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const cb = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', cb, { passive: true });
    cb();
    return () => window.removeEventListener('scroll', cb);
  }, []);

  const h = useOnScreen();
  const s = useOnScreen();
  const f = useOnScreen();
  const u = useOnScreen();
  const c = useOnScreen();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="lp-bg-glow" />

      {/* Nav */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: 'var(--accent)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-base font-bold text-white tracking-tight">Foundry</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/gallery" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Gallery</Link>
            <a href="https://github.com/Malikiyaw/Foundry" className="text-sm" style={{ color: 'var(--text-secondary)' }}>GitHub</a>
            <Link to="/setup" className="rounded-full px-5 py-1.5 text-sm font-medium text-white" style={{ background: 'var(--accent)' }}>
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-20">
        <div ref={h.ref} className={`lp-section ${h.show ? 'in' : ''} mx-auto max-w-3xl text-center`}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-medium" style={{ borderColor: 'rgba(108,92,231,0.25)', color: 'var(--accent)' }}>
            Open source · BYOK · Self-hostable
          </div>
          <h1 className="mb-5 text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Build games with
            <br />
            <span style={{ color: 'var(--accent)' }}>AI superpowers</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Describe your game in plain English. Five AI agents design, code, sprite, and playtest it.
            You own your API keys. No subscription, no vendor lock-in.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/setup" className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: 'var(--accent)' }}>
              Start building free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
            <a href="https://github.com/Malikiyaw/Foundry" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-medium transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-28">
        <div ref={s.ref} className={`lp-section ${s.show ? 'in' : ''} mx-auto max-w-5xl`}>
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>How it works</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Prompt to playable in 3 steps</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={i} className="lp-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="lp-step-circle mb-4">{step.icon}</div>
                <h3 className="mb-2 text-base font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y px-6 py-28" style={{ borderColor: 'var(--border-primary)' }}>
        <div ref={f.ref} className={`lp-section ${f.show ? 'in' : ''} mx-auto max-w-5xl`}>
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Features</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Everything you need to build</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat, i) => (
              <div key={i} className="lp-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="lp-icon-box">{feat.icon}</div>
                <h3 className="mb-1.5 text-sm font-semibold text-white">{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-28">
        <div ref={u.ref} className={`lp-section ${u.show ? 'in' : ''} mx-auto max-w-5xl`}>
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>What you can build</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">From platformers to RPGs</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {USES.map((u, i) => (
              <div key={i} className="lp-card">
                <div className="mb-3 inline-block rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                  {u.tag}
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{u.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Footer */}
      <section className="border-t px-6" style={{ borderColor: 'var(--border-primary)' }}>
        <div ref={c.ref} className={`lp-section ${c.show ? 'in' : ''} mx-auto max-w-2xl py-24 text-center`}>
          <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">Ready to build?</h2>
          <p className="mb-8 text-base" style={{ color: 'var(--text-secondary)' }}>
            No credit card, no subscription, no BS. Just your API key and an idea.
          </p>
          <Link to="/setup" className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: 'var(--accent)' }}>
            Get started free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </Link>
        </div>
        <footer className="flex flex-col items-center justify-between gap-4 border-t py-8 sm:flex-row" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded text-xs text-white" style={{ background: 'var(--accent)' }}>F</div>
            <span className="text-xs font-semibold text-white">Foundry</span>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            <a href="https://github.com/Malikiyaw/Foundry" className="hover:text-white">GitHub</a>
            <Link to="/gallery" className="hover:text-white">Gallery</Link>
            <Link to="/setup" className="hover:text-white">Get started</Link>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>MIT License</p>
        </footer>
      </section>
    </div>
  );
}
