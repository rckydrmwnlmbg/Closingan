import useSWR from 'swr';

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethodId?: string | null;
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
  subscriptionId?: string | null;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'VOID';
  paymentUrl?: string | null;
  description: string;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const fetcher = async (url: string) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    });
    if (!res.ok) throw new Error('Failed to fetch API');
    const data = await res.json();
    return data.data || data; // handle ResponseBuilder vs bare object
  } catch (err) {
    throw err;
  }
};

export function useBillingSubscription() {
  const { data, error, isLoading, mutate } = useSWR<Subscription>('/billing/subscription', fetcher);
  return { subscription: data, error, isLoading, mutate };
}

export function useQuotaStatus() {
  const { data, error, isLoading, mutate } = useSWR<QuotaStatus>('/quota/status', fetcher);
  return { quota: data, error, isLoading, mutate };
}

export function useBillingInvoices() {
  const { data, error, isLoading, mutate } = useSWR<Invoice[]>('/billing/invoices', fetcher);
  return { invoices: data, error, isLoading, mutate };
}
