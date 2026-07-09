import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';
import { useBillingInvoices } from './hooks/useBilling';

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
          Invoice History
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {(!invoices || invoices.length === 0) ? (
          <div className="text-center py-8 text-white/50">
            No invoices found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-white/50 uppercase border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      {new Date(inv.createdAt).toLocaleDateString('en-US', {
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
                      <Badge variant={inv.status === 'PAID' ? 'default' : inv.status === 'PENDING' ? 'outline' : 'destructive'} 
                             className={inv.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : ''}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      {inv.paymentUrl && (
                        <a href={inv.paymentUrl} target="_blank" rel="noopener noreferrer" 
                           className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors">
                          <Download size={14} /> View
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
