'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Truck, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile } from '@/store/slices/authSlice';
import { authAPI } from '@/lib/auth';

interface DashboardStats {
  company_name: string;
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_role: Record<string, number>;
  recent_registrations: number;
}

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      dispatch(fetchUserProfile());
    }
  }, [user, dispatch]);

  const fetchStats = async () => {
    try {
      const statsData = await authAPI.getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Users',
      value: stats?.active_users || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Vehicles',
      value: 24,
      icon: Truck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+3',
      changeType: 'positive' as const,
    },
    {
      title: 'Monthly Revenue',
      value: '$45,231',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '+12.5%',
      changeType: 'positive' as const,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'user_registered',
      message: 'New driver John Smith registered',
      time: '2 minutes ago',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      id: 2,
      type: 'vehicle_maintenance',
      message: 'Vehicle #VH001 maintenance completed',
      time: '15 minutes ago',
      icon: Truck,
      color: 'text-green-600',
    },
    {
      id: 3,
      type: 'inspection_due',
      message: 'Vehicle #VH003 inspection due tomorrow',
      time: '1 hour ago',
      icon: AlertTriangle,
      color: 'text-yellow-600',
    },
    {
      id: 4,
      type: 'route_completed',
      message: 'Route #RT001 completed successfully',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
  ];

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="text-sm sm:text-base text-blue-100">
            Here's what's happening with {stats?.company_name || user?.company.name} today.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="outline" className="text-xs sm:text-sm bg-white/20 text-white border-white/30">
              {user?.role_display}
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm bg-white/20 text-white border-white/30">
              {user?.company.name}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-1.5 sm:p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    <span className="text-green-500">{stat.change}</span>
                    <span className="ml-1 hidden sm:inline">from last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* User Role Distribution */}
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-sm sm:text-base">User Distribution</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Users by role</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="space-y-3 sm:space-y-4">
                {stats?.users_by_role && Object.entries(stats.users_by_role).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                        role === 'Admin' ? 'bg-red-500' :
                        role === 'Staff' ? 'bg-blue-500' :
                        role === 'Driver' ? 'bg-green-500' :
                        'bg-yellow-500'
                      }`} />
                      <span className="text-xs sm:text-sm font-medium">{role}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full bg-gray-100`}>
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                <Users className="w-6 h-6" />
                <span>Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Truck className="w-6 h-6" />
                <span>Vehicle Fleet</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <BarChart3 className="w-6 h-6" />
                <span>View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
