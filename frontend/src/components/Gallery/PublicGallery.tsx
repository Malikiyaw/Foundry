import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface GalleryProject {
  id: string;
  title: string;
  template: string;
  gameEngine: string;
  user: { displayName: string };
  _count: { files: number; remixes: number };
  createdAt: string;
}

export default function PublicGallery() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gallery?limit=30')
      .then((res) => setProjects(res.data.projects))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemix = async (id: string) => {
    try {
      const { data } = await api.post(`/projects/${id}/fork`);
      navigate(`/project/${data.id}`);
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#1e1e1e]">
      <header className="flex items-center justify-between border-b border-[#3c3c3c] px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-[#0078d4] cursor-pointer" onClick={() => navigate('/projects')}>Foundry</span>
          <span className="text-sm text-[#858585]">/ Gallery</span>
        </div>
        <button onClick={() => navigate('/projects')} className="rounded px-3 py-1 text-sm text-[#0078d4] hover:bg-[#2a2d2e]">My Projects</button>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <h1 className="mb-6 text-xl font-semibold text-[#cccccc]">Community Gallery</h1>

        {loading ? (
          <div className="text-center text-[#858585]">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="mt-12 text-center text-[#858585]">No public games yet. Be the first to publish!</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-lg border border-[#3c3c3c] bg-[#252526] p-4 hover:border-[#0078d4] cursor-pointer"
                onClick={() => handleRemix(project.id)}
              >
                <div className="mb-2 aspect-video rounded bg-[#2d2d2d] flex items-center justify-center text-3xl">
                  🎮
                </div>
                <h3 className="font-medium text-[#cccccc]">{project.title}</h3>
                <p className="text-xs text-[#858585] capitalize">{project.template} • {project.gameEngine}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-[#858585]">
                  <span>by {project.user?.displayName || 'Anonymous'}</span>
                  <div className="flex gap-2">
                    <span>{project._count?.files || 0} files</span>
                    <span>{project._count?.remixes || 0} remixes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
