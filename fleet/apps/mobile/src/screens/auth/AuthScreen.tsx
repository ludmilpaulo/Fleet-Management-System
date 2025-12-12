import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { authService } from '../../services/authService'
import { analytics } from '../../services/mixpanel'
import { CompanySelector } from '../../components/ui/CompanySelector'
import { Company } from '../../types'

const { width, height } = Dimensions.get('window')

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
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [faceRecognitionAvailable, setFaceRecognitionAvailable] = useState(false)

  useEffect(() => {
    // Check biometric availability
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
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      const result = await authService.login(username, password)
      
      analytics.track('Manual Login Success', {
        username,
        method: 'password'
      })
      
      onAuthSuccess()
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!username || !password || !email || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    if (!selectedCompany) {
      Alert.alert('Error', 'Please select a company')
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
        company_slug: selectedCompany.slug,
      })
      
      analytics.track('Registration Success', {
        username,
        company: selectedCompany.name
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
      
      // Get stored credentials for biometric login
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
      
      // Get stored credentials for face recognition login
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
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
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


  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Ionicons name="car-sport" size={60} color="#4ade80" />
                </View>
                <Text style={styles.title}>Fleet Management</Text>
                <Text style={styles.subtitle}>
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </Text>
              </View>

              {/* Biometric Authentication Options */}
              {(biometricAvailable || faceRecognitionAvailable) && (
                <View style={styles.biometricContainer}>
                  <Text style={styles.biometricTitle}>Quick Access</Text>
                  
                  {biometricAvailable && (
                    <TouchableOpacity
                      style={[styles.biometricButton, styles.fingerprintButton]}
                      onPress={handleBiometricLogin}
                      disabled={loading}
                    >
                      <Ionicons name="finger-print" size={24} color="#fff" />
                      <Text style={styles.biometricButtonText}>
                        {biometricEnabled ? 'Use Biometric' : 'Setup Biometric'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {faceRecognitionAvailable && (
                    <TouchableOpacity
                      style={[styles.biometricButton, styles.faceButton]}
                      onPress={handleFaceRecognitionLogin}
                      disabled={loading}
                    >
                      <Ionicons name="camera" size={24} color="#fff" />
                      <Text style={styles.biometricButtonText}>Face Recognition</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Form */}
              <View style={styles.form}>
                {renderInput('Username', username, setUsername, 'Enter username')}
                
                {!isLogin && (
                  <>
                    <CompanySelector
                      onCompanySelect={setSelectedCompany}
                      selectedCompany={selectedCompany}
                    />
                    {renderInput('Email', email, setEmail, 'Enter email', false, 'email-address')}
                    {renderInput('First Name', firstName, setFirstName, 'Enter first name')}
                    {renderInput('Last Name', lastName, setLastName, 'Enter last name')}
                    {renderInput('Employee ID', employeeId, setEmployeeId, 'Enter employee ID')}
                    {renderInput('Department', department, setDepartment, 'Enter department')}
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
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={isLogin ? handleLogin : handleRegister}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Please Wait...' : (isLogin ? 'Login' : 'Register')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Toggle Auth Mode */}
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => {
                  setIsLogin(!isLogin)
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }}
              >
                <Text style={styles.toggleButtonText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  biometricContainer: {
    marginBottom: 30,
  },
  biometricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  fingerprintButton: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  faceButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  biometricButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: '#a0a0a0',
    fontSize: 14,
    marginHorizontal: 15,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  submitButton: {
    backgroundColor: '#4ade80',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(74, 222, 128, 0.5)',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '500',
  },
})
