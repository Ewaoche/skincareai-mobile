import { apiClient } from './client';

type ApiEnvelope<T> = {
  success: true;
  data: T;
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
