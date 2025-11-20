'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Truck, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home,
  BarChart3,
  FileText,
  Wrench,
  Shield,
  Bell,
  Search,
  User,
  Building2,
  Crown,
  Ticket,
  Clock,
  MapPin,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser, initializeAuth } from '@/store/slices/authSlice';
import { setSidebarOpen, addNotification } from '@/store/slices/uiSlice';
import { NotificationContainer } from '@/components/ui/notification';
import TrialWarning from '@/components/trial-warning';
import { apiClient } from '@/lib/apiClient';
import { API_CONFIG } from '@/config/api';

interface SubscriptionSummary {
  status: string;
  billing_cycle: string;
  current_period_end?: string;
  trial_end?: string;
  days_until_period_end?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const { sidebarOpen, unreadNotifications } = useAppSelector((state) => state.ui);
  const companyMeta = user?.company as { subscription_status?: string; trial_ends_at?: string } | undefined;
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth state from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      dispatch(initializeAuth());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    let isMounted = true;

    const loadSubscription = async () => {
      if (!user) {
        setSubscription(null);
        return;
      }

      setSubscriptionLoading(true);
      try {
        const data = await apiClient<SubscriptionSummary | null>(API_CONFIG.ENDPOINTS.BILLING.SUBSCRIPTION_CURRENT);
        if (!isMounted) return;
        setSubscription(data);
        setSubscriptionError(null);
      } catch (err: any) {
        if (!isMounted) return;
        if (err?.status === 404) {
          setSubscription(null);
          setSubscriptionError(null);
        } else {
          console.error('Subscription fetch error:', err);
          setSubscriptionError(err?.message || 'Unable to load subscription details.');
        }
      } finally {
        if (isMounted) {
          setSubscriptionLoading(false);
        }
      }
    };

