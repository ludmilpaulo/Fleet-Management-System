"""
Script to fix superuser company assignment and test login
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from account.models import User, Company

# Get or create default company for superusers
default_company, created = Company.objects.get_or_create(
    slug='admin-company',
    defaults={
        'name': 'Admin Company',
        'email': 'admin@fleetia.online',
        'subscription_plan': 'enterprise',
        'subscription_status': 'active',
        'is_active': True,
        'max_users': 1000,
        'max_vehicles': 10000,
    }
)

# Find the superuser
try:
    user = User.objects.get(username='ludmil')
    print(f"Found user: {user.username}")
    print(f"Current company: {user.company}")
    
    # Assign company if not set
    if not user.company:
        user.company = default_company
        user.save()
        print(f"Assigned company: {user.company.name}")
    
    # Create token for the user
    from rest_framework.authtoken.models import Token
    token, created = Token.objects.get_or_create(user=user)
    print(f"\nToken created: {token.key}")
    print(f"\nYou can now login with:")
    print(f"Username: {user.username}")
    print(f"Password: Maitland@2025")
    
except User.DoesNotExist:
    print("User 'ludmil' not found")
    print("\nCreating superuser...")
    
    # Create the superuser
    user = User.objects.create_superuser(
        username='ludmil',
        email='ludmil@fleetia.online',
        password='Maitland@2025',
        company=default_company,
        role=User.Role.ADMIN,
        is_staff=True,
        is_superuser=True,
    )
    
    # Create token
    from rest_framework.authtoken.models import Token
    token, created = Token.objects.get_or_create(user=user)
    print(f"\nSuperuser created successfully!")
    print(f"Token: {token.key}")
    print(f"\nLogin credentials:")
    print(f"Username: ludmil")
    print(f"Password: Maitland@2025")

print("\nList of all users:")
for u in User.objects.all():
    print(f"  - {u.username} ({u.email}) - Company: {u.company.name if u.company else 'None'}")

