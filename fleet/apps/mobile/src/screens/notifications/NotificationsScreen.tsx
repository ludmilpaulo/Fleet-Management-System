import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'

interface NotificationsScreenProps {
  navigation: any
}

interface NotificationData {
  id: string
  title: string
  message: string
  type: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ'
  timestamp: Date
  vehicleReg?: string
  isRead: boolean
}

export default function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown')

  useEffect(() => {
    checkNotificationPermission()
    loadNotifications()
    setupNotificationListeners()
  }, [])

  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync()
    setPermissionStatus(status)
    
    if (status !== 'granted') {
      Alert.alert(
        'Notification Permission',
        'This app needs notification permission to send you alerts. Please enable notifications.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Notifications.requestPermissionsAsync() }
        ]
      )
    }
  }

  const setupNotificationListeners = () => {
    // Listen for incoming notifications
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification)
      // Add to local state
      const newNotification: NotificationData = {
        id: notification.request.identifier,
        title: notification.request.content.title || '',
        message: notification.request.content.body || '',
        type: 'SYSTEM_ALERT',
        priority: 'MEDIUM',
        status: 'DELIVERED',
        timestamp: new Date(),
        isRead: false,
      }
      setNotifications(prev => [newNotification, ...prev])
    })

    return () => subscription.remove()
  }

  const loadNotifications = async () => {
    setIsLoading(true)
    
    // Simulate API call - in real app, fetch from backend
    setTimeout(() => {
      const mockNotifications: NotificationData[] = [
        {
          id: '1',
          title: 'Inspection Failed',
          message: 'Vehicle ABC123 failed inspection. Critical issues found.',
          type: 'INSPECTION_FAILED',
          priority: 'HIGH',
          status: 'DELIVERED',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          vehicleReg: 'ABC123',
          isRead: false,
        },
        {
          id: '2',
          title: 'Shift Started',
          message: 'Driver John Doe started shift with vehicle XYZ789',
          type: 'SHIFT_STARTED',
          priority: 'MEDIUM',
          status: 'DELIVERED',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          vehicleReg: 'XYZ789',
          isRead: true,
        },
        {
          id: '3',
          title: 'Maintenance Due',
          message: 'Vehicle DEF456 is due for scheduled maintenance',
          type: 'MAINTENANCE_DUE',
          priority: 'MEDIUM',
          status: 'DELIVERED',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          vehicleReg: 'DEF456',
          isRead: true,
        },
        {
          id: '4',
          title: 'Ticket Assigned',
          message: 'New maintenance ticket assigned to you',
          type: 'TICKET_ASSIGNED',
          priority: 'HIGH',
          status: 'DELIVERED',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          isRead: true,
        },
        {
          id: '5',
          title: 'System Alert',
          message: 'System maintenance scheduled for tonight',
          type: 'SYSTEM_ALERT',
          priority: 'LOW',
          status: 'DELIVERED',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          isRead: true,
        },
      ]
      
      setNotifications(mockNotifications)
      setIsLoading(false)
    }, 1000)
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    )
  }

  const deleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
          }
        }
      ]
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#ef4444'
      case 'HIGH': return '#f97316'
      case 'MEDIUM': return '#fbbf24'
      case 'LOW': return '#4ade80'
      default: return '#6b7280'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'alert-circle'
      case 'HIGH': return 'warning'
      case 'MEDIUM': return 'information-circle'
      case 'LOW': return 'checkmark-circle'
      default: return 'notifications'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INSPECTION_FAILED': return 'close-circle'
      case 'SHIFT_STARTED': return 'play-circle'
      case 'SHIFT_ENDED': return 'stop-circle'
      case 'MAINTENANCE_DUE': return 'construct'
      case 'TICKET_ASSIGNED': return 'ticket'
      case 'VEHICLE_LOCATION': return 'location'
      case 'SYSTEM_ALERT': return 'settings'
      default: return 'notifications'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Ionicons name="checkmark-done" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Permission Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <Ionicons
              name={permissionStatus === 'granted' ? 'notifications' : 'notifications-outline'}
              size={20}
              color={permissionStatus === 'granted' ? '#4ade80' : '#ef4444'}
            />
            <Text style={styles.statusText}>
              Notifications: {permissionStatus === 'granted' ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.notificationsContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadNotifications}
              tintColor="white"
            />
          }
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-outline" size={60} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyText}>No notifications</Text>
              <Text style={styles.emptySubtext}>
                You're all caught up! New notifications will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.isRead && styles.unreadNotification
                  ]}
                  onPress={() => markAsRead(notification.id)}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationIcon}>
                        <Ionicons
                          name={getTypeIcon(notification.type) as any}
                          size={20}
                          color="white"
                        />
                      </View>
                      <View style={styles.notificationInfo}>
                        <Text style={styles.notificationTitle}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {formatTimestamp(notification.timestamp)}
                        </Text>
                      </View>
                      <View style={styles.notificationActions}>
                        <View style={[
                          styles.priorityIndicator,
                          { backgroundColor: getPriorityColor(notification.priority) }
                        ]} />
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => deleteNotification(notification.id)}
                        >
                          <Ionicons name="close" size={16} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    
                    {notification.vehicleReg && (
                      <View style={styles.vehicleInfo}>
                        <Ionicons name="car" size={14} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.vehicleText}>
                          {notification.vehicleReg}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Notification Types:</Text>
          <Text style={styles.instructionsText}>
            • Inspection alerts{'\n'}
            • Shift notifications{'\n'}
            • Maintenance reminders{'\n'}
            • System updates
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  statusContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  notificationsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  notificationsList: {
    gap: 15,
  },
  notificationItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
  },
  unreadNotification: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#4ade80',
  },
  notificationContent: {
    gap: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationTime: {
    color: 'white',
    fontSize: 12,
    opacity: 0.7,
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationMessage: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 20,
    marginLeft: 52,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 52,
  },
  vehicleText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.7,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
})
