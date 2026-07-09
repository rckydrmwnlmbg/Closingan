'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Users, CheckCircle, Clock } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface Referral {
  id: string;
  status: string;
  createdAt: string;
  receiver: { name: string; createdAt: string } | null;
}

interface ReferralData {
  referralCode?: string;
  stats: { total: number; converted: number; pending: number };
  referrals: Referral[];
}

export default function ReferralPage() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchReferrals() {
      try {
        const { fetchApi } = await import('@/lib/api');
        const res = await fetchApi('/tenant/referrals');
        setReferralData(res.data);
      } catch (err) {
        console.error('Failed to load referrals', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReferrals();
  }, []);

  const handleCopy = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-white">Memuat data referral...</div>;
  }

  const { referralCode, stats, referrals } = referralData || {};

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Referral Program</h1>
        <p className="text-zinc-400 text-sm mt-1">Ajak kolega menggunakan Closingan dan dapatkan bonus 7 hari gratis setelah langganan pertama mereka.</p>
      </div>

      <div className={`p-6 border ${siteConfig.theme.borderClass} rounded-xl bg-white/5`}>
        <h2 className="text-sm font-medium text-zinc-300 uppercase tracking-widest mb-4">Kode Referral Anda</h2>
        <div className="flex items-center gap-4">
          <code className="px-4 py-3 bg-black/50 text-white rounded-lg border border-white/10 text-xl tracking-wider font-mono">
            {referralCode || '----'}
          </code>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-zinc-200 text-black rounded-lg transition-colors font-medium text-sm"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tersalin!' : 'Salin Kode'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 border ${siteConfig.theme.borderClass} rounded-xl bg-white/5`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Total Daftar</h3>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-semibold text-white">{stats?.total || 0}</p>
        </div>
        <div className={`p-6 border ${siteConfig.theme.borderClass} rounded-xl bg-white/5`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Aktif (Trial)</h3>
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-semibold text-white">{stats?.pending || 0}</p>
        </div>
        <div className={`p-6 border ${siteConfig.theme.borderClass} rounded-xl bg-white/5`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Sukses (Bonus)</h3>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-semibold text-white">{stats?.converted || 0}</p>
        </div>
      </div>

      <div className="pt-8">
        <h2 className="text-lg font-medium text-white mb-4">Riwayat Referral</h2>
        
        {(!referrals || referrals.length === 0) ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-zinc-500 text-sm">
            Belum ada referral yang menggunakan kode Anda.
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((ref: Referral) => (
              <div key={ref.id} className={`flex items-center justify-between p-4 border ${siteConfig.theme.borderClass} rounded-xl bg-white/5`}>
                <div>
                  <p className="text-white font-medium">{ref.receiver?.name || 'Tanpa Nama'}</p>
                  <p className="text-xs text-zinc-500 mt-1">Bergabung: {new Date(ref.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  {ref.status === 'CONVERTED_TO_PAID' ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Berhasil (+7 Hari)</span>
                  ) : ref.status === 'TRIAL_ACTIVE' || ref.status === 'SIGNED_UP' ? (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">Trial Aktif</span>
                  ) : (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">Expired</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
