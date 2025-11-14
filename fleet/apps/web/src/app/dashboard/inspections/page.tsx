'use client';

import { useState, useEffect } from 'react';
import { Shield, Search, Filter, Plus, Truck, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/dashboard-layout';
import HelpButton from '@/components/ui/help-button';
import { API_CONFIG } from '@/config/api';
import Cookies from 'js-cookie';

interface Inspection {
  id: number;
  vehicle: { reg_number: string; make: string; model: string };
  inspector: string;
  date: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  items_checked: number;
  issues_found: number;
  next_inspection: string;
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      const token = Cookies.get('auth_token')
      if (!token) {
        console.error('No authentication token found')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INSPECTIONS.LIST}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch inspections')
      }

      const data = await response.json()
      const inspectionsData = Array.isArray(data) ? data : (data.results || [])
      
      // Transform API data to match our interface
      const transformedInspections: Inspection[] = inspectionsData.map((inspection: any) => ({
        id: inspection.id || 0,
        vehicle: {
          reg_number: inspection.vehicle?.reg_number || inspection.shift?.vehicle?.reg_number || 'N/A',
          make: inspection.vehicle?.make || inspection.shift?.vehicle?.make || 'Unknown',
          model: inspection.vehicle?.model || inspection.shift?.vehicle?.model || 'Unknown',
        },
        inspector: inspection.inspector?.full_name || inspection.inspector?.username || 'Unknown Inspector',
        date: inspection.created_at ? inspection.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        status: inspection.status === 'PASS' ? 'PASSED' : (inspection.status === 'FAIL' ? 'FAILED' : 'PENDING'),
        items_checked: inspection.items_checked || 0,
        issues_found: inspection.issues_found || 0,
        next_inspection: inspection.next_inspection || '',
      }))
      
      setInspections(transformedInspections)
    } catch (error) {
      console.error('Error fetching inspections:', error)
    } finally {
      setLoading(false)
    }
  };

  const filteredInspections = inspections.filter(insp => {
    const matchesSearch = insp.vehicle.reg_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || insp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      PASSED: 'bg-green-100 text-green-800 border-green-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <HelpButton role="staff" page="inspections" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vehicle Inspections
            </h1>
            <p className="text-gray-600 mt-1">Monitor and manage vehicle safety inspections</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspections.filter(i => i.status === 'PASSED').length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspections.filter(i => i.status === 'FAILED').length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspections.filter(i => i.status === 'PENDING').length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspections.length}</div>
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
                  placeholder="Search by vehicle or inspector..."
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
                  <SelectItem value="PASSED">Passed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inspections List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredInspections.map((inspection) => (
            <Card key={inspection.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {inspection.vehicle.make} {inspection.vehicle.model} ({inspection.vehicle.reg_number})
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {inspection.date}
                        </span>
                        <span>Inspector: {inspection.inspector}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div>{inspection.items_checked} items checked</div>
                      <div className={inspection.issues_found > 0 ? 'text-red-600' : 'text-green-600'}>
                        {inspection.issues_found} issues found
                      </div>
                    </div>
                    <Badge className={`${getStatusBadge(inspection.status)} border`}>
                      {inspection.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

