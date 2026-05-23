"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FollowUpWidgetProps {
  todayCount: number;
  overdueCount: number;
  onClick: () => void;
}

export function FollowUpWidget({ todayCount, overdueCount, onClick }: FollowUpWidgetProps) {
  return (
    <Card className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={onClick}>
      <CardContent className="p-4 flex items-center justify-between h-full">
        <div className="flex flex-col">
          <h3 className="font-semibold text-sm text-slate-500 mb-1">Follow-up Hari Ini</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{todayCount}</span>
            <span className="text-xs text-slate-400 mb-1">tugas</span>
          </div>
          {overdueCount > 0 && (
            <span className="text-xs text-red-500 font-medium mt-1">
              {overdueCount} Overdue!
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          Lihat
        </Button>
      </CardContent>
    </Card>
  );
}
