#!/usr/bin/env python
"""Fix and test vehicle creation"""
import os
import django
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from account.models import Company, User
from fleet_app.models import Vehicle
from fleet_app.serializers import VehicleCreateSerializer
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

print("Setting up test...")

# Get user
try:
    user = User.objects.get(username='companyadmin')
    print(f"User: {user.username}, Company: {user.company}")
except User.DoesNotExist:
    print("ERROR: User not found")
    sys.exit(1)

# Create request context
factory = APIRequestFactory()
req = factory.post('/api/fleet/vehicles/', {}, format='json')
req.user = user
drf_req = Request(req)

# Test data
vehicle_data = {
    "reg_number": "FIX-TEST-001",
    "make": "Ford",
    "model": "Transit",
    "year": 2024,
    "status": "ACTIVE",
    "mileage": 1000,
    "fuel_type": "DIESEL",
    "color": "White"
}

print("\nTesting serializer...")
serializer = VehicleCreateSerializer(data=vehicle_data, context={'request': drf_req})
print(f"Is valid: {serializer.is_valid()}")
if not serializer.is_valid():
    print(f"Errors: {serializer.errors}")
    sys.exit(1)

print("Saving vehicle...")
vehicle = serializer.save(org=user.company, created_by=user)
print(f"Vehicle created successfully: {vehicle}")
print(f"Vehicle ID: {vehicle.id}, Registration: {vehicle.reg_number}")

# Clean up
vehicle.delete()
print("\nTest vehicle cleaned up.")

print("\n[SUCCESS] All tests passed!")
