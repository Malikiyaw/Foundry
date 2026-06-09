import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface User { id: string; email: string; name: string; avatar?: string; credits: number }
interface AuthState { user: User | null; loading: boolean; error: string | null; backendOnline: boolean }

const initialState: AuthState = { user: null, loading: false, error: null, backendOnline: true };

async function safeFetch(url: string, init?: RequestInit): Promise<any> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error('Backend is not connected. Please deploy the backend server to enable authentication.');
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text().catch(() => '');
    if (text.includes('could not be found') || text.includes('NOT_FOUND') || res.status === 404) {
      throw new Error('Backend API not found. The backend server may not be deployed yet.');
    }
    throw new Error(`Server returned non-JSON response (HTTP ${res.status}). The backend may not be running.`);
  }
  return res;
}

export const login = createAsyncThunk('auth/login', async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const res = await safeFetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Login failed');
    localStorage.setItem('foundry_token', data.token);
    return data.user;
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const register = createAsyncThunk('auth/register', async ({ email, password, name }: { email: string; password: string; name: string }, { rejectWithValue }) => {
  try {
    const res = await safeFetch('/api/auth/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Registration failed');
    localStorage.setItem('foundry_token', data.token);
    return data.user;
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('foundry_token');
    if (!token) return rejectWithValue('No token');
    const res = await safeFetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) { localStorage.removeItem('foundry_token'); return rejectWithValue('Unauthorized'); }
    return data;
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
      .addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; s.backendOnline = true; })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; s.backendOnline = !(a.payload as string)?.includes('not connected'); })
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; s.backendOnline = true; })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; s.backendOnline = !(a.payload as string)?.includes('not connected'); })
      .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; s.backendOnline = true; })
      .addCase(fetchMe.rejected, (s) => { s.user = null; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
