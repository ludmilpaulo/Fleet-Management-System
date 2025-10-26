'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, 
  Users, 
  Truck, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  Pause,
  Crown,
  Activity,
  BarChart3,
  Zap,
  Database,
  Server,
  HardDrive,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  AlertCircle,
  Info,
  ArrowUpRight,
  Wrench
} from 'lucide-react'
import { format } from 'date-fns'

interface PlatformStats {
  total_companies: number
  active_companies: number
  trial_companies: number
  expired_companies: number
  suspended_companies: number
  total_users: number
  total_vehicles: number
  total_shifts: number
  total_inspections: number
  total_issues: number
  total_tickets: number
  monthly_revenue: number
  yearly_revenue: number
  companies_by_plan: Record<string, number>
  companies_by_status: Record<string, number>
  revenue_by_month: Record<string, number>
  total_admin_actions: number
  recent_admin_actions: Array<{
    id: number
    action: string
    description: string
    admin: string
    created_at: string
  }>
  system_health: {
    database_status: string
    redis_status: string
    celery_status: string
    storage_status: string
    api_response_time: number
    error_rate: number
    active_users: number
    system_load: number
    memory_usage: number
    disk_usage: number
    last_backup: string
    uptime: string
  }
  active_maintenance: Array<{
    id: number
    title: string
    status: string
    scheduled_start: string
  }>
}

