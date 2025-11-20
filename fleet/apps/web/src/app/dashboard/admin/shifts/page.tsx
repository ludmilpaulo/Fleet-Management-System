"use client"

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchShifts, createShift, updateShift, deleteShift, Shift } from '@/store/slices/shiftsSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
  Truck,
  User
} from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { apiClient, extractResults } from '@/lib/apiClient'
import LocationPicker from '@/components/location/LocationPicker'

interface UserData {
  id: number
  username: string
  full_name?: string
  role: string
}

export default function AdminShiftsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { shifts: shiftsState, loading, error } = useSelector((state: RootState) => state.shifts)
  // Ensure shifts is always an array
  const shifts = Array.isArray(shiftsState) ? shiftsState : []
  const [users, setUsers] = useState<UserData[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [formData, setFormData] = useState({
    vehicle: '',
    driver: '',
    start_at: '',
    end_at: '',
    status: 'ACTIVE',
    notes: '',
    start_lat: '',
    start_lng: '',
    start_address: '',
    end_lat: '',
    end_lng: '',
    end_address: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchShifts())
    fetchUsers()
    fetchVehicles()
  }, [dispatch])

  const fetchUsers = async () => {
    try {
      const data = await apiClient('/account/users/?page_size=100')
      const results = extractResults<UserData>(data)
      setUsers(results.filter(u => u.role === 'driver'))
    } catch (err) {
      console.error('Error fetching users:', err)
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

  const handleOpenCreateDialog = () => {
    setSelectedShift(null)
    setFormData({
      vehicle: '',
      driver: '',
      start_at: new Date().toISOString().slice(0, 16),
      end_at: '',
      status: 'ACTIVE',
      notes: '',
      start_lat: '',
      start_lng: '',
      start_address: '',
      end_lat: '',
      end_lng: '',
      end_address: '',
    })
    setFormError(null)
    setIsAddModalOpen(true)
  }

  const handleOpenEditDialog = (shift: Shift) => {
    setSelectedShift(shift)
    setFormData({
      vehicle: shift.vehicle.toString(),
      driver: shift.driver.toString(),
      start_at: shift.start_at ? new Date(shift.start_at).toISOString().slice(0, 16) : '',
      end_at: shift.end_at ? new Date(shift.end_at).toISOString().slice(0, 16) : '',
      status: shift.status,
      notes: shift.notes || '',
      start_lat: shift.start_lat?.toString() || '',
      start_lng: shift.start_lng?.toString() || '',
      start_address: shift.start_address || '',
      end_lat: shift.end_lat?.toString() || '',
      end_lng: shift.end_lng?.toString() || '',
      end_address: shift.end_address || '',
    })
    setFormError(null)
    setIsEditModalOpen(true)
  }

  const handleOpenDeleteDialog = (shift: Shift) => {
    setSelectedShift(shift)
    setFormError(null)
    setIsDeleteModalOpen(true)
  }

  const handleAddShift = async () => {
    if (!formData.vehicle || !formData.driver || !formData.start_at) {
      setFormError('Vehicle, driver, and start time are required')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      const shiftData = {
        vehicle: parseInt(formData.vehicle),
        driver: parseInt(formData.driver),
        start_at: formData.start_at,
        end_at: formData.end_at || undefined,
        status: formData.status as Shift['status'],
        notes: formData.notes || undefined,
        start_lat: formData.start_lat ? parseFloat(formData.start_lat) : undefined,
        start_lng: formData.start_lng ? parseFloat(formData.start_lng) : undefined,
        start_address: formData.start_address || undefined,
        end_lat: formData.end_lat ? parseFloat(formData.end_lat) : undefined,
        end_lng: formData.end_lng ? parseFloat(formData.end_lng) : undefined,
        end_address: formData.end_address || undefined,
      }
      
      await dispatch(createShift(shiftData)).unwrap()
      setIsAddModalOpen(false)
      dispatch(fetchShifts())
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.detail || error?.message || 'Failed to create shift'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateShift = async () => {
    if (!selectedShift) return

    if (!formData.vehicle || !formData.driver || !formData.start_at) {
      setFormError('Vehicle, driver, and start time are required')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      const shiftData = {
        vehicle: parseInt(formData.vehicle),
        driver: parseInt(formData.driver),
        start_at: formData.start_at,
        end_at: formData.end_at || undefined,
        status: formData.status as Shift['status'],
        notes: formData.notes || undefined,
        start_lat: formData.start_lat ? parseFloat(formData.start_lat) : undefined,
        start_lng: formData.start_lng ? parseFloat(formData.start_lng) : undefined,
        start_address: formData.start_address || undefined,
        end_lat: formData.end_lat ? parseFloat(formData.end_lat) : undefined,
        end_lng: formData.end_lng ? parseFloat(formData.end_lng) : undefined,
        end_address: formData.end_address || undefined,
      }
      
      await dispatch(updateShift({ id: selectedShift.id, data: shiftData })).unwrap()
      setIsEditModalOpen(false)
      dispatch(fetchShifts())
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.detail || error?.message || 'Failed to update shift'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteShift = async () => {
    if (!selectedShift) return

    setIsSubmitting(true)
    setFormError(null)
    try {
      await dispatch(deleteShift(selectedShift.id)).unwrap()
      setIsDeleteModalOpen(false)
      dispatch(fetchShifts())
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.detail || error?.message || 'Failed to delete shift'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 rounded-2xl border border-gray-200/60 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Shift Management
            </h1>
            <p className="text-gray-600 text-base sm:text-lg font-medium">
              Manage driver shifts and track work schedules
            </p>
          </div>
          <Button 
            onClick={handleOpenCreateDialog}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold px-6 py-3 h-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Shift
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
                Total Shifts
              </CardTitle>
              <div className="p-2.5 bg-blue-50 rounded-xl shadow-md">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : shifts.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Active Shifts
              </CardTitle>
              <div className="p-2.5 bg-green-50 rounded-xl shadow-md">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : shifts.filter(s => s.status === 'ACTIVE').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Completed
              </CardTitle>
              <div className="p-2.5 bg-blue-50 rounded-xl shadow-md">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : shifts.filter(s => s.status === 'COMPLETED').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Drivers
              </CardTitle>
              <div className="p-2.5 bg-purple-50 rounded-xl shadow-md">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : new Set(shifts.map(s => {
                  const driverId = typeof s.driver === 'object' && s.driver !== null && 'id' in s.driver 
                    ? s.driver.id 
                    : (typeof s.driver === 'number' ? s.driver : null);
                  return driverId;
                }).filter(id => id !== null)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shifts List */}
        <Card className="border border-gray-200/80 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold">Shifts</CardTitle>
            <CardDescription>View and manage all driver shifts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={`skeleton-${i}`} className="h-24 w-full" />
                ))}
              </div>
            ) : shifts.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No shifts found</p>
                <Button onClick={handleOpenCreateDialog} className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Shift
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {shifts.map((shift) => (
                  <Card key={`shift-${shift.id}`} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <User className="h-5 w-5 text-blue-600" />
                              <h3 className="font-bold text-lg">{shift.driver_name || shift.driver_username}</h3>
                            </div>
                            <Badge className={getStatusBadge(shift.status)}>
                              {shift.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Truck className="h-4 w-4" />
                              <span>{shift.vehicle_reg}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(shift.start_at).toLocaleString()}</span>
                            </div>
                            {shift.end_at && (
                              <span>End: {new Date(shift.end_at).toLocaleString()}</span>
                            )}
                            {shift.duration && (
                              <span>Duration: {shift.duration}</span>
                            )}
                          </div>
                          {shift.notes && (
                            <p className="text-sm text-gray-600 line-clamp-2">{shift.notes}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {shift.start_address && <span>Start: {shift.start_address}</span>}
                            {shift.end_address && <span>End: {shift.end_address}</span>}
                            {shift.inspection_count > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {shift.inspection_count} inspections
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(shift)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDeleteDialog(shift)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Shift Dialog */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Shift</DialogTitle>
              <DialogDescription>Create a new driver shift</DialogDescription>
            </DialogHeader>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {formError}
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vehicle">Vehicle *</Label>
                  <Select value={formData.vehicle} onValueChange={(value) => setFormData({ ...formData, vehicle: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.reg_number} - {v.make} {v.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="driver">Driver *</Label>
                  <Select value={formData.driver} onValueChange={(value) => setFormData({ ...formData, driver: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.full_name || u.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_at">Start Time *</Label>
                  <Input
                    id="start_at"
                    type="datetime-local"
                    value={formData.start_at}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_at">End Time</Label>
                  <Input
                    id="end_at"
                    type="datetime-local"
                    value={formData.end_at}
                    onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <LocationPicker
                label="Start Location"
                lat={formData.start_lat ? parseFloat(formData.start_lat) : null}
                lng={formData.start_lng ? parseFloat(formData.start_lng) : null}
                address={formData.start_address}
                onLocationChange={(lat, lng, address) => {
                  setFormData({
                    ...formData,
                    start_lat: lat !== null ? lat.toString() : '',
                    start_lng: lng !== null ? lng.toString() : '',
                    start_address: address,
                  })
                }}
              />
              <LocationPicker
                label="End Location (Optional)"
                lat={formData.end_lat ? parseFloat(formData.end_lat) : null}
                lng={formData.end_lng ? parseFloat(formData.end_lng) : null}
                address={formData.end_address}
                onLocationChange={(lat, lng, address) => {
                  setFormData({
                    ...formData,
                    end_lat: lat !== null ? lat.toString() : '',
                    end_lng: lng !== null ? lng.toString() : '',
                    end_address: address,
                  })
                }}
              />
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Shift notes"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddShift} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Shift'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Shift Dialog - Same structure as Add */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Shift</DialogTitle>
              <DialogDescription>Update shift information</DialogDescription>
            </DialogHeader>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {formError}
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-vehicle">Vehicle *</Label>
                  <Select value={formData.vehicle} onValueChange={(value) => setFormData({ ...formData, vehicle: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.reg_number} - {v.make} {v.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-driver">Driver *</Label>
                  <Select value={formData.driver} onValueChange={(value) => setFormData({ ...formData, driver: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.full_name || u.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-start_at">Start Time *</Label>
                  <Input
                    id="edit-start_at"
                    type="datetime-local"
                    value={formData.start_at}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-end_at">End Time</Label>
                  <Input
                    id="edit-end_at"
                    type="datetime-local"
                    value={formData.end_at}
                    onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <LocationPicker
                label="Start Location"
                lat={formData.start_lat ? parseFloat(formData.start_lat) : null}
                lng={formData.start_lng ? parseFloat(formData.start_lng) : null}
                address={formData.start_address}
                onLocationChange={(lat, lng, address) => {
                  setFormData({
                    ...formData,
                    start_lat: lat !== null ? lat.toString() : '',
                    start_lng: lng !== null ? lng.toString() : '',
                    start_address: address,
                  })
                }}
              />
              <LocationPicker
                label="End Location (Optional)"
                lat={formData.end_lat ? parseFloat(formData.end_lat) : null}
                lng={formData.end_lng ? parseFloat(formData.end_lng) : null}
                address={formData.end_address}
                onLocationChange={(lat, lng, address) => {
                  setFormData({
                    ...formData,
                    end_lat: lat !== null ? lat.toString() : '',
                    end_lng: lng !== null ? lng.toString() : '',
                    end_address: address,
                  })
                }}
              />
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateShift} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Shift'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Shift Dialog */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Shift</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this shift? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {formError}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDeleteShift} disabled={isSubmitting} variant="destructive">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Shift'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

