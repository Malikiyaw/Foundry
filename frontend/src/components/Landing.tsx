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

const AGENTS = [
  { label: 'Design', color: '#6c5ce7', desc: 'Game design doc' },
  { label: 'Code', color: '#7c6df7', desc: 'Full source code' },
  { label: 'Assets', color: '#00b4d8', desc: 'Sprite generation' },
  { label: 'Sound', color: '#14b8a6', desc: 'Audio synthesis' },
  { label: 'QA', color: '#ec4899', desc: 'Playtest & fix' },
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

const QUOTES = [
  { text: 'I described a platformer and got a fully playable game in 90 seconds. The code quality is shockingly good — better than what I would have written myself.', name: 'Riley Chen', role: 'Indie developer' },
  { text: 'Finally, an AI tool that respects my API keys and my wallet. No subscription, no vendor lock-in. Just paste your keys and ship.', name: 'Jordan Taylor', role: 'Solo founder' },
  { text: 'The multi-agent pipeline is the killer feature. Each agent specializes in one thing — design, code, assets, QA — and the output is coherent.', name: 'Morgan Lee', role: 'Creative technologist' },
];

const PROBLEM_SOLUTIONS = [
  { problem: 'Building a game from scratch takes weeks.', solution: 'Describe your game in plain English. Five AI agents generate the design doc, source code, sprites, sound effects, and QA results in under 90 seconds.' },
  { problem: 'Most AI tools lock you into a subscription.', solution: 'Bring your own API keys from OpenAI, Anthropic, Google, Replicate, and more. All data is encrypted locally with AES-256-GCM. You pay only for what you use.' },
  { problem: 'Generated code is hard to tweak and deploy.', solution: 'Edit any file in the Monaco-powered workspace, preview changes live in an iframe, then export as a zip or deploy to any static host. No build step required.' },
  { problem: 'Game jams and team projects need real-time collaboration.', solution: 'Cursor sync, shared file editing, and live presence indicators let your team work together — all through the browser, no setup needed.' },
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
  const p = useOnScreen(0.2);
  const f = useOnScreen();
  const q = useOnScreen();
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

      {/* ───── HERO ───── */}
      <section className="relative flex min-h-[90vh] items-center justify-center px-6 pt-24">
        <div ref={h.ref} className={`lp-section ${h.show ? 'in' : ''} mx-auto max-w-5xl text-center`}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-medium" style={{ borderColor: 'rgba(108,92,231,0.25)', color: 'var(--accent)' }}>
            Open source &middot; BYOK &middot; Self-hostable
          </div>
          <h1 className="mb-5 text-[clamp(2.5rem,5.5vw,4.5rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
            Build games with
            <br />
            <span className="text-gradient">AI superpowers</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Five AI agents design, code, sprite, and playtest your game from a single prompt.
            You own your API keys. No subscription, no lock-in.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/setup" className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold text-white" style={{ background: 'var(--accent)' }}>
              Start building free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
            <a href="https://github.com/Malikiyaw/Foundry" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-[15px] font-medium" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              View on GitHub
            </a>
            <Link to="/setup" className="inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-[15px] font-medium" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
              Try Demo
            </Link>
          </div>

          {/* Workspace mockup */}
          <div className="mx-auto mt-16 max-w-4xl lp-mockup">
            <div className="lp-mockup-bar">
              <div className="lp-mockup-dot" style={{ background: '#ff5f57' }} />
              <div className="lp-mockup-dot" style={{ background: '#febc2e' }} />
              <div className="lp-mockup-dot" style={{ background: '#28c840' }} />
              <span className="ml-3 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Foundry Workspace</span>
            </div>
            <div className="lp-mockup-body">
              {/* Sidebar */}
              <div className="lp-mockup-sidebar">
                <div className="mb-3 text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Explorer</div>
                {[
                  { name: 'src', indent: false, isDir: true },
                  { name: 'index.html', indent: true, isDir: false },
                  { name: 'game.js', indent: true, isDir: false },
                  { name: 'style.css', indent: true, isDir: false },
                  { name: 'scenes', indent: false, isDir: true },
                  { name: 'Boot.js', indent: true, isDir: false },
                  { name: 'Main.js', indent: true, isDir: false },
                  { name: 'assets', indent: false, isDir: true },
                  { name: 'player.png', indent: true, isDir: false },
                  { name: 'coin.png', indent: true, isDir: false },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 py-0.5" style={{ paddingLeft: f.indent ? 16 : 0, color: f.indent ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                    <span className="text-[9px]">{f.isDir ? '\u25B6' : '\u2022'}</span>
                    <span className="truncate">{f.name}</span>
                  </div>
                ))}
              </div>
              {/* Editor */}
              <div className="lp-mockup-editor">
                <div className="mb-3 flex gap-3 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="border-b-2 pb-0.5" style={{ borderColor: 'var(--accent)', color: 'var(--text-primary)' }}>game.js</span>
                  <span>style.css</span>
                  <span>index.html</span>
                </div>
                <pre style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: 11 }}>
                  {'const config = {'}
                  {'  type: Phaser.AUTO,'}
                  {'  width: 800,'}
                  {'  height: 600,'}
                  {'  physics: { default: "arcade" },'}
                  {'  scene: [Boot, Game],'}
                  {'};'}
                </pre>
              </div>
              {/* Preview */}
              <div className="lp-mockup-preview">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#28c840' }} />
                  <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Live Preview</span>
                </div>
                <div className="aspect-[4/3] rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)' }}>
                  <div className="text-center">
                    <div className="mb-1 text-2xl">&#127918;</div>
                    <div className="text-[10px]" style={{ color: 'var(--accent-green)' }}>Running</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── TRUST BAR ───── */}
      <section className="border-y px-6 py-8" style={{ borderColor: 'var(--border-primary)' }}>
        <div ref={h.ref} className={`lp-section ${h.show ? 'in' : ''} mx-auto max-w-4xl`}>
          <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Works with your AI providers</p>
          <div className="lp-trust">
            {PROVIDERS.map((p) => (
              <div key={p.name} className="lp-trust-pill">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PIPELINE / HOW IT WORKS ───── */}
      <section className="px-6 py-24 lg:py-32">
        <div ref={p.ref} className={`lp-section ${p.show ? 'in' : ''} mx-auto max-w-5xl`}>
          <div className="mb-16 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>How it works</p>
            <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-bold leading-tight text-white">One prompt, five AI agents</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm" style={{ color: 'var(--text-secondary)' }}>Each agent specializes in one task. Together they build your entire game in under 90 seconds.</p>
          </div>
          <div className="lp-pipe">
            {AGENTS.map((a, i) => (
              <>
                <div className="lp-pipe-node">
                  <div className="lp-pipe-circle" style={{ borderColor: `${a.color}40`, background: `${a.color}12`, color: a.color }}>
                    {a.label[0]}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-white">{a.label}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{a.desc}</div>
                  </div>
                </div>
                {i < AGENTS.length - 1 && (
                  <div className="lp-pipe-line" style={{ background: `linear-gradient(to right, ${AGENTS[i].color}40, ${AGENTS[i + 1].color}40)` }} />
                )}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FEATURES (PROBLEM → SOLUTION) ───── */}
      <section className="border-y px-6 py-24 lg:py-32" style={{ borderColor: 'var(--border-primary)' }}>
        <div ref={f.ref} className={`lp-section ${f.show ? 'in' : ''} mx-auto max-w-5xl`}>
          <div className="mb-16 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Why Foundry</p>
            <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-bold leading-tight text-white">Built for developers who ship</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {PROBLEM_SOLUTIONS.map((item, i) => (
              <div key={i} className="rounded-xl border p-6 lg:p-8" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Problem</div>
                <p className="mb-4 text-sm font-medium text-white">{item.problem}</p>
                <div className="mb-3 h-px w-12" style={{ background: 'var(--accent)' }} />
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Solution</div>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── SOCIAL PROOF ───── */}
      <section className="px-6 py-24 lg:py-32">
        <div ref={q.ref} className={`lp-section ${q.show ? 'in' : ''} mx-auto max-w-5xl`}>
          <div className="mb-16 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Testimonials</p>
            <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-bold leading-tight text-white">Loved by developers</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {QUOTES.map((q, i) => (
              <div key={i} className="flex flex-col rounded-xl border p-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                <div className="mb-3 text-lg leading-none" style={{ color: 'var(--accent)' }}>&ldquo;</div>
                <p className="mb-5 flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{q.text}</p>
                <div className="flex items-center gap-3 border-t pt-4" style={{ borderColor: 'var(--border-primary)' }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>
                    {q.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{q.name}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{q.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="px-6">
        <div ref={c.ref} className={`lp-section ${c.show ? 'in' : ''} mx-auto max-w-5xl`}>
          <div className="rounded-2xl border px-8 py-20 text-center lg:py-24" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <h2 className="mb-3 text-[clamp(1.75rem,3vw,2.75rem)] font-bold leading-tight text-white">Ready to build your first game?</h2>
            <p className="mx-auto mb-10 max-w-md text-sm" style={{ color: 'var(--text-secondary)' }}>
              Paste your API key, describe your game, and ship in under two minutes. No credit card required.
            </p>
            <Link to="/setup" className="inline-flex items-center gap-2 rounded-full px-10 py-3.5 text-[15px] font-semibold text-white" style={{ background: 'var(--accent)' }}>
              Get started free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="mx-auto mt-16 flex max-w-5xl flex-col items-center justify-between gap-4 border-t px-6 py-8 sm:flex-row" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded text-[11px] text-white" style={{ background: 'var(--accent)' }}>F</div>
          <span className="text-xs font-semibold text-white">Foundry</span>
        </div>
        <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          <a href="https://github.com/Malikiyaw/Foundry" className="hover:text-white">GitHub</a>
          <Link to="/gallery" className="hover:text-white">Gallery</Link>
          <Link to="/setup" className="hover:text-white">Get started</Link>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Open source under MIT License</p>
      </footer>
    </div>
  );
}
