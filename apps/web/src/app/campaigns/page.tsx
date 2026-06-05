import { Suspense } from 'react';
import CampaignDashboard from './components/CampaignDashboard';

export default function CampaignsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Campaign Dashboard</h1>
      <Suspense fallback={<div>Loading campaigns...</div>}>
        <CampaignDashboard />
      </Suspense>
    </div>
  );
}
