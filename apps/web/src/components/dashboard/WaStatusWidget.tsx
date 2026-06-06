"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface WaStatusWidgetProps {
  state: string;
  phoneNumber: string | null;
  lastConnectedAt?: string;
  onClick?: () => void;
}

export function WaStatusWidget({ state, phoneNumber, lastConnectedAt, onClick }: WaStatusWidgetProps) {
  const isConnected = state === "CONNECTED";
  const isReconnecting = state === "RECONNECTING";

  return (
    <Card className="cursor-pointer bg-black border border-white/5 shadow-none rounded-none hover:bg-white/[0.02] transition-colors" onClick={onClick}>
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium text-xs tracking-wider text-zinc-500 uppercase">WhatsApp</h3>
          <Badge
            variant="outline"
            className={`rounded-none border-white/10 text-[10px] uppercase tracking-wider font-medium ${isConnected ? "text-green-400" : isReconnecting ? "text-yellow-400" : "text-red-400"}`}
          >
            {state}
          </Badge>
        </div>
        <div>
          <p className="font-semibold text-2xl tracking-tight text-white mb-1">{phoneNumber || "Belum Terhubung"}</p>
          {isConnected && lastConnectedAt && (
            <p className="text-xs text-zinc-500 font-light">
              Aktif sejak {formatDistanceToNow(new Date(lastConnectedAt), { addSuffix: true, locale: id })}
            </p>
          )}
          {!isConnected && (
            <p className="text-xs text-red-500/80 font-light">Tap untuk reconnect</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
