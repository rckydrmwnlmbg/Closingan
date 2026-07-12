"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink } from 'lucide-react';
import { useBillingInvoices } from './hooks/useBilling';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary'; className?: string }> = {
  PAID: { label: 'Lunas', variant: 'default', className: 'bg-emerald-500/20 text-emerald-400' },
  PENDING: { label: 'Menunggu Bayar', variant: 'outline', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  FAILED: { label: 'Gagal', variant: 'destructive' },
  EXPIRED: { label: 'Kedaluwarsa', variant: 'secondary' },
  REFUNDED: { label: 'Refund', variant: 'secondary' },
};

export function InvoiceHistoryTable() {
  const { invoices, isLoading } = useBillingInvoices();

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 animate-pulse h-64 mt-8">
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10 mt-8">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="text-emerald-500" size={24} />
          Riwayat Invoice
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {(!invoices || invoices.length === 0) ? (
          <div className="text-center py-8 text-white/50">
            Belum ada riwayat invoice.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-white/50 uppercase border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Deskripsi</th>
                  <th className="px-4 py-3 font-medium">Jumlah</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => {
                  const config = STATUS_CONFIG[inv.status] || STATUS_CONFIG.PENDING;
                  const isPending = inv.status === 'PENDING';

                  return (
                    <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        {new Date(inv.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-4">{inv.description}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        Rp {inv.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant={config.variant} className={config.className || ''}>
                          {config.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        {isPending && inv.paymentUrl ? (
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                            onClick={() => window.open(inv.paymentUrl!, '_blank')}
                          >
                            Bayar
                          </Button>
                        ) : inv.paymentUrl ? (
                          <a
                            href={inv.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors text-xs"
                          >
                            <ExternalLink size={14} /> Lihat
                          </a>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
