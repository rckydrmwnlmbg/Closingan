"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, AlertCircle } from 'lucide-react';
import { useQuotaStatus, buyAddon } from './hooks/useBilling';

export function QuotaUsageCard() {
  const { quota, isLoading, mutate } = useQuotaStatus();
  const [buyLoading, setBuyLoading] = useState(false);

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 animate-pulse h-64">
      </Card>
    );
  }

  const total = quota?.totalQuota || 0;
  const used = quota?.messagesUsed || 0;
  const extra = quota?.extraCredits || 0;
  
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  
  let progressColor = 'bg-emerald-500';
  if (percentage >= 95) progressColor = 'bg-red-500';
  else if (percentage >= 80) progressColor = 'bg-yellow-500';

  const handleBuyAddon = async () => {
    setBuyLoading(true);
    try {
      const result = await buyAddon();
      if (result.paymentUrl) {
        window.open(result.paymentUrl, '_blank');
      }
      // Refresh quota data after potential purchase
      await mutate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal membuat invoice add-on.');
    } finally {
      setBuyLoading(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Zap className="text-emerald-500" size={24} />
          Penggunaan AI Credits
        </CardTitle>
        <CardDescription className="text-white/50 mt-1">
          Monitor konsumsi token AI untuk siklus billing saat ini
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {quota?.upsell && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/90 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">AI credits hampir habis!</p>
              <p>Anda telah menggunakan lebih dari 90% kuota. Pertimbangkan untuk membeli tambahan.</p>
            </div>
          </div>
        )}

        <div className="mb-2 flex justify-between text-sm">
          <span className="text-white/70">Terpakai: <span className="font-bold text-white">{used.toLocaleString('id-ID')}</span></span>
          <span className="text-white/70">Total: <span className="font-bold text-white">{(total + extra).toLocaleString('id-ID')}</span></span>
        </div>
        
        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full ${progressColor} transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {extra > 0 && (
          <p className="text-xs text-white/50 mt-3">
            Termasuk <span className="text-emerald-400 font-medium">{extra.toLocaleString('id-ID')}</span> credit tambahan dari add-on.
          </p>
        )}
      </CardContent>

      <CardFooter className="border-t border-white/10 pt-6">
        <Button
          variant="outline"
          className="w-full sm:w-auto border-white/10 hover:bg-white/10"
          onClick={handleBuyAddon}
          disabled={buyLoading}
        >
          {buyLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
              Memproses...
            </span>
          ) : (
            'Beli AI Credit Tambahan'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
