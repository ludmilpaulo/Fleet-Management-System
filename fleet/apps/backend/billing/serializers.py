from rest_framework import serializers
from .models import Plan, CompanySubscription, Payment, WebhookEvent
from account.models import Company


class PlanSerializer(serializers.ModelSerializer):
    """Serializer for Plan model"""
    
    class Meta:
        model = Plan
        fields = [
            'id', 'name', 'display_name', 'description',
            'amount', 'currency', 'interval',
            'features', 'is_active', 'is_popular',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompanySubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for CompanySubscription model"""
    
    plan = PlanSerializer(read_only=True)
    plan_id = serializers.IntegerField(write_only=True, required=False)
    company_name = serializers.CharField(source='company.name', read_only=True)
    is_active = serializers.SerializerMethodField()
    days_until_period_end = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanySubscription
        fields = [
            'id', 'company', 'company_name', 'plan', 'plan_id',
            'status', 'billing_cycle',
            'current_period_start', 'current_period_end', 'trial_end',
            'cancel_at_period_end', 'canceled_at',
            'provider_subscription_id', 'provider_customer_id',
            'is_active', 'days_until_period_end',
            'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'company_name', 'provider_subscription_id',
            'provider_customer_id', 'is_active', 'days_until_period_end',
            'created_at', 'updated_at'
        ]
    
    def get_is_active(self, obj):
        return obj.is_active()
    
    def get_days_until_period_end(self, obj):
        return obj.days_until_period_end()


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    
    company_name = serializers.CharField(source='company.name', read_only=True)
    subscription_plan = serializers.CharField(source='subscription.plan.display_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'subscription', 'company', 'company_name',
            'amount', 'currency', 'status',
            'provider', 'provider_charge_id', 'provider_invoice_id',
            'paid_at', 'description', 'metadata',
            'subscription_plan', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'company_name', 'subscription_plan',
            'provider_charge_id', 'provider_invoice_id',
            'created_at', 'updated_at'
        ]


class CheckoutSessionRequestSerializer(serializers.Serializer):
    """Serializer for checkout session creation request"""
    
    plan_id = serializers.IntegerField(required=True)
    billing_cycle = serializers.ChoiceField(
        choices=['monthly', 'yearly'],
        default='monthly'
    )
    success_url = serializers.URLField(
        required=False,
        help_text="URL to redirect after successful payment"
    )
    cancel_url = serializers.URLField(
        required=False,
        help_text="URL to redirect if payment is canceled"
    )


class CheckoutSessionResponseSerializer(serializers.Serializer):
    """Serializer for checkout session response"""
    
    checkout_url = serializers.URLField()
    session_id = serializers.CharField(required=False)


class WebhookEventSerializer(serializers.ModelSerializer):
    """Serializer for WebhookEvent model"""
    
    class Meta:
        model = WebhookEvent
        fields = [
            'id', 'provider', 'event_id', 'event_type',
            'processed', 'processed_at', 'error_message',
            'retry_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

