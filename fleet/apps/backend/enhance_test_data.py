#!/usr/bin/env python
"""
Enhanced Test Data Script
Adds more realistic and comprehensive data to the existing backend
"""

import os
import django
import sys
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from account.models import Company
from fleet_app.models import Vehicle, Shift
from inspections.models import Inspection, InspectionItem
from issues.models import Issue
from tickets.models import Ticket
from platform_admin.models import SubscriptionPlan, CompanySubscription

User = get_user_model()

def print_header(text):
    print("\n" + "="*80)
    print(f"  {text}")
    print("="*80)

def enhance_vehicles():
    """Add more realistic vehicle data with better details"""
    print_header("Enhancing Vehicle Data")
    
    companies = Company.objects.all()
    if not companies:
        print("  ❌ No companies found. Please run seed_test_data.py first.")
        return []
    
    # More realistic vehicle makes and models
    vehicle_data = [
        # Trucks
        {'make': 'Ford', 'model': 'F-150', 'year': 2023, 'fuel_type': 'PETROL', 'color': 'White', 'status': 'ACTIVE'},
        {'make': 'Ford', 'model': 'Transit', 'year': 2022, 'fuel_type': 'DIESEL', 'color': 'Blue', 'status': 'ACTIVE'},
        {'make': 'Chevrolet', 'model': 'Silverado', 'year': 2021, 'fuel_type': 'PETROL', 'color': 'Black', 'status': 'ACTIVE'},
        {'make': 'Toyota', 'model': 'Tacoma', 'year': 2023, 'fuel_type': 'PETROL', 'color': 'Silver', 'status': 'ACTIVE'},
        {'make': 'Mercedes', 'model': 'Sprinter', 'year': 2022, 'fuel_type': 'DIESEL', 'color': 'White', 'status': 'ACTIVE'},
        
        # Vans
        {'make': 'Ford', 'model': 'Transit Van', 'year': 2021, 'fuel_type': 'DIESEL', 'color': 'Gray', 'status': 'ACTIVE'},
        {'make': 'Mercedes', 'model': 'Metris', 'year': 2020, 'fuel_type': 'PETROL', 'color': 'White', 'status': 'ACTIVE'},
        {'make': 'Ram', 'model': 'ProMaster', 'year': 2022, 'fuel_type': 'DIESEL', 'color': 'Red', 'status': 'ACTIVE'},
        
        # Electric Vehicles
        {'make': 'Tesla', 'model': 'Model 3', 'year': 2023, 'fuel_type': 'ELECTRIC', 'color': 'White', 'status': 'ACTIVE'},
        {'make': 'Rivian', 'model': 'R1T', 'year': 2023, 'fuel_type': 'ELECTRIC', 'color': 'Blue', 'status': 'ACTIVE'},
        {'make': 'Ford', 'model': 'F-150 Lightning', 'year': 2023, 'fuel_type': 'ELECTRIC', 'color': 'Black', 'status': 'ACTIVE'},
        
        # Maintenance vehicles
        {'make': 'Toyota', 'model': 'Camry', 'year': 2019, 'fuel_type': 'PETROL', 'color': 'Silver', 'status': 'MAINTENANCE'},
        {'make': 'Honda', 'model': 'Civic', 'year': 2018, 'fuel_type': 'PETROL', 'color': 'White', 'status': 'MAINTENANCE'},
        
        # Inactive vehicles
        {'make': 'Nissan', 'model': 'Frontier', 'year': 2017, 'fuel_type': 'PETROL', 'color': 'Gray', 'status': 'INACTIVE'},
    ]
    
    vehicles = []
    for i, data in enumerate(vehicle_data, 1):
        company = companies[0]  # Use FleetCorp Solutions
        vehicle, created = Vehicle.objects.get_or_create(
            org=company,
            reg_number=f'FC-{str(i).zfill(3)}',
            defaults={
                'make': data['make'],
                'model': data['model'],
                'year': data['year'],
                'vin': f'VIN{data["make"][:3].upper()}{str(i).zfill(10)}',
                'status': data['status'],
                'mileage': random.randint(15000, 120000),
                'fuel_type': data['fuel_type'],
                'color': data['color'],
                'transmission': 'AUTOMATIC' if data['fuel_type'] == 'ELECTRIC' else random.choice(['MANUAL', 'AUTOMATIC']),
            }
        )
        vehicles.append(vehicle)
        status = "Created" if created else "Already exists"
        print(f"  ✓ {vehicle.reg_number} ({vehicle.make} {vehicle.model} {vehicle.year}) - {status}")
    
    return vehicles

