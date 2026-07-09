'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, UserPlus, CreditCard } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function BusinessMetricsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [exitSurveyData, setExitSurveyData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [systemData, setSystemData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [businessRes, surveysRes, systemRes] = await Promise.all([
          fetchApi('/v1/admin/business'),
          fetchApi('/v1/admin/exit-surveys/aggregate').catch(() => ({ data: null })),
          fetchApi('/v1/admin/system').catch(() => ({ data: null }))
        ]);
        setData(businessRes.data);
        if (surveysRes.data) {
          setExitSurveyData(surveysRes.data);
        }
        if (systemRes.data) {
          setSystemData(systemRes.data);
        }
      } catch (error) {
        console.error('Failed to load business metrics', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading business metrics...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Business Metrics</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {(data?.mrr || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.dailyActiveTenants || 0}</div>
            <p className="text-xs text-muted-foreground">Out of {data?.totalTenants || 0} total tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial to Paid Conv.</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.trialToPaidConversion || 0}%</div>
            <p className="text-xs text-muted-foreground">Cohort conversion rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Add-on Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {(data?.aiCreditRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">One-time purchases this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm">STARTER</div>
                   <div className="text-muted-foreground">{data?.planDistribution?.STARTER || 0}</div>
                 </div>
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm">PRO</div>
                   <div className="text-muted-foreground">{data?.planDistribution?.PRO || 0}</div>
                 </div>
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm">ELITE</div>
                   <div className="text-muted-foreground">{data?.planDistribution?.ELITE || 0}</div>
                 </div>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Other Metrics</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm text-red-600">Churn Rate</div>
                   <div className="text-muted-foreground">{data?.churnRate || 0}%</div>
                 </div>
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm text-green-600">New Signups (Today)</div>
                   <div className="text-muted-foreground">{data?.newSignups || 0}</div>
                 </div>
             </div>
          </CardContent>
        </Card>

        {exitSurveyData && (
        <Card>
          <CardHeader>
            <CardTitle>Exit Survey</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm">Total Surveys</div>
                   <div className="text-muted-foreground">{exitSurveyData.totalSurveys}</div>
                 </div>
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm">Average NPS</div>
                   <div className="text-muted-foreground">{exitSurveyData.averageNps || '-'} / 10</div>
                 </div>
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm">Top Reason</div>
                   <div className="text-muted-foreground">
                     {exitSurveyData.reasonCounts && Object.keys(exitSurveyData.reasonCounts).length > 0 
                       ? Object.entries(exitSurveyData.reasonCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0] 
                       : '-'}
                   </div>
                 </div>
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm text-green-600">Save Offer Conv.</div>
                   <div className="text-muted-foreground">{exitSurveyData.saveOffer?.conversionRate || 0}%</div>
                 </div>
             </div>
          </CardContent>
        </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>System Infrastructure</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm">DB Replica Lag</div>
                   <div className={`font-bold ${systemData?.replicaLag > 2 ? 'text-red-600' : 'text-green-600'}`}>
                     {systemData?.replicaLag !== undefined ? `${systemData.replicaLag}s` : '-'}
                   </div>
                 </div>
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm">Dashboard Cache Hit Rate</div>
                   <div className="text-muted-foreground">{systemData?.cacheHitRates?.dashboard !== undefined ? `${(systemData.cacheHitRates.dashboard * 100).toFixed(1)}%` : '-'}</div>
                 </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
