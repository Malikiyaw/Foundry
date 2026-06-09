import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { ProjectFile } from '../types/index';

interface FilesState {
  items: ProjectFile[];
  loading: boolean;
  error: string | null;
}

const initialState: FilesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchFiles = createAsyncThunk('files/fetchAll', async (projectId: string, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/projects/${projectId}/files`);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch files');
  }
});

export const createFile = createAsyncThunk(
  'files/create',
  async ({ projectId, ...file }: { projectId: string; path: string; content?: string; fileType?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/projects/${projectId}/files`, file);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to create file');
    }
  }
);

export const updateFile = createAsyncThunk(
  'files/update',
  async ({ projectId, fileId, content }: { projectId: string; fileId: string; content: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/projects/${projectId}/files/${fileId}`, { content });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update file');
    }
  }
);

export const deleteFile = createAsyncThunk(
  'files/delete',
  async ({ projectId, fileId }: { projectId: string; fileId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}/files/${fileId}`);
      return fileId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete file');
    }
  }
);

export const batchUpdateFiles = createAsyncThunk(
  'files/batchUpdate',
  async ({ projectId, files }: { projectId: string; files: { path: string; content: string; fileType?: string; isGenerated?: boolean }[] }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/projects/${projectId}/files/batch`, { files });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to batch update files');
    }
  }
);

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    clearFiles(state) {
      state.items = [];
    },
    updateFileContent(state, action) {
      const { fileId, content } = action.payload;
      const file = state.items.find((f) => f.id === fileId);
      if (file) {
        file.content = content;
      }
    },
    updateFileByPath(state, action) {
      const { path, content } = action.payload;
      const file = state.items.find((f) => f.path === path);
      if (file) {
        file.content = content;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => { state.loading = true; })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createFile.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateFile.fulfilled, (state, action) => {
        const idx = state.items.findIndex((f) => f.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.items = state.items.filter((f) => f.id !== action.payload);
      })
      .addCase(batchUpdateFiles.fulfilled, (state, action) => {
        for (const file of action.payload) {
          const idx = state.items.findIndex((f) => f.id === file.id);
          if (idx >= 0) {
            state.items[idx] = file;
          } else {
            state.items.push(file);
          }
        }
      });
  },
});

export const { clearFiles, updateFileContent, updateFileByPath } = filesSlice.actions;
export default filesSlice.reducer;
