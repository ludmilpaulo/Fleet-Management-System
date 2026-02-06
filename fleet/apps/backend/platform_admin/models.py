from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from account.models import Company
from fleet_app.models import Vehicle, KeyTracker, Shift
from inspections.models import Inspection, InspectionItem, Photo, InspectionTemplate
from issues.models import Issue, IssueComment, IssuePhoto
from tickets.models import Ticket, TicketComment, TicketAttachment, MaintenanceSchedule
from telemetry.models import Notification, VehicleLocation, VehicleTelemetry, Geofence, SystemAlert, ParkingLog, AuditLog

User = get_user_model()


class SubscriptionPlan(models.Model):
    """Subscription plan definitions"""
    
    name = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Pricing
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2)
    yearly_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Limits
    max_users = models.PositiveIntegerField()
    max_vehicles = models.PositiveIntegerField()
    max_drivers = models.PositiveIntegerField()
    max_inspectors = models.PositiveIntegerField()
    
    # Features
    features = models.JSONField(default=list, help_text="List of features included")
    
    # Status
    is_active = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False, help_text="Mark as popular plan")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['monthly_price']
    
    def __str__(self):
        return self.display_name


class CompanySubscription(models.Model):
    """Company subscription tracking"""
    
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    
    # Subscription details
    status = models.CharField(
        max_length=20,
        choices=[
            ('trial', 'Trial'),
            ('active', 'Active'),
            ('expired', 'Expired'),
            ('suspended', 'Suspended'),
            ('cancelled', 'Cancelled'),
        ],
        default='trial'
    )
    
    billing_cycle = models.CharField(
        max_length=10,
        choices=[
            ('monthly', 'Monthly'),
            ('yearly', 'Yearly'),
        ],
        default='monthly'
    )
    
    # Dates
    started_at = models.DateTimeField(auto_now_add=True)
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
    trial_ends_at = models.DateTimeField()
    
    # Payment
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.company.name} - {self.plan.display_name}"


class BillingHistory(models.Model):
    """Billing history for companies"""
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='billing_history')
    subscription = models.ForeignKey(CompanySubscription, on_delete=models.CASCADE, related_name='billing_history')
    
    # Invoice details
    invoice_number = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Payment status
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('paid', 'Paid'),
            ('failed', 'Failed'),
            ('refunded', 'Refunded'),
        ],
        default='pending'
    )
    
    # Dates
    invoice_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    paid_at = models.DateTimeField(blank=True, null=True)
    
    # Payment method
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    
    # Metadata
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-invoice_date']
        verbose_name_plural = "Billing Histories"
    
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.company.name}"


class PlatformSettings(models.Model):
    """Platform-wide settings"""
    
    # Trial settings
    trial_duration_days = models.PositiveIntegerField(default=7)
    trial_max_users = models.PositiveIntegerField(default=5)
    trial_max_vehicles = models.PositiveIntegerField(default=10)
    
    # Platform settings
    platform_name = models.CharField(max_length=100, default="Fleet Management Platform")
    platform_email = models.EmailField(default="admin@fleetmanagement.com")
    platform_phone = models.CharField(max_length=20, blank=True)
    
    # Billing settings
    default_currency = models.CharField(max_length=3, default='USD')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # Feature flags
    allow_registration = models.BooleanField(default=True)
    require_email_verification = models.BooleanField(default=True)
    maintenance_mode = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Platform Settings"
        verbose_name_plural = "Platform Settings"
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and PlatformSettings.objects.exists():
            raise ValueError("Only one PlatformSettings instance is allowed")
        super().save(*args, **kwargs)
    
    def __str__(self):
        return "Platform Settings"


