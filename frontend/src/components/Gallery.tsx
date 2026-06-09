import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Spinner } from './shared/Spinner';

interface GalleryProject {
  id: string; name: string; description: string;
  ownerName: string; thumbnail: string | null;
  tags: string[]; stars: number; isPublic: boolean;
  createdAt: string; playCount: number;
}

const ALL_TAGS = ['platformer', 'puzzle', 'rpg', 'shooter', 'racing', 'strategy', 'action', 'adventure', 'simulation', 'horror', 'retro'];

export default function Gallery() {
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/projects?public=true&limit=50')
      .then((r) => r.json())
      .then((data) => { setProjects(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    if (selectedTag && !p.tags?.includes(selectedTag)) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleFork = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/fork`, {
        method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('foundry_token')}` },
      });
      if (res.ok) { const p = await res.json(); navigate(`/workspace/${p.id}`); }
    } catch {}
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <nav className="glass sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--gradient-1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            </div>
            <span className="font-bold text-white">Foundry</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost !py-1.5 !px-3 !text-xs">Sign In</Link>
            <Link to="/register" className="btn-primary !py-1.5 !px-3 !text-xs">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Game Gallery</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Explore games built with Foundry. Fork any project to make it your own.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input className="input-field !pl-10" placeholder="Search games..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              className="rounded-full px-3 py-1.5 text-[10px] font-medium transition-all"
              style={{
                background: !selectedTag ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: !selectedTag ? 'white' : 'var(--text-muted)',
              }}
              onClick={() => setSelectedTag(null)}
            >All</button>
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                className="rounded-full px-3 py-1.5 text-[10px] font-medium capitalize transition-all"
                style={{
                  background: selectedTag === tag ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: selectedTag === tag ? 'white' : 'var(--text-muted)',
                }}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              >{tag}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-20" style={{ border: '1px dashed var(--border-primary)' }}>
            <div className="mb-4 text-5xl">🎮</div>
            <p className="text-lg font-semibold text-white mb-1">No games found</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Try a different search or tag</p>
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {filtered.map((project, i) => (
              <div
                key={project.id}
                className="card hover-lift group mb-4 break-inside-avoid cursor-pointer"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => handleFork(project.id)}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden mb-3" style={{ background: 'var(--bg-tertiary)' }}>
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">🎮</div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <span className="btn-primary !rounded-full !py-2 !px-4 text-xs">Fork & Play</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white truncate mb-1">{project.name}</h3>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>by {project.ownerName || 'Anonymous'}</p>
                {project.description && (
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {project.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>⭐ {project.stars || 0}</span>
                    <span>▶ {project.playCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
