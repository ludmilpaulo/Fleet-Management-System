import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  removeNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from '../../store/slices/uiSlice';
import { Notification } from '../../types';

const { width } = Dimensions.get('window');

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
  onMarkAsRead,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return '#f0fdf4';
      case 'error':
        return '#fef2f2';
      case 'warning':
        return '#fffbeb';
      case 'info':
        return '#eff6ff';
      default:
        return '#f9fafb';
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#e5e7eb';
    }
  };

  const handlePress = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleRemove = () => {
    onRemove(notification.id);
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          opacity: notification.read ? 0.7 : 1,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationTitleContainer}>
            <Ionicons
              name={getIcon()}
              size={20}
              color={getIconColor()}
              style={styles.notificationIcon}
            />
            <Text style={styles.notificationTitle}>{notification.title}</Text>
          </View>
          <TouchableOpacity
            onPress={handleRemove}
            style={styles.removeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        
        <Text style={styles.notificationTime}>
          {new Date(notification.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const NotificationContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadNotifications } = useAppSelector((state) => state.ui);

  const handleRemoveNotification = (id: string) => {
    dispatch(removeNotification(id));
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Notifications {unreadNotifications > 0 && `(${unreadNotifications})`}
        </Text>
        <View style={styles.headerActions}>
          {unreadNotifications > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>Mark all read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleClearAll}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.notificationsList}>
        {notifications.slice(0, 5).map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={handleRemoveNotification}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
        
        {notifications.length > 5 && (
          <Text style={styles.moreText}>
            And {notifications.length - 5} more notifications...
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 16,
    left: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  notificationsList: {
    maxHeight: 300,
  },
  notificationItem: {
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  moreText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
  },
});
