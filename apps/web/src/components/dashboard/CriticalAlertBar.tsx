"use client";

import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CriticalAlertBarProps {
  id: string;
  title: string;
  message: string;
  onDismiss: (id: string) => void;
  onClick: (id: string) => void;
}

export function CriticalAlertBar({ id, title, message, onDismiss, onClick }: CriticalAlertBarProps) {
  return (
    <div
      className="mb-8 border border-red-500/30 bg-red-500/5 text-white p-4 flex items-center justify-between cursor-pointer hover:bg-red-500/10 transition-colors"
      onClick={() => onClick(id)}
    >
      <div className="flex items-center gap-4">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <div>
          <h4 className="font-medium text-sm tracking-wide uppercase text-red-400">{title}</h4>
          <p className="text-sm text-zinc-400 font-light mt-1">{message}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-zinc-500 hover:text-white hover:bg-white/5 rounded-none shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(id);
        }}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
