// API Configuration
const detectProdApiBase = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: prefer env; fall back to production API
    return 'https://taki.pythonanywhere.com/api';
  }
  const host = window.location.hostname;
  // Known production frontends mapped to backend API
  if (host.endsWith('vercel.app')) return 'https://taki.pythonanywhere.com/api';
  if (host === 'www.fleetia.online' || host === 'fleetia.online') return 'https://taki.pythonanywhere.com/api';
  // Default dev
  return 'http://localhost:8000/api';
};

const detectWsBase = (): string => {
  if (typeof window === 'undefined') return 'wss://taki.pythonanywhere.com/ws';
  const host = window.location.hostname;
  if (host.endsWith('vercel.app')) return 'wss://taki.pythonanywhere.com/ws';
  if (host === 'www.fleetia.online' || host === 'fleetia.online') return 'wss://taki.pythonanywhere.com/ws';
  return 'ws://127.0.0.1:8000/ws';
};

const detectAppUrl = (): string => {
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
};

export const API_CONFIG = {
  // API base URL (env takes precedence). Falls back to production API in prod, localhost in dev.
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || detectProdApiBase(),

  // WebSocket URL for real-time features
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || detectWsBase(),

  // App URL
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || detectAppUrl(),
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/account/login/',
      REGISTER: '/account/register/',
      REFRESH: '/account/refresh/',
      LOGOUT: '/account/logout/',
      ME: '/account/profile/',
    },
    
    // Vehicles
    VEHICLES: {
      LIST: '/fleet/vehicles/',
      CREATE: '/fleet/vehicles/',
      DETAIL: (id: number) => `/fleet/vehicles/${id}/`,
      UPDATE: (id: number) => `/fleet/vehicles/${id}/`,
      DELETE: (id: number) => `/fleet/vehicles/${id}/`,
    },
    
    // Inspections
    INSPECTIONS: {
      LIST: '/inspections/',
      CREATE: '/inspections/',
      DETAIL: (id: number) => `/inspections/${id}/`,
      COMPLETE: (id: number) => `/inspections/${id}/complete/`,
    },
    
    // Shifts
    SHIFTS: {
      START: '/inspections/shifts/start/',
      END: (id: number) => `/inspections/shifts/${id}/end/`,
    },
    
    // Uploads
    UPLOADS: {
      SIGN: '/uploads/sign/',
      CONFIRM: '/uploads/confirm/',
    },
    
    // Issues & Tickets
    ISSUES: {
      LIST: '/issues/issues/',
      CREATE: '/issues/issues/',
      DETAIL: (id: number) => `/issues/issues/${id}/`,
    },
    
    TICKETS: {
      LIST: '/tickets/tickets/',
      CREATE: '/tickets/tickets/',
      DETAIL: (id: number) => `/tickets/tickets/${id}/`,
      UPDATE: (id: number) => `/tickets/tickets/${id}/`,
    },
    
    // Telemetry
    TELEMETRY: {
      PARKING: '/telemetry/parking/',
    },
  },
  
  // Request timeout
  TIMEOUT: 30000, // 30 seconds
  
  // Retry configuration
  RETRY: {
    ATTEMPTS: 3,
    DELAY: 1000, // 1 second
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get WebSocket URL
export const getWebSocketUrl = (): string => {
  return API_CONFIG.WS_URL;
};

export default API_CONFIG;
