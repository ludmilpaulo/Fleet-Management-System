from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Vehicle, KeyTracker, Shift, ShiftEndChecklist
from account.serializers import CompanySerializer

User = get_user_model()


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for Vehicle model"""
    
    org_name = serializers.CharField(source='org.name', read_only=True)
    key_tracker = serializers.SerializerMethodField()
    current_shift = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'org', 'org_name', 'vin', 'reg_number', 'make', 'model', 'year',
            'color', 'status', 'mileage', 'fuel_type', 'engine_size', 'transmission',
            'created_at', 'updated_at', 'created_by', 'key_tracker', 'current_shift'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_key_tracker(self, obj):
        """Get key tracker information"""
        try:
            tracker = obj.key_tracker
            return {
                'id': tracker.id,
                'ble_id': tracker.ble_id,
                'label': tracker.label,
                'last_seen_at': tracker.last_seen_at,
                'last_rssi': tracker.last_rssi,
                'is_active': tracker.is_active,
            }
        except:
            return None
    
    def get_current_shift(self, obj):
        """Get current active shift"""
        try:
            shift = obj.shifts.filter(status='ACTIVE').latest('start_at')
            return {
                'id': shift.id,
                'driver': shift.driver.username,
                'driver_name': shift.driver.full_name,
                'start_at': shift.start_at,
                'start_location': {
                    'lat': shift.start_lat,
                    'lng': shift.start_lng,
                    'address': shift.start_address,
                }
            }
        except:
            return None


class VehicleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vehicles"""
    
    class Meta:
        model = Vehicle
        fields = [
            'vin', 'reg_number', 'make', 'model', 'year', 'color',
            'mileage', 'fuel_type', 'engine_size', 'transmission', 'status'
        ]
    
    def validate_reg_number(self, value):
        """Validate registration number uniqueness within organization"""
        request = self.context.get('request')
        if request and request.user and hasattr(request.user, 'company') and request.user.company:
            org = request.user.company
            if Vehicle.objects.filter(org=org, reg_number=value).exists():
                raise serializers.ValidationError("A vehicle with this registration number already exists.")
        return value


