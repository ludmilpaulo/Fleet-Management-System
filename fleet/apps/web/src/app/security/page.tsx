'use client';

import { Shield, Lock, Eye, FileCheck, Server, Key, Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function SecurityPage() {
  const { t } = useTranslation();

  const securityFeatures = [
    {
      icon: Shield,
      title: 'SOC 2 Compliant',
      description: 'Our infrastructure meets the highest security standards with SOC 2 Type II certification.',
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data in transit and at rest is encrypted using industry-standard protocols.',
    },
    {
      icon: Key,
      title: 'Role-Based Access Control',
      description: 'Granular permissions ensure users only access what they need for their role.',
    },
    {
      icon: Eye,
      title: 'Audit Logging',
      description: 'Complete audit trails for all system activities and user actions.',
    },
    {
      icon: FileCheck,
      title: 'Compliance Ready',
      description: 'Built to meet GDPR, CCPA, and other regulatory requirements.',
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Hosted on enterprise-grade cloud infrastructure with 99.9% uptime SLA.',
    },
  ];

  const practices = [
    'Regular security audits and penetration testing',
    'Automated vulnerability scanning',
    'Multi-factor authentication (MFA) support',
    'Single Sign-On (SSO) integration',
    'Data backup and disaster recovery',
    '24/7 security monitoring',
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
            Security & Compliance
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your data security is our top priority. We implement industry-leading practices
            to protect your fleet information.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-green-600" />
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

        <div className="bg-slate-900 rounded-2xl p-8 text-white mb-16">
          <h2 className="text-2xl font-semibold mb-6">Security Best Practices</h2>
          <ul className="space-y-3">
            {practices.map((practice, index) => (
              <li key={index} className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Have security questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Our security team is available to answer any questions about our practices and certifications.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Security Team
          </a>
        </div>
      </div>
    </div>
  );
}
