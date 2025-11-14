import { useState, useEffect } from 'react';
import { getCurrentSubscription, CompanySubscription } from '@/services/billing';

export interface SubscriptionStatus {
  subscription: CompanySubscription | null;
  isLoading: boolean;
  isActive: boolean;
  isTrialing: boolean;
  canAccessFeatures: boolean;
  error: Error | null;
}

/**
 * Hook to check subscription status
 */
export const useSubscription = (): SubscriptionStatus => {
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        const data = await getCurrentSubscription();
        setSubscription(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
        setSubscription(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const isActive = subscription?.is_active || false;
  const isTrialing = subscription?.status === 'trialing' || false;
  const canAccessFeatures = isActive || isTrialing;

  return {
    subscription,
    isLoading,
    isActive,
    isTrialing,
    canAccessFeatures,
    error,
  };
};

