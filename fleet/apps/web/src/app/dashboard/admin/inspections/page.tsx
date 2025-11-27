"use client"

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchInspections, createInspection, updateInspection, deleteInspection, Inspection } from '@/store/slices/inspectionsSlice'
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
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Truck,
  Clock
} from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { fetchShifts, Shift } from '@/store/slices/shiftsSlice'
import { apiClient, extractResults } from '@/lib/apiClient'

export default function AdminInspectionsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { inspections: inspectionsState, loading, error } = useSelector((state: RootState) => state.inspections)
  // Ensure inspections is always an array
  const inspections = Array.isArray(inspectionsState) ? inspectionsState : []
  const { shifts: shiftsState } = useSelector((state: RootState) => state.shifts)
  // Ensure shifts is always an array
  const shifts = Array.isArray(shiftsState) ? shiftsState : []
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [formData, setFormData] = useState({
    shift: '',
    type: 'START',
    status: 'IN_PROGRESS',
    notes: '',
    weather_conditions: '',
    temperature: '',
    lat: '',
    lng: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchInspections())
    dispatch(fetchShifts())
  }, [dispatch])

  const handleOpenCreateDialog = () => {
    setSelectedInspection(null)
    setFormData({
      shift: '',
      type: 'START',
      status: 'IN_PROGRESS',
      notes: '',
      weather_conditions: '',
      temperature: '',
      lat: '',
      lng: '',
    })
    setFormError(null)
    setIsAddModalOpen(true)
  }

  const handleOpenEditDialog = (inspection: Inspection) => {
    setSelectedInspection(inspection)
    setFormData({
      shift: inspection.shift.toString(),
      type: inspection.type,
      status: inspection.status,
      notes: inspection.notes || '',
      weather_conditions: inspection.weather_conditions || '',
      temperature: inspection.temperature?.toString() || '',
      lat: inspection.lat?.toString() || '',
      lng: inspection.lng?.toString() || '',
    })
    setFormError(null)
    setIsEditModalOpen(true)
  }

  const handleOpenDeleteDialog = (inspection: Inspection) => {
    setSelectedInspection(inspection)
    setFormError(null)
    setIsDeleteModalOpen(true)
  }

  const handleAddInspection = async () => {
    if (!formData.shift) {
      setFormError('Shift is required')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      const inspectionData = {
        shift: parseInt(formData.shift),
        type: formData.type as Inspection['type'],
        status: formData.status as Inspection['status'],
        notes: formData.notes || undefined,
        weather_conditions: formData.weather_conditions || undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lng: formData.lng ? parseFloat(formData.lng) : undefined,
      }
      
      await dispatch(createInspection(inspectionData)).unwrap()
      setIsAddModalOpen(false)
      dispatch(fetchInspections())
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.detail || error?.message || 'Failed to create inspection'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateInspection = async () => {
    if (!selectedInspection) return

    setIsSubmitting(true)
    setFormError(null)
    try {
      const inspectionData = {
        type: formData.type as Inspection['type'],
        status: formData.status as Inspection['status'],
        notes: formData.notes || undefined,
        weather_conditions: formData.weather_conditions || undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lng: formData.lng ? parseFloat(formData.lng) : undefined,
      }
      
      await dispatch(updateInspection({ id: selectedInspection.id, data: inspectionData })).unwrap()
      setIsEditModalOpen(false)
      dispatch(fetchInspections())
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.detail || error?.message || 'Failed to update inspection'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteInspection = async () => {
    if (!selectedInspection) return

    setIsSubmitting(true)
    setFormError(null)
    try {
      await dispatch(deleteInspection(selectedInspection.id)).unwrap()
      setIsDeleteModalOpen(false)
      dispatch(fetchInspections())
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.detail || error?.message || 'Failed to delete inspection'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PASS: 'bg-green-100 text-green-800 border-green-200',
      FAIL: 'bg-red-100 text-red-800 border-red-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      START: 'bg-blue-100 text-blue-800 border-blue-200',
      END: 'bg-purple-100 text-purple-800 border-purple-200',
    }
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 rounded-2xl border border-gray-200/60 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Inspection Management
            </h1>
            <p className="text-gray-600 text-base sm:text-lg font-medium">
              Manage vehicle inspections and safety checks
            </p>
          </div>
          <Button 
            onClick={handleOpenCreateDialog}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold px-6 py-3 h-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Inspection
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
                onClick={() => dispatch(fetchInspections())}
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
                Total Inspections
              </CardTitle>
              <div className="p-2.5 bg-blue-50 rounded-xl shadow-md">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : inspections.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                In Progress
              </CardTitle>
              <div className="p-2.5 bg-yellow-50 rounded-xl shadow-md">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : inspections.filter(i => i.status === 'IN_PROGRESS').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Passed
              </CardTitle>
              <div className="p-2.5 bg-green-50 rounded-xl shadow-md">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : inspections.filter(i => i.status === 'PASS').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Failed
              </CardTitle>
              <div className="p-2.5 bg-red-50 rounded-xl shadow-md">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : inspections.filter(i => i.status === 'FAIL').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inspections List */}
        <Card className="border border-gray-200/80 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold">Inspections</CardTitle>
            <CardDescription>View and manage all vehicle inspections</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : inspections.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No inspections found</p>
                <Button onClick={handleOpenCreateDialog} className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Inspection
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {inspections.map((inspection) => {
                  const shift = shifts.find(s => s.id === inspection.shift)
                  return (
                    <Card key={inspection.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <Badge className={getTypeBadge(inspection.type)}>
                                {inspection.type}
                              </Badge>
                              <Badge className={getStatusBadge(inspection.status)}>
                                {inspection.status.replace('_', ' ')}
                              </Badge>
                              {shift && (
                                <>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Truck className="h-4 w-4" />
                                    <span>{shift.vehicle_reg}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <span>{shift.driver_name || shift.driver_username}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Started: {new Date(inspection.started_at).toLocaleString()}</span>
                              {inspection.completed_at && (
                                <span>Completed: {new Date(inspection.completed_at).toLocaleString()}</span>
                              )}
                              {inspection.weather_conditions && (
                                <span>Weather: {inspection.weather_conditions}</span>
                              )}
                              {inspection.temperature && (
                                <span>Temp: {inspection.temperature}°C</span>
                              )}
                            </div>
                            {inspection.notes && (
                              <p className="text-sm text-gray-600 line-clamp-2">{inspection.notes}</p>
                            )}
                            {(inspection as any).items_count > 0 && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{(inspection as any).items_count} items</span>
                                {(inspection as any).failed_items_count > 0 && (
                                  <Badge variant="outline" className="text-xs text-red-600">
                                    {(inspection as any).failed_items_count} failed
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditDialog(inspection)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDeleteDialog(inspection)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

        {/* Add Inspection Dialog */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Inspection</DialogTitle>
              <DialogDescription>Create a new vehicle inspection</DialogDescription>
            </DialogHeader>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {formError}
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="shift">Shift *</Label>
                <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.driver_name || s.driver_username} - {s.vehicle_reg} ({new Date(s.start_at).toLocaleDateString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="START">Start of Shift</SelectItem>
                      <SelectItem value="END">End of Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="PASS">Pass</SelectItem>
                      <SelectItem value="FAIL">Fail</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="weather_conditions">Weather Conditions</Label>
                  <Input
                    id="weather_conditions"
                    value={formData.weather_conditions}
                    onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                    placeholder="e.g., Sunny, Rainy"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="any"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    placeholder="e.g., 25.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="e.g., 40.7128"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="e.g., -74.0060"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Inspection notes"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddInspection} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Inspection'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Inspection Dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Inspection</DialogTitle>
              <DialogDescription>Update inspection information</DialogDescription>
            </DialogHeader>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {formError}
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="START">Start of Shift</SelectItem>
                      <SelectItem value="END">End of Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="PASS">Pass</SelectItem>
                      <SelectItem value="FAIL">Fail</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-weather_conditions">Weather Conditions</Label>
                  <Input
                    id="edit-weather_conditions"
                    value={formData.weather_conditions}
                    onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-temperature">Temperature (°C)</Label>
                  <Input
                    id="edit-temperature"
                    type="number"
                    step="any"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateInspection} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Inspection'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Inspection Dialog */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Inspection</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this inspection? This action cannot be undone.
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
              <Button onClick={handleDeleteInspection} disabled={isSubmitting} variant="destructive">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Inspection'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

