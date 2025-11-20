'use client'

import React, { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  BarChart3, 
  FileText, 
  Download, 
  TrendingUp, 
  Users, 
  Truck, 
  Shield, 
  AlertTriangle,
  Calendar,
  Clock,
  Activity,
  PieChart,
  LineChart,
  Loader2
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/components/ui/chart'
import { apiClient } from '@/lib/apiClient'
import { API_CONFIG } from '@/config/api'
import { useAppSelector } from '@/store/hooks'

interface ReportStats {
  vehicles: {
    total: number
    active: number
    maintenance: number
    retired: number
    byStatus: { status: string; count: number }[]
  }
  shifts: {
    total: number
    active: number
    completed: number
    byDay: { day: string; count: number }[]
    byStatus: { status: string; count: number }[]
  }
  inspections: {
    total: number
    passed: number
    failed: number
    byDay: { day: string; count: number }[]
    byResult: { result: string; count: number }[]
  }
  tickets: {
    total: number
    open: number
    resolved: number
    byPriority: { priority: string; count: number }[]
    byStatus: { status: string; count: number }[]
  }
  issues: {
    total: number
    open: number
    resolved: number
    bySeverity: { severity: string; count: number }[]
  }
  users: {
    total: number
    active: number
    byRole: { role: string; count: number }[]
  }
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
}

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
  '#ec4899',
  '#14b8a6',
]

