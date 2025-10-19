"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getCurrentUser } from '@/lib/auth'
import { authAPI } from '@/lib/auth'

interface AuthWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
}

export default function AuthWrapper({ 
  children, 
  requireAuth = true, 
  allowedRoles = [] 
}: AuthWrapperProps) {
  const [loading, setLoading] = useState(true)
  const [isAuth, setIsAuth] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!requireAuth) {
          setIsAuth(true)
          setLoading(false)
          return
        }

        // Check if token exists
        if (!isAuthenticated()) {
          router.push('/auth/signin')
          return
        }

        // Verify token is valid by fetching profile
        try {
          await authAPI.getProfile()
          setIsAuth(true)
        } catch (error) {
          console.error('Auth verification failed:', error)
          // Token is invalid, redirect to login
          router.push('/auth/signin')
          return
        }

        // Check role permissions if specified
        if (allowedRoles.length > 0) {
          const user = getCurrentUser()
          if (!user || !allowedRoles.includes(user.role)) {
            router.push('/unauthorized')
            return
          }
        }

      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requireAuth, allowedRoles, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!requireAuth || isAuth) {
    return <>{children}</>
  }

  return null
}
