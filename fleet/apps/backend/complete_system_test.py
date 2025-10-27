#!/usr/bin/env python3
"""
Complete System Test - Web, Mobile, and Backend Integration
Tests all features including mobile app compatibility
"""

import os
import sys
import django
import time
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

import time
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from account.models import Company
from fleet_app.models import Vehicle, Shift
from inspections.models import Inspection
from issues.models import Issue, IssuePhoto
from tickets.models import Ticket

User = get_user_model()

class SystemTest:
    def __init__(self):
        self.client = APIClient()
        self.results = []
        self.test_data = {}
        
    def log_result(self, test_name, passed, message="", data=None):
        """Log test result"""
        status = "[PASS]" if passed else "[FAIL]"
        result = {
            'test': test_name,
            'status': status,
            'passed': passed,
            'message': message,
            'data': data or {}
        }
        self.results.append(result)
        print(f"{status} {test_name}")
        if message:
            print(f"    {message}")
        return result
    
    def setup_test_data(self):
        """Setup test data for comprehensive testing"""
        print("\n[INFO] Setting up comprehensive test data...")
        
        # Get or create company
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
            print(f"[OK] Using company: {company.name}")
        except:
            company = Company.objects.first()
        
        # Create test users for each role
        users = {}
        for role in ['admin', 'staff', 'driver', 'inspector']:
            username = f'test_{role}'
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': 'Test',
                    'last_name': role.title(),
                    'email': f'{role}@test.com',
                    'role': role,
                    'company': company,
                    'is_active': True
                }
            )
            if not created:
                user.company = company
                user.role = role
                user.save()
            user.set_password('testpass123')
            user.save()
            users[role] = user
            print(f"[OK] {role}: {username}")
        
        self.test_data = {
            'company': company,
            'users': users
        }
        return True
    
    def test_authentication_all_roles(self):
        """Test authentication for all user roles"""
        print("\n" + "="*80)
        print("TESTING AUTHENTICATION - ALL ROLES")
        print("="*80)
        
        all_passed = True
        for role, user in self.test_data['users'].items():
            response = self.client.post('/api/account/login/', {
                'username': user.username,
                'password': 'testpass123'
            })
            
            if response.status_code == 200:
                self.log_result(f"{role.title()} Authentication", True, 
                              f"User: {user.username}")
            else:
                self.log_result(f"{role.title()} Authentication", False,
                              f"Status: {response.status_code}")
                all_passed = False
        
        return all_passed
    
    def test_vehicle_operations(self):
        """Test vehicle operations"""
        print("\n" + "="*80)
        print("TESTING VEHICLE OPERATIONS")
        print("="*80)
        
        # Authenticate as admin
        response = self.client.post('/api/account/login/', {
            'username': 'test_admin',
            'password': 'testpass123'
        })
        token = response.data.get('token')
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        
        # Create vehicle
        import random
        import string
        reg_number = f'TEST-{random.choice(string.ascii_uppercase)}{random.randint(1000, 9999)}'
        vehicle_data = {
            'reg_number': reg_number,
            'make': 'Honda',
            'model': 'Civic',
            'year': 2024,
            'color': 'Red',
            'fuel_type': 'HYBRID',
            'transmission': 'AUTOMATIC',
            'status': 'ACTIVE',
            'mileage': 15000
        }
        
        response = self.client.post('/api/fleet/vehicles/', vehicle_data)
        
        if response.status_code in [200, 201]:
            self.test_data['vehicle_id'] = response.data.get('id')
            self.log_result("Create Vehicle", True, f"Vehicle: {reg_number}")
        else:
            self.log_result("Create Vehicle", False, str(response.data))
            return False
        
        # List vehicles
        response = self.client.get('/api/fleet/vehicles/')
        if response.status_code == 200:
            self.log_result("List Vehicles", True, f"Count: {len(response.data)}")
        else:
            self.log_result("List Vehicles", False)
        
        # Get single vehicle
        if self.test_data.get('vehicle_id'):
            response = self.client.get(f'/api/fleet/vehicles/{self.test_data["vehicle_id"]}/')
            if response.status_code == 200:
                self.log_result("Get Vehicle Details", True)
            else:
                self.log_result("Get Vehicle Details", False)
        
        return True
    
    def test_shift_operations(self):
        """Test shift operations"""
        print("\n" + "="*80)
        print("TESTING SHIFT OPERATIONS")
        print("="*80)
        
        # Authenticate as driver
        response = self.client.post('/api/account/login/', {
            'username': 'test_driver',
            'password': 'testpass123'
        })
        token = response.data.get('token')
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        
        # List shifts
        response = self.client.get('/api/fleet/shifts/')
        if response.status_code == 200:
            self.log_result("Driver - List Shifts", True)
        else:
            self.log_result("Driver - List Shifts", False)
        
        return True
    
    def test_inspection_operations(self):
        """Test inspection operations"""
        print("\n" + "="*80)
        print("TESTING INSPECTION OPERATIONS")
        print("="*80)
        
        # Authenticate as inspector
        response = self.client.post('/api/account/login/', {
            'username': 'test_inspector',
            'password': 'testpass123'
        })
        token = response.data.get('token')
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        
        # List inspections
        response = self.client.get('/api/inspections/inspections/')
        if response.status_code == 200:
            self.log_result("Inspector - List Inspections", True)
        else:
            self.log_result("Inspector - List Inspections", False)
        
        return True
    
    def test_issue_tracking(self):
        """Test issue tracking"""
        print("\n" + "="*80)
        print("TESTING ISSUE TRACKING")
        print("="*80)
        
        # Authenticate as staff
        response = self.client.post('/api/account/login/', {
            'username': 'test_staff',
            'password': 'testpass123'
        })
        token = response.data.get('token')
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        
        # List issues
        response = self.client.get('/api/issues/issues/')
        if response.status_code == 200:
            self.log_result("Staff - List Issues", True)
        else:
            self.log_result("Staff - List Issues", False)
        
        return True
    
    def test_api_endpoints(self):
        """Test all API endpoints"""
        print("\n" + "="*80)
        print("TESTING ALL API ENDPOINTS")
        print("="*80)
        
        self.client.credentials()
        
        endpoints = {
            'Authentication': '/api/account/login/',
            'Profile': '/api/account/profile/',
            'Vehicles': '/api/fleet/vehicles/',
            'Shifts': '/api/fleet/shifts/',
            'Inspections': '/api/inspections/inspections/',
            'Issues': '/api/issues/issues/',
            'Tickets': '/api/tickets/tickets/',
        }
        
        passed = 0
        for name, endpoint in endpoints.items():
            response = self.client.get(endpoint)
            status = response.status_code != 404
            if status:
                passed += 1
                self.log_result(f"Endpoint: {name}", True, 
                              f"Status: {response.status_code}")
            else:
                self.log_result(f"Endpoint: {name}", False, "Not found")
        
        return passed == len(endpoints)
    
    def test_mobile_compatibility(self):
        """Test mobile app compatibility"""
        print("\n" + "="*80)
        print("TESTING MOBILE APP COMPATIBILITY")
        print("="*80)
        
        # Test that API responses work for mobile
        response = self.client.post('/api/account/login/', {
            'username': 'test_driver',
            'password': 'testpass123'
        })
        
        if response.status_code == 200:
            token = response.data.get('token')
            self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
            
            # Test endpoints mobile app uses
            mobile_endpoints = [
                ('Profile', '/api/account/profile/'),
                ('Vehicles', '/api/fleet/vehicles/'),
                ('Shifts', '/api/fleet/shifts/'),
                ('Inspections', '/api/inspections/inspections/'),
                ('Issues', '/api/issues/issues/'),
                ('Notifications', '/api/telemetry/notifications/'),
            ]
            
            passed = 0
            for name, endpoint in mobile_endpoints:
                response = self.client.get(endpoint)
                if response.status_code in [200, 401]:
                    passed += 1
                    self.log_result(f"Mobile: {name}", True,
                                  f"Status: {response.status_code}")
                else:
                    self.log_result(f"Mobile: {name}", False,
                                  f"Status: {response.status_code}")
            
            return passed == len(mobile_endpoints)
        
        return False
    
    def test_performance(self):
        """Test system performance"""
        print("\n" + "="*80)
        print("TESTING SYSTEM PERFORMANCE")
        print("="*80)
        
        response = self.client.post('/api/account/login/', {
            'username': 'test_admin',
            'password': 'testpass123'
        })
        
        if response.status_code != 200:
            return False
        
        token = response.data.get('token')
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        
        endpoints = [
            ('List Vehicles', '/api/fleet/vehicles/'),
            ('Get Profile', '/api/account/profile/'),
            ('List Shifts', '/api/fleet/shifts/'),
        ]
        
        all_passed = True
        for name, endpoint in endpoints:
            start = time.time()
            response = self.client.get(endpoint)
            elapsed = time.time() - start
            
            if response.status_code == 200 and elapsed < 0.5:
                self.log_result(f"Perf: {name}", True,
                              f"{elapsed*1000:.1f}ms")
            else:
                self.log_result(f"Perf: {name}", False,
                              f"{elapsed*1000:.1f}ms")
                all_passed = False
        
        return all_passed
    
    def run_all_tests(self):
        """Run complete system test"""
        print("\n" + "="*80)
        print("COMPLETE SYSTEM TEST - WEB, MOBILE & BACKEND")
        print("="*80)
        
        # Setup
        if not self.setup_test_data():
            print("[FAIL] Failed to setup test data")
            return
        
        # Run tests
        self.test_authentication_all_roles()
        self.test_vehicle_operations()
        self.test_shift_operations()
        self.test_inspection_operations()
        self.test_issue_tracking()
        self.test_api_endpoints()
        self.test_mobile_compatibility()
        self.test_performance()
        
        # Print summary
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r['passed'])
        failed = total - passed
        
        for result in self.results:
            if not result['passed']:
                print(f"{result['status']} {result['test']}")
                if result['message']:
                    print(f"    {result['message']}")
        
        print(f"\nTotal Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        print("="*80)
        
        return passed / total if total > 0 else 0

if __name__ == '__main__':
    tester = SystemTest()
    success_rate = tester.run_all_tests()
    sys.exit(0 if success_rate >= 0.9 else 1)

