import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import BiometricAuthService, { BiometricCapabilities } from '../../services/biometric';

interface BiometricSettingsProps {
  onToggle: (enabled: boolean) => void;
  style?: any;
}

const BiometricSettings: React.FC<BiometricSettingsProps> = ({
  onToggle,
  style
}) => {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleToggleBiometric = async () => {
    if (loading) return;

    setLoading(true);

    try {
      if (biometricEnabled) {
        // Disable biometric login
        Alert.alert(
          'Disable Biometric Login',
          'Are you sure you want to disable biometric authentication? You will need to use your password for future logins.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setLoading(false)
            },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                try {
                  await BiometricAuthService.disableBiometricLogin();
                  setBiometricEnabled(false);
                  onToggle(false);
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert('Success', 'Biometric login has been disabled.');
                } catch (error) {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  Alert.alert('Error', 'Failed to disable biometric login.');
                } finally {
                  setLoading(false);
                }
              }
            }
          ]
        );
      } else {
        // Enable biometric login
        Alert.alert(
          'Enable Biometric Login',
          'Would you like to enable biometric authentication? You can use your fingerprint or face recognition for faster logins.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setLoading(false)
            },
            {
              text: 'Enable',
              onPress: async () => {
                try {
                  // First authenticate to ensure user is authorized
                  const authResult = await BiometricAuthService.authenticate(
                    'Enable biometric login for your account'
                  );

                  if (authResult.success) {
                    // Note: In a real app, you would need the current user's credentials
                    // For demo purposes, we'll just enable it
                    setBiometricEnabled(true);
                    onToggle(true);
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert(
                      'Success',
                      'Biometric login has been enabled. You can now use biometric authentication for future logins.'
                    );
                  } else {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    Alert.alert('Authentication Failed', authResult.error || 'Biometric authentication failed.');
                  }
                } catch (error) {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  Alert.alert('Error', 'Failed to enable biometric login.');
                } finally {
                  setLoading(false);
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      setLoading(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  // Don't render if biometric is not available
  if (!capabilities || !capabilities.hasHardware) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="finger-print" size={24} color="#8E8E93" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Biometric Login</Text>
            <Text style={styles.subtitle}>Not available on this device</Text>
          </View>
        </View>
      </View>
    );
  }

  // Don't render if biometric is not enrolled
  if (!capabilities.isEnrolled) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="finger-print" size={24} color="#8E8E93" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Biometric Login</Text>
            <Text style={styles.subtitle}>No biometric data enrolled</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.setupButton}
          onPress={() => {
            Alert.alert(
              'Setup Required',
              'Please set up biometric authentication in your device settings first.',
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={styles.setupButtonText}>Setup in Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getAvailableMethods = () => {
    return capabilities.availableMethods.map(method => {
      switch (method) {
        case 'face':
          return 'Face ID';
        case 'fingerprint':
          return 'Fingerprint';
        case 'iris':
          return 'Iris Scan';
        default:
          return method;
      }
    }).join(', ');
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name="finger-print" 
            size={24} 
            color={biometricEnabled ? "#34C759" : "#8E8E93"} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Biometric Login</Text>
          <Text style={styles.subtitle}>
            {biometricEnabled ? 'Enabled' : 'Disabled'} • {getAvailableMethods()}
          </Text>
        </View>
        <Switch
          value={biometricEnabled}
          onValueChange={handleToggleBiometric}
          disabled={loading}
          trackColor={{ false: '#E5E5EA', true: '#34C759' }}
          thumbColor={biometricEnabled ? '#FFFFFF' : '#FFFFFF'}
          ios_backgroundColor="#E5E5EA"
        />
      </View>

      {biometricEnabled && (
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={16} color="#007AFF" />
          <Text style={styles.infoText}>
            Your biometric data is stored securely on your device and never shared.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  setupButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  setupButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 8,
    flex: 1,
  },
});

export default BiometricSettings;
