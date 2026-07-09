'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { fetchApi } from '@/lib/api'; // assuming api client is exported from lib/api

export default function AnalyticsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange] = useState('7d');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchApi(`/v1/analytics/overview?timeRange=${timeRange}`);
        setData(res.data);
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [timeRange]);

  if (loading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  // Generate mock trend data if backend doesn't provide it yet
  const trendData = [
    { name: 'Mon', manual: 40, ai: 120 },
    { name: 'Tue', manual: 30, ai: 130 },
    { name: 'Wed', manual: 50, ai: 110 },
    { name: 'Thu', manual: 20, ai: 150 },
    { name: 'Fri', manual: 60, ai: 100 },
    { name: 'Sat', manual: 10, ai: 180 },
    { name: 'Sun', manual: 5, ai: 200 },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Seller Performance</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~5 mins</div>
            <p className="text-xs text-muted-foreground">-10% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Lead Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <p className="text-xs text-muted-foreground">+2% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-Up Completion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Based on {data?.followUpStatus?.length || 0} tasks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">143</div>
            <p className="text-xs text-muted-foreground">30 idle</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>AI vs Manual Replies (7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ai" stroke="#3b82f6" strokeWidth={2} name="AI Replies" />
                  <Line type="monotone" dataKey="manual" stroke="#f97316" strokeWidth={2} name="Manual Replies" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Current Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data?.campaigns?.map((item: any) => (
                 <div key={item.state} className="flex items-center">
                   <div className="ml-4 space-y-1">
                     <p className="text-sm font-medium leading-none">{item.state}</p>
                   </div>
                   <div className="ml-auto font-medium">{item._count}</div>
                 </div>
               ))}
               {!data?.conversationStates?.length && <div className="text-muted-foreground text-sm">No data available</div>}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
