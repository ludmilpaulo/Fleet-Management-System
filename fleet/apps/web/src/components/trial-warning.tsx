'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Clock, 
  Crown, 
  Star, 
  Shield, 
  X,
  ArrowRight
} from 'lucide-react'

interface TrialWarningProps {
  daysRemaining: number
  subscriptionStatus: string
  onUpgrade: () => void
  onDismiss?: () => void
}

export default function TrialWarning({ 
  daysRemaining, 
  subscriptionStatus, 
  onUpgrade, 
  onDismiss 
}: TrialWarningProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the warning before
    const dismissed = localStorage.getItem('trial-warning-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      setIsVisible(false)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('trial-warning-dismissed', 'true')
    onDismiss?.()
  }

  const getWarningLevel = () => {
    if (daysRemaining <= 3) return 'critical'
    if (daysRemaining <= 7) return 'warning'
    return 'info'
  }

  const getWarningColor = (level: string) => {
    switch (level) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'warning': return 'border-yellow-500 bg-yellow-50'
      default: return 'border-blue-500 bg-blue-50'
    }
  }

  const getIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'warning': return <Clock className="w-5 h-5 text-yellow-600" />
      default: return <Clock className="w-5 h-5 text-blue-600" />
    }
  }

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  if (!isVisible || isDismissed || subscriptionStatus !== 'trial') {
    return null
  }

  const warningLevel = getWarningLevel()

  return (
    <Card className={`border-l-4 ${getWarningColor(warningLevel)} mb-6 shadow-sm`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-full shadow-sm">
              {getIcon(warningLevel)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">
                  {warningLevel === 'critical' ? 'Trial Expiring Soon!' : 
                   warningLevel === 'warning' ? 'Trial Ending Soon' : 'Trial Period'}
                </h3>
                <Badge className={getBadgeColor(warningLevel)}>
                  {daysRemaining} days left
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {warningLevel === 'critical' 
                  ? 'Your trial expires in just a few days! Upgrade now to continue using all features without interruption.'
                  : warningLevel === 'warning'
                  ? 'Your trial will end soon. Upgrade to a paid plan to keep your data and continue using the platform.'
                  : 'You\'re currently on a free trial. Upgrade to unlock all features and remove limitations.'
                }
              </p>

              <div className="flex gap-2">
                <Button 
                  onClick={onUpgrade}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                {warningLevel !== 'critical' && (
                  <Button variant="outline" onClick={handleDismiss}>
                    <X className="w-4 h-4 mr-2" />
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {warningLevel !== 'critical' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Plan Comparison */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Choose your plan:</h4>
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">Basic</span>
              </div>
              <div className="text-lg font-bold">$29/month</div>
              <div className="text-xs text-gray-600">Up to 5 users, 10 vehicles</div>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-blue-500 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-sm">Professional</span>
              </div>
              <div className="text-lg font-bold">$99/month</div>
              <div className="text-xs text-gray-600">Up to 25 users, 50 vehicles</div>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-sm">Enterprise</span>
              </div>
              <div className="text-lg font-bold">$299/month</div>
              <div className="text-xs text-gray-600">Unlimited users, 200 vehicles</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
