'use client';

import { useState } from 'react';
import { X, HelpCircle, ChevronRight, ChevronDown, Play, BookOpen, Video, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HelpSection {
  id: string;
  title: string;
  content: string;
  steps?: string[];
  videoUrl?: string;
  type: 'text' | 'steps' | 'video';
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'admin' | 'staff' | 'driver' | 'inspector';
  page: string;
}

const helpContent: Record<string, Record<string, HelpSection[]>> = {
  admin: {
    dashboard: [
      {
        id: 'overview',
        title: 'Dashboard Overview',
        content: 'Your admin dashboard provides a comprehensive view of your fleet management system.',
        steps: [
          'View company statistics in the top cards',
          'Monitor user activity in the activity feed',
          'Check subscription status and billing',
          'Access quick actions for common tasks',
          'Review system performance metrics'
        ],
        type: 'steps'
      },
      {
        id: 'company_stats',
        title: 'Company Statistics',
        content: 'Monitor key business metrics at a glance.',
        steps: [
          'Total Users: See all registered users in your system',
          'Active Users: Users who logged in recently',
          'Total Vehicles: Your entire fleet count',
          'Active Shifts: Currently running delivery routes',
          'Completed Inspections: Safety checks completed this month',
          'Monthly Revenue: Your subscription income'
        ],
        type: 'steps'
      },
      {
        id: 'subscription',
        title: 'Subscription Management',
        content: 'Manage your company subscription and billing.',
        steps: [
          'View current plan details',
          'Check billing cycle and next payment',
          'Monitor usage against plan limits',
          'Upgrade or downgrade your plan',
          'Access billing history'
        ],
        type: 'steps'
      }
    ]
  },
  staff: {
    dashboard: [
      {
        id: 'overview',
        title: 'Staff Dashboard Overview',
        content: 'Manage daily operations and monitor fleet activities.',
        steps: [
          'Check today\'s statistics in the top cards',
          'Review upcoming tasks and deadlines',
          'Monitor recent system activities',
          'Use quick action buttons for common tasks',
          'Navigate to specific management sections'
        ],
        type: 'steps'
      },
      {
        id: 'quick_actions',
        title: 'Quick Actions',
        content: 'Access frequently used features quickly.',
        steps: [
          'Manage Users: Add, edit, or remove user accounts',
          'Fleet Management: View and manage vehicles',
          'Maintenance: Schedule and track maintenance',
          'Reports: Generate operational reports'
        ],
        type: 'steps'
      }
    ],
    users: [
      {
        id: 'user_management',
        title: 'User Management Guide',
        content: 'Manage your team members and their access levels.',
        steps: [
          'View all users in the list below',
          'Use search bar to find specific users',
          'Filter by role using the dropdown',
          'Click Edit to modify user details',
          'Click Delete to remove users',
          'Use Add New User to create accounts'
        ],
        type: 'steps'
      },
      {
        id: 'user_roles',
        title: 'Understanding User Roles',
        content: 'Different roles have different permissions and access levels.',
        steps: [
          'Admin: Full system access and company management',
          'Staff: Operations management and user oversight',
          'Driver: Vehicle and route management only',
          'Inspector: Vehicle inspection and reporting'
        ],
        type: 'steps'
      }
    ],
    vehicles: [
      {
        id: 'fleet_management',
        title: 'Fleet Management Guide',
        content: 'Monitor and manage your vehicle fleet effectively.',
        steps: [
          'View all vehicles in your fleet',
          'Check fuel levels and maintenance status',
          'Monitor mileage and service schedules',
          'Assign drivers to vehicles',
          'Schedule maintenance appointments',
          'Track vehicle performance metrics'
        ],
        type: 'steps'
      },
      {
        id: 'fuel_monitoring',
        title: 'Fuel Level Monitoring',
        content: 'Keep track of vehicle fuel levels to prevent breakdowns.',
        steps: [
          'Green bar (75%+): Fuel level good',
          'Yellow bar (25-75%): Schedule refueling soon',
          'Red bar (<25%): Urgent refueling needed',
          'Set up automatic alerts for low fuel'
        ],
        type: 'steps'
      }
    ],
    maintenance: [
      {
        id: 'maintenance_tracking',
        title: 'Maintenance Management',
        content: 'Schedule and track vehicle maintenance to ensure fleet reliability.',
        steps: [
          'View all maintenance records',
          'Check maintenance status and priorities',
          'Schedule new maintenance appointments',
          'Update maintenance progress',
          'Track maintenance costs',
          'Assign technicians to jobs'
        ],
        type: 'steps'
      },
      {
        id: 'priority_levels',
        title: 'Understanding Priority Levels',
        content: 'Properly prioritize maintenance tasks for optimal fleet performance.',
        steps: [
          'High Priority: Safety issues, breakdowns, urgent repairs',
          'Medium Priority: Regular maintenance, scheduled services',
          'Low Priority: Cosmetic repairs, optional upgrades'
        ],
        type: 'steps'
      }
    ]
  },
  driver: {
    dashboard: [
      {
        id: 'driver_overview',
        title: 'Driver Dashboard Guide',
        content: 'Your personal dashboard for managing your driving tasks.',
        steps: [
          'Check your assigned vehicle details',
          'View your current route and progress',
          'Monitor fuel levels and maintenance alerts',
          'Update your status and location',
          'Report issues or incidents',
          'Access navigation and route optimization'
        ],
        type: 'steps'
      },
      {
        id: 'route_management',
        title: 'Route Management',
        content: 'Navigate your assigned routes efficiently.',
        steps: [
          'View your current route details',
          'Check stop locations and delivery times',
          'Update delivery status at each stop',
          'Report any route issues or delays',
          'Request route modifications if needed'
        ],
        type: 'steps'
      }
    ]
  },
  inspector: {
    dashboard: [
      {
        id: 'inspector_overview',
        title: 'Inspector Dashboard Guide',
        content: 'Manage vehicle inspections and safety compliance.',
        steps: [
          'View your daily inspection schedule',
          'Check vehicles awaiting inspection',
          'Record inspection results',
          'Report safety issues found',
          'Generate inspection reports',
          'Schedule follow-up inspections'
        ],
        type: 'steps'
      },
      {
        id: 'inspection_process',
        title: 'Vehicle Inspection Process',
        content: 'Follow the proper inspection procedure for safety compliance.',
        steps: [
          'Review vehicle history and previous issues',
          'Conduct thorough visual inspection',
          'Test all safety systems',
          'Check maintenance records',
          'Record findings in inspection report',
          'Mark vehicle as passed or failed',
          'Schedule next inspection if passed'
        ],
        type: 'steps'
      }
    ]
  }
};

export default function HelpModal({ isOpen, onClose, role, page }: HelpModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const sections = helpContent[role]?.[page] || [];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'from-purple-600 to-pink-600',
      staff: 'from-blue-600 to-purple-600',
      driver: 'from-green-600 to-blue-600',
      inspector: 'from-yellow-600 to-orange-600'
    };
    return colors[role as keyof typeof colors] || 'from-gray-600 to-gray-800';
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      admin: '👑',
      staff: '👥',
      driver: '🚛',
      inspector: '🔍'
    };
    return icons[role as keyof typeof icons] || '❓';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Help Center - {getRoleIcon(role)} {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                </CardTitle>
                <p className="text-blue-100 text-sm">
                  Step-by-step guide for {page.replace('_', ' ')} page
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            {/* Quick Contact */}
            <Card className="border-l-4 border-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold">Need More Help?</h4>
                    <p className="text-sm text-gray-600">
                      Contact support at support@fleetcorp.com or call (555) 123-4567
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Sections */}
            {sections.map((section) => (
              <Card key={section.id} className="border-l-4 border-blue-500">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        {section.type === 'steps' ? <BookOpen className="h-4 w-4 text-white" /> :
                         section.type === 'video' ? <Video className="h-4 w-4 text-white" /> :
                         <HelpCircle className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <p className="text-sm text-gray-600">{section.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {section.type === 'steps' ? 'Step Guide' :
                         section.type === 'video' ? 'Video Tutorial' :
                         'Information'}
                      </Badge>
                      {expandedSections.has(section.id) ? 
                        <ChevronDown className="h-5 w-5 text-gray-400" /> :
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      }
                    </div>
                  </div>
                </CardHeader>
                
                {expandedSections.has(section.id) && (
                  <CardContent className="pt-0">
                    {section.type === 'steps' && section.steps && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Follow these steps:</h4>
                        {section.steps.map((step, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-sm text-gray-700">{step}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {section.type === 'video' && section.videoUrl && (
                      <div className="space-y-3">
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Video tutorial coming soon</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {section.type === 'text' && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-700">{section.content}</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}

            {/* No content available */}
            {sections.length === 0 && (
              <Card className="border-l-4 border-yellow-500">
                <CardContent className="p-6 text-center">
                  <HelpCircle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Help Content Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    We're working on detailed help content for this page. 
                    Contact support for immediate assistance.
                  </p>
                  <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
