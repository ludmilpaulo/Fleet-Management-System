'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function BillingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait a moment for webhook to process, then refresh subscription
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const sessionId = searchParams.get('session_id');

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Your subscription has been activated. You now have full access to all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Activating your subscription...</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    Your payment was processed successfully. Your subscription is now active and you can start using all features immediately.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => router.push('/dashboard/subscription')}
                  >
                    View Subscription
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

