from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
import json
import logging

from .models import Plan, CompanySubscription, Payment, WebhookEvent
from .serializers import (
    PlanSerializer, CompanySubscriptionSerializer, PaymentSerializer,
    CheckoutSessionRequestSerializer, CheckoutSessionResponseSerializer
)
from .providers import get_payment_provider
from account.models import Company

logger = logging.getLogger(__name__)


class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing available subscription plans"""
    
    queryset = Plan.objects.filter(is_active=True)
    serializer_class = PlanSerializer
    permission_classes = [AllowAny]  # Plans should be publicly visible
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active plans"""
        plans = self.queryset
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data)


class CompanySubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing company subscriptions"""
    
    serializer_class = CompanySubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get subscriptions for the user's company"""
        user = self.request.user
        if not user.company:
            return CompanySubscription.objects.none()
        return CompanySubscription.objects.filter(company=user.company)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current company subscription"""
        user = request.user
        if not user.company:
            return Response(
                {'error': 'User is not associated with a company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            subscription = CompanySubscription.objects.get(company=user.company)
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        except CompanySubscription.DoesNotExist:
            return Response(
                {'error': 'No subscription found for this company'},
                status=status.HTTP_404_NOT_FOUND
            )


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing payment history"""
    
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get payments for the user's company"""
        user = self.request.user
        if not user.company:
            return Payment.objects.none()
        return Payment.objects.filter(company=user.company)


