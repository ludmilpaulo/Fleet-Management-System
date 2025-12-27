from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta
import json
import csv
import io

from .models import (
    PlatformAdmin, AdminAction, SystemConfiguration, DataExport, 
    SystemMaintenance, SubscriptionPlan, CompanySubscription, BillingHistory, PlatformSettings
)
from .serializers import (
    PlatformAdminSerializer, AdminActionSerializer, SystemConfigurationSerializer,
    DataExportSerializer, SystemMaintenanceSerializer, SubscriptionPlanSerializer,
    CompanySubscriptionSerializer, BillingHistorySerializer, PlatformSettingsSerializer,
    CompanyManagementSerializer, UserManagementSerializer, VehicleManagementSerializer,
    ShiftManagementSerializer, InspectionManagementSerializer, IssueManagementSerializer,
    TicketManagementSerializer, CompanyStatsSerializer, BulkActionSerializer, SystemHealthSerializer
)

from account.models import Company, User
from fleet_app.models import Vehicle, KeyTracker, Shift
from inspections.models import Inspection, InspectionItem, Photo, InspectionTemplate
from issues.models import Issue, IssueComment, IssuePhoto
from tickets.models import Ticket, TicketComment, TicketAttachment, MaintenanceSchedule
from telemetry.models import Notification, VehicleLocation, VehicleTelemetry, Geofence, SystemAlert, ParkingLog


class IsPlatformAdmin(permissions.BasePermission):
    """Custom permission to only allow platform administrators"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # If user is superuser, allow access
        if request.user.is_superuser:
            return True
        
        # Check if user is a platform admin
        try:
            platform_admin = request.user.platform_admin
            return platform_admin.is_super_admin or 'admin' in platform_admin.permissions
        except:
            return False


def get_platform_admin(request):
    """Helper function to get platform admin instance"""
    try:
        # Check if user has platform_admin relationship
        if hasattr(request.user, 'platform_admin'):
            return request.user.platform_admin
        
        # If user is superuser but doesn't have PlatformAdmin instance, create one
        if request.user.is_superuser:
            platform_admin, created = PlatformAdmin.objects.get_or_create(
                user=request.user,
                defaults={'is_super_admin': True}
            )
            return platform_admin
        
        return None
    except Exception as e:
        print(f"Error getting platform admin: {e}")
        return None


def log_admin_action(admin, action_type, description, target_model=None, target_id=None, metadata=None, request=None):
    """Helper function to log admin actions"""
    # Skip logging if admin is None
    if admin is None:
        return
    
    AdminAction.objects.create(
        admin=admin,
        action_type=action_type,
        description=description,
        target_model=target_model,
        target_id=target_id,
        metadata=metadata or {},
        ip_address=request.META.get('REMOTE_ADDR') if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
    )


# Platform Admin Management
class PlatformAdminListView(generics.ListCreateAPIView):
    """List and create platform administrators"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = PlatformAdmin.objects.all()
    serializer_class = PlatformAdminSerializer


class PlatformAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a platform administrator"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = PlatformAdmin.objects.all()
    serializer_class = PlatformAdminSerializer


