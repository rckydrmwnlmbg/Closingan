"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle } from "lucide-react";

export default function AnalyticsDashboard() {
  const { data, error, isLoading } = useSWR("/v1/analytics/summary", fetcher);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-400">
        <AlertCircle className="w-8 h-8 mb-4 text-red-500/50" />
        <p className="text-sm font-medium">Failed to load analytics data</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Defensive rendering - handle empty states gracefully
  const hasData = data && (
    (data.messageTrend && data.messageTrend.length > 0) ||
    (data.totalConversations > 0) ||
    (Object.keys(data.campaignSummary || {}).length > 0)
  );

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] border border-white/10 rounded-2xl bg-black/50">
        <div className="text-center max-w-md px-6">
          <h3 className="text-lg font-semibold text-white mb-2">Belum ada data masuk.</h3>
          <p className="text-sm text-zinc-400 font-light mb-6">
            Hubungkan WhatsApp Anda untuk memulai melacak percakapan dan metrik AI.
          </p>
          <button className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors">
            Hubungkan WhatsApp
          </button>
        </div>
      </div>
    );
  }

  const { messageTrend = [], tokenUsage = {}, totalConversations = 0, campaignSummary = {} } = data || {};
  const estimatedCost = ((tokenUsage.promptTokens || 0) / 1000 * 0.00015) + ((tokenUsage.completionTokens || 0) / 1000 * 0.0006);

  // Bento-style grid structure with subtle borders and deep blacks
  return (
    <div className="flex-1 space-y-6 p-8 bg-black text-white min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Conversations", value: totalConversations, desc: "All time" },
          { title: "Total AI Tokens", value: tokenUsage.totalTokensConsumed?.toLocaleString() || 0, desc: "Prompt + Completion" },
          { title: "Estimated Cost", value: `$${estimatedCost.toFixed(4)}`, desc: "Based on GPT-4o-Mini" },
          { title: "Active Campaigns", value: campaignSummary['ACTIVE'] || 0, desc: "Currently running" }
        ].map((item, i) => (
          <Card key={i} className="bg-black border-white/10 shadow-none rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium tracking-tight text-white">{item.value}</div>
              <p className="text-[10px] text-zinc-500 mt-1">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-black border-white/10 shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">Message Volume Trend</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Last 7 Days (AI vs Customer)</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={messageTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-[10px]" tick={{ fill: '#71717a' }} />
                  <YAxis tickLine={false} axisLine={false} className="text-[10px]" tick={{ fill: '#71717a' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                    labelStyle={{ color: '#a1a1aa', fontSize: '10px', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="sent" name="Sent (AI)" stroke="#ffffff" strokeWidth={1.5} dot={false} activeDot={{ r: 4, fill: '#fff' }} />
                  <Line type="monotone" dataKey="received" name="Received" stroke="#52525b" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-black border-white/10 shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">Campaign Status</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Breakdown of all campaigns</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(campaignSummary).map(([status, count]) => ({ status, count }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="status" tickLine={false} axisLine={false} className="text-[10px]" tick={{ fill: '#71717a' }} />
                  <YAxis tickLine={false} axisLine={false} className="text-[10px]" tick={{ fill: '#71717a' }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#ffffff" radius={[2, 2, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
