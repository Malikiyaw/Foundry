import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store/index';
import { fetchProjects, createProject, deleteProject } from '../../store/projectsSlice';
import { logout } from '../../store/authSlice';
import TemplatePicker from './TemplatePicker';

export default function ProjectList() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state: RootState) => state.projects);
  const { user } = useSelector((state: RootState) => state.auth);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);

  const handleCreate = async (template: string) => {
    const result = await dispatch(createProject({ title: 'Untitled Game', template }));
    setShowTemplate(false);
    if (createProject.fulfilled.match(result)) {
      navigate(`/project/${result.payload.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteProject(id));
    setShowDelete(null);
  };

  return (
    <div className="flex h-screen flex-col bg-[#1e1e1e]">
      <header className="flex items-center justify-between border-b border-[#3c3c3c] px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-[#0078d4]">Foundry</span>
          <span className="text-sm text-[#858585]">/ Projects</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#858585]">{user?.displayName || user?.email}</span>
          <button onClick={() => navigate('/keys')} className="rounded px-3 py-1 text-sm text-[#0078d4] hover:bg-[#2a2d2e]">Keys</button>
          <button onClick={() => navigate('/gallery')} className="rounded px-3 py-1 text-sm text-[#0078d4] hover:bg-[#2a2d2e]">Gallery</button>
          <button onClick={() => dispatch(logout())} className="rounded px-3 py-1 text-sm text-[#858585] hover:bg-[#2a2d2e]">Logout</button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#cccccc]">Your Projects</h1>
          <button
            onClick={() => setShowTemplate(true)}
            className="rounded bg-[#0078d4] px-4 py-2 text-sm text-white hover:bg-[#1e8ae6]"
          >
            + New Project
          </button>
        </div>

        {loading ? (
          <div className="text-center text-[#858585]">Loading projects...</div>
        ) : items.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-[#858585] mb-4">No projects yet. Create your first game!</p>
            <button
              onClick={() => setShowTemplate(true)}
              className="rounded bg-[#0078d4] px-6 py-3 text-sm text-white hover:bg-[#1e8ae6]"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((project) => (
              <div
                key={project.id}
                className="group relative cursor-pointer rounded-lg border border-[#3c3c3c] bg-[#252526] p-4 hover:border-[#0078d4]"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-[#cccccc]">{project.title}</h3>
                    <p className="mt-1 text-xs text-[#858585] capitalize">{project.template} • {project.gameEngine}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDelete(project.id); }}
                    className="invisible group-hover:visible rounded p-1 text-[#858585] hover:bg-[#3c3c3c]"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-3 flex gap-3 text-xs text-[#858585]">
                  <span>{project._count?.files || 0} files</span>
                  <span>{project._count?.assets || 0} assets</span>
                  <span>{project.isPublic ? 'Public' : 'Private'}</span>
                </div>
                <div className="mt-2 text-xs text-[#858585]">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showTemplate && (
        <TemplatePicker onSelect={handleCreate} onClose={() => setShowTemplate(false)} />
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg border border-[#3c3c3c] bg-[#252526] p-6">
            <p className="mb-4 text-sm text-[#cccccc]">Delete this project permanently?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowDelete(null)} className="rounded px-3 py-1 text-sm text-[#858585] hover:bg-[#3c3c3c]">Cancel</button>
              <button onClick={() => handleDelete(showDelete)} className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
