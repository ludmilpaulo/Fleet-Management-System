'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/mixpanel';
import { useAppSelector } from '@/store/hooks';

export function MixpanelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Track page views
  useEffect(() => {
    if (pathname) {
      analytics.trackPageView(pathname, {
        authenticated: isAuthenticated,
        user_role: user?.role,
        company: user?.company?.name,
      });
    }
  }, [pathname, isAuthenticated, user]);

  // Identify user when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      analytics.identify(user.id.toString(), {
        $name: user.full_name || user.username,
        $email: user.email,
        username: user.username,
        role: user.role,
        company: user.company?.name,
        company_id: user.company?.id,
        subscription_plan: user.company?.subscription_plan,
        is_trial: user.company?.is_trial_active,
      });
    }
  }, [isAuthenticated, user]);

  return <>{children}</>;
}
