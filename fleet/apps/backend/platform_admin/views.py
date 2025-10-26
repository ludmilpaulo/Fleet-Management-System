from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from .models import SubscriptionPlan, CompanySubscription, BillingHistory, PlatformSettings, AuditLog
from .serializers import (
    SubscriptionPlanSerializer, CompanySubscriptionSerializer, BillingHistorySerializer,
    PlatformSettingsSerializer, AuditLogSerializer, CompanyManagementSerializer, CompanyStatsSerializer
)
from account.models import Company, User
from fleet_app.models import Vehicle, Shift
from inspections.models import Inspection


class IsPlatformAdmin(permissions.BasePermission):
    """Custom permission to only allow platform administrators"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.is_superuser and
            request.user.role == 'admin'
        )


class SubscriptionPlanListView(generics.ListCreateAPIView):
    """List and create subscription plans"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer


class SubscriptionPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a subscription plan"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer


class CompanyManagementListView(generics.ListAPIView):
    """List all companies for platform admin"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    serializer_class = CompanyManagementSerializer
    
    def get_queryset(self):
        return Company.objects.all().order_by('-created_at')


class CompanyManagementDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update company details"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = Company.objects.all()
    serializer_class = CompanyManagementSerializer


class CompanySubscriptionListView(generics.ListCreateAPIView):
    """List and create company subscriptions"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = CompanySubscription.objects.all()
    serializer_class = CompanySubscriptionSerializer
    
    def perform_create(self, serializer):
        subscription = serializer.save()
        AuditLog.objects.create(
            action='subscription_created',
            description=f'Created subscription for {subscription.company.name}',
            company=subscription.company,
            user=self.request.user,
            metadata={'subscription_id': subscription.id, 'plan': subscription.plan.name}
        )


class CompanySubscriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a company subscription"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = CompanySubscription.objects.all()
    serializer_class = CompanySubscriptionSerializer
    
    def perform_update(self, serializer):
        subscription = serializer.save()
        AuditLog.objects.create(
            action='subscription_updated',
            description=f'Updated subscription for {subscription.company.name}',
            company=subscription.company,
            user=self.request.user,
            metadata={'subscription_id': subscription.id}
        )
    
    def perform_destroy(self, instance):
        company_name = instance.company.name
        instance.delete()
        AuditLog.objects.create(
            action='subscription_cancelled',
            description=f'Cancelled subscription for {company_name}',
            company=instance.company,
            user=self.request.user,
            metadata={'company_name': company_name}
        )


class BillingHistoryListView(generics.ListAPIView):
    """List billing history"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = BillingHistory.objects.all()
    serializer_class = BillingHistorySerializer


class PlatformSettingsView(generics.RetrieveUpdateAPIView):
    """Retrieve and update platform settings"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    serializer_class = PlatformSettingsSerializer
    
    def get_object(self):
        settings, created = PlatformSettings.objects.get_or_create(pk=1)
        return settings


