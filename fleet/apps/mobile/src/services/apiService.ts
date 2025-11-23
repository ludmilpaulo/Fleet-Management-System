import { authService, AuthUser } from './authService'
import { analytics } from './mixpanel'
import { apiCache } from './apiCache'

import { Platform } from 'react-native';

// Base API configuration
// For physical devices, automatically uses network IP instead of localhost
// Check EXPO_PUBLIC_API_URL environment variable first
const BASE_URL = (() => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (__DEV__) {
    // Use network IP for physical devices (Android/iOS on real devices)
    // Default to 192.168.1.110 - change this to your computer's network IP
    // You can also set EXPO_PUBLIC_API_URL=http://YOUR_IP:8000/api in .env
    const networkIP = process.env.EXPO_PUBLIC_NETWORK_IP || '192.168.1.110';
    const isPhysicalDevice = Platform.OS === 'ios' || Platform.OS === 'android';
    const apiURL = isPhysicalDevice 
      ? `http://${networkIP}:8000/api`
      : 'http://localhost:8000/api';
    console.log(`[ApiService] Using API URL: ${apiURL} (Device: ${Platform.OS}, Physical: ${isPhysicalDevice}, Network IP: ${networkIP})`);
    return apiURL;
  }
  // Production API URL
  return 'https://taki.pythonanywhere.com/api';
})()

// Types for API responses
export interface Vehicle {
  id: number
  vin: string
  reg_number: string
  make: string
  model: string
  year?: number
  color: string
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED'
  mileage: number
  fuel_type: 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID'
  engine_size: string
  transmission: 'MANUAL' | 'AUTOMATIC'
  created_at: string
  updated_at: string
  created_by: number
}

export interface Inspection {
  id: number
  shift: number
  type: 'START' | 'END'
  started_at: string
  completed_at?: string
  status: 'IN_PROGRESS' | 'PASS' | 'FAIL' | 'CANCELLED'
  notes: string
  weather_conditions: string
  temperature?: number
  lat?: number
  lng?: number
  address: string
  created_by: number
  items: InspectionItem[]
  photos: Photo[]
}

export interface InspectionItem {
  id: number
  inspection: number
  part: 'FRONT' | 'REAR' | 'LEFT' | 'RIGHT' | 'ROOF' | 'INTERIOR' | 'DASHBOARD' | 'ODOMETER' | 'WINDSHIELD' | 'TYRES' | 'LIGHTS' | 'ENGINE' | 'BRAKES' | 'FUEL' | 'OTHER'
  status: 'PASS' | 'FAIL' | 'N/A' | 'SKIP'
  notes: string
  created_at: string
  updated_at: string
}

export interface Photo {
  id: number
  inspection: number
  image: string
  caption: string
  part: string
  created_at: string
}

export interface Issue {
  id: number
  vehicle: number
  inspection_item?: number
  title: string
  description: string
  category: 'SAFETY' | 'MECHANICAL' | 'COSMETIC' | 'ELECTRICAL' | 'TYRE' | 'ENGINE' | 'BRAKE' | 'LIGHT' | 'OTHER'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'
  location_description: string
  lat?: number
  lng?: number
  reported_at: string
  resolved_at?: string
  due_date?: string
  reported_by: number
  assigned_to?: number
}

export interface Ticket {
  id: number
  issue: number
  assignee?: number
  title: string
  description: string
  type: 'REPAIR' | 'MAINTENANCE' | 'INSPECTION' | 'CLEANING' | 'UPGRADE' | 'OTHER'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL'
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_PARTS' | 'PENDING_APPROVAL' | 'COMPLETED' | 'CLOSED' | 'CANCELLED'
  created_at: string
  updated_at: string
  due_at?: string
  started_at?: string
  completed_at?: string
  created_by: number
}

export interface Shift {
  id: number
  vehicle: Vehicle | number
  vehicle_reg?: string
  vehicle_make_model?: string
  driver: AuthUser | number
  driver_name?: string
  driver_username?: string
  start_at: string
  start_time?: string // Legacy support
  end_at?: string
  end_time?: string // Legacy support
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  start_address?: string
  start_location?: string // Legacy support
  end_address?: string
  end_location?: string // Legacy support
  start_lat?: number
  start_lng?: number
  end_lat?: number
  end_lng?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: number
  user: number
  vehicle?: number
  type: 'INSPECTION_FAILED' | 'TICKET_ASSIGNED' | 'TICKET_OVERDUE' | 'SHIFT_STARTED' | 'SHIFT_ENDED' | 'MAINTENANCE_DUE' | 'VEHICLE_LOCATION' | 'SYSTEM_ALERT' | 'OTHER'
  title: string
  message: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ'
  payload: any
  sent_at?: string
  delivered_at?: string
  read_at?: string
  created_at: string
}

