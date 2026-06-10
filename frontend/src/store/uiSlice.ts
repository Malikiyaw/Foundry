import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface UIState {
  sidebarOpen: boolean;
  bottomPanelOpen: boolean;
  showRightPanel: boolean;
  showAIChat: boolean;
  theme: 'dark' | 'light';
  toasts: Toast[];
}

const initialState: UIState = {
  sidebarOpen: true, bottomPanelOpen: true, showRightPanel: true,
  showAIChat: false, theme: 'dark', toasts: [],
};

let toastId = 0;

const uiSlice = createSlice({
  name: 'ui', initialState,
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
    toggleBottomPanel(state) { state.bottomPanelOpen = !state.bottomPanelOpen; },
    toggleRightPanel(state) { state.showRightPanel = !state.showRightPanel; },
    toggleAIChat(state) { state.showAIChat = !state.showAIChat; },
    setTheme(state, action: PayloadAction<'dark' | 'light'>) { state.theme = action.payload; },
    addToast(state, action: PayloadAction<{ message: string; type?: 'error' | 'success' | 'info' }>) {
      state.toasts.push({ id: String(++toastId), message: action.payload.message, type: action.payload.type || 'info' });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toggleSidebar, toggleBottomPanel, toggleRightPanel, toggleAIChat, setTheme, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
