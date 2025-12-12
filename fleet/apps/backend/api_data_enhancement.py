#!/usr/bin/env python
"""
API-based Data Enhancement Script
This script can be run on the production server to enhance the backend data
"""

import os
import django
import sys
from datetime import timedelta
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

User = get_user_model()

def print_header(text):
    print("\n" + "="*80)
    print(f"  {text}")
    print("="*80)

def enhance_dashboard_stats():
    """Enhance the dashboard statistics with more realistic data"""
    print_header("Enhancing Dashboard Statistics")
    
    # Get or create FleetCorp Solutions company
    company, created = Company.objects.get_or_create(
        name='FleetCorp Solutions',
        defaults={
            'email': 'contact@fleetcorp.com',
            'subscription_plan': 'professional'
        }
    )
    
    if created:
        print(f"  ✓ Created company: {company.name}")
    else:
        print(f"  ✓ Company exists: {company.name}")
    
    return company

def add_realistic_vehicles(company):
    """Add more realistic vehicles"""
    print_header("Adding Realistic Vehicles")
    
    vehicle_data = [
        # Delivery Trucks
        {'reg_number': 'FC-101', 'make': 'Ford', 'model': 'Transit', 'year': 2023, 'fuel_type': 'DIESEL', 'color': 'White', 'status': 'ACTIVE', 'mileage': 25000},
        {'reg_number': 'FC-102', 'make': 'Mercedes', 'model': 'Sprinter', 'year': 2022, 'fuel_type': 'DIESEL', 'color': 'Blue', 'status': 'ACTIVE', 'mileage': 45000},
        {'reg_number': 'FC-103', 'make': 'Ram', 'model': 'ProMaster', 'year': 2023, 'fuel_type': 'PETROL', 'color': 'White', 'status': 'ACTIVE', 'mileage': 18000},
        {'reg_number': 'FC-104', 'make': 'Ford', 'model': 'F-150', 'year': 2022, 'fuel_type': 'PETROL', 'color': 'Black', 'status': 'ACTIVE', 'mileage': 32000},
        
        # Electric Vehicles
        {'reg_number': 'FC-201', 'make': 'Tesla', 'model': 'Model 3', 'year': 2023, 'fuel_type': 'ELECTRIC', 'color': 'White', 'status': 'ACTIVE', 'mileage': 15000},
        {'reg_number': 'FC-202', 'make': 'Rivian', 'model': 'R1T', 'year': 2023, 'fuel_type': 'ELECTRIC', 'color': 'Blue', 'status': 'ACTIVE', 'mileage': 12000},
        {'reg_number': 'FC-203', 'make': 'Ford', 'model': 'F-150 Lightning', 'year': 2023, 'fuel_type': 'ELECTRIC', 'color': 'Black', 'status': 'ACTIVE', 'mileage': 8000},
        
        # Maintenance Vehicles
        {'reg_number': 'FC-301', 'make': 'Toyota', 'model': 'Camry', 'year': 2019, 'fuel_type': 'PETROL', 'color': 'Silver', 'status': 'MAINTENANCE', 'mileage': 85000},
        {'reg_number': 'FC-302', 'make': 'Honda', 'model': 'Civic', 'year': 2018, 'fuel_type': 'PETROL', 'color': 'White', 'status': 'MAINTENANCE', 'mileage': 95000},
        
        # Inactive Vehicles
        {'reg_number': 'FC-401', 'make': 'Nissan', 'model': 'Frontier', 'year': 2017, 'fuel_type': 'PETROL', 'color': 'Gray', 'status': 'INACTIVE', 'mileage': 120000},
    ]
    
    vehicles = []
    for data in vehicle_data:
        vehicle, created = Vehicle.objects.get_or_create(
            org=company,
            reg_number=data['reg_number'],
            defaults={
                'make': data['make'],
                'model': data['model'],
                'year': data['year'],
                'vin': f'VIN{data["make"][:3].upper()}{data["reg_number"].split("-")[1]}',
                'status': data['status'],
                'mileage': data['mileage'],
                'fuel_type': data['fuel_type'],
                'color': data['color'],
                'transmission': 'AUTOMATIC' if data['fuel_type'] == 'ELECTRIC' else random.choice(['MANUAL', 'AUTOMATIC']),
            }
        )
        vehicles.append(vehicle)
        status = "Created" if created else "Already exists"
        print(f"  ✓ {vehicle.reg_number} ({vehicle.make} {vehicle.model} {vehicle.year}) - {status}")
    
    return vehicles

