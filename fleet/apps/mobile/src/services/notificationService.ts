import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, Shift } from './apiService';
import { authService } from './authService';

// Check if device is available (for physical device check)
const isDevice = Platform.OS === 'ios' || Platform.OS === 'android';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface ScheduledNotification {
  identifier: string;
  shiftId: number;
  type: 'assignment' | 'reminder';
}

class NotificationService {
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;
  private shiftPollInterval: NodeJS.Timeout | null = null;
  private lastShiftCheckTime: Date | null = null;
  private scheduledNotifications: ScheduledNotification[] = [];

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      if (!isDevice) {
        console.warn('Must use physical device for Push Notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return false;
      }

      // Get push token
      const token = await this.getPushToken();
      if (token) {
        // Store token for backend registration
        await AsyncStorage.setItem('push_notification_token', token);
        await this.registerToken(token);
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Get push notification token
  async getPushToken(): Promise<string | null> {
    try {
      if (!isDevice) {
        return null;
      }

      // Try to get push token - will fail in Expo Go SDK 53+ (expected behavior)
      // Local notifications will still work without push token
      try {
        // In Expo managed workflow, projectId can be auto-detected
        // In bare workflow or if auto-detection fails, you need to provide it
        const tokenData = await Notifications.getExpoPushTokenAsync({
          // projectId is optional - will try to infer from app.json/manifest
          // If not found, this will throw an error (expected in Expo Go SDK 53+)
        });
        return tokenData.data;
      } catch (error: any) {
        // This is expected in Expo Go SDK 53+ - push tokens are not supported
        // Local notifications will work fine without push token
        if (error?.message?.includes('projectId') || error?.message?.includes('No "projectId"')) {
          console.warn('Push token not available (Expo Go limitation), using local notifications only');
        } else {
          console.warn('Push token not available, using local notifications only:', error.message || error);
        }
        return null;
      }
    } catch (error: any) {
      console.error('Error getting push token:', error.message || error);
      // Return null if push token can't be obtained (won't break functionality)
      return null;
    }
  }

  // Register push token with backend
  private async registerToken(token: string): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      // Call backend API to register token
      // TODO: Implement backend endpoint for token registration
      // await apiService.registerPushToken(token);
      console.log('Push token registered:', token);
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    try {
      // Request permissions
      await this.requestPermissions();

      // Setup notification listeners
      this.setupNotificationListeners();

      // Start shift polling
      await this.startShiftPolling();

      // Schedule daily reminders
      await this.scheduleDailyReminders();

      console.log('Notification service initialized');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  // Setup notification listeners
  private setupNotificationListeners(): void {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user tapping on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Navigate to relevant screen based on notification data
      const data = response.notification.request.content.data;
      if (data?.shiftId) {
        // Navigate to shift details
        // navigationRef.current?.navigate('ShiftDetails', { shiftId: data.shiftId });
      }
    });
  }

  // Start polling for new shifts
  private async startShiftPolling(): Promise<void> {
    try {
      // Get last check time from storage
      const lastCheck = await AsyncStorage.getItem('last_shift_check_time');
      if (lastCheck) {
        this.lastShiftCheckTime = new Date(lastCheck);
      }

      // Check for shifts immediately
      await this.checkForNewShifts();

      // Poll every 5 minutes
      this.shiftPollInterval = setInterval(async () => {
        await this.checkForNewShifts();
      }, 5 * 60 * 1000); // 5 minutes
    } catch (error) {
      console.error('Error starting shift polling:', error);
    }
  }

  // Check for new shifts assigned to user
  private async checkForNewShifts(): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      // Fetch shifts
      const shifts = await apiService.getShifts();
      
      // Filter shifts for current user (drivers)
      const userShifts = shifts.filter((shift) => {
        const driverId = typeof shift.driver === 'object' ? shift.driver.id : shift.driver;
        const userId = typeof user.id === 'number' ? user.id.toString() : user.id;
        return driverId.toString() === userId.toString();
      });

      // Check for new shifts since last check
      if (this.lastShiftCheckTime) {
        const newShifts = userShifts.filter(shift => {
          const shiftDate = new Date(shift.start_at);
          return shiftDate > this.lastShiftCheckTime!;
        });

        // Send notifications for new shifts
        for (const shift of newShifts) {
          await this.sendShiftAssignmentNotification(shift);
        }
      }

      // Update last check time
      this.lastShiftCheckTime = new Date();
      await AsyncStorage.setItem('last_shift_check_time', this.lastShiftCheckTime.toISOString());

      // Update scheduled reminders
      await this.updateScheduledReminders(userShifts);
    } catch (error) {
      console.error('Error checking for new shifts:', error);
    }
  }

  // Send notification when shift is assigned
  private async sendShiftAssignmentNotification(shift: Shift): Promise<void> {
    try {
      const vehicleInfo = typeof shift.vehicle === 'object' 
        ? `${shift.vehicle.make} ${shift.vehicle.model} (${shift.vehicle.reg_number})`
        : shift.vehicle_make_model || 'Unknown Vehicle';

      const shiftDate = new Date(shift.start_at);
      const dateStr = shiftDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const timeStr = shiftDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New Shift Assigned 🚗',
          body: `You have been assigned a new shift with ${vehicleInfo} on ${dateStr} at ${timeStr}`,
          data: { 
            shiftId: shift.id,
            type: 'shift_assignment',
            vehicle: typeof shift.vehicle === 'object' ? shift.vehicle.reg_number : shift.vehicle_reg,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });

      console.log('Shift assignment notification sent:', shift.id);
    } catch (error) {
      console.error('Error sending shift assignment notification:', error);
    }
  }

  // Schedule daily reminders for shifts
  async scheduleDailyReminders(): Promise<void> {
    try {
      // Cancel existing reminders
      await this.cancelAllReminders();

      // Get user's shifts for today
      const shifts = await this.getTodaysShifts();
      
      if (shifts.length === 0) return;

      // Schedule reminder 1 hour before each upcoming shift
      const upcomingShifts = shifts.filter(shift => {
        const shiftTime = new Date(shift.start_at);
        const now = new Date();
        return shiftTime > now;
      });

      if (upcomingShifts.length > 0) {
        // Sort by start time
        upcomingShifts.sort((a, b) => {
          const timeA = new Date(a.start_at).getTime();
          const timeB = new Date(b.start_at).getTime();
          return timeA - timeB;
        });

        // Schedule reminders for all upcoming shifts
        for (const shift of upcomingShifts) {
          const shiftTime = new Date(shift.start_at);
          const reminderTime = new Date(shiftTime.getTime() - 60 * 60 * 1000); // 1 hour before

          // Only schedule if reminder time is in the future
          if (reminderTime > new Date()) {
            const vehicleInfo = typeof shift.vehicle === 'object' 
              ? `${shift.vehicle.make} ${shift.vehicle.model} (${shift.vehicle.reg_number})`
              : shift.vehicle_make_model || 'Unknown Vehicle';

            const timeStr = shiftTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });

            const notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Shift Reminder ⏰',
                body: `Your shift starts at ${timeStr} with ${vehicleInfo}`,
                data: { 
                  shiftId: shift.id,
                  type: 'shift_reminder',
                  vehicle: typeof shift.vehicle === 'object' ? shift.vehicle.reg_number : shift.vehicle_reg,
                },
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
              },
              trigger: {
                date: reminderTime,
              },
            });

            this.scheduledNotifications.push({
              identifier: notificationId,
              shiftId: shift.id,
              type: 'reminder',
            });

            console.log('Shift reminder scheduled:', reminderTime);
          }
        }
      }
      
      // Also schedule a morning reminder if there are shifts today
      const todayShifts = shifts.filter(shift => {
        const shiftDate = new Date(shift.start_at);
        const today = new Date();
        return shiftDate.toDateString() === today.toDateString();
      });

      if (todayShifts.length > 0) {
        // Schedule morning reminder at 6 AM if shifts are later
        const now = new Date();
        const morningReminder = new Date();
        morningReminder.setHours(6, 0, 0, 0);
        
        // Only schedule if it's before 6 AM and there are shifts today
        if (now < morningReminder) {
          const shiftCount = todayShifts.length;
          const firstShiftTime = new Date(todayShifts[0].start_at);
          const timeStr = firstShiftTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Shift Reminder Today 📅',
              body: `You have ${shiftCount} shift${shiftCount > 1 ? 's' : ''} today. First shift starts at ${timeStr}`,
              data: { 
                type: 'shift_daily_reminder',
                shiftCount: shiftCount,
              },
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
              date: morningReminder,
            },
          });

          this.scheduledNotifications.push({
            identifier: notificationId,
            shiftId: 0, // Daily reminder doesn't have a specific shift
            type: 'reminder',
          });

          console.log('Daily shift reminder scheduled:', morningReminder);
        }
      }
    } catch (error) {
      console.error('Error scheduling daily reminders:', error);
    }
  }

  // Update scheduled reminders
  private async updateScheduledReminders(shifts: Shift[]): Promise<void> {
    // Cancel existing reminders
    await this.cancelAllReminders();

    // Reschedule based on current shifts
    await this.scheduleDailyReminders();
  }

  // Get today's shifts for current user
  private async getTodaysShifts(): Promise<Shift[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return [];

      const shifts = await apiService.getShifts();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return shifts.filter((shift) => {
        const driverId = typeof shift.driver === 'object' ? shift.driver.id : shift.driver;
        const userId = typeof user.id === 'number' ? user.id.toString() : user.id;
        const shiftDate = new Date(shift.start_at);
        
        return driverId.toString() === userId.toString() && 
               shiftDate >= today && 
               shiftDate < tomorrow;
      });
    } catch (error) {
      console.error('Error getting today\'s shifts:', error);
      return [];
    }
  }

  // Cancel all scheduled reminders
  private async cancelAllReminders(): Promise<void> {
    try {
      for (const notification of this.scheduledNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
      this.scheduledNotifications = [];
    } catch (error) {
      console.error('Error canceling reminders:', error);
    }
  }

  // Send local notification
  async sendLocalNotification(title: string, body: string, data?: any): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: null, // Send immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending local notification:', error);
      throw error;
    }
  }

  // Cleanup
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
    if (this.shiftPollInterval) {
      clearInterval(this.shiftPollInterval);
      this.shiftPollInterval = null;
    }
  }
}

export const notificationService = new NotificationService();

