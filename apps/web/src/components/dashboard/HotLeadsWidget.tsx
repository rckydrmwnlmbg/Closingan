"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

interface HotLeadsWidgetProps {
  count: number;
  onClick: () => void;
}

export function HotLeadsWidget({ count, onClick }: HotLeadsWidgetProps) {
  return (
    <Card className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={onClick}>
      <CardContent className="p-4 flex items-center justify-between h-full">
        <div className="flex flex-col">
          <h3 className="font-semibold text-sm text-slate-500 mb-1">Hot Leads Hari Ini</h3>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">{count}</span>
            {count > 0 && <Flame className="w-6 h-6 text-orange-500" />}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          Lihat
        </Button>
      </CardContent>
    </Card>
  );
}
