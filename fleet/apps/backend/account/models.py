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
            ('trial', 'Trial'),
            ('basic', 'Basic'),
            ('professional', 'Professional'),
            ('enterprise', 'Enterprise'),
        ],
        default='trial',
        help_text="Subscription plan"
    )
    
    # Subscription Details
    subscription_status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('trial', 'Trial'),
            ('expired', 'Expired'),
            ('suspended', 'Suspended'),
            ('cancelled', 'Cancelled'),
        ],
        default='trial',
        help_text="Current subscription status"
    )
    
    trial_started_at = models.DateTimeField(default=timezone.now, help_text="Trial start date")
    trial_ends_at = models.DateTimeField(blank=True, null=True, help_text="Trial period end date")
    subscription_started_at = models.DateTimeField(blank=True, null=True, help_text="Paid subscription start date")
    subscription_ends_at = models.DateTimeField(blank=True, null=True, help_text="Subscription end date")
    
    # Billing Information
    billing_email = models.EmailField(blank=True, null=True, help_text="Billing contact email")
    billing_address = models.TextField(blank=True, null=True, help_text="Billing address")
    payment_method = models.CharField(
        max_length=20,
        choices=[
            ('card', 'Credit Card'),
            ('bank', 'Bank Transfer'),
            ('invoice', 'Invoice'),
        ],
        blank=True,
        null=True,
        help_text="Payment method"
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Whether the company is active")
    is_trial_active = models.BooleanField(default=True, help_text="Whether trial is active")
    is_payment_overdue = models.BooleanField(default=False, help_text="Whether payment is overdue")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'account_company'
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        # Set trial end date if not set and this is a new company
        if not self.pk and not self.trial_ends_at:
            from datetime import timedelta
            self.trial_ends_at = timezone.now() + timedelta(days=14)  # 2 weeks trial
        
        super().save(*args, **kwargs)
    
    def is_trial_expired(self):
        """Check if trial period has expired"""
        if not self.is_trial_active:
            return False
        return timezone.now() > self.trial_ends_at
    
    def days_remaining_in_trial(self):
        """Get days remaining in trial"""
        if not self.is_trial_active or not self.trial_ends_at:
            return 0
        remaining = self.trial_ends_at - timezone.now()
        return max(0, remaining.days)
    
    def can_access_platform(self):
        """Check if company can access the platform"""
        if not self.is_active:
            return False
        
        if self.subscription_status == 'active':
            return True
        
        if self.subscription_status == 'trial' and not self.is_trial_expired():
            return True
        
        return False
    
    def get_subscription_display(self):
        """Get human-readable subscription status"""
        if self.subscription_status == 'trial':
            days_left = self.days_remaining_in_trial()
            return f"Trial ({days_left} days left)"
        return self.get_subscription_status_display()
    
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