def add_realistic_inspections(vehicles):
    """Add realistic inspection data"""
    print_header("Adding Realistic Inspections")
    
    inspectors = User.objects.filter(role='inspector', company__name='FleetCorp Solutions')
    
    if not inspectors.exists():
        print("  ❌ No inspectors found. Creating inspector user...")
        inspector = User.objects.create_user(
            username='inspector_main',
            email='inspector@fleetcorp.com',
            password='inspector123',
            role='inspector',
            company=Company.objects.get(name='FleetCorp Solutions'),
            first_name='Main',
            last_name='Inspector'
        )
        inspectors = [inspector]
        print(f"  ✓ Created inspector: {inspector.username}")
    
    inspection_categories = [
        {
            'name': 'Pre-Trip Inspection',
            'items': [
                {'name': 'Engine Oil Level', 'status': 'pass', 'notes': 'Oil level within normal range'},
                {'name': 'Tire Pressure', 'status': 'pass', 'notes': 'All tires properly inflated'},
                {'name': 'Brake System', 'status': 'pass', 'notes': 'Brakes functioning normally'},
                {'name': 'Lights', 'status': 'pass', 'notes': 'All lights operational'},
                {'name': 'Mirrors', 'status': 'pass', 'notes': 'Mirrors clean and properly adjusted'},
            ]
        },
        {
            'name': 'Safety Inspection',
            'items': [
                {'name': 'Emergency Equipment', 'status': 'pass', 'notes': 'Fire extinguisher and first aid kit present'},
                {'name': 'Seat Belts', 'status': 'pass', 'notes': 'All seat belts functional'},
                {'name': 'Airbags', 'status': 'pass', 'notes': 'Airbag system operational'},
                {'name': 'Horn', 'status': 'pass', 'notes': 'Horn working properly'},
                {'name': 'Windshield Wipers', 'status': 'pass', 'notes': 'Wipers functioning correctly'},
            ]
        },
        {
            'name': 'Mechanical Inspection',
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
    for i in range(20):  # Create 20 inspections
        vehicle = random.choice(vehicles)
        inspector = random.choice(list(inspectors))
        category = random.choice(inspection_categories)
        
        inspection_date = timezone.now() - timedelta(days=random.randint(0, 30))
        passed = random.random() < 0.85  # 85% pass rate
        
        inspection = Inspection.objects.create(
            vehicle=vehicle,
            inspector=inspector,
            inspection_date=inspection_date,
            odometer_reading=vehicle.mileage + random.randint(-1000, 1000),
            passed=passed,
            notes=f'{category["name"]} - {"Passed" if passed else "Failed due to issues"}',
            next_inspection_due=inspection_date + timedelta(days=90)
        )
        
        # Create inspection items
        for item_data in category['items']:
            item_passed = passed or random.random() < 0.3
            InspectionItem.objects.create(
                inspection=inspection,
                category=category['name'],
                item_name=item_data['name'],
                status='pass' if item_passed else 'fail',
                notes=item_data['notes'] if item_passed else f'{item_data["name"]} needs attention'
            )
        
        inspections.append(inspection)
        print(f"  ✓ {category['name']} - {vehicle.reg_number} by {inspector.username} ({'PASSED' if passed else 'FAILED'})")
    
    return inspections

def add_realistic_issues(vehicles):
    """Add realistic issue data"""
    print_header("Adding Realistic Issues")
    
    users = User.objects.filter(company__name='FleetCorp Solutions')
    
    issue_templates = [
        {'category': 'MECHANICAL', 'severity': 'HIGH', 'title': 'Engine Noise', 'description': 'Engine making unusual noise during acceleration', 'status': 'OPEN'},
        {'category': 'ELECTRICAL', 'severity': 'MEDIUM', 'title': 'Dashboard Warning Lights', 'description': 'Dashboard warning lights not functioning properly', 'status': 'IN_PROGRESS'},
        {'category': 'COSMETIC', 'severity': 'LOW', 'title': 'Bumper Scratch', 'description': 'Minor scratch on rear bumper from parking incident', 'status': 'RESOLVED'},
        {'category': 'MECHANICAL', 'severity': 'MEDIUM', 'title': 'Oil Change Overdue', 'description': 'Oil change overdue by 500 miles', 'status': 'OPEN'},
        {'category': 'BRAKE', 'severity': 'CRITICAL', 'title': 'Brake System Warning', 'description': 'Brake system warning light illuminated', 'status': 'OPEN'},
        {'category': 'ELECTRICAL', 'severity': 'HIGH', 'title': 'AC System Malfunction', 'description': 'Air conditioning system not cooling properly', 'status': 'IN_PROGRESS'},
        {'category': 'TYRE', 'severity': 'LOW', 'title': 'Tire Rotation Needed', 'description': 'Tire rotation needed', 'status': 'RESOLVED'},
        {'category': 'MECHANICAL', 'severity': 'MEDIUM', 'title': 'Transmission Issue', 'description': 'Transmission shifting roughly between gears', 'status': 'OPEN'},
    ]
    
    issues = []
    for i in range(15):  # Create 15 issues
        vehicle = random.choice(vehicles)
        reporter = random.choice(list(users))
        template = random.choice(issue_templates)
        
        created_date = timezone.now() - timedelta(days=random.randint(0, 20))
        
        issue = Issue.objects.create(
            vehicle=vehicle,
            reported_by=reporter,
            category=template['category'],
            severity=template['severity'],
            status=template['status'],
            title=template['title'],
            description=template['description'],
            reported_at=created_date,
            resolved_at=created_date + timedelta(days=random.randint(1, 5)) if template['status'] in ['RESOLVED', 'CLOSED'] else None
        )
        
        issues.append(issue)
        print(f"  ✓ {template['category']} issue - {vehicle.reg_number} ({template['severity']} severity, {template['status']})")
    
    return issues

def add_realistic_shifts(vehicles):
    """Add realistic shift data"""
    print_header("Adding Realistic Shifts")
    
    drivers = User.objects.filter(role='driver', company__name='FleetCorp Solutions')
    
    if not drivers.exists():
        print("  ❌ No drivers found. Creating driver user...")
        driver = User.objects.create_user(
            username='driver_main',
            email='driver@fleetcorp.com',
            password='driver123',
            role='driver',
            company=Company.objects.get(name='FleetCorp Solutions'),
            first_name='Main',
            last_name='Driver'
        )
        drivers = [driver]
        print(f"  ✓ Created driver: {driver.username}")
    
    shift_templates = [
        {'start_time': '06:00', 'end_time': '14:00', 'notes': 'Morning delivery route - Downtown area', 'status': 'COMPLETED'},
        {'start_time': '14:00', 'end_time': '22:00', 'notes': 'Afternoon pickup route - Industrial zone', 'status': 'COMPLETED'},
        {'start_time': '22:00', 'end_time': '06:00', 'notes': 'Night shift - Long haul delivery', 'status': 'ACTIVE'},
        {'start_time': '08:00', 'end_time': '16:00', 'notes': 'Regular route - Residential pickup', 'status': 'COMPLETED'},
        {'start_time': '10:00', 'end_time': '18:00', 'notes': 'Express delivery - Priority packages', 'status': 'CANCELLED'}
    ]
    
    shifts = []
    for i in range(20):  # Create 20 shifts
        driver = random.choice(list(drivers))
        vehicle = random.choice(vehicles)
        template = random.choice(shift_templates)
        
        days_ago = random.randint(0, 20)
        start_date = timezone.now() - timedelta(days=days_ago)
        
        start_hour, start_min = map(int, template['start_time'].split(':'))
        end_hour, end_min = map(int, template['end_time'].split(':'))
        
        shift_start = start_date.replace(hour=start_hour, minute=start_min, second=0, microsecond=0)
        
        if template['status'] == 'ACTIVE':
            shift_end = None
        else:
            if end_hour < start_hour:
                shift_end = shift_start + timedelta(days=1, hours=end_hour-start_hour, minutes=end_min-start_min)
            else:
                shift_end = shift_start + timedelta(hours=end_hour-start_hour, minutes=end_min-start_min)
        
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
    print("  FLEET MANAGEMENT SYSTEM - API DATA ENHANCEMENT")
    print("="*80)
    
    try:
        # Enhance data
        company = enhance_dashboard_stats()
        vehicles = add_realistic_vehicles(company)
        inspections = add_realistic_inspections(vehicles)
        issues = add_realistic_issues(vehicles)
        shifts = add_realistic_shifts(vehicles)
        
        print_header("ENHANCEMENT SUMMARY")
        print(f"  ✓ Company: {company.name}")
        print(f"  ✓ Vehicles enhanced: {len(vehicles)}")
        print(f"  ✓ Inspections created: {len(inspections)}")
        print(f"  ✓ Issues created: {len(issues)}")
        print(f"  ✓ Shifts created: {len(shifts)}")
        
        print("\n" + "="*80)
        print("  ✅ DATA ENHANCEMENT COMPLETED!")
        print("="*80)
        print("\n📊 The backend now has enhanced realistic data:")
        print("   - Enhanced vehicle details with realistic makes/models")
        print("   - Detailed inspection records with proper categories")
        print("   - Realistic issues with appropriate priorities")
        print("   - Detailed shift records with realistic timing")
        print("   - Better dashboard statistics")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
