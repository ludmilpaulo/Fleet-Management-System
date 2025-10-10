from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.db.models import Q
from django.utils import timezone
from .models import User
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
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create token for the new user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'token': token.key,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


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
