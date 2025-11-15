'use client';

import { useEffect, useMemo, useState } from 'react';
import { Truck, Search, Filter, Plus, Gauge, Wrench, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/dashboard-layout';
import HelpButton from '@/components/ui/help-button';
import { API_CONFIG } from '@/config/api';
import { apiClient, extractResults } from '@/lib/apiClient';

interface VehicleData {
  id: number;
  reg_number: string;
  make: string;
  model: string;
  year: number;
  status: string;
  mileage: number;
  updated_at?: string;
  current_shift_driver?: string;
  current_shift_started_at?: string;
}

export default function StaffVehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await apiClient(`${API_CONFIG.ENDPOINTS.VEHICLES.LIST}?page=1`);
      const results = extractResults<any>(data);

      const mapped: VehicleData[] = results.map((vehicle) => ({
        id: vehicle.id,
        reg_number: vehicle.reg_number,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        status: vehicle.status,
        mileage: vehicle.mileage || 0,
        updated_at: vehicle.updated_at,
        current_shift_driver: vehicle.current_shift?.driver_name || vehicle.current_shift?.driver || '',
        current_shift_started_at: vehicle.current_shift?.start_at || '',
      }));

      setVehicles(mapped);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      setError(err?.message || 'Unable to load vehicles right now.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    let filtered = vehicles.filter((vehicle) =>
      [vehicle.reg_number, vehicle.make, vehicle.model]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter((vehicle) => vehicle.status === statusFilter);
    }

    return filtered;
  }, [vehicles, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      INACTIVE: 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const activeVehicles = vehicles.filter((v) => v.status === 'ACTIVE').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'MAINTENANCE').length;
  const inactiveVehicles = vehicles.filter((v) => v.status === 'INACTIVE').length;
  const averageMileage = vehicles.length
    ? Math.round(vehicles.reduce((total, vehicle) => total + (vehicle.mileage || 0), 0) / vehicles.length)
    : 0;

  return (
    <DashboardLayout>
      <HelpButton role="staff" page="vehicles" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fleet Vehicles
            </h1>
            <p className="text-gray-600 mt-1">Monitor and manage your fleet vehicles</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add New Vehicle
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicles.length}</div>
              <p className="text-xs text-gray-600 mt-1">In fleet</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Truck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeVehicles}</div>
              <p className="text-xs text-gray-600 mt-1">On the road</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceVehicles}</div>
              <p className="text-xs text-gray-600 mt-1">Being serviced</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Mileage</CardTitle>
              <Gauge className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageMileage.toLocaleString()} km</div>
              <p className="text-xs text-gray-600 mt-1">Across all vehicles</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-gray-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <Truck className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveVehicles}</div>
              <p className="text-xs text-gray-600 mt-1">Awaiting assignment</p>
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
                  placeholder="Search by registration, make, or model..."
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Grid */}
        {error && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{vehicle.reg_number}</CardTitle>
                      <CardDescription>
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusBadge(vehicle.status)} border`}>
                    {vehicle.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center">
                    <Gauge className="h-4 w-4 mr-2 text-gray-600" />
                    Mileage
                  </span>
                  <span className="text-sm font-bold">{vehicle.mileage.toLocaleString()} km</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center">
                    <Wrench className="h-4 w-4 mr-2 text-gray-600" />
                    Current Shift
                  </span>
                  <span className="text-sm font-bold">
                    {vehicle.current_shift_driver || 'Not assigned'}
                  </span>
                </div>

                {vehicle.current_shift_started_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                      Shift Started
                    </span>
                    <span className="text-sm">{new Date(vehicle.current_shift_started_at).toLocaleString()}</span>
                  </div>
                )}

                {vehicle.updated_at && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Updated</span>
                    <span>{new Date(vehicle.updated_at).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Manage Shift
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading vehicles...</p>
            </CardContent>
          </Card>
        )}

        {!loading && filteredVehicles.length === 0 && !error && (
          <Card>
            <CardContent className="p-12 text-center">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

