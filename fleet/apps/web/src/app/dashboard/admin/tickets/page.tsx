"use client"

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchTickets, createTicket, updateTicket, deleteTicket, Ticket } from '@/store/slices/ticketsSlice'
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
  Ticket as TicketIcon,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { ticketAPI } from '@/lib/api'

export default function AdminTicketsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { tickets: ticketsState, loading, error } = useSelector((state: RootState) => state.tickets)
  // Ensure tickets is always an array
  const tickets = Array.isArray(ticketsState) ? ticketsState : []
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [formData, setFormData] = useState({
    issue: '',
    assignee: '',
    title: '',
    description: '',
    type: 'REPAIR',
    priority: 'MEDIUM',
    status: 'OPEN',
    due_at: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchTickets())
  }, [dispatch])

  const handleOpenCreateDialog = () => {
    setSelectedTicket(null)
    setFormData({
      issue: '',
      assignee: '',
      title: '',
      description: '',
      type: 'REPAIR',
      priority: 'MEDIUM',
      status: 'OPEN',
      due_at: '',
    })
    setFormError(null)
    setIsAddModalOpen(true)
  }

  const handleOpenEditDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setFormData({
      issue: (ticket as any).issue?.toString() || '',
      assignee: (ticket as any).assignee?.toString() || '',
      title: (ticket as any).title || '',
      description: (ticket as any).description || '',
      type: (ticket as any).type || 'REPAIR',
      priority: ticket.priority,
      status: ticket.status,
      due_at: ticket.due_at ? new Date(ticket.due_at).toISOString().slice(0, 16) : '',
    })
    setFormError(null)
    setIsEditModalOpen(true)
  }

  const handleOpenDeleteDialog = async (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setFormError(null)
    setIsDeleteModalOpen(true)
  }

  const handleAddTicket = async () => {
    if (!formData.issue || !formData.title || !formData.description) {
      setFormError('Issue, title, and description are required')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      const ticketData: Partial<Ticket> = {
        issue: parseInt(formData.issue),
        assignee: formData.assignee ? parseInt(formData.assignee) : undefined,
        title: formData.title,
        description: formData.description,
        type: formData.type as Ticket['type'],
        priority: formData.priority as Ticket['priority'],
        status: formData.status as Ticket['status'],
        due_at: formData.due_at || undefined,
      }
      
      await dispatch(createTicket(ticketData)).unwrap()
      setIsAddModalOpen(false)
      dispatch(fetchTickets())
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.detail || error?.message || 'Failed to create ticket'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return

    if (!formData.title || !formData.description) {
      setFormError('Title and description are required')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      const ticketData: Partial<Ticket> = {
        assignee: formData.assignee ? parseInt(formData.assignee) : undefined,
        title: formData.title,
        description: formData.description,
        type: formData.type as Ticket['type'],
        priority: formData.priority as Ticket['priority'],
        status: formData.status as Ticket['status'],
        due_at: formData.due_at || undefined,
      }
      
      await dispatch(updateTicket({ id: selectedTicket.id, data: ticketData })).unwrap()
      setIsEditModalOpen(false)
      dispatch(fetchTickets())
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.detail || error?.message || 'Failed to update ticket'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return

    setIsSubmitting(true)
    setFormError(null)
    try {
      await dispatch(deleteTicket(selectedTicket.id)).unwrap()
      setIsDeleteModalOpen(false)
      dispatch(fetchTickets())
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.detail || error?.message || 'Failed to delete ticket'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      OPEN: 'bg-blue-100 text-blue-800 border-blue-200',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PENDING_PARTS: 'bg-orange-100 text-orange-800 border-orange-200',
      PENDING_APPROVAL: 'bg-purple-100 text-purple-800 border-purple-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadge = (priority: string) => {
    const badges = {
      LOW: 'bg-gray-100 text-gray-800 border-gray-200',
      MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      URGENT: 'bg-red-100 text-red-800 border-red-200',
      CRITICAL: 'bg-red-200 text-red-900 border-red-300',
    }
    return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 rounded-2xl border border-gray-200/60 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Ticket Management
            </h1>
            <p className="text-gray-600 text-base sm:text-lg font-medium">
              Manage maintenance tickets for your fleet
            </p>
          </div>
          <Button 
            onClick={handleOpenCreateDialog}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold px-6 py-3 h-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Ticket
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
                onClick={() => dispatch(fetchTickets())}
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
                Total Tickets
              </CardTitle>
              <div className="p-2.5 bg-blue-50 rounded-xl shadow-md">
                <TicketIcon className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : tickets.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Open Tickets
              </CardTitle>
              <div className="p-2.5 bg-green-50 rounded-xl shadow-md">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : tickets.filter(t => t.status === 'OPEN').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Urgent
              </CardTitle>
              <div className="p-2.5 bg-red-50 rounded-xl shadow-md">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : tickets.filter(t => t.priority === 'URGENT' || t.priority === 'CRITICAL').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Completed
              </CardTitle>
              <div className="p-2.5 bg-green-50 rounded-xl shadow-md">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loading ? <Skeleton className="h-10 w-20" /> : tickets.filter(t => t.status === 'COMPLETED' || t.status === 'CLOSED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <Card className="border border-gray-200/80 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold">Tickets</CardTitle>
            <CardDescription>View and manage all maintenance tickets</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No tickets found</p>
                <Button onClick={handleOpenCreateDialog} className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg">{(ticket as any).title || `Ticket #${ticket.id}`}</h3>
                            <Badge className={getStatusBadge(ticket.status)}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityBadge(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {(ticket as any).description || 'No description'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Issue: #{(ticket as any).issue}</span>
                            {ticket.due_at && (
                              <span>Due: {new Date(ticket.due_at).toLocaleDateString()}</span>
                            )}
                            <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(ticket)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDeleteDialog(ticket)}
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

        {/* Add Ticket Dialog */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Ticket</DialogTitle>
              <DialogDescription>Create a new maintenance ticket</DialogDescription>
            </DialogHeader>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {formError}
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="issue">Issue ID *</Label>
                <Input
                  id="issue"
                  type="number"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  placeholder="Issue ID"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ticket title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ticket description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REPAIR">Repair</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="INSPECTION">Inspection</SelectItem>
                      <SelectItem value="CLEANING">Cleaning</SelectItem>
                      <SelectItem value="UPGRADE">Upgrade</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="PENDING_PARTS">Pending Parts</SelectItem>
                      <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="due_at">Due Date</Label>
                  <Input
                    id="due_at"
                    type="datetime-local"
                    value={formData.due_at}
                    onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignee">Assignee ID (optional)</Label>
                <Input
                  id="assignee"
                  type="number"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="User ID"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTicket} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Ticket Dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Ticket</DialogTitle>
              <DialogDescription>Update ticket information</DialogDescription>
            </DialogHeader>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {formError}
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REPAIR">Repair</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="INSPECTION">Inspection</SelectItem>
                      <SelectItem value="CLEANING">Cleaning</SelectItem>
                      <SelectItem value="UPGRADE">Upgrade</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="PENDING_PARTS">Pending Parts</SelectItem>
                      <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-due_at">Due Date</Label>
                  <Input
                    id="edit-due_at"
                    type="datetime-local"
                    value={formData.due_at}
                    onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTicket} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Ticket'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Ticket Dialog */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Ticket</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this ticket? This action cannot be undone.
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
              <Button onClick={handleDeleteTicket} disabled={isSubmitting} variant="destructive">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Ticket'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

