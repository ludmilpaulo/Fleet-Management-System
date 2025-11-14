"""
Permission classes for subscription-based access control
"""
from rest_framework import permissions
from .models import CompanySubscription


class HasActiveSubscription(permissions.BasePermission):
    """
    Permission class to check if user's company has an active subscription
    """
    
    def has_permission(self, request, view):
        """Check if user's company has active subscription"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Platform admins can always access
        if hasattr(request.user, 'platform_admin'):
            return True
        
        # Check if user has a company
        if not request.user.company:
            return False
        
        company = request.user.company
        
        # Check subscription
        try:
            subscription = CompanySubscription.objects.get(company=company)
            return subscription.can_access_features()
        except CompanySubscription.DoesNotExist:
            # No subscription - check if company is in trial
            if company.subscription_status == 'trial' and not company.is_trial_expired():
                return True
            return False


class HasSubscriptionOrReadOnly(permissions.BasePermission):
    """
    Permission class that allows read-only access without subscription,
    but requires active subscription for write operations
    """
    
    def has_permission(self, request, view):
        """Check permissions based on request method"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Platform admins can always access
        if hasattr(request.user, 'platform_admin'):
            return True
        
        # Read-only methods (GET, HEAD, OPTIONS) are allowed
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write methods require active subscription
        if not request.user.company:
            return False
        
        company = request.user.company
        
        try:
            subscription = CompanySubscription.objects.get(company=company)
            return subscription.can_access_features()
        except CompanySubscription.DoesNotExist:
            # No subscription - check if company is in trial
            if company.subscription_status == 'trial' and not company.is_trial_expired():
                return True
            return False

