"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface PendingReplyWidgetProps {
  count: number;
  longestMinutes: number;
  onClick: () => void;
}

export function PendingReplyWidget({ count, longestMinutes, onClick }: PendingReplyWidgetProps) {
  const isAlert = longestMinutes > 30;

  return (
    <Card className={`cursor-pointer hover:bg-slate-50 transition-colors ${isAlert ? 'border-red-300 bg-red-50' : ''}`} onClick={onClick}>
      <CardContent className="p-4 flex items-center justify-between h-full">
        <div className="flex flex-col">
          <h3 className="font-semibold text-sm text-slate-500 mb-1">Menunggu Balasan</h3>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${isAlert ? 'text-red-600' : ''}`}>{count}</span>
            <span className="text-xs text-slate-400 mb-1">pesan</span>
          </div>
          {count > 0 && (
             <div className="flex items-center gap-1 mt-1">
               <Clock className={`w-3 h-3 ${isAlert ? 'text-red-500' : 'text-slate-400'}`} />
               <span className={`text-xs ${isAlert ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                 Terlama {longestMinutes}m
               </span>
             </div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          Inbox
        </Button>
      </CardContent>
    </Card>
  );
}
