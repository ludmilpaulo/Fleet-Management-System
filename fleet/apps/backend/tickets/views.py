from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from .models import Ticket
from .serializers import TicketSerializer, TicketCreateSerializer, TicketUpdateSerializer
from fleet_app.permissions import IsOrgMember, IsOrgAdminOrReadOnly


class TicketListView(generics.ListCreateAPIView):
    """
    List all tickets or create a new ticket.
    """
    serializer_class = TicketSerializer
    permission_classes = [IsOrgMember]

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.filter(issue__vehicle__org=user.company)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by priority if provided
        priority_filter = self.request.query_params.get('priority')
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        
        # Filter by assignee if provided
        assignee_filter = self.request.query_params.get('assignee')
        if assignee_filter:
            queryset = queryset.filter(assignee_id=assignee_filter)
        
        # Filter by vehicle if provided
        vehicle_filter = self.request.query_params.get('vehicle')
        if vehicle_filter:
            queryset = queryset.filter(issue__vehicle_id=vehicle_filter)
        
        return queryset.select_related('issue__vehicle', 'assignee').order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketSerializer

    def perform_create(self, serializer):
        serializer.save()


class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a ticket.
    """
    serializer_class = TicketSerializer
    permission_classes = [IsOrgMember]
    lookup_field = 'id'

    def get_queryset(self):
        return Ticket.objects.filter(issue__vehicle__org=self.request.user.company)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TicketUpdateSerializer
        return TicketSerializer


class TicketStatsView(generics.GenericAPIView):
    """
    Get ticket statistics for the organization.
    """
    permission_classes = [IsOrgMember]

    def get(self, request):
        user = request.user
        tickets = Ticket.objects.filter(issue__vehicle__org=user.company)
        
        stats = {
            'total': tickets.count(),
            'by_status': dict(tickets.values('status').annotate(count=Count('id')).values_list('status', 'count')),
            'by_priority': dict(tickets.values('priority').annotate(count=Count('id')).values_list('priority', 'count')),
            'open_tickets': tickets.filter(status__in=['OPEN', 'ASSIGNED', 'IN_PROGRESS']).count(),
            'urgent_tickets': tickets.filter(priority='URGENT', status__in=['OPEN', 'ASSIGNED', 'IN_PROGRESS']).count(),
            'overdue_tickets': tickets.filter(due_at__isnull=False, due_at__lt=timezone.now(), status__in=['OPEN', 'ASSIGNED', 'IN_PROGRESS']).count(),
        }
        
        return Response(stats)