class PlatformAdmin(models.Model):
    """Platform administrators"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='platform_admin')
    is_super_admin = models.BooleanField(default=False)
    permissions = models.JSONField(default=list, help_text="List of specific permissions")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Platform Admin: {self.user.username}"


class AdminAction(models.Model):
    """Track all admin actions across the platform"""
    
    ACTION_TYPES = [
        # Company actions
        ('company_create', 'Company Created'),
        ('company_update', 'Company Updated'),
        ('company_delete', 'Company Deleted'),
        ('company_activate', 'Company Activated'),
        ('company_deactivate', 'Company Deactivated'),
        
        # User actions
        ('user_create', 'User Created'),
        ('user_update', 'User Updated'),
        ('user_delete', 'User Deleted'),
        ('user_activate', 'User Activated'),
        ('user_deactivate', 'User Deactivated'),
        
        # Vehicle actions
        ('vehicle_create', 'Vehicle Created'),
        ('vehicle_update', 'Vehicle Updated'),
        ('vehicle_delete', 'Vehicle Deleted'),
        ('vehicle_assign', 'Vehicle Assigned'),
        
        # Shift actions
        ('shift_create', 'Shift Created'),
        ('shift_update', 'Shift Updated'),
        ('shift_delete', 'Shift Deleted'),
        ('shift_start', 'Shift Started'),
        ('shift_end', 'Shift Ended'),
        
        # Inspection actions
        ('inspection_create', 'Inspection Created'),
        ('inspection_update', 'Inspection Updated'),
        ('inspection_delete', 'Inspection Deleted'),
        ('inspection_complete', 'Inspection Completed'),
        
        # Issue actions
        ('issue_create', 'Issue Created'),
        ('issue_update', 'Issue Updated'),
        ('issue_delete', 'Issue Deleted'),
        ('issue_assign', 'Issue Assigned'),
        ('issue_resolve', 'Issue Resolved'),
        
        # Ticket actions
        ('ticket_create', 'Ticket Created'),
        ('ticket_update', 'Ticket Updated'),
        ('ticket_delete', 'Ticket Deleted'),
        ('ticket_assign', 'Ticket Assigned'),
        ('ticket_resolve', 'Ticket Resolved'),
        
        # System actions
        ('system_backup', 'System Backup'),
        ('system_restore', 'System Restore'),
        ('system_maintenance', 'System Maintenance'),
        ('system_update', 'System Update'),
        
        # Subscription actions
        ('subscription_create', 'Subscription Created'),
        ('subscription_update', 'Subscription Updated'),
        ('subscription_cancel', 'Subscription Cancelled'),
        ('payment_process', 'Payment Processed'),
        
        # Data actions
        ('data_export', 'Data Exported'),
        ('data_import', 'Data Imported'),
        ('data_cleanup', 'Data Cleanup'),
        ('data_archive', 'Data Archived'),
    ]
    
    admin = models.ForeignKey(PlatformAdmin, on_delete=models.CASCADE, related_name='actions')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    description = models.TextField()
    
    # Related objects (generic foreign key approach)
    target_model = models.CharField(max_length=50, blank=True)
    target_id = models.PositiveIntegerField(null=True, blank=True)
    
    # Additional data
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action_type', 'created_at']),
            models.Index(fields=['target_model', 'target_id']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.admin.user.username} - {self.get_action_type_display()}"


class SystemConfiguration(models.Model):
    """System-wide configuration settings"""
    
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('security', 'Security'),
        ('billing', 'Billing'),
        ('notifications', 'Notifications'),
        ('features', 'Features'),
        ('limits', 'Limits'),
        ('maintenance', 'Maintenance'),
    ]
    
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    description = models.TextField(blank=True)
    data_type = models.CharField(max_length=20, default='string', choices=[
        ('string', 'String'),
        ('integer', 'Integer'),
        ('boolean', 'Boolean'),
        ('json', 'JSON'),
        ('url', 'URL'),
        ('email', 'Email'),
    ])
    is_public = models.BooleanField(default=False, help_text="Visible to non-admin users")
    is_editable = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['category', 'key']
    
    def __str__(self):
        return f"{self.key} ({self.category})"


class DataExport(models.Model):
    """Track data exports for compliance and auditing"""
    
    EXPORT_TYPES = [
        ('users', 'Users'),
        ('vehicles', 'Vehicles'),
        ('shifts', 'Shifts'),
        ('inspections', 'Inspections'),
        ('issues', 'Issues'),
        ('tickets', 'Tickets'),
        ('companies', 'Companies'),
        ('full_backup', 'Full Backup'),
    ]
    
    FORMAT_CHOICES = [
        ('csv', 'CSV'),
        ('json', 'JSON'),
        ('xlsx', 'Excel'),
        ('pdf', 'PDF'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    admin = models.ForeignKey(PlatformAdmin, on_delete=models.CASCADE, related_name='exports')
    export_type = models.CharField(max_length=20, choices=EXPORT_TYPES)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Filters and parameters
    filters = models.JSONField(default=dict, blank=True)
    date_range_start = models.DateTimeField(null=True, blank=True)
    date_range_end = models.DateTimeField(null=True, blank=True)
    
    # File information
    file_path = models.CharField(max_length=500, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)
    download_count = models.PositiveIntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Export {self.id}: {self.get_export_type_display()} ({self.status})"


class SystemMaintenance(models.Model):
    """Schedule and track system maintenance"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    MAINTENANCE_TYPES = [
        ('database', 'Database Maintenance'),
        ('server', 'Server Maintenance'),
        ('security', 'Security Update'),
        ('feature', 'Feature Update'),
        ('backup', 'Backup Process'),
        ('cleanup', 'Data Cleanup'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    maintenance_type = models.CharField(max_length=20, choices=MAINTENANCE_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Scheduling
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField()
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    
    # Impact
    estimated_downtime = models.DurationField(null=True, blank=True)
    affected_services = models.JSONField(default=list, blank=True)
    notify_users = models.BooleanField(default=True)
    
    # Admin tracking
    created_by = models.ForeignKey(PlatformAdmin, on_delete=models.CASCADE, related_name='maintenance_created')
    assigned_to = models.ForeignKey(PlatformAdmin, on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_assigned')
    
    # Results
    notes = models.TextField(blank=True)
    issues_encountered = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-scheduled_start']
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"


class AuditLog(models.Model):
    """Platform admin audit log"""
    
    ACTION_CHOICES = [
        ('company_created', 'Company Created'),
        ('company_updated', 'Company Updated'),
        ('company_deactivated', 'Company Deactivated'),
        ('subscription_created', 'Subscription Created'),
        ('subscription_updated', 'Subscription Updated'),
        ('subscription_cancelled', 'Subscription Cancelled'),
        ('payment_received', 'Payment Received'),
        ('payment_failed', 'Payment Failed'),
        ('plan_created', 'Plan Created'),
        ('plan_updated', 'Plan Updated'),
        ('settings_updated', 'Settings Updated'),
    ]
    
    # Action details
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField()
    
    # Related objects
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Additional data
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.action} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"