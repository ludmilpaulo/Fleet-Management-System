import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface InspectionItem {
  id: string
  part: string
  status: 'PASS' | 'FAIL' | 'N/A' | 'SKIP'
  notes: string
}

interface Photo {
  id: string
  part: string
  angle: string
  fileUrl: string
  takenAt: string
}

interface Inspection {
  id: string
  shiftId: string
  type: 'START' | 'END'
  status: 'IN_PROGRESS' | 'PASS' | 'FAIL' | 'CANCELLED'
  startedAt: string
  completedAt?: string
  notes: string
  weatherConditions: string
  temperature?: number
  lat?: number
  lng?: number
  address: string
  items: InspectionItem[]
  photos: Photo[]
}

interface InspectionState {
  inspections: Inspection[]
  currentInspection: Inspection | null
  isLoading: boolean
  error: string | null
  isCreating: boolean
  isUpdating: boolean
}

const initialState: InspectionState = {
  inspections: [],
  currentInspection: null,
  isLoading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
}

const inspectionSlice = createSlice({
  name: 'inspection',
  initialState,
  reducers: {
    // Fetch inspections
    fetchInspectionsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchInspectionsSuccess: (state, action: PayloadAction<Inspection[]>) => {
      state.inspections = action.payload
      state.isLoading = false
      state.error = null
    },
    fetchInspectionsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Create inspection
    createInspectionStart: (state) => {
      state.isCreating = true
      state.error = null
    },
    createInspectionSuccess: (state, action: PayloadAction<Inspection>) => {
      state.inspections.unshift(action.payload)
      state.currentInspection = action.payload
      state.isCreating = false
      state.error = null
    },
    createInspectionFailure: (state, action: PayloadAction<string>) => {
      state.isCreating = false
      state.error = action.payload
    },

    // Update inspection
    updateInspectionStart: (state) => {
      state.isUpdating = true
      state.error = null
    },
    updateInspectionSuccess: (state, action: PayloadAction<Inspection>) => {
      const index = state.inspections.findIndex(i => i.id === action.payload.id)
      if (index !== -1) {
        state.inspections[index] = action.payload
      }
      if (state.currentInspection?.id === action.payload.id) {
        state.currentInspection = action.payload
      }
      state.isUpdating = false
      state.error = null
    },
    updateInspectionFailure: (state, action: PayloadAction<string>) => {
      state.isUpdating = false
      state.error = action.payload
    },

    // Set current inspection
    setCurrentInspection: (state, action: PayloadAction<Inspection | null>) => {
      state.currentInspection = action.payload
    },

    // Add inspection item
    addInspectionItem: (state, action: PayloadAction<InspectionItem>) => {
      if (state.currentInspection) {
        state.currentInspection.items.push(action.payload)
      }
    },

    // Update inspection item
    updateInspectionItem: (state, action: PayloadAction<{ id: string; updates: Partial<InspectionItem> }>) => {
      if (state.currentInspection) {
        const item = state.currentInspection.items.find(i => i.id === action.payload.id)
        if (item) {
          Object.assign(item, action.payload.updates)
        }
      }
    },

    // Add photo
    addPhoto: (state, action: PayloadAction<Photo>) => {
      if (state.currentInspection) {
        state.currentInspection.photos.push(action.payload)
      }
    },

    // Remove photo
    removePhoto: (state, action: PayloadAction<string>) => {
      if (state.currentInspection) {
        state.currentInspection.photos = state.currentInspection.photos.filter(
          p => p.id !== action.payload
        )
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },

    // Reset state
    resetInspectionState: (state) => {
      state.currentInspection = null
      state.error = null
      state.isCreating = false
      state.isUpdating = false
    },
  },
})

export const {
  fetchInspectionsStart,
  fetchInspectionsSuccess,
  fetchInspectionsFailure,
  createInspectionStart,
  createInspectionSuccess,
  createInspectionFailure,
  updateInspectionStart,
  updateInspectionSuccess,
  updateInspectionFailure,
  setCurrentInspection,
  addInspectionItem,
  updateInspectionItem,
  addPhoto,
  removePhoto,
  clearError,
  resetInspectionState,
} = inspectionSlice.actions

export default inspectionSlice.reducer
