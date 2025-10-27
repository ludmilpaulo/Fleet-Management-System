#!/usr/bin/env python
"""
Comprehensive End-to-End Test Script for Fleet Management System
Tests all user types, CRUD operations, and backend integration
"""

import os
import django
import sys
import json
from datetime import datetime, timedelta
from decimal import Decimal
import requests
from requests.auth import HTTPBasicAuth

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from account.models import User, Company
from fleet_app.models import Vehicle, Shift
from inspections.models import Inspection
from issues.models import Issue
from platform_admin.models import PlatformAdmin
from rest_framework.authtoken.models import Token

User = get_user_model()

BASE_URL = "http://localhost:8000/api"

class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.OKBLUE}{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.OKBLUE}{Colors.BOLD}  {text}{Colors.ENDC}")
    print(f"{Colors.OKBLUE}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}[PASS] {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}[FAIL] {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}[WARN] {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}i {text}{Colors.ENDC}")

def login(username, password):
    """Login and return access token"""
    url = f"{BASE_URL}/account/login/"
    response = requests.post(url, json={"username": username, "password": password})
    if response.status_code == 200:
        data = response.json()
        return data.get('token')
    print_error(f"Login failed for {username}: {response.status_code} - {response.text}")
    return None

def get_headers(token):
    """Get headers with authentication"""
    return {"Authorization": f"Token {token}", "Content-Type": "application/json"}

