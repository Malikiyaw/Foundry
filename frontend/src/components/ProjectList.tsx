import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/index';
import { fetchProjects, createProject, deleteProject } from '../store/projectsSlice';
import { logout } from '../store/authSlice';
import { Spinner } from './shared/Spinner';

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

  const GAME_ICONS: Record<string, string> = {
    platformer: '🏃', puzzle: '🧩', rpg: '⚔️', shooter: '🔫', racing: '🏎️',
    strategy: '♟️', action: '💥', adventure: '🗺️', simulation: '🏗️', custom: '🎮',
  };

  if (loading && items.length === 0) return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <Spinner size="lg" text="Loading projects..." />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {isDemo && (
        <div className="flex items-center justify-between gap-3 px-6 py-2.5 text-sm" style={{ background: 'var(--accent-subtle)', borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-2">
            <span className="text-base">🔍</span>
            <span style={{ color: 'var(--accent)' }}>Demo mode — explore freely. Nothing is saved permanently.</span>
          </div>
          <button
            className="rounded-full px-4 py-1 text-xs font-medium text-white transition-opacity"
            style={{ background: 'var(--accent)' }}
            onClick={() => { dispatch(logout()); navigate('/'); }}
          >
            Exit Demo
          </button>
        </div>
      )}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {items.length} project{items.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowNew(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Project
          </button>
        </div>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              className="input-field !pl-10"
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
            <option value="updated">Last Updated</option>
            <option value="created">Created</option>
            <option value="name">Name</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-20" style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border-primary)' }}>
            <div className="mb-4 text-5xl">{search ? '🔍' : '🎮'}</div>
            <h3 className="text-lg font-semibold text-white mb-1">{search ? 'No matching projects' : 'No projects yet'}</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{search ? 'Try a different search' : 'Create your first game project'}</p>
            {!search && (
              <button className="btn-primary" onClick={() => setShowNew(true)}>Create Project</button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, i) => (
              <div
                key={project.id}
                className="card hover-lift cursor-pointer group relative overflow-hidden"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => navigate(`/workspace/${project.id}`)}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'var(--gradient-mesh)' }} />
                <div className="relative">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: 'var(--bg-tertiary)' }}>
                      {GAME_ICONS[project.type] || '🎮'}
                    </div>
                    <span className="badge" style={{
                      background: project.isPublic ? 'var(--success-subtle)' : 'var(--bg-tertiary)',
                      color: project.isPublic ? 'var(--success)' : 'var(--text-muted)',
                    }}>
                      {project.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1 truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {project.type && (
                        <span className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                          {project.type}
                        </span>
                      )}
                      {project.tags?.slice(0, 1).map((tag) => (
                        <span key={tag} className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  className="absolute top-3 right-3 icon-btn opacity-0 group-hover:opacity-100 !text-[var(--danger)]"
                  onClick={(e) => { e.stopPropagation(); if (confirm('Delete this project?')) dispatch(deleteProject(project.id)); }}
                  title="Delete project"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowNew(false)}>
          <div className="w-full max-w-md animate-scaleIn" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-lg font-semibold text-white">New Project</h2>
              <button className="icon-btn" onClick={() => setShowNew(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Project Name</label>
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Game" required autoFocus />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea className="input-field !resize-none" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A platformer about..." />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Game Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(GAME_ICONS).map(([type, icon]) => (
                    <button
                      key={type}
                      type="button"
                      className={`flex flex-col items-center gap-1 rounded-lg p-2 text-[10px] capitalize transition-all ${
                        gameType === type ? 'ring-2' : ''
                      }`}
                      style={{
                        background: gameType === type ? 'var(--accent-subtle)' : 'var(--bg-tertiary)',
                        color: gameType === type ? 'var(--accent)' : 'var(--text-muted)',
                        ringColor: gameType === type ? 'var(--accent)' : undefined,
                      }}
                      onClick={() => setGameType(type)}
                    >
                      <span className="text-lg">{icon}</span>
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
