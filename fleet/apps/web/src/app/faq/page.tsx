'use client';

import { HelpCircle, Truck, ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What is the Fleet Management System?',
    answer: 'The Fleet Management System is a comprehensive platform designed to help businesses manage their vehicle fleets efficiently. It provides tools for tracking vehicles, managing drivers, scheduling maintenance, conducting inspections, and monitoring fleet operations in real-time.'
  },
  {
    question: 'Who powers this platform?',
    answer: 'This platform is powered by Maindo Digital Agency, a leading provider of digital solutions and fleet management technology. Maindo Digital Agency provides the underlying technology, infrastructure, and ongoing support for this platform.'
  },
  {
    question: 'What roles are available in the system?',
    answer: 'The system supports multiple roles: Platform Admin (full system access), Company Admin (company-level management), Staff (operational management), Driver (shift and issue reporting), and Inspector (vehicle inspections). Each role has specific permissions and access levels.'
  },
  {
    question: 'How do I create an account?',
    answer: 'To create an account, click on "Sign Up" and provide your company information, including company slug, email, and password. You will need to join an existing company or create a new company account. Company admins can then invite additional users.'
  },
  {
    question: 'Can I track vehicles in real-time?',
    answer: 'Yes, the system provides real-time vehicle tracking capabilities. Drivers can start shifts with location tracking, and you can monitor vehicle locations, routes, and status through the dashboard.'
  },
  {
    question: 'How do inspections work?',
    answer: 'Inspectors can create inspections for active shifts. The inspection process includes checking various vehicle parts (engine, tyres, lights, etc.), recording pass/fail status, adding notes, and uploading photos. Inspections can be created at the start or end of shifts.'
  },
  {
    question: 'What happens if I report an issue?',
    answer: 'When you report an issue, it is logged in the system with details such as category (mechanical, safety, etc.), severity level, and description. Issues can be tracked, assigned to team members, and updated through their lifecycle until resolution.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, security is a top priority. The platform uses encryption for data in transit and at rest, implements access controls, and follows industry best practices for data protection. Please review our Privacy Policy for detailed information about data security measures.'
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes, depending on your subscription plan, you can export vehicle data, reports, and other information. Company admins and platform admins have access to data export features.'
  },
  {
    question: 'What subscription plans are available?',
    answer: 'The platform offers various subscription plans including Trial, Basic, Professional, and Enterprise. Each plan has different features, user limits, and vehicle limits. Contact us or check your company settings for plan details.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can contact support through the Contact page on our website, email support@fleetia.com, or use the in-app support features. Maindo Digital Agency provides technical support for the platform.'
  },
  {
    question: 'Can I customize the system for my company?',
    answer: 'Yes, the system offers various customization options including company branding, custom fields, and configuration settings. Company admins can access settings to customize their company profile and preferences.'
  },
  {
    question: 'What mobile apps are available?',
    answer: 'The platform includes mobile applications for iOS and Android that allow drivers and inspectors to perform their tasks on the go, including starting shifts, conducting inspections, reporting issues, and uploading photos.'
  },
  {
    question: 'How do I reset my password?',
    answer: 'You can reset your password by clicking "Forgot Password" on the sign-in page. Enter your email address, and you will receive instructions to reset your password via email.'
  },
  {
    question: 'What happens if I exceed my plan limits?',
    answer: 'If you exceed your plan limits (users or vehicles), you will be notified and may need to upgrade your subscription plan. Contact support or your company admin to discuss upgrading your plan.'
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <Truck className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 mb-4">
            <HelpCircle className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about the Fleet Management System
          </p>
        </div>

        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">About This Platform</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            <p>
              This Fleet Management System is powered by <strong>Maindo Digital Agency</strong>. If you have questions not covered here, please visit our <Link href="/contact" className="text-blue-600 hover:underline">Contact</Link> page or reach out to our support team.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4 mb-8">
          {faqData.map((faq, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg pr-8">{faq.question}</CardTitle>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </div>
              </CardHeader>
              {openIndex === index && (
                <CardContent className="text-gray-700 leading-relaxed pt-0">
                  {faq.answer}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <Card className="mb-8 bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900">Still Have Questions?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              If you couldn't find the answer you're looking for, we're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Help Documentation
              </Link>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              <strong>Maindo Digital Agency</strong> provides technical support for this platform. 
              Visit <a href="https://maindo.digital" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">maindo.digital</a> for more information.
            </p>
          </CardContent>
        </Card>

        <div className="text-center pt-8 border-t">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
