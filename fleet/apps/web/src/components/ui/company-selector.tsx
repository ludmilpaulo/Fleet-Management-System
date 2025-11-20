'use client';

import { useState, useEffect } from 'react';
import { Search, Building2, CheckCircle, AlertCircle, Plus, X } from 'lucide-react';
import { Input } from './input';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Label } from './label';
import { companyAPI, Company } from '@/lib/auth';

interface CompanySelectorProps {
  onCompanySelect: (company: Company) => void;
  selectedCompany?: Company | null;
}

export function CompanySelector({ onCompanySelect, selectedCompany }: CompanySelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await companyAPI.getCompanies();
      setCompanies(data);
    } catch (err: any) {
      setError('Failed to load companies');
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCompany = async () => {
    if (!newCompany.name || !newCompany.email) {
      setCreateError('Company name and email are required');
      return;
    }

    setCreating(true);
    setCreateError('');
    
    try {
      const createdCompany = await companyAPI.createCompany({
        name: newCompany.name,
        description: newCompany.description || undefined,
        email: newCompany.email,
        phone: newCompany.phone || undefined,
      });
      
      // Add to companies list
      setCompanies([...companies, createdCompany]);
      // Select the new company
      onCompanySelect(createdCompany);
      // Reset form
      setNewCompany({ name: '', description: '', email: '', phone: '' });
      setShowCreateForm(false);
      setSearchQuery('');
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || err.message || 'Failed to create company');
    } finally {
      setCreating(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'basic':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Select Your Company</h3>
        <p className="text-xs sm:text-sm text-gray-600">
          Choose the company you want to join or search for your organization
        </p>
      </div>

      {/* Search and Create Button */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {!showCreateForm && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCreateForm(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Company
          </Button>
        )}
      </div>

      {/* Create Company Form */}
      {showCreateForm && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Create New Company</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateError('');
                  setNewCompany({ name: '', description: '', email: '', phone: '' });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {createError && (
              <div className="flex items-center gap-2 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {createError}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  type="text"
                  placeholder="Enter company name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="company_email">Company Email *</Label>
                <Input
                  id="company_email"
                  type="email"
                  placeholder="company@example.com"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="company_phone">Phone (Optional)</Label>
                <Input
                  id="company_phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={newCompany.phone}
                  onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="company_description">Description (Optional)</Label>
                <textarea
                  id="company_description"
                  placeholder="Brief description of your company"
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <Button
                type="button"
                onClick={handleCreateCompany}
                disabled={creating || !newCompany.name || !newCompany.email}
                className="w-full"
              >
                {creating ? 'Creating...' : 'Create Company'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Companies List */}
      {!loading && !error && (
        <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Building2 className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm sm:text-base">No companies found</p>
              <p className="text-xs sm:text-sm">Try adjusting your search terms</p>
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <Card
                key={company.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCompany?.id === company.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onCompanySelect(company)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                          {company.name}
                        </h4>
                        {selectedCompany?.id === company.id && (
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      
                      {company.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                          {company.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <Badge className={`text-xs ${getPlanColor(company.subscription_plan)}`}>
                          {company.subscription_plan}
                        </Badge>
                        
                        {company.is_trial_active && (
                          <Badge variant="outline" className="text-xs">
                            Trial Active
                          </Badge>
                        )}
                        
                        <span className="text-xs text-gray-500">
                          {company.current_user_count || 0} users
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Selected Company Summary */}
      {selectedCompany && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="text-sm sm:text-base font-medium text-blue-900">Selected Company</span>
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-blue-900">{selectedCompany.name}</h4>
          {selectedCompany.description && (
            <p className="text-xs sm:text-sm text-blue-700 mt-1">{selectedCompany.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
            <Badge className={`text-xs ${getPlanColor(selectedCompany.subscription_plan)}`}>
              {selectedCompany.subscription_plan}
            </Badge>
            <span className="text-xs text-blue-600 break-all">
              {selectedCompany.email}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