    loadSubscription();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(addNotification({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been successfully logged out',
      }));
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Logout Error',
        message: 'There was an error logging out',
      }));
    }
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { name: 'Dashboard', href: `/dashboard/${user.role}`, icon: Home },
      { name: 'Profile', href: '/dashboard/profile', icon: User },
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Users', href: '/dashboard/admin/users', icon: Users },
          { name: 'Vehicles', href: '/dashboard/admin/vehicles', icon: Truck },
          { name: 'Shifts', href: '/dashboard/admin/shifts', icon: Clock },
          { name: 'Tickets', href: '/dashboard/admin/tickets', icon: Ticket },
          { name: 'Inspections', href: '/dashboard/admin/inspections', icon: Shield },
          { name: 'Drivers', href: '/dashboard/admin/drivers', icon: MapPin },
          { name: 'Driver Map', href: '/dashboard/admin/drivers/map', icon: Navigation },
          { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
          { name: 'Subscription', href: '/dashboard/subscription', icon: Crown },
          { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
        ];
      case 'staff':
        return [
          ...baseItems,
          { name: 'Users', href: '/dashboard/staff/users', icon: Users },
          { name: 'Vehicles', href: '/dashboard/staff/vehicles', icon: Truck },
          { name: 'Driver Map', href: '/dashboard/admin/drivers/map', icon: Navigation },
          { name: 'Maintenance', href: '/dashboard/staff/maintenance', icon: Wrench },
          { name: 'Reports', href: '/dashboard/staff/reports', icon: FileText },
        ];
      case 'driver':
        return [
          ...baseItems,
          { name: 'My Vehicles', href: '/dashboard/driver/vehicles', icon: Truck },
          { name: 'Routes', href: '/dashboard/driver/routes', icon: FileText },
          { name: 'Maintenance', href: '/dashboard/driver/maintenance', icon: Wrench },
        ];
      case 'inspector':
        return [
          ...baseItems,
          { name: 'Inspections', href: '/dashboard/inspector/inspections', icon: Shield },
          { name: 'Vehicles', href: '/dashboard/inspector/vehicles', icon: Truck },
          { name: 'Driver Map', href: '/dashboard/admin/drivers/map', icon: Navigation },
          { name: 'Reports', href: '/dashboard/inspector/reports', icon: FileText },
        ];
      default:
        return baseItems;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'staff':
        return 'bg-blue-500';
      case 'driver':
        return 'bg-green-500';
      case 'inspector':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white via-white to-gray-50/50 shadow-2xl border-r border-gray-200/80 backdrop-blur-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col h-full ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 border-b border-gray-200/60 bg-gradient-to-r from-blue-600/5 to-purple-600/5 flex-shrink-0">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Fleet</span>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Management</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setSidebarOpen(false))}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company & User info */}
        <div className="p-4 sm:p-6 border-b border-gray-200/60 space-y-4 flex-shrink-0">
          {/* Company Info */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50/80 to-purple-50/80 rounded-xl border border-blue-100/60 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 bg-blue-600/10 rounded-lg group-hover:bg-blue-600/20 transition-colors">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Company</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-900 truncate mb-1">{user.company?.name || 'No Company'}</p>
            <p className="text-xs text-gray-600 truncate mb-2" key={`company-email-${user.company?.id || 'none'}`}>{user.company?.email || 'N/A'}</p>
            <Badge variant="outline" className="text-xs bg-white/60 border-blue-200 text-blue-700 font-medium">
              {user.company?.subscription_plan || 'N/A'}
            </Badge>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                {user.full_name || user.username}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200 font-medium">
                  {user.role_display}
                </Badge>
                {user.employee_id && (
                  <span className="text-xs text-gray-500 truncate font-mono">{user.employee_id}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 sm:mt-6 px-2 sm:px-3 flex-1 overflow-y-auto pb-20 min-h-0">
          <div className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                  onClick={() => dispatch(setSidebarOpen(false))}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm"></div>
                  )}
                  <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-400 group-hover:text-blue-600 group-hover:scale-110'
                  }`} />
                  <span className="truncate font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-gray-200/60 bg-white/80 backdrop-blur-sm flex-shrink-0">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/30 group"
          >
            <LogOut className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full">r
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/60">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => dispatch(setSidebarOpen(true))}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent truncate">
                  {navigationItems.find(item => item.href === pathname)?.name || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <div className="hidden sm:block">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all duration-200 w-48 sm:w-56 lg:w-64"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 group">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg shadow-red-500/30 animate-pulse">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* User menu */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200/60">
                <div className="text-right hidden sm:block">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-28 lg:max-w-36">{user.full_name || user.username}</p>
                  <p className="text-xs text-gray-500 font-medium">{user.role_display}</p>
                </div>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${getRoleColor(user.role)} flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer ring-2 ring-white`}>
                  <span className="text-white text-xs sm:text-sm font-bold">
                    {(user.full_name || user.username).charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 w-full overflow-y-auto">
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8 max-w-7xl mx-auto w-full">
          {/* Trial Warning */}
          {user && !subscriptionLoading && (
            <>
              {(subscription?.status === 'trial' || companyMeta?.subscription_status === 'trial') && (
                <TrialWarning
                  daysRemaining={
                    subscription?.days_until_period_end ??
                    calculateCompanyTrialDays(companyMeta?.trial_ends_at)
                  }
                  subscriptionStatus={subscription?.status || companyMeta?.subscription_status || 'trial'}
                  onUpgrade={() => router.push('/dashboard/subscription')}
                />
              )}
              {!subscription && subscriptionError && (
                <div className="mb-6 rounded-xl border border-yellow-200/80 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 text-sm text-yellow-800 shadow-sm">
                  {subscriptionError}
                </div>
              )}
            </>
          )}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
          </div>
        </main>
      </div>

      {/* Notifications */}
      <NotificationContainer />
    </div>
  );
}

function calculateCompanyTrialDays(trialEndsAt?: string | null) {
  if (!trialEndsAt) return 0;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}
