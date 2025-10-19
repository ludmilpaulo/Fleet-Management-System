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
  private baseURL = 'https://www.fleetia.online/api/account';
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
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
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
    } catch (error) {
      analytics.track('Login Failed', {
        username,
        error: error instanceof Error ? error.message : 'Unknown error'
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
