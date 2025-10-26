from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Company
from .company_serializers import CompanySerializer


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    company_slug = serializers.CharField(write_only=True, help_text="Company slug to join")
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'phone_number',
            'employee_id', 'department', 'hire_date', 'company_slug'
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True},
            'company_slug': {'write_only': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        
        # Validate company exists and is active
        company_slug = attrs.get('company_slug')
        try:
            company = Company.objects.get(slug=company_slug, is_active=True)
            attrs['company'] = company
        except Company.DoesNotExist:
            raise serializers.ValidationError("Invalid company or company is not active.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data.pop('company_slug')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login with detailed error messages
    """
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            # Check if user exists first
            try:
                user = User.objects.get(username=username)
                
                # Check if password is correct
                if not user.check_password(password):
                    raise serializers.ValidationError('Incorrect password. Please try again or use Forgot Password.')
                
                # Check if account is active
                if not user.is_active:
                    raise serializers.ValidationError('Your account has been disabled. Please contact support.')
                
                attrs['user'] = user
            except User.DoesNotExist:
                raise serializers.ValidationError('Username or email does not exist. Please check and try again.')
                
        else:
            raise serializers.ValidationError('Username and password are required.')
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information
    """
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    full_name = serializers.SerializerMethodField()
    company = CompanySerializer(read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'role_display', 'phone_number',
            'employee_id', 'department', 'hire_date', 'is_active',
            'is_superuser', 'is_staff', 'date_joined', 'last_login', 
            'created_at', 'updated_at', 'company'
        )
        read_only_fields = ('id', 'username', 'is_superuser', 'is_staff', 'date_joined', 'last_login', 'created_at', 'updated_at', 'company')
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information
    """
    class Meta:
        model = User
        fields = (
            'email', 'first_name', 'last_name', 'phone_number',
            'department', 'hire_date', 'is_active'
        )
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing users (minimal information)
    """
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    full_name = serializers.SerializerMethodField()
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'full_name', 'role',
            'role_display', 'employee_id', 'department',
            'is_active', 'date_joined', 'company_name'
        )
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing user password
    """
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
