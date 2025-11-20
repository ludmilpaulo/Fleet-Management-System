"use client"

import AuthWrapper from '@/components/auth/auth-wrapper'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout only provides AuthWrapper
  // Individual pages use DashboardLayout component from @/components/layout/dashboard-layout
  // to avoid duplicate sidebars
  return (
    <AuthWrapper>
      {children}
    </AuthWrapper>
  )
}
