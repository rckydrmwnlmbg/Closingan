'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Activity, Zap } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function AiPerformancePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchApi('/v1/admin/ai-performance');
        setData(res.data);
      } catch (error) {
        console.error('Failed to load AI performance', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading AI performance data...</div>;
  }

  const isEscalationHigh = (data?.escalationRate ?? 0) > 20;
  const isSafetyHigh = (data?.safetyBlockRate ?? 0) > 5;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Performance Monitoring</h2>
      </div>

      {(isEscalationHigh || isSafetyHigh) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-red-800 font-medium">Alert Threshold Exceeded</h3>
          </div>
          <p className="text-sm text-red-700 mt-1">
            {isEscalationHigh && `Escalation rate is unusually high (${data.escalationRate}%). AI may be struggling with current prompts. `}
            {isSafetyHigh && `Safety block rate is elevated (${data.safetyBlockRate}%). Check for potential abuse.`}
          </p>
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Reply Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.aiReplySuccessRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Successful completion without escalation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalation Rate</CardTitle>
            <Activity className={`h-4 w-4 ${isEscalationHigh ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isEscalationHigh ? 'text-red-600' : ''}`}>{data?.escalationRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Threshold: 20%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.averageLatencyMs || 0}ms</div>
            <p className="text-xs text-muted-foreground">Target: &lt; 2000ms</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Block Rate</CardTitle>
            <ShieldAlert className={`h-4 w-4 ${isSafetyHigh ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isSafetyHigh ? 'text-red-600' : ''}`}>{data?.safetyBlockRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Threshold: 5%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Escalation Reasons</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
               {data?.topEscalationReasons?.map((item: any) => (
                 <div key={item.reason} className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm">{item.reason}</div>
                   <div className="text-muted-foreground">{item.count} issues</div>
                 </div>
               ))}
               {!data?.topEscalationReasons?.length && <p className="text-sm text-muted-foreground">No data available</p>}
             </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm">Total AI Requests</div>
                   <div className="text-muted-foreground">{data?.totalRequests || 0}</div>
                 </div>
                 <div className="flex items-center justify-between border-b pb-2">
                   <div className="font-medium text-sm">Total Tokens Consumed</div>
                   <div className="text-muted-foreground">{data?.totalTokensUsed?.toLocaleString() || 0}</div>
                 </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Inline missing icon since it wasn't imported from lucide
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
