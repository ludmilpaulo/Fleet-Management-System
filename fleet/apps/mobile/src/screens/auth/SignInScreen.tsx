import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import BiometricAuth from '../../components/auth/BiometricAuth';
import BiometricAuthService from '../../services/biometric';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { AuthStackParamList } from '../../types';

type SignInScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignIn'>;

export const SignInScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    checkBiometricStatus();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Navigation will be handled by the main app
    }
  }, [isAuthenticated, user]);

  const checkBiometricStatus = async () => {
    try {
      const enabled = await BiometricAuthService.isBiometricEnabled();
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error('Error checking biometric status:', error);
    }
  };

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await dispatch(loginUser({ username, password })).unwrap();
      
      // Offer to enable biometric login after successful sign-in
      if (!biometricEnabled) {
        Alert.alert(
          'Enable Biometric Login',
          'Would you like to enable biometric authentication for faster future logins?',
          [
            {
              text: 'Not Now',
              style: 'cancel'
            },
            {
              text: 'Enable',
              onPress: async () => {
                try {
                  await BiometricAuthService.enableBiometricLogin(username, password);
                  setBiometricEnabled(true);
                  dispatch(addNotification({
                    type: 'success',
                    title: 'Biometric Login Enabled',
                    message: 'You can now use biometric authentication for future logins.',
                  }));
                } catch (error) {
                  console.error('Error enabling biometric login:', error);
                }
              }
            }
          ]
        );
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${user?.first_name || user?.username}!`,
      }));
    } catch (err: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Login Failed',
        message: err || 'Invalid credentials',
      }));
    }
  };

  const handleBiometricAuth = async (credentials: { username: string; password: string }) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Biometric Login Successful',
        message: `Welcome back, ${user?.first_name || user?.username}!`,
      }));
    } catch (err: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Biometric Login Failed',
        message: err || 'Authentication failed',
      }));
    }
  };

  const handleBiometricError = (error: string) => {
    dispatch(addNotification({
      type: 'error',
      title: 'Biometric Authentication Failed',
      message: error,
    }));
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#eff6ff', '#ffffff', '#f0f9ff']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  style={styles.logo}
                >
                  <Ionicons name="car" size={32} color="#ffffff" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Fleet Management</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>

            {/* Sign In Form */}
            <Card style={styles.formCard} variant="elevated">
              <Text style={styles.formTitle}>Welcome Back</Text>
              <Text style={styles.formSubtitle}>
                Enter your credentials to access your dashboard
              </Text>

              <Input
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                leftIcon="person-outline"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                title={isLoading ? 'Signing In...' : 'Sign In'}
                onPress={handleSignIn}
                loading={isLoading}
                disabled={isLoading}
                style={styles.signInButton}
              />

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <Button
                  title="Sign Up"
                  onPress={handleSignUp}
                  variant="ghost"
                  size="sm"
                />
              </View>

              {/* Biometric Authentication */}
              <BiometricAuth
                onAuthenticate={handleBiometricAuth}
                onError={handleBiometricError}
                disabled={isLoading}
                style={styles.biometricContainer}
              />
            </Card>

            {/* Demo Credentials */}
            <Card style={styles.demoCard} variant="outlined">
              <Text style={styles.demoTitle}>Demo Credentials</Text>
              <View style={styles.demoGrid}>
                <View style={styles.demoItem}>
                  <Text style={styles.demoRole}>Admin</Text>
                  <Text style={styles.demoCreds}>admin / admin123</Text>
                </View>
                <View style={styles.demoItem}>
                  <Text style={styles.demoRole}>Staff</Text>
                  <Text style={styles.demoCreds}>staff1 / staff123</Text>
                </View>
                <View style={styles.demoItem}>
                  <Text style={styles.demoRole}>Driver</Text>
                  <Text style={styles.demoCreds}>driver1 / driver123</Text>
                </View>
                <View style={styles.demoItem}>
                  <Text style={styles.demoRole}>Inspector</Text>
                  <Text style={styles.demoCreds}>inspector1 / inspector123</Text>
                </View>
              </View>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 8,
    flex: 1,
  },
  signInButton: {
    marginBottom: 16,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#6b7280',
  },
  biometricContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  demoCard: {
    backgroundColor: '#f9fafb',
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  demoItem: {
    width: '48%',
    marginBottom: 12,
  },
  demoRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  demoCreds: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
