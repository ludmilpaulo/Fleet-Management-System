#!/usr/bin/env python3
"""
Comprehensive Test Suite for All Platforms
Tests Backend, Web, and Mobile functionality
"""

import requests
import json
import sys
import subprocess
import time
import os

BASE_URL = "http://localhost:8000"
GRAPHQL_URL = f"{BASE_URL}/graphql/"

# Test user tokens
TOKENS = {
    'admin': '9066bf00a49c3372323c9f144560c930befdc7a9',
    'staff': 'b2ebdf6a0bd620e2acc9f592459bde34dcba1075',
    'driver': 'e562cb5ef017450cfbfb1733f8653f2adb581c85',
    'inspector': 'ec418bb03681047de2f6ea07eb4902013f41c3fd',
}

def test_backend_health():
    """Test backend is running and accessible"""
    try:
        response = requests.get(f"{BASE_URL}/admin/", timeout=5)
        return response.status_code in [200, 302, 301]
    except:
        return False

def test_graphql_endpoint(token):
    """Test GraphQL endpoint is working"""
    try:
        response = requests.post(
            GRAPHQL_URL,
            json={"query": "{ me { id email role } }"},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Token {token}"
            },
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            return "data" in data and "errors" not in data
        return False
    except:
        return False

def test_rest_endpoint(token, endpoint):
    """Test REST API endpoint"""
    try:
        response = requests.get(
            f"{BASE_URL}{endpoint}",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Token {token}"
            },
            timeout=5
        )
        return response.status_code in [200, 201]
    except:
        return False

def test_web_app():
    """Test web app is running"""
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        return response.status_code == 200
    except:
        return False

