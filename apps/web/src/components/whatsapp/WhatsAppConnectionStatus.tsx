"use client";

import { useState, useEffect } from "react";

type ConnectionState = "CONNECTED" | "DISCONNECTED" | "CONNECTING";

interface WhatsAppStatus {
  state: ConnectionState;
  phoneNumber?: string;
  displayName?: string;
  lastConnectedAt?: string;
}

export function WhatsAppConnectionStatus() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);

  const fetchStatus = async () => {
    // Only show global loading on initial fetch
    if (!status && !qrCode) {
      setLoading(true);
    }
    try {
      const token = localStorage.getItem("auth_token") || "";
      const res = await fetch("/api/whatsapp/qr-status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch WhatsApp status");
      }
      const json = await res.json();
      if (json.success && json.data) {
        setStatus(json.data);
        if (json.data.state === "CONNECTED") {
          setQrCode(null);
        }
      } else {
        setStatus({ state: "DISCONNECTED" });
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to fetch status");
      // Fallback for visual mock if api is unavailable during dev:
      // setStatus({ state: "DISCONNECTED" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling logic when QR code is active and status is DISCONNECTED
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (qrCode && status?.state !== "CONNECTED") {
      interval = setInterval(() => {
        fetchStatus();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode, status?.state]);

  // QR Refresh logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (qrCode && status?.state !== "CONNECTED") {
      interval = setInterval(() => {
        handleRequestQr(null);
      }, 60000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode, status?.state]);

  const handleRequestQr = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token") || "";
      const res = await fetch("/api/whatsapp/generate-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to generate QR code");
      }

      setQrCode(json.data.qrCodeUrl || json.data.qrCode); // Adjust based on API contract
      setLoading(false);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to generate QR");
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token") || "";
      const res = await fetch("/api/whatsapp/disconnect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to disconnect");
      }
      await fetchStatus();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to disconnect");
      setLoading(false);
    }
  };

  if (loading && !status) {
    return (
      <div className="animate-pulse flex space-x-4">
        Loading connection status...
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Connection Status
          </h2>
          <div className="flex items-center mt-2">
            <span
              className={`inline-block w-3 h-3 rounded-full mr-2 ${status?.state === "CONNECTED" ? "bg-green-500" : "bg-red-500"}`}
            ></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {status?.state === "CONNECTED" ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {status?.state === "CONNECTED" && (
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            Disconnect
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {status?.state === "CONNECTED" ? (
        <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Phone Number
              </p>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {status.phoneNumber}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Display Name
              </p>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {status.displayName}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Last Connected
              </p>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {status.lastConnectedAt
                  ? new Date(status.lastConnectedAt).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      ) : qrCode ? (
        <div className="mt-4 flex flex-col items-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Scan this QR code with your WhatsApp app to connect.
          </p>
          {/* Using a placeholder rendering for QR, you would display the actual image or render from string */}
          <div className="bg-white p-4 rounded border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
          </div>
          <button
            onClick={fetchStatus}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            I have scanned the code
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button
            onClick={handleRequestQr}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Requesting QR..." : "Connect via QR Code"}
          </button>
        </div>
      )}
    </div>
  );
}
