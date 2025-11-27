import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Card } from '../../components/ui/Card';
import { useAppSelector } from '../../store/hooks';
import { apiService, Shift } from '../../services/apiService';
import { authService, AuthUser } from '../../services/authService';

export const DriversScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state) => state.auth);
  const [drivers, setDrivers] = useState<AuthUser[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Calculate bottom padding to avoid tab bar overlap (tab bar height ~80px)
  const bottomPadding = 100 + Math.max(insets.bottom, 0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch drivers (users with role='driver') and shifts in parallel
      const [usersData, shiftsData] = await Promise.all([
        apiService.getUsers({ role: 'driver' }).catch(() => []),
        apiService.getShifts().catch(() => []),
      ]);
      
      setDrivers(usersData)
      setShifts(shiftsData)
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      Alert.alert('Error', 'Failed to load drivers. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Get active shifts count per driver
  const getActiveShifts = (driverId: string | number) => {
    return shifts.filter((shift) => {
      if (!shift.driver) return false;
      
      const shiftDriverId = typeof shift.driver === 'object' && 'id' in shift.driver
        ? (shift.driver as AuthUser).id
        : (typeof shift.driver === 'number' ? shift.driver.toString() : shift.driver);
      
      const driverIdStr = typeof driverId === 'number' ? driverId.toString() : driverId;
      return shiftDriverId.toString() === driverIdStr && shift.status === 'ACTIVE';
    }).length;
  };

  if (loading && drivers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Drivers</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading drivers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Drivers</Text>
        <Text style={styles.headerSubtitle}>{drivers.length} drivers</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {drivers.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="people-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No drivers found</Text>
            </Card>
          ) : (
            drivers.map((driver) => {
              const activeShifts = getActiveShifts(driver.id);
              return (
                <Card key={driver.id} style={styles.driverCard}>
                  <View style={styles.driverHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {driver.full_name
                          ? driver.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : driver.username[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.driverInfo}>
                      <Text style={styles.driverName}>
                        {driver.full_name || driver.username}
                      </Text>
                      <Text style={styles.driverRole}>
                        {driver.role_display || driver.role}
                      </Text>
                    </View>
                    {activeShifts > 0 && (
                      <View style={styles.activeBadge}>
                        <View style={styles.activeDot} />
                        <Text style={styles.activeText}>
                          {activeShifts} Active
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.driverDetails}>
                    {driver.email && (
                      <View style={styles.detailItem}>
                        <Ionicons name="mail-outline" size={14} color="#6b7280" />
                        <Text style={styles.detailText}>{driver.email}</Text>
                      </View>
                    )}
                    {driver.company && (
                      <View style={styles.detailItem}>
                        <Ionicons name="business-outline" size={14} color="#6b7280" />
                        <Text style={styles.detailText}>
                          {typeof driver.company === 'string' ? driver.company : driver.company?.name || ''}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
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
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  driverCard: {
    marginBottom: 16,
    padding: 16,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  driverRole: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  driverDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

