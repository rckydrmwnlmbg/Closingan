import CampaignBuilder from '../components/CampaignBuilder';

export default function NewCampaignPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>
      <CampaignBuilder />
    </div>
  );
}
