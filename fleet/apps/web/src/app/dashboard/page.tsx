"use client"

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
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
  Activity,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { COLORS } from '@/utils/colors'

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { stats, loading, error } = useSelector((state: RootState) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-vehicle':
        router.push('/dashboard/vehicles')
        break
      case 'start-shift':
        router.push('/dashboard/shifts')
        break
      case 'new-inspection':
        router.push('/dashboard/inspections')
        break
      case 'report-issue':
        router.push('/dashboard/issues')
        break
      default:
        break
    }
  }

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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className={`bg-gradient-to-r ${COLORS.primary.from} ${COLORS.primary.to} rounded-lg p-6 text-white shadow-lg`}>
          <h1 className="text-2xl font-bold mb-2">
            Dashboard
          </h1>
          <p className="text-blue-100">
            Welcome back! Here's an overview of your fleet management system
          </p>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm group-hover:shadow-md transition-shadow`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-3 w-3 text-gray-400" />
                  <p className="text-xs font-medium text-gray-600">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="hover:shadow-lg transition-shadow border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Quick Actions</CardTitle>
              <CardDescription className="text-base mt-1">
                Common tasks and operations at your fingertips
              </CardDescription>
            </div>
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              onClick={() => handleQuickAction('add-vehicle')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all"></div>
              <Truck className="h-7 w-7 text-blue-600 group-hover:scale-110 transition-transform relative z-10" />
              <span className="font-semibold text-gray-700 relative z-10">Add Vehicle</span>
              <ArrowRight className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-3 relative z-10" />
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 hover:border-green-400 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              onClick={() => handleQuickAction('start-shift')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/10 transition-all"></div>
              <Users className="h-7 w-7 text-green-600 group-hover:scale-110 transition-transform relative z-10" />
              <span className="font-semibold text-gray-700 relative z-10">Start Shift</span>
              <ArrowRight className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-3 relative z-10" />
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 hover:border-purple-400 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              onClick={() => handleQuickAction('new-inspection')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all"></div>
              <CheckCircle className="h-7 w-7 text-purple-600 group-hover:scale-110 transition-transform relative z-10" />
              <span className="font-semibold text-gray-700 relative z-10">New Inspection</span>
              <ArrowRight className="h-4 w-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-3 relative z-10" />
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 hover:border-red-400 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              onClick={() => handleQuickAction('report-issue')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-red-500/10 transition-all"></div>
              <AlertTriangle className="h-7 w-7 text-red-600 group-hover:scale-110 transition-transform relative z-10" />
              <span className="font-semibold text-gray-700 relative z-10">Report Issue</span>
              <ArrowRight className="h-4 w-4 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-3 relative z-10" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="hover:shadow-lg transition-shadow border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Recent Activity</CardTitle>
              <CardDescription className="text-base mt-1">
                Latest updates and events in your fleet
              </CardDescription>
            </div>
            <Clock className="h-6 w-6 text-gray-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer border-l-4 border-green-500">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-2 shadow-lg shadow-green-500/50"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  Vehicle ABC123 inspection completed
                </p>
                <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer border-l-4 border-red-500">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-2 shadow-lg shadow-red-500/50"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                  Critical issue reported for Vehicle XYZ789
                </p>
                <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer border-l-4 border-blue-500">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 shadow-lg shadow-blue-500/50"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  New shift started for Driver John Doe
                </p>
                <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
