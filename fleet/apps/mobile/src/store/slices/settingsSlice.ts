import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserSettings {
  notifications: boolean
  locationTracking: boolean
  autoUpload: boolean
  offlineMode: boolean
  darkMode: boolean
  language: string
  company: string
}

interface SettingsState {
  settings: UserSettings
  isLoading: boolean
  error: string | null
}

const initialState: SettingsState = {
  settings: {
    notifications: true,
    locationTracking: true,
    autoUpload: true,
    offlineMode: false,
    darkMode: false,
    language: 'en',
    company: 'Demo Company',
  },
  isLoading: false,
  error: null,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Load settings
    loadSettingsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loadSettingsSuccess: (state, action: PayloadAction<UserSettings>) => {
      state.settings = action.payload
      state.isLoading = false
      state.error = null
    },
    loadSettingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Update setting
    updateSetting: (state, action: PayloadAction<{ key: keyof UserSettings; value: any }>) => {
      state.settings[action.payload.key] = action.payload.value
    },

    // Update multiple settings
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },

    // Reset settings
    resetSettings: (state) => {
      state.settings = initialState.settings
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  loadSettingsStart,
  loadSettingsSuccess,
  loadSettingsFailure,
  updateSetting,
  updateSettings,
  resetSettings,
  clearError,
} = settingsSlice.actions

export default settingsSlice.reducer
