import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import { AdminDashboard } from '../screens/dashboard/AdminDashboard';
import { StaffDashboard } from '../screens/dashboard/StaffDashboard';
import { DriverDashboard } from '../screens/dashboard/DriverDashboard';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface MainTabNavigatorProps {
  userRole: 'admin' | 'driver' | 'staff' | 'inspector';
}

export const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ userRole }) => {
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
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
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
        component={() => <></>} // Placeholder for now
        options={{
          title: 'Vehicles',
        }}
      />
      <Tab.Screen 
        name="Drivers" 
        component={() => <></>} // Placeholder for now
        options={{
          title: 'Drivers',
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={() => <></>} // Placeholder for now
        options={{
          title: 'Reports',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={() => <></>} // Placeholder for now
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};
