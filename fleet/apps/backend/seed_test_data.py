#!/usr/bin/env python
"""
Comprehensive Test Data Seeding Script
Seeds realistic data for all roles: Admin, Staff, Driver, Inspector, Platform Admin
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
from platform_admin.models import SubscriptionPlan, CompanySubscription

User = get_user_model()

def print_header(text):
    print("\n" + "="*80)
    print(f"  {text}")
    print("="*80)

def create_companies():
    print_header("Creating Companies")
    
    companies_data = [
        {
            'name': 'FleetCorp Solutions',
            'email': 'contact@fleetcorp.com',
            'subscription_plan': 'professional',
        },
        {
            'name': 'Transport Masters',
            'email': 'info@transportmasters.com',
            'subscription_plan': 'basic',
        },
        {
            'name': 'Logistics Pro',
            'email': 'admin@logisticspro.com',
            'subscription_plan': 'enterprise',
        },
    ]
    
    companies = []
    for data in companies_data:
        company, created = Company.objects.get_or_create(
            email=data['email'],
            defaults=data
        )
        companies.append(company)
        status = "Created" if created else "Already exists"
        print(f"  - {company.name} - {status}")
    
    return companies

def create_users(companies):
    print_header("Creating Users")
    
    users_data = [
        # FleetCorp Solutions users
        {'username': 'admin1', 'email': 'admin@fleetcorp.com', 'password': 'admin123', 
         'role': 'admin', 'company': companies[0], 'first_name': 'John', 'last_name': 'Admin'},
        {'username': 'staff1', 'email': 'staff1@fleetcorp.com', 'password': 'staff123', 
         'role': 'staff', 'company': companies[0], 'first_name': 'Sarah', 'last_name': 'Staff'},
        {'username': 'staff2', 'email': 'staff2@fleetcorp.com', 'password': 'staff123', 
         'role': 'staff', 'company': companies[0], 'first_name': 'Mike', 'last_name': 'Staff'},
        {'username': 'driver1', 'email': 'driver1@fleetcorp.com', 'password': 'driver123', 
         'role': 'driver', 'company': companies[0], 'first_name': 'James', 'last_name': 'Driver'},
        {'username': 'driver2', 'email': 'driver2@fleetcorp.com', 'password': 'driver123', 
         'role': 'driver', 'company': companies[0], 'first_name': 'Maria', 'last_name': 'Driver'},
        {'username': 'driver3', 'email': 'driver3@fleetcorp.com', 'password': 'driver123', 
         'role': 'driver', 'company': companies[0], 'first_name': 'David', 'last_name': 'Driver'},
        {'username': 'inspector1', 'email': 'inspector1@fleetcorp.com', 'password': 'inspector123', 
         'role': 'inspector', 'company': companies[0], 'first_name': 'Lisa', 'last_name': 'Inspector'},
        {'username': 'inspector2', 'email': 'inspector2@fleetcorp.com', 'password': 'inspector123', 
         'role': 'inspector', 'company': companies[0], 'first_name': 'Robert', 'last_name': 'Inspector'},
        
        # Transport Masters users
        {'username': 'admin2', 'email': 'admin@transportmasters.com', 'password': 'admin123', 
         'role': 'admin', 'company': companies[1], 'first_name': 'Emily', 'last_name': 'Admin'},
        {'username': 'driver4', 'email': 'driver@transportmasters.com', 'password': 'driver123', 
         'role': 'driver', 'company': companies[1], 'first_name': 'Tom', 'last_name': 'Driver'},
        
        # Logistics Pro users
        {'username': 'admin3', 'email': 'admin@logisticspro.com', 'password': 'admin123', 
         'role': 'admin', 'company': companies[2], 'first_name': 'Laura', 'last_name': 'Admin'},
        {'username': 'driver5', 'email': 'driver@logisticspro.com', 'password': 'driver123', 
         'role': 'driver', 'company': companies[2], 'first_name': 'Ethan', 'last_name': 'Driver'},
        
        # Platform Admin
        {'username': 'platform_admin', 'email': 'platform@fleetmanagement.com', 'password': 'platform123', 
         'role': 'platform_admin', 'company': None, 'first_name': 'Platform', 'last_name': 'Admin', 'is_staff': True, 'is_superuser': True},

        # Test Admin for automation
        {'username': 'testadmin', 'email': 'testadmin@fleetcorp.com', 'password': 'Test@1234', 
         'role': 'admin', 'company': companies[0], 'first_name': 'Test', 'last_name': 'Admin'},
    ]
    
    users = {}
    for data in users_data:
        password = data.pop('password')
        is_staff = data.pop('is_staff', False)
        is_superuser = data.pop('is_superuser', False)
        
        user, created = User.objects.get_or_create(
            username=data['username'],
            defaults=data
        )
        
        if created:
            user.set_password(password)
            user.is_staff = is_staff
            user.is_superuser = is_superuser
            user.save()
            status = "Created"
        else:
            status = "Already exists"
        
        users[data['username']] = user
        print(f"  - {user.username} ({user.role}) - {status}")
    
    return users

def create_vehicles(companies):
    print_header("Creating Vehicles")
    
    makes = ['Ford', 'Toyota', 'Mercedes', 'Volvo', 'Isuzu', 'Freightliner']
    models = ['Transit', 'Sprinter', 'Camry', 'F-150', 'Actros', 'VNL']
    statuses = ['active', 'maintenance', 'out_of_service']
    
    vehicles = []
    for i in range(1, 26):  # Create 25 vehicles
        company = companies[i % len(companies)]
        vehicle, created = Vehicle.objects.get_or_create(
            org=company,
            reg_number=f'VH-{str(i).zfill(3)}',
            defaults={
                'make': random.choice(makes),
                'model': random.choice(models),
                'year': random.randint(2018, 2024),
                'vin': f'VIN{str(i).zfill(14)}',
                'status': random.choice(['ACTIVE', 'MAINTENANCE', 'INACTIVE']) if i > 3 else 'ACTIVE',
                'mileage': random.randint(10000, 150000),
                'fuel_type': random.choice(['DIESEL', 'PETROL', 'ELECTRIC']),
                'color': random.choice(['White', 'Black', 'Silver', 'Blue', 'Red']),
            }
        )
        vehicles.append(vehicle)
        status = "Created" if created else "Already exists"
        print(f"  - {vehicle.reg_number} ({vehicle.make} {vehicle.model}) - {status}")
    
    return vehicles

def create_shifts(users, vehicles):
    print_header("Creating Shifts")
    
    drivers = [u for u in users.values() if u.role == 'driver']
    
    shifts = []
    for i in range(20):  # Create 20 shifts
        driver = random.choice(drivers)
        vehicle = random.choice([v for v in vehicles if v.org == driver.company])
        
        start_date = timezone.now() - timedelta(days=random.randint(0, 30))
        duration = random.randint(4, 10)  # 4-10 hour shifts
        
        status_choice = random.choice(['ACTIVE', 'COMPLETED', 'CANCELLED'])
        
        shift = Shift.objects.create(
            vehicle=vehicle,
            driver=driver,
            start_at=start_date,
            end_at=start_date + timedelta(hours=duration) if status_choice != 'ACTIVE' else None,
            status=status_choice,
            start_address=f'{random.randint(100, 999)} Main St, City',
            end_address=f'{random.randint(100, 999)} Oak Ave, City' if status_choice == 'COMPLETED' else '',
            notes=f'Shift {i+1} - Regular route'
        )
        shifts.append(shift)
        print(f"  - Shift {shift.id} - {driver.username} in {vehicle.reg_number} ({shift.status})")
    
    return shifts

def create_inspections(shifts):
    print_header("Creating Inspections")
    
    parts = [
        'FRONT', 'REAR', 'LEFT', 'RIGHT', 'ROOF', 'INTERIOR', 'DASHBOARD',
        'ODOMETER', 'WINDSHIELD', 'TYRES', 'LIGHTS', 'ENGINE', 'BRAKES', 'FUEL'
    ]
    
    inspections = []
    attempts = 0
    created_count = 0
    target = 50
    while created_count < target and attempts < target * 3:
        attempts += 1
        shift = random.choice(shifts)
        insp_type = random.choice(['START', 'END'])
        status_choice = random.choice(['IN_PROGRESS', 'PASS', 'FAIL'])
        
        inspection, created = Inspection.objects.get_or_create(
            shift=shift,
            type=insp_type,
            defaults={
                'status': status_choice,
                'notes': f'Inspection - {status_choice}',
                'weather_conditions': random.choice(['Sunny', 'Rainy', 'Cloudy']),
                'temperature': random.uniform(10.0, 35.0),
                'created_by': shift.driver
            }
        )
        if not created:
            continue
        
        # Create inspection items
        num_items = random.randint(5, len(parts))
        selected_parts = random.sample(parts, num_items)
        
        for part in selected_parts:
            item_status = random.choice(['PASS', 'PASS', 'FAIL'])  # majority pass
            InspectionItem.objects.create(
                inspection=inspection,
                part=part,
                status=item_status,
                notes='OK' if item_status == 'PASS' else 'Needs attention'
            )
        
        inspections.append(inspection)
        created_count += 1
        print(f"  - Inspection {inspection.id} - {shift.vehicle.reg_number} ({insp_type}/{status_choice})")
    
    return inspections

def create_issues(users, vehicles):
    print_header("Creating Issues")
    
    categories = ['MECHANICAL', 'ELECTRICAL', 'COSMETIC', 'ENGINE', 'BRAKE', 'LIGHT', 'OTHER']
    severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
    
    issues = []
    for i in range(30):  # Create 30 issues
        vehicle = random.choice(vehicles)
        same_company_users = [u for u in users.values() if u.company == vehicle.org]
        if not same_company_users:
            continue
        reporter = random.choice(same_company_users)
        
        created_date = timezone.now() - timedelta(days=random.randint(0, 60))
        status = random.choice(statuses)
        
        issue = Issue.objects.create(
            vehicle=vehicle,
            reported_by=reporter,
            title=f"Issue {i+1}",
            description='Needs attention',
            category=random.choice(categories),
            severity=random.choice(severities),
            status=status,
            reported_at=created_date,
            resolved_at=created_date + timedelta(days=random.randint(1, 10)) if status in ['RESOLVED', 'CLOSED'] else None
        )
        issues.append(issue)
        print(f"  - Issue {issue.id} - {vehicle.reg_number} ({issue.severity} severity, {issue.status})")
    
    return issues

def create_subscription_data():
    print_header("Creating Subscription Plans")
    
    plans_data = [
        {
            'name': 'Basic',
            'display_name': 'Basic',
            'description': 'Perfect for small fleets',
            'max_vehicles': 10,
            'max_users': 5,
            'max_drivers': 10,
            'max_inspectors': 5,
            'monthly_price': Decimal('99.00'),
            'yearly_price': Decimal('999.00'),
            'features': ['gps_tracking', 'maintenance_alerts', 'basic_reports'],
            'is_active': True,
            'is_popular': False,
        },
        {
            'name': 'Professional',
            'display_name': 'Professional',
            'description': 'Ideal for growing businesses',
            'max_vehicles': 50,
            'max_users': 25,
            'max_drivers': 50,
            'max_inspectors': 25,
            'monthly_price': Decimal('299.00'),
            'yearly_price': Decimal('2999.00'),
            'features': ['gps_tracking', 'maintenance_alerts', 'advanced_reports', 'api_access'],
            'is_active': True,
            'is_popular': True,
        },
        {
            'name': 'Enterprise',
            'display_name': 'Enterprise',
            'description': 'For large-scale operations',
            'max_vehicles': 999,
            'max_users': 999,
            'max_drivers': 999,
            'max_inspectors': 999,
            'monthly_price': Decimal('999.00'),
            'yearly_price': Decimal('9999.00'),
            'features': ['gps_tracking', 'maintenance_alerts', 'advanced_reports', 'api_access', 'custom_integrations', 'priority_support'],
            'is_active': True,
            'is_popular': False,
        },
    ]
    
    plans = []
    for data in plans_data:
        plan, created = SubscriptionPlan.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        plans.append(plan)
        status = "Created" if created else "Already exists"
        print(f"  - {plan.name} Plan - {status}")
    
    return plans

def main():
    print("\n" + "="*80)
    print("  FLEET MANAGEMENT SYSTEM - TEST DATA SEEDER")
    print("="*80)
    
    try:
        # Create all test data
        companies = create_companies()
        users = create_users(companies)
        vehicles = create_vehicles(companies)
        shifts = create_shifts(users, vehicles)
        inspections = create_inspections(shifts)
        issues = create_issues(users, vehicles)
        plans = create_subscription_data()
        
        print_header("SUMMARY")
        print(f"  - Companies created: {len(companies)}")
        print(f"  - Users created: {len(users)}")
        print(f"  - Vehicles created: {len(vehicles)}")
        print(f"  - Shifts created: {len(shifts)}")
        print(f"  - Inspections created: {len(inspections)}")
        print(f"  - Issues created: {len(issues)}")
        print(f"  - Subscription plans: {len(plans)}")
        
        print("\n" + "="*80)
        print("  TEST DATA SEEDING COMPLETED SUCCESSFULLY")
        print("="*80)
        
        print("\n📋 Demo Credentials:")
        print("  Admin:      admin1 / admin123")
        print("  Staff:      staff1 / staff123")
        print("  Driver:     driver1 / driver123")
        print("  Inspector:  inspector1 / inspector123")
        print("  Platform:   platform_admin / platform123")
        print("\n")
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()

