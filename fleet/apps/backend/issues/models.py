from django.db import models
from django.contrib.auth import get_user_model
from fleet_app.models import Vehicle
from inspections.models import InspectionItem

User = get_user_model()


class Issue(models.Model):
    """Vehicle issues identified during inspections"""
    
    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    CATEGORY_CHOICES = [
        ('SAFETY', 'Safety'),
        ('MECHANICAL', 'Mechanical'),
        ('COSMETIC', 'Cosmetic'),
        ('ELECTRICAL', 'Electrical'),
        ('TYRE', 'Tyre'),
        ('ENGINE', 'Engine'),
        ('BRAKE', 'Brake'),
        ('LIGHT', 'Light'),
        ('OTHER', 'Other'),
    ]
    
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='issues')
    inspection_item = models.ForeignKey(InspectionItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='issues')
    
    # Issue details
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='OTHER')
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='OPEN')
    
    # Location details
    location_description = models.CharField(max_length=200, blank=True, help_text="Where on the vehicle")
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    
    # Dates
    reported_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    
    # Assignment
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='reported_issues')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')
    
    # Metadata
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_issues')
    
    class Meta:
        ordering = ['-reported_at']
        indexes = [
            models.Index(fields=['vehicle', 'status']),
            models.Index(fields=['severity', 'status']),
            models.Index(fields=['assigned_to', 'status']),
        ]
    
    def __str__(self):
        return f"{self.vehicle.reg_number} - {self.title}"


class IssuePhoto(models.Model):
    """Photos associated with issues"""
    
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='photos')
    file_key = models.CharField(max_length=255, help_text="S3 file key")
    file_url = models.URLField(blank=True, help_text="Public URL for the photo")
    
    # Photo metadata
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    mime_type = models.CharField(max_length=50, default='image/jpeg')
    
    # Metadata
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.issue.title} - Photo"


class IssueComment(models.Model):
    """Comments on issues"""
    
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='issue_comments')
    content = models.TextField()
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.issue.title} - Comment by {self.author.username}"


class IssueHistory(models.Model):
    """History of changes to issues"""
    
    ACTION_CHOICES = [
        ('CREATED', 'Created'),
        ('UPDATED', 'Updated'),
        ('ASSIGNED', 'Assigned'),
        ('STATUS_CHANGED', 'Status Changed'),
        ('SEVERITY_CHANGED', 'Severity Changed'),
        ('COMMENTED', 'Commented'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]
    
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    description = models.TextField(blank=True)
    
    # Metadata
    changed_at = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.issue.title} - {self.action}"