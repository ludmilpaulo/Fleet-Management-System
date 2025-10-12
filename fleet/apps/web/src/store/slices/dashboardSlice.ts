import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { dashboardAPI } from '@/lib/api'

export interface DashboardStats {
  total_vehicles: number
  active_vehicles: number
  maintenance_vehicles: number
  active_shifts: number
  completed_shifts_today: number
  inspections_today: number
  failed_inspections_today: number
  open_issues: number
  critical_issues: number
  overdue_issues: number
  open_tickets: number
  overdue_tickets: number
  completed_tickets_today: number
  unread_notifications: number
  urgent_notifications: number
  active_system_alerts: number
  critical_system_alerts: number
}

interface DashboardState {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
  lastUpdated: null,
}

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async () => {
    const response = await dashboardAPI.stats()
    return response.data
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch dashboard stats'
      })
  },
})

export const { clearError, setLoading } = dashboardSlice.actions
export default dashboardSlice.reducer
