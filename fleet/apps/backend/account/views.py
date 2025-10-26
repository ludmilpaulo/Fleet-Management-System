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
from django.core.mail import send_mail
from django.conf import settings
from .models import User
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserUpdateSerializer, UserListSerializer, PasswordChangeSerializer
)

# Forgot password view
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password_view(request):
    """Password reset request"""
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
        # Don't reveal if email exists
        return Response({
            'detail': 'If an account exists with that email, we\'ve sent a password reset link.'
        }, status=status.HTTP_200_OK)
