"use client";

import React, { useState, useCallback } from 'react';
import useSWR from 'swr';
import { fetchAdminApi, adminFetcher } from '@/lib/apiAdmin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface AbuseFlag {
  id: string;
  tenantId: string;
  flagType: string;
  details: Record<string, unknown>;
  severity: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  resolution?: string | null;
  createdAt: string;
  tenant?: { id: string; name: string };
}

const SEVERITY_CONFIG: Record<string, { className: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
  CRITICAL: { className: 'bg-red-500/20 text-red-400', variant: 'destructive' },
  HIGH: { className: 'bg-orange-500/20 text-orange-400', variant: 'destructive' },
  MEDIUM: { className: 'bg-yellow-500/20 text-yellow-400', variant: 'outline' },
  LOW: { className: 'bg-blue-500/20 text-blue-400', variant: 'outline' },
};

const FLAG_TYPE_LABELS: Record<string, string> = {
  EXCESSIVE_AI_CALLS: 'AI Calls Berlebihan',
  REPEATED_BLAST_SAME_NUMBER: 'Blast ke Nomor Sama Berulang',
  MULTI_IP_LOGIN: 'Login dari Banyak IP',
  HIGH_API_RATE: 'API Rate Tinggi',
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  PENDING: { label: 'Menunggu Review', icon: <AlertTriangle size={14} />, className: 'bg-yellow-500/20 text-yellow-400' },
  REVIEWED: { label: 'Sudah Direview', icon: <CheckCircle2 size={14} />, className: 'bg-emerald-500/20 text-emerald-400' },
  DISMISSED: { label: 'Ditolak', icon: <XCircle size={14} />, className: 'bg-white/10 text-white/50' },
};

type FilterStatus = 'ALL' | 'PENDING' | 'REVIEWED' | 'DISMISSED';

export function FairUsageDashboard() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const queryParam = filterStatus === 'ALL' ? '' : `?status=${filterStatus}`;
  const { data: flags, error, isLoading, mutate } = useSWR<AbuseFlag[]>(
    `/v1/admin/abuse-flags${queryParam}`,
    adminFetcher,
  );

  const handleResolve = useCallback(async (flagId: string, dismiss: boolean) => {
    setProcessingId(flagId);
    try {
      await fetchAdminApi(`/v1/admin/abuse-flags/${flagId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({
          reviewedBy: 'admin',
          resolution: dismiss ? 'Dismissed by admin' : 'Reviewed and acknowledged',
          dismiss,
        }),
      });
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal memproses flag.');
    } finally {
      setProcessingId(null);
    }
  }, [mutate]);

  const handleScan = async () => {
    setScanning(true);
    try {
      await fetchAdminApi('/v1/admin/abuse-flags/scan', { method: 'POST' });
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menjalankan scan.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="text-emerald-500" size={24} />
              Fair Usage Monitoring
            </CardTitle>
            <CardDescription className="text-white/50 mt-1">
              Monitor dan review anomali penggunaan per tenant
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 hover:bg-white/10"
            onClick={handleScan}
            disabled={scanning}
          >
            {scanning ? (
              <span className="flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin" /> Scanning...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw size={14} /> Scan Sekarang
              </span>
            )}
          </Button>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {(['ALL', 'PENDING', 'REVIEWED', 'DISMISSED'] as FilterStatus[]).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              className={filterStatus === status 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                : 'border-white/10 text-white/60 hover:bg-white/10'}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'ALL' ? 'Semua' : STATUS_CONFIG[status]?.label || status}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">
            Gagal memuat data. Silakan refresh halaman.
          </div>
        ) : !flags || flags.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            <Shield size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Tidak ada flag ditemukan</p>
            <p className="text-sm mt-1">Semua tenant beroperasi normal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flags.map((flag) => {
              const sevConfig = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.LOW;
              const statConfig = STATUS_CONFIG[flag.status] || STATUS_CONFIG.PENDING;

              return (
                <div
                  key={flag.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant={sevConfig.variant} className={sevConfig.className}>
                          {flag.severity}
                        </Badge>
                        <Badge variant="outline" className="border-white/10 text-white/70">
                          {FLAG_TYPE_LABELS[flag.flagType] || flag.flagType}
                        </Badge>
                        <Badge variant="outline" className={statConfig.className}>
                          <span className="flex items-center gap-1">
                            {statConfig.icon} {statConfig.label}
                          </span>
                        </Badge>
                      </div>

                      <div className="text-sm text-white/70 space-y-1">
                        <p>
                          <span className="text-white/40">Tenant:</span>{' '}
                          <span className="font-medium">{flag.tenant?.name || flag.tenantId}</span>
                        </p>
                        <p>
                          <span className="text-white/40">Waktu:</span>{' '}
                          {new Date(flag.createdAt).toLocaleString('id-ID')}
                        </p>
                        {flag.details && (
                          <p className="text-xs text-white/40 font-mono bg-white/5 p-2 rounded mt-2">
                            {JSON.stringify(flag.details, null, 2)}
                          </p>
                        )}
                        {flag.resolution && (
                          <p className="text-xs text-emerald-400 mt-1">
                            Resolusi: {flag.resolution}
                          </p>
                        )}
                      </div>
                    </div>

                    {flag.status === 'PENDING' && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                          onClick={() => handleResolve(flag.id, false)}
                          disabled={processingId === flag.id}
                        >
                          {processingId === flag.id ? '...' : 'Review'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 text-white/60 hover:bg-white/10 text-xs"
                          onClick={() => handleResolve(flag.id, true)}
                          disabled={processingId === flag.id}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
