import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppSelector } from '../../store/hooks';
import { apiService, Vehicle } from '../../services/apiService';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

export const VehiclesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAppSelector((state) => state.auth);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Calculate bottom padding to avoid tab bar overlap (tab bar height ~80px)
  const bottomPadding = 100 + Math.max(insets.bottom, 0);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await apiService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      Alert.alert('Error', 'Failed to load vehicles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#10b981';
      case 'MAINTENANCE':
        return '#f59e0b';
      case 'INACTIVE':
        return '#6b7280';
      case 'RETIRED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading && vehicles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>{t('vehicles.title')}</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')} {t('vehicles.title').toLowerCase()}...</Text>
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
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>{t('vehicles.title')}</Text>
            <Text style={styles.headerSubtitle}>{vehicles.length} {t('vehicles.title').toLowerCase()}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              (navigation as any).navigate('AddVehicle');
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>{t('vehicles.addVehicle')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {vehicles.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="car-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>{t('vehicles.noVehicles')}</Text>
            </Card>
          ) : (
            vehicles.map((vehicle) => (
              <Card key={vehicle.id} style={styles.vehicleCard}>
                <View style={styles.vehicleHeader}>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleReg}>{vehicle.reg_number}</Text>
                    <Text style={styles.vehicleMake}>
                      {vehicle.make} {vehicle.model}
                      {vehicle.year && ` (${vehicle.year})`}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(vehicle.status) + '20' },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(vehicle.status) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(vehicle.status) },
                      ]}
                    >
                      {vehicle.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.vehicleDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="speedometer-outline" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>
                      {vehicle.mileage.toLocaleString()} km
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="flash-outline" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>{vehicle.fuel_type}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="settings-outline" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>{vehicle.transmission}</Text>
                  </View>
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Vehicle Details', `View details for ${vehicle.reg_number}`);
                    }}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                  
                  {user?.role === 'driver' && vehicle.status === 'ACTIVE' && (
                    <TouchableOpacity
                      style={styles.reportButton}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        Alert.alert(
                          'Report Issue',
                          `Report an issue with ${vehicle.reg_number}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Report',
                              onPress: () => {
                                Alert.alert(
                                  'Report Issue',
                                  'To report an issue, please use the "Report Issue" option from the Dashboard.',
                                  [{ text: 'OK' }]
                                );
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="warning-outline" size={16} color="#f59e0b" />
                      <Text style={styles.reportButtonText}>Report Issue</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
  vehicleCard: {
    marginBottom: 16,
    padding: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleReg: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  vehicleMake: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  vehicleDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 4,
    gap: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    gap: 6,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
});

