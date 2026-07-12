"use client";

import { FairUsageDashboard } from '@/components/admin/FairUsageDashboard';

export default function FairUsagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Fair Usage Monitoring</h1>
        <p className="text-neutral-400 mt-1">
          Deteksi dan review anomali penggunaan untuk mencegah penyalahgunaan sistem.
        </p>
      </div>

      <FairUsageDashboard />
    </div>
  );
}
