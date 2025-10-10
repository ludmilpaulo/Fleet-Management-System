from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    """
    Serializer for Company model
    """
    current_user_count = serializers.ReadOnlyField()
    current_vehicle_count = serializers.ReadOnlyField()
    is_trial_active = serializers.ReadOnlyField()
    full_address = serializers.ReadOnlyField()
    
    class Meta:
        model = Company
        fields = (
            'id', 'name', 'slug', 'description', 'email', 'phone', 'website',
            'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
            'full_address', 'logo', 'primary_color', 'secondary_color',
            'max_users', 'max_vehicles', 'subscription_plan', 'is_active',
            'trial_ends_at', 'is_trial_active', 'current_user_count', 'current_vehicle_count',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'slug', 'created_at', 'updated_at')


class CompanyCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new companies
    """
    
    class Meta:
        model = Company
        fields = (
            'name', 'description', 'email', 'phone', 'website',
            'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
            'primary_color', 'secondary_color', 'subscription_plan'
        )
    
    def create(self, validated_data):
        # Generate slug from company name
        name = validated_data['name']
        slug = name.lower().replace(' ', '-').replace('_', '-')
        
        # Ensure slug is unique
        base_slug = slug
        counter = 1
        while Company.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        validated_data['slug'] = slug
        return super().create(validated_data)


class CompanyUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating company information
    """
    
    class Meta:
        model = Company
        fields = (
            'name', 'description', 'email', 'phone', 'website',
            'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
            'logo', 'primary_color', 'secondary_color', 'subscription_plan',
            'max_users', 'max_vehicles', 'is_active', 'trial_ends_at'
        )
        read_only_fields = ('slug',)


class CompanyListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing companies (minimal information)
    """
    current_user_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Company
        fields = (
            'id', 'name', 'slug', 'email', 'subscription_plan', 'is_active',
            'current_user_count', 'created_at'
        )
