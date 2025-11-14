"""
Payment provider abstraction layer
Supports multiple payment providers (Stripe, Payfast, Paystack, Yoco, etc.)
"""
from abc import ABC, abstractmethod
from typing import Dict, Optional
from django.conf import settings


class PaymentProvider(ABC):
    """Abstract base class for payment providers"""
    
    def __init__(self, api_key: str, webhook_secret: str):
        self.api_key = api_key
        self.webhook_secret = webhook_secret
    
    @abstractmethod
    def create_checkout_session(
        self,
        plan_id: str,
        amount: float,
        currency: str,
        interval: str,
        customer_id: Optional[str] = None,
        success_url: str = None,
        cancel_url: str = None,
        metadata: Dict = None
    ) -> Dict:
        """
        Create a checkout session for subscription
        
        Returns:
            {
                'checkout_url': 'https://...',
                'session_id': '...',
                'customer_id': '...' (if created)
            }
        """
        pass
    
    @abstractmethod
    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """Verify webhook signature"""
        pass
    
    @abstractmethod
    def parse_webhook_event(self, payload: Dict) -> Dict:
        """
        Parse webhook event and return standardized format:
        {
            'event_id': '...',
            'event_type': '...',
            'subscription_id': '...',
            'customer_id': '...',
            'status': 'active|past_due|canceled|...',
            'amount': 0.0,
            'currency': 'USD',
            'period_start': datetime,
            'period_end': datetime,
            'metadata': {...}
        }
        """
        pass
    
    @abstractmethod
    def cancel_subscription(self, subscription_id: str, at_period_end: bool = True) -> bool:
        """Cancel a subscription"""
        pass


class StripeProvider(PaymentProvider):
    """Stripe payment provider implementation"""
    
    def __init__(self, api_key: str, webhook_secret: str):
        super().__init__(api_key, webhook_secret)
        try:
            import stripe
            stripe.api_key = api_key
            self.stripe = stripe
        except ImportError:
            raise ImportError("stripe package is required. Install with: pip install stripe")
    
    def create_checkout_session(
        self,
        plan_id: str,
        amount: float,
        currency: str,
        interval: str,
        customer_id: Optional[str] = None,
        success_url: str = None,
        cancel_url: str = None,
        metadata: Dict = None
    ) -> Dict:
        """Create Stripe checkout session"""
        # Convert interval to Stripe format
        stripe_interval = 'month' if interval == 'monthly' else 'year'
        
        # Create or retrieve customer
        if not customer_id:
            customer = self.stripe.Customer.create(
                metadata=metadata or {}
            )
            customer_id = customer.id
        else:
            customer = self.stripe.Customer.retrieve(customer_id)
        
        # Create price if needed (or use existing price_id from plan)
        # For now, we'll assume plan_id is the Stripe price ID
        price_id = plan_id
        
        # Create checkout session
        session = self.stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url or f"{settings.FRONTEND_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=cancel_url or f"{settings.FRONTEND_URL}/billing/cancel",
            metadata=metadata or {},
            subscription_data={
                'metadata': metadata or {}
            }
        )
        
        return {
            'checkout_url': session.url,
            'session_id': session.id,
            'customer_id': customer_id
        }
    
    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """Verify Stripe webhook signature"""
        try:
            self.stripe.Webhook.construct_event(
                payload,
                signature,
                self.webhook_secret
            )
            return True
        except Exception:
            return False
    
    def parse_webhook_event(self, payload: Dict) -> Dict:
        """Parse Stripe webhook event"""
        event_type = payload.get('type', '')
        data = payload.get('data', {}).get('object', {})
        
        result = {
            'event_id': payload.get('id', ''),
            'event_type': event_type,
            'subscription_id': data.get('subscription') or data.get('id', ''),
            'customer_id': data.get('customer', ''),
            'status': data.get('status', ''),
            'amount': 0.0,
            'currency': 'USD',
            'period_start': None,
            'period_end': None,
            'metadata': data.get('metadata', {})
        }
        
        # Handle subscription events
        if 'subscription' in event_type:
            result['subscription_id'] = data.get('id', '')
            result['status'] = data.get('status', '')
            if data.get('current_period_start'):
                from datetime import datetime
                result['period_start'] = datetime.fromtimestamp(data['current_period_start'])
            if data.get('current_period_end'):
                from datetime import datetime
                result['period_end'] = datetime.fromtimestamp(data['current_period_end'])
        
        # Handle invoice events
        if 'invoice' in event_type:
            result['subscription_id'] = data.get('subscription', '')
            result['amount'] = float(data.get('amount_paid', 0)) / 100  # Stripe uses cents
            result['currency'] = data.get('currency', 'usd').upper()
            if data.get('period_start'):
                from datetime import datetime
                result['period_start'] = datetime.fromtimestamp(data['period_start'])
            if data.get('period_end'):
                from datetime import datetime
                result['period_end'] = datetime.fromtimestamp(data['period_end'])
        
        return result
    
    def cancel_subscription(self, subscription_id: str, at_period_end: bool = True) -> bool:
        """Cancel Stripe subscription"""
        try:
            if at_period_end:
                self.stripe.Subscription.modify(
                    subscription_id,
                    cancel_at_period_end=True
                )
            else:
                self.stripe.Subscription.delete(subscription_id)
            return True
        except Exception:
            return False


