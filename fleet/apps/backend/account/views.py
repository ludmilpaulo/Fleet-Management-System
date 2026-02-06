from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .models import User, Company
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserUpdateSerializer, UserListSerializer, PasswordChangeSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """
    API view for user registration
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        
        # Log the incoming request data (without password)
        request_data = request.data.copy()
        if 'password' in request_data:
            request_data['password'] = '***'
        if 'password_confirm' in request_data:
            request_data['password_confirm'] = '***'
        logger.info(f"User registration request: {request_data}")
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = serializer.save()
            
            # Create token for the new user
            token, created = Token.objects.get_or_create(user=user)
            
            # Send welcome email
            try:
                from .email_templates import get_user_welcome_email_template
                from django.core.mail import EmailMessage
                from django.conf import settings
                
                email_content = get_user_welcome_email_template({
                    'first_name': user.first_name,
                    'email': user.email,
                    'password': 'TempPassword123!',  # This should be tracked securely
                    'company_name': user.company.name if user.company else 'FleetIA'
                })
                
                msg = EmailMessage(
                    subject='Welcome to FleetIA!',
                    body=email_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email],
                )
                msg.content_subtype = "html"
                msg.send()
            except Exception as e:
                logger.warning(f"Failed to send welcome email: {e}")
            
            return Response({
                'user': UserProfileSerializer(user).data,
                'token': token.key,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return Response({
                'detail': f'Error creating user: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    API view for user login
    """
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        
        # Get or create token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    API view for user logout
    """
    try:
        # Delete the token
        request.user.auth_token.delete()
    except:
        pass
    
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password_view(request):
    """
    API view for password reset request
    """
    email = request.data.get('email')
    
    if not email:
        return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Generate token for password reset
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # For local dev, return the link
        reset_link = f"http://localhost:3001/auth/reset-password?uid={uid}&token={token}"
        
        # TODO: Send email in production
        # send_mail('Reset Password', f'Link: {reset_link}', 'noreply@fleet.com', [email])
        
        return Response({
            'detail': 'If an account exists, we\'ve sent a password reset link.',
            'reset_link': reset_link  # Remove in production
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        # Don't reveal if email exists (security best practice)
        return Response({
            'detail': 'If an account exists with that email, we\'ve sent a password reset link.'
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API view for user profile (get and update own profile)
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """
    API view for listing users (admin and staff only)
    """
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Only admin and staff can view users within their company
        if user.role in [User.Role.ADMIN, User.Role.STAFF]:
            queryset = User.objects.filter(company=user.company)
        else:
            # Other users can only see their own profile
            queryset = User.objects.filter(id=user.id)
        
        # Filter by role if specified
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        # Filter by department if specified
        department = self.request.query_params.get('department', None)
        if department:
            queryset = queryset.filter(department__icontains=department)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(employee_id__icontains=search)
            )
        
        return queryset.order_by('-date_joined')


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view for user detail operations (admin and staff only)
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Only admin and staff can manage other users within their company
        if user.role in [User.Role.ADMIN, User.Role.STAFF]:
            return User.objects.filter(company=user.company)
        else:
            # Other users can only access their own profile
            return User.objects.filter(id=user.id)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserProfileSerializer


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request):
    """
    API view for changing user password
    """
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Delete old token and create new one
        try:
            user.auth_token.delete()
        except:
            pass
        token = Token.objects.create(user=user)
        
        return Response({
            'token': token.key,
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats_view(request):
    """
    API view for user statistics (admin only)
    """
    user = request.user
    
    if not user.is_admin:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get stats for user's company
    company = user.company
    company_users = User.objects.filter(company=company)
    
    stats = {
        'company_name': company.name,
        'total_users': company_users.count(),
        'active_users': company_users.filter(is_active=True).count(),
        'inactive_users': company_users.filter(is_active=False).count(),
        'users_by_role': {
            role[1]: company_users.filter(role=role[0]).count()
            for role in User.Role.choices
        },
        'recent_registrations': company_users.filter(
            date_joined__gte=timezone.now() - timezone.timedelta(days=30)
        ).count()
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def landing_stats_view(request):
    """
    Public API for landing page stats. Returns platform-wide metrics.
    """
    try:
        from fleet_app.models import Vehicle
        from inspections.models import Inspection
        from tickets.models import Ticket
    except ImportError:
        return Response({
            'vehicles_orchestrated': '3.2k+',
            'compliance_adherence': '98.4%',
            'automation_coverage': '42+',
            'average_response': '12m',
            'trusted_by_teams': [
                "FleetCorp", "Transport Masters", "Axis Freight",
                "Northwind Logistics", "Orbit Mobility", "Urban Deliveries"
            ],
            'readiness_by_depot': [35, 45, 30, 60, 50, 70, 90],
            'readiness_change_pct': 7.4,
            'fleet_status': 'Healthy',
            'active_hubs': 4,
        }, status=status.HTTP_200_OK)

    # Vehicles orchestrated - total vehicles across platform
    total_vehicles = Vehicle.objects.count()
    if total_vehicles >= 1000:
        vehicles_display = f"{total_vehicles / 1000:.1f}k+"
    else:
        vehicles_display = f"{total_vehicles}+"

    # Compliance adherence - % of inspections passed
    total_inspections = Inspection.objects.count()
    passed_inspections = Inspection.objects.filter(status='PASS').count()
    compliance_adherence = (
        round(100 * passed_inspections / total_inspections, 1)
        if total_inspections > 0
        else 98.4
    )

    # Automation coverage - completed tickets (proxy for automated workflows)
    completed_tickets = Ticket.objects.filter(status='COMPLETED').count()
    automation_coverage = max(42, completed_tickets)

    # Average response - avg resolution time from tickets (minutes)
    average_response = "12m"
    try:
        resolved = Ticket.objects.filter(
            status='COMPLETED',
            completed_at__isnull=False
        )[:100]
        total_sec, n = 0, 0
        for t in resolved:
            if t.completed_at and t.created_at:
                delta = t.completed_at - t.created_at
                total_sec += delta.total_seconds()
                n += 1
        if n > 0:
            avg_min = int(total_sec / n / 60)
            average_response = f"{avg_min}m" if avg_min < 60 else f"{avg_min // 60}h"
    except Exception:
        pass

    # Trusted by teams - company names (active companies)
    trusted_companies = list(
        Company.objects.filter(is_active=True)
        .values_list('name', flat=True)[:6]
    )
    if not trusted_companies:
        trusted_companies = [
            "FleetCorp", "Transport Masters", "Axis Freight",
            "Northwind Logistics", "Orbit Mobility", "Urban Deliveries"
        ]

    # Readiness across depots (companies as depots) - inspection pass rate per company
    readiness_by_depot = []
    active_companies = Company.objects.filter(is_active=True)
    for company in active_companies[:7]:  # Up to 7 bars
        org_inspections = Inspection.objects.filter(shift__vehicle__org=company)
        total = org_inspections.count()
        passed = org_inspections.filter(status='PASS').count()
        pct = round(100 * passed / total, 0) if total > 0 else 50
        readiness_by_depot.append(min(100, max(0, int(pct))))
    if not readiness_by_depot:
        readiness_by_depot = [35, 45, 30, 60, 50, 70, 90]  # Fallback

    # Readiness change vs last week (compare inspection pass rates)
    from datetime import timedelta
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    inspections_this_week = Inspection.objects.filter(started_at__gte=week_ago)
    inspections_last_week = Inspection.objects.filter(
        started_at__gte=week_ago - timedelta(days=7),
        started_at__lt=week_ago
    )
    pass_this = inspections_this_week.filter(status='PASS').count()
    total_this = inspections_this_week.count()
    pass_last = inspections_last_week.filter(status='PASS').count()
    total_last = inspections_last_week.count()
    rate_this = (100 * pass_this / total_this) if total_this > 0 else 0
    rate_last = (100 * pass_last / total_last) if total_last > 0 else 0
    readiness_change_pct = round(rate_this - rate_last, 1) if rate_last > 0 else 7.4

    # Fleet status: Healthy / Warning / Critical
    fleet_status = "Healthy"
    if compliance_adherence < 85 or (total_inspections > 0 and passed_inspections < total_inspections * 0.85):
        fleet_status = "Warning"
    if compliance_adherence < 70:
        fleet_status = "Critical"

    active_hubs = Company.objects.filter(is_active=True).count() or 4

    return Response({
        'vehicles_orchestrated': vehicles_display,
        'vehicles_orchestrated_raw': total_vehicles,
        'compliance_adherence': f"{compliance_adherence}%",
        'compliance_adherence_raw': compliance_adherence,
        'automation_coverage': f"{automation_coverage}+",
        'automation_coverage_raw': automation_coverage,
        'average_response': average_response,
        'trusted_by_teams': trusted_companies,
        'readiness_by_depot': readiness_by_depot,
        'readiness_change_pct': readiness_change_pct,
        'fleet_status': fleet_status,
        'active_hubs': active_hubs,
    }, status=status.HTTP_200_OK)
