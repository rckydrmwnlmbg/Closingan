"use client";

import { WhatsAppConnectionStatus } from "@/components/whatsapp/WhatsAppConnectionStatus";

export default function WhatsAppSettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        WhatsApp Integration
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Connect your WhatsApp Business account to enable AI replies,
          follow-ups, and notifications. Request a QR code to pair your device.
        </p>

        <WhatsAppConnectionStatus />
      </div>
    </div>
  );
}
