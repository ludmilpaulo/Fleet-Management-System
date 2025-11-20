import { API_CONFIG } from '@/config/api';
import { api } from '@/lib/api';

export interface Plan {
  id: number;
  name: string;
  display_name: string;
  description: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: Record<string, any>;
  is_active: boolean;
  is_popular: boolean;
  provider_price_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanySubscription {
  id: number;
  company: number;
  company_name: string;
  plan: Plan;
  plan_id?: number;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  provider_subscription_id?: string;
  provider_customer_id?: string;
  is_active: boolean;
  days_until_period_end: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  subscription: number;
  company: number;
  company_name: string;
  subscription_plan: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  provider: string;
  provider_charge_id?: string;
  provider_invoice_id?: string;
  paid_at?: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CheckoutSessionRequest {
  plan_id: number;
  billing_cycle: 'monthly' | 'yearly';
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id?: string;
}

// Helper to remove leading slash for axios (which ignores baseURL path when path starts with /)
const normalizePath = (path: string) => path.startsWith('/') ? path.slice(1) : path;

/**
 * Get all available subscription plans
 */
export const getPlans = async (): Promise<Plan[]> => {
  const response = await api.get<Plan[]>(normalizePath(API_CONFIG.ENDPOINTS.BILLING.PLANS));
  return response.data;
};

/**
 * Get plan details by ID
 */
export const getPlan = async (id: number): Promise<Plan> => {
  const response = await api.get<Plan>(normalizePath(API_CONFIG.ENDPOINTS.BILLING.PLAN_DETAIL(id)));
  return response.data;
};

/**
 * Get current company subscription
 */
export const getCurrentSubscription = async (): Promise<CompanySubscription | null> => {
  try {
    const response = await api.get<CompanySubscription>(normalizePath(API_CONFIG.ENDPOINTS.BILLING.SUBSCRIPTION_CURRENT));
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Create checkout session for subscription
 */
export const createCheckoutSession = async (
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> => {
  const response = await api.post<CheckoutSessionResponse>(
    normalizePath(API_CONFIG.ENDPOINTS.BILLING.CHECKOUT_SESSION),
    request
  );
  return response.data;
};

/**
 * Get payment history
 */
export const getPayments = async (): Promise<Payment[]> => {
  const response = await api.get<Payment[]>(normalizePath(API_CONFIG.ENDPOINTS.BILLING.PAYMENTS));
  return response.data;
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (subscriptionId: number, atPeriodEnd: boolean = true): Promise<void> => {
  await api.post(`billing/subscriptions/${subscriptionId}/cancel/`, {
    at_period_end: atPeriodEnd,
  });
};

