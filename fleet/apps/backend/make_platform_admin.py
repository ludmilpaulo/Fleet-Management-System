"""
Script to make 'ludmil' a platform admin who can manage all companies
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from account.models import User, Company
from platform_admin.models import PlatformAdmin
from rest_framework.authtoken.models import Token

# Get or create system company (platform admins don't need a company, but we'll create one for the system)
system_company, created = Company.objects.get_or_create(
    slug='system',
    defaults={
        'name': 'System',
        'email': 'system@fleetia.online',
        'subscription_plan': 'enterprise',
        'subscription_status': 'active',
        'is_active': True,
        'max_users': 10000,
        'max_vehicles': 100000,
    }
)

# Get or update the user 'ludmil'
try:
    user = User.objects.get(username='ludmil')
    print(f"Found user: {user.username}")
    
    # Make them a superuser
    user.is_superuser = True
    user.is_staff = True
    user.is_active = True
    
    # Assign system company
    user.company = system_company
    user.role = 'admin'
    
    # Set password
    user.set_password('Maitland@2025')
    user.save()
    print(f"Updated user: {user.username}")
    print(f"  - Is Superuser: {user.is_superuser}")
    print(f"  - Is Staff: {user.is_staff}")
    print(f"  - Company: {user.company.name}")
    print(f"  - Role: {user.role}")
    
except User.DoesNotExist:
    print("Creating platform admin user...")
    user = User.objects.create_superuser(
        username='ludmil',
        email='ludmil@fleetia.online',
        password='Maitland@2025',
        company=system_company,
        role='admin',
        is_staff=True,
        is_superuser=True,
    )
    print(f"Created user: {user.username}")

# Create or get PlatformAdmin record
platform_admin, created = PlatformAdmin.objects.get_or_create(
    user=user,
    defaults={
        'is_super_admin': True,
        'permissions': [
            'manage_companies',
            'manage_subscriptions',
            'manage_users',
            'manage_settings',
            'view_analytics',
            'export_data',
            'system_administration'
        ]
    }
)

if not created:
    # Update existing platform admin
    platform_admin.is_super_admin = True
    platform_admin.permissions = [
        'manage_companies',
        'manage_subscriptions',
        'manage_users',
        'manage_settings',
        'view_analytics',
        'export_data',
        'system_administration'
    ]
    platform_admin.save()

print(f"PlatformAdmin created: {platform_admin}")
print(f"  - Is Super Admin: {platform_admin.is_super_admin}")
print(f"  - Permissions: {platform_admin.permissions}")

# Create or get token
token, created = Token.objects.get_or_create(user=user)
print(f"\n{'Token created' if created else 'Token retrieved'}: {token.key}")

print("\n" + "="*60)
print("PLATFORM ADMIN LOGIN CREDENTIALS")
print("="*60)
print(f"Username: ludmil")
print(f"Password: Maitland@2025")
print(f"Token: {token.key}")
print(f"Role: Platform Super Admin")
print(f"Company: {user.company.name}")
print("="*60)

print("\nThis user can now:")
print("  - Manage all companies")
print("  - Create and update companies")
print("  - Manage subscriptions")
print("  - View platform-wide analytics")
print("  - Manage system settings")
print("  - Export data from any company")
print("  - Perform system administration tasks")

# Show count of companies
company_count = Company.objects.exclude(slug='system').exclude(slug='admin-company').count()
print(f"\nCurrent companies on platform: {company_count}")

if company_count > 0:
    print("\nExisting companies:")
    for company in Company.objects.exclude(slug='system').exclude(slug='admin-company')[:5]:
        users_count = company.users.count()
        print(f"  - {company.name} ({company.subscription_plan}) - {users_count} users")

