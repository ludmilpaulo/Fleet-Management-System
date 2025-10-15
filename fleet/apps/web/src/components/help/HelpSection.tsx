"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Phone,
  ChevronRight,
  ChevronDown,
  Camera,
  Gauge,
  Car,
  Users,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface HelpItem {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: React.ReactNode;
}

const helpItems: HelpItem[] = [
  {
    id: 'inspection-start',
    title: 'How to Start a Vehicle Inspection',
    content: `
      1. Navigate to the Inspections section
      2. Enter your Vehicle ID
      3. Click "Start Shift" to begin
      4. Click "Create START Inspection" or "Create END Inspection"
      5. Follow the step-by-step process
      6. Record fuel level and take photo
      7. Record odometer reading and take photo
      8. Review all information
      9. Submit the inspection
    `,
    category: 'Inspections',
    icon: <Car className="h-5 w-5" />
  },
  {
    id: 'fuel-level',
    title: 'Recording Fuel Level with Photos',
    content: `
      Fuel Level Recording Steps:
      1. Enter the fuel percentage (0-100%)
      2. Click "Take Photo" or use camera icon
      3. Capture a clear image of the fuel gauge
      4. Ensure the gauge is well-lit and readable
      5. Review the photo before proceeding
      6. If photo is unclear, retake it
      
      Photo Requirements:
      - Clear, sharp image
      - Good lighting
      - Gauge fully visible
      - No blur or obstruction
    `,
    category: 'Inspections',
    icon: <Gauge className="h-5 w-5" />
  },
  {
    id: 'odometer',
    title: 'Recording Odometer Reading with Photos',
    content: `
      Odometer Recording Steps:
      1. Enter the current odometer reading in kilometers
      2. Click "Take Photo" or use camera icon
      3. Capture a clear image of the odometer display
      4. Ensure all digits are visible and readable
      5. Review the photo quality
      6. Retake if any numbers are unclear
      
      Photo Requirements:
      - All digits clearly visible
      - Proper lighting
      - Straight-on angle preferred
      - No reflections or glare
    `,
    category: 'Inspections',
    icon: <Camera className="h-5 w-5" />
  },
  {
    id: 'mobile-inspection',
    title: 'Mobile Inspection Process',
    content: `
      Mobile devices use a 3-step process:
      
      Step 1: Fuel Level & Photo
      - Enter fuel percentage
      - Take fuel gauge photo
      - Review and proceed
      
      Step 2: Odometer & Photo
      - Enter odometer reading
      - Take odometer photo
      - Review and proceed
      
      Step 3: Final Review
      - Review all entered data
      - Check photo quality
      - Set inspection status
      - Submit inspection
    `,
    category: 'Mobile',
    icon: <Camera className="h-5 w-5" />
  },
  {
    id: 'photo-upload',
    title: 'Photo Upload Issues',
    content: `
      Common Photo Upload Problems:
      
      Problem: Photos not uploading
      Solution: Check internet connection, try smaller file size
      
      Problem: Camera not opening
      Solution: Grant camera permissions in browser settings
      
      Problem: Blurry photos
      Solution: Clean camera lens, ensure adequate lighting
      
      Problem: Upload timeout
      Solution: Check network stability, try again
      
      Photo Requirements:
      - File size: Under 10MB
      - Formats: JPG, PNG, WebP
      - Quality: Clear and readable
    `,
    category: 'Troubleshooting',
    icon: <AlertCircle className="h-5 w-5" />
  },
  {
    id: 'vehicle-management',
    title: 'Managing Vehicles',
    content: `
      Adding New Vehicles:
      1. Go to Vehicles section
      2. Click "Add Vehicle"
      3. Fill in registration details
      4. Add make, model, year, color
      5. Upload vehicle photos
      6. Save vehicle information
      
      Editing Vehicles:
      1. Find vehicle in list
      2. Click on vehicle to view details
      3. Use edit button to modify
      4. Update information as needed
      5. Save changes
    `,
    category: 'Vehicles',
    icon: <Car className="h-5 w-5" />
  },
  {
    id: 'user-management',
    title: 'User Account Management',
    content: `
      Profile Settings:
      1. Click on your profile/avatar
      2. Select "Settings" or "Profile"
      3. Update personal information
      4. Change password if needed
      5. Set notification preferences
      6. Save changes
      
      Organization Settings:
      - View assigned vehicles
      - Check permissions
      - Contact team members
      - Configure preferences
    `,
    category: 'Account',
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'dashboard',
    title: 'Understanding the Dashboard',
    content: `
      Dashboard Components:
      - Active Vehicles: Currently in use
      - Inspection Status: Recent results
      - Maintenance Alerts: Upcoming services
      - Fuel Efficiency: Consumption metrics
      
      Navigation:
      - Use sidebar menu for main sections
      - Breadcrumbs show current location
      - Quick actions available on dashboard
      - Search function for finding items
    `,
    category: 'General',
    icon: <Settings className="h-5 w-5" />
  }
];

const categories = ['All', 'Inspections', 'Mobile', 'Troubleshooting', 'Vehicles', 'Account', 'General'];

export default function HelpSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredItems = helpItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Help Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filter */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Help Items */}
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No help topics found matching your search.
              </div>
            ) : (
              filteredItems.map(item => (
                <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader 
                    className="pb-3"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-blue-600">
                          {item.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                      </div>
                      {expandedItems.includes(item.id) ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  {expandedItems.includes(item.id) && (
                    <CardContent className="pt-0">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {item.content}
                        </pre>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Need More Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  User Guide
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video Tutorials
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Live Chat
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Call Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-900">Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Technical Support</h4>
                  <p>Email: support@fleetmanagement.com</p>
                  <p>Phone: +1-800-FLEET-01</p>
                  <p>Hours: 24/7 emergency support</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Training & Resources</h4>
                  <p>Video Tutorials: Available in Help Center</p>
                  <p>Webinars: Monthly training sessions</p>
                  <p>Documentation: Complete user guides</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
