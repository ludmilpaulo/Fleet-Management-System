"use client"

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchVehicles, deleteVehicle, createVehicle, updateVehicle } from '@/store/slices/vehiclesSlice'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
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
  Eye,
  Loader2,
  AlertCircle
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
import DashboardLayout from '@/components/layout/dashboard-layout'
import HelpButton from '@/components/ui/help-button'

export default function VehiclesPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { vehicles: vehiclesState, loading, error } = useSelector((state: RootState) => state.vehicles)
  // Ensure vehicles is always an array
  const vehicles = Array.isArray(vehiclesState) ? vehiclesState : []
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState({
    reg_number: '',
    make: '',
    model: '',
    vin: '',
    year: '',
    color: '',
    status: 'ACTIVE' as Vehicle['status'],
    mileage: '0',
    fuel_type: 'PETROL' as Vehicle['fuel_type'],
    engine_size: '',
    transmission: 'MANUAL' as Vehicle['transmission'],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchVehicles())
    
    // Track vehicles page view
    analytics.trackPageView('/dashboard/vehicles', {
      context: 'vehicles_page',
    });
  }, [dispatch])

  const handleOpenCreateDialog = () => {
    setSelectedVehicle(null)
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
    setFormError(null)
    setIsAddModalOpen(true)
  }

  const handleOpenEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setFormData({
      reg_number: vehicle.reg_number,
      make: vehicle.make,
      model: vehicle.model,
      vin: vehicle.vin || '',
      year: vehicle.year?.toString() || '',
      color: vehicle.color || '',
      status: vehicle.status,
      mileage: vehicle.mileage?.toString() || '0',
      fuel_type: vehicle.fuel_type,
      engine_size: vehicle.engine_size || '',
      transmission: vehicle.transmission,
    })
    setFormError(null)
    setIsEditModalOpen(true)
  }

  const handleOpenDeleteDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setFormError(null)
    setIsDeleteModalOpen(true)
  }

  const handleAddVehicle = async () => {
    if (!formData.reg_number || !formData.make || !formData.model) {
      setFormError('Registration number, make, and model are required')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      const vehicleData = {
        reg_number: formData.reg_number,
        make: formData.make,
        model: formData.model,
        vin: formData.vin || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        color: formData.color || undefined,
        status: formData.status,
        mileage: parseInt(formData.mileage) || 0,
        fuel_type: formData.fuel_type,
        engine_size: formData.engine_size || undefined,
        transmission: formData.transmission,
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
      console.error('Error details:', {
        message: error?.message,
        detail: error?.detail,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
        config: error?.config,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
        fullUrl: error?.config?.baseURL && error?.config?.url ? `${error.config.baseURL}${error.config.url}` : error?.config?.url
      })
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.detail || error?.message || 'Failed to create vehicle. Please check all required fields.'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateVehicle = async () => {
    if (!selectedVehicle) return

    if (!formData.reg_number || !formData.make || !formData.model) {
      setFormError('Registration number, make, and model are required')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      const vehicleData = {
        reg_number: formData.reg_number,
        make: formData.make,
        model: formData.model,
        vin: formData.vin || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        color: formData.color || undefined,
        status: formData.status,
        mileage: parseInt(formData.mileage) || 0,
        fuel_type: formData.fuel_type,
        engine_size: formData.engine_size || undefined,
        transmission: formData.transmission,
      }
      
      await dispatch(updateVehicle({ id: selectedVehicle.id, data: vehicleData })).unwrap()
      setIsEditModalOpen(false)
      dispatch(fetchVehicles())
    } catch (error: any) {
      console.error('Error updating vehicle:', error)
      const errorMessage = error?.detail || error?.message || 'Failed to update vehicle. Please try again.'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return

    setIsSubmitting(true)
    setFormError(null)
    try {
      await dispatch(deleteVehicle(selectedVehicle.id)).unwrap()
      setIsDeleteModalOpen(false)
      dispatch(fetchVehicles())
    } catch (error: any) {
      console.error('Error deleting vehicle:', error)
      const errorMessage = error?.detail || error?.message || 'Failed to delete vehicle. Please try again.'
      setFormError(errorMessage)
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
              <DropdownMenuItem onClick={() => {
                analytics.track('Vehicle View', { vehicle_id: vehicle.id });
                router.push(`/dashboard/vehicles/${vehicle.id}`);
              }}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenEditDialog(vehicle)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Vehicle
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleOpenDeleteDialog(vehicle)}
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
      <div className="space-y-6 p-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <HelpButton role="admin" page="vehicles" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 rounded-2xl border border-gray-200/60 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Vehicle Management
            </h1>
            <p className="text-gray-600 text-base sm:text-lg font-medium">
              Manage your fleet vehicles efficiently
            </p>
          </div>
          <Button 
            onClick={handleOpenCreateDialog}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold px-6 py-3 h-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Vehicle
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
                onClick={() => dispatch(fetchVehicles())}
                className="text-red-700 hover:text-red-900 hover:bg-red-100"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300/60">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 opacity-0 group-hover:opacity-100 rounded-full -mr-16 -mt-16 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Total Vehicles
            </CardTitle>
            <div className="p-2.5 bg-blue-50 rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              {vehicles.length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 hover:border-green-300/60">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 opacity-0 group-hover:opacity-100 rounded-full -mr-16 -mt-16 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Active Vehicles
            </CardTitle>
            <div className="p-2.5 bg-green-50 rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              {vehicles.filter(v => v.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-300/60">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 opacity-0 group-hover:opacity-100 rounded-full -mr-16 -mt-16 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              In Maintenance
            </CardTitle>
            <div className="p-2.5 bg-yellow-50 rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <Truck className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              {vehicles.filter(v => v.status === 'MAINTENANCE').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 hover:border-purple-300/60">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 opacity-0 group-hover:opacity-100 rounded-full -mr-16 -mt-16 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              With Active Shifts
            </CardTitle>
            <div className="p-2.5 bg-purple-50 rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <Truck className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
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

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {formError}
            </div>
          )}
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
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Vehicle['status'] })}>
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
                <Select value={formData.fuel_type} onValueChange={(value) => setFormData({ ...formData, fuel_type: value as Vehicle['fuel_type'] })}>
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
                <Select value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value as Vehicle['transmission'] })}>
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
            <Button 
              onClick={handleAddVehicle} 
              disabled={isSubmitting || !formData.reg_number || !formData.make || !formData.model}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Adding...' : 'Add Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update the vehicle details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {formError}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_reg_number">Registration Number *</Label>
                <Input
                  id="edit_reg_number"
                  value={formData.reg_number}
                  onChange={(e) => setFormData({ ...formData, reg_number: e.target.value })}
                  placeholder="ABC-123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_vin">VIN (Optional)</Label>
                <Input
                  id="edit_vin"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  placeholder="Vehicle Identification Number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_make">Make *</Label>
                <Input
                  id="edit_make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  placeholder="Toyota"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_model">Model *</Label>
                <Input
                  id="edit_model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Camry"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_year">Year</Label>
                <Input
                  id="edit_year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                  min="1900"
                  max="2100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_color">Color</Label>
                <Input
                  id="edit_color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="White"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_mileage">Mileage (km)</Label>
                <Input
                  id="edit_mileage"
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
                <Label htmlFor="edit_status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Vehicle['status'] })}>
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
                <Label htmlFor="edit_fuel_type">Fuel Type *</Label>
                <Select value={formData.fuel_type} onValueChange={(value) => setFormData({ ...formData, fuel_type: value as Vehicle['fuel_type'] })}>
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
                <Label htmlFor="edit_transmission">Transmission *</Label>
                <Select value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value as Vehicle['transmission'] })}>
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
              <Label htmlFor="edit_engine_size">Engine Size</Label>
              <Input
                id="edit_engine_size"
                value={formData.engine_size}
                onChange={(e) => setFormData({ ...formData, engine_size: e.target.value })}
                placeholder="2.0L"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateVehicle} 
              disabled={isSubmitting || !formData.reg_number || !formData.make || !formData.model}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Updating...' : 'Update Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Vehicle Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vehicle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedVehicle?.reg_number} ({selectedVehicle?.make} {selectedVehicle?.model})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {formError}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVehicle}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  )
}
