import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { Project } from '../types/index';

interface ProjectsState {
  items: Project[];
  current: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  current: null,
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/projects');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch projects');
  }
});

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch project');
  }
});

export const createProject = createAsyncThunk('projects/create', async (project: Partial<Project>, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/projects', project);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, ...updates }: Partial<Project> & { id: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/projects/${id}`, updates);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update project');
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete project');
  }
});

export const forkProject = createAsyncThunk('projects/fork', async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/projects/${id}/fork`);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fork project');
  }
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearCurrentProject(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.current = action.payload;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      })
      .addCase(forkProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.current = action.payload;
      });
  },
});

export const { clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;
