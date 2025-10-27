#!/usr/bin/env python3
"""
Realistic User Testing Script for Fleet Management System
Simulates real human behavior with realistic data, workflows, and timing
"""

import requests
import json
import time
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# API Base URL
BASE_URL = "http://localhost:8001/api"

# Test credentials for each role
TEST_USERS = {
    "platform_admin": {
        "username": "platform_admin",
        "password": "Test@123456",
        "role": "admin",
        "is_superuser": True
    },
    "company_admin": {
        "username": "company_admin",
        "password": "Test@123456",
        "role": "admin",
        "email": "companyadmin@fleetia.online"
    },
    "staff": {
        "username": "staff_user",
        "password": "Test@123456",
        "role": "staff",
        "email": "staff@fleetia.online"
    },
    "driver": {
        "username": "driver_user",
        "password": "Test@123456",
        "role": "driver",
        "email": "driver@fleetia.online"
    },
    "inspector": {
        "username": "inspector_user",
        "password": "Test@123456",
        "role": "inspector",
        "email": "inspector@fleetia.online"
    }
}

# Realistic test data
VEHICLES = [
    {"reg_number": "ABC123", "make": "Ford", "model": "Transit", "year": 2022, "vin": "1FTBWCMN8HKA12345"},
    {"reg_number": "XYZ789", "make": "Mercedes", "model": "Sprinter", "year": 2021, "vin": "WD3YG3DB1KP123456"},
    {"reg_number": "DEF456", "make": "Toyota", "model": "Hiace", "year": 2023, "vin": "JTMHU01J30A123789"},
]

COMPANIES = [
    {"name": "Test Logistics Co", "slug": "test-logistics-co", "email": "info@testlogistics.co"},
    {"name": "Express Delivery Services", "slug": "express-delivery", "email": "info@expressdelivery.com"},
]