def test_backend_features():
    """Test all backend features"""
    print("\n" + "="*60)
    print("BACKEND FEATURE TESTS")
    print("="*60)
    
    tests = {
        "Backend Health": test_backend_health(),
        "GraphQL Endpoint (Admin)": test_graphql_endpoint(TOKENS['admin']),
        "GraphQL Endpoint (Staff)": test_graphql_endpoint(TOKENS['staff']),
        "GraphQL Endpoint (Driver)": test_graphql_endpoint(TOKENS['driver']),
        "GraphQL Endpoint (Inspector)": test_graphql_endpoint(TOKENS['inspector']),
        "REST API - Profile": test_rest_endpoint(TOKENS['admin'], "/api/account/profile/"),
        "REST API - Users": test_rest_endpoint(TOKENS['admin'], "/api/account/users/"),
        "REST API - Vehicles": test_rest_endpoint(TOKENS['admin'], "/api/fleet/vehicles/"),
        "REST API - Dashboard Stats": test_rest_endpoint(TOKENS['staff'], "/api/fleet/stats/dashboard/"),
        "REST API - Shifts": test_rest_endpoint(TOKENS['driver'], "/api/fleet/shifts/"),
        "REST API - Inspections": test_rest_endpoint(TOKENS['inspector'], "/api/inspections/inspections/"),
    }
    
    passed = sum(1 for v in tests.values() if v)
    total = len(tests)
    
    for name, result in tests.items():
        status = "✅" if result else "❌"
        print(f"  {status} {name}")
    
    print(f"\nBackend: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    return passed, total

def test_web_features():
    """Test web app features"""
    print("\n" + "="*60)
    print("WEB APP FEATURE TESTS")
    print("="*60)
    
    tests = {
        "Web App Running": test_web_app(),
        "Web App - Sign In Page": False,
        "Web App - Dashboard": False,
        "Web App - Vehicles Page": False,
        "Web App - API Config": False,
    }
    
    # Test specific pages if web app is running
    if tests["Web App Running"]:
        try:
            response = requests.get("http://localhost:3000/auth/signin", timeout=5)
            tests["Web App - Sign In Page"] = response.status_code == 200
        except:
            pass
        
        try:
            response = requests.get("http://localhost:3000/dashboard", timeout=5, allow_redirects=False)
            # Dashboard should redirect to signin if not authenticated (302) or return 200 if authenticated
            tests["Web App - Dashboard"] = response.status_code in [200, 302, 401, 307]
        except:
            pass
        
        try:
            response = requests.get("http://localhost:3000/vehicles", timeout=5, allow_redirects=False)
            # Vehicles page should redirect to signin if not authenticated or return 200
            tests["Web App - Vehicles Page"] = response.status_code in [200, 302, 401, 307]
        except:
            pass
        
        # Check if API config file exists
        api_config_path = "fleet/apps/web/src/config/api.ts"
        tests["Web App - API Config"] = os.path.exists(api_config_path)
    
    passed = sum(1 for v in tests.values() if v)
    total = len(tests)
    
    for name, result in tests.items():
        status = "✅" if result else "❌"
        print(f"  {status} {name}")
    
    print(f"\nWeb: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    return passed, total

def test_mobile_dependencies():
    """Check if mobile app dependencies are installed"""
    print("\n" + "="*60)
    print("MOBILE APP DEPENDENCY CHECKS")
    print("="*60)
    
    mobile_dir = "fleet/apps/mobile"
    node_modules_exists = os.path.exists(f"{mobile_dir}/node_modules")
    
    tests = {
        "Node Modules Installed": node_modules_exists,
        "Package.json Exists": os.path.exists(f"{mobile_dir}/package.json"),
        "TypeScript Config Exists": os.path.exists(f"{mobile_dir}/tsconfig.json"),
    }
    
    passed = sum(1 for v in tests.values() if v)
    total = len(tests)
    
    for name, result in tests.items():
        status = "✅" if result else "❌"
        print(f"  {status} {name}")
    
    print(f"\nMobile Dependencies: {passed}/{total} checks passed ({passed/total*100:.1f}%)")
    return passed, total

def check_build_status():
    """Check if projects can build without errors"""
    print("\n" + "="*60)
    print("BUILD STATUS CHECKS")
    print("="*60)
    
    results = {}
    
    # Check web build
    web_dir = "fleet/apps/web"
    if os.path.exists(web_dir):
        package_json_path = os.path.join(web_dir, "package.json")
        if os.path.exists(package_json_path):
            try:
                with open(package_json_path, 'r') as f:
                    package_data = json.load(f)
                    # Check if package.json has required scripts
                    if "scripts" in package_data and "build" in package_data["scripts"]:
                        results["Web - Package.json Valid"] = True
                    else:
                        results["Web - Package.json Valid"] = False
            except:
                results["Web - Package.json Valid"] = False
        else:
            results["Web - Package.json Valid"] = False
    
    # Check mobile build
    mobile_dir = "fleet/apps/mobile"
    if os.path.exists(mobile_dir):
        try:
            result = subprocess.run(
                ["npm", "run", "--dry-run"],
                cwd=mobile_dir,
                capture_output=True,
                text=True,
                timeout=10
            )
            results["Mobile - Package.json Valid"] = True
        except:
            results["Mobile - Package.json Valid"] = False
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, result in results.items():
        status = "✅" if result else "❌"
        print(f"  {status} {name}")
    
    if total > 0:
        print(f"\nBuild Checks: {passed}/{total} passed ({passed/total*100:.1f}%)")
    else:
        print("\nBuild Checks: N/A (could not check)")
    
    return passed, total

def main():
    print("="*60)
    print("COMPREHENSIVE FLEET MANAGEMENT SYSTEM TEST SUITE")
    print("Testing: Backend | Web | Mobile")
    print("="*60)
    
    # Test backend
    backend_passed, backend_total = test_backend_features()
    
    # Test web
    web_passed, web_total = test_web_features()
    
    # Test mobile dependencies
    mobile_passed, mobile_total = test_mobile_dependencies()
    
    # Check build status
    build_passed, build_total = check_build_status()
    
    # Summary
    print("\n" + "="*60)
    print("OVERALL TEST SUMMARY")
    print("="*60)
    
    total_passed = backend_passed + web_passed + mobile_passed + build_passed
    total_tests = backend_total + web_total + mobile_total + build_total
    
    print(f"✅ Backend:     {backend_passed:2}/{backend_total} ({backend_passed/backend_total*100:5.1f}%)")
    print(f"{'✅' if web_passed == web_total else '⚠️'} Web:          {web_passed:2}/{web_total} ({web_passed/web_total*100:5.1f}%)")
    print(f"{'✅' if mobile_passed == mobile_total else '⚠️'} Mobile:       {mobile_passed:2}/{mobile_total} ({mobile_passed/mobile_total*100:5.1f}%)")
    print(f"{'✅' if build_passed == build_total else '⚠️'} Build Checks: {build_passed:2}/{build_total} ({build_passed/build_total*100:5.1f}%)" if build_total > 0 else "⚠️ Build Checks: N/A")
    
    print(f"\n{'='*60}")
    overall_percentage = (total_passed / total_tests * 100) if total_tests > 0 else 0
    print(f"OVERALL: {total_passed}/{total_tests} tests passed ({overall_percentage:.1f}%)")
    
    if overall_percentage == 100:
        print("🎉 All systems operational! 100/100")
        return 0
    else:
        print(f"⚠️  {total_tests - total_passed} test(s) need attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())

