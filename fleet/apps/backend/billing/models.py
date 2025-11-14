from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from account.models import Company

User = get_user_model()


class Plan(models.Model):
    """Subscription plan definitions"""
    
    name = models.CharField(max_length=50, unique=True, help_text="Internal plan code (e.g., 'basic', 'pro')")
    display_name = models.CharField(max_length=100, help_text="Display name (e.g., 'Basic Plan')")
    description = models.TextField(blank=True)
    
    # Pricing
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price amount")
    currency = models.CharField(max_length=3, default='USD')
    interval = models.CharField(
        max_length=10,
        choices=[('month', 'Monthly'), ('year', 'Yearly')],
        default='month',
        help_text="Billing interval"
    )
    
    # Features and limits
    features = models.JSONField(
        default=dict,
        help_text="Plan features (e.g., {'max_vehicles': 50, 'max_users': 10})"
    )
    
    # Payment provider integration
    provider_price_id = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Price/Plan ID from payment provider (Stripe, Payfast, etc.)"
    )
    provider = models.CharField(
        max_length=50,
        default='stripe',
        help_text="Payment provider name (stripe, payfast, paystack, yoco, etc.)"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False, help_text="Mark as popular plan")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['amount']
        verbose_name = 'Plan'
        verbose_name_plural = 'Plans'
    
    def __str__(self):
        return f"{self.display_name} ({self.get_interval_display()})"
    
    def get_price_for_interval(self, interval):
        """Get price for specific interval"""
        if interval == self.interval:
            return self.amount
        # If yearly and asking for monthly, divide by 12
        if self.interval == 'year' and interval == 'month':
            return self.amount / 12
        # If monthly and asking for yearly, multiply by 12
        if self.interval == 'month' and interval == 'year':
            return self.amount * 12
        return self.amount


class CompanySubscription(models.Model):
    """Company subscription tracking with payment provider integration"""
    
    STATUS_CHOICES = [
        ('trialing', 'Trialing'),
        ('active', 'Active'),
        ('past_due', 'Past Due'),
        ('canceled', 'Canceled'),
        ('expired', 'Expired'),
        ('incomplete', 'Incomplete'),
        ('incomplete_expired', 'Incomplete Expired'),
        ('unpaid', 'Unpaid'),
    ]
    
    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE,
        related_name='billing_subscription',
        help_text="Company this subscription belongs to"
    )
    plan = models.ForeignKey(
        Plan,
        on_delete=models.PROTECT,
        related_name='subscriptions',
        help_text="Subscription plan"
    )
    
    # Subscription status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='trialing',
        help_text="Current subscription status"
    )
    
    # Billing cycle
    billing_cycle = models.CharField(
        max_length=10,
        choices=[('monthly', 'Monthly'), ('yearly', 'Yearly')],
        default='monthly'
    )
    
    # Period dates
    current_period_start = models.DateTimeField(
        default=timezone.now,
        help_text="Start of current billing period"
    )
    current_period_end = models.DateTimeField(
        help_text="End of current billing period"
    )
    trial_end = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Trial period end date"
    )
    
    # Cancellation
    cancel_at_period_end = models.BooleanField(
        default=False,
        help_text="Whether subscription will cancel at period end"
    )
    canceled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When subscription was canceled"
    )
    
    # Payment provider integration
    provider_subscription_id = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        unique=True,
        help_text="Subscription ID from payment provider"
    )
    provider_customer_id = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Customer ID from payment provider"
    )
    
    # Metadata
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional metadata from payment provider"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Company Subscription'
        verbose_name_plural = 'Company Subscriptions'
    
    def __str__(self):
        return f"{self.company.name} - {self.plan.display_name} ({self.status})"
    
    def is_active(self):
        """Check if subscription is currently active"""
        return self.status in ['trialing', 'active']
    
    def is_trialing(self):
        """Check if subscription is in trial period"""
        if not self.trial_end:
            return False
        return timezone.now() < self.trial_end and self.status == 'trialing'
    
    def days_until_period_end(self):
        """Get days until current period ends"""
        if not self.current_period_end:
            return 0
        remaining = self.current_period_end - timezone.now()
        return max(0, remaining.days)
    
    def can_access_features(self):
        """Check if company can access fleet features"""
        return self.is_active() or self.is_trialing()


class Payment(models.Model):
    """Individual payment records"""
    
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
        ('refunded', 'Refunded'),
    ]
    
    subscription = models.ForeignKey(
        CompanySubscription,
        on_delete=models.CASCADE,
        related_name='payments',
        help_text="Subscription this payment belongs to"
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='payments',
        help_text="Company this payment belongs to"
    )
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Payment provider integration
    provider = models.CharField(
        max_length=50,
        default='stripe',
        help_text="Payment provider name"
    )
    provider_charge_id = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        unique=True,
        help_text="Charge/Transaction ID from payment provider"
    )
    provider_invoice_id = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Invoice ID from payment provider"
    )
    
    # Dates
    paid_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When payment was completed"
    )
    
    # Raw payload from payment provider
    raw_payload = models.JSONField(
        default=dict,
        blank=True,
        help_text="Raw webhook payload from payment provider"
    )
    
    # Metadata
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        indexes = [
            models.Index(fields=['subscription', '-created_at']),
            models.Index(fields=['company', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"Payment {self.id} - {self.company.name} - {self.amount} {self.currency} ({self.status})"


class WebhookEvent(models.Model):
    """Track webhook events from payment providers for idempotency"""
    
    provider = models.CharField(
        max_length=50,
        help_text="Payment provider name"
    )
    event_id = models.CharField(
        max_length=200,
        unique=True,
        help_text="Unique event ID from payment provider"
    )
    event_type = models.CharField(
        max_length=100,
        help_text="Event type (e.g., 'checkout.session.completed', 'invoice.paid')"
    )
    
    # Processing status
    processed = models.BooleanField(
        default=False,
        help_text="Whether this event has been processed"
    )
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When event was processed"
    )
    
    # Raw payload
    payload = models.JSONField(
        default=dict,
        help_text="Raw webhook payload"
    )
    
    # Error handling
    error_message = models.TextField(
        blank=True,
        help_text="Error message if processing failed"
    )
    retry_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of times processing was retried"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Webhook Event'
        verbose_name_plural = 'Webhook Events'
        indexes = [
            models.Index(fields=['provider', 'event_id']),
            models.Index(fields=['processed', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.provider} - {self.event_type} ({'processed' if self.processed else 'pending'})"
