import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { inspectionAPI } from '@/lib/api'

export interface Inspection {
  id: number
  shift: number
  type: 'START' | 'END'
  started_at: string
  completed_at?: string
  status: 'IN_PROGRESS' | 'PASS' | 'FAIL' | 'CANCELLED'
  notes: string
  weather_conditions: string
  temperature?: number
  lat?: number
  lng?: number
  address: string
  created_by: number
  updated_at: string
  items?: InspectionItem[]
  photos?: Photo[]
}

export interface InspectionItem {
  id: number
  inspection: number
  part: string
  status: 'PASS' | 'FAIL' | 'N/A' | 'SKIP'
  notes: string
  created_at: string
  updated_at: string
}

export interface Photo {
  id: number
  inspection: number
  inspection_item?: number
  part: string
  angle: string
  file_key: string
  file_url: string
  width: number
  height: number
  file_size: number
  mime_type: string
  taken_at: string
  gps_lat?: number
  gps_lng?: number
  camera_make: string
  camera_model: string
  uploaded_at: string
  uploaded_by: number
}

interface InspectionsState {
  inspections: Inspection[]
  loading: boolean
  error: string | null
}

const initialState: InspectionsState = {
  inspections: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchInspections = createAsyncThunk(
  'inspections/fetchInspections',
  async () => {
    const response = await inspectionAPI.list()
    return response.data
  }
)

export const createInspection = createAsyncThunk(
  'inspections/createInspection',
  async (inspectionData: Partial<Inspection>) => {
    const response = await inspectionAPI.create(inspectionData)
    return response.data
  }
)

export const completeInspection = createAsyncThunk(
  'inspections/completeInspection',
  async ({ id, data }: { id: number; data: any }) => {
    const response = await inspectionAPI.complete(id.toString(), data)
    return response.data
  }
)

export const uploadPhoto = createAsyncThunk(
  'inspections/uploadPhoto',
  async (photoData: any) => {
    const response = await inspectionAPI.uploadPhoto(photoData)
    return response.data
  }
)

const inspectionsSlice = createSlice({
  name: 'inspections',
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
      // Fetch inspections
      .addCase(fetchInspections.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInspections.fulfilled, (state, action) => {
        state.loading = false
        state.inspections = action.payload
      })
      .addCase(fetchInspections.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch inspections'
      })
      
      // Create inspection
      .addCase(createInspection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createInspection.fulfilled, (state, action) => {
        state.loading = false
        state.inspections.unshift(action.payload)
      })
      .addCase(createInspection.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create inspection'
      })
      
      // Complete inspection
      .addCase(completeInspection.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(completeInspection.fulfilled, (state, action) => {
        state.loading = false
        const index = state.inspections.findIndex(i => i.id === action.payload.id)
        if (index !== -1) {
          state.inspections[index] = action.payload
        }
      })
      .addCase(completeInspection.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to complete inspection'
      })
      
      // Upload photo
      .addCase(uploadPhoto.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadPhoto.fulfilled, (state, action) => {
        state.loading = false
        // Update the inspection with the new photo
        const inspectionIndex = state.inspections.findIndex(
          i => i.id === action.payload.inspection
        )
        if (inspectionIndex !== -1) {
          if (!state.inspections[inspectionIndex].photos) {
            state.inspections[inspectionIndex].photos = []
          }
          state.inspections[inspectionIndex].photos!.push(action.payload)
        }
      })
      .addCase(uploadPhoto.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to upload photo'
      })
  },
})

export const { clearError, setLoading } = inspectionsSlice.actions
export default inspectionsSlice.reducer
