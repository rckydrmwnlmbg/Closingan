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
    <Card className="cursor-pointer bg-black border border-white/5 shadow-none rounded-none hover:bg-white/[0.02] transition-colors group" onClick={onClick}>
      <CardContent className="p-6 flex items-center justify-between h-full">
        <div className="flex flex-col">
          <h3 className="font-medium text-xs tracking-wider text-zinc-500 uppercase mb-4">Follow-up Hari Ini</h3>
          <div className="flex items-end gap-2">
            <span className="font-semibold text-4xl tracking-tight text-white">{todayCount}</span>
            <span className="text-xs text-zinc-600 font-light mb-1 uppercase tracking-wider">tugas</span>
          </div>
          {overdueCount > 0 && (
            <span className="text-xs text-red-400 font-medium mt-2">
              {overdueCount} Overdue!
            </span>
          )}
        </div>
        <Button variant="outline" className="rounded-none border-white/10 text-white hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 transition-opacity" size="sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          Lihat
        </Button>
      </CardContent>
    </Card>
  );
}
