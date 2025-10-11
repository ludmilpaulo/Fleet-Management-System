from django.db import models
from django.contrib.auth import get_user_model
from issues.models import Issue

User = get_user_model()


class Ticket(models.Model):
    """Maintenance tickets for issues"""
    
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('PENDING_PARTS', 'Pending Parts'),
        ('PENDING_APPROVAL', 'Pending Approval'),
        ('COMPLETED', 'Completed'),
        ('CLOSED', 'Closed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
        ('CRITICAL', 'Critical'),
    ]
    
    TYPE_CHOICES = [
        ('REPAIR', 'Repair'),
        ('MAINTENANCE', 'Maintenance'),
        ('INSPECTION', 'Inspection'),
        ('CLEANING', 'Cleaning'),
        ('UPGRADE', 'Upgrade'),
        ('OTHER', 'Other'),
    ]
    
    # Relationships
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='tickets')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    
    # Ticket details
    title = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='REPAIR')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Assignment
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tickets')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_tickets')
    
    # Cost tracking
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='ZAR')
    
    # External references
    external_id = models.CharField(max_length=100, blank=True, help_text="External system reference")
    supplier_reference = models.CharField(max_length=100, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['assignee', 'status']),
            models.Index(fields=['priority', 'status']),
            models.Index(fields=['due_at']),
        ]
    
    def __str__(self):
        return f"#{self.id} - {self.title}"


class TicketComment(models.Model):
    """Comments on tickets"""
    
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_comments')
    content = models.TextField()
    is_internal = models.BooleanField(default=False, help_text="Internal note not visible to client")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Ticket #{self.ticket.id} - Comment by {self.author.username}"


class TicketAttachment(models.Model):
    """Attachments for tickets"""
    
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='attachments')
    file_key = models.CharField(max_length=255, help_text="S3 file key")
    file_url = models.URLField(blank=True, help_text="Public URL for the file")
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    mime_type = models.CharField(max_length=100)
    
    # Metadata
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"Ticket #{self.ticket.id} - {self.filename}"


class TicketHistory(models.Model):
    """History of changes to tickets"""
    
    ACTION_CHOICES = [
        ('CREATED', 'Created'),
        ('UPDATED', 'Updated'),
        ('ASSIGNED', 'Assigned'),
        ('STATUS_CHANGED', 'Status Changed'),
        ('PRIORITY_CHANGED', 'Priority Changed'),
        ('COMMENTED', 'Commented'),
        ('ATTACHMENT_ADDED', 'Attachment Added'),
        ('COMPLETED', 'Completed'),
        ('CLOSED', 'Closed'),
    ]
    
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='history')
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
        return f"Ticket #{self.ticket.id} - {self.action}"


class MaintenanceSchedule(models.Model):
    """Scheduled maintenance for vehicles"""
    
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('YEARLY', 'Yearly'),
        ('MILEAGE', 'By Mileage'),
        ('CUSTOM', 'Custom'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('PAUSED', 'Paused'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    # Relationships
    vehicle = models.ForeignKey('fleet_app.Vehicle', on_delete=models.CASCADE, related_name='maintenance_schedules')
    
    # Schedule details
    title = models.CharField(max_length=200)
    description = models.TextField()
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    interval_value = models.PositiveIntegerField(default=1, help_text="Interval value (e.g., every 3 months)")
    interval_unit = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='MONTHLY')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_performed = models.DateTimeField(null=True, blank=True)
    next_due = models.DateTimeField(null=True, blank=True)
    
    # Assignment
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_maintenance')
    
    class Meta:
        ordering = ['next_due']
    
    def __str__(self):
        return f"{self.vehicle.reg_number} - {self.title}"