'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Truck, 
  Wrench, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { getCurrentUser, User } from '@/lib/auth';

export default function StaffDashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const statCards = [
    {
      title: 'Assigned Vehicles',
      value: 12,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+2',
      changeType: 'positive' as const,
    },
    {
      title: 'Pending Maintenance',
      value: 3,
      icon: Wrench,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '-1',
      changeType: 'negative' as const,
    },
    {
      title: 'Completed Tasks',
      value: 28,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+5',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Routes',
      value: 8,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+2',
      changeType: 'positive' as const,
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Vehicle Inspection - VH001',
      type: 'inspection',
      priority: 'high',
      dueDate: 'Today, 2:00 PM',
      status: 'pending',
    },
    {
      id: 2,
      title: 'Route Planning - Downtown Area',
      type: 'planning',
      priority: 'medium',
      dueDate: 'Tomorrow, 9:00 AM',
      status: 'in_progress',
    },
    {
      id: 3,
      title: 'Driver Training Session',
      type: 'training',
      priority: 'low',
      dueDate: 'Friday, 10:00 AM',
      status: 'scheduled',
    },
    {
      id: 4,
      title: 'Fleet Maintenance Report',
      type: 'report',
      priority: 'medium',
      dueDate: 'Next Monday',
      status: 'pending',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'maintenance_completed',
      message: 'Oil change completed for Vehicle VH005',
      time: '30 minutes ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      id: 2,
      type: 'route_assigned',
      message: 'New route assigned to Driver John Smith',
      time: '1 hour ago',
      icon: MapPin,
      color: 'text-blue-600',
    },
    {
      id: 3,
      type: 'inspection_scheduled',
      message: 'Vehicle VH003 inspection scheduled',
      time: '2 hours ago',
      icon: AlertTriangle,
      color: 'text-yellow-600',
    },
    {
      id: 4,
      type: 'report_generated',
      message: 'Weekly fleet report generated',
      time: '3 hours ago',
      icon: FileText,
      color: 'text-purple-600',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="text-blue-100">
            Manage your fleet operations and keep everything running smoothly.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    <span className="text-green-500">{stat.change}</span>
                    <span className="ml-1">from last week</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Your scheduled tasks and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.dueDate}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest fleet operations</CardDescription>
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
            <CardDescription>Common staff operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                <Users className="w-6 h-6" />
                <span>Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Truck className="w-6 h-6" />
                <span>Vehicle Fleet</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Wrench className="w-6 h-6" />
                <span>Maintenance</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <FileText className="w-6 h-6" />
                <span>Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