class AuditLogListView(generics.ListAPIView):
    """List audit logs"""
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsPlatformAdmin])
def activate_company(request, company_id):
    """Activate a company"""
    try:
        company = Company.objects.get(id=company_id)
        company.is_active = True
        company.subscription_status = 'active'
        company.save()
        
        # Create audit log
        AuditLog.objects.create(
            action='company_updated',
            description=f'Company {company.name} activated',
            company=company,
            user=request.user,
            metadata={'action': 'activate', 'company_id': company_id}
        )
        
        return Response({'message': 'Company activated successfully'})
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsPlatformAdmin])
def deactivate_company(request, company_id):
    """Deactivate a company"""
    try:
        company = Company.objects.get(id=company_id)
        company.is_active = False
        company.subscription_status = 'suspended'
        company.save()
        
        # Create audit log
        AuditLog.objects.create(
            action='company_deactivated',
            description=f'Company {company.name} deactivated',
            company=company,
            user=request.user,
            metadata={'action': 'deactivate', 'company_id': company_id}
        )
        
        return Response({'message': 'Company deactivated successfully'})
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsPlatformAdmin])
def extend_trial(request, company_id):
    """Extend trial period for a company"""
    try:
        company = Company.objects.get(id=company_id)
        days = request.data.get('days', 14)
        
        if company.trial_ends_at:
            company.trial_ends_at += timedelta(days=days)
        else:
            company.trial_ends_at = timezone.now() + timedelta(days=days)
        
        company.subscription_status = 'trial'
        company.is_trial_active = True
        company.save()
        
        # Create audit log
        AuditLog.objects.create(
            action='subscription_updated',
            description=f'Trial extended for {company.name} by {days} days',
            company=company,
            user=request.user,
            metadata={'action': 'extend_trial', 'days': days, 'company_id': company_id}
        )
        
        return Response({'message': f'Trial extended by {days} days'})
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsPlatformAdmin])
def upgrade_company_plan(request, company_id):
    """Upgrade company to a paid plan"""
    try:
        company = Company.objects.get(id=company_id)
        plan_name = request.data.get('plan')
        billing_cycle = request.data.get('billing_cycle', 'monthly')
        
        try:
            plan = SubscriptionPlan.objects.get(name=plan_name)
        except SubscriptionPlan.DoesNotExist:
            return Response({'error': 'Plan not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update company subscription
        company.subscription_plan = plan_name
        company.subscription_status = 'active'
        company.is_trial_active = False
        company.subscription_started_at = timezone.now()
        
        if billing_cycle == 'yearly':
            company.subscription_ends_at = timezone.now() + timedelta(days=365)
        else:
            company.subscription_ends_at = timezone.now() + timedelta(days=30)
        
        company.save()
        
        # Create subscription record
        subscription, created = CompanySubscription.objects.get_or_create(
            company=company,
            defaults={
                'plan': plan,
                'status': 'active',
                'billing_cycle': billing_cycle,
                'current_period_start': timezone.now(),
                'current_period_end': company.subscription_ends_at,
                'trial_ends_at': company.trial_ends_at,
                'amount': plan.yearly_price if billing_cycle == 'yearly' else plan.monthly_price,
            }
        )
        
        # Create audit log
        AuditLog.objects.create(
            action='subscription_created',
            description=f'Company {company.name} upgraded to {plan.display_name} plan',
            company=company,
            user=request.user,
            metadata={
                'action': 'upgrade_plan',
                'plan': plan_name,
                'billing_cycle': billing_cycle,
                'company_id': company_id
            }
        )
        
        return Response({'message': f'Company upgraded to {plan.display_name} plan'})
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsPlatformAdmin])
def platform_stats(request):
    """Get platform-wide statistics"""
    
    # Company statistics
    total_companies = Company.objects.count()
    active_companies = Company.objects.filter(is_active=True).count()
    trial_companies = Company.objects.filter(subscription_status='trial').count()
    expired_companies = Company.objects.filter(subscription_status='expired').count()
    suspended_companies = Company.objects.filter(subscription_status='suspended').count()
    
    # User and vehicle statistics
    total_users = User.objects.count()
    total_vehicles = Vehicle.objects.count()
    total_shifts = Shift.objects.count()
    total_inspections = Inspection.objects.count()
    
    # Revenue calculations (mock data for now)
    monthly_revenue = 0
    yearly_revenue = 0
    
    # Companies by plan
    companies_by_plan = dict(Company.objects.values_list('subscription_plan').annotate(count=Count('id')))
    
    # Companies by status
    companies_by_status = dict(Company.objects.values_list('subscription_status').annotate(count=Count('id')))
    
    # Revenue by month (mock data)
    revenue_by_month = {}
    for i in range(12):
        month = timezone.now().replace(day=1) - timedelta(days=30*i)
        revenue_by_month[month.strftime('%Y-%m')] = 0
    
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
        'monthly_revenue': monthly_revenue,
        'yearly_revenue': yearly_revenue,
        'companies_by_plan': companies_by_plan,
        'companies_by_status': companies_by_status,
        'revenue_by_month': revenue_by_month,
    }
    
    serializer = CompanyStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsPlatformAdmin])
def trial_expiry_report(request):
    """Get report of companies with expiring trials"""
    
    # Get companies with trials expiring in the next 7 days
    seven_days_from_now = timezone.now() + timedelta(days=7)
    expiring_trials = Company.objects.filter(
        subscription_status='trial',
        trial_ends_at__lte=seven_days_from_now,
        trial_ends_at__gte=timezone.now()
    ).order_by('trial_ends_at')
    
    # Get companies with expired trials
    expired_trials = Company.objects.filter(
        subscription_status='trial',
        trial_ends_at__lt=timezone.now()
    ).order_by('-trial_ends_at')
    
    expiring_data = []
    for company in expiring_trials:
        days_left = company.days_remaining_in_trial()
        expiring_data.append({
            'id': company.id,
            'name': company.name,
            'email': company.email,
            'trial_ends_at': company.trial_ends_at,
            'days_remaining': days_left,
            'user_count': company.users.count(),
            'vehicle_count': company.vehicles.count(),
        })
    
    expired_data = []
    for company in expired_trials:
        days_expired = (timezone.now() - company.trial_ends_at).days
        expired_data.append({
            'id': company.id,
            'name': company.name,
            'email': company.email,
            'trial_ends_at': company.trial_ends_at,
            'days_expired': days_expired,
            'user_count': company.users.count(),
            'vehicle_count': company.vehicles.count(),
        })
    
    return Response({
        'expiring_trials': expiring_data,
        'expired_trials': expired_data,
    })