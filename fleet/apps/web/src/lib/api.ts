import axios from 'axios'

const resolveApiBase = (): string => {
  // Environment variable takes highest priority
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    // Ensure it ends with /api
    return envUrl.endsWith('/api') || envUrl.endsWith('/api/') ? envUrl : 
           envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`;
  }
  
  const isBrowser = typeof window !== 'undefined';
  if (isBrowser) {
    const host = window.location.hostname;
    // Local development - prioritize localhost
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) {
      return 'http://localhost:8000/api';
    }
    // Production default
    return 'https://taki.pythonanywhere.com/api';
  }
  
  // Server-side default - prioritize localhost for development
  return process.env.NODE_ENV === 'production'
    ? 'https://taki.pythonanywhere.com/api'
    : 'http://localhost:8000/api';
};

const API_BASE_URL = resolveApiBase()
//const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

// Ensure baseURL ends with /api/ for proper path combination
const normalizeBaseURL = (url: string): string => {
  // Ensure URL contains /api
  let normalized = url;
  if (!normalized.includes('/api')) {
    normalized = normalized.endsWith('/') ? `${normalized}api` : `${normalized}/api`;
  }
  // Ensure it ends with /
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

// Create axios instance
export const api = axios.create({
  baseURL: normalizeBaseURL(API_BASE_URL),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token and normalize URLs
api.interceptors.request.use(
  (config) => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Token ${token}`
      }
      
      // Ensure baseURL includes /api if it doesn't already
      if (config.baseURL && !config.baseURL.includes('/api')) {
        config.baseURL = config.baseURL.endsWith('/') 
          ? `${config.baseURL}api/` 
          : `${config.baseURL}/api/`
      }
      
      // Ensure URL is properly constructed
      // Axios combines baseURL (ending with /api/) + path (without leading /) correctly
      if (config.url && !config.url.startsWith('http://') && !config.url.startsWith('https://')) {
        // Remove leading slash if present - axios will combine baseURL + path correctly
        // baseURL ends with /api/ (e.g., http://localhost:8000/api/)
        // path should not start with / (e.g., fleet/vehicles/)
        // Result: http://localhost:8000/api/fleet/vehicles/
        if (config.url.startsWith('/')) {
          config.url = config.url.slice(1)
        }
        
        // Debug: log the final URL being constructed (only in development)
        if (typeof window !== 'undefined') {
          const finalUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url
          console.log(`[API Request] ${config.method?.toUpperCase()} ${finalUrl}`, {
            baseURL: config.baseURL,
            originalUrl: config.url,
            finalUrl,
            combined: `${config.baseURL || ''}${config.url}`
          })
        }
      }
      
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          })

          const { token } = response.data
          localStorage.setItem('auth_token', token)
          
          originalRequest.headers.Authorization = `Token ${token}`
          return api(originalRequest)
        }
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/auth/signin'
      }
    }

    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('account/login/', { email, password }),
  
  refresh: (refresh: string) =>
    api.post('account/refresh/', { refresh }),
  
  register: (data: any) =>
    api.post('account/register/', data),
  
  me: () =>
    api.get('account/profile/'),
  
  logout: () =>
    api.post('account/logout/'),
}

export const companyAPI = {
  list: () =>
    api.get('companies/'),
  
  detail: (id: string) =>
    api.get(`companies/${id}/`),
  
  create: (data: any) =>
    api.post('companies/create-public/', data),
  
  update: (id: string, data: any) =>
    api.put(`companies/${id}/`, data),
  
  stats: (id: string) =>
    api.get(`companies/${id}/stats/`),
}

export const vehicleAPI = {
  list: () =>
    api.get('fleet/vehicles/'),
  
  detail: (id: string) =>
    api.get(`fleet/vehicles/${id}/`),
  
  create: (data: any) =>
    api.post('fleet/vehicles/', data),
  
  update: (id: string, data: any) =>
    api.put(`fleet/vehicles/${id}/`, data),
  
  delete: (id: string) =>
    api.delete(`fleet/vehicles/${id}/`),
  
  stats: () =>
    api.get('fleet/stats/vehicles/'),
}

export const shiftAPI = {
  list: () =>
    api.get('fleet/shifts/'),
  
  detail: (id: string) =>
    api.get(`fleet/shifts/${id}/`),
  
  create: (data: any) =>
    api.post('fleet/shifts/', data),
  
  update: (id: string, data: any) =>
    api.put(`fleet/shifts/${id}/`, data),
  
  delete: (id: string) =>
    api.delete(`fleet/shifts/${id}/`),
  
  start: (data: any) =>
    api.post('fleet/shifts/start/', data),
  
  end: (id: string, data: any) =>
    api.post(`fleet/shifts/${id}/end/`, data),
  
  stats: () =>
    api.get('fleet/stats/shifts/'),
}

export const inspectionAPI = {
  list: () =>
    api.get('inspections/inspections/'),
  
  detail: (id: string) =>
    api.get(`inspections/inspections/${id}/`),
  
  create: (data: any) =>
    api.post('inspections/inspections/', data),
  
  update: (id: string, data: any) =>
    api.put(`inspections/inspections/${id}/`, data),
  
  delete: (id: string) =>
    api.delete(`inspections/inspections/${id}/`),
  
  complete: (id: string, data: any) =>
    api.post(`inspections/inspections/${id}/complete/`, data),
  
  photos: (id: string) =>
    api.get(`inspections/inspections/${id}/photos/`),
  
  uploadPhoto: (data: any) =>
    api.post('inspections/photos/', data),
}

export const issueAPI = {
  list: () =>
    api.get('issues/issues/'),
  
  detail: (id: string) =>
    api.get(`issues/issues/${id}/`),
  
  create: (data: any) =>
    api.post('issues/issues/', data),
  
  update: (id: string, data: any) =>
    api.put(`issues/issues/${id}/`, data),
  
  stats: () =>
    api.get('issues/stats/'),
}

export const ticketAPI = {
  list: () =>
    api.get('tickets/tickets/'),
  
  detail: (id: string) =>
    api.get(`tickets/tickets/${id}/`),
  
  create: (data: any) =>
    api.post('tickets/tickets/', data),
  
  update: (id: string, data: any) =>
    api.put(`tickets/tickets/${id}/`, data),
  
  delete: (id: string) =>
    api.delete(`tickets/tickets/${id}/`),
  
  stats: () =>
    api.get('tickets/stats/'),
}

export const dashboardAPI = {
  stats: () =>
    api.get('fleet/stats/dashboard/'),
}

export default api