class TestRunner:
    def __init__(self):
        self.test_results = []
        self.companies = []
        self.users = {}
        
    def log_result(self, test_name, passed, message=""):
        """Log test result"""
        self.test_results.append({
            'test': test_name,
            'passed': passed,
            'message': message
        })
        if passed:
            print_success(f"{test_name}: PASSED - {message}")
        else:
            print_error(f"{test_name}: FAILED - {message}")
    
    def setup_test_data(self):
        """Create test data"""
        print_header("SETUP: Creating Test Data")
        
        # Create test company
        company, created = Company.objects.get_or_create(
            slug='test-company',
            defaults={
                'name': 'Test Fleet Company',
                'email': 'test@testfleet.com',
                'subscription_plan': 'professional',
                'subscription_status': 'active',
                'is_active': True,
            }
        )
        self.companies.append(company)
        print_success(f"Company created: {company.name}")
        
        # Create users for each role
        users_config = [
            {'username': 'platformadmin', 'password': 'Test123!', 'role': 'admin', 'is_superuser': True, 'is_staff': True},
            {'username': 'companyadmin', 'password': 'Test123!', 'role': 'admin'},
            {'username': 'staffuser', 'password': 'Test123!', 'role': 'staff'},
            {'username': 'driveruser', 'password': 'Test123!', 'role': 'driver'},
            {'username': 'inspectoruser', 'password': 'Test123!', 'role': 'inspector'},
        ]
        
        for config in users_config:
            role = config.pop('role')
            is_superuser = config.pop('is_superuser', False)
            is_staff = config.pop('is_staff', False)
            
            user, created = User.objects.get_or_create(
                username=config['username'],
                defaults={
                    **config,
                    'company': company,
                    'email': f"{config['username']}@testfleet.com",
                    'role': role,
                    'is_superuser': is_superuser,
                    'is_staff': is_staff,
                }
            )
            
            if created or user.role != role:
                user.role = role
                user.is_superuser = is_superuser
                user.is_staff = is_staff
                user.set_password(config['password'])
                user.save()
            
            self.users[role] = user
            print_success(f"User created: {user.username} ({role})")
        
        # Create PlatformAdmin
        if 'admin' in self.users and self.users['admin'].is_superuser:
            platform_admin, created = PlatformAdmin.objects.get_or_create(
                user=self.users['admin'],
                defaults={
                    'is_super_admin': True,
                    'permissions': ['all']
                }
            )
            print_success("Platform Admin created")
    
    def test_authentication(self):
        """Test authentication for all users"""
        print_header("TESTING: Authentication")
        
        for role, user in self.users.items():
            token = login(user.username, 'Test123!')
            if token:
                self.log_result(f"Auth - {role}", True, f"{user.username} authenticated")
            else:
                self.log_result(f"Auth - {role}", False, f"{user.username} failed to authenticate")
    
    def test_get_profile(self):
        """Test getting user profile"""
        print_header("TESTING: Get User Profile")
        
        for role, user in self.users.items():
            token = login(user.username, 'Test123!')
            if not token:
                continue
                
            url = f"{BASE_URL}/account/profile/"
            response = requests.get(url, headers=get_headers(token))
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(f"Profile - {role}", True, f"Got profile for {user.username}")
            else:
                self.log_result(f"Profile - {role}", False, f"Failed to get profile: {response.status_code}")
    
    def test_vehicle_crud(self):
        """Test vehicle CRUD operations"""
        print_header("TESTING: Vehicle CRUD Operations")
        
        # Test CREATE
        token = login('companyadmin', 'Test123!')
        if token:
            vehicle_data = {
                "reg_number": "TEST-001",
                "make": "Ford",
                "model": "Transit",
                "year": 2024,
                "vin": "VINTEST001",
                "status": "ACTIVE",
                "mileage": 1000,
                "fuel_type": "DIESEL",
                "color": "White"
            }
            
            url = f"{BASE_URL}/fleet/vehicles"
            response = requests.post(url, json=vehicle_data, headers=get_headers(token))
            
            if response.status_code in [200, 201]:
                vehicle_id = response.json().get('id')
                self.log_result("Vehicle CREATE", True, f"Created vehicle ID {vehicle_id}")
                
                # Test READ
                url = f"{BASE_URL}/fleet/vehicles"
                response = requests.get(url, headers=get_headers(token))
                if response.status_code == 200:
                    vehicles = response.json()
                    if isinstance(vehicles, dict) and 'results' in vehicles:
                        vehicles = vehicles['results']
                    self.log_result("Vehicle READ", True, f"Retrieved {len(vehicles)} vehicles")
                else:
                    self.log_result("Vehicle READ", False, f"Failed: {response.status_code}")
                
                # Test UPDATE
                if vehicle_id:
                    update_data = {"color": "Blue"}
                    url = f"{BASE_URL}/fleet/vehicles/{vehicle_id}"
                    response = requests.patch(url, json=update_data, headers=get_headers(token))
                    if response.status_code == 200:
                        self.log_result("Vehicle UPDATE", True, f"Updated vehicle {vehicle_id}")
                    else:
                        self.log_result("Vehicle UPDATE", False, f"Failed: {response.status_code}")
            else:
                error_text = response.text[:200] if hasattr(response, 'text') else "No error details"
                print_error(f"Vehicle create error: {error_text}")
                self.log_result("Vehicle CREATE", False, f"Failed: {response.status_code}")
    
    def test_shift_operations(self):
        """Test shift operations"""
        print_header("TESTING: Shift Operations")
        
        # Get a vehicle first
        token = login('companyadmin', 'Test123!')
        if not token:
            return
        
        url = f"{BASE_URL}/fleet/vehicles"
        response = requests.get(url, headers=get_headers(token))
        if response.status_code != 200:
            return
        
        vehicles = response.json()
        if isinstance(vehicles, dict) and 'results' in vehicles:
            vehicles = vehicles['results']
        if not vehicles:
            print_warning("No vehicles found, skipping shift tests")
            return
        
        vehicle_id = vehicles[0].get('id')
        
        # Test start shift (driver)
        driver_token = login('driveruser', 'Test123!')
        if driver_token:
            shift_data = {
                "vehicle_id": vehicle_id,
                "gps": {"lat": -33.9, "lng": 18.4}
            }
            
            url = f"{BASE_URL}/fleet/shifts/start/"
            response = requests.post(url, json=shift_data, headers=get_headers(driver_token))
            
            if response.status_code in [200, 201]:
                shift_data = response.json()
                self.log_result("Shift START", True, f"Started shift ID {shift_data.get('id')}")
            else:
                self.log_result("Shift START", False, f"Failed: {response.status_code}")
    
    def test_inspection_operations(self):
        """Test inspection operations"""
        print_header("TESTING: Inspection Operations")
        
        token = login('inspectoruser', 'Test123!')
        if not token:
            return
        
        url = f"{BASE_URL}/inspections/inspections/"
        response = requests.get(url, headers=get_headers(token))
        
        if response.status_code == 200:
            inspections = response.json()
            if isinstance(inspections, dict) and 'results' in inspections:
                inspections = inspections['results']
            self.log_result("Inspection READ", True, f"Retrieved {len(inspections)} inspections")
        else:
            self.log_result("Inspection READ", False, f"Failed: {response.status_code}")
    
    def test_issue_operations(self):
        """Test issue operations"""
        print_header("TESTING: Issue Operations")
        
        token = login('staffuser', 'Test123!')
        if not token:
            return
        
        # First, get a vehicle (we need it to create an issue)
        url = f"{BASE_URL}/fleet/vehicles"
        response = requests.get(url, headers=get_headers(token))
        if response.status_code == 200:
            vehicles = response.json()
            if isinstance(vehicles, dict) and 'results' in vehicles:
                vehicles = vehicles['results']
            
            if not vehicles:
                # Try to create a vehicle first
                vehicle_data = {
                    "reg_number": "ISSUE-TEST-001",
                    "make": "Ford",
                    "model": "Transit",
                    "year": 2024,
                    "vin": "VINISSUE001",
                    "status": "ACTIVE",
                    "mileage": 5000,
                    "fuel_type": "DIESEL",
                    "color": "White"
                }
                vehicle_response = requests.post(f"{BASE_URL}/fleet/vehicles", json=vehicle_data, headers=get_headers(token))
                if vehicle_response.status_code in [200, 201]:
                    vehicle = vehicle_response.json()
                    vehicle_id = vehicle.get('id')
                else:
                    print_warning("Could not create vehicle for issue test, skipping issue creation")
                    return
            else:
                vehicle_id = vehicles[0].get('id')
        else:
            print_warning("Could not get vehicles for issue test, skipping issue creation")
            return
        
        # Test CREATE with vehicle ID
        url = f"{BASE_URL}/issues/issues"
        issue_data = {
            "vehicle": vehicle_id,
            "title": "Test Issue",
            "description": "This is a test issue",
            "category": "MECHANICAL",
            "severity": "MEDIUM",
            "status": "OPEN"
        }
        
        response = requests.post(url, json=issue_data, headers=get_headers(token))
        
        if response.status_code in [200, 201]:
            self.log_result("Issue CREATE", True, f"Created issue")
            
            # Test READ
            url = f"{BASE_URL}/issues/issues"
            response = requests.get(url, headers=get_headers(token))
            if response.status_code == 200:
                issues = response.json()
                if isinstance(issues, dict) and 'results' in issues:
                    issues = issues['results']
                self.log_result("Issue READ", True, f"Retrieved {len(issues)} issues")
            else:
                self.log_result("Issue READ", False, f"Failed: {response.status_code}")
        else:
            error_text = response.text[:200] if hasattr(response, 'text') else "No error details"
            print_error(f"Issue create error: {error_text}")
            self.log_result("Issue CREATE", False, f"Failed: {response.status_code}")
    
    def test_permissions(self):
        """Test role-based permissions"""
        print_header("TESTING: Role-Based Permissions")
        
        # Driver should not be able to create vehicles
        driver_token = login('driveruser', 'Test123!')
        if driver_token:
            vehicle_data = {"reg_number": "UNAUTHORIZED", "make": "Test", "model": "Test"}
            url = f"{BASE_URL}/fleet/vehicles"
            response = requests.post(url, json=vehicle_data, headers=get_headers(driver_token))
            
            if response.status_code in [200, 201]:
                self.log_result("Permission - Driver Create Vehicle", False, "Driver can create vehicles (should not)")
            else:
                self.log_result("Permission - Driver Create Vehicle", True, "Driver correctly denied")
        
        # Admin should be able to create vehicles
        admin_token = login('companyadmin', 'Test123!')
        if admin_token:
            url = f"{BASE_URL}/fleet/vehicles"
            response = requests.get(url, headers=get_headers(admin_token))
            
            if response.status_code == 200:
                self.log_result("Permission - Admin Access", True, "Admin can access vehicles")
            else:
                self.log_result("Permission - Admin Access", False, "Admin denied access")
    
    def test_api_endpoints(self):
        """Test all major API endpoints"""
        print_header("TESTING: API Endpoints")
        
        token = login('companyadmin', 'Test123!')
        if not token:
            return
        
        endpoints = [
            ("/account/profile/", "GET"),
            ("/fleet/vehicles", "GET"),
            ("/inspections/inspections/", "GET"),
            ("/issues/issues", "GET"),
            ("/tickets/tickets/", "GET"),
        ]
        
        for endpoint, method in endpoints:
            url = f"{BASE_URL}{endpoint}"
            if method == "GET":
                response = requests.get(url, headers=get_headers(token))
            
            if response.status_code in [200, 201]:
                self.log_result(f"Endpoint {endpoint}", True, f"Returns {response.status_code}")
            else:
                self.log_result(f"Endpoint {endpoint}", False, f"Returns {response.status_code}")
    
    def run_all_tests(self):
        """Run all tests"""
        print_header("COMPREHENSIVE FLEET MANAGEMENT SYSTEM TEST")
        print_info(f"Base URL: {BASE_URL}")
        print_info(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Setup
            self.setup_test_data()
            
            # Run tests
            self.test_authentication()
            self.test_get_profile()
            self.test_vehicle_crud()
            self.test_shift_operations()
            self.test_inspection_operations()
            self.test_issue_operations()
            self.test_permissions()
            self.test_api_endpoints()
            
            # Summary
            print_header("TEST SUMMARY")
            
            total = len(self.test_results)
            passed = sum(1 for r in self.test_results if r['passed'])
            failed = total - passed
            
            print_info(f"Total Tests: {total}")
            print_success(f"Passed: {passed}")
            if failed > 0:
                print_error(f"Failed: {failed}")
            
            print("\n" + "="*80)
            print("\nDetailed Results:")
            print("="*80)
            
            for result in self.test_results:
                status = "[PASS]" if result['passed'] else "[FAIL]"
                color = Colors.OKGREEN if result['passed'] else Colors.FAIL
                print(f"{color}{status}{Colors.ENDC} - {result['test']}: {result['message']}")
            
            print("\n" + "="*80)
            
            if failed == 0:
                print_success("ALL TESTS PASSED!")
                return 0
            else:
                print_error(f"{failed} TEST(S) FAILED")
                return 1
                
        except Exception as e:
            print_error(f"Error during testing: {str(e)}")
            import traceback
            traceback.print_exc()
            return 1

if __name__ == '__main__':
    runner = TestRunner()
    exit_code = runner.run_all_tests()
    sys.exit(exit_code)
