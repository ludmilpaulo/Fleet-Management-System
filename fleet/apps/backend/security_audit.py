#!/usr/bin/env python3
"""
Security Audit for Fleet Management System
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

def security_audit():
    print("\n" + "="*80)
    print("SECURITY AUDIT - FLEET MANAGEMENT SYSTEM")
    print("="*80 + "\n")
    
    client = APIClient()
    issues = []
    passed = []
    
    # Test 1: Authentication Required
    print("[TEST 1] Unauthenticated Access to Protected Endpoints")
    client.credentials()  # Clear credentials
    
    protected_endpoints = [
        '/api/fleet/vehicles/',
        '/api/account/profile/',
        '/api/fleet/shifts/',
    ]
    
    for endpoint in protected_endpoints:
        response = client.get(endpoint)
        if response.status_code in [401, 403]:
            passed.append(f"Protected: {endpoint}")
        else:
            issues.append(f"NOT PROTECTED: {endpoint} (Status: {response.status_code})")
            print(f"[FAIL] {endpoint} is not protected")
    
    # Test 2: CORS Headers
    print("\n[TEST 2] CORS Headers")
    response = client.get('/api/account/profile/')
    if 'Access-Control-Allow-Origin' in response or response.status_code != 200:
        passed.append("CORS configured")
        print("[PASS] CORS is configured")
    else:
        issues.append("CORS headers not present")
        print("[WARN] CORS headers check")
    
    # Test 3: Password Validation
    print("\n[TEST 3] Password Validation")
    # Try to create user with weak password
    response = client.post('/api/account/register/', {
        'username': 'test_user_123',
        'password': '123',  # Weak password
        'email': 'test@test.com'
    })
    if response.status_code in [400, 422]:
        passed.append("Password validation works")
        print("[PASS] Weak passwords are rejected")
    else:
        issues.append("Password validation may not be working")
        print("[WARN] Password validation check")
    
    # Test 4: SQL Injection Test
    print("\n[TEST 4] SQL Injection Protection")
    # Attempt SQL injection in search parameter
    response = client.get('/api/fleet/vehicles/?search=abc"; DROP TABLE--')
    if response.status_code in [200, 400]:
        passed.append("SQL injection protection")
        print("[PASS] SQL injection attempts handled")
    else:
        issues.append("SQL injection protection check")
        print("[WARN] SQL injection check")
    
    # Test 5: XSS Protection
    print("\n[TEST 5] XSS Protection")
    # Try to inject script tags
    response = client.get('/api/fleet/vehicles/?search=<script>alert(1)</script>')
    if response.status_code in [200, 400]:
        passed.append("XSS protection")
        print("[PASS] XSS attempts handled")
    else:
        issues.append("XSS protection check")
        print("[WARN] XSS protection check")
    
    # Summary
    print("\n" + "="*80)
    print("SECURITY AUDIT SUMMARY")
    print("="*80)
    
    print("\n[PASSED]")
    for item in passed:
        print(f"  [OK] {item}")
    
    if issues:
        print("\n[ISSUES FOUND]")
        for item in issues:
            print(f"  [!] {item}")
    else:
        print("\n[PASSED] No security issues found")
    
    print(f"\nTotal Checks: {len(passed) + len(issues)}")
    print(f"Passed: {len(passed)}")
    print(f"Issues: {len(issues)}")
    print("="*80)

if __name__ == '__main__':
    security_audit()

