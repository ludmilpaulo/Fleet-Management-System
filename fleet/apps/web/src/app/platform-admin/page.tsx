'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  FileText,
  CreditCard,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Crown,
  Star,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { apiClient, extractResults } from '@/lib/apiClient'

interface Company {
  id: string
  name: string
  email: string
  subscription_plan: string
  subscription_status: string
  subscription_display: string
  trial_started_at: string
  trial_ends_at: string
  days_remaining_in_trial: number
  is_active: boolean
  is_trial_active: boolean
  is_payment_overdue: boolean
  can_access_platform: boolean
  current_user_count: number
  current_vehicle_count: number
  created_at: string
}

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
  monthly_revenue: number
  yearly_revenue: number
  companies_by_plan: Record<string, number>
  companies_by_status: Record<string, number>
  revenue_by_month: Record<string, number>
}

export default function PlatformAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [companiesRes, statsRes] = await Promise.all([
        apiClient('/platform-admin/companies/?page_size=100'),
        apiClient('/platform-admin/stats/')
      ])

      setCompanies(extractResults(companiesRes))
      setStats(statsRes)
      setError(null)
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setError(error?.message || 'Unable to load platform data. Ensure you have platform admin access.')
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = useMemo(() => companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || company.subscription_status === statusFilter
    const matchesPlan = planFilter === 'all' || company.subscription_plan === planFilter
    
    return matchesSearch && matchesStatus && matchesPlan
  }), [companies, searchTerm, statusFilter, planFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'trial': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'trial': return <Clock className="w-4 h-4" />
      case 'expired': return <AlertTriangle className="w-4 h-4" />
      case 'suspended': return <Pause className="w-4 h-4" />
      default: return <Building2 className="w-4 h-4" />
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'enterprise': return <Crown className="w-4 h-4" />
      case 'professional': return <Star className="w-4 h-4" />
      case 'basic': return <Building2 className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Administration</h1>
          <p className="text-gray-600">Manage companies, subscriptions, and platform settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_companies}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_companies} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trial Companies</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trial_companies}</div>
              <p className="text-xs text-muted-foreground">
                {stats.expired_companies} expired
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthly_revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${stats.yearly_revenue.toLocaleString()} yearly
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_vehicles} vehicles
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
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
                      placeholder="Search companies..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Companies List */}
          <div className="space-y-4">
            {filteredCompanies.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Building2 className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                  <p className="text-gray-500 text-center">
                    {searchTerm || statusFilter !== 'all' || planFilter !== 'all'
                      ? 'Try adjusting your filters to see more companies.'
                      : 'No companies have been created yet.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getPlanIcon(company.subscription_plan)}
                            <span className="font-medium text-lg">{company.name}</span>
                          </div>
                          <Badge className={getStatusColor(company.subscription_status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(company.subscription_status)}
                              {company.subscription_display}
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span>{company.email}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{company.current_user_count} users</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            <span>{company.current_vehicle_count} vehicles</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {format(new Date(company.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                          
                          {company.is_trial_active && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{company.days_remaining_in_trial} days left in trial</span>
                            </div>
                          )}
                        </div>

                        {company.is_payment_overdue && (
                          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            <strong>Payment Overdue:</strong> This company has outstanding payments
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {company.is_active ? (
                          <Button variant="destructive" size="sm">
                            <Pause className="w-4 h-4 mr-1" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button variant="default" size="sm">
                            <Play className="w-4 h-4 mr-1" />
                            Activate
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>Manage subscription plans and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Subscription Management</h3>
                <p className="text-gray-500">Manage subscription plans and pricing here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View payment history and manage billing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Management</h3>
                <p className="text-gray-500">View and manage billing information here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Reports</CardTitle>
              <CardDescription>Generate reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reports & Analytics</h3>
                <p className="text-gray-500">Generate platform reports and analytics here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
