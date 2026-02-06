"""
Django management command to create a platform admin user.
Usage: python manage.py create_platform_admin [username] [email] [password]
       python manage.py create_platform_admin platform_admin platform@fleetia.online Admin123!
"""
import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from account.models import Company
from platform_admin.models import PlatformAdmin
from rest_framework.authtoken.models import Token

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a platform admin user with full platform access'

    def add_arguments(self, parser):
        parser.add_argument(
            'username',
            nargs='?',
            default='platform_admin',
            help='Username for the platform admin (default: platform_admin)',
        )
        parser.add_argument(
            'email',
            nargs='?',
            default='platform@fleetia.online',
            help='Email for the platform admin',
        )
        parser.add_argument(
            'password',
            nargs='?',
            default='PlatformAdmin123!',
            help='Password for the platform admin',
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        # Get or create system company
        system_company, _ = Company.objects.get_or_create(
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

        # Create or update user
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': 'Platform',
                'last_name': 'Admin',
                'company': system_company,
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )

        if not created:
            user.is_superuser = True
            user.is_staff = True
            user.is_active = True
            user.company = system_company
            user.email = email
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.WARNING(f'Updated existing user: {username}'))
        else:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created user: {username}'))

        # Create or get PlatformAdmin record
        platform_admin, pa_created = PlatformAdmin.objects.get_or_create(
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
                    'system_administration',
                ],
            }
        )

        if not pa_created:
            platform_admin.is_super_admin = True
            platform_admin.permissions = [
                'manage_companies',
                'manage_subscriptions',
                'manage_users',
                'manage_settings',
                'view_analytics',
                'export_data',
                'system_administration',
            ]
            platform_admin.save()
            self.stdout.write(self.style.WARNING('Updated existing PlatformAdmin record'))
        else:
            self.stdout.write(self.style.SUCCESS('Created PlatformAdmin record'))

        # Create or get token
        token, _ = Token.objects.get_or_create(user=user)

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('PLATFORM ADMIN CREATED'))
        self.stdout.write('=' * 60)
        self.stdout.write(f'Username: {username}')
        self.stdout.write(f'Email:    {email}')
        self.stdout.write(f'Password: {password}')
        self.stdout.write(f'Token:   {token.key}')
        self.stdout.write('=' * 60)
        self.stdout.write('')
        self.stdout.write('This user can:')
        self.stdout.write('  - Access /platform-admin dashboard')
        self.stdout.write('  - Manage all companies')
        self.stdout.write('  - Manage subscriptions')
        self.stdout.write('  - View platform-wide analytics')
        self.stdout.write('  - Export data from any company')
