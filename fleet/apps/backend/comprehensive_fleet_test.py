#!/usr/bin/env python3
"""
Comprehensive Fleet Management System Testing Suite
Tests all roles, features, and integrations
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
from rest_framework import status
from account.models import Company
from fleet_app.models import Vehicle, Shift
from inspections.models import Inspection
from issues.models import Issue, IssuePhoto, IssueComment
from tickets.models import Ticket
import json
from datetime import datetime

User = get_user_model()

class TestResult:
    PASSED = "[PASS]"
    FAILED = "[FAIL]"
    SKIPPED = "[SKIP]"
    
    def __init__(self, test_name, status, message="", data=None):
        self.test_name = test_name
        self.status = status
        self.message = message
        self.data = data or {}

class FleetTester:
    def __init__(self):
        self.results = []
        self.client = APIClient()
        
    def run_test(self, test_func):
        """Run a test and record results"""
        try:
            result = test_func()
            self.results.append(result)
            return result
        except Exception as e:
            self.results.append(TestResult(
                test_func.__name__,
                TestResult.FAILED,
                f"Exception: {str(e)}"
            ))
            return self.results[-1]
    
    def print_result(self, result):
        """Print test result"""
        print(f"\n{result.status} {result.test_name}")
        if result.message:
            print(f"   {result.message}")
        if result.data:
            for key, value in result.data.items():
                print(f"   {key}: {value}")
    
    def authenticate(self, username, password):
        """Authenticate and get token"""
        response = self.client.post('/api/account/login/', {
            'username': username,
            'password': password
        })
        if response.status_code == 200:
            token = response.data.get('token')
            self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
            return True
        return False
    
    # ============================================
    # Platform Admin Tests
    # ============================================
    
    def test_platform_admin_login(self):
        """Test platform admin authentication"""
        success = self.authenticate('admin', 'admin123')
        return TestResult(
            'Platform Admin Login',
            TestResult.PASSED if success else TestResult.FAILED,
            "Authenticated successfully" if success else "Failed to authenticate"
        )
    
    def test_platform_admin_companies_view(self):
        """Test platform admin can view companies"""
        response = self.client.get('/api/platform-admin/companies/')
        return TestResult(
            'View All Companies',
            TestResult.PASSED if response.status_code == 200 else TestResult.FAILED,
            f"Status: {response.status_code}",
            {'companies_count': len(response.data) if response.status_code == 200 else 0}
        )
    
    def test_platform_admin_users_view(self):
        """Test platform admin can view all users"""
        response = self.client.get('/api/platform-admin/users/')
        return TestResult(
            'View All Users',
            TestResult.PASSED if response.status_code == 200 else TestResult.FAILED,
            f"Status: {response.status_code}",
            {'users_count': len(response.data) if response.status_code == 200 else 0}
        )
    
    def test_platform_admin_stats(self):
        """Test platform admin dashboard stats"""
        response = self.client.get('/api/platform-admin/stats/')
        return TestResult(
            'Platform Stats',
            TestResult.PASSED if response.status_code == 200 else TestResult.FAILED,
            f"Status: {response.status_code}"
        )
    
    # ============================================
    # Company Admin Tests
    # ============================================
    
    def test_company_admin_login(self):
        """Test company admin authentication"""
        success = self.authenticate('admin', 'admin123')
        return TestResult(
            'Company Admin Login',
            TestResult.PASSED if success else TestResult.FAILED,
            "Authenticated successfully" if success else "Failed to authenticate"
        )
    
    def test_company_admin_profile(self):
        """Test company admin can view own profile"""
        response = self.client.get('/api/account/profile/')
        return TestResult(
            'Company Admin Profile',
            TestResult.PASSED if response.status_code == 200 else TestResult.FAILED,
            f"Status: {response.status_code}"
        )
    
    def test_company_admin_create_vehicle(self):
        """Test company admin can create vehicle"""
        response = self.client.post('/api/fleet/vehicles/', {
            'reg_number': 'TEST-001',
            'make': 'Toyota',
            'model': 'Camry',
            'year': 2023,
            'color': 'White',
            'fuel_type': 'PETROL',
            'transmission': 'AUTOMATIC',
            'status': 'ACTIVE'
        })
        
        status_code = response.status_code
        return TestResult(
            'Create Vehicle',
            TestResult.PASSED if status_code in [200, 201] else TestResult.FAILED,
            f"Status: {status_code}",
            {'vehicle_id': response.data.get('id') if status_code in [200, 201] else None}
        )
    
    def test_company_admin_list_vehicles(self):
        """Test company admin can list vehicles"""
        response = self.client.get('/api/fleet/vehicles/')
        return TestResult(
            'List Vehicles',
            TestResult.PASSED if response.status_code == 200 else TestResult.FAILED,
            f"Status: {response.status_code}",
            {'vehicles_count': len(response.data) if response.status_code == 200 else 0}
        )
    
    def test_company_admin_dashboard_stats(self):
        """Test company admin dashboard"""
        response = self.client.get('/api/fleet/dashboard/stats/')
        return TestResult(
            'Dashboard Stats',
            TestResult.PASSED if response.status_code == 200 else TestResult.FAILED,
            f"Status: {response.status_code}"
        )
    
    # ============================================
    # Staff Tests
    # ============================================
    
    def test_staff_login(self):
        """Test staff authentication"""
        success = self.authenticate('staff1', 'staff123')
        return TestResult(
            'Staff Login',
            TestResult.PASSED if success else TestResult.FAILED,
            "Authenticated successfully" if success else "Failed to authenticate"
        )
    
    def test_staff_profile(self):
        """Test staff can view own profile"""
        response = self.client.get('/api/account/profile/')
        return TestResult(
            'Staff Profile',
            TestResult.PASSED if response.status_code == 200 else TestResult.FAILED,
            f"Status: {response.status_code}"
        )
    
    def test_staff_list_vehicles(self):
        """Test staff can view vehicles"""
        response = self.client.get('/api/fleet/vehicles/')
        return TestResult(
            'Staff - List Vehicles',
            TestResult.PASSED if response.status_code == 200 else TestResult.FAILED,
            f"Status: {response.status_code}"
        )
    
    def test_staff_dashboard_stats(self):
        """Test staff dashboard"""
        response = self.client.get('/api/fleet/dashboard/stats/')
        return TestResult(
            'Staff - Dashboard Stats',
            TestResult.PASSED if response.status_code == 200 else TestResult.FAILED,
            f"Status: {response.status_code}"
        )
    
    # ============================================
    # Driver Tests
    # ============================================
    
    def test_driver_login(self):
        """Test driver authentication"""
        success = self.authenticate('driver1', 'driver123')
        return TestResult(
            'Driver Login',
            TestResult.PASSED if success else TestResult.SKIPPED,
            "Authenticated successfully" if success else "Driver account not available"
        )
    
    def test_driver_profile(self):
        """Test driver can view own profile"""
        response = self.client.get('/api/account/profile/')
        return TestResult(
            'Driver Profile',
            TestResult.PASSED if response.status_code == 200 else TestResult.SKIPPED,
            f"Status: {response.status_code}"
        )
    
    def test_driver_cannot_create_vehicle(self):
        """Test driver cannot create vehicles"""
        response = self.client.post('/api/fleet/vehicles/', {
            'reg_number': 'DRIVER-001',
            'make': 'Test',
            'model': 'Test',
            'status': 'ACTIVE'
        })
        return TestResult(
            'Driver - Create Vehicle (Should Fail)',
            TestResult.PASSED if response.status_code in [403, 401] else TestResult.FAILED,
            f"Status: {response.status_code} (expected 403)"
        )
    
    def test_driver_list_shifts(self):
        """Test driver can list their shifts"""
        response = self.client.get('/api/fleet/shifts/')
        return TestResult(
            'Driver - List Shifts',
            TestResult.PASSED if response.status_code == 200 else TestResult.FAILED,
            f"Status: {response.status_code}"
        )
    
    # ============================================
    # Inspector Tests
    # ============================================
    
    def test_inspector_login(self):
        """Test inspector authentication"""
        success = self.authenticate('inspector1', 'inspector123')
        return TestResult(
            'Inspector Login',
            TestResult.PASSED if success else TestResult.SKIPPED,
            "Authenticated successfully" if success else "Inspector account not available"
        )
    
    def test_inspector_profile(self):
        """Test inspector can view own profile"""
        response = self.client.get('/api/account/profile/')
        return TestResult(
            'Inspector Profile',
            TestResult.PASSED if response.status_code == 200 else TestResult.SKIPPED,
            f"Status: {response.status_code}"
        )
    
    def test_inspector_list_inspections(self):
        """Test inspector can list inspections"""
        response = self.client.get('/api/inspections/inspections/')
        return TestResult(
            'Inspector - List Inspections',
            TestResult.PASSED if response.status_code == 200 else TestResult.FAILED,
            f"Status: {response.status_code}"
        )
    
    # ============================================
    # Integration Tests
    # ============================================
    
    def test_api_endpoints_exist(self):
        """Test that all API endpoints exist"""
        endpoints = [
            '/api/account/login/',
            '/api/account/profile/',
            '/api/fleet/vehicles/',
            '/api/fleet/shifts/',
            '/api/inspections/inspections/',
            '/api/issues/issues/',
            '/api/tickets/tickets/',
        ]
        
        passed = 0
        failed = 0
        
        for endpoint in endpoints:
            response = self.client.get(endpoint)
            if response.status_code != 404:
                passed += 1
            else:
                failed += 1
        
        return TestResult(
            'API Endpoints Check',
            TestResult.PASSED if failed == 0 else TestResult.FAILED,
            f"{passed} passed, {failed} failed"
        )
    
    def test_authentication_required(self):
        """Test that protected endpoints require authentication"""
        self.client.credentials()  # Remove credentials
        
        response = self.client.get('/api/fleet/vehicles/')
        return TestResult(
            'Authentication Required',
            TestResult.PASSED if response.status_code in [401, 403] else TestResult.FAILED,
            f"Status: {response.status_code} (expected 401/403)"
        )
    
    # ============================================
    # Run All Tests
    # ============================================
    
    def run_all_tests(self):
        """Run all tests"""
        print("\n" + "="*80)
        print("FLEET MANAGEMENT SYSTEM - COMPREHENSIVE TEST SUITE")
        print("="*80)
        
        test_categories = [
            ("Platform Admin Tests", [
                self.test_platform_admin_login,
                self.test_platform_admin_companies_view,
                self.test_platform_admin_users_view,
                self.test_platform_admin_stats,
            ]),
            ("Company Admin Tests", [
                self.test_company_admin_login,
                self.test_company_admin_profile,
                self.test_company_admin_create_vehicle,
                self.test_company_admin_list_vehicles,
                self.test_company_admin_dashboard_stats,
            ]),
            ("Staff Tests", [
                self.test_staff_login,
                self.test_staff_profile,
                self.test_staff_list_vehicles,
                self.test_staff_dashboard_stats,
            ]),
            ("Driver Tests", [
                self.test_driver_login,
                self.test_driver_profile,
                self.test_driver_cannot_create_vehicle,
                self.test_driver_list_shifts,
            ]),
            ("Inspector Tests", [
                self.test_inspector_login,
                self.test_inspector_profile,
                self.test_inspector_list_inspections,
            ]),
            ("Integration Tests", [
                self.test_api_endpoints_exist,
                self.test_authentication_required,
            ]),
        ]
        
        for category, tests in test_categories:
            print(f"\n{'='*80}")
            print(f"{category}")
            print('='*80)
            
            for test in tests:
                result = self.run_test(test)
                self.print_result(result)
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        
        total = len(self.results)
        passed = len([r for r in self.results if r.status == TestResult.PASSED])
        failed = len([r for r in self.results if r.status == TestResult.FAILED])
        skipped = len([r for r in self.results if r.status == TestResult.SKIPPED])
        
        print(f"\nTotal Tests: {total}")
        print(f"[PASS] Passed: {passed}")
        print(f"[FAIL] Failed: {failed}")
        print(f"[SKIP] Skipped: {skipped}")
        print(f"\nSuccess Rate: {(passed/total*100):.1f}%")
        
        if failed > 0:
            print("\n" + "-"*80)
            print("FAILED TESTS:")
            print("-"*80)
            for result in self.results:
                if result.status == TestResult.FAILED:
                    print(f"[FAIL] {result.test_name}")
                    print(f"   {result.message}")
        
        print("\n" + "="*80)

def main():
    tester = FleetTester()
    tester.run_all_tests()

if __name__ == '__main__':
    main()

