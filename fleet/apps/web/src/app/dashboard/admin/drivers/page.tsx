"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchShifts, Shift } from '@/store/slices/shiftsSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  MapPin, 
  Truck, 
  Clock, 
  Navigation,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle,
  Search
} from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { apiClient, extractResults } from '@/lib/apiClient'

interface UserData {
  id: number
  username: string
  full_name?: string
  email: string
  role: string
  phone_number?: string
  employee_id?: string
}

export default function AdminDriversPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { shifts: shiftsState, loading, error } = useSelector((state: RootState) => state.shifts)
  // Ensure shifts is always an array
  const shifts = Array.isArray(shiftsState) ? shiftsState : []
  const [drivers, setDrivers] = useState<UserData[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingDrivers, setLoadingDrivers] = useState(true)

  useEffect(() => {
    dispatch(fetchShifts())
    fetchDrivers()
    fetchVehicles()
  }, [dispatch])

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true)
      const data = await apiClient('/account/users/?page_size=100')
      const results = extractResults<UserData>(data)
      setDrivers(results.filter(u => u.role === 'driver'))
    } catch (err) {
      console.error('Error fetching drivers:', err)
    } finally {
      setLoadingDrivers(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const data = await apiClient('/fleet/vehicles/?page_size=100')
      const results = extractResults<any>(data)
      setVehicles(results)
    } catch (err) {
      console.error('Error fetching vehicles:', err)
    }
  }

  const activeShifts = shifts.filter(s => s.status === 'ACTIVE')
  const activeDrivers = activeShifts.map(s => ({
    driver: drivers.find(d => d.id === s.driver),
    shift: s,
    vehicle: vehicles.find(v => v.id === s.vehicle),
  })).filter(item => item.driver)

  const filteredDrivers = drivers.filter((driver) => {
    const searchableText = [
      driver.username,
      driver.email,
      driver.full_name || '',
      driver.employee_id || '',
    ].join(' ').toLowerCase()
    return searchableText.includes(searchTerm.toLowerCase())
  })

  const getDriverStatus = (driverId: number) => {
    const activeShift = activeShifts.find(s => s.driver === driverId)
    return activeShift ? {
      status: 'active',
      shift: activeShift,
      vehicle: vehicles.find(v => v.id === activeShift.vehicle),
    } : { status: 'inactive', shift: null, vehicle: null }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 rounded-2xl border border-gray-200/60 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Driver Tracking
            </h1>
            <p className="text-gray-600 text-base sm:text-lg font-medium">
              Track drivers and monitor active shifts in real-time
            </p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/admin/drivers/map')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <MapPin className="h-4 w-4 mr-2" />
            View on Map
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 animate-in slide-in-from-top-2 duration-300">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(fetchShifts())}
                className="text-red-700 hover:text-red-900 hover:bg-red-100"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Total Drivers
              </CardTitle>
              <div className="p-2.5 bg-blue-50 rounded-xl shadow-md">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loadingDrivers ? <Skeleton className="h-10 w-20" /> : drivers.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Active Drivers
              </CardTitle>
              <div className="p-2.5 bg-green-50 rounded-xl shadow-md">
                <Navigation className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : activeDrivers.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Active Shifts
              </CardTitle>
              <div className="p-2.5 bg-blue-50 rounded-xl shadow-md">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : activeShifts.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Available
              </CardTitle>
              <div className="p-2.5 bg-purple-50 rounded-xl shadow-md">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading || loadingDrivers ? <Skeleton className="h-10 w-20" /> : drivers.length - activeDrivers.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Drivers Tracking */}
        {activeDrivers.length > 0 && (
          <Card className="border border-gray-200/80 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-extrabold flex items-center gap-2">
                <Navigation className="h-6 w-6 text-green-600" />
                Active Drivers
              </CardTitle>
              <CardDescription>Drivers currently on active shifts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeDrivers.map(({ driver, shift, vehicle }) => (
                  <Card key={driver!.id} className="border border-green-200 bg-green-50/30 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">
                                {(driver!.full_name || driver!.username).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{driver!.full_name || driver!.username}</h3>
                              <p className="text-sm text-gray-600">{driver!.email}</p>
                              {driver!.employee_id && (
                                <p className="text-xs text-gray-500">ID: {driver!.employee_id}</p>
                              )}
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                              Active
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="text-xs text-gray-500">Vehicle</p>
                                <p className="font-semibold">{vehicle?.reg_number || `#${shift.vehicle}`}</p>
                                {vehicle && (
                                  <p className="text-xs text-gray-500">{vehicle.make} {vehicle.model}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-purple-600" />
                              <div>
                                <p className="text-xs text-gray-500">Shift Started</p>
                                <p className="font-semibold">{new Date(shift.start_at).toLocaleString()}</p>
                                {shift.duration && (
                                  <p className="text-xs text-gray-500">Duration: {shift.duration}</p>
                                )}
                              </div>
                            </div>
                            {(shift.start_lat && shift.start_lng) && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-600" />
                                <div>
                                  <p className="text-xs text-gray-500">Location</p>
                                  <p className="font-semibold text-xs">
                                    {shift.start_address || `${shift.start_lat.toFixed(4)}, ${shift.start_lng.toFixed(4)}`}
                                  </p>
                                  {shift.start_address && (
                                    <a 
                                      href={`https://www.google.com/maps?q=${shift.start_lat},${shift.start_lng}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      View on Map
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {shift.notes && (
                            <div className="bg-white/60 rounded-lg p-2 text-sm text-gray-700">
                              <p className="font-medium mb-1">Notes:</p>
                              <p>{shift.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Drivers List */}
        <Card className="border border-gray-200/80 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-extrabold">All Drivers</CardTitle>
                <CardDescription>Complete list of all drivers in your fleet</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDrivers ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No drivers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDrivers.map((driver) => {
                  const status = getDriverStatus(driver.id)
                  return (
                    <Card key={driver.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-xl">
                                {(driver.full_name || driver.username).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg">{driver.full_name || driver.username}</h3>
                                {status.status === 'active' ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-gray-300">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{driver.email}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {driver.phone_number && <span>📞 {driver.phone_number}</span>}
                                {driver.employee_id && <span>ID: {driver.employee_id}</span>}
                                <span>Username: {driver.username}</span>
                              </div>
                              {status.status === 'active' && status.shift && (
                                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                      <Truck className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium">Vehicle: {status.vehicle?.reg_number || `#${status.shift.vehicle}`}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4 text-purple-600" />
                                      <span>Started: {new Date(status.shift.start_at).toLocaleString()}</span>
                                    </div>
                                    {(status.shift.start_lat && status.shift.start_lng) && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-red-600" />
                                        <span className="text-xs">
                                          {status.shift.start_address || `${status.shift.start_lat.toFixed(4)}, ${status.shift.start_lng.toFixed(4)}`}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

