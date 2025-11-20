"""
Management command to seed test data for Fleet Management System
Usage: python manage.py seed_test_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from account.models import Company
from fleet_app.models import Vehicle, Shift
from issues.models import Issue
from tickets.models import Ticket
from inspections.models import Inspection

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed test data for Fleet Management System'

    def add_arguments(self, parser):
        parser.add_argument(
            '--company',
            type=str,
            help='Company slug to seed data for (default: creates new test company)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing test data before seeding',
        )

    def handle(self, *args, **options):
        company_slug = options.get('company')
        clear_existing = options.get('clear', False)

        self.stdout.write(self.style.SUCCESS('Starting test data seeding...'))

        # Get or create company
        if company_slug:
            try:
                company = Company.objects.get(slug=company_slug)
                self.stdout.write(self.style.SUCCESS(f'Using existing company: {company.name}'))
            except Company.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Company with slug "{company_slug}" not found'))
                return
        else:
            company, created = Company.objects.get_or_create(
                slug='test-company',
                defaults={
                    'name': 'Test Fleet Company',
                    'email': 'test@fleetcompany.com',
                    'phone': '+1234567890',
                    'subscription_plan': 'professional',
                    'max_users': 50,
                    'max_vehicles': 100,
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created test company: {company.name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Using existing company: {company.name}'))

        # Clear existing data if requested
        if clear_existing:
            self.stdout.write(self.style.WARNING('Clearing existing test data...'))
            # Clear data but keep company
            Inspection.objects.filter(shift__vehicle__org=company).delete()
            Ticket.objects.filter(issue__vehicle__org=company).delete()
            Issue.objects.filter(vehicle__org=company).delete()
            Shift.objects.filter(vehicle__org=company).delete()
            Vehicle.objects.filter(org=company).delete()
            User.objects.filter(company=company).exclude(role='admin').delete()

        # Create test users
        self.stdout.write(self.style.SUCCESS('Creating test users...'))
        
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@testcompany.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'company': company,
                'is_active': True,
            }
        )
        if not admin_user.password:
            admin_user.set_password('admin123')
            admin_user.save()

        # Create drivers
        drivers = []
        for i in range(1, 6):
            driver, created = User.objects.get_or_create(
                username=f'driver{i}',
                defaults={
                    'email': f'driver{i}@testcompany.com',
                    'first_name': f'Driver',
                    'last_name': f'{i}',
                    'role': 'driver',
                    'company': company,
                    'phone_number': f'+123456789{i}',
                    'employee_id': f'DRV{i:03d}',
                    'is_active': True,
                }
            )
            if created:
                driver.set_password('driver123')
                driver.save()
            drivers.append(driver)

        # Create staff
        staff_users = []
        for i in range(1, 4):
            staff, created = User.objects.get_or_create(
                username=f'staff{i}',
                defaults={
                    'email': f'staff{i}@testcompany.com',
                    'first_name': f'Staff',
                    'last_name': f'{i}',
                    'role': 'staff',
                    'company': company,
                    'phone_number': f'+123456788{i}',
                    'employee_id': f'STF{i:03d}',
                    'department': 'Operations',
                    'is_active': True,
                }
            )
            if created:
                staff.set_password('staff123')
                staff.save()
            staff_users.append(staff)

        # Create inspectors
        inspectors = []
        for i in range(1, 3):
            inspector, created = User.objects.get_or_create(
                username=f'inspector{i}',
                defaults={
                    'email': f'inspector{i}@testcompany.com',
                    'first_name': f'Inspector',
                    'last_name': f'{i}',
                    'role': 'inspector',
                    'company': company,
                    'phone_number': f'+123456787{i}',
                    'employee_id': f'INS{i:03d}',
                    'department': 'Quality Assurance',
                    'is_active': True,
                }
            )
            if created:
                inspector.set_password('inspector123')
                inspector.save()
            inspectors.append(inspector)

        self.stdout.write(self.style.SUCCESS(f'Created {len(drivers)} drivers, {len(staff_users)} staff, {len(inspectors)} inspectors'))

        # Create vehicles
        self.stdout.write(self.style.SUCCESS('Creating vehicles...'))
        vehicles = []
        vehicle_makes = ['Toyota', 'Ford', 'Mercedes', 'Volvo', 'Isuzu']
        vehicle_models = ['Hiace', 'Transit', 'Sprinter', 'FH16', 'NPR']
        colors = ['White', 'Blue', 'Red', 'Silver', 'Black']
        statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'MAINTENANCE', 'INACTIVE']

        for i in range(1, 11):
            vehicle, created = Vehicle.objects.get_or_create(
                org=company,
                reg_number=f'TEST-{i:03d}',
                defaults={
                    'vin': f'VIN{i:010d}',
                    'make': vehicle_makes[(i-1) % len(vehicle_makes)],
                    'model': vehicle_models[(i-1) % len(vehicle_models)],
                    'year': 2020 + (i % 5),
                    'color': colors[(i-1) % len(colors)],
                    'status': statuses[(i-1) % len(statuses)],
                    'mileage': 10000 + (i * 5000),
                    'fuel_type': 'DIESEL' if i % 2 == 0 else 'PETROL',
                    'engine_size': f'{2.0 + (i % 2)}L',
                    'transmission': 'AUTOMATIC' if i % 3 == 0 else 'MANUAL',
                    'created_by': admin_user,
                }
            )
            vehicles.append(vehicle)

        self.stdout.write(self.style.SUCCESS(f'Created {len(vehicles)} vehicles'))

        # Create shifts
        self.stdout.write(self.style.SUCCESS('Creating shifts...'))
        shifts = []
        now = timezone.now()
        
        for i in range(10):
            driver = drivers[i % len(drivers)]
            vehicle = vehicles[i % len(vehicles)]
            start_at = now - timedelta(days=i, hours=8 + (i % 8))
            end_at = start_at + timedelta(hours=8) if i % 3 == 0 else None
            
            shift_status = 'COMPLETED' if end_at else 'ACTIVE'
            
            shift, created = Shift.objects.get_or_create(
                vehicle=vehicle,
                driver=driver,
                start_at=start_at,
                defaults={
                    'end_at': end_at,
                    'status': shift_status,
                    'start_lat': -26.2041 + (i * 0.01),
                    'start_lng': 28.0473 + (i * 0.01),
                    'start_address': f'{100 + i} Test Street, Johannesburg, South Africa',
                    'end_lat': -26.2041 + (i * 0.01) + 0.05 if end_at else None,
                    'end_lng': 28.0473 + (i * 0.01) + 0.05 if end_at else None,
                    'end_address': f'{200 + i} Test Avenue, Johannesburg, South Africa' if end_at else '',
                    'notes': f'Test shift {i+1}',
                }
            )
            shifts.append(shift)

        self.stdout.write(self.style.SUCCESS(f'Created {len(shifts)} shifts'))

        # Create issues
        self.stdout.write(self.style.SUCCESS('Creating issues...'))
        issues = []
        issue_categories = ['MECHANICAL', 'ELECTRICAL', 'BODY', 'TYRE', 'OTHER']
        severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        
        for i in range(15):
            vehicle = vehicles[i % len(vehicles)]
            category = issue_categories[i % len(issue_categories)]
            severity = severities[i % len(severities)]
            reported_at = now - timedelta(days=i % 7)
            
            issue, created = Issue.objects.get_or_create(
                vehicle=vehicle,
                title=f'Test Issue {i+1}',
                defaults={
                    'description': f'Description for test issue {i+1}',
                    'category': category,
                    'severity': severity,
                    'status': 'OPEN' if i % 3 == 0 else 'IN_PROGRESS',
                    'reported_by': drivers[i % len(drivers)],
                    'reported_at': reported_at,
                    'resolved_at': None if i % 3 == 0 else reported_at + timedelta(days=2),
                }
            )
            issues.append(issue)

        self.stdout.write(self.style.SUCCESS(f'Created {len(issues)} issues'))

        # Create tickets
        self.stdout.write(self.style.SUCCESS('Creating tickets...'))
        tickets = []
        ticket_types = ['REPAIR', 'MAINTENANCE', 'INSPECTION', 'CLEANING']
        priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
        statuses_ticket = ['OPEN', 'IN_PROGRESS', 'PENDING_PARTS', 'COMPLETED']
        
        for i, issue in enumerate(issues[:10]):
            ticket_type = ticket_types[i % len(ticket_types)]
            priority = priorities[i % len(priorities)]
            status = statuses_ticket[i % len(statuses_ticket)]
            due_at = now + timedelta(days=3 + i)
            
            ticket, created = Ticket.objects.get_or_create(
                issue=issue,
                defaults={
                    'title': f'Ticket for {issue.title}',
                    'description': f'Maintenance ticket for {issue.description}',
                    'type': ticket_type,
                    'priority': priority,
                    'status': status,
                    'assignee': staff_users[i % len(staff_users)] if status != 'OPEN' else None,
                    'created_by': admin_user,
                    'due_at': due_at,
                    'estimated_cost': 1000 + (i * 100),
                    'currency': 'ZAR',
                }
            )
            tickets.append(ticket)

        self.stdout.write(self.style.SUCCESS(f'Created {len(tickets)} tickets'))

        # Create inspections
        self.stdout.write(self.style.SUCCESS('Creating inspections...'))
        inspections = []
        
        for i, shift in enumerate(shifts[:8]):
            inspection_type = 'START' if i % 2 == 0 else 'END'
            status = 'PASS' if i % 3 != 0 else 'FAIL'
            
            inspection, created = Inspection.objects.get_or_create(
                shift=shift,
                type=inspection_type,
                defaults={
                    'status': status,
                    'notes': f'Test {inspection_type.lower()} inspection',
                    'weather_conditions': 'Clear' if i % 2 == 0 else 'Cloudy',
                    'temperature': 20 + (i % 5),
                    'lat': shift.start_lat,
                    'lng': shift.start_lng,
                    'address': shift.start_address,
                    'created_by': inspectors[i % len(inspectors)],
                    'completed_at': shift.start_at + timedelta(minutes=30) if status == 'PASS' else None,
                }
            )
            inspections.append(inspection)

        self.stdout.write(self.style.SUCCESS(f'Created {len(inspections)} inspections'))

        # Summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('Test Data Seeding Complete!'))
        self.stdout.write(self.style.SUCCESS('='*50))
        self.stdout.write(self.style.SUCCESS(f'\nCompany: {company.name} ({company.slug})'))
        self.stdout.write(self.style.SUCCESS(f'\nTest Users Created:'))
        self.stdout.write(self.style.SUCCESS(f'  - Admin: admin / admin123'))
        self.stdout.write(self.style.SUCCESS(f'  - Drivers: driver1-driver5 / driver123'))
        self.stdout.write(self.style.SUCCESS(f'  - Staff: staff1-staff3 / staff123'))
        self.stdout.write(self.style.SUCCESS(f'  - Inspectors: inspector1-inspector2 / inspector123'))
        self.stdout.write(self.style.SUCCESS(f'\nTest Data Created:'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(vehicles)} Vehicles'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(shifts)} Shifts'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(issues)} Issues'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(tickets)} Tickets'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(inspections)} Inspections'))
        self.stdout.write(self.style.SUCCESS('\nYou can now test the application with this data!'))

