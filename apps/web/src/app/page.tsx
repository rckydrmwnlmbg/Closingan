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
      <div className="md:ml-[260px] transition-all duration-300 ease-in-out flex flex-col h-screen">
        <TopHeader />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full overflow-y-auto">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Ringkasan Hari Ini</h2>
            <p className="text-sm text-slate-500">Berikut adalah performa dan prospek yang perlu Anda perhatikan.</p>
          </div>

          <MetricCards />

          {/* Main Grid Layout for Chat and Insights matching original HTML */}
          <div className="grid grid-cols-1 lg:grid-cols-9 gap-4 md:gap-6 h-[auto] lg:h-[700px]">
            {/* Center Column (Chat Interface) - col-span-6 */}
            <ChatInterface />

            {/* Right Column (Insights Panel) - col-span-3 */}
            <InsightsPanel />
          </div>
        </main>
      </div>
    </>
  );
}
