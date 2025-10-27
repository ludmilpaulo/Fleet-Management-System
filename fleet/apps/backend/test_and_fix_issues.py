#!/usr/bin/env python3
"""
Test and fix issues in Fleet Management System
This script will identify and fix common issues
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from account.models import Company
from fleet_app.models import Vehicle
import traceback

User = get_user_model()

def test_vehicle_creation():
    """Test vehicle creation with proper context"""
    print("\n" + "="*80)
    print("TESTING VEHICLE CREATION")
    print("="*80)
    
    # Get or create a test user
    try:
        user = User.objects.get(username='admin')
        if not user.company:
            # Get or create a test company
            company, created = Company.objects.get_or_create(
                name='Test Company',
                defaults={
                    'email': 'test@company.com',
                    'slug': 'test-company',
                    'subscription_status': 'active'
                }
            )
            user.company = company
            user.save()
        
        print(f"[OK] Test user: {user.username}")
        print(f"[OK] User company: {user.company.name}")
        
        # Create API client and authenticate
        client = APIClient()
        response = client.post('/api/account/login/', {
            'username': user.username,
            'password': 'admin123'
        })
        
        if response.status_code == 200:
            token = response.data.get('token')
            client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
            print(f"[OK] Authenticated successfully")
            
            # Try to create a vehicle
            vehicle_data = {
                'reg_number': 'TEST-001',
                'make': 'Toyota',
                'model': 'Camry',
                'year': 2023,
                'color': 'White',
                'fuel_type': 'PETROL',
                'transmission': 'AUTOMATIC',
                'status': 'ACTIVE'
            }
            
            print(f"\nAttempting to create vehicle: {vehicle_data['reg_number']}")
            response = client.post('/api/fleet/vehicles/', vehicle_data)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code in [200, 201]:
                print(f"[OK] Vehicle created successfully!")
                print(f"  Vehicle ID: {response.data.get('id')}")
            else:
                print(f"[FAIL] Failed to create vehicle")
                print(f"Response: {response.data}")
                return False
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Error: {str(e)}")
        traceback.print_exc()
        return False

def create_test_data():
    """Create comprehensive test data"""
    print("\n" + "="*80)
    print("CREATING TEST DATA")
    print("="*80)
    
    # Create test company
    company, created = Company.objects.get_or_create(
        name='Acme Fleet Solutions',
        defaults={
            'email': 'info@acmefleet.com',
            'slug': 'acme-fleet',
            'subscription_status': 'active',
            'is_active': True
        }
    )
    print(f"{'Created' if created else 'Found'} company: {company.name}")
    
    # Create admin user
    admin, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'first_name': 'Admin',
            'last_name': 'User',
            'email': 'admin@acmefleet.com',
            'role': 'admin',
            'company': company,
            'is_active': True
        }
    )
    if not created:
        admin.company = company
        admin.save()
    admin.set_password('admin123')
    admin.save()
    print(f"{'Created' if created else 'Updated'} admin user")
    
    # Create staff user
    staff, created = User.objects.get_or_create(
        username='staff1',
        defaults={
            'first_name': 'Staff',
            'last_name': 'Member',
            'email': 'staff@acmefleet.com',
            'role': 'staff',
            'company': company,
            'is_active': True
        }
    )
    if not created:
        staff.company = company
        staff.save()
    staff.set_password('staff123')
    staff.save()
    print(f"{'Created' if created else 'Updated'} staff user")
    
    # Create some test vehicles
    vehicles_data = [
        {'reg_number': 'ABC-001', 'make': 'Toyota', 'model': 'Camry', 'year': 2022, 'color': 'White', 'fuel_type': 'PETROL', 'transmission': 'AUTOMATIC', 'status': 'ACTIVE'},
        {'reg_number': 'ABC-002', 'make': 'Honda', 'model': 'Civic', 'year': 2023, 'color': 'Blue', 'fuel_type': 'HYBRID', 'transmission': 'AUTOMATIC', 'status': 'ACTIVE'},
        {'reg_number': 'ABC-003', 'make': 'Ford', 'model': 'Transit', 'year': 2021, 'color': 'Silver', 'fuel_type': 'DIESEL', 'transmission': 'MANUAL', 'status': 'MAINTENANCE'},
    ]
    
    created_vehicles = 0
    for vehicle_data in vehicles_data:
        vehicle, created = Vehicle.objects.get_or_create(
            reg_number=vehicle_data['reg_number'],
            org=company,
            defaults=vehicle_data
        )
        if created:
            created_vehicles += 1
            print(f"Created vehicle: {vehicle.reg_number}")
    
    print(f"\n[OK] Created {created_vehicles} vehicles")
    
    return True

def main():
    """Run all tests and fixes"""
    print("\n" + "="*80)
    print("FLEET MANAGEMENT SYSTEM - TEST AND FIX")
    print("="*80)
    
    # Create test data
    create_test_data()
    
    # Test vehicle creation
    test_vehicle_creation()
    
    print("\n" + "="*80)
    print("DONE")
    print("="*80)

if __name__ == '__main__':
    main()

