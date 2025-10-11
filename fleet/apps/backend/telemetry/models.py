from django.db import models
from django.contrib.auth import get_user_model
from fleet_app.models import Vehicle

User = get_user_model()


class Notification(models.Model):
    """System notifications"""
    
    TYPE_CHOICES = [
        ('INSPECTION_FAILED', 'Inspection Failed'),
        ('TICKET_ASSIGNED', 'Ticket Assigned'),
        ('TICKET_OVERDUE', 'Ticket Overdue'),
        ('SHIFT_STARTED', 'Shift Started'),
        ('SHIFT_ENDED', 'Shift Ended'),
        ('MAINTENANCE_DUE', 'Maintenance Due'),
        ('VEHICLE_LOCATION', 'Vehicle Location'),
        ('SYSTEM_ALERT', 'System Alert'),
        ('OTHER', 'Other'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('FAILED', 'Failed'),
        ('READ', 'Read'),
    ]
    
    # Relationships
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    
    # Notification details
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    
    # Payload data
    payload = models.JSONField(default=dict, blank=True)
    
    # Delivery tracking
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['type', 'priority']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


class VehicleLocation(models.Model):
    """Vehicle location tracking"""
    
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='locations')
    
    # Location data
    lat = models.FloatField()
    lng = models.FloatField()
    address = models.TextField(blank=True)
    accuracy = models.FloatField(null=True, blank=True, help_text="GPS accuracy in meters")
    
    # Movement data
    speed = models.FloatField(null=True, blank=True, help_text="Speed in km/h")
    heading = models.FloatField(null=True, blank=True, help_text="Heading in degrees")
    altitude = models.FloatField(null=True, blank=True, help_text="Altitude in meters")
    
    # Metadata
    recorded_at = models.DateTimeField(auto_now_add=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['vehicle', 'recorded_at']),
            models.Index(fields=['recorded_at']),
        ]
    
    def __str__(self):
        return f"{self.vehicle.reg_number} at {self.lat}, {self.lng}"


class VehicleTelemetry(models.Model):
    """Vehicle telemetry data"""
    
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='telemetry')
    
    # Engine data
    engine_rpm = models.PositiveIntegerField(null=True, blank=True)
    engine_temp = models.FloatField(null=True, blank=True, help_text="Engine temperature in Celsius")
    coolant_temp = models.FloatField(null=True, blank=True, help_text="Coolant temperature in Celsius")
    
    # Fuel data
    fuel_level = models.FloatField(null=True, blank=True, help_text="Fuel level percentage")
    fuel_consumption = models.FloatField(null=True, blank=True, help_text="Fuel consumption in L/100km")
    
    # Vehicle data
    odometer = models.PositiveIntegerField(null=True, blank=True, help_text="Odometer reading in km")
    speed = models.FloatField(null=True, blank=True, help_text="Speed in km/h")
    battery_voltage = models.FloatField(null=True, blank=True, help_text="Battery voltage")
    
    # Diagnostic data
    diagnostic_codes = models.JSONField(default=list, blank=True, help_text="OBD diagnostic codes")
    check_engine_light = models.BooleanField(default=False)
    
    # Metadata
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['vehicle', 'recorded_at']),
            models.Index(fields=['recorded_at']),
        ]
    
    def __str__(self):
        return f"{self.vehicle.reg_number} telemetry at {self.recorded_at}"


class Geofence(models.Model):
    """Geofencing for vehicles"""
    
    TYPE_CHOICES = [
        ('DEPOT', 'Depot'),
        ('CUSTOMER', 'Customer Location'),
        ('RESTRICTED', 'Restricted Area'),
        ('PARKING', 'Parking Area'),
        ('OTHER', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('SUSPENDED', 'Suspended'),
    ]
    
    # Geofence details
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='OTHER')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Location data
    center_lat = models.FloatField()
    center_lng = models.FloatField()
    radius = models.FloatField(help_text="Radius in meters")
    
    # Behavior
    alert_on_entry = models.BooleanField(default=False)
    alert_on_exit = models.BooleanField(default=False)
    restrict_entry = models.BooleanField(default=False)
    restrict_exit = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class GeofenceEvent(models.Model):
    """Geofence entry/exit events"""
    
    EVENT_CHOICES = [
        ('ENTRY', 'Entry'),
        ('EXIT', 'Exit'),
    ]
    
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='geofence_events')
    geofence = models.ForeignKey(Geofence, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=5, choices=EVENT_CHOICES)
    
    # Location data
    lat = models.FloatField()
    lng = models.FloatField()
    
    # Metadata
    occurred_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-occurred_at']
        indexes = [
            models.Index(fields=['vehicle', 'occurred_at']),
            models.Index(fields=['geofence', 'occurred_at']),
        ]
    
    def __str__(self):
        return f"{self.vehicle.reg_number} {self.event_type} {self.geofence.name}"


class SystemAlert(models.Model):
    """System-wide alerts"""
    
    TYPE_CHOICES = [
        ('SYSTEM_ERROR', 'System Error'),
        ('PERFORMANCE', 'Performance Issue'),
        ('SECURITY', 'Security Alert'),
        ('MAINTENANCE', 'Maintenance Required'),
        ('BACKUP', 'Backup Status'),
        ('LICENSE', 'License Issue'),
        ('OTHER', 'Other'),
    ]
    
    SEVERITY_CHOICES = [
        ('INFO', 'Info'),
        ('WARNING', 'Warning'),
        ('ERROR', 'Error'),
        ('CRITICAL', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('ACKNOWLEDGED', 'Acknowledged'),
        ('RESOLVED', 'Resolved'),
        ('SUPPRESSED', 'Suppressed'),
    ]
    
    # Alert details
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Additional data
    data = models.JSONField(default=dict, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['type', 'severity']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.severity}: {self.title}"


class ParkingLog(models.Model):
    """Vehicle parking location logs"""
    
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='parking_logs')
    shift = models.ForeignKey('fleet_app.Shift', on_delete=models.SET_NULL, null=True, blank=True, related_name='telemetry_parking_logs')
    
    # Location data
    lat = models.FloatField()
    lng = models.FloatField()
    address = models.CharField(max_length=255, blank=True, null=True)
    
    # Metadata
    captured_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-captured_at']
        indexes = [
            models.Index(fields=['vehicle', 'captured_at']),
            models.Index(fields=['captured_at']),
        ]
    
    def __str__(self):
        return f"Parking for {self.vehicle.reg_number} at ({self.lat}, {self.lng}) on {self.captured_at.strftime('%Y-%m-%d %H:%M')}"


class AuditLog(models.Model):
    """System audit trail"""
    
    ACTION_CHOICES = [
        ("CREATE", "Create"), ("UPDATE", "Update"), ("DELETE", "Delete"),
        ("LOGIN", "Login"), ("LOGOUT", "Logout"), ("ASSIGN", "Assign"),
        ("INSPECT", "Inspect"), ("UPLOAD", "Upload"),
    ]
    
    # Relationships
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    
    # Action details
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    entity = models.CharField(max_length=50)  # e.g., 'Vehicle', 'User', 'Inspection'
    entity_id = models.IntegerField(null=True, blank=True)
    meta = models.JSONField(blank=True, null=True)  # Store additional context
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['actor', 'created_at']),
            models.Index(fields=['entity', 'entity_id']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.actor.username if self.actor else 'System'} {self.action} {self.entity} (ID: {self.entity_id})"