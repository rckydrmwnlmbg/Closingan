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
  const { summary, isLoading, error } = useDashboard();
  const { dismissAlert } = useDashboardStore();

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-w-[375px]">
        <DashboardHeader />
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          Gagal memuat dashboard. Silakan coba lagi.
        </div>
      </div>
    );
  }

  if (isLoading || !summary) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-w-[375px]">
        <DashboardHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Find most critical alert to display at the top
  const topAlert = summary.criticalAlerts?.[0];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-w-[375px] pb-24">
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
          state={summary.waStatus.state}
          phoneNumber={summary.waStatus.phoneNumber}
          onClick={() => {
             // Navigate to settings if disconnected, else open details
             console.log("Navigate to WA Settings");
          }}
        />

        <AiStatusWidget
          isActive={summary.aiStatus.isActive}
          mode={summary.aiStatus.mode}
          quotaPercent={summary.quotaUsagePercent}
        />

        <HotLeadsWidget
          count={summary.hotLeadsToday}
          onClick={() => {
            console.log("Navigate to Inbox Filter Hot Leads");
          }}
        />

        <PendingReplyWidget
          count={summary.pendingReply}
          longestMinutes={summary.longestPendingMinutes}
          onClick={() => {
            console.log("Navigate to Inbox Filter Pending Reply");
          }}
        />

        <FollowUpWidget
          todayCount={summary.followUpToday}
          overdueCount={summary.followUpOverdue}
          onClick={() => {
            console.log("Navigate to Follow-up Tab");
          }}
        />
      </div>
    </div>
  );
}
