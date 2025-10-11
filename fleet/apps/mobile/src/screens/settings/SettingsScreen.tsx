import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface SettingsScreenProps {
  navigation: any
}

interface UserSettings {
  notifications: boolean
  locationTracking: boolean
  autoUpload: boolean
  offlineMode: boolean
  darkMode: boolean
  language: string
  company: string
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    locationTracking: true,
    autoUpload: true,
    offlineMode: false,
    darkMode: false,
    language: 'en',
    company: 'Demo Company',
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings))
      setSettings(newSettings)
    } catch (error) {
      console.error('Error saving settings:', error)
      Alert.alert('Error', 'Failed to save settings')
    }
  }

  const updateSetting = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear()
              // In a real app, you'd navigate to login screen
              Alert.alert('Success', 'Logged out successfully')
            } catch (error) {
              Alert.alert('Error', 'Failed to logout')
            }
          }
        }
      ]
    )
  }

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear specific cache keys, keep settings
              const keys = await AsyncStorage.getAllKeys()
              const settingsKey = keys.find(key => key === 'userSettings')
              await AsyncStorage.multiRemove(keys.filter(key => key !== settingsKey))
              Alert.alert('Success', 'Cache cleared successfully')
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache')
            }
          }
        }
      ]
    )
  }

  const handleAbout = () => {
    Alert.alert(
      'About Fleet Management',
      'Version 1.0.0\n\nA comprehensive fleet management solution for modern businesses.',
      [{ text: 'OK' }]
    )
  }

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onPress, 
    type = 'button' 
  }: {
    icon: string
    title: string
    subtitle?: string
    value?: boolean
    onPress: () => void
    type?: 'button' | 'switch'
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={24} color="white" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onPress}
            trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#4ade80' }}
            thumbColor={value ? 'white' : 'rgba(255,255,255,0.6)'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
        )}
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your preferences</Text>
          </View>
          <View style={styles.headerButton} />
        </View>

        <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.userInfoCard}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={30} color="white" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>John Doe</Text>
                <Text style={styles.userRole}>Driver</Text>
                <Text style={styles.userCompany}>{settings.company}</Text>
              </View>
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <SettingItem
              icon="notifications"
              title="Push Notifications"
              subtitle="Receive alerts and updates"
              value={settings.notifications}
              onPress={() => updateSetting('notifications', !settings.notifications)}
              type="switch"
            />
          </View>

          {/* Location & Tracking */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location & Tracking</Text>
            <SettingItem
              icon="location"
              title="Location Tracking"
              subtitle="Allow location-based features"
              value={settings.locationTracking}
              onPress={() => updateSetting('locationTracking', !settings.locationTracking)}
              type="switch"
            />
            <SettingItem
              icon="cloud-upload"
              title="Auto Upload"
              subtitle="Automatically upload photos and data"
              value={settings.autoUpload}
              onPress={() => updateSetting('autoUpload', !settings.autoUpload)}
              type="switch"
            />
            <SettingItem
              icon="wifi"
              title="Offline Mode"
              subtitle="Work without internet connection"
              value={settings.offlineMode}
              onPress={() => updateSetting('offlineMode', !settings.offlineMode)}
              type="switch"
            />
          </View>

          {/* Appearance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <SettingItem
              icon="moon"
              title="Dark Mode"
              subtitle="Use dark theme"
              value={settings.darkMode}
              onPress={() => updateSetting('darkMode', !settings.darkMode)}
              type="switch"
            />
            <SettingItem
              icon="language"
              title="Language"
              subtitle="English"
              onPress={() => Alert.alert('Language', 'Language selection coming soon')}
            />
          </View>

          {/* Data & Storage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Storage</Text>
            <SettingItem
              icon="trash"
              title="Clear Cache"
              subtitle="Free up storage space"
              onPress={handleClearCache}
            />
            <SettingItem
              icon="download"
              title="Export Data"
              subtitle="Download your data"
              onPress={() => Alert.alert('Export', 'Data export coming soon')}
            />
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <SettingItem
              icon="help-circle"
              title="Help & FAQ"
              subtitle="Get help and answers"
              onPress={() => Alert.alert('Help', 'Help section coming soon')}
            />
            <SettingItem
              icon="mail"
              title="Contact Support"
              subtitle="Get in touch with our team"
              onPress={() => Alert.alert('Contact', 'Contact support coming soon')}
            />
            <SettingItem
              icon="information-circle"
              title="About"
              subtitle="App version and info"
              onPress={handleAbout}
            />
          </View>

          {/* Logout */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={24} color="#ef4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    gap: 15,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userRole: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  userCompany: {
    color: 'white',
    fontSize: 12,
    opacity: 0.6,
  },
  settingItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 10,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 15,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.7,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 15,
    padding: 15,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
})
