import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Company, CompanyStats } from '../types';

// Production API for iOS production builds, dev API for development
const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // For production builds, use production API
  // __DEV__ is automatically false in production builds (EAS build, App Store, etc.)
  if (!__DEV__) {
    // Production API URL - iOS production builds go straight to production
    return 'https://taki.pythonanywhere.com/api';
  }
  
  // Development: Use IP address for iOS simulator and Android device compatibility
  return 'http://192.168.1.110:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Log API configuration on initialization
console.log('[API Service] Base URL:', API_BASE_URL);

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      // Clone the response so we can read it multiple times if needed
      const responseClone = response.clone();
      
      // Read the response body once
      let responseData: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch {
          // If JSON parsing fails, try text
          responseData = await responseClone.text();
        }
      } else {
        responseData = await response.text();
      }
      
      if (!response.ok) {
        // Handle different error formats from Django REST Framework
        let errorMessage: string;
        
        if (typeof responseData === 'string') {
          errorMessage = responseData || `HTTP ${response.status} ${response.statusText}`;
        } else {
          errorMessage = responseData.detail || responseData.message;
          
          // Handle non_field_errors (common in DRF)
          if (responseData.non_field_errors && Array.isArray(responseData.non_field_errors)) {
            errorMessage = responseData.non_field_errors.join(', ');
          }
          
          // Handle field-specific errors
          if (!errorMessage && typeof responseData === 'object') {
            const fieldErrors = Object.entries(responseData)
              .filter(([key]) => key !== 'detail' && key !== 'message')
              .map(([key, value]: [string, any]) => {
                if (Array.isArray(value)) {
                  return `${key}: ${value.join(', ')}`;
                }
                return `${key}: ${value}`;
              });
            
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('; ');
            }
          }
        }
        
        // Fallback error message
        if (!errorMessage) {
          errorMessage = `Request failed with status ${response.status}`;
        }
        
        console.error(`[API Error] ${url}:`, errorMessage, responseData);
        throw new Error(errorMessage);
      }

      // Return the parsed data for successful responses
      return responseData as T;
    } catch (error) {
      console.error('[API Request failed]:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await this.request<{ user: User; token: string; message?: string }>('/account/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (response.token) {
        await AsyncStorage.setItem('auth_token', response.token);
      }

      return response;
    } catch (error) {
      console.error('[Login Error]:', error);
      throw error;
    }
  }

  async register(userData: any): Promise<{ user: User; token: string }> {
    try {
      console.log('[Register] Sending registration data:', { ...userData, password: '***' });
      const response = await this.request<{ user: User; token: string; message?: string }>('/account/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.token) {
        await AsyncStorage.setItem('auth_token', response.token);
      }

      return response;
    } catch (error) {
      console.error('[Register Error]:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/account/logout/', {
        method: 'POST',
      });
    } finally {
      await AsyncStorage.removeItem('auth_token');
    }
  }

  async getUserProfile(): Promise<User> {
    return this.request<User>('/account/profile/');
  }

  // Company endpoints
  async getCompanies(search?: string): Promise<Company[]> {
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }
      
      const queryString = params.toString();
      const endpoint = `/companies/companies/${queryString ? `?${queryString}` : ''}`;
      console.log('[API] Fetching companies from:', endpoint);
      
      const response = await this.request<{ results: Company[]; count?: number }>(endpoint);
      
      console.log('[API] Companies response:', {
        count: response.count,
        resultsCount: response.results?.length || 0
      });
      
      // Handle paginated response format from Django REST Framework
      if (response.results && Array.isArray(response.results)) {
        return response.results;
      }
      
      // Fallback: if response is directly an array
      if (Array.isArray(response)) {
        return response;
      }
      
      console.warn('[API] Unexpected companies response format:', response);
      return [];
    } catch (error) {
      console.error('[API] Error fetching companies:', error);
      throw error;
    }
  }

  async getCompany(slug: string): Promise<Company> {
    return this.request<Company>(`/companies/companies/${slug}/`);
  }

  async checkCompanyExists(slug: string): Promise<{
    exists: boolean;
    name?: string;
    description?: string;
    subscription_plan?: string;
  }> {
    const params = new URLSearchParams({ slug });
    return this.request(`/companies/companies/exists/?${params}`);
  }

  async getCompanyStats(): Promise<CompanyStats> {
    return this.request<CompanyStats>('/companies/companies/stats/');
  }

  // Utility methods
  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem('auth_token');
  }

  async clearStoredToken(): Promise<void> {
    return AsyncStorage.removeItem('auth_token');
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      // Try to access a public endpoint or health check
      const response = await fetch(`${this.baseURL}/account/login/`, {
        method: 'OPTIONS',
      });
      return response.ok || response.status !== 404;
    } catch (error) {
      console.error('[API Connection Test Failed]:', error);
      return false;
    }
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

export const apiService = new ApiService();
export default apiService;
