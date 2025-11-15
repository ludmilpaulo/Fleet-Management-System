'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Truck, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Plus,
  Settings,
  DollarSign,
  Shield,
  Activity,
  BarChart3,
  Star,
  Crown,
  Zap,
  ArrowUpRight,
  Building2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import HelpButton from '@/components/ui/help-button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchUserProfile } from '@/store/slices/authSlice'
import { analytics } from '@/lib/mixpanel'
import { useRouter } from 'next/navigation'
import { API_CONFIG } from '@/config/api'
import { apiClient, extractResults } from '@/lib/apiClient'

interface DashboardStats {
  company_name: string
  total_users: number
  active_users: number
  inactive_users: number
  users_by_role: Record<string, number>
  recent_registrations: number
  subscription_status: string
  trial_days_remaining: number
  monthly_revenue: number
  total_vehicles: number
  active_shifts: number
  completed_inspections: number
  pending_issues: number
}

interface ActivityItem {
  id: string
  title: string
  description: string
  timestamp: string
  indicator: 'success' | 'warning' | 'info'
}

export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)

  const fetchStats = useCallback(async () => {
    try {
      const [
        dashboardData,
        userStatsData,
        subscriptionData,
        paymentsData,
        userListData,
        issuesData,
        ticketsData,
        inspectionsData,
        shiftsData,
      ] = await Promise.all([
        apiClient(API_CONFIG.ENDPOINTS.FLEET_STATS.DASHBOARD),
        apiClient('/account/stats/'),
        apiClient(API_CONFIG.ENDPOINTS.BILLING.SUBSCRIPTION_CURRENT).catch(() => null),
        apiClient(API_CONFIG.ENDPOINTS.BILLING.PAYMENTS).catch(() => null),
        apiClient('/account/users/?page_size=5'),
        apiClient(`${API_CONFIG.ENDPOINTS.ISSUES.LIST}?page=1`),
        apiClient(`${API_CONFIG.ENDPOINTS.TICKETS.LIST}?page=1`),
        apiClient(`${API_CONFIG.ENDPOINTS.INSPECTIONS.LIST}?page=1`),
        apiClient(`${API_CONFIG.ENDPOINTS.SHIFTS.LIST}?page=1`),
      ])

      const payments = extractResults<any>(paymentsData).filter((payment) => {
        if (!payment?.paid_at) return false
        const paidDate = new Date(payment.paid_at).getTime()
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        return paidDate >= thirtyDaysAgo && (payment.status || '').toLowerCase() === 'paid'
      })

      const monthlyRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
      const trialDaysFromCompany = user?.company?.trial_ends_at
        ? calculateCompanyTrialDays(user.company.trial_ends_at)
        : 0

      const companySubscriptionStatus =
        subscriptionData?.status ||
        ((user?.company as { subscription_status?: string } | undefined)?.subscription_status) ||
        'unknown'

      const combinedStats: DashboardStats = {
        company_name: userStatsData.company_name || user?.company?.name || 'Your Company',
        total_users: userStatsData.total_users || 0,
        active_users: userStatsData.active_users || 0,
        inactive_users: userStatsData.inactive_users || 0,
        users_by_role: userStatsData.users_by_role || {},
        recent_registrations: userStatsData.recent_registrations || 0,
        subscription_status: companySubscriptionStatus,
        trial_days_remaining: subscriptionData?.days_until_period_end ?? trialDaysFromCompany,
        monthly_revenue: monthlyRevenue,
        total_vehicles: dashboardData.total_vehicles || 0,
        active_shifts: dashboardData.active_shifts || 0,
        completed_inspections: dashboardData.completed_inspections || 0,
        pending_issues: dashboardData.pending_issues || 0
      }
      
      setStats(combinedStats)
      setRecentActivity(buildRecentActivity(userListData, issuesData, ticketsData, inspectionsData, shiftsData))
      setError(null)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError('Unable to load dashboard data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchStats()
      analytics.trackDashboardView('admin', user.id.toString(), user.company?.name || 'Unknown')
    } else {
      dispatch(fetchUserProfile())
    }
  }, [user, dispatch, fetchStats])

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Trial</Badge>
      case 'basic':
        return <Badge className="bg-gray-100 text-gray-800"><Shield className="w-3 h-3 mr-1" />Basic</Badge>
      case 'professional':
        return <Badge className="bg-purple-100 text-purple-800"><Star className="w-3 h-3 mr-1" />Professional</Badge>
      case 'enterprise':
        return <Badge className="bg-yellow-100 text-yellow-800"><Crown className="w-3 h-3 mr-1" />Enterprise</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-600" />
      case 'staff': return <Users className="w-4 h-4 text-blue-600" />
      case 'driver': return <Truck className="w-4 h-4 text-green-600" />
      case 'inspector': return <Shield className="w-4 h-4 text-purple-600" />
      default: return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
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
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <HelpButton role="admin" page="dashboard" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between slide-up">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Welcome back, <span className="font-semibold text-gray-900">{user?.full_name || 'Admin'}</span></p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="btn-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Company Status Banner */}
        {stats ? (
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{stats.company_name}</h3>
                    <p className="text-sm text-gray-600">Fleet Management Platform</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getSubscriptionBadge(stats.subscription_status)}
                  {stats.trial_days_remaining > 0 && (
                    <div className="text-sm text-gray-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {stats.trial_days_remaining} days left in trial
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Fallback Company Status Banner */
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Loading Company Data...</h3>
                    <p className="text-sm text-gray-600">Fleet Management Platform</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-blue-100 text-blue-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Loading...
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        {error && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {stats ? (
          <div className="grid gap-4 md:grid-cols-4 fade-in">
            <Card className="card-hover border-t-4 border-t-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-green-500">+{stats.recent_registrations} this week</span>
                </div>
                <Progress value={(stats.active_users / stats.total_users) * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.active_users} active users
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-t-4 border-t-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Fleet Size</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_vehicles}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Activity className="w-3 h-3 text-blue-500 mr-1" />
                  <span className="text-blue-500">{stats.active_shifts} active shifts</span>
                </div>
                <Progress value={75} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  75% utilization rate
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-t-4 border-t-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Inspections</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed_inspections}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-green-500">+12% from last month</span>
                </div>
                <Progress value={85} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  85% pass rate
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-t-4 border-t-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Monthly Revenue</CardTitle>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.monthly_revenue.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-green-500">+8% from last month</span>
                </div>
                <Progress value={80} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  80% of target achieved
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* User Roles Breakdown */}
        {stats ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  User Roles Distribution
                </CardTitle>
                <CardDescription>Breakdown of users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.users_by_role).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(role)}
                        <span className="font-medium capitalize">{role}s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / stats.total_users) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Health
                </CardTitle>
                <CardDescription>Current system status and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">System Status</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Pending Issues</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">{stats.pending_issues}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Active Shifts</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">{stats.active_shifts}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Security Status</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Secure</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Fallback when stats are not available */
          <div className="grid gap-4 md:grid-cols-4 fade-in">
            <Card className="card-hover border-t-4 border-t-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Loading...</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <p className="text-xs text-gray-500">Fetching data...</p>
              </CardContent>
            </Card>
            <Card className="card-hover border-t-4 border-t-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Loading...</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <p className="text-xs text-gray-500">Fetching data...</p>
              </CardContent>
            </Card>
            <Card className="card-hover border-t-4 border-t-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Loading...</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <p className="text-xs text-gray-500">Fetching data...</p>
              </CardContent>
            </Card>
            <Card className="card-hover border-t-4 border-t-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Loading...</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <p className="text-xs text-gray-500">Fetching data...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => router.push('/dashboard/staff/users')}
              >
                <Users className="w-6 h-6" />
                <span>Manage Users</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => router.push('/dashboard/vehicles')}
              >
                <Truck className="w-6 h-6" />
                <span>Add Vehicle</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => router.push('/dashboard/admin/reports')}
              >
                <BarChart3 className="w-6 h-6" />
                <span>View Reports</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => router.push('/dashboard/admin/settings')}
              >
                <Settings className="w-6 h-6" />
                <span>System Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system events and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading activity...
              </div>
            )}
            {!loading && recentActivity.length === 0 && (
              <p className="text-sm text-gray-500">No activity available yet.</p>
            )}
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.indicator === 'success' ? 'bg-green-500' :
                      item.indicator === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function calculateCompanyTrialDays(trialEndsAt?: string) {
  if (!trialEndsAt) return 0
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0
}

