import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUserProfile } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { apiService } from '../../services/apiService';

export const AdminDashboard: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const dispatch = useAppDispatch();
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);
  
  // Calculate bottom padding to avoid tab bar overlap (tab bar height ~80px)
  const bottomPadding = 100 + Math.max(insets.bottom, 0);

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      dispatch(fetchUserProfile());
    }
  }, [user, dispatch]);

  const fetchStats = async () => {
    try {
      const statsData = await apiService.getCompanyStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard statistics',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return '#ef4444';
      case 'Staff':
        return '#3b82f6';
      case 'Driver':
        return '#10b981';
      case 'Inspector':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      maxValue: stats?.max_users || 0,
      icon: 'people' as keyof typeof Ionicons.glyphMap,
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
    {
      title: 'Total Vehicles',
      value: stats?.total_vehicles || 0,
      maxValue: stats?.max_vehicles || 0,
      icon: 'car' as keyof typeof Ionicons.glyphMap,
      color: '#10b981',
      bgColor: '#f0fdf4',
    },
    {
      title: 'Active Users',
      value: stats?.total_users || 0,
      icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
      color: '#22c55e',
      bgColor: '#f0fdf4',
    },
    {
      title: 'Recent Signups',
      value: stats?.recent_registrations || 0,
      icon: 'person-add' as keyof typeof Ionicons.glyphMap,
      color: '#8b5cf6',
      bgColor: '#faf5ff',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-base text-slate-600 dark:text-slate-400 mt-4">Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottomPadding, padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3b82f6" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          className="rounded-3xl p-6 mb-6"
          style={{
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View className="items-center">
            <Text className="text-2xl font-bold text-white text-center mb-2">
              Welcome back, {user?.first_name || user?.username}!
            </Text>
            <Text className="text-base text-blue-100 text-center mb-4">
              Here's what's happening with {stats?.company_name || (typeof user?.company === 'string' ? user?.company : user?.company?.name || 'your company')} today.
            </Text>
            <View className="flex-row flex-wrap justify-center">
              <View className="bg-white/20 px-3 py-1.5 rounded-2xl mx-1 my-1">
                <Text className="text-xs font-semibold text-white">{user?.role_display || user?.role}</Text>
              </View>
              <View className="bg-white/20 px-3 py-1.5 rounded-2xl mx-1 my-1">
                <Text className="text-xs font-semibold text-white">{typeof user?.company === 'string' ? user?.company : user?.company?.name || ''}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-6">
          {statCards.map((stat, index) => (
            <View key={index} className="w-[48%] mb-4">
              <Card className="p-4 rounded-3xl shadow-lg bg-white dark:bg-slate-800" variant="elevated">
                <View className="flex-row items-center mb-3">
                  <View 
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <Ionicons name={stat.icon} size={24} color={stat.color} />
                  </View>
                  <Text className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex-1">{stat.title}</Text>
                </View>
                <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{stat.value}</Text>
                {stat.maxValue && (
                  <Text className="text-xs text-slate-600 dark:text-slate-400">
                    / {stat.maxValue} max
                  </Text>
                )}
              </Card>
            </View>
          ))}
        </View>

        {/* User Role Distribution */}
        <Card className="mb-6 p-5 rounded-3xl shadow-lg bg-white dark:bg-slate-800" variant="elevated">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">User Distribution</Text>
          <Text className="text-sm text-slate-600 dark:text-slate-400 mb-4">Users by role</Text>
          
          <View className="gap-3">
            {stats?.users_by_role && Object.entries(stats.users_by_role).map(([role, count]) => (
              <View key={role} className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: getRoleColor(role) }}
                  />
                  <Text className="text-base font-medium text-slate-700 dark:text-slate-300">{role}</Text>
                </View>
                <View className="bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-xl">
                  <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">{count}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Company Information */}
        <Card className="mb-6 p-5 rounded-3xl shadow-lg bg-white dark:bg-slate-800" variant="elevated">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Company Information</Text>
          
          <View className="gap-4">
            <View className="flex-row items-center">
              <Ionicons name="business" size={20} color="#6b7280" />
              <Text className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-3 mr-2">Company:</Text>
              <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex-1">
                {typeof user?.company === 'string' ? user?.company : user?.company?.name || 'N/A'}
              </Text>
            </View>
            
            {typeof user?.company !== 'string' && user?.company?.email && (
              <View className="flex-row items-center">
                <Ionicons name="mail" size={20} color="#6b7280" />
                <Text className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-3 mr-2">Email:</Text>
                <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex-1">{user.company.email}</Text>
              </View>
            )}
            
            {typeof user?.company !== 'string' && user?.company?.subscription_plan && (
              <View className="flex-row items-center">
                <Ionicons name="card" size={20} color="#6b7280" />
                <Text className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-3 mr-2">Plan:</Text>
                <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex-1">{user.company.subscription_plan}</Text>
              </View>
            )}
            
            {typeof user?.company !== 'string' && user?.company?.is_trial_active && (
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#f59e0b" />
                <Text className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-3 mr-2">Trial:</Text>
                <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex-1">Active</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6 p-5 rounded-3xl shadow-lg bg-white dark:bg-slate-800" variant="elevated">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</Text>
          
          <View className="flex-row flex-wrap justify-between">
            <Button
              title="Manage Users"
              onPress={() => (navigation as any).navigate('Drivers')}
              variant="outline"
              className="w-[48%] mb-3"
            />
            <Button
              title="View Reports"
              onPress={() => (navigation as any).navigate('Reports')}
              variant="outline"
              className="w-[48%] mb-3"
            />
            <Button
              title="Settings"
              onPress={() => (navigation as any).navigate('Profile')}
              variant="outline"
              className="w-[48%] mb-3"
            />
            <Button
              title="Help"
              onPress={() => {
                // TODO: Implement help screen or show help modal
                dispatch(addNotification({
                  type: 'info',
                  title: 'Help',
                  message: 'For assistance, please contact your system administrator.',
                }));
              }}
              variant="outline"
              className="w-[48%] mb-3"
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
