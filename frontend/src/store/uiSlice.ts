import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type BottomTab = 'terminal' | 'console' | 'ai-chat' | 'diff';

interface UIState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  bottomPanelOpen: boolean;
  bottomPanelHeight: number;
  activeBottomTab: BottomTab;
  rightPanelOpen: boolean;
  rightPanelWidth: number;
  showRightPanel: boolean;
  generationStatus: string | null;
  generationProgress: number;
  toasts: { id: string; message: string; type: 'info' | 'success' | 'error' }[];
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarWidth: 250,
  bottomPanelOpen: true,
  bottomPanelHeight: 200,
  activeBottomTab: 'terminal',
  rightPanelOpen: true,
  rightPanelWidth: 400,
  showRightPanel: true,
  generationStatus: null,
  generationProgress: 0,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarWidth(state, action: PayloadAction<number>) { state.sidebarWidth = action.payload; },
    toggleBottomPanel(state) { state.bottomPanelOpen = !state.bottomPanelOpen; },
    setBottomPanelHeight(state, action: PayloadAction<number>) { state.bottomPanelHeight = action.payload; },
    setActiveBottomTab(state, action: PayloadAction<BottomTab>) { state.activeBottomTab = action.payload; },
    toggleRightPanel(state) { state.showRightPanel = !state.showRightPanel; },
    setRightPanelWidth(state, action: PayloadAction<number>) { state.rightPanelWidth = action.payload; },
    setGenerationStatus(state, action: PayloadAction<{ message: string | null; progress: number }>) {
      state.generationStatus = action.payload.message;
      state.generationProgress = action.payload.progress;
    },
    addToast(state, action: PayloadAction<{ message: string; type: 'info' | 'success' | 'error' }>) {
      state.toasts.push({ id: Date.now().toString(), ...action.payload });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar, setSidebarWidth, toggleBottomPanel, setBottomPanelHeight,
  setActiveBottomTab, toggleRightPanel, setRightPanelWidth,
  setGenerationStatus, addToast, removeToast,
} = uiSlice.actions;
export default uiSlice.reducer;
