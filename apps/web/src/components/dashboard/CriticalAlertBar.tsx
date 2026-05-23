"use client";

import { AlertTriangle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface CriticalAlertProps {
  id: string;
  title: string;
  message: string;
  onDismiss: (id: string) => void;
  onClick: (id: string) => void;
}

export function CriticalAlertBar({ id, title, message, onDismiss, onClick }: CriticalAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4 cursor-pointer relative" onClick={() => onClick(id)}>
      <AlertTriangle className="h-4 w-4" />
      <div className="flex-1 pr-6">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(id);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
