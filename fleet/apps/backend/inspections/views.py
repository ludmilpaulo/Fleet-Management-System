from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Count
from .models import Inspection, InspectionItem, Photo, InspectionTemplate
from .serializers import (
    InspectionSerializer, InspectionCreateSerializer, InspectionCompleteSerializer,
    InspectionItemSerializer, PhotoSerializer, PhotoCreateSerializer,
    InspectionTemplateSerializer, InspectionTemplateCreateSerializer
)
from fleet_app.permissions import IsOrgMember, IsInspectorOrAdmin


class InspectionListView(generics.ListCreateAPIView):
    """List and create inspections"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    
    def get_queryset(self):
        """Filter inspections by user's organization"""
        return Inspection.objects.filter(shift__vehicle__org=self.request.user.company).order_by('-started_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InspectionCreateSerializer
        return InspectionSerializer


class InspectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an inspection"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    
    def get_queryset(self):
        """Filter inspections by user's organization"""
        return Inspection.objects.filter(shift__vehicle__org=self.request.user.company)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return InspectionCompleteSerializer
        return InspectionSerializer


class InspectionCompleteView(generics.UpdateAPIView):
    """Complete an inspection"""
    permission_classes = [permissions.IsAuthenticated, IsInspectorOrAdmin]
    serializer_class = InspectionCompleteSerializer
    
    def get_queryset(self):
        """Filter inspections by user's organization"""
        return Inspection.objects.filter(shift__vehicle__org=self.request.user.company)


class InspectionItemListView(generics.ListCreateAPIView):
    """List and create inspection items"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    serializer_class = InspectionItemSerializer
    
    def get_queryset(self):
        """Filter inspection items by user's organization"""
        return InspectionItem.objects.filter(inspection__shift__vehicle__org=self.request.user.company)


class InspectionItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an inspection item"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    serializer_class = InspectionItemSerializer
    
    def get_queryset(self):
        """Filter inspection items by user's organization"""
        return InspectionItem.objects.filter(inspection__shift__vehicle__org=self.request.user.company)


class PhotoListView(generics.ListCreateAPIView):
    """List and create photos"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    
    def get_queryset(self):
        """Filter photos by user's organization"""
        return Photo.objects.filter(inspection__shift__vehicle__org=self.request.user.company).order_by('-taken_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PhotoCreateSerializer
        return PhotoSerializer


class PhotoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a photo"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    serializer_class = PhotoSerializer
    
    def get_queryset(self):
        """Filter photos by user's organization"""
        return Photo.objects.filter(inspection__shift__vehicle__org=self.request.user.company)


class PhotoConfirmView(generics.CreateAPIView):
    """Confirm photo upload"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    serializer_class = PhotoCreateSerializer


class InspectionTemplateListView(generics.ListCreateAPIView):
    """List and create inspection templates"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    
    def get_queryset(self):
        """Filter templates by user's organization"""
        return InspectionTemplate.objects.filter(is_active=True).order_by('name')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InspectionTemplateCreateSerializer
        return InspectionTemplateSerializer


class InspectionTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an inspection template"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    serializer_class = InspectionTemplateSerializer
    
    def get_queryset(self):
        """Filter templates by user's organization"""
        return InspectionTemplate.objects.filter(is_active=True)


class InspectionStatsView(generics.ListAPIView):
    """Get inspection statistics"""
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    
    def get(self, request, *args, **kwargs):
        """Return inspection statistics"""
        org = request.user.company
        
        # Basic counts
        total_inspections = Inspection.objects.filter(shift__vehicle__org=org).count()
        start_inspections = Inspection.objects.filter(shift__vehicle__org=org, type='START').count()
        end_inspections = Inspection.objects.filter(shift__vehicle__org=org, type='END').count()
        passed_inspections = Inspection.objects.filter(shift__vehicle__org=org, status='PASS').count()
        failed_inspections = Inspection.objects.filter(shift__vehicle__org=org, status='FAIL').count()
        
        # Status breakdown
        inspections_by_status = dict(Inspection.objects.filter(shift__vehicle__org=org).values_list('status').annotate(count=Count('id')))
        
        # Type breakdown
        inspections_by_type = dict(Inspection.objects.filter(shift__vehicle__org=org).values_list('type').annotate(count=Count('id')))
        
        # Total photos
        total_photos = Photo.objects.filter(inspection__shift__vehicle__org=org).count()
        
        # Failed items by part
        failed_items_by_part = dict(
            InspectionItem.objects.filter(
                inspection__shift__vehicle__org=org,
                status='FAIL'
            ).values_list('part').annotate(count=Count('id'))
        )
        
        stats = {
            'total_inspections': total_inspections,
            'start_inspections': start_inspections,
            'end_inspections': end_inspections,
            'passed_inspections': passed_inspections,
            'failed_inspections': failed_inspections,
            'inspections_by_status': inspections_by_status,
            'inspections_by_type': inspections_by_type,
            'total_photos': total_photos,
            'failed_items_by_part': failed_items_by_part,
        }
        
        return Response(stats)