# Entity Management Views
class CompanyManagementListView(generics.ListCreateAPIView):
    """List and create companies"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    serializer_class = CompanyManagementSerializer
    
    def get_queryset(self):
        return Company.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        try:
            company = serializer.save()
            admin = get_platform_admin(self.request)
            log_admin_action(
                admin, 'company_create', f'Created company: {company.name}',
                'Company', company.id, {'company_name': company.name}, self.request
            )
            
            # Send welcome email to company (non-blocking)
            try:
                from account.email_templates import get_company_welcome_email_template
                from django.core.mail import EmailMessage
                from django.conf import settings
                
                email_content = get_company_welcome_email_template({
                    'name': company.name,
                    'email': company.email,
                    'subscription_plan': company.subscription_plan
                })
                
                msg = EmailMessage(
                    subject=f'Welcome to FleetIA - {company.name}!',
                    body=email_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[company.email],
                )
                msg.content_subtype = "html"
                msg.send()
            except Exception as e:
                # Log email error but don't fail the request
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to send company welcome email: {e}")
        except Exception as e:
            # Log the error and re-raise to return proper JSON error response
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating company: {e}", exc_info=True)
            raise


class CompanyManagementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a company"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = Company.objects.all()
    serializer_class = CompanyManagementSerializer
    
    def perform_update(self, serializer):
        company = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'company_update', f'Updated company: {company.name}',
            'Company', company.id, {'company_name': company.name}, self.request
        )
    
    def perform_destroy(self, instance):
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'company_delete', f'Deleted company: {instance.name}',
            'Company', instance.id, {'company_name': instance.name}, self.request
        )
        instance.delete()


class UserManagementListView(generics.ListCreateAPIView):
    """List and create users"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    serializer_class = UserManagementSerializer
    
    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')
    
    def perform_create(self, serializer):
        user = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'user_create', f'Created user: {user.username}',
            'User', user.id, {'username': user.username}, self.request
        )


class UserManagementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a user"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer
    
    def perform_update(self, serializer):
        user = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'user_update', f'Updated user: {user.username}',
            'User', user.id, {'username': user.username}, self.request
        )
    
    def perform_destroy(self, instance):
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'user_delete', f'Deleted user: {instance.username}',
            'User', instance.id, {'username': instance.username}, self.request
        )
        instance.delete()


class VehicleManagementListView(generics.ListCreateAPIView):
    """List and create vehicles"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    serializer_class = VehicleManagementSerializer
    
    def get_queryset(self):
        return Vehicle.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        vehicle = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'vehicle_create', f'Created vehicle: {vehicle.license_plate}',
            'Vehicle', vehicle.id, {'license_plate': vehicle.license_plate}, self.request
        )


class VehicleManagementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a vehicle"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = Vehicle.objects.all()
    serializer_class = VehicleManagementSerializer
    
    def perform_update(self, serializer):
        vehicle = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'vehicle_update', f'Updated vehicle: {vehicle.license_plate}',
            'Vehicle', vehicle.id, {'license_plate': vehicle.license_plate}, self.request
        )
    
    def perform_destroy(self, instance):
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'vehicle_delete', f'Deleted vehicle: {instance.license_plate}',
            'Vehicle', instance.id, {'license_plate': instance.license_plate}, self.request
        )
        instance.delete()


class ShiftManagementListView(generics.ListCreateAPIView):
    """List and create shifts"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    serializer_class = ShiftManagementSerializer
    
    def get_queryset(self):
        return Shift.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        shift = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'shift_create', f'Created shift for driver: {shift.driver.username}',
            'Shift', shift.id, {'driver': shift.driver.username}, self.request
        )


class ShiftManagementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a shift"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = Shift.objects.all()
    serializer_class = ShiftManagementSerializer
    
    def perform_update(self, serializer):
        shift = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'shift_update', f'Updated shift for driver: {shift.driver.username}',
            'Shift', shift.id, {'driver': shift.driver.username}, self.request
        )
    
    def perform_destroy(self, instance):
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'shift_delete', f'Deleted shift for driver: {instance.driver.username}',
            'Shift', instance.id, {'driver': instance.driver.username}, self.request
        )
        instance.delete()


class InspectionManagementListView(generics.ListCreateAPIView):
    """List and create inspections"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    serializer_class = InspectionManagementSerializer
    
    def get_queryset(self):
        return Inspection.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        inspection = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'inspection_create', f'Created inspection for shift: {inspection.shift.id}',
            'Inspection', inspection.id, {'shift_id': inspection.shift.id}, self.request
        )


class InspectionManagementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an inspection"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = Inspection.objects.all()
    serializer_class = InspectionManagementSerializer
    
    def perform_update(self, serializer):
        inspection = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'inspection_update', f'Updated inspection for shift: {inspection.shift.id}',
            'Inspection', inspection.id, {'shift_id': inspection.shift.id}, self.request
        )
    
    def perform_destroy(self, instance):
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'inspection_delete', f'Deleted inspection for shift: {instance.shift.id}',
            'Inspection', instance.id, {'shift_id': instance.shift.id}, self.request
        )
        instance.delete()


class IssueManagementListView(generics.ListCreateAPIView):
    """List and create issues"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    serializer_class = IssueManagementSerializer
    
    def get_queryset(self):
        return Issue.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        issue = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'issue_create', f'Created issue: {issue.title}',
            'Issue', issue.id, {'title': issue.title}, self.request
        )


class IssueManagementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an issue"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = Issue.objects.all()
    serializer_class = IssueManagementSerializer
    
    def perform_update(self, serializer):
        issue = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'issue_update', f'Updated issue: {issue.title}',
            'Issue', issue.id, {'title': issue.title}, self.request
        )
    
    def perform_destroy(self, instance):
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'issue_delete', f'Deleted issue: {instance.title}',
            'Issue', instance.id, {'title': instance.title}, self.request
        )
        instance.delete()


class TicketManagementListView(generics.ListCreateAPIView):
    """List and create tickets"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    serializer_class = TicketManagementSerializer
    
    def get_queryset(self):
        return Ticket.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        ticket = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'ticket_create', f'Created ticket: {ticket.title}',
            'Ticket', ticket.id, {'title': ticket.title}, self.request
        )


class TicketManagementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a ticket"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = Ticket.objects.all()
    serializer_class = TicketManagementSerializer
    
    def perform_update(self, serializer):
        ticket = serializer.save()
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'ticket_update', f'Updated ticket: {ticket.title}',
            'Ticket', ticket.id, {'title': ticket.title}, self.request
        )
    
    def perform_destroy(self, instance):
        admin = get_platform_admin(self.request)
        log_admin_action(
            admin, 'ticket_delete', f'Deleted ticket: {instance.title}',
            'Ticket', instance.id, {'title': instance.title}, self.request
        )
        instance.delete()


# System Management Views
class SystemConfigurationListView(generics.ListCreateAPIView):
    """List and create system configurations"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = SystemConfiguration.objects.all()
    serializer_class = SystemConfigurationSerializer


class SystemConfigurationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete system configuration"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = SystemConfiguration.objects.all()
    serializer_class = SystemConfigurationSerializer


class AdminActionListView(generics.ListAPIView):
    """List admin actions"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = AdminAction.objects.all()
    serializer_class = AdminActionSerializer


class DataExportListView(generics.ListCreateAPIView):
    """List and create data exports"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = DataExport.objects.all()
    serializer_class = DataExportSerializer


