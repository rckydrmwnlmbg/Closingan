"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlacklistWarningModal from './BlacklistWarningModal';

interface ValidationData {
  blacklistedCount: number;
  totalRecipients: number;
  blacklistedNumbers: string[];
}

export default function CampaignBuilder() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    messageTemplate: '',
    recipientSource: 'hot_leads',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [showWarning, setShowWarning] = useState(false);
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateDraft = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to create campaign');

      return data.data.id;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setIsSubmitting(false);
      return null;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Create campaign first
    const campaignId = await handleCreateDraft();
    if (!campaignId) return;

    setCreatedCampaignId(campaignId);

    // 2. Validate audience (Informed Consent Flow)
    try {
      const valRes = await fetch(`/api/campaigns/${campaignId}/validate`);
      const valData = await valRes.json();

      if (!valRes.ok) throw new Error(valData.message || 'Failed to validate audience');

      const result = valData.data;
      setValidationData(result);

      if (result.blacklistedCount > 0) {
        // Show Warning Modal
        setShowWarning(true);
        setIsSubmitting(false);
      } else {
        // Proceed directly
        await executeCampaign(campaignId, []);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setIsSubmitting(false);
    }
  };

  const executeCampaign = async (campaignId: string, forceSend: string[]) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/campaigns/${campaignId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceSend }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to execute campaign');

      router.push('/campaigns');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setIsSubmitting(false);
    }
  };

  const handleConfirmSend = () => {
    if (createdCampaignId && validationData) {
      setShowWarning(false);
      executeCampaign(createdCampaignId, validationData.blacklistedNumbers);
    }
  };

  return (
    <>
      <form onSubmit={handleSend} className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200">
        {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Goal</label>
          <input
            type="text"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message Template</label>
          <textarea
            name="messageTemplate"
            required
            rows={4}
            value={formData.messageTemplate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            placeholder="Hello {{name}}, we have a special offer for you!"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Recipient Source</label>
          <select
            name="recipientSource"
            value={formData.recipientSource}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
          >
            <option value="hot_leads">Hot Leads</option>
            <option value="follow_up">Follow Up</option>
            <option value="csv">CSV Upload</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Send Campaign'}
          </button>
        </div>
      </form>

      {showWarning && validationData && (
        <BlacklistWarningModal
          blacklistedCount={validationData.blacklistedCount}
          totalRecipients={validationData.totalRecipients}
          onConfirm={handleConfirmSend}
          onCancel={() => {
            setShowWarning(false);
            router.push('/campaigns'); // Keep as draft
          }}
        />
      )}
    </>
  );
}
