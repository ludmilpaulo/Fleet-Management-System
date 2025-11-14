# Billing System Documentation

## Overview

The billing system provides subscription management for the multi-tenant fleet management SaaS. It integrates with payment providers (Stripe, Payfast, Paystack, Yoco, etc.) to handle recurring subscriptions and automatic activation via webhooks.

## Architecture

### Models

1. **Plan**: Defines subscription plans with pricing, features, and limits
2. **CompanySubscription**: Tracks company subscriptions with payment provider integration
3. **Payment**: Records individual payment transactions
4. **WebhookEvent**: Tracks webhook events for idempotency

### Payment Provider Integration

The system uses an abstraction layer (`billing/providers.py`) that supports multiple payment providers:

- **Stripe**: Full implementation
- **Mock**: For development/testing
- **Payfast/Paystack/Yoco**: Can be implemented by extending `PaymentProvider`

### API Endpoints

#### Public Endpoints

- `GET /api/billing/plans/` - List all active plans
- `GET /api/billing/plans/{id}/` - Get plan details

#### Authenticated Endpoints

- `POST /api/billing/checkout-session/` - Create checkout session
  ```json
  {
    "plan_id": 1,
    "billing_cycle": "monthly",
    "success_url": "https://...",
    "cancel_url": "https://..."
  }
  ```
  Returns:
  ```json
  {
    "checkout_url": "https://payment-provider/checkout/...",
    "session_id": "..."
  }
  ```

- `GET /api/billing/subscriptions/current/` - Get current subscription
- `GET /api/billing/payments/` - Get payment history

#### Webhook Endpoints

- `POST /api/billing/webhooks/{provider}/` - Receive webhook events
  - Protected by signature verification
  - Processes events idempotently

## Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
# Payment Provider
PAYMENT_PROVIDER=stripe  # or 'payfast', 'paystack', 'yoco', 'mock'

# Stripe (if using Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 2. Migrations

```bash
python manage.py migrate billing
python manage.py migrate account  # For payment_customer_id field
```

### 3. Create Plans

Create subscription plans via Django admin or management command:

```python
from billing.models import Plan

Plan.objects.create(
    name='basic',
    display_name='Basic Plan',
    amount=29.99,
    currency='USD',
    interval='month',
    features={'max_vehicles': 50, 'max_users': 10},
    provider_price_id='price_...',  # From payment provider
    is_active=True
)
```

## Usage

### Creating a Checkout Session

1. User selects a plan on frontend
2. Frontend calls `POST /api/billing/checkout-session/` with `plan_id`
3. Backend creates checkout session with payment provider
4. Frontend redirects user to `checkout_url`
5. User completes payment on provider's hosted page

### Webhook Processing

1. Payment provider sends webhook to `/api/billing/webhooks/{provider}/`
2. Backend verifies webhook signature
3. Backend processes event and updates subscription/payment records
4. Subscription is automatically activated

### Access Control

Use permission classes in your views:

```python
from billing.permissions import HasActiveSubscription

class MyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasActiveSubscription]
    # ...
```

## Webhook Events

The system handles these webhook events:

- `checkout.session.completed` - Subscription created
- `invoice.paid` / `invoice.payment_succeeded` - Payment succeeded
- `invoice.payment_failed` - Payment failed
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription canceled

## Testing

Use the Mock provider for development:

```python
# settings.py
PAYMENT_PROVIDER = 'mock'
```

The mock provider will:
- Return mock checkout URLs
- Accept all webhook signatures
- Process webhook events without actual payment

## Production Checklist

- [ ] Set up payment provider account (Stripe, Payfast, etc.)
- [ ] Configure webhook endpoint in provider dashboard
- [ ] Set environment variables for API keys and webhook secrets
- [ ] Create subscription plans in payment provider
- [ ] Update `provider_price_id` in Plan models
- [ ] Test webhook processing
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications for subscription events

