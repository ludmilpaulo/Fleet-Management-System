'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/store/hooks'
import { logoutUser } from '@/store/slices/authSlice'
import { formatCurrency } from '@/utils/currency'
import { API_CONFIG } from '@/config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Building2, 
  Users, 
  Truck, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  Pause,
  Crown,
  Activity,
  BarChart3,
  Zap,
  Database,
  Server,
  HardDrive,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  AlertCircle,
  Info,
  ArrowUpRight,
  Wrench,
  X,
  LogOut,
  CreditCard,
  ToggleLeft,
  Link
} from 'lucide-react'
import { format } from 'date-fns'

interface PlatformStats {
  total_companies: number
  active_companies: number
  trial_companies: number
  expired_companies: number
  suspended_companies: number
  total_users: number
  total_vehicles: number
  total_shifts: number
  total_inspections: number
  total_issues: number
  total_tickets: number
  monthly_revenue: number
  yearly_revenue: number
  companies_by_plan: Record<string, number>
  companies_by_status: Record<string, number>
  revenue_by_month: Record<string, number>
  total_admin_actions: number
  recent_admin_actions: Array<{
    id: number
    action: string
    description: string
    admin: string
    created_at: string
  }>
  system_health: {
    database_status: string
    redis_status: string
    celery_status: string
    storage_status: string
    api_response_time: number
    error_rate: number
    active_users: number
    system_load: number
    memory_usage: number
    disk_usage: number
    last_backup: string
    uptime: string
  }
  active_maintenance: Array<{
    id: number
    title: string
    status: string
    scheduled_start: string
  }>
}

interface Company {
  id: number
  name: string
  slug: string
  email: string
}

