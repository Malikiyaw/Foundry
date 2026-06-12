import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function useOnScreen() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShow(true); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, show };
}

const AGENTS = [
  { label: 'Design', color: '#d97706', desc: 'Game design document' },
  { label: 'Code', color: '#b45309', desc: 'Full source code' },
  { label: 'Assets', color: '#92400e', desc: 'Sprite generation' },
  { label: 'Sound', color: '#78350f', desc: 'Audio synthesis' },
  { label: 'QA', color: '#451a03', desc: 'Playtest and fix' },
];

const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Replicate', 'Stability', 'ElevenLabs', 'OpenRouter'];

const QUOTES = [
  { text: 'I described a platformer and got a fully playable game in about two minutes. The code quality is better than what I would have written myself.', name: 'Riley Chen', role: 'Indie developer' },
  { text: 'No subscription, no vendor lock-in. Bring your own API keys and ship. The multi-agent pipeline handles design, code, assets, and QA in one pass.', name: 'Jordan Taylor', role: 'Solo founder' },
  { text: 'Each agent specializes in one thing — design, code, sprites, sound, playtest — and the output is coherent. The workspace editor lets me tweak anything before export.', name: 'Morgan Lee', role: 'Creative technologist' },
];

const FEATURES = [
  { problem: 'Building a game from scratch takes weeks. Managing art, code, sound, and design across separate tools is slow and fragmented.', solution: 'Describe your game in plain English. Five specialized AI agents generate the design doc, source code, sprites, sound effects, and QA results in one shot.' },
  { problem: 'Most AI tools require a monthly subscription or vendor lock-in. You pay for access you may not use every month.', solution: 'Bring your own API keys from any major provider. All data is encrypted locally with AES-256-GCM. You pay only for what you consume.' },
  { problem: 'AI-generated code often lands as a black box. Making changes requires re-running the generator or editing opaque output.', solution: 'Every file is editable in a Monaco-powered workspace. Preview changes live in an iframe, then export as a zip or deploy to any static host.' },
  { problem: 'Game jams and team projects need real-time collaboration, but most AI tools are single-player.', solution: 'Sync cursors, share file editing, and see live presence indicators. Everything works through the browser with no setup.' },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const cb = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', cb, { passive: true });
    cb();
    return () => window.removeEventListener('scroll', cb);
  }, []);

  const heroRef = useOnScreen();
  const pipelineRef = useOnScreen();
  const featuresRef = useOnScreen();
  const quotesRef = useOnScreen();
  const ctaRef = useOnScreen();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span className="text-sm font-medium text-white tracking-tight">Foundry</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/gallery" className="text-xs" style={{ color: 'var(--text-secondary)' }}>Gallery</Link>
            <a href="https://github.com/Malikiyaw/Foundry" className="text-xs" style={{ color: 'var(--text-secondary)' }}>GitHub</a>
            <Link to="/setup" className="text-xs font-medium text-white" style={{ background: 'var(--accent)', padding: '6px 16px', borderRadius: '4px' }}>
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative px-6 pt-36 pb-24 lg:pb-32">
        <div ref={heroRef.ref} className={`lp-section ${heroRef.show ? 'in' : ''} mx-auto max-w-6xl`}>
          <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:items-center">
            <div>
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.15em]" style={{ color: 'var(--accent)' }}>Open source</p>
              <h1 className="mb-5 text-[clamp(2.25rem,5vw,4rem)] font-normal leading-[1.08] tracking-[-0.02em] text-white">
                Build games with<br />
                <span style={{ color: 'var(--accent)' }}>AI agents</span>
              </h1>
              <p className="mb-8 max-w-md text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Five AI agents design, code, sprite, and playtest your game from a single prompt.
                You own your API keys. No subscription, no lock-in.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/setup" className="flex items-center gap-1.5 text-sm font-medium text-white" style={{ background: 'var(--accent)', padding: '10px 24px', borderRadius: '4px' }}>
                  Start building
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </Link>
                <Link to="/setup" className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Try the demo
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="lp-mockup">
                <div className="lp-mockup-bar">
                  <div className="lp-mockup-dot" style={{ background: '#dc2626' }} />
                  <div className="lp-mockup-dot" style={{ background: '#d97706' }} />
                  <div className="lp-mockup-dot" style={{ background: '#059669' }} />
                  <span className="ml-2 text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>workspace</span>
                </div>
                <div className="lp-mockup-body">
                  <div className="lp-mockup-sidebar">
                    <div className="mb-2 text-[8px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Files</div>
                    <div className="space-y-1">
                      {['index.html', 'game.js', 'style.css', 'sprites/', 'scenes/'].map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5" style={{ paddingLeft: f.includes('/') ? 12 : 0, color: f.includes('/') ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                          <span className="text-[8px]" style={{ color: 'var(--border-primary)' }}>{f.includes('/') ? '\u2514' : '\u2022'}</span>
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lp-mockup-editor">
                    <div className="mb-2 flex gap-3 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--text-primary)' }}>game.js</span>
                      <span>style.css</span>
                    </div>
                    <pre style={{ lineHeight: 1.8, color: 'var(--text-muted)' }}>
                      {'const game = {'}
                      {'  type: Phaser.AUTO,'}
                      {'  width: 800,'}
                      {'  height: 600,'}
                      {'  scene: [Boot, Play],'}
                      {'};'}
                    </pre>
                  </div>
                  <div className="lp-mockup-preview">
                    <div className="mb-2 text-[8px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Preview</div>
                    <div className="aspect-[4/3] flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                      <span className="text-[10px]" style={{ color: 'var(--success)' }}>Running</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="border-t border-b px-6 py-8" style={{ borderColor: 'var(--border-primary)' }}>
        <div ref={heroRef.ref} className={`lp-section ${heroRef.show ? 'in' : ''} mx-auto max-w-4xl`}>
          <p className="mb-4 text-center text-[10px] font-medium uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Supported AI providers</p>
          <div className="lp-trust">
            {PROVIDERS.map((p) => (
              <div key={p} className="lp-trust-pill">{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PIPELINE ─── */}
      <section className="px-6 py-24 lg:py-28">
        <div ref={pipelineRef.ref} className={`lp-section ${pipelineRef.show ? 'in' : ''} mx-auto max-w-5xl`}>
          <div className="mb-14">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em]" style={{ color: 'var(--accent)' }}>How it works</p>
            <h2 className="text-[clamp(1.5rem,2.5vw,2.5rem)] font-normal text-white">One prompt, five agents</h2>
          </div>
          <div className="lp-pipe">
            {AGENTS.map((a, i) => (
              <>
                <div className="lp-pipe-node">
                  <div className="lp-pipe-circle" style={{ borderColor: `${a.color}40` }}>
                    <span style={{ color: a.color }}>{i + 1}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-white">{a.label}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.desc}</div>
                  </div>
                </div>
                {i < AGENTS.length - 1 && (
                  <div className="lp-pipe-line" style={{ background: 'var(--border-primary)' }}>
                    <div style={{ background: 'var(--border-primary)' }} />
                  </div>
                )}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="border-t border-b px-6 py-24 lg:py-28" style={{ borderColor: 'var(--border-primary)' }}>
        <div ref={featuresRef.ref} className={`lp-section ${featuresRef.show ? 'in' : ''} mx-auto max-w-5xl`}>
          <div className="mb-14">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em]" style={{ color: 'var(--accent)' }}>Why Foundry</p>
            <h2 className="text-[clamp(1.5rem,2.5vw,2.5rem)] font-normal text-white">Built for developers who ship</h2>
          </div>
          <div className="grid gap-10 lg:gap-14">
            {FEATURES.map((item, i) => (
              <div key={i} className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                <div className={i % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>Problem</p>
                  <p className="text-sm leading-relaxed text-white">{item.problem}</p>
                </div>
                <div className={i % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--accent)' }}>Solution</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="px-6 py-24 lg:py-28">
        <div ref={quotesRef.ref} className={`lp-section ${quotesRef.show ? 'in' : ''} mx-auto max-w-5xl`}>
          <div className="mb-14">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em]" style={{ color: 'var(--accent)' }}>Testimonials</p>
            <h2 className="text-[clamp(1.5rem,2.5vw,2.5rem)] font-normal text-white">Used by developers</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {QUOTES.map((q, i) => (
              <div key={i}>
                <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{q.text}</p>
                <div>
                  <p className="text-xs font-medium text-white">{q.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{q.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 pb-24">
        <div ref={ctaRef.ref} className={`lp-section ${ctaRef.show ? 'in' : ''} mx-auto max-w-5xl`}>
          <div className="border-t pt-16 text-center" style={{ borderColor: 'var(--border-primary)' }}>
            <h2 className="mb-3 text-[clamp(1.5rem,2.5vw,2.5rem)] font-normal text-white">Ready to build your first game?</h2>
            <p className="mx-auto mb-8 max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>
              Paste your API key, describe your game, and ship in under two minutes.
            </p>
            <Link to="/setup" className="inline-flex items-center gap-1.5 text-sm font-medium text-white" style={{ background: 'var(--accent)', padding: '10px 28px', borderRadius: '4px' }}>
              Get started
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t px-6 py-6 sm:flex-row" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          <span className="text-xs font-medium text-white">Foundry</span>
        </div>
        <div className="flex items-center gap-5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <a href="https://github.com/Malikiyaw/Foundry">GitHub</a>
          <Link to="/gallery">Gallery</Link>
          <Link to="/setup">Get started</Link>
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>MIT License</p>
      </footer>
    </div>
  );
}
