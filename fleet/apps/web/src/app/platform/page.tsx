'use client';

import { Truck, Shield, BarChart3, Users, Wrench, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function PlatformPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const features = [
    {
      icon: Truck,
      title: 'Fleet Management',
      description: 'Comprehensive vehicle tracking, maintenance scheduling, and lifecycle management.',
    },
    {
      icon: Users,
      title: 'Driver Management',
      description: 'Track driver performance, schedules, certifications, and compliance.',
    },
    {
      icon: ClipboardCheck,
      title: 'Inspections & Compliance',
      description: 'Automated inspection workflows with digital forms and audit trails.',
    },
    {
      icon: Wrench,
      title: 'Maintenance Tracking',
      description: 'Predictive maintenance alerts and vendor coordination.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Real-time dashboards and executive-level insights.',
    },
    {
      icon: Shield,
      title: 'Security & Access Control',
      description: 'Role-based permissions and enterprise-grade security.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Truck className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Platform Overview
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive fleet management platform designed to streamline operations,
            ensure compliance, and maximize efficiency.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of companies managing their fleets with our platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/auth/signup')} size="lg">
              Start Free Trial
            </Button>
            <Button
              onClick={() => router.push('/contact')}
              variant="outline"
              size="lg"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
