import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, UIState } from '../../types';

const initialState: UIState = {
  notifications: [],
  unreadNotifications: 0,
  isLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadNotifications += 1;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadNotifications -= 1;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadNotifications = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notificationIndex = state.notifications.findIndex(n => n.id === action.payload);
      if (notificationIndex !== -1) {
        const notification = state.notifications[notificationIndex];
        if (!notification.read) {
          state.unreadNotifications -= 1;
        }
        state.notifications.splice(notificationIndex, 1);
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearAllNotifications,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
