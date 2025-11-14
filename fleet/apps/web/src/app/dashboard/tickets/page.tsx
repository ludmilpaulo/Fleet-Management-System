'use client';

import { useState, useEffect } from 'react';
import { Ticket, Search, Filter, Plus, User, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/dashboard-layout';
import HelpButton from '@/components/ui/help-button';
import { API_CONFIG } from '@/config/api';
import Cookies from 'js-cookie';

interface SupportTicket {
  id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  created_by: string;
  created_at: string;
  responses: number;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = Cookies.get('auth_token')
      if (!token) {
        console.error('No authentication token found')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TICKETS.LIST}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch tickets')
      }

      const data = await response.json()
      const ticketsData = Array.isArray(data) ? data : (data.results || [])
      
      // Transform API data to match our interface
      const transformedTickets: SupportTicket[] = ticketsData.map((ticket: any) => ({
        id: ticket.id || 0,
        title: ticket.title || ticket.subject || 'Untitled Ticket',
        description: ticket.description || ticket.body || 'No description',
        status: ticket.status || 'OPEN',
        priority: ticket.priority || 'MEDIUM',
        created_by: ticket.created_by?.full_name || ticket.created_by?.username || 'Unknown',
        created_at: ticket.created_at ? ticket.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        responses: ticket.responses_count || ticket.responses?.length || 0,
      }))
      
      setTickets(transformedTickets)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority: string) => {
    const badges = {
      HIGH: 'bg-red-100 text-red-800 border-red-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      LOW: 'bg-green-100 text-green-800 border-green-200',
    };
    return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      OPEN: 'bg-red-100 text-red-800 border-red-200',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      RESOLVED: 'bg-green-100 text-green-800 border-green-200',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <HelpButton role="staff" page="tickets" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Support Tickets
            </h1>
            <p className="text-gray-600 mt-1">Manage support requests and issues</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
            <Card key={status} className="border-l-4 border-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{status.replace('_', ' ')}</CardTitle>
                <Ticket className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tickets.filter(t => t.status === status).length}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{ticket.title}</h3>
                        <p className="text-sm text-gray-600">Created by {ticket.created_by}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`${getPriorityBadge(ticket.priority)} border`}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={`${getStatusBadge(ticket.status)} border`}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-700">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {ticket.created_at}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {ticket.responses} responses
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Add Response</Button>
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

