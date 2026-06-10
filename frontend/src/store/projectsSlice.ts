import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { db, Project, generateId, nowISO } from '../services/db';

interface ProjectsState { items: Project[]; current: Project | null; loading: boolean; error: string | null }

const initialState: ProjectsState = { items: [], current: null, loading: false, error: null };

export const fetchProjects = createAsyncThunk('projects/fetchAll', async () => {
  return await db.projects.orderBy('updatedAt').reverse().toArray();
});

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id: string) => {
  return await db.projects.get(id) || null;
});

export const createProject = createAsyncThunk('projects/create', async (data: { name: string; description?: string; gameType?: string }) => {
  const now = nowISO();
  const project: Project = {
    id: generateId(), name: data.name, description: data.description || '',
    gameType: data.gameType || 'platformer', tags: [], isPublic: false,
    createdAt: now, updatedAt: now,
  };
  await db.projects.add(project);
  return project;
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, ...data }: Partial<Project> & { id: string }) => {
  await db.projects.update(id, { ...data, updatedAt: nowISO() });
  return { id, ...data };
});

export const deleteProject = createAsyncThunk('projects/delete', async (id: string) => {
  await db.projects.delete(id);
  await db.files.where('projectId').equals(id).delete();
  return id;
});

const projectsSlice = createSlice({
  name: 'projects', initialState,
  reducers: {
    setCurrentProject(state, action: PayloadAction<Project | null>) { state.current = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (s) => { s.loading = true; })
      .addCase(fetchProjects.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchProjects.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(fetchProject.fulfilled, (s, a) => { s.current = a.payload; })
      .addCase(createProject.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateProject.fulfilled, (s, a) => {
        const i = s.items.findIndex((p) => p.id === a.payload.id);
        if (i >= 0) Object.assign(s.items[i], a.payload);
        if (s.current?.id === a.payload.id) Object.assign(s.current!, a.payload);
      })
      .addCase(deleteProject.fulfilled, (s, a) => { s.items = s.items.filter((p) => p.id !== a.payload); if (s.current?.id === a.payload) s.current = null; });
  },
});

export const { setCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;
