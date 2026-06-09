import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ApiKey { id: string; provider: string; keyHint: string; isActive: boolean; usageCount: number; budgetLimit: number | null; createdAt: string }
interface KeysState { items: ApiKey[]; loading: boolean }

const initialState: KeysState = { items: [], loading: false };

const keysSlice = createSlice({
  name: 'keys', initialState,
  reducers: {
    setKeys(state, action: PayloadAction<ApiKey[]>) { state.items = action.payload; },
    addKey(state, action: PayloadAction<ApiKey>) { state.items.push(action.payload); },
    removeKey(state, action: PayloadAction<string>) { state.items = state.items.filter((k) => k.id !== action.payload); },
    updateKey(state, action: PayloadAction<Partial<ApiKey> & { id: string }>) {
      const idx = state.items.findIndex((k) => k.id === action.payload.id);
      if (idx >= 0) state.items[idx] = { ...state.items[idx], ...action.payload };
    },
  },
});

export const { setKeys, addKey, removeKey, updateKey } = keysSlice.actions;
export default keysSlice.reducer;
