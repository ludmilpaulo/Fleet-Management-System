import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { authService } from '../../services/authService'
import { analytics } from '../../services/mixpanel'

interface AuthScreenProps {
  onAuthSuccess: () => void
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState<'admin' | 'driver' | 'staff' | 'inspector'>('driver')
  const [loading, setLoading] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [faceRecognitionAvailable, setFaceRecognitionAvailable] = useState(false)

  useEffect(() => {
    checkBiometricAvailability()
    checkFaceRecognitionAvailability()
    checkBiometricEnabled()
  }, [])

  const checkBiometricAvailability = async () => {
    const available = await authService.isBiometricAvailable()
    setBiometricAvailable(available)
  }

  const checkFaceRecognitionAvailability = async () => {
    const available = await authService.isFaceRecognitionAvailable()
    setFaceRecognitionAvailable(available)
  }

  const checkBiometricEnabled = async () => {
    const enabled = await authService.isBiometricEnabled()
    setBiometricEnabled(enabled)
  }

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(
        'Missing Information',
        'Please enter both username and password to continue.',
        [{ text: 'OK', style: 'default' }]
      )
      return
    }

    setLoading(true)
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      const result = await authService.login(username, password)
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      
      analytics.track('Manual Login Success', {
        username,
        method: 'password'
      })
      
      onAuthSuccess()
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const errorType = error?.errorType || 'unknown'
      
      // Provide specific, user-friendly alerts based on error type
      switch (errorType) {
        case 'username_not_found':
          Alert.alert(
            'Account Not Found',
            'The username or email you entered does not exist. Please check your credentials and try again.\n\nIf you don\'t have an account, please register first.',
            [
              { text: 'Try Again', style: 'cancel' },
              { 
                text: 'Register', 
                onPress: () => setIsLogin(false),
                style: 'default'
              }
            ]
          )
          break
          
        case 'incorrect_password':
          Alert.alert(
            'Incorrect Password',
            'The password you entered is incorrect. Please try again.\n\nIf you\'ve forgotten your password, please contact your administrator or use the "Forgot Password" feature.',
            [
              { text: 'Try Again', style: 'cancel' },
              { 
                text: 'Forgot Password?', 
                onPress: () => {
                  Alert.alert('Forgot Password', 'Please contact your administrator to reset your password.')
                },
                style: 'default'
              }
            ]
          )
          break
          
        case 'account_disabled':
          Alert.alert(
            'Account Disabled',
            'Your account has been disabled. Please contact your administrator or support team for assistance.',
            [{ text: 'OK', style: 'default' }]
          )
          break
          
        case 'network_error':
          Alert.alert(
            'Connection Error',
            'Unable to connect to the server. Please check:\n\n• Your internet connection\n• That the backend server is running\n• That your device is on the same network as the server',
            [{ text: 'OK', style: 'default' }]
          )
          break
          
        default:
          Alert.alert(
            'Login Failed',
            errorMessage,
            [{ text: 'OK', style: 'default' }]
          )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!username || !password || !email || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      const result = await authService.register({
        username,
        email,
        password,
        password_confirm: confirmPassword,
        first_name: firstName,
        last_name: lastName,
        employee_id: employeeId,
        department,
        role,
      })
      
      analytics.track('Registration Success', {
        username,
        role
      })
      
      onAuthSuccess()
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    if (!biometricEnabled) {
      const setup = await authService.setupBiometricAuth()
      if (!setup) {
        Alert.alert('Error', 'Failed to setup biometric authentication')
        return
      }
      setBiometricEnabled(true)
    }

    const success = await authService.authenticateWithBiometric()
    if (success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      
      const user = await authService.getCurrentUser()
      if (user) {
        analytics.track('Biometric Login Success', {
          user_id: user.id,
          method: 'biometric'
        })
        onAuthSuccess()
      } else {
        Alert.alert('Error', 'No stored credentials found. Please login manually first.')
      }
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const handleFaceRecognitionLogin = async () => {
    const success = await authService.authenticateWithFaceRecognition()
    if (success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      
      const user = await authService.getCurrentUser()
      if (user) {
        analytics.track('Face Recognition Login Success', {
          user_id: user.id,
          method: 'face_recognition'
        })
        onAuthSuccess()
      } else {
        Alert.alert('Error', 'No stored credentials found. Please login manually first.')
      }
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Face Recognition Failed', 'Could not verify your identity')
    }
  }

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    secureTextEntry = false,
    keyboardType: 'default' | 'email-address' = 'default'
  ) => (
    <View className="mb-5">
      <Text className="text-sm font-semibold text-white mb-2">{label}</Text>
      <TextInput
        className="bg-white/10 rounded-xl px-4 py-3.5 text-base text-white border border-white/20"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  )

  const renderRoleSelector = () => (
    <View className="mb-5">
      <Text className="text-sm font-semibold text-white mb-2">Role</Text>
      <View className="flex-row flex-wrap gap-2.5">
        {(['admin', 'driver', 'staff', 'inspector'] as const).map((roleOption) => (
          <TouchableOpacity
            key={roleOption}
            className={`px-4 py-2 rounded-full border ${role === roleOption ? 'bg-emerald-500 border-emerald-500' : 'bg-white/10 border-white/20'}`}
            onPress={() => setRole(roleOption)}
          >
            <Text className={`text-sm font-medium ${role === roleOption ? 'text-black font-semibold' : 'text-white'}`}>
              {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20, minHeight: '100%' }}
            showsVerticalScrollIndicator={false}
          >
            <View className="w-full justify-center">
              {/* Header */}
              <View className="items-center mb-10">
                <View className="w-25 h-25 rounded-full bg-emerald-500/10 justify-center items-center mb-5">
                  <Ionicons name="car-sport" size={60} color="#4ade80" />
                </View>
                <Text className="text-3xl font-bold text-white mb-2">Fleet Management</Text>
                <Text className="text-base text-gray-400">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </Text>
              </View>

              {/* Biometric Authentication Options */}
              {(biometricAvailable || faceRecognitionAvailable) && (
                <View className="mb-8">
                  <Text className="text-base font-semibold text-white text-center mb-4">Quick Access</Text>
                  
                  {biometricAvailable && (
                    <TouchableOpacity
                      className="flex-row items-center justify-center p-4 rounded-xl mb-2.5 bg-emerald-500/20 border border-emerald-500"
                      onPress={handleBiometricLogin}
                      disabled={loading}
                    >
                      <Ionicons name="finger-print" size={24} color="#fff" />
                      <Text className="text-white text-base font-semibold ml-2.5">
                        {biometricEnabled ? 'Use Biometric' : 'Setup Biometric'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {faceRecognitionAvailable && (
                    <TouchableOpacity
                      className="flex-row items-center justify-center p-4 rounded-xl bg-primary-500/20 border border-primary-500"
                      onPress={handleFaceRecognitionLogin}
                      disabled={loading}
                    >
                      <Ionicons name="camera" size={24} color="#fff" />
                      <Text className="text-white text-base font-semibold ml-2.5">Face Recognition</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Divider */}
              <View className="flex-row items-center mb-8">
                <View className="flex-1 h-px bg-white/20" />
                <Text className="text-gray-400 text-sm mx-4">OR</Text>
                <View className="flex-1 h-px bg-white/20" />
              </View>

              {/* Form */}
              <View className="mb-8">
                {renderInput('Username', username, setUsername, 'Enter username')}
                
                {!isLogin && (
                  <>
                    {renderInput('Email', email, setEmail, 'Enter email', false, 'email-address')}
                    {renderInput('First Name', firstName, setFirstName, 'Enter first name')}
                    {renderInput('Last Name', lastName, setLastName, 'Enter last name')}
                    {renderInput('Employee ID', employeeId, setEmployeeId, 'Enter employee ID')}
                    {renderInput('Department', department, setDepartment, 'Enter department')}
                    {renderRoleSelector()}
                  </>
                )}
                
                {renderInput('Password', password, setPassword, 'Enter password', true)}
                
                {!isLogin && renderInput(
                  'Confirm Password',
                  confirmPassword,
                  setConfirmPassword,
                  'Confirm password',
                  true
                )}

                <TouchableOpacity
                  className={`bg-emerald-500 rounded-xl p-4.5 items-center mt-2.5 ${loading ? 'opacity-50' : ''}`}
                  onPress={isLogin ? handleLogin : handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Text className="text-black text-lg font-bold">
                      {isLogin ? 'Login' : 'Register'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Toggle Auth Mode */}
              <TouchableOpacity
                className="items-center"
                onPress={() => {
                  setIsLogin(!isLogin)
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }}
              >
                <Text className="text-emerald-500 text-base font-medium">
                  {isLogin
                    ? "Don't have an account? Register"
                    : 'Already have an account? Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
}
