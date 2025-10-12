"use client"

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchVehicles, deleteVehicle } from '@/store/slices/vehiclesSlice'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Truck,
  MoreHorizontal,
  Eye
} from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { Vehicle } from '@/store/slices/vehiclesSlice'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { analytics } from '@/lib/mixpanel'

export default function VehiclesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { vehicles, loading } = useSelector((state: RootState) => state.vehicles)

  useEffect(() => {
    dispatch(fetchVehicles())
    
    // Track vehicles page view
    analytics.trackPageView('/dashboard/vehicles', {
      context: 'vehicles_page',
    });
  }, [dispatch])

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      RETIRED: 'bg-red-100 text-red-800',
    }
    return variants[status as keyof typeof variants] || variants.INACTIVE
  }

  const getFuelTypeBadge = (fuelType: string) => {
    const variants = {
      PETROL: 'bg-blue-100 text-blue-800',
      DIESEL: 'bg-gray-100 text-gray-800',
      ELECTRIC: 'bg-green-100 text-green-800',
      HYBRID: 'bg-purple-100 text-purple-800',
    }
    return variants[fuelType as keyof typeof variants] || variants.PETROL
  }

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "reg_number",
      header: "Registration",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("reg_number")}</div>
      ),
    },
    {
      accessorKey: "make",
      header: "Make",
    },
    {
      accessorKey: "model",
      header: "Model",
    },
    {
      accessorKey: "year",
      header: "Year",
      cell: ({ row }) => {
        const year = row.getValue("year") as number
        return year ? year.toString() : '-'
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge className={getStatusBadge(status)}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "fuel_type",
      header: "Fuel Type",
      cell: ({ row }) => {
        const fuelType = row.getValue("fuel_type") as string
        return (
          <Badge className={getFuelTypeBadge(fuelType)}>
            {fuelType}
          </Badge>
        )
      },
    },
    {
      accessorKey: "mileage",
      header: "Mileage",
      cell: ({ row }) => {
        const mileage = row.getValue("mileage") as number
        return `${mileage.toLocaleString()} km`
      },
    },
    {
      accessorKey: "current_shift",
      header: "Current Shift",
      cell: ({ row }) => {
        const currentShift = row.getValue("current_shift")
        return currentShift ? (
          <Badge className="bg-blue-100 text-blue-800">
            Active
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log('View', vehicle.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Edit', vehicle.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Vehicle
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  analytics.trackVehicleDelete(vehicle.id.toString());
                  dispatch(deleteVehicle(vehicle.id));
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Vehicle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600 mt-2">
            Manage your fleet vehicles
          </p>
        </div>
        <Button onClick={() => alert('Add vehicle feature coming soon!')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Vehicles
            </CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Vehicles
            </CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter(v => v.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              In Maintenance
            </CardTitle>
            <Truck className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter(v => v.status === 'MAINTENANCE').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              With Active Shifts
            </CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter(v => v.current_shift).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle List</CardTitle>
          <CardDescription>
            All vehicles in your fleet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={vehicles} 
            searchKey="reg_number"
          />
        </CardContent>
      </Card>
    </div>
  )
}
