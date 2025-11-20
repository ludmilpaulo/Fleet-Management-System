from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, VehicleLocation, VehicleTelemetry, Geofence, GeofenceEvent, SystemAlert, ParkingLog, AuditLog
from fleet_app.serializers import VehicleSerializer

User = get_user_model()


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    vehicle_reg = serializers.CharField(source='vehicle.reg_number', read_only=True)
    vehicle_make_model = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'vehicle', 'vehicle_reg', 'vehicle_make_model', 'type',
            'title', 'message', 'priority', 'status', 'payload', 'sent_at',
            'delivered_at', 'read_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_vehicle_make_model(self, obj):
        """Get vehicle make and model"""
        if obj.vehicle:
            return f"{obj.vehicle.make} {obj.vehicle.model}"
        return None


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications"""
    
    class Meta:
        model = Notification
        fields = [
            'user', 'vehicle', 'type', 'title', 'message', 'priority', 'payload'
        ]
    
    def validate_user(self, value):
        """Validate user belongs to the same organization"""
        user_org = self.context['request'].user.company
        if value.company != user_org:
            raise serializers.ValidationError("User does not belong to your organization.")
        return value
    
    def validate_vehicle(self, value):
        """Validate vehicle belongs to user's organization"""
        if value:
            user_org = self.context['request'].user.company
            if value.org != user_org:
                raise serializers.ValidationError("Vehicle does not belong to your organization.")
        return value


class VehicleLocationSerializer(serializers.ModelSerializer):
    """Serializer for VehicleLocation model"""
    
    vehicle_reg = serializers.CharField(source='vehicle.reg_number', read_only=True)
    vehicle_make_model = serializers.SerializerMethodField()
    recorded_by_name = serializers.CharField(source='recorded_by.full_name', read_only=True)
    driver_name = serializers.SerializerMethodField()
    driver_id = serializers.SerializerMethodField()
    shift_id = serializers.SerializerMethodField()
    
    class Meta:
        model = VehicleLocation
        fields = [
            'id', 'vehicle', 'vehicle_reg', 'vehicle_make_model', 'lat', 'lng',
            'address', 'accuracy', 'speed', 'heading', 'altitude', 'recorded_at',
            'recorded_by', 'recorded_by_name', 'driver_name', 'driver_id', 'shift_id'
        ]
        read_only_fields = ['id', 'recorded_at']
    
    def get_vehicle_make_model(self, obj):
        """Get vehicle make and model"""
        return f"{obj.vehicle.make} {obj.vehicle.model}"
    
    def get_driver_name(self, obj):
        """Get driver name from active shift"""
        from fleet_app.models import Shift
        shift = Shift.objects.filter(
            vehicle=obj.vehicle,
            status='ACTIVE'
        ).first()
        if shift:
            return shift.driver.full_name or shift.driver.username
        return None
    
    def get_driver_id(self, obj):
        """Get driver ID from active shift"""
        from fleet_app.models import Shift
        shift = Shift.objects.filter(
            vehicle=obj.vehicle,
            status='ACTIVE'
        ).first()
        if shift:
            return shift.driver.id
        return None
    
    def get_shift_id(self, obj):
        """Get shift ID from active shift"""
        from fleet_app.models import Shift
        shift = Shift.objects.filter(
            vehicle=obj.vehicle,
            status='ACTIVE'
        ).first()
        if shift:
            return shift.id
        return None


class VehicleLocationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vehicle locations"""
    
    class Meta:
        model = VehicleLocation
        fields = [
            'vehicle', 'lat', 'lng', 'address', 'accuracy', 'speed', 'heading', 'altitude'
        ]
    
    def validate_vehicle(self, value):
        """Validate vehicle belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.org != user_org:
            raise serializers.ValidationError("Vehicle does not belong to your organization.")
        return value


class VehicleTelemetrySerializer(serializers.ModelSerializer):
    """Serializer for VehicleTelemetry model"""
    
    vehicle_reg = serializers.CharField(source='vehicle.reg_number', read_only=True)
    vehicle_make_model = serializers.SerializerMethodField()
    
    class Meta:
        model = VehicleTelemetry
        fields = [
            'id', 'vehicle', 'vehicle_reg', 'vehicle_make_model', 'engine_rpm',
            'engine_temp', 'coolant_temp', 'fuel_level', 'fuel_consumption',
            'odometer', 'speed', 'battery_voltage', 'diagnostic_codes',
            'check_engine_light', 'recorded_at'
        ]
        read_only_fields = ['id', 'recorded_at']
    
    def get_vehicle_make_model(self, obj):
        """Get vehicle make and model"""
        return f"{obj.vehicle.make} {obj.vehicle.model}"


class VehicleTelemetryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vehicle telemetry"""
    
    class Meta:
        model = VehicleTelemetry
        fields = [
            'vehicle', 'engine_rpm', 'engine_temp', 'coolant_temp', 'fuel_level',
            'fuel_consumption', 'odometer', 'speed', 'battery_voltage',
            'diagnostic_codes', 'check_engine_light'
        ]
    
    def validate_vehicle(self, value):
        """Validate vehicle belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.org != user_org:
            raise serializers.ValidationError("Vehicle does not belong to your organization.")
        return value


