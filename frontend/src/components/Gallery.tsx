import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from './shared/Spinner';

interface GalleryProject {
  id: string; name: string; description: string;
  ownerName: string; thumbnail: string | null;
  tags: string[]; stars: number; isPublic: boolean;
  createdAt: string; playCount: number;
}

export default function Gallery() {
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();

  const ALL_TAGS = ['platformer', 'puzzle', 'rpg', 'shooter', 'racing', 'strategy', 'action', 'adventure', 'simulation', 'horror', 'retro', '3d', 'multiplayer', 'educational'];

  useEffect(() => {
    fetch('/api/projects?public=true&limit=50')
      .then((r) => r.json())
      .then((data) => { setProjects(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    if (selectedTag && !p.tags?.includes(selectedTag)) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleFork = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/fork`, {
        method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('foundry_token')}` },
      });
      if (res.ok) {
        const project = await res.json();
        navigate(`/workspace/${project.id}`);
      }
    } catch {}
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Game Gallery</h1>
        <p className="text-sm text-[#858585]">Explore games built with Foundry. Fork any project to make it your own.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="max-w-sm rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-1.5 text-sm text-white outline-none focus:border-[#0078d4] placeholder-[#858585]"
          placeholder="Search games..."
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-1 flex-wrap">
          <button
            className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${!selectedTag ? 'bg-[#0078d4] text-white' : 'bg-[#3c3c3c] text-[#858585] hover:text-white'}`}
            onClick={() => setSelectedTag(null)}
          >All</button>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              className={`px-2.5 py-1 text-[10px] rounded-full capitalize transition-colors ${selectedTag === tag ? 'bg-[#0078d4] text-white' : 'bg-[#3c3c3c] text-[#858585] hover:text-white'}`}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            >{tag}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-4xl mb-3">🎮</div>
          <p className="text-sm text-[#858585]">No games found</p>
          <p className="text-xs text-[#858585] mt-1">Try a different search or tag filter</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <div key={project.id} className="group rounded-lg border border-[#3c3c3c] bg-[#252526] overflow-hidden hover:border-[#0078d4] transition-colors">
              <div className="aspect-video bg-gradient-to-br from-[#1e1e1e] to-[#252526] flex items-center justify-center overflow-hidden">
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt={project.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-4xl">🎮</div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{project.name}</h3>
                    <p className="text-[10px] text-[#858585] mt-0.5">by {project.ownerName || 'Anonymous'}</p>
                    {project.description && (
                      <p className="text-[11px] text-[#858585] mt-1 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <button
                    className="ml-2 shrink-0 rounded bg-[#0078d4] px-2.5 py-1 text-[10px] text-white hover:bg-[#1e8ae6] transition-colors opacity-0 group-hover:opacity-100"
                    onClick={() => handleFork(project.id)}
                  >
                    Fork
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {project.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded bg-[#3c3c3c] px-1.5 py-0.5 text-[9px] text-[#858585] capitalize">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#858585]">
                    <span>⭐ {project.stars || 0}</span>
                    <span>▶ {project.playCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
