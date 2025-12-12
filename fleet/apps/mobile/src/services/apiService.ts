import { authService, AuthUser } from './authService'
import { analytics } from './mixpanel'

// Base API configuration - uses IP address for iOS simulator and Android device compatibility
const getApiBaseUrl = (): string => {
  // Environment variable takes highest priority
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Default to IP address (update 192.168.1.110 to your computer's IP if different)
  // This works for both iOS simulator and Android device
  return 'http://192.168.1.110:8000/api';
};

const BASE_URL = getApiBaseUrl();

// Log API configuration on initialization
console.log('[API Service] Base URL:', BASE_URL);

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
  vehicle: Vehicle
  driver: AuthUser
  start_time: string
  end_time?: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  start_location: string
  end_location?: string
  start_lat?: number
  start_lng?: number
  end_lat?: number
  end_lng?: number
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
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }
    return response.json()
  }

  // Vehicle Management
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const response = await fetch(`${BASE_URL}/fleet/vehicles/`, {
        headers: this.getHeaders(),
      })
      const data = await this.handleResponse<{ results: Vehicle[] }>(response)
      
      analytics.track('Vehicles Fetched', {
        count: data.results.length
      })
      
      return data.results
    } catch (error) {
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
  async getInspections(): Promise<Inspection[]> {
    try {
      const response = await fetch(`${BASE_URL}/inspections/inspections/`, {
        headers: this.getHeaders(),
      })
      const data = await this.handleResponse<{ results: Inspection[] }>(response)
      
      analytics.track('Inspections Fetched', {
        count: data.results.length
      })
      
      return data.results
    } catch (error) {
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
      
      analytics.track('Inspection Created')
      return this.handleResponse<Inspection>(response)
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
  async getShifts(): Promise<Shift[]> {
    try {
      const response = await fetch(`${BASE_URL}/fleet/shifts/`, {
        headers: this.getHeaders(),
      })
      const data = await this.handleResponse<{ results: Shift[] }>(response)
      
      analytics.track('Shifts Fetched', {
        count: data.results.length
      })
      
      return data.results
    } catch (error) {
      analytics.track('Shifts Fetch Failed', {
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async startShift(vehicleId: number, startLocation?: string, lat?: number, lng?: number): Promise<Shift> {
    try {
      const response = await fetch(`${BASE_URL}/fleet/shifts/start/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          vehicle: vehicleId,
          start_location: startLocation,
          start_lat: lat,
          start_lng: lng,
        }),
      })
      
      analytics.track('Shift Started', {
        vehicle_id: vehicleId,
        has_location: !!(lat && lng)
      })
      return this.handleResponse<Shift>(response)
    } catch (error) {
      analytics.track('Shift Start Failed', {
        vehicle_id: vehicleId,
        error: error instanceof Error ? error.message : 'unknown'
      })
      throw error
    }
  }

  async endShift(shiftId: number, endLocation?: string, lat?: number, lng?: number): Promise<Shift> {
    try {
      const response = await fetch(`${BASE_URL}/fleet/shifts/${shiftId}/end/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          end_location: endLocation,
          end_lat: lat,
          end_lng: lng,
        }),
      })
      
      analytics.track('Shift Ended', {
        shift_id: shiftId,
        has_location: !!(lat && lng)
      })
      return this.handleResponse<Shift>(response)
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
      const data = await this.handleResponse<{ results: Notification[] }>(response)
      
      analytics.track('Notifications Fetched', {
        count: data.results.length
      })
      
      return data.results
    } catch (error) {
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
