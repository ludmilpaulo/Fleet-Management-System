'use client'

import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StaffReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Staff • Reports</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Reports Overview
            </CardTitle>
            <CardDescription>View and export fleet reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">Fleet Report</h3>
                <p className="text-sm text-gray-600 mb-3">Vehicle status and statistics</p>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </Card>
              
              <Card className="p-4">
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-semibold mb-1">Maintenance Report</h3>
                <p className="text-sm text-gray-600 mb-3">Maintenance history and schedules</p>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </Card>
              
              <Card className="p-4">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-semibold mb-1">User Activity Report</h3>
                <p className="text-sm text-gray-600 mb-3">User activity and performance</p>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </Card>
              
              <Card className="p-4">
                <FileText className="h-8 w-8 text-orange-600 mb-2" />
                <h3 className="font-semibold mb-1">Ticket Report</h3>
                <p className="text-sm text-gray-600 mb-3">Ticket status and resolution</p>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

