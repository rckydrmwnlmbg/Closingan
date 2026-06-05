"use client";

import useSWR from 'swr';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  status: string;
  scheduledAt: string | null;
  sentCount: number;
  totalRecipients: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CampaignDashboard() {
  const { data, error, isLoading } = useSWR('/api/campaigns', fetcher);

  if (error) return <div className="text-red-500">Failed to load campaigns</div>;
  if (isLoading) return <div>Loading...</div>;

  const campaigns: Campaign[] = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Manage your broadcast campaigns</p>
        <Link
          href="/campaigns/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Create Campaign
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {campaigns.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500">
              No campaigns found. Create your first campaign!
            </li>
          ) : (
            campaigns.map((campaign) => (
              <li key={campaign.id} className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      campaign.status === 'RUNNING' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {campaign.status}
                    </span>
                    <span>
                      {campaign.scheduledAt
                        ? `Scheduled: ${new Date(campaign.scheduledAt).toLocaleString()}`
                        : 'Not scheduled'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {campaign.sentCount} / {campaign.totalRecipients} Sent
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
