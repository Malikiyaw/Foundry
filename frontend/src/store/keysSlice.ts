import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { db, ApiKey, generateId, nowISO } from '../services/db';
import { encryptApiKey, decryptApiKey } from '../services/crypto';
import { getPassphrase } from '../services/session';

interface KeysState { items: ApiKey[]; loading: boolean; error: string | null }

const initialState: KeysState = { items: [], loading: false, error: null };

export const fetchKeys = createAsyncThunk('keys/fetchAll', async () => {
  return await db.keys.toArray();
});

export const addKey = createAsyncThunk('keys/add', async ({ provider, apiKey, budgetLimit }: { provider: string; apiKey: string; budgetLimit?: number | null }, { rejectWithValue }) => {
  try {
    const passphrase = getPassphrase();
    if (!passphrase) return rejectWithValue('Not unlocked');
    const { keyHint, encryptedKey } = await encryptApiKey(apiKey, passphrase);
    const now = nowISO();
    const key: ApiKey = { id: generateId(), provider, keyHint, encryptedKey: encryptedKey as any, iv: '', isActive: true, usageCount: 0, budgetLimit: budgetLimit || null, createdAt: now };
    await db.keys.add(key);
    return key;
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const toggleKey = createAsyncThunk('keys/toggle', async ({ id, isActive }: { id: string; isActive: boolean }) => {
  await db.keys.update(id, { isActive });
  return { id, isActive };
});

export const removeKey = createAsyncThunk('keys/remove', async (id: string) => {
  await db.keys.delete(id);
  return id;
});

export const incrementKeyUsage = createAsyncThunk('keys/increment', async ({ id }: { id: string }) => {
  const key = await db.keys.get(id);
  if (key) await db.keys.update(id, { usageCount: key.usageCount + 1 });
  return id;
});

export const getDecryptedKey = async (id: string): Promise<string | null> => {
  const passphrase = getPassphrase();
  if (!passphrase) return null;
  const key = await db.keys.get(id);
  if (!key || !key.isActive) return null;
  return await decryptApiKey(key as any, passphrase);
};

const keysSlice = createSlice({
  name: 'keys', initialState,
  reducers: {
    setKeys(state, action: PayloadAction<ApiKey[]>) { state.items = action.payload; },
    updateKey(state, action: PayloadAction<Partial<ApiKey> & { id: string }>) {
      const idx = state.items.findIndex((k) => k.id === action.payload.id);
      if (idx >= 0) state.items[idx] = { ...state.items[idx], ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKeys.fulfilled, (s, a) => { s.items = a.payload; })
      .addCase(addKey.fulfilled, (s, a) => { s.items.push(a.payload); })
      .addCase(addKey.rejected, (s, a) => { s.error = a.payload as string; })
      .addCase(toggleKey.fulfilled, (s, a) => { const k = s.items.find((x) => x.id === a.payload.id); if (k) k.isActive = a.payload.isActive; })
      .addCase(removeKey.fulfilled, (s, a) => { s.items = s.items.filter((k) => k.id !== a.payload); });
  },
});

export const { setKeys, updateKey } = keysSlice.actions;
export default keysSlice.reducer;
