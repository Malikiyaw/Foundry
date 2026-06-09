import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/index';
import { fetchProjects, createProject, deleteProject } from '../store/projectsSlice';
import { Spinner } from './shared/Spinner';

export default function ProjectList() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading } = useSelector((s: RootState) => s.projects);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [gameType, setGameType] = useState('platformer');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'updated' | 'created' | 'name'>('updated');

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const result = await dispatch(createProject({ name, description, gameType })).unwrap();
      navigate(`/workspace/${result.id}`);
    } catch {}
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this project permanently?')) dispatch(deleteProject(id));
  };

  const filtered = items
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      return new Date(b[sort === 'created' ? 'createdAt' : 'updatedAt']).getTime() - new Date(a[sort === 'created' ? 'createdAt' : 'updatedAt']).getTime();
    });

  if (loading && items.length === 0) return <div className="flex h-96 items-center justify-center"><Spinner size="lg" text="Loading projects..." /></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Projects</h1>
          <p className="text-sm text-[#858585] mt-1">{items.length} project{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="flex items-center gap-1.5 rounded bg-[#0078d4] px-4 py-2 text-sm text-white hover:bg-[#1e8ae6] transition-colors" onClick={() => setShowNew(true)}>
          <span>+</span> New Project
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input className="max-w-xs rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-1.5 text-sm text-white outline-none focus:border-[#0078d4] placeholder-[#858585]" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#858585]">Sort:</span>
          <select className="rounded border border-[#3c3c3c] bg-[#3c3c3c] px-2 py-1 text-xs text-white outline-none" value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="updated">Last Updated</option>
            <option value="created">Created</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#3c3c3c] py-16">
          <div className="text-4xl mb-3">🎮</div>
          <p className="text-sm text-[#858585] mb-1">{search ? 'No matching projects' : 'No projects yet'}</p>
          <p className="text-xs text-[#858585] mb-4">{search ? 'Try a different search' : 'Create your first project to get started'}</p>
          {!search && <button className="rounded bg-[#0078d4] px-4 py-2 text-sm text-white hover:bg-[#1e8ae6] transition-colors" onClick={() => setShowNew(true)}>Create Project</button>}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <div key={project.id} className="group rounded-lg border border-[#3c3c3c] bg-[#252526] p-4 hover:border-[#0078d4] transition-all cursor-pointer" onClick={() => navigate(`/workspace/${project.id}`)}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-white truncate">{project.name}</h3>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${project.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-[#3c3c3c] text-[#858585]'}`}>
                  {project.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              {project.description && <p className="text-[11px] text-[#858585] mb-3 line-clamp-2">{project.description}</p>}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {project.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded bg-[#3c3c3c] px-1.5 py-0.5 text-[9px] text-[#858585] capitalize">{tag}</span>
                  ))}
                  {project.type && <span className="rounded bg-[#3c3c3c] px-1.5 py-0.5 text-[9px] text-blue-400 capitalize">{project.type}</span>}
                </div>
                <span className="text-[10px] text-[#858585]">{new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
              <button className="mt-2 w-full rounded px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="w-full max-w-md rounded-lg border border-[#3c3c3c] bg-[#252526] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-[#858585] mb-1">Project Name</label>
                <input className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-1.5 text-sm text-white outline-none focus:border-[#0078d4] placeholder-[#858585]" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Game" required autoFocus />
              </div>
              <div>
                <label className="block text-xs text-[#858585] mb-1">Description (optional)</label>
                <textarea className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-1.5 text-sm text-white outline-none focus:border-[#0078d4] placeholder-[#858585] resize-none" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A platformer game about..." />
              </div>
              <div>
                <label className="block text-xs text-[#858585] mb-1">Game Type</label>
                <select className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-1.5 text-sm text-white outline-none" value={gameType} onChange={(e) => setGameType(e.target.value)}>
                  <option value="platformer">Platformer</option>
                  <option value="puzzle">Puzzle</option>
                  <option value="rpg">RPG</option>
                  <option value="shooter">Shooter</option>
                  <option value="racing">Racing</option>
                  <option value="strategy">Strategy</option>
                  <option value="action">Action</option>
                  <option value="adventure">Adventure</option>
                  <option value="simulation">Simulation</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="rounded px-4 py-1.5 text-sm text-[#cccccc] hover:bg-[#3c3c3c] transition-colors" onClick={() => setShowNew(false)}>Cancel</button>
                <button type="submit" className="rounded bg-[#0078d4] px-4 py-1.5 text-sm text-white hover:bg-[#1e8ae6] transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
