from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Ticket, TicketComment, TicketAttachment, TicketHistory, MaintenanceSchedule
from issues.serializers import IssueSerializer

User = get_user_model()


class TicketCommentSerializer(serializers.ModelSerializer):
    """Serializer for TicketComment model"""
    
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = TicketComment
        fields = [
            'id', 'ticket', 'author', 'author_name', 'author_username',
            'content', 'is_internal', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TicketAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for TicketAttachment model"""
    
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    
    class Meta:
        model = TicketAttachment
        fields = [
            'id', 'ticket', 'file_key', 'file_url', 'filename', 'file_size',
            'mime_type', 'uploaded_at', 'uploaded_by', 'uploaded_by_name'
        ]
        read_only_fields = ['id', 'uploaded_at']


class TicketHistorySerializer(serializers.ModelSerializer):
    """Serializer for TicketHistory model"""
    
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True)
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)
    
    class Meta:
        model = TicketHistory
        fields = [
            'id', 'ticket', 'action', 'old_value', 'new_value', 'description',
            'changed_at', 'changed_by', 'changed_by_name', 'changed_by_username'
        ]
        read_only_fields = ['id', 'changed_at']


class TicketSerializer(serializers.ModelSerializer):
    """Serializer for Ticket model"""
    
    issue_data = IssueSerializer(source='issue', read_only=True)
    vehicle_reg = serializers.CharField(source='issue.vehicle.reg_number', read_only=True)
    vehicle_make_model = serializers.SerializerMethodField()
    assignee_name = serializers.CharField(source='assignee.full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.full_name', read_only=True)
    comments = TicketCommentSerializer(many=True, read_only=True)
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    history = TicketHistorySerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    attachments_count = serializers.SerializerMethodField()
    days_open = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'issue', 'issue_data', 'vehicle_reg', 'vehicle_make_model',
            'assignee', 'assignee_name', 'title', 'description', 'type', 'priority',
            'status', 'created_at', 'updated_at', 'due_at', 'started_at', 'completed_at',
            'created_by', 'created_by_name', 'updated_by', 'updated_by_name',
            'estimated_cost', 'actual_cost', 'currency', 'external_id',
            'supplier_reference', 'comments', 'attachments', 'history',
            'comments_count', 'attachments_count', 'days_open', 'is_overdue'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_vehicle_make_model(self, obj):
        """Get vehicle make and model"""
        return f"{obj.issue.vehicle.make} {obj.issue.vehicle.model}"
    
    def get_comments_count(self, obj):
        """Get number of comments"""
        return obj.comments.count()
    
    def get_attachments_count(self, obj):
        """Get number of attachments"""
        return obj.attachments.count()
    
    def get_days_open(self, obj):
        """Calculate days since ticket was created"""
        if obj.completed_at:
            return (obj.completed_at - obj.created_at).days
        from django.utils import timezone
        return (timezone.now() - obj.created_at).days
    
    def get_is_overdue(self, obj):
        """Check if ticket is overdue"""
        if obj.due_at and obj.status not in ['COMPLETED', 'CLOSED']:
            from django.utils import timezone
            return timezone.now() > obj.due_at
        return False


class TicketCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tickets"""
    
    class Meta:
        model = Ticket
        fields = [
            'issue', 'assignee', 'title', 'description', 'type', 'priority',
            'due_at', 'estimated_cost', 'currency', 'external_id', 'supplier_reference'
        ]
    
    def validate_issue(self, value):
        """Validate issue belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.vehicle.org != user_org:
            raise serializers.ValidationError("Issue does not belong to your organization.")
        return value
    
    def create(self, validated_data):
        """Create ticket with audit trail"""
        ticket = Ticket.objects.create(**validated_data)
        
        # Create history entry
        TicketHistory.objects.create(
            ticket=ticket,
            action='CREATED',
            description=f"Ticket created: {ticket.title}",
            changed_by=self.context['request'].user
        )
        
        return ticket


class TicketUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating tickets"""
    
    class Meta:
        model = Ticket
        fields = [
            'assignee', 'title', 'description', 'type', 'priority', 'status',
            'due_at', 'estimated_cost', 'actual_cost', 'external_id', 'supplier_reference'
        ]
    
    def update(self, instance, validated_data):
        """Update ticket with audit trail"""
        old_data = {
            'assignee': instance.assignee,
            'title': instance.title,
            'description': instance.description,
            'type': instance.type,
            'priority': instance.priority,
            'status': instance.status,
            'due_at': instance.due_at,
        }
        
        # Update the instance
        updated_instance = super().update(instance, validated_data)
        
        # Create history entries for changes
        for field, new_value in validated_data.items():
            old_value = old_data.get(field)
            if old_value != new_value:
                action = 'STATUS_CHANGED' if field == 'status' else 'PRIORITY_CHANGED' if field == 'priority' else 'ASSIGNED' if field == 'assignee' else 'UPDATED'
                TicketHistory.objects.create(
                    ticket=updated_instance,
                    action=action,
                    old_value=str(old_value) if old_value else '',
                    new_value=str(new_value) if new_value else '',
                    description=f"{field} changed from {old_value} to {new_value}",
                    changed_by=self.context['request'].user
                )
        
        return updated_instance


class TicketCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ticket comments"""
    
    class Meta:
        model = TicketComment
        fields = ['ticket', 'content', 'is_internal']
    
    def validate_ticket(self, value):
        """Validate ticket belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.issue.vehicle.org != user_org:
            raise serializers.ValidationError("Ticket does not belong to your organization.")
        return value
    
    def create(self, validated_data):
        """Create comment with audit trail"""
        comment = TicketComment.objects.create(**validated_data)
        
        # Create history entry
        TicketHistory.objects.create(
            ticket=comment.ticket,
            action='COMMENTED',
            description=f"Comment added: {comment.content[:50]}...",
            changed_by=self.context['request'].user
        )
        
        return comment


class TicketAttachmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ticket attachments"""
    
    class Meta:
        model = TicketAttachment
        fields = [
            'ticket', 'file_key', 'file_url', 'filename', 'file_size', 'mime_type'
        ]
    
    def validate_ticket(self, value):
        """Validate ticket belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.issue.vehicle.org != user_org:
            raise serializers.ValidationError("Ticket does not belong to your organization.")
        return value
    
    def create(self, validated_data):
        """Create attachment with audit trail"""
        attachment = TicketAttachment.objects.create(**validated_data)
        
        # Create history entry
        TicketHistory.objects.create(
            ticket=attachment.ticket,
            action='ATTACHMENT_ADDED',
            description=f"Attachment added: {attachment.filename}",
            changed_by=self.context['request'].user
        )
        
        return attachment


class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    """Serializer for MaintenanceSchedule model"""
    
    vehicle_reg = serializers.CharField(source='vehicle.reg_number', read_only=True)
    vehicle_make_model = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    days_until_due = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = MaintenanceSchedule
        fields = [
            'id', 'vehicle', 'vehicle_reg', 'vehicle_make_model', 'title', 'description',
            'frequency', 'interval_value', 'interval_unit', 'status', 'created_at',
            'updated_at', 'last_performed', 'next_due', 'created_by', 'created_by_name',
            'assigned_to', 'assigned_to_name', 'days_until_due', 'is_overdue'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_vehicle_make_model(self, obj):
        """Get vehicle make and model"""
        return f"{obj.vehicle.make} {obj.vehicle.model}"
    
    def get_days_until_due(self, obj):
        """Calculate days until next maintenance is due"""
        if obj.next_due:
            from django.utils import timezone
            delta = obj.next_due - timezone.now().date()
            return delta.days
        return None
    
    def get_is_overdue(self, obj):
        """Check if maintenance is overdue"""
        if obj.next_due:
            from django.utils import timezone
            return timezone.now().date() > obj.next_due
        return False


class MaintenanceScheduleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating maintenance schedules"""
    
    class Meta:
        model = MaintenanceSchedule
        fields = [
            'vehicle', 'title', 'description', 'frequency', 'interval_value',
            'interval_unit', 'assigned_to'
        ]
    
    def validate_vehicle(self, value):
        """Validate vehicle belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.org != user_org:
            raise serializers.ValidationError("Vehicle does not belong to your organization.")
        return value


class TicketStatsSerializer(serializers.Serializer):
    """Serializer for ticket statistics"""
    
    total_tickets = serializers.IntegerField()
    open_tickets = serializers.IntegerField()
    in_progress_tickets = serializers.IntegerField()
    completed_tickets = serializers.IntegerField()
    closed_tickets = serializers.IntegerField()
    tickets_by_status = serializers.DictField()
    tickets_by_priority = serializers.DictField()
    tickets_by_type = serializers.DictField()
    average_completion_time = serializers.DurationField()
    overdue_tickets = serializers.IntegerField()
    total_estimated_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_actual_cost = serializers.DecimalField(max_digits=10, decimal_places=2)


class TicketSummarySerializer(serializers.Serializer):
    """Serializer for ticket summary"""
    
    ticket_id = serializers.IntegerField()
    vehicle_reg = serializers.CharField()
    vehicle_make_model = serializers.CharField()
    title = serializers.CharField()
    type = serializers.CharField()
    priority = serializers.CharField()
    status = serializers.CharField()
    assignee_name = serializers.CharField()
    created_at = serializers.DateTimeField()
    due_at = serializers.DateTimeField()
    days_open = serializers.IntegerField()
    is_overdue = serializers.BooleanField()
    estimated_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    actual_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
