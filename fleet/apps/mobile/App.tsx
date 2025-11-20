import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import { Provider } from 'react-redux'
import { store } from './src/store/store'
import * as Notifications from 'expo-notifications'
import { analytics } from './src/services/mixpanel'
import { authService, AuthUser } from './src/services/authService'
import { notificationService } from './src/services/notificationService'

// Import screens
import AuthScreen from './src/screens/auth/AuthScreen'
import DashboardScreen from './src/screens/dashboard/DashboardScreen'
import InspectionsScreen from './src/screens/inspections/InspectionsScreen'
import CameraScreen from './src/screens/camera/CameraScreen'
import KeyTrackerScreen from './src/screens/ble/KeyTrackerScreen'
import LocationScreen from './src/screens/location/LocationScreen'
import NotificationsScreen from './src/screens/notifications/NotificationsScreen'
import SettingsScreen from './src/screens/settings/SettingsScreen'

// Import inspection screens
import InspectionDetailScreen from './src/screens/inspections/InspectionDetailScreen'
import InspectionFormScreen from './src/screens/inspections/InspectionFormScreen'

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Stack navigator for inspections
function InspectionsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="InspectionsList" component={InspectionsScreen} />
      <Stack.Screen name="InspectionDetail" component={InspectionDetailScreen} />
      <Stack.Screen name="InspectionForm" component={InspectionFormScreen} />
    </Stack.Navigator>
  )
}

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Inspections') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline'
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline'
          } else if (route.name === 'Keys') {
            iconName = focused ? 'key' : 'key-outline'
          } else if (route.name === 'Location') {
            iconName = focused ? 'location' : 'location-outline'
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline'
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline'
          } else {
            iconName = 'help-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#4ade80',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarStyle: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Inspections" 
        component={InspectionsStack}
        options={{ tabBarLabel: 'Inspections' }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ tabBarLabel: 'Camera' }}
      />
      <Tab.Screen 
        name="Keys" 
        component={KeyTrackerScreen}
        options={{ tabBarLabel: 'Keys' }}
      />
      <Tab.Screen 
        name="Location" 
        component={LocationScreen}
        options={{ tabBarLabel: 'Location' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Alerts' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Initialize Mixpanel
      await analytics.initialize()
      
      // Initialize authentication
      await authService.initializeAuth()
      
      // Initialize notification service
      await notificationService.initialize()
      
      // Check if user is authenticated
      const isAuth = await authService.isAuthenticated()
      const userData = await authService.getCurrentUser()
      
      setIsAuthenticated(isAuth)
      setUser(userData)
      
      // Notification service will handle permission requests
      // This is done in notificationService.initialize()
      
      // Track app launch
      analytics.track('App Launched', {
        platform: 'mobile',
        launch_time: new Date().toISOString(),
        authenticated: isAuth,
        user_role: userData?.role,
      })
    } catch (error) {
      console.error('App initialization error:', error)
      analytics.track('App Initialization Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = async () => {
    const userData = await authService.getCurrentUser()
    setIsAuthenticated(true)
    setUser(userData)
    
    analytics.track('Authentication Success', {
      user_id: userData?.id,
      role: userData?.role
    })
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      setIsAuthenticated(false)
      setUser(null)
      
      analytics.track('User Logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <Provider store={store}>
        <View style={styles.loadingContainer}>
          <StatusBar style="dark" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Provider>
    )
  }

  if (!isAuthenticated) {
    return (
      <Provider store={store}>
        <StatusBar style="light" />
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      </Provider>
    )
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style="light" />
        <MainTabs />
      </NavigationContainer>
    </Provider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
})