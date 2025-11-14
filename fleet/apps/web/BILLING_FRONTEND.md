# Frontend Billing Implementation

## Overview

The frontend billing system has been fully integrated with the backend API. Users can now view plans, manage subscriptions, and complete checkout flows.

## Components Created

### 1. Services (`src/services/billing.ts`)
- `getPlans()` - Fetch all available subscription plans
- `getPlan(id)` - Get plan details
- `getCurrentSubscription()` - Get current company subscription
- `createCheckoutSession()` - Create checkout session for payment
- `getPayments()` - Get payment history
- `cancelSubscription()` - Cancel subscription

### 2. Hooks (`src/hooks/useSubscription.ts`)
- `useSubscription()` - Hook to check subscription status
  - Returns: `{ subscription, isLoading, isActive, isTrialing, canAccessFeatures, error }`

### 3. Components

#### `SubscriptionGuard` (`src/components/subscription/SubscriptionGuard.tsx`)
- Protects routes based on subscription status
- Redirects to subscription page if subscription is not active
- Can show warnings instead of blocking access

**Usage:**
```tsx
import SubscriptionGuard from '@/components/subscription/SubscriptionGuard';

export default function ProtectedPage() {
  return (
    <SubscriptionGuard requireActive={true}>
      <YourContent />
    </SubscriptionGuard>
  );
}
```

#### `SubscriptionBanner` (`src/components/subscription/SubscriptionBanner.tsx`)
- Shows warning banner when subscription is inactive
- Displays appropriate message based on subscription status
- Includes link to manage subscription

**Usage:**
```tsx
import SubscriptionBanner from '@/components/subscription/SubscriptionBanner';

export default function Dashboard() {
  return (
    <>
      <SubscriptionBanner />
      <YourContent />
    </>
  );
}
```

### 4. Pages

#### Updated Subscription Page (`src/app/dashboard/subscription/page.tsx`)
- Fetches real subscription data from API
- Fetches real plans from API
- Creates checkout sessions when user clicks "Upgrade"
- Shows real payment history
- Handles success/cancel redirects

#### Billing Success Page (`src/app/dashboard/billing/success/page.tsx`)
- Shown after successful payment
- Confirms subscription activation
- Provides navigation options

#### Billing Cancel Page (`src/app/dashboard/billing/cancel/page.tsx`)
- Shown when payment is canceled
- Provides option to try again

## API Integration

### Endpoints Used

1. **GET `/api/billing/plans/`** - List all active plans
2. **GET `/api/billing/subscriptions/current/`** - Get current subscription
3. **POST `/api/billing/checkout-session/`** - Create checkout session
4. **GET `/api/billing/payments/`** - Get payment history

### API Configuration

Added to `src/config/api.ts`:
```typescript
BILLING: {
  PLANS: '/billing/plans/',
  PLAN_DETAIL: (id: number) => `/billing/plans/${id}/`,
  CHECKOUT_SESSION: '/billing/checkout-session/',
  SUBSCRIPTION_CURRENT: '/billing/subscriptions/current/',
  SUBSCRIPTIONS: '/billing/subscriptions/',
  PAYMENTS: '/billing/payments/',
  WEBHOOK: (provider: string) => `/billing/webhooks/${provider}/`,
}
```

## Usage Examples

### Check Subscription Status

```tsx
import { useSubscription } from '@/hooks/useSubscription';

function MyComponent() {
  const { subscription, isActive, canAccessFeatures } = useSubscription();
  
  if (!canAccessFeatures) {
    return <div>Please upgrade your subscription</div>;
  }
  
  return <div>Welcome! Your subscription is active.</div>;
}
```

### Protect a Route

```tsx
import SubscriptionGuard from '@/components/subscription/SubscriptionGuard';

export default function PremiumFeature() {
  return (
    <SubscriptionGuard requireActive={true}>
      <PremiumContent />
    </SubscriptionGuard>
  );
}
```

### Show Warning Banner

```tsx
import SubscriptionBanner from '@/components/subscription/SubscriptionBanner';

export default function Dashboard() {
  return (
    <div>
      <SubscriptionBanner />
      <DashboardContent />
    </div>
  );
}
```

## Checkout Flow

1. User clicks "Upgrade Now" or "Switch Plan" on subscription page
2. Frontend calls `POST /api/billing/checkout-session/` with:
   - `plan_id`: Selected plan ID
   - `billing_cycle`: 'monthly' or 'yearly'
   - `success_url`: Redirect URL after success
   - `cancel_url`: Redirect URL if canceled
3. Backend returns `checkout_url`
4. Frontend redirects user to `checkout_url` (payment provider's hosted page)
5. User completes payment on provider's page
6. Payment provider sends webhook to backend
7. Backend processes webhook and activates subscription
8. User is redirected to `success_url` (`/dashboard/billing/success`)
9. Frontend shows success message

## Next Steps

1. **Add SubscriptionBanner to Dashboard Layout**
   - Add `<SubscriptionBanner />` to `src/app/dashboard/layout.tsx` to show warnings globally

2. **Protect Premium Features**
   - Wrap premium features with `<SubscriptionGuard requireActive={true}>`

3. **Add Subscription Link to Navigation**
   - Add "Subscription" link to dashboard navigation menu

4. **Handle Query Parameters**
   - Update subscription page to handle `?success=true` and `?canceled=true` query params
   - Show success/error messages accordingly

5. **Add Loading States**
   - Improve loading states during checkout session creation
   - Add loading indicators when fetching subscription data

## Testing

1. **Test Plan Selection**
   - Navigate to `/dashboard/subscription`
   - Verify plans are loaded from API
   - Verify current subscription is displayed

2. **Test Checkout Flow**
   - Click "Upgrade Now" on a plan
   - Verify checkout session is created
   - Verify redirect to payment provider (or mock checkout in development)

3. **Test Subscription Status**
   - Use `useSubscription` hook in a component
   - Verify it correctly identifies active/inactive subscriptions

4. **Test Subscription Guard**
   - Wrap a route with `SubscriptionGuard`
   - Verify redirect when subscription is inactive

## Environment Variables

Make sure these are set:
- `NEXT_PUBLIC_API_URL` - Backend API URL (defaults to `http://localhost:8000/api`)

## Notes

- The subscription page now uses real API data instead of mock data
- Payment history is fetched from the API
- Checkout flow redirects to payment provider's hosted page
- Success/cancel pages provide user feedback
- All components are ready to use throughout the application

