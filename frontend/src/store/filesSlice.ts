import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface FileItem { id: string; path: string; content: string; isGenerated: boolean; fileType: string; createdAt: string; updatedAt: string; }
interface FilesState { items: FileItem[]; loading: boolean; error: string | null; diffs: any[] | null; }

const initialState: FilesState = { items: [], loading: false, error: null, diffs: null };

export const fetchFiles = createAsyncThunk('files/fetchAll', async (projectId: string, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('foundry_token');
    const res = await fetch(`/api/projects/${projectId}/files`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return rejectWithValue('Failed');
    return await res.json();
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const createFile = createAsyncThunk('files/create', async ({ projectId, path }: { projectId: string; path: string }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('foundry_token');
    const res = await fetch(`/api/projects/${projectId}/files`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ path, content: '', fileType: 'code' }),
    });
    if (!res.ok) return rejectWithValue('Failed');
    return await res.json();
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const updateFileContent = createAsyncThunk('files/updateContent', async ({ fileId, content }: { fileId: string; content: string }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('foundry_token');
    const res = await fetch(`/api/files/${fileId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) return rejectWithValue('Failed');
    return { fileId, content };
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const deleteFile = createAsyncThunk('files/delete', async ({ projectId, fileId }: { projectId: string; fileId: string }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('foundry_token');
    const res = await fetch(`/api/files/${fileId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return rejectWithValue('Failed');
    return fileId;
  } catch (e: any) { return rejectWithValue(e.message); }
});

const filesSlice = createSlice({
  name: 'files', initialState,
  reducers: {
    clearFiles(state) { state.items = []; state.diffs = null; },
    setDiffs(state, action) { state.diffs = action.payload; },
    updateFileContent(state, action: PayloadAction<{ fileId: string; content: string }>) {
      const f = state.items.find((i) => i.id === action.payload.fileId);
      if (f) f.content = action.payload.content;
    },
    addFile(state, action: PayloadAction<FileItem>) { state.items.push(action.payload); },
    removeFile(state, action: PayloadAction<string>) { state.items = state.items.filter((f) => f.id !== action.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (s) => { s.loading = true; })
      .addCase(fetchFiles.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchFiles.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(createFile.fulfilled, (s, a) => { s.items.push(a.payload); })
      .addCase(updateFileContent.fulfilled, (s, a) => { const f = s.items.find((i) => i.id === a.payload.fileId); if (f) f.content = a.payload.content; })
      .addCase(deleteFile.fulfilled, (s, a) => { s.items = s.items.filter((f) => f.id !== a.payload); });
  },
});

export const { clearFiles, setDiffs, addFile, removeFile } = filesSlice.actions;
export default filesSlice.reducer;
