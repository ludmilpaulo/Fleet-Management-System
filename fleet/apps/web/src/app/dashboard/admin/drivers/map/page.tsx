'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAppSelector } from '@/store/hooks'
import { apiClient, extractResults } from '@/lib/apiClient'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Navigation, RefreshCw, Users, Truck, Clock, AlertCircle, Loader2 } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })

// Fix for default marker icon in React-Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

interface DriverLocation {
  id: number
  vehicle: number
  vehicle_reg: string
  vehicle_make_model: string
  lat: number
  lng: number
  address?: string
  accuracy?: number
  speed?: number
  heading?: number
  recorded_at: string
  driver_name?: string
  driver_id?: number
  shift_id?: number
}

interface Shift {
  id: number
  vehicle: number
  driver: number
  driver_name: string
  vehicle_reg: string
  start_at: string
  status: string
}

export default function DriverTrackingMapPage() {
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const [isMounted, setIsMounted] = useState(false)
  const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsMounted(true)
    fetchDriverLocations()
    fetchActiveShifts()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDriverLocations()
      fetchActiveShifts()
    }, 30000)
    setRefreshInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  const fetchDriverLocations = async () => {
    try {
      setError(null)
      // Get latest locations for vehicles with active shifts
      const data = await apiClient('telemetry/vehicle-locations/drivers/')
      const results = extractResults<DriverLocation>(data)
      setDriverLocations(results)
    } catch (err: any) {
      console.error('Error fetching driver locations:', err)
      setError(err.message || 'Failed to load driver locations')
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveShifts = async () => {
    try {
      const data = await apiClient('fleet/shifts/?status=ACTIVE&page_size=100')
      const results = extractResults<Shift>(data)
      setShifts(results)
    } catch (err) {
      console.error('Error fetching shifts:', err)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchDriverLocations()
    fetchActiveShifts()
  }

  // Combine driver locations with shift info
  const driversOnMap = useMemo(() => {
    return driverLocations.map(location => {
      const shift = shifts.find(s => s.vehicle === location.vehicle)
      return {
        ...location,
        driver_name: shift?.driver_name || location.driver_name || 'Unknown Driver',
        driver_id: shift?.driver || location.driver_id,
        shift_id: shift?.id || location.shift_id,
      }
    })
  }, [driverLocations, shifts])

  // Calculate map center and bounds
  const mapCenter = useMemo(() => {
    if (driversOnMap.length === 0) {
      return [-26.2041, 28.0473] as [number, number] // Default to Johannesburg, South Africa
    }
    
    const lats = driversOnMap.map(d => d.lat)
    const lngs = driversOnMap.map(d => d.lng)
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
    
    return [avgLat, avgLng] as [number, number]
  }, [driversOnMap])

  // Create custom marker icons for different statuses
  const createDriverIcon = (driverName: string, isActive: boolean) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${isActive ? '#10b981' : '#6b7280'};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          ${driverName.charAt(0).toUpperCase()}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })
  }

  if (!isMounted || typeof window === 'undefined') {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Navigation className="h-7 w-7 text-blue-600" />
              Driver Location Tracking
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Real-time tracking of drivers with active shifts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              <Users className="h-4 w-4 mr-1" />
              {driversOnMap.length} Active
            </Badge>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-red-700 hover:text-red-900"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Map */}
        <Card className="border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Live Driver Locations
            </CardTitle>
            <CardDescription>
              Map showing current locations of drivers on active shifts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading && driversOnMap.length === 0 ? (
              <div className="h-[600px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                  <p className="text-gray-600">Loading driver locations...</p>
                </div>
              </div>
            ) : driversOnMap.length === 0 ? (
              <div className="h-[600px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Users className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-gray-600 font-medium">No active drivers to track</p>
                  <p className="text-sm text-gray-500">Drivers will appear here when they start shifts</p>
                </div>
              </div>
            ) : (
              <div className="relative" style={{ height: '600px', width: '100%' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={driversOnMap.length === 1 ? 15 : 12}
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                  className="z-0"
                  key={driversOnMap.length} // Force re-render when locations change
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {driversOnMap.map((driver) => (
                    <Marker
                      key={driver.id}
                      position={[driver.lat, driver.lng]}
                      icon={createDriverIcon(driver.driver_name || 'D', true)}
                    >
                      <Popup>
                        <div className="text-sm space-y-2 min-w-[200px]">
                          <div className="font-bold text-base border-b pb-2">
                            {driver.driver_name || 'Unknown Driver'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Truck className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold">{driver.vehicle_reg}</span>
                            </div>
                            <p className="text-xs text-gray-600">{driver.vehicle_make_model}</p>
                          </div>
                          {driver.address && (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-red-600" />
                                <span className="font-medium">Location</span>
                              </div>
                              <p className="text-xs text-gray-600">{driver.address}</p>
                            </div>
                          )}
                          {driver.speed !== undefined && driver.speed !== null && (
                            <div>
                              <span className="text-xs text-gray-500">Speed: </span>
                              <span className="text-xs font-semibold">{driver.speed.toFixed(1)} km/h</span>
                            </div>
                          )}
                          <div>
                            <span className="text-xs text-gray-500">Last updated: </span>
                            <span className="text-xs font-semibold">
                              {new Date(driver.recorded_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs"
                              onClick={() => router.push(`/dashboard/admin/shifts?shift=${driver.shift_id}`)}
                            >
                              View Shift Details
                            </Button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver List */}
        {driversOnMap.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Active Drivers ({driversOnMap.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {driversOnMap.map((driver) => (
                  <Card key={driver.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                          <span className="text-white font-bold">
                            {(driver.driver_name || 'D').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base mb-1">{driver.driver_name || 'Unknown Driver'}</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{driver.vehicle_reg}</span>
                            </div>
                            {driver.address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-gray-600 line-clamp-2">{driver.address}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>Updated {new Date(driver.recorded_at).toLocaleTimeString()}</span>
                            </div>
                            {driver.speed !== undefined && driver.speed !== null && (
                              <div className="text-xs text-gray-600">
                                Speed: <span className="font-semibold">{driver.speed.toFixed(1)} km/h</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200 flex-shrink-0">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

