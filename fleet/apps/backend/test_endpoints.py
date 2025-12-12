#!/usr/bin/env python3
"""
Test script to verify all backend API endpoints are working correctly.
Run this script to check if the backend server is running and endpoints are accessible.
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_endpoint(method, endpoint, data=None, headers=None, description=""):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=5)
        elif method == "OPTIONS":
            response = requests.options(url, headers=headers, timeout=5)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        status_emoji = "✅" if response.status_code < 400 else "⚠️"
        print(f"{status_emoji} {description or endpoint}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code >= 400:
            try:
                error_data = response.json()
                print(f"   Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   Error: {response.text[:200]}")
        
        return response.status_code < 500  # 4xx is OK (expected for auth), 5xx is server error
    except requests.exceptions.ConnectionError:
        print(f"❌ {description or endpoint}")
        print(f"   Error: Cannot connect to {BASE_URL}")
        print(f"   Make sure the backend server is running: python manage.py runserver")
        return False
    except Exception as e:
        print(f"❌ {description or endpoint}")
        print(f"   Error: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("Backend API Endpoint Test")
    print("=" * 60)
    print(f"Testing endpoints at: {BASE_URL}\n")
    
    results = []
    
    # Test server connectivity
    print("\n📡 Testing Server Connectivity:")
    print("-" * 60)
    results.append(("Server", test_endpoint("GET", "/account/login/", description="Server Connection")))
    
    # Test authentication endpoints (should return 400/405, not 500)
    print("\n🔐 Testing Authentication Endpoints:")
    print("-" * 60)
    results.append(("Login (OPTIONS)", test_endpoint("OPTIONS", "/account/login/", description="Login Endpoint (CORS)")))
    results.append(("Login (POST empty)", test_endpoint("POST", "/account/login/", data={}, description="Login Endpoint")))
    results.append(("Register (OPTIONS)", test_endpoint("OPTIONS", "/account/register/", description="Register Endpoint (CORS)")))
    results.append(("Register (POST empty)", test_endpoint("POST", "/account/register/", data={}, description="Register Endpoint")))
    
    # Test profile endpoint (should return 401, not 500)
    print("\n👤 Testing Profile Endpoints:")
    print("-" * 60)
    results.append(("Profile (no auth)", test_endpoint("GET", "/account/profile/", description="Profile Endpoint (Unauthenticated)")))
    
    # Test company endpoints
    print("\n🏢 Testing Company Endpoints:")
    print("-" * 60)
    results.append(("Companies", test_endpoint("GET", "/companies/companies/", description="Companies List")))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary:")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ All endpoints are accessible!")
        return 0
    else:
        print("\n⚠️  Some endpoints have issues. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
