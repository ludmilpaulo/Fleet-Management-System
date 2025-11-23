import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppSelector } from '../../store/hooks';
import { apiService, DashboardStats } from '../../services/apiService';
import { Alert } from 'react-native';

export const ReportsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Calculate bottom padding to avoid tab bar overlap (tab bar height ~80px)
  const bottomPadding = 100 + Math.max(insets.bottom, 0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // For drivers, fetch their specific data
      if (user?.role === 'driver') {
        const [shifts, inspections] = await Promise.all([
          apiService.getShifts().catch(() => []),
          apiService.getInspections().catch(() => []),
        ]);
        
        // Filter for current driver
        const driverShifts = shifts.filter((s: any) => {
          const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
          return driverId.toString() === user?.id?.toString();
        });
        
        const driverInspections = inspections.filter((insp: any) => {
          const inspectorId = typeof insp.created_by === 'object' ? insp.created_by.id : insp.created_by;
          return inspectorId.toString() === user?.id?.toString();
        });
        
        const activeShifts = driverShifts.filter((s: any) => s.status === 'ACTIVE').length;
        const today = new Date().toISOString().split('T')[0];
        const completedToday = driverShifts.filter((s: any) => 
          s.status === 'COMPLETED' && s.end_at?.startsWith(today)
        ).length;
        
        const failedInspections = driverInspections.filter((insp: any) => 
          insp.status === 'FAIL' || insp.status === 'FAILED'
        ).length;
        
        // Create driver-specific stats
        setStats({
          total_vehicles: 0,
          active_vehicles: 0,
          vehicles_in_maintenance: 0,
          total_issues: 0,
          open_issues: 0,
          critical_issues: 0,
          total_inspections: driverInspections.length,
          failed_inspections: failedInspections,
          active_shifts: activeShifts,
          completed_shifts_today: completedToday,
          maintenance_due: 0,
          upcoming_inspections: 0,
        });
      } else {
        // For admin/staff, use dashboard stats
        const data = await apiService.getDashboardStats();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const reportSections = user?.role === 'driver' 
    ? [
        {
          title: 'My Shifts',
          icon: 'time-outline',
          items: [
            { label: 'Active Shifts', value: stats?.active_shifts || 0 },
            { label: 'Completed Today', value: stats?.completed_shifts_today || 0 },
          ],
        },
        {
          title: 'My Inspections',
          icon: 'checkmark-circle-outline',
          items: [
            { label: 'Total Inspections', value: stats?.total_inspections || 0 },
            { label: 'Failed Inspections', value: stats?.failed_inspections || 0 },
          ],
        },
      ]
    : [
        {
          title: 'Fleet Overview',
          icon: 'car-outline',
          items: [
            { label: 'Total Vehicles', value: stats?.total_vehicles || 0 },
            { label: 'Active Vehicles', value: stats?.active_vehicles || 0 },
            { label: 'In Maintenance', value: stats?.vehicles_in_maintenance || 0 },
          ],
        },
        {
          title: 'Issues & Maintenance',
          icon: 'warning-outline',
          items: [
            { label: 'Total Issues', value: stats?.total_issues || 0 },
            { label: 'Open Issues', value: stats?.open_issues || 0 },
            { label: 'Critical Issues', value: stats?.critical_issues || 0 },
            { label: 'Maintenance Due', value: stats?.maintenance_due || 0 },
          ],
        },
        {
          title: 'Inspections',
          icon: 'checkmark-circle-outline',
          items: [
            { label: 'Total Inspections', value: stats?.total_inspections || 0 },
            { label: 'Failed Inspections', value: stats?.failed_inspections || 0 },
            { label: 'Upcoming', value: stats?.upcoming_inspections || 0 },
          ],
        },
        {
          title: 'Shifts',
          icon: 'time-outline',
          items: [
            { label: 'Active Shifts', value: stats?.active_shifts || 0 },
            { label: 'Completed Today', value: stats?.completed_shifts_today || 0 },
          ],
        },
      ];

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Reports</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reports...</Text>
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
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSubtitle}>Fleet statistics and metrics</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {reportSections.map((section, index) => (
            <Card key={index} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name={section.icon as any} size={24} color="#3b82f6" />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              <View style={styles.itemsContainer}>
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.itemRow}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <View style={styles.valueBadge}>
                      <Text style={styles.itemValue}>{item.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          ))}

          {user?.role !== 'driver' && (
            <Card style={styles.actionsCard}>
              <Text style={styles.actionsTitle}>Export Reports</Text>
              <Text style={styles.actionsSubtitle}>
                Generate detailed reports for analysis
              </Text>
              <View style={styles.actionsButtons}>
                <Button
                  title="Export CSV"
                  onPress={() => {
                    Alert.alert('Coming Soon', 'CSV export feature will be available soon');
                  }}
                  variant="outline"
                  style={styles.actionButton}
                />
                <Button
                  title="Export PDF"
                  onPress={() => {
                    Alert.alert('Coming Soon', 'PDF export feature will be available soon');
                  }}
                  variant="outline"
                  style={styles.actionButton}
                />
              </View>
            </Card>
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
  scrollContent: {
    padding: 16,
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
  sectionCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  itemsContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  valueBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  actionsCard: {
    marginBottom: 16,
    padding: 16,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  actionsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  actionsButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

