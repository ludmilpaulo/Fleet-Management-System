import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  method?: 'fingerprint' | 'face' | 'iris' | 'voice';
}

export interface BiometricCapabilities {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  availableMethods: string[];
}

class BiometricAuthService {
  private static instance: BiometricAuthService;

  public static getInstance(): BiometricAuthService {
    if (!BiometricAuthService.instance) {
      BiometricAuthService.instance = new BiometricAuthService();
    }
    return BiometricAuthService.instance;
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async checkCapabilities(): Promise<BiometricCapabilities> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      const availableMethods: string[] = [];
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        availableMethods.push('fingerprint');
      }
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        availableMethods.push('face');
      }
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        availableMethods.push('iris');
      }

      return {
        hasHardware,
        isEnrolled,
        supportedTypes,
        availableMethods
      };
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      return {
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        availableMethods: []
      };
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(reason: string = 'Authenticate to access your account'): Promise<BiometricAuthResult> {
    try {
      const capabilities = await this.checkCapabilities();
      
      if (!capabilities.hasHardware) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device'
        };
      }

      if (!capabilities.isEnrolled) {
        return {
          success: false,
          error: 'No biometric data is enrolled. Please set up biometric authentication in your device settings.'
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        requireConfirmation: false
      });

      if (result.success) {
        // Determine which method was used
        let method: 'fingerprint' | 'face' | 'iris' | 'voice' = 'fingerprint';
        if (capabilities.availableMethods.includes('face')) {
          method = 'face';
        } else if (capabilities.availableMethods.includes('iris')) {
          method = 'iris';
        }

        return {
          success: true,
          method
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Store user credentials securely after biometric authentication
   */
  async storeCredentials(username: string, password: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync('biometric_username', username);
      await SecureStore.setItemAsync('biometric_password', password);
      await SecureStore.setItemAsync('biometric_enabled', 'true');
      return true;
    } catch (error) {
      console.error('Error storing credentials:', error);
      return false;
    }
  }

  /**
   * Retrieve stored credentials
   */
  async getStoredCredentials(): Promise<{ username: string; password: string } | null> {
    try {
      const username = await SecureStore.getItemAsync('biometric_username');
      const password = await SecureStore.getItemAsync('biometric_password');
      
      if (username && password) {
        return { username, password };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  /**
   * Check if biometric login is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync('biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  }

  /**
   * Enable biometric login for user
   */
  async enableBiometricLogin(username: string, password: string): Promise<boolean> {
    try {
      // First authenticate to ensure user is authorized
      const authResult = await this.authenticate('Enable biometric login for your account');
      
      if (!authResult.success) {
        return false;
      }

      // Store credentials securely
      return await this.storeCredentials(username, password);
    } catch (error) {
      console.error('Error enabling biometric login:', error);
      return false;
    }
  }

  /**
   * Disable biometric login
   */
  async disableBiometricLogin(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync('biometric_username');
      await SecureStore.deleteItemAsync('biometric_password');
      await SecureStore.deleteItemAsync('biometric_enabled');
      return true;
    } catch (error) {
      console.error('Error disabling biometric login:', error);
      return false;
    }
  }

  /**
   * Login with biometrics (authenticate + retrieve credentials)
   */
  async loginWithBiometrics(): Promise<{
    success: boolean;
    credentials?: { username: string; password: string };
    error?: string;
    method?: 'fingerprint' | 'face' | 'iris' | 'voice';
  }> {
    try {
      // Check if biometric login is enabled
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        return {
          success: false,
          error: 'Biometric login is not enabled'
        };
      }

      // Authenticate user
      const authResult = await this.authenticate('Login to your account');
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error
        };
      }

      // Retrieve stored credentials
      const credentials = await this.getStoredCredentials();
      if (!credentials) {
        return {
          success: false,
          error: 'No stored credentials found'
        };
      }

      return {
        success: true,
        credentials,
        method: authResult.method
      };
    } catch (error) {
      console.error('Biometric login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get user-friendly method name
   */
  getMethodDisplayName(method?: string): string {
    switch (method) {
      case 'face':
        return 'Face Recognition';
      case 'fingerprint':
        return 'Fingerprint';
      case 'iris':
        return 'Iris Scan';
      case 'voice':
        return 'Voice Recognition';
      default:
        return 'Biometric Authentication';
    }
  }

  /**
   * Get method icon name for UI
   */
  getMethodIcon(method?: string): string {
    switch (method) {
      case 'face':
        return 'face-recognition';
      case 'fingerprint':
        return 'fingerprint';
      case 'iris':
        return 'eye';
      case 'voice':
        return 'microphone';
      default:
        return 'security';
    }
  }
}

export default BiometricAuthService.getInstance();
