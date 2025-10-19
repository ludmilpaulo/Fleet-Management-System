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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Truck className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">Fleet Management</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/auth/signin')}
                className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 border-2 hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => router.push('/auth/signup')}
                className="btn-gradient text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-12 sm:mb-16 slide-up">
          <div className="mb-6">
            <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 shadow-lg border border-blue-200">
              <span className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mr-3 animate-pulse"></span>
              14-Day Free Trial • No Credit Card Required
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
            Modern Fleet
            <span className="gradient-text block mt-2 animate-gradient">Management System</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-4xl mx-auto px-4 leading-relaxed">
            Streamline your fleet operations with our comprehensive management system. 
            Track vehicles, manage drivers, schedule maintenance, and ensure compliance 
            all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 mb-6">
            <Button 
              size="lg" 
              onClick={() => router.push('/auth/signup')}
              className="btn-gradient text-base sm:text-xl px-10 sm:px-12 py-4 sm:py-5 font-semibold scale-in shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Start Free Trial →
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/auth/signin')}
              className="text-base sm:text-xl px-10 sm:px-12 py-4 sm:py-5 border-2 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Sign In
            </Button>
          </div>
          <p className="text-sm sm:text-base text-gray-500 fade-in flex items-center justify-center">
            <span className="text-yellow-500 mr-2">✨</span>
            No credit card required • Cancel anytime
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center card-hover glass border-0 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <CardHeader className="px-6 pt-8 pb-4">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full ${feature.bgColor} flex items-center justify-center mb-6 shadow-lg border-2 border-white`}>
                    <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold gradient-text-blue">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-8">
                  <CardDescription className="text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Demo Section */}
        <div className="glass rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 text-center fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-6 sm:mb-8">
            Try Our Demo
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 px-4 max-w-2xl mx-auto">
            Experience the power of our fleet management system with pre-configured demo accounts
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl card-hover bg-white/50 backdrop-blur-sm">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Admin</h3>
              <p className="text-sm text-gray-600 mb-3">Full system access</p>
              <p className="text-xs text-gray-500 break-all font-mono bg-gray-100 p-2 rounded">admin / admin123</p>
            </div>
            <div className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl card-hover bg-white/50 backdrop-blur-sm">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Staff</h3>
              <p className="text-sm text-gray-600 mb-3">Operations management</p>
              <p className="text-xs text-gray-500 break-all font-mono bg-gray-100 p-2 rounded">staff1 / staff123</p>
            </div>
            <div className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl card-hover bg-white/50 backdrop-blur-sm">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Driver</h3>
              <p className="text-sm text-gray-600 mb-3">Route management</p>
              <p className="text-xs text-gray-500 break-all font-mono bg-gray-100 p-2 rounded">Coming Soon</p>
              <p className="text-xs text-gray-400 mt-1">Demo account setup in progress</p>
            </div>
            <div className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl card-hover bg-white/50 backdrop-blur-sm">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Inspector</h3>
              <p className="text-sm text-gray-600 mb-3">Vehicle inspections</p>
              <p className="text-xs text-gray-500 break-all font-mono bg-gray-100 p-2 rounded">Coming Soon</p>
              <p className="text-xs text-gray-400 mt-1">Demo account setup in progress</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white py-12 mt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Fleet Management System</span>
          </div>
          <p className="text-gray-300 text-sm">
            © 2025 Fleet Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
