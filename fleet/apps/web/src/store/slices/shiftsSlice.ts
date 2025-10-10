import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { shiftAPI } from '@/lib/api'

export interface Shift {
  id: number
  vehicle: number
  vehicle_reg: string
  vehicle_make_model: string
  driver: number
  driver_name: string
  driver_username: string
  start_at: string
  end_at?: string
  start_lat?: number
  start_lng?: number
  start_address: string
  end_lat?: number
  end_lng?: number
  end_address: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  notes: string
  duration?: string
  inspection_count: number
  created_at: string
  updated_at: string
}

export interface ShiftStats {
  total_shifts: number
  active_shifts: number
  completed_shifts: number
  shifts_by_status: Record<string, number>
  average_duration: string
  total_duration: string
}

interface ShiftsState {
  shifts: Shift[]
  stats: ShiftStats | null
  loading: boolean
  error: string | null
}

const initialState: ShiftsState = {
  shifts: [],
  stats: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchShifts = createAsyncThunk(
  'shifts/fetchShifts',
  async () => {
    const response = await shiftAPI.list()
    return response.data
  }
)

export const fetchShiftStats = createAsyncThunk(
  'shifts/fetchShiftStats',
  async () => {
    const response = await shiftAPI.stats()
    return response.data
  }
)

export const startShift = createAsyncThunk(
  'shifts/startShift',
  async (shiftData: any) => {
    const response = await shiftAPI.start(shiftData)
    return response.data
  }
)

export const endShift = createAsyncThunk(
  'shifts/endShift',
  async ({ id, data }: { id: number; data: any }) => {
    const response = await shiftAPI.end(id.toString(), data)
    return response.data
  }
)

const shiftsSlice = createSlice({
  name: 'shifts',
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
      // Fetch shifts
      .addCase(fetchShifts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.loading = false
        state.shifts = action.payload
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch shifts'
      })
      
      // Fetch shift stats
      .addCase(fetchShiftStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchShiftStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchShiftStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch shift stats'
      })
      
      // Start shift
      .addCase(startShift.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(startShift.fulfilled, (state, action) => {
        state.loading = false
        state.shifts.unshift(action.payload)
      })
      .addCase(startShift.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to start shift'
      })
      
      // End shift
      .addCase(endShift.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(endShift.fulfilled, (state, action) => {
        state.loading = false
        const index = state.shifts.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.shifts[index] = action.payload
        }
      })
      .addCase(endShift.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to end shift'
      })
  },
})

export const { clearError, setLoading } = shiftsSlice.actions
export default shiftsSlice.reducer
