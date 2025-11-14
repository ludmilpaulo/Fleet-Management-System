'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Banner component to show subscription warnings
 */
export default function SubscriptionBanner() {
  const { subscription, isLoading, canAccessFeatures } = useSubscription();
  const router = useRouter();

  if (isLoading || !subscription || canAccessFeatures) {
    return null;
  }

  const getMessage = () => {
    switch (subscription.status) {
      case 'past_due':
        return 'Your subscription payment failed. Please update your payment method to continue using the service.';
      case 'expired':
        return 'Your subscription has expired. Please renew to continue using the service.';
      case 'canceled':
        return 'Your subscription has been canceled. Please reactivate to continue using the service.';
      case 'incomplete':
      case 'incomplete_expired':
        return 'Your subscription setup is incomplete. Please complete the payment process.';
      default:
        return 'Your subscription is not active. Please upgrade to continue using the service.';
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            {getMessage()}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <Link href="/dashboard/subscription">
            <Button size="sm" variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-100">
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

