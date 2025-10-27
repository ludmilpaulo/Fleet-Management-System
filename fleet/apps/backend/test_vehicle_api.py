#!/usr/bin/env python
"""Test vehicle creation through API"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

# Login as companyadmin
login_response = requests.post(
    f"{BASE_URL}/account/login/",
    json={"username": "companyadmin", "password": "Test123!"}
)

if login_response.status_code == 200:
    token = login_response.json().get('token')
    print(f"Token: {token[:20]}...")
    
    # Try to create a vehicle
    vehicle_data = {
        "reg_number": "API-TEST-001",
        "make": "Ford",
        "model": "Transit",
        "year": 2024,
        "status": "ACTIVE",
        "mileage": 1000,
        "fuel_type": "DIESEL",
        "color": "White"
    }
    
    headers = {"Authorization": f"Token {token}", "Content-Type": "application/json"}
    
    response = requests.post(
        f"{BASE_URL}/fleet/vehicles",
        json=vehicle_data,
        headers=headers
    )
    
    print(f"\nStatus: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
    if response.status_code == 201 or response.status_code == 200:
        print("\n[SUCCESS] Vehicle created successfully!")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"\n[FAIL] Failed with status {response.status_code}")
        print(response.text[:1000])
else:
    print(f"Login failed: {login_response.status_code}")
    print(login_response.text)

