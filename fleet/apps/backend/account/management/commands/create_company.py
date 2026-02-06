"""
Django management command to create a company account.
Usage: python manage.py create_company [name] [email] [slug]
       python manage.py create_company "Acme Fleet" admin@acmefleet.com acme-fleet
       python manage.py create_company "Demo Company" demo@example.com demo --plan basic
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from account.models import Company


class Command(BaseCommand):
    help = 'Create a company account for the fleet management system'

    def add_arguments(self, parser):
        parser.add_argument(
            'name',
            nargs='?',
            default='Demo Company',
            help='Company name (default: Demo Company)',
        )
        parser.add_argument(
            'email',
            nargs='?',
            default='admin@demo.com',
            help='Company email (default: admin@demo.com)',
        )
        parser.add_argument(
            'slug',
            nargs='?',
            default=None,
            help='URL-friendly slug (default: auto-generated from name)',
        )
        parser.add_argument(
            '--plan',
            choices=['trial', 'basic', 'professional', 'enterprise'],
            default='trial',
            help='Subscription plan (default: trial)',
        )
        parser.add_argument(
            '--max-users',
            type=int,
            default=50,
            help='Maximum users (default: 50)',
        )
        parser.add_argument(
            '--max-vehicles',
            type=int,
            default=100,
            help='Maximum vehicles (default: 100)',
        )
        parser.add_argument(
            '--active',
            action='store_true',
            default=True,
            help='Set company as active (default: True)',
        )
        parser.add_argument(
            '--inactive',
            action='store_true',
            help='Set company as inactive',
        )

    def handle(self, *args, **options):
        name = options['name']
        email = options['email']
        slug = options['slug'] or name.lower().replace(' ', '-').replace('_', '-')
        plan = options['plan']
        max_users = options['max_users']
        max_vehicles = options['max_vehicles']
        is_active = not options['inactive'] and options['active']

        # Ensure slug is unique
        base_slug = slug
        counter = 1
        while Company.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        # Trial gets 1-week trial period
        trial_ends_at = timezone.now() + timedelta(days=7) if plan == 'trial' else None

        company, created = Company.objects.get_or_create(
            slug=slug,
            defaults={
                'name': name,
                'email': email,
                'subscription_plan': plan,
                'subscription_status': 'trial' if plan == 'trial' else 'active',
                'is_active': is_active,
                'trial_ends_at': trial_ends_at,
                'max_users': max_users,
                'max_vehicles': max_vehicles,
            }
        )

        if not created:
            company.name = name
            company.email = email
            company.subscription_plan = plan
            company.max_users = max_users
            company.max_vehicles = max_vehicles
            company.is_active = is_active
            company.save()
            self.stdout.write(self.style.WARNING(f'Updated existing company: {company.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Created company: {company.name}'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(self.style.SUCCESS('COMPANY ACCOUNT'))
        self.stdout.write('=' * 50)
        self.stdout.write(f'Name:     {company.name}')
        self.stdout.write(f'Slug:     {company.slug}')
        self.stdout.write(f'Email:    {company.email}')
        self.stdout.write(f'Plan:     {company.subscription_plan}')
        self.stdout.write(f'Status:   {company.subscription_status}')
        self.stdout.write(f'Active:   {company.is_active}')
        if company.trial_ends_at:
            self.stdout.write(f'Trial ends: {company.trial_ends_at.strftime("%Y-%m-%d %H:%M")}')
        self.stdout.write('=' * 50)
        self.stdout.write('')
        self.stdout.write('Users can sign up at /auth/signup using company slug: ' + company.slug)
