import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Tab { fileId: string; path: string; isGenerated: boolean; isDirty: boolean }

interface EditorState { openTabs: Tab[]; activeTabIndex: number; showMinimap: boolean; fontSize: number; isZenMode: boolean; showDiff: boolean; }

const initialState: EditorState = { openTabs: [], activeTabIndex: -1, showMinimap: true, fontSize: 14, isZenMode: false, showDiff: false };

const editorSlice = createSlice({
  name: 'editor', initialState,
  reducers: {
    openFile(state, action: PayloadAction<{ fileId: string; path: string; isGenerated?: boolean }>) {
      const { fileId, path, isGenerated } = action.payload;
      const existing = state.openTabs.findIndex((t) => t.fileId === fileId);
      if (existing >= 0) { state.activeTabIndex = existing; return; }
      state.openTabs.push({ fileId, path, isGenerated: !!isGenerated, isDirty: false });
      state.activeTabIndex = state.openTabs.length - 1;
    },
    closeTab(state, action: PayloadAction<number>) {
      const idx = action.payload;
      state.openTabs.splice(idx, 1);
      if (state.openTabs.length === 0) { state.activeTabIndex = -1; return; }
      if (idx <= state.activeTabIndex) state.activeTabIndex = Math.max(0, state.activeTabIndex - 1);
    },
    setActiveTab(state, action: PayloadAction<number>) { state.activeTabIndex = Math.min(action.payload, state.openTabs.length - 1); },
    markDirty(state, action: PayloadAction<string>) {
      const tab = state.openTabs.find((t) => t.fileId === action.payload);
      if (tab) tab.isDirty = true;
    },
    markClean(state, action: PayloadAction<string>) {
      const tab = state.openTabs.find((t) => t.fileId === action.payload);
      if (tab) tab.isDirty = false;
    },
    toggleMinimap(state) { state.showMinimap = !state.showMinimap; },
    setFontSize(state, action: PayloadAction<number>) { state.fontSize = Math.max(10, Math.min(30, action.payload)); },
    toggleZenMode(state) { state.isZenMode = !state.isZenMode; },
    toggleShowDiff(state) { state.showDiff = !state.showDiff; },
  },
});

export const { openFile, closeTab, setActiveTab, markDirty, markClean, toggleMinimap, setFontSize, toggleZenMode, toggleShowDiff } = editorSlice.actions;
export default editorSlice.reducer;
