'use client'

import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Truck } from 'lucide-react'

export default function AdminVehiclesPage() {
  const router = useRouter()
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin • Vehicles</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Add or Manage Vehicles
            </CardTitle>
            <CardDescription>Access the vehicles list and create new vehicles</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Use the Vehicles page to view and add vehicles.
            </p>
            <Button onClick={() => router.push('/dashboard/vehicles')} className="btn-gradient">
              Go to Vehicles
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


