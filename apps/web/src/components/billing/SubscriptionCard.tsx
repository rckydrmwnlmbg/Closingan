"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreditCard, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useBillingSubscription, cancelSubscription, upgradePlan } from './hooks/useBilling';

const STATE_LABELS: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
  TRIAL: { label: 'Trial', variant: 'outline' },
  ACTIVE: { label: 'Aktif', variant: 'default' },
  PAST_DUE: { label: 'Menunggu Bayar', variant: 'destructive' },
  SUSPENDED: { label: 'Ditangguhkan', variant: 'destructive' },
  CANCELLED: { label: 'Dibatalkan', variant: 'secondary' },
};

export function SubscriptionCard() {
  const { subscription, isLoading, mutate } = useBillingSubscription();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [payNowLoading, setPayNowLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 animate-pulse">
        <CardHeader className="h-24"></CardHeader>
        <CardContent className="h-16"></CardContent>
      </Card>
    );
  }

  const isPastDue = subscription?.state === 'PAST_DUE';
  const isSuspended = subscription?.state === 'SUSPENDED';
  const isActive = subscription?.state === 'ACTIVE' || subscription?.state === 'TRIAL';
  const isCancelled = subscription?.state === 'CANCELLED';

  const stateConfig = STATE_LABELS[subscription?.state || 'TRIAL'] || STATE_LABELS.TRIAL;

  const handlePayNow = async () => {
    if (!subscription) return;
    setPayNowLoading(true);
    try {
      const result = await upgradePlan(subscription.plan);
      if (result.paymentUrl) {
        window.open(result.paymentUrl, '_blank');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal membuat invoice.');
    } finally {
      setPayNowLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await cancelSubscription();
      await mutate();
      setShowCancelConfirm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal membatalkan subscription.');
    } finally {
      setCancelLoading(false);
    }
  };

  const scrollToPlans = () => {
    const plansSection = document.getElementById('pricing-plans');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const periodEndDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : subscription?.trialEndsAt
    ? new Date(subscription.trialEndsAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-';

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="text-emerald-500" size={24} />
              Paket Langganan
            </CardTitle>
            <CardDescription className="text-white/50 mt-1">
              Kelola detail paket dan pembayaran Anda
            </CardDescription>
          </div>
          {subscription && (
            <Badge variant={stateConfig.variant} className="uppercase">
              {subscription.plan} ({stateConfig.label})
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {(isPastDue || isSuspended) && (
          <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/20 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {isPastDue ? 'Pembayaran Tertunggak' : 'Akun Ditangguhkan'}
            </AlertTitle>
            <AlertDescription>
              {isPastDue
                ? 'Pembayaran terakhir Anda gagal. Segera bayar untuk menghindari penangguhan layanan.'
                : 'Akun Anda telah ditangguhkan karena pembayaran tertunggak. Bayar sekarang untuk mengaktifkan kembali.'}
            </AlertDescription>
          </Alert>
        )}

        {!subscription ? (
          <div className="text-white/50 py-4">Belum ada subscription aktif.</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/50 block mb-1">
                  {subscription.state === 'TRIAL' ? 'Trial Berakhir' : 'Periode Berakhir'}
                </span>
                <span className="font-medium">{periodEndDate}</span>
              </div>
              <div>
                <span className="text-white/50 block mb-1">Status</span>
                <span className="font-medium flex items-center gap-1">
                  {isActive ? (
                    <><CheckCircle2 className="text-emerald-500" size={16} /> Aktif</>
                  ) : isCancelled ? (
                    <><XCircle className="text-red-400" size={16} /> Dibatalkan</>
                  ) : (
                    <><AlertTriangle className="text-yellow-500" size={16} /> {stateConfig.label}</>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-white/10 pt-6 flex gap-3 flex-wrap">
        {isPastDue || isSuspended ? (
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={handlePayNow}
            disabled={payNowLoading}
          >
            {payNowLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                Memproses...
              </span>
            ) : (
              'Bayar Sekarang'
            )}
          </Button>
        ) : (
          <Button
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={scrollToPlans}
          >
            Upgrade Paket
          </Button>
        )}

        {isActive && !showCancelConfirm && (
          <Button
            variant="outline"
            className="w-full sm:w-auto border-white/10 text-white/60 hover:bg-white/10"
            onClick={() => setShowCancelConfirm(true)}
          >
            Batalkan Langganan
          </Button>
        )}

        {showCancelConfirm && (
          <div className="w-full flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-red-400 text-sm flex-1">
              Yakin ingin membatalkan? Akses tetap aktif sampai akhir periode.
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Memproses...' : 'Ya, Batalkan'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10"
              onClick={() => setShowCancelConfirm(false)}
            >
              Tidak
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
