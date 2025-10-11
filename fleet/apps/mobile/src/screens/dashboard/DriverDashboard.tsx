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

export const DriverDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const dispatch = useAppDispatch();
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      setLoading(false);
    } else {
      dispatch(fetchUserProfile());
    }
  }, [user, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchUserProfile());
    setRefreshing(false);
  };

  const quickActions = [
    {
      title: 'Start Route',
      icon: 'play-circle' as keyof typeof Ionicons.glyphMap,
      color: '#10b981',
      bgColor: '#f0fdf4',
      onPress: () => {},
    },
    {
      title: 'View Schedule',
      icon: 'calendar' as keyof typeof Ionicons.glyphMap,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      onPress: () => {},
    },
    {
      title: 'Report Issue',
      icon: 'warning' as keyof typeof Ionicons.glyphMap,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      onPress: () => {},
    },
    {
      title: 'Check Vehicle',
      icon: 'car' as keyof typeof Ionicons.glyphMap,
      color: '#8b5cf6',
      bgColor: '#faf5ff',
      onPress: () => {},
    },
  ];

  const recentActivities = [
    {
      id: '1',
      title: 'Route Completed',
      description: 'Downtown to Airport route completed successfully',
      time: '2 hours ago',
      icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
      color: '#10b981',
    },
    {
      id: '2',
      title: 'Vehicle Inspection',
      description: 'Daily vehicle inspection completed',
      time: '4 hours ago',
      icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
      color: '#3b82f6',
    },
    {
      id: '3',
      title: 'Fuel Refill',
      description: 'Vehicle refueled at Station #123',
      time: '6 hours ago',
      icon: 'flash' as keyof typeof Ionicons.glyphMap,
      color: '#f59e0b',
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
          colors={['#f59e0b', '#d97706']}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>
              Welcome, {user?.first_name || user?.username}!
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Ready to start your day with {user?.company.name}?
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

        {/* Status Cards */}
        <View style={styles.statusGrid}>
          <Card style={styles.statusCard} variant="elevated">
            <View style={styles.statusHeader}>
              <View style={[styles.statusIcon, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="car" size={24} color="#10b981" />
              </View>
              <Text style={styles.statusTitle}>Vehicle Status</Text>
            </View>
            <Text style={styles.statusValue}>Ready</Text>
            <Text style={styles.statusSubtext}>Vehicle #1234</Text>
          </Card>

          <Card style={styles.statusCard} variant="elevated">
            <View style={styles.statusHeader}>
              <View style={[styles.statusIcon, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="location" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.statusTitle}>Current Location</Text>
            </View>
            <Text style={styles.statusValue}>Downtown</Text>
            <Text style={styles.statusSubtext}>Last updated 5 min ago</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={styles.actionsCard} variant="elevated">
          <Text style={styles.cardTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                title={action.title}
                onPress={action.onPress}
                variant="outline"
                style={styles.actionButton}
              />
            ))}
          </View>
        </Card>

        {/* Today's Schedule */}
        <Card style={styles.scheduleCard} variant="elevated">
          <Text style={styles.cardTitle}>Today's Schedule</Text>
          
          <View style={styles.scheduleList}>
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleTime}>
                <Text style={styles.scheduleTimeText}>08:00</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleTitle}>Start Route</Text>
                <Text style={styles.scheduleDescription}>Downtown to Airport</Text>
              </View>
              <View style={styles.scheduleStatus}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              </View>
            </View>

            <View style={styles.scheduleItem}>
              <View style={styles.scheduleTime}>
                <Text style={styles.scheduleTimeText}>12:00</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleTitle}>Lunch Break</Text>
                <Text style={styles.scheduleDescription}>30 minutes</Text>
              </View>
              <View style={styles.scheduleStatus}>
                <Ionicons name="time" size={20} color="#f59e0b" />
              </View>
            </View>

            <View style={styles.scheduleItem}>
              <View style={styles.scheduleTime}>
                <Text style={styles.scheduleTimeText}>14:00</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleTitle}>Return Route</Text>
                <Text style={styles.scheduleDescription}>Airport to Downtown</Text>
              </View>
              <View style={styles.scheduleStatus}>
                <Ionicons name="ellipse" size={20} color="#d1d5db" />
              </View>
            </View>
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard} variant="elevated">
          <Text style={styles.cardTitle}>Recent Activity</Text>
          
          <View style={styles.activityList}>
            {recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                  <Ionicons name={activity.icon} size={20} color={activity.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
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
              <Ionicons name="person" size={20} color="#6b7280" />
              <Text style={styles.companyLabel}>Employee ID:</Text>
              <Text style={styles.companyValue}>{user?.employee_id || 'N/A'}</Text>
            </View>
            
            <View style={styles.companyItem}>
              <Ionicons name="briefcase" size={20} color="#6b7280" />
              <Text style={styles.companyLabel}>Department:</Text>
              <Text style={styles.companyValue}>{user?.department || 'N/A'}</Text>
            </View>
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
    shadowColor: '#f59e0b',
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
    color: '#fef3c7',
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
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusCard: {
    width: '48%',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsCard: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
  },
  scheduleCard: {
    marginBottom: 24,
  },
  scheduleList: {
    gap: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTime: {
    width: 60,
    alignItems: 'center',
  },
  scheduleTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  scheduleContent: {
    flex: 1,
    marginLeft: 16,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  scheduleStatus: {
    marginLeft: 16,
  },
  activityCard: {
    marginBottom: 24,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
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
