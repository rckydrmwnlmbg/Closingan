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

  let badgeVariant: "default" | "secondary" | "destructive" = isActive ? "default" : "secondary";
  if (isActive) {
    if (isCritical) badgeVariant = "destructive";
    else if (isWarning) badgeVariant = "secondary";
  }

  let statusText = isActive ? "ON" : "OFF";
  if (isCritical) statusText = "Mode Terbatas";

  return (
    <Card>
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm text-slate-500">AI Assistant</h3>
          <Badge variant={badgeVariant}>
            {statusText}
          </Badge>
        </div>
        <div>
          <p className="font-medium text-lg capitalize">{mode.replace(/_/g, ' ').toLowerCase()}</p>
          <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 dark:bg-slate-700">
            <div
              className={`h-1.5 rounded-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(quotaPercent, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-1">{quotaPercent}% terpakai</p>
        </div>
      </CardContent>
    </Card>
  );
}
