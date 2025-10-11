import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import vehiclesReducer from './slices/vehiclesSlice'
import shiftsReducer from './slices/shiftsSlice'
import inspectionsReducer from './slices/inspectionsSlice'
import issuesReducer from './slices/issuesSlice'
import ticketsReducer from './slices/ticketsSlice'
import dashboardReducer from './slices/dashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    vehicles: vehiclesReducer,
    shifts: shiftsReducer,
    inspections: inspectionsReducer,
    issues: issuesReducer,
    tickets: ticketsReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch