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
    <Card className={`cursor-pointer bg-black border ${isAlert ? 'border-red-500/30' : 'border-white/5'} shadow-none rounded-none hover:bg-white/[0.02] transition-colors group`} onClick={onClick}>
      <CardContent className="p-6 flex items-center justify-between h-full">
        <div className="flex flex-col">
          <h3 className="font-medium text-xs tracking-wider text-zinc-500 uppercase mb-4">Menunggu Balasan</h3>
          <div className="flex items-end gap-2">
            <span className={`font-semibold text-4xl tracking-tight text-white`}>{count}</span>
            <span className="text-xs text-zinc-600 font-light mb-1 uppercase tracking-wider">pesan</span>
          </div>
          {count > 0 && (
             <div className="flex items-center gap-1 mt-2">
               <Clock className={`w-3 h-3 ${isAlert ? 'text-red-400' : 'text-zinc-500'}`} />
               <span className={`text-xs ${isAlert ? 'text-red-400 font-medium' : 'text-zinc-500 font-light'}`}>
                 Terlama {longestMinutes}m
               </span>
             </div>
          )}
        </div>
        <Button variant="outline" className="rounded-none border-white/10 text-white hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 transition-opacity" size="sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          Inbox
        </Button>
      </CardContent>
    </Card>
  );
}
