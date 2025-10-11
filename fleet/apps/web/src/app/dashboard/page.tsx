"use client"

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchDashboardStats } from '@/store/slices/dashboardSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Truck, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react'

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { stats, loading, error } = useSelector((state: RootState) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => dispatch(fetchDashboardStats())}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Dashboard statistics are not available.</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Vehicles",
      value: stats.total_vehicles,
      description: `${stats.active_vehicles} active`,
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Shifts",
      value: stats.active_shifts,
      description: `${stats.completed_shifts_today} completed today`,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Open Issues",
      value: stats.open_issues,
      description: `${stats.critical_issues} critical`,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Open Tickets",
      value: stats.open_tickets,
      description: `${stats.overdue_tickets} overdue`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Inspections Today",
      value: stats.inspections_today,
      description: `${stats.failed_inspections_today} failed`,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Notifications",
      value: stats.unread_notifications,
      description: `${stats.urgent_notifications} urgent`,
      icon: Activity,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your fleet management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Truck className="h-6 w-6 mb-2" />
              <span>Add Vehicle</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Users className="h-6 w-6 mb-2" />
              <span>Start Shift</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <CheckCircle className="h-6 w-6 mb-2" />
              <span>New Inspection</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <AlertTriangle className="h-6 w-6 mb-2" />
              <span>Report Issue</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Vehicle ABC123 inspection completed</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Critical issue reported for Vehicle XYZ789</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New shift started for Driver John Doe</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
