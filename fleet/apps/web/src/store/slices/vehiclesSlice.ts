import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { vehicleAPI } from '@/lib/api'

export interface Vehicle {
  id: number
  org: number
  org_name: string
  vin: string
  reg_number: string
  make: string
  model: string
  year?: number
  color: string
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED'
  mileage: number
  fuel_type: 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID'
  engine_size: string
  transmission: 'MANUAL' | 'AUTOMATIC'
  created_at: string
  updated_at: string
  created_by: number
  key_tracker?: any
  current_shift?: any
}

export interface VehicleStats {
  total_vehicles: number
  active_vehicles: number
  maintenance_vehicles: number
  inactive_vehicles: number
  vehicles_by_status: Record<string, number>
  vehicles_by_fuel_type: Record<string, number>
  average_mileage: number
  total_mileage: number
}

interface VehiclesState {
  vehicles: Vehicle[]
  stats: VehicleStats | null
  loading: boolean
  error: string | null
}

const initialState: VehiclesState = {
  vehicles: [],
  stats: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async () => {
    const response = await vehicleAPI.list()
    return response.data
  }
)

export const fetchVehicleStats = createAsyncThunk(
  'vehicles/fetchVehicleStats',
  async () => {
    const response = await vehicleAPI.stats()
    return response.data
  }
)

export const createVehicle = createAsyncThunk(
  'vehicles/createVehicle',
  async (vehicleData: Partial<Vehicle>) => {
    const response = await vehicleAPI.create(vehicleData)
    return response.data
  }
)

export const updateVehicle = createAsyncThunk(
  'vehicles/updateVehicle',
  async ({ id, data }: { id: number; data: Partial<Vehicle> }) => {
    const response = await vehicleAPI.update(id.toString(), data)
    return response.data
  }
)

export const deleteVehicle = createAsyncThunk(
  'vehicles/deleteVehicle',
  async (id: number) => {
    await vehicleAPI.delete(id.toString())
    return id
  }
)

const vehiclesSlice = createSlice({
  name: 'vehicles',
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
      // Fetch vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false
        // Handle both array and paginated responses
        if (Array.isArray(action.payload)) {
          state.vehicles = action.payload
        } else if (action.payload?.results && Array.isArray(action.payload.results)) {
          state.vehicles = action.payload.results
        } else {
          state.vehicles = []
        }
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch vehicles'
      })
      
      // Fetch vehicle stats
      .addCase(fetchVehicleStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVehicleStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchVehicleStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch vehicle stats'
      })
      
      // Create vehicle
      .addCase(createVehicle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false
        state.vehicles.push(action.payload)
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false
        const errorMessage = (action.error as any)?.response?.data?.detail || 
                             (action.error as any)?.response?.data?.message || 
                             action.error.message || 
                             'Failed to create vehicle'
        state.error = errorMessage
        console.error('[Redux] createVehicle rejected:', {
          error: action.error,
          payload: action.payload,
          type: action.type,
          message: errorMessage
        })
      })
      
      // Update vehicle
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false
        const index = state.vehicles.findIndex(v => v.id === action.payload.id)
        if (index !== -1) {
          state.vehicles[index] = action.payload
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update vehicle'
      })
      
      // Delete vehicle
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false
        state.vehicles = state.vehicles.filter(v => v.id !== action.payload)
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete vehicle'
      })
  },
})

export const { clearError, setLoading } = vehiclesSlice.actions
export default vehiclesSlice.reducer
