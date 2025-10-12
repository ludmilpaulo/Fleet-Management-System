from django.urls import path
from . import views
from . import admin_views

app_name = 'platform_admin'

urlpatterns = [
    # Platform Admin Management
    path('admins/', admin_views.PlatformAdminListView.as_view(), name='admin-list'),
    path('admins/<int:pk>/', admin_views.PlatformAdminDetailView.as_view(), name='admin-detail'),
    
    # Entity Management - Companies
    path('companies/', admin_views.CompanyManagementListView.as_view(), name='company-list'),
    path('companies/<int:pk>/', admin_views.CompanyManagementDetailView.as_view(), name='company-detail'),
    path('companies/<int:company_id>/activate/', views.activate_company, name='activate-company'),
    path('companies/<int:company_id>/deactivate/', views.deactivate_company, name='deactivate-company'),
    path('companies/<int:company_id>/extend-trial/', views.extend_trial, name='extend-trial'),
    path('companies/<int:company_id>/upgrade-plan/', views.upgrade_company_plan, name='upgrade-plan'),
    
    # Entity Management - Users
    path('users/', admin_views.UserManagementListView.as_view(), name='user-list'),
    path('users/<int:pk>/', admin_views.UserManagementDetailView.as_view(), name='user-detail'),
    
    # Entity Management - Vehicles
    path('vehicles/', admin_views.VehicleManagementListView.as_view(), name='vehicle-list'),
    path('vehicles/<int:pk>/', admin_views.VehicleManagementDetailView.as_view(), name='vehicle-detail'),
    
    # Entity Management - Shifts
    path('shifts/', admin_views.ShiftManagementListView.as_view(), name='shift-list'),
    path('shifts/<int:pk>/', admin_views.ShiftManagementDetailView.as_view(), name='shift-detail'),
    
    # Entity Management - Inspections
    path('inspections/', admin_views.InspectionManagementListView.as_view(), name='inspection-list'),
    path('inspections/<int:pk>/', admin_views.InspectionManagementDetailView.as_view(), name='inspection-detail'),
    
    # Entity Management - Issues
    path('issues/', admin_views.IssueManagementListView.as_view(), name='issue-list'),
    path('issues/<int:pk>/', admin_views.IssueManagementDetailView.as_view(), name='issue-detail'),
    
    # Entity Management - Tickets
    path('tickets/', admin_views.TicketManagementListView.as_view(), name='ticket-list'),
    path('tickets/<int:pk>/', admin_views.TicketManagementDetailView.as_view(), name='ticket-detail'),
    
    # System Management
    path('configurations/', admin_views.SystemConfigurationListView.as_view(), name='config-list'),
    path('configurations/<int:pk>/', admin_views.SystemConfigurationDetailView.as_view(), name='config-detail'),
    
    path('admin-actions/', admin_views.AdminActionListView.as_view(), name='admin-action-list'),
    
    path('exports/', admin_views.DataExportListView.as_view(), name='export-list'),
    path('exports/<int:export_id>/download/', admin_views.download_export, name='download-export'),
    
    path('maintenance/', admin_views.SystemMaintenanceListView.as_view(), name='maintenance-list'),
    
    # Subscription Plans
    path('plans/', views.SubscriptionPlanListView.as_view(), name='plan-list'),
    path('plans/<int:pk>/', views.SubscriptionPlanDetailView.as_view(), name='plan-detail'),
    
    # Subscriptions
    path('subscriptions/', views.CompanySubscriptionListView.as_view(), name='subscription-list'),
    
    # Billing
    path('billing/', views.BillingHistoryListView.as_view(), name='billing-list'),
    
    # Platform Settings
    path('settings/', views.PlatformSettingsView.as_view(), name='settings'),
    
    # Audit Logs
    path('audit-logs/', views.AuditLogListView.as_view(), name='audit-log-list'),
    
    # Reports and Analytics
    path('stats/', admin_views.platform_stats, name='platform-stats'),
    path('system-health/', admin_views.system_health, name='system-health'),
    path('trial-expiry-report/', views.trial_expiry_report, name='trial-expiry-report'),
    
    # Bulk Operations
    path('bulk-action/', admin_views.bulk_action, name='bulk-action'),
    
    # Data Operations
    path('export-data/', admin_views.export_data, name='export-data'),
    path('schedule-maintenance/', admin_views.schedule_maintenance, name='schedule-maintenance'),
]
