import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Company, CompanyStats } from '../types';

const API_BASE_URL = 'http://192.168.1.110:8000/api';

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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; token: string }>('/account/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.token) {
      await AsyncStorage.setItem('auth_token', response.token);
    }

    return response;
  }

  async register(userData: any): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; token: string }>('/account/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      await AsyncStorage.setItem('auth_token', response.token);
    }

    return response;
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
    const params = new URLSearchParams();
    if (search) {
      params.append('search', search);
    }
    
    const response = await this.request<{ results: Company[] }>(`/companies/companies/?${params}`);
    return response.results;
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
}

export const apiService = new ApiService();
export default apiService;
