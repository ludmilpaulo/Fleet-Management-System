'use client'

import React, { useState, useEffect } from 'react'
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
  Building2
} from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchUserProfile } from '@/store/slices/authSlice'
import { analytics } from '@/lib/mixpanel'

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

export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (user) {
      fetchStats()
      // Track admin dashboard view
      analytics.trackDashboardView('admin', user.id.toString(), user.company?.name || 'Unknown')
    } else {
      dispatch(fetchUserProfile())
    }
  }, [user, dispatch])

  const fetchStats = async () => {
    try {
      // Mock data for enhanced dashboard
      const mockStats: DashboardStats = {
        company_name: 'FleetCorp Solutions',
        total_users: 24,
        active_users: 22,
        inactive_users: 2,
        users_by_role: {
          'admin': 2,
          'staff': 5,
          'driver': 12,
          'inspector': 5
        },
        recent_registrations: 3,
        subscription_status: 'professional',
        trial_days_remaining: 0,
        monthly_revenue: 2500.00,
        total_vehicles: 45,
        active_shifts: 8,
        completed_inspections: 156,
        pending_issues: 12
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

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
        {stats && (
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
        )}

        {/* Key Metrics */}
        {stats && (
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
        )}

        {/* User Roles Breakdown */}
        {stats && (
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
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Users className="w-6 h-6" />
                <span>Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Truck className="w-6 h-6" />
                <span>Add Vehicle</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <BarChart3 className="w-6 h-6" />
                <span>View Reports</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
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
            <div className="space-y-4">
              {[
                { action: 'New user registered', user: 'John Doe', time: '2 minutes ago', type: 'success' },
                { action: 'Vehicle inspection completed', user: 'Jane Smith', time: '15 minutes ago', type: 'info' },
                { action: 'Shift started', user: 'Mike Johnson', time: '1 hour ago', type: 'info' },
                { action: 'Issue reported', user: 'Sarah Wilson', time: '2 hours ago', type: 'warning' },
                { action: 'Payment received', user: 'System', time: '3 hours ago', type: 'success' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.type === 'success' ? 'bg-green-500' :
                      item.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-sm">{item.action}</p>
                      <p className="text-xs text-gray-600">by {item.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}