'use client';

import { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Wrench, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Navigation,
  Fuel,
  Gauge
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/dashboard-layout';
import HelpButton from '@/components/ui/help-button';
import { getCurrentUser, User } from '@/lib/auth';

export default function DriverDashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const statCards = [
    {
      title: 'Assigned Vehicle',
      value: 'VH-001',
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: 'Active',
      statusColor: 'text-green-600',
    },
    {
      title: 'Current Route',
      value: 'RT-015',
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      status: 'In Progress',
      statusColor: 'text-blue-600',
    },
    {
      title: 'Fuel Level',
      value: '75%',
      icon: Fuel,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      status: 'Good',
      statusColor: 'text-green-600',
    },
    {
      title: 'Odometer',
      value: '45,231 km',
      icon: Gauge,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      status: 'Normal',
      statusColor: 'text-green-600',
    },
  ];

  const currentRoute = {
    id: 'RT-015',
    name: 'Downtown Delivery Route',
    startTime: '08:00 AM',
    estimatedEnd: '12:00 PM',
    progress: 65,
    stops: [
      { id: 1, name: 'Warehouse A', address: '123 Main St', status: 'completed', time: '08:15 AM' },
      { id: 2, name: 'Office Building B', address: '456 Oak Ave', status: 'completed', time: '09:30 AM' },
      { id: 3, name: 'Shopping Center C', address: '789 Pine St', status: 'current', time: '10:45 AM' },
      { id: 4, name: 'Residential Area D', address: '321 Elm St', status: 'pending', time: '11:30 AM' },
      { id: 5, name: 'Return to Base', address: 'Fleet Depot', status: 'pending', time: '12:00 PM' },
    ],
  };

  const maintenanceAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Oil change due in 500 km',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      urgent: false,
    },
    {
      id: 2,
      type: 'info',
      message: 'Tire pressure check recommended',
      icon: Wrench,
      color: 'text-blue-600',
      urgent: false,
    },
    {
      id: 3,
      type: 'success',
      message: 'Last inspection passed',
      icon: CheckCircle,
      color: 'text-green-600',
      urgent: false,
    },
  ];

  const recentTrips = [
    {
      id: 1,
      route: 'RT-014',
      date: 'Yesterday',
      distance: '45 km',
      duration: '3h 15m',
      status: 'completed',
    },
    {
      id: 2,
      route: 'RT-013',
      date: '2 days ago',
      distance: '38 km',
      duration: '2h 45m',
      status: 'completed',
    },
    {
      id: 3,
      route: 'RT-012',
      date: '3 days ago',
      distance: '52 km',
      duration: '4h 10m',
      status: 'completed',
    },
  ];

  const getStopStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'current':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <HelpButton role="driver" page="dashboard" />
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Good morning, {user?.first_name || user?.username}!
          </h1>
          <p className="text-green-100">
            Ready for another day on the road? Check your route and vehicle status.
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
                    <span className={stat.statusColor}>{stat.status}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Route */}
          <Card>
            <CardHeader>
              <CardTitle>Current Route Progress</CardTitle>
              <CardDescription>{currentRoute.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentRoute.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Started: {currentRoute.startTime}</span>
                  <span>ETA: {currentRoute.estimatedEnd}</span>
                </div>

                {/* Route Stops */}
                <div className="space-y-3">
                  {currentRoute.stops.map((stop) => (
                    <div key={stop.id} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        stop.status === 'completed' ? 'bg-green-500' :
                        stop.status === 'current' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{stop.name}</p>
                        <p className="text-xs text-gray-500">{stop.address}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getStopStatusColor(stop.status)}`}>
                          {stop.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{stop.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-4">
                  <Navigation className="w-4 h-4 mr-2" />
                  Start Navigation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Status</CardTitle>
              <CardDescription>Maintenance alerts and reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceAlerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className={`p-2 rounded-full bg-gray-100`}>
                        <Icon className={`w-4 h-4 ${alert.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.message}
                        </p>
                        {alert.urgent && (
                          <Badge className="text-xs bg-red-100 text-red-800 mt-1">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trips */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
            <CardDescription>Your completed routes from the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-green-100">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{trip.route}</h4>
                      <p className="text-xs text-gray-500">{trip.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{trip.distance}</p>
                    <p className="text-xs text-gray-500">{trip.duration}</p>
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
            <CardDescription>Common driver operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                <Navigation className="w-6 h-6" />
                <span>Start Route</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Truck className="w-6 h-6" />
                <span>Vehicle Check</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Clock className="w-6 h-6" />
                <span>Log Hours</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
