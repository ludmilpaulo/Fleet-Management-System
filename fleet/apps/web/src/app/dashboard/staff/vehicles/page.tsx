'use client';

import { useState, useEffect } from 'react';
import { Truck, Search, Filter, Plus, MapPin, Gauge, Fuel, Wrench, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/layout/dashboard-layout';
import HelpButton from '@/components/ui/help-button';

interface VehicleData {
  id: number;
  reg_number: string;
  make: string;
  model: string;
  year: number;
  status: string;
  mileage: number;
  fuel_level: number;
  last_maintenance: string;
  next_maintenance_km: number;
  assigned_driver?: string;
}

export default function StaffVehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleData[]>([]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles, searchTerm, statusFilter]);

  const fetchVehicles = async () => {
    try {
      // Mock data - replace with real API call
      const mockVehicles: VehicleData[] = [
        {
          id: 1,
          reg_number: 'VH-001',
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          status: 'ACTIVE',
          mileage: 45231,
          fuel_level: 75,
          last_maintenance: '2024-12-15',
          next_maintenance_km: 50000,
          assigned_driver: 'James Driver',
        },
        {
          id: 2,
          reg_number: 'VH-002',
          make: 'Ford',
          model: 'Transit',
          year: 2022,
          status: 'ACTIVE',
          mileage: 67890,
          fuel_level: 45,
          last_maintenance: '2024-12-10',
          next_maintenance_km: 70000,
          assigned_driver: 'Maria Garcia',
        },
        {
          id: 3,
          reg_number: 'VH-003',
          make: 'Mercedes',
          model: 'Sprinter',
          year: 2021,
          status: 'MAINTENANCE',
          mileage: 89123,
          fuel_level: 30,
          last_maintenance: '2024-11-20',
          next_maintenance_km: 90000,
        },
        {
          id: 4,
          reg_number: 'VH-004',
          make: 'Isuzu',
          model: 'F-150',
          year: 2023,
          status: 'ACTIVE',
          mileage: 32456,
          fuel_level: 90,
          last_maintenance: '2024-12-18',
          next_maintenance_km: 35000,
          assigned_driver: 'David Chen',
        },
        {
          id: 5,
          reg_number: 'VH-005',
          make: 'Volvo',
          model: 'VNL',
          year: 2020,
          status: 'INACTIVE',
          mileage: 125678,
          fuel_level: 15,
          last_maintenance: '2024-10-05',
          next_maintenance_km: 130000,
        },
      ];
      setVehicles(mockVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = vehicles.filter(vehicle =>
      vehicle.reg_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    setFilteredVehicles(filtered);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      INACTIVE: 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getFuelLevelColor = (level: number) => {
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'MAINTENANCE').length;

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
              <CardTitle className="text-sm font-medium">Avg. Fuel</CardTitle>
              <Fuel className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(vehicles.reduce((acc, v) => acc + v.fuel_level, 0) / vehicles.length)}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Fleet average</p>
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
                {/* Fuel Level */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center">
                      <Fuel className="h-4 w-4 mr-2 text-gray-600" />
                      Fuel Level
                    </span>
                    <span className="text-sm font-bold">{vehicle.fuel_level}%</span>
                  </div>
                  <Progress value={vehicle.fuel_level} className="h-2" />
                </div>

                {/* Mileage */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center">
                    <Gauge className="h-4 w-4 mr-2 text-gray-600" />
                    Mileage
                  </span>
                  <span className="text-sm font-bold">{vehicle.mileage.toLocaleString()} km</span>
                </div>

                {/* Next Maintenance */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center">
                    <Wrench className="h-4 w-4 mr-2 text-gray-600" />
                    Next Service
                  </span>
                  <span className="text-sm font-bold">
                    {vehicle.next_maintenance_km.toLocaleString()} km
                    <span className="text-xs text-gray-600 ml-1">
                      ({(vehicle.next_maintenance_km - vehicle.mileage).toLocaleString()} km left)
                    </span>
                  </span>
                </div>

                {/* Assigned Driver */}
                {vehicle.assigned_driver && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                      Assigned Driver
                    </span>
                    <span className="text-sm font-bold">{vehicle.assigned_driver}</span>
                  </div>
                )}

                {/* Last Maintenance */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                    Last Service
                  </span>
                  <span className="text-sm">{vehicle.last_maintenance}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Schedule Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading vehicles...</p>
            </CardContent>
          </Card>
        )}

        {!loading && filteredVehicles.length === 0 && (
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

