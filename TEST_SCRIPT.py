#!/usr/bin/env python3
"""
Comprehensive test script for Fleet Management System
Tests both web app APIs and verifies functionality
"""
import requests
import json
import sys
from typing import Dict, Optional

API_BASE_URL = "http://localhost:8000/api"
WEB_BASE_URL = "http://localhost:3000"

# Test credentials
TEST_USERS = {
    'admin': {'username': 'admin', 'password': 'admin123'},
    'driver': {'username': 'driver1', 'password': 'driver123'},
    'staff': {'username': 'staff1', 'password': 'staff123'},
    'inspector': {'username': 'inspector1', 'password': 'inspector123'},
}

class TestResult:
    def __init__(self, name: str, success: bool, message: str = "", data: Optional[Dict] = None):
        self.name = name
        self.success = success
        self.message = message
        self.data = data or {}

def print_result(result: TestResult):
    status = "✅ PASS" if result.success else "❌ FAIL"
    print(f"{status}: {result.name}")
    if result.message:
        print(f"   {result.message}")

def get_auth_token(username: str, password: str) -> Optional[str]:
    """Get authentication token"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/account/login/",
            json={'username': username, 'password': password},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            return data.get('token') or data.get('access') or data.get('access_token')
        return None
    except Exception as e:
        print(f"   Error getting token: {e}")
        return None

def test_authentication() -> list[TestResult]:
    """Test authentication for all user roles"""
    results = []
    
    print("\n🔐 Testing Authentication...")
    for role, creds in TEST_USERS.items():
        token = get_auth_token(creds['username'], creds['password'])
        if token:
            results.append(TestResult(f"Login as {role}", True, f"Token obtained: {token[:20]}..."))
        else:
            results.append(TestResult(f"Login as {role}", False, "Failed to get token"))
    
    return results

def test_user_management(token: str) -> list[TestResult]:
    """Test user management endpoints"""
    results = []
    headers = {'Authorization': f'Token {token}', 'Content-Type': 'application/json'}
    
    print("\n👥 Testing User Management...")
    
    # List users
    try:
        response = requests.get(f"{API_BASE_URL}/account/users/", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            users = data.get('results', []) if isinstance(data, dict) else data
            results.append(TestResult("List users", True, f"Found {len(users)} users"))
        else:
            results.append(TestResult("List users", False, f"Status: {response.status_code}"))
    except Exception as e:
        results.append(TestResult("List users", False, str(e)))
    
    # Create user
    try:
        user_data = {
            'username': 'testuser_new',
            'email': 'testuser_new@test.com',
            'password': 'Test123!@#',
            'password_confirm': 'Test123!@#',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'staff',
            'company_slug': 'test-company',
        }
        response = requests.post(f"{API_BASE_URL}/account/register/", json=user_data, headers=headers, timeout=10)
        if response.status_code in [200, 201]:
            results.append(TestResult("Create user", True, "User created successfully"))
        else:
            results.append(TestResult("Create user", False, f"Status: {response.status_code}, {response.text[:100]}"))
    except Exception as e:
        results.append(TestResult("Create user", False, str(e)))
    
    return results

def test_vehicle_management(token: str) -> list[TestResult]:
    """Test vehicle management endpoints"""
    results = []
    headers = {'Authorization': f'Token {token}', 'Content-Type': 'application/json'}
    
    print("\n🚗 Testing Vehicle Management...")
    
    # List vehicles
    try:
        response = requests.get(f"{API_BASE_URL}/fleet/vehicles/", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            vehicles = data.get('results', []) if isinstance(data, dict) else data
            results.append(TestResult("List vehicles", True, f"Found {len(vehicles)} vehicles"))
            if vehicles:
                vehicle_id = vehicles[0]['id']
                
                # Get vehicle details
                response = requests.get(f"{API_BASE_URL}/fleet/vehicles/{vehicle_id}/", headers=headers, timeout=10)
                if response.status_code == 200:
                    results.append(TestResult("Get vehicle details", True))
                else:
                    results.append(TestResult("Get vehicle details", False, f"Status: {response.status_code}"))
                
                # Create vehicle
                vehicle_data = {
                    'reg_number': f'TEST-NEW-{hash(str(response.json())) % 10000}',
                    'make': 'Toyota',
                    'model': 'Hiace',
                    'year': 2024,
                    'color': 'White',
                    'status': 'ACTIVE',
                    'mileage': 0,
                    'fuel_type': 'PETROL',
                    'transmission': 'MANUAL',
                }
                response = requests.post(f"{API_BASE_URL}/fleet/vehicles/", json=vehicle_data, headers=headers, timeout=10)
                if response.status_code in [200, 201]:
                    results.append(TestResult("Create vehicle", True, "Vehicle created"))
                else:
                    results.append(TestResult("Create vehicle", False, f"Status: {response.status_code}"))
        else:
            results.append(TestResult("List vehicles", False, f"Status: {response.status_code}"))
    except Exception as e:
        results.append(TestResult("List vehicles", False, str(e)))
    
    return results

def test_shift_management(token: str) -> list[TestResult]:
    """Test shift management endpoints"""
    results = []
    headers = {'Authorization': f'Token {token}', 'Content-Type': 'application/json'}
    
    print("\n⏰ Testing Shift Management...")
    
    # List shifts
    try:
        response = requests.get(f"{API_BASE_URL}/fleet/shifts/", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            shifts = data.get('results', []) if isinstance(data, dict) else data
            results.append(TestResult("List shifts", True, f"Found {len(shifts)} shifts"))
        else:
            results.append(TestResult("List shifts", False, f"Status: {response.status_code}"))
    except Exception as e:
        results.append(TestResult("List shifts", False, str(e)))
    
    return results

def test_ticket_management(token: str) -> list[TestResult]:
    """Test ticket management endpoints"""
    results = []
    headers = {'Authorization': f'Token {token}', 'Content-Type': 'application/json'}
    
    print("\n🎫 Testing Ticket Management...")
    
    # List tickets
    try:
        response = requests.get(f"{API_BASE_URL}/fleet/tickets/", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            tickets = data.get('results', []) if isinstance(data, dict) else data
            results.append(TestResult("List tickets", True, f"Found {len(tickets)} tickets"))
        else:
            results.append(TestResult("List tickets", False, f"Status: {response.status_code}"))
    except Exception as e:
        results.append(TestResult("List tickets", False, str(e)))
    
    return results

def test_inspection_management(token: str) -> list[TestResult]:
    """Test inspection management endpoints"""
    results = []
    headers = {'Authorization': f'Token {token}', 'Content-Type': 'application/json'}
    
    print("\n🔍 Testing Inspection Management...")
    
    # List inspections
    try:
        response = requests.get(f"{API_BASE_URL}/fleet/inspections/", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            inspections = data.get('results', []) if isinstance(data, dict) else data
            results.append(TestResult("List inspections", True, f"Found {len(inspections)} inspections"))
        else:
            results.append(TestResult("List inspections", False, f"Status: {response.status_code}"))
    except Exception as e:
        results.append(TestResult("List inspections", False, str(e)))
    
    return results

def test_dashboard_stats(token: str) -> list[TestResult]:
    """Test dashboard statistics endpoints"""
    results = []
    headers = {'Authorization': f'Token {token}', 'Content-Type': 'application/json'}
    
    print("\n📊 Testing Dashboard Stats...")
    
    # Get dashboard stats
    try:
        response = requests.get(f"{API_BASE_URL}/fleet/stats/dashboard/", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            results.append(TestResult("Get dashboard stats", True, f"Stats retrieved"))
        else:
            results.append(TestResult("Get dashboard stats", False, f"Status: {response.status_code}"))
    except Exception as e:
        results.append(TestResult("Get dashboard stats", False, str(e)))
    
    return results

def test_web_app() -> list[TestResult]:
    """Test web app accessibility"""
    results = []
    
    print("\n🌐 Testing Web App...")
    
    # Check if web app is running
    try:
        response = requests.get(WEB_BASE_URL, timeout=5)
        if response.status_code == 200:
            results.append(TestResult("Web app accessible", True))
        else:
            results.append(TestResult("Web app accessible", False, f"Status: {response.status_code}"))
    except Exception as e:
        results.append(TestResult("Web app accessible", False, str(e)))
    
    # Check sign in page
    try:
        response = requests.get(f"{WEB_BASE_URL}/auth/signin", timeout=5)
        if response.status_code == 200:
            results.append(TestResult("Sign in page", True))
        else:
            results.append(TestResult("Sign in page", False, f"Status: {response.status_code}"))
    except Exception as e:
        results.append(TestResult("Sign in page", False, str(e)))
    
    return results

def main():
    print("="*60)
    print("Fleet Management System - Comprehensive Test Suite")
    print("="*60)
    
    all_results = []
    
    # Test authentication
    auth_results = test_authentication()
    all_results.extend(auth_results)
    for result in auth_results:
        print_result(result)
    
    # Get admin token for further tests
    admin_token = get_auth_token('admin', 'admin123')
    
    if admin_token:
        # Test user management
        user_results = test_user_management(admin_token)
        all_results.extend(user_results)
        for result in user_results:
            print_result(result)
        
        # Test vehicle management
        vehicle_results = test_vehicle_management(admin_token)
        all_results.extend(vehicle_results)
        for result in vehicle_results:
            print_result(result)
        
        # Test shift management
        shift_results = test_shift_management(admin_token)
        all_results.extend(shift_results)
        for result in shift_results:
            print_result(result)
        
        # Test ticket management
        ticket_results = test_ticket_management(admin_token)
        all_results.extend(ticket_results)
        for result in ticket_results:
            print_result(result)
        
        # Test inspection management
        inspection_results = test_inspection_management(admin_token)
        all_results.extend(inspection_results)
        for result in inspection_results:
            print_result(result)
        
        # Test dashboard stats
        stats_results = test_dashboard_stats(admin_token)
        all_results.extend(stats_results)
        for result in stats_results:
            print_result(result)
    
    # Test web app
    web_results = test_web_app()
    all_results.extend(web_results)
    for result in web_results:
        print_result(result)
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    total = len(all_results)
    passed = sum(1 for r in all_results if r.success)
    failed = total - passed
    
    print(f"Total Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    
    if failed > 0:
        print("\nFailed Tests:")
        for result in all_results:
            if not result.success:
                print(f"  ❌ {result.name}: {result.message}")
    
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())

