from rest_framework import generics, status, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Vehicle, KeyTracker, Shift, ShiftEndChecklist
from .serializers import (
    VehicleSerializer, VehicleCreateSerializer, KeyTrackerSerializer, KeyTrackerCreateSerializer,
    ShiftSerializer, ShiftCreateSerializer, ShiftEndSerializer, VehicleStatsSerializer, ShiftStatsSerializer,
    ShiftEndChecklistSerializer, ShiftEndChecklistCreateSerializer
)
from .permissions import IsOrgMember, IsOrgAdminOrReadOnly


class VehicleListView(generics.ListCreateAPIView):
    """List and create vehicles"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    
    def get_queryset(self):
        """Filter vehicles by user's organization"""
        return Vehicle.objects.filter(org=self.request.user.company).order_by('reg_number')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VehicleCreateSerializer
        return VehicleSerializer
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Set organization and creator"""
        if not self.request.user.company:
            raise serializers.ValidationError("User must belong to a company to create vehicles.")
        vehicle = serializer.save(org=self.request.user.company, created_by=self.request.user)
        return vehicle


class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a vehicle"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    
    def get_queryset(self):
        """Filter vehicles by user's organization"""
        return Vehicle.objects.filter(org=self.request.user.company)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return VehicleCreateSerializer
        return VehicleSerializer
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class KeyTrackerListView(generics.ListCreateAPIView):
    """List and create key trackers"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    
    def get_queryset(self):
        """Filter key trackers by user's organization"""
        return KeyTracker.objects.filter(vehicle__org=self.request.user.company).order_by('-last_seen_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return KeyTrackerCreateSerializer
        return KeyTrackerSerializer


class KeyTrackerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a key tracker"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    
    def get_queryset(self):
        """Filter key trackers by user's organization"""
        return KeyTracker.objects.filter(vehicle__org=self.request.user.company)


class ShiftListView(generics.ListCreateAPIView):
    """List and create shifts"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    
    def get_queryset(self):
        """Filter shifts by user's organization"""
        return Shift.objects.filter(vehicle__org=self.request.user.company).order_by('-start_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ShiftCreateSerializer
        return ShiftSerializer
    
    def perform_create(self, serializer):
        """Set driver if not provided, otherwise use the provided driver"""
        driver = serializer.validated_data.get('driver')
        if not driver:
            # If no driver provided, default to the requesting user (for driver-initiated shifts)
            serializer.save(driver=self.request.user)
        else:
            # Driver was provided (for admin-created shifts), validate and save
            serializer.save()


class ShiftDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a shift"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    
    def get_queryset(self):
        """Filter shifts by user's organization"""
        return Shift.objects.filter(vehicle__org=self.request.user.company)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ShiftEndSerializer
        return ShiftSerializer




@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsOrgMember])
def start_shift(request):
    """Start a new shift"""
    serializer = ShiftCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        shift = serializer.save(driver=request.user)
        return Response(ShiftSerializer(shift).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsOrgMember])
