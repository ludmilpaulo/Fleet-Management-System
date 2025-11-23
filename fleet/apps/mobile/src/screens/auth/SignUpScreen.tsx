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
import { CompanySelector } from '../../components/ui/CompanySelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { Company, AuthStackParamList } from '../../types';

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    employeeId: '',
    department: '',
    role: 'staff' as 'admin' | 'driver' | 'staff' | 'inspector',
  });
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Navigation will be handled by the main app
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { username, email, password, passwordConfirm, firstName, lastName } = formData;
    
    if (!username.trim() || !email.trim() || !password.trim() || !passwordConfirm.trim() || 
        !firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (password !== passwordConfirm) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (!selectedCompany) {
      Alert.alert('Error', 'Please select a company');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const registrationData = {
        ...formData,
        company_slug: selectedCompany!.slug,
      };

      await dispatch(registerUser(registrationData)).unwrap();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      dispatch(addNotification({
        type: 'success',
        title: 'Registration Successful',
        message: `Welcome to ${selectedCompany!.name}, ${formData.firstName}!`,
      }));
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      dispatch(addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: err || 'Registration failed',
      }));
    }
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SignIn');
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin', description: 'Full system access', icon: 'shield' as keyof typeof Ionicons.glyphMap, color: '#ef4444' },
    { value: 'staff', label: 'Staff', description: 'Operations management', icon: 'briefcase' as keyof typeof Ionicons.glyphMap, color: '#3b82f6' },
    { value: 'driver', label: 'Driver', description: 'Route management', icon: 'car' as keyof typeof Ionicons.glyphMap, color: '#10b981' },
    { value: 'inspector', label: 'Inspector', description: 'Vehicle inspections', icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap, color: '#8b5cf6' },
  ];

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
            <View className="items-center mb-6 mt-4">
              <View className="mb-4">
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
                  <Ionicons name="person-add" size={40} color="#ffffff" />
                </LinearGradient>
              </View>
              <Text className="text-4xl font-bold text-slate-900 mb-2">Create Account</Text>
              <Text className="text-base text-slate-600 text-center max-w-xs">
                Join your fleet management team
              </Text>
            </View>

            {/* Sign Up Form */}
            <Card className="mb-6 p-6 rounded-3xl shadow-xl bg-white dark:bg-slate-800" variant="elevated">
              <View className="mb-6">
                <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
                  Join Our Team
                </Text>
                <Text className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  Fill in your details to create your account
                </Text>
              </View>

              {/* Company Selection */}
              <View className="mb-6">
                <CompanySelector
                  onCompanySelect={setSelectedCompany}
                  selectedCompany={selectedCompany}
                />
              </View>

              {/* Personal Information */}
              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="person-outline" size={20} color="#3b82f6" />
                  <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100 ml-2">
                    Personal Information
                  </Text>
                </View>
                
                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Input
                      label="First Name *"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChangeText={(value) => handleInputChange('firstName', value)}
                      leftIcon="person-outline"
                      className="mb-0"
                    />
                  </View>
                  <View className="w-[48%]">
                    <Input
                      label="Last Name *"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChangeText={(value) => handleInputChange('lastName', value)}
                      className="mb-0"
                    />
                  </View>
                </View>

                <Input
                  label="Username *"
                  placeholder="Enter username"
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  leftIcon="at-outline"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="mb-4"
                />

                <Input
                  label="Email *"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="mb-4"
                />

                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  leftIcon="call-outline"
                  keyboardType="phone-pad"
                  className="mb-4"
                />
              </View>

              {/* Work Information */}
              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="briefcase-outline" size={20} color="#3b82f6" />
                  <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100 ml-2">
                    Work Information
                  </Text>
                </View>
                
                <Input
                  label="Employee ID"
                  placeholder="Enter employee ID"
                  value={formData.employeeId}
                  onChangeText={(value) => handleInputChange('employeeId', value)}
                  leftIcon="card-outline"
                  className="mb-4"
                />

                <Input
                  label="Department"
                  placeholder="Enter department"
                  value={formData.department}
                  onChangeText={(value) => handleInputChange('department', value)}
                  leftIcon="business-outline"
                  className="mb-4"
                />

                {/* Role Selection */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Role *
                  </Text>
                  <View className="flex-row flex-wrap justify-between">
                    {roleOptions.map((option) => {
                      const isSelected = formData.role === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            handleInputChange('role', option.value);
                          }}
                          className={`w-[48%] p-4 rounded-2xl mb-3 border-2 ${
                            isSelected 
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-700'
                          }`}
                          activeOpacity={0.7}
                        >
                          <View className="flex-row items-center mb-2">
                            <View 
                              className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                              style={{ backgroundColor: isSelected ? option.color : '#e5e7eb' }}
                            >
                              <Ionicons 
                                name={option.icon} 
                                size={18} 
                                color={isSelected ? '#ffffff' : '#6b7280'} 
                              />
                            </View>
                            <Text className={`text-sm font-semibold ${
                              isSelected 
                                ? 'text-primary-700 dark:text-primary-300' 
                                : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {option.label}
                            </Text>
                          </View>
                          <Text className={`text-xs ${
                            isSelected 
                              ? 'text-primary-600 dark:text-primary-400' 
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {option.description}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Password */}
              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="lock-closed-outline" size={20} color="#3b82f6" />
                  <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100 ml-2">
                    Security
                  </Text>
                </View>
                
                <Input
                  label="Password *"
                  placeholder="Enter password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
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

                <Input
                  label="Confirm Password *"
                  placeholder="Confirm password"
                  value={formData.passwordConfirm}
                  onChangeText={(value) => handleInputChange('passwordConfirm', value)}
                  secureTextEntry={!showPasswordConfirm}
                  leftIcon="lock-closed-outline"
                  rightIcon={showPasswordConfirm ? 'eye-off' : 'eye'}
                  onRightIconPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowPasswordConfirm(!showPasswordConfirm);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="mb-4"
                />
              </View>

              {error && (
                <View className="flex-row items-center bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-4 border border-red-200 dark:border-red-800">
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  <Text className="text-sm text-red-600 dark:text-red-400 ml-2 flex-1">{error}</Text>
                </View>
              )}

              <Button
                title={isLoading ? 'Creating Account...' : 'Create Account'}
                onPress={handleSignUp}
                loading={isLoading}
                disabled={isLoading}
                className="mb-4"
                size="lg"
              />

              <View className="flex-row justify-center items-center">
                <Text className="text-sm text-slate-600 dark:text-slate-400 mr-2">
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
                  <Text className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};
