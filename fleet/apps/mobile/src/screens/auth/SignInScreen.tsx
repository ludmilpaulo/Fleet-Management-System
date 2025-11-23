import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      dispatch(addNotification({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${user?.fullName || user?.username}!`,
      }));
    } catch (err: any) {
      // Extract error type and message
      const errorPayload = typeof err === 'object' && err !== null ? err : { message: err, errorType: 'unknown' };
      const errorMessage = errorPayload.message || typeof err === 'string' ? err : 'Login failed';
      const errorType = errorPayload.errorType || 'unknown';
      
      // Provide specific, user-friendly alerts based on error type
      let alertTitle = 'Login Failed';
      let alertMessage = errorMessage;
      let alertButtons: any[] = [{ text: 'OK', style: 'default' }];
      
      if (errorMessage.toLowerCase().includes('does not exist') || 
          errorMessage.toLowerCase().includes('username or email does not exist')) {
        alertTitle = 'Account Not Found';
        alertMessage = 'The username or email you entered does not exist. Please check your credentials and try again.\n\nIf you don\'t have an account, please register first.';
        alertButtons = [
          { text: 'Try Again', style: 'cancel' },
          { 
            text: 'Register', 
            onPress: () => navigation.navigate('SignUp'),
            style: 'default'
          }
        ];
      } else if (errorMessage.toLowerCase().includes('incorrect password')) {
        alertTitle = 'Incorrect Password';
        alertMessage = 'The password you entered is incorrect. Please try again.\n\nIf you\'ve forgotten your password, please contact your administrator.';
      } else if (errorMessage.toLowerCase().includes('disabled')) {
        alertTitle = 'Account Disabled';
        alertMessage = 'Your account has been disabled. Please contact your administrator or support team for assistance.';
      } else if (errorMessage.toLowerCase().includes('network') || 
                 errorMessage.toLowerCase().includes('connection') ||
                 errorMessage.toLowerCase().includes('fetch')) {
        alertTitle = 'Connection Error';
        alertMessage = 'Unable to connect to the server. Please check:\n\n• Your internet connection\n• That the backend server is running\n• That your device is on the same network as the server';
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(alertTitle, alertMessage, alertButtons);
      
      dispatch(addNotification({
        type: 'error',
        title: alertTitle,
        message: alertMessage,
      }));
    }
  };

  const handleBiometricAuth = async (credentials: { username: string; password: string }) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Biometric Login Successful',
        message: `Welcome back, ${user?.fullName || user?.username}!`,
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={['#eff6ff', '#ffffff', '#f0f9ff']}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, padding: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="items-center mb-8 mt-8">
              <View className="mb-6">
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  className="w-20 h-20 rounded-3xl items-center justify-center"
                  style={{
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 12,
                  }}
                >
                  <Ionicons name="car" size={40} color="#ffffff" />
                </LinearGradient>
              </View>
              <Text className="text-4xl font-bold text-slate-900 mb-2">Welcome Back</Text>
              <Text className="text-base text-slate-600 text-center max-w-xs">
                Sign in to access your fleet management dashboard
              </Text>
            </View>

            {/* Sign In Form */}
            <Card className="mb-6 p-6 rounded-3xl shadow-xl bg-white dark:bg-slate-800" variant="elevated">
              <View className="mb-6">
                <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
                  Sign In
                </Text>
                <Text className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  Enter your credentials to continue
              </Text>
              </View>

              <Input
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                leftIcon="person-outline"
                autoCapitalize="none"
                autoCorrect={false}
                className="mb-4"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowPassword(!showPassword);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                className="mb-4"
              />

              {error && (
                <View className="flex-row items-center bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-4 border border-red-200 dark:border-red-800">
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  <Text className="text-sm text-red-600 dark:text-red-400 ml-2 flex-1">{error}</Text>
                </View>
              )}

              <Button
                title={isLoading ? 'Signing In...' : 'Sign In'}
                onPress={handleSignIn}
                loading={isLoading}
                disabled={isLoading}
                className="mb-4"
                size="lg"
              />

              <View className="flex-row justify-center items-center mb-5">
                <Text className="text-sm text-slate-600 dark:text-slate-400 mr-2">
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
                  <Text className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Biometric Authentication */}
              <View className="pt-5 border-t border-gray-200 dark:border-gray-700">
                <BiometricAuth
                  onAuthenticate={handleBiometricAuth}
                  onError={handleBiometricError}
                  disabled={isLoading}
                />
              </View>
            </Card>

            {/* Demo Credentials */}
            <Card className="p-5 rounded-3xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-600" variant="outlined">
              <View className="flex-row items-center mb-4">
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text className="text-base font-semibold text-slate-900 dark:text-slate-100 ml-2">
                  Demo Credentials
                </Text>
              </View>
              <View className="flex-row flex-wrap justify-between gap-3">
                <View className="w-[48%] p-3 bg-white dark:bg-slate-700 rounded-xl">
                  <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Admin
                  </Text>
                  <Text className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    admin / admin123
                  </Text>
                </View>
                <View className="w-[48%] p-3 bg-white dark:bg-slate-700 rounded-xl">
                  <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Staff
                  </Text>
                  <Text className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    staff1 / staff123
                  </Text>
                </View>
                <View className="w-[48%] p-3 bg-white dark:bg-slate-700 rounded-xl">
                  <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Driver
                  </Text>
                  <Text className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    driver1 / driver123
                  </Text>
                </View>
                <View className="w-[48%] p-3 bg-white dark:bg-slate-700 rounded-xl">
                  <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Inspector
                  </Text>
                  <Text className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    inspector1 / inspector123
                  </Text>
                </View>
              </View>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};
