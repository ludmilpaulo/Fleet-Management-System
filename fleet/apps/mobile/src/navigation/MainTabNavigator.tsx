import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { MainTabParamList } from '../types';
import { AdminDashboard } from '../screens/dashboard/AdminDashboard';
import { StaffDashboard } from '../screens/dashboard/StaffDashboard';
import { DriverDashboard } from '../screens/dashboard/DriverDashboard';
import { VehiclesScreen } from '../screens/vehicles/VehiclesScreen';
import { DriversScreen } from '../screens/drivers/DriversScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface MainTabNavigatorProps {
  userRole: 'admin' | 'driver' | 'staff' | 'inspector';
}

export const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ userRole }) => {
  const insets = useSafeAreaInsets();
  
  const getDashboardComponent = () => {
    switch (userRole) {
      case 'admin':
        return AdminDashboard;
      case 'staff':
        return StaffDashboard;
      case 'driver':
        return DriverDashboard;
      case 'inspector':
        return DriverDashboard; // For now, inspectors use driver dashboard
      default:
        return StaffDashboard;
    }
  };

  const DashboardComponent = getDashboardComponent();

  // Calculate bottom safe area padding
  // Ensure tab bar is positioned ABOVE device menu buttons (home indicator, Android navigation bar)
  // Use actual safe area inset - React Navigation will automatically add this padding
  // For iOS: insets.bottom will be 0 on devices without home indicator, or ~34px on devices with it
  // For Android: insets.bottom will be 0 on devices with gesture navigation, or navigation bar height otherwise
  const safeAreaBottom = insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Vehicles') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Drivers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          // Add safe area padding to bottom to prevent overlap with device buttons
          paddingBottom: safeAreaBottom > 0 ? safeAreaBottom : Platform.OS === 'android' ? 8 : 0,
          paddingTop: 8,
          // Use minHeight instead of fixed height to allow natural sizing
          minHeight: 60 + (safeAreaBottom > 0 ? safeAreaBottom : Platform.OS === 'android' ? 8 : 0),
          // Ensure tab bar respects safe areas and doesn't overlap device buttons
          // React Navigation will position it correctly above device UI elements
          elevation: 8, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardComponent}
        options={{
          title: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Vehicles" 
        component={VehiclesScreen}
        options={{
          title: 'Vehicles',
        }}
      />
      <Tab.Screen 
        name="Drivers" 
        component={DriversScreen}
        options={{
          title: 'Drivers',
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{
          title: 'Reports',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};
