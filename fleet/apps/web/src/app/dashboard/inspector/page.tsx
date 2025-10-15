'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Truck, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/dashboard-layout';
import HelpButton from '@/components/ui/help-button';
import { getCurrentUser, User } from '@/lib/auth';

export default function InspectorDashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const statCards = [
    {
      title: 'Inspections Today',
      value: 8,
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+2',
      changeType: 'positive' as const,
    },
    {
      title: 'Vehicles Inspected',
      value: 24,
      icon: Truck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+3',
      changeType: 'positive' as const,
    },
    {
      title: 'Issues Found',
      value: 3,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '-1',
      changeType: 'negative' as const,
    },
    {
      title: 'Reports Generated',
      value: 12,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+4',
      changeType: 'positive' as const,
    },
  ];

  const pendingInspections = [
    {
      id: 1,
      vehicleId: 'VH-001',
      vehicleType: 'Delivery Truck',
      location: 'Main Depot',
      scheduledTime: '09:00 AM',
      priority: 'high',
      status: 'scheduled',
    },
    {
      id: 2,
      vehicleId: 'VH-005',
      vehicleType: 'Van',
      location: 'Service Center',
      scheduledTime: '10:30 AM',
      priority: 'medium',
      status: 'in_progress',
    },
    {
      id: 3,
      vehicleId: 'VH-008',
      vehicleType: 'Truck',
      location: 'Field Office',
      scheduledTime: '02:00 PM',
      priority: 'low',
      status: 'scheduled',
    },
    {
      id: 4,
      vehicleId: 'VH-012',
      vehicleType: 'Delivery Van',
      location: 'Warehouse',
      scheduledTime: '03:30 PM',
      priority: 'medium',
      status: 'scheduled',
    },
  ];

  const recentInspections = [
    {
      id: 1,
      vehicleId: 'VH-003',
      date: 'Today, 08:00 AM',
      result: 'passed',
      issues: 0,
      inspector: 'Mike Inspector',
    },
    {
      id: 2,
      vehicleId: 'VH-007',
      date: 'Yesterday, 02:30 PM',
      result: 'failed',
      issues: 2,
      inspector: 'Mike Inspector',
    },
    {
      id: 3,
      vehicleId: 'VH-011',
      date: 'Yesterday, 11:00 AM',
      result: 'passed',
      issues: 0,
      inspector: 'Mike Inspector',
    },
    {
      id: 4,
      vehicleId: 'VH-015',
      date: '2 days ago, 04:00 PM',
      result: 'passed',
      issues: 1,
      inspector: 'Mike Inspector',
    },
  ];

  const inspectionChecklist = [
    { item: 'Engine Oil Level', status: 'pass', required: true },
    { item: 'Brake System', status: 'pass', required: true },
    { item: 'Tire Condition', status: 'warning', required: true },
    { item: 'Lights & Signals', status: 'pass', required: true },
    { item: 'Safety Equipment', status: 'pass', required: true },
    { item: 'Documentation', status: 'pass', required: false },
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
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <HelpButton role="inspector" page="dashboard" />
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="text-yellow-100">
            Keep our fleet safe and compliant with thorough inspections.
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
                    <span className={stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}>
                      {stat.change}
                    </span>
                    <span className="ml-1">from yesterday</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Inspections */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Inspections</CardTitle>
              <CardDescription>Today&apos;s scheduled vehicle inspections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInspections.map((inspection) => (
                  <div key={inspection.id} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        {inspection.vehicleId} - {inspection.vehicleType}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{inspection.location}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={`text-xs ${getPriorityColor(inspection.priority)}`}>
                          {inspection.priority}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(inspection.status)}`}>
                          {inspection.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {inspection.scheduledTime}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Start
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Inspections */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Inspections</CardTitle>
              <CardDescription>Latest inspection results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInspections.map((inspection) => (
                  <div key={inspection.id} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        {inspection.vehicleId}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{inspection.date}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={`text-xs ${getResultColor(inspection.result)}`}>
                          {inspection.result}
                        </Badge>
                        {inspection.issues > 0 && (
                          <Badge className="text-xs bg-red-100 text-red-800">
                            {inspection.issues} issues
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Report
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inspection Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Inspection Checklist</CardTitle>
            <CardDescription>Required checks for vehicle inspections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inspectionChecklist.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'pass' ? 'bg-green-500' :
                      item.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900">{item.item}</span>
                    {item.required && (
                      <Badge className="text-xs bg-blue-100 text-blue-800">
                        Required
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.status === 'pass' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {item.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                    {item.status === 'fail' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common inspection operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                <Shield className="w-6 h-6" />
                <span>Start Inspection</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Search className="w-6 h-6" />
                <span>Find Vehicle</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <FileText className="w-6 h-6" />
                <span>Generate Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Filter className="w-6 h-6" />
                <span>Filter Results</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
