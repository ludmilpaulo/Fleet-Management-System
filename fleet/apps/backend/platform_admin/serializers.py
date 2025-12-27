from rest_framework import serializers
import re
from .models import (
    SubscriptionPlan, CompanySubscription, BillingHistory, PlatformSettings, AuditLog,
    PlatformAdmin, AdminAction, SystemConfiguration, DataExport, SystemMaintenance
)
from account.models import Company, User
from fleet_app.models import Vehicle, KeyTracker, Shift
from inspections.models import Inspection, InspectionItem, Photo, InspectionTemplate
from issues.models import Issue, IssueComment, IssuePhoto
from tickets.models import Ticket, TicketComment, TicketAttachment, MaintenanceSchedule
from telemetry.models import Notification, VehicleLocation, VehicleTelemetry, Geofence, SystemAlert, ParkingLog


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Serializer for SubscriptionPlan model"""
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'display_name', 'description', 'monthly_price', 'yearly_price',
            'max_users', 'max_vehicles', 'max_drivers', 'max_inspectors', 'features',
            'is_active', 'is_popular', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompanySubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for CompanySubscription model"""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    plan_name = serializers.CharField(source='plan.display_name', read_only=True)
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanySubscription
        fields = [
            'id', 'company', 'company_name', 'plan', 'plan_name', 'status', 'billing_cycle',
            'started_at', 'current_period_start', 'current_period_end', 'trial_ends_at',
            'amount', 'currency', 'days_remaining', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_days_remaining(self, obj):
        """Calculate days remaining in current period"""
        from django.utils import timezone
        if obj.status == 'trial':
            remaining = obj.trial_ends_at - timezone.now()
            return max(0, remaining.days)
        elif obj.status == 'active':
            remaining = obj.current_period_end - timezone.now()
            return max(0, remaining.days)
        return 0


class BillingHistorySerializer(serializers.ModelSerializer):
    """Serializer for BillingHistory model"""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = BillingHistory
        fields = [
            'id', 'company', 'company_name', 'subscription', 'invoice_number',
            'amount', 'currency', 'status', 'invoice_date', 'due_date', 'paid_at',
            'payment_method', 'transaction_id', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PlatformSettingsSerializer(serializers.ModelSerializer):
    """Serializer for PlatformSettings model"""
    
    class Meta:
        model = PlatformSettings
        fields = [
            'id', 'trial_duration_days', 'trial_max_users', 'trial_max_vehicles',
            'platform_name', 'platform_email', 'platform_phone', 'default_currency',
            'tax_rate', 'allow_registration', 'require_email_verification',
            'maintenance_mode', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for AuditLog model"""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    user_name = serializers.SerializerMethodField()
    
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
        return 'Unknown'
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'action', 'description', 'company', 'company_name', 'user', 'user_name',
            'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CompanyManagementSerializer(serializers.ModelSerializer):
    """Serializer for company management in platform admin"""
    
    subscription_display = serializers.CharField(source='get_subscription_display', read_only=True)
    days_remaining_in_trial = serializers.IntegerField(read_only=True)
    can_access_platform = serializers.BooleanField(read_only=True)
    current_user_count = serializers.SerializerMethodField()
    current_vehicle_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'slug', 'email', 'subscription_plan', 'subscription_status',
            'subscription_display', 'trial_started_at', 'trial_ends_at', 'subscription_started_at',
            'subscription_ends_at', 'days_remaining_in_trial', 'is_active', 'is_trial_active',
            'is_payment_overdue', 'can_access_platform', 'current_user_count', 'current_vehicle_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_current_user_count(self, obj):
        """Get current number of users in the company"""
        return obj.users.count()
    
    def get_current_vehicle_count(self, obj):
        """Get current number of vehicles in the company"""
        return obj.vehicles.count()


# Platform Admin Serializers
class PlatformAdminSerializer(serializers.ModelSerializer):
    """Serializer for PlatformAdmin model"""
    
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.SerializerMethodField()
    
    def get_full_name(self, obj):
        user = obj.user
        return f"{user.first_name} {user.last_name}".strip() or user.username
    
    class Meta:
        model = PlatformAdmin
        fields = [
            'id', 'user', 'username', 'email', 'full_name', 'is_super_admin',
            'permissions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminActionSerializer(serializers.ModelSerializer):
    """Serializer for AdminAction model"""
    
    admin_username = serializers.CharField(source='admin.user.username', read_only=True)
    admin_full_name = serializers.SerializerMethodField()
    
    def get_admin_full_name(self, obj):
        user = obj.admin.user
        return f"{user.first_name} {user.last_name}".strip() or user.username
    
    class Meta:
        model = AdminAction
        fields = [
            'id', 'admin', 'admin_username', 'admin_full_name', 'action_type',
            'description', 'target_model', 'target_id', 'metadata', 'ip_address',
            'user_agent', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SystemConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for SystemConfiguration model"""
    
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = SystemConfiguration
        fields = [
            'id', 'key', 'value', 'category', 'description', 'data_type',
            'is_public', 'is_editable', 'created_at', 'updated_at', 'updated_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DataExportSerializer(serializers.ModelSerializer):
    """Serializer for DataExport model"""
    
    admin_username = serializers.CharField(source='admin.user.username', read_only=True)
    
    class Meta:
        model = DataExport
        fields = [
            'id', 'admin', 'admin_username', 'export_type', 'format', 'status',
            'filters', 'date_range_start', 'date_range_end', 'file_path',
            'file_size', 'download_count', 'created_at', 'completed_at', 'expires_at'
        ]
        read_only_fields = ['id', 'created_at']


class SystemMaintenanceSerializer(serializers.ModelSerializer):
    """Serializer for SystemMaintenance model"""
    
    created_by_username = serializers.CharField(source='created_by.user.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.user.username', read_only=True)
    
    class Meta:
        model = SystemMaintenance
        fields = [
            'id', 'title', 'description', 'maintenance_type', 'status',
            'scheduled_start', 'scheduled_end', 'actual_start', 'actual_end',
            'estimated_downtime', 'affected_services', 'notify_users',
            'created_by', 'created_by_username', 'assigned_to', 'assigned_to_username',
            'notes', 'issues_encountered', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# Entity Management Serializers
class CompanyManagementSerializer(serializers.ModelSerializer):
    """Comprehensive company management serializer"""
    
    subscription_display = serializers.CharField(source='get_subscription_display', read_only=True)
    days_remaining_in_trial = serializers.IntegerField(read_only=True)
    can_access_platform = serializers.BooleanField(read_only=True)
    current_user_count = serializers.SerializerMethodField()
    current_vehicle_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'slug', 'email', 'phone', 'website', 'address_line1',
            'address_line2', 'city', 'state', 'postal_code', 'country',
            'logo', 'primary_color', 'secondary_color', 'subscription_plan',
            'subscription_status', 'subscription_display', 'trial_started_at',
            'trial_ends_at', 'subscription_started_at', 'subscription_ends_at',
            'days_remaining_in_trial', 'is_active', 'is_trial_active',
            'is_payment_overdue', 'can_access_platform', 'current_user_count',
            'current_vehicle_count', 'billing_email', 'billing_address',
            'payment_method', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create company with auto-generated slug"""
        # Generate slug from company name
        name = validated_data['name']
        slug = name.lower().replace(' ', '-').replace('_', '-')
        
        # Remove special characters
        slug = re.sub(r'[^a-z0-9-]', '', slug)
        
        # Ensure slug is unique
        base_slug = slug
        counter = 1
        while Company.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        validated_data['slug'] = slug
        return super().create(validated_data)
    
    def get_current_user_count(self, obj):
        return obj.users.count()
    
    def get_current_vehicle_count(self, obj):
        return obj.vehicles.count()


class UserManagementSerializer(serializers.ModelSerializer):
    """Comprehensive user management serializer"""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    is_active_display = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name', 
            'role', 'role_display', 'company', 'company_name', 'is_active', 
            'is_active_display', 'is_staff', 'is_superuser', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_is_active_display(self, obj):
        return 'Active' if obj.is_active else 'Inactive'
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class VehicleManagementSerializer(serializers.ModelSerializer):
    """Comprehensive vehicle management serializer"""
    
    company_name = serializers.CharField(source='org.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)
    license_plate = serializers.CharField(source='reg_number', read_only=True)
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'org', 'company_name', 'vin', 'make', 'model', 'year',
            'reg_number', 'license_plate', 'status', 'status_display', 'fuel_type',
            'fuel_type_display', 'mileage', 'color', 'engine_size', 'transmission',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ShiftManagementSerializer(serializers.ModelSerializer):
    """Comprehensive shift management serializer"""
    
    driver_name = serializers.SerializerMethodField()
    vehicle_info = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    def get_driver_name(self, obj):
        if obj.driver:
            return f"{obj.driver.first_name} {obj.driver.last_name}".strip() or obj.driver.username
        return 'Unknown'
    
    def get_vehicle_info(self, obj):
        if obj.vehicle:
            return obj.vehicle.reg_number
        return 'N/A'
    
    def get_company_name(self, obj):
        if obj.driver and obj.driver.company:
            return obj.driver.company.name
        return 'N/A'
    
    class Meta:
        model = Shift
        fields = [
            'id', 'driver', 'driver_name', 'vehicle', 'vehicle_info',
            'company_name', 'start_at', 'end_at', 'status', 'status_display',
            'start_lat', 'start_lng', 'start_address', 'end_lat', 'end_lng', 'end_address',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InspectionManagementSerializer(serializers.ModelSerializer):
    """Comprehensive inspection management serializer"""
    
    inspector_name = serializers.SerializerMethodField()
    
    def get_inspector_name(self, obj):
        if obj.shift and obj.shift.driver:
            driver = obj.shift.driver
            return f"{driver.first_name} {driver.last_name}".strip() or driver.username
        return 'Unknown'
    
    vehicle_info = serializers.SerializerMethodField()
    
    def get_vehicle_info(self, obj):
        if obj.shift and obj.shift.vehicle:
            return obj.shift.vehicle.reg_number
        return 'N/A'
    
    company_name = serializers.SerializerMethodField()
    
    def get_company_name(self, obj):
        if obj.shift and obj.shift.driver and obj.shift.driver.company:
            return obj.shift.driver.company.name
        return 'N/A'
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Inspection
        fields = [
            'id', 'shift', 'inspector_name', 'vehicle_info', 'company_name',
            'type', 'status', 'status_display', 'started_at', 'completed_at',
            'notes', 'weather_conditions', 'temperature', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class IssueManagementSerializer(serializers.ModelSerializer):
    """Comprehensive issue management serializer"""
    
    reporter_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    
    def get_reporter_name(self, obj):
        if obj.reporter:
            return f"{obj.reporter.first_name} {obj.reporter.last_name}".strip() or obj.reporter.username
        return 'Unknown'
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip() or obj.assigned_to.username
        return 'Unassigned'
    vehicle_info = serializers.CharField(source='vehicle.license_plate', read_only=True)
    company_name = serializers.CharField(source='reporter.company.name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'description', 'reporter', 'reporter_name',
            'assigned_to', 'assigned_to_name', 'vehicle', 'vehicle_info',
            'company_name', 'priority', 'priority_display', 'status',
            'status_display', 'reported_at', 'resolved_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TicketManagementSerializer(serializers.ModelSerializer):
    """Comprehensive ticket management serializer"""
    
    requester_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    
    def get_requester_name(self, obj):
        if obj.requester:
            return f"{obj.requester.first_name} {obj.requester.last_name}".strip() or obj.requester.username
        return 'Unknown'
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip() or obj.assigned_to.username
        return 'Unassigned'
    vehicle_info = serializers.CharField(source='vehicle.license_plate', read_only=True)
    company_name = serializers.CharField(source='requester.company.name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'requester', 'requester_name',
            'assigned_to', 'assigned_to_name', 'vehicle', 'vehicle_info',
            'company_name', 'priority', 'priority_display', 'status',
            'status_display', 'requested_at', 'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompanyStatsSerializer(serializers.Serializer):
    """Serializer for platform-wide statistics"""
    
    total_companies = serializers.IntegerField()
    active_companies = serializers.IntegerField()
    trial_companies = serializers.IntegerField()
    expired_companies = serializers.IntegerField()
    suspended_companies = serializers.IntegerField()
    
    total_users = serializers.IntegerField()
    total_vehicles = serializers.IntegerField()
    total_shifts = serializers.IntegerField()
    total_inspections = serializers.IntegerField()
    total_issues = serializers.IntegerField()
    total_tickets = serializers.IntegerField()
    
    monthly_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    yearly_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    companies_by_plan = serializers.DictField()
    companies_by_status = serializers.DictField()
    revenue_by_month = serializers.DictField()
    
    # Admin statistics
    total_admin_actions = serializers.IntegerField()
    recent_admin_actions = serializers.ListField()
    system_health = serializers.DictField()
    active_maintenance = serializers.ListField()


class BulkActionSerializer(serializers.Serializer):
    """Serializer for bulk actions"""
    
    action = serializers.ChoiceField(choices=[
        ('activate', 'Activate'),
        ('deactivate', 'Deactivate'),
        ('delete', 'Delete'),
        ('export', 'Export'),
        ('assign', 'Assign'),
        ('update', 'Update'),
    ])
    target_model = serializers.CharField()
    target_ids = serializers.ListField(child=serializers.IntegerField())
    parameters = serializers.DictField(required=False, default=dict)
    reason = serializers.CharField(required=False)


class SystemHealthSerializer(serializers.Serializer):
    """Serializer for system health status"""
    
    database_status = serializers.CharField()
    redis_status = serializers.CharField()
    celery_status = serializers.CharField()
    storage_status = serializers.CharField()
    api_response_time = serializers.FloatField()
    error_rate = serializers.FloatField()
    active_users = serializers.IntegerField()
    system_load = serializers.FloatField()
    memory_usage = serializers.FloatField()
    disk_usage = serializers.FloatField()
    last_backup = serializers.DateTimeField()
    uptime = serializers.DurationField()
