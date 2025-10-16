#!/usr/bin/env python3
"""
Setup Test Data for Fleet Management System
Creates test users, companies, and sample data for comprehensive testing
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append('/Users/ludmil/Desktop/Apps/Fleet-Management-System/fleet/apps/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from account.models import Company
from fleet_app.models import Vehicle, KeyTracker, Shift

User = get_user_model()

def create_test_company():
    """Create a test company for testing"""
    company, created = Company.objects.get_or_create(
        name='FleetCorp Solutions',
        defaults={
            'slug': 'fleetcorp-solutions',
            'description': 'Test company for comprehensive testing',
            'email': 'admin@fleetcorp.com',
            'phone': '+1-555-0123',
            'website': 'https://fleetcorp.com',
            'address_line1': '123 Test Street',
            'city': 'Test City',
            'state': 'TS',
            'postal_code': '12345',
            'country': 'United States',
            'primary_color': '#3b82f6',
            'secondary_color': '#f1f5f9',
            'max_users': 100,
            'max_vehicles': 200,
            'subscription_plan': 'professional',
            'subscription_status': 'active',
            'is_active': True,
            'is_trial_active': False
        }
    )
    return company

def create_test_users(company):
    """Create test users for all roles"""
    users_data = [
        {
            'username': 'admin',
            'email': 'admin@fleetcorp.com',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'phone_number': '+1-555-0001',
            'employee_id': 'ADM001',
            'department': 'Administration',
            'is_active': True,
            'is_staff': True,
            'is_superuser': True
        },
        {
            'username': 'staff',
            'email': 'staff@fleetcorp.com',
            'password': 'staff123',
            'first_name': 'Staff',
            'last_name': 'User',
            'role': 'staff',
            'phone_number': '+1-555-0002',
            'employee_id': 'STF001',
            'department': 'Operations',
            'is_active': True,
            'is_staff': True
        },
        {
            'username': 'driver',
            'email': 'driver@fleetcorp.com',
            'password': 'driver123',
            'first_name': 'Driver',
            'last_name': 'User',
            'role': 'driver',
            'phone_number': '+1-555-0003',
            'employee_id': 'DRV001',
            'department': 'Transportation',
            'is_active': True
        },
        {
            'username': 'inspector',
            'email': 'inspector@fleetcorp.com',
            'password': 'inspector123',
            'first_name': 'Inspector',
            'last_name': 'User',
            'role': 'inspector',
            'phone_number': '+1-555-0004',
            'employee_id': 'INS001',
            'department': 'Safety',
            'is_active': True
        }
    ]
    
    created_users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'role': user_data['role'],
                'phone_number': user_data['phone_number'],
                'employee_id': user_data['employee_id'],
                'department': user_data['department'],
                'company': company,
                'is_active': user_data['is_active'],
                'is_staff': user_data.get('is_staff', False),
                'is_superuser': user_data.get('is_superuser', False)
            }
        )
        
        if created:
            user.set_password(user_data['password'])
            user.save()
            print(f"✅ Created user: {user.username} ({user.role})")
        else:
            print(f"ℹ️ User already exists: {user.username} ({user.role})")
        
        created_users.append(user)
    
    return created_users

def create_test_vehicles(company):
    """Create test vehicles"""
    vehicles_data = [
        {
            'reg_number': 'ABC-001',
            'make': 'Ford',
            'model': 'Transit',
            'year': 2022,
            'color': 'White',
            'mileage': 15000,
            'fuel_type': 'DIESEL',
            'engine_size': '2.0L',
            'transmission': 'MANUAL',
            'status': 'ACTIVE'
        },
        {
            'reg_number': 'ABC-002',
            'make': 'Mercedes',
            'model': 'Sprinter',
            'year': 2023,
            'color': 'Blue',
            'mileage': 8500,
            'fuel_type': 'DIESEL',
            'engine_size': '2.1L',
            'transmission': 'AUTOMATIC',
            'status': 'ACTIVE'
        },
        {
            'reg_number': 'ABC-003',
            'make': 'Volkswagen',
            'model': 'Crafter',
            'year': 2021,
            'color': 'Silver',
            'mileage': 25000,
            'fuel_type': 'DIESEL',
            'engine_size': '2.0L',
            'transmission': 'MANUAL',
            'status': 'MAINTENANCE'
        }
    ]
    
    created_vehicles = []
    for vehicle_data in vehicles_data:
        vehicle, created = Vehicle.objects.get_or_create(
            reg_number=vehicle_data['reg_number'],
            org=company,
            defaults=vehicle_data
        )
        
        if created:
            print(f"✅ Created vehicle: {vehicle.make} {vehicle.model} ({vehicle.reg_number})")
        else:
            print(f"ℹ️ Vehicle already exists: {vehicle.make} {vehicle.model} ({vehicle.reg_number})")
        
        created_vehicles.append(vehicle)
    
    return created_vehicles

def create_test_key_trackers(vehicles):
    """Create test key trackers for vehicles"""
    for i, vehicle in enumerate(vehicles):
        tracker, created = KeyTracker.objects.get_or_create(
            vehicle=vehicle,
            defaults={
                'ble_id': f'KEY_TRACKER_{vehicle.reg_number.replace("-", "_")}',
                'label': f'Key for {vehicle.reg_number}',
                'last_seen_at': datetime.now() - timedelta(hours=1),
                'last_rssi': -50,
                'last_lat': 40.7128 + (i * 0.01),
                'last_lng': -74.0060 + (i * 0.01),
                'is_active': True
            }
        )
        
        if created:
            print(f"✅ Created key tracker: {tracker.label}")
        else:
            print(f"ℹ️ Key tracker already exists: {tracker.label}")

def create_test_shifts(users, vehicles):
    """Create test shifts"""
    driver = next((u for u in users if u.role == 'driver'), None)
    if not driver:
        print("⚠️ No driver found for shift creation")
        return
    
    for i, vehicle in enumerate(vehicles[:2]):  # Create shifts for first 2 vehicles
        shift, created = Shift.objects.get_or_create(
            vehicle=vehicle,
            driver=driver,
            start_at=datetime.now() - timedelta(hours=2),
            defaults={
                'end_at': None,
                'start_lat': 40.7128 + (i * 0.01),
                'start_lng': -74.0060 + (i * 0.01),
                'start_address': f'Start Location {i+1}',
                'status': 'ACTIVE',
                'notes': f'Test shift for vehicle {vehicle.reg_number}'
            }
        )
        
        if created:
            print(f"✅ Created shift: {shift.driver.username} - {shift.vehicle.reg_number}")
        else:
            print(f"ℹ️ Shift already exists: {shift.driver.username} - {shift.vehicle.reg_number}")

def main():
    """Main setup function"""
    print("🚀 Setting up test data for Fleet Management System")
    print("=" * 60)
    
    try:
        # Create test company
        print("\n📊 Creating test company...")
        company = create_test_company()
        print(f"✅ Company: {company.name}")
        
        # Create test users
        print("\n👥 Creating test users...")
        users = create_test_users(company)
        print(f"✅ Created {len(users)} users")
        
        # Create test vehicles
        print("\n🚗 Creating test vehicles...")
        vehicles = create_test_vehicles(company)
        print(f"✅ Created {len(vehicles)} vehicles")
        
        # Create test key trackers
        print("\n🔑 Creating test key trackers...")
        create_test_key_trackers(vehicles)
        
        # Create test shifts
        print("\n⏰ Creating test shifts...")
        create_test_shifts(users, vehicles)
        
        print("\n✅ Test data setup completed successfully!")
        print("=" * 60)
        print("Test users created:")
        for user in users:
            print(f"  - {user.username} ({user.role}) - Password: {user.role}123")
        
        print(f"\nTest company: {company.name}")
        print(f"Test vehicles: {len(vehicles)}")
        
    except Exception as e:
        print(f"❌ Error setting up test data: {str(e)}")
        return False
    
    return True

if __name__ == '__main__':
    main()
