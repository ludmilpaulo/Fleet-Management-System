// API Configuration
const detectProdApiBase = (): string => {
  // Environment variable takes highest priority
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (typeof window === 'undefined') {
    // Server-side: default to localhost for local development
    return process.env.NODE_ENV === 'production' 
      ? 'https://taki.pythonanywhere.com/api'
      : 'http://localhost:8000/api';
  }
  
  const host = window.location.hostname;
  // Local development - prioritize localhost
  if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) {
    return 'http://localhost:8000/api';
  }
  
  // Known production frontends mapped to backend API
  if (host.endsWith('vercel.app')) return 'https://taki.pythonanywhere.com/api';
  if (host === 'www.fleetia.online' || host === 'fleetia.online') return 'https://taki.pythonanywhere.com/api';
  
  // Default to localhost for local development
  return 'http://localhost:8000/api';
};

const detectWsBase = (): string => {
  // Environment variable takes highest priority
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'production'
      ? 'wss://taki.pythonanywhere.com/ws'
      : 'ws://localhost:8000/ws';
  }
  
  const host = window.location.hostname;
  // Local development - prioritize localhost
  if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) {
    return 'ws://localhost:8000/ws';
  }
  
  // Production WebSocket URLs
  if (host.endsWith('vercel.app')) return 'wss://taki.pythonanywhere.com/ws';
  if (host === 'www.fleetia.online' || host === 'fleetia.online') return 'wss://taki.pythonanywhere.com/ws';
  
  // Default to localhost for local development
  return 'ws://localhost:8000/ws';
};

const detectAppUrl = (): string => {
  // Environment variable takes highest priority
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Default to localhost for local development
  return 'http://localhost:3000';
};

export const API_CONFIG = {
  // API base URL - defaults to localhost:8000 for local development
  BASE_URL: detectProdApiBase(),

  // WebSocket URL for real-time features - defaults to localhost:8000 for local development
  WS_URL: detectWsBase(),

  // App URL - defaults to localhost:3000 for local development
  APP_URL: detectAppUrl(),
  
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

    // Public landing page
    LANDING_STATS: '/account/landing-stats/',
    
    // Vehicles
    VEHICLES: {
      LIST: '/fleet/vehicles/',
      CREATE: '/fleet/vehicles/',
      DETAIL: (id: number) => `/fleet/vehicles/${id}/`,
      UPDATE: (id: number) => `/fleet/vehicles/${id}/`,
      DELETE: (id: number) => `/fleet/vehicles/${id}/`,
    },
    
    // Fleet Stats
    FLEET_STATS: {
      DASHBOARD: '/fleet/stats/dashboard/',
      VEHICLES: '/fleet/stats/vehicles/',
      SHIFTS: '/fleet/stats/shifts/',
    },
    
    // Shifts
    SHIFTS: {
      LIST: '/fleet/shifts/',
      CREATE: '/fleet/shifts/',
      DETAIL: (id: number) => `/fleet/shifts/${id}/`,
      START: '/fleet/shifts/start/',
      END: (id: number) => `/fleet/shifts/${id}/end/`,
    },
    
    // Inspections
    INSPECTIONS: {
      LIST: '/inspections/',
      CREATE: '/inspections/',
      DETAIL: (id: number) => `/inspections/${id}/`,
      COMPLETE: (id: number) => `/inspections/${id}/complete/`,
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
    
    // Billing
    BILLING: {
      PLANS: '/billing/plans/',
      PLAN_DETAIL: (id: number) => `/billing/plans/${id}/`,
      CHECKOUT_SESSION: '/billing/checkout-session/',
      SUBSCRIPTION_CURRENT: '/billing/subscriptions/current/',
      SUBSCRIPTIONS: '/billing/subscriptions/',
      PAYMENTS: '/billing/payments/',
      WEBHOOK: (provider: string) => `/billing/webhooks/${provider}/`,
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