def end_shift(request, shift_id):
    """End an active shift with optional checklist"""
    try:
        shift = Shift.objects.get(
            id=shift_id,
            vehicle__org=request.user.company,
            status='ACTIVE'
        )
    except Shift.DoesNotExist:
        return Response({'error': 'Shift not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Handle shift end data
    shift_data = {}
    if 'end_lat' in request.data:
        shift_data['end_lat'] = request.data.get('end_lat')
    if 'end_lng' in request.data:
        shift_data['end_lng'] = request.data.get('end_lng')
    if 'end_address' in request.data:
        shift_data['end_address'] = request.data.get('end_address')
    if 'notes' in request.data:
        shift_data['notes'] = request.data.get('notes')
    
    if shift_data:
        shift_serializer = ShiftEndSerializer(shift, data=shift_data, partial=True)
        if shift_serializer.is_valid():
            shift = shift_serializer.save()
            shift.status = 'COMPLETED'
            shift.end_at = timezone.now()
            shift.save()
        else:
            return Response(shift_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        shift.status = 'COMPLETED'
        shift.end_at = timezone.now()
        shift.save()
    
    # Handle checklist if provided
    checklist_data = None
    if any(key in request.FILES for key in ['fuel_level_photo', 'photo_front', 'photo_back', 'photo_left', 'photo_right']):
        checklist_data = {
            'shift': shift.id,
            'parking_lat': request.data.get('parking_lat'),
            'parking_lng': request.data.get('parking_lng'),
            'parking_address': request.data.get('parking_address', ''),
            'fuel_level_photo': request.FILES.get('fuel_level_photo'),
            'fuel_level_manual': request.data.get('fuel_level_manual'),
            'photo_front': request.FILES.get('photo_front'),
            'photo_back': request.FILES.get('photo_back'),
            'photo_left': request.FILES.get('photo_left'),
            'photo_right': request.FILES.get('photo_right'),
            'scratches_noted': request.data.get('scratches_noted', False),
            'damage_description': request.data.get('damage_description', ''),
        }
        
        # Remove None values
        checklist_data = {k: v for k, v in checklist_data.items() if v is not None}
        
        checklist_serializer = ShiftEndChecklistCreateSerializer(
            data=checklist_data,
            context={'request': request}
        )
        if checklist_serializer.is_valid():
            checklist = checklist_serializer.save()
            # Return shift with checklist data
            shift_response = ShiftSerializer(shift).data
            shift_response['checklist'] = ShiftEndChecklistSerializer(checklist).data
            return Response(shift_response, status=status.HTTP_200_OK)
        else:
            # Checklist failed but shift is already ended
            shift_response = ShiftSerializer(shift).data
            shift_response['checklist_errors'] = checklist_serializer.errors
            return Response(shift_response, status=status.HTTP_200_OK)
    
    return Response(ShiftSerializer(shift).data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsOrgMember])
def vehicle_stats(request):
    """Get vehicle statistics"""
    org = request.user.company
    
    # Basic counts
    total_vehicles = Vehicle.objects.filter(org=org).count()
    active_vehicles = Vehicle.objects.filter(org=org, status='ACTIVE').count()
    maintenance_vehicles = Vehicle.objects.filter(org=org, status='MAINTENANCE').count()
    inactive_vehicles = Vehicle.objects.filter(org=org, status='INACTIVE').count()
    
    # Status breakdown
    vehicles_by_status = dict(Vehicle.objects.filter(org=org).values_list('status').annotate(count=Count('id')))
    
    # Fuel type breakdown
    vehicles_by_fuel_type = dict(Vehicle.objects.filter(org=org).values_list('fuel_type').annotate(count=Count('id')))
    
    # Mileage stats
    mileage_stats = Vehicle.objects.filter(org=org).aggregate(
        average_mileage=Avg('mileage'),
        total_mileage=Count('mileage')
    )
    
    stats = {
        'total_vehicles': total_vehicles,
        'active_vehicles': active_vehicles,
        'maintenance_vehicles': maintenance_vehicles,
        'inactive_vehicles': inactive_vehicles,
        'vehicles_by_status': vehicles_by_status,
        'vehicles_by_fuel_type': vehicles_by_fuel_type,
        'average_mileage': mileage_stats['average_mileage'] or 0,
        'total_mileage': mileage_stats['total_mileage'] or 0,
    }
    
    serializer = VehicleStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsOrgMember])
def shift_stats(request):
    """Get shift statistics"""
    org = request.user.company
    
    # Basic counts
    total_shifts = Shift.objects.filter(vehicle__org=org).count()
    active_shifts = Shift.objects.filter(vehicle__org=org, status='ACTIVE').count()
    completed_shifts = Shift.objects.filter(vehicle__org=org, status='COMPLETED').count()
    
    # Status breakdown
    shifts_by_status = dict(Shift.objects.filter(vehicle__org=org).values_list('status').annotate(count=Count('id')))
    
    # Duration stats
    completed_shifts_with_duration = Shift.objects.filter(
        vehicle__org=org,
        status='COMPLETED',
        end_at__isnull=False
    )
    
    if completed_shifts_with_duration.exists():
        durations = []
        for shift in completed_shifts_with_duration:
            duration = shift.end_at - shift.start_at
            durations.append(duration)
        
        total_duration = sum(durations, timedelta())
        average_duration = total_duration / len(durations)
    else:
        total_duration = timedelta()
        average_duration = timedelta()
    
    stats = {
        'total_shifts': total_shifts,
        'active_shifts': active_shifts,
        'completed_shifts': completed_shifts,
        'shifts_by_status': shifts_by_status,
        'average_duration': average_duration,
        'total_duration': total_duration,
    }
    
    serializer = ShiftStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsOrgMember])
