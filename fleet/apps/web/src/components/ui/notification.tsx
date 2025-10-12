'use client';

import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeNotification, markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications } from '@/store/slices/uiSlice';
import { Button } from './button';

interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export function Notification({ id, type, title, message, timestamp, read }: NotificationProps) {
  const dispatch = useAppDispatch();

  const handleRemove = () => {
    dispatch(removeNotification(id));
  };

  const handleMarkAsRead = () => {
    if (!read) {
      dispatch(markNotificationAsRead(id));
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div
      className={`p-3 sm:p-4 border rounded-lg shadow-sm transition-all duration-300 ${getBackgroundColor()} ${
        read ? 'opacity-75' : ''
      }`}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-xs sm:text-sm font-medium ${getTextColor()}`}>
            {title}
          </h4>
          <p className={`text-xs sm:text-sm ${getTextColor()} mt-1`}>
            {message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-gray-200"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotificationContainer() {
  const dispatch = useAppDispatch();
  const { notifications, unreadNotifications } = useAppSelector((state) => state.ui);

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
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 w-80 sm:w-96 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">
            Notifications {unreadNotifications > 0 && `(${unreadNotifications})`}
          </h3>
          <div className="flex space-x-1 sm:space-x-2">
            {unreadNotifications > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs px-2 py-1"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs px-2 py-1"
            >
              Clear all
            </Button>
          </div>
        </div>
        <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
          {notifications.slice(0, 5).map((notification) => (
            <Notification key={notification.id} {...notification} />
          ))}
          {notifications.length > 5 && (
            <p className="text-xs text-gray-500 text-center">
              And {notifications.length - 5} more notifications...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
