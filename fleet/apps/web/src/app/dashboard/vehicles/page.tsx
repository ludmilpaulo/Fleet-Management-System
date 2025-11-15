"use client"

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchVehicles, deleteVehicle, createVehicle } from '@/store/slices/vehiclesSlice'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const { vehicles: vehiclesState, loading } = useSelector((state: RootState) => state.vehicles)
  // Ensure vehicles is always an array
  const vehicles = Array.isArray(vehiclesState) ? vehiclesState : []
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    reg_number: '',
    make: '',
    model: '',
    vin: '',
    year: '',
    color: '',
    status: 'ACTIVE',
    mileage: '0',
    fuel_type: 'PETROL',
    engine_size: '',
    transmission: 'MANUAL',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchVehicles())
    
    // Track vehicles page view
    analytics.trackPageView('/dashboard/vehicles', {
      context: 'vehicles_page',
    });
  }, [dispatch])

  const handleAddVehicle = async () => {
    setIsSubmitting(true)
    try {
      const vehicleData = {
        reg_number: formData.reg_number,
        make: formData.make,
        model: formData.model,
        vin: formData.vin || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        color: formData.color || undefined,
        status: formData.status as Vehicle['status'],
        mileage: parseInt(formData.mileage) || 0,
        fuel_type: formData.fuel_type as Vehicle['fuel_type'],
        engine_size: formData.engine_size || undefined,
        transmission: formData.transmission as Vehicle['transmission'],
      }
      
      await dispatch(createVehicle(vehicleData)).unwrap()
      setIsAddModalOpen(false)
      setFormData({
        reg_number: '',
        make: '',
        model: '',
        vin: '',
        year: '',
        color: '',
        status: 'ACTIVE',
        mileage: '0',
        fuel_type: 'PETROL',
        engine_size: '',
        transmission: 'MANUAL',
      })
      dispatch(fetchVehicles())
    } catch (error: any) {
      console.error('Error creating vehicle:', error)
      alert(error?.message || 'Failed to create vehicle. Please check all required fields.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <Button onClick={() => setIsAddModalOpen(true)}>
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

      {/* Add Vehicle Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Enter the vehicle details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg_number">Registration Number *</Label>
                <Input
                  id="reg_number"
                  value={formData.reg_number}
                  onChange={(e) => setFormData({ ...formData, reg_number: e.target.value })}
                  placeholder="ABC-123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN (Optional)</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  placeholder="Vehicle Identification Number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  placeholder="Toyota"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Camry"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                  min="1900"
                  max="2100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="White"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="RETIRED">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel_type">Fuel Type *</Label>
                <Select value={formData.fuel_type} onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PETROL">Petrol</SelectItem>
                    <SelectItem value="DIESEL">Diesel</SelectItem>
                    <SelectItem value="ELECTRIC">Electric</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission *</Label>
                <Select value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="engine_size">Engine Size</Label>
              <Input
                id="engine_size"
                value={formData.engine_size}
                onChange={(e) => setFormData({ ...formData, engine_size: e.target.value })}
                placeholder="2.0L"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddVehicle} disabled={isSubmitting || !formData.reg_number || !formData.make || !formData.model}>
              {isSubmitting ? 'Adding...' : 'Add Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