class GeofenceSerializer(serializers.ModelSerializer):
    """Serializer for Geofence model"""
    
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    events_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Geofence
        fields = [
            'id', 'name', 'description', 'type', 'status', 'center_lat', 'center_lng',
            'radius', 'alert_on_entry', 'alert_on_exit', 'restrict_entry', 'restrict_exit',
            'created_at', 'updated_at', 'created_by', 'created_by_name', 'events_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_events_count(self, obj):
        """Get number of events for this geofence"""
        return obj.events.count()


class GeofenceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating geofences"""
    
    class Meta:
        model = Geofence
        fields = [
            'name', 'description', 'type', 'center_lat', 'center_lng', 'radius',
            'alert_on_entry', 'alert_on_exit', 'restrict_entry', 'restrict_exit'
        ]


class GeofenceEventSerializer(serializers.ModelSerializer):
    """Serializer for GeofenceEvent model"""
    
    vehicle_reg = serializers.CharField(source='vehicle.reg_number', read_only=True)
    vehicle_make_model = serializers.SerializerMethodField()
    geofence_name = serializers.CharField(source='geofence.name', read_only=True)
    
    class Meta:
        model = GeofenceEvent
        fields = [
            'id', 'vehicle', 'vehicle_reg', 'vehicle_make_model', 'geofence',
            'geofence_name', 'event_type', 'lat', 'lng', 'occurred_at'
        ]
        read_only_fields = ['id', 'occurred_at']
    
    def get_vehicle_make_model(self, obj):
        """Get vehicle make and model"""
        return f"{obj.vehicle.make} {obj.vehicle.model}"


class SystemAlertSerializer(serializers.ModelSerializer):
    """Serializer for SystemAlert model"""
    
    resolved_by_name = serializers.CharField(source='resolved_by.full_name', read_only=True)
    days_open = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemAlert
        fields = [
            'id', 'type', 'severity', 'title', 'message', 'status', 'data',
            'created_at', 'updated_at', 'resolved_at', 'resolved_by', 'resolved_by_name',
            'days_open'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_days_open(self, obj):
        """Calculate days since alert was created"""
        if obj.resolved_at:
            return (obj.resolved_at - obj.created_at).days
        from django.utils import timezone
        return (timezone.now() - obj.created_at).days


class SystemAlertCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating system alerts"""
    
    class Meta:
        model = SystemAlert
        fields = ['type', 'severity', 'title', 'message', 'data']


class SystemAlertUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating system alerts"""
    
    class Meta:
        model = SystemAlert
        fields = ['status', 'message']
    
    def update(self, instance, validated_data):
        """Update alert with resolution tracking"""
        if validated_data.get('status') == 'RESOLVED':
            from django.utils import timezone
            instance.resolved_at = timezone.now()
            instance.resolved_by = self.context['request'].user
        
        return super().update(instance, validated_data)


class TelemetryStatsSerializer(serializers.Serializer):
    """Serializer for telemetry statistics"""
    
    total_notifications = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    notifications_by_type = serializers.DictField()
    notifications_by_priority = serializers.DictField()
    
    total_locations = serializers.IntegerField()
    active_vehicles = serializers.IntegerField()
    vehicles_with_location = serializers.IntegerField()
    
    total_telemetry_records = serializers.IntegerField()
    vehicles_with_telemetry = serializers.IntegerField()
    check_engine_alerts = serializers.IntegerField()
    
    total_geofences = serializers.IntegerField()
    active_geofences = serializers.IntegerField()
    geofence_violations = serializers.IntegerField()
    
    total_system_alerts = serializers.IntegerField()
    active_system_alerts = serializers.IntegerField()
    alerts_by_severity = serializers.DictField()


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    
    # Vehicle stats
    total_vehicles = serializers.IntegerField()
    active_vehicles = serializers.IntegerField()
    maintenance_vehicles = serializers.IntegerField()
    
    # Shift stats
    active_shifts = serializers.IntegerField()
    completed_shifts_today = serializers.IntegerField()
    
    # Inspection stats
    inspections_today = serializers.IntegerField()
    failed_inspections_today = serializers.IntegerField()
    
    # Issue stats
    open_issues = serializers.IntegerField()
    critical_issues = serializers.IntegerField()
    overdue_issues = serializers.IntegerField()
    
    # Ticket stats
    open_tickets = serializers.IntegerField()
    overdue_tickets = serializers.IntegerField()
    completed_tickets_today = serializers.IntegerField()
    
    # Notification stats
    unread_notifications = serializers.IntegerField()
    urgent_notifications = serializers.IntegerField()
    
    # System stats
    active_system_alerts = serializers.IntegerField()
    critical_system_alerts = serializers.IntegerField()


class ParkingLogSerializer(serializers.ModelSerializer):
    """Serializer for ParkingLog model"""
    
    vehicle_reg = serializers.CharField(source='vehicle.reg_number', read_only=True)
    vehicle_make_model = serializers.SerializerMethodField()
    shift_id = serializers.IntegerField(source='shift.id', read_only=True)
    
    class Meta:
        model = ParkingLog
        fields = [
            'id', 'vehicle', 'vehicle_reg', 'vehicle_make_model', 'shift', 'shift_id',
            'lat', 'lng', 'address', 'captured_at'
        ]
        read_only_fields = ['id', 'captured_at']
    
    def get_vehicle_make_model(self, obj):
        """Get vehicle make and model"""
        return f"{obj.vehicle.make} {obj.vehicle.model}"


class ParkingLogCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating parking logs"""
    
    class Meta:
        model = ParkingLog
        fields = ['vehicle', 'shift', 'lat', 'lng', 'address']
    
    def validate_vehicle(self, value):
        """Validate vehicle belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.org != user_org:
            raise serializers.ValidationError("Vehicle does not belong to your organization.")
        return value


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for AuditLog model"""
    
    actor_name = serializers.CharField(source='actor.full_name', read_only=True)
    actor_username = serializers.CharField(source='actor.username', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'actor', 'actor_name', 'actor_username', 'action', 'entity',
            'entity_id', 'meta', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