class CheckoutSessionView(APIView):
    """Create checkout session for subscription"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create a checkout session"""
        serializer = CheckoutSessionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        if not user.company:
            return Response(
                {'error': 'User is not associated with a company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        company = user.company
        plan_id = serializer.validated_data['plan_id']
        billing_cycle = serializer.validated_data.get('billing_cycle', 'monthly')
        
        try:
            plan = Plan.objects.get(id=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response(
                {'error': 'Plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get payment provider
        provider = get_payment_provider(plan.provider)
        
        # Prepare metadata
        metadata = {
            'company_id': str(company.id),
            'company_slug': company.slug,
            'plan_id': str(plan.id),
            'plan_name': plan.name,
            'billing_cycle': billing_cycle,
        }
        
        # Determine amount and interval based on billing cycle
        interval = 'monthly' if billing_cycle == 'monthly' else 'yearly'
        amount = plan.amount
        if plan.interval != interval:
            # Convert amount if needed
            if plan.interval == 'year' and interval == 'monthly':
                amount = plan.amount / 12
            elif plan.interval == 'month' and interval == 'yearly':
                amount = plan.amount * 12
        
        # Create checkout session
        try:
            result = provider.create_checkout_session(
                plan_id=plan.provider_price_id or str(plan.id),
                amount=float(amount),
                currency=plan.currency,
                interval=interval,
                customer_id=company.payment_customer_id,
                success_url=serializer.validated_data.get('success_url'),
                cancel_url=serializer.validated_data.get('cancel_url'),
                metadata=metadata
            )
            
            # Update company with customer ID if created
            if result.get('customer_id') and not company.payment_customer_id:
                company.payment_customer_id = result['customer_id']
                company.save()
            
            response_serializer = CheckoutSessionResponseSerializer(result)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            return Response(
                {'error': 'Failed to create checkout session', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([AllowAny])  # Webhooks are public but signature-verified
def webhook_handler(request, provider_name):
    """
    Handle webhook events from payment providers
    
    This endpoint should be configured in the payment provider's dashboard
    to receive webhook notifications.
    """
    provider = get_payment_provider(provider_name)
    
    # Get raw payload
    payload = request.body
    signature = request.headers.get('X-Signature') or request.headers.get('Stripe-Signature', '')
    
    # Verify webhook signature
    if not provider.verify_webhook_signature(payload, signature):
        logger.warning(f"Invalid webhook signature from {provider_name}")
        return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Parse payload
    try:
        event_data = json.loads(payload)
    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Parse event
    parsed_event = provider.parse_webhook_event(event_data)
    event_id = parsed_event.get('event_id')
    event_type = parsed_event.get('event_type', '')
    
    # Check if event already processed (idempotency)
    webhook_event, created = WebhookEvent.objects.get_or_create(
        provider=provider_name,
        event_id=event_id,
        defaults={
            'event_type': event_type,
            'payload': event_data,
            'processed': False
        }
    )
    
    if not created and webhook_event.processed:
        # Event already processed
        return Response({'status': 'already_processed'}, status=status.HTTP_200_OK)
    
    # Process event
    try:
        _process_webhook_event(provider_name, parsed_event, webhook_event)
        webhook_event.processed = True
        webhook_event.processed_at = timezone.now()
        webhook_event.save()
        
        return Response({'status': 'processed'}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error processing webhook event {event_id}: {str(e)}")
        webhook_event.error_message = str(e)
        webhook_event.retry_count += 1
        webhook_event.save()
        
        return Response(
            {'error': 'Failed to process event', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _process_webhook_event(provider_name: str, event: dict, webhook_event: WebhookEvent):
    """
    Process webhook event and update subscription/payment records
    """
    event_type = event.get('event_type', '')
    subscription_id = event.get('subscription_id', '')
    customer_id = event.get('customer_id', '')
    status_value = event.get('status', '')
    
    # Find company by customer_id
    try:
        company = Company.objects.get(payment_customer_id=customer_id)
    except Company.DoesNotExist:
        logger.error(f"Company not found for customer_id: {customer_id}")
        return
    
    # Get or create subscription
    subscription, created = CompanySubscription.objects.get_or_create(
        company=company,
        defaults={
            'plan': Plan.objects.first(),  # Default plan, should be updated from metadata
            'status': 'trialing',
            'billing_cycle': 'monthly',
            'current_period_start': timezone.now(),
            'current_period_end': timezone.now() + timedelta(days=30),
        }
    )
    
    # Update subscription with provider IDs
    if subscription_id and not subscription.provider_subscription_id:
        subscription.provider_subscription_id = subscription_id
    if customer_id and not subscription.provider_customer_id:
        subscription.provider_customer_id = customer_id
    
    # Handle different event types
    if 'checkout.session.completed' in event_type or 'subscription.created' in event_type:
        # Subscription created/activated
        subscription.status = 'active'
        if event.get('period_start'):
            subscription.current_period_start = event['period_start']
        if event.get('period_end'):
            subscription.current_period_end = event['period_end']
        
        # Update company subscription status
        company.subscription_status = 'active'
        company.save()
    
    elif 'invoice.paid' in event_type or 'invoice.payment_succeeded' in event_type:
        # Payment succeeded
        subscription.status = 'active'
        if event.get('period_start'):
            subscription.current_period_start = event['period_start']
        if event.get('period_end'):
            subscription.current_period_end = event['period_end']
        
        # Create payment record
        Payment.objects.create(
            subscription=subscription,
            company=company,
            amount=event.get('amount', 0.0),
            currency=event.get('currency', 'USD'),
            status='success',
            provider=provider_name,
            provider_charge_id=event.get('charge_id', ''),
            provider_invoice_id=event.get('invoice_id', ''),
            paid_at=timezone.now(),
            raw_payload=webhook_event.payload,
            metadata=event.get('metadata', {})
        )
        
        # Update company subscription status
        company.subscription_status = 'active'
        company.is_payment_overdue = False
        company.save()
    
    elif 'invoice.payment_failed' in event_type:
        # Payment failed
        subscription.status = 'past_due'
        
        # Create payment record
        Payment.objects.create(
            subscription=subscription,
            company=company,
            amount=event.get('amount', 0.0),
            currency=event.get('currency', 'USD'),
            status='failed',
            provider=provider_name,
            provider_charge_id=event.get('charge_id', ''),
            provider_invoice_id=event.get('invoice_id', ''),
            raw_payload=webhook_event.payload,
            metadata=event.get('metadata', {})
        )
        
        # Update company subscription status
        company.subscription_status = 'expired'
        company.is_payment_overdue = True
        company.save()
    
    elif 'customer.subscription.updated' in event_type:
        # Subscription updated
        subscription.status = status_value
        if event.get('period_start'):
            subscription.current_period_start = event['period_start']
        if event.get('period_end'):
            subscription.current_period_end = event['period_end']
        subscription.cancel_at_period_end = event.get('cancel_at_period_end', False)
    
    elif 'customer.subscription.deleted' in event_type or 'subscription.canceled' in event_type:
        # Subscription canceled
        subscription.status = 'canceled'
        subscription.canceled_at = timezone.now()
        
        # Update company subscription status
        company.subscription_status = 'cancelled'
        company.save()
    
    # Save subscription
    subscription.save()
