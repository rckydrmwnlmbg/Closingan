"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { useBillingSubscription, upgradePlan } from './hooks/useBilling';

interface PlanConfig {
  key: string;
  name: string;
  price: number;
  priceLabel: string;
  tokenQuota: string;
  icon: React.ReactNode;
  gradient: string;
  features: string[];
  popular?: boolean;
}

const PLANS: PlanConfig[] = [
  {
    key: 'STARTER',
    name: 'Starter',
    price: 99000,
    priceLabel: 'Rp 99.000',
    tokenQuota: '100K',
    icon: <Zap className="text-blue-400" size={28} />,
    gradient: 'from-blue-500/20 to-blue-600/5',
    features: [
      '100.000 AI Token / bulan',
      '1 Nomor WhatsApp',
      'AI Assist Mode',
      'Inbox & Dashboard',
      'Follow-up Management',
      'Email Support',
    ],
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: 249000,
    priceLabel: 'Rp 249.000',
    tokenQuota: '500K',
    icon: <Sparkles className="text-emerald-400" size={28} />,
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    popular: true,
    features: [
      '500.000 AI Token / bulan',
      '1 Nomor WhatsApp',
      'AI Auto-Reply + Smart Hybrid',
      'Campaign & Blast',
      'Hot Lead Detection',
      'Knowledge Base (RAG)',
      'Priority Support',
    ],
  },
  {
    key: 'ELITE',
    name: 'Elite',
    price: 499000,
    priceLabel: 'Rp 499.000',
    tokenQuota: '2M',
    icon: <Crown className="text-amber-400" size={28} />,
    gradient: 'from-amber-500/20 to-amber-600/5',
    features: [
      '2.000.000 AI Token / bulan',
      '1 Nomor WhatsApp',
      'Semua fitur Pro',
      'Multi-Model AI Routing',
      'Analytics Dashboard',
      'Churn Prevention',
      'Dedicated Support',
    ],
  },
];

export function PricingPlans() {
  const { subscription, isLoading } = useBillingSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planKey: string) => {
    setLoadingPlan(planKey);
    try {
      const result = await upgradePlan(planKey);
      if (result.paymentUrl) {
        window.open(result.paymentUrl, '_blank');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal membuat invoice.');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (isLoading) {
    return (
      <div id="pricing-plans" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/5 border-white/10 animate-pulse h-96" />
        ))}
      </div>
    );
  }

  const currentPlan = subscription?.plan?.toUpperCase() || 'STARTER';

  return (
    <div id="pricing-plans">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Pilih Paket</h2>
        <p className="text-white/50 text-sm mt-1">
          Upgrade kapan saja. Pembayaran aman melalui Midtrans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key;
          const isLower = PLANS.findIndex(p => p.key === plan.key) <= PLANS.findIndex(p => p.key === currentPlan);

          return (
            <Card
              key={plan.key}
              className={`relative bg-gradient-to-b ${plan.gradient} border-white/10 transition-all duration-300 hover:border-white/20 hover:scale-[1.02] ${
                plan.popular ? 'ring-2 ring-emerald-500/50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-500 text-white px-3 py-1 text-xs font-semibold">
                    PALING POPULER
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  {plan.icon}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">{plan.priceLabel}</span>
                  <span className="text-white/40 text-sm mb-1">/bulan</span>
                </div>
                <CardDescription className="text-white/50 mt-1">
                  {plan.tokenQuota} AI tokens per bulan
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {isCurrent ? (
                    <Button
                      disabled
                      className="w-full bg-white/10 text-white/50 cursor-not-allowed"
                    >
                      Paket Saat Ini
                    </Button>
                  ) : isLower && subscription?.state === 'ACTIVE' ? (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full border-white/10 text-white/40 cursor-not-allowed"
                    >
                      Tidak Bisa Downgrade
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.key)}
                      disabled={loadingPlan === plan.key}
                      className={`w-full font-semibold transition-all duration-200 ${
                        plan.popular
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {loadingPlan === plan.key ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                          Memproses...
                        </span>
                      ) : (
                        `Upgrade ke ${plan.name}`
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
