import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import BiometricAuthService, { BiometricCapabilities } from '../../services/biometric';

interface BiometricAuthProps {
  onAuthenticate: (credentials: { username: string; password: string }) => void;
  onError: (error: string) => void;
  style?: any;
  disabled?: boolean;
}

interface BiometricButtonProps {
  onPress: () => void;
  method: string;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

const BiometricButton: React.FC<BiometricButtonProps> = ({
  onPress,
  method,
  disabled = false,
  loading = false,
  style
}) => {
  const getIconName = (method: string): keyof typeof Ionicons.glyphMap => {
    switch (method) {
      case 'face':
        return 'face-recognition';
      case 'fingerprint':
        return 'fingerprint';
      case 'iris':
        return 'eye';
      default:
        return 'security';
    }
  };

  const getMethodName = (method: string): string => {
    switch (method) {
      case 'face':
        return 'Face ID';
      case 'fingerprint':
        return 'Fingerprint';
      case 'iris':
        return 'Iris Scan';
      default:
        return 'Biometric';
    }
  };

  const getColors = (method: string) => {
    switch (method) {
      case 'face':
        return {
          primary: '#007AFF',
          secondary: '#E3F2FD',
          icon: '#007AFF'
        };
      case 'fingerprint':
        return {
          primary: '#34C759',
          secondary: '#E8F5E8',
          icon: '#34C759'
        };
      case 'iris':
        return {
          primary: '#FF9500',
          secondary: '#FFF3E0',
          icon: '#FF9500'
        };
      default:
        return {
          primary: '#8E8E93',
          secondary: '#F2F2F7',
          icon: '#8E8E93'
        };
    }
  };

  const colors = getColors(method);

  return (
    <TouchableOpacity
      style={[
        styles.biometricButton,
        {
          backgroundColor: colors.secondary,
          borderColor: colors.primary,
          opacity: disabled ? 0.5 : 1
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.icon} />
        ) : (
          <Ionicons name={getIconName(method)} size={32} color={colors.icon} />
        )}
        <Text style={[styles.buttonText, { color: colors.primary }]}>
          {loading ? 'Authenticating...' : getMethodName(method)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const BiometricAuth: React.FC<BiometricAuthProps> = ({
  onAuthenticate,
  onError,
  style,
  disabled = false
}) => {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);
  const [loading, setLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkCapabilities();
    checkBiometricStatus();
  }, []);

  const checkCapabilities = async () => {
    try {
      const caps = await BiometricAuthService.checkCapabilities();
      setCapabilities(caps);
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
    }
  };

  const checkBiometricStatus = async () => {
    try {
      const enabled = await BiometricAuthService.isBiometricEnabled();
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error('Error checking biometric status:', error);
    }
  };

  const handleBiometricLogin = async (method: string) => {
    if (loading || disabled) return;

    setLoading(true);
    
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await BiometricAuthService.loginWithBiometrics();
      
      if (result.success && result.credentials) {
        // Success haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onAuthenticate(result.credentials);
      } else {
        // Error haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onError(result.error || 'Authentication failed');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      onError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableBiometric = async () => {
    Alert.alert(
      'Enable Biometric Login',
      'Would you like to enable biometric authentication for faster login? You can always disable this in settings.',
      [
        {
          text: 'Not Now',
          style: 'cancel'
        },
        {
          text: 'Enable',
          onPress: () => {
            // This would be called after successful login
            // The actual enabling would happen in the sign-in flow
            Alert.alert('Success', 'Biometric login will be enabled after you sign in successfully.');
          }
        }
      ]
    );
  };

  // Don't render if biometric is not available or not enrolled
  if (!capabilities || !capabilities.hasHardware || !capabilities.isEnrolled) {
    return null;
  }

  // Don't render if biometric login is not enabled and no methods available
  if (!biometricEnabled && capabilities.availableMethods.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          style={styles.enableButton}
          onPress={handleEnableBiometric}
          disabled={disabled}
        >
          <Ionicons name="fingerprint" size={24} color="#007AFF" />
          <Text style={styles.enableButtonText}>Enable Biometric Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Don't render if biometric login is not enabled
  if (!biometricEnabled) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Quick Login</Text>
      <Text style={styles.subtitle}>Use biometric authentication</Text>
      
      <View style={styles.buttonContainer}>
        {capabilities.availableMethods.map((method, index) => (
          <BiometricButton
            key={method}
            method={method}
            onPress={() => handleBiometricLogin(method)}
            disabled={disabled}
            loading={loading}
            style={index > 0 ? styles.additionalButton : undefined}
          />
        ))}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Authenticating...</Text>
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  biometricButton: {
    width: (width - 60) / 2,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  additionalButton: {
    marginTop: 0,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
  },
});

export default BiometricAuth;
