'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { apiClient } from '@/lib/apiClient'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Truck, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings,
  ArrowLeft,
  Edit,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

interface Vehicle {
  id: number
  vin?: string
  reg_number: string
  make: string
  model: string
  year?: number
  color?: string
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED'
  mileage: number
  fuel_type: 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID'
  engine_size?: string
  transmission: 'MANUAL' | 'AUTOMATIC'
  created_at: string
  updated_at: string
  org_name?: string
}

export default function VehicleDetailPage() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = params?.id as string
  const { user } = useAppSelector((state) => state.auth)
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (vehicleId) {
      fetchVehicle()
    }
  }, [vehicleId])

  const fetchVehicle = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient(`fleet/vehicles/${vehicleId}/`)
      setVehicle(data)
    } catch (err: any) {
      console.error('Error fetching vehicle:', err)
      setError(err.message || 'Failed to load vehicle details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500'
      case 'MAINTENANCE':
        return 'bg-yellow-500'
      case 'INACTIVE':
        return 'bg-gray-500'
      case 'RETIRED':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return CheckCircle
      case 'MAINTENANCE':
        return AlertCircle
      case 'INACTIVE':
        return Clock
      default:
        return AlertCircle
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !vehicle) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Failed to load vehicle</p>
                <p className="text-gray-600 mb-4">{error || 'Vehicle not found'}</p>
                <Button onClick={fetchVehicle}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const StatusIcon = getStatusIcon(vehicle.status)

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Truck className="h-7 w-7 text-blue-600" />
                {vehicle.reg_number}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusColor(vehicle.status)} text-white flex items-center gap-1`}>
              <StatusIcon className="h-3 w-3" />
              {vehicle.status}
            </Badge>
            {(user?.role === 'admin') && (
              <Button
                onClick={() => router.push(`/dashboard/admin/vehicles?edit=${vehicle.id}`)}
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Registration</p>
                  <p className="font-semibold">{vehicle.reg_number}</p>
                </div>
                {vehicle.vin && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">VIN</p>
                    <p className="font-semibold font-mono text-sm">{vehicle.vin}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Make</p>
                  <p className="font-semibold">{vehicle.make}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Model</p>
                  <p className="font-semibold">{vehicle.model}</p>
                </div>
                {vehicle.year && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Year</p>
                    <p className="font-semibold">{vehicle.year}</p>
                  </div>
                )}
                {vehicle.color && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Color</p>
                    <p className="font-semibold">{vehicle.color}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mileage</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Gauge className="h-4 w-4" />
                    {vehicle.mileage.toLocaleString()} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Fuel Type</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Fuel className="h-4 w-4" />
                    {vehicle.fuel_type}
                  </p>
                </div>
                {vehicle.engine_size && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Engine Size</p>
                    <p className="font-semibold">{vehicle.engine_size}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Transmission</p>
                  <p className="font-semibold">{vehicle.transmission}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created At</p>
                  <p className="font-semibold">
                    {format(new Date(vehicle.created_at), 'PPp')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="font-semibold">
                    {format(new Date(vehicle.updated_at), 'PPp')}
                  </p>
                </div>
                {vehicle.org_name && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Organization</p>
                    <p className="font-semibold">{vehicle.org_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push(`/dashboard/admin/shifts?vehicle=${vehicle.id}`)}
                variant="outline"
              >
                <MapPin className="mr-2 h-4 w-4" />
                View Shifts
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/admin/inspections?vehicle=${vehicle.id}`)}
                variant="outline"
              >
                <Settings className="mr-2 h-4 w-4" />
                View Inspections
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/admin/tickets?vehicle=${vehicle.id}`)}
                variant="outline"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                View Tickets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

