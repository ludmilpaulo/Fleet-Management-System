'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CreditCard } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requireActive?: boolean;
  showWarning?: boolean;
}

/**
 * Component to guard routes based on subscription status
 */
export default function SubscriptionGuard({
  children,
  requireActive = true,
  showWarning = false,
}: SubscriptionGuardProps) {
  const { subscription, isLoading, canAccessFeatures } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireActive && !canAccessFeatures) {
      // Redirect to subscription page if subscription is not active
      router.push('/dashboard/subscription');
    }
  }, [isLoading, canAccessFeatures, requireActive, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireActive && !canAccessFeatures) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Subscription Required
            </CardTitle>
            <CardDescription>
              Your subscription is not active. Please upgrade to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push('/dashboard/subscription')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              View Subscription Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showWarning && subscription && !canAccessFeatures) {
    return (
      <>
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-semibold">Subscription Inactive</p>
              <p className="text-sm">
                Your subscription is {subscription.status}. Please update your payment method to continue using the service.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => router.push('/dashboard/subscription')}
          >
            Manage Subscription
          </Button>
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
}

