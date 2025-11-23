import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUserProfile } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { apiService } from '../../services/apiService';
import { locationTrackingService } from '../../services/locationTrackingService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DriverDashboard: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [activeVehicle, setActiveVehicle] = useState<any>(null);
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [stats, setStats] = useState({
    vehiclesActive: 0,
    issuesToday: 0,
    inspectionsCompleted: 0,
    driverStatus: 'Available',
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;
  
  const dispatch = useAppDispatch();
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);
  
  // Calculate bottom padding to avoid tab bar overlap
  const tabBarBaseHeight = 60;
  const tabBarPadding = Math.max(insets.bottom, 12);
  const tabBarTotalHeight = tabBarBaseHeight + tabBarPadding;
  const bottomPadding = tabBarTotalHeight + 20;

  useEffect(() => {
    // Animate on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        await dispatch(fetchUserProfile());
        return;
      }
      
      try {
        setLoading(true);
        // Fetch shifts
        const shifts = await apiService.getShifts();
        const active = shifts.find((s: any) => {
          const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
          return s.status === 'ACTIVE' && driverId === user?.id;
        });
        setActiveShift(active || null);
        
        // Get upcoming shifts
        const today = new Date().toISOString().split('T')[0];
        const upcoming = shifts
          .filter((s: any) => {
            const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
            return driverId === user?.id && s.status !== 'ACTIVE' && s.start_at?.startsWith(today);
          })
          .slice(0, 3);
        setUpcomingShifts(upcoming);
        
        // Get active vehicle
        if (active) {
          const vehicleId = typeof active.vehicle === 'object' ? active.vehicle.id : active.vehicle;
          try {
            const vehicle = await apiService.getVehicle(vehicleId);
            setActiveVehicle(vehicle);
          } catch (error) {
            console.error('Error fetching vehicle:', error);
          }
        } else {
          const vehicles = await apiService.getVehicles();
          const available = vehicles.find((v: any) => v.status === 'ACTIVE');
          setActiveVehicle(available || null);
        }
        
        // Fetch stats and activities data in parallel
        try {
          const [vehicles, inspections, issues, notifications] = await Promise.all([
            apiService.getVehicles().catch(() => []),
            apiService.getInspections().catch(() => []),
            apiService.getIssues().catch(() => []),
            apiService.getNotifications().catch(() => []),
          ]);
          
          // Calculate inspections completed by this driver
          const completedInspections = inspections.filter((insp: any) => {
            const inspectorId = typeof insp.created_by === 'object' ? insp.created_by.id : insp.created_by;
            return inspectorId.toString() === user?.id?.toString() && (insp.status === 'PASS' || insp.status === 'PASSED' || insp.status === 'COMPLETED');
          });
          
          setStats(prev => ({
            ...prev,
            vehiclesActive: vehicles.filter((v: any) => v.status === 'ACTIVE').length,
            inspectionsCompleted: completedInspections.length,
            driverStatus: active ? 'On Shift' : 'Available',
          }));
        
        // Filter driver's issues
        const driverIssues = issues.filter((issue: any) => {
          const reporterId = typeof issue.reported_by === 'object' ? issue.reported_by.id : issue.reported_by;
          return reporterId.toString() === user?.id?.toString();
        });
        
        // Filter driver's notifications
        const driverNotifications = notifications.filter((notif: any) => {
          const userId = typeof notif.user === 'object' ? notif.user.id : notif.user;
          return userId.toString() === user?.id?.toString();
        });
        
        // Build activities array from multiple sources
        const activities: any[] = [];
        
        // Add recent shifts (started and completed)
        const driverShifts = shifts
          .filter((s: any) => {
            const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
            return driverId.toString() === user?.id?.toString();
          })
          .sort((a: any, b: any) => new Date(b.end_at || b.start_at).getTime() - new Date(a.end_at || a.start_at).getTime())
          .slice(0, 5);
        
        driverShifts.forEach((shift: any) => {
          if (shift.status === 'ACTIVE') {
            activities.push({
              id: `shift-${shift.id}`,
              title: 'Shift Started',
              description: `Started shift for ${typeof shift.vehicle === 'object' ? shift.vehicle.reg_number : 'Vehicle'}`,
              time: formatTimeAgo(shift.start_at),
              icon: 'play-circle' as keyof typeof Ionicons.glyphMap,
              color: '#3b82f6',
              type: 'shift_started',
              timestamp: new Date(shift.start_at).getTime(),
            });
          } else if (shift.status === 'COMPLETED') {
            activities.push({
              id: `shift-${shift.id}`,
              title: 'Shift Completed',
              description: `Completed shift for ${typeof shift.vehicle === 'object' ? shift.vehicle.reg_number : 'Vehicle'}`,
              time: formatTimeAgo(shift.end_at || shift.start_at),
              icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
              color: '#10b981',
              type: 'completed',
              timestamp: new Date(shift.end_at || shift.start_at).getTime(),
            });
          }
        });
        
        // Add recent inspections
        const recentInspections = inspections
          .filter((insp: any) => {
            const inspectorId = typeof insp.created_by === 'object' ? insp.created_by.id : insp.created_by;
            return inspectorId.toString() === user?.id?.toString();
          })
          .sort((a: any, b: any) => new Date(b.started_at || b.created_at).getTime() - new Date(a.started_at || a.created_at).getTime())
          .slice(0, 5);
        
        recentInspections.forEach((inspection: any) => {
          const inspectionType = inspection.type === 'START' ? 'Pre-Trip' : 'Post-Trip';
          const statusIcon = inspection.status === 'PASS' || inspection.status === 'PASSED' 
            ? 'checkmark-circle' 
            : inspection.status === 'FAIL' || inspection.status === 'FAILED'
            ? 'close-circle'
            : 'time';
          const statusColor = inspection.status === 'PASS' || inspection.status === 'PASSED'
            ? '#10b981'
            : inspection.status === 'FAIL' || inspection.status === 'FAILED'
            ? '#ef4444'
            : '#f59e0b';
          
          activities.push({
            id: `inspection-${inspection.id}`,
            title: `${inspectionType} Inspection ${inspection.status === 'PASS' || inspection.status === 'PASSED' ? 'Passed' : inspection.status === 'FAIL' || inspection.status === 'FAILED' ? 'Failed' : 'Started'}`,
            description: `${inspectionType} inspection ${inspection.address ? `at ${inspection.address}` : ''}`,
            time: formatTimeAgo(inspection.started_at || inspection.created_at),
            icon: statusIcon as keyof typeof Ionicons.glyphMap,
            color: statusColor,
            type: inspection.status === 'PASS' || inspection.status === 'PASSED' ? 'completed' : inspection.status === 'FAIL' || inspection.status === 'FAILED' ? 'warning' : 'in_progress',
            timestamp: new Date(inspection.started_at || inspection.created_at).getTime(),
          });
        });
        
        // Add recent issues reported
        driverIssues
          .sort((a: any, b: any) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime())
          .slice(0, 3)
          .forEach((issue: any) => {
            activities.push({
              id: `issue-${issue.id}`,
              title: 'Issue Reported',
              description: `${issue.title} - ${issue.category}`,
              time: formatTimeAgo(issue.reported_at),
              icon: 'warning' as keyof typeof Ionicons.glyphMap,
              color: issue.severity === 'CRITICAL' ? '#ef4444' : issue.severity === 'HIGH' ? '#f59e0b' : '#3b82f6',
              type: 'warning',
              timestamp: new Date(issue.reported_at).getTime(),
            });
          });
        
        // Add recent notifications
        driverNotifications
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
          .forEach((notif: any) => {
            const notifIcon = notif.type === 'TICKET_ASSIGNED' ? 'ticket' :
                             notif.type === 'INSPECTION_FAILED' ? 'alert-circle' :
                             notif.type === 'SHIFT_STARTED' ? 'play-circle' :
                             notif.type === 'SHIFT_ENDED' ? 'stop-circle' :
                             'notifications';
            const notifColor = notif.priority === 'URGENT' || notif.priority === 'HIGH' ? '#ef4444' : '#3b82f6';
            
            activities.push({
              id: `notification-${notif.id}`,
              title: notif.title,
              description: notif.message,
              time: formatTimeAgo(notif.created_at),
              icon: notifIcon as keyof typeof Ionicons.glyphMap,
              color: notifColor,
              type: notif.priority === 'URGENT' || notif.priority === 'HIGH' ? 'warning' : 'info',
              timestamp: new Date(notif.created_at).getTime(),
            });
          });
        
        // Sort all activities by timestamp (most recent first) and take top 5
        const sortedActivities = activities
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5);
        
        setRecentActivities(sortedActivities);
        } catch (error) {
          console.error('Error fetching activities:', error);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, dispatch]);
  
  const formatTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Unknown time';
    }
  };

  useEffect(() => {
    return () => {
      locationTrackingService.stopTracking().catch(err => {
        console.error('[DriverDashboard] Error stopping location tracking:', err);
      });
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Reload user profile first
      await dispatch(fetchUserProfile());
      
      if (!user) {
        const userState = await dispatch(fetchUserProfile()).unwrap();
        if (!userState) {
          setRefreshing(false);
          return;
        }
      }
      
      const currentUser = user || (await dispatch(fetchUserProfile()).unwrap());
      if (!currentUser) {
        setRefreshing(false);
        return;
      }
      
      // Fetch all data in parallel (bypass cache on refresh)
      const [shifts, vehicles, inspections] = await Promise.all([
        apiService.getShifts(false).catch(() => []),
        apiService.getVehicles(false).catch(() => []),
        apiService.getInspections(false).catch(() => []),
      ]);
      
      // Find active shift
      const active = shifts.find((s: any) => {
        const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
        return s.status === 'ACTIVE' && driverId === currentUser.id;
      });
      setActiveShift(active || null);
      
      // Get upcoming shifts
      const today = new Date().toISOString().split('T')[0];
      const upcoming = shifts
        .filter((s: any) => {
          const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
          return driverId === currentUser.id && s.status !== 'ACTIVE' && s.start_at?.startsWith(today);
        })
        .slice(0, 3);
      setUpcomingShifts(upcoming);
      
      // Get active vehicle
      if (active) {
        const vehicleId = typeof active.vehicle === 'object' ? active.vehicle.id : active.vehicle;
        try {
          const vehicle = await apiService.getVehicle(vehicleId);
          setActiveVehicle(vehicle);
        } catch (error) {
          console.error('Error fetching vehicle:', error);
        }
      } else {
        const available = vehicles.find((v: any) => v.status === 'ACTIVE');
        setActiveVehicle(available || null);
      }
      
      // Update stats
      const driverInspections = inspections.filter((insp: any) => {
        const inspectorId = typeof insp.created_by === 'object' ? insp.created_by.id : insp.created_by;
        return inspectorId === currentUser.id && (insp.status === 'PASS' || insp.status === 'PASSED' || insp.status === 'COMPLETED');
      });
      
      setStats({
        vehiclesActive: vehicles.filter((v: any) => v.status === 'ACTIVE').length,
        inspectionsCompleted: driverInspections.length,
        issuesToday: 0, // TODO: Fetch issues if available
        driverStatus: active ? 'On Shift' : 'Available',
      });
      
      // Fetch and update recent activities from multiple sources
      const [issues, notifications] = await Promise.all([
        apiService.getIssues().catch(() => []),
        apiService.getNotifications().catch(() => []),
      ]);
      
      // Filter driver's issues
      const driverIssues = issues.filter((issue: any) => {
        const reporterId = typeof issue.reported_by === 'object' ? issue.reported_by.id : issue.reported_by;
        return reporterId.toString() === currentUser.id.toString();
      });
      
      // Filter driver's notifications
      const driverNotifications = notifications.filter((notif: any) => {
        const userId = typeof notif.user === 'object' ? notif.user.id : notif.user;
        return userId.toString() === currentUser.id.toString();
      });
      
      // Build activities array from multiple sources
      const activities: any[] = [];
      
      // Add recent shifts
      const driverShifts = shifts
        .filter((s: any) => {
          const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
          return driverId.toString() === currentUser.id.toString();
        })
        .sort((a: any, b: any) => new Date(b.end_at || b.start_at).getTime() - new Date(a.end_at || a.start_at).getTime())
        .slice(0, 5);
      
      driverShifts.forEach((shift: any) => {
        if (shift.status === 'ACTIVE') {
          activities.push({
            id: `shift-${shift.id}`,
            title: 'Shift Started',
            description: `Started shift for ${typeof shift.vehicle === 'object' ? shift.vehicle.reg_number : 'Vehicle'}`,
            time: formatTimeAgo(shift.start_at),
            icon: 'play-circle' as keyof typeof Ionicons.glyphMap,
            color: '#3b82f6',
            type: 'shift_started',
            timestamp: new Date(shift.start_at).getTime(),
          });
        } else if (shift.status === 'COMPLETED') {
          activities.push({
            id: `shift-${shift.id}`,
            title: 'Shift Completed',
            description: `Completed shift for ${typeof shift.vehicle === 'object' ? shift.vehicle.reg_number : 'Vehicle'}`,
            time: formatTimeAgo(shift.end_at || shift.start_at),
            icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
            color: '#10b981',
            type: 'completed',
            timestamp: new Date(shift.end_at || shift.start_at).getTime(),
          });
        }
      });
      
      // Add recent inspections
      const recentInspectionsForActivity = inspections
        .filter((insp: any) => {
          const inspectorId = typeof insp.created_by === 'object' ? insp.created_by.id : insp.created_by;
          return inspectorId.toString() === currentUser.id.toString();
        })
        .sort((a: any, b: any) => new Date(b.started_at || b.created_at).getTime() - new Date(a.started_at || a.created_at).getTime())
        .slice(0, 5);
      
      recentInspectionsForActivity.forEach((inspection: any) => {
        const inspectionType = inspection.type === 'START' ? 'Pre-Trip' : 'Post-Trip';
        const statusIcon = inspection.status === 'PASS' || inspection.status === 'PASSED' 
          ? 'checkmark-circle' 
          : inspection.status === 'FAIL' || inspection.status === 'FAILED'
          ? 'close-circle'
          : 'time';
        const statusColor = inspection.status === 'PASS' || inspection.status === 'PASSED'
          ? '#10b981'
          : inspection.status === 'FAIL' || inspection.status === 'FAILED'
          ? '#ef4444'
          : '#f59e0b';
        
        activities.push({
          id: `inspection-${inspection.id}`,
          title: `${inspectionType} Inspection ${inspection.status === 'PASS' || inspection.status === 'PASSED' ? 'Passed' : inspection.status === 'FAIL' || inspection.status === 'FAILED' ? 'Failed' : 'Started'}`,
          description: `${inspectionType} inspection ${inspection.address ? `at ${inspection.address}` : ''}`,
          time: formatTimeAgo(inspection.started_at || inspection.created_at),
          icon: statusIcon as keyof typeof Ionicons.glyphMap,
          color: statusColor,
          type: inspection.status === 'PASS' || inspection.status === 'PASSED' ? 'completed' : inspection.status === 'FAIL' || inspection.status === 'FAILED' ? 'warning' : 'in_progress',
          timestamp: new Date(inspection.started_at || inspection.created_at).getTime(),
        });
      });
      
      // Add recent issues
      driverIssues
        .sort((a: any, b: any) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime())
        .slice(0, 3)
        .forEach((issue: any) => {
          activities.push({
            id: `issue-${issue.id}`,
            title: 'Issue Reported',
            description: `${issue.title} - ${issue.category}`,
            time: formatTimeAgo(issue.reported_at),
            icon: 'warning' as keyof typeof Ionicons.glyphMap,
            color: issue.severity === 'CRITICAL' ? '#ef4444' : issue.severity === 'HIGH' ? '#f59e0b' : '#3b82f6',
            type: 'warning',
            timestamp: new Date(issue.reported_at).getTime(),
          });
        });
      
      // Add recent notifications
      driverNotifications
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .forEach((notif: any) => {
          const notifIcon = notif.type === 'TICKET_ASSIGNED' ? 'ticket' :
                           notif.type === 'INSPECTION_FAILED' ? 'alert-circle' :
                           notif.type === 'SHIFT_STARTED' ? 'play-circle' :
                           notif.type === 'SHIFT_ENDED' ? 'stop-circle' :
                           'notifications';
          const notifColor = notif.priority === 'URGENT' || notif.priority === 'HIGH' ? '#ef4444' : '#3b82f6';
          
          activities.push({
            id: `notification-${notif.id}`,
            title: notif.title,
            description: notif.message,
            time: formatTimeAgo(notif.created_at),
            icon: notifIcon as keyof typeof Ionicons.glyphMap,
            color: notifColor,
            type: notif.priority === 'URGENT' || notif.priority === 'HIGH' ? 'warning' : 'info',
            timestamp: new Date(notif.created_at).getTime(),
          });
        });
      
      // Sort all activities by timestamp and take top 5
      const sortedActivities = activities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
      
      setRecentActivities(sortedActivities);
      
    } catch (error) {
      console.error('Error refreshing:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [user, dispatch]);

  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        address: address ? `${address.street || ''} ${address.city || ''} ${address.postalCode || ''}`.trim() : 'Unknown location',
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }, []);

  const handleStartShift = useCallback(async () => {
    if (actionLoading) return;
    
    try {
      setActionLoading('startShift');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Use cached vehicles first for faster response
      const vehicles = await apiService.getVehicles();
      const activeVehicles = vehicles.filter((v: any) => v.status === 'ACTIVE');
      
      if (activeVehicles.length === 0) {
        Alert.alert('No Vehicles', 'No active vehicles available. Please contact your administrator.');
        setActionLoading(null);
        return;
      }

      let vehicleId: number;
      if (activeVehicles.length === 1) {
        vehicleId = activeVehicles[0].id;
      } else {
        Alert.alert(
          'Select Vehicle', 
          'Multiple vehicles available. Please select one from the Vehicles tab.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Go to Vehicles',
              onPress: () => {
                (navigation as any).navigate('Vehicles');
              }
            }
          ]
        );
        setActionLoading(null);
        return;
      }

      const location = await getCurrentLocation();
      if (!location) {
        setActionLoading(null);
        return;
      }

      const shift = await apiService.startShift(
        vehicleId,
        location.address,
        location.lat,
        location.lng
      );
      
      setActiveShift(shift);
      
      // Refresh shifts (bypass cache to get latest)
      try {
        const updatedShifts = await apiService.getShifts(false);
        const updatedActive = updatedShifts.find((s: any) => {
          const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
          return s.status === 'ACTIVE' && driverId.toString() === user?.id?.toString() && s.id === shift.id;
        });
        if (updatedActive) {
          setActiveShift(updatedActive);
        }
      } catch (error) {
        console.error('Error reloading shifts:', error);
      }

      // Start location tracking
      try {
        await locationTrackingService.startTracking({
          vehicleId: vehicleId,
          intervalMs: 30000,
          minAccuracy: 100,
          enableInBackground: true,
        });
      } catch (trackingError: any) {
        console.error('[DriverDashboard] Failed to start location tracking:', trackingError);
      }

      const vehicle = activeVehicles.find((v: any) => v.id === vehicleId);
      if (vehicle) {
        setActiveVehicle(vehicle);
      }
      
      // Update stats and refresh dashboard data (bypass cache for fresh data)
      setStats(prev => ({
        ...prev,
        driverStatus: 'On Shift',
      }));
      
      // Refresh dashboard data
      try {
        const [updatedShifts, updatedVehicles, updatedInspections] = await Promise.all([
          apiService.getShifts(false).catch(() => []),
          apiService.getVehicles(false).catch(() => []),
          apiService.getInspections(false).catch(() => []),
        ]);
        
        const updatedActive = updatedShifts.find((s: any) => {
          const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
          return s.status === 'ACTIVE' && driverId.toString() === user?.id?.toString() && s.id === shift.id;
        });
        if (updatedActive) {
          setActiveShift(updatedActive);
        }
        
        const driverInspections = updatedInspections.filter((insp: any) => {
          const inspectorId = typeof insp.created_by === 'object' ? insp.created_by.id : insp.created_by;
          return inspectorId.toString() === user?.id?.toString() && (insp.status === 'PASS' || insp.status === 'PASSED' || insp.status === 'COMPLETED');
        });
        
        setStats(prev => ({
          ...prev,
          vehiclesActive: updatedVehicles.filter((v: any) => v.status === 'ACTIVE').length,
          inspectionsCompleted: driverInspections.length,
          driverStatus: 'On Shift',
        }));
      } catch (refreshError) {
        console.error('Error refreshing after shift start:', refreshError);
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Shift Started',
        message: `Shift started successfully at ${location.address}`,
      }));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Success', 
        `Shift started successfully!\n\nVehicle: ${vehicle?.reg_number || vehicleId}\nLocation: ${location.address}\n\nYou can now start an inspection from the Quick Actions.`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error: any) {
      console.error('[DriverDashboard] Error starting shift:', error);
      
      let errorMessage = 'Failed to start shift. Please try again.';
      if (error.message) {
        errorMessage = error.message;
        if (error.message.includes('vehicle')) {
          errorMessage = 'Vehicle not found or not available.';
        } else if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
          errorMessage = 'You do not have permission to start a shift.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error Starting Shift', errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Shift Start Failed',
        message: errorMessage,
      }));
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, user, navigation, dispatch]);

  const handleViewSchedule = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    (navigation as any).navigate('Reports');
  }, [navigation]);

  const handleReportIssue = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get active shift to get the vehicle
      const shifts = await apiService.getShifts();
      const activeShift = shifts.find((s: any) => {
        const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
        return s.status === 'ACTIVE' && driverId.toString() === user?.id?.toString();
      });

      if (!activeShift) {
        Alert.alert(
          'No Active Shift',
          'You need to start a shift before reporting an issue. Would you like to start a shift?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Start Shift',
              onPress: () => {
                // Trigger start shift
                handleStartShift();
              },
            },
          ]
        );
        return;
      }

      // Get vehicle from active shift
      const vehicleId = typeof activeShift.vehicle === 'object' ? activeShift.vehicle.id : activeShift.vehicle;
      
      // Get location for the issue
      const location = await getCurrentLocation();
      
      // Navigate to Vehicles tab
      (navigation as any).navigate('Vehicles');
      
      // Show success message after navigation
      setTimeout(() => {
        Alert.alert(
          'Report Issue',
          `To report an issue for your active vehicle, please:\n\n1. Go to the Vehicles tab\n2. Find your vehicle\n3. Tap "Report Issue"\n\nOr you can report it directly from here.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Report Now',
              onPress: async () => {
                try {
                  // Create issue with default description
                  await apiService.createIssue({
                    vehicle: vehicleId,
                    title: 'Driver Reported Issue',
                    description: 'Issue reported from dashboard - please update with details',
                    category: 'OTHER',
                    severity: 'MEDIUM',
                    location_description: location?.address || 'Unknown location',
                    lat: location?.lat,
                    lng: location?.lng,
                  });

                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert('Success', 'Issue reported successfully! You can add more details from the Vehicles tab.');
                  dispatch(addNotification({
                    type: 'success',
                    title: 'Issue Reported',
                    message: 'Your issue has been reported and will be reviewed.',
                  }));
                } catch (error: any) {
                  console.error('[DriverDashboard] Error reporting issue:', error);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  Alert.alert('Error', 'Failed to report issue. Please try again from the Vehicles tab.');
                }
              },
            },
          ]
        );
      }, 500);
    } catch (error) {
      console.error('[DriverDashboard] Error in report issue:', error);
      // Fallback: navigate to Vehicles tab
      (navigation as any).navigate('Vehicles');
      Alert.alert(
        'Report Issue',
        'Please navigate to the Vehicles tab and use the "Report Issue" option on your vehicle.',
        [{ text: 'OK' }]
      );
    }
  }, [navigation, user, dispatch, handleStartShift]);

  const handleEndShift = async () => {
    if (actionLoading) return;
    
    if (!activeShift) {
      Alert.alert('No Active Shift', 'You do not have an active shift to end.');
      return;
    }
    
    try {
      setActionLoading('endShift');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const location = await getCurrentLocation();
      if (!location) {
        setActionLoading(null);
        return;
      }

      await apiService.endShift(
        activeShift.id,
        location.address,
        location.lat,
        location.lng
      );

      // Stop location tracking
      try {
        await locationTrackingService.stopTracking();
      } catch (trackingError: any) {
        console.error('[DriverDashboard] Failed to stop location tracking:', trackingError);
      }

      // Refresh dashboard data
      try {
        const [updatedShifts, updatedVehicles, updatedInspections] = await Promise.all([
          apiService.getShifts().catch(() => []),
          apiService.getVehicles().catch(() => []),
          apiService.getInspections().catch(() => []),
        ]);
        
        const updatedActive = updatedShifts.find((s: any) => {
          const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
          return s.status === 'ACTIVE' && driverId === user?.id;
        });
        setActiveShift(updatedActive || null);
        
        const driverInspections = updatedInspections.filter((insp: any) => {
          const inspectorId = typeof insp.created_by === 'object' ? insp.created_by.id : insp.created_by;
          return inspectorId === user?.id && (insp.status === 'PASS' || insp.status === 'PASSED' || insp.status === 'COMPLETED');
        });
        
        setStats(prev => ({
          ...prev,
          vehiclesActive: updatedVehicles.filter((v: any) => v.status === 'ACTIVE').length,
          inspectionsCompleted: driverInspections.length,
          driverStatus: 'Available',
        }));
      } catch (refreshError) {
        console.error('Error refreshing after shift end:', refreshError);
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Shift Ended',
        message: `Shift ended successfully at ${location.address}`,
      }));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', `Shift ended successfully!\n\nLocation: ${location.address}`);
    } catch (error: any) {
      console.error('[DriverDashboard] Error ending shift:', error);
      
      let errorMessage = 'Failed to end shift. Please try again.';
      if (error.message) {
        errorMessage = error.message;
        if (error.message.includes('shift') || error.message.includes('not found')) {
          errorMessage = 'Shift not found or already ended.';
        } else if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
          errorMessage = 'You do not have permission to end this shift.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error Ending Shift', errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Shift End Failed',
        message: errorMessage,
      }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartInspection = useCallback(async () => {
    if (actionLoading) return;
    
    try {
      setActionLoading('inspection');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Use cached shifts if available, but refresh to get latest
      const shifts = await apiService.getShifts(false);
      const activeShift = shifts.find((s: any) => {
        const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
        return s.status === 'ACTIVE' && driverId.toString() === user?.id?.toString();
      });
      
      if (!activeShift) {
        Alert.alert(
          'No Active Shift', 
          'You need to start a shift before performing an inspection. Please use the "Start Shift" button first.',
          [{ text: 'OK', style: 'default' }]
        );
        setActionLoading(null);
        return;
      }

      const location = await getCurrentLocation();
      if (!location) {
        setActionLoading(null);
        return;
      }

      const inspection = await apiService.createInspection({
        shift: activeShift.id,
        type: 'START',
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        notes: 'Pre-shift inspection',
        weather_conditions: 'Unknown',
      });

      // Refresh dashboard data after inspection start (bypass cache)
      try {
        const [updatedShifts, updatedVehicles, updatedInspections] = await Promise.all([
          apiService.getShifts(false).catch(() => []),
          apiService.getVehicles(false).catch(() => []),
          apiService.getInspections(false).catch(() => []),
        ]);
        
        const updatedActive = updatedShifts.find((s: any) => {
          const driverId = typeof s.driver === 'object' ? s.driver.id : s.driver;
          return s.status === 'ACTIVE' && driverId.toString() === user?.id?.toString();
        });
        setActiveShift(updatedActive || null);
        
        // Update inspections completed count
        const driverInspections = updatedInspections.filter((insp: any) => {
          const inspectorId = typeof insp.created_by === 'object' ? insp.created_by.id : insp.created_by;
          return inspectorId.toString() === user?.id?.toString() && (insp.status === 'PASS' || insp.status === 'PASSED' || insp.status === 'COMPLETED');
        });
        
        setStats(prev => ({
          ...prev,
          inspectionsCompleted: driverInspections.length,
        }));
      } catch (refreshError) {
        console.error('Error refreshing after inspection start:', refreshError);
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Inspection Started',
        message: `Inspection started successfully. Inspection ID: ${inspection.id}`,
      }));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show success alert with option to view inspection
      Alert.alert(
        'Inspection Started', 
        `Inspection started successfully!\n\nLocation: ${location.address}\nInspection ID: ${inspection.id}`,
        [
          { text: 'OK', style: 'default' },
          {
            text: 'View Inspections',
            onPress: () => {
              // Navigate to Reports tab which shows inspections for drivers
              (navigation as any).navigate('Reports');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('[DriverDashboard] Error starting inspection:', error);
      
      let errorMessage = 'Failed to start inspection. Please try again.';
      if (error.message) {
        errorMessage = error.message;
        if (error.message.includes('shift') || error.message.includes('active')) {
          errorMessage = 'No active shift found. Please start a shift first.';
        } else if (error.message.includes('permission') || error.message.includes('Unauthorized')) {
          errorMessage = 'You do not have permission to start an inspection.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error Starting Inspection', errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Inspection Start Failed',
        message: errorMessage,
      }));
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, user, navigation, dispatch]);

  const handleButtonPress = async (index: number, action: () => void | Promise<void>) => {
    console.log('[DriverDashboard] Button pressed:', index, action.name || 'action');
    
    // Haptic feedback first
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    
    // Animation
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Execute action
    try {
      await action();
    } catch (error) {
      console.error('[DriverDashboard] Error in button action:', error);
    }
  };

  const quickActions = useMemo(() => [
    {
      title: activeShift ? 'End Shift' : 'Start Shift',
      icon: (activeShift ? 'stop-circle' : 'play-circle') as keyof typeof Ionicons.glyphMap,
      gradient: activeShift ? ['#ef4444', '#dc2626'] : ['#10b981', '#059669'],
      action: activeShift ? handleEndShift : handleStartShift,
      loading: activeShift ? actionLoading === 'endShift' : actionLoading === 'startShift',
    },
    {
      title: 'View Schedule',
      icon: 'calendar' as keyof typeof Ionicons.glyphMap,
      gradient: ['#3b82f6', '#2563eb'],
      action: handleViewSchedule,
      loading: false,
    },
    {
      title: 'Report Issue',
      icon: 'warning' as keyof typeof Ionicons.glyphMap,
      gradient: ['#f59e0b', '#d97706'],
      action: handleReportIssue,
      loading: false,
    },
    {
      title: 'Start Inspection',
      icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
      gradient: ['#8b5cf6', '#7c3aed'],
      action: handleStartInspection,
      loading: actionLoading === 'inspection',
    },
  ], [activeShift, actionLoading, handleEndShift, handleStartShift, handleViewSchedule, handleReportIssue, handleStartInspection]);

  const getActivityColor = useCallback((type: string) => {
    switch (type) {
      case 'completed':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'shift_started':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="flex-1 justify-center items-center gap-4">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-base font-medium text-slate-600 dark:text-slate-400">Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: bottomPadding, padding: 20 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor="#3b82f6"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Profile & Notifications */}
          <View className="flex-row items-center justify-between mb-6 px-1">
            <TouchableOpacity
              className="w-12 h-12 justify-center items-center"
              onPress={() => (navigation as any).navigate('Profile')}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                className="w-12 h-12 rounded-full justify-center items-center"
                style={{
                  shadowColor: '#667eea',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Ionicons name="person" size={20} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
            
            <View className="flex-1 items-center">
              <Text className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Welcome back
              </Text>
              <Text className="text-lg font-bold mt-0.5 text-slate-900 dark:text-slate-100">
                {user?.fullName || user?.username}
              </Text>
            </View>
            
            <TouchableOpacity
              className="w-12 h-12 justify-center items-center"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Notifications', 'Notification center coming soon!');
              }}
            >
              <View className="relative">
                <Ionicons name="notifications-outline" size={24} color={isDark ? '#f1f5f9' : '#1f2937'} />
                <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* KPI Cards */}
          <View className="flex-row justify-between mb-6 gap-3">
            <View className="flex-1 p-4 rounded-3xl items-center shadow-lg bg-white dark:bg-slate-800">
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                className="w-12 h-12 rounded-full justify-center items-center mb-3"
              >
                <Ionicons name="car" size={24} color="#ffffff" />
              </LinearGradient>
              <Text className="text-2xl font-bold mb-1 text-slate-900 dark:text-slate-100">{stats.vehiclesActive}</Text>
              <Text className="text-xs font-medium text-center text-slate-600 dark:text-slate-400">Active Vehicles</Text>
            </View>
            
            <View className="flex-1 p-4 rounded-3xl items-center shadow-lg bg-white dark:bg-slate-800">
              <LinearGradient
                colors={['#10b981', '#059669']}
                className="w-12 h-12 rounded-full justify-center items-center mb-3"
              >
                <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
              </LinearGradient>
              <Text className="text-2xl font-bold mb-1 text-slate-900 dark:text-slate-100">{stats.inspectionsCompleted}</Text>
              <Text className="text-xs font-medium text-center text-slate-600 dark:text-slate-400">Inspections</Text>
            </View>
            
            <View className="flex-1 p-4 rounded-3xl items-center shadow-lg bg-white dark:bg-slate-800">
              <LinearGradient
                colors={activeShift ? ['#10b981', '#059669'] : ['#f59e0b', '#d97706']}
                className="w-12 h-12 rounded-full justify-center items-center mb-3"
              >
                <Ionicons name={activeShift ? "radio-button-on" : "radio-button-off"} size={24} color="#ffffff" />
              </LinearGradient>
              <Text className="text-2xl font-bold mb-1 text-slate-900 dark:text-slate-100">{stats.driverStatus}</Text>
              <Text className="text-xs font-medium text-center text-slate-600 dark:text-slate-400">Driver Status</Text>
            </View>
          </View>

          {/* Welcome Card with Gradient */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            className="rounded-3xl p-6 mb-8 overflow-hidden"
            style={{
              shadowColor: '#667eea',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <BlurView intensity={20} className="rounded-3xl overflow-hidden">
              <Text className="text-2xl font-bold text-white mb-2">
                Ready to start your day?
              </Text>
              <Text className="text-base text-white/90 font-medium">
                {user?.company || 'Fleet Management'}
              </Text>
            </BlurView>
          </LinearGradient>

          {/* Quick Actions with Gradients */}
          <View className="mb-8">
            <View className="mb-4 relative">
              <Text className="text-2xl font-bold mb-2 tracking-tight text-slate-900 dark:text-slate-100">Quick Actions</Text>
              <View className="w-10 h-1 rounded-full bg-primary-500" />
              {recentActivities.length > 2 && (
                <TouchableOpacity
                  className="absolute right-0 top-1"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    (navigation as any).navigate('Reports');
                  }}
                >
                  <Text className="text-sm font-semibold text-primary-500">See More</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View className="flex-row flex-wrap justify-between gap-3">
              {quickActions.map((action, actionIndex) => (
                <Animated.View
                  key={actionIndex}
                  style={{ 
                    width: (SCREEN_WIDTH - 64) / 2,
                    transform: [{ scale: scaleAnims[actionIndex] }],
                  }}
                  className="mb-3"
                >
                <TouchableOpacity
                  onPress={() => {
                    console.log('[DriverDashboard] Quick action button pressed:', action.title, 'Index:', actionIndex);
                    if (action.action) {
                      handleButtonPress(actionIndex, action.action);
                    } else {
                      console.warn('[DriverDashboard] No action handler for:', action.title);
                    }
                  }}
                  disabled={action.loading}
                  activeOpacity={0.8}
                  className="w-full"
                >
                  <LinearGradient
                    colors={action.gradient as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-5 rounded-3xl items-center justify-center min-h-[100px] gap-3"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.2,
                      shadowRadius: 16,
                      elevation: 8,
                    }}
                  >
                    {action.loading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name={action.icon} size={24} color="#ffffff" />
                        <Text className="text-sm font-semibold text-white text-center">{action.title}</Text>
                      </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Today's Schedule */}
          <View className="mb-8">
            <View className="mb-4 relative">
              <Text className="text-2xl font-bold mb-2 tracking-tight text-slate-900 dark:text-slate-100">Today's Schedule</Text>
              <View className="w-10 h-1 rounded-full bg-primary-500" />
            </View>
            
            <View className="rounded-3xl p-5 shadow-lg bg-white dark:bg-slate-800">
              {upcomingShifts.length > 0 ? (
                <View>
                  {upcomingShifts.map((shift: any) => {
                    const startDate = new Date(shift.start_at);
                    const timeStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    const isCompleted = shift.status === 'COMPLETED';
                    const isActive = shift.status === 'ACTIVE';
                    
                    return (
                      <View key={`shift-${shift.id}`} className="flex-row items-center py-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                        <View className="w-15 items-center">
                          <Text className="text-base font-bold text-primary-500">{timeStr}</Text>
                        </View>
                        <View className="flex-1 ml-4">
                          <Text className="text-base font-semibold mb-1 text-slate-900 dark:text-slate-100">
                            {typeof shift.vehicle === 'object' 
                              ? `${shift.vehicle.reg_number || shift.vehicle.vin || 'Vehicle'}`
                              : 'Shift'}
                          </Text>
                          <Text className="text-sm text-slate-600 dark:text-slate-400">
                            {shift.start_address || 'Location not set'}
                          </Text>
                        </View>
                        <View className="ml-4">
                          {isCompleted ? (
                            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                          ) : isActive ? (
                            <Ionicons name="play-circle" size={24} color="#3b82f6" />
                          ) : (
                            <Ionicons name="ellipse" size={24} color="#9ca3af" />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View className="py-10 items-center justify-center gap-3">
                  <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
                  <Text className="text-sm font-medium text-center text-slate-600 dark:text-slate-400">
                    No shifts scheduled for today
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Recent Activity with Glass Effect */}
          <View className="mb-8">
            <View className="mb-4 relative">
              <Text className="text-2xl font-bold mb-2 tracking-tight text-slate-900 dark:text-slate-100">Recent Activity</Text>
              <View className="w-10 h-1 rounded-full bg-primary-500" />
              {recentActivities.length > 2 && (
                <TouchableOpacity
                  className="absolute right-0 top-1"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    (navigation as any).navigate('Reports');
                  }}
                >
                  <Text className="text-sm font-semibold text-primary-500">See More</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View className="rounded-3xl p-5 shadow-lg bg-white dark:bg-slate-800">
              {recentActivities.length > 0 ? (
                <View className="gap-3">
                  {recentActivities.slice(0, 2).map((activity) => {
                    const activityColor = getActivityColor(activity.type);
                    return (
                      <Animated.View
                        key={activity.id}
                        style={{
                          opacity: fadeAnim,
                          transform: [{ translateY: slideAnim }],
                        }}
                        className="rounded-2xl overflow-hidden"
                      >
                        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="flex-row items-center p-4 rounded-2xl bg-white/10 dark:bg-black/10">
                          <LinearGradient
                            colors={[`${activityColor}20`, `${activityColor}10`]}
                            className="w-12 h-12 rounded-full justify-center items-center mr-4"
                          >
                            <Ionicons name={activity.icon} size={22} color={activityColor} />
                          </LinearGradient>
                          <View className="flex-1">
                            <Text className="text-base font-semibold mb-1 text-slate-900 dark:text-slate-100">{activity.title}</Text>
                            <Text className="text-sm mb-1 text-slate-600 dark:text-slate-400">
                              {activity.description}
                            </Text>
                            <Text className="text-xs font-medium text-slate-500 dark:text-slate-500">{activity.time}</Text>
                          </View>
                        </BlurView>
                      </Animated.View>
                    );
                  })}
                </View>
              ) : (
                <View className="py-10 items-center justify-center gap-3">
                  <Ionicons name="time-outline" size={48} color="#9ca3af" />
                  <Text className="text-sm font-medium text-center text-slate-600 dark:text-slate-400">
                    No recent activity
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};
