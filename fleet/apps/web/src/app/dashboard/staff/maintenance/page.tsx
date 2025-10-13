'use client';

import { useState, useEffect } from 'react';
import { Wrench, Search, Filter, Plus, Truck, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/dashboard-layout';

interface MaintenanceRecord {
  id: number;
  vehicle: {
    reg_number: string;
    make: string;
    model: string;
  };
  type: string;
  status: string;
  scheduled_date: string;
  completed_date?: string;
  cost?: number;
  description: string;
  priority: string;
  assigned_to?: string;
}

export default function StaffMaintenancePage() {
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredMaintenance, setFilteredMaintenance] = useState<MaintenanceRecord[]>([]);

  useEffect(() => {
    fetchMaintenance();
  }, []);

  useEffect(() => {
    filterMaintenance();
  }, [maintenance, searchTerm, statusFilter]);

  const fetchMaintenance = async () => {
    try {
      // Mock data - replace with real API call
      const mockMaintenance: MaintenanceRecord[] = [
        {
          id: 1,
          vehicle: { reg_number: 'VH-001', make: 'Toyota', model: 'Camry' },
          type: 'Oil Change',
          status: 'SCHEDULED',
          scheduled_date: '2025-01-20',
          description: 'Regular oil change service',
          priority: 'medium',
          assigned_to: 'Tech Team A',
        },
        {
          id: 2,
          vehicle: { reg_number: 'VH-003', make: 'Mercedes', model: 'Sprinter' },
          type: 'Brake Repair',
          status: 'IN_PROGRESS',
          scheduled_date: '2025-01-15',
          description: 'Replace brake pads and rotors',
          priority: 'high',
          cost: 450.00,
          assigned_to: 'Tech Team B',
        },
        {
          id: 3,
          vehicle: { reg_number: 'VH-002', make: 'Ford', model: 'Transit' },
          type: 'Tire Rotation',
          status: 'COMPLETED',
          scheduled_date: '2025-01-10',
          completed_date: '2025-01-10',
          description: 'Rotate all tires and check pressure',
          priority: 'low',
          cost: 120.00,
          assigned_to: 'Tech Team A',
        },
        {
          id: 4,
          vehicle: { reg_number: 'VH-004', make: 'Isuzu', model: 'F-150' },
          type: 'Engine Diagnostics',
          status: 'SCHEDULED',
          scheduled_date: '2025-01-25',
          description: 'Check engine light diagnostic',
          priority: 'high',
          assigned_to: 'Tech Team C',
        },
        {
          id: 5,
          vehicle: { reg_number: 'VH-005', make: 'Volvo', model: 'VNL' },
          type: 'Transmission Service',
          status: 'PENDING',
          scheduled_date: '2025-02-01',
          description: 'Transmission fluid change',
          priority: 'medium',
        },
      ];
      setMaintenance(mockMaintenance);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMaintenance = () => {
    let filtered = maintenance.filter(record =>
      record.vehicle.reg_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    setFilteredMaintenance(filtered);
  };

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

  const scheduledCount = maintenance.filter(m => m.status === 'SCHEDULED').length;
  const inProgressCount = maintenance.filter(m => m.status === 'IN_PROGRESS').length;
  const completedCount = maintenance.filter(m => m.status === 'COMPLETED').length;
  const totalCost = maintenance
    .filter(m => m.cost && m.status === 'COMPLETED')
    .reduce((sum, m) => sum + (m.cost || 0), 0);

  return (
    <DashboardLayout>
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
                        <h3 className="font-semibold text-lg">{record.type}</h3>
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
                        Scheduled: {record.scheduled_date}
                      </span>
                      {record.completed_date && (
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                          Completed: {record.completed_date}
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

        {!loading && filteredMaintenance.length === 0 && (
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

