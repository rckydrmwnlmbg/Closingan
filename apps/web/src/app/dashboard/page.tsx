"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";

export default function Dashboard() {
  return (
    <>
      <Sidebar />
      <div className="md:ml-64 transition-all duration-300 ease-in-out flex flex-col min-h-screen">
        <TopHeader />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Ringkasan Hari Ini</h2>
            <p className="text-sm text-slate-500">Berikut adalah performa dan prospek yang perlu Anda perhatikan.</p>
          </div>

          <MetricCards />

          <div className="grid grid-cols-1 lg:grid-cols-9 gap-4 md:gap-6 h-[auto] lg:h-[700px]">
            <ChatInterface />
            <InsightsPanel />
          </div>
        </main>
      </div>
    </>
  );
}
