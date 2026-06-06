"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AiStatusWidgetProps {
  isActive: boolean;
  mode: string;
  quotaPercent: number;
}

export function AiStatusWidget({ isActive, mode, quotaPercent }: AiStatusWidgetProps) {
  const isWarning = quotaPercent > 85;
  const isCritical = quotaPercent > 95;

  let statusText = isActive ? "ON" : "OFF";
  if (isCritical) statusText = "Mode Terbatas";

  return (
    <Card className="bg-black border border-white/5 shadow-none rounded-none">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium text-xs tracking-wider text-zinc-500 uppercase">AI Assistant</h3>
          <Badge
            variant="outline"
            className={`rounded-none border-white/10 text-[10px] uppercase tracking-wider font-medium ${isActive ? (isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-white') : 'text-zinc-500'}`}
          >
            {statusText}
          </Badge>
        </div>
        <div>
          <p className="font-semibold text-2xl tracking-tight text-white mb-3 capitalize">{mode.replace(/_/g, ' ').toLowerCase()}</p>
          <div className="w-full bg-white/5 h-[2px]">
            <div
              className={`h-[2px] ${isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-white'}`}
              style={{ width: `${Math.min(quotaPercent, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-zinc-500 font-light mt-2">{quotaPercent}% terpakai</p>
        </div>
      </CardContent>
    </Card>
  );
}
