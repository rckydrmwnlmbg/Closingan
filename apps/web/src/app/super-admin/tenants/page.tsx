'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { adminFetcher, fetchAdminApi } from '@/lib/apiAdmin';
import { ShieldAlert, MoreVertical, Ban, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function TenantsPage() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, mutate } = useSWR(`/v1/admin/tenants?page=${page}&limit=20`, adminFetcher);
  const [suspending, setSuspending] = useState<string | null>(null);

  const handleSuspend = async (tenantId: string) => {
    if (!confirm('Are you absolutely sure you want to suspend this tenant? This will stop all their AI services immediately.')) {
      return;
    }
    
    setSuspending(tenantId);
    try {
      await fetchAdminApi(`/v1/admin/tenants/${tenantId}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Suspended by Super Admin manually' }),
      });
      alert('Tenant suspended successfully.');
      mutate(); // Refresh the list
    } catch (err: any) {
      alert(`Failed to suspend: ${err.message}`);
    } finally {
      setSuspending(null);
    }
  };

  if (error) return <div className="text-red-400">Failed to load tenants.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Tenants</h1>
        <p className="text-neutral-400 mt-1">Manage all registered businesses and their active subscriptions.</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-950/50 text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">Tenant Name</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium">Plan & State</th>
                <th className="px-6 py-4 font-medium">Usage Stats</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Loading tenants...</td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">No tenants found.</td>
                </tr>
              ) : (
                data?.data?.map((tenant: any) => (
                  <tr key={tenant.id} className="hover:bg-neutral-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-200">{tenant.name}</div>
                      <div className="text-xs text-neutral-500 mt-1 font-mono">{tenant.id}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      {format(new Date(tenant.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      {tenant.subscription ? (
                        <div>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-800 text-neutral-300">
                            {tenant.subscription.plan}
                          </span>
                          <div className="flex items-center mt-2 text-xs">
                            {tenant.subscription.state === 'ACTIVE' ? (
                              <span className="flex items-center text-emerald-400"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</span>
                            ) : tenant.subscription.state === 'SUSPENDED' ? (
                              <span className="flex items-center text-red-500"><Ban className="w-3 h-3 mr-1" /> Suspended</span>
                            ) : (
                              <span className="text-neutral-500">{tenant.subscription.state}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-500 italic">No Sub</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      <div className="flex flex-col gap-1 text-xs">
                        <span>Users: {tenant._count?.users || 0}</span>
                        <span>Leads: {tenant._count?.leads || 0}</span>
                        <span>Chats: {tenant._count?.conversations || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tenant.subscription?.state !== 'SUSPENDED' && (
                        <button
                          onClick={() => handleSuspend(tenant.id)}
                          disabled={suspending === tenant.id}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md text-red-400 bg-red-400/10 hover:bg-red-400/20 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                          {suspending === tenant.id ? 'Suspending...' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        {data?.meta && data.meta.lastPage > 1 && (
          <div className="px-6 py-4 border-t border-neutral-800 flex justify-between items-center bg-neutral-950/30">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 text-sm bg-neutral-800 text-neutral-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-500">Page {page} of {data.meta.lastPage}</span>
            <button 
              disabled={page >= data.meta.lastPage} 
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 text-sm bg-neutral-800 text-neutral-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
