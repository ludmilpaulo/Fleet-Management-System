 "use client"

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { DashboardStats } from '@/store/slices/dashboardSlice'
import { fetchDashboardStats, clearError } from '@/store/slices/dashboardSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import DashboardLayout from '@/components/layout/dashboard-layout'
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

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { stats, loading, error, lastUpdated } = useAppSelector((state) => state.dashboard)
  const { isAuthenticated, isLoading: authLoading, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/signin?redirect=/dashboard')
    }
  }, [authLoading, isAuthenticated, router])

  // Redirect to role-specific dashboard if user is logged in (except admin who can use general dashboard)
  useEffect(() => {
    if (!authLoading && isAuthenticated && user && user.role !== 'admin') {
      const roleSpecificDashboard = `/dashboard/${user.role}`
      // Only redirect non-admin users to their role-specific dashboard
      router.replace(roleSpecificDashboard)
    }
  }, [authLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      dispatch(fetchDashboardStats())
    }
  }, [authLoading, isAuthenticated, dispatch])

  const fallbackStats: DashboardStats = useMemo(() => ({
    total_vehicles: 0,
    active_vehicles: 0,
    maintenance_vehicles: 0,
    active_shifts: 0,
    completed_shifts_today: 0,
    inspections_today: 0,
    failed_inspections_today: 0,
    open_issues: 0,
    critical_issues: 0,
    overdue_issues: 0,
    open_tickets: 0,
    overdue_tickets: 0,
    completed_tickets_today: 0,
    unread_notifications: 0,
    urgent_notifications: 0,
    active_system_alerts: 0,
    critical_system_alerts: 0,
  }), [])

  const currentStats = stats ?? fallbackStats

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

  if (authLoading || loading) {
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
          <div className="mt-4 text-sm text-gray-500">
            Need help? <button className="underline" onClick={() => dispatch(clearError())}>Reset state</button> or ensure you're signed in.
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Vehicles",
      value: currentStats.total_vehicles,
      description: `${currentStats.active_vehicles} active`,
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Shifts",
      value: currentStats.active_shifts,
      description: `${currentStats.completed_shifts_today} completed today`,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Open Issues",
      value: currentStats.open_issues,
      description: `${currentStats.critical_issues} critical`,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Open Tickets",
      value: currentStats.open_tickets,
      description: `${currentStats.overdue_tickets} overdue`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Inspections Today",
      value: currentStats.inspections_today,
      description: `${currentStats.failed_inspections_today} failed`,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Notifications",
      value: currentStats.unread_notifications,
      description: `${currentStats.urgent_notifications} urgent`,
      icon: Activity,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 sm:p-5 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 rounded-2xl border border-gray-200/60 shadow-sm">
        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base font-medium">
            Welcome back! Here's an overview of your fleet management system
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-200/60 shadow-sm hover:shadow-md transition-all duration-200 group">
            <Sparkles className="h-5 w-5 text-blue-600 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-semibold text-gray-700">Real-time Updates</span>
          </div>
          {lastUpdated && (
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card 
              key={index} 
              className="group relative overflow-hidden border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300/60 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient Background Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <div className={`absolute top-0 right-0 w-40 h-40 ${stat.bgColor} opacity-5 rounded-full -mr-20 -mt-20 group-hover:opacity-15 group-hover:scale-150 transition-all duration-500`}></div>
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-xl ${stat.bgColor} shadow-md group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <Icon className={`h-5 w-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-2">
                <div className="text-5xl font-extrabold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <div className={`p-1.5 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                    <TrendingUp className={`h-3.5 w-3.5 ${stat.color}`} />
                  </div>
                  <p className="text-xs font-semibold text-gray-600">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border border-gray-200/80 shadow-xl bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-gray-200/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-base mt-2 font-medium text-gray-600">
                Common tasks and operations at your fingertips
              </CardDescription>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 border-2 border-blue-200/60 bg-white/80 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100/80 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              onClick={() => handleQuickAction('add-vehicle')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/5 transition-all rounded-lg"></div>
              <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl group-hover:from-blue-500/20 group-hover:to-blue-600/20 transition-all relative z-10">
                <Truck className="h-7 w-7 text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-transform" />
              </div>
              <span className="font-bold text-gray-800 group-hover:text-blue-700 relative z-10">Add Vehicle</span>
              <ArrowRight className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all absolute right-4 top-4 relative z-10" />
            </Button>
            <Button 
              variant="outline" 
              className="h-28 flex flex-col items-center justify-center gap-3 border-2 border-green-200/60 bg-white/80 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100/80 hover:border-green-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              onClick={() => handleQuickAction('start-shift')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:to-green-500/5 transition-all rounded-lg"></div>
              <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl group-hover:from-green-500/20 group-hover:to-green-600/20 transition-all relative z-10">
                <Users className="h-8 w-8 text-green-600 group-hover:scale-110 group-hover:rotate-3 transition-transform" />
              </div>
              <span className="font-bold text-gray-800 group-hover:text-green-700 relative z-10">Start Shift</span>
              <ArrowRight className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all absolute right-4 top-4 relative z-10" />
            </Button>
            <Button 
              variant="outline" 
              className="h-28 flex flex-col items-center justify-center gap-3 border-2 border-purple-200/60 bg-white/80 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100/80 hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              onClick={() => handleQuickAction('new-inspection')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-purple-500/5 transition-all rounded-lg"></div>
              <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl group-hover:from-purple-500/20 group-hover:to-purple-600/20 transition-all relative z-10">
                <CheckCircle className="h-8 w-8 text-purple-600 group-hover:scale-110 group-hover:rotate-3 transition-transform" />
              </div>
              <span className="font-bold text-gray-800 group-hover:text-purple-700 relative z-10">New Inspection</span>
              <ArrowRight className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all absolute right-4 top-4 relative z-10" />
            </Button>
            <Button 
              variant="outline" 
              className="h-28 flex flex-col items-center justify-center gap-3 border-2 border-red-200/60 bg-white/80 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100/80 hover:border-red-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              onClick={() => handleQuickAction('report-issue')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-red-500/5 transition-all rounded-lg"></div>
              <div className="p-3 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl group-hover:from-red-500/20 group-hover:to-red-600/20 transition-all relative z-10">
                <AlertTriangle className="h-8 w-8 text-red-600 group-hover:scale-110 group-hover:rotate-3 transition-transform" />
              </div>
              <span className="font-bold text-gray-800 group-hover:text-red-700 relative z-10">Report Issue</span>
              <ArrowRight className="h-5 w-5 text-red-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all absolute right-4 top-4 relative z-10" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border border-gray-200/80 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4 bg-gradient-to-r from-gray-50/50 to-blue-50/30 border-b border-gray-200/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-base mt-2 font-medium text-gray-600">
                Latest updates and events in your fleet
              </CardDescription>
            </div>
            <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50/50 hover:to-green-50/30 transition-all duration-300 group cursor-pointer border-l-4 border-green-500 shadow-sm hover:shadow-md">
              <div className="relative mt-1">
                <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/50 group-hover:scale-125 transition-transform"></div>
                <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                  Vehicle ABC123 inspection completed
                </p>
                <p className="text-xs text-gray-500 mt-1.5 font-medium">2 minutes ago</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50/50 hover:to-red-50/30 transition-all duration-300 group cursor-pointer border-l-4 border-red-500 shadow-sm hover:shadow-md">
              <div className="relative mt-1">
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50 group-hover:scale-125 transition-transform"></div>
                <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                  Critical issue reported for Vehicle XYZ789
                </p>
                <p className="text-xs text-gray-500 mt-1.5 font-medium">15 minutes ago</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-50/30 transition-all duration-300 group cursor-pointer border-l-4 border-blue-500 shadow-sm hover:shadow-md">
              <div className="relative mt-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 group-hover:scale-125 transition-transform"></div>
                <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  New shift started for Driver John Doe
                </p>
                <p className="text-xs text-gray-500 mt-1.5 font-medium">1 hour ago</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
