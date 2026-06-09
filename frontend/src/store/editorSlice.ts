import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OpenTab, CursorPosition, RemoteCursor } from '../types/index';

interface EditorState {
  openTabs: OpenTab[];
  activeTabIndex: number;
  cursorPosition: CursorPosition;
  remoteCursors: RemoteCursor[];
  isZenMode: boolean;
  showMinimap: boolean;
  fontSize: number;
}

const initialState: EditorState = {
  openTabs: [],
  activeTabIndex: -1,
  cursorPosition: { line: 0, column: 0 },
  remoteCursors: [],
  isZenMode: false,
  showMinimap: true,
  fontSize: 14,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    openFile(state, action: PayloadAction<{ fileId: string; path: string }>) {
      const existing = state.openTabs.findIndex((t) => t.fileId === action.payload.fileId);
      if (existing >= 0) {
        state.activeTabIndex = existing;
      } else {
        state.openTabs.push({ fileId: action.payload.fileId, path: action.payload.path, isDirty: false });
        state.activeTabIndex = state.openTabs.length - 1;
      }
    },
    closeTab(state, action: PayloadAction<number>) {
      state.openTabs.splice(action.payload, 1);
      if (state.activeTabIndex >= state.openTabs.length) {
        state.activeTabIndex = state.openTabs.length - 1;
      }
    },
    setActiveTab(state, action: PayloadAction<number>) {
      state.activeTabIndex = action.payload;
    },
    moveTab(state, action: PayloadAction<{ from: number; to: number }>) {
      const [tab] = state.openTabs.splice(action.payload.from, 1);
      state.openTabs.splice(action.payload.to, 0, tab);
      state.activeTabIndex = action.payload.to;
    },
    markDirty(state, action: PayloadAction<string>) {
      const tab = state.openTabs.find((t) => t.fileId === action.payload);
      if (tab) tab.isDirty = true;
    },
    markClean(state, action: PayloadAction<string>) {
      const tab = state.openTabs.find((t) => t.fileId === action.payload);
      if (tab) tab.isDirty = false;
    },
    setCursorPosition(state, action: PayloadAction<CursorPosition>) {
      state.cursorPosition = action.payload;
    },
    setRemoteCursors(state, action: PayloadAction<RemoteCursor[]>) {
      state.remoteCursors = action.payload;
    },
    toggleZenMode(state) {
      state.isZenMode = !state.isZenMode;
    },
    toggleMinimap(state) {
      state.showMinimap = !state.showMinimap;
    },
    setFontSize(state, action: PayloadAction<number>) {
      state.fontSize = action.payload;
    },
    closeAllTabs(state) {
      state.openTabs = [];
      state.activeTabIndex = -1;
    },
  },
});

export const {
  openFile, closeTab, setActiveTab, moveTab,
  markDirty, markClean, setCursorPosition,
  setRemoteCursors, toggleZenMode, toggleMinimap,
  setFontSize, closeAllTabs,
} = editorSlice.actions;
export default editorSlice.reducer;
