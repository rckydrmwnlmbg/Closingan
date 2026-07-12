import useSWR from 'swr';
import { fetchApi, fetcher } from '@/lib/api';

export interface Subscription {
  id: string;
  tenantId: string;
  plan: 'STARTER' | 'PRO' | 'ELITE';
  state: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED';
  trialEndsAt?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelledAt?: string | null;
  suspendedAt?: string | null;
  pastDueAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuotaStatus {
  totalQuota: number;
  messagesUsed: number;
  extraCredits: number;
  upsell?: {
    action: string;
    packageName: string;
    price: number;
  };
}

export interface Invoice {
  id: string;
  tenantId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED';
  description: string;
  externalId?: string | null;
  paymentUrl?: string | null;
  paidAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useBillingSubscription() {
  const { data, error, isLoading, mutate } = useSWR<Subscription>('/v1/billing/subscription', fetcher);
  return { subscription: data, error, isLoading, mutate };
}

export function useQuotaStatus() {
  const { data, error, isLoading, mutate } = useSWR<QuotaStatus>('/v1/quota/status', fetcher);
  return { quota: data, error, isLoading, mutate };
}

export function useBillingInvoices() {
  const { data, error, isLoading, mutate } = useSWR<Invoice[]>('/v1/billing/invoices', fetcher);
  return { invoices: data, error, isLoading, mutate };
}

export async function buyAddon(): Promise<{ paymentUrl: string; invoiceId: string }> {
  const res = await fetchApi('/v1/quota/buy-addon', { method: 'POST' });
  return res.data;
}

export async function cancelSubscription(): Promise<void> {
  await fetchApi('/v1/billing/cancel', { method: 'POST' });
}

export async function upgradePlan(plan: string): Promise<{ paymentUrl: string; invoiceId: string }> {
  const res = await fetchApi('/v1/billing/upgrade', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
  return res.data;
}
