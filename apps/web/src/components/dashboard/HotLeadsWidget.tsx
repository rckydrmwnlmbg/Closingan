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
    <Card className="cursor-pointer bg-black border border-white/5 shadow-none rounded-none hover:bg-white/[0.02] transition-colors group" onClick={onClick}>
      <CardContent className="p-6 flex items-center justify-between h-full">
        <div className="flex flex-col">
          <h3 className="font-medium text-xs tracking-wider text-zinc-500 uppercase mb-4">Hot Leads Hari Ini</h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-4xl tracking-tight text-white">{count}</span>
            {count > 0 && <Flame className="w-5 h-5 text-white/50" />}
          </div>
        </div>
        <Button variant="outline" className="rounded-none border-white/10 text-white hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 transition-opacity" size="sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          Lihat
        </Button>
      </CardContent>
    </Card>
  );
}
