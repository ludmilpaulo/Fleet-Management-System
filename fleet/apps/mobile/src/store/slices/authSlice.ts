import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { authService, AuthUser } from '../../services/authService'

interface User {
  id: string
  username: string
  fullName: string
  role: 'admin' | 'driver' | 'inspector' | 'staff'
  company: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to check for stored auth
  error: null,
}

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials.username, credentials.password)
      // Convert AuthUser to User interface
      const user: User = {
        id: response.user.id.toString(),
        username: response.user.username,
        fullName: response.user.full_name || `${response.user.first_name} ${response.user.last_name}`.trim(),
        role: response.user.role,
        company: typeof response.user.company === 'string' 
          ? response.user.company 
          : response.user.company?.name || '',
        email: response.user.email,
      }
      return user
    } catch (error: any) {
      // Preserve error type and message for better error handling
      const errorInfo = {
        message: error.message || 'Login failed',
        errorType: error.errorType || 'unknown',
      }
      return rejectWithValue(errorInfo)
    }
  }
)

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await authService.getCurrentUser()
      if (!userData) {
        throw new Error('No user found')
      }
      // Convert AuthUser to User interface
      const user: User = {
        id: userData.id.toString(),
        username: userData.username,
        fullName: userData.full_name || `${userData.first_name} ${userData.last_name}`.trim(),
        role: userData.role,
        company: typeof userData.company === 'string' 
          ? userData.company 
          : userData.company?.name || '',
        email: userData.email,
      }
      return user
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user profile')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return true
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.isLoading = false
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        // Handle both string and object error formats
        const errorPayload = action.payload as any
        state.error = typeof errorPayload === 'string' 
          ? errorPayload 
          : errorPayload?.message || 'Login failed'
      })
    
    // fetchUserProfile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.isLoading = false
        state.error = null
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null // Don't set error on profile fetch failure
      })
    
    // logoutUser
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUser,
} = authSlice.actions

export default authSlice.reducer