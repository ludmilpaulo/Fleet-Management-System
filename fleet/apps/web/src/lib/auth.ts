import axios from 'axios';
import Cookies from 'js-cookie';

import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface Company {
  id: number;
  name: string;
  slug: string;
  description?: string;
  email: string;
  phone?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  full_address?: string;
  logo?: string;
  primary_color: string;
  secondary_color: string;
  max_users: number;
  max_vehicles: number;
  subscription_plan: 'basic' | 'professional' | 'enterprise';
  is_active: boolean;
  trial_ends_at?: string;
  is_trial_active?: boolean;
  current_user_count?: number;
  current_vehicle_count?: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'admin' | 'driver' | 'staff' | 'inspector';
  role_display: string;
  phone_number?: string;
  employee_id?: string;
  department?: string;
  hire_date?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  company: Company;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'driver' | 'staff' | 'inspector';
  phone_number?: string;
  employee_id?: string;
  department?: string;
  hire_date?: string;
  company_slug: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Login
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, data);
    const { token } = response.data;
    
    // Store token in cookie
    Cookies.set('auth_token', token, { expires: 7 }); // 7 days
    
    return response.data;
  },

  // Register
  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
    const { token } = response.data;
    
    // Store token in cookie
    Cookies.set('auth_token', token, { expires: 7 }); // 7 days
    
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('auth_token');
    }
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
    return response.data;
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch(API_CONFIG.ENDPOINTS.AUTH.ME, data);
    return response.data;
  },

  // Change password
  changePassword: async (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ token: string; message: string }> => {
    const response = await api.post('/change-password/', data);
    
    // Update token in cookie
    Cookies.set('auth_token', response.data.token, { expires: 7 });
    
    return response.data;
  },

  // Get users list (admin/staff only)
  getUsers: async (params?: {
    role?: string;
    department?: string;
    search?: string;
  }): Promise<{ count: number; results: User[] }> => {
    const response = await api.get('/users/', { params });
    return response.data;
  },

  // Get user by ID
  getUser: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },

  // Update user (admin/staff only)
  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.patch(`/users/${id}/`, data);
    return response.data;
  },

  // Delete user (admin/staff only)
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}/`);
  },

  // Get user statistics (admin only)
  getUserStats: async (): Promise<{
    company_name: string;
    total_users: number;
    active_users: number;
    inactive_users: number;
    users_by_role: Record<string, number>;
    recent_registrations: number;
  }> => {
    const response = await api.get('/stats/');
    return response.data;
  },
};

// Company API functions
export const companyAPI = {
  // Get companies list
  getCompanies: async (params?: {
    search?: string;
  }): Promise<Company[]> => {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/companies/companies/`, { params });
    return response.data.results;
  },

  // Get company by slug
  getCompany: async (slug: string): Promise<Company> => {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/companies/companies/${slug}/`);
    return response.data;
  },

  // Check if company exists
  checkCompanyExists: async (slug: string): Promise<{
    exists: boolean;
    name?: string;
    description?: string;
    subscription_plan?: string;
  }> => {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/companies/companies/exists/`, {
      params: { slug }
    });
    return response.data;
  },

  // Get company statistics (authenticated)
  getCompanyStats: async (): Promise<{
    company_name: string;
    total_users: number;
    max_users: number;
    user_limit_reached: boolean;
    total_vehicles: number;
    max_vehicles: number;
    vehicle_limit_reached: boolean;
    subscription_plan: string;
    is_trial_active: boolean;
    trial_ends_at?: string;
    users_by_role: Record<string, number>;
    recent_registrations: number;
  }> => {
    const response = await api.get(`${API_CONFIG.BASE_URL}/companies/companies/stats/`);
    return response.data;
  },
};

// Utility functions
export const getCurrentUser = (): User | null => {
  const token = Cookies.get('auth_token');
  if (!token) return null;
  
  // Try to get user from localStorage first
  const userStr = localStorage.getItem('current_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem('current_user');
    }
  }
  
  return null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem('current_user', JSON.stringify(user));
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem('current_user');
  Cookies.remove('auth_token');
};

export const isAuthenticated = (): boolean => {
  return !!Cookies.get('auth_token');
};

export const hasRole = (user: User | null, roles: string[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  
  const permissions = {
    admin: ['all'],
    driver: ['view_vehicles', 'update_assigned_vehicles', 'view_own_profile'],
    staff: ['view_vehicles', 'manage_vehicles', 'view_users', 'manage_users'],
    inspector: ['view_vehicles', 'inspect_vehicles', 'create_inspection_reports']
  };
  
  const userPermissions = permissions[user.role] || [];
  return userPermissions.includes('all') || userPermissions.includes(permission);
};