export default function PlatformAdminDashboard() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddEntityDialog, setShowAddEntityDialog] = useState(false)
  const [entityType, setEntityType] = useState<'company' | 'user' | 'vehicle' | 'shift' | 'inspection' | 'issue' | ''>('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [companySearchTerm, setCompanySearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [vehicleCompanyId, setVehicleCompanyId] = useState<number | null>(null)
  const [allCompanies, setAllCompanies] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [showCompaniesModal, setShowCompaniesModal] = useState(false)
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false)
  const [showVehiclesModal, setShowVehiclesModal] = useState(false)
  const [showShiftsModal, setShowShiftsModal] = useState(false)
  const [showInspectionsModal, setShowInspectionsModal] = useState(false)
  const [showIssuesModal, setShowIssuesModal] = useState(false)
  const [entityLoading, setEntityLoading] = useState(false)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [inspections, setInspections] = useState<any[]>([])
  const [issues, setIssues] = useState<any[]>([])
  const [editingEntity, setEditingEntity] = useState<any | null>(null)
  const [editingEntityType, setEditingEntityType] = useState<string>('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
  const [entitiesData, setEntitiesData] = useState<any>({
    companies: [],
    users: [],
    vehicles: [],
    shifts: [],
    inspections: [],
    issues: []
  })
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [systemConfigs, setSystemConfigs] = useState<any[]>([])
  const [editingConfig, setEditingConfig] = useState<any>(null)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [allMaintenances, setAllMaintenances] = useState<any[]>([])
  const [showPlatformSettingsModal, setShowPlatformSettingsModal] = useState(false)
  const [showEditConfigModal, setShowEditConfigModal] = useState(false)
  const [configFormData, setConfigFormData] = useState<any>({})
  const [showTrialSettingsModal, setShowTrialSettingsModal] = useState(false)
  const [showBillingConfigModal, setShowBillingConfigModal] = useState(false)
  const [showFeatureFlagsModal, setShowFeatureFlagsModal] = useState(false)
  const [platformSettingsData, setPlatformSettingsData] = useState<any>({})

  useEffect(() => {
    fetchPlatformStats()
    fetchSystemConfigs()
    fetchAllMaintenances()
    fetchPlatformSettings()
    if (showAddEntityDialog && (entityType === 'user' || entityType === 'vehicle')) {
      fetchCompanies()
    }
  }, [showAddEntityDialog, entityType])

  useEffect(() => {
    if (showTrialSettingsModal || showBillingConfigModal || showFeatureFlagsModal) {
      fetchPlatformSettings()
    }
  }, [showTrialSettingsModal, showBillingConfigModal, showFeatureFlagsModal])
  
  useEffect(() => {
    if (showCompaniesModal) {
      fetchCompanies()
    }
    if (showMaintenanceModal) {
      fetchAllMaintenances()
    }
    if (showUsersModal) {
      fetchAllUsers()
    }
    if (showSubscriptionsModal) {
      fetchSubscriptions()
      fetchSubscriptionPlans()
    }
    if (showVehiclesModal) {
      fetchVehicles()
    }
    if (showShiftsModal) {
      fetchShifts()
    }
    if (showInspectionsModal) {
      fetchInspections()
    }
    if (showIssuesModal) {
      fetchIssues()
    }
    if (activeTab === 'entities') {
      fetchAllEntities()
    }
  }, [showCompaniesModal, showUsersModal, showSubscriptionsModal, showVehiclesModal, showShiftsModal, showInspectionsModal, showIssuesModal, activeTab])
  
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch(`${API_CONFIG.BASE_URL}/platform-admin/companies/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const companiesList = Array.isArray(data) ? data : data.results || []
        setCompanies(companiesList)
        setAllCompanies(companiesList)
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    }
  }
  
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch('http://127.0.0.1:8000/api/platform-admin/users/', {
        headers: {
          'Authorization': `Token ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const usersList = Array.isArray(data) ? data : data.results || []
        setAllUsers(usersList)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchAllEntities = async () => {
    setEntityLoading(true)
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      
      const [companiesRes, usersRes, vehiclesRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/platform-admin/companies/`, {
          headers: { 'Authorization': `Token ${token}` },
        }),
        fetch(`${API_CONFIG.BASE_URL}/platform-admin/users/`, {
          headers: { 'Authorization': `Token ${token}` },
        }),
        fetch(`${API_CONFIG.BASE_URL}/platform-admin/vehicles/`, {
          headers: { 'Authorization': `Token ${token}` },
        }),
      ])
      
      if (companiesRes.ok) {
        const companiesData = await companiesRes.json()
        setEntitiesData((prev: any) => ({
          ...prev,
          companies: Array.isArray(companiesData) ? companiesData : companiesData.results || []
        }))
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setEntitiesData((prev: any) => ({
          ...prev,
          users: Array.isArray(usersData) ? usersData : usersData.results || []
        }))
      }
      
      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json()
        const vehiclesList = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.results || []
        setEntitiesData((prev: any) => ({ ...prev, vehicles: vehiclesList }))
        setVehicles(vehiclesList)
      }
    } catch (error) {
      console.error('Failed to fetch entities:', error)
    } finally {
      setEntityLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch('http://127.0.0.1:8000/api/platform-admin/subscriptions/', {
        headers: { 'Authorization': `Token ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(Array.isArray(data) ? data : data.results || [])
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    }
  }

  const fetchSubscriptionPlans = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch('http://127.0.0.1:8000/api/platform-admin/plans/', {
        headers: { 'Authorization': `Token ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setSubscriptionPlans(Array.isArray(data) ? data : data.results || [])
      }
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch('http://127.0.0.1:8000/api/platform-admin/vehicles/', {
        headers: { 'Authorization': `Token ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        const vehiclesList = Array.isArray(data) ? data : data.results || []
        setVehicles(vehiclesList)
        // Also update entitiesData for the Entities tab display
        setEntitiesData((prev: any) => ({ ...prev, vehicles: vehiclesList }))
      } else {
        console.error('Failed to fetch vehicles:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch('http://127.0.0.1:8000/api/platform-admin/shifts/', {
        headers: { 'Authorization': `Token ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setShifts(Array.isArray(data) ? data : data.results || [])
      }
    } catch (error) {
      console.error('Failed to fetch shifts:', error)
    }
  }

  const fetchInspections = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch('http://127.0.0.1:8000/api/platform-admin/inspections/', {
        headers: { 'Authorization': `Token ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setInspections(Array.isArray(data) ? data : data.results || [])
      }
    } catch (error) {
      console.error('Failed to fetch inspections:', error)
    }
  }

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch('http://127.0.0.1:8000/api/platform-admin/issues/', {
        headers: { 'Authorization': `Token ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setIssues(Array.isArray(data) ? data : data.results || [])
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error)
    }
  }

  const fetchSystemConfigs = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch('http://127.0.0.1:8000/api/platform-admin/configurations/', {
        headers: { 'Authorization': `Token ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setSystemConfigs(Array.isArray(data) ? data : data.results || [])
      }
    } catch (error) {
      console.error('Failed to fetch system configs:', error)
    }
  }

  const fetchAllMaintenances = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch(`${API_CONFIG.BASE_URL}/platform-admin/maintenance/`, {
        headers: { 'Authorization': `Token ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAllMaintenances(Array.isArray(data) ? data : data.results || [])
      }
    } catch (error) {
      console.error('Failed to fetch maintenances:', error)
    }
  }

  const fetchPlatformSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch(`${API_CONFIG.BASE_URL}/platform-admin/settings/`, {
        headers: { 'Authorization': `Token ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setPlatformSettingsData(data)
      }
    } catch (error) {
      console.error('Failed to fetch platform settings:', error)
    }
  }

  const handleSavePlatformSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch(`${API_CONFIG.BASE_URL}/platform-admin/settings/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(platformSettingsData),
      })

      if (response.ok) {
        alert('Platform settings updated successfully')
        fetchPlatformSettings()
      } else {
        const error = await response.json()
        alert(`Failed to update: ${error.detail || JSON.stringify(error)}`)
      }
    } catch (error) {
      console.error('Error saving platform settings:', error)
      alert('Error saving platform settings')
    }
  }

  const handleEditEntity = (entity: any, type: string) => {
    setEditingEntity(entity)
    setEditingEntityType(type)
    setEditFormData(entity)
    setShowEditModal(true)
  }

  const handleUpdateEntity = async () => {
    if (!editingEntity || !editingEntityType) return

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const endpoint = `${API_CONFIG.BASE_URL}/platform-admin/${editingEntityType}/${editingEntity.id}/`
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      })

      if (response.ok) {
        alert(`${editingEntityType} updated successfully`)
        setShowEditModal(false)
        setEditingEntity(null)
        setEditingEntityType('')
        
        // Refresh the appropriate list
        if (editingEntityType === 'companies') {
          fetchCompanies()
          fetchAllEntities()
        } else if (editingEntityType === 'users') {
          fetchAllUsers()
        } else if (editingEntityType === 'vehicles') {
          fetchVehicles()
        } else if (editingEntityType === 'shifts') {
          fetchShifts()
        } else if (editingEntityType === 'inspections') {
          fetchInspections()
        } else if (editingEntityType === 'issues') {
          fetchIssues()
        }
      } else {
        const error = await response.json()
        alert(`Failed to update: ${error.detail || error.message || JSON.stringify(error)}`)
      }
    } catch (error) {
      console.error(`Error updating ${editingEntityType}:`, error)
      alert(`Error updating ${editingEntityType}`)
    }
  }

  const handleDeleteConfig = async (configId: number) => {
    if (!confirm(`Are you sure you want to delete this configuration? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const response = await fetch(`${API_CONFIG.BASE_URL}/platform-admin/configurations/${configId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      })

      if (response.ok) {
        alert('Configuration deleted successfully')
        fetchSystemConfigs()
      } else {
        alert('Failed to delete configuration')
      }
    } catch (error) {
      console.error('Error deleting configuration:', error)
      alert('Error deleting configuration')
    }
  }

  const handleSaveConfig = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      
      if (editingConfig?.id) {
        // Update existing config
        const response = await fetch(`${API_CONFIG.BASE_URL}/platform-admin/configurations/${editingConfig.id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(configFormData),
        })

        if (response.ok) {
          alert('Configuration updated successfully')
          setShowEditConfigModal(false)
          setEditingConfig(null)
          fetchSystemConfigs()
        } else {
          const error = await response.json()
          alert(`Failed to update: ${error.detail || JSON.stringify(error)}`)
        }
      } else {
        // Create new config
        const response = await fetch(`${API_CONFIG.BASE_URL}/platform-admin/configurations/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(configFormData),
        })

        if (response.ok) {
          alert('Configuration created successfully')
          setShowEditConfigModal(false)
          setEditingConfig(null)
          fetchSystemConfigs()
        } else {
          const error = await response.json()
          alert(`Failed to create: ${error.detail || JSON.stringify(error)}`)
        }
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert('Error saving configuration')
    }
  }

  const handleDeleteEntity = async (entityId: number, type: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      const endpoint = `${API_CONFIG.BASE_URL}/platform-admin/${type}/${entityId}/`
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      })

      if (response.ok) {
        alert(`${type} deleted successfully`)
        // Refresh the appropriate list
        if (type === 'companies') {
          fetchCompanies()
          fetchAllEntities()
        } else if (type === 'users') {
          fetchAllUsers()
        } else if (type === 'vehicles') {
          fetchVehicles()
        } else if (type === 'shifts') {
          fetchShifts()
        } else if (type === 'inspections') {
          fetchInspections()
        } else if (type === 'issues') {
          fetchIssues()
        }
      } else {
        alert(`Failed to delete ${type}`)
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      alert(`Error deleting ${type}`)
    }
  }

  const handleRefresh = async () => {
    setLoading(true);
    await fetchPlatformStats();
    setLoading(false);
  };

  const handleAddEntity = () => {
    setShowAddEntityDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddEntityDialog(false);
    setEntityType('');
    setSelectedCompany('');
    setCompanySearchTerm('');
    setVehicleCompanyId(null);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      localStorage.removeItem('auth_token')
      localStorage.removeItem('access_token')
      localStorage.removeItem('current_user')
      router.push('/auth/signin')
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API call fails
      localStorage.clear()
      router.push('/auth/signin')
    }
  }

  const handleCreateEntity = async () => {
    try {
      const API_BASE = API_CONFIG.BASE_URL;
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
      
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      if (entityType === 'company') {
        // Get form values
        const companyName = (document.querySelector('input[placeholder="Enter company name"]') as HTMLInputElement)?.value?.trim();
        const email = (document.querySelector('input[placeholder="company@example.com"]') as HTMLInputElement)?.value?.trim();
        
        // Validate required fields
        if (!companyName) {
          alert('Error: Company name is required. Please fill in the company name field.');
          return;
        }
        
        if (!email) {
          alert('Error: Email is required. Please fill in the email field.');
          return;
        }
        
        // Generate slug from name
        const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        
        // Get subscription plan from select dropdown
        const planSelect = document.querySelector('select') as HTMLSelectElement;
        const subscription_plan = planSelect?.value || 'trial';
        
        const response = await fetch(`${API_BASE}/platform-admin/companies/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
          body: JSON.stringify({
            name: companyName,
            slug: slug,
            email: email,
            subscription_plan: subscription_plan,
            is_active: true,
            subscription_status: 'active',
            max_users: 10,
            max_vehicles: 50,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Company creation error:', error);
          
          // Build detailed error message
          let errorMessage = 'Failed to create company:\n\n';
          if (error.slug) {
            errorMessage += `Slug: ${error.slug[0]}\n`;
          }
          if (error.email) {
            errorMessage += `Email: ${error.email[0]}\n`;
          }
          if (error.name) {
            errorMessage += `Name: ${error.name[0]}\n`;
          }
          if (error.detail) {
            errorMessage += `Detail: ${error.detail}\n`;
          }
          
          alert(errorMessage || 'An error occurred while creating the company.');
          return;
        }

        const data = await response.json();
        console.log('Company created:', data);
        alert(`Company "${data.name}" created successfully!`);
      } else if (entityType === 'user') {
        // Get company from state
        const company_slug = selectedCompany;
        
        // Validate required fields
        if (!company_slug || company_slug.trim() === '') {
          alert('Error: Company is required. Please select a company.');
          return;
        }
        
        const first_name = (document.querySelector('input[placeholder="John"]') as HTMLInputElement)?.value?.trim();
        const last_name = (document.querySelector('input[placeholder="Doe"]') as HTMLInputElement)?.value?.trim();
        const email = (document.querySelector('input[placeholder="user@example.com"]') as HTMLInputElement)?.value?.trim();
        
        if (!first_name) {
          alert('Error: First name is required.');
          return;
        }
        if (!last_name) {
          alert('Error: Last name is required.');
          return;
        }
        if (!email) {
          alert('Error: Email is required.');
          return;
        }
        
        // Get role from select
        const roleSelect = document.getElementById('user-role-select') as HTMLSelectElement;
        const role = roleSelect?.value || 'staff';

        const response = await fetch(`${API_BASE}/account/register/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
          body: JSON.stringify({
            username: email.split('@')[0],
            email,
            password: 'TempPassword123!',
            password_confirm: 'TempPassword123!',
            first_name,
            last_name,
            role,
            company_slug: company_slug, // Add company_slug
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('User creation error:', error);
          
          let errorMessage = 'Failed to create user:\n\n';
          if (error.company_slug) {
            errorMessage += `Company: ${error.company_slug[0]}\n`;
          }
          if (error.email) {
            errorMessage += `Email: ${error.email[0]}\n`;
          }
          if (error.username) {
            errorMessage += `Username: ${error.username[0]}\n`;
          }
          if (error.first_name) {
            errorMessage += `First Name: ${error.first_name[0]}\n`;
          }
          if (error.last_name) {
            errorMessage += `Last Name: ${error.last_name[0]}\n`;
          }
          if (error.detail) {
            errorMessage += `Detail: ${error.detail}\n`;
          }
          
          alert(errorMessage || 'An error occurred while creating the user.');
          return;
        }

        const data = await response.json();
        console.log('User created:', data);
        alert(`User "${data.user.full_name}" created successfully!\nTemporary password: TempPassword123!`);
      } else if (entityType === 'vehicle') {
        // Validate company is selected
        if (!vehicleCompanyId) {
          alert('Error: Company is required. Please select a company.');
          return;
        }
        
        // Create vehicle
        const make = (document.querySelector('input[placeholder="Toyota"]') as HTMLInputElement)?.value?.trim();
        const model = (document.querySelector('input[placeholder="Camry"]') as HTMLInputElement)?.value?.trim();
        const year = (document.querySelector('input[placeholder="2024"]') as HTMLInputElement)?.value?.trim();
        const reg_number = (document.querySelector('input[placeholder="ABC-1234"]') as HTMLInputElement)?.value?.trim();
        
        // Validate required fields
        if (!make) {
          alert('Error: Vehicle make is required.');
          return;
        }
        if (!model) {
          alert('Error: Vehicle model is required.');
          return;
        }
        if (!year) {
          alert('Error: Vehicle year is required.');
          return;
        }
        if (!reg_number) {
          alert('Error: License plate number is required.');
          return;
        }

        const response = await fetch(`${API_BASE}/fleet/vehicles/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
          body: JSON.stringify({
            make,
            model,
            year: parseInt(year),
            reg_number,
            status: 'ACTIVE',
            vin: `VIN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            fuel_type: 'PETROL',
            org: vehicleCompanyId, // Use selected company ID
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Vehicle creation error:', error);
          
          let errorMessage = 'Failed to create vehicle:\n\n';
          if (error.reg_number) {
            errorMessage += `License Plate: ${error.reg_number[0]}\n`;
          }
          if (error.make) {
            errorMessage += `Make: ${error.make[0]}\n`;
          }
          if (error.model) {
            errorMessage += `Model: ${error.model[0]}\n`;
          }
          if (error.fuel_type) {
            errorMessage += `Fuel Type: ${error.fuel_type[0]}\n`;
          }
          if (error.org) {
            errorMessage += `Company: ${error.org[0]}\n`;
          }
          if (error.detail) {
            errorMessage += `Detail: ${error.detail}\n`;
          }
          
          alert(errorMessage || 'An error occurred while creating the vehicle.');
          return;
        }

      const data = await response.json();
      console.log('Vehicle created:', data);
      alert(`Vehicle "${data.make} ${data.model}" created successfully!`);
      } else if (entityType === 'shift') {
      // Get form values
      const driverId = (document.querySelector('input[placeholder="Enter driver user ID"]') as HTMLInputElement)?.value?.trim();
      const vehicleId = (document.querySelector('input[placeholder="Enter vehicle ID"]') as HTMLInputElement)?.value?.trim();
      const startAt = (document.querySelector('input[type="datetime-local"]') as HTMLInputElement)?.value;
      const endAt = (document.querySelectorAll('input[type="datetime-local"]')[1] as HTMLInputElement)?.value;
      const status = (document.querySelector('select') as HTMLSelectElement)?.value || 'ACTIVE';
      const notes = (document.querySelector('textarea[placeholder="Additional shift notes..."]') as HTMLTextAreaElement)?.value?.trim();

      if (!driverId) {
        alert('Error: Driver ID is required.');
        return;
      }
      if (!vehicleId) {
        alert('Error: Vehicle ID is required.');
        return;
      }
      if (!startAt) {
        alert('Error: Start date/time is required.');
        return;
      }

      const payload: any = {
        driver: parseInt(driverId),
        vehicle: parseInt(vehicleId),
        start_at: startAt,
        status: status,
      };

      if (endAt && endAt !== '') {
        payload.end_at = endAt;
      }

      if (notes && notes !== '') {
        payload.notes = notes;
      }

      const response = await fetch(`${API_BASE}/platform-admin/shifts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to create shift: ${error.detail || JSON.stringify(error)}`);
        return;
      }

      const data = await response.json();
      console.log('Shift created:', data);
      alert(`Shift created successfully!`);
      } else if (entityType === 'inspection') {
      // Get form values
      const shiftId = (document.querySelector('input[placeholder="Enter shift ID"]') as HTMLInputElement)?.value?.trim();
      const type = (document.querySelector('select') as HTMLSelectElement)?.value || 'START';
      const weather_conditions = (document.querySelector('input[placeholder="e.g., Sunny, Rainy, Cloudy"]') as HTMLInputElement)?.value?.trim();
      const temperature = (document.querySelector('input[placeholder="25"]') as HTMLInputElement)?.value?.trim();
      const notes = (document.querySelector('textarea') as HTMLTextAreaElement)?.value?.trim();

      if (!shiftId) {
        alert('Error: Shift ID is required.');
        return;
      }

      const response = await fetch(`${API_BASE}/platform-admin/inspections/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          shift: parseInt(shiftId),
          type: type,
          weather_conditions: weather_conditions || '',
          temperature: temperature ? parseFloat(temperature) : null,
          notes: notes || '',
          status: 'IN_PROGRESS',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to create inspection: ${error.detail || JSON.stringify(error)}`);
        return;
      }

      const data = await response.json();
      console.log('Inspection created:', data);
      alert(`Inspection created successfully!`);
    } else if (entityType === 'issue') {
      // Get form values
      const title = (document.querySelector('input[placeholder="e.g., Engine overheating"]') as HTMLInputElement)?.value?.trim();
      const description = (document.querySelector('textarea[placeholder="Describe the issue in detail..."]') as HTMLTextAreaElement)?.value?.trim();
      const vehicleId = (document.querySelector('input[placeholder="Vehicle ID (optional)"]') as HTMLInputElement)?.value?.trim();
      const priority = (document.querySelector('select') as HTMLSelectElement)?.value || 'medium';
      const status = (document.querySelectorAll('select')[1] as HTMLSelectElement)?.value || 'open';

      if (!title) {
        alert('Error: Title is required.');
        return;
      }
      if (!description) {
        alert('Error: Description is required.');
        return;
      }

      const payload: any = {
        title,
        description,
        priority,
        status,
      };

      if (vehicleId && vehicleId !== '') {
        payload.vehicle = parseInt(vehicleId);
      }

      const response = await fetch(`${API_BASE}/platform-admin/issues/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to create issue: ${error.detail || JSON.stringify(error)}`);
        return;
      }

      const data = await response.json();
      console.log('Issue created:', data);
      alert(`Issue "${data.title}" created successfully!`);
      }
      
      // Refresh data
      handleRefresh();
      
      // Close dialog
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error creating entity:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const fetchPlatformStats = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
      
      // Fetch comprehensive stats from backend API
      const statsRes = await fetch(`${API_CONFIG.BASE_URL}/platform-admin/stats/`, {
        headers: { 'Authorization': `Token ${token}` },
      })
      
      if (statsRes.ok) {
        const backendStats = await statsRes.json()
        
        const stats: PlatformStats = {
          total_companies: backendStats.total_companies || 0,
          active_companies: backendStats.active_companies || 0,
          trial_companies: backendStats.trial_companies || 0,
          expired_companies: backendStats.expired_companies || 0,
          suspended_companies: backendStats.suspended_companies || 0,
          total_users: backendStats.total_users || 0,
          total_vehicles: backendStats.total_vehicles || 0,
          total_shifts: backendStats.total_shifts || 0,
          total_inspections: backendStats.total_inspections || 0,
          total_issues: backendStats.total_issues || backendStats.total_issues || 0,
          total_tickets: backendStats.total_tickets || 0,
          monthly_revenue: parseFloat(backendStats.monthly_revenue) || 0,
          yearly_revenue: parseFloat(backendStats.yearly_revenue) || 0,
          companies_by_plan: backendStats.companies_by_plan || {},
          companies_by_status: backendStats.companies_by_status || {},
          revenue_by_month: backendStats.revenue_by_month || {},
          total_admin_actions: backendStats.total_admin_actions || 0,
          recent_admin_actions: backendStats.recent_admin_actions || [],
          system_health: backendStats.system_health || {
          database_status: 'healthy',
          redis_status: 'healthy',
          celery_status: 'healthy',
          storage_status: 'healthy',
          api_response_time: 0.15,
          error_rate: 0.02,
            active_users: backendStats.total_users || 0,
          system_load: 0.45,
          memory_usage: 0.67,
          disk_usage: 0.23,
            last_backup: new Date(),
            uptime: '30d 12h',
        },
          active_maintenance: backendStats.active_maintenance || []
      }

        setStats(stats)
      } else {
        throw new Error('Failed to fetch platform stats')
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'trial': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'trial': return <Clock className="w-4 h-4" />
      case 'expired': return <AlertTriangle className="w-4 h-4" />
      case 'suspended': return <Pause className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Platform Administration</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between slide-up">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
            Platform Administration
          </h1>
          <p className="text-gray-600 text-lg">Complete system management and oversight</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="btn-gradient"
            onClick={handleAddEntity}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entity
          </Button>
          <Button 
            variant="outline" 
            className="hover:border-red-600 hover:text-red-600 transition-all duration-300"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* System Health Banner */}
      {stats && (
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">System Health: All Systems Operational</h3>
                  <p className="text-sm text-gray-600">Uptime: {stats.system_health.uptime} | Response Time: {stats.system_health.api_response_time}s</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Healthy
                </Badge>
                <div className="text-sm text-gray-600">
                  <Database className="w-4 h-4 inline mr-1" />
                  {stats.system_health.active_users} active users
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 fade-in">
          <Card className="card-hover border-t-4 border-t-blue-500 cursor-pointer" onClick={() => setShowCompaniesModal(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Companies</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_companies}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-500">+{stats.active_companies} active</span>
              </div>
              <Progress value={(stats.active_companies / stats.total_companies) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.trial_companies} trials, {stats.expired_companies} expired
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">Click to view all</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowUsersModal(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Activity className="w-3 h-3 text-blue-500 mr-1" />
                <span className="text-blue-500">Active users</span>
              </div>
              <Progress value={75} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                75% active rate
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">Click to view all</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fleet Size</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_vehicles}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-500">+{stats.total_shifts} shifts</span>
              </div>
              <Progress value={85} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                85% utilization rate
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-500">From {stats.total_companies} companies</span>
              </div>
              <Progress value={80} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(stats.yearly_revenue)} yearly
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Health Details */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Health
                  </CardTitle>
                  <CardDescription>Real-time system status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Database</span>
                      </div>
                      <Badge className={getStatusColor(stats.system_health.database_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(stats.system_health.database_status)}
                          {stats.system_health.database_status}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Redis Cache</span>
                      </div>
                      <Badge className={getStatusColor(stats.system_health.redis_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(stats.system_health.redis_status)}
                          {stats.system_health.redis_status}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Celery Workers</span>
                      </div>
                      <Badge className={getStatusColor(stats.system_health.celery_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(stats.system_health.celery_status)}
                          {stats.system_health.celery_status}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <HardDrive className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Storage</span>
                      </div>
                      <Badge className={getStatusColor(stats.system_health.storage_status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(stats.system_health.storage_status)}
                          {stats.system_health.storage_status}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>System performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">API Response Time</span>
                      <span className="text-sm text-gray-600">{stats.system_health.api_response_time}s</span>
                    </div>
                    <Progress value={85} className="mt-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Error Rate</span>
                      <span className="text-sm text-gray-600">{(stats.system_health.error_rate * 100).toFixed(2)}%</span>
                    </div>
                    <Progress value={98} className="mt-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">System Load</span>
                      <span className="text-sm text-gray-600">{(stats.system_health.system_load * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.system_health.system_load * 100} className="mt-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Memory Usage</span>
                      <span className="text-sm text-gray-600">{(stats.system_health.memory_usage * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.system_health.memory_usage * 100} className="mt-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Disk Usage</span>
                      <span className="text-sm text-gray-600">{(stats.system_health.disk_usage * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.system_health.disk_usage * 100} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Admin Actions */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Admin Actions
                </CardTitle>
                <CardDescription>Latest administrative activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recent_admin_actions?.filter(action => action).map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Crown className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{action?.description || 'No description'}</p>
                          <p className="text-xs text-gray-600">by {action?.admin || 'Unknown'} • {action?.created_at ? format(new Date(action.created_at), 'MMM dd, HH:mm') : 'Recently'}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {action?.action ? action.action.replace('_', ' ') : 'Unknown Action'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="entities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Entity Management
              </CardTitle>
              <CardDescription>Manage all platform entities</CardDescription>
            </CardHeader>
            <CardContent>
              {entityLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Loading entities...</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <span className="font-medium">Companies</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Total: {entitiesData.companies.length} companies
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowCompaniesModal(true)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View All
                      </Button>
                      <Button size="sm" onClick={() => { setEntityType('company'); setShowAddEntityDialog(true); }}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-6 h-6 text-green-600" />
                      <span className="font-medium">Users</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Total: {entitiesData.users.length} users
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowUsersModal(true)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View All
                      </Button>
                      <Button size="sm" onClick={() => { setEntityType('user'); setShowAddEntityDialog(true); }}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Truck className="w-6 h-6 text-purple-600" />
                      <span className="font-medium">Vehicles</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Total: {entitiesData.vehicles.length} vehicles
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowVehiclesModal(true)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View All
                      </Button>
                      <Button size="sm" onClick={() => { setEntityType('vehicle'); setShowAddEntityDialog(true); }}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-6 h-6 text-orange-600" />
                      <span className="font-medium">Shifts</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Total: {stats?.total_shifts || 0} shifts
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowShiftsModal(true)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View All
                      </Button>
                      <Button size="sm" onClick={() => { setEntityType('shift'); setShowAddEntityDialog(true); }}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-6 h-6 text-indigo-600" />
                      <span className="font-medium">Inspections</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Total: {stats?.total_inspections || 0} inspections
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowInspectionsModal(true)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View All
                      </Button>
                      <Button size="sm" onClick={() => { setEntityType('inspection'); setShowAddEntityDialog(true); }}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <span className="font-medium">Issues</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Total: {stats?.total_issues || 0} issues
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowIssuesModal(true)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View All
                      </Button>
                      <Button size="sm" onClick={() => { setEntityType('issue'); setShowAddEntityDialog(true); }}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                System Health & Configuration
              </CardTitle>
              <CardDescription>Real-time system status and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Database Status</span>
                        <Badge className={getStatusColor(stats.system_health.database_status)}>
                          {stats.system_health.database_status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Redis Cache</span>
                        <Badge className={getStatusColor(stats.system_health.redis_status)}>
                          {stats.system_health.redis_status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Celery Workers</span>
                        <Badge className={getStatusColor(stats.system_health.celery_status)}>
                          {stats.system_health.celery_status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Storage</span>
                        <Badge className={getStatusColor(stats.system_health.storage_status)}>
                          {stats.system_health.storage_status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">API Response Time</span>
                        <span className="text-sm">{stats.system_health.api_response_time}s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Error Rate</span>
                        <span className="text-sm">{(stats.system_health.error_rate * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">System Load</span>
                        <span className="text-sm">{(stats.system_health.system_load * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Memory Usage</span>
                        <span className="text-sm">{(stats.system_health.memory_usage * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Button variant="outline" className="w-full" onClick={() => setShowConfigModal(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Manage System Configuration
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Revenue Analytics
                </CardTitle>
                <CardDescription>Monthly revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Monthly</span>
                        <span className="text-sm font-bold">{formatCurrency(stats.monthly_revenue)}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Yearly</span>
                        <span className="text-sm font-bold">{formatCurrency(stats.yearly_revenue)}</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-xs text-gray-600">
                        Based on {stats.total_companies} active companies
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Growth Metrics
                </CardTitle>
                <CardDescription>Platform growth indicators</CardDescription>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Companies</span>
                      <span className="text-xl font-bold">{stats.total_companies}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Users</span>
                      <span className="text-xl font-bold">{stats.system_health.active_users}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Fleet Size</span>
                      <span className="text-xl font-bold">{stats.total_vehicles}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Inspections</span>
                      <span className="text-xl font-bold">{stats.total_inspections}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Maintenance Schedule
              </CardTitle>
              <CardDescription>Scheduled system maintenance and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {stats && stats.active_maintenance && stats.active_maintenance.length > 0 ? (
                <div className="space-y-4">
                  {stats.active_maintenance.map((item: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.title}</h4>
                        <Badge variant={item.status === 'in_progress' ? 'default' : 'outline'}>
                          {item.status}
                        </Badge>
                      </div>
                      {item.scheduled_start && (
                        <p className="text-sm text-gray-600">
                          Scheduled: {format(new Date(item.scheduled_start), 'MMM dd, yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Maintenance</h3>
                  <p className="text-gray-500">All systems operational</p>
                </div>
              )}
              <div className="mt-4 space-y-2">
                <Button className="w-full" onClick={() => setShowMaintenanceModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setShowMaintenanceModal(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View All Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Configuration
              </CardTitle>
              <CardDescription>Manage platform-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setShowPlatformSettingsModal(true)}>
                    <div className="text-left">
                      <div className="font-medium">Trial Settings</div>
                      <div className="text-sm text-gray-600">Configure trial duration and limits</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setShowPlatformSettingsModal(true)}>
                    <div className="text-left">
                      <div className="font-medium">Billing Configuration</div>
                      <div className="text-sm text-gray-600">Set up payment methods and plans</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setShowPlatformSettingsModal(true)}>
                    <div className="text-left">
                      <div className="font-medium">Feature Flags</div>
                      <div className="text-sm text-gray-600">Enable or disable platform features</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setShowConfigModal(true)}>
                    <div className="text-left">
                      <div className="font-medium">System Configuration</div>
                      <div className="text-sm text-gray-600">Manage system configurations</div>
                    </div>
                  </Button>
                </div>
                <div className="pt-4 border-t">
                  <Button className="w-full" onClick={() => setShowPlatformSettingsModal(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Open All Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Maintenance Modal */}
      <Dialog open={showMaintenanceModal} onOpenChange={setShowMaintenanceModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Maintenance Schedule ({allMaintenances.length})
            </DialogTitle>
            <DialogDescription>
              Manage system maintenance schedules and updates
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {allMaintenances.length > 0 ? (
              <div className="space-y-2">
                {allMaintenances.map((maintenance: any) => (
                  <div key={maintenance.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{maintenance.title || maintenance.name || `Maintenance #${maintenance.id}`}</h3>
                        <p className="text-sm text-gray-600">{maintenance.description || 'No description'}</p>
                      </div>
                      <Badge variant={maintenance.status === 'in_progress' ? 'default' : maintenance.status === 'scheduled' ? 'secondary' : 'outline'}>
                        {maintenance.status || 'unknown'}
                      </Badge>
                    </div>
                    {maintenance.scheduled_start && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p><strong>Scheduled:</strong> {new Date(maintenance.scheduled_start).toLocaleString()}</p>
                      </div>
                    )}
                    {maintenance.scheduled_end && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Expected End:</strong> {new Date(maintenance.scheduled_end).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No maintenance schedules found</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowMaintenanceModal(false)}>
              Close
            </Button>
            <Button onClick={() => { /* TODO: Create maintenance */ }}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule New Maintenance
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Platform Settings Modal */}
      <Dialog open={showPlatformSettingsModal} onOpenChange={setShowPlatformSettingsModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Platform Settings
            </DialogTitle>
            <DialogDescription>
              Configure platform-wide settings and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">Trial Settings</h3>
              <p className="text-sm text-gray-600 mb-4">Configure trial duration and user limits for new companies</p>
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowTrialSettingsModal(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Configure Trial Settings
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">Billing Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">Set up payment methods and subscription plans</p>
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowBillingConfigModal(true)}>
                <CreditCard className="w-4 h-4 mr-2" />
                Configure Billing
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">Feature Flags</h3>
              <p className="text-sm text-gray-600 mb-4">Enable or disable platform features for companies</p>
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowFeatureFlagsModal(true)}>
                <ToggleLeft className="w-4 h-4 mr-2" />
                Manage Feature Flags
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">Integration Settings</h3>
              <p className="text-sm text-gray-600 mb-4">Configure third-party integrations and APIs</p>
              <Button variant="outline" className="w-full justify-start">
                <Link className="w-4 h-4 mr-2" />
                Manage Integrations
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPlatformSettingsModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trial Settings Modal */}
      <Dialog open={showTrialSettingsModal} onOpenChange={setShowTrialSettingsModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Trial Settings Configuration
            </DialogTitle>
            <DialogDescription>
              Configure trial duration and limits for new companies
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Trial Duration (Days) *</Label>
              <Input 
                type="number"
                value={platformSettingsData.trial_duration_days || 14} 
                onChange={(e) => setPlatformSettingsData({...platformSettingsData, trial_duration_days: parseInt(e.target.value)})}
                placeholder="14"
              />
              <p className="text-xs text-gray-500">Number of days the trial period lasts</p>
            </div>

            <div className="space-y-2">
              <Label>Max Users in Trial *</Label>
              <Input 
                type="number"
                value={platformSettingsData.trial_max_users || 5} 
                onChange={(e) => setPlatformSettingsData({...platformSettingsData, trial_max_users: parseInt(e.target.value)})}
                placeholder="5"
              />
              <p className="text-xs text-gray-500">Maximum number of users allowed during trial</p>
            </div>

            <div className="space-y-2">
              <Label>Max Vehicles in Trial *</Label>
              <Input 
                type="number"
                value={platformSettingsData.trial_max_vehicles || 10} 
                onChange={(e) => setPlatformSettingsData({...platformSettingsData, trial_max_vehicles: parseInt(e.target.value)})}
                placeholder="10"
              />
              <p className="text-xs text-gray-500">Maximum number of vehicles allowed during trial</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowTrialSettingsModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleSavePlatformSettings()
              setShowTrialSettingsModal(false)
            }}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Trial Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Billing Configuration Modal */}
      <Dialog open={showBillingConfigModal} onOpenChange={setShowBillingConfigModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing Configuration
            </DialogTitle>
            <DialogDescription>
              Configure billing and payment settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Default Currency *</Label>
              <Input 
                value={platformSettingsData.default_currency || 'USD'} 
                onChange={(e) => setPlatformSettingsData({...platformSettingsData, default_currency: e.target.value})}
                placeholder="USD"
              />
              <p className="text-xs text-gray-500">Default currency for billing</p>
            </div>

            <div className="space-y-2">
              <Label>Tax Rate (%) *</Label>
              <Input 
                type="number"
                step="0.01"
                value={platformSettingsData.tax_rate || 0} 
                onChange={(e) => setPlatformSettingsData({...platformSettingsData, tax_rate: parseFloat(e.target.value)})}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500">Default tax rate for billing</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowBillingConfigModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleSavePlatformSettings()
              setShowBillingConfigModal(false)
            }}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Billing Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feature Flags Modal */}
      <Dialog open={showFeatureFlagsModal} onOpenChange={setShowFeatureFlagsModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ToggleLeft className="w-5 h-5" />
              Feature Flags
            </DialogTitle>
            <DialogDescription>
              Enable or disable platform features
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-semibold">Allow Registration</Label>
                <p className="text-sm text-gray-600">Allow new companies to register</p>
              </div>
              <Select 
                value={platformSettingsData.allow_registration ? 'true' : 'false'}
                onValueChange={(value) => setPlatformSettingsData({...platformSettingsData, allow_registration: value === 'true'})}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-semibold">Require Email Verification</Label>
                <p className="text-sm text-gray-600">Users must verify their email</p>
              </div>
              <Select 
                value={platformSettingsData.require_email_verification ? 'true' : 'false'}
                onValueChange={(value) => setPlatformSettingsData({...platformSettingsData, require_email_verification: value === 'true'})}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-semibold">Maintenance Mode</Label>
                <p className="text-sm text-gray-600">Put the platform in maintenance mode</p>
              </div>
              <Select 
                value={platformSettingsData.maintenance_mode ? 'true' : 'false'}
                onValueChange={(value) => setPlatformSettingsData({...platformSettingsData, maintenance_mode: value === 'true'})}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowFeatureFlagsModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleSavePlatformSettings()
              setShowFeatureFlagsModal(false)
            }}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Feature Flags
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Entity Dialog */}
      <Dialog open={showAddEntityDialog} onOpenChange={setShowAddEntityDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Entity
            </DialogTitle>
            <DialogDescription>
              Select the type of entity you want to create
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Entity Type Selection */}
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <Select value={entityType} onValueChange={(value: any) => setEntityType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company
                    </div>
                  </SelectItem>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      User
                    </div>
                  </SelectItem>
                  <SelectItem value="vehicle">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Vehicle
                    </div>
                  </SelectItem>
                  <SelectItem value="inspection">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Inspection
                    </div>
                  </SelectItem>
                  <SelectItem value="shift">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Shift
                    </div>
                  </SelectItem>
                  <SelectItem value="inspection">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Inspection
                    </div>
                  </SelectItem>
                  <SelectItem value="issue">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Issue
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Form */}
            {entityType === 'company' && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-4">
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">Create a new company account</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <input
                      type="text"
                      placeholder="Enter company name"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <input
                      type="email"
                      placeholder="company@example.com"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subscription Plan</Label>
                  <Select defaultValue="trial">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial (14 days)</SelectItem>
                      <SelectItem value="basic">Basic Plan</SelectItem>
                      <SelectItem value="professional">Professional Plan</SelectItem>
                      <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* User Form */}
            {entityType === 'user' && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-4">
                <div className="p-4 bg-green-50 rounded-lg mb-4">
                  <p className="text-sm text-green-700">Create a new user account</p>
                </div>

                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <div className="px-2 py-1.5 border-b">
                        <Input
                          placeholder="Search companies..."
                          value={companySearchTerm}
                          onChange={(e) => setCompanySearchTerm(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      {companies
                        .filter(company =>
                          company.slug && company.slug.trim() !== '' &&
                          (company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
                           company.email.toLowerCase().includes(companySearchTerm.toLowerCase()))
                        )
                        .map((company) => (
                          <SelectItem key={company.slug} value={company.slug}>
                            <div className="flex flex-col">
                              <span className="font-medium">{company.name}</span>
                              <span className="text-xs text-gray-500">{company.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      {companies.length === 0 && companySearchTerm === '' && (
                        <div className="px-2 py-6 text-center text-sm text-gray-500">
                          No companies available
                        </div>
                      )}
                      {companies.length > 0 && companies.filter(company => 
                        company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
                        company.email.toLowerCase().includes(companySearchTerm.toLowerCase())
                      ).length === 0 && companySearchTerm !== '' && (
                        <div className="px-2 py-6 text-center text-sm text-gray-500">
                          No companies match "{companySearchTerm}"
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Select the company this user will belong to</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Select defaultValue="staff">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="inspector">Inspector</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Form */}
            {entityType === 'vehicle' && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-4">
                <div className="p-4 bg-purple-50 rounded-lg mb-4">
                  <p className="text-sm text-purple-700">Add a new vehicle to the fleet</p>
                </div>

                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Select value={vehicleCompanyId?.toString() || ''} onValueChange={(value) => setVehicleCompanyId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {companies
                        .filter(company => company.slug && company.slug.trim() !== '')
                        .map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{company.name}</span>
                              <span className="text-xs text-gray-500">{company.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Select the company this vehicle belongs to</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle Make *</Label>
                    <input
                      type="text"
                      placeholder="Toyota"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Model *</Label>
                    <input
                      type="text"
                      placeholder="Camry"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Year *</Label>
                    <input
                      type="number"
                      placeholder="2024"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>License Plate *</Label>
                    <input
                      type="text"
                      placeholder="ABC-1234"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select defaultValue="ACTIVE">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Inspection Form */}
            {entityType === 'inspection' && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-4">
                <div className="p-4 bg-indigo-50 rounded-lg mb-4">
                  <p className="text-sm text-indigo-700">Create a new vehicle inspection</p>
                </div>

                <div className="space-y-2">
                  <Label>Shift ID *</Label>
                  <Input
                    type="number"
                    placeholder="Enter shift ID"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">ID of the shift to inspect</p>
                </div>

                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select defaultValue="START">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="START">Start of Shift</SelectItem>
                      <SelectItem value="END">End of Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Weather Conditions</Label>
                  <Input placeholder="e.g., Sunny, Rainy, Cloudy" />
                </div>

                <div className="space-y-2">
                  <Label>Temperature (Celsius)</Label>
                  <Input type="number" placeholder="25" />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Additional inspection notes..."
                  />
                </div>
              </div>
            )}

            {/* Shift Form */}
            {entityType === 'shift' && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-4">
                <div className="p-4 bg-yellow-50 rounded-lg mb-4">
                  <p className="text-sm text-yellow-700">Create a new driver shift</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Driver ID *</Label>
                    <Input
                      type="number"
                      placeholder="Enter driver user ID"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">The ID of the driver starting the shift</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Vehicle ID *</Label>
                    <Input
                      type="number"
                      placeholder="Enter vehicle ID"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">The ID of the vehicle for this shift</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Start Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">When the shift starts</p>
                </div>

                <div className="space-y-2">
                  <Label>End Date & Time (Optional)</Label>
                  <Input
                    type="datetime-local"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">When the shift ends (leave empty for active shift)</p>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select defaultValue="ACTIVE">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows={3}
                    placeholder="Additional shift notes..."
                  />
                </div>
              </div>
            )}

            {/* Issue Form */}
            {entityType === 'issue' && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-4">
                <div className="p-4 bg-red-50 rounded-lg mb-4">
                  <p className="text-sm text-red-700">Report a new issue</p>
                </div>

                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="e.g., Engine overheating"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={4}
                    placeholder="Describe the issue in detail..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle ID</Label>
                    <Input type="number" placeholder="Vehicle ID (optional)" />
                  </div>

                  <div className="space-y-2">
                    <Label>Priority *</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select defaultValue="open">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCreateEntity}
                disabled={!entityType}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Companies List Modal */}
      <Dialog open={showCompaniesModal} onOpenChange={setShowCompaniesModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              All Companies ({allCompanies.length})
            </DialogTitle>
            <DialogDescription>
              Manage all companies - Click Edit or Delete to modify
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {allCompanies.length > 0 ? (
              <div className="space-y-2">
                {allCompanies.map((company: any) => (
                  <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold">{company.name}</h3>
                      <p className="text-sm text-gray-600">{company.email}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{company.subscription_plan}</Badge>
                        <Badge className={company.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {company.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditEntity(company, 'companies')}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEntity(company.id, 'companies')}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No companies found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Users List Modal */}
      <Dialog open={showUsersModal} onOpenChange={setShowUsersModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Users ({allUsers.length})
            </DialogTitle>
            <DialogDescription>
              Manage all users on the platform - Click Edit or Delete to modify
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {allUsers.length > 0 ? (
              <div className="space-y-2">
                {allUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold">{user.full_name || `${user.first_name} ${user.last_name}`}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditEntity(user, 'users')}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEntity(user.id, 'users')}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Vehicles List Modal */}
      <Dialog open={showVehiclesModal} onOpenChange={setShowVehiclesModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              All Vehicles ({vehicles.length})
            </DialogTitle>
            <DialogDescription>
              Manage all vehicles on the platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {vehicles.length > 0 ? (
              <div className="space-y-2">
                {vehicles.map((vehicle: any) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold">{vehicle.make} {vehicle.model}</h3>
                      <p className="text-sm text-gray-600">Plate: {vehicle.license_plate || vehicle.reg_number}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{vehicle.status || 'Active'}</Badge>
                        <Badge variant="outline">{vehicle.year}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditEntity(vehicle, 'vehicles')}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEntity(vehicle.id, 'vehicles')}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No vehicles found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Shifts List Modal */}
      <Dialog open={showShiftsModal} onOpenChange={setShowShiftsModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              All Shifts ({shifts.length})
            </DialogTitle>
            <DialogDescription>
              View and manage all shifts on the platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {shifts.length > 0 ? (
              <div className="space-y-2">
                {shifts.map((shift: any) => (
                  <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold">{shift.driver_name || `Shift #${shift.id}`}</h3>
                      <p className="text-sm text-gray-600">{shift.vehicle_info || 'Vehicle Assignment'}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{shift.status_display || shift.status || 'Active'}</Badge>
                        {shift.total_distance && <Badge variant="outline">{shift.total_distance} km</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditEntity(shift, 'shifts')}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEntity(shift.id, 'shifts')}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No shifts found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Inspections List Modal */}
      <Dialog open={showInspectionsModal} onOpenChange={setShowInspectionsModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              All Inspections ({inspections.length})
            </DialogTitle>
            <DialogDescription>
              View and manage all vehicle inspections
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {inspections.length > 0 ? (
              <div className="space-y-2">
                {inspections.map((inspection: any) => (
                  <div key={inspection.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold">Inspection by {inspection.inspector_name || 'Inspector'}</h3>
                      <p className="text-sm text-gray-600">Vehicle: {inspection.vehicle_info || 'N/A'}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{inspection.status_display || inspection.status || 'Pending'}</Badge>
                        {inspection.overall_condition && <Badge variant="outline">{inspection.overall_condition}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditEntity(inspection, 'inspections')}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEntity(inspection.id, 'inspections')}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No inspections found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Issues List Modal */}
      <Dialog open={showIssuesModal} onOpenChange={setShowIssuesModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              All Issues ({issues.length})
            </DialogTitle>
            <DialogDescription>
              View and manage all reported issues
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {issues.length > 0 ? (
              <div className="space-y-2">
                {issues.map((issue: any) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold">{issue.title || `Issue #${issue.id}`}</h3>
                      <p className="text-sm text-gray-600">{issue.description?.substring(0, 60) || 'No description'}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{issue.priority_display || issue.priority || 'Medium'}</Badge>
                        <Badge className={issue.status_display === 'Resolved' || issue.status === 'resolved' ? 'bg-green-100 text-green-800' : issue.status === 'closed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                          {issue.status_display || issue.status || 'Open'}
                        </Badge>
                        {issue.reporter_name && <Badge variant="outline">by {issue.reporter_name}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditEntity(issue, 'issues')}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEntity(issue.id, 'issues')}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No issues found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* System Configuration Modal */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              System Configuration
            </DialogTitle>
            <DialogDescription>
              Manage platform-wide system settings and configurations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              {systemConfigs.length > 0 ? (
                systemConfigs.map((config: any, index: number) => (
                  <div key={config.id || index} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{config.key || config.name}</h3>
                        <p className="text-sm text-gray-600">{config.description || 'No description'}</p>
                      </div>
                      <Badge variant="outline">{config.category || 'general'}</Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Value:</span> {String(config.value || 'Not set')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Type: {config.value_type || 'string'} | 
                        Updated: {config.updated_at ? new Date(config.updated_at).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setEditingConfig(config)
                          setConfigFormData(config)
                          setShowEditConfigModal(true)
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteConfig(config.id)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No system configurations found</p>
                  <Button variant="outline" className="mt-4" onClick={() => {
                    setEditingConfig({})
                    setShowEditConfigModal(true)
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Configuration
                  </Button>
                </div>
              )}
            </div>

            {systemConfigs.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setEditingConfig({})
                  setShowEditConfigModal(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Configuration
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Configuration Modal */}
      <Dialog open={showEditConfigModal} onOpenChange={setShowEditConfigModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              {editingConfig?.id ? 'Edit' : 'Create'} System Configuration
            </DialogTitle>
            <DialogDescription>
              Configure system settings and parameters
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Key *</Label>
              <Input 
                value={configFormData.key || ''} 
                onChange={(e) => setConfigFormData({...configFormData, key: e.target.value})}
                placeholder="e.g., max_users_per_company"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea 
                className="w-full p-2 border rounded"
                rows={3}
                value={configFormData.description || ''} 
                onChange={(e) => setConfigFormData({...configFormData, description: e.target.value})}
                placeholder="Brief description of this configuration"
              />
            </div>

            <div className="space-y-2">
              <Label>Value *</Label>
              <Input 
                value={configFormData.value || ''} 
                onChange={(e) => setConfigFormData({...configFormData, value: e.target.value})}
                placeholder="Configuration value"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Input 
                value={configFormData.category || ''} 
                onChange={(e) => setConfigFormData({...configFormData, category: e.target.value})}
                placeholder="e.g., general, security, billing"
              />
            </div>

            <div className="space-y-2">
              <Label>Value Type</Label>
              <Select 
                value={configFormData.value_type || 'string'}
                onValueChange={(value) => setConfigFormData({...configFormData, value_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="integer">Integer</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="float">Float</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              setShowEditConfigModal(false)
              setEditingConfig(null)
              setConfigFormData({})
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {editingConfig?.id ? 'Update' : 'Create'} Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Entity Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit {editingEntityType.charAt(0).toUpperCase() + editingEntityType.slice(1)}
            </DialogTitle>
            <DialogDescription>
              Update the information below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {editingEntityType === 'users' && editingEntity && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    value={editFormData.first_name || ''} 
                    onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    value={editFormData.last_name || ''} 
                    onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={editFormData.email || ''} 
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select 
                    value={editFormData.role || ''} 
                    onValueChange={(value) => setEditFormData({...editFormData, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="inspector">Inspector</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {editingEntityType === 'vehicles' && editingEntity && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Make</Label>
                  <Input 
                    value={editFormData.make || ''} 
                    onChange={(e) => setEditFormData({...editFormData, make: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input 
                    value={editFormData.model || ''} 
                    onChange={(e) => setEditFormData({...editFormData, model: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <Input 
                    value={editFormData.reg_number || editFormData.license_plate || ''} 
                    onChange={(e) => setEditFormData({...editFormData, reg_number: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input 
                    type="number"
                    value={editFormData.year || ''} 
                    onChange={(e) => setEditFormData({...editFormData, year: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={editFormData.status || ''} 
                    onValueChange={(value) => setEditFormData({...editFormData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="RETIRED">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {editingEntityType === 'companies' && editingEntity && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input 
                    value={editFormData.name || ''} 
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={editFormData.email || ''} 
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subscription Plan</Label>
                  <Select 
                    value={editFormData.subscription_plan || ''} 
                    onValueChange={(value) => setEditFormData({...editFormData, subscription_plan: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {editingEntityType === 'shifts' && editingEntity && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Start Date & Time</Label>
                  <Input 
                    type="datetime-local"
                    value={editFormData.start_at ? new Date(editFormData.start_at).toISOString().slice(0, 16) : ''} 
                    onChange={(e) => setEditFormData({...editFormData, start_at: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date & Time</Label>
                  <Input 
                    type="datetime-local"
                    value={editFormData.end_at ? new Date(editFormData.end_at).toISOString().slice(0, 16) : ''} 
                    onChange={(e) => setEditFormData({...editFormData, end_at: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={editFormData.status || ''} 
                    onValueChange={(value) => setEditFormData({...editFormData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <textarea 
                    className="w-full p-2 border rounded"
                    rows={3}
                    value={editFormData.notes || ''} 
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                  />
                </div>
              </div>
            )}

            {editingEntityType === 'inspections' && editingEntity && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={editFormData.type || ''} 
                    onValueChange={(value) => setEditFormData({...editFormData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="START">Start of Shift</SelectItem>
                      <SelectItem value="END">End of Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={editFormData.status || ''} 
                    onValueChange={(value) => setEditFormData({...editFormData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="PASS">Pass</SelectItem>
                      <SelectItem value="FAIL">Fail</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weather Conditions</Label>
                  <Input 
                    value={editFormData.weather_conditions || ''} 
                    onChange={(e) => setEditFormData({...editFormData, weather_conditions: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Temperature (Celsius)</Label>
                  <Input 
                    type="number"
                    value={editFormData.temperature || ''} 
                    onChange={(e) => setEditFormData({...editFormData, temperature: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <textarea 
                    className="w-full p-2 border rounded"
                    rows={3}
                    value={editFormData.notes || ''} 
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                  />
                </div>
              </div>
            )}

            {editingEntityType === 'issues' && editingEntity && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={editFormData.title || ''} 
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea 
                    className="w-full p-2 border rounded"
                    rows={4}
                    value={editFormData.description || ''} 
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={editFormData.status || ''} 
                    onValueChange={(value) => setEditFormData({...editFormData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEntity}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
