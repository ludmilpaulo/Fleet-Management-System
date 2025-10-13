'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Filter, Plus, Mail, Phone, Shield, Edit, Trash2, Clock, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/dashboard-layout';

interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  is_active: boolean;
  last_login?: string;
}

export default function StaffUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      // Mock data - replace with real API call
      const mockUsers: UserData[] = [
        {
          id: 1,
          username: 'admin1',
          email: 'admin@fleetcorp.com',
          first_name: 'John',
          last_name: 'Admin',
          role: 'admin',
          phone: '+1 555-0101',
          is_active: true,
          last_login: '2 hours ago',
        },
        {
          id: 2,
          username: 'staff1',
          email: 'staff1@fleetcorp.com',
          first_name: 'Sarah',
          last_name: 'Staff',
          role: 'staff',
          phone: '+1 555-0102',
          is_active: true,
          last_login: '5 minutes ago',
        },
        {
          id: 3,
          username: 'driver1',
          email: 'driver1@fleetcorp.com',
          first_name: 'James',
          last_name: 'Driver',
          role: 'driver',
          phone: '+1 555-0103',
          is_active: true,
          last_login: '1 hour ago',
        },
        {
          id: 4,
          username: 'driver2',
          email: 'driver2@fleetcorp.com',
          first_name: 'Maria',
          last_name: 'Garcia',
          role: 'driver',
          phone: '+1 555-0104',
          is_active: true,
          last_login: '30 minutes ago',
        },
        {
          id: 5,
          username: 'inspector1',
          email: 'inspector1@fleetcorp.com',
          first_name: 'Lisa',
          last_name: 'Inspector',
          role: 'inspector',
          phone: '+1 555-0105',
          is_active: true,
          last_login: '15 minutes ago',
        },
        {
          id: 6,
          username: 'driver3',
          email: 'driver3@fleetcorp.com',
          first_name: 'David',
          last_name: 'Chen',
          role: 'driver',
          phone: '+1 555-0106',
          is_active: false,
          last_login: '2 days ago',
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      staff: 'bg-blue-100 text-blue-800 border-blue-200',
      driver: 'bg-green-100 text-green-800 border-green-200',
      inspector: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return badges[role as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getRoleName = (role: string) => {
    const names = {
      admin: 'Admin',
      staff: 'Staff',
      driver: 'Driver',
      inspector: 'Inspector',
    };
    return names[role as keyof typeof names] || role;
  };

  const activeUsers = users.filter(u => u.is_active).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const staffCount = users.filter(u => u.role === 'staff').length;
  const driverCount = users.filter(u => u.role === 'driver').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your team members and their roles</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-gray-600 mt-1">{activeUsers} active</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminCount}</div>
              <p className="text-xs text-gray-600 mt-1">Full access</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drivers</CardTitle>
              <Truck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{driverCount}</div>
              <p className="text-xs text-gray-600 mt-1">On the road</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff</CardTitle>
              <Users className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffCount}</div>
              <p className="text-xs text-gray-600 mt-1">Operations</p>
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
                  placeholder="Search by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="inspector">Inspector</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </CardContent>
            </Card>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {user.first_name[0]}{user.last_name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{user.first_name} {user.last_name}</h3>
                          <Badge className={`${getRoleBadge(user.role)} border`}>
                            {getRoleName(user.role)}
                          </Badge>
                          {user.is_active ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 border">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200 border">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </span>
                          )}
                          {user.last_login && (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Last login: {user.last_login}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