def create_realistic_inspections():
    """Create more realistic inspection data"""
    print_header("Creating Realistic Inspections")
    
    vehicles = Vehicle.objects.filter(org__name='FleetCorp Solutions')
    inspectors = User.objects.filter(role='inspector', company__name='FleetCorp Solutions')
    
    if not vehicles.exists() or not inspectors.exists():
        print("  ❌ No vehicles or inspectors found.")
        return []
    
    inspection_templates = [
        {
            'category': 'Pre-Trip Inspection',
            'items': [
                {'name': 'Engine Oil Level', 'status': 'pass', 'notes': 'Oil level within normal range'},
                {'name': 'Tire Pressure', 'status': 'pass', 'notes': 'All tires properly inflated'},
                {'name': 'Brake System', 'status': 'pass', 'notes': 'Brakes functioning normally'},
                {'name': 'Lights', 'status': 'pass', 'notes': 'All lights operational'},
                {'name': 'Mirrors', 'status': 'pass', 'notes': 'Mirrors clean and properly adjusted'},
            ]
        },
        {
            'category': 'Safety Inspection',
            'items': [
                {'name': 'Emergency Equipment', 'status': 'pass', 'notes': 'Fire extinguisher and first aid kit present'},
                {'name': 'Seat Belts', 'status': 'pass', 'notes': 'All seat belts functional'},
                {'name': 'Airbags', 'status': 'pass', 'notes': 'Airbag system operational'},
                {'name': 'Horn', 'status': 'pass', 'notes': 'Horn working properly'},
                {'name': 'Windshield Wipers', 'status': 'pass', 'notes': 'Wipers functioning correctly'},
            ]
        },
        {
            'category': 'Mechanical Inspection',
            'items': [
                {'name': 'Transmission', 'status': 'pass', 'notes': 'Transmission shifting smoothly'},
                {'name': 'Steering', 'status': 'pass', 'notes': 'Steering responsive'},
                {'name': 'Suspension', 'status': 'pass', 'notes': 'Suspension in good condition'},
                {'name': 'Exhaust System', 'status': 'pass', 'notes': 'No leaks detected'},
                {'name': 'Battery', 'status': 'pass', 'notes': 'Battery voltage normal'},
            ]
        }
    ]
    
    inspections = []
    for i in range(30):  # Create 30 inspections
        vehicle = random.choice(list(vehicles))
        inspector = random.choice(list(inspectors))
        
        inspection_date = timezone.now() - timedelta(days=random.randint(0, 60))
        template = random.choice(inspection_templates)
        
        # 85% pass rate
        passed = random.random() < 0.85
        
        inspection = Inspection.objects.create(
            vehicle=vehicle,
            inspector=inspector,
            inspection_date=inspection_date,
            odometer_reading=vehicle.mileage + random.randint(-2000, 2000),
            passed=passed,
            notes=f'{template["category"]} - {"Passed" if passed else "Failed due to issues"}',
            next_inspection_due=inspection_date + timedelta(days=90)
        )
        
        # Create inspection items
        for item_data in template['items']:
            item_passed = passed or random.random() < 0.3  # If inspection failed, some items might still pass
            InspectionItem.objects.create(
                inspection=inspection,
                category=template['category'],
                item_name=item_data['name'],
                status='pass' if item_passed else 'fail',
                notes=item_data['notes'] if item_passed else f'{item_data["name"]} needs attention'
            )
        
        inspections.append(inspection)
        print(f"  ✓ {template['category']} - {vehicle.reg_number} by {inspector.username} ({'PASSED' if passed else 'FAILED'})")
    
    return inspections