class MockProvider(PaymentProvider):
    """Mock payment provider for development/testing"""
    
    def create_checkout_session(
        self,
        plan_id: str,
        amount: float,
        currency: str,
        interval: str,
        customer_id: Optional[str] = None,
        success_url: str = None,
        cancel_url: str = None,
        metadata: Dict = None
    ) -> Dict:
        """Create mock checkout session"""
        import uuid
        session_id = str(uuid.uuid4())
        customer_id = customer_id or f"mock_customer_{uuid.uuid4()}"
        
        return {
            'checkout_url': f"http://localhost:3000/billing/mock-checkout?session_id={session_id}",
            'session_id': session_id,
            'customer_id': customer_id
        }
    
    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """Mock webhook verification - always returns True in development"""
        return True
    
    def parse_webhook_event(self, payload: Dict) -> Dict:
        """Parse mock webhook event"""
        return {
            'event_id': payload.get('id', 'mock_event'),
            'event_type': payload.get('type', 'checkout.session.completed'),
            'subscription_id': payload.get('subscription_id', ''),
            'customer_id': payload.get('customer_id', ''),
            'status': payload.get('status', 'active'),
            'amount': payload.get('amount', 0.0),
            'currency': payload.get('currency', 'USD'),
            'period_start': payload.get('period_start'),
            'period_end': payload.get('period_end'),
            'metadata': payload.get('metadata', {})
        }
    
    def cancel_subscription(self, subscription_id: str, at_period_end: bool = True) -> bool:
        """Mock subscription cancellation"""
        return True


def get_payment_provider(provider_name: str = None) -> PaymentProvider:
    """
    Factory function to get payment provider instance
    
    Args:
        provider_name: Name of provider ('stripe', 'payfast', 'mock', etc.)
    
    Returns:
        PaymentProvider instance
    """
    provider_name = provider_name or getattr(settings, 'PAYMENT_PROVIDER', 'mock').lower()
    
    # Get provider settings
    provider_settings = getattr(settings, 'PAYMENT_PROVIDERS', {}).get(provider_name, {})
    api_key = provider_settings.get('api_key', '')
    webhook_secret = provider_settings.get('webhook_secret', '')
    
    if provider_name == 'stripe':
        return StripeProvider(api_key, webhook_secret)
    elif provider_name == 'mock':
        return MockProvider(api_key, webhook_secret)
    else:
        # For other providers (Payfast, Paystack, Yoco), return mock for now
        # These can be implemented later
        return MockProvider(api_key, webhook_secret)

