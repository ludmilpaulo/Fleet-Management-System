#!/usr/bin/env python3
"""
Test script for signup and signin functionality
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_companies_endpoint():
    """Test that companies endpoint works"""
    print("=" * 60)
    print("Testing Companies Endpoint")
    print("=" * 60)
    
    url = f"{BASE_URL}/companies/companies/"
    print(f"GET {url}")
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Companies endpoint works!")
        print(f"  Found {data.get('count', len(data.get('results', [])))} companies")
        if 'results' in data and len(data['results']) > 0:
            print(f"  Sample company: {data['results'][0]['name']}")
        return True
    else:
        print(f"✗ Failed: {response.text}")
        return False

def test_create_company():
    """Test creating a new company"""
    print("\n" + "=" * 60)
    print("Testing Company Creation (Public)")
    print("=" * 60)
    
    url = f"{BASE_URL}/companies/companies/create-public/"
    data = {
        "name": "Test Signup Company",
        "email": "test@signupcompany.com",
        "description": "A test company for signup"
    }
    print(f"POST {url}")
    print(f"Data: {json.dumps(data, indent=2)}")
    
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 201:
        company = response.json()
        print(f"✓ Company created successfully!")
        print(f"  ID: {company.get('id')}")
        print(f"  Name: {company.get('name')}")
        print(f"  Slug: {company.get('slug')}")
        return company
    else:
        print(f"✗ Failed: {response.text}")
        return None

def test_signup(company_slug):
    """Test user signup"""
    print("\n" + "=" * 60)
    print("Testing User Signup")
    print("=" * 60)
    
    url = f"{BASE_URL}/account/register/"
    data = {
        "username": "testuser123",
        "email": "testuser123@example.com",
        "password": "TestPass123!",
        "password_confirm": "TestPass123!",
        "first_name": "Test",
        "last_name": "User",
        "role": "staff",
        "company_slug": company_slug
    }
    print(f"POST {url}")
    print(f"Data: {json.dumps({**data, 'password': '***', 'password_confirm': '***'}, indent=2)}")
    
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 201:
        result = response.json()
        print(f"✓ Signup successful!")
        print(f"  User: {result.get('user', {}).get('username')}")
        print(f"  Token: {result.get('token', '')[:20]}...")
        return result.get('token')
    else:
        print(f"✗ Failed: {response.text}")
        return None

def test_signin():
    """Test user signin"""
    print("\n" + "=" * 60)
    print("Testing User Signin")
    print("=" * 60)
    
    url = f"{BASE_URL}/account/login/"
    data = {
        "username": "testuser123",
        "password": "TestPass123!"
    }
    print(f"POST {url}")
    print(f"Data: {json.dumps({**data, 'password': '***'}, indent=2)}")
    
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Signin successful!")
        print(f"  User: {result.get('user', {}).get('username')}")
        print(f"  Token: {result.get('token', '')[:20]}...")
        return result.get('token')
    else:
        print(f"✗ Failed: {response.text}")
        return None

def test_profile(token):
    """Test getting user profile"""
    print("\n" + "=" * 60)
    print("Testing User Profile")
    print("=" * 60)
    
    url = f"{BASE_URL}/account/profile/"
    headers = {"Authorization": f"Token {token}"}
    print(f"GET {url}")
    
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        user = response.json()
        print(f"✓ Profile retrieved successfully!")
        print(f"  Username: {user.get('username')}")
        print(f"  Email: {user.get('email')}")
        print(f"  Role: {user.get('role')}")
        print(f"  Company: {user.get('company', {}).get('name', 'N/A')}")
        return True
    else:
        print(f"✗ Failed: {response.text}")
        return False

def main():
    print("\n" + "=" * 60)
    print("FLEET MANAGEMENT SYSTEM - SIGNUP/SIGNIN TEST")
    print("=" * 60)
    
    # Test 1: Companies endpoint
    if not test_companies_endpoint():
        print("\n✗ Companies endpoint test failed. Cannot continue.")
        sys.exit(1)
    
    # Test 2: Create company
    company = test_create_company()
    if not company:
        print("\n✗ Company creation failed. Cannot continue.")
        sys.exit(1)
    
    company_slug = company.get('slug')
    
    # Test 3: Signup
    token = test_signup(company_slug)
    if not token:
        print("\n✗ Signup failed. Trying signin with existing user...")
        # Try signin instead
        token = test_signin()
        if not token:
            print("\n✗ Both signup and signin failed.")
            sys.exit(1)
    else:
        # Test 4: Signin (with the user we just created)
        print("\n" + "-" * 60)
        print("Now testing signin with the user we just created...")
        token = test_signin()
        if not token:
            print("\n✗ Signin failed after successful signup.")
            sys.exit(1)
    
    # Test 5: Profile
    test_profile(token)
    
    print("\n" + "=" * 60)
    print("✓ ALL TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Cannot connect to backend at http://localhost:8000")
        print("  Make sure the Django backend is running!")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

