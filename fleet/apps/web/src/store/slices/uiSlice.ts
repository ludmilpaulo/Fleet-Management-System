import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface UIState {
  sidebarOpen: boolean;
  notifications: Notification[];
  unreadNotifications: number;
  theme: 'light' | 'dark' | 'system';
  loading: {
    global: boolean;
    auth: boolean;
    profile: boolean;
    users: boolean;
  };
  modals: {
    userProfile: boolean;
    changePassword: boolean;
    deleteConfirm: boolean;
  };
  searchQuery: string;
  filters: {
    role: string;
    department: string;
    status: string;
  };
}

const initialState: UIState = {
  sidebarOpen: false,
  notifications: [],
  unreadNotifications: 0,
  theme: 'system',
  loading: {
    global: false,
    auth: false,
    profile: false,
    users: false,
  },
  modals: {
    userProfile: false,
    changePassword: false,
    deleteConfirm: false,
  },
  searchQuery: '',
  filters: {
    role: '',
    department: '',
    status: '',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    // Notification actions
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
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
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadNotifications -= 1;
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = 0;
    },
    
    // Theme actions
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    
    // Loading actions
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.auth = action.payload;
    },
    setProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.profile = action.payload;
    },
    setUsersLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.users = action.payload;
    },
    
    // Modal actions
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },
    
    // Search and filter actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilter: (state, action: PayloadAction<{ key: keyof UIState['filters']; value: string }>) => {
      state.filters[action.payload.key] = action.payload.value;
    },
    clearFilters: (state) => {
      state.filters = {
        role: '',
        department: '',
        status: '',
      };
      state.searchQuery = '';
    },
    
    // Reset UI state
    resetUI: (state) => {
      return initialState;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearAllNotifications,
  setTheme,
  setGlobalLoading,
  setAuthLoading,
  setProfileLoading,
  setUsersLoading,
  openModal,
  closeModal,
  closeAllModals,
  setSearchQuery,
  setFilter,
  clearFilters,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
