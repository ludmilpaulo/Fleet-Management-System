#!/usr/bin/env python3
"""
Comprehensive Day-to-Day Operations Test Suite
Tests all critical operations for both Web and Mobile applications
"""

import os
import sys
import django
import time
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'fleet', 'apps', 'backend'))
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from account.models import Company
from fleet_app.models import Vehicle, Shift
from inspections.models import Inspection, InspectionItem
from issues.models import Issue
from tickets.models import Ticket

User = get_user_model()

class TestResult:
    """Test result container"""
    def __init__(self, name: str, passed: bool, message: str = "", data: dict = None):
        self.name = name
        self.passed = passed
        self.message = message
        self.data = data or {}
        self.timestamp = datetime.now()

class DayToDayOperationsTest:
    """Comprehensive test suite for day-to-day operations"""
    
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_base_url = api_base_url
        self.client = APIClient()
        self.results: List[TestResult] = []
        self.test_data: Dict = {}
        self.auth_tokens: Dict[str, str] = {}
        
    def log_result(self, test_name: str, passed: bool, message: str = "", data: dict = None):
        """Log test result"""
        result = TestResult(test_name, passed, message, data)
        self.results.append(result)
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}")
        if message:
            print(f"   {message}")
        return result
    
    def setup_test_data(self):
        """Setup test data for all tests"""
        print("\n" + "="*80)
        print("SETTING UP TEST DATA")
        print("="*80)
        
        try:
            # Get or create company
            company, created = Company.objects.get_or_create(
                name='FleetCorp Solutions',
                defaults={
                    'email': 'contact@fleetcorp.com',
                    'subscription_plan': 'professional',
                    'subscription_status': 'active',
                    'is_active': True
                }
            )
            if not created:
                company.subscription_status = 'active'
                company.is_active = True
                company.save()
            
            self.log_result("Setup Company", True, f"Company: {company.name}")
            
            # Create test users for each role
            users = {}
            roles = ['admin', 'staff', 'driver', 'inspector']
            
            for role in roles:
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
                    user.is_active = True
                    user.save()
                
                user.set_password('testpass123')
                user.save()
                users[role] = user
                self.log_result(f"Setup User ({role})", True, f"Username: {username}")
            
            # Create test vehicles
            vehicles = []
            vehicle_data = [
                {'reg_number': 'TEST-001', 'make': 'Ford', 'model': 'Transit', 'year': 2023, 'status': 'ACTIVE'},
                {'reg_number': 'TEST-002', 'make': 'Mercedes', 'model': 'Sprinter', 'year': 2022, 'status': 'ACTIVE'},
                {'reg_number': 'TEST-003', 'make': 'Tesla', 'model': 'Model 3', 'year': 2023, 'status': 'ACTIVE'},
            ]
            
            for v_data in vehicle_data:
                vehicle, created = Vehicle.objects.get_or_create(
                    org=company,
                    reg_number=v_data['reg_number'],
                    defaults={
                        'make': v_data['make'],
                        'model': v_data['model'],
                        'year': v_data['year'],
                        'status': v_data['status'],
                        'fuel_type': 'DIESEL',
                        'mileage': 10000,
                    }
                )
                vehicles.append(vehicle)
                self.log_result(f"Setup Vehicle ({v_data['reg_number']})", True)
            
            self.test_data = {
                'company': company,
                'users': users,
                'vehicles': vehicles
            }
            
            return True
            
        except Exception as e:
            self.log_result("Setup Test Data", False, f"Error: {str(e)}")
            return False
    
    # ==================== AUTHENTICATION TESTS ====================
    
    def test_authentication_flow(self):
        """Test complete authentication flow for all roles"""
        print("\n" + "="*80)
        print("AUTHENTICATION TESTS")
        print("="*80)
        
        users = self.test_data.get('users', {})
        
        for role, user in users.items():
            # Test login
            response = self.client.post(
                f'{self.api_base_url}/api/account/login/',
                {'username': user.username, 'password': 'testpass123'},
                format='json'
            )
            
            if response.status_code == 200:
                data = response.json()
                token = data.get('token') or data.get('access')
                if token:
                    self.auth_tokens[role] = token
                    self.log_result(f"Login ({role})", True, f"Token received")
                else:
                    self.log_result(f"Login ({role})", False, "No token in response")
            else:
                self.log_result(f"Login ({role})", False, f"Status: {response.status_code}")
            
            # Test profile access
            if role in self.auth_tokens:
                self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.auth_tokens[role]}')
                profile_response = self.client.get(f'{self.api_base_url}/api/account/profile/')
                if profile_response.status_code == 200:
                    self.log_result(f"Profile Access ({role})", True)
                else:
                    self.log_result(f"Profile Access ({role})", False, f"Status: {profile_response.status_code}")
    
    # ==================== VEHICLE MANAGEMENT TESTS ====================
    
    def test_vehicle_operations(self):
        """Test vehicle CRUD operations"""
        print("\n" + "="*80)
        print("VEHICLE MANAGEMENT TESTS")
        print("="*80)
        
        admin_token = self.auth_tokens.get('admin')
        if not admin_token:
            self.log_result("Vehicle Operations", False, "Admin token not available")
            return
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {admin_token}')
        company = self.test_data['company']
        
        # List vehicles
        response = self.client.get(f'{self.api_base_url}/api/fleet/vehicles/')
        if response.status_code == 200:
            vehicles = response.json()
            self.log_result("List Vehicles", True, f"Found {len(vehicles)} vehicles")
        else:
            self.log_result("List Vehicles", False, f"Status: {response.status_code}")
        
        # Create vehicle
        new_vehicle_data = {
            'reg_number': 'TEST-NEW-001',
            'make': 'Toyota',
            'model': 'Camry',
            'year': 2024,
            'status': 'ACTIVE',
            'fuel_type': 'PETROL',
            'mileage': 0,
            'org': company.id
        }
        response = self.client.post(
            f'{self.api_base_url}/api/fleet/vehicles/',
            new_vehicle_data,
            format='json'
        )
        if response.status_code in [200, 201]:
            vehicle_data = response.json()
            vehicle_id = vehicle_data.get('id')
            self.log_result("Create Vehicle", True, f"Vehicle ID: {vehicle_id}")
            
            # Update vehicle
            if vehicle_id:
                update_data = {'mileage': 5000}
                response = self.client.patch(
                    f'{self.api_base_url}/api/fleet/vehicles/{vehicle_id}/',
                    update_data,
                    format='json'
                )
                if response.status_code == 200:
                    self.log_result("Update Vehicle", True)
                else:
                    self.log_result("Update Vehicle", False, f"Status: {response.status_code}")
                
                # Get vehicle details
                response = self.client.get(f'{self.api_base_url}/api/fleet/vehicles/{vehicle_id}/')
                if response.status_code == 200:
                    self.log_result("Get Vehicle Details", True)
                else:
                    self.log_result("Get Vehicle Details", False, f"Status: {response.status_code}")
        else:
            self.log_result("Create Vehicle", False, f"Status: {response.status_code}")
    
    # ==================== INSPECTION TESTS ====================
    
    def test_inspection_operations(self):
        """Test inspection operations"""
        print("\n" + "="*80)
        print("INSPECTION TESTS")
        print("="*80)
        
        inspector_token = self.auth_tokens.get('inspector')
        if not inspector_token:
            self.log_result("Inspection Operations", False, "Inspector token not available")
            return
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {inspector_token}')
        vehicles = self.test_data.get('vehicles', [])
        inspector = self.test_data['users']['inspector']
        
        if not vehicles:
            self.log_result("Inspection Operations", False, "No vehicles available")
            return
        
        vehicle = vehicles[0]
        
        # Create inspection
        inspection_data = {
            'vehicle': vehicle.id,
            'inspector': inspector.id,
            'inspection_date': datetime.now().isoformat(),
            'odometer_reading': vehicle.mileage + 100,
            'passed': True,
            'notes': 'Test inspection',
            'next_inspection_due': (datetime.now() + timedelta(days=90)).isoformat()
        }
        
        response = self.client.post(
            f'{self.api_base_url}/api/inspections/inspections/',
            inspection_data,
            format='json'
        )
        
        if response.status_code in [200, 201]:
            inspection_data = response.json()
            inspection_id = inspection_data.get('id')
            self.log_result("Create Inspection", True, f"Inspection ID: {inspection_id}")
            
            # Add inspection items
            if inspection_id:
                items_data = [
                    {
                        'inspection': inspection_id,
                        'category': 'Pre-Trip',
                        'item_name': 'Engine Oil',
                        'status': 'pass',
                        'notes': 'Oil level normal'
                    },
                    {
                        'inspection': inspection_id,
                        'category': 'Pre-Trip',
                        'item_name': 'Tire Pressure',
                        'status': 'pass',
                        'notes': 'All tires properly inflated'
                    }
                ]
                
                for item_data in items_data:
                    response = self.client.post(
                        f'{self.api_base_url}/api/inspections/inspection-items/',
                        item_data,
                        format='json'
                    )
                    if response.status_code in [200, 201]:
                        self.log_result("Add Inspection Item", True)
                    else:
                        self.log_result("Add Inspection Item", False, f"Status: {response.status_code}")
                
                # Get inspection details
                response = self.client.get(f'{self.api_base_url}/api/inspections/inspections/{inspection_id}/')
                if response.status_code == 200:
                    self.log_result("Get Inspection Details", True)
                else:
                    self.log_result("Get Inspection Details", False, f"Status: {response.status_code}")
                
                # List inspections
                response = self.client.get(f'{self.api_base_url}/api/inspections/inspections/')
                if response.status_code == 200:
                    inspections = response.json()
                    self.log_result("List Inspections", True, f"Found {len(inspections)} inspections")
                else:
                    self.log_result("List Inspections", False, f"Status: {response.status_code}")
        else:
            self.log_result("Create Inspection", False, f"Status: {response.status_code}")
    
    # ==================== SHIFT TESTS ====================
    
    def test_shift_operations(self):
        """Test shift operations"""
        print("\n" + "="*80)
        print("SHIFT MANAGEMENT TESTS")
        print("="*80)
        
        driver_token = self.auth_tokens.get('driver')
        if not driver_token:
            self.log_result("Shift Operations", False, "Driver token not available")
            return
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {driver_token}')
        vehicles = self.test_data.get('vehicles', [])
        driver = self.test_data['users']['driver']
        
        if not vehicles:
            self.log_result("Shift Operations", False, "No vehicles available")
            return
        
        vehicle = vehicles[0]
        
        # Start shift
        shift_start_data = {
            'vehicle': vehicle.id,
            'start_address': '123 Test Street, Test City',
            'notes': 'Test shift start'
        }
        
        response = self.client.post(
            f'{self.api_base_url}/api/fleet/shifts/start/',
            shift_start_data,
            format='json'
        )
        
        if response.status_code in [200, 201]:
            shift_data = response.json()
            shift_id = shift_data.get('id')
            self.log_result("Start Shift", True, f"Shift ID: {shift_id}")
            
            if shift_id:
                # End shift
                shift_end_data = {
                    'end_address': '456 Test Avenue, Test City',
                    'notes': 'Test shift end'
                }
                
                response = self.client.post(
                    f'{self.api_base_url}/api/fleet/shifts/{shift_id}/end/',
                    shift_end_data,
                    format='json'
                )
                
                if response.status_code == 200:
                    self.log_result("End Shift", True)
                else:
                    self.log_result("End Shift", False, f"Status: {response.status_code}")
                
                # List shifts
                response = self.client.get(f'{self.api_base_url}/api/fleet/shifts/')
                if response.status_code == 200:
                    shifts = response.json()
                    self.log_result("List Shifts", True, f"Found {len(shifts)} shifts")
                else:
                    self.log_result("List Shifts", False, f"Status: {response.status_code}")
        else:
            self.log_result("Start Shift", False, f"Status: {response.status_code}")
    
    # ==================== ISSUE TESTS ====================
    
    def test_issue_operations(self):
        """Test issue reporting and management"""
        print("\n" + "="*80)
        print("ISSUE MANAGEMENT TESTS")
        print("="*80)
        
        driver_token = self.auth_tokens.get('driver')
        if not driver_token:
            self.log_result("Issue Operations", False, "Driver token not available")
            return
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {driver_token}')
        vehicles = self.test_data.get('vehicles', [])
        driver = self.test_data['users']['driver']
        
        if not vehicles:
            self.log_result("Issue Operations", False, "No vehicles available")
            return
        
        vehicle = vehicles[0]
        
        # Create issue
        issue_data = {
            'vehicle': vehicle.id,
            'reported_by': driver.id,
            'issue_type': 'mechanical',
            'priority': 'high',
            'status': 'open',
            'description': 'Test issue: Engine making unusual noise'
        }
        
        response = self.client.post(
            f'{self.api_base_url}/api/issues/issues/',
            issue_data,
            format='json'
        )
        
        if response.status_code in [200, 201]:
            issue_response = response.json()
            issue_id = issue_response.get('id')
            self.log_result("Create Issue", True, f"Issue ID: {issue_id}")
            
            if issue_id:
                # Update issue status
                update_data = {'status': 'in_progress'}
                response = self.client.patch(
                    f'{self.api_base_url}/api/issues/issues/{issue_id}/',
                    update_data,
                    format='json'
                )
                if response.status_code == 200:
                    self.log_result("Update Issue", True)
                else:
                    self.log_result("Update Issue", False, f"Status: {response.status_code}")
                
                # List issues
                response = self.client.get(f'{self.api_base_url}/api/issues/issues/')
                if response.status_code == 200:
                    issues = response.json()
                    self.log_result("List Issues", True, f"Found {len(issues)} issues")
                else:
                    self.log_result("List Issues", False, f"Status: {response.status_code}")
        else:
            self.log_result("Create Issue", False, f"Status: {response.status_code}")
    
    # ==================== DASHBOARD TESTS ====================
    
    def test_dashboard_access(self):
        """Test dashboard access for all roles"""
        print("\n" + "="*80)
        print("DASHBOARD ACCESS TESTS")
        print("="*80)
        
        roles = ['admin', 'staff', 'driver', 'inspector']
        
        for role in roles:
            token = self.auth_tokens.get(role)
            if not token:
                self.log_result(f"Dashboard Access ({role})", False, "Token not available")
                continue
            
            self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
            
            # Test dashboard stats endpoint
            response = self.client.get(f'{self.api_base_url}/api/fleet/stats/dashboard/')
            if response.status_code == 200:
                stats = response.json()
                self.log_result(f"Dashboard Stats ({role})", True, f"Stats retrieved")
            else:
                self.log_result(f"Dashboard Stats ({role})", False, f"Status: {response.status_code}")
    
    # ==================== USER MANAGEMENT TESTS (Admin Only) ====================
    
    def test_user_management(self):
        """Test user management operations (admin only)"""
        print("\n" + "="*80)
        print("USER MANAGEMENT TESTS")
        print("="*80)
        
        admin_token = self.auth_tokens.get('admin')
        if not admin_token:
            self.log_result("User Management", False, "Admin token not available")
            return
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {admin_token}')
        
        # List users
        response = self.client.get(f'{self.api_base_url}/api/account/users/')
        if response.status_code == 200:
            users = response.json()
            self.log_result("List Users", True, f"Found {len(users)} users")
        else:
            self.log_result("List Users", False, f"Status: {response.status_code}")
        
        # Get user stats
        response = self.client.get(f'{self.api_base_url}/api/account/stats/')
        if response.status_code == 200:
            stats = response.json()
            self.log_result("Get User Stats", True)
        else:
            self.log_result("Get User Stats", False, f"Status: {response.status_code}")
    
    # ==================== RUN ALL TESTS ====================
    
    def run_all_tests(self):
        """Run all test suites"""
        print("\n" + "="*80)
        print("COMPREHENSIVE DAY-TO-DAY OPERATIONS TEST SUITE")
        print("="*80)
        print(f"API Base URL: {self.api_base_url}")
        print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80)
        
        # Setup
        if not self.setup_test_data():
            print("\n❌ Failed to setup test data. Aborting tests.")
            return
        
        # Run test suites
        self.test_authentication_flow()
        self.test_dashboard_access()
        self.test_vehicle_operations()
        self.test_inspection_operations()
        self.test_shift_operations()
        self.test_issue_operations()
        self.test_user_management()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r.passed)
        failed = total - passed
        
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        print("="*80)
        
        if failed > 0:
            print("\nFAILED TESTS:")
            for result in self.results:
                if not result.passed:
                    print(f"  ❌ {result.name}: {result.message}")
        
        # Save results to file
        results_file = f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_file, 'w') as f:
            json.dump({
                'summary': {
                    'total': total,
                    'passed': passed,
                    'failed': failed,
                    'success_rate': passed/total*100 if total > 0 else 0
                },
                'results': [
                    {
                        'name': r.name,
                        'passed': r.passed,
                        'message': r.message,
                        'data': r.data,
                        'timestamp': r.timestamp.isoformat()
                    }
                    for r in self.results
                ]
            }, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: {results_file}")

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Run day-to-day operations tests')
    parser.add_argument('--api-url', default='http://localhost:8000', help='API base URL')
    args = parser.parse_args()
    
    tester = DayToDayOperationsTest(api_base_url=args.api_url)
    tester.run_all_tests()