class SystemMaintenanceListView(generics.ListCreateAPIView):
    """List and create system maintenance"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = SystemMaintenance.objects.all()
    serializer_class = SystemMaintenanceSerializer


# Custom API Views
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsPlatformAdmin])
def bulk_action(request):
    """Perform bulk actions on entities"""
    serializer = BulkActionSerializer(data=request.data)
    if serializer.is_valid():
        action = serializer.validated_data['action']
        target_model = serializer.validated_data['target_model']
        target_ids = serializer.validated_data['target_ids']
        parameters = serializer.validated_data.get('parameters', {})
        reason = serializer.validated_data.get('reason', '')
        
        admin = get_platform_admin(request)
        
        # Map model names to actual models
        model_map = {
            'Company': Company,
            'User': User,
            'Vehicle': Vehicle,
            'Shift': Shift,
            'Inspection': Inspection,
            'Issue': Issue,
            'Ticket': Ticket,
        }
        
        if target_model not in model_map:
            return Response({'error': 'Invalid target model'}, status=status.HTTP_400_BAD_REQUEST)
        
        model_class = model_map[target_model]
        objects = model_class.objects.filter(id__in=target_ids)
        
        if action == 'activate':
            for obj in objects:
                if hasattr(obj, 'is_active'):
                    obj.is_active = True
                    obj.save()
        elif action == 'deactivate':
            for obj in objects:
                if hasattr(obj, 'is_active'):
                    obj.is_active = False
                    obj.save()
        elif action == 'delete':
            objects.delete()
        
        log_admin_action(
            admin, f'{target_model.lower()}_{action}', 
            f'Bulk {action} on {len(target_ids)} {target_model} objects',
            target_model, None, {'count': len(target_ids), 'reason': reason}, request
        )
        
        return Response({'message': f'Bulk {action} completed successfully'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsPlatformAdmin])
def platform_stats(request):
    """Get comprehensive platform statistics"""
    
    # Company statistics
    total_companies = Company.objects.count()
    active_companies = Company.objects.filter(is_active=True).count()
    trial_companies = Company.objects.filter(subscription_status='trial').count()
    expired_companies = Company.objects.filter(subscription_status='expired').count()
    suspended_companies = Company.objects.filter(subscription_status='suspended').count()
    
    # Entity statistics
    total_users = User.objects.count()
    total_vehicles = Vehicle.objects.count()
    total_shifts = Shift.objects.count()
    total_inspections = Inspection.objects.count()
    total_issues = Issue.objects.count()
    total_tickets = Ticket.objects.count()
    
    # Revenue calculations - use actual billing history
    from .models import BillingHistory, CompanySubscription
    
    # Calculate actual monthly revenue from paid invoices in current month
    current_month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_revenue = BillingHistory.objects.filter(
        status='paid',
        paid_at__gte=current_month_start
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Calculate yearly revenue from paid invoices in current year
    current_year_start = timezone.now().replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    yearly_revenue = BillingHistory.objects.filter(
        status='paid',
        paid_at__gte=current_year_start
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Alternative: Calculate from active subscriptions if billing history is empty
    if monthly_revenue == 0 and CompanySubscription.objects.exists():
        # Sum active subscriptions' amounts
        monthly_revenue = CompanySubscription.objects.filter(
            status='active',
            billing_cycle='monthly'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        yearly_from_monthly = CompanySubscription.objects.filter(
            status='active',
            billing_cycle='yearly'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        monthly_revenue = float(monthly_revenue) + (float(yearly_from_monthly) / 12)
    
    # Companies by plan and status
    companies_by_plan = dict(Company.objects.values_list('subscription_plan').annotate(count=Count('id')))
    companies_by_status = dict(Company.objects.values_list('subscription_status').annotate(count=Count('id')))
    
    # Revenue by month - actual data from billing history
    revenue_by_month = {}
    for i in range(12):
        month_start = (timezone.now().replace(day=1) - timedelta(days=30*i))
        month_end = month_start + timedelta(days=32)  # Next month
        month_revenue = BillingHistory.objects.filter(
            status='paid',
            paid_at__gte=month_start,
            paid_at__lt=month_end
        ).aggregate(total=Sum('amount'))['total'] or 0
        revenue_by_month[month_start.strftime('%Y-%m')] = float(month_revenue)
    
    # Admin statistics
    total_admin_actions = AdminAction.objects.count()
    recent_admin_actions = AdminAction.objects.all()[:10]
    
    # System health (mock data)
    system_health = {
        'database_status': 'healthy',
        'redis_status': 'healthy',
        'celery_status': 'healthy',
        'storage_status': 'healthy',
        'api_response_time': 0.15,
        'error_rate': 0.02,
        'active_users': User.objects.filter(is_active=True).count(),
        'system_load': 0.45,
        'memory_usage': 0.67,
        'disk_usage': 0.23,
        'last_backup': timezone.now() - timedelta(hours=6),
        'uptime': timedelta(days=30, hours=12, minutes=45),
    }
    
    # Active maintenance
    active_maintenance = SystemMaintenance.objects.filter(
        status__in=['scheduled', 'in_progress']
    ).values('id', 'title', 'status', 'scheduled_start')
    
    stats = {
        'total_companies': total_companies,
        'active_companies': active_companies,
        'trial_companies': trial_companies,
        'expired_companies': expired_companies,
        'suspended_companies': suspended_companies,
        'total_users': total_users,
        'total_vehicles': total_vehicles,
        'total_shifts': total_shifts,
        'total_inspections': total_inspections,
        'total_issues': total_issues,
        'total_tickets': total_tickets,
        'monthly_revenue': monthly_revenue,
        'yearly_revenue': yearly_revenue,
        'companies_by_plan': companies_by_plan,
        'companies_by_status': companies_by_status,
        'revenue_by_month': revenue_by_month,
        'total_admin_actions': total_admin_actions,
        'recent_admin_actions': AdminActionSerializer(recent_admin_actions, many=True).data,
        'system_health': system_health,
        'active_maintenance': list(active_maintenance),
    }
    
    serializer = CompanyStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsPlatformAdmin])
def system_health(request):
    """Get system health status"""
    
    # Mock system health data - in production, this would check actual system metrics
    health_data = {
        'database_status': 'healthy',
        'redis_status': 'healthy',
        'celery_status': 'healthy',
        'storage_status': 'healthy',
        'api_response_time': 0.15,
        'error_rate': 0.02,
        'active_users': User.objects.filter(is_active=True).count(),
        'system_load': 0.45,
        'memory_usage': 0.67,
        'disk_usage': 0.23,
        'last_backup': timezone.now() - timedelta(hours=6),
        'uptime': timedelta(days=30, hours=12, minutes=45),
    }
    
    serializer = SystemHealthSerializer(health_data)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsPlatformAdmin])
def export_data(request):
    """Export data in various formats"""
    
    export_type = request.data.get('export_type')
    format_type = request.data.get('format', 'csv')
    filters = request.data.get('filters', {})
    
    admin = get_platform_admin(request)
    
    # Create export record
    export = DataExport.objects.create(
        admin=admin,
        export_type=export_type,
        format=format_type,
        filters=filters,
        status='processing'
    )
    
    # Mock export process - in production, this would be handled by Celery
    export.status = 'completed'
    export.file_path = f'/exports/{export.id}_{export_type}.{format_type}'
    export.file_size = 1024  # Mock size
    export.completed_at = timezone.now()
    export.expires_at = timezone.now() + timedelta(days=7)
    export.save()
    
    log_admin_action(
        admin, 'data_export', f'Exported {export_type} data',
        'DataExport', export.id, {'export_type': export_type, 'format': format_type}, request
    )
    
    return Response({'export_id': export.id, 'status': 'completed'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsPlatformAdmin])
def download_export(request, export_id):
    """Download exported data"""
    
    try:
        export = DataExport.objects.get(id=export_id)
        
        if export.status != 'completed':
            return Response({'error': 'Export not ready'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mock file content - in production, this would read from actual file
        if export.format == 'csv':
            content = "id,name,email\n1,Test User,test@example.com\n"
            response = HttpResponse(content, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{export.export_type}.csv"'
        else:
            content = json.dumps({'message': 'Mock export data'})
            response = HttpResponse(content, content_type='application/json')
            response['Content-Disposition'] = f'attachment; filename="{export.export_type}.json"'
        
        export.download_count += 1
        export.save()
        
        return response
        
    except DataExport.DoesNotExist:
        return Response({'error': 'Export not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsPlatformAdmin])
def schedule_maintenance(request):
    """Schedule system maintenance"""
    
    admin = get_platform_admin(request)
    
    maintenance = SystemMaintenance.objects.create(
        title=request.data.get('title'),
        description=request.data.get('description'),
        maintenance_type=request.data.get('maintenance_type'),
        scheduled_start=request.data.get('scheduled_start'),
        scheduled_end=request.data.get('scheduled_end'),
        estimated_downtime=request.data.get('estimated_downtime'),
        affected_services=request.data.get('affected_services', []),
        notify_users=request.data.get('notify_users', True),
        created_by=admin,
        assigned_to=admin,
    )
    
    log_admin_action(
        admin, 'system_maintenance', f'Scheduled maintenance: {maintenance.title}',
        'SystemMaintenance', maintenance.id, {'title': maintenance.title}, request
    )
    
    serializer = SystemMaintenanceSerializer(maintenance)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
