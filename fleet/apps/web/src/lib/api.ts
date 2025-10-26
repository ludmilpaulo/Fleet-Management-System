import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'
//const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Token ${token}`
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
    api.post('/token/', { email, password }),
  
  refresh: (refresh: string) =>
    api.post('/token/refresh/', { refresh }),
  
  register: (data: any) =>
    api.post('/account/register/', data),
  
  me: () =>
    api.get('/account/me/'),
  
  logout: () =>
    api.post('/account/logout/'),
}

export const companyAPI = {
  list: () =>
    api.get('/companies/'),
  
  detail: (id: string) =>
    api.get(`/companies/${id}/`),
  
  create: (data: any) =>
    api.post('/companies/', data),
  
  update: (id: string, data: any) =>
    api.put(`/companies/${id}/`, data),
  
  stats: (id: string) =>
    api.get(`/companies/${id}/stats/`),
}

export const vehicleAPI = {
  list: () =>
    api.get('/fleet/vehicles/'),
  
  detail: (id: string) =>
    api.get(`/fleet/vehicles/${id}/`),
  
  create: (data: any) =>
    api.post('/fleet/vehicles/', data),
  
  update: (id: string, data: any) =>
    api.put(`/fleet/vehicles/${id}/`, data),
  
  delete: (id: string) =>
    api.delete(`/fleet/vehicles/${id}/`),
  
  stats: () =>
    api.get('/fleet/stats/vehicles/'),
}

export const shiftAPI = {
  list: () =>
    api.get('/fleet/shifts/'),
  
  detail: (id: string) =>
    api.get(`/fleet/shifts/${id}/`),
  
  start: (data: any) =>
    api.post('/fleet/shifts/start/', data),
  
  end: (id: string, data: any) =>
    api.post(`/fleet/shifts/${id}/end/`, data),
  
  stats: () =>
    api.get('/fleet/stats/shifts/'),
}

export const inspectionAPI = {
  list: () =>
    api.get('/inspections/inspections/'),
  
  detail: (id: string) =>
    api.get(`/inspections/inspections/${id}/`),
  
  create: (data: any) =>
    api.post('/inspections/inspections/', data),
  
  complete: (id: string, data: any) =>
    api.post(`/inspections/inspections/${id}/complete/`, data),
  
  photos: (id: string) =>
    api.get(`/inspections/inspections/${id}/photos/`),
  
  uploadPhoto: (data: any) =>
    api.post('/inspections/photos/', data),
}

export const issueAPI = {
  list: () =>
    api.get('/issues/issues/'),
  
  detail: (id: string) =>
    api.get(`/issues/issues/${id}/`),
  
  create: (data: any) =>
    api.post('/issues/issues/', data),
  
  update: (id: string, data: any) =>
    api.put(`/issues/issues/${id}/`, data),
  
  stats: () =>
    api.get('/issues/stats/'),
}

export const ticketAPI = {
  list: () =>
    api.get('/tickets/tickets/'),
  
  detail: (id: string) =>
    api.get(`/tickets/tickets/${id}/`),
  
  create: (data: any) =>
    api.post('/tickets/tickets/', data),
  
  update: (id: string, data: any) =>
    api.put(`/tickets/tickets/${id}/`, data),
  
  stats: () =>
    api.get('/tickets/stats/'),
}

export const dashboardAPI = {
  stats: () =>
    api.get('/fleet/stats/dashboard/'),
}

export default api
