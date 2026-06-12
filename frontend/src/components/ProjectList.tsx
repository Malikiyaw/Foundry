import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/index';
import { fetchProjects, createProject, deleteProject } from '../store/projectsSlice';
import { logout } from '../store/authSlice';
import { Spinner } from './shared/Spinner';

const GAME_TYPES = ['platformer', 'puzzle', 'rpg', 'shooter', 'racing', 'strategy', 'action', 'adventure', 'simulation', 'custom'];

export default function ProjectList() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading } = useSelector((s: RootState) => s.projects);
  const { isDemo } = useSelector((s: RootState) => s.auth);
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

  const filtered = items
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      return new Date(b[sort === 'created' ? 'createdAt' : 'updatedAt']).getTime() - new Date(a[sort === 'created' ? 'createdAt' : 'updatedAt']).getTime();
    });

  if (loading && items.length === 0) return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <Spinner size="lg" text="Loading projects..." />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {isDemo && (
        <div className="flex items-center justify-between px-6 py-2 text-xs" style={{ background: 'var(--accent-subtle)', borderBottom: '1px solid var(--border-primary)' }}>
          <span style={{ color: 'var(--accent)' }}>Demo mode — changes are not saved permanently.</span>
          <button
            className="rounded px-3 py-1 text-[10px] font-medium text-white"
            style={{ background: 'var(--accent)' }}
            onClick={() => { dispatch(logout()); navigate('/'); }}
          >
            Exit demo
          </button>
        </div>
      )}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-normal text-white mb-1" style={{ fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: '-0.02em' }}>Projects</h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {items.length} project{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="btn-primary flex items-center gap-1.5 text-xs" onClick={() => setShowNew(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: -1 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New project
          </button>
        </div>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              className="input-field !pl-9"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field !w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
          >
            <option value="updated">Last updated</option>
            <option value="created">Created</option>
            <option value="name">Name</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20" style={{ border: '1px dashed var(--border-primary)', borderRadius: '8px' }}>
            <h3 className="text-sm font-medium text-white mb-1">{search ? 'No matching projects' : 'No projects yet'}</h3>
            <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>{search ? 'Try a different search' : 'Create your first game project'}</p>
            {!search && (
              <button className="btn-primary text-xs" onClick={() => setShowNew(true)}>Create project</button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="card cursor-pointer"
                onClick={() => navigate(`/workspace/${project.id}`)}
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{project.type}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {project.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-white mb-1 truncate">{project.name}</h3>
                {project.description && (
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {project.tags?.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="mt-3 text-[10px]"
                  style={{ color: 'var(--danger)' }}
                  onClick={(e) => { e.stopPropagation(); if (confirm('Delete this project?')) dispatch(deleteProject(project.id)); }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowNew(false)}>
          <div className="w-full max-w-md animate-scaleIn" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-sm font-medium text-white">New project</h2>
              <button className="icon-btn" onClick={() => setShowNew(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs" style={{ color: 'var(--text-secondary)' }}>Project name</label>
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Game" required autoFocus />
              </div>
              <div>
                <label className="mb-1.5 block text-xs" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea className="input-field !resize-none" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A platformer about..." />
              </div>
              <div>
                <label className="mb-1.5 block text-xs" style={{ color: 'var(--text-secondary)' }}>Game type</label>
                <div className="flex flex-wrap gap-1.5">
                  {GAME_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`px-3 py-1.5 text-[10px] rounded transition-colors ${
                        gameType === type ? 'text-white' : ''
                      }`}
                      style={{
                        background: gameType === type ? 'var(--accent)' : 'var(--bg-tertiary)',
                        color: gameType === type ? 'white' : 'var(--text-muted)',
                      }}
                      onClick={() => setGameType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-ghost text-xs" onClick={() => setShowNew(false)}>Cancel</button>
                <button type="submit" className="btn-primary text-xs">Create project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
