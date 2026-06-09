import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState { sidebarOpen: boolean; bottomPanelOpen: boolean; showRightPanel: boolean; showAIChat: boolean; theme: 'dark' | 'light'; }

const initialState: UIState = { sidebarOpen: true, bottomPanelOpen: true, showRightPanel: true, showAIChat: false, theme: 'dark' };

const uiSlice = createSlice({
  name: 'ui', initialState,
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
    toggleBottomPanel(state) { state.bottomPanelOpen = !state.bottomPanelOpen; },
    toggleRightPanel(state) { state.showRightPanel = !state.showRightPanel; },
    toggleAIChat(state) { state.showAIChat = !state.showAIChat; },
    setTheme(state, action: PayloadAction<'dark' | 'light'>) { state.theme = action.payload; },
  },
});

export const { toggleSidebar, toggleBottomPanel, toggleRightPanel, toggleAIChat, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
