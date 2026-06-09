import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { ApiKey } from '../types/index';

interface KeysState {
  items: ApiKey[];
  loading: boolean;
  error: string | null;
}

const initialState: KeysState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchKeys = createAsyncThunk('keys/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/keys');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch keys');
  }
});

export const addKey = createAsyncThunk('keys/add', async (keyData: { label: string; provider: string; key: string; monthlyBudgetUsd?: number; fallbackOrder?: number }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/keys', keyData);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to add key');
  }
});

export const testKey = createAsyncThunk('keys/test', async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/keys/${id}/test`);
    return { id, ...data };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to test key');
  }
});

export const deleteKey = createAsyncThunk('keys/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/keys/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete key');
  }
});

export const updateKey = createAsyncThunk('keys/update', async ({ id, ...updates }: Partial<ApiKey> & { id: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/keys/${id}`, updates);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update key');
  }
});

const keysSlice = createSlice({
  name: 'keys',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKeys.pending, (state) => { state.loading = true; })
      .addCase(fetchKeys.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchKeys.rejected, (state, action) => { state.error = action.payload as string; })
      .addCase(addKey.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(deleteKey.fulfilled, (state, action) => {
        state.items = state.items.filter((k) => k.id !== action.payload);
      })
      .addCase(updateKey.fulfilled, (state, action) => {
        const idx = state.items.findIndex((k) => k.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      });
  },
});

export default keysSlice.reducer;
