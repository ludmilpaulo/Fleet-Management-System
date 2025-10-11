from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from .models import ParkingLog, AuditLog
from .serializers import ParkingLogSerializer, ParkingLogCreateSerializer, AuditLogSerializer
from fleet_app.permissions import IsOrgMember, IsOrgAdminOrReadOnly


class ParkingLogListView(generics.ListCreateAPIView):
    """
    List all parking logs or create a new parking log.
    """
    serializer_class = ParkingLogSerializer
    permission_classes = [IsOrgMember]

    def get_queryset(self):
        user = self.request.user
        queryset = ParkingLog.objects.filter(vehicle__org=user.company)
        
        # Filter by vehicle if provided
        vehicle_filter = self.request.query_params.get('vehicle')
        if vehicle_filter:
            queryset = queryset.filter(vehicle_id=vehicle_filter)
        
        # Filter by shift if provided
        shift_filter = self.request.query_params.get('shift')
        if shift_filter:
            queryset = queryset.filter(shift_id=shift_filter)
        
        # Filter by date range if provided
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(captured_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(captured_at__lte=date_to)
        
        return queryset.select_related('vehicle', 'shift').order_by('-captured_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ParkingLogCreateSerializer
        return ParkingLogSerializer

    def perform_create(self, serializer):
        serializer.save()


class ParkingLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a parking log.
    """
    serializer_class = ParkingLogSerializer
    permission_classes = [IsOrgMember]
    lookup_field = 'id'

    def get_queryset(self):
        return ParkingLog.objects.filter(vehicle__org=self.request.user.company)


class AuditLogListView(generics.ListAPIView):
    """
    List all audit logs.
    """
    serializer_class = AuditLogSerializer
    permission_classes = [IsOrgAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = AuditLog.objects.filter(actor__company=user.company)
        
        # Filter by action if provided
        action_filter = self.request.query_params.get('action')
        if action_filter:
            queryset = queryset.filter(action=action_filter)
        
        # Filter by entity if provided
        entity_filter = self.request.query_params.get('entity')
        if entity_filter:
            queryset = queryset.filter(entity=entity_filter)
        
        # Filter by actor if provided
        actor_filter = self.request.query_params.get('actor')
        if actor_filter:
            queryset = queryset.filter(actor_id=actor_filter)
        
        # Filter by date range if provided
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset.select_related('actor').order_by('-created_at')


class AuditLogDetailView(generics.RetrieveAPIView):
    """
    Retrieve an audit log.
    """
    serializer_class = AuditLogSerializer
    permission_classes = [IsOrgAdminOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        return AuditLog.objects.filter(actor__company=self.request.user.company)


class AuditLogStatsView(generics.GenericAPIView):
    """
    Get audit log statistics for the organization.
    """
    permission_classes = [IsOrgAdminOrReadOnly]

    def get(self, request):
        user = request.user
        audit_logs = AuditLog.objects.filter(actor__company=user.company)
        
        stats = {
            'total': audit_logs.count(),
            'by_action': dict(audit_logs.values('action').annotate(count=Count('id')).values_list('action', 'count')),
            'by_entity': dict(audit_logs.values('entity').annotate(count=Count('id')).values_list('entity', 'count')),
            'today': audit_logs.filter(created_at__date=timezone.now().date()).count(),
            'this_week': audit_logs.filter(created_at__gte=timezone.now().date() - timezone.timedelta(days=7)).count(),
        }
        
        return Response(stats)