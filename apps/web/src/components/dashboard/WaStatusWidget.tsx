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
    <Card className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={onClick}>
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm text-slate-500">WhatsApp</h3>
          <Badge variant={isConnected ? "default" : isReconnecting ? "secondary" : "destructive"}>
            {state}
          </Badge>
        </div>
        <div>
          <p className="font-medium text-lg">{phoneNumber || "Belum Terhubung"}</p>
          {isConnected && lastConnectedAt && (
            <p className="text-xs text-slate-400 mt-1">
              Aktif sejak {formatDistanceToNow(new Date(lastConnectedAt), { addSuffix: true, locale: id })}
            </p>
          )}
          {!isConnected && (
            <p className="text-xs text-red-500 mt-1">Tap untuk reconnect</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
