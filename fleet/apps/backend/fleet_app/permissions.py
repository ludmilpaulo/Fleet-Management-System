from rest_framework import permissions


class IsOrgMember(permissions.BasePermission):
    """
    Custom permission to only allow members of the same organization.
    """
    
    def has_permission(self, request, view):
        # User must be authenticated
        if not request.user.is_authenticated:
            return False
        
        # User must have a company
        if not hasattr(request.user, 'company') or not request.user.company:
            return False
        
        return True
    
    def has_object_permission(self, request, view, obj):
        # Check if the object belongs to the user's organization
        if hasattr(obj, 'org'):
            return obj.org == request.user.company
        elif hasattr(obj, 'vehicle') and hasattr(obj.vehicle, 'org'):
            return obj.vehicle.org == request.user.company
        elif hasattr(obj, 'shift') and hasattr(obj.shift, 'vehicle') and hasattr(obj.shift.vehicle, 'org'):
            return obj.shift.vehicle.org == request.user.company
        
        return False


class IsOrgAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow org admins to edit, but allow read access to all org members.
    """
    
    def has_permission(self, request, view):
        # User must be authenticated
        if not request.user.is_authenticated:
            return False
        
        # User must have a company
        if not hasattr(request.user, 'company') or not request.user.company:
            return False
        
        # Read permissions for any org member
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for org admins
        return request.user.role == 'admin'
    
    def has_object_permission(self, request, view, obj):
        # Check if the object belongs to the user's organization
        if hasattr(obj, 'org'):
            if obj.org != request.user.company:
                return False
        elif hasattr(obj, 'actor') and hasattr(obj.actor, 'company'):
            if obj.actor.company != request.user.company:
                return False
        
        # Read permissions for any org member
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for org admins
        return request.user.role == 'admin'


class IsDriverOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow drivers and admins to access driver-specific resources.
    """
    
    def has_permission(self, request, view):
        # User must be authenticated
        if not request.user.is_authenticated:
            return False
        
        # User must have a company
        if not hasattr(request.user, 'company') or not request.user.company:
            return False
        
        # Allow drivers and admins
        return request.user.role in ['driver', 'admin']
    
    def has_object_permission(self, request, view, obj):
        # Check if the object belongs to the user's organization
        if hasattr(obj, 'org'):
            if obj.org != request.user.company:
                return False
        elif hasattr(obj, 'vehicle') and hasattr(obj.vehicle, 'org'):
            if obj.vehicle.org != request.user.company:
                return False
        
        # Drivers can only access their own shifts
        if request.user.role == 'driver':
            if hasattr(obj, 'driver'):
                return obj.driver == request.user
            elif hasattr(obj, 'shift') and hasattr(obj.shift, 'driver'):
                return obj.shift.driver == request.user
        
        # Admins can access everything in their org
        return request.user.role == 'admin'


class IsStaffOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow staff and admins to access staff-specific resources.
    """
    
    def has_permission(self, request, view):
        # User must be authenticated
        if not request.user.is_authenticated:
            return False
        
        # User must have a company
        if not hasattr(request.user, 'company') or not request.user.company:
            return False
        
        # Allow staff and admins
        return request.user.role in ['staff', 'admin']
    
    def has_object_permission(self, request, view, obj):
        # Check if the object belongs to the user's organization
        if hasattr(obj, 'org'):
            if obj.org != request.user.company:
                return False
        elif hasattr(obj, 'vehicle') and hasattr(obj.vehicle, 'org'):
            if obj.vehicle.org != request.user.company:
                return False
        
        # Staff and admins can access everything in their org
        return True


class IsInspectorOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow inspectors and admins to access inspection-specific resources.
    """
    
    def has_permission(self, request, view):
        # User must be authenticated
        if not request.user.is_authenticated:
            return False
        
        # User must have a company
        if not hasattr(request.user, 'company') or not request.user.company:
            return False
        
        # Allow inspectors and admins
        return request.user.role in ['inspector', 'admin']
    
    def has_object_permission(self, request, view, obj):
        # Check if the object belongs to the user's organization
        if hasattr(obj, 'org'):
            if obj.org != request.user.company:
                return False
        elif hasattr(obj, 'vehicle') and hasattr(obj.vehicle, 'org'):
            if obj.vehicle.org != request.user.company:
                return False
        
        # Inspectors can only access their own inspections
        if request.user.role == 'inspector':
            if hasattr(obj, 'created_by'):
                return obj.created_by == request.user
            elif hasattr(obj, 'inspection') and hasattr(obj.inspection, 'created_by'):
                return obj.inspection.created_by == request.user
        
        # Admins can access everything in their org
        return request.user.role == 'admin'