def dashboard_stats(request):
    """Get dashboard statistics"""
    org = request.user.company
    today = timezone.now().date()
    
    # Vehicle stats
    total_vehicles = Vehicle.objects.filter(org=org).count()
    active_vehicles = Vehicle.objects.filter(org=org, status='ACTIVE').count()
    maintenance_vehicles = Vehicle.objects.filter(org=org, status='MAINTENANCE').count()
    
    # Shift stats
    active_shifts = Shift.objects.filter(vehicle__org=org, status='ACTIVE').count()
    completed_shifts_today = Shift.objects.filter(
        vehicle__org=org,
        status='COMPLETED',
        end_at__date=today
    ).count()
    
    # Inspection stats (if inspections app is available)
    try:
        from inspections.models import Inspection
        inspections_today = Inspection.objects.filter(
            shift__vehicle__org=org,
            started_at__date=today
        ).count()
        failed_inspections_today = Inspection.objects.filter(
            shift__vehicle__org=org,
            started_at__date=today,
            status='FAIL'
        ).count()
    except ImportError:
        inspections_today = 0
        failed_inspections_today = 0
    
    # Issue stats (if issues app is available)
    try:
        from issues.models import Issue
        open_issues = Issue.objects.filter(vehicle__org=org, status='OPEN').count()
        critical_issues = Issue.objects.filter(vehicle__org=org, severity='CRITICAL').count()
        overdue_issues = Issue.objects.filter(
            vehicle__org=org,
            due_date__lt=timezone.now(),
            status__in=['OPEN', 'IN_PROGRESS']
        ).count()
    except ImportError:
        open_issues = 0
        critical_issues = 0
        overdue_issues = 0
    
    # Ticket stats (if tickets app is available)
    try:
        from tickets.models import Ticket
        open_tickets = Ticket.objects.filter(issue__vehicle__org=org, status='OPEN').count()
        overdue_tickets = Ticket.objects.filter(
            issue__vehicle__org=org,
            due_at__lt=timezone.now(),
            status__in=['OPEN', 'IN_PROGRESS']
        ).count()
        completed_tickets_today = Ticket.objects.filter(
            issue__vehicle__org=org,
            status='COMPLETED',
            completed_at__date=today
        ).count()
    except ImportError:
        open_tickets = 0
        overdue_tickets = 0
        completed_tickets_today = 0
    
    # Notification stats (if telemetry app is available)
    try:
        from telemetry.models import Notification
        unread_notifications = Notification.objects.filter(
            user=request.user,
            status='PENDING'
        ).count()
        urgent_notifications = Notification.objects.filter(
            user=request.user,
            priority='URGENT',
            status='PENDING'
        ).count()
    except ImportError:
        unread_notifications = 0
        urgent_notifications = 0
    
    # System alert stats (if telemetry app is available)
    try:
        from telemetry.models import SystemAlert
        active_system_alerts = SystemAlert.objects.filter(status='ACTIVE').count()
        critical_system_alerts = SystemAlert.objects.filter(
            status='ACTIVE',
            severity='CRITICAL'
        ).count()
    except ImportError:
        active_system_alerts = 0
        critical_system_alerts = 0
    
    stats = {
        'total_vehicles': total_vehicles,
        'active_vehicles': active_vehicles,
        'maintenance_vehicles': maintenance_vehicles,
        'active_shifts': active_shifts,
        'completed_shifts_today': completed_shifts_today,
        'inspections_today': inspections_today,
        'failed_inspections_today': failed_inspections_today,
        'open_issues': open_issues,
        'critical_issues': critical_issues,
        'overdue_issues': overdue_issues,
        'open_tickets': open_tickets,
        'overdue_tickets': overdue_tickets,
        'completed_tickets_today': completed_tickets_today,
        'unread_notifications': unread_notifications,
        'urgent_notifications': urgent_notifications,
        'active_system_alerts': active_system_alerts,
        'critical_system_alerts': critical_system_alerts,
    }
    
    return Response(stats)