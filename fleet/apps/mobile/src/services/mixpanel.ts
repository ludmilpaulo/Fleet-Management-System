import { Mixpanel } from 'mixpanel-react-native';

const MIXPANEL_TOKEN = 'c1cb0b3411115435a0d45662ad7a97e4';

// Initialize Mixpanel
const mixpanelInstance = new Mixpanel(MIXPANEL_TOKEN, true); // true for trackAutomaticEvents

// Initialize the SDK
mixpanelInstance.init();

export const analytics = {
  // Initialize
  initialize: async () => {
    await mixpanelInstance.init();
    // Disable Mixpanel console logs
    mixpanelInstance.setLoggingEnabled(false);
  },

  // User identification
  identify: (userId: string, properties?: Record<string, any>) => {
    mixpanelInstance.identify(userId);
    if (properties) {
      mixpanelInstance.getPeople().set(properties);
    }
  },

  // Track events
  track: (eventName: string, properties?: Record<string, any>) => {
    mixpanelInstance.track(eventName, properties || {});
  },

  // Authentication events
  trackSignup: (userId: string, role: string, company: string) => {
    mixpanelInstance.alias(userId, mixpanelInstance.getDistinctId());
    mixpanelInstance.getPeople().set({
      $name: userId,
      role: role,
      company: company,
      signup_date: new Date().toISOString(),
      platform: 'mobile',
    });
    mixpanelInstance.track('User Signup', {
      role,
      company,
      method: 'email',
      platform: 'mobile',
    });
  },

  trackLogin: (userId: string, role: string, company: string) => {
    mixpanelInstance.identify(userId);
    mixpanelInstance.track('User Login', {
      role,
      company,
      login_time: new Date().toISOString(),
      platform: 'mobile',
    });
  },

  trackLogout: (userId: string) => {
    mixpanelInstance.track('User Logout', {
      user_id: userId,
      logout_time: new Date().toISOString(),
      platform: 'mobile',
    });
  },

  // Screen view events
  trackScreenView: (screenName: string, properties?: Record<string, any>) => {
    mixpanelInstance.track('Screen View', {
      screen_name: screenName,
      ...properties,
    });
  },

  // Shift events
  trackShiftStart: (shiftId: string, vehicleId: string, driverId: string) => {
    mixpanelInstance.track('Shift Started', {
      shift_id: shiftId,
      vehicle_id: vehicleId,
      driver_id: driverId,
      start_time: new Date().toISOString(),
      platform: 'mobile',
    });
  },

  trackShiftEnd: (shiftId: string, duration: number, distance: number) => {
    mixpanelInstance.track('Shift Ended', {
      shift_id: shiftId,
      duration_minutes: duration,
      distance_km: distance,
      end_time: new Date().toISOString(),
      platform: 'mobile',
    });
  },

  // Inspection events
  trackInspectionStart: (inspectionId: string, vehicleId: string) => {
    mixpanelInstance.track('Inspection Started', {
      inspection_id: inspectionId,
      vehicle_id: vehicleId,
      platform: 'mobile',
    });
  },

  trackInspectionComplete: (inspectionId: string, status: string, itemsChecked: number, photosCount: number) => {
    mixpanelInstance.track('Inspection Completed', {
      inspection_id: inspectionId,
      status,
      items_checked: itemsChecked,
      photos_count: photosCount,
      platform: 'mobile',
    });
  },

  trackPhotoCapture: (context: string, photoCount: number) => {
    mixpanelInstance.track('Photo Captured', {
      context,
      photo_count: photoCount,
      platform: 'mobile',
    });
  },

  // Location events
  trackLocationUpdate: (latitude: number, longitude: number, context: string) => {
    mixpanelInstance.track('Location Updated', {
      latitude,
      longitude,
      context,
      platform: 'mobile',
    });
  },

  // Offline events
  trackOfflineAction: (action: string, queueSize: number) => {
    mixpanelInstance.track('Offline Action Queued', {
      action,
      queue_size: queueSize,
      platform: 'mobile',
    });
  },

  trackSyncComplete: (itemsSynced: number, syncDuration: number) => {
    mixpanelInstance.track('Offline Sync Completed', {
      items_synced: itemsSynced,
      sync_duration_ms: syncDuration,
      platform: 'mobile',
    });
  },

  // Issue events
  trackIssueCreate: (issueId: string, priority: string, vehicleId: string) => {
    mixpanelInstance.track('Issue Reported', {
      issue_id: issueId,
      priority,
      vehicle_id: vehicleId,
      platform: 'mobile',
    });
  },

  // Camera events
  trackCameraOpen: (context: string) => {
    mixpanelInstance.track('Camera Opened', {
      context,
      platform: 'mobile',
    });
  },

  trackCameraPermissionGranted: () => {
    mixpanelInstance.track('Camera Permission Granted', {
      platform: 'mobile',
    });
  },

  trackCameraPermissionDenied: () => {
    mixpanelInstance.track('Camera Permission Denied', {
      platform: 'mobile',
    });
  },

  // Location permission events
  trackLocationPermissionGranted: () => {
    mixpanelInstance.track('Location Permission Granted', {
      platform: 'mobile',
    });
  },

  trackLocationPermissionDenied: () => {
    mixpanelInstance.track('Location Permission Denied', {
      platform: 'mobile',
    });
  },

  // Notification events
  trackNotificationReceived: (notificationType: string) => {
    mixpanelInstance.track('Notification Received', {
      notification_type: notificationType,
      platform: 'mobile',
    });
  },

  trackNotificationOpened: (notificationType: string) => {
    mixpanelInstance.track('Notification Opened', {
      notification_type: notificationType,
      platform: 'mobile',
    });
  },

  // Error events
  trackError: (errorType: string, errorMessage: string, context: string) => {
    mixpanelInstance.track('Error Occurred', {
      error_type: errorType,
      error_message: errorMessage,
      context,
      platform: 'mobile',
    });
  },

  // User properties
  setUserProperties: (properties: Record<string, any>) => {
    mixpanelInstance.getPeople().set(properties);
  },

  incrementProperty: (property: string, value: number = 1) => {
    mixpanelInstance.getPeople().increment(property, value);
  },

  // Timing events
  timeEvent: (eventName: string) => {
    mixpanelInstance.timeEvent(eventName);
  },

  // Reset (on logout)
  reset: () => {
    mixpanelInstance.reset();
  },

  // Flush events
  flush: () => {
    mixpanelInstance.flush();
  },
};

export default analytics;
