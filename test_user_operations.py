#!/usr/bin/env python3
"""
Day-to-Day Operations Test Suite
Tests all user roles: Admin, Staff, Driver, Inspector
"""

import requests
import json
import sys
import time

BASE_URL = "http://localhost:8000"
GRAPHQL_URL = f"{BASE_URL}/graphql/"

# Test user tokens (hardcoded from earlier setup)
TOKENS = {
    'admin': '9066bf00a49c3372323c9f144560c930befdc7a9',
    'staff': 'b2ebdf6a0bd620e2acc9f592459bde34dcba1075',
    'driver': 'e562cb5ef017450cfbfb1733f8653f2adb581c85',
    'inspector': 'ec418bb03681047de2f6ea07eb4902013f41c3fd',
}

def test_graphql_query(token, role, query, description):
    """Test a GraphQL query"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {token}"
    }
    try:
        response = requests.post(GRAPHQL_URL, json={"query": query}, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "errors" in data:
                error_msg = data['errors'][0].get('message', 'Unknown error')
                return False, f"GraphQL Error: {error_msg}"
            if "data" in data:
                return True, "Success"
        # Try to extract JSON error from HTML response
        if "application/json" in response.headers.get("content-type", ""):
            try:
                error_data = response.json()
                if "errors" in error_data:
                    return False, f"GraphQL Error: {error_data['errors'][0].get('message', 'Unknown')}"
            except:
                pass
        return False, f"HTTP {response.status_code}"
    except Exception as e:
        return False, f"Exception: {str(e)}"

def test_rest_api(token, role, method, endpoint, data=None, description=""):
    """Test a REST API endpoint"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {token}"
    }
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", json=data, headers=headers, timeout=5)
        else:
            return False, f"Unsupported method: {method}"
        
        if response.status_code in [200, 201]:
            return True, "Success"
        return False, f"HTTP {response.status_code}"
    except Exception as e:
        return False, f"Exception: {str(e)}"

