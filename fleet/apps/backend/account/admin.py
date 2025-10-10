from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """
    Company admin interface
    """
    list_display = ('name', 'slug', 'email', 'subscription_plan', 'is_active', 'current_user_count', 'created_at')
    list_filter = ('subscription_plan', 'is_active', 'created_at')
    search_fields = ('name', 'email', 'slug')
    readonly_fields = ('created_at', 'updated_at', 'current_user_count', 'current_vehicle_count')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'email', 'phone', 'website')
        }),
        ('Address', {
            'fields': ('address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country')
        }),
        ('Branding', {
            'fields': ('logo', 'primary_color', 'secondary_color')
        }),
        ('Subscription', {
            'fields': ('subscription_plan', 'max_users', 'max_vehicles', 'trial_ends_at')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Statistics', {
            'fields': ('current_user_count', 'current_vehicle_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User admin interface
    """
    
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'employee_id', 'department', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser', 'department', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'employee_id', 'phone_number')
    ordering = ('-date_joined',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Company & Role', {
            'fields': ('company', 'role')
        }),
        ('Fleet Management Info', {
            'fields': ('phone_number', 'employee_id', 'department', 'hire_date')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Company & Role', {
            'fields': ('company', 'role')
        }),
        ('Fleet Management Info', {
            'fields': ('phone_number', 'employee_id', 'department', 'hire_date')
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'date_joined', 'last_login')
