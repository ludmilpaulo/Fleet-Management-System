import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import authSlice from './slices/authSlice'
import inspectionSlice from './slices/inspectionSlice'
import notificationSlice from './slices/notificationSlice'
import settingsSlice from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    inspection: inspectionSlice,
    notification: notificationSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
