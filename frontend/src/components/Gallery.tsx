import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Spinner } from './shared/Spinner';
import { db } from '../services/db';
import { generateId, nowISO } from '../services/db';

const ALL_TAGS = ['platformer', 'puzzle', 'rpg', 'shooter', 'racing', 'strategy', 'action', 'adventure', 'simulation', 'horror', 'retro'];

export default function Gallery() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    db.projects.orderBy('updatedAt').reverse().toArray().then((data) => {
      setProjects(data); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    if (selectedTag && !p.tags?.includes(selectedTag)) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleOpen = (id: string) => navigate(`/workspace/${id}`);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <nav className="sticky top-0 z-50" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            <span className="text-sm font-medium text-white">Foundry</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/setup" className="btn-ghost !py-1.5 !px-3 !text-xs">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-normal text-white mb-1" style={{ fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: '-0.02em' }}>My Projects</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Projects are stored locally in your browser</p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input className="input-field !pl-9" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button className="rounded px-3 py-1.5 text-[10px] font-medium transition-all" style={{ background: !selectedTag ? 'var(--accent)' : 'var(--bg-tertiary)', color: !selectedTag ? 'white' : 'var(--text-muted)' }} onClick={() => setSelectedTag(null)}>All</button>
            {ALL_TAGS.map((tag) => (
              <button key={tag} className="rounded px-3 py-1.5 text-[10px] font-medium capitalize transition-all" style={{ background: selectedTag === tag ? 'var(--accent)' : 'var(--bg-tertiary)', color: selectedTag === tag ? 'white' : 'var(--text-muted)' }} onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}>{tag}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20" style={{ border: '1px dashed var(--border-primary)', borderRadius: '8px' }}>
            <p className="text-sm font-medium text-white mb-1">{search ? 'No matching projects' : 'No projects yet'}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{search ? 'Try a different search' : 'Create your first project to see it here'}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <div key={project.id} className="card cursor-pointer" onClick={() => handleOpen(project.id)}>
                <div className="relative aspect-video rounded mb-3 flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Preview</span>
                </div>
                <h3 className="text-sm font-medium text-white truncate mb-1">{project.name}</h3>
                {project.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {project.gameType && <span className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{project.gameType}</span>}
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
