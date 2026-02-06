import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { analytics } from './mixpanel';

export interface AuthUser {
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
  is_active: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  message: string;
}

class AuthService {
  private getBaseURL(): string {
    if (process.env.EXPO_PUBLIC_API_URL) {
      return `${process.env.EXPO_PUBLIC_API_URL}/account`;
    }
    
    // For production builds, use production API
    // __DEV__ is automatically false in production builds (EAS build, App Store, etc.)
    if (!__DEV__) {
      // Production API URL - iOS production builds go straight to production
      return 'https://taki.pythonanywhere.com/api/account';
    }
    
    // Development: Use IP address for iOS simulator and Android device compatibility
    return 'http://192.168.1.110:8000/api/account';
  }
  
  private baseURL = this.getBaseURL();
  private token: string | null = null;
  private user: AuthUser | null = null;

  constructor() {
    console.log('[AuthService] Initialized with baseURL:', this.baseURL);
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Attempting login to:', `${this.baseURL}/login/`);
      const response = await fetch(`${this.baseURL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('[AuthService] Login response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          console.error('[AuthService] Login error response:', errorData);
          
          // Handle different error formats from Django REST Framework
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            errorMessage = errorData.non_field_errors.join(', ');
          } else if (typeof errorData === 'object') {
            // Handle field-specific errors
            const fieldErrors = Object.entries(errorData)
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
        } catch (parseError) {
          // If response is not JSON, try to get text
          try {
            const text = await response.text();
            errorMessage = text || `HTTP ${response.status} ${response.statusText}`;
          } catch {
            errorMessage = `HTTP ${response.status} ${response.statusText}`;
          }
        }
        
        const error = new Error(errorMessage);
        analytics.track('Login Failed', {
          username,
          error: errorMessage,
          status: response.status
        });
        throw error;
      }

      const data: AuthResponse = await response.json();
      console.log('[AuthService] Login successful for user:', data.user.username);
      
      // Store token and user data securely
      await this.storeAuthData(data.token, data.user);
      
      this.token = data.token;
      this.user = data.user;

      // Track login event
      analytics.track('User Login', {
        user_id: data.user.id,
        role: data.user.role,
        method: 'password'
      });

      return data;
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      if (error instanceof Error) {
        analytics.track('Login Failed', {
          username,
          error: error.message
        });
        throw error;
      }
      // Handle network errors
      const networkError = new Error('Network error. Please check your connection and ensure the backend server is running.');
      analytics.track('Login Failed', {
        username,
        error: 'Network error'
      });
      throw networkError;
    }
  }

  async register(userData: any): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Attempting registration to:', `${this.baseURL}/register/`);
      const response = await fetch(`${this.baseURL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('[AuthService] Registration response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          console.error('[AuthService] Registration error response:', errorData);
          
          // Handle different error formats from Django REST Framework
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            errorMessage = errorData.non_field_errors.join(', ');
          } else if (typeof errorData === 'object') {
            // Handle field-specific errors
            const fieldErrors = Object.entries(errorData)
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
        } catch (parseError) {
          // If response is not JSON, try to get text
          try {
            const text = await response.text();
            errorMessage = text || `HTTP ${response.status} ${response.statusText}`;
          } catch {
            errorMessage = `HTTP ${response.status} ${response.statusText}`;
          }
        }
        
        const error = new Error(errorMessage);
        analytics.track('Registration Failed', {
          username: userData.username,
          error: errorMessage,
          status: response.status
        });
        throw error;
      }

      const data: AuthResponse = await response.json();
      console.log('[AuthService] Registration successful for user:', data.user.username);
      
      // Store token and user data securely
      await this.storeAuthData(data.token, data.user);
      
      this.token = data.token;
      this.user = data.user;

      // Track registration event
      analytics.track('User Registration', {
        user_id: data.user.id,
        role: data.user.role
      });

      return data;
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      if (error instanceof Error) {
        analytics.track('Registration Failed', {
          username: userData.username,
          error: error.message
        });
        throw error;
      }
      // Handle network errors
      const networkError = new Error('Network error. Please check your connection and ensure the backend server is running.');
      analytics.track('Registration Failed', {
        username: userData.username,
        error: 'Network error'
      });
      throw networkError;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${this.baseURL}/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${this.token}`,
          },
        });
      }

      // Clear stored data
      await this.clearAuthData();
      
      this.token = null;
      this.user = null;

      // Track logout event
      analytics.track('User Logout', {
        user_id: this.user?.id
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if server logout fails
      await this.clearAuthData();
      this.token = null;
      this.user = null;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.user) {
      return this.user;
    }

    try {
      const token = await this.getStoredToken();
      if (!token) return null;

      const response = await fetch(`${this.baseURL}/profile/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        this.user = user;
        return user;
      }
    } catch (error) {
      console.error('Get current user error:', error);
    }

    return null;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  // Biometric Authentication Methods
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      return false;
    }
  }

  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error('Biometric authentication not available');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Fleet Management',
        fallbackLabel: 'Use Password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        analytics.track('Biometric Authentication Success', {
          method: result.authenticationType || 'unknown'
        });
        return true;
      } else {
        analytics.track('Biometric Authentication Failed', {
          error: result.error || 'unknown'
        });
        return false;
      }
    } catch (error) {
      analytics.track('Biometric Authentication Error', {
        error: error instanceof Error ? error.message : 'unknown'
      });
      return false;
    }
  }

  async setupBiometricAuth(): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error('Biometric authentication not available on this device');
      }

      // Store biometric preference
      await SecureStore.setItemAsync('biometric_enabled', 'true');
      
      analytics.track('Biometric Setup Success');
      return true;
    } catch (error) {
      analytics.track('Biometric Setup Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      });
      return false;
    }
  }

  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync('biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      return false;
    }
  }

  async disableBiometricAuth(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('biometric_enabled');
      analytics.track('Biometric Disabled');
    } catch (error) {
      console.error('Failed to disable biometric auth:', error);
    }
  }

  // Face Recognition (using camera + face detection)
  async isFaceRecognitionAvailable(): Promise<boolean> {
    // For now, we'll use basic camera availability
    // In a real app, you'd integrate with face recognition libraries
    return true;
  }

  async authenticateWithFaceRecognition(): Promise<boolean> {
    try {
      // This would integrate with face recognition in a real implementation
      // For now, we'll simulate the process
      analytics.track('Face Recognition Attempt');
      
      // Simulate face recognition process
      return new Promise((resolve) => {
        setTimeout(() => {
          // In real implementation, this would analyze captured face
          resolve(true);
        }, 2000);
      });
    } catch (error) {
      analytics.track('Face Recognition Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      });
      return false;
    }
  }

  // Private helper methods
  private async storeAuthData(token: string, user: AuthUser): Promise<void> {
    try {
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store auth data:', error);
    }
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  // Initialize auth state from stored data
  async initializeAuth(): Promise<void> {
    try {
      const token = await this.getStoredToken();
      const userData = await SecureStore.getItemAsync('user_data');
      
      if (token && userData) {
        this.token = token;
        this.user = JSON.parse(userData);
        
        // Verify token is still valid
        const isValid = await this.verifyToken();
        if (!isValid) {
          await this.clearAuthData();
          this.token = null;
          this.user = null;
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      await this.clearAuthData();
      this.token = null;
      this.user = null;
    }
  }

  private async verifyToken(): Promise<boolean> {
    try {
      if (!this.token) return false;
      
      const response = await fetch(`${this.baseURL}/profile/`, {
        headers: {
          'Authorization': `Token ${this.token}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();
