import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User { id: string; email: string; name: string; avatar?: string; credits: number }
interface AuthState { user: User | null; loading: boolean; error: string | null }

const initialState: AuthState = { user: null, loading: false, error: null };

export const login = createAsyncThunk('auth/login', async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) { const err = await res.json(); return rejectWithValue(err.error || 'Login failed'); }
    const data = await res.json();
    localStorage.setItem('foundry_token', data.token);
    return data.user;
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const register = createAsyncThunk('auth/register', async ({ email, password, name }: { email: string; password: string; name: string }, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) { const err = await res.json(); return rejectWithValue(err.error || 'Registration failed'); }
    const data = await res.json();
    localStorage.setItem('foundry_token', data.token);
    return data.user;
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('foundry_token');
    if (!token) return rejectWithValue('No token');
    const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { localStorage.removeItem('foundry_token'); return rejectWithValue('Unauthorized'); }
    return await res.json();
  } catch (e: any) { return rejectWithValue(e.message); }
});

const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: {
    logout(state) { state.user = null; state.error = null; localStorage.removeItem('foundry_token'); },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; })
      .addCase(fetchMe.rejected, (s) => { s.user = null; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
