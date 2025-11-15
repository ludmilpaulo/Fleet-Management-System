'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Phone, Building, Calendar, Shield, Save, Edit } from 'lucide-react'
import { format } from 'date-fns'
import type { User as FleetUser } from '@/lib/auth'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchUserProfile, updateUserProfile } from '@/store/slices/authSlice'
import { addNotification } from '@/store/slices/uiSlice'

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)

  const [profile, setProfile] = useState<FleetUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      if (user) {
        if (!isMounted) return
        setProfile(user)
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone_number: user.phone_number || '',
        })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const fetched = await dispatch(fetchUserProfile()).unwrap()
        if (!isMounted) return
        setProfile(fetched)
        setFormData({
          first_name: fetched.first_name || '',
          last_name: fetched.last_name || '',
          email: fetched.email || '',
          phone_number: fetched.phone_number || '',
        })
        setError(null)
      } catch (err: any) {
        if (!isMounted) return
        console.error('Error fetching profile:', err)
        setError(err?.message || 'Unable to load profile information')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (!authLoading) {
      loadProfile()
    }

    return () => {
      isMounted = false
    }
  }, [user, authLoading, dispatch])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
      }

      const updatedUser = await dispatch(updateUserProfile(payload)).unwrap()
      setProfile(updatedUser)
      setFormData({
        first_name: updatedUser.first_name || '',
        last_name: updatedUser.last_name || '',
        email: updatedUser.email || '',
        phone_number: updatedUser.phone_number || '',
      })
      setEditing(false)
      dispatch(addNotification({
        type: 'success',
        title: 'Profile updated',
        message: 'Your profile changes have been saved',
      }))
    } catch (err: any) {
      console.error('Error saving profile:', err)
      dispatch(addNotification({
        type: 'error',
        title: 'Update failed',
        message: err?.message || 'Unable to update profile right now',
      }))
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone_number: profile.phone_number || '',
      })
    }
    setEditing(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'driver': return 'bg-blue-100 text-blue-800'
      case 'inspector': return 'bg-green-100 text-green-800'
      case 'staff': return 'bg-purple-100 text-purple-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator'
      case 'driver': return 'Driver'
      case 'inspector': return 'Inspector'
      case 'staff': return 'Staff'
      case 'viewer': return 'Viewer'
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <User className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
            <p className="text-gray-500">
              {error || 'Unable to load your profile information.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
                <Save className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  disabled={!editing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  disabled={!editing}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your account details and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={profile.username} disabled />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex items-center gap-2">
                <Badge className={getRoleColor(profile.role)}>
                  {getRoleText(profile.role)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input value={profile.company?.name || 'No Company'} disabled className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <div className="flex items-center gap-2">
                <Badge className={profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined: {format(new Date(profile.date_joined), 'MMM dd, yyyy')}</span>
              </div>
              
              {profile.last_login && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Last login: {format(new Date(profile.last_login), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage your account security and privacy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Change Password</h4>
              <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
            </div>
            <Button variant="outline">
              Change Password
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline">
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
