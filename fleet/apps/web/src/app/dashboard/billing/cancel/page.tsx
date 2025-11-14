'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <XCircle className="w-12 h-12 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Payment Canceled</CardTitle>
            <CardDescription>
              Your payment was canceled. No charges were made to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                If you encountered any issues during checkout, please try again or contact our support team for assistance.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push('/dashboard/subscription')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

