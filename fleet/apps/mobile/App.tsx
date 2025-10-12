import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import { Provider } from 'react-redux'
import { store } from './src/store/store'
import * as Notifications from 'expo-notifications'
import { analytics } from './src/services/mixpanel'

// Import screens
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
  useEffect(() => {
    // Initialize Mixpanel
    const initializeApp = async () => {
      await analytics.initialize();
      
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync()
      if (status !== 'granted') {
        console.log('Notification permission not granted')
        analytics.track('Notification Permission Denied', { platform: 'mobile' });
      } else {
        analytics.track('Notification Permission Granted', { platform: 'mobile' });
      }
      
      // Track app launch
      analytics.track('App Launched', {
        platform: 'mobile',
        launch_time: new Date().toISOString(),
      });
    }

    initializeApp()
  }, [])

  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style="light" />
        <MainTabs />
      </NavigationContainer>
    </Provider>
  )
}