export default function AdminReportsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [vehiclesRes, shiftsRes, inspectionsRes, ticketsRes, issuesRes, usersRes] = await Promise.allSettled([
        apiClient(API_CONFIG.ENDPOINTS.VEHICLES.LIST),
        apiClient(API_CONFIG.ENDPOINTS.SHIFTS.LIST),
        apiClient(API_CONFIG.ENDPOINTS.INSPECTIONS.LIST),
        apiClient(API_CONFIG.ENDPOINTS.TICKETS.LIST),
        apiClient(API_CONFIG.ENDPOINTS.ISSUES.LIST),
        apiClient('account/users/'),
      ])

      const vehicles = vehiclesRes.status === 'fulfilled' ? extractResults(vehiclesRes.value) : []
      const shifts = shiftsRes.status === 'fulfilled' ? extractResults(shiftsRes.value) : []
      const inspections = inspectionsRes.status === 'fulfilled' ? extractResults(inspectionsRes.value) : []
      const tickets = ticketsRes.status === 'fulfilled' ? extractResults(ticketsRes.value) : []
      const issues = issuesRes.status === 'fulfilled' ? extractResults(issuesRes.value) : []
      const users = usersRes.status === 'fulfilled' ? extractResults(usersRes.value) : []

      // Process data
      const processedStats = processReportData({
        vehicles,
        shifts,
        inspections,
        tickets,
        issues,
        users,
        dateRange,
      })

      setStats(processedStats)
    } catch (err: any) {
      console.error('Error fetching report data:', err)
      setError(err.message || 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const vehicleStatusConfig: ChartConfig = {
    active: { label: 'Active', color: COLORS.success },
    maintenance: { label: 'Maintenance', color: COLORS.warning },
    retired: { label: 'Retired', color: COLORS.danger },
    inactive: { label: 'Inactive', color: '#6b7280' },
  }

  const shiftStatusConfig: ChartConfig = {
    active: { label: 'Active', color: COLORS.primary },
    completed: { label: 'Completed', color: COLORS.success },
    cancelled: { label: 'Cancelled', color: COLORS.danger },
  }

  const inspectionResultConfig: ChartConfig = {
    passed: { label: 'Passed', color: COLORS.success },
    failed: { label: 'Failed', color: COLORS.danger },
    in_progress: { label: 'In Progress', color: COLORS.warning },
  }

  const handleExport = (type: string, format: 'csv' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting ${type} as ${format}`)
    alert(`Exporting ${type} as ${format}... (Feature coming soon)`)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Error Loading Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchReportData}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive fleet management insights</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Vehicles</p>
                  <p className="text-2xl font-bold mt-1">{stats.vehicles.total}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.vehicles.active} active
                  </p>
                </div>
                <Truck className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Shifts</p>
                  <p className="text-2xl font-bold mt-1">{stats.shifts.total}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {stats.shifts.active} active
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inspections</p>
                  <p className="text-2xl font-bold mt-1">{stats.inspections.total}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.inspections.passed} passed
                  </p>
                </div>
                <Shield className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Tickets</p>
                  <p className="text-2xl font-bold mt-1">{stats.tickets.open}</p>
                  <p className="text-xs text-orange-600 mt-1">
                    {stats.tickets.resolved} resolved
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Status Pie Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vehicle Status Distribution</CardTitle>
                  <CardDescription>Breakdown of vehicle statuses</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('vehicles', 'csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={vehicleStatusConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={stats.vehicles.byStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.vehicles.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Shifts Over Time */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Shifts Activity</CardTitle>
                  <CardDescription>Daily shift activity over time</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('shifts', 'csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={shiftStatusConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={stats.shifts.byDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      name="Shifts"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inspections Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inspection Results</CardTitle>
                  <CardDescription>Pass/fail breakdown</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('inspections', 'csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={inspectionResultConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.inspections.byResult}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="result" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="count" fill={COLORS.success} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Tickets by Priority */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tickets by Priority</CardTitle>
                  <CardDescription>Distribution of ticket priorities</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('tickets', 'csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  critical: { label: 'Critical', color: COLORS.danger },
                  high: { label: 'High', color: COLORS.warning },
                  medium: { label: 'Medium', color: COLORS.info },
                  low: { label: 'Low', color: COLORS.success },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.tickets.byPriority}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="count" fill={COLORS.warning} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Reports</CardTitle>
            <CardDescription>Download comprehensive reports in various formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => handleExport('vehicles', 'csv')}
              >
                <Truck className="w-5 h-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold">Vehicle Report</div>
                  <div className="text-xs text-gray-600">Complete vehicle inventory</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => handleExport('users', 'csv')}
              >
                <Users className="w-5 h-5 mr-3 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold">User Report</div>
                  <div className="text-xs text-gray-600">User list and activity</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => handleExport('inspections', 'csv')}
              >
                <Shield className="w-5 h-5 mr-3 text-purple-600" />
                <div className="text-left">
                  <div className="font-semibold">Inspection Report</div>
                  <div className="text-xs text-gray-600">Inspection history</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => handleExport('tickets', 'csv')}
              >
                <AlertTriangle className="w-5 h-5 mr-3 text-orange-600" />
                <div className="text-left">
                  <div className="font-semibold">Ticket Report</div>
                  <div className="text-xs text-gray-600">Ticket status and resolution</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => handleExport('shifts', 'csv')}
              >
                <TrendingUp className="w-5 h-5 mr-3 text-indigo-600" />
                <div className="text-left">
                  <div className="font-semibold">Shift Report</div>
                  <div className="text-xs text-gray-600">Shift history and activity</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => handleExport('comprehensive', 'pdf')}
              >
                <FileText className="w-5 h-5 mr-3 text-red-600" />
                <div className="text-left">
                  <div className="font-semibold">Comprehensive Report</div>
                  <div className="text-xs text-gray-600">All fleet data in PDF</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

// Helper function to extract results from paginated API responses
function extractResults(data: any): any[] {
  if (Array.isArray(data)) return data
  if (data?.results && Array.isArray(data.results)) return data.results
  return []
}

// Process and aggregate report data
function processReportData(data: {
  vehicles: any[]
  shifts: any[]
  inspections: any[]
  tickets: any[]
  issues: any[]
  users: any[]
  dateRange: string
}): ReportStats {
  const { vehicles, shifts, inspections, tickets, issues, users, dateRange } = data

  // Filter by date range
  const dateFilter = getDateFilter(dateRange)

  // Process vehicles
  const vehicleStatusCounts: Record<string, number> = {}
  vehicles.forEach((v) => {
    const status = v.status?.toLowerCase() || 'unknown'
    vehicleStatusCounts[status] = (vehicleStatusCounts[status] || 0) + 1
  })

  // Process shifts
  const filteredShifts = shifts.filter((s) => dateFilter(new Date(s.start_at || s.created_at)))
  const shiftStatusCounts: Record<string, number> = {}
  const shiftsByDay: Record<string, number> = {}
  
  filteredShifts.forEach((s) => {
    const status = s.status?.toLowerCase() || 'unknown'
    shiftStatusCounts[status] = (shiftStatusCounts[status] || 0) + 1
    
    const day = new Date(s.start_at || s.created_at).toLocaleDateString('en-US', { weekday: 'short' })
    shiftsByDay[day] = (shiftsByDay[day] || 0) + 1
  })

  // Process inspections
  const filteredInspections = inspections.filter((i) => dateFilter(new Date(i.started_at || i.created_at)))
  const inspectionResults: Record<string, number> = {}
  const inspectionsByDay: Record<string, number> = {}
  
  filteredInspections.forEach((i) => {
    const result = i.status?.toLowerCase() || 'unknown'
    inspectionResults[result] = (inspectionResults[result] || 0) + 1
    
    const day = new Date(i.started_at || i.created_at).toLocaleDateString('en-US', { weekday: 'short' })
    inspectionsByDay[day] = (inspectionsByDay[day] || 0) + 1
  })

  // Process tickets
  const filteredTickets = tickets.filter((t) => dateFilter(new Date(t.created_at)))
  const ticketPriorities: Record<string, number> = {}
  const ticketStatuses: Record<string, number> = {}
  
  filteredTickets.forEach((t) => {
    const priority = t.priority?.toLowerCase() || 'unknown'
    const status = t.status?.toLowerCase() || 'unknown'
    ticketPriorities[priority] = (ticketPriorities[priority] || 0) + 1
    ticketStatuses[status] = (ticketStatuses[status] || 0) + 1
  })

  // Process issues
  const filteredIssues = issues.filter((i) => dateFilter(new Date(i.reported_at || i.created_at)))
  const issueSeverities: Record<string, number> = {}
  
  filteredIssues.forEach((i) => {
    const severity = i.severity?.toLowerCase() || 'unknown'
    issueSeverities[severity] = (issueSeverities[severity] || 0) + 1
  })

  // Process users
  const usersByRole: Record<string, number> = {}
  users.forEach((u) => {
    const role = u.role?.toLowerCase() || 'unknown'
    usersByRole[role] = (usersByRole[role] || 0) + 1
  })

  return {
    vehicles: {
      total: vehicles.length,
      active: vehicleStatusCounts.active || 0,
      maintenance: vehicleStatusCounts.maintenance || 0,
      retired: vehicleStatusCounts.retired || 0,
      byStatus: Object.entries(vehicleStatusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      })),
    },
    shifts: {
      total: shifts.length,
      active: shiftStatusCounts.active || 0,
      completed: shiftStatusCounts.completed || 0,
      byDay: Object.entries(shiftsByDay).map(([day, count]) => ({ day, count })),
      byStatus: Object.entries(shiftStatusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      })),
    },
    inspections: {
      total: inspections.length,
      passed: inspectionResults.pass || 0,
      failed: inspectionResults.fail || 0,
      byDay: Object.entries(inspectionsByDay).map(([day, count]) => ({ day, count })),
      byResult: Object.entries(inspectionResults).map(([result, count]) => ({
        result: result.charAt(0).toUpperCase() + result.slice(1).replace('_', ' '),
        count,
      })),
    },
    tickets: {
      total: tickets.length,
      open: ticketStatuses.open || 0,
      resolved: ticketStatuses.resolved || 0,
      byPriority: Object.entries(ticketPriorities).map(([priority, count]) => ({
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        count,
      })),
      byStatus: Object.entries(ticketStatuses).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      })),
    },
    issues: {
      total: issues.length,
      open: ticketStatuses.open || 0, // Assuming similar structure
      resolved: ticketStatuses.resolved || 0,
      bySeverity: Object.entries(issueSeverities).map(([severity, count]) => ({
        severity: severity.charAt(0).toUpperCase() + severity.slice(1),
        count,
      })),
    },
    users: {
      total: users.length,
      active: users.length, // TODO: Add active user tracking
      byRole: Object.entries(usersByRole).map(([role, count]) => ({
        role: role.charAt(0).toUpperCase() + role.slice(1),
        count,
      })),
    },
  }
}

function getDateFilter(range: string): (date: Date) => boolean {
  const now = new Date()
  let cutoff: Date

  switch (range) {
    case '7d':
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    default:
      return () => true // All time
  }

  return (date: Date) => date >= cutoff
}
