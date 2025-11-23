import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LineChart, BarChart } from 'react-native-chart-kit'
import { authService, AuthUser } from '../../services/authService'
import { apiService, DashboardStats } from '../../services/apiService'
import { analytics } from '../../services/mixpanel'
import { FuelDetectionResult } from '../../services/fuelDetectionService'

const { width } = Dimensions.get('window')

export default function DashboardScreen() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    initializeDashboard()
    
    // Animate entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [])

  const initializeDashboard = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      // Try to get dashboard stats, but don't fail if it doesn't exist
      try {
        const statsData = await apiService.getDashboardStats();
        setStats(statsData);
        
        analytics.track('Dashboard Loaded', {
          user_role: userData?.role,
          total_vehicles: statsData?.total_vehicles,
          active_vehicles: statsData?.active_vehicles,
        });
      } catch (statsError) {
        console.warn('Dashboard stats not available, using defaults:', statsError);
        // Set default stats so the screen doesn't stay in loading state
        setStats({
          total_vehicles: 0,
          active_vehicles: 0,
          vehicles_in_maintenance: 0,
          upcoming_inspections: 0,
          open_issues: 0,
          active_shifts: 0,
        });
      }
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      // Set default stats to prevent infinite loading
      setStats({
        total_vehicles: 0,
        active_vehicles: 0,
        vehicles_in_maintenance: 0,
        upcoming_inspections: 0,
        open_issues: 0,
        active_shifts: 0,
      });
      analytics.track('Dashboard Load Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      });
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    try {
      const statsData = await apiService.getDashboardStats()
      setStats(statsData)
      
      analytics.track('Dashboard Refreshed')
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#4ade80'
      case 'warning': return '#f59e0b'
      case 'critical': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const chartConfig = {
    backgroundColor: '#1a1a2e',
    backgroundGradientFrom: '#1a1a2e',
    backgroundGradientTo: '#16213e',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#4ade80',
    },
  }

  const vehicleStatusData = stats ? {
    labels: ['Active', 'Maintenance', 'Inactive'],
    datasets: [{
      data: [stats.active_vehicles, stats.vehicles_in_maintenance, stats.total_vehicles - stats.active_vehicles - stats.vehicles_in_maintenance],
      color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
    }],
  } : null

  const StatCard = ({ title, value, subtitle, icon, color, onPress }: {
    title: string
    value: string | number
    subtitle?: string
    icon: keyof typeof Ionicons.glyphMap
    color: string
    onPress?: () => void
  }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          onPress()
        }
      }}
      disabled={!onPress}
    >
      <View style={styles.statCardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#4ade80"
              colors={['#4ade80']}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[styles.content, { opacity: fadeAnim }]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.userName}>
                  {user?.first_name || user?.username || 'User'}
                </Text>
                <Text style={styles.userRole}>{user?.role_display}</Text>
              </View>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#4ade80', '#22c55e']}
                  style={styles.avatar}
                >
                  <Ionicons name="person" size={24} color="#ffffff" />
                </LinearGradient>
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Active Vehicles"
                value={stats?.active_vehicles || 0}
                subtitle="Ready for use"
                icon="car"
                color="#4ade80"
              />
              <StatCard
                title="Pending Inspections"
                value={stats?.upcoming_inspections || 0}
                subtitle="Due soon"
                icon="clipboard"
                color="#f59e0b"
              />
              <StatCard
                title="Open Issues"
                value={stats?.open_issues || 0}
                subtitle="Need attention"
                icon="warning"
                color="#ef4444"
              />
              <StatCard
                title="Active Shifts"
                value={stats?.active_shifts || 0}
                subtitle="In progress"
                icon="time"
                color="#3b82f6"
              />
            </View>

            {/* Charts Section */}
            <View style={styles.chartsSection}>
              <Text style={styles.sectionTitle}>Vehicle Status Overview</Text>
              {vehicleStatusData && (
                <View style={styles.chartContainer}>
                  <BarChart
                    data={vehicleStatusData}
                    width={width - 40}
                    height={200}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    showValuesOnTopOfBars={true}
                  />
                </View>
              )}
            </View>

            {/* Recent Activity */}
            <View style={styles.activitySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.activityList}>
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#4ade80' + '20' }]}>
                    <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Inspection Completed</Text>
                    <Text style={styles.activitySubtitle}>Vehicle ABC-123 passed inspection</Text>
                    <Text style={styles.activityTime}>2 hours ago</Text>
                  </View>
                </View>

                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#f59e0b' + '20' }]}>
                    <Ionicons name="warning" size={20} color="#f59e0b" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Maintenance Due</Text>
                    <Text style={styles.activitySubtitle}>Vehicle XYZ-789 needs service</Text>
                    <Text style={styles.activityTime}>4 hours ago</Text>
                  </View>
                </View>

                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#3b82f6' + '20' }]}>
                    <Ionicons name="play-circle" size={20} color="#3b82f6" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Shift Started</Text>
                    <Text style={styles.activitySubtitle}>Driver John Doe started shift</Text>
                    <Text style={styles.activityTime}>6 hours ago</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <LinearGradient
                    colors={['#4ade80', '#22c55e']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="add-circle" size={24} color="#ffffff" />
                    <Text style={styles.quickActionText}>Start Inspection</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="car" size={24} color="#ffffff" />
                    <Text style={styles.quickActionText}>Start Shift</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <LinearGradient
                    colors={['#f59e0b', '#d97706']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="camera" size={24} color="#ffffff" />
                    <Text style={styles.quickActionText}>Report Issue</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <LinearGradient
                    colors={['#8b5cf6', '#7c3aed']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="analytics" size={24} color="#ffffff" />
                    <Text style={styles.quickActionText}>View Reports</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '500',
  },
  avatarContainer: {
    marginLeft: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    marginBottom: 15,
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  chartsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  activitySection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '500',
  },
  activityList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#a0a0a0',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#6b7280',
  },
  quickActionsSection: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
})

