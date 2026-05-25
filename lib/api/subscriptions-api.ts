import axios from 'axios';
import { apiClient } from './client';

type ApiEnvelope<T> = {
  success: true;
  data: T;
};

type ApiErrorEnvelope = {
  success?: false;
  message?: string | string[];
  error?: {
    message?: string | string[];
  };
};

export type CurrentSubscription = {
  id: string;
  plan: string;
  status: string;
  analysesLimit: number;
  analysesUsed: number;
  billingCycle: string;
  priceEur: string;
  renewsAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  billingProvider: 'STRIPE' | null;
};

export type SubscriptionUsage = {
  plan: string;
  status: string;
  analysesLimit: number;
  analysesUsed: number;
  remainingAnalyses: number;
  canStartAnalysis: boolean;
  resetPeriod: 'lifetime' | 'monthly';
  renewsAt: string | null;
  reason: string | null;
};

export async function getCurrentSubscription(): Promise<CurrentSubscription> {
  const response =
    await apiClient.get<ApiEnvelope<CurrentSubscription>>('/subscriptions/me');
  return response.data.data;
}

export async function getSubscriptionUsage(): Promise<SubscriptionUsage> {
  const response =
    await apiClient.get<ApiEnvelope<SubscriptionUsage>>('/subscriptions/usage');
  return response.data.data;
}

export async function createCheckoutSession(payload: {
  plan: 'PREMIUM';
}): Promise<{
  checkoutUrl: string;
  sessionId: string;
  plan: string;
}> {
  const response = await apiClient.post<
    ApiEnvelope<{
      checkoutUrl: string;
      sessionId: string;
      plan: string;
    }>
  >('/subscriptions/checkout-session', payload);

  return response.data.data;
}

export async function createBillingPortalSession(): Promise<{ url: string }> {
  const response = await apiClient.post<ApiEnvelope<{ url: string }>>(
    '/subscriptions/billing-portal',
  );

  return response.data.data;
}

export async function syncSubscription(): Promise<{ synced: boolean }> {
  const response = await apiClient.post<ApiEnvelope<{ synced: boolean }>>(
    '/subscriptions/sync',
  );

  return response.data.data;
}

export function getSubscriptionApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorEnvelope>(error)) {
    const rawMessage =
      error.response?.data?.error?.message ?? error.response?.data?.message;

    if (Array.isArray(rawMessage) && rawMessage.length > 0) {
      return rawMessage.join(', ');
    }

    if (typeof rawMessage === 'string' && rawMessage.length > 0) {
      return rawMessage;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'We could not complete the billing request right now.';
}
