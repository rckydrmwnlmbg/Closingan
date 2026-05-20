"use client";

import { useEffect, useState } from "react";
import { WhatsAppConnectionStatus } from "@/components/whatsapp/WhatsAppConnectionStatus";

export default function WhatsAppSettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        WhatsApp Integration
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Connect your WhatsApp Business account using your Fonnte token to
          enable AI replies, follow-ups, and notifications.
        </p>

        <WhatsAppConnectionStatus />
      </div>
    </div>
  );
}
