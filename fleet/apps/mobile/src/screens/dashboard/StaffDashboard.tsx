import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUserProfile } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import apiService from '../../services/api';
import { CompanyStats } from '../../types';

export const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const dispatch = useAppDispatch();
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);

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
      title: 'Active Drivers',
      value: stats?.users_by_role?.Driver || 0,
      icon: 'person' as keyof typeof Ionicons.glyphMap,
      color: '#22c55e',
      bgColor: '#f0fdf4',
    },
    {
      title: 'Recent Activity',
      value: stats?.recent_registrations || 0,
      icon: 'trending-up' as keyof typeof Ionicons.glyphMap,
      color: '#8b5cf6',
      bgColor: '#faf5ff',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>
              Welcome, {user?.first_name || user?.username}!
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Manage operations for {stats?.company_name || user?.company.name}
            </Text>
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user?.role_display}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user?.company.name}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <Card key={index} style={styles.statCard} variant="elevated">
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              {stat.maxValue && (
                <Text style={styles.statMax}>
                  / {stat.maxValue} max
                </Text>
              )}
            </Card>
          ))}
        </View>

        {/* Team Overview */}
        <Card style={styles.teamCard} variant="elevated">
          <Text style={styles.cardTitle}>Team Overview</Text>
          <Text style={styles.cardSubtitle}>Team members by role</Text>
          
          <View style={styles.teamList}>
            {stats?.users_by_role && Object.entries(stats.users_by_role).map(([role, count]) => (
              <View key={role} style={styles.teamItem}>
                <View style={styles.teamInfo}>
                  <View style={[styles.roleDot, { backgroundColor: getRoleColor(role) }]} />
                  <Text style={styles.roleName}>{role}</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{count}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Operations */}
        <Card style={styles.operationsCard} variant="elevated">
          <Text style={styles.cardTitle}>Operations</Text>
          
          <View style={styles.operationsGrid}>
            <Button
              title="Manage Drivers"
              onPress={() => {}}
              variant="outline"
              style={styles.operationButton}
            />
            <Button
              title="Vehicle Status"
              onPress={() => {}}
              variant="outline"
              style={styles.operationButton}
            />
            <Button
              title="Schedule Routes"
              onPress={() => {}}
              variant="outline"
              style={styles.operationButton}
            />
            <Button
              title="View Reports"
              onPress={() => {}}
              variant="outline"
              style={styles.operationButton}
            />
          </View>
        </Card>

        {/* Company Information */}
        <Card style={styles.companyCard} variant="elevated">
          <Text style={styles.cardTitle}>Company Information</Text>
          
          <View style={styles.companyInfo}>
            <View style={styles.companyItem}>
              <Ionicons name="business" size={20} color="#6b7280" />
              <Text style={styles.companyLabel}>Company:</Text>
              <Text style={styles.companyValue}>{user?.company.name}</Text>
            </View>
            
            <View style={styles.companyItem}>
              <Ionicons name="mail" size={20} color="#6b7280" />
              <Text style={styles.companyLabel}>Email:</Text>
              <Text style={styles.companyValue}>{user?.company.email}</Text>
            </View>
            
            <View style={styles.companyItem}>
              <Ionicons name="card" size={20} color="#6b7280" />
              <Text style={styles.companyLabel}>Plan:</Text>
              <Text style={styles.companyValue}>{user?.company.subscription_plan}</Text>
            </View>
            
            {user?.company.is_trial_active && (
              <View style={styles.companyItem}>
                <Ionicons name="time" size={20} color="#f59e0b" />
                <Text style={styles.companyLabel}>Trial:</Text>
                <Text style={styles.companyValue}>Active</Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#d1fae5',
    textAlign: 'center',
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statMax: {
    fontSize: 12,
    color: '#6b7280',
  },
  teamCard: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  teamList: {
    gap: 12,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  countBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  operationsCard: {
    marginBottom: 24,
  },
  operationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  operationButton: {
    width: '48%',
    marginBottom: 12,
  },
  companyCard: {
    marginBottom: 24,
  },
  companyInfo: {
    gap: 16,
  },
  companyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 12,
    marginRight: 8,
  },
  companyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
});
