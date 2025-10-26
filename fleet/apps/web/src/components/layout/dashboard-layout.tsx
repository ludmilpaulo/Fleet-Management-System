'use client';

import { useEffect } from 'react';
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
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser, initializeAuth } from '@/store/slices/authSlice';
import { setSidebarOpen, addNotification } from '@/store/slices/uiSlice';
import { NotificationContainer } from '@/components/ui/notification';
import TrialWarning from '@/components/trial-warning';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const { sidebarOpen, unreadNotifications } = useAppSelector((state) => state.ui);

  useEffect(() => {
    // Initialize auth state from localStorage
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, isLoading, router]);

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
          { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
          { name: 'Subscription', href: '/dashboard/subscription', icon: Crown },
          { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
        ];
      case 'staff':
        return [
          ...baseItems,
          { name: 'Users', href: '/dashboard/staff/users', icon: Users },
          { name: 'Vehicles', href: '/dashboard/staff/vehicles', icon: Truck },
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">Fleet</span>
          </div>
          <button
            onClick={() => dispatch(setSidebarOpen(false))}
            className="lg:hidden p-1 sm:p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Company & User info */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          {/* Company Info */}
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1 sm:mb-2">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-900">Company</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{user.company?.name || 'No Company'}</p>
            <p className="text-xs text-gray-600 truncate" key={`company-email-${user.company?.id || 'none'}`}>{user.company?.email || 'N/A'}</p>
            <Badge variant="outline" className="text-xs mt-1">
              {user.company?.subscription_plan || 'N/A'}
            </Badge>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {user.full_name || user.username}
              </p>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {user.role_display}
                </Badge>
                {user.employee_id && (
                  <span className="text-xs text-gray-500 truncate">{user.employee_id}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 sm:mt-6 px-2 sm:px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => dispatch(setSidebarOpen(false))}
                >
                  <Icon className={`mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 ${
                    isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
          >
            <LogOut className="mr-2 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64 sm:lg:pl-72 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => dispatch(setSidebarOpen(true))}
                className="lg:hidden p-1 sm:p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="ml-2 sm:ml-4 lg:ml-0">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {navigationItems.find(item => item.href === pathname)?.name || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search */}
              <div className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-1 sm:p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-20 sm:max-w-none">{user.full_name || user.username}</p>
                  <p className="text-xs text-gray-500">{user.role_display}</p>
                </div>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${getRoleColor(user.role)} flex items-center justify-center`}>
                  <span className="text-white text-xs font-medium">
                    {(user.full_name || user.username).charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8">
          {/* Trial Warning */}
          {user && (
            <TrialWarning
              daysRemaining={14} // Mock data - replace with actual subscription data
              subscriptionStatus="trial" // Mock data - replace with actual subscription status
              onUpgrade={() => router.push('/dashboard/subscription')}
            />
          )}
          {children}
        </main>
      </div>

      {/* Notifications */}
      <NotificationContainer />
    </div>
  );
}