function buildRecentActivity(
  usersPayload: any,
  issuesPayload: any,
  ticketsPayload: any,
  inspectionsPayload: any,
  shiftsPayload: any
): ActivityItem[] {
  const items: ActivityItem[] = []

  const users = extractResults<any>(usersPayload)
  users.forEach((u) => {
    if (u?.date_joined) {
      items.push({
        id: `user-${u.id}`,
        title: 'New user registered',
        description: `${u.full_name || `${u.first_name} ${u.last_name}` || u.username}`,
        timestamp: u.date_joined,
        indicator: 'success',
      })
    }
  })

  const issues = extractResults<any>(issuesPayload)
  issues.forEach((issue) => {
    items.push({
      id: `issue-${issue.id}`,
      title: 'Issue reported',
      description: issue.title || 'New issue logged',
      timestamp: issue.reported_at || issue.created_at,
      indicator: 'warning',
    })
  })

  const tickets = extractResults<any>(ticketsPayload)
  tickets.forEach((ticket) => {
    items.push({
      id: `ticket-${ticket.id}`,
      title: `Ticket ${ticket.status}`,
      description: ticket.title || 'Ticket updated',
      timestamp: ticket.updated_at || ticket.created_at,
      indicator: ticket.status === 'COMPLETED' ? 'success' : 'info',
    })
  })

  const inspections = extractResults<any>(inspectionsPayload)
  inspections.forEach((inspection) => {
    items.push({
      id: `inspection-${inspection.id}`,
      title: 'Inspection recorded',
      description: inspection.vehicle_reg
        ? `${inspection.vehicle_reg} ${inspection.vehicle_make_model || ''}`
        : 'Vehicle inspection update',
      timestamp: inspection.started_at || inspection.updated_at || new Date().toISOString(),
      indicator: 'info',
    })
  })

  const shifts = extractResults<any>(shiftsPayload)
  shifts.forEach((shift) => {
    items.push({
      id: `shift-${shift.id}`,
      title: shift.status === 'COMPLETED' ? 'Shift completed' : 'Shift started',
      description: shift.vehicle_reg ? `Vehicle ${shift.vehicle_reg}` : 'Shift activity logged',
      timestamp: shift.updated_at || shift.start_at,
      indicator: 'info',
    })
  })

  return items
    .filter((activity) => !!activity.timestamp)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8)
}