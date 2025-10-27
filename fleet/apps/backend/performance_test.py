#!/usr/bin/env python3
"""
Performance Testing for Fleet Management System
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

import time
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from account.models import Company
from fleet_app.models import Vehicle

User = get_user_model()

def measure_response_time(func, *args, **kwargs):
    """Measure response time of a function"""
    start = time.time()
    result = func(*args, **kwargs)
    elapsed = time.time() - start
    return result, elapsed

def performance_test():
    print("\n" + "="*80)
    print("PERFORMANCE TEST - FLEET MANAGEMENT SYSTEM")
    print("="*80 + "\n")
    
    client = APIClient()
    results = []
    
    # Login and authenticate
    print("[INFO] Authenticating...")
    response, elapsed = measure_response_time(
        client.post, '/api/account/login/', 
        {'username': 'test_admin', 'password': 'testpass123'}
    )
    print(f"[OK] Login time: {elapsed*1000:.2f}ms")
    
    if response.status_code != 200:
        print("[ERROR] Login failed")
        return
    
    token = response.data.get('token')
    client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
    
    # Test 1: List Vehicles
    print("\n[TEST 1] List Vehicles Endpoint")
    response, elapsed = measure_response_time(client.get, '/api/fleet/vehicles/')
    print(f"Status: {response.status_code}")
    print(f"Response Time: {elapsed*1000:.2f}ms")
    if elapsed < 0.2:
        print("[PASS] Fast response time")
        results.append(("List Vehicles", True))
    else:
        print("[FAIL] Slow response time")
        results.append(("List Vehicles", False))
    
    # Test 2: Get Profile
    print("\n[TEST 2] Get Profile Endpoint")
    response, elapsed = measure_response_time(client.get, '/api/account/profile/')
    print(f"Status: {response.status_code}")
    print(f"Response Time: {elapsed*1000:.2f}ms")
    if elapsed < 0.2:
        print("[PASS] Fast response time")
        results.append(("Get Profile", True))
    else:
        print("[FAIL] Slow response time")
        results.append(("Get Profile", False))
    
    # Test 3: List Shifts
    print("\n[TEST 3] List Shifts Endpoint")
    response, elapsed = measure_response_time(client.get, '/api/fleet/shifts/')
    print(f"Status: {response.status_code}")
    print(f"Response Time: {elapsed*1000:.2f}ms")
    if elapsed < 0.5:
        print("[PASS] Acceptable response time")
        results.append(("List Shifts", True))
    else:
        print("[WARN] Slow response time")
        results.append(("List Shifts", False))
    
    # Test 4: List Inspections
    print("\n[TEST 4] List Inspections Endpoint")
    response, elapsed = measure_response_time(client.get, '/api/inspections/inspections/')
    print(f"Status: {response.status_code}")
    print(f"Response Time: {elapsed*1000:.2f}ms")
    if elapsed < 0.5:
        print("[PASS] Acceptable response time")
        results.append(("List Inspections", True))
    else:
        print("[WARN] Slow response time")
        results.append(("List Inspections", False))
    
    # Summary
    print("\n" + "="*80)
    print("PERFORMANCE SUMMARY")
    print("="*80)
    
    for test_name, passed in results:
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status} {test_name}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\nTotal Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    print("="*80)

if __name__ == '__main__':
    performance_test()

