#!/usr/bin/env python3
"""
Production Data Setup for Fleet Management System
Creates comprehensive real-world data for production testing
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Add the backend directory to the Python path
sys.path.append('/Users/ludmil/Desktop/Apps/Fleet-Management-System/fleet/apps/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from account.models import Company
from fleet_app.models import Vehicle, KeyTracker, Shift

User = get_user_model()

# Real-world company data
REAL_COMPANIES = [
    {
        'name': 'Metro Transit Authority',
        'slug': 'metro-transit-authority',
        'description': 'Public transportation authority serving the metropolitan area with bus, rail, and paratransit services.',
        'email': 'admin@metrotransit.gov',
        'phone': '+1-555-METRO-1',
        'website': 'https://metrotransit.gov',
        'address_line1': '1234 Transit Plaza',
        'city': 'Metro City',
        'state': 'CA',
        'postal_code': '90210',
        'country': 'United States',
        'primary_color': '#1e40af',
        'secondary_color': '#e0f2fe',
        'max_users': 500,
        'max_vehicles': 1000,
        'subscription_plan': 'enterprise',
        'subscription_status': 'active',
        'is_active': True,
    },
    {
        'name': 'Swift Delivery Services',
        'slug': 'swift-delivery-services',
        'description': 'Regional logistics and delivery company specializing in same-day and next-day delivery services.',
        'email': 'operations@swiftdelivery.com',
        'phone': '+1-555-SWIFT-1',
        'website': 'https://swiftdelivery.com',
        'address_line1': '5678 Logistics Lane',
        'city': 'Commerce City',
        'state': 'TX',
        'postal_code': '75001',
        'country': 'United States',
        'primary_color': '#dc2626',
        'secondary_color': '#fef2f2',
        'max_users': 200,
        'max_vehicles': 400,
        'subscription_plan': 'professional',
        'subscription_status': 'active',
        'is_active': True,
    },
    {
        'name': 'Green Earth Transportation',
        'slug': 'green-earth-transportation',
        'description': 'Eco-friendly transportation company focusing on electric and hybrid vehicles for corporate clients.',
        'email': 'info@greenearthtrans.com',
        'phone': '+1-555-GREEN-1',
        'website': 'https://greenearthtrans.com',
        'address_line1': '9876 Eco Drive',
        'city': 'Portland',
        'state': 'OR',
        'postal_code': '97201',
        'country': 'United States',
        'primary_color': '#16a34a',
        'secondary_color': '#f0fdf4',
        'max_users': 100,
        'max_vehicles': 150,
        'subscription_plan': 'professional',
        'subscription_status': 'active',
        'is_active': True,
    },
    {
        'name': 'Premier Fleet Solutions',
        'slug': 'premier-fleet-solutions',
        'description': 'Full-service fleet management company providing vehicles, maintenance, and logistics support.',
        'email': 'contact@premierfleet.com',
        'phone': '+1-555-PREMIER',
        'website': 'https://premierfleet.com',
        'address_line1': '2468 Fleet Boulevard',
        'city': 'Atlanta',
        'state': 'GA',
        'postal_code': '30309',
        'country': 'United States',
        'primary_color': '#7c3aed',
        'secondary_color': '#faf5ff',
        'max_users': 300,
        'max_vehicles': 600,
        'subscription_plan': 'enterprise',
        'subscription_status': 'active',
        'is_active': True,
    },
    {
        'name': 'Urban Mobility Co.',
        'slug': 'urban-mobility-co',
        'description': 'Innovative urban mobility solutions including ride-sharing, car-sharing, and micro-mobility services.',
        'email': 'hello@urbanmobility.co',
        'phone': '+1-555-URBAN-1',
        'website': 'https://urbanmobility.co',
        'address_line1': '1357 Innovation Street',
        'city': 'Austin',
        'state': 'TX',
        'postal_code': '78701',
        'country': 'United States',
        'primary_color': '#ea580c',
        'secondary_color': '#fff7ed',
        'max_users': 150,
        'max_vehicles': 250,
        'subscription_plan': 'professional',
        'subscription_status': 'trial',
        'is_active': True,
        'trial_ends_at': datetime.now() + timedelta(days=10)
    }
]

# Real-world user data by company
REAL_USERS = {
    'Metro Transit Authority': [
        # Admin users
        {
            'username': 'metro_admin',
            'email': 'admin@metrotransit.gov',
            'password': 'MetroAdmin2024!',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'role': 'admin',
            'phone_number': '+1-555-0101',
            'employee_id': 'MTA-ADM-001',
            'department': 'Administration',
            'hire_date': '2020-01-15',
            'is_active': True,
            'is_staff': True,
            'is_superuser': True
        },
        # Staff users
        {
            'username': 'metro_fleet_manager',
            'email': 'fleet@metrotransit.gov',
            'password': 'MetroFleet2024!',
            'first_name': 'Michael',
            'last_name': 'Rodriguez',
            'role': 'staff',
            'phone_number': '+1-555-0102',
            'employee_id': 'MTA-STF-001',
            'department': 'Fleet Operations',
            'hire_date': '2021-03-10',
            'is_active': True,
            'is_staff': True
        },
        {
            'username': 'metro_hr_manager',
            'email': 'hr@metrotransit.gov',
            'password': 'MetroHR2024!',
            'first_name': 'Jennifer',
            'last_name': 'Chen',
            'role': 'staff',
            'phone_number': '+1-555-0103',
            'employee_id': 'MTA-STF-002',
            'department': 'Human Resources',
            'hire_date': '2020-08-20',
            'is_active': True,
            'is_staff': True
        },
        # Driver users
        {
            'username': 'metro_driver_001',
            'email': 'driver001@metrotransit.gov',
            'password': 'MetroDriver2024!',
            'first_name': 'James',
            'last_name': 'Wilson',
            'role': 'driver',
            'phone_number': '+1-555-0201',
            'employee_id': 'MTA-DRV-001',
            'department': 'Bus Operations',
            'hire_date': '2022-01-05',
            'is_active': True
        },
        {
            'username': 'metro_driver_002',
            'email': 'driver002@metrotransit.gov',
            'password': 'MetroDriver2024!',
            'first_name': 'Maria',
            'last_name': 'Garcia',
            'role': 'driver',
            'phone_number': '+1-555-0202',
            'employee_id': 'MTA-DRV-002',
            'department': 'Rail Operations',
            'hire_date': '2021-11-15',
            'is_active': True
        },
        # Inspector users
        {
            'username': 'metro_inspector_001',
            'email': 'inspector001@metrotransit.gov',
            'password': 'MetroInspector2024!',
            'first_name': 'David',
            'last_name': 'Thompson',
            'role': 'inspector',
            'phone_number': '+1-555-0301',
            'employee_id': 'MTA-INS-001',
            'department': 'Safety & Compliance',
            'hire_date': '2020-05-12',
            'is_active': True
        }
    ],
    'Swift Delivery Services': [
        # Admin users
        {
            'username': 'swift_admin',
            'email': 'admin@swiftdelivery.com',
            'password': 'SwiftAdmin2024!',
            'first_name': 'Robert',
            'last_name': 'Anderson',
            'role': 'admin',
            'phone_number': '+1-555-1001',
            'employee_id': 'SDS-ADM-001',
            'department': 'Executive',
            'hire_date': '2019-06-01',
            'is_active': True,
            'is_staff': True,
            'is_superuser': True
        },
        # Staff users
        {
            'username': 'swift_operations',
            'email': 'ops@swiftdelivery.com',
            'password': 'SwiftOps2024!',
            'first_name': 'Lisa',
            'last_name': 'Martinez',
            'role': 'staff',
            'phone_number': '+1-555-1002',
            'employee_id': 'SDS-STF-001',
            'department': 'Operations',
            'hire_date': '2020-02-14',
            'is_active': True,
            'is_staff': True
        },
        # Driver users
        {
            'username': 'swift_driver_001',
            'email': 'driver001@swiftdelivery.com',
            'password': 'SwiftDriver2024!',
            'first_name': 'Kevin',
            'last_name': 'Brown',
            'role': 'driver',
            'phone_number': '+1-555-2001',
            'employee_id': 'SDS-DRV-001',
            'department': 'Delivery',
            'hire_date': '2021-04-08',
            'is_active': True
        },
        {
            'username': 'swift_driver_002',
            'email': 'driver002@swiftdelivery.com',
            'password': 'SwiftDriver2024!',
            'first_name': 'Amanda',
            'last_name': 'Davis',
            'role': 'driver',
            'phone_number': '+1-555-2002',
            'employee_id': 'SDS-DRV-002',
            'department': 'Delivery',
            'hire_date': '2021-07-22',
            'is_active': True
        },
        # Inspector users
        {
            'username': 'swift_inspector_001',
            'email': 'inspector001@swiftdelivery.com',
            'password': 'SwiftInspector2024!',
            'first_name': 'Christopher',
            'last_name': 'Lee',
            'role': 'inspector',
            'phone_number': '+1-555-3001',
            'employee_id': 'SDS-INS-001',
            'department': 'Vehicle Maintenance',
            'hire_date': '2020-09-30',
            'is_active': True
        }
    ],
    'Green Earth Transportation': [
        # Admin users
        {
            'username': 'green_admin',
            'email': 'admin@greenearthtrans.com',
            'password': 'GreenAdmin2024!',
            'first_name': 'Emma',
            'last_name': 'Taylor',
            'role': 'admin',
            'phone_number': '+1-555-4001',
            'employee_id': 'GET-ADM-001',
            'department': 'Management',
            'hire_date': '2021-01-10',
            'is_active': True,
            'is_staff': True,
            'is_superuser': True
        },
        # Staff users
        {
            'username': 'green_fleet_coordinator',
            'email': 'fleet@greenearthtrans.com',
            'password': 'GreenFleet2024!',
            'first_name': 'Ryan',
            'last_name': 'White',
            'role': 'staff',
            'phone_number': '+1-555-4002',
            'employee_id': 'GET-STF-001',
            'department': 'Fleet Management',
            'hire_date': '2021-06-15',
            'is_active': True,
            'is_staff': True
        },
        # Driver users
        {
            'username': 'green_driver_001',
            'email': 'driver001@greenearthtrans.com',
            'password': 'GreenDriver2024!',
            'first_name': 'Sophie',
            'last_name': 'Miller',
            'role': 'driver',
            'phone_number': '+1-555-5001',
            'employee_id': 'GET-DRV-001',
            'department': 'Corporate Transportation',
            'hire_date': '2022-02-28',
            'is_active': True
        },
        # Inspector users
        {
            'username': 'green_inspector_001',
            'email': 'inspector001@greenearthtrans.com',
            'password': 'GreenInspector2024!',
            'first_name': 'Alex',
            'last_name': 'Johnson',
            'role': 'inspector',
            'phone_number': '+1-555-6001',
            'employee_id': 'GET-INS-001',
            'department': 'Environmental Compliance',
            'hire_date': '2021-10-12',
            'is_active': True
        }
    ]
}

# Real-world vehicle data by company
REAL_VEHICLES = {
    'Metro Transit Authority': [
        # Buses
        {
            'reg_number': 'MTA-001',
            'make': 'New Flyer',
            'model': 'Xcelsior',
            'year': 2023,
            'color': 'Blue & White',
            'mileage': 45000,
            'fuel_type': 'DIESEL',
            'engine_size': '6.7L',
            'transmission': 'AUTOMATIC',
            'status': 'ACTIVE',
            'vin': '1NF6X6X05NG123456'
        },
        {
            'reg_number': 'MTA-002',
            'make': 'Gillig',
            'model': 'Low Floor',
            'year': 2022,
            'color': 'Blue & White',
            'mileage': 67000,
            'fuel_type': 'DIESEL',
            'engine_size': '8.9L',
            'transmission': 'AUTOMATIC',
            'status': 'ACTIVE',
            'vin': '1G1G5X5X05NG234567'
        },
        {
            'reg_number': 'MTA-003',
            'make': 'Proterra',
            'model': 'Catalyst',
            'year': 2024,
            'color': 'Blue & White',
            'mileage': 12000,
            'fuel_type': 'ELECTRIC',
            'engine_size': 'Electric',
            'transmission': 'AUTOMATIC',
            'status': 'ACTIVE',
            'vin': '1P1R5X5X05NG345678'
        },
        # Rail vehicles
        {
            'reg_number': 'MTA-R001',
            'make': 'Siemens',
            'model': 'S700',
            'year': 2023,
            'color': 'Blue & Silver',
            'mileage': 89000,
            'fuel_type': 'ELECTRIC',
            'engine_size': 'Electric',
            'transmission': 'AUTOMATIC',
            'status': 'ACTIVE',
            'vin': '1S1E5X5X05NG456789'
        }
    ],
    'Swift Delivery Services': [
        # Delivery vans
        {
            'reg_number': 'SDS-001',
            'make': 'Ford',
            'model': 'Transit',
            'year': 2023,
            'color': 'Red',
            'mileage': 38000,
            'fuel_type': 'DIESEL',
            'engine_size': '2.0L',
            'transmission': 'AUTOMATIC',
            'status': 'ACTIVE',
            'vin': '1FT6X6X05NG567890'
        },
        {
            'reg_number': 'SDS-002',
            'make': 'Mercedes',
            'model': 'Sprinter',
            'year': 2022,
            'color': 'Red',
            'mileage': 55000,
            'fuel_type': 'DIESEL',
            'engine_size': '2.1L',
            'transmission': 'AUTOMATIC',
            'status': 'ACTIVE',
            'vin': '1M1E5X5X05NG678901'
        },
        {
            'reg_number': 'SDS-003',
            'make': 'Ram',
            'model': 'ProMaster',
            'year': 2023,
            'color': 'Red',
            'mileage': 42000,
            'fuel_type': 'DIESEL',
            'engine_size': '3.6L',
            'transmission': 'AUTOMATIC',
            'status': 'MAINTENANCE',
            'vin': '1R1A5X5X05NG789012'
        }
    ],
    'Green Earth Transportation': [
        # Electric vehicles
        {
            'reg_number': 'GET-001',
            'make': 'Tesla',
            'model': 'Model S',
            'year': 2023,
            'color': 'White',
            'mileage': 25000,
            'fuel_type': 'ELECTRIC',
            'engine_size': 'Electric',
            'transmission': 'AUTOMATIC',
            'status': 'ACTIVE',
            'vin': '1T1E5X5X05NG890123'
        },
        {
            'reg_number': 'GET-002',
            'make': 'BMW',
            'model': 'iX',
            'year': 2024,
            'color': 'Silver',
            'mileage': 8000,
            'fuel_type': 'ELECTRIC',
            'engine_size': 'Electric',
            'transmission': 'AUTOMATIC',
            'status': 'ACTIVE',
            'vin': '1B1M5X5X05NG901234'
        },
        {
            'reg_number': 'GET-003',
            'make': 'Toyota',
            'model': 'Prius',
            'year': 2023,
            'color': 'Green',
            'mileage': 31000,
            'fuel_type': 'HYBRID',
            'engine_size': '1.8L',
            'transmission': 'AUTOMATIC',
            'status': 'ACTIVE',
            'vin': '1T1O5X5X05NG012345'
        }
    ]
}

def create_real_companies():
    """Create real-world companies"""
    created_companies = []
    
    for company_data in REAL_COMPANIES:
        company, created = Company.objects.get_or_create(
            name=company_data['name'],
            defaults=company_data
        )
        
        if created:
            print(f"✅ Created company: {company.name}")
        else:
            print(f"ℹ️ Company already exists: {company.name}")
        
        created_companies.append(company)
    
    return created_companies

def create_real_users(companies):
    """Create real-world users for each company"""
    created_users = []
    
    for company in companies:
        if company.name in REAL_USERS:
            print(f"\n👥 Creating users for {company.name}...")
            
            for user_data in REAL_USERS[company.name]:
                user, created = User.objects.get_or_create(
                    username=user_data['username'],
                    defaults={
                        'email': user_data['email'],
                        'first_name': user_data['first_name'],
                        'last_name': user_data['last_name'],
                        'role': user_data['role'],
                        'phone_number': user_data['phone_number'],
                        'employee_id': user_data['employee_id'],
                        'department': user_data['department'],
                        'hire_date': user_data['hire_date'],
                        'company': company,
                        'is_active': user_data['is_active'],
                        'is_staff': user_data.get('is_staff', False),
                        'is_superuser': user_data.get('is_superuser', False)
                    }
                )
                
                if created:
                    user.set_password(user_data['password'])
                    user.save()
                    print(f"  ✅ Created user: {user.username} ({user.role})")
                else:
                    print(f"  ℹ️ User already exists: {user.username} ({user.role})")
                
                created_users.append(user)
    
    return created_users

def create_real_vehicles(companies):
    """Create real-world vehicles for each company"""
    created_vehicles = []
    
    for company in companies:
        if company.name in REAL_VEHICLES:
            print(f"\n🚗 Creating vehicles for {company.name}...")
            
            for vehicle_data in REAL_VEHICLES[company.name]:
                vehicle, created = Vehicle.objects.get_or_create(
                    reg_number=vehicle_data['reg_number'],
                    org=company,
                    defaults=vehicle_data
                )
                
                if created:
                    print(f"  ✅ Created vehicle: {vehicle.make} {vehicle.model} ({vehicle.reg_number})")
                else:
                    print(f"  ℹ️ Vehicle already exists: {vehicle.make} {vehicle.model} ({vehicle.reg_number})")
                
                created_vehicles.append(vehicle)
    
    return created_vehicles

def create_real_key_trackers(vehicles):
    """Create realistic key trackers for vehicles"""
    print(f"\n🔑 Creating key trackers for {len(vehicles)} vehicles...")
    
    for i, vehicle in enumerate(vehicles):
        tracker, created = KeyTracker.objects.get_or_create(
            vehicle=vehicle,
            defaults={
                'ble_id': f'KEY_{vehicle.reg_number.replace("-", "_")}_{i+1:03d}',
                'label': f'Key for {vehicle.reg_number}',
                'last_seen_at': datetime.now() - timedelta(hours=random.randint(1, 24)),
                'last_rssi': random.randint(-80, -30),
                'last_lat': 40.7128 + (random.random() - 0.5) * 0.1,
                'last_lng': -74.0060 + (random.random() - 0.5) * 0.1,
                'is_active': True
            }
        )
        
        if created:
            print(f"  ✅ Created key tracker: {tracker.label}")
        else:
            print(f"  ℹ️ Key tracker already exists: {tracker.label}")

def create_real_shifts(users, vehicles):
    """Create realistic shifts for drivers"""
    print(f"\n⏰ Creating realistic shifts...")
    
    drivers = [user for user in users if user.role == 'driver']
    active_vehicles = [vehicle for vehicle in vehicles if vehicle.status == 'ACTIVE']
    
    shift_count = 0
    for driver in drivers[:3]:  # Create shifts for first 3 drivers
        for i in range(random.randint(5, 15)):  # 5-15 shifts per driver
            vehicle = random.choice(active_vehicles)
            start_time = datetime.now() - timedelta(days=random.randint(1, 30))
            
            shift, created = Shift.objects.get_or_create(
                vehicle=vehicle,
                driver=driver,
                start_at=start_time,
                defaults={
                    'end_at': start_time + timedelta(hours=random.randint(6, 12)),
                    'start_lat': 40.7128 + (random.random() - 0.5) * 0.1,
                    'start_lng': -74.0060 + (random.random() - 0.5) * 0.1,
                    'start_address': f'Depot {random.randint(1, 5)}',
                    'status': random.choice(['COMPLETED', 'ACTIVE']),
                    'notes': f'Regular shift for {driver.first_name} {driver.last_name}'
                }
            )
            
            if created:
                shift_count += 1
    
    print(f"  ✅ Created {shift_count} realistic shifts")

def main():
    """Main setup function"""
    print("🚀 Setting up PRODUCTION data for Fleet Management System")
    print("=" * 70)
    
    try:
        # Create real companies
        print("\n📊 Creating real companies...")
        companies = create_real_companies()
        print(f"✅ Created/verified {len(companies)} companies")
        
        # Create real users
        print("\n👥 Creating real users...")
        users = create_real_users(companies)
        print(f"✅ Created/verified {len(users)} users")
        
        # Create real vehicles
        print("\n🚗 Creating real vehicles...")
        vehicles = create_real_vehicles(companies)
        print(f"✅ Created/verified {len(vehicles)} vehicles")
        
        # Create key trackers
        print("\n🔑 Creating key trackers...")
        create_real_key_trackers(vehicles)
        
        # Create realistic shifts
        print("\n⏰ Creating realistic shifts...")
        create_real_shifts(users, vehicles)
        
        print("\n✅ PRODUCTION data setup completed successfully!")
        print("=" * 70)
        
        # Summary
        print("\n📋 PRODUCTION DATA SUMMARY:")
        print(f"🏢 Companies: {len(companies)}")
        print(f"👥 Users: {len(users)}")
        print(f"🚗 Vehicles: {len(vehicles)}")
        
        print("\n🔐 PRODUCTION LOGIN CREDENTIALS:")
        for company in companies:
            print(f"\n{company.name}:")
            company_users = [u for u in users if u.company == company]
            for user in company_users[:3]:  # Show first 3 users per company
                password = f"{user.role.capitalize()}2024!" if user.role != 'admin' else f"{company.name.split()[0]}Admin2024!"
                print(f"  - {user.username} ({user.role}) - Password: {password}")
        
    except Exception as e:
        print(f"❌ Error setting up production data: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == '__main__':
    main()
