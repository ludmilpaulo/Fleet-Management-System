'use client'

import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function AdminReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin • Reports</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Reports Overview
            </CardTitle>
            <CardDescription>Summary of key metrics and export options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Reports section is set up. We can add detailed filters, charts, and CSV exports next.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


