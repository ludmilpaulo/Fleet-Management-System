#!/usr/bin/env python3
"""
Create test users for each role in the Fleet Management System
"""
import os
import sys
import django

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'fleet/apps/backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from account.models import Company
from rest_framework.authtoken.models import Token
from datetime import date

User = get_user_model()

# Test users to create
TEST_USERS = [
    {
        "username": "platform_admin",
        "email": "admin@fleetia.online",
        "password": "Test@123456",
        "role": "admin",
        "is_superuser": True,
        "is_staff": True,
        "first_name": "Platform",
        "last_name": "Admin",
    },
    {
        "username": "company_admin",
        "email": "company@fleetia.online",
        "password": "Test@123456",
        "role": "admin",
        "is_staff": True,
        "first_name": "Company",
        "last_name": "Admin",
    },
    {
        "username": "staff_user",
        "email": "staff@fleetia.online",
        "password": "Test@123456",
        "role": "staff",
        "first_name": "Staff",
        "last_name": "User",
    },
    {
        "username": "driver_user",
        "email": "driver@fleetia.online",
        "password": "Test@123456",
        "role": "driver",
        "first_name": "Driver",
        "last_name": "User",
    },
    {
        "username": "inspector_user",
        "email": "inspector@fleetia.online",
        "password": "Test@123456",
        "role": "inspector",
        "first_name": "Inspector",
        "last_name": "User",
    },
]

def create_test_company():
    """Create a test company"""
    company, created = Company.objects.get_or_create(
        slug="test-company",
        defaults={
            "name": "Test Company",
            "email": "test@company.com",
            "subscription_plan": "professional",
            "max_users": 50,
            "max_vehicles": 100,
            "is_active": True,
        }
    )
    return company

def create_users():
    """Create all test users"""
    print("\n" + "="*60)
    print("👥 Creating Test Users for Fleet Management System")
    print("="*60 + "\n")
    
    # Create test company
    company = create_test_company()
    print(f"✅ Company: {company.name} (Slug: {company.slug})")
    
    created_count = 0
    updated_count = 0
    
    for user_data in TEST_USERS:
        username = user_data["username"]
        password = user_data.pop("password")
        role = user_data.pop("role")
        
        # Check if user exists
        user, created = User.objects.get_or_create(
            username=username,
            defaults=user_data
        )
        
        if created:
            print(f"✅ Created: {username} (Role: {role})")
            created_count += 1
        else:
            print(f"⚠️  Exists: {username} (Role: {role}) - Updating")
            for key, value in user_data.items():
                setattr(user, key, value)
            updated_count += 1
        
        # Set role and company (except for platform admin)
        user.role = role
        if user.username != "platform_admin":
            user.company = company
        user.set_password(password)
        user.save()
        
        # Create API token
        token, _ = Token.objects.get_or_create(user=user)
        print(f"   Token: {token.key[:20]}...")
    
    print(f"\n✅ Summary:")
    print(f"   Created: {created_count} users")
    print(f"   Updated: {updated_count} users")
    print(f"   Company: {company.name}")
    print("\n" + "="*60)
    print("🎯 Test users ready!")
    print("\nLogin credentials:")
    for user_data in TEST_USERS:
        print(f"   {user_data['username']} / Test@123456 (Role: {user_data.get('role', 'N/A')})")
    print("="*60 + "\n")

if __name__ == "__main__":
    create_users()