def create_realistic_issues():
    """Create more realistic issue data"""
    print_header("Creating Realistic Issues")
    
    vehicles = Vehicle.objects.filter(org__name='FleetCorp Solutions')
    users = User.objects.filter(company__name='FleetCorp Solutions')
    
    if not vehicles.exists() or not users.exists():
        print("  ❌ No vehicles or users found.")
        return []
    
    issue_templates = [
        {
            'issue_type': 'mechanical',
            'priority': 'high',
            'description': 'Engine making unusual noise during acceleration',
            'status': 'open'
        },
        {
            'issue_type': 'electrical',
            'priority': 'medium',
            'description': 'Dashboard warning lights not functioning properly',
            'status': 'in_progress'
        },
        {
            'issue_type': 'body_damage',
            'priority': 'low',
            'description': 'Minor scratch on rear bumper from parking incident',
            'status': 'resolved'
        },
        {
            'issue_type': 'maintenance',
            'priority': 'medium',
            'description': 'Oil change overdue by 500 miles',
            'status': 'open'
        },
        {
            'issue_type': 'mechanical',
            'priority': 'critical',
            'description': 'Brake system warning light illuminated',
            'status': 'open'
        },
        {
            'issue_type': 'electrical',
            'priority': 'high',
            'description': 'Air conditioning system not cooling properly',
            'status': 'in_progress'
        },
        {
            'issue_type': 'maintenance',
            'priority': 'low',
            'description': 'Tire rotation needed',
            'status': 'resolved'
        },
        {
            'issue_type': 'mechanical',
            'priority': 'medium',
            'description': 'Transmission shifting roughly between gears',
            'status': 'open'
        }
    ]
    
    issues = []
    for i in range(20):  # Create 20 issues
        vehicle = random.choice(list(vehicles))
        reporter = random.choice(list(users))
        template = random.choice(issue_templates)
        
        created_date = timezone.now() - timedelta(days=random.randint(0, 30))
        
        issue = Issue.objects.create(
            vehicle=vehicle,
            reported_by=reporter,
            issue_type=template['issue_type'],
            priority=template['priority'],
            status=template['status'],
            description=template['description'],
            reported_at=created_date,
            resolved_at=created_date + timedelta(days=random.randint(1, 7)) if template['status'] in ['resolved', 'closed'] else None
        )
        
        issues.append(issue)
        print(f"  ✓ {template['issue_type'].title()} issue - {vehicle.reg_number} ({template['priority']} priority, {template['status']})")
    
    return issues

def create_realistic_tickets():
    """Create realistic support tickets"""
    print_header("Creating Realistic Tickets")
    
    users = User.objects.filter(company__name='FleetCorp Solutions')
    
    if not users.exists():
        print("  ❌ No users found.")
        return []
    
    ticket_templates = [
        {
            'category': 'technical',
            'priority': 'high',
            'subject': 'Mobile app not syncing with dashboard',
            'description': 'The mobile app shows different data than the web dashboard. Last sync was 3 hours ago.',
            'status': 'open'
        },
        {
            'category': 'feature_request',
            'priority': 'medium',
            'subject': 'Request for fuel tracking feature',
            'description': 'Would like to track fuel consumption and costs per vehicle.',
            'status': 'open'
        },
        {
            'category': 'bug_report',
            'priority': 'medium',
            'subject': 'Inspection form not saving properly',
            'description': 'When completing inspections on mobile, the form sometimes fails to save.',
            'status': 'in_progress'
        },
        {
            'category': 'technical',
            'priority': 'low',
            'subject': 'Slow loading times on dashboard',
            'description': 'The dashboard takes longer than usual to load vehicle data.',
            'status': 'resolved'
        },
        {
            'category': 'account',
            'priority': 'medium',
            'subject': 'Need to add new driver to system',
            'description': 'New driver John Smith needs to be added to the system with appropriate permissions.',
            'status': 'open'
        },
        {
            'category': 'technical',
            'priority': 'critical',
            'subject': 'GPS tracking not working',
            'description': 'GPS tracking has been offline for the past 2 hours. Need immediate assistance.',
            'status': 'open'
        }
    ]
    
    tickets = []
    for i in range(15):  # Create 15 tickets
        user = random.choice(list(users))
        template = random.choice(ticket_templates)
        
        created_date = timezone.now() - timedelta(days=random.randint(0, 14))
        
        ticket = Ticket.objects.create(
            created_by=user,
            category=template['category'],
            priority=template['priority'],
            subject=template['subject'],
            description=template['description'],
            status=template['status'],
            created_at=created_date,
            updated_at=created_date + timedelta(hours=random.randint(1, 48)) if template['status'] != 'open' else created_date
        )
        
        tickets.append(ticket)
        print(f"  ✓ {template['category'].title()} ticket - {template['subject'][:30]}... ({template['priority']} priority, {template['status']})")
    
    return tickets