class RealisticUser:
    def __init__(self, username: str, password: str, role: str):
        self.username = username
        self.password = password
        self.role = role
        self.token = None
        self.headers = {}
        
    def login(self) -> bool:
        """Simulate user login with realistic timing"""
        print(f"\n👤 {self.username} is logging in...")
        time.sleep(random.uniform(0.5, 1.5))  # Realistic typing speed
        
        try:
            response = requests.post(
                f"{BASE_URL}/account/login/",
                json={"username": self.username, "password": self.password}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                self.headers = {"Authorization": f"Token {self.token}"}
                print(f"✅ {self.username} logged in successfully")
                return True
            else:
                print(f"❌ {self.username} login failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ {self.username} login error: {str(e)}")
            return False
    
    def make_request(self, method: str, endpoint: str, **kwargs) -> Optional[requests.Response]:
        """Make API request with realistic timing"""
        time.sleep(random.uniform(0.3, 0.8))  # Think time before action
        
        try:
            if method.upper() == "GET":
                return requests.get(f"{BASE_URL}{endpoint}", headers=self.headers, **kwargs)
            elif method.upper() == "POST":
                return requests.post(f"{BASE_URL}{endpoint}", headers=self.headers, json=kwargs.get('data'), **{k:v for k,v in kwargs.items() if k != 'data'})
            elif method.upper() == "PUT":
                return requests.put(f"{BASE_URL}{endpoint}", headers=self.headers, json=kwargs.get('data'), **{k:v for k,v in kwargs.items() if k != 'data'})
            elif method.upper() == "PATCH":
                return requests.patch(f"{BASE_URL}{endpoint}", headers=self.headers, json=kwargs.get('data'), **{k:v for k,v in kwargs.items() if k != 'data'})
            elif method.upper() == "DELETE":
                return requests.delete(f"{BASE_URL}{endpoint}", headers=self.headers, **kwargs)
        except Exception as e:
            print(f"❌ Request error: {str(e)}")
            return None


def test_platform_admin(user: RealisticUser):
    """Test Platform Admin capabilities like a real admin would"""
    print("\n" + "="*60)
    print("🧭 TESTING PLATFORM ADMIN")
    print("="*60)
    
    if not user.login():
        return False
    
    # Test 1: View Platform Statistics (like checking dashboard)
    print("\n📊 Checking platform statistics...")
    response = user.make_request("GET", "/platform-admin/stats/")
    if response and response.status_code == 200:
        stats = response.json()
        print(f"✅ Platform Stats: {json.dumps(stats, indent=2)}")
    else:
        print(f"❌ Failed to get platform stats: {response.status_code if response else 'No response'}")
    
    # Test 2: List All Companies (like browsing companies)
    print("\n🏢 Viewing all companies on platform...")
    response = user.make_request("GET", "/platform-admin/companies/")
    if response and response.status_code == 200:
        companies = response.json().get('results', [])
        print(f"✅ Found {len(companies)} companies")
    else:
        print(f"❌ Failed to get companies: {response.status_code if response else 'No response'}")
    
    # Test 3: View System Health (like monitoring system)
    print("\n💚 Checking system health...")
    response = user.make_request("GET", "/platform-admin/system-health/")
    if response and response.status_code == 200:
        health = response.json()
        print(f"✅ System Health: {json.dumps(health, indent=2)}")
    else:
        print(f"❌ Failed to get system health: {response.status_code if response else 'No response'}")
    
    return True


def test_company_admin(user: RealisticUser):
    """Test Company Admin capabilities like a real admin would"""
    print("\n" + "="*60)
    print("🧑‍💼 TESTING COMPANY ADMIN")
    print("="*60)
    
    if not user.login():
        return False
    
    # Test 1: View Company Profile (like checking my company)
    print("\n🏢 Viewing company profile...")
    response = user.make_request("GET", "/account/profile/")
    if response and response.status_code == 200:
        profile = response.json()
        print(f"✅ Company: {profile.get('company', 'N/A')}")
    else:
        print(f"❌ Failed to get profile: {response.status_code if response else 'No response'}")
    
    # Test 2: List Users in Company (like checking team)
    print("\n👥 Viewing team members...")
    response = user.make_request("GET", "/account/users/")
    if response and response.status_code == 200:
        users = response.json().get('results', [])
        print(f"✅ Found {len(users)} team members")
    else:
        print(f"❌ Failed to get users: {response.status_code if response else 'No response'}")
    
    # Test 3: List Vehicles (like checking fleet)
    print("\n🚗 Viewing fleet vehicles...")
    response = user.make_request("GET", "/fleet/vehicles/")
    if response and response.status_code == 200:
        vehicles = response.json().get('results', [])
        print(f"✅ Found {len(vehicles)} vehicles in fleet")
    else:
        print(f"❌ Failed to get vehicles: {response.status_code if response else 'No response'}")
    
    return True


def test_staff(user: RealisticUser):
    """Test Staff capabilities like a real staff member would"""
    print("\n" + "="*60)
    print("👩‍💼 TESTING STAFF USER")
    print("="*60)
    
    if not user.login():
        return False
    
    # Test 1: View Fleet (like checking what's available)
    print("\n🚗 Viewing fleet...")
    response = user.make_request("GET", "/fleet/vehicles/")
    if response and response.status_code == 200:
        vehicles = response.json().get('results', [])
        print(f"✅ Found {len(vehicles)} vehicles")
    else:
        print(f"❌ Failed to get vehicles: {response.status_code if response else 'No response'}")
    
    # Test 2: View Issues (like checking what needs attention)
    print("\n⚠️ Checking open issues...")
    response = user.make_request("GET", "/issues/issues/")
    if response and response.status_code == 200:
        issues = response.json().get('results', [])
        print(f"✅ Found {len(issues)} issues")
    else:
        print(f"❌ Failed to get issues: {response.status_code if response else 'No response'}")
    
    # Test 3: View Tickets (like checking support tickets)
    print("\n🎫 Checking tickets...")
    response = user.make_request("GET", "/tickets/tickets/")
    if response and response.status_code == 200:
        tickets = response.json().get('results', [])
        print(f"✅ Found {len(tickets)} tickets")
    else:
        print(f"❌ Failed to get tickets: {response.status_code if response else 'No response'}")
    
    return True


def test_driver(user: RealisticUser):
    """Test Driver capabilities like a real driver would"""
    print("\n" + "="*60)
    print("🚗 TESTING DRIVER USER")
    print("="*60)
    
    if not user.login():
        return False
    
    # Test 1: View Assigned Vehicles (like checking my vehicles)
    print("\n🚗 Checking my assigned vehicles...")
    response = user.make_request("GET", "/fleet/vehicles/")
    if response and response.status_code == 200:
        vehicles = response.json().get('results', [])
        print(f"✅ Found {len(vehicles)} vehicles assigned to me")
    else:
        print(f"❌ Failed to get vehicles: {response.status_code if response else 'No response'}")
    
    # Test 2: Check Shifts (like checking my schedule)
    print("\n📅 Checking my shifts...")
    response = user.make_request("GET", "/fleet/shifts/")
    if response and response.status_code == 200:
        shifts = response.json().get('results', [])
        print(f"✅ Found {len(shifts)} shifts")
    else:
        print(f"❌ Failed to get shifts: {response.status_code if response else 'No response'}")
    
    return True


def test_inspector(user: RealisticUser):
    """Test Inspector capabilities like a real inspector would"""
    print("\n" + "="*60)
    print("🔍 TESTING INSPECTOR USER")
    print("="*60)
    
    if not user.login():
        return False
    
    # Test 1: View Inspections (like checking my workload)
    print("\n🔍 Viewing inspections...")
    response = user.make_request("GET", "/inspections/inspections/")
    if response and response.status_code == 200:
        inspections = response.json().get('results', [])
        print(f"✅ Found {len(inspections)} inspections")
    else:
        print(f"❌ Failed to get inspections: {response.status_code if response else 'No response'}")
    
    # Test 2: View Vehicles to Inspect (like checking what needs inspection)
    print("\n🚗 Checking vehicles that need inspection...")
    response = user.make_request("GET", "/fleet/vehicles/")
    if response and response.status_code == 200:
        vehicles = response.json().get('results', [])
        print(f"✅ Found {len(vehicles)} vehicles")
    else:
        print(f"❌ Failed to get vehicles: {response.status_code if response else 'No response'}")
    
    return True


def main():
    """Run all realistic user tests"""
    print("\n" + "="*80)
    print("🌟 FLEET MANAGEMENT SYSTEM - REALISTIC USER TESTING")
    print("="*80)
    print(f"\n⏰ Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 API Base URL: {BASE_URL}")
    
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL.replace('/api', '')}/")
        print("✅ Backend server is running")
    except:
        print("❌ Backend server is not running!")
        print("   Please start it with: cd fleet/apps/backend && python manage.py runserver")
        return
    
    # Run tests for each role
    results = {}
    
    # Note: Since we don't have actual test users created, we'll test what we can
    print("\n🔧 Creating realistic test scenario...")
    
    # Simulate testing with realistic user behaviors
    test_scenarios = [
        ("Platform Admin", test_platform_admin),
        ("Company Admin", test_company_admin),
        ("Staff", test_staff),
        ("Driver", test_driver),
        ("Inspector", test_inspector),
    ]
    
    for role_name, test_func in test_scenarios:
        user = RealisticUser(TEST_USERS[role_name.lower().replace(" ", "_")]["username"],
                            TEST_USERS[role_name.lower().replace(" ", "_")]["password"],
                            TEST_USERS[role_name.lower().replace(" ", "_")]["role"])
        try:
            results[role_name] = test_func(user)
        except Exception as e:
            print(f"\n❌ Error testing {role_name}: {str(e)}")
            results[role_name] = False
    
    # Print summary
    print("\n" + "="*80)
    print("📊 TEST RESULTS SUMMARY")
    print("="*80)
    
    for role, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {role}")
    
    print("\n" + "="*80)
    print(f"⏰ End Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)


if __name__ == "__main__":
    main()

