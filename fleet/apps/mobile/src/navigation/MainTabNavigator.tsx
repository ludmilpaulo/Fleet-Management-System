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
  // React Navigation handles positioning, we just need to add safe area padding
  const safeAreaBottom = Math.max(insets.bottom, 12); // Minimum 12px, more if device has safe area
  const bottomPadding = safeAreaBottom; // Padding from bottom edge

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
          paddingBottom: bottomPadding,
          paddingTop: 8,
          minHeight: 60 + bottomPadding,
          // Let React Navigation handle positioning naturally - it respects safe areas
          // Don't use absolute positioning to avoid overlapping device buttons
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
