from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import Company, User
from .company_serializers import (
    CompanySerializer, CompanyCreateSerializer, CompanyUpdateSerializer, CompanyListSerializer
)


class CompanyListView(generics.ListAPIView):
    """
    API view for listing companies (public)
    """
    serializer_class = CompanyListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Company.objects.filter(is_active=True)
        
        # Filter by search query
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(email__icontains=search)
            )
        
        return queryset.order_by('name')


class CompanyDetailView(generics.RetrieveAPIView):
    """
    API view for company details (public)
    """
    serializer_class = CompanySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Company.objects.filter(is_active=True)


class CompanyCreateView(generics.CreateAPIView):
    """
    API view for creating companies (admin only)
    """
    serializer_class = CompanyCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Only superusers can create companies
        if not self.request.user.is_superuser:
            raise permissions.PermissionDenied("Only superusers can create companies")
        serializer.save()


class CompanyUpdateView(generics.RetrieveUpdateAPIView):
    """
    API view for updating company information (company admin only)
    """
    serializer_class = CompanyUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Company.objects.all()
        elif user.role == User.Role.ADMIN:
            return Company.objects.filter(id=user.company.id)
        else:
            return Company.objects.none()
    
    def get_object(self):
        # For non-superusers, return their company
        if not self.request.user.is_superuser:
            return self.request.user.company
        return super().get_object()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def company_stats_view(request):
    """
    API view for company statistics (company admin only)
    """
    user = request.user
    
    if not (user.is_superuser or user.role == User.Role.ADMIN):
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    company = user.company
    
    stats = {
        'company_name': company.name,
        'total_users': company.current_user_count,
        'max_users': company.max_users,
        'user_limit_reached': company.current_user_count >= company.max_users,
        'total_vehicles': company.current_vehicle_count,
        'max_vehicles': company.max_vehicles,
        'vehicle_limit_reached': company.current_vehicle_count >= company.max_vehicles,
        'subscription_plan': company.subscription_plan,
        'is_trial_active': company.is_trial_active,
        'trial_ends_at': company.trial_ends_at,
        'users_by_role': {
            role[1]: company.users.filter(role=role[0], is_active=True).count()
            for role in User.Role.choices
        },
        'recent_registrations': company.users.filter(
            date_joined__gte=timezone.now() - timezone.timedelta(days=30)
        ).count()
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def company_exists_view(request):
    """
    API view to check if company exists by slug
    """
    slug = request.query_params.get('slug')
    if not slug:
        return Response(
            {'error': 'Slug parameter is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        company = Company.objects.get(slug=slug, is_active=True)
        return Response({
            'exists': True,
            'name': company.name,
            'description': company.description,
            'subscription_plan': company.subscription_plan
        })
    except Company.DoesNotExist:
        return Response({
            'exists': False
        })
