'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

interface RequireSuperuserProps {
  children: React.ReactNode;
}

/**
 * Component that protects routes - only allows superusers to access
 * Redirects non-superusers to unauthorized page
 */
export default function RequireSuperuser({ children }: RequireSuperuserProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user is superuser
      const isSuperuser = (user as any).is_superuser === true;
      const hasSystemCompany = (user as any).company?.slug === 'system';
      
      if (!isSuperuser && !hasSystemCompany) {
        // Not a superuser, redirect to unauthorized page
        router.push('/unauthorized');
      }
    } else {
      // Not authenticated, redirect to login
      router.push('/auth/signin');
    }
  }, [user, isAuthenticated, router]);

  // Show loading state while checking auth
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is superuser
  const isSuperuser = (user as any).is_superuser === true;
  const hasSystemCompany = (user as any).company?.slug === 'system';

  if (!isSuperuser && !hasSystemCompany) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-4 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // User is superuser, show the content
  return <>{children}</>;
}

