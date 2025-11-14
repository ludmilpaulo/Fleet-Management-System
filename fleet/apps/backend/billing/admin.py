from django.contrib import admin
from .models import Plan, CompanySubscription, Payment, WebhookEvent


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'display_name', 'amount', 'currency', 'interval', 'is_active', 'is_popular']
    list_filter = ['is_active', 'is_popular', 'interval', 'currency']
    search_fields = ['name', 'display_name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CompanySubscription)
class CompanySubscriptionAdmin(admin.ModelAdmin):
    list_display = ['company', 'plan', 'status', 'billing_cycle', 'current_period_end', 'is_active']
    list_filter = ['status', 'billing_cycle', 'cancel_at_period_end']
    search_fields = ['company__name', 'plan__name', 'provider_subscription_id']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'current_period_end'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['company', 'amount', 'currency', 'status', 'provider', 'paid_at', 'created_at']
    list_filter = ['status', 'provider', 'currency']
    search_fields = ['company__name', 'provider_charge_id', 'provider_invoice_id']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ['provider', 'event_type', 'event_id', 'processed', 'retry_count', 'created_at']
    list_filter = ['provider', 'processed', 'event_type']
    search_fields = ['event_id', 'event_type']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
