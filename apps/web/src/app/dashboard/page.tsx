"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { useDashboardStore } from "@/store/useDashboardStore";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WaStatusWidget } from "@/components/dashboard/WaStatusWidget";
import { AiStatusWidget } from "@/components/dashboard/AiStatusWidget";
import { HotLeadsWidget } from "@/components/dashboard/HotLeadsWidget";
import { PendingReplyWidget } from "@/components/dashboard/PendingReplyWidget";
import { FollowUpWidget } from "@/components/dashboard/FollowUpWidget";
import { CriticalAlertBar } from "@/components/dashboard/CriticalAlertBar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { summary, isLoading } = useDashboard();
  const { dismissAlert } = useDashboardStore();

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-w-[375px] bg-black min-h-screen">
        <DashboardHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full rounded-none bg-zinc-900 border border-white/5" />
          <Skeleton className="h-32 w-full rounded-none bg-zinc-900 border border-white/5" />
          <Skeleton className="h-32 w-full rounded-none bg-zinc-900 border border-white/5" />
          <Skeleton className="h-32 w-full rounded-none bg-zinc-900 border border-white/5" />
          <Skeleton className="h-32 w-full rounded-none bg-zinc-900 border border-white/5" />
        </div>
      </div>
    );
  }

  // Defensive handling to prevent crash when data is null/undefined or on error.
  // We use fallback values to ensure the UI renders the "Empty/Zero" states.
  const safeSummary = summary || {
    waStatus: { state: "DISCONNECTED", phoneNumber: null },
    aiStatus: { isActive: false, mode: "OFF" },
    quotaUsagePercent: 0,
    hotLeadsToday: 0,
    pendingReply: 0,
    longestPendingMinutes: 0,
    followUpToday: 0,
    followUpOverdue: 0,
    criticalAlerts: []
  };

  // Find most critical alert to display at the top
  const topAlert = safeSummary.criticalAlerts?.[0];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-w-[375px] pb-24 bg-black min-h-screen">
      {topAlert && (
        <CriticalAlertBar
          id={topAlert.conversationId}
          title="Perlu Eskalasi Segera"
          message={topAlert.message}
          onDismiss={dismissAlert}
          onClick={(id) => {
            // handle navigation to inbox
            console.log("Navigating to conversation", id);
          }}
        />
      )}

      <DashboardHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <WaStatusWidget
          state={safeSummary.waStatus?.state || "DISCONNECTED"}
          phoneNumber={safeSummary.waStatus?.phoneNumber || null}
          onClick={() => {
             // Navigate to settings if disconnected, else open details
             console.log("Navigate to WA Settings");
          }}
        />

        <AiStatusWidget
          isActive={safeSummary.aiStatus?.isActive || false}
          mode={safeSummary.aiStatus?.mode || "OFF"}
          quotaPercent={safeSummary.quotaUsagePercent || 0}
        />

        <HotLeadsWidget
          count={safeSummary.hotLeadsToday || 0}
          onClick={() => {
            console.log("Navigate to Inbox Filter Hot Leads");
          }}
        />

        <PendingReplyWidget
          count={safeSummary.pendingReply || 0}
          longestMinutes={safeSummary.longestPendingMinutes || 0}
          onClick={() => {
            console.log("Navigate to Inbox Filter Pending Reply");
          }}
        />

        <FollowUpWidget
          todayCount={safeSummary.followUpToday || 0}
          overdueCount={safeSummary.followUpOverdue || 0}
          onClick={() => {
            console.log("Navigate to Follow-up Tab");
          }}
        />
      </div>
    </div>
  );
}
