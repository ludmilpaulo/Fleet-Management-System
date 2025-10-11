from django.db import models
from django.contrib.auth import get_user_model
from fleet_app.models import Shift

User = get_user_model()


class Inspection(models.Model):
    """Vehicle inspection model"""
    
    TYPE_CHOICES = [
        ('START', 'Start of Shift'),
        ('END', 'End of Shift'),
    ]
    
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('PASS', 'Pass'),
        ('FAIL', 'Fail'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='inspections')
    type = models.CharField(max_length=5, choices=TYPE_CHOICES)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='IN_PROGRESS')
    
    # Inspection details
    notes = models.TextField(blank=True)
    weather_conditions = models.CharField(max_length=50, blank=True)
    temperature = models.FloatField(null=True, blank=True, help_text="Temperature in Celsius")
    
    # Location
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    address = models.TextField(blank=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_inspections')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-started_at']
        unique_together = ['shift', 'type']
    
    def __str__(self):
        return f"{self.shift.vehicle.reg_number} - {self.type} Inspection ({self.started_at.date()})"


class InspectionItem(models.Model):
    """Individual inspection checklist items"""
    
    PART_CHOICES = [
        ('FRONT', 'Front'),
        ('REAR', 'Rear'),
        ('LEFT', 'Left Side'),
        ('RIGHT', 'Right Side'),
        ('ROOF', 'Roof'),
        ('INTERIOR', 'Interior'),
        ('DASHBOARD', 'Dashboard'),
        ('ODOMETER', 'Odometer'),
        ('WINDSHIELD', 'Windshield'),
        ('TYRES', 'Tyres'),
        ('LIGHTS', 'Lights'),
        ('ENGINE', 'Engine'),
        ('BRAKES', 'Brakes'),
        ('FUEL', 'Fuel'),
        ('OTHER', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('PASS', 'Pass'),
        ('FAIL', 'Fail'),
        ('N/A', 'Not Applicable'),
        ('SKIP', 'Skipped'),
    ]
    
    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, related_name='items')
    part = models.CharField(max_length=24, choices=PART_CHOICES)
    status = models.CharField(max_length=4, choices=STATUS_CHOICES, default='PASS')
    notes = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['part']
        unique_together = ['inspection', 'part']
    
    def __str__(self):
        return f"{self.inspection} - {self.part} ({self.status})"


class Photo(models.Model):
    """Inspection photos"""
    
    ANGLE_CHOICES = [
        ('WIDE', 'Wide Shot'),
        ('CLOSEUP', 'Close-up'),
        ('PANEL', 'Panel Detail'),
        ('TYRE', 'Tyre Detail'),
        ('DAMAGE', 'Damage'),
        ('GENERAL', 'General'),
    ]
    
    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, related_name='photos')
    inspection_item = models.ForeignKey(InspectionItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='photos')
    
    # Photo details
    part = models.CharField(max_length=24, choices=InspectionItem.PART_CHOICES)
    angle = models.CharField(max_length=16, choices=ANGLE_CHOICES, default='GENERAL')
    file_key = models.CharField(max_length=255, help_text="S3 file key")
    file_url = models.URLField(blank=True, help_text="Public URL for the photo")
    
    # Photo metadata
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    mime_type = models.CharField(max_length=50, default='image/jpeg')
    
    # EXIF data
    taken_at = models.DateTimeField()
    gps_lat = models.FloatField(null=True, blank=True)
    gps_lng = models.FloatField(null=True, blank=True)
    camera_make = models.CharField(max_length=50, blank=True)
    camera_model = models.CharField(max_length=50, blank=True)
    
    # Metadata
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_photos')
    
    class Meta:
        ordering = ['-taken_at']
        indexes = [
            models.Index(fields=['inspection', 'part']),
            models.Index(fields=['taken_at']),
        ]
    
    def __str__(self):
        return f"{self.inspection} - {self.part} ({self.angle})"


class InspectionTemplate(models.Model):
    """Template for inspection checklists"""
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class InspectionTemplateItem(models.Model):
    """Items in inspection templates"""
    
    template = models.ForeignKey(InspectionTemplate, on_delete=models.CASCADE, related_name='items')
    part = models.CharField(max_length=24, choices=InspectionItem.PART_CHOICES)
    is_required = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['order', 'part']
        unique_together = ['template', 'part']
    
    def __str__(self):
        return f"{self.template.name} - {self.part}"