export interface DashboardStats {
  total_vehicles: number
  active_vehicles: number
  vehicles_in_maintenance: number
  total_issues: number
  open_issues: number
  critical_issues: number
  total_inspections: number
  failed_inspections: number
  active_shifts: number
  completed_shifts_today: number
  maintenance_due: number
  upcoming_inspections: number
}

class ApiService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` }),
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || error.error || errorMessage;
        // Handle non_field_errors from Django
        if (error.non_field_errors && Array.isArray(error.non_field_errors)) {
          errorMessage = error.non_field_errors.join(', ');
        }
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }
    return response.json()
  }

  // Vehicle Management
  async getVehicles(useCache: boolean = true): Promise<Vehicle[]> {
    try {
      // Check cache first
      if (useCache) {
        const cached = await apiCache.get<Vehicle[]>('/fleet/vehicles/');
        if (cached) {
          return cached;
        }
      }

      const response = await fetch(`${BASE_URL}/fleet/vehicles/`, {
        headers: this.getHeaders(),
      })
      const data = await this.handleResponse<any>(response)
      
      // Handle both paginated and non-paginated responses
      const vehicles = Array.isArray(data) ? data : (data.results || [])
      
      // Cache the response (5 minutes TTL)
      if (useCache) {
        await apiCache.set('/fleet/vehicles/', vehicles, 5 * 60 * 1000);
      }
      
      analytics.track('Vehicles Fetched', {
        count: vehicles.length
      })
      
      return vehicles
    } catch (error) {
      console.error('[ApiService] Error fetching vehicles:', error);
      analytics.track('Vehicles Fetch Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async getVehicle(id: number): Promise<Vehicle> {
    try {
      const response = await fetch(`${BASE_URL}/fleet/vehicles/${id}/`, {
        headers: this.getHeaders(),
      })
      
      analytics.track('Vehicle Details Fetched', { vehicle_id: id })
      return this.handleResponse<Vehicle>(response)
    } catch (error) {
      analytics.track('Vehicle Details Fetch Failed', {
        vehicle_id: id,
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async updateVehicle(id: number, data: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const response = await fetch(`${BASE_URL}/fleet/vehicles/${id}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      
      analytics.track('Vehicle Updated', { vehicle_id: id })
      return this.handleResponse<Vehicle>(response)
    } catch (error) {
      analytics.track('Vehicle Update Failed', {
        vehicle_id: id,
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  // Inspection Management
  async getInspections(useCache: boolean = true): Promise<Inspection[]> {
    try {
      // Check cache first
      if (useCache) {
        const cached = await apiCache.get<Inspection[]>('/inspections/inspections/');
        if (cached) {
          return cached;
        }
      }

      const response = await fetch(`${BASE_URL}/inspections/inspections/`, {
        headers: this.getHeaders(),
      })
      const data = await this.handleResponse<any>(response)
      
      // Handle both paginated and non-paginated responses
      const inspections = Array.isArray(data) ? data : (data.results || [])
      
      // Cache the response (3 minutes TTL)
      if (useCache) {
        await apiCache.set('/inspections/inspections/', inspections, 3 * 60 * 1000);
      }
      
      analytics.track('Inspections Fetched', {
        count: inspections.length
      })
      
      return inspections
    } catch (error) {
      console.error('[ApiService] Error fetching inspections:', error);
      analytics.track('Inspections Fetch Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async createInspection(data: Partial<Inspection>): Promise<Inspection> {
    try {
      const response = await fetch(`${BASE_URL}/inspections/inspections/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      
      const inspection = await this.handleResponse<Inspection>(response);
      
      // Invalidate inspections cache when a new inspection is created
      await apiCache.invalidate('/inspections/inspections/');
      
      analytics.track('Inspection Created')
      return inspection;
    } catch (error) {
      analytics.track('Inspection Creation Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async updateInspection(id: number, data: Partial<Inspection>): Promise<Inspection> {
    try {
      const response = await fetch(`${BASE_URL}/inspections/inspections/${id}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      
      analytics.track('Inspection Updated', { inspection_id: id })
      return this.handleResponse<Inspection>(response)
    } catch (error) {
      analytics.track('Inspection Update Failed', {
        inspection_id: id,
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async completeInspection(id: number, items: Partial<InspectionItem>[], photos?: any[]): Promise<Inspection> {
    try {
      const response = await fetch(`${BASE_URL}/inspections/inspections/${id}/complete/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ items, photos }),
      })
      
      analytics.track('Inspection Completed', { 
        inspection_id: id,
        items_count: items.length,
        photos_count: photos?.length || 0
      })
      return this.handleResponse<Inspection>(response)
    } catch (error) {
      analytics.track('Inspection Completion Failed', {
        inspection_id: id,
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  // Issue Management
  async getIssues(): Promise<Issue[]> {
    try {
      const response = await fetch(`${BASE_URL}/issues/issues/`, {
        headers: this.getHeaders(),
      })
      const data = await this.handleResponse<{ results: Issue[] }>(response)
      
      analytics.track('Issues Fetched', {
        count: data.results.length
      })
      
      return data.results
    } catch (error) {
      analytics.track('Issues Fetch Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async createIssue(data: Partial<Issue>): Promise<Issue> {
    try {
      const response = await fetch(`${BASE_URL}/issues/issues/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      
      analytics.track('Issue Created', {
        category: data.category,
        severity: data.severity
      })
      return this.handleResponse<Issue>(response)
    } catch (error) {
      analytics.track('Issue Creation Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async updateIssue(id: number, data: Partial<Issue>): Promise<Issue> {
    try {
      const response = await fetch(`${BASE_URL}/issues/issues/${id}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      
      analytics.track('Issue Updated', { issue_id: id })
      return this.handleResponse<Issue>(response)
    } catch (error) {
      analytics.track('Issue Update Failed', {
        issue_id: id,
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  // Ticket Management
  async getTickets(): Promise<Ticket[]> {
    try {
      const response = await fetch(`${BASE_URL}/tickets/tickets/`, {
        headers: this.getHeaders(),
      })
      const data = await this.handleResponse<{ results: Ticket[] }>(response)
      
      analytics.track('Tickets Fetched', {
        count: data.results.length
      })
      
      return data.results
    } catch (error) {
      analytics.track('Tickets Fetch Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async createTicket(data: Partial<Ticket>): Promise<Ticket> {
    try {
      const response = await fetch(`${BASE_URL}/tickets/tickets/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      
      analytics.track('Ticket Created', {
        type: data.type,
        priority: data.priority
      })
      return this.handleResponse<Ticket>(response)
    } catch (error) {
      analytics.track('Ticket Creation Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket> {
    try {
      const response = await fetch(`${BASE_URL}/tickets/tickets/${id}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })
      
      analytics.track('Ticket Updated', { ticket_id: id })
      return this.handleResponse<Ticket>(response)
    } catch (error) {
      analytics.track('Ticket Update Failed', {
        ticket_id: id,
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  // Shift Management
  async getShifts(useCache: boolean = true): Promise<Shift[]> {
    try {
      // Check cache first (shorter TTL for shifts as they change frequently)
      if (useCache) {
        const cached = await apiCache.get<Shift[]>('/fleet/shifts/');
        if (cached) {
          return cached;
        }
      }

      const response = await fetch(`${BASE_URL}/fleet/shifts/`, {
        headers: this.getHeaders(),
      })
      const data = await this.handleResponse<any>(response)
      
      // Handle both paginated and non-paginated responses
      const shifts = Array.isArray(data) ? data : (data.results || [])
      
      // Cache the response (2 minutes TTL for shifts)
      if (useCache) {
        await apiCache.set('/fleet/shifts/', shifts, 2 * 60 * 1000);
      }
      
      analytics.track('Shifts Fetched', {
        count: shifts.length
      })
      
      return shifts
    } catch (error) {
      console.error('[ApiService] Error fetching shifts:', error);
      analytics.track('Shifts Fetch Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async startShift(vehicleId: number, startAddress?: string, lat?: number, lng?: number): Promise<Shift> {
    try {
      const payload: any = {
        vehicle: vehicleId,
      };
      
      // Add optional fields if provided
      if (startAddress) {
        payload.start_address = startAddress;
      }
      if (lat !== undefined) {
        payload.start_lat = lat;
      }
      if (lng !== undefined) {
        payload.start_lng = lng;
      }
      // Add start_at timestamp
      payload.start_at = new Date().toISOString();
      
      const response = await fetch(`${BASE_URL}/fleet/shifts/start/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })
      
      const shift = await this.handleResponse<Shift>(response);
      
      // Invalidate shifts cache when a shift is started
      await apiCache.invalidate('/fleet/shifts/');
      
      analytics.track('Shift Started', {
        vehicle_id: vehicleId,
        has_location: !!(lat && lng),
        has_address: !!startAddress,
      })
      return shift;
    } catch (error) {
      console.error('[ApiService] Error starting shift:', error);
      analytics.track('Shift Start Failed', {
        vehicle_id: vehicleId,
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async endShift(
    shiftId: number,
    endLocation?: string,
    lat?: number,
    lng?: number,
    photos?: {
      fuelLevelPhoto?: { uri: string; type: string; name: string }
      photoFront?: { uri: string; type: string; name: string }
      photoBack?: { uri: string; type: string; name: string }
      photoLeft?: { uri: string; type: string; name: string }
      photoRight?: { uri: string; type: string; name: string }
    },
    checklistData?: {
      parkingAddress?: string
      fuelLevelManual?: number
      scratchesNoted?: boolean
      damageDescription?: string
    }
  ): Promise<Shift> {
    try {
      const formData = new FormData()
      
      // Add location data
      if (endLocation) formData.append('end_address', endLocation)
      if (lat !== undefined) formData.append('end_lat', lat.toString())
      if (lng !== undefined) formData.append('end_lng', lng.toString())
      
      // Add checklist location
      if (lat !== undefined) formData.append('parking_lat', lat.toString())
      if (lng !== undefined) formData.append('parking_lng', lng.toString())
      if (checklistData?.parkingAddress) {
        formData.append('parking_address', checklistData.parkingAddress)
      }
      
      // Add photos
      if (photos?.fuelLevelPhoto) {
        formData.append('fuel_level_photo', {
          uri: photos.fuelLevelPhoto.uri,
          type: photos.fuelLevelPhoto.type || 'image/jpeg',
          name: photos.fuelLevelPhoto.name || 'fuel_level.jpg',
        } as any)
      }
      if (photos?.photoFront) {
        formData.append('photo_front', {
          uri: photos.photoFront.uri,
          type: photos.photoFront.type || 'image/jpeg',
          name: photos.photoFront.name || 'front.jpg',
        } as any)
      }
      if (photos?.photoBack) {
        formData.append('photo_back', {
          uri: photos.photoBack.uri,
          type: photos.photoBack.type || 'image/jpeg',
          name: photos.photoBack.name || 'back.jpg',
        } as any)
      }
      if (photos?.photoLeft) {
        formData.append('photo_left', {
          uri: photos.photoLeft.uri,
          type: photos.photoLeft.type || 'image/jpeg',
          name: photos.photoLeft.name || 'left.jpg',
        } as any)
      }
      if (photos?.photoRight) {
        formData.append('photo_right', {
          uri: photos.photoRight.uri,
          type: photos.photoRight.type || 'image/jpeg',
          name: photos.photoRight.name || 'right.jpg',
        } as any)
      }
      
      // Add checklist data
      if (checklistData?.fuelLevelManual !== undefined) {
        formData.append('fuel_level_manual', checklistData.fuelLevelManual.toString())
      }
      if (checklistData?.scratchesNoted !== undefined) {
        formData.append('scratches_noted', checklistData.scratchesNoted.toString())
      }
      if (checklistData?.damageDescription) {
        formData.append('damage_description', checklistData.damageDescription)
      }
      
      // Get auth token
      const token = authService.getToken()
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Token ${token}`
      }
      // Don't set Content-Type - let FormData set it with boundary
      
      const response = await fetch(`${BASE_URL}/fleet/shifts/${shiftId}/end/`, {
        method: 'POST',
        headers,
        body: formData,
      })
      
      const shift = await this.handleResponse<Shift>(response);
      
      // Invalidate shifts cache when a shift is ended
      await apiCache.invalidate('/fleet/shifts/');
      
      analytics.track('Shift Ended', {
        shift_id: shiftId,
        has_location: !!(lat && lng),
        has_photos: !!(photos?.fuelLevelPhoto || photos?.photoFront),
        has_checklist: !!checklistData,
      })
      return shift;
    } catch (error) {
      analytics.track('Shift End Failed', {
        shift_id: shiftId,
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await fetch(`${BASE_URL}/telemetry/notifications/`, {
        headers: this.getHeaders(),
      })
      const data = await this.handleResponse<any>(response)
      
      // Handle both paginated and non-paginated responses
      const notifications = Array.isArray(data) ? data : (data.results || [])
      
      analytics.track('Notifications Fetched', {
        count: notifications.length
      })
      
      return notifications
    } catch (error) {
      console.error('[ApiService] Error fetching notifications:', error);
      analytics.track('Notifications Fetch Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    try {
      const response = await fetch(`${BASE_URL}/telemetry/notifications/${id}/read/`, {
        method: 'POST',
        headers: this.getHeaders(),
      })
      
      analytics.track('Notification Marked Read', { notification_id: id })
      return this.handleResponse<Notification>(response)
    } catch (error) {
      analytics.track('Notification Read Failed', {
        notification_id: id,
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  // Vehicle Location Management
  async createVehicleLocation(data: {
    vehicle: number;
    lat: number;
    lng: number;
    address?: string;
    accuracy?: number;
    speed?: number;
    heading?: number;
    altitude?: number;
  }): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/telemetry/vehicle-locations/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      
      analytics.track('Vehicle Location Created', {
        vehicle_id: data.vehicle,
        has_address: !!data.address,
        has_speed: data.speed !== undefined,
      });
      return this.handleResponse<any>(response);
    } catch (error) {
      analytics.track('Vehicle Location Creation Failed', {
        vehicle_id: data.vehicle,
        error: error instanceof Error ? error.message : 'unknown',
      });
      throw error;
    }
  }

  // User Management
  async getUsers(params?: { role?: string; search?: string }): Promise<AuthUser[]> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.role) queryParams.append('role', params.role)
      if (params?.search) queryParams.append('search', params.search)
      
      const url = `${BASE_URL}/account/users/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await fetch(url, {
        headers: this.getHeaders(),
      })
      
      const data = await this.handleResponse<any>(response)
      const users = Array.isArray(data) ? data : (data.results || [])
      
      analytics.track('Users Fetched', {
        count: users.length,
        role: params?.role || 'all'
      })
      
      return users
    } catch (error) {
      console.error('[ApiService] Error fetching users:', error);
      analytics.track('Users Fetch Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  // Company Statistics
  async getCompanyStats(): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/account/stats/`, {
        headers: this.getHeaders(),
      })
      
      analytics.track('Company Stats Fetched')
      return this.handleResponse<any>(response)
    } catch (error) {
      console.error('[ApiService] Error fetching company stats:', error);
      analytics.track('Company Stats Fetch Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${BASE_URL}/fleet/stats/dashboard/`, {
        headers: this.getHeaders(),
      })
      
      analytics.track('Dashboard Stats Fetched')
      return this.handleResponse<DashboardStats>(response)
    } catch (error) {
      analytics.track('Dashboard Stats Fetch Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  // File Upload (for photos)
  async uploadPhoto(uri: string, inspectionId: number, part: string, caption?: string): Promise<Photo> {
    try {
      const formData = new FormData()
      formData.append('inspection', inspectionId.toString())
      formData.append('part', part)
      if (caption) formData.append('caption', caption)
      
      // Create file object from URI
      const filename = uri.split('/').pop() || 'photo.jpg'
      const match = /\.(\w+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : 'image/jpeg'
      
      formData.append('image', {
        uri,
        type,
        name: filename,
      } as any)

      const response = await fetch(`${BASE_URL}/inspections/photos/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authService.getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })
      
      analytics.track('Photo Uploaded', {
        inspection_id: inspectionId,
        part
      })
      return this.handleResponse<Photo>(response)
    } catch (error) {
      analytics.track('Photo Upload Failed', {
        inspection_id: inspectionId,
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  // Fuel Reading Upload
  async uploadFuelReading(uri: string, vehicleId: number, fuelData: any): Promise<any> {
    try {
      const formData = new FormData()
      formData.append('vehicle', vehicleId.toString())
      formData.append('type', 'fuel_level')
      
      // Create file object from URI
      const filename = uri.split('/').pop() || 'fuel-photo.jpg'
      const match = /\.(\w+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : 'image/jpeg'
      
      formData.append('image', {
        uri,
        type,
        name: filename,
      } as any)

      formData.append('data', JSON.stringify({
        fuel_level: fuelData.fuelLevel,
        confidence: fuelData.confidence,
        detection_method: fuelData.method,
        timestamp: new Date().toISOString(),
        raw_text: fuelData.rawText,
        detected_values: fuelData.detectedValues,
      }))

      const response = await fetch(`${BASE_URL}/telemetry/fuel-readings/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authService.getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })
      
      analytics.track('Fuel Reading Uploaded', {
        vehicle_id: vehicleId,
        fuel_level: fuelData.fuelLevel,
        confidence: fuelData.confidence
      })
      return this.handleResponse<any>(response)
    } catch (error) {
      analytics.track('Fuel Reading Upload Failed', {
        vehicle_id: vehicleId,
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }
}

export const apiService = new ApiService()
