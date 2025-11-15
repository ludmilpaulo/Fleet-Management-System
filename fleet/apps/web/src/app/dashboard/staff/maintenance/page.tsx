'use client';

import { useState, useEffect, useMemo } from 'react';
import { Wrench, Search, Filter, Plus, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/dashboard-layout';
import HelpButton from '@/components/ui/help-button';
import { apiClient, extractResults } from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api';

interface MaintenanceRecord {
  id: number;
  vehicle: {
    reg_number?: string;
    make?: string;
    model?: string;
  };
  title: string;
  status: string;
  scheduled_date?: string;
  completed_date?: string;
  cost?: number;
  description: string;
  priority: string;
  assigned_to?: string;
}

const STATUS_MAP: Record<string, string> = {
  OPEN: 'SCHEDULED',
  ASSIGNED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CLOSED: 'COMPLETED',
};

export default function StaffMaintenancePage() {
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const data = await apiClient(`${API_CONFIG.ENDPOINTS.TICKETS.LIST}?page=1`);
      const tickets = extractResults<any>(data);

      const mapped: MaintenanceRecord[] = tickets
        .filter((ticket) => ticket.type === 'MAINTENANCE')
        .map((ticket) => ({
          id: ticket.id,
          vehicle: {
            reg_number: ticket.vehicle_reg,
            make: ticket.issue_data?.vehicle_data?.make,
            model: ticket.issue_data?.vehicle_data?.model,
          },
          title: ticket.title,
          status: STATUS_MAP[ticket.status] || ticket.status,
          scheduled_date: ticket.due_at || ticket.created_at,
          completed_date: ticket.completed_at,
          description: ticket.description || 'No description provided.',
          priority: (ticket.priority || 'medium').toLowerCase(),
          cost: Number(ticket.actual_cost) || Number(ticket.estimated_cost) || undefined,
          assigned_to: ticket.assignee_name,
        }));

      setMaintenance(mapped);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching maintenance records:', err);
      setError(err?.message || 'Unable to load maintenance records right now.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMaintenance = useMemo(() => {
    let filtered = maintenance.filter((record) =>
      [
        record.vehicle.reg_number,
        record.vehicle.make,
        record.vehicle.model,
        record.title,
        record.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    return filtered;
  }, [maintenance, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const badges = {
      SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-gray-100 text-gray-800 border-gray-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200',
    };
    return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const scheduledCount = maintenance.filter((m) => m.status === 'SCHEDULED').length;
  const inProgressCount = maintenance.filter((m) => m.status === 'IN_PROGRESS').length;
  const completedCount = maintenance.filter((m) => m.status === 'COMPLETED').length;
  const totalCost = maintenance
    .filter((m) => m.cost && m.status === 'COMPLETED')
    .reduce((sum, m) => sum + (m.cost || 0), 0);

  return (
    <DashboardLayout>
      <HelpButton role="staff" page="maintenance" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Maintenance Management
            </h1>
            <p className="text-gray-600 mt-1">Schedule and track vehicle maintenance</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledCount}</div>
              <p className="text-xs text-gray-600 mt-1">Upcoming services</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCount}</div>
              <p className="text-xs text-gray-600 mt-1">Currently servicing</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
              <p className="text-xs text-gray-600 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-gray-600 mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by vehicle, type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Maintenance List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredMaintenance.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{record.title}</h3>
                        <p className="text-sm text-gray-600">
                          {record.vehicle.make} {record.vehicle.model} ({record.vehicle.reg_number})
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{record.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={`${getStatusBadge(record.status)} border`}>
                        {record.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={`${getPriorityBadge(record.priority)} border`}>
                        {record.priority.toUpperCase()} PRIORITY
                      </Badge>
                      {record.assigned_to && (
                        <Badge variant="outline">
                          Assigned: {record.assigned_to}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Scheduled: {record.scheduled_date ? new Date(record.scheduled_date).toLocaleDateString() : 'Not set'}
                      </span>
                      {record.completed_date && (
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                          Completed: {new Date(record.completed_date).toLocaleDateString()}
                        </span>
                      )}
                      {record.cost && (
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${record.cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Update Status</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading maintenance records...</p>
            </CardContent>
          </Card>
        )}

        {!loading && filteredMaintenance.length === 0 && !error && (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No maintenance records found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

