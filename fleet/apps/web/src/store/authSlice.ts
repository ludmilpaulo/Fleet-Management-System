import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  access: string | null;
  refresh: string | null;
  user: Record<string, unknown> | null;
}

const initialState: AuthState = {
  access: null,
  refresh: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<{ access: string; refresh: string }>) {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
    },
    setUser(state, action: PayloadAction<Record<string, unknown> | null>) {
      state.user = action.payload;
    },
    logout(state) {
      state.access = null;
      state.refresh = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.access = action.payload.access;
        state.refresh = action.payload.refresh;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { setTokens, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

export const login = createAsyncThunk('auth/login', async (payload: { username: string; password: string }) => {
  const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error('Invalid credentials');
  return resp.json();
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { getState }) => {
  const state = getState() as { auth?: { access?: string } };
  const access = state?.auth?.access;
  const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/me`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!resp.ok) throw new Error('Failed to fetch user');
  return resp.json();
});


