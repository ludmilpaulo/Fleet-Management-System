from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Inspection, InspectionItem, Photo, InspectionTemplate, InspectionTemplateItem
from fleet_app.serializers import ShiftSerializer

User = get_user_model()


class InspectionItemSerializer(serializers.ModelSerializer):
    """Serializer for InspectionItem model"""
    
    photos_count = serializers.SerializerMethodField()
    issues_count = serializers.SerializerMethodField()
    
    class Meta:
        model = InspectionItem
        fields = [
            'id', 'inspection', 'part', 'status', 'notes', 'photos_count',
            'issues_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_photos_count(self, obj):
        """Get number of photos for this item"""
        return obj.photos.count()
    
    def get_issues_count(self, obj):
        """Get number of issues for this item"""
        return obj.issues.count()


class PhotoSerializer(serializers.ModelSerializer):
    """Serializer for Photo model"""
    
    inspection_vehicle = serializers.CharField(source='inspection.shift.vehicle.reg_number', read_only=True)
    inspection_type = serializers.CharField(source='inspection.type', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    
    class Meta:
        model = Photo
        fields = [
            'id', 'inspection', 'inspection_vehicle', 'inspection_type', 'inspection_item',
            'part', 'angle', 'file_key', 'file_url', 'width', 'height', 'file_size',
            'mime_type', 'taken_at', 'gps_lat', 'gps_lng', 'camera_make', 'camera_model',
            'uploaded_at', 'uploaded_by', 'uploaded_by_name'
        ]
        read_only_fields = ['id', 'uploaded_at']


class PhotoCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating photos"""
    
    class Meta:
        model = Photo
        fields = [
            'inspection', 'inspection_item', 'part', 'angle', 'file_key', 'file_url',
            'width', 'height', 'file_size', 'mime_type', 'taken_at', 'gps_lat',
            'gps_lng', 'camera_make', 'camera_model'
        ]
    
    def validate_inspection(self, value):
        """Validate inspection belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.shift.vehicle.org != user_org:
            raise serializers.ValidationError("Inspection does not belong to your organization.")
        return value


class InspectionSerializer(serializers.ModelSerializer):
    """Serializer for Inspection model"""
    
    shift_data = ShiftSerializer(source='shift', read_only=True)
    vehicle_reg = serializers.CharField(source='shift.vehicle.reg_number', read_only=True)
    vehicle_make_model = serializers.SerializerMethodField()
    driver_name = serializers.CharField(source='shift.driver.full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    items = InspectionItemSerializer(many=True, read_only=True)
    photos = PhotoSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    photos_count = serializers.SerializerMethodField()
    failed_items_count = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Inspection
        fields = [
            'id', 'shift', 'shift_data', 'vehicle_reg', 'vehicle_make_model', 'driver_name',
            'type', 'started_at', 'completed_at', 'status', 'notes', 'weather_conditions',
            'temperature', 'lat', 'lng', 'address', 'created_by', 'created_by_name',
            'updated_at', 'items', 'photos', 'items_count', 'photos_count',
            'failed_items_count', 'duration'
        ]
        read_only_fields = ['id', 'started_at', 'updated_at']
    
    def get_vehicle_make_model(self, obj):
        """Get vehicle make and model"""
        return f"{obj.shift.vehicle.make} {obj.shift.vehicle.model}"
    
    def get_items_count(self, obj):
        """Get number of inspection items"""
        return obj.items.count()
    
    def get_photos_count(self, obj):
        """Get number of photos"""
        return obj.photos.count()
    
    def get_failed_items_count(self, obj):
        """Get number of failed items"""
        return obj.items.filter(status='FAIL').count()
    
    def get_duration(self, obj):
        """Calculate inspection duration"""
        if obj.completed_at and obj.started_at:
            duration = obj.completed_at - obj.started_at
            return str(duration)
        return None


class InspectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating inspections"""
    
    class Meta:
        model = Inspection
        fields = [
            'shift', 'type', 'notes', 'weather_conditions', 'temperature',
            'lat', 'lng', 'address'
        ]
    
    def validate_shift(self, value):
        """Validate shift belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.vehicle.org != user_org:
            raise serializers.ValidationError("Shift does not belong to your organization.")
        return value
    
    def validate(self, data):
        """Validate inspection data"""
        shift = data['shift']
        inspection_type = data['type']
        
        # Check if inspection of this type already exists for this shift
        if Inspection.objects.filter(shift=shift, type=inspection_type).exists():
            raise serializers.ValidationError(f"{inspection_type} inspection already exists for this shift.")
        
        return data


class InspectionCompleteSerializer(serializers.ModelSerializer):
    """Serializer for completing inspections"""
    
    class Meta:
        model = Inspection
        fields = ['status', 'notes']
    
    def validate_status(self, value):
        """Validate status"""
        if value not in ['PASS', 'FAIL']:
            raise serializers.ValidationError("Status must be either PASS or FAIL.")
        return value
    
    def update(self, instance, validated_data):
        """Update inspection with completion data"""
        from django.utils import timezone
        instance.completed_at = timezone.now()
        return super().update(instance, validated_data)


class InspectionTemplateItemSerializer(serializers.ModelSerializer):
    """Serializer for InspectionTemplateItem model"""
    
    class Meta:
        model = InspectionTemplateItem
        fields = [
            'id', 'template', 'part', 'is_required', 'order', 'description'
        ]
        read_only_fields = ['id']


class InspectionTemplateSerializer(serializers.ModelSerializer):
    """Serializer for InspectionTemplate model"""
    
    items = InspectionTemplateItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = InspectionTemplate
        fields = [
            'id', 'name', 'description', 'is_default', 'is_active', 'items',
            'items_count', 'created_at', 'updated_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_items_count(self, obj):
        """Get number of template items"""
        return obj.items.count()


class InspectionTemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating inspection templates"""
    
    items = InspectionTemplateItemSerializer(many=True, required=False)
    
    class Meta:
        model = InspectionTemplate
        fields = ['name', 'description', 'is_default', 'is_active', 'items']
    
    def create(self, validated_data):
        """Create template with items"""
        items_data = validated_data.pop('items', [])
        template = InspectionTemplate.objects.create(**validated_data)
        
        for item_data in items_data:
            InspectionTemplateItem.objects.create(template=template, **item_data)
        
        return template


class InspectionStatsSerializer(serializers.Serializer):
    """Serializer for inspection statistics"""
    
    total_inspections = serializers.IntegerField()
    start_inspections = serializers.IntegerField()
    end_inspections = serializers.IntegerField()
    passed_inspections = serializers.IntegerField()
    failed_inspections = serializers.IntegerField()
    inspections_by_status = serializers.DictField()
    inspections_by_type = serializers.DictField()
    average_duration = serializers.DurationField()
    total_photos = serializers.IntegerField()
    failed_items_by_part = serializers.DictField()


class InspectionSummarySerializer(serializers.Serializer):
    """Serializer for inspection summary"""
    
    vehicle_reg = serializers.CharField()
    vehicle_make_model = serializers.CharField()
    driver_name = serializers.CharField()
    inspection_type = serializers.CharField()
    status = serializers.CharField()
    started_at = serializers.DateTimeField()
    completed_at = serializers.DateTimeField()
    duration = serializers.DurationField()
    photos_count = serializers.IntegerField()
    failed_items_count = serializers.IntegerField()
    failed_parts = serializers.ListField()
