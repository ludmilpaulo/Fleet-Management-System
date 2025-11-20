import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { analytics } from './mixpanel';

// Helper to detect if running on physical device
const isPhysicalDevice = Platform.OS === 'ios' || Platform.OS === 'android';

export interface AuthUser {
  id: number | string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role: 'admin' | 'driver' | 'staff' | 'inspector';
  role_display?: string;
  phone_number?: string;
  employee_id?: string;
  department?: string;
  is_active?: boolean;
  company?: {
    id?: number;
    name: string;
    slug?: string;
  } | string; // Can be object or string depending on backend response
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  message: string;
}

class AuthService {
  // For physical devices, use network IP instead of localhost
  // Check EXPO_PUBLIC_API_URL environment variable first, then use network IP for physical devices
  private baseURL = (() => {
    if (process.env.EXPO_PUBLIC_API_URL) {
      return `${process.env.EXPO_PUBLIC_API_URL}/account`;
    }
    if (__DEV__) {
      // Use network IP for physical devices (Android/iOS on real devices)
      // Default to 192.168.1.110 - change this to your computer's network IP
      // You can also set EXPO_PUBLIC_API_URL=http://YOUR_IP:8000/api in .env
      const networkIP = process.env.EXPO_PUBLIC_NETWORK_IP || '192.168.1.110';
      const apiURL = isPhysicalDevice 
        ? `http://${networkIP}:8000/api`
        : 'http://localhost:8000/api';
      const fullURL = `${apiURL}/account`;
      console.log(`[AuthService] Using API URL: ${fullURL} (Device: ${Platform.OS}, Physical: ${isPhysicalDevice}, Network IP: ${networkIP})`);
      return fullURL;
    }
    return 'https://taki.pythonanywhere.com/api/account';
  })();
  private token: string | null = null;
  private user: AuthUser | null = null;

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        let errorType: 'username_not_found' | 'incorrect_password' | 'account_disabled' | 'network_error' | 'unknown' = 'unknown';
        
        try {
          const errorData = await response.json();
          
          // Handle Django REST Framework error format
          // Errors can be: { detail: "..." }, { non_field_errors: [...] }, or { username: [...], password: [...] }
          if (errorData.detail) {
            errorMessage = errorData.detail;
            // Check for specific error types
            if (errorMessage.toLowerCase().includes('does not exist') || 
                errorMessage.toLowerCase().includes('username or email does not exist')) {
              errorType = 'username_not_found';
            } else if (errorMessage.toLowerCase().includes('incorrect password') ||
                       errorMessage.toLowerCase().includes('password')) {
              errorType = 'incorrect_password';
            } else if (errorMessage.toLowerCase().includes('disabled')) {
              errorType = 'account_disabled';
            }
          } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            errorMessage = errorData.non_field_errors[0];
            // Check for specific error types in non_field_errors (Django REST Framework format)
            const lowerMessage = errorMessage.toLowerCase();
            if (lowerMessage.includes('does not exist') || 
                lowerMessage.includes('username or email does not exist')) {
              errorType = 'username_not_found';
            } else if (lowerMessage.includes('incorrect password') ||
                       (lowerMessage.includes('password') && !lowerMessage.includes('required'))) {
              errorType = 'incorrect_password';
            } else if (lowerMessage.includes('disabled')) {
              errorType = 'account_disabled';
            }
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else {
            // Try to extract first error message from any field
            const firstError = Object.values(errorData)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = firstError[0];
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            }
          }
        } catch (parseError) {
          // If JSON parsing fails, it might be a network error
          if (response.status === 0 || !response.status) {
            errorMessage = 'Network error. Please check your internet connection and ensure the backend server is running.';
            errorType = 'network_error';
          } else {
            errorMessage = `Login failed (HTTP ${response.status})`;
          }
        }

        const error = new Error(errorMessage) as any;
        error.errorType = errorType;
        throw error;
      }

      const data: AuthResponse = await response.json();
      
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
    } catch (error: any) {
      analytics.track('Login Failed', {
        username,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.errorType || 'unknown'
      });
      throw error;
    }
  }

  async register(userData: any): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      
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
      analytics.track('Registration Failed', {
        username: userData.username,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
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
      // Initialize auth from stored data first
      await this.initializeAuth();
      
      if (this.user) {
        return this.user;
      }

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
        await SecureStore.setItemAsync('user_data', JSON.stringify(user));
        return user;
      } else {
        // Token is invalid, clear stored data
        await this.clearAuthData();
        this.token = null;
        this.user = null;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      await this.clearAuthData();
      this.token = null;
      this.user = null;
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
