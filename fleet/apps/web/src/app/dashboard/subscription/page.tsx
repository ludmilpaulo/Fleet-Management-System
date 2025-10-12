'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  Star, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  CreditCard,
  Download,
  ArrowRight,
  Sparkles,
  Users,
  Truck,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { format } from 'date-fns'
import { analytics } from '@/lib/mixpanel'
import { useAppSelector } from '@/store/hooks'

interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  description: string
  monthly_price: number
  yearly_price: number
  max_users: number
  max_vehicles: number
  features: string[]
  is_popular: boolean
}

interface CompanySubscription {
  id: string
  company_name: string
  plan: string
  status: string
  billing_cycle: string
  current_period_end: string
  trial_ends_at: string
  days_remaining: number
  amount: number
  currency: string
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    fetchSubscriptionData()
    
    // Track subscription page view
    if (user) {
      analytics.trackSubscriptionView(
        user.company?.subscription_plan || 'trial',
        user.company?.is_trial_active ? 14 : 0
      );
    }
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      // Mock data for subscription management
      const mockSubscription: CompanySubscription = {
        id: '1',
        company_name: 'FleetCorp Solutions',
        plan: 'professional',
        status: 'active',
        billing_cycle: 'monthly',
        current_period_end: '2024-02-15T00:00:00Z',
        trial_ends_at: '2024-01-15T00:00:00Z',
        days_remaining: 0,
        amount: 99.00,
        currency: 'USD'
      }

      const mockPlans: SubscriptionPlan[] = [
        {
          id: '1',
          name: 'basic',
          display_name: 'Basic Plan',
          description: 'Perfect for small fleets getting started',
          monthly_price: 29,
          yearly_price: 290,
          max_users: 5,
          max_vehicles: 10,
          features: [
            'Up to 5 users',
            'Up to 10 vehicles',
            'Basic vehicle tracking',
            'Email support',
            'Standard reports'
          ],
          is_popular: false
        },
        {
          id: '2',
          name: 'professional',
          display_name: 'Professional Plan',
          description: 'Ideal for growing businesses with advanced needs',
          monthly_price: 99,
          yearly_price: 990,
          max_users: 25,
          max_vehicles: 50,
          features: [
            'Up to 25 users',
            'Up to 50 vehicles',
            'Advanced tracking & analytics',
            'Priority support',
            'Custom reports',
            'API access',
            'Mobile app access'
          ],
          is_popular: true
        },
        {
          id: '3',
          name: 'enterprise',
          display_name: 'Enterprise Plan',
          description: 'Complete solution for large organizations',
          monthly_price: 299,
          yearly_price: 2990,
          max_users: 100,
          max_vehicles: 200,
          features: [
            'Unlimited users',
            'Up to 200 vehicles',
            'Advanced analytics & AI',
            '24/7 phone support',
            'Custom integrations',
            'Dedicated account manager',
            'White-label options',
            'Advanced security features'
          ],
          is_popular: false
        }
      ]

      setSubscription(mockSubscription)
      setPlans(mockPlans)
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'enterprise': return <Crown className="w-6 h-6 text-yellow-600" />
      case 'professional': return <Star className="w-6 h-6 text-purple-600" />
      case 'basic': return <Shield className="w-6 h-6 text-blue-600" />
      default: return <Shield className="w-6 h-6 text-gray-600" />
    }
  }

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
      case 'suspended': return <AlertTriangle className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Subscription Management</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
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
              Subscription Management
            </h1>
            <p className="text-gray-600 text-lg">Manage your plan and billing seamlessly</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
            <Button className="btn-gradient">
              <CreditCard className="w-4 h-4 mr-2" />
              Update Payment
            </Button>
          </div>
        </div>

        {/* Current Subscription */}
        {subscription && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-blue-600" />
                Current Subscription
              </CardTitle>
              <CardDescription>Your current plan and billing information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlanIcon(subscription.plan)}
                      <div>
                        <h3 className="font-semibold text-lg capitalize">{subscription.plan} Plan</h3>
                        <p className="text-sm text-gray-600">{subscription.company_name}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(subscription.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(subscription.status)}
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </div>
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Billing Cycle:</span>
                      <span className="font-medium capitalize">{subscription.billing_cycle}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">${subscription.amount}/{subscription.billing_cycle === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Next Billing:</span>
                      <span className="font-medium">{format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">${subscription.amount}</div>
                    <div className="text-sm text-gray-600">per {subscription.billing_cycle === 'yearly' ? 'year' : 'month'}</div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Button>
                    <Button variant="outline" className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Update Payment Method
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12/25</div>
              <Progress value={48} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                48% of plan limit used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28/50</div>
              <Progress value={56} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                56% of plan limit used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.1/10 GB</div>
              <Progress value={21} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                21% of storage used
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Available Plans
            </CardTitle>
            <CardDescription>Choose the plan that best fits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative card-hover ${plan.is_popular ? 'border-2 border-blue-500 shadow-2xl scale-105' : 'border border-gray-200'}`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 shadow-lg">
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      {getPlanIcon(plan.name)}
                    </div>
                    <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">${plan.monthly_price}</div>
                      <div className="text-sm text-gray-600">per month</div>
                      <div className="text-sm text-green-600 mt-1">
                        or ${plan.yearly_price}/year (save 17%)
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Up to {plan.max_users} users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Up to {plan.max_vehicles} vehicles</span>
                      </div>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      {subscription?.plan === plan.name ? (
                        <Button className="w-full" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Current Plan
                        </Button>
                      ) : (
                        <Button 
                          className={`w-full ${plan.is_popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                          variant={plan.is_popular ? 'default' : 'outline'}
                          onClick={() => {
                            analytics.trackButtonClick(`upgrade_to_${plan.name}`, 'subscription_page');
                            analytics.trackPlanUpgrade(
                              subscription?.plan || 'trial',
                              plan.name,
                              'monthly'
                            );
                          }}
                        >
                          {subscription?.plan === 'trial' ? 'Upgrade Now' : 'Switch Plan'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Billing History
            </CardTitle>
            <CardDescription>Your recent invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: '2024-01-15', amount: 99.00, status: 'paid', invoice: 'INV-001' },
                { date: '2023-12-15', amount: 99.00, status: 'paid', invoice: 'INV-002' },
                { date: '2023-11-15', amount: 99.00, status: 'paid', invoice: 'INV-003' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.invoice}</p>
                      <p className="text-sm text-gray-600">{format(new Date(item.date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">${item.amount}</p>
                      <Badge className="bg-green-100 text-green-800">{item.status}</Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Need Help?
            </CardTitle>
            <CardDescription>Get support for your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Contact Support</h3>
                <p className="text-sm text-gray-600 mb-3">Get help with your subscription or billing questions</p>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">Documentation</h3>
                <p className="text-sm text-gray-600 mb-3">Learn more about our features and pricing</p>
                <Button variant="outline" size="sm">
                  View Docs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
