'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Users, Shield, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state from localStorage
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'staff':
          router.push('/dashboard/staff');
          break;
        case 'driver':
          router.push('/dashboard/driver');
          break;
        case 'inspector':
          router.push('/dashboard/inspector');
          break;
        default:
          router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const features = [
    {
      icon: Truck,
      title: 'Fleet Management',
      description: 'Comprehensive vehicle tracking and management system',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Role-based access control for admin, staff, drivers, and inspectors',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Shield,
      title: 'Safety & Compliance',
      description: 'Vehicle inspections and safety compliance tracking',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Wrench,
      title: 'Maintenance Tracking',
      description: 'Schedule and track vehicle maintenance and repairs',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Truck className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">Fleet Management</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/auth/signin')}
                className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => router.push('/auth/signup')}
                className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-12 sm:mb-16 slide-up">
          <div className="mb-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
              14-Day Free Trial • No Credit Card Required
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-4 sm:mb-6">
            Modern Fleet
            <span className="gradient-text block mt-2">Management System</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Streamline your fleet operations with our comprehensive management system. 
            Track vehicles, manage drivers, schedule maintenance, and ensure compliance 
            all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              size="lg" 
              onClick={() => router.push('/auth/signup')}
              className="btn-gradient text-sm sm:text-lg px-8 sm:px-10 py-3 sm:py-4 font-semibold scale-in"
            >
              Start Free Trial →
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/auth/signin')}
              className="text-sm sm:text-lg px-8 sm:px-10 py-3 sm:py-4 border-2 hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
            >
              Sign In
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500 fade-in">
            ✨ No credit card required • Cancel anytime
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full ${feature.bgColor} flex items-center justify-center mb-3 sm:mb-4`}>
                    <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-sm sm:text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <CardDescription className="text-xs sm:text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Try Our Demo
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
            Experience the power of our fleet management system with pre-configured demo accounts
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Admin</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Full system access</p>
              <p className="text-xs text-gray-500 break-all">admin / admin123</p>
            </div>
            <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Staff</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Operations management</p>
              <p className="text-xs text-gray-500 break-all">staff1 / staff123</p>
            </div>
            <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Driver</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Route management</p>
              <p className="text-xs text-gray-500 break-all">driver1 / driver123</p>
            </div>
            <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Inspector</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Vehicle inspections</p>
              <p className="text-xs text-gray-500 break-all">inspector1 / inspector123</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">Fleet Management System</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Fleet Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
