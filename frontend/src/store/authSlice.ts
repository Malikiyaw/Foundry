import { hashPassphrase, hex2buf } from '../services/crypto';
import { setPassphrase, lock as lockSession } from '../services/session';

interface AuthState { isUnlocked: boolean; hasPassphrase: boolean; loading: boolean; error: string | null }

const initialState: AuthState = { isUnlocked: false, hasPassphrase: false, loading: false, error: null };

export const checkPassphrase = createAsyncThunk('auth/check', async () => {
  const settings = await db.settings.get('main');
  return { exists: !!settings?.passphraseHash };
});

export const setupPassphrase = createAsyncThunk('auth/setup', async ({ passphrase }: { passphrase: string }, { rejectWithValue }) => {
  try {
    if (passphrase.length < 4) return rejectWithValue('Passphrase must be at least 4 characters');
    const { hash, salt } = await hashPassphrase(passphrase);
    await db.settings.put({ id: 'main', passphraseHash: hash, salt, encryptionIv: '', encryptedData: '' });
    setPassphrase(passphrase);
    return true;
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const unlock = createAsyncThunk('auth/unlock', async ({ passphrase }: { passphrase: string }, { rejectWithValue }) => {
  try {
    const settings = await db.settings.get('main');
    if (!settings) return rejectWithValue('No passphrase set up');
    const { hash } = await hashPassphrase(passphrase, hex2buf(settings.salt));
    if (hash !== settings.passphraseHash) return rejectWithValue('Wrong passphrase');
    setPassphrase(passphrase);
    return true;
  } catch (e: any) { return rejectWithValue(e.message); }
});

const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: {
    logout(state) { lockSession(); state.isUnlocked = false; state.error = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkPassphrase.fulfilled, (s, a) => { s.hasPassphrase = a.payload.exists; })
      .addCase(setupPassphrase.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(setupPassphrase.fulfilled, (s) => { s.loading = false; s.isUnlocked = true; s.hasPassphrase = true; })
      .addCase(setupPassphrase.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(unlock.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(unlock.fulfilled, (s) => { s.loading = false; s.isUnlocked = true; })
      .addCase(unlock.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
