import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../../services/api';
import { AuthState, User } from '../../types';

interface Credentials {
  username: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  employeeId?: string;
  department?: string;
  role: 'admin' | 'driver' | 'inspector' | 'staff';
  company_slug: string;
}

export const loginUser = createAsyncThunk<
  { user: User; token: string },
  Credentials,
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    console.log('[Auth] Attempting login for:', credentials.username);
    const response = await apiService.login(credentials.username, credentials.password);
    if (response.token) {
      await AsyncStorage.setItem('auth_token', response.token);
      console.log('[Auth] Login successful, token stored');
    }
    return response;
  } catch (error: any) {
    console.error('[Auth] Login error:', error);
    const errorMessage = error?.message || error?.toString() || 'Login failed. Please check your credentials and try again.';
    return rejectWithValue(errorMessage);
  }
});

export const registerUser = createAsyncThunk<
  { user: User; token: string },
  RegisterPayload,
  { rejectValue: string }
>('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    console.log('[Auth] Attempting registration for:', userData.username);
    const payload = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      password_confirm: userData.passwordConfirm,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone_number: userData.phoneNumber,
      employee_id: userData.employeeId,
      department: userData.department,
      role: userData.role,
      company_slug: userData.company_slug,
    };

    const response = await apiService.register(payload);
    if (response.token) {
      await AsyncStorage.setItem('auth_token', response.token);
      console.log('[Auth] Registration successful, token stored');
    }
    return response;
  } catch (error: any) {
    console.error('[Auth] Registration error:', error);
    const errorMessage = error?.message || error?.toString() || 'Registration failed. Please check your information and try again.';
    return rejectWithValue(errorMessage);
  }
});

export const fetchUserProfile = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getUserProfile();
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch profile');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await apiService.logout();
  await AsyncStorage.removeItem('auth_token');
});

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
        state.isAuthenticated = false;
      })
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || null;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearError, setUser, setToken } = authSlice.actions;

export default authSlice.reducer;