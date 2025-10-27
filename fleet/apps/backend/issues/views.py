from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Issue
from .serializers import IssueSerializer, IssueCreateSerializer, IssueUpdateSerializer
from fleet_app.permissions import IsOrgMember, IsOrgAdminOrReadOnly


class IssueListView(generics.ListCreateAPIView):
    """
    List all issues or create a new issue.
    """
    serializer_class = IssueSerializer
    permission_classes = [IsOrgMember]

    def get_queryset(self):
        user = self.request.user
        queryset = Issue.objects.filter(vehicle__org=user.company)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by severity if provided
        severity_filter = self.request.query_params.get('severity')
        if severity_filter:
            queryset = queryset.filter(severity=severity_filter)
        
        # Filter by vehicle if provided
        vehicle_filter = self.request.query_params.get('vehicle')
        if vehicle_filter:
            queryset = queryset.filter(vehicle_id=vehicle_filter)
        
        return queryset.select_related('vehicle', 'inspection_item').order_by('-reported_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return IssueCreateSerializer
        return IssueSerializer

    def perform_create(self, serializer):
        serializer.save()


class IssueDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an issue.
    """
    serializer_class = IssueSerializer
    permission_classes = [IsOrgMember]
    lookup_field = 'id'

    def get_queryset(self):
        return Issue.objects.filter(vehicle__org=self.request.user.company)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return IssueUpdateSerializer
        return IssueSerializer


class IssueStatsView(generics.GenericAPIView):
    """
    Get issue statistics for the organization.
    """
    permission_classes = [IsOrgMember]

    def get(self, request):
        user = request.user
        issues = Issue.objects.filter(vehicle__org=user.company)
        
        stats = {
            'total': issues.count(),
            'by_status': dict(issues.values('status').annotate(count=Count('id')).values_list('status', 'count')),
            'by_severity': dict(issues.values('severity').annotate(count=Count('id')).values_list('severity', 'count')),
            'open_issues': issues.filter(status__in=['OPEN', 'IN_PROGRESS']).count(),
            'critical_issues': issues.filter(severity='CRITICAL', status__in=['OPEN', 'IN_PROGRESS']).count(),
        }
        
        return Response(stats)