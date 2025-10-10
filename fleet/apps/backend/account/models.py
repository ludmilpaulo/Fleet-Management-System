from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class Company(models.Model):
    """
    Company model for multi-tenant fleet management system
    """
    name = models.CharField(max_length=200, help_text="Company name")
    slug = models.SlugField(max_length=100, unique=True, help_text="URL-friendly company identifier")
    description = models.TextField(blank=True, null=True, help_text="Company description")
    
    # Contact Information
    email = models.EmailField(help_text="Primary company email")
    phone = models.CharField(max_length=20, blank=True, null=True, help_text="Company phone number")
    website = models.URLField(blank=True, null=True, help_text="Company website")
    
    # Address Information
    address_line1 = models.CharField(max_length=200, blank=True, null=True)
    address_line2 = models.CharField(max_length=200, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    
    # Company Settings
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    primary_color = models.CharField(max_length=7, default='#3b82f6', help_text="Primary brand color (hex)")
    secondary_color = models.CharField(max_length=7, default='#f1f5f9', help_text="Secondary brand color (hex)")
    
    # Subscription & Limits
    max_users = models.PositiveIntegerField(default=50, help_text="Maximum number of users")
    max_vehicles = models.PositiveIntegerField(default=100, help_text="Maximum number of vehicles")
    subscription_plan = models.CharField(
        max_length=20,
        choices=[
            ('basic', 'Basic'),
            ('professional', 'Professional'),
            ('enterprise', 'Enterprise'),
        ],
        default='basic',
        help_text="Subscription plan"
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Whether the company is active")
    trial_ends_at = models.DateTimeField(blank=True, null=True, help_text="Trial period end date")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'account_company'
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def full_address(self):
        """Return formatted full address"""
        parts = [self.address_line1, self.address_line2, self.city, self.state, self.postal_code, self.country]
        return ', '.join(filter(None, parts))
    
    @property
    def is_trial_active(self):
        """Check if company is in trial period"""
        if not self.trial_ends_at:
            return False
        return timezone.now() < self.trial_ends_at
    
    @property
    def current_user_count(self):
        """Get current number of active users"""
        return self.users.filter(is_active=True).count()
    
    @property
    def current_vehicle_count(self):
        """Get current number of vehicles (placeholder for future vehicle model)"""
        return 0  # Will be updated when vehicle model is created


class User(AbstractUser):
    """
    Custom User model with role-based access control for Fleet Management System
    """
    
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        DRIVER = 'driver', 'Driver'
        STAFF = 'staff', 'Staff'
        INSPECTOR = 'inspector', 'Inspector'
    
    # Company relationship
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True,
        help_text="Company this user belongs to"
    )
    
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STAFF,
        help_text="User role in the system"
    )
    
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="Contact phone number"
    )
    
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
        help_text="Unique employee identifier"
    )
    
    department = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Department or division"
    )
    
    hire_date = models.DateField(
        blank=True,
        null=True,
        help_text="Date of employment"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this user account is active"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'account_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
    
    @property
    def is_driver(self):
        return self.role == self.Role.DRIVER
    
    @property
    def is_staff_member(self):
        return self.role == self.Role.STAFF
    
    @property
    def is_inspector(self):
        return self.role == self.Role.INSPECTOR
    
    def has_permission(self, permission):
        """
        Check if user has specific permission based on role
        """
        permissions = {
            self.Role.ADMIN: ['all'],
            self.Role.DRIVER: ['view_vehicles', 'update_assigned_vehicles', 'view_own_profile'],
            self.Role.STAFF: ['view_vehicles', 'manage_vehicles', 'view_users', 'manage_users'],
            self.Role.INSPECTOR: ['view_vehicles', 'inspect_vehicles', 'create_inspection_reports']
        }
        
        user_permissions = permissions.get(self.role, [])
        return 'all' in user_permissions or permission in user_permissions