def main():
    print("=" * 60)
    print("FLEET MANAGEMENT - DAY-TO-DAY OPERATIONS TEST")
    print("=" * 60)
    print()
    
    results = {
        'admin': {'passed': 0, 'failed': 0},
        'staff': {'passed': 0, 'failed': 0},
        'driver': {'passed': 0, 'failed': 0},
        'inspector': {'passed': 0, 'failed': 0},
    }
    
    # ========== ADMIN OPERATIONS ==========
    print("🔵 ADMIN USER OPERATIONS")
    print("-" * 60)
    
    test = "View own profile (GraphQL)"
    success, msg = test_graphql_query(
        TOKENS['admin'], "ADMIN",
        "{ me { id email firstName lastName role } }",
        test
    )
    results['admin']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "View all vehicles (GraphQL)"
    success, msg = test_graphql_query(
        TOKENS['admin'], "ADMIN",
        "{ vehicles { id regNumber make model status } }",
        test
    )
    results['admin']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "Create vehicle (GraphQL)"
    unique_reg = f"ADMIN-V-{int(time.time()) % 100000}"
    success, msg = test_graphql_query(
        TOKENS['admin'], "ADMIN",
        f'mutation {{ createVehicle(regNumber: "{unique_reg}", make: "AdminCreated", model: "Test", year: 2025) {{ vehicle {{ id regNumber }} }} }}',
        test
    )
    results['admin']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "List users (REST API)"
    success, msg = test_rest_api(TOKENS['admin'], "ADMIN", "GET", "/api/account/users/")
    results['admin']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "Get profile (REST API)"
    success, msg = test_rest_api(TOKENS['admin'], "ADMIN", "GET", "/api/account/profile/")
    results['admin']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    print()
    
    # ========== STAFF OPERATIONS ==========
    print("🟢 STAFF USER OPERATIONS")
    print("-" * 60)
    
    test = "View own profile (GraphQL)"
    success, msg = test_graphql_query(
        TOKENS['staff'], "STAFF",
        "{ me { id email firstName lastName role } }",
        test
    )
    results['staff']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "View vehicles (GraphQL)"
    success, msg = test_graphql_query(
        TOKENS['staff'], "STAFF",
        "{ vehicles { id regNumber make model status } }",
        test
    )
    results['staff']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "Create vehicle (GraphQL)"
    unique_reg = f"STAFF-V-{int(time.time()) % 100000}"
    success, msg = test_graphql_query(
        TOKENS['staff'], "STAFF",
        f'mutation {{ createVehicle(regNumber: "{unique_reg}", make: "StaffCreated", model: "Test") {{ vehicle {{ id regNumber }} }} }}',
        test
    )
    results['staff']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "View dashboard stats (REST API)"
    success, msg = test_rest_api(TOKENS['staff'], "STAFF", "GET", "/api/fleet/stats/dashboard/")
    results['staff']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "List vehicles (REST API)"
    success, msg = test_rest_api(TOKENS['staff'], "STAFF", "GET", "/api/fleet/vehicles/")
    results['staff']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    print()
    
    # ========== DRIVER OPERATIONS ==========
    print("🟡 DRIVER USER OPERATIONS")
    print("-" * 60)
    
    test = "View own profile (GraphQL)"
    success, msg = test_graphql_query(
        TOKENS['driver'], "DRIVER",
        "{ me { id email firstName lastName role } }",
        test
    )
    results['driver']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "View vehicles (GraphQL)"
    success, msg = test_graphql_query(
        TOKENS['driver'], "DRIVER",
        "{ vehicles { id regNumber make model status } }",
        test
    )
    results['driver']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "Get profile (REST API)"
    success, msg = test_rest_api(TOKENS['driver'], "DRIVER", "GET", "/api/account/profile/")
    results['driver']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "View shifts (REST API)"
    success, msg = test_rest_api(TOKENS['driver'], "DRIVER", "GET", "/api/fleet/shifts/")
    results['driver']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    print()
    
    # ========== INSPECTOR OPERATIONS ==========
    print("🟣 INSPECTOR USER OPERATIONS")
    print("-" * 60)
    
    test = "View own profile (GraphQL)"
    success, msg = test_graphql_query(
        TOKENS['inspector'], "INSPECTOR",
        "{ me { id email firstName lastName role } }",
        test
    )
    results['inspector']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "View vehicles (GraphQL)"
    success, msg = test_graphql_query(
        TOKENS['inspector'], "INSPECTOR",
        "{ vehicles { id regNumber make model status } }",
        test
    )
    results['inspector']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "Get profile (REST API)"
    success, msg = test_rest_api(TOKENS['inspector'], "INSPECTOR", "GET", "/api/account/profile/")
    results['inspector']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    test = "View inspections (REST API)"
    success, msg = test_rest_api(TOKENS['inspector'], "INSPECTOR", "GET", "/api/inspections/inspections/")
    results['inspector']['passed' if success else 'failed'] += 1
    print(f"  ✅ {test}" if success else f"  ❌ {test}: {msg}")
    
    print()
    
    # ========== SUMMARY ==========
    print("=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    total_passed = 0
    total_failed = 0
    
    for role, stats in results.items():
        role_name = role.upper()
        passed = stats['passed']
        failed = stats['failed']
        total = passed + failed
        total_passed += passed
        total_failed += failed
        percentage = (passed / total * 100) if total > 0 else 0
        status = "✅" if failed == 0 else "⚠️"
        print(f"{status} {role_name:12} {passed:2}/{total} passed ({percentage:5.1f}%)")
    
    print()
    print(f"Overall: {total_passed}/{total_passed + total_failed} tests passed")
    
    if total_failed == 0:
        print("\n🎉 All tests passed! System is fully operational.")
        return 0
    else:
        print(f"\n⚠️  {total_failed} test(s) failed. Please review errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

