'use client'

import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

export default function AdminUsersPage() {
  const router = useRouter()
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin • Users</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Manage Users
            </CardTitle>
            <CardDescription>User administration for your company</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              To manage users today, use the dedicated Users page.
            </p>
            <Button onClick={() => router.push('/dashboard/staff/users')} className="btn-gradient">
              Go to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


