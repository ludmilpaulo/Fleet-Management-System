"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  ChevronRight,
  ChevronDown,
  Camera,
  Gauge,
  Car,
  Phone,
  MessageCircle,
  BookOpen
} from 'lucide-react';

interface HelpItem {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
}

const mobileHelpItems: HelpItem[] = [
  {
    id: 'inspection-mobile',
    title: 'Mobile Inspection Process',
    content: `Follow these 3 simple steps:

Step 1: Fuel Level
• Enter fuel percentage (0-100%)
• Take clear photo of fuel gauge
• Tap "Next" when ready

Step 2: Odometer
• Enter odometer reading in KM
• Take clear photo of odometer
• Ensure all numbers are visible
• Tap "Next" when ready

Step 3: Review & Submit
• Review all entered data
• Check photo quality
• Select Pass/Fail status
• Tap "Complete Inspection"`,
    icon: <Camera className="h-5 w-5" />
  },
  {
    id: 'photo-tips',
    title: 'Photo Taking Tips',
    content: `For Best Results:

Lighting:
• Use good lighting or flash
• Avoid shadows on gauge/odometer
• Ensure display is clearly visible

Positioning:
• Hold phone steady
• Get close enough to read clearly
• Take straight-on photos
• Avoid angles and reflections

Quality Check:
• Review photo before proceeding
• Retake if blurry or unclear
• Ensure all digits are readable
• Check for glare or obstructions`,
    icon: <Gauge className="h-5 w-5" />
  },
  {
    id: 'troubleshooting',
    title: 'Common Issues',
    content: `Quick Solutions:

Camera Issues:
• Grant camera permissions
• Restart app if needed
• Check camera lens is clean
• Try different lighting

Upload Problems:
• Check internet connection
• Try smaller photo file
• Restart upload process
• Contact support if persists

App Performance:
• Close other apps
• Restart mobile app
• Check device storage
• Update to latest version`,
    icon: <HelpCircle className="h-5 w-5" />
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `First Time Setup:

1. Login with your credentials
2. Allow camera permissions
3. Allow location access
4. Test camera functionality
5. Complete first inspection

Navigation:
• Use bottom navigation tabs
• Swipe between screens
• Tap for selections
• Pull down to refresh data

Best Practices:
• Keep app updated
• Regular data sync
• Clear photos required
• Accurate readings essential`,
    icon: <Car className="h-5 w-5" />
  }
];

export default function MobileHelp() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <HelpCircle className="h-6 w-6" />
              Mobile Help Center
            </CardTitle>
          </CardHeader>
        </Card>

        {mobileHelpItems.map(item => (
          <Card key={item.id} className="cursor-pointer">
            <CardHeader 
              className="pb-3"
              onClick={() => toggleExpanded(item.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">
                    {item.icon}
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
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
        ))}

        {/* Quick Actions */}
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 text-center">Need More Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => window.open('tel:+1800FLEET01')}
            >
              <Phone className="h-4 w-4" />
              Call Support: +1-800-FLEET-01
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => window.open('mailto:support@fleetmanagement.com')}
            >
              <MessageCircle className="h-4 w-4" />
              Email Support
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => window.open('/help', '_blank')}
            >
              <BookOpen className="h-4 w-4" />
              Full User Guide
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900 text-center text-base">Emergency Support</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-red-800 mb-3">
              For urgent technical issues affecting vehicle operations:
            </p>
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.open('tel:+1800FLEET01')}
            >
              Emergency Hotline: +1-800-FLEET-01
            </Button>
            <p className="text-xs text-red-700 mt-2">
              Available 24/7 for critical issues
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
