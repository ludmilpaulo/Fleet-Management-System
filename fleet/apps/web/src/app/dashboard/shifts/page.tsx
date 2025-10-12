'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, Clock, MapPin, User, Car, Filter, Search } from 'lucide-react'
import { format } from 'date-fns'

interface Shift {
  id: string
  vehicle: {
    reg_number: string
    make: string
    model: string
  }
  driver: {
    username: string
    full_name: string
  }
  start_at: string
  end_at?: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  start_address: string
  end_address?: string
  notes?: string
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([])

  useEffect(() => {
    fetchShifts()
  }, [])

  useEffect(() => {
    filterShifts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shifts, searchTerm, statusFilter])

  const fetchShifts = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockShifts: Shift[] = [
        {
          id: '1',
          vehicle: { reg_number: 'ABC123', make: 'Toyota', model: 'Camry' },
          driver: { username: 'johndoe', full_name: 'John Doe' },
          start_at: '2024-01-15T08:00:00Z',
          end_at: '2024-01-15T17:00:00Z',
          status: 'COMPLETED',
          start_address: '123 Main St, City',
          end_address: '456 Oak Ave, City',
          notes: 'Regular shift completed successfully'
        },
        {
          id: '2',
          vehicle: { reg_number: 'XYZ789', make: 'Honda', model: 'Civic' },
          driver: { username: 'janedoe', full_name: 'Jane Doe' },
          start_at: '2024-01-15T09:00:00Z',
          status: 'ACTIVE',
          start_address: '789 Pine St, City',
          notes: 'Morning shift in progress'
        },
        {
          id: '3',
          vehicle: { reg_number: 'DEF456', make: 'Ford', model: 'Transit' },
          driver: { username: 'bobsmith', full_name: 'Bob Smith' },
          start_at: '2024-01-14T14:00:00Z',
          end_at: '2024-01-14T22:00:00Z',
          status: 'CANCELLED',
          start_address: '321 Elm St, City',
          notes: 'Shift cancelled due to vehicle maintenance'
        }
      ]
      
      setShifts(mockShifts)
    } catch (error) {
      console.error('Error fetching shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterShifts = () => {
    let filtered = shifts

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(shift =>
        shift.vehicle.reg_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.start_address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shift => shift.status === statusFilter)
    }

    setFilteredShifts(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active'
      case 'COMPLETED': return 'Completed'
      case 'CANCELLED': return 'Cancelled'
      default: return status
    }
  }

  const formatDuration = (startAt: string, endAt?: string) => {
    if (!endAt) return 'In Progress'
    
    const start = new Date(startAt)
    const end = new Date(endAt)
    const duration = end.getTime() - start.getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  const activeShifts = shifts.filter(s => s.status === 'ACTIVE').length
  const completedToday = shifts.filter(s => 
    s.status === 'COMPLETED' && 
    new Date(s.start_at).toDateString() === new Date().toDateString()
  ).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Shifts</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shifts</h1>
          <p className="text-gray-600">Manage driver shifts and assignments</p>
        </div>
        <Button>
          <Clock className="w-4 h-4 mr-2" />
          Start New Shift
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeShifts}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
            <p className="text-xs text-muted-foreground">
              Finished today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shifts.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search shifts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shifts List */}
      <div className="space-y-4">
        {filteredShifts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
              <p className="text-gray-500 text-center">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters to see more shifts.'
                  : 'No shifts have been created yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredShifts.map((shift) => (
            <Card key={shift.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(shift.status)}>
                        {getStatusText(shift.status)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(new Date(shift.start_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {shift.vehicle.reg_number}
                        </span>
                        <span className="text-gray-500">
                          {shift.vehicle.make} {shift.vehicle.model}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{shift.driver.full_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(new Date(shift.start_at), 'HH:mm')} - 
                          {shift.end_at ? format(new Date(shift.end_at), 'HH:mm') : 'In Progress'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span>Duration: {formatDuration(shift.start_at, shift.end_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <div>Start: {shift.start_address}</div>
                        {shift.end_address && (
                          <div>End: {shift.end_address}</div>
                        )}
                      </div>
                    </div>

                    {shift.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        <strong>Notes:</strong> {shift.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {shift.status === 'ACTIVE' && (
                      <Button variant="destructive" size="sm">
                        End Shift
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
