from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Issue, IssuePhoto, IssueComment, IssueHistory
from fleet_app.serializers import VehicleSerializer
from inspections.serializers import InspectionItemSerializer

User = get_user_model()


class IssuePhotoSerializer(serializers.ModelSerializer):
    """Serializer for IssuePhoto model"""
    
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    
    class Meta:
        model = IssuePhoto
        fields = [
            'id', 'issue', 'file_key', 'file_url', 'width', 'height',
            'file_size', 'mime_type', 'uploaded_at', 'uploaded_by', 'uploaded_by_name'
        ]
        read_only_fields = ['id', 'uploaded_at']


class IssueCommentSerializer(serializers.ModelSerializer):
    """Serializer for IssueComment model"""
    
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = IssueComment
        fields = [
            'id', 'issue', 'author', 'author_name', 'author_username',
            'content', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class IssueHistorySerializer(serializers.ModelSerializer):
    """Serializer for IssueHistory model"""
    
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True)
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)
    
    class Meta:
        model = IssueHistory
        fields = [
            'id', 'issue', 'action', 'old_value', 'new_value', 'description',
            'changed_at', 'changed_by', 'changed_by_name', 'changed_by_username'
        ]
        read_only_fields = ['id', 'changed_at']


class IssueSerializer(serializers.ModelSerializer):
    """Serializer for Issue model"""
    
    vehicle_data = VehicleSerializer(source='vehicle', read_only=True)
    vehicle_reg = serializers.CharField(source='vehicle.reg_number', read_only=True)
    vehicle_make_model = serializers.SerializerMethodField()
    inspection_item_data = InspectionItemSerializer(source='inspection_item', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.full_name', read_only=True)
    photos = IssuePhotoSerializer(many=True, read_only=True)
    comments = IssueCommentSerializer(many=True, read_only=True)
    history = IssueHistorySerializer(many=True, read_only=True)
    photos_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    tickets_count = serializers.SerializerMethodField()
    days_open = serializers.SerializerMethodField()
    
    class Meta:
        model = Issue
        fields = [
            'id', 'vehicle', 'vehicle_data', 'vehicle_reg', 'vehicle_make_model',
            'inspection_item', 'inspection_item_data', 'title', 'description',
            'category', 'severity', 'status', 'location_description', 'lat', 'lng',
            'reported_at', 'resolved_at', 'due_date', 'reported_by', 'reported_by_name',
            'assigned_to', 'assigned_to_name', 'updated_at', 'updated_by', 'updated_by_name',
            'photos', 'comments', 'history', 'photos_count', 'comments_count',
            'tickets_count', 'days_open'
        ]
        read_only_fields = ['id', 'reported_at', 'updated_at']
    
    def get_vehicle_make_model(self, obj):
        """Get vehicle make and model"""
        return f"{obj.vehicle.make} {obj.vehicle.model}"
    
    def get_photos_count(self, obj):
        """Get number of photos"""
        return obj.photos.count()
    
    def get_comments_count(self, obj):
        """Get number of comments"""
        return obj.comments.count()
    
    def get_tickets_count(self, obj):
        """Get number of tickets"""
        return obj.tickets.count()
    
    def get_days_open(self, obj):
        """Calculate days since issue was reported"""
        if obj.resolved_at:
            return (obj.resolved_at - obj.reported_at).days
        from django.utils import timezone
        return (timezone.now() - obj.reported_at).days


class IssueCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating issues"""
    
    class Meta:
        model = Issue
        fields = [
            'vehicle', 'inspection_item', 'title', 'description', 'category',
            'severity', 'location_description', 'lat', 'lng', 'due_date', 'assigned_to'
        ]
    
    def validate_vehicle(self, value):
        """Validate vehicle belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.org != user_org:
            raise serializers.ValidationError("Vehicle does not belong to your organization.")
        return value
    
    def create(self, validated_data):
        """Create issue with audit trail"""
        issue = Issue.objects.create(**validated_data)
        
        # Create history entry
        IssueHistory.objects.create(
            issue=issue,
            action='CREATED',
            description=f"Issue created: {issue.title}",
            changed_by=self.context['request'].user
        )
        
        return issue


class IssueUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating issues"""
    
    class Meta:
        model = Issue
        fields = [
            'title', 'description', 'category', 'severity', 'status',
            'location_description', 'lat', 'lng', 'due_date', 'assigned_to'
        ]
    
    def update(self, instance, validated_data):
        """Update issue with audit trail"""
        old_data = {
            'title': instance.title,
            'description': instance.description,
            'category': instance.category,
            'severity': instance.severity,
            'status': instance.status,
            'assigned_to': instance.assigned_to,
        }
        
        # Update the instance
        updated_instance = super().update(instance, validated_data)
        
        # Create history entries for changes
        for field, new_value in validated_data.items():
            old_value = old_data.get(field)
            if old_value != new_value:
                action = 'STATUS_CHANGED' if field == 'status' else 'SEVERITY_CHANGED' if field == 'severity' else 'UPDATED'
                IssueHistory.objects.create(
                    issue=updated_instance,
                    action=action,
                    old_value=str(old_value) if old_value else '',
                    new_value=str(new_value) if new_value else '',
                    description=f"{field} changed from {old_value} to {new_value}",
                    changed_by=self.context['request'].user
                )
        
        return updated_instance


class IssuePhotoCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating issue photos"""
    
    class Meta:
        model = IssuePhoto
        fields = [
            'issue', 'file_key', 'file_url', 'width', 'height',
            'file_size', 'mime_type'
        ]
    
    def validate_issue(self, value):
        """Validate issue belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.vehicle.org != user_org:
            raise serializers.ValidationError("Issue does not belong to your organization.")
        return value


class IssueCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating issue comments"""
    
    class Meta:
        model = IssueComment
        fields = ['issue', 'content']
    
    def validate_issue(self, value):
        """Validate issue belongs to user's organization"""
        user_org = self.context['request'].user.company
        if value.vehicle.org != user_org:
            raise serializers.ValidationError("Issue does not belong to your organization.")
        return value
    
    def create(self, validated_data):
        """Create comment with audit trail"""
        comment = IssueComment.objects.create(**validated_data)
        
        # Create history entry
        IssueHistory.objects.create(
            issue=comment.issue,
            action='COMMENTED',
            description=f"Comment added: {comment.content[:50]}...",
            changed_by=self.context['request'].user
        )
        
        return comment


class IssueStatsSerializer(serializers.Serializer):
    """Serializer for issue statistics"""
    
    total_issues = serializers.IntegerField()
    open_issues = serializers.IntegerField()
    in_progress_issues = serializers.IntegerField()
    resolved_issues = serializers.IntegerField()
    closed_issues = serializers.IntegerField()
    issues_by_status = serializers.DictField()
    issues_by_severity = serializers.DictField()
    issues_by_category = serializers.DictField()
    average_resolution_time = serializers.DurationField()
    overdue_issues = serializers.IntegerField()


class IssueSummarySerializer(serializers.Serializer):
    """Serializer for issue summary"""
    
    vehicle_reg = serializers.CharField()
    vehicle_make_model = serializers.CharField()
    title = serializers.CharField()
    category = serializers.CharField()
    severity = serializers.CharField()
    status = serializers.CharField()
    reported_at = serializers.DateTimeField()
    assigned_to_name = serializers.CharField()
    days_open = serializers.IntegerField()
    photos_count = serializers.IntegerField()
    comments_count = serializers.IntegerField()
    tickets_count = serializers.IntegerField()
