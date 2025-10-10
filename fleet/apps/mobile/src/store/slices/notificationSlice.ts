import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ'
  timestamp: string
  vehicleReg?: string
  isRead: boolean
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Fetch notifications
    fetchNotificationsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchNotificationsSuccess: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.isRead).length
      state.isLoading = false
      state.error = null
    },
    fetchNotificationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Add notification
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.isRead) {
        state.unreadCount += 1
      }
    },

    // Mark as read
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.isRead) {
        notification.isRead = true
        state.unreadCount -= 1
      }
    },

    // Mark all as read
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true
      })
      state.unreadCount = 0
    },

    // Remove notification
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.isRead) {
        state.unreadCount -= 1
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },

    // Clear all notifications
    clearAllNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  clearError,
} = notificationSlice.actions

export default notificationSlice.reducer
