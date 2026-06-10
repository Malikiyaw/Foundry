import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { db, ProjectFile, generateId, nowISO } from '../services/db';

interface FilesState { items: ProjectFile[]; loading: boolean; error: string | null; diffs: any[] | null; }

const initialState: FilesState = { items: [], loading: false, error: null, diffs: null };

export const fetchFiles = createAsyncThunk('files/fetchAll', async (projectId: string) => {
  return await db.files.where('projectId').equals(projectId).toArray();
});

export const createFile = createAsyncThunk('files/create', async ({ projectId, path, content = '', fileType = 'code' }: { projectId: string; path: string; content?: string; fileType?: string }) => {
  const now = nowISO();
  const file: ProjectFile = { id: generateId(), projectId, path, content, fileType, isGenerated: false, createdAt: now, updatedAt: now };
  await db.files.add(file);
  return file;
});

export const updateFileContent = createAsyncThunk('files/updateContent', async ({ fileId, content }: { fileId: string; content: string }) => {
  await db.files.update(fileId, { content, updatedAt: nowISO() });
  return { fileId, content };
});

export const renameFile = createAsyncThunk('files/rename', async ({ fileId, path }: { fileId: string; path: string }) => {
  await db.files.update(fileId, { path, updatedAt: nowISO() });
  return { fileId, path };
});

export const deleteFile = createAsyncThunk('files/delete', async ({ projectId, fileId }: { projectId: string; fileId: string }) => {
  await db.files.delete(fileId);
  return fileId;
});

const filesSlice = createSlice({
  name: 'files', initialState,
  reducers: {
    clearFiles(state) { state.items = []; state.diffs = null; },
    setDiffs(state, action) { state.diffs = action.payload; },
    updateFileContent(state, action: PayloadAction<{ fileId: string; content: string }>) {
      const f = state.items.find((i) => i.id === action.payload.fileId);
      if (f) { f.content = action.payload.content; f.updatedAt = nowISO(); }
    },
    addFile(state, action: PayloadAction<ProjectFile>) { state.items.push(action.payload); },
    removeFile(state, action: PayloadAction<string>) { state.items = state.items.filter((f) => f.id !== action.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (s) => { s.loading = true; })
      .addCase(fetchFiles.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchFiles.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(createFile.fulfilled, (s, a) => { s.items.push(a.payload); })
      .addCase(updateFileContent.fulfilled, (s, a) => { const f = s.items.find((i) => i.id === a.payload.fileId); if (f) { f.content = a.payload.content; f.updatedAt = nowISO(); } })
      .addCase(deleteFile.fulfilled, (s, a) => { s.items = s.items.filter((f) => f.id !== a.payload); });
  },
});

export const { clearFiles, setDiffs, addFile, removeFile } = filesSlice.actions;
export default filesSlice.reducer;