export default function PlatformAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchPlatformStats()
  }, [])

  const handleRefresh = async () => {
    setLoading(true);
    await fetchPlatformStats();
    setLoading(false);
  };

  const handleAddEntity = () => {
    // TODO: Implement modal or navigation to add entity
    alert('Add Entity functionality coming soon!');
  };

  const fetchPlatformStats = async () => {
    try {
      // Mock comprehensive platform statistics
      const mockStats: PlatformStats = {
        total_companies: 156,
        active_companies: 142,
        trial_companies: 23,
        expired_companies: 8,
        suspended_companies: 3,
        total_users: 1247,
        total_vehicles: 3421,
        total_shifts: 15678,
        total_inspections: 8934,
        total_issues: 456,
        total_tickets: 234,
        monthly_revenue: 125000.00,
        yearly_revenue: 1500000.00,
        companies_by_plan: {
          'trial': 23,
          'basic': 45,
          'professional': 67,
          'enterprise': 21
        },
        companies_by_status: {
          'active': 142,
          'trial': 23,
          'expired': 8,
          'suspended': 3
        },
        revenue_by_month: {
          '2024-01': 125000,
          '2023-12': 118000,
          '2023-11': 112000,
          '2023-10': 108000,
          '2023-09': 105000,
          '2023-08': 102000
        },
        total_admin_actions: 12456,
        recent_admin_actions: [
          { id: 1, action: 'company_create', description: 'Created new company: TechCorp', admin: 'admin1', created_at: '2024-01-15T10:30:00Z' },
          { id: 2, action: 'user_update', description: 'Updated user permissions', admin: 'admin2', created_at: '2024-01-15T09:15:00Z' },
          { id: 3, action: 'vehicle_create', description: 'Added new vehicle to fleet', admin: 'admin1', created_at: '2024-01-15T08:45:00Z' },
          { id: 4, action: 'system_backup', description: 'Completed system backup', admin: 'admin3', created_at: '2024-01-15T07:20:00Z' },
          { id: 5, action: 'subscription_update', description: 'Updated subscription plan', admin: 'admin2', created_at: '2024-01-15T06:10:00Z' },
        ],
        system_health: {
          database_status: 'healthy',
          redis_status: 'healthy',
          celery_status: 'healthy',
          storage_status: 'healthy',
          api_response_time: 0.15,
          error_rate: 0.02,
          active_users: 1247,
          system_load: 0.45,
          memory_usage: 0.67,
          disk_usage: 0.23,
          last_backup: '2024-01-15T02:00:00Z',
          uptime: '30 days, 12 hours'
        },
        active_maintenance: [
          { id: 1, title: 'Database Optimization', status: 'scheduled', scheduled_start: '2024-01-16T02:00:00Z' },
          { id: 2, title: 'Security Update', status: 'in_progress', scheduled_start: '2024-01-15T14:00:00Z' }
        ]
      }

      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching platform stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'trial': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'trial': return <Clock className="w-4 h-4" />
      case 'expired': return <AlertTriangle className="w-4 h-4" />
      case 'suspended': return <Pause className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Platform Administration</h1>
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
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between slide-up">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
            Platform Administration
          </h1>
          <p className="text-gray-600 text-lg">Complete system management and oversight</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="btn-gradient"
            onClick={handleAddEntity}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entity
          </Button>
        </div>
      </div>

      {/* System Health Banner */}
      {stats && (
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">System Health: All Systems Operational</h3>
                  <p className="text-sm text-gray-600">Uptime: {stats.system_health.uptime} | Response Time: {stats.system_health.api_response_time}s</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Healthy
                </Badge>
                <div className="text-sm text-gray-600">
                  <Database className="w-4 h-4 inline mr-1" />
                  {stats.system_health.active_users} active users
                </div>
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
              <CardTitle className="text-sm font-medium text-gray-700">Total Companies</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_companies}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-500">+{stats.active_companies} active</span>
              </div>
              <Progress value={(stats.active_companies / stats.total_companies) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.trial_companies} trials, {stats.expired_companies} expired
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Activity className="w-3 h-3 text-blue-500 mr-1" />
                <span className="text-blue-500">{stats.system_health.active_users} online</span>
              </div>
              <Progress value={75} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                75% active rate
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fleet Size</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_vehicles}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-500">+{stats.total_shifts} shifts</span>
              </div>
              <Progress value={85} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                85% utilization rate
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthly_revenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-500">+8% from last month</span>
              </div>
              <Progress value={80} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                ${stats.yearly_revenue.toLocaleString()} yearly
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Health Details */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Health
                  </CardTitle>
                  <CardDescription>Real-time system status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Database</span>
                      </div>
                      <Badge className={getStatusColor(stats.system_health.database_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(stats.system_health.database_status)}
                          {stats.system_health.database_status}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Redis Cache</span>
                      </div>
                      <Badge className={getStatusColor(stats.system_health.redis_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(stats.system_health.redis_status)}
                          {stats.system_health.redis_status}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Celery Workers</span>
                      </div>
                      <Badge className={getStatusColor(stats.system_health.celery_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(stats.system_health.celery_status)}
                          {stats.system_health.celery_status}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <HardDrive className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Storage</span>
                      </div>
                      <Badge className={getStatusColor(stats.system_health.storage_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(stats.system_health.storage_status)}
                          {stats.system_health.storage_status}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>System performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">API Response Time</span>
                      <span className="text-sm text-gray-600">{stats.system_health.api_response_time}s</span>
                    </div>
                    <Progress value={85} className="mt-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Error Rate</span>
                      <span className="text-sm text-gray-600">{(stats.system_health.error_rate * 100).toFixed(2)}%</span>
                    </div>
                    <Progress value={98} className="mt-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">System Load</span>
                      <span className="text-sm text-gray-600">{(stats.system_health.system_load * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.system_health.system_load * 100} className="mt-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Memory Usage</span>
                      <span className="text-sm text-gray-600">{(stats.system_health.memory_usage * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.system_health.memory_usage * 100} className="mt-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Disk Usage</span>
                      <span className="text-sm text-gray-600">{(stats.system_health.disk_usage * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.system_health.disk_usage * 100} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Admin Actions */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Admin Actions
                </CardTitle>
                <CardDescription>Latest administrative activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recent_admin_actions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Crown className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{action.description}</p>
                          <p className="text-xs text-gray-600">by {action.admin} • {format(new Date(action.created_at), 'MMM dd, HH:mm')}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {action.action.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="entities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Entity Management
              </CardTitle>
              <CardDescription>Manage all platform entities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    <span className="font-medium">Companies</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Manage company accounts and subscriptions</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-green-600" />
                    <span className="font-medium">Users</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Manage user accounts and permissions</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="w-6 h-6 text-purple-600" />
                    <span className="font-medium">Vehicles</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Manage fleet vehicles and assignments</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-6 h-6 text-orange-600" />
                    <span className="font-medium">Shifts</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Manage driver shifts and schedules</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-6 h-6 text-indigo-600" />
                    <span className="font-medium">Inspections</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Manage vehicle inspections and reports</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <span className="font-medium">Issues</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Manage reported issues and resolutions</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Management
              </CardTitle>
              <CardDescription>System configuration and maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">System Management</h3>
                <p className="text-gray-500">Configure system settings and perform maintenance tasks</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics & Reports
              </CardTitle>
              <CardDescription>Platform analytics and reporting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-500">View detailed analytics and generate reports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Maintenance & Updates
              </CardTitle>
              <CardDescription>Schedule and manage system maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Maintenance Center</h3>
                <p className="text-gray-500">Schedule maintenance windows and system updates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>Configure platform-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Platform Configuration</h3>
                <p className="text-gray-500">Manage platform settings and configurations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
