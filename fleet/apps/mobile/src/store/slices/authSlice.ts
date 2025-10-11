import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
  user: {
    id: '1',
    username: 'johndoe',
    fullName: 'John Doe',
    role: 'driver',
    company: 'Demo Company',
    email: 'john@demo.com',
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
}

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