def create_realistic_shifts():
    """Create more realistic shift data"""
    print_header("Creating Realistic Shifts")
    
    drivers = User.objects.filter(role='driver', company__name='FleetCorp Solutions')
    vehicles = Vehicle.objects.filter(org__name='FleetCorp Solutions', status='ACTIVE')
    
    if not drivers.exists() or not vehicles.exists():
        print("  ❌ No drivers or active vehicles found.")
        return []
    
    shift_templates = [
        {
            'start_time': '06:00',
            'end_time': '14:00',
            'notes': 'Morning delivery route - Downtown area',
            'status': 'COMPLETED'
        },
        {
            'start_time': '14:00',
            'end_time': '22:00',
            'notes': 'Afternoon pickup route - Industrial zone',
            'status': 'COMPLETED'
        },
        {
            'start_time': '22:00',
            'end_time': '06:00',
            'notes': 'Night shift - Long haul delivery',
            'status': 'ACTIVE'
        },
        {
            'start_time': '08:00',
            'end_time': '16:00',
            'notes': 'Regular route - Residential pickup',
            'status': 'COMPLETED'
        },
        {
            'start_time': '10:00',
            'end_time': '18:00',
            'notes': 'Express delivery - Priority packages',
            'status': 'CANCELLED'
        }
    ]
    
    shifts = []
    for i in range(25):  # Create 25 shifts
        driver = random.choice(list(drivers))
        vehicle = random.choice(list(vehicles))
        template = random.choice(shift_templates)
        
        # Create realistic dates
        days_ago = random.randint(0, 30)
        start_date = timezone.now() - timedelta(days=days_ago)
        
        # Parse time and create datetime
        start_hour, start_min = map(int, template['start_time'].split(':'))
        end_hour, end_min = map(int, template['end_time'].split(':'))
        
        shift_start = start_date.replace(hour=start_hour, minute=start_min, second=0, microsecond=0)
        
        if template['status'] == 'ACTIVE':
            shift_end = None
        else:
            # Handle overnight shifts
            if end_hour < start_hour:
                shift_end = shift_start + timedelta(days=1, hours=end_hour-start_hour, minutes=end_min-start_min)
            else:
                shift_end = shift_start + timedelta(hours=end_hour-start_hour, minutes=end_min-start_min)
        
        # Create realistic addresses
        addresses = [
            '123 Main St, Downtown',
            '456 Industrial Blvd, Industrial Zone',
            '789 Residential Ave, Suburbs',
            '321 Business Park Dr, Business District',
            '654 Warehouse Row, Distribution Center'
        ]
        
        shift = Shift.objects.create(
            vehicle=vehicle,
            driver=driver,
            start_at=shift_start,
            end_at=shift_end,
            status=template['status'],
            start_address=random.choice(addresses),
            end_address=random.choice(addresses) if template['status'] == 'COMPLETED' else '',
            notes=template['notes']
        )
        
        shifts.append(shift)
        print(f"  ✓ Shift {shift.id} - {driver.username} in {vehicle.reg_number} ({template['status']})")
    
    return shifts

def main():
    print("\n" + "="*80)
    print("  FLEET MANAGEMENT SYSTEM - ENHANCED DATA GENERATOR")
    print("="*80)
    
    try:
        # Create enhanced data
        vehicles = enhance_vehicles()
        inspections = create_realistic_inspections()
        issues = create_realistic_issues()
        tickets = create_realistic_tickets()
        shifts = create_realistic_shifts()
        
        print_header("ENHANCEMENT SUMMARY")
        print(f"  ✓ Vehicles enhanced: {len(vehicles)}")
        print(f"  ✓ Inspections created: {len(inspections)}")
        print(f"  ✓ Issues created: {len(issues)}")
        print(f"  ✓ Tickets created: {len(tickets)}")
        print(f"  ✓ Shifts created: {len(shifts)}")
        
        print("\n" + "="*80)
        print("  ✅ ENHANCED DATA GENERATION COMPLETED!")
        print("="*80)
        print("\n📊 The backend now has more realistic and comprehensive data!")
        print("   - Enhanced vehicle details with realistic makes/models")
        print("   - Detailed inspection records with proper categories")
        print("   - Realistic issues with appropriate priorities")
        print("   - Support tickets with various categories")
        print("   - Detailed shift records with realistic timing")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