class KeyTrackerSerializer(serializers.ModelSerializer):
    """Serializer for KeyTracker model"""
    
    vehicle_reg = serializers.CharField(source='vehicle.reg_number', read_only=True)
    vehicle_make_model = serializers.SerializerMethodField()
    
    class Meta:
        model = KeyTracker
        fields = [
            'id', 'vehicle', 'vehicle_reg', 'vehicle_make_model', 'ble_id', 'label',
            'last_seen_at', 'last_rssi', 'last_lat', 'last_lng', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_vehicle_make_model(self, obj):
        """Get vehicle make and model"""
        return f"{obj.vehicle.make} {obj.vehicle.model}"


class KeyTrackerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating key trackers"""
    
    class Meta:
        model = KeyTracker
        fields = ['vehicle', 'ble_id', 'label']
    
    def validate_ble_id(self, value):
        """Validate BLE ID uniqueness"""
        if KeyTracker.objects.filter(ble_id=value).exists():
            raise serializers.ValidationError("A key tracker with this BLE ID already exists.")
        return value


class ShiftSerializer(serializers.ModelSerializer):
    """Serializer for Shift model"""
    
    vehicle_reg = serializers.CharField(source='vehicle.reg_number', read_only=True)
    vehicle_make_model = serializers.SerializerMethodField()
    driver_name = serializers.CharField(source='driver.full_name', read_only=True)
    driver_username = serializers.CharField(source='driver.username', read_only=True)
    duration = serializers.SerializerMethodField()
    inspection_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Shift
        fields = [
            'id', 'vehicle', 'vehicle_reg', 'vehicle_make_model', 'driver', 'driver_name',
            'driver_username', 'start_at', 'end_at', 'start_lat', 'start_lng', 'start_address',
            'end_lat', 'end_lng', 'end_address', 'status', 'notes', 'duration',
            'inspection_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_vehicle_make_model(self, obj):
        """Get vehicle make and model"""
        return f"{obj.vehicle.make} {obj.vehicle.model}"
    
    def get_duration(self, obj):
        """Calculate shift duration"""
        if obj.end_at and obj.start_at:
            duration = obj.end_at - obj.start_at
            return str(duration)
        return None
    
    def get_inspection_count(self, obj):
        """Get number of inspections for this shift"""
        return obj.inspections.count()


class ShiftCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating shifts"""
    
    class Meta:
        model = Shift
        fields = [
            'vehicle', 'driver', 'start_at', 'end_at', 'start_lat', 'start_lng', 
            'start_address', 'end_lat', 'end_lng', 'end_address', 'status', 'notes'
        ]
    
    def validate_vehicle(self, value):
        """Validate vehicle belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.org != user_org:
            raise serializers.ValidationError("Vehicle does not belong to your organization.")
        return value
    
    def validate_driver(self, value):
        """Validate driver belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.company != user_org:
            raise serializers.ValidationError("Driver does not belong to your organization.")
        return value


class ShiftEndSerializer(serializers.ModelSerializer):
    """Serializer for ending shifts"""
    
    class Meta:
        model = Shift
        fields = ['end_lat', 'end_lng', 'end_address', 'notes']
    
    def update(self, instance, validated_data):
        """Update shift with end data"""
        from django.utils import timezone
        instance.end_at = timezone.now()
        return super().update(instance, validated_data)


class ShiftEndChecklistSerializer(serializers.ModelSerializer):
    """Serializer for shift end checklist with photo uploads"""
    
    class Meta:
        model = ShiftEndChecklist
        fields = [
            'id', 'shift', 'parking_lat', 'parking_lng', 'parking_address',
            'fuel_level_photo', 'fuel_level_detected', 'fuel_level_manual',
            'photo_front', 'photo_back', 'photo_left', 'photo_right',
            'scratches_noted', 'damage_description', 'completed_at', 'completed_by'
        ]
        read_only_fields = ['id', 'completed_at', 'completed_by']
    
    def create(self, validated_data):
        """Create checklist and process fuel level photo with ML"""
        checklist = ShiftEndChecklist.objects.create(**validated_data)
        
        # Process fuel level photo with ML if provided
        if checklist.fuel_level_photo:
            from .ml_services import detect_fuel_level
            try:
                fuel_level = detect_fuel_level(checklist.fuel_level_photo.path)
                checklist.fuel_level_detected = fuel_level
                checklist.save()
            except Exception as e:
                # Log error but don't fail the checklist creation
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Fuel level detection failed: {str(e)}")
        
        return checklist


class ShiftEndChecklistCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating shift end checklist from mobile app"""
    
    class Meta:
        model = ShiftEndChecklist
        fields = [
            'shift', 'parking_lat', 'parking_lng', 'parking_address',
            'fuel_level_photo', 'fuel_level_manual',
            'photo_front', 'photo_back', 'photo_left', 'photo_right',
            'scratches_noted', 'damage_description'
        ]
    
    def validate_shift(self, value):
        """Validate shift belongs to user's organization and is active"""
        user = self.context['request'].user
        if value.vehicle.org != user.company:
            raise serializers.ValidationError("Shift does not belong to your organization.")
        if value.status != 'ACTIVE':
            raise serializers.ValidationError("Shift is not active.")
        return value
    
    def create(self, validated_data):
        """Create checklist and process photos"""
        validated_data['completed_by'] = self.context['request'].user
        checklist = ShiftEndChecklist.objects.create(**validated_data)
        
        # Process fuel level photo with ML if provided
        if checklist.fuel_level_photo:
            from .ml_services import detect_fuel_level
            try:
                fuel_level = detect_fuel_level(checklist.fuel_level_photo.path)
                checklist.fuel_level_detected = fuel_level
                checklist.save()
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Fuel level detection failed: {str(e)}")
        
        return checklist




class VehicleStatsSerializer(serializers.Serializer):
    """Serializer for vehicle statistics"""
    
    total_vehicles = serializers.IntegerField()
    active_vehicles = serializers.IntegerField()
    maintenance_vehicles = serializers.IntegerField()
    inactive_vehicles = serializers.IntegerField()
    vehicles_by_status = serializers.DictField()
    vehicles_by_fuel_type = serializers.DictField()
    average_mileage = serializers.FloatField()
    total_mileage = serializers.IntegerField()


class ShiftStatsSerializer(serializers.Serializer):
    """Serializer for shift statistics"""
    
    total_shifts = serializers.IntegerField()
    active_shifts = serializers.IntegerField()
    completed_shifts = serializers.IntegerField()
    shifts_by_status = serializers.DictField()
    average_duration = serializers.DurationField()
    total_duration = serializers.DurationField()
