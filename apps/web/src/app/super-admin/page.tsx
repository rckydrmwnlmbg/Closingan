'use client';

import useSWR from 'swr';
import { adminFetcher } from '@/lib/apiAdmin';
import { Building2, CreditCard, AlertTriangle } from 'lucide-react';

export default function SuperAdminDashboard() {
  const { data, error, isLoading } = useSWR('/v1/admin/metrics', adminFetcher);

  if (error) return (
    <div className="p-4 bg-red-950/30 border border-red-900 rounded-lg text-red-400">
      Failed to load metrics. Please check your connection or re-authenticate.
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
        <p className="text-neutral-400 mt-1">System-wide metrics and health status.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Tenants */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-neutral-400">Total Tenants</h3>
            <Building2 className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-3xl font-bold text-white">
            {isLoading ? '...' : data?.totalTenants || 0}
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-neutral-400">Active Subscriptions</h3>
            <CreditCard className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            {isLoading ? '...' : data?.activeSubscriptions || 0}
          </div>
        </div>

        {/* Failed Messages */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-neutral-400">Failed Messages</h3>
            <AlertTriangle className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-3xl font-bold text-red-500">
            {isLoading ? '...' : data?.failedMessages || 0}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Delivery state FAILED across all queues</p>
        </div>
      </div>
    </div>
  );
}
