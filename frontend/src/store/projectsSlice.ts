import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Project { id: string; name: string; description: string; type: string; tags: string[]; isPublic: boolean; createdAt: string; updatedAt: string; ownerName?: string; thumbnail?: string; stars: number; playCount: number }
interface ProjectsState { items: Project[]; current: Project | null; loading: boolean; error: string | null }

const initialState: ProjectsState = { items: [], current: null, loading: false, error: null };

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('foundry_token');
    const res = await fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return rejectWithValue('Failed to fetch');
    return await res.json();
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id: string, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('foundry_token');
    const res = await fetch(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return rejectWithValue('Not found');
    return await res.json();
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const createProject = createAsyncThunk('projects/create', async (data: { name: string; description?: string; gameType?: string }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('foundry_token');
    const res = await fetch('/api/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) return rejectWithValue('Failed to create');
    return await res.json();
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id: string, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('foundry_token');
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return rejectWithValue('Failed to delete');
    return id;
  } catch (e: any) { return rejectWithValue(e.message); }
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
      .addCase(deleteProject.fulfilled, (s, a) => { s.items = s.items.filter((p) => p.id !== a.payload); if (s.current?.id === a.payload) s.current = null; });
  },
});

export const { setCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;
