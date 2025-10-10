from django.db import models
from django.contrib.auth import get_user_model
from account.models import Company

User = get_user_model()


class Vehicle(models.Model):
    """Vehicle model for fleet management"""
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('MAINTENANCE', 'Maintenance'),
        ('RETIRED', 'Retired'),
    ]
    
    org = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='vehicles')
    vin = models.CharField(max_length=32, blank=True, help_text="Vehicle Identification Number")
    reg_number = models.CharField(max_length=16, db_index=True, help_text="Registration Number")
    make = models.CharField(max_length=32)
    model = models.CharField(max_length=32)
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    color = models.CharField(max_length=24, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Additional fields
    mileage = models.PositiveIntegerField(default=0, help_text="Current mileage in km")
    fuel_type = models.CharField(max_length=20, default='PETROL', choices=[
        ('PETROL', 'Petrol'),
        ('DIESEL', 'Diesel'),
        ('ELECTRIC', 'Electric'),
        ('HYBRID', 'Hybrid'),
    ])
    engine_size = models.CharField(max_length=20, blank=True)
    transmission = models.CharField(max_length=20, default='MANUAL', choices=[
        ('MANUAL', 'Manual'),
        ('AUTOMATIC', 'Automatic'),
    ])
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_vehicles')
    
    class Meta:
        unique_together = ['org', 'reg_number']
        ordering = ['reg_number']
    
    def __str__(self):
        return f"{self.make} {self.model} ({self.reg_number})"


class KeyTracker(models.Model):
    """BLE key tracker for vehicles"""
    
    vehicle = models.OneToOneField(Vehicle, on_delete=models.CASCADE, related_name='key_tracker')
    ble_id = models.CharField(max_length=64, unique=True, help_text="BLE Device ID")
    label = models.CharField(max_length=64, help_text="Human readable label")
    last_seen_at = models.DateTimeField(null=True, blank=True)
    last_rssi = models.SmallIntegerField(null=True, blank=True, help_text="Signal strength")
    last_lat = models.FloatField(null=True, blank=True)
    last_lng = models.FloatField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-last_seen_at']
    
    def __str__(self):
        return f"{self.label} ({self.vehicle.reg_number})"


class Shift(models.Model):
    """Driver shift model"""
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT, related_name='shifts')
    driver = models.ForeignKey(User, on_delete=models.PROTECT, related_name='shifts')
    start_at = models.DateTimeField()
    end_at = models.DateTimeField(null=True, blank=True)
    
    # Location tracking
    start_lat = models.FloatField(null=True, blank=True)
    start_lng = models.FloatField(null=True, blank=True)
    start_address = models.TextField(blank=True)
    
    end_lat = models.FloatField(null=True, blank=True)
    end_lng = models.FloatField(null=True, blank=True)
    end_address = models.TextField(blank=True)
    
    # Shift details
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='ACTIVE')
    notes = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_at']
    
    def __str__(self):
        return f"{self.driver.username} - {self.vehicle.reg_number} ({self.start_at.date()})"

