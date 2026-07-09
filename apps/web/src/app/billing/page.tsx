"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SubscriptionCard } from '@/components/billing/SubscriptionCard';
import { QuotaUsageCard } from '@/components/billing/QuotaUsageCard';
import { InvoiceHistoryTable } from '@/components/billing/InvoiceHistoryTable';

export default function BillingPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Billing & Subscription</h1>
          <p className="text-white/50">
            Manage your subscription plan, monitor AI quota usage, and view billing history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SubscriptionCard />
          <QuotaUsageCard />
        </div>

        <InvoiceHistoryTable />
      </div>
    </DashboardLayout>
  );
}
