'use client'

import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, FileText, Download, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function InspectorReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Inspector • Reports</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Inspection Reports
            </CardTitle>
            <CardDescription>View and export inspection reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">Inspection Report</h3>
                <p className="text-sm text-gray-600 mb-3">All inspection details and results</p>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </Card>
              
              <Card className="p-4">
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-semibold mb-1">Failed Inspections</h3>
                <p className="text-sm text-gray-600 mb-3">Failed inspections and issues found</p>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </Card>
              
              <Card className="p-4">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-semibold mb-1">Vehicle Inspection History</h3>
                <p className="text-sm text-gray-600 mb-3">Complete vehicle inspection history</p>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </Card>
              
              <Card className="p-4">
                <FileText className="h-8 w-8 text-orange-600 mb-2" />
                <h3 className="font-semibold mb-1">Inspection Statistics</h3>
                <p className="text-sm text-gray-600 mb-3">Inspection statistics and trends</p>
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

