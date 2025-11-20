import * as Location from 'expo-location';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { apiService } from './apiService';
import { analytics } from './mixpanel';

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
}

interface LocationTrackingConfig {
  vehicleId: number;
  intervalMs?: number; // Default: 30 seconds
  minAccuracy?: number; // Maximum accuracy in meters (default: 100)
  enableInBackground?: boolean; // Default: true
}

class LocationTrackingService {
  private trackingInterval: NodeJS.Timeout | null = null;
  private isTracking: boolean = false;
  private currentConfig: LocationTrackingConfig | null = null;
  private appStateSubscription: any = null;
  private lastLocation: LocationData | null = null;
  private consecutiveFailures: number = 0;
  private maxFailures: number = 5;

  /**
   * Start tracking location for a vehicle during an active shift
   */
  async startTracking(config: LocationTrackingConfig): Promise<void> {
    if (this.isTracking) {
      console.warn('[LocationTracking] Already tracking. Stop current tracking first.');
      await this.stopTracking();
    }

    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission is required for tracking.');
    }

    // Request background location permission for iOS
    if (Platform.OS === 'ios') {
      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus.status !== 'granted') {
        console.warn('[LocationTracking] Background location permission not granted. Tracking will work in foreground only.');
      }
    }

    this.currentConfig = {
      intervalMs: 30000, // 30 seconds default
      minAccuracy: 100, // 100 meters default
      enableInBackground: true,
      ...config,
    };

    this.isTracking = true;
    this.consecutiveFailures = 0;

    // Start tracking immediately
    await this.sendLocationUpdate();

    // Set up periodic tracking
    this.trackingInterval = setInterval(
      () => {
        this.sendLocationUpdate();
      },
      this.currentConfig.intervalMs!
    );

    // Listen to app state changes to handle background/foreground
    // Note: AppState.addEventListener returns a subscription object
    const subscription = AppState.addEventListener('change', this.handleAppStateChange.bind(this));
    this.appStateSubscription = subscription;

    analytics.track('Location Tracking Started', {
      vehicle_id: config.vehicleId,
      interval_ms: this.currentConfig.intervalMs,
    });

    console.log(`[LocationTracking] Started tracking for vehicle ${config.vehicleId}`);
  }

  /**
   * Stop tracking location
   */
  async stopTracking(): Promise<void> {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    this.isTracking = false;
    const vehicleId = this.currentConfig?.vehicleId;

    if (vehicleId) {
      analytics.track('Location Tracking Stopped', {
        vehicle_id: vehicleId,
      });
      console.log(`[LocationTracking] Stopped tracking for vehicle ${vehicleId}`);
    }

    this.currentConfig = null;
    this.lastLocation = null;
    this.consecutiveFailures = 0;
  }

  /**
   * Get current location and send it to the backend
   */
  private async sendLocationUpdate(): Promise<void> {
    if (!this.isTracking || !this.currentConfig) {
      return;
    }

    try {
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: false,
      });

      // Check accuracy
      if (this.currentConfig.minAccuracy && location.coords.accuracy && location.coords.accuracy > this.currentConfig.minAccuracy) {
        console.warn(`[LocationTracking] Location accuracy (${location.coords.accuracy}m) exceeds minimum (${this.currentConfig.minAccuracy}m). Skipping update.`);
        return;
      }

      // Get address if possible (optional, don't block on this)
      let address: string | undefined;
      try {
        const [addressResult] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (addressResult) {
          address = `${addressResult.street || ''} ${addressResult.city || ''} ${addressResult.region || ''} ${addressResult.postalCode || ''}`.trim();
        }
      } catch (err) {
        // Address lookup failed, continue without it
        console.warn('[LocationTracking] Failed to get address:', err);
      }

      const locationData: LocationData = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        address,
        accuracy: location.coords.accuracy || undefined,
        speed: location.coords.speed ? location.coords.speed * 3.6 : undefined, // Convert m/s to km/h
        heading: location.coords.heading || undefined,
        altitude: location.coords.altitude || undefined,
      };

      // Only send if location has changed significantly (at least 10 meters) or first update
      if (!this.lastLocation || this.hasLocationChanged(this.lastLocation, locationData, 10)) {
        await apiService.createVehicleLocation({
          vehicle: this.currentConfig.vehicleId,
          lat: locationData.lat,
          lng: locationData.lng,
          address: locationData.address,
          accuracy: locationData.accuracy,
          speed: locationData.speed,
          heading: locationData.heading,
          altitude: locationData.altitude,
        });

        this.lastLocation = locationData;
        this.consecutiveFailures = 0;

        console.log(`[LocationTracking] Location update sent for vehicle ${this.currentConfig.vehicleId}:`, {
          lat: locationData.lat,
          lng: locationData.lng,
          accuracy: locationData.accuracy,
        });

        analytics.track('Location Update Sent', {
          vehicle_id: this.currentConfig.vehicleId,
          accuracy: locationData.accuracy,
          has_address: !!locationData.address,
        });
      } else {
        console.log('[LocationTracking] Location unchanged, skipping update.');
      }
    } catch (error: any) {
      this.consecutiveFailures++;
      console.error('[LocationTracking] Failed to send location update:', error);

      // Stop tracking if too many consecutive failures
      if (this.consecutiveFailures >= this.maxFailures) {
        console.error(`[LocationTracking] Too many consecutive failures (${this.consecutiveFailures}). Stopping tracking.`);
        await this.stopTracking();
        
        analytics.track('Location Tracking Failed', {
          vehicle_id: this.currentConfig.vehicleId,
          consecutive_failures: this.consecutiveFailures,
          error: error.message,
        });
      }
    }
  }

  /**
   * Check if location has changed significantly
   */
  private hasLocationChanged(
    oldLocation: LocationData,
    newLocation: LocationData,
    minDistanceMeters: number
  ): boolean {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (oldLocation.lat * Math.PI) / 180;
    const φ2 = (newLocation.lat * Math.PI) / 180;
    const Δφ = ((newLocation.lat - oldLocation.lat) * Math.PI) / 180;
    const Δλ = ((newLocation.lng - oldLocation.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance >= minDistanceMeters;
  }

  /**
   * Handle app state changes (foreground/background)
   */
  private handleAppStateChange(nextAppState: AppStateStatus): void {
    if (!this.currentConfig?.enableInBackground) {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('[LocationTracking] App moved to background. Pausing tracking.');
        // Could pause tracking here if needed
      } else if (nextAppState === 'active') {
        console.log('[LocationTracking] App moved to foreground. Resuming tracking.');
        // Resume tracking
        if (this.isTracking && this.trackingInterval) {
          this.sendLocationUpdate();
        }
      }
    }
  }

  /**
   * Get current tracking status
   */
  getTrackingStatus(): { isTracking: boolean; vehicleId?: number } {
    return {
      isTracking: this.isTracking,
      vehicleId: this.currentConfig?.vehicleId,
    };
  }
}

export const locationTrackingService = new LocationTrackingService();

