import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

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
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        employeeId: formData.employeeId,
        department: formData.department,
        role: formData.role,
        company_slug: selectedCompany!.slug,
      };

      await dispatch(registerUser(registrationData)).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Registration Successful',
        message: `Welcome to ${selectedCompany!.name}, ${formData.firstName}!`,
      }));
    } catch (err: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: err || 'Registration failed',
      }));
    }
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin', description: 'Full system access' },
    { value: 'staff', label: 'Staff', description: 'Operations management' },
    { value: 'driver', label: 'Driver', description: 'Route management' },
    { value: 'inspector', label: 'Inspector', description: 'Vehicle inspections' },
  ];

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
              <Text style={styles.subtitle}>Create your account</Text>
            </View>

            {/* Sign Up Form */}
            <Card style={styles.formCard} variant="elevated">
              <Text style={styles.formTitle}>Join Our Team</Text>
              <Text style={styles.formSubtitle}>
                Fill in your details to create your account
              </Text>

              {/* Company Selection */}
              <CompanySelector
                onCompanySelect={setSelectedCompany}
                selectedCompany={selectedCompany}
              />

              {/* Personal Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Input
                      label="First Name *"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChangeText={(value) => handleInputChange('firstName', value)}
                      leftIcon="person-outline"
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Input
                      label="Last Name *"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChangeText={(value) => handleInputChange('lastName', value)}
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
                />

                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  leftIcon="call-outline"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Work Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Work Information</Text>
                
                <Input
                  label="Employee ID"
                  placeholder="Enter employee ID"
                  value={formData.employeeId}
                  onChangeText={(value) => handleInputChange('employeeId', value)}
                  leftIcon="card-outline"
                />

                <Input
                  label="Department"
                  placeholder="Enter department"
                  value={formData.department}
                  onChangeText={(value) => handleInputChange('department', value)}
                  leftIcon="business-outline"
                />

                {/* Role Selection */}
                <View style={styles.roleSection}>
                  <Text style={styles.roleLabel}>Role *</Text>
                  <View style={styles.roleGrid}>
                    {roleOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.roleOption,
                          formData.role === option.value && styles.roleOptionSelected,
                        ]}
                        onPress={() => handleInputChange('role', option.value)}
                      >
                        <Text style={[
                          styles.roleOptionText,
                          formData.role === option.value && styles.roleOptionTextSelected,
                        ]}>
                          {option.label}
                        </Text>
                        <Text style={[
                          styles.roleOptionDescription,
                          formData.role === option.value && styles.roleOptionDescriptionSelected,
                        ]}>
                          {option.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Password */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>
                
                <Input
                  label="Password *"
                  placeholder="Enter password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  leftIcon="lock-closed-outline"
                  rightIcon={showPassword ? 'eye-off' : 'eye'}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Input
                  label="Confirm Password *"
                  placeholder="Confirm password"
                  value={formData.passwordConfirm}
                  onChangeText={(value) => handleInputChange('passwordConfirm', value)}
                  secureTextEntry={!showPasswordConfirm}
                  leftIcon="lock-closed-outline"
                  rightIcon={showPasswordConfirm ? 'eye-off' : 'eye'}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                title={isLoading ? 'Creating Account...' : 'Create Account'}
                onPress={handleSignUp}
                loading={isLoading}
                disabled={isLoading}
                style={styles.signUpButton}
              />

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <Button
                  title="Sign In"
                  onPress={handleSignIn}
                  variant="ghost"
                  size="sm"
                />
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  roleSection: {
    marginTop: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleOption: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  roleOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  roleOptionTextSelected: {
    color: '#1e40af',
  },
  roleOptionDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  roleOptionDescriptionSelected: {
    color: '#1e40af',
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
  signUpButton: {
    marginBottom: 16,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
