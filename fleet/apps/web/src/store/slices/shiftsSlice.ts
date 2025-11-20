import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { shiftAPI } from '@/lib/api'

export interface Shift {
  id: number
  vehicle: number | { id: number; reg_number: string; make: string; model: string }
  vehicle_reg: string
  vehicle_make_model: string
  driver: number | { id: number; username: string; full_name?: string; first_name?: string; last_name?: string }
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
    const data = response.data
    // Handle both paginated and non-paginated responses
    return Array.isArray(data) ? data : (data.results || [])
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

export const createShift = createAsyncThunk(
  'shifts/createShift',
  async (shiftData: Partial<Shift>) => {
    const response = await shiftAPI.create(shiftData)
    return response.data
  }
)

export const updateShift = createAsyncThunk(
  'shifts/updateShift',
  async ({ id, data }: { id: number; data: Partial<Shift> }) => {
    const response = await shiftAPI.update(id.toString(), data)
    return response.data
  }
)

export const deleteShift = createAsyncThunk(
  'shifts/deleteShift',
  async (id: number) => {
    await shiftAPI.delete(id.toString())
    return id
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
        // Payload is already normalized to an array in the thunk
        state.shifts = Array.isArray(action.payload) ? action.payload : []
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
        // Ensure shifts is an array before using unshift
        if (!Array.isArray(state.shifts)) {
          state.shifts = []
        }
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
        // Ensure shifts is an array before using findIndex
        if (!Array.isArray(state.shifts)) {
          state.shifts = []
        }
        const index = state.shifts.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.shifts[index] = action.payload
        }
      })
      .addCase(endShift.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to end shift'
      })
      
      // Create shift
      .addCase(createShift.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.loading = false
        // Ensure shifts is an array before using unshift
        if (!Array.isArray(state.shifts)) {
          state.shifts = []
        }
        state.shifts.unshift(action.payload)
      })
      .addCase(createShift.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create shift'
      })
      
      // Update shift
      .addCase(updateShift.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        state.loading = false
        // Ensure shifts is an array before using findIndex
        if (!Array.isArray(state.shifts)) {
          state.shifts = []
        }
        const index = state.shifts.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.shifts[index] = action.payload
        }
      })
      .addCase(updateShift.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update shift'
      })
      
      // Delete shift
      .addCase(deleteShift.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.loading = false
        // Ensure shifts is an array before using filter
        if (!Array.isArray(state.shifts)) {
          state.shifts = []
        } else {
          state.shifts = state.shifts.filter(s => s.id !== action.payload)
        }
      })
      .addCase(deleteShift.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete shift'
      })
  },
})

export const { clearError, setLoading } = shiftsSlice.actions
export default shiftsSlice.reducer
