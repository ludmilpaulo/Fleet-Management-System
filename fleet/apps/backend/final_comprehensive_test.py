#!/usr/bin/env python3
"""
Final Comprehensive Testing Suite for Fleet Management System
Tests all roles, features, and integrations
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from account.models import Company
from fleet_app.models import Vehicle, Shift
from inspections.models import Inspection
from issues.models import Issue
import random
import string

User = get_user_model()

class TestResult:
    PASSED = "[PASS]"
    FAILED = "[FAIL]"
    
    def __init__(self, test_name, status, message="", data=None):
        self.test_name = test_name
        self.status = status
        self.message = message
        self.data = data or {}

def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def run_test_suite():
    print("\n" + "="*80)
    print("FINAL COMPREHENSIVE FLEET MANAGEMENT SYSTEM TEST")
    print("="*80 + "\n")
    
    results = []
    client = APIClient()
    
    # Setup test data
    print("[INFO] Setting up test data...")
    
    # Get or create test company
    try:
        company = Company.objects.filter(name='Test Fleet Company').first()
        if not company:
            company = Company.objects.create(
                name='Test Fleet Company',
                email='test@fleet.com',
                slug='test-fleet',
                subscription_status='active',
                is_active=True
            )
    except:
        company = Company.objects.first()
    
    # Create users for each role
    admin_user, _ = User.objects.get_or_create(
        username='test_admin',
        defaults={
            'first_name': 'Test',
            'last_name': 'Admin',
            'email': 'admin@test.com',
            'role': 'admin',
            'company': company,
            'is_active': True
        }
    )
    if not admin_user.password:
        admin_user.set_password('testpass123')
        admin_user.save()
    
    staff_user, _ = User.objects.get_or_create(
        username='test_staff',
        defaults={
            'first_name': 'Test',
            'last_name': 'Staff',
            'email': 'staff@test.com',
            'role': 'staff',
            'company': company,
            'is_active': True
        }
    )
    if not staff_user.password:
        staff_user.set_password('testpass123')
        staff_user.save()
    
    driver_user, _ = User.objects.get_or_create(
        username='test_driver',
        defaults={
            'first_name': 'Test',
            'last_name': 'Driver',
            'email': 'driver@test.com',
            'role': 'driver',
            'company': company,
            'is_active': True
        }
    )
    if not driver_user.password:
        driver_user.set_password('testpass123')
        driver_user.save()
    
    inspector_user, _ = User.objects.get_or_create(
        username='test_inspector',
        defaults={
            'first_name': 'Test',
            'last_name': 'Inspector',
            'email': 'inspector@test.com',
            'role': 'inspector',
            'company': company,
            'is_active': True
        }
    )
    if not inspector_user.password:
        inspector_user.set_password('testpass123')
        inspector_user.save()
    
    print("[OK] Test users created/updated\n")
    
    # Test 1: Admin Authentication
    print("="*80)
    print("TEST 1: Admin Authentication")
    print("="*80)
    response = client.post('/api/account/login/', {'username': 'test_admin', 'password': 'testpass123'})
    if response.status_code == 200:
        print("[PASS] Admin login successful")
        admin_token = response.data.get('token')
        client.credentials(HTTP_AUTHORIZATION=f'Token {admin_token}')
        results.append(TestResult("Admin Login", TestResult.PASSED))
    else:
        print(f"[FAIL] Admin login failed: {response.status_code}")
        results.append(TestResult("Admin Login", TestResult.FAILED, str(response.data)))
        return results
    
    # Test 2: Admin - Create Vehicle
    print("\nTEST 2: Admin - Create Vehicle")
    print("-"*80)
    reg_number = f'TEST-{generate_random_string(6)}'
    vehicle_data = {
        'reg_number': reg_number,
        'make': 'Toyota',
        'model': 'Camry',
        'year': 2024,
        'color': 'Blue',
        'fuel_type': 'HYBRID',
        'transmission': 'AUTOMATIC',
        'status': 'ACTIVE',
        'mileage': 0
    }
    response = client.post('/api/fleet/vehicles/', vehicle_data)
    if response.status_code in [200, 201]:
        print(f"[PASS] Vehicle created: {reg_number}")
        vehicle_id = response.data.get('id')
        results.append(TestResult("Admin - Create Vehicle", TestResult.PASSED))
    else:
        print(f"[FAIL] Vehicle creation failed: {response.status_code}")
        print(f"Response: {response.data}")
        results.append(TestResult("Admin - Create Vehicle", TestResult.FAILED, str(response.data)))
        vehicle_id = None
    
    # Test 3: Admin - List Vehicles
    print("\nTEST 3: Admin - List Vehicles")
    print("-"*80)
    response = client.get('/api/fleet/vehicles/')
    if response.status_code == 200:
        vehicle_count = len(response.data) if isinstance(response.data, list) else 0
        print(f"[PASS] List vehicles: {vehicle_count} found")
        results.append(TestResult("Admin - List Vehicles", TestResult.PASSED))
    else:
        print(f"[FAIL] Failed to list vehicles: {response.status_code}")
        results.append(TestResult("Admin - List Vehicles", TestResult.FAILED))
    
    # Test 4: Admin - View Profile
    print("\nTEST 4: Admin - View Profile")
    print("-"*80)
    response = client.get('/api/account/profile/')
    if response.status_code == 200:
        print(f"[PASS] Profile retrieved")
        print(f"  User: {response.data.get('username')}")
        print(f"  Role: {response.data.get('role')}")
        results.append(TestResult("Admin - View Profile", TestResult.PASSED))
    else:
        print(f"[FAIL] Failed to get profile: {response.status_code}")
        results.append(TestResult("Admin - View Profile", TestResult.FAILED))
    
    # Test 5: Staff Authentication
    print("\n" + "="*80)
    print("TEST 5: Staff Authentication")
    print("="*80)
    response = client.post('/api/account/login/', {'username': 'test_staff', 'password': 'testpass123'})
    if response.status_code == 200:
        print("[PASS] Staff login successful")
        staff_token = response.data.get('token')
        client.credentials(HTTP_AUTHORIZATION=f'Token {staff_token}')
        results.append(TestResult("Staff Login", TestResult.PASSED))
    else:
        print(f"[FAIL] Staff login failed: {response.status_code}")
        results.append(TestResult("Staff Login", TestResult.FAILED))
        return results
    
    # Test 6: Staff - List Vehicles
    print("\nTEST 6: Staff - List Vehicles")
    print("-"*80)
    response = client.get('/api/fleet/vehicles/')
    if response.status_code == 200:
        print("[PASS] Staff can list vehicles")
        results.append(TestResult("Staff - List Vehicles", TestResult.PASSED))
    else:
        print(f"[FAIL] Staff cannot list vehicles: {response.status_code}")
        results.append(TestResult("Staff - List Vehicles", TestResult.FAILED))
    
    # Test 7: Staff - View Profile
    print("\nTEST 7: Staff - View Profile")
    print("-"*80)
    response = client.get('/api/account/profile/')
    if response.status_code == 200:
        print(f"[PASS] Profile retrieved (Staff)")
        results.append(TestResult("Staff - View Profile", TestResult.PASSED))
    else:
        print(f"[FAIL] Failed to get profile: {response.status_code}")
        results.append(TestResult("Staff - View Profile", TestResult.FAILED))
    
    # Test 8: Driver Authentication
    print("\n" + "="*80)
    print("TEST 8: Driver Authentication")
    print("="*80)
    response = client.post('/api/account/login/', {'username': 'test_driver', 'password': 'testpass123'})
    if response.status_code == 200:
        print("[PASS] Driver login successful")
        driver_token = response.data.get('token')
        client.credentials(HTTP_AUTHORIZATION=f'Token {driver_token}')
        results.append(TestResult("Driver Login", TestResult.PASSED))
    else:
        print(f"[FAIL] Driver login failed: {response.status_code}")
        results.append(TestResult("Driver Login", TestResult.FAILED))
        return results
    
    # Test 9: Driver - Cannot Create Vehicle
    print("\nTEST 9: Driver - Cannot Create Vehicle")
    print("-"*80)
    if vehicle_id:
        test_reg = f'DRIVER-{generate_random_string(6)}'
        response = client.post('/api/fleet/vehicles/', {
            'reg_number': test_reg,
            'make': 'Test',
            'model': 'Test',
            'status': 'ACTIVE'
        })
        if response.status_code in [401, 403]:
            print("[PASS] Driver correctly denied vehicle creation")
            results.append(TestResult("Driver - Cannot Create Vehicle", TestResult.PASSED))
        else:
            print(f"[FAIL] Driver should not be able to create vehicles: {response.status_code}")
            results.append(TestResult("Driver - Cannot Create Vehicle", TestResult.FAILED))
    else:
        print("[SKIP] No vehicle exists, skipping permission test")
        results.append(TestResult("Driver - Cannot Create Vehicle", TestResult.FAILED, "No vehicle to test with"))
    
    # Test 10: Driver - List Shifts
    print("\nTEST 10: Driver - List Shifts")
    print("-"*80)
    response = client.get('/api/fleet/shifts/')
    if response.status_code == 200:
        print("[PASS] Driver can list shifts")
        results.append(TestResult("Driver - List Shifts", TestResult.PASSED))
    else:
        print(f"[FAIL] Driver cannot list shifts: {response.status_code}")
        results.append(TestResult("Driver - List Shifts", TestResult.FAILED))
    
    # Test 11: API Endpoints Existence
    print("\n" + "="*80)
    print("TEST 11: API Endpoints Existence")
    print("="*80)
    
    endpoints = [
        ('/api/account/login/', 'POST'),
        ('/api/account/profile/', 'GET'),
        ('/api/fleet/vehicles/', 'GET'),
        ('/api/fleet/shifts/', 'GET'),
        ('/api/inspections/inspections/', 'GET'),
        ('/api/issues/issues/', 'GET'),
    ]
    
    endpoint_results = []
    client.credentials()
    for endpoint, method in endpoints:
        if method == 'GET':
            response = client.get(endpoint)
        else:
            continue
        if response.status_code != 404:
            print(f"[OK] {endpoint} - {response.status_code}")
            endpoint_results.append(True)
        else:
            print(f"[FAIL] {endpoint} - 404 Not Found")
            endpoint_results.append(False)
    
    if all(endpoint_results):
        results.append(TestResult("API Endpoints Existence", TestResult.PASSED))
    else:
        results.append(TestResult("API Endpoints Existence", TestResult.FAILED))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    total = len(results)
    passed = len([r for r in results if r.status == TestResult.PASSED])
    failed = len([r for r in results if r.status == TestResult.FAILED])
    
    for result in results:
        print(f"{result.status} {result.test_name}")
        if result.message:
            print(f"   {result.message}")
    
    print(f"\nTotal Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    print("="*80)
    
    return results

if __name__ == '__main__':
    results = run_test_suite()

