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
  const [tokenInput, setTokenInput] = useState("");

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token") || "";
      const res = await fetch("/api/whatsapp/status", {
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
      } else {
        setStatus({ state: "DISCONNECTED" });
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch status");
      // Fallback for visual mock if api is unavailable during dev:
      // setStatus({ state: "DISCONNECTED" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput) return;

    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token") || "";
      const res = await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fonnteToken: tokenInput }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to connect");
      }

      await fetchStatus();
      setTokenInput("");
    } catch (err: any) {
      setError(err.message || "Failed to connect");
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
    } catch (err: any) {
      setError(err.message || "Failed to disconnect");
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
      ) : (
        <form onSubmit={handleConnect} className="mt-4">
          <div className="mb-4">
            <label
              htmlFor="token"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Fonnte API Token
            </label>
            <input
              type="text"
              id="token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter your Fonnte token"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !tokenInput}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect WhatsApp"}
          </button>
        </form>
      )}
    </div>
  );
}
