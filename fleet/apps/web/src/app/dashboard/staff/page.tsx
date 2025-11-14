'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Truck, 
  Wrench, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight,
  Activity,
  Zap,
  Shield,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/dashboard-layout';
import HelpButton from '@/components/ui/help-button';
import { API_CONFIG } from '@/config/api';
import { format } from 'date-fns';
import Link from 'next/link';
import Cookies from 'js-cookie';

interface DashboardStats {
  total_vehicles: number;
  active_vehicles: number;
  maintenance_vehicles: number;
  active_shifts: number;
  completed_shifts_today: number;
  open_tickets: number;
  overdue_tickets: number;
  completed_tickets_today: number;
  open_issues: number;
  critical_issues: number;
}

interface Vehicle {
  id: number;
  reg_number: string;
  make: string;
  model: string;
  status: string;
  year?: number;
}

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_at?: string;
  completed_at?: string;
  issue?: {
    vehicle?: {
      reg_number: string;
    };
  };
}

interface Shift {
  id: number;
  driver?: {
    first_name: string;
    last_name: string;
  };
  vehicle?: {
    reg_number: string;
    make: string;
    model: string;
  };
  start_at: string;
  status: string;
}

export default function StaffDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [assignedVehicles, setAssignedVehicles] = useState<Vehicle[]>([]);
  const [pendingMaintenance, setPendingMaintenance] = useState<Ticket[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Ticket[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<Shift[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (!token) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.ME}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const headers = {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FLEET_STATS.DASHBOARD}`, { headers });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch assigned vehicles (active vehicles)
      const vehiclesResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VEHICLES.LIST}?status=ACTIVE&limit=5`, { headers });
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        setAssignedVehicles(vehiclesData.results || vehiclesData.slice(0, 5) || []);
      }

      // Fetch pending maintenance (pending tickets)
      const pendingTicketsResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TICKETS.LIST}?status=OPEN&limit=5`, { headers });
      if (pendingTicketsResponse.ok) {
        const ticketsData = await pendingTicketsResponse.json();
        const pending = (ticketsData.results || ticketsData || []).filter((t: Ticket) => 
          t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS'
        ).slice(0, 5);
        setPendingMaintenance(pending);
      }

      // Fetch completed tasks (completed tickets)
      const completedTicketsResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TICKETS.LIST}?status=COMPLETED&limit=5`, { headers });
      if (completedTicketsResponse.ok) {
        const ticketsData = await completedTicketsResponse.json();
        const completed = (ticketsData.results || ticketsData || []).filter((t: Ticket) => 
          t.status === 'COMPLETED'
        ).slice(0, 5);
        setCompletedTasks(completed);
      }

      // Fetch active routes (active shifts)
      const shiftsResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHIFTS.LIST}?status=ACTIVE&limit=5`, { headers });
      if (shiftsResponse.ok) {
        const shiftsData = await shiftsResponse.json();
        const active = (shiftsData.results || shiftsData || []).filter((s: Shift) => 
          s.status === 'ACTIVE'
        ).slice(0, 5);
        setActiveRoutes(active);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Assigned Vehicles',
      value: stats?.active_vehicles || 0,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      change: stats?.active_vehicles ? `+${stats.active_vehicles}` : '0',
      changeType: 'positive' as const,
      link: '/dashboard/staff/vehicles',
    },
    {
      title: 'Pending Maintenance',
      value: stats?.open_tickets || 0,
      icon: Wrench,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      change: stats?.overdue_tickets ? `${stats.overdue_tickets} overdue` : '0 overdue',
      changeType: stats?.overdue_tickets && stats.overdue_tickets > 0 ? 'negative' as const : 'neutral' as const,
      link: '/dashboard/staff/maintenance',
    },
    {
      title: 'Completed Tasks',
      value: stats?.completed_tickets_today || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      change: 'Today',
      changeType: 'positive' as const,
      link: '/dashboard/tickets',
    },
    {
      title: 'Active Routes',
      value: stats?.active_shifts || 0,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      change: stats?.completed_shifts_today ? `${stats.completed_shifts_today} completed today` : '0 today',
      changeType: 'positive' as const,
      link: '/dashboard/shifts',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVehicleStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-8 text-white shadow-xl animate-pulse">
            <div className="h-8 bg-white/20 rounded w-64 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-96"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <HelpButton role="staff" page="dashboard" />
      <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-50"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-36"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Activity className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-white/90 uppercase tracking-wider">Staff Dashboard</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                  Welcome back, {user?.first_name || user?.username || 'Staff'}! 👋
                </h1>
                <p className="text-white/90 text-lg md:text-xl max-w-2xl">
                  Manage your fleet operations and keep everything running smoothly. Track vehicles, maintenance, and active routes all in one place.
                </p>
              </div>
              <Button
                variant="secondary"
                size="lg"
                onClick={fetchDashboardData}
                className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="font-semibold">Refresh Data</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link key={index} href={stat.link}>
                <Card className={`border-l-4 ${stat.borderColor} hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group relative overflow-hidden bg-white`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`}></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-3 rounded-xl ${stat.bgColor} shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </div>
                    <div className="flex items-center text-xs font-medium mt-3">
                      {stat.changeType === 'positive' && (
                        <TrendingUp className="w-4 h-4 mr-1.5 text-green-600" />
                      )}
                      {stat.changeType === 'negative' && (
                        <AlertTriangle className="w-4 h-4 mr-1.5 text-red-600" />
                      )}
                      <span className={stat.changeType === 'negative' ? 'text-red-700 font-semibold' : stat.changeType === 'positive' ? 'text-green-700 font-semibold' : 'text-gray-600'}>
                        {stat.change}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Vehicles */}
          <Card className="border-t-4 border-blue-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <span>Assigned Vehicles</span>
                </CardTitle>
                <CardDescription className="mt-2 text-base">Your active vehicle fleet</CardDescription>
              </div>
              <Link href="/dashboard/staff/vehicles">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {assignedVehicles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Truck className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-700">No assigned vehicles</p>
                  <p className="text-sm text-gray-500 mt-1">Vehicles will appear here when assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-50/50 transition-all duration-300 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                          <Truck className="w-6 h-6 text-blue-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-gray-900 truncate">
                            {vehicle.reg_number}
                          </h4>
                          <p className="text-sm text-gray-600 truncate mt-0.5">
                            {vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getVehicleStatusColor(vehicle.status)} font-semibold px-3 py-1`}>
                          {vehicle.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/dashboard/vehicles?vehicle=${vehicle.id}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
                        >
                          <ArrowRight className="w-5 h-5 text-blue-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Maintenance */}
          <Card className="border-t-4 border-yellow-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Wrench className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span>Pending Maintenance</span>
                </CardTitle>
                <CardDescription className="mt-2 text-base">Tasks requiring attention</CardDescription>
              </div>
              <Link href="/dashboard/staff/maintenance">
                <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 font-semibold">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pendingMaintenance.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-700">No pending maintenance</p>
                  <p className="text-sm text-gray-500 mt-1">All maintenance tasks are up to date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingMaintenance.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-start justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-400 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-50/50 transition-all duration-300 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900 truncate mb-1">
                          {ticket.title || `Ticket #${ticket.id}`}
                        </h4>
                        {ticket.issue?.vehicle && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Vehicle: {ticket.issue.vehicle.reg_number}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Badge className={`text-xs font-semibold px-2.5 py-1 ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority || 'Medium'}
                          </Badge>
                          <Badge className={`text-xs font-semibold px-2.5 py-1 ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </Badge>
                        </div>
                        {ticket.due_at && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Due: {format(new Date(ticket.due_at), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/tickets?ticket=${ticket.id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 hover:bg-yellow-100"
                      >
                        <ArrowRight className="w-5 h-5 text-yellow-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completed Tasks */}
          <Card className="border-t-4 border-green-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span>Completed Tasks</span>
                </CardTitle>
                <CardDescription className="mt-2 text-base">Recently finished tasks</CardDescription>
              </div>
              <Link href="/dashboard/tickets?status=COMPLETED">
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 font-semibold">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {completedTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-700">No completed tasks yet</p>
                  <p className="text-sm text-gray-500 mt-1">Completed tasks will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedTasks.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-start justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-50/50 transition-all duration-300 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900 truncate mb-1">
                          {ticket.title || `Task #${ticket.id}`}
                        </h4>
                        {ticket.issue?.vehicle && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Vehicle: {ticket.issue.vehicle.reg_number}
                          </p>
                        )}
                        {ticket.completed_at && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            Completed: {format(new Date(ticket.completed_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-green-100 text-green-800 font-semibold px-3 py-1 border border-green-200">
                        Completed
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Routes */}
          <Card className="border-t-4 border-purple-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <span>Active Routes</span>
                </CardTitle>
                <CardDescription className="mt-2 text-base">Currently active shifts and routes</CardDescription>
              </div>
              <Link href="/dashboard/shifts?status=ACTIVE">
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-semibold">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activeRoutes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-700">No active routes</p>
                  <p className="text-sm text-gray-500 mt-1">Active shifts will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeRoutes.map((shift) => (
                    <div
                      key={shift.id}
                      className="flex items-start justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-50/50 transition-all duration-300 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-base font-bold text-gray-900">
                            {shift.vehicle?.reg_number || `Route #${shift.id}`}
                          </h4>
                          <Badge className={`${getStatusColor(shift.status)} font-semibold px-2.5 py-1`}>
                            {shift.status}
                          </Badge>
                        </div>
                        {shift.vehicle && (
                          <p className="text-sm text-gray-600 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" />
                            {shift.vehicle.make} {shift.vehicle.model}
                          </p>
                        )}
                        {shift.driver && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            Driver: {shift.driver.first_name} {shift.driver.last_name}
                          </p>
                        )}
                        {shift.start_at && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Started: {format(new Date(shift.start_at), 'MMM dd, HH:mm')}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/shifts?shift=${shift.id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 hover:bg-purple-100"
                      >
                        <ArrowRight className="w-5 h-5 text-purple-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-t-4 border-blue-500 shadow-2xl bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription className="text-base">Common staff operations and management tools</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => router.push('/dashboard/staff/users')}
                className="h-28 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-white/5 transition-all"></div>
                <Users className="w-10 h-10 group-hover:scale-110 transition-transform relative z-10" />
                <span className="font-bold text-base relative z-10">Manage Users</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10 opacity-0 group-hover:opacity-100" />
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/staff/vehicles')}
                variant="outline" 
                className="h-28 flex flex-col items-center justify-center space-y-2 border-2 border-blue-300 hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group relative overflow-hidden bg-white"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all"></div>
                <Truck className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform relative z-10" />
                <span className="font-bold text-base text-gray-800 relative z-10">Vehicle Fleet</span>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform relative z-10 opacity-0 group-hover:opacity-100" />
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/staff/maintenance')}
                variant="outline" 
                className="h-28 flex flex-col items-center justify-center space-y-2 border-2 border-purple-300 hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 transition-all duration-300 group relative overflow-hidden bg-white"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all"></div>
                <Wrench className="w-10 h-10 text-purple-600 group-hover:scale-110 transition-transform relative z-10" />
                <span className="font-bold text-base text-gray-800 relative z-10">Maintenance</span>
                <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform relative z-10 opacity-0 group-hover:opacity-100" />
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/tickets')}
                variant="outline" 
                className="h-28 flex flex-col items-center justify-center space-y-2 border-2 border-green-300 hover:border-green-500 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 transition-all duration-300 group relative overflow-hidden bg-white"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/10 transition-all"></div>
                <FileText className="w-10 h-10 text-green-600 group-hover:scale-110 transition-transform relative z-10" />
                <span className="font-bold text-base text-gray-800 relative z-10">Tickets</span>
                <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform relative z-10 opacity-0 group-hover:opacity